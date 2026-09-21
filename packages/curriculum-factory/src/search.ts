import ytdl from "@distube/ytdl-core";
import { extractYouTubeId } from "./harvest";

export class SearchError extends Error {}

export interface ResolvedSource {
  url: string;
  videoId: string;
  title: string;
  description: string;
  durationSeconds: number;
}

/**
 * SEARCH step: resolves a manually-supplied YouTube URL into basic video
 * metadata (title, description, duration) without downloading any media.
 * This runs before VALIDATE so duration/relevance checks have something to
 * work with, and before TRANSCRIBE so we know upfront whether ASR fallback
 * will even be feasible.
 */
export async function resolveSource(url: string): Promise<ResolvedSource> {
  const videoId = extractYouTubeId(url);
  if (!videoId) {
    throw new SearchError(`Could not extract a YouTube video ID from "${url}".`);
  }

  let info;
  try {
    info = await ytdl.getBasicInfo(url);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    throw new SearchError(`Could not resolve video metadata for "${url}": ${msg}`);
  }

  const details = info.videoDetails;
  const durationSeconds = Number.parseInt(details.lengthSeconds, 10) || 0;

  return {
    url,
    videoId,
    title: details.title,
    description: details.description ?? "",
    durationSeconds,
  };
}
