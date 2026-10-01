import type { Lyrics, LyricLine } from "@/types/music";

interface LrclibResponse {
  plainLyrics?: string | null;
  syncedLyrics?: string | null;
}

function timestampToMs(value: string): number | null {
  const match = value.match(/^(\d+):(\d{2})(?:\.(\d{1,3}))?$/);
  if (!match) return null;
  return Number(match[1]) * 60_000 + Number(match[2]) * 1_000 + Number((match[3] ?? "").padEnd(3, "0"));
}

export function parseLrc(raw: string): LyricLine[] {
  const parsed: Array<{ startMs: number; text: string }> = [];
  for (const row of raw.split(/\r?\n/)) {
    const tags = [...row.matchAll(/\[(\d+:\d{2}(?:\.\d{1,3})?)\]/g)];
    const text = row.replace(/\[\d+:\d{2}(?:\.\d{1,3})?\]/g, "").trim();
    for (const tag of tags) {
      const startMs = timestampToMs(tag[1]);
      if (startMs !== null && text) parsed.push({ startMs, text });
    }
  }
  parsed.sort((a, b) => a.startMs - b.startMs);
  return parsed.map((line, index) => ({ ...line, endMs: parsed[index + 1]?.startMs ?? null }));
}

export async function lookupLrclibLyrics(query: {
  title: string;
  artist: string;
  album: string;
  duration: number;
}): Promise<Lyrics | null> {
  const params = new URLSearchParams({
    track_name: query.title,
    artist_name: query.artist,
    album_name: query.album,
    duration: String(query.duration),
  });
  const response = await fetch(`https://lrclib.net/api/get?${params}`, {
    headers: { "User-Agent": process.env.LRCLIB_USER_AGENT ?? "SonicDisplay/0.1.0" },
    cache: "no-store",
    signal: AbortSignal.timeout(8_000),
  });
  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`LRCLIB returned HTTP ${response.status}`);

  const data = (await response.json()) as LrclibResponse;
  const plainText = data.plainLyrics?.trim() || null;
  const syncedLines = data.syncedLyrics ? parseLrc(data.syncedLyrics) : [];
  const lines = syncedLines.length
    ? syncedLines
    : (plainText ?? "")
        .split(/\r?\n/)
        .map((text) => text.trim())
        .filter(Boolean)
        .map((text) => ({ startMs: 0, endMs: null, text }));
  if (!lines.length) return null;
  return {
    provider: "lrclib",
    synced: syncedLines.length > 0,
    lines,
    plainText,
  };
}
