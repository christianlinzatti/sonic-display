/**
 * V586 – Natural Concert Performance 4.0.
 * A song-time, verified-word finishing pass shared by GLB and procedural avatars.
 * Keeps V472 casting, V583 dynamics, V564 body pose and V515 smoothing authoritative.
 * Adds NO independent beat clock, choreography clip, solver, render loop or joint offset.
 */
import type {VocalDanceAccentV472} from './vocalAwareChoreographyV472';
import type {RapBodyPoseV564} from './naturalDeutschrapBodyV564';
import type {RapDynamicsModeV583} from './rapPerformanceDynamicsV583';

type WordV586={text:string;startMs:number;endMs?:number|null};
type LineV586={startMs:number;endMs?:number|null;words?:readonly WordV586[]};
export type NaturalConcertInputV586={
  lyrics?:{synced:boolean;lines:readonly LineV586[]}|null;
  timeMs:number; trackId?:string|null; slot:number; count:number;
  playing:boolean;rap:boolean;reducedMotion:boolean;authored:boolean;
  enabled:boolean;tier:'low'|'balanced'|'high'; mode:RapDynamicsModeV583;
};
export type ConcertPerformanceV586=Readonly<{
  active:boolean;accent:VocalDanceAccentV472;pose:RapBodyPoseV564|null;
  phraseBlend:number;counterMotion:number;reason:'verified-word'|'not-applicable';
}>;
const clamp=(n:number,min:number,max:number)=>Number.isFinite(n)?Math.min(max,Math.max(min,n)):min;
const smooth=(n:number)=>{const x=clamp(n,0,1);return x*x*(3-2*x);};
function inactive(accent:VocalDanceAccentV472,pose:RapBodyPoseV564|null):ConcertPerformanceV586{
 return {active:false,accent,pose,phraseBlend:0,counterMotion:0,reason:'not-applicable'};
}
/**
 * A phrase envelope independent of animation frame cadence. Seeking to the same
 * lyric time produces the same target. Existing renderer smoothing controls arrival.
 */
export function refineNaturalConcertPerformanceV586(
 accent:VocalDanceAccentV472,basePose:RapBodyPoseV564|null,input:NaturalConcertInputV586,
):ConcertPerformanceV586{
 if(!accent.active||accent.role==='background'||accent.source!=='word'||accent.confidence!=='lyrics-word'||
    !input.enabled||!input.playing||!input.rap||input.reducedMotion||input.authored||input.tier==='low'||
    !input.trackId?.trim()||!input.lyrics?.synced||!Number.isFinite(input.timeMs)||
    !Number.isSafeInteger(input.slot)||!Number.isSafeInteger(input.count)||input.count<1||input.count>4||
    input.slot<0||input.slot>=input.count||!Number.isSafeInteger(accent.lineIndex)||
    !Number.isSafeInteger(accent.wordIndex)||accent.wordIndex<0||
    input.mode==='off'||input.mode==='adlib-text')return inactive(accent,basePose);
 // A feature song cannot turn an unassigned background/general performer into a lead.
 if(input.count>1&&accent.role==='general')return inactive(accent,basePose);
 const line=input.lyrics.lines[accent.lineIndex];
 const word=line?.words?.[accent.wordIndex];
 const next=input.lyrics.lines[accent.lineIndex+1]?.startMs??Infinity;
 if(!line||!word?.text?.trim()||!Number.isFinite(line.startMs)||!Number.isFinite(word.startMs)||
    word.startMs<line.startMs||word.startMs>input.timeMs)return inactive(accent,basePose);
 const end=Math.min(line.endMs!=null&&Number.isFinite(line.endMs)&&line.endMs>line.startMs?line.endMs:Infinity,
    next,line.startMs+15000);
 const wordEnd=Math.min(word.endMs!=null&&Number.isFinite(word.endMs)&&word.endMs>word.startMs?word.endMs:word.startMs+650,
    line.words?.[accent.wordIndex+1]?.startMs??Infinity,end);
 if(!Number.isFinite(end)||end<=line.startMs||input.timeMs>=end||wordEnd<=word.startMs||
    input.timeMs>=wordEnd)return inactive(accent,basePose);
 const len=end-line.startMs;
 // Gentle entry and exit to prevent the first/last rap word from snapping the shoulders.
 const phraseBlend=smooth((input.timeMs-line.startMs)/320)*smooth((end-input.timeMs)/360);
 if(phraseBlend<=0)return inactive(accent,basePose);
 const wordBlend=smooth((input.timeMs-word.startMs)/80)*smooth((wordEnd-input.timeMs)/105);
 const tier=input.tier==='balanced'?.58:1;
 const modeGain=input.mode==='hook'?1.05:input.mode==='dense'?.62:
   input.mode==='flow-transition'?.76:input.mode==='relaxed'?.83:1;
 const gain=tier*modeGain*phraseBlend*(.70+.30*wordBlend)*clamp(accent.arms/.07,0,1);
 const sign=((accent.lineIndex+input.slot)%2===0?1:-1)*(accent.side<0?-1:1);
 // This is slow phrase follow-through, NOT synthetic beat or word-stress estimation.
 const phrasePosition=clamp((input.timeMs-line.startMs)/Math.max(len,1),0,1);
 const counterMotion=sign*Math.sin(phrasePosition*Math.PI*2+input.slot*.29)*gain;
 const previous=basePose??{active:false,headPitch:0,headYaw:0,torsoLean:0,armSwing:0};
 const pose:RapBodyPoseV564={
   active:true,
   headPitch:clamp(previous.headPitch,-.023,.023),
   headYaw:clamp(previous.headYaw+counterMotion*.0035,-.017,.017),
   torsoLean:clamp(previous.torsoLean-counterMotion*.0055,-.024,.024),
   armSwing:clamp(previous.armSwing+counterMotion*.007,-.019,.019),
 };
 // Dampen dense rap hand flapping but keep longer hook gestures expressive.
 const armMultiplier=1+(input.mode==='dense'?-.075:input.mode==='hook'?.045:.01)*gain;
 const chestMultiplier=1+.024*gain;
 return {active:true,accent:{...accent,arms:clamp(accent.arms*armMultiplier,0,.11),
   chest:clamp(accent.chest*chestMultiplier,0,.09)},pose,phraseBlend,
   counterMotion,reason:'verified-word'};
}
