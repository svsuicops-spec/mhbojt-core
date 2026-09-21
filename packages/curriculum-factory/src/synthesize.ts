import { ai } from "@workspace/integrations-gemini-ai";
import type { Domain, MentalModelFocus, DifficultyLevel } from "@workspace/curriculum-parameters";
import type { HarvestedSource } from "./harvest";

export class SynthesisError extends Error {}

// Thrown when the Gemini synthesis model determines the harvested transcripts
// do not contain enough evidence to support the admin's chosen hard
// constraints (domain / mental model focus / difficulty level). This is a
// distinct failure mode from a generic synthesis error — it means the source
// material simply isn't a match for the requested curriculum design, not that
// synthesis itself broke.
export class MissingCoreDoctrineError extends SynthesisError {}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
  applicationContext: string;
}

export interface DraftLesson {
  title: string;
  contentType: "video" | "text";
  videoUrl: string | null;
  bodyText: string | null;
  durationMinutes: number;
  sortOrder: number;
  // Per-lesson quiz/essay so each lesson can be individually audited for
  // quality rather than sharing one quiz/essay across an entire module.
  quizJson: QuizQuestion[];
  essayPrompt: string | null;
}

export interface DraftModule {
  title: string;
  sortOrder: number;
  lessons: DraftLesson[];
  // "Latticework Schema" audit layer — always present. primaryMentalModel and
  // inversionCheck are hard requirements. inversionCheckConfident and
  // durableTruthScore feed the job-level confidenceScore used purely as a
  // sorting/priority signal in the Audit Queue — every job still requires
  // manual approval regardless of confidence.
  primaryMentalModel: string;
  secondaryMentalModels: string[];
  durableTruthScore: number;
  isHighValue: boolean;
  coreDoctrineSummary: string | null;
  durableTruths: string[];
  inversionCheck: string;
  inversionCheckConfident: boolean;
}

export interface SynthesizedCourse {
  courseTitle: string;
  courseDescription: string;
  modules: DraftModule[];
}

const RESPONSE_SCHEMA = {
  type: "object",
  properties: {
    supported: {
      type: "boolean",
      description:
        "false if the source transcripts do NOT contain enough evidence to build a course that genuinely " +
        "satisfies the required domain, mental model focus, and difficulty level. true otherwise.",
    },
    unsupportedReason: {
      type: ["string", "null"],
      description:
        "Required and non-null when supported is false: a concise explanation of what doctrine is missing " +
        "from the transcripts relative to the required constraints. Null when supported is true.",
    },
    courseTitle: {
      type: ["string", "null"],
      description: "A polished, professional course title synthesized from the source material (max 120 chars). Null when supported is false.",
    },
    courseDescription: {
      type: ["string", "null"],
      description: "A 2-4 sentence description of what the course covers and who it's for. Null when supported is false.",
    },
    modules: {
      type: "array",
      items: {
        type: "object",
        properties: {
          title: { type: "string" },
          sortOrder: { type: "integer" },
          lessons: {
            type: "array",
            minItems: 1,
            items: {
              type: "object",
              properties: {
                title: { type: "string" },
                contentType: { type: "string", enum: ["video", "text"] },
                videoUrl: { type: ["string", "null"] },
                bodyText: { type: ["string", "null"] },
                durationMinutes: { type: "integer", minimum: 1 },
                sortOrder: { type: "integer" },
                quizJson: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      question: { type: "string" },
                      options: { type: "array", items: { type: "string" }, minItems: 2 },
                      correctAnswer: { type: "string" },
                      applicationContext: { type: "string", description: "How this question tests the mental model, not just recall." },
                    },
                    required: ["question", "options", "correctAnswer", "applicationContext"],
                  },
                  minItems: 1,
                  description: "REQUIRED per lesson — at least one quiz question testing this specific lesson's content.",
                },
                essayPrompt: {
                  type: ["string", "null"],
                  description: "A real-world scenario application prompt requiring the learner to apply this specific lesson's doctrine.",
                },
              },
              required: ["title", "contentType", "videoUrl", "bodyText", "durationMinutes", "sortOrder", "quizJson", "essayPrompt"],
            },
          },
          primaryMentalModel: {
            type: "string",
            description: "REQUIRED, never empty. The single dominant mental model this module teaches or applies (e.g. 'Compounding', 'Inversion', 'Circle of Competence').",
          },
          secondaryMentalModels: {
            type: "array",
            items: { type: "string" },
            description: "Zero or more additional mental models this module touches on.",
          },
          durableTruthScore: {
            type: "number",
            minimum: 0,
            maximum: 1,
            description: "0.0-1.0: how timeless/durable (vs trendy/perishable) the doctrine in this module is.",
          },
          isHighValue: {
            type: "boolean",
            description: "true if this module contains especially high-value, rare doctrine worth flagging to reviewers.",
          },
          coreDoctrineSummary: {
            type: ["string", "null"],
            description: "Strict limit: 3 sentences max. The irreducible core doctrine of this module.",
          },
          durableTruths: {
            type: "array",
            items: { type: "string" },
            minItems: 3,
            maxItems: 5,
            description: "3-5 bullet points of timeless wisdom drawn directly from the transcript.",
          },
          inversionCheck: {
            type: "string",
            description:
              "REQUIRED, never empty. A Munger-style 'Invert, always invert' analysis of how this doctrine fails in practice — the concrete failure modes and misapplications. " +
              "If the transcript genuinely does not contain enough evidence to responsibly invert this doctrine, do NOT fabricate one — instead write a brief explanation of why a confident inversion can't be produced, and set inversionCheckConfident to false.",
          },
          inversionCheckConfident: {
            type: "boolean",
            description: "false if inversionCheck above is a fallback explanation rather than a genuine, transcript-grounded failure-mode analysis. true otherwise.",
          },
        },
        required: [
          "title",
          "sortOrder",
          "lessons",
          "primaryMentalModel",
          "secondaryMentalModels",
          "durableTruthScore",
          "isHighValue",
          "coreDoctrineSummary",
          "durableTruths",
          "inversionCheck",
          "inversionCheckConfident",
        ],
      },
      description: "Empty array when supported is false.",
    },
  },
  required: ["supported", "unsupportedReason", "courseTitle", "courseDescription", "modules"],
};

interface RawSynthesisResponse {
  supported: boolean;
  unsupportedReason: string | null;
  courseTitle: string | null;
  courseDescription: string | null;
  modules: DraftModule[];
}

export interface SynthesisConstraints {
  domain: Domain;
  mentalModelFocus: MentalModelFocus;
  difficultyLevel: DifficultyLevel;
}

/**
 * Synthesizes a structured, multi-module course (with lessons mapped back to their
 * source videos) from a set of harvested transcripts via Gemini. One lesson is
 * produced per source video, grouped into modules by topic; the model is instructed
 * to organize rather than invent — content must be grounded in the transcripts.
 *
 * `constraints` are hard requirements picked from the canonical Curriculum Factory
 * parameter lists (never free text) — the domain, mental model focus, and difficulty
 * level the synthesized course must genuinely satisfy. If the harvested transcripts
 * don't contain enough doctrine to support them, this throws MissingCoreDoctrineError
 * instead of fabricating filler content to fit the mold.
 */
export async function synthesizeCourse(
  sources: HarvestedSource[],
  constraints: SynthesisConstraints,
  opts?: { courseHint?: string },
): Promise<SynthesizedCourse> {
  if (sources.length === 0) {
    throw new SynthesisError("At least one harvested source is required to synthesize a course.");
  }

  const sourceBlocks = sources
    .map((s, i) => {
      const truncated = s.transcriptText.length > 18000 ? `${s.transcriptText.slice(0, 18000)} …[truncated]` : s.transcriptText;
      return `=== Source ${i + 1} (videoUrl: ${s.url}) ===\n${truncated}`;
    })
    .join("\n\n");

  const prompt =
    `You are the curriculum synthesis engine for a high-stakes professional learning platform built on a ` +
    `"Latticework" mental-model doctrine. Given raw transcripts from ${sources.length} source video(s), organize ` +
    `them into a single cohesive course made of modules and lessons. Produce exactly one lesson per source video ` +
    `(contentType "video", videoUrl set to that video's URL, bodyText null), grouped into logically-ordered modules ` +
    `by topic. Do not invent facts not present in the transcripts. Be substantive and specific — never generic filler.\n\n` +
    `HARD CONSTRAINTS (non-negotiable — this is a "Durable Truth" audit standard, not a suggestion):\n` +
    `- Domain: ${constraints.domain}\n` +
    `- Mental Model Focus: ${constraints.mentalModelFocus}\n` +
    `- Difficulty Level: ${constraints.difficultyLevel}\n` +
    `The synthesized course MUST genuinely belong to this domain, MUST substantively teach or apply this ` +
    `mental model focus (not just mention it in passing), and MUST match this difficulty level. ` +
    `If the transcripts do not contain enough doctrine to honestly satisfy ALL THREE constraints, do NOT ` +
    `force-fit them or invent content — instead set "supported" to false and explain what's missing in ` +
    `"unsupportedReason". Only set "supported" to true if you can build a genuinely faithful course.\n\n` +
    `EVERY module must also carry its "Latticework" audit fields:\n` +
    `- primaryMentalModel: REQUIRED, never empty — the single dominant mental model the module teaches or applies.\n` +
    `- inversionCheck: REQUIRED, never empty — a Munger-style "Invert, always invert" analysis of concrete failure ` +
    `modes and misapplications of this module's doctrine, grounded strictly in the transcript. If you cannot ` +
    `responsibly produce a genuine, transcript-grounded inversion for a module, do NOT fabricate one — write a ` +
    `brief honest explanation of why not, and set that module's inversionCheckConfident to false. This is a ` +
    `governance signal reviewers use to prioritize their audit queue, not an auto-rejection trigger — every job ` +
    `still requires a human to review and approve it before publishing, regardless of confidence.\n` +
    `- durableTruths: 3-5 bullet points of timeless wisdom drawn directly from the transcript.\n` +
    `- coreDoctrineSummary: max 3 sentences.\n\n` +
    `EVERY lesson must also carry its own quiz and essay prompt (granular, per-lesson — NOT shared across the module):\n` +
    `- quizJson: REQUIRED, at least one question per lesson that tests application of that lesson's specific content, not mere recall.\n` +
    `- essayPrompt: a real-world scenario requiring the learner to apply that specific lesson's doctrine.` +
    (opts?.courseHint ? `\n\nCourse focus/hint from the requester: ${opts.courseHint}` : "") +
    `\n\n${sourceBlocks}`;

  let response;
  try {
    response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: {
        maxOutputTokens: 8192,
        responseMimeType: "application/json",
        responseSchema: RESPONSE_SCHEMA,
      },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    throw new SynthesisError(`Gemini synthesis failed: ${msg}`);
  }

  const raw = response.text;
  if (!raw) throw new SynthesisError("Gemini returned an empty response.");

  let parsed: RawSynthesisResponse;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new SynthesisError("Gemini returned malformed JSON.");
  }

  if (parsed.supported === false) {
    throw new MissingCoreDoctrineError(
      `Missing Core Doctrine: ${parsed.unsupportedReason ?? "the source material does not support the selected domain, mental model focus, and difficulty level."}`,
    );
  }

  if (!parsed.courseTitle || !Array.isArray(parsed.modules) || parsed.modules.length === 0) {
    throw new SynthesisError("Gemini response was missing required course fields.");
  }

  for (const mod of parsed.modules) {
    if (!mod.primaryMentalModel || !mod.primaryMentalModel.trim()) {
      throw new SynthesisError(`Gemini response for module "${mod.title}" was missing a required primaryMentalModel.`);
    }
    if (!mod.inversionCheck || !mod.inversionCheck.trim()) {
      throw new SynthesisError(`Gemini response for module "${mod.title}" was missing a required inversionCheck.`);
    }
  }

  return {
    courseTitle: parsed.courseTitle,
    courseDescription: parsed.courseDescription ?? "",
    modules: parsed.modules,
  };
}
