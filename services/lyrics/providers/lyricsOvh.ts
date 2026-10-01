import type { Lyrics, LyricLine } from "@/types/music";

interface LyricsOvhResponse {
  lyrics?: string;
}

/** lyrics.ovh provides plain, unsynchronized lyrics. */
export async function lookupLyricsOvh(title: string, artist: string): Promise<Lyrics | null> {
  const url = `https://api.lyrics.ovh/v1/${encodeURIComponent(artist)}/${encodeURIComponent(title)}`;
  const response = await fetch(url, {
    cache: "no-store",
    signal: AbortSignal.timeout(8_000),
  });
  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`lyrics.ovh returned HTTP ${response.status}`);

  const data = (await response.json()) as LyricsOvhResponse;
  const plainText = data.lyrics?.trim();
  if (!plainText) return null;

  const lines: LyricLine[] = plainText
    .split(/\r?\n/)
    .map((text) => text.trim())
    .filter(Boolean)
    .map((text) => ({ startMs: 0, endMs: null, text }));

  if (!lines.length) return null;
  return { provider: "lyrics.ovh", synced: false, lines, plainText };
}
