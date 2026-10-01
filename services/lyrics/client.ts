import type { Lyrics, Track } from "@/types/music";

/** Lyrics provider adapter. The UI depends on this normalized result, not LRCLIB's API shape. */
export async function fetchLyrics(track: Track, signal?: AbortSignal): Promise<Lyrics | null> {
  const params = new URLSearchParams({ title:track.title, artist:track.artist, album:track.album, duration:String(Math.round(track.durationMs/1000)) });
  const response = await fetch(`/api/lyrics?${params}`, { cache:"no-store", signal });
  if (!response.ok) throw new Error(`Lyrics-Anfrage fehlgeschlagen (${response.status})`);
  return response.json() as Promise<Lyrics | null>;
}
