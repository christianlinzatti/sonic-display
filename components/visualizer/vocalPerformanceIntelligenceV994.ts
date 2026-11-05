/**
 * V994 – Opt-in, evidence-bound vocal phrasing. This is a deterministic
 * performance refinement, NOT voice recognition, phoneme alignment or AI audio
 * inference. Reuses the existing V368/492 mouth, head and procedural renderers.
 * No timers, new animation mixers, canvases or sound recording.
 */
import type {DeutschrapFaceOptionsV538} from './deutschrapVocalPerformanceV538';
import type {FacialPoseV369} from './facialPerformanceV369';
import {rapLipWordAtV415} from './rapLipPrecisionV415';

export const VOCAL_KEY_V994='sonic.v994.vocal-performance';
export type VocalStyleV994='natural'|'rap-flow'|'stage';
export type VocalSettingsV994=Readonly<{
  enabled:boolean;style:VocalStyleV994;intensity:number;
  mouthTiming:boolean;phraseExpression:boolean;headAccents:boolean;
}>;
export const DEFAULT_VOCAL_V994:VocalSettingsV994=Object.freeze({
  enabled:false,style:'natural',intensity:55,
  mouthTiming:true,phraseExpression:true,headAccents:true,
});
export function normalizeVocalV994(value:unknown):VocalSettingsV994 {
 const v=value&&typeof value==='object'?value as Record<string,unknown>:{};
 return {enabled:v.enabled===true,
  style:v.style==='rap-flow'||v.style==='stage'?v.style:'natural',
  intensity:typeof v.intensity==='number'&&Number.isFinite(v.intensity)?
   Math.max(0,Math.min(100,Math.round(v.intensity))):DEFAULT_VOCAL_V994.intensity,
  mouthTiming:v.mouthTiming!==false,phraseExpression:v.phraseExpression!==false,
  headAccents:v.headAccents!==false};
}
export type VocalCueV994=Readonly<{
 active:boolean;mode:'connected'|'phrase-end'|'none';source:'verified-word'|'none';
 wordStartMs:number;gain:number;headPitch:number;brow:number;cheek:number;squint:number;
 jawAttack:number;jawRelease:number;vowelAttack:number;vowelRelease:number;
}>;
export const OFF_VOCAL_V994:VocalCueV994=Object.freeze({active:false,mode:'none',source:'none',
 wordStartMs:-1,gain:0,headPitch:0,brow:0,cheek:0,squint:0,
 jawAttack:1,jawRelease:1,vowelAttack:1,vowelRelease:1});
const clamp=(n:number)=>Number.isFinite(n)?Math.max(0,Math.min(1,n)):0;
const smooth=(n:number)=>{const x=clamp(n);return x*x*(3-2*x);};
const word=(s:string)=>s.trim().toLocaleLowerCase('de-DE').replace(/\s+/gu,' ');
const bilabial=(s:string)=>/^[^\p{L}]*[bmp]/iu.test(s);
export function planVocalPerformanceV994(input:DeutschrapFaceOptionsV538,{
 settings,trackId,activeTrackId,signalPlaying,signalEnabled,tier,
 face,protectedMouth=false,
}: {
 settings:VocalSettingsV994|undefined;trackId:string;activeTrackId:string;
 signalPlaying:boolean;signalEnabled:boolean;tier:'low'|'balanced'|'high';
 face:FacialPoseV369;protectedMouth?:boolean;
}):VocalCueV994 {
 const s=normalizeVocalV994(settings);
 if(!s.enabled||s.intensity<=0||tier==='low'||!trackId||activeTrackId!==trackId||
  !signalPlaying||!signalEnabled||!input.playing||!input.enabled||!input.rap||
  !input.verifiedWord||!input.roleAllowed||input.manualSilent||input.manualPriority||
  input.reducedMotion||input.preserveAudioMouth||protectedMouth||!input.lyrics?.synced||
  !input.activeWord?.trim()||!Number.isFinite(input.effectiveTimeMs)||input.effectiveTimeMs<0||
  !Number.isFinite(input.intensity)||input.intensity<=0||
  !Number.isFinite(face.lipsClosed)||face.lipsClosed>=.16)return OFF_VOCAL_V994;
 const mark=rapLipWordAtV415(input.lyrics,input.effectiveTimeMs);
 if(!mark||word(mark.word.text)!==word(input.activeWord)||
  input.editedWords?.some(e=>e.startMs===mark.start)||bilabial(mark.word.text)||
  mark.next&&mark.nextGap>=0&&mark.nextGap<=110&&bilabial(mark.next.text))return OFF_VOCAL_V994;
 const duration=mark.end-mark.start;
 if(!Number.isFinite(duration)||duration<90||duration>650)return OFF_VOCAL_V994;
 const before=Number.isFinite(mark.previousGap)&&mark.previousGap>=0&&mark.previousGap<=115;
 const after=!!mark.next&&Number.isFinite(mark.nextGap)&&mark.nextGap>=0&&mark.nextGap<=115;
 const phraseEnd=before&&Number.isFinite(mark.nextGap)&&mark.nextGap>=180;
 const mode=phraseEnd?'phrase-end':before||after?'connected':'none';
 if(mode==='none')return OFF_VOCAL_V994;
 const elapsed=input.effectiveTimeMs-mark.start;
 const remaining=mark.end-input.effectiveTimeMs;
 const envelope=smooth(elapsed/Math.min(100,duration*.3))*
   smooth(remaining/Math.min(140,duration*.38));
 const gain=clamp(envelope*clamp(input.intensity/100)*s.intensity/100*
  (tier==='balanced'?.70:1)*(s.style==='stage'?1.12:s.style==='rap-flow'?1.08:1));
 if(gain<=0)return OFF_VOCAL_V994;
 const mouth=s.mouthTiming?gain:0;
 const expression=s.phraseExpression?gain:0;
 const head=s.headAccents?gain:0;
 return {active:true,mode,source:'verified-word',wordStartMs:mark.start,gain,
  // All are small ADDITIVE accents; never modify the blink or mouth pose.
  brow:expression*(phraseEnd?.026:.014),cheek:expression*.021,
  squint:expression*.012,headPitch:head>0?head*(phraseEnd?-.012:.009):0,
  jawAttack:1+mouth*.075,jawRelease:1-(phraseEnd?mouth*.07:0),
  vowelAttack:1+mouth*.042,vowelRelease:1-(phraseEnd?mouth*.045:0)};
}
/** Modify only the existing mouth filter speed, never its target or closure. */
export function vocalRateV994(cue:VocalCueV994,channel:string,attacking:boolean):number {
 if(!cue.active)return 1;
 if(channel==='jaw')return attacking?cue.jawAttack:cue.jawRelease;
 if(channel==='wide'||channel==='round')return attacking?cue.vowelAttack:cue.vowelRelease;
 return 1;
}
/** Face gesture only: authored lip seals, teeth, visemes and blinks are preserved. */
export function addVocalFaceV994<T extends {face:FacialPoseV369}>(frame:T,cue:VocalCueV994):T {
 if(!cue.active||!cue.brow&&!cue.cheek&&!cue.squint)return frame;
 return {...frame,face:{...frame.face,brow:clamp(frame.face.brow+cue.brow),
  cheek:clamp(frame.face.cheek+cue.cheek),squint:clamp(frame.face.squint+cue.squint)}};
}
