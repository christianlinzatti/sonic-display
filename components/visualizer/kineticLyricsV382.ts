import type { LyricLine } from "@/types/music";

/** V382: deterministic, clock-based word animation plans. No audio stream, requestAnimationFrame or global state. */
export type KineticLyricsPresetV382 = "off" | "auto" | "rap" | "festival" | "cinematic";
export type KineticLyricsStyleV382 = Exclude<KineticLyricsPresetV382, "off" | "auto">;
export type KineticTimingV382 = "word" | "estimated" | "none";
export interface KineticWordCueV382 {
  fill: number; enter: number; anticipation: number; scale: number; lift: number;
  glow: number; drop: number; timing: KineticTimingV382;
}
const clamp = (v: number, min = 0, max = 1) => Number.isFinite(v) ? Math.max(min, Math.min(max, v)) : min;
const smooth = (v: number) => { const x=clamp(v);return x*x*(3-2*x); };

export function resolveKineticStyleV382(preset: KineticLyricsPresetV382 | undefined,
  legacyStyle: string | undefined, genre = ""): KineticLyricsStyleV382 | null {
  if (preset === "off") return null;
  if (preset === "rap" || preset === "festival" || preset === "cinematic") return preset;
  const normalized = genre.toLowerCase();
  if (/hardtekk|hardstyle|hardcore|techno|edm/.test(normalized)) return "festival";
  if (/rap|hip.?hop|trap/.test(normalized)) return "rap";
  return legacyStyle === "neon" ? "festival" : legacyStyle === "cinematic" ? "cinematic" : "rap";
}

/** Reject malformed / out-of-order word marks instead of fabricating true word synchronization. */
export function kineticWordRangeV382(line: LyricLine, nextLineStart: number | undefined, index: number) {
  const start = Number.isFinite(line.startMs) ? line.startMs : 0;
  const lineEnd = line.endMs != null && Number.isFinite(line.endMs) && line.endMs > start
    ? line.endMs : nextLineStart != null && Number.isFinite(nextLineStart) && nextLineStart > start
    ? nextLineStart : start+3200;
  const words = line.words;
  if (words?.length && index >= 0 && index < words.length) {
    const word = words[index];
    const following = words[index+1];
    const wordStart = word.startMs;
    const candidateEnd = word.endMs != null && word.endMs > wordStart ? word.endMs : following?.startMs ?? lineEnd;
    const valid = !!word.text?.trim() && Number.isFinite(wordStart) && Number.isFinite(candidateEnd)
      && wordStart >= start && wordStart < lineEnd && candidateEnd > wordStart && candidateEnd <= lineEnd
      && (index === 0 || (Number.isFinite(words[index-1].startMs) && words[index-1].startMs <= wordStart));
    if (valid) return {startMs:wordStart,endMs:candidateEnd,timing:"word" as const};
  }
  const tokens = line.text.match(/\S+/g) ?? [];
  if (!tokens.length || index < 0 || index >= tokens.length || !Number.isFinite(line.startMs)) return null;
  const step=(lineEnd-start)/tokens.length;
  return {startMs:start+index*step,endMs:start+(index+1)*step,timing:"estimated" as const};
}

/** Drop accents need analyzed energy; the genre label alone NEVER invents a drop. */
export function kineticDropCueV382(args:{attack?:number;bass?:number;volume?:number;playing:boolean;enabled:boolean}) {
  if (!args.playing || !args.enabled) return 0;
  const attack=clamp(args.attack??0),bass=clamp(args.bass??0),volume=clamp(args.volume??0);
  return attack >= .72 && bass >= .56 && volume >= .52 ? clamp((attack-.72)*1.9 + (bass-.56)*.72) : 0;
}

export function resolveKineticWordV382(args:{line:LyricLine;nextLineStart?:number;index:number;
  progressMs:number;synced:boolean;playing:boolean;reducedMotion:boolean;
  preset:KineticLyricsStyleV382;strength:number;drop?:number}):KineticWordCueV382 {
  const zero:KineticWordCueV382={fill:0,enter:0,anticipation:0,scale:1,lift:0,glow:0,drop:0,timing:"none"};
  if (!args.synced || !Number.isFinite(args.progressMs)) return zero;
  const range=kineticWordRangeV382(args.line,args.nextLineStart,args.index);
  if (!range) return zero;
  const elapsed=args.progressMs-range.startMs;
  const duration=Math.max(60,range.endMs-range.startMs);
  const raw=clamp(elapsed/duration);
  // Blend easing with linear time to maintain legible, approximately timed karaoke fills.
  const fill=raw*.68+smooth(raw)*.32;
  const strength=clamp(args.strength/100);
  const timing=range.timing;
  if (!args.playing || args.reducedMotion || strength<=0)
    return {...zero,fill,timing};
  const anticipation = elapsed<0 ? smooth((elapsed+125)/125) : 0;
  const enter=elapsed<0 ? 0 : Math.max(0,1-smooth((elapsed-25)/Math.max(115,Math.min(240,duration*.48))));
  const density=Math.min(1,440/duration);
  const calm=args.preset==="rap" ? 1-.48*density : 1;
  const weight=args.preset==="cinematic"?.35:args.preset==="rap"?.68:1;
  const emphasis=(args.index===((args.line.words?.length??(args.line.text.match(/\S+/g)?.length??0))-1))?1.14:1;
  const drop=args.preset==="festival"?clamp(args.drop??0):0;
  const accent=clamp((enter*.75+anticipation*.20+drop*.58)*strength*weight*calm*emphasis);
  const scale=1+accent*(args.preset==="festival"?.13:args.preset==="rap"?.08:.045);
  const lift=accent*(args.preset==="festival"?3.5:args.preset==="rap"?2.2:1.4);
  return {fill,enter:enter*strength,anticipation:anticipation*strength,scale,lift,glow:clamp(accent*.8+drop*.28*strength),drop,timing};
}

/** Smooth color transition for GPU text; supports only validated hex values. */
export function blendKineticColorV382(a:string,b:string,progress:number) {
  if (!/^#[0-9a-fA-F]{6}$/.test(a) || !/^#[0-9a-fA-F]{6}$/.test(b)) return a;
  const fraction=clamp(progress);
  const from=Number.parseInt(a.slice(1),16),to=Number.parseInt(b.slice(1),16);
  let result="#";
  for(let shift=16;shift>=0;shift-=8){
    const x=(from>>shift)&255,y=(to>>shift)&255;
    result+=Math.round(x+(y-x)*fraction).toString(16).padStart(2,"0");
  }
  return result;
}
