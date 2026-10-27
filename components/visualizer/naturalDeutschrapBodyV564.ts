/** V564: restrained additive rap body accents for existing timestamped vocal cues.
 * No vocal recognition or phoneme inference, no modification of GLB clips.
 */
import type {VocalDanceAccentV472,AuthoredVocalCastV472} from './vocalAwareChoreographyV472';

type TimedLyrics={synced:boolean;lines:readonly {startMs:number;endMs?:number|null;words?:readonly {text:string;startMs:number;endMs?:number|null}[]}[]};
export type RapBodyPoseV564=Readonly<{active:boolean;headPitch:number;headYaw:number;torsoLean:number;armSwing:number}>;
const noPose:RapBodyPoseV564=Object.freeze({active:false,headPitch:0,headYaw:0,torsoLean:0,armSwing:0});
const bound=(n:number,lo:number,hi:number)=>Number.isFinite(n)?Math.max(lo,Math.min(hi,n)):lo;
const ease=(t:number)=>{const x=bound(t,0,1);return x*x*(3-2*x);};
export function refineNaturalDeutschrapBodyV564(base:VocalDanceAccentV472,input:{
 lyrics?:TimedLyrics|null;effectiveTimeMs:number;playing:boolean;reducedMotion:boolean;rap:boolean;
 enabled:boolean;authored:boolean;section?:string|null;trackId?:string|null;slot:number;count:number;
 casting?:AuthoredVocalCastV472|null;intensity?:number;beatStrength?:number;
}):{accent:VocalDanceAccentV472;pose:RapBodyPoseV564;reason:string}{
 const off=(reason:string)=>({accent:base,pose:noPose,reason});
 if(!base.active||base.source!=='word'||base.confidence!=='lyrics-word'||base.role==='background')return off('Keine bestätigte Wort-Geste');
 if(!input.enabled||!input.playing||input.reducedMotion||input.authored||!input.rap)return off('Bewegungspriorität oder Pause');
 if(!input.trackId?.trim()||!Number.isInteger(input.slot)||!Number.isInteger(input.count)||input.count<1||input.count>4||input.slot<0||input.slot>=input.count)return off('Track/Slot fehlt');
 if(input.count>1&&!(input.casting?.active&&input.casting.lineIndex===base.lineIndex&&input.casting.singingSlots.includes(input.slot)))return off('Kein bestätigter Sänger');
 const line=input.lyrics?.synced?input.lyrics.lines[base.lineIndex]:null;
 const word=line?.words?.[base.wordIndex];
 const t=input.effectiveTimeMs;
 if(!word||!Number.isFinite(t)||!Number.isFinite(word.startMs)||t<word.startMs||!word.text.trim())return off('Keine gültige Wortmarke');
 const upcoming=line?.words?.[base.wordIndex+1];
 const end=Math.min(word.endMs!=null&&Number.isFinite(word.endMs)&&word.endMs>word.startMs?word.endMs:word.startMs+650,
   upcoming&&Number.isFinite(upcoming.startMs)&&upcoming.startMs>word.startMs?upcoming.startMs:Infinity,
   line?.endMs!=null&&Number.isFinite(line.endMs)&&line.endMs>word.startMs?line.endMs:Infinity);
 const duration=end-word.startMs;
 if(duration<65||duration>1250||t>=end)return off('Außerhalb Wortfenster');
 const intensity=bound(input.intensity??.7,0,1);
 if(intensity<=0)return off('Intensität aus');
 const hook=['hook','chorus','drop'].includes(input.section??'');
 // The body follows longer lyric phrases; ultra-short words are intentionally soft.
 const dense=duration<280||(base.wordIndex>0&&word.startMs-(line!.words![base.wordIndex-1]?.startMs??-Infinity)<250);
 const phase=(t-word.startMs)/duration;
 const envelope=ease(phase/.26)*ease((1-phase)/.33);
 const gain=intensity*envelope*(dense?.55:1)*(hook?1.12:.84);
 const beat=bound(input.beatStrength??0,0,1); // optional REAL audio, never creates a beat on its own
 const beatAssist=1+beat*.12;
 const sign=(input.slot%2===0?1:-1)*(base.side<0?-1:1);
 const headPitch=bound(base.head*gain*beatAssist*.40,-.022,.022);
 const headYaw=bound(sign*base.head*gain*.25,-.013,.013);
 const torsoLean=bound(sign*base.chest*gain*.24,-.020,.020);
 const armSwing=bound(sign*base.arms*gain*.17,-.016,.016);
 const accent={...base,head:bound(base.head*(dense?.88:1.04),0,.055),
  chest:bound(base.chest*(dense?.94:1.025),0,.09),arms:bound(base.arms*(dense?.83:hook?1.06:.98),0,.11)};
 return {accent,pose:{active:true,headPitch,headYaw,torsoLean,armSwing},reason:dense?'Dichte Rap-Passage: weich':'Wortbasierte Rap-Geste'};
}

/** Clearly labelled synthetic demo. NEVER passed to real-song casting or lyric engines. */
export function sampleDeutschrapDemoBodyV564(elapsedSeconds:number,input:{playing:boolean;reducedMotion:boolean;enabled:boolean;voiceActive:boolean;slot:number;hook:boolean;intensity?:number}):RapBodyPoseV564{
 if(!input.playing||input.reducedMotion||!input.enabled||!input.voiceActive||!Number.isFinite(elapsedSeconds))return noPose;
 const strength=bound(input.intensity??.65,0,1);
 if(!strength)return noPose;
 const seconds=Math.max(0,elapsedSeconds);
 // Slow two-beat head movement and gentle alternating arm motion; NO artificial voice detection.
 // The V370 Rap mouth demo uses 4.1 syllable pulses/s. Share its *synthetic*
 // phase for a subtle head emphasis, not a fake voice/word measurement.
 const mouthPhase=(seconds*4.1)%1;
 const mouthPulse=Math.max(0,Math.sin(mouthPhase*Math.PI));
 const slow=Math.sin(seconds*3.4+input.slot*.28);
 const phrase=.5+.5*Math.sin(seconds*1.13+.3);
 const gain=strength*(input.hook?.9:.68);
 const sign=input.slot%2?-1:1;
 return {active:true,headPitch:(.008+.008*slow+.003*mouthPulse)*gain,headYaw:sign*.008*phrase*gain,
  torsoLean:sign*.012*Math.sin(seconds*1.7)*gain,armSwing:sign*.013*Math.sin(seconds*2.3)*gain};
}
