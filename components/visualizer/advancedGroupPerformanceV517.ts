/** V517 – Advanced Group Performance Director.
 * Choreographed supporting reactions for automatic 3/4-person ensembles OR
 * a track-matched explicitly assigned 2–4-person vocal cast. A visual lead is
 * never treated as vocal evidence. This read-only planner never touches mixer
 * clips, GLB bones, singer assignments, stage/root travel or hand/foot IK.
 */
import type {FormationPlanV495} from './multiAvatarFormationDirectorV495';
import type {PartnerGestureCue} from './partnerGestureEngine';
import type {LookAtCue} from './partnerLookAtEngine';

export type GroupSceneV517='off'|'verse'|'feature'|'handoff'|'hook'|'drop';
export type GroupRoleV517='lead'|'feature'|'chorus'|'support'|'background';
export type GroupSlotV517={slot:number;role:GroupRoleV517;gesture:PartnerGestureCue;look:LookAtCue;turnY:number;phase:number};
export type GroupPlanV517={active:boolean;source:'none'|'authored-singer'|'visual-only';scene:GroupSceneV517;lead:number;slots:GroupSlotV517[]};
export type GroupRiskV517={risk:number;gestureScale:number;accentScale:number};
/** Narrow structural view of an already-resolved, track-bound manual cast. */
export type VerifiedVocalCueV517={active:boolean;role:'lead'|'feature'|'hook'|null;leadSlot:number;
 singingSlots:readonly number[];startMs:number;endMs:number;handoffFrom:number|null;count:number};
export interface GroupInputV517 {
 count:number;trackId?:string|null;cueTrackId?:string|null;
 seconds:number;progressMs:number;bpm?:number|null;positions:readonly (readonly number[])[];
 playing:boolean;reducedMotion:boolean;manualPriority:boolean;
 tier:'low'|'balanced'|'high';beat:number;energy:number;section?:string|null;
 /** Manual V385 or track-verified V416/V496 casting only. */
 cue?:VerifiedVocalCueV517|null;
 /** V495 visual formation only. Never used as proof of a vocalist. */
 formation?:FormationPlanV495|null;
 risks?:readonly (GroupRiskV517|undefined)[];
}
const clamp=(v:number,a:number,b:number)=>Number.isFinite(v)?Math.max(a,Math.min(b,v)):a;
const smooth=(v:number)=>{const t=clamp(v,0,1);return t*t*(3-2*t);};
const zeroLook=():LookAtCue=>({yaw:0,pitch:0,eyeYaw:0,weight:0});
const zeroGesture=():PartnerGestureCue=>({leftLift:0,rightLift:0,shoulder:0,lean:0,intensity:0});
const off=():GroupPlanV517=>({active:false,source:'none',scene:'off',lead:-1,slots:[]});
const positionOK=(p:readonly number[]|undefined)=>!!p&&p.length>=3&&p.slice(0,3).every(Number.isFinite);
/** One slow coordinated arc with different actor offsets – never word jitter. */
export function groupPhrasePulseV517(time:number,period:number,offset:number):number{
 if(!Number.isFinite(time)||time<0||!Number.isFinite(period)||period<=0||!Number.isFinite(offset))return 0;
 const phase=(((time/period-offset)%1)+1)%1;
 return smooth(phase<.5?phase*2:2-phase*2);
}
export function planAdvancedGroupV517(input:GroupInputV517):GroupPlanV517{
 const {count,trackId,seconds,progressMs,positions,cue}=input;
 if(!trackId?.trim()||!input.playing||input.reducedMotion||input.manualPriority||input.tier==='low'||
    !Number.isInteger(count)||count<2||count>4||positions.length<count||
    !positions.slice(0,count).every(positionOK)||!Number.isFinite(seconds)||seconds<0||
    !Number.isFinite(progressMs)||progressMs<0||!Number.isFinite(input.beat)||!Number.isFinite(input.energy))return off();
 // An active but unverified singer cue MUST NOT silently fall back to the
 // automatic visual lead. A manual/explicit identity always takes precedence.
 const hasCast=!!cue?.active;
 const verified=hasCast&&!!input.cueTrackId&&input.cueTrackId===trackId&&
    cue!.count===count&&Number.isInteger(cue!.leadSlot)&&cue!.leadSlot>=0&&cue!.leadSlot<count&&
    Number.isFinite(cue!.startMs)&&Number.isFinite(cue!.endMs)&&
    cue!.endMs>cue!.startMs&&progressMs>=cue!.startMs&&progressMs<cue!.endMs&&
    Array.isArray(cue!.singingSlots)&&cue!.singingSlots.length>0&&
    cue!.singingSlots.every(i=>Number.isInteger(i)&&i>=0&&i<count)&&
    new Set(cue!.singingSlots).size===cue!.singingSlots.length&&
    cue!.singingSlots.includes(cue!.leadSlot)&&
    (cue!.role==='hook'||cue!.role==='lead'||cue!.role==='feature')&&
    (cue!.role!=='hook'||cue!.singingSlots.length===count);
 if(hasCast&&!verified)return off();
 const formation=input.formation;
 const visual=!hasCast&&count>=3&&!!formation?.active&&formation.slots.length===count&&
    Number.isInteger(formation.lead)&&formation.lead>=0&&formation.lead<count;
 if(!verified&&!visual)return off();
 const lead=verified?cue!.leadSlot:formation!.lead;
 const singers=verified?new Set(cue!.singingSlots):new Set<number>();
 const section=(input.section??'').toLowerCase();
 const scene:GroupSceneV517=verified?
    cue!.role==='hook'?'hook':cue!.handoffFrom!==null?'handoff':cue!.role==='feature'?'feature':'verse':
    formation!.moment==='drop'||section.includes('drop')?'drop':
    formation!.moment==='hook'||section.includes('hook')||section.includes('chorus')?'hook':'verse';
 const period=Number.isFinite(input.bpm)&&input.bpm!>0?clamp(480/(input.bpm as number),3.4,6.4):4.5;
 const gain=(input.tier==='balanced'?.55:1)*(.32+.37*smooth(input.energy)+.31*smooth(input.beat));
 const entering=verified?smooth((progressMs-cue!.startMs)/460):1;
 const leaving=verified?smooth((cue!.endMs-progressMs)/320):1;
 const authoredFade=entering*leaving;
 const slots=Array.from({length:count},(_,slot):GroupSlotV517=>{
   const singing=singers.has(slot),isLead=slot===lead;
   const role:GroupRoleV517=verified?
     (scene==='hook'?'chorus':singing?(isLead?'lead':'feature'): 'support'):
     (isLead?'lead':(slot-lead+count)%count===1?'support':'background');
   const relative=(slot-lead+count)%count;
   const elapsed=verified?(progressMs-cue!.startMs)/1000:seconds;
   const phase=groupPhrasePulseV517(elapsed,period,relative*.17+(scene==='hook'?.04:.12));
   const risk=input.risks?.[slot];
   const clearance=clamp(1-clamp(risk?.risk??0,0,1)*1.6,0,1)*
     clamp(risk?.gestureScale??1,0,1)*clamp(risk?.accentScale??1,0,1);
   // The outgoing singer alone may acknowledge an authored handoff in the
   // first 800 ms; its motion is not interpreted as new singing evidence.
   const outgoing=verified&&cue!.handoffFrom===slot&&slot!==lead&&scene==='handoff';
   const reply=outgoing?smooth((progressMs-cue!.startMs)/150)*
       smooth((850-(progressMs-cue!.startMs))/360):0;
   const response=Math.max(phase,reply*.7);
   const roleGain=scene==='hook'?(isLead?1:.82):
       role==='lead'?1:role==='feature'?.77:role==='support'?.49:.32;
   const power=gain*authoredFade*clearance*response*roleGain;
   const dx=positions[lead][0]-positions[slot][0];
   const dz=positions[lead][2]-positions[slot][2];
   const distance=Math.hypot(dx,dz);
   // On choruses everyone faces front. During verses only visible support
   // actors glance toward the actual cast/visual lead; never an unknown singer.
   const glance=scene!=='hook'&&scene!=='drop'&&!isLead&&distance>=.85&&distance<=5.5;
   const yaw=glance?clamp(Math.atan2(dx,Math.max(2,3+dz))*.12*power,-.065,.065):0;
   const look:LookAtCue=glance?{yaw,pitch:0,eyeYaw:yaw*.19,weight:clamp(power*.095,0,.09)}:zeroLook();
   const gesture:PartnerGestureCue={
     leftLift:clamp((slot%2===0?.023:.009)*power,0,.024),
     rightLift:clamp((slot%2===1?.023:.009)*power,0,.024),
     shoulder:clamp((scene==='hook'||scene==='drop'?.018:.010)*power,0,.019),
     lean:clamp((singing||!verified&&isLead?-.004:.003)*power,-.004,.004),
     intensity:clamp(.045*power,0,.045),
   };
   // Optional *visual* 3/4-person yaw – no positions, no duo roots, no
   // rotation change for user-authored singer casting.
   const turnY=visual&&glance?clamp(yaw*.44,-.029,.029):0;
   return {slot,role,look,gesture,turnY,phase};
 });
 return {active:true,source:verified?'authored-singer':'visual-only',scene,lead,slots};
}
