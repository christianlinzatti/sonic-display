import type { Lyrics, LyricLine, LyricWord } from "@/types/music";

export type LyricsTimingQualityV554 = "word" | "line" | "plain";

/** Count only explicit, finite provider timestamps. Never derive a word position from a line. */
function validWord(word: LyricWord, line: LyricLine): boolean {
  return typeof word?.text === "string" && !!word.text.trim() &&
    Number.isFinite(word.startMs) && word.startMs >= 0 &&
    (word.endMs == null || (Number.isFinite(word.endMs) && word.endMs > word.startMs)) &&
    Number.isFinite(line.startMs) && word.startMs >= line.startMs &&
    (line.endMs == null || word.startMs < line.endMs);
}

export function lyricsTimingV554(lyrics: Lyrics): { quality: LyricsTimingQualityV554; timedWords: number; timedLines: number } {
  const timedWords = lyrics.synced ? lyrics.lines.reduce((count, line) =>
    count + (line.words?.filter(word => validWord(word, line)).length ?? 0), 0) : 0;
  const timedLines = lyrics.synced
    ? lyrics.lines.filter(line => typeof line.text === "string" && !!line.text.trim() &&
        Number.isFinite(line.startMs) && line.startMs >= 0 &&
        (line.endMs == null || (Number.isFinite(line.endMs) && line.endMs > line.startMs))).length
    : 0;
  return {
    quality: timedWords > 0 ? "word" : timedLines > 0 ? "line" : "plain",
    timedWords,
    timedLines,
  };
}

/**
 * Evaluate *every* successful provider result, not the earliest response or the
 * first configured provider. One real word-timed result outranks any line-only
 * result; line timing outranks plain text. Within a tier prefer greater usable
 * coverage and finally stable provider order (Spotify, LRCLIB, lyrics.ovh, Genius).
 */
export function chooseBestLyricsV554(candidates: ReadonlyArray<Lyrics | null | undefined>): Lyrics | null {
  let best: Lyrics | null = null;
  let bestScore = -1;
  for (const lyrics of candidates) {
    if (!lyrics?.lines?.length) continue;
    const timing = lyricsTimingV554(lyrics);
    const tier = timing.quality === "word" ? 3 : timing.quality === "line" ? 2 : 1;
    const score = tier * 1_000_000 + Math.min(timing.timedWords || timing.timedLines || lyrics.lines.length, 999_999);
    if (score > bestScore) { best = lyrics; bestScore = score; }
  }
  return best;
}
