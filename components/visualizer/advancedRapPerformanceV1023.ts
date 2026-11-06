/** V1023 – Advanced Rap Performance 6.0.
 * Two restrained additive refiners on existing trusted lyric/performer cues.
 * No singer recognition, phoneme inference, new mouth targets, authored clip
 * rewriting, foot IK changes, storage, network or device operations.
 */
import type {VocalDanceAccentV472,AuthoredVocalCastV472} from './vocalAwareChoreographyV472';

type Word={text:string;startMs:number;endMs?:number|null};
type Line={startMs:number;endMs?:number|null;words?:readonly Word[]};
export type RapEvidenceV1023={synced:boolean;lines:readonly Line[]};
export type RapPerformanceInputV1023={
 lyrics?:RapEvidenceV1023|null;trackId?:string|null;effectiveTimeMs:number;
 playing:boolean;rap:boolean;reducedMotion:boolean;authored:boolean;
 enabled:boolean;slot:number;count:number;section?:string|null;
 casting?:AuthoredVocalCastV472|null;tier:'low'|'balanced'|'high';
};
export type RapGestureV1023={accent:VocalDanceAccentV472;active:boolean;
 evidence:'timed-word'|'none';style:'steady'|'compact'|'open'|'counter';
 /** Additive-only upper-body gains; all other fields and ownership preserved. */
};
const bounded=(v:number,a:number,b:number)=>Number.isFinite(v)?Math.max(a,Math.min(b,v)):a;
const ease=(t:number)=>{const x=bounded(t,0,1);return x*x*(3-2*x);};
const MOTIFS=['steady','compact','open','counter'] as const;
function off(accent:VocalDanceAccentV472):RapGestureV1023{
 return {accent,active:false,evidence:'none',style:'steady'};
}
/** Must be driven by the same singer/word decision already accepted by V472. */
export function refineAdvancedRapGestureV1023(base:VocalDanceAccentV472,input:RapPerformanceInputV1023):RapGestureV1023{
 if(!base.active||base.source!=='word'||base.confidence!=='lyrics-word'||base.role==='background'||
  !input.playing||!input.rap||!input.enabled||input.reducedMotion||input.authored||input.tier==='low'||
  !input.trackId?.trim()||!input.lyrics?.synced||!Number.isFinite(input.effectiveTimeMs)||
  !Number.isInteger(input.slot)||input.slot<0||input.slot>3||!Number.isInteger(input.count)||
  input.count<1||input.count>4||input.slot>=input.count||input.section==='break')return off(base);
 if(input.count>1&&!(input.casting?.active&&input.casting.lineIndex===base.lineIndex&&
  input.casting.singingSlots.includes(input.slot)))return off(base);
 const line=input.lyrics.lines[base.lineIndex];
 const words=line?.words;
 if(!line||!words||!Number.isInteger(base.wordIndex)||base.wordIndex<0||base.wordIndex>=Math.min(words.length,120))return off(base);
 const word=words[base.wordIndex],next=words[base.wordIndex+1],time=input.effectiveTimeMs;
 if(!word?.text?.trim()||!Number.isFinite(line.startMs)||!Number.isFinite(word.startMs)||
  word.startMs<line.startMs)return off(base);
 const nextStart=next&&Number.isFinite(next.startMs)&&next.startMs>word.startMs?next.startMs:Infinity;
 const lineEnd=line.endMs!=null&&Number.isFinite(line.endMs)&&line.endMs>line.startMs?line.endMs:Infinity;
 const end=Math.min(word.endMs!=null&&Number.isFinite(word.endMs)&&word.endMs>word.startMs?word.endMs:Infinity,
  nextStart,lineEnd,line.startMs+15000,word.startMs+1400);
 const duration=end-word.startMs;
 if(duration<80||duration>1300||time<word.startMs||time>=end)return off(base);
 // The same line always picks the same gesture palette, avoiding word-by-word jitter.
 let seed=2166136261;
 for(let i=0;i<Math.min(input.trackId.length,96);i++)seed=Math.imul(seed^input.trackId.charCodeAt(i),16777619);
 const style=MOTIFS[((seed>>>0)+base.lineIndex*3+input.slot)%MOTIFS.length];
 const wordAttack=ease((time-word.startMs)/Math.min(150,duration*.40));
 const wordRelease=ease((end-time)/Math.min(175,duration*.40));
 const lineFade=ease((time-line.startMs)/260)*ease((lineEnd-time)/260);
 const strength=wordAttack*wordRelease*lineFade*(input.tier==='balanced'?.68:1);
 // Rapid words intentionally compress arm motion, while head/chest gently flow.
 const dense=duration<265||(nextStart-word.startMs<265);
 const profile=style==='compact'?.92:style==='open'?1.06:style==='counter'?.985:1.01;
 const armScale=1+((dense?.88:profile)-1)*strength;
 const chestScale=1+((style==='counter'?1.045:1.025)-1)*strength;
 const headScale=1+((dense?.95:1.035)-1)*strength;
 return {active:true,evidence:'timed-word',style,accent:{...base,
  head:bounded(base.head*headScale,0,.055),chest:bounded(base.chest*chestScale,0,.09),
  arms:bounded(base.arms*armScale,0,.11)}};
}

/** Existing V837 cue is the *only* source of the valid vocal window.
 * V1023 changes response speed a little, not jaw/morph/viseme targets.
 * The established V837/V415 B/P/M seal still owns lipsClosed.
 */
export type RapMouthEvidenceV1023={active:boolean;source:'verified-timed-word'|'none';
 mode:string;wordStartMs:number;wordEndMs:number;onset:number;release:number};
export type RapMouthContextV1023={playing:boolean;rap:boolean;verifiedSinger:boolean;
 manualPriority:boolean;protectedMouth:boolean;reducedMotion:boolean;
 tier:'low'|'balanced'|'high';effectiveTimeMs:number};
export function rapMouthResponseV1023(cue:RapMouthEvidenceV1023,context:RapMouthContextV1023,
 channel:string,current:number,target:number):number{
 if(!cue.active||cue.source!=='verified-timed-word'||!context.playing||!context.rap||
  !context.verifiedSinger||context.manualPriority||context.protectedMouth||context.reducedMotion||
  context.tier==='low'||!Number.isFinite(context.effectiveTimeMs)||
  context.effectiveTimeMs<cue.wordStartMs||context.effectiveTimeMs>=cue.wordEndMs||
  !Number.isFinite(current)||!Number.isFinite(target)||Math.abs(current-target)<.00001||
  !['jaw','round','wide'].includes(channel))return 1;
 const attack=bounded(cue.onset,0,1),release=bounded(cue.release,0,1);
 // Attack is a little crisper; release is calmer to prevent chattering.
 const tierGain=context.tier==='balanced'?.65:1;
 return bounded(1+(target>current?attack*.085:-release*.055)*tierGain,.945,1.085);
}
