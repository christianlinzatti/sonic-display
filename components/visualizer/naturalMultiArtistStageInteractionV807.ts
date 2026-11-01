/** V807 – Natural Multi-Artist Stage Interaction.
 * A phrase-bound, read-only choreography plan for the existing V144/V145
 * gaze and upper-body gesture overlays. Never assigns singers, moves stage
 * roots, alters GLB clips, vocal articulation, IK or manual timelines.
 */
import type {LookAtCue} from './partnerLookAtEngine';
import type {PartnerGestureCue} from './partnerGestureEngine';

/** Minimal singer evidence contract to keep this planner independently typechecked.
 * The runtime passes the existing V416/V496 cue with the same fields. */
export type VocalEvidenceV807={active:boolean;source:'none'|'line-timed'|'word-timed';
 style:'solo'|'reply'|'duet'|'hook'|null;lineIndex:number;leadSlot:number;
 partnerSlot:number|null;handoffFrom:number|null;singingSlots:readonly number[];
 emphasis:number;startMs:number;endMs:number;count:number};
export type StageInputV807={trackId?:string|null;cueTrackId?:string|null;
 cue:VocalEvidenceV807;progressMs:number;count:number;
 positions:readonly (readonly number[])[];playing:boolean;reducedMotion:boolean;
 manualPriority:boolean;beat:number;strength?:number;tier:'low'|'balanced'|'high'};
export type StageRoleV807='lead'|'partner'|'handoff'|'support'|'chorus';
export type StageAccentV807=Readonly<{
  slot:number;role:StageRoleV807;look:LookAtCue;gesture:PartnerGestureCue;
}>;
export type StageInteractionV807=Readonly<{
  active:boolean;reason:'verified-vocal'|'off';mode:'solo'|'duet'|'reply'|'hook'|'off';
  leadSlot:number|null;slots:readonly StageAccentV807[];
}>;
const clamp=(v:number,lo:number,hi:number)=>Math.max(lo,Math.min(hi,v));
const smooth=(v:number)=>{const x=clamp(v,0,1);return x*x*(3-2*x);};
const pulse=(t:number,c:number,w:number)=>smooth(1-Math.abs(t-c)/w);
const finite=(n:unknown):n is number=>typeof n==='number'&&Number.isFinite(n);
const zeroLook=():LookAtCue=>({yaw:0,pitch:0,eyeYaw:0,weight:0});
const zeroGesture=():PartnerGestureCue=>({leftLift:0,rightLift:0,shoulder:0,lean:0,intensity:0});
const OFF:StageInteractionV807=Object.freeze({active:false,reason:'off',mode:'off',leadSlot:null,slots:[]});
function motif(track:string,line:number,slot:number):number{
 let h=2166136261;
 for(let i=0;i<track.length;i++)h=Math.imul(h^track.charCodeAt(i),16777619);
 return ((h^Math.imul(line+17,193)^Math.imul(slot+3,521))>>>0)%4;
}
/** Must use an explicit V416/V496 song-bound cue and actual rig positions.
 * A Spotify feature credit, lyric guess, microphone spike or inferred visual
 * leader is NOT sufficient. The beat affects amplitude only, never timing.
 */
export function planNaturalMultiArtistStageV807(input:StageInputV807):StageInteractionV807{
 const {cue,count,positions,progressMs}=input;
 if(!input.playing||input.reducedMotion||input.manualPriority||input.tier==='low'||
    !input.trackId||input.trackId!==input.cueTrackId||input.trackId.length>180||
    !cue?.active||cue.source==='none'||!Number.isInteger(cue.lineIndex)||cue.lineIndex<0||
    (cue.style!=='solo'&&cue.style!=='reply'&&cue.style!=='duet'&&cue.style!=='hook')||
    !Number.isInteger(count)||count<2||count>4||cue.count!==count||
    !finite(progressMs)||!finite(cue.startMs)||!finite(cue.endMs)||
    cue.startMs<0||cue.endMs<=cue.startMs||progressMs<cue.startMs||progressMs>=cue.endMs||
    !Number.isInteger(cue.leadSlot)||cue.leadSlot<0||cue.leadSlot>=count||
    !Array.isArray(cue.singingSlots)||cue.singingSlots.length<1||cue.singingSlots.length>count||
    cue.singingSlots.some(s=>!Number.isInteger(s)||s<0||s>=count)||
    new Set(cue.singingSlots).size!==cue.singingSlots.length||!cue.singingSlots.includes(cue.leadSlot)||
    !Array.isArray(positions)||positions.length<count||
    positions.slice(0,count).some(p=>!p||p.length<3||!p.slice(0,3).every(finite))||
    !finite(input.beat)||!finite(input.strength??65)||
    (input.strength??65)<=0||(input.strength??65)>100||
    !finite(cue.emphasis)||cue.emphasis<0||cue.emphasis>1||
    (cue.style==='hook'&&cue.singingSlots.length!==count)||
    (cue.style==='solo'&&cue.singingSlots.length!==1)||
    (cue.style==='duet'&&(cue.singingSlots.length!==2||cue.partnerSlot===null||
      !Number.isInteger(cue.partnerSlot)||cue.partnerSlot===cue.leadSlot||!cue.singingSlots.includes(cue.partnerSlot)))||
    (cue.handoffFrom!==null&&(!Number.isInteger(cue.handoffFrom)||cue.handoffFrom<0||
      cue.handoffFrom>=count||cue.handoffFrom===cue.leadSlot)))return OFF;
 const envelope=smooth((progressMs-cue.startMs)/340)*smooth((cue.endMs-progressMs)/340);
 const gain=envelope*(input.strength??65)/100*(input.tier==='balanced'?.6:1);
 if(gain<=.000001)return OFF;
 const singing=new Set(cue.singingSlots);
 const elapsed=progressMs-cue.startMs;
 const phase=((elapsed%2650)+2650)%2650/2650;
 const beat=clamp(input.beat,0,1);
 const slots=Array.from({length:count},(_,slot):StageAccentV807=>{
   const role:StageRoleV807=cue.style==='hook'?'chorus':
     cue.style==='reply'&&slot===cue.handoffFrom?'handoff':
     slot===cue.leadSlot?'lead':cue.style==='duet'&&singing.has(slot)?'partner':'support';
   const variant=motif(input.trackId!,cue.lineIndex,slot);
   // All hook singers share an onset, with tiny, stable differences in pose.
   // Replies alternate at a later phrase accent; listeners remain understated.
   const at=role==='chorus'?.27:role==='lead'?.20:role==='partner'?.59:
     role==='handoff'?.69:.76+(variant%2)*.06;
   const p=pulse(phase,at,role==='chorus'?.23:.19);
   const emphasis=(.28+.72*beat)*(.65+.35*cue.emphasis);
   const roleGain=role==='chorus'?.75:role==='lead'?.9:role==='partner'?.75:
     role==='handoff'?.56:.28;
   const amplitude=clamp(p*emphasis*roleGain*gain,0,.72);
   const leftBias=variant%2===0;
   const gesture:PartnerGestureCue={
     leftLift:amplitude*(leftBias?.035:.018),
     rightLift:amplitude*(leftBias?.018:.035),
     shoulder:amplitude*.014,
     lean:role==='lead'?-amplitude*.005:amplitude*.003,
     intensity:amplitude*.075,
   };
   // Mutual gaze is brief, modest and based only on authored role + measured
   // stage coordinates. Hooks face the audience; no false partner attention.
   const target=role==='partner'?cue.leadSlot:
     role==='lead'&&cue.style==='duet'?cue.partnerSlot:
     role==='support'||role==='handoff'?cue.leadSlot:null;
   let look=zeroLook();
   if(target!==null&&target!==slot){
     const a=positions[slot],b=positions[target!];
     const dx=b[0]-a[0],dz=b[2]-a[2],distance=Math.hypot(dx,dz);
     if(distance>=.95&&distance<=5.5){
       const glance=pulse(phase,role==='lead'?.56:role==='partner'?.22:.64,.16);
       const strength=glance*gain*(role==='support'?.12:.22);
       const yaw=clamp(Math.atan2(dx,Math.max(1.6,3+dz)),-.38,.38)*strength;
       look={yaw,pitch:0,eyeYaw:yaw*.22,weight:strength*.28};
     }
   }
   return {slot,role,gesture,look};
 });
 return {active:true,reason:'verified-vocal',mode:cue.style,leadSlot:cue.leadSlot,slots};
}
