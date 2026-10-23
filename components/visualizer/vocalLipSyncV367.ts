import type { Lyrics, LyricLine, LyricWord } from "@/types/music";

export type VocalCueV367 = {
  jaw: number; wide: number; round: number; closed: number;
  confidence: "word" | "line" | "none";
  activeWord: string | null;
};
const silence: VocalCueV367 = { jaw: 0, wide: 0, round: 0, closed: 1, confidence: "none", activeWord: null };
const clamp = (n: number) => Math.max(0, Math.min(1, Number.isFinite(n) ? n : 0));
const ease = (x: number) => { const t = clamp(x); return t * t * (3 - 2 * t); };

/** Visual vowel *approximation*, not speech recognition or measured phonemes. */
export function wordMouthShapeV367(text: string) {
  const vowels = (text.toLocaleLowerCase("de-DE").match(/[aeiouäöü]/g) ?? []);
  const open = vowels.filter(v => /[aäe]/.test(v)).length;
  const rounded = vowels.filter(v => /[oöuü]/.test(v)).length;
  const sharp = vowels.filter(v => /[ei]/.test(v)).length;
  const total = Math.max(1, open + rounded + sharp);
  return { wide: clamp((open + sharp * .7) / total), round: clamp(rounded / total) };
}

function validWords(line: LyricLine): LyricWord[] {
  return (line.words ?? []).filter(w => Number.isFinite(w.startMs) && typeof w.text === "string" && !!w.text.trim());
}

/** Deterministic: all dancers read the same Spotify song clock (with the Lyrics offset).
 * Returns silence on pauses, unsynced sources, instrumental gaps or invalid timestamps.
 * Word marks take precedence; line-only marks use a clearly lower-confidence estimate.
 */
export function resolveVocalCueV367(lyrics: Lyrics | null, timeMs: number, playing: boolean, mode: "lyrics" | "hybrid" = "lyrics", mids = 0): VocalCueV367 {
  if (!playing || !lyrics?.synced || !Number.isFinite(timeMs) || !lyrics.lines.length) return silence;
  const lines = lyrics.lines;
  let lo = 0, hi = lines.length - 1, index = -1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (lines[mid].startMs <= timeMs) { index = mid; lo = mid + 1; }
    else hi = mid - 1;
  }
  if (index < 0) return silence;
  const line = lines[index];
  if (!line.text.trim() || /^(♪|♫|\[.*\])$/.test(line.text.trim())) return silence;
  const nextStart = lines[index + 1]?.startMs ?? Infinity;
  const end = Math.min(line.endMs != null && line.endMs > line.startMs ? line.endMs : Infinity, nextStart, line.startMs + 15000);
  if (timeMs >= end) return silence;
  const words = validWords(line);
  let start = line.startMs, stop = end, token = line.text, confidence: VocalCueV367["confidence"] = "line";
  if (words.length) {
    let chosen = -1;
    for (let i = 0; i < words.length; i++) {
      if (timeMs >= words[i].startMs) chosen = i; else break;
    }
    if (chosen < 0) return silence;
    const word = words[chosen];
    start = word.startMs;
    stop = Math.min(word.endMs != null && word.endMs > start ? word.endMs : Infinity, words[chosen + 1]?.startMs ?? Infinity, end, start + 2000);
    if (timeMs >= stop) return silence;
    token = word.text;
    confidence = "word";
  } else {
    // No fake phoneme times: syllable-like pulses within a timed *line* only.
    stop = Math.min(stop, line.startMs + 9500);
    if (timeMs >= stop) return silence;
  }
  const duration = Math.max(80, stop - start);
  const phase = clamp((timeMs - start) / duration);
  const entrance = ease(Math.min(1, (timeMs - start) / 85));
  const exit = ease(Math.min(1, (stop - timeMs) / 120));
  const syllables = Math.max(1, Math.min(9, (token.match(/[aeiouäöü]+/gi) ?? []).length));
  const articulation = .62 + .38 * Math.pow(Math.sin(phase * Math.PI * (syllables + 0.25)), 2);
  const audioBoost = mode === "hybrid" ? .75 + .25 * clamp(mids) : 1;
  const jaw = clamp((confidence === "word" ? .78 : .38) * articulation * entrance * exit * audioBoost);
  const shape = wordMouthShapeV367(token);
  return { jaw, wide: shape.wide * jaw, round: shape.round * jaw, closed: 1 - jaw, confidence, activeWord: confidence === "word" ? token.trim() : null };
}
