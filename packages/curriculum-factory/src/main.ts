import { eq } from "drizzle-orm";
import { db, curriculumJobsTable, curriculumModulesTable } from "@workspace/db";
import type { Domain, MentalModelFocus, DifficultyLevel } from "@workspace/curriculum-parameters";
import { resolveSource, SearchError } from "./search";
import { validateAll } from "./validate";
import { harvestAll } from "./harvest";
import { synthesizeCourse } from "./synthesize";
import { logger } from "./logger";

export class CurriculumFactoryError extends Error {}

/**
 * Orchestrates a full Curriculum Factory run for an already-created job
 * through five explicit workflow steps:
 *
 *   SEARCH      -> resolve each source URL to video metadata (title, duration)
 *   VALIDATE    -> apply hard quality gates (min duration, context relevance)
 *   TRANSCRIBE  -> fetch captions, falling back to ASR when unavailable
 *   SYNTHESIZE  -> structure a course via Gemini from the surviving sources
 *   AUDIT       -> stage the result as curriculum_modules rows for human review
 *
 * Updates the job's status/error at each stage so the admin UI can reflect
 * progress. This does NOT publish anything into the live courses/modules/
 * lessons tables — that only happens on explicit admin approval (see the
 * approve route).
 */
export async function runCurriculumFactoryJob(jobId: string): Promise<void> {
  const [job] = await db.select().from(curriculumJobsTable).where(eq(curriculumJobsTable.id, jobId));
  if (!job) {
    throw new CurriculumFactoryError(`Curriculum job ${jobId} not found.`);
  }

  const sourceUrls = job.sourceUrls as string[];
  const constraints = {
    domain: job.domain as Domain,
    mentalModelFocus: job.mentalModelFocus as MentalModelFocus,
    difficultyLevel: job.difficultyLevel as DifficultyLevel,
  };

  const exclusionNotes: string[] = [];

  try {
    // --- SEARCH ---------------------------------------------------------
    await db
      .update(curriculumJobsTable)
      .set({ status: "searching", updatedAt: new Date() })
      .where(eq(curriculumJobsTable.id, jobId));

    logger.info({ jobId, count: sourceUrls.length }, "SEARCH: resolving source metadata for curriculum job");
    const resolved = [];
    const searchFailures: Array<{ url: string; error: string }> = [];
    for (const url of sourceUrls) {
      try {
        resolved.push(await resolveSource(url));
      } catch (err) {
        const message = err instanceof SearchError ? err.message : err instanceof Error ? err.message : "Unknown search error";
        searchFailures.push({ url, error: message });
      }
    }
    if (searchFailures.length > 0) {
      exclusionNotes.push(
        `${searchFailures.length} of ${sourceUrls.length} source(s) could not be resolved and were excluded: ${searchFailures
          .map((f) => f.error)
          .join("; ")}`,
      );
    }
    if (resolved.length === 0) {
      await db
        .update(curriculumJobsTable)
        .set({ status: "failed", errorMessage: `All sources failed SEARCH: ${searchFailures.map((f) => f.error).join("; ")}`, updatedAt: new Date() })
        .where(eq(curriculumJobsTable.id, jobId));
      return;
    }

    // --- VALIDATE ---------------------------------------------------------
    await db
      .update(curriculumJobsTable)
      .set({ status: "validating", updatedAt: new Date() })
      .where(eq(curriculumJobsTable.id, jobId));

    logger.info({ jobId, count: resolved.length }, "VALIDATE: applying quality gates for curriculum job");
    const { passed, rejected } = await validateAll(resolved, constraints);
    if (rejected.length > 0) {
      exclusionNotes.push(
        `${rejected.length} of ${resolved.length} resolved source(s) failed VALIDATE and were excluded: ${rejected
          .map((r) => r.reason)
          .join("; ")}`,
      );
    }
    if (passed.length === 0) {
      await db
        .update(curriculumJobsTable)
        .set({
          status: "failed",
          errorMessage: `All resolved sources failed VALIDATE: ${rejected.map((r) => r.reason).join("; ")}`,
          updatedAt: new Date(),
        })
        .where(eq(curriculumJobsTable.id, jobId));
      return;
    }

    // --- TRANSCRIBE ---------------------------------------------------------
    await db
      .update(curriculumJobsTable)
      .set({ status: "transcribing", updatedAt: new Date() })
      .where(eq(curriculumJobsTable.id, jobId));

    logger.info({ jobId, count: passed.length }, "TRANSCRIBE: fetching captions/ASR for curriculum job");
    const { succeeded, failed } = await harvestAll(passed);
    if (failed.length > 0) {
      exclusionNotes.push(
        `${failed.length} of ${passed.length} validated source(s) failed TRANSCRIBE and were excluded: ${failed
          .map((f) => f.error)
          .join("; ")}`,
      );
    }
    if (succeeded.length === 0) {
      await db
        .update(curriculumJobsTable)
        .set({
          status: "failed",
          errorMessage: `All validated sources failed TRANSCRIBE: ${failed.map((f) => f.error).join("; ")}`,
          updatedAt: new Date(),
        })
        .where(eq(curriculumJobsTable.id, jobId));
      return;
    }

    const asrCount = succeeded.filter((s) => s.transcriptSource === "asr").length;
    if (asrCount > 0) {
      exclusionNotes.push(`${asrCount} of ${succeeded.length} source(s) used ASR fallback (no native captions were available).`);
    }

    // --- SYNTHESIZE ---------------------------------------------------------
    await db
      .update(curriculumJobsTable)
      .set({ status: "synthesizing", updatedAt: new Date() })
      .where(eq(curriculumJobsTable.id, jobId));

    logger.info({ jobId, count: succeeded.length }, "SYNTHESIZE: building course via Gemini for curriculum job");
    const synthesized = await synthesizeCourse(succeeded, constraints, { courseHint: job.courseTitle });

    for (const [i, mod] of synthesized.modules.entries()) {
      await db.insert(curriculumModulesTable).values({
        jobId,
        title: mod.title,
        sortOrder: mod.sortOrder ?? i,
        lessonsJson: mod.lessons, // includes each lesson's own quizJson/essayPrompt
        primaryMentalModel: mod.primaryMentalModel,
        secondaryMentalModels: mod.secondaryMentalModels ?? [],
        durableTruthScore: mod.durableTruthScore ?? 0,
        isHighValue: mod.isHighValue ?? false,
        coreDoctrineSummary: mod.coreDoctrineSummary,
        durableTruths: mod.durableTruths ?? [],
        inversionCheck: mod.inversionCheck,
        inversionCheckConfident: mod.inversionCheckConfident,
      });
    }

    // Job-level confidenceScore: a PURELY informational 0.0-1.0 signal used to
    // sort/prioritize the Audit Queue, derived from each module's durable
    // truth score, discounted when its inversion check wasn't produced with
    // confidence. This never blocks, auto-approves, or auto-rejects a job —
    // manual human review and approval (AUDIT) is mandatory for every job.
    const confidenceScore =
      synthesized.modules.length > 0
        ? synthesized.modules.reduce((sum, m) => sum + (m.durableTruthScore ?? 0) * (m.inversionCheckConfident ? 1 : 0.4), 0) /
          synthesized.modules.length
        : null;

    const lowConfidenceModules = synthesized.modules.filter((m) => !m.inversionCheckConfident);
    if (lowConfidenceModules.length > 0) {
      exclusionNotes.push(
        `Flagged for extra scrutiny: ${lowConfidenceModules.length} module(s) — ${lowConfidenceModules
          .map((m) => `"${m.title}"`)
          .join(", ")} — could not confidently produce a genuine inversion check. Review carefully before approving.`,
      );
    }

    // --- AUDIT (handoff to human review) -----------------------------------
    await db
      .update(curriculumJobsTable)
      .set({
        status: "ready_for_review",
        courseDescription: job.courseDescription || synthesized.courseDescription,
        confidenceScore,
        errorMessage: exclusionNotes.filter(Boolean).join(" ") || null,
        updatedAt: new Date(),
      })
      .where(eq(curriculumJobsTable.id, jobId));

    logger.info({ jobId, moduleCount: synthesized.modules.length, confidenceScore }, "AUDIT: curriculum job ready for review");
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    logger.error({ err, jobId }, "Curriculum Factory job failed");
    await db
      .update(curriculumJobsTable)
      .set({ status: "failed", errorMessage: message, updatedAt: new Date() })
      .where(eq(curriculumJobsTable.id, jobId));
  }
}
