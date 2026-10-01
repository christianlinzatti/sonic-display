import type { Lyrics, LyricLine } from "@/types/music";
import type { LyricsQuery } from "@/services/lyrics/server";

/** Server-only adapter. genius-lyrics-api searches Genius and extracts the page lyrics. */
export async function lookupGeniusLyrics(query: LyricsQuery): Promise<Lyrics | null> {
  const apiKey = process.env.GENIUS_ACCESS_TOKEN;
  if (!apiKey) return null; // optional provider: do not break other providers when unconfigured
  const { getLyrics } = await import("genius-lyrics-api");
  const raw = await getLyrics({ apiKey, title: query.title, artist: query.artist, optimizeQuery: true });
  if (!raw || !raw.trim()) return null;
  const lines: LyricLine[] = raw.split(/\r?\n/).map((text: string) => text.trim()).filter(Boolean)
    .map((text: string) => ({ startMs: 0, endMs: null, text }));
  if (!lines.length) return null;
  return { provider: "genius", synced: false, lines, plainText: lines.map(line => line.text).join("\n") };
}
