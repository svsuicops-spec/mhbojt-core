import { ai } from "@workspace/integrations-gemini-ai";
import type { Domain, MentalModelFocus } from "@workspace/curriculum-parameters";
import type { ResolvedSource } from "./search";

export class ValidationError extends Error {}

// VALIDATE step configuration — the pipeline's hard quality gates, applied to
// every resolved source before it's allowed into TRANSCRIBE/SYNTHESIZE.
export const VALIDATION_RULES = {
  transcriptRequired: true,
  asrFallbackEnabled: true,
  minDurationSeconds: 300,
  contextRelevanceThreshold: 0.85,
} as const;

export interface ValidatedSource extends ResolvedSource {
  relevanceScore: number;
}

export interface ValidationRejection {
  url: string;
  reason: string;
}

const RELEVANCE_SCHEMA = {
  type: "object",
  properties: {
    relevanceScore: {
      type: "number",
      minimum: 0,
      maximum: 1,
      description:
        "0.0-1.0: how substantively this video's title/description matches the required domain and mental model focus. " +
        "1.0 means the video is squarely about that domain and mental model. 0.0 means unrelated.",
    },
    reasoning: { type: "string", description: "One sentence justification for the score." },
  },
  required: ["relevanceScore", "reasoning"],
};

async function scoreRelevance(
  source: ResolvedSource,
  constraints: { domain: Domain; mentalModelFocus: MentalModelFocus },
): Promise<{ score: number; reasoning: string }> {
  const prompt =
    `Rate how relevant this YouTube video is to the required curriculum design constraints, based only on its ` +
    `title and description (you do not have the transcript yet).\n\n` +
    `Required Domain: ${constraints.domain}\n` +
    `Required Mental Model Focus: ${constraints.mentalModelFocus}\n\n` +
    `Video Title: ${source.title}\n` +
    `Video Description: ${source.description.slice(0, 2000) || "(none provided)"}\n\n` +
    `Score 0.0-1.0. Be conservative — score high only if the video plausibly teaches or substantively applies ` +
    `that domain and mental model, not just tangentially related.`;

  let response;
  try {
    response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: {
        maxOutputTokens: 8192,
        responseMimeType: "application/json",
        responseSchema: RELEVANCE_SCHEMA,
      },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    throw new ValidationError(`Relevance scoring failed for "${source.url}": ${msg}`);
  }

  const raw = response.text;
  if (!raw) throw new ValidationError(`Relevance scoring returned an empty response for "${source.url}".`);

  try {
    const parsed = JSON.parse(raw) as { relevanceScore: number; reasoning: string };
    return { score: parsed.relevanceScore, reasoning: parsed.reasoning };
  } catch {
    throw new ValidationError(`Relevance scoring returned malformed JSON for "${source.url}".`);
  }
}

/**
 * VALIDATE step: applies the hard quality gates (min duration, context
 * relevance) to every resolved source. Sources that fail are excluded with a
 * clear reason rather than aborting the whole job — mirrors the partial
 * failure handling used elsewhere in the pipeline.
 */
export async function validateAll(
  sources: ResolvedSource[],
  constraints: { domain: Domain; mentalModelFocus: MentalModelFocus },
): Promise<{ passed: ValidatedSource[]; rejected: ValidationRejection[] }> {
  const passed: ValidatedSource[] = [];
  const rejected: ValidationRejection[] = [];

  for (const source of sources) {
    if (source.durationSeconds < VALIDATION_RULES.minDurationSeconds) {
      rejected.push({
        url: source.url,
        reason: `Video is ${source.durationSeconds}s, below the ${VALIDATION_RULES.minDurationSeconds}s minimum duration.`,
      });
      continue;
    }

    try {
      const { score, reasoning } = await scoreRelevance(source, constraints);
      if (score < VALIDATION_RULES.contextRelevanceThreshold) {
        rejected.push({
          url: source.url,
          reason: `Context relevance score ${score.toFixed(2)} is below the ${VALIDATION_RULES.contextRelevanceThreshold} threshold: ${reasoning}`,
        });
        continue;
      }
      passed.push({ ...source, relevanceScore: score });
    } catch (err) {
      const message = err instanceof ValidationError ? err.message : err instanceof Error ? err.message : "Unknown validation error";
      rejected.push({ url: source.url, reason: message });
    }
  }

  return { passed, rejected };
}
