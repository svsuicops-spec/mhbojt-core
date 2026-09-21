import { YoutubeTranscript } from "youtube-transcript";
import { transcribeViaAsr } from "./asr";
import { logger } from "./logger";
import { VALIDATION_RULES } from "./validate";

export class HarvestError extends Error {}

export interface HarvestedSource {
  url: string;
  videoId: string;
  transcriptText: string;
  transcriptSource: "captions" | "asr";
}

export function extractYouTubeId(url: string): string | null {
  const m = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  if (m) return m[1];
  if (/^[a-zA-Z0-9_-]{11}$/.test(url.trim())) return url.trim();
  return null;
}

/**
 * TRANSCRIBE step: fetches a transcript for a single YouTube URL. Tries
 * native captions first (transcriptRequired); if unavailable and
 * asrFallbackEnabled is on, falls back to downloading the audio and running
 * it through Gemini-based speech recognition rather than excluding the
 * source outright.
 */
export async function harvestSource(url: string, videoId: string): Promise<HarvestedSource> {
  try {
    const segments = await YoutubeTranscript.fetchTranscript(videoId);
    const transcriptText = segments.map((s) => s.text).join(" ").replace(/\s+/g, " ").trim();
    if (!transcriptText) {
      throw new HarvestError(`Transcript for "${url}" was empty.`);
    }
    return { url, videoId, transcriptText, transcriptSource: "captions" };
  } catch (captionErr) {
    const captionMsg = captionErr instanceof Error ? captionErr.message : String(captionErr);

    if (!VALIDATION_RULES.asrFallbackEnabled) {
      throw new HarvestError(`No transcript available for "${url}": ${captionMsg}`);
    }

    logger.warn({ url, videoId, captionMsg }, "No native transcript — falling back to ASR");
    try {
      const transcriptText = await transcribeViaAsr(url, videoId);
      return { url, videoId, transcriptText, transcriptSource: "asr" };
    } catch (asrErr) {
      const asrMsg = asrErr instanceof Error ? asrErr.message : String(asrErr);
      throw new HarvestError(`No captions for "${url}" (${captionMsg}) and ASR fallback also failed: ${asrMsg}`);
    }
  }
}

/**
 * Harvests transcripts for every already-resolved+validated source. Individual
 * failures are collected rather than thrown immediately, so one bad source
 * doesn't abort the entire job.
 */
export async function harvestAll(
  sources: Array<{ url: string; videoId: string }>,
): Promise<{ succeeded: HarvestedSource[]; failed: Array<{ url: string; error: string }> }> {
  const succeeded: HarvestedSource[] = [];
  const failed: Array<{ url: string; error: string }> = [];

  for (const source of sources) {
    try {
      succeeded.push(await harvestSource(source.url, source.videoId));
    } catch (err) {
      const message = err instanceof HarvestError ? err.message : err instanceof Error ? err.message : "Unknown error";
      failed.push({ url: source.url, error: message });
    }
  }

  return { succeeded, failed };
}
