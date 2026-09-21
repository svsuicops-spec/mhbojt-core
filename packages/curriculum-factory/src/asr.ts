import { spawn } from "node:child_process";
import { mkdtemp, readFile, readdir, rm, stat } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { ai } from "@workspace/integrations-gemini-ai";
import { batchProcess } from "@workspace/integrations-gemini-ai/batch";
import { logger } from "./logger";

export class AsrError extends Error {}

// Gemini AI integrations only accept inline audio data (no Files API) with an
// 8MB request-size ceiling. We stay well under that per chunk to leave room
// for prompt text + base64 overhead (~33% larger than raw bytes).
const MAX_CHUNK_SECONDS = 240;
const AUDIO_BITRATE_KBPS = 48;

function runCommand(command: string, args: string[]): Promise<void> {
  return new Promise((resolve, reject) => {
    const proc = spawn(command, args, { stdio: ["ignore", "ignore", "pipe"] });
    let stderr = "";
    proc.stderr.on("data", (d) => (stderr += d.toString()));
    proc.on("error", reject);
    proc.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new AsrError(`${command} exited with code ${code}: ${stderr.slice(-800)}`));
    });
  });
}

const runFfmpeg = (args: string[]) => runCommand("ffmpeg", args);

/**
 * TRANSCRIBE step ASR fallback: when a YouTube transcript isn't available,
 * download the lowest-bitrate audio-only stream, compress it to a low
 * bitrate mono file, split it into fixed-length chunks small enough for
 * Gemini's inline audio input limit, transcribe each chunk, and stitch the
 * results back together in order.
 */
export async function transcribeViaAsr(url: string, videoId: string): Promise<string> {
  const workDir = await mkdtemp(path.join(tmpdir(), `curriculum-asr-${videoId}-`));
  try {
    const rawAudioPath = path.join(workDir, "audio.raw");
    const compressedPath = path.join(workDir, "audio.ogg");
    const chunkPattern = path.join(workDir, "chunk-%03d.ogg");

    // yt-dlp (not @distube/ytdl-core) is used here: plain ytdl-core's stream
    // downloads are consistently blocked with HTTP 403 by YouTube's bot
    // detection on datacenter IPs. yt-dlp with the "android" player client
    // avoids the signature/PO-token requirements that trigger that block.
    logger.info({ url, videoId }, "ASR fallback: downloading audio stream via yt-dlp");
    await runCommand("yt-dlp", [
      "-f",
      "18",
      "-o",
      rawAudioPath,
      "--no-playlist",
      "--extractor-args",
      "youtube:player_client=android",
      "--no-warnings",
      url,
    ]);

    logger.info({ url, videoId }, "ASR fallback: compressing audio to low-bitrate mono ogg");
    await runFfmpeg([
      "-y",
      "-i",
      rawAudioPath,
      "-vn",
      "-ac",
      "1",
      "-ar",
      "16000",
      "-b:a",
      `${AUDIO_BITRATE_KBPS}k`,
      "-c:a",
      "libopus",
      compressedPath,
    ]);

    logger.info({ url, videoId }, "ASR fallback: chunking compressed audio");
    await runFfmpeg([
      "-y",
      "-i",
      compressedPath,
      "-f",
      "segment",
      "-segment_time",
      String(MAX_CHUNK_SECONDS),
      "-c",
      "copy",
      chunkPattern,
    ]);

    const chunkFiles = (await readdir(workDir))
      .filter((f) => f.startsWith("chunk-") && f.endsWith(".ogg"))
      .sort();

    if (chunkFiles.length === 0) {
      throw new AsrError(`No audio chunks were produced for "${url}".`);
    }

    for (const file of chunkFiles) {
      const { size } = await stat(path.join(workDir, file));
      if (size > 7 * 1024 * 1024) {
        throw new AsrError(`Audio chunk "${file}" for "${url}" is ${size} bytes, too large for inline transcription.`);
      }
    }

    logger.info({ url, videoId, chunkCount: chunkFiles.length }, "ASR fallback: transcribing chunks via Gemini");
    const transcripts = await batchProcess(
      chunkFiles,
      async (file) => {
        const audioBuffer = await readFile(path.join(workDir, file));
        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: [
            {
              role: "user",
              parts: [
                { text: "Transcribe this audio verbatim. Return only the spoken words as plain text, no commentary, no timestamps, no speaker labels." },
                { inlineData: { mimeType: "audio/ogg", data: audioBuffer.toString("base64") } },
              ],
            },
          ],
          config: { maxOutputTokens: 8192 },
        });
        return response.text ?? "";
      },
      { concurrency: 2, retries: 3 },
    );

    const fullText = transcripts.join(" ").replace(/\s+/g, " ").trim();
    if (!fullText) {
      throw new AsrError(`ASR transcription produced no text for "${url}".`);
    }
    return fullText;
  } finally {
    await rm(workDir, { recursive: true, force: true }).catch(() => {});
  }
}
