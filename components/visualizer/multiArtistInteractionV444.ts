/** V444: restrained, additive per-slot interaction for the *automatic* V442 group.
 * Authored vocal assignments identify stage roles, NOT inferred acoustic speakers.
 * Outputs existing V144/V145 look/gesture cues; never edits GLB bones or clips. */
import type {GroupPoseV326} from './multiAvatarStageDirectorV326';
import type {LookAtCue} from './partnerLookAtEngine';
import type {PartnerGestureCue} from './partnerGestureEngine';

export type InteractionRoleV444='lead'|'reply'|'listener'|'ensemble';
export interface InteractionSingerV444 {
  active:boolean;leadSlot:number;singingSlots:readonly number[];
  handoffFrom:number|null;role?:string|null;phase?:number;
}
export interface InteractionSlotV444 {
  slot:number;role:InteractionRoleV444;look:LookAtCue;gesture:PartnerGestureCue;
}
export interface ArtistInteractionPlanV444 {
  enabled:boolean;source:'manual-vocal'|'visual-stage'|'none';
  group:boolean;lead:number|null;reply:number|null;slots:InteractionSlotV444[];
}
const clamp=(x:number,lo:number,hi:number)=>Number.isFinite(x)?Math.min(hi,Math.max(lo,x)):lo;
const neutralLook=():LookAtCue=>({yaw:0,pitch:0,eyeYaw:0,weight:0});
const neutralGesture=():PartnerGestureCue=>({leftLift:0,rightLift:0,shoulder:0,lean:0,intensity:0});
export function planMultiArtistInteractionV444(input:{
  pose:GroupPoseV326|null;count:number;enabled:boolean;playing:boolean;reducedMotion:boolean;
  manualStage:boolean;strength?:number;beat?:number;seconds?:number;cueAt?:number;
  singer?:InteractionSingerV444|null;audioChangePulse?:number;
}):ArtistInteractionPlanV444 {
  const empty:ArtistInteractionPlanV444={enabled:false,source:'none',group:false,lead:null,reply:null,slots:[]};
  const count=Number.isFinite(input.count)?Math.trunc(input.count):0;
  if(!input.enabled||!input.playing||input.reducedMotion||input.manualStage||
    !input.pose||count<3||count>4||input.pose.positions.length<count)return empty;
  const amount=clamp(input.strength??60,0,100)/100;
  if(amount<=0)return empty;
  const pose=input.pose;
  const manual=input.singer?.active===true&&Number.isInteger(input.singer.leadSlot)&&
    input.singer.leadSlot>=0&&input.singer.leadSlot<count?input.singer:null;
  const singing=manual?new Set(manual.singingSlots.filter(slot=>Number.isInteger(slot)&&slot>=0&&slot<count)):new Set<number>();
  const group=manual?(manual.role==='hook'||singing.size>1):Boolean(pose.drop||pose.focus<0);
  const lead=group?null:manual?manual.leadSlot:Math.trunc(clamp(pose.focus,0,count-1));
  // Author-provided handoffs are the ONLY evidence of a specific reply artist.
  // Without a role assignment, a subtle audience-facing gesture is merely visual staging.
  const reply=manual&&Number.isInteger(manual.handoffFrom)&&manual.handoffFrom!==null&&
    manual.handoffFrom>=0&&manual.handoffFrom<count&&manual.handoffFrom!==lead
    ?manual.handoffFrom:null;
  const beat=clamp(input.beat??0,0,1);
  const seconds=Math.max(0,Number.isFinite(input.seconds)?input.seconds!:0);
  const cueAt=Math.max(0,Number.isFinite(input.cueAt)?input.cueAt!:0);
  const phrase=((seconds-cueAt)/2.4%1+1)%1;
  const pulse=.35+.65*beat;
  const slots=Array.from({length:count},(_,slot):InteractionSlotV444=>{
    const role:InteractionRoleV444=group?'ensemble':slot===lead?'lead':slot===reply?'reply':'listener';
    const listen=role==='listener'||role==='reply';
    const partner=lead===null?null:pose.positions[lead];
    const self=pose.positions[slot];
    const dx=partner?partner[0]-self[0]:0;
    const dz=partner?partner[2]-self[2]:0;
    const angle=partner?Math.atan2(dx,Math.max(.7,2.4+dz)):0;
    // Head and eye attention are intentionally small. The existing V144 mixer smoothes both.
    const yaw=listen?clamp(angle,-.38,.38)*amount*.73:0;
    const pitch=role==='lead'?-Math.min(.05,.025+.025*beat)*amount:0;
    const look:LookAtCue={yaw,pitch,eyeYaw:yaw*.24,weight:listen?.66*amount:0};
    // One transient call, another response. No beat => tiny movement, not silence.
    const call=clamp(1-Math.abs(phrase-.2)/.19,0,1);
    const answer=clamp(1-Math.abs(phrase-.59)/.2,0,1);
    const signal=group?.48:role==='lead'?call:role==='reply'?answer:answer*.32;
    // V445: a weak spectral-change candidate can prompt a brief neutral response,
    // never a new singer/artist assignment or artificial lead-slot switch.
    const mixResponse=!manual&&!group&&role==='listener'?clamp(input.audioChangePulse??0,0,.45)*.22*amount:0;
    const lift=clamp(signal*pulse*amount+mixResponse,0,1);
    const gesture:PartnerGestureCue={
      leftLift:Math.min(.21,lift*(role==='reply'?.21:.16)),
      rightLift:Math.min(.24,lift*(role==='lead'?.23:.17)),
      shoulder:Math.min(.085,lift*.075),
      lean:clamp((role==='lead'?-.023:role==='reply'?.02:.009)*lift,-.035,.035),
      intensity:clamp(lift,0,.9),
    };
    return {slot,role,look,gesture};
  });
  return {enabled:true,source:manual?'manual-vocal':'visual-stage',group,lead,reply,slots};
}
