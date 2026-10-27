/** V527 – Cinematic Multi-Avatar Performance 2.0.
 * Read-only camera-facing *intent* and conservative gesture/look accents on top
 * of V517. Never writes singer identity, morphs, imported clips, camera, lyrics,
 * stage position, foot IK or animation mixer state. Visual lead != singer.
 */
import type { GroupPlanV517, VerifiedVocalCueV517, GroupRiskV517 } from './advancedGroupPerformanceV517';
import {cinematicFocusV527,type EnsembleFocusV527} from './cinematicSceneIntentV527';
export {cinematicFocusV527} from './cinematicSceneIntentV527';
export type {EnsembleFocusV527} from './cinematicSceneIntentV527';
import type { PartnerGestureCue } from './partnerGestureEngine';
import type { LookAtCue } from './partnerLookAtEngine';

export type PerformerStyleV527 = 'anchor'|'responder'|'groover'|'hype';
export interface MultiAvatarInputV527 {
  trackId?:string|null; cueTrackId?:string|null;
  count:number; seconds:number; progressMs:number; bpm?:number|null;
  playing:boolean; reducedMotion:boolean; manualPriority:boolean;
  tier:'low'|'balanced'|'high'; beat:number; energy:number;
  positions:readonly (readonly number[])[];
  cue?:VerifiedVocalCueV517|null; risks?:readonly (GroupRiskV517|undefined)[];
}
export type PerformerCueV527={slot:number;style:PerformerStyleV527;singing:boolean;
  gesture:PartnerGestureCue;look:LookAtCue;turnY:number;phase:number};
export type MultiAvatarPlanV527={active:boolean;focus:EnsembleFocusV527;
  source:'none'|'visual-only'|'authored-singer';lead:number;slots:PerformerCueV527[]};
const clamp=(v:number,lo:number,hi:number)=>Number.isFinite(v)?Math.max(lo,Math.min(hi,v)):lo;
const smooth=(x:number)=>{const n=clamp(x,0,1);return n*n*(3-2*n);};
const gestureZero=():PartnerGestureCue=>({leftLift:0,rightLift:0,shoulder:0,lean:0,intensity:0});
const lookZero=():LookAtCue=>({yaw:0,pitch:0,eyeYaw:0,weight:0});
const off=():MultiAvatarPlanV527=>({active:false,focus:'none',source:'none',lead:-1,slots:[]});
/** Stable across frames, seeks and renders; no pseudorandom jitter. */
export function performerStyleV527(trackId:string,slot:number):PerformerStyleV527 {
 let hash=2166136261;
 for(let i=0;i<trackId.length;i++){hash=Math.imul(hash^trackId.charCodeAt(i),16777619);}
 const styles:PerformerStyleV527[]=['anchor','responder','groover','hype'];
 return styles[((hash>>>0)+slot*3)%styles.length];
}
/** Broad 4–7s musical arcs; never per-syllable or per-word twitching. */
export function performerPhraseV527(seconds:number,period:number,offset:number):number {
 if(!Number.isFinite(seconds)||seconds<0||!Number.isFinite(period)||period<=0||!Number.isFinite(offset))return 0;
 const t=(((seconds/period-offset)%1)+1)%1;
 return smooth(t<.5?t*2:(1-t)*2);
}
export function planCinematicMultiAvatarV527(base:GroupPlanV517,input:MultiAvatarInputV527):MultiAvatarPlanV527 {
 const {count,trackId,cue,seconds,progressMs}=input;
 if(!base.active||base.slots.length!==count||base.lead<0||base.lead>=count||
    (base.source!=='visual-only'&&base.source!=='authored-singer')||
    !trackId?.trim()||!input.playing||input.reducedMotion||input.manualPriority||input.tier==='low'||
    !Number.isInteger(count)||count<2||count>4||!Number.isFinite(seconds)||seconds<0||
    !Number.isFinite(progressMs)||progressMs<0||!Number.isFinite(input.beat)||!Number.isFinite(input.energy)||
    input.positions.length<count||!input.positions.slice(0,count).every(p=>p?.length>=3&&p.slice(0,3).every(Number.isFinite)))return off();
 // Fail closed if the previously verified cast changes, becomes stale or
 // refers to another track. No inferred lyric attribution or cross-track cues.
 const authored=base.source==='authored-singer';
 if(authored&&(!cue?.active||input.cueTrackId!==trackId||cue.count!==count||
    cue.leadSlot!==base.lead||!cue.singingSlots.includes(base.lead)||
    cue.singingSlots.length===0||!cue.singingSlots.every(i=>Number.isInteger(i)&&i>=0&&i<count)||
    new Set(cue.singingSlots).size!==cue.singingSlots.length||
    !Number.isFinite(cue.startMs)||!Number.isFinite(cue.endMs)||cue.endMs<=cue.startMs||
    progressMs<cue.startMs||progressMs>=cue.endMs||
    (cue.role==='hook'&&cue.singingSlots.length!==count)))return off();
 if(!authored&&(cue?.active||count<3))return off();
 const lead=base.lead;
 const period=Number.isFinite(input.bpm)&&input.bpm!>0?clamp(480/(input.bpm as number),4,7):4.8;
 const scene=base.scene;
 const focus:EnsembleFocusV527=cinematicFocusV527(scene);
 const baseGain=(input.tier==='balanced'?.52:1)*(.26+.42*smooth(input.energy)+.32*smooth(input.beat));
 const fade=authored?smooth((progressMs-cue!.startMs)/450)*smooth((cue!.endMs-progressMs)/320):1;
 const cast=new Set(authored?cue!.singingSlots:[]);
 const secondsInCue=authored?(progressMs-cue!.startMs)/1000:seconds;
 const slots=Array.from({length:count},(_,slot):PerformerCueV527=>{
   const style=performerStyleV527(trackId,slot);
   const singing=authored&&cast.has(slot);
   const isLead=slot===lead;
   const relative=(slot-lead+count)%count;
   const offset=relative*.14+(style==='anchor'?.0:style==='responder'?.13:style==='groover'?.25:.36);
   const phrase=performerPhraseV527(secondsInCue,period,offset);
   const risk=input.risks?.[slot];
   const clearance=clamp(1-clamp(risk?.risk??0,0,1)*1.8,0,1)*
     clamp(risk?.gestureScale??1,0,1)*clamp(risk?.accentScale??1,0,1);
   // During an explicitly authored transfer, only the outgoing singer may
   // acknowledge the new lead – and only for the first ~900ms.
   const elapsed=authored?progressMs-cue!.startMs:Infinity;
   const outgoing=authored&&scene==='handoff'&&cue!.handoffFrom===slot&&slot!==lead;
   const reply=outgoing?smooth(elapsed/170)*smooth((900-elapsed)/370):0;
   const roleGain=scene==='hook'?(isLead?1:.65):
     isLead?1:singing?.70:style==='hype'?.53:style==='groover'?.44:.33;
   const amp=clamp(baseGain*fade*clearance*roleGain*Math.max(phrase*.75,reply*.85),0,.65);
   const dx=input.positions[lead][0]-input.positions[slot][0];
   const dz=input.positions[lead][2]-input.positions[slot][2];
   const separation=Math.hypot(dx,dz);
   const glancing=scene!=='hook'&&scene!=='drop'&&!isLead&&separation>=1&&separation<=5;
   const yaw=glancing?clamp(Math.atan2(dx,3+Math.abs(dz))*.084*amp,-.030,.030):0;
   const look:LookAtCue=glancing?{yaw,pitch:0,eyeYaw:yaw*.20,weight:clamp(amp*.085,0,.045)}:lookZero();
   const balance=style==='hype'?1.15:style==='groover'?.86:style==='responder'?.78:.58;
   const gesture:PartnerGestureCue={
     leftLift:clamp(amp*balance*(slot%2===0?.013:.005),0,.012),
     rightLift:clamp(amp*balance*(slot%2===1?.013:.005),0,.012),
     shoulder:clamp(amp*(scene==='hook'?.014:scene==='drop'?.012:.008),0,.011),
     lean:clamp(amp*(isLead?-.003:.002),-.002,.002),
     intensity:clamp(amp*.025,0,.018),
   };
   // User-authored casts never change stage roots. Only the visual-only
   // automatic group receives a few milliradians of harmless orientation.
   const turnY=base.source==='visual-only'?clamp(yaw*.22,-.007,.007):0;
   return {slot,style,singing,gesture,look,turnY,phase:phrase};
 });
 return {active:true,focus,source:base.source,lead,slots};
}
