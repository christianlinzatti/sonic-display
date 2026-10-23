/** V173: deterministic, bounded, non-destructive suggested lighting timelines.
 * Timings are musical estimates, not annotations or guaranteed drop timestamps.
 * Generation never writes localStorage; the user must explicitly accept cues.
 */
import { sanitizeLightCues, type LightCue, type LightCueKind } from "./lightingTimeline";

export type AutoCueSettings = {
  bpm: number;
  barsPerPhrase: number;
  energy: number;
  genre: string;
  includeBlackouts: boolean;
  includeStrobes: boolean;
};
export const DEFAULT_AUTO_CUES: AutoCueSettings = {
  bpm: 150, barsPerPhrase: 8, energy: .7, genre: "", includeBlackouts: true, includeStrobes: false,
};
const clamp = (n: number, min: number, max: number) => Number.isFinite(n) ? Math.max(min, Math.min(max, n)) : min;
const kindColor = (bar: number): string => ["#00E5D7", "#FF3978", "#FFAE42", "#8F7AFF"][bar % 4];

/** Create phrase-aligned suggestions; never claim ground-truth drop detection. */
export function generateAutomaticLightCues(durationMs: number, options: Partial<AutoCueSettings> = {}): LightCue[] {
  const duration = clamp(durationMs, 0, 30 * 60_000);
  if (duration < 12_000) return [];
  const bpm = clamp(Number(options.bpm ?? DEFAULT_AUTO_CUES.bpm), 65, 220);
  const bars = Math.round(clamp(Number(options.barsPerPhrase ?? DEFAULT_AUTO_CUES.barsPerPhrase), 4, 16));
  const energy = clamp(Number(options.energy ?? DEFAULT_AUTO_CUES.energy), 0, 1);
  const phraseMs = Math.round((60_000 / bpm) * 4 * bars);
  const genre = String(options.genre ?? "").toLowerCase();
  const hard = /hardstyle|hardtekk|hardcore|hard dance|techno/.test(genre);
  const suggestions: LightCue[] = [];
  const add = (kind: LightCueKind, atMs: number, strength: number, durationCue: number, color?: string) => {
    if (atMs < 0 || atMs >= duration - 100) return;
    const t = Math.round(atMs);
    suggestions.push({id:`auto-${kind}-${t}`, kind, atMs:t, strength:clamp(strength,0,1), durationMs:Math.min(Math.max(60,durationCue),10000), ...(color?{color}:{})});
  };
  const maxPhrases = Math.min(64, Math.floor(duration / phraseMs));
  for (let phrase=1; phrase<=maxPhrases; phrase++) {
    const at = phrase * phraseMs;
    if (at >= duration - 1000) break;
    add("build", at - Math.min(8000, Math.round(phraseMs*.4)), .38 + energy*.38, 7000);
    if (hard && (options.includeBlackouts ?? DEFAULT_AUTO_CUES.includeBlackouts)) add("blackout", at-300, .35+energy*.4, 320);
    add("drop",at,.42+energy*.45,1600);
    if (phrase % 2 === 0) add("color",at+2200,.65,3500,kindColor(phrase/2));
    if (hard && (options.includeStrobes ?? DEFAULT_AUTO_CUES.includeStrobes)) add("strobe",at+700,.4,800);
  }
  // Sparse midphrase accents, genre aware and bounded for mobile/ARM browsers.
  if (hard) for(let phrase=0;phrase<Math.min(32,maxPhrases);phrase++) {
    const at=phrase*phraseMs + Math.round(phraseMs*.5);
    if (at > 1000 && at < duration-2000) add("build",at,.2+energy*.25,1400);
  }
  return sanitizeLightCues(suggestions.slice(0,120),duration);
}

/** Preserve manual cues; overlap is decided by user before committing. */
export function mergeAcceptedLightCues(manual: LightCue[], accepted: LightCue[], durationMs: number): LightCue[] {
  const base = sanitizeLightCues(manual,durationMs);
  const candidates = sanitizeLightCues(accepted,durationMs);
  const existing = new Set(base.map(c=>`${c.kind}:${Math.round(c.atMs/100)*100}`));
  const acceptedUnique = candidates.filter(c=>{
    const signature=`${c.kind}:${Math.round(c.atMs/100)*100}`;
    if(existing.has(signature)) return false;
    existing.add(signature);
    return true;
  }).map((c,i)=>({...c,id:`accepted-${c.kind}-${c.atMs}-${i}`}));
  return sanitizeLightCues([...base,...acceptedUnique],durationMs);
}
