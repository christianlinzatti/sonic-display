import type { Lyrics, LyricLine, LyricWord } from "@/types/music";

/** Vocal timing and vowel-shape approximation; never claims to recover audio phonemes. */
export type VocalStyleV368 = "auto" | "rap" | "singing";
export type VocalPerformanceCueV368 = {
  jaw: number; wide: number; round: number; lipsClosed: number;
  smile: number; brow: number; blink: number; headAccent: number;
  confidence: "word" | "line" | "none";
  style: "rap" | "singing" | "line" | "silent";
  activeWord: string | null;
};
export type VocalPerformanceOptionsV368 = {
  mode?: "lyrics" | "hybrid";
  mids?: number;
  style?: VocalStyleV368;
  genre?: string | null;
  expression?: number; // normalized 0..1
  avatarSlot?: number; // only affects incidental, non-vocal blinking
};
const clamp = (n: number) => Number.isFinite(n) ? Math.max(0, Math.min(1, n)) : 0;
const smooth = (n: number) => { const t = clamp(n); return t * t * (3 - 2 * t); };
const SILENT: VocalPerformanceCueV368 = Object.freeze({jaw:0,wide:0,round:0,lipsClosed:0,smile:0,brow:0,blink:0,headAccent:0,confidence:"none",style:"silent",activeWord:null});
const vowelRuns = (text: string) => Array.from(text.toLocaleLowerCase("de-DE").matchAll(/[aeiouäöü]+/g), m => m[0]);
const isNonVocal = (text: string) => /^\s*(?:[♪♫♬]+|\[[^\]]+\]|\([^)]*(?:instrumental|music|musik|pause|solo|intro|outro)[^)]*\))\s*$/i.test(text) || !/[a-zäöüß]/i.test(text);
function activeLine(lines: LyricLine[], time: number): number {
  let lo = 0, hi = lines.length - 1, found = -1;
  while (lo <= hi) { const mid = (lo + hi) >>> 1; if (lines[mid].startMs <= time) { found = mid; lo = mid + 1; } else hi = mid - 1; }
  return found;
}
function lineStop(lines: LyricLine[], index: number): number {
  const line = lines[index];
  return Math.min(line.endMs != null && line.endMs > line.startMs ? line.endMs : Infinity,
    lines[index + 1]?.startMs ?? Infinity, line.startMs + 12000);
}
const wordCache = new WeakMap<LyricLine, LyricWord[]>();
function timedWords(line: LyricLine): LyricWord[] {
  const cached = wordCache.get(line);
  if (cached) return cached;
  const words = (line.words ?? []).filter(w => Number.isFinite(w.startMs) && typeof w.text === "string" && !!w.text.trim())
    .slice().sort((a,b)=>a.startMs-b.startMs);
  wordCache.set(line,words);
  return words;
}
function chooseStyle(style: VocalStyleV368, genre: string | null | undefined, words: LyricWord[], wi: number, dur: number): "rap" | "singing" {
  if (style !== "auto") return style;
  // Genre + token pacing are *hints*, not vocal classification from Spotify audio.
  const key = (genre ?? "").toLowerCase();
  if (/rap|hip.?hop|trap|drill/.test(key)) return "rap";
  const prev = wi > 0 ? words[wi-1].startMs : NaN;
  const next = words[wi+1]?.startMs ?? NaN;
  if ((Number.isFinite(prev) && words[wi].startMs - prev < 340) ||
      (Number.isFinite(next) && next - words[wi].startMs < 330) || dur < 260) return "rap";
  return "singing";
}
function naturalBlink(timeMs: number, slot: number, expression: number): number {
  // Track-clock-based blink, deliberately not synchronized between dancers.
  const span = 4200 + (Math.abs(Math.floor(slot)) % 4) * 410;
  const phase = ((timeMs + (Math.abs(Math.floor(slot)) % 7) * 631) % span + span) % span;
  if (phase >= 155) return 0;
  return Math.sin(Math.PI * phase / 155) ** 2 * .75 * expression;
}
/** Deterministic cue for every avatar frame; no extra timers, listeners or network. */
export function resolveVocalPerformanceV368(
  lyrics: Lyrics | null, timeMs: number, playing: boolean, options: VocalPerformanceOptionsV368 = {}
): VocalPerformanceCueV368 {
  if (!playing || !lyrics?.synced || !lyrics.lines.length || !Number.isFinite(timeMs)) return SILENT;
  const {style="auto", genre=null, mode="lyrics", mids=0, expression=.55, avatarSlot=0} = options;
  const exp = clamp(expression);
  const blink = naturalBlink(timeMs, avatarSlot, exp);
  const rest = (styleName: VocalPerformanceCueV368["style"] = "silent"): VocalPerformanceCueV368 => ({...SILENT,blink,style:styleName});
  const lines = lyrics.lines;
  const li = activeLine(lines,timeMs);
  if (li < 0) return rest();
  const line = lines[li];
  if (!Number.isFinite(line.startMs) || isNonVocal(line.text) || !line.text.trim()) return rest();
  const stop = lineStop(lines,li);
  if (timeMs >= stop) return rest();
  const words = timedWords(line);
  let token = line.text;
  let start = line.startMs, end = Math.min(stop,start+8500);
  let confidence: VocalPerformanceCueV368["confidence"] = "line";
  let wi = 0;
  if (words.length) {
    wi = -1;
    for (let i=0;i<words.length;i++) {if (timeMs>=words[i].startMs) wi=i;else break;}
    if (wi<0) return rest();
    const w = words[wi];
    token=w.text;start=w.startMs;
    end=Math.min(stop,w.endMs != null && w.endMs>start ? w.endMs : Infinity, words[wi+1]?.startMs ?? Infinity,start+2100);
    confidence="word";
  }
  if (timeMs<start || timeMs>=end || end<=start || isNonVocal(token)) return rest();
  const dur=end-start;
  const p=clamp((timeMs-start)/dur);
  const env=smooth(Math.min(1,(timeMs-start)/55))*smooth(Math.min(1,(end-timeMs)/85));
  const runs=vowelRuns(token);
  const count=Math.max(1,Math.min(12,runs.length));
  const detected=confidence==="word" ? chooseStyle(style,genre,words,wi,dur) : "line";
  // Estimate vowel position *within a timed word*, never invented sub-word timestamps.
  const syllable=Math.min(count-1,Math.floor(p*count));
  const vowel=runs[syllable] ?? "a";
  const round=/[oöuü]/.test(vowel) ? 1 : 0;
  const wide=/[eiäe]/.test(vowel) ? 1 : .32;
  const leadingClosure=/^\s*[bmp]/i.test(token) ? (1-smooth((timeMs-start)/Math.min(90,dur*.32))) : 0;
  const finalClosure=/[bmp]\W*$/i.test(token) ? smooth((p-.84)/.16) : 0;
  const closure=confidence==="word" ? clamp(Math.max(leadingClosure,finalClosure)) : 0;
  const pulse = detected==="rap"
    ? .54+.46*Math.pow(Math.sin(Math.PI*(p*count+.18)),2)
    : detected==="singing" ? .80+.20*Math.sin(Math.PI*p) : .55+.24*Math.pow(Math.sin(Math.PI*p*count),2);
  const audioGain=mode==="hybrid" ? .82+.18*clamp(mids) : 1;
  const amplitude=confidence==="word" ? detected==="rap" ? .82 : .76 : .33;
  const jaw=clamp(amplitude*pulse*env*(1-.90*closure)*audioGain);
  const facial=confidence==="word" ? 1 : .35;
  const emphasis=/[!?]/.test(token) ? 1 : 0;
  return {
    jaw,wide:jaw*wide*(1-round*.75),round:jaw*round, lipsClosed:clamp(closure*env),
    smile: clamp(exp*facial*(detected==="singing" ? .15 : .045)*env),
    brow: clamp(exp*facial*(detected==="rap" ? .12 : .09)*(1+.5*emphasis)*env),
    blink, headAccent: clamp(exp*(detected==="rap" ? .15 : .045)*jaw),
    confidence,style:detected,activeWord:confidence==="word" ? token.trim() : null,
  };
}
