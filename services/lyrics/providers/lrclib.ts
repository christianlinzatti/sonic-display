import type { Lyrics, LyricLine, LyricWord } from "@/types/music";
import { parse as parseYaml } from "yaml";

interface LrclibResponse {
  plainLyrics?: string | null;
  syncedLyrics?: string | null;
  hasWordSync?: boolean;
  lyricsfile?: string | null;
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

/** Parse LRCLIB Lyricsfile (YAML). Invalid or incomplete word data gracefully falls back to LRC. */
export function parseWordSyncedLyricsfile(raw: string): LyricLine[] {
  try {
    const document: unknown = parseYaml(raw);
    if (!document || typeof document !== "object" || !("lines" in document)) return [];
    const lines = (document as { lines?: unknown }).lines;
    if (!Array.isArray(lines)) return [];
    const parsed: LyricLine[] = [];
    for (const entry of lines) {
      if (!entry || typeof entry !== "object") continue;
      const line = entry as Record<string, unknown>;
      const rawWords = Array.isArray(line.words) ? line.words : [];
      const words: LyricWord[] = [];
      for (const candidate of rawWords) {
        if (!candidate || typeof candidate !== "object") continue;
        const word = candidate as Record<string, unknown>;
        const start = word.start_ms;
        const end = word.end_ms;
        if (typeof word.text !== "string" || !word.text.trim() ||
            typeof start !== "number" || !Number.isFinite(start) || start < 0) continue;
        words.push({ text: word.text, startMs: start,
          endMs: typeof end === "number" && Number.isFinite(end) && end > start ? end : null });
      }
      words.sort((a, b) => a.startMs - b.startMs);
      if (!words.length) continue;
      const startMs = typeof line.start_ms === "number" && Number.isFinite(line.start_ms)
        ? line.start_ms : words[0].startMs;
      const endMs = typeof line.end_ms === "number" && line.end_ms > startMs ? line.end_ms : null;
      const text = typeof line.text === "string" && line.text.trim() ? line.text : words.map(w => w.text).join("");
      parsed.push({ startMs, endMs, text, words });
    }
    parsed.sort((a,b) => a.startMs - b.startMs);
    return parsed.map((line, index) => ({...line, endMs: line.endMs ?? parsed[index+1]?.startMs ?? null }));
  } catch { return []; }
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
  // Some responses include a lyricsfile even when hasWordSync is omitted.
  // Trust only actual parseable word timestamps, never the metadata flag alone.
  const wordLines = data.lyricsfile ? parseWordSyncedLyricsfile(data.lyricsfile) : [];
  const lines = wordLines.length
    ? wordLines
    : syncedLines.length
    ? syncedLines
    : (plainText ?? "")
        .split(/\r?\n/)
        .map((text) => text.trim())
        .filter(Boolean)
        .map((text) => ({ startMs: 0, endMs: null, text }));
  if (!lines.length) return null;
  return {
    provider: "lrclib",
    synced: wordLines.length > 0 || syncedLines.length > 0,
    lines,
    plainText,
  };
}
