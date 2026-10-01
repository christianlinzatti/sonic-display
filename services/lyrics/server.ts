import type { Lyrics } from "@/types/music";
import { lookupLrclibLyrics } from "@/services/lyrics/providers/lrclib";
import { lookupLyricsOvh } from "@/services/lyrics/providers/lyricsOvh";

export interface LyricsQuery {
  title: string;
  artist: string;
  album: string;
  duration: number;
}

/** Provider chain: prefer LRCLIB (including synchronized lyrics), then plain-text lyrics.ovh. */
export async function findLyrics(query: LyricsQuery): Promise<Lyrics | null> {
  let lrclibError: unknown;
  try {
    const result = await lookupLrclibLyrics(query);
    if (result?.synced || result?.plainText) return result;
  } catch (error) {
    lrclibError = error;
  }

  try {
    const fallback = await lookupLyricsOvh(query.title, query.artist);
    if (fallback) return fallback;
  } catch (fallbackError) {
    if (lrclibError) {
      throw new Error(
        `All lyrics providers failed (LRCLIB: ${messageOf(lrclibError)}; lyrics.ovh: ${messageOf(fallbackError)})`,
      );
    }
    throw fallbackError;
  }

  // No match is a normal result; if LRCLIB errored, the fallback was still attempted.
  return null;
}

function messageOf(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
