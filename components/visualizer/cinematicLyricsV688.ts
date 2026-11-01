import type { LyricLine } from '@/types/music';
import { verifiedLyricWordsV477 } from './beautifulLyricsV477';

/** V688 is a bounded presentation layer for the EXISTING caption; it neither
 * invents speech evidence nor moves text into an unverified actor-free region.
 * The user's position and the existing scene composition stay authoritative. */
export type LyricCinemaModeV688 = 'quiet' | 'precise' | 'hook' | 'dense';
export type CinematicLyricPlanV688 = {
  active: boolean;
  mode: LyricCinemaModeV688;
  verifiedWords: boolean;
  widthCh: number;
  max3DWidth: number;
  plateOpacity: number;
  lineHeight: number;
  halo: number;
  transitionMs: number;
};
const finite=(value:number)=>Number.isFinite(value);
const clamp=(value:number,min:number,max:number)=>finite(value)?Math.min(max,Math.max(min,value)):min;
const smooth=(value:number)=>{const n=clamp(value,0,1);return n*n*(3-2*n);};

export function planCinematicLyricsV688(input: {
  line?: LyricLine | null;
  nextLineStart?: number;
  progressMs: number;
  playing: boolean;
  synchronized: boolean;
  reducedMotion: boolean;
  wordHighlight: boolean;
  immersive: boolean;
  avatarCount: number;
  hookConfirmed?: boolean;
  existingWidthCh: number;
  existing3DWidth: number;
  existingPlateOpacity: number;
  intensity: number;
}): CinematicLyricPlanV688 {
  const line=input.line;
  const content=typeof line?.text==='string'?line.text.trim():'';
  const length=[...content].length;
  const longest=(content.match(/\S+/gu)??[]).reduce((max,token)=>Math.max(max,[...token].length),0);
  const crowd=input.immersive&&clamp(input.avatarCount,1,4)>=3;
  const dense=length>(input.immersive?58:88)||longest>26;
  const widthCap=crowd?(dense?32:38):input.immersive?(dense?38:47):(dense?48:64);
  // A narrower reading footprint does not claim knowledge of actual screen-space
  // actor bounds; the existing composition controls actual side/position.
  const widthCh=Math.min(clamp(input.existingWidthCh,18,90),widthCap);
  const max3DWidth=Math.min(clamp(input.existing3DWidth,.7,3.4),crowd?(dense?1.82:1.98):dense?2.13:2.6);
  const plateOpacity=clamp(Math.max(clamp(input.existingPlateOpacity,0,1),
    input.immersive?(crowd?.91:.86):dense?.30:.10),0,.98);
  const lineHeight=dense?1.45:crowd?1.38:1.32;
  const base:CinematicLyricPlanV688={active:false,mode:dense?'dense':'quiet',verifiedWords:false,
    widthCh,max3DWidth,plateOpacity,lineHeight,halo:0,transitionMs:0};
  if (!line||!content||!finite(line.startMs)||line.startMs<0||!finite(input.progressMs)||
      !input.playing||!input.synchronized||input.progressMs<line.startMs)return base;
  const endOptions=[line.endMs,input.nextLineStart].filter((value):value is number=>
    typeof value==='number'&&finite(value)&&value>line.startMs);
  const end=endOptions.length?Math.min(...endOptions):line.startMs+8000;
  if(input.progressMs>=end)return base;
  const verifiedWords=!!input.wordHighlight&&verifiedLyricWordsV477(line,input.nextLineStart);
  const mode:LyricCinemaModeV688=dense?'dense':input.hookConfirmed?'hook':verifiedWords?'precise':'quiet';
  const motion=!input.reducedMotion&&verifiedWords&&clamp(input.intensity,0,1)>0;
  const envelope=smooth((input.progressMs-line.startMs)/170)*smooth((end-input.progressMs)/190);
  const halo=motion?clamp((mode==='hook'?.09:mode==='dense'?.035:crowd?.045:.06)*clamp(input.intensity,0,1)*envelope,0,.09):0;
  return {...base,active:true,mode,verifiedWords,halo,
    transitionMs:motion?(mode==='hook'?110:mode==='dense'?65:85):0};
}

/** Return a restrained accent *within* a VERIFIED word window only. The playback
 * fraction/color, real word text, input timestamps and lyric positioning are unchanged. */
export function cinematicLyricWordAccentV688(input:{
  line:LyricLine;nextLineStart?:number;wordIndex:number;progressMs:number;
  playing:boolean;reducedMotion:boolean;plan:CinematicLyricPlanV688;
}):number {
  const {line,plan}=input;
  if(!plan.active||!plan.verifiedWords||plan.halo<=0||!input.playing||
      input.reducedMotion||!finite(input.progressMs)||!Number.isInteger(input.wordIndex)||
      input.wordIndex<0||!verifiedLyricWordsV477(line,input.nextLineStart))return 0;
  const word=line.words?.[input.wordIndex];
  if(!word)return 0;
  const ends=[word.endMs,line.words?.[input.wordIndex+1]?.startMs,line.endMs,input.nextLineStart]
    .filter((value):value is number=>typeof value==='number'&&finite(value)&&value>word.startMs);
  // No fabricated end of the last word.
  if(!ends.length)return 0;
  const end=Math.min(...ends);
  if(input.progressMs<word.startMs||input.progressMs>=end)return 0;
  const duration=end-word.startMs;
  const attack=Math.min(95,Math.max(16,duration*.25));
  const release=Math.min(115,Math.max(18,duration*.30));
  return clamp(plan.halo*smooth((input.progressMs-word.startMs)/attack)*
    smooth((end-input.progressMs)/release),0,.09);
}
