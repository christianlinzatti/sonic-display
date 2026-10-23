import type { Lyrics } from "@/types/music";
import { lookupLrclibLyrics } from "@/services/lyrics/providers/lrclib";
import { lookupLyricsOvh } from "@/services/lyrics/providers/lyricsOvh";
import { lookupGeniusLyrics } from "@/services/lyrics/providers/genius";
import { lookupSpotifyColorLyrics } from "@/services/lyrics/providers/spotifyColorLyrics";

export interface LyricsQuery {
  title: string;
  artist: string;
  album: string;
  duration: number;
  trackId?: string;
  albumId?: string;
}

/** Optional Spotify client lyrics (best effort), then LRCLIB, lyrics.ovh, and Genius. */
export async function findLyrics(query: LyricsQuery, spotifyAccessToken?: string): Promise<Lyrics | null> {
  if (process.env.SPOTIFY_INTERNAL_LYRICS_ENABLED === "true" && spotifyAccessToken && query.trackId) {
    const spotify = await lookupSpotifyColorLyrics(query.trackId, query.albumId, spotifyAccessToken);
    if (spotify) return spotify;
  }
  let lrclibError: unknown;
  try {
    const result = await lookupLrclibLyrics(query);
    if (result?.synced || result?.plainText) return result;
  } catch (error) {
    lrclibError = error;
  }

  let ovhError: unknown;
  try {
    const fallback = await lookupLyricsOvh(query.title, query.artist);
    if (fallback) return fallback;
  } catch (error) { ovhError = error; }


  try {
    const genius = await lookupGeniusLyrics(query);
    if (genius) return genius;
  } catch (error) {
    if (lrclibError) throw new Error(`Lyrics providers failed (LRCLIB: ${messageOf(lrclibError)}; Genius: ${messageOf(error)})`);
    throw error;
  }
  return null;
}

function messageOf(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
