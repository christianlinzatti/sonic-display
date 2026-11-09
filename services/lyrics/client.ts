import {normalizeLyricTimingV1134} from '@/lib/lyricTimingV1134';
import {networkJsonV1010} from '@/lib/networkJsonV1010';
import type { Lyrics, Track } from "@/types/music";

/** Lyrics provider adapter. The UI depends on this normalized result, not LRCLIB's API shape. */
export async function fetchLyrics(track: Track, signal?: AbortSignal): Promise<Lyrics | null> {
  const params = new URLSearchParams({ title:track.title, artist:track.artist, album:track.album, duration:String(Math.round(track.durationMs/1000)) });
  if (/^[a-zA-Z0-9]{22}$/.test(track.id)) params.set("trackId", track.id);
  if (track.albumId && /^[a-zA-Z0-9]{22}$/.test(track.albumId)) params.set("albumId", track.albumId);
  const response=await networkJsonV1010(`/api/lyrics?${params}`,{cache:'no-store',signal},
    {provider:'lyrics',priority:'lyrics',ttlMs:300000,staleMs:1800000,timeoutMs:20000,retry:1,cachePayload:data=>data!==null});
  if(!response.ok)throw new Error(`Lyrics-Anfrage fehlgeschlagen (${response.status})`);
  return normalizeLyricTimingV1134(await response.json(),track.durationMs);
}
