import type { Lyrics } from "@/types/music";
import { lookupLrclibLyrics } from "@/services/lyrics/providers/lrclib";
import { lookupLyricsOvh } from "@/services/lyrics/providers/lyricsOvh";
import { lookupGeniusLyrics } from "@/services/lyrics/providers/genius";
import { lookupSpotifyColorLyrics } from "@/services/lyrics/providers/spotifyColorLyrics";
import { chooseBestLyricsV554 } from "@/services/lyrics/selectionV554";

export interface LyricsQuery {
  title: string;
  artist: string;
  album: string;
  duration: number;
  trackId?: string;
  albumId?: string;
}

/**
 * Query every configured provider concurrently before selecting the best timing.
 * Promise.allSettled ensures one failing/unavailable provider cannot hide a more
 * accurately synchronized result returned by another provider.
 */
export async function findLyrics(query: LyricsQuery, spotifyAccessToken?: string): Promise<Lyrics | null> {
  // Keep provider order deterministic for equally good versions. Private Spotify
  // Color Lyrics stays strictly opt-in, requiring an authorized session token.
  const requests: Array<Promise<Lyrics | null>> = [];
  if (process.env.SPOTIFY_INTERNAL_LYRICS_ENABLED === "true" && spotifyAccessToken && query.trackId) {
    requests.push(lookupSpotifyColorLyrics(query.trackId, query.albumId, spotifyAccessToken));
  }
  requests.push(
    lookupLrclibLyrics(query),
    lookupLyricsOvh(query.title, query.artist),
    lookupGeniusLyrics(query),
  );

  const results = await Promise.allSettled(requests);
  return chooseBestLyricsV554(results.map(result => result.status === "fulfilled" ? result.value : null));
}
