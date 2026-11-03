/** V873 – Cinematic Lyrics 10.0. Pure, playback-clock-derived visual refinements.
 * The readable lyric renderer and V813 timestamp authority remain the only owners
 * of text and timing; no synthetic syllables, duplicated captions, timers or meshes.
 */
import type {LyricLine} from '@/types/music';
import type {LyricsProjectionCueV813} from './lyricsProjectionV813';
import type {ConcertFxCueV810,ConcertFxSettingsV810} from './concertFxStudioV810';

const finite=(v:unknown):v is number=>typeof v==='number'&&Number.isFinite(v);
const clamp=(v:number,min:number,max:number)=>finite(v)?Math.max(min,Math.min(max,v)):min;
export interface CinematicLyricCueV873 {
  active:boolean;plateOpacity:number;motionGain:number;wordTransitionMs:number;
  contrast:number;mode:'off'|'readable'|'fast-rap'|'hook'|'portrait';verifiedWords:boolean;
}
const OFF:Readonly<CinematicLyricCueV873>={active:false,plateOpacity:0,motionGain:1,
  wordTransitionMs:0,contrast:0,mode:'off',verifiedWords:false};

export function planCinematicLyricCueV873(input:{
  line:LyricLine|null|undefined;nextLineStart?:number|null;progressMs:number;
  playing:boolean;synchronized:boolean;reducedMotion:boolean;immersive:boolean;
  castCount:number;wordHighlight:boolean;hookConfirmed:boolean;cameraFocus:boolean;
  existingPlateOpacity:number;intensity:number;
}):CinematicLyricCueV873{
  const {line,progressMs:t}=input;
  if(!input.playing||!line||!line.text?.trim()||!finite(t)||!finite(line.startMs)||
    !finite(input.castCount)||input.castCount<1||input.castCount>8)return {...OFF};
  const next=finite(input.nextLineStart)&&input.nextLineStart>line.startMs?input.nextLineStart:Infinity;
  const end=Math.min(finite(line.endMs)&&line.endMs>line.startMs?line.endMs:line.startMs+7500,next);
  if(!finite(end)||end<=line.startMs||t<line.startMs||t>=end)return {...OFF};
  // A valid line is sufficient for a reading plate. Word animation, in contrast,
  // MUST use the provider's genuine per-word timestamps within this very line.
  const verifiedWords=input.synchronized&&input.wordHighlight&&Array.isArray(line.words)&&
    line.words.length>0&&line.words.length<=500&&line.words.every((w,index)=>finite(w.startMs)&&finite(w.endMs)&&
      w.endMs>w.startMs&&w.startMs>=line.startMs&&w.endMs<=end&&
      (index===0||!finite(line.words![index-1].endMs)||line.words![index-1].endMs!<=w.startMs));
  const shortest=verifiedWords?line.words!.reduce((min,w)=>Math.min(min,w.endMs!-w.startMs),Infinity):Infinity;
  const fast=verifiedWords&&shortest<205;
  const longLine=line.text.length>55;
  const crowded=input.castCount>=3;
  const portrait=input.cameraFocus&&input.immersive;
  const strength=clamp(input.intensity,0,1);
  const plateOpacity=clamp(Math.max(clamp(input.existingPlateOpacity,0,1),
    ((input.immersive?.67:.56)+(portrait?.14:0)+(crowded?.09:0)+(longLine?.06:0))*(.88+.12*strength)),0,1);
  const mode=portrait?'portrait':fast?'fast-rap':input.hookConfirmed&&input.synchronized?'hook':'readable';
  const motionGain=input.reducedMotion?0:clamp(1-(fast?.32:0)-(portrait?.16:0)-(crowded?.11:0),.4,1);
  // Shorter genuine words receive shorter easing to avoid a sluggish color glow.
  // No timing information means NO word-specific transition is calculated.
  const wordTransitionMs=input.reducedMotion||!verifiedWords?0:
    Math.round(clamp(shortest*.38,45,175));
  return {active:true,plateOpacity,motionGain,wordTransitionMs,
    contrast:clamp((input.immersive?.55:.3)+(portrait?.16:0)+(crowded?.1:0),0,.85),
    mode,verifiedWords:!!verifiedWords};
}

export interface CinematicProjectionV873 {cue:LyricsProjectionCueV813;scale:number;reason:
  'off'|'disabled'|'unverified'|'manual'|'protected'|'enhanced';}
export function planCinematicProjectionV873(input:{
  base:LyricsProjectionCueV813;settings:ConcertFxSettingsV810;fx:ConcertFxCueV810;
  playing:boolean;reducedMotion:boolean;lyricsProtected:boolean;
  cameraCloseup:boolean;manualCamera:boolean;groupCount:number;
}):CinematicProjectionV873{
  const {base,settings:s,fx}=input;
  if(!base.active)return {cue:base,scale:1,reason:'off'};
  if(!s.cinematicLyricsV873||!s.enabled||!s.lyricsProjection)return {cue:base,scale:1,reason:'disabled'};
  if(!input.playing||!fx.active||fx.reason!=='music'||!finite(fx.phase)||
     !Number.isInteger(input.groupCount)||input.groupCount<1||input.groupCount>4)
    return {cue:{...base,active:false,opacity:0},scale:1,reason:'unverified'};
  if(input.manualCamera)return {cue:base,scale:1,reason:'manual'};
  const protectedView=input.lyricsProtected||input.cameraCloseup||input.groupCount>=3;
  if(input.reducedMotion)return {cue:base,scale:1,reason:'protected'};
  const hook=fx.section==='hook'||fx.section==='finale';
  // Only *existing* confirmed V813 hook text may grow, not a new lyric cue.
  // The optional cinema guard dims rather than attempts to move the main caption.
  const strength=clamp(s.cinematicLyricsStrengthV873,0,100)/100;
  const enabledScale=hook&&base.surface==='wall'&&!protectedView&&base.source!=='none';
  const scale=enabledScale?clamp(1+strength*clamp(s.hookProjectionSizeV873,0,100)/100*.3,1,1.3):1;
  const guard=s.lyricsCameraGuardV873&&protectedView;
  const targetOpacity=guard?base.opacity*(input.cameraCloseup?.5:input.groupCount>=3?.68:.78):
    base.opacity*(hook?1+.12*strength:1);
  const opacity=clamp(Math.min(base.opacity*(guard?1:1.12),targetOpacity),0,.23);
  return {cue:{...base,opacity,active:opacity>.002},scale,
    reason:guard?'protected':'enhanced'};
}
