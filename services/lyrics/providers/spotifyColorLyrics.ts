import type { Lyrics, LyricLine } from "@/types/music";

/** Unofficial Spotify client endpoint. It is NOT covered by the public Web API contract.
 * Use only a normal, user-authorized Spotify OAuth session. No Spotify web-player cookies,
 * access-token extraction, embedded secrets, or client-side relay are supported.
 */
export function isSpotifyId(value: unknown): value is string {
  return typeof value === "string" && /^[a-zA-Z0-9]{22}$/.test(value);
}

export function colorLyricsUrl(trackId: string, albumId?: string | null): string | null {
  if (!isSpotifyId(trackId)) return null;
  const path = isSpotifyId(albumId)
    ? `album/${albumId}/track/${trackId}`
    : `track/${trackId}`;
  return `https://spclient.wg.spotify.com/color-lyrics/v2/${path}?format=json&vocalRemoval=false&market=from_token`;
}

type SpotifyLine = { startTimeMs?: unknown; words?: unknown };
type ColorLyrics = { lyrics?: { syncType?: unknown; lines?: unknown } };

/** Conservative decoding: never treat non-timed lines as synced, never fabricate timestamps. */
export function parseSpotifyColorLyrics(value: unknown): Lyrics | null {
  if (!value || typeof value !== "object") return null;
  const data = value as ColorLyrics;
  const lyrics = data.lyrics;
  if (!lyrics || !Array.isArray(lyrics.lines)) return null;
  const synced = lyrics.syncType === "LINE_SYNCED";
  const lines: LyricLine[] = [];
  for (const item of lyrics.lines as SpotifyLine[]) {
    if (!item || typeof item !== "object" || typeof item.words !== "string") continue;
    const text = item.words.trim();
    if (!text || text === "♪") continue;
    const start = typeof item.startTimeMs === "number" ? item.startTimeMs :
      typeof item.startTimeMs === "string" && /^\d+$/.test(item.startTimeMs) ? Number(item.startTimeMs) : NaN;
    if (synced && (!Number.isSafeInteger(start) || start < 0 || start > 86_400_000)) continue;
    lines.push({ startMs: synced ? start : 0, endMs: null, text });
    if (lines.length >= 600) break;
  }
  if (lines.length === 0) return null;
  if (synced) {
    lines.sort((a, b) => a.startMs - b.startMs);
    lines.forEach((line, i) => { line.endMs = lines[i + 1]?.startMs ?? null; });
  }
  return { provider: "spotify", synced, lines, plainText: synced ? null : lines.map(line => line.text).join("\n") };
}

export async function lookupSpotifyColorLyrics(trackId: string, albumId: string | null | undefined, accessToken: string): Promise<Lyrics | null> {
  const url = colorLyricsUrl(trackId, albumId);
  if (!url || !accessToken || accessToken.length > 8192) return null;
  try {
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}`, "app-platform": "WebPlayer", Accept: "application/json" },
      cache: "no-store",
      signal: AbortSignal.timeout(5000),
    });
    // 401/403 are common because Web API OAuth tokens may not authorize this private endpoint.
    // Always fall back without retrying with extracted tokens or player cookies.
    if (!res.ok) return null;
    if (!res.headers.get("content-type")?.includes("application/json")) return null;
    const data = await res.json() as unknown;
    return parseSpotifyColorLyrics(data);
  } catch { return null; }
}
