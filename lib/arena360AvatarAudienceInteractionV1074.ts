/** V1074 · Avatar & Audience Interaction 2.0
 * Deterministic, opt-in upper-body cue shared by the existing avatar and audience
 * renderers. The authored show plan is NOT vocal/applause detection. We never
 * write animation clips, roots, feet, device commands, audio or scene timers.
 */
import type {ArenaShowCueV1040,ArenaShowSceneV1040} from './arena360ShowDesignerV1040';

export type AudienceGestureV1074='greet'|'invite'|'answer'|'sweep'|'listen'|'encore';
export interface AvatarAudienceCueV1074 {
 active:boolean;
 reason:'disabled'|'paused'|'motion'|'performance'|'manual'|'show'|'clock'|'planned';
 gesture:AudienceGestureV1074;
 gain:number;
 phase:number;
 audienceReply:number;
}
export interface AvatarAudiencePoseV1074 {
 headYaw:number;headPitch:number;leftLift:number;rightLift:number;
 audienceArms:number;audienceHead:number;
}
export const OFF_AVATAR_AUDIENCE_V1074:AvatarAudienceCueV1074=Object.freeze({
 active:false,reason:'disabled',gesture:'listen',gain:0,phase:0,audienceReply:0,
});
export const ZERO_AVATAR_AUDIENCE_POSE_V1074:AvatarAudiencePoseV1074=Object.freeze({
 headYaw:0,headPitch:0,leftLift:0,rightLift:0,audienceArms:0,audienceHead:0,
});
const clamp=(v:unknown,lo:number,hi:number,fallback=0):number=>
 typeof v==='number'&&Number.isFinite(v)?Math.min(hi,Math.max(lo,v)):fallback;
const GESTURE:Record<ArenaShowSceneV1040,AudienceGestureV1074>={
 intro:'greet',verse:'sweep',build:'invite',hook:'answer',interlude:'listen',finale:'encore',
};
function validClock(trackId:string|null|undefined,progressMs:number|null|undefined,durationMs:number|null|undefined){
 return typeof trackId==='string'&&trackId.trim().length>0&&
 typeof progressMs==='number'&&Number.isFinite(progressMs)&&progressMs>=0&&
 typeof durationMs==='number'&&Number.isFinite(durationMs)&&durationMs>=30000&&
 progressMs<=durationMs;
}
/** The same cue is sent to the avatar and crowd to keep their visual response in phase.
 * `manualPriority` protects authored avatar clips, duet and motion timelines.
 */
export function planAvatarAudienceInteractionV1074(input:{
 enabled:boolean;stageIsArena:boolean;audienceEnabled:boolean;showDesignerEnabled:boolean;
 playing:boolean;reducedMotion:boolean;reactive?:boolean;manualPriority?:boolean;
 performanceTier?:'low'|'balanced'|'high'|null;
 show?:ArenaShowCueV1040|null;trackId?:string|null;
 progressMs?:number|null;durationMs?:number|null;strength?:number;
 observedSection?:string|null;
}):AvatarAudienceCueV1074 {
 const off=OFF_AVATAR_AUDIENCE_V1074;
 if(!input.enabled||!input.stageIsArena||!input.audienceEnabled||
    !input.showDesignerEnabled||input.reactive===false)return off;
 if(!input.playing)return {...off,reason:'paused'};
 if(input.reducedMotion)return {...off,reason:'motion'};
 if(input.performanceTier==='low')return {...off,reason:'performance'};
 if(input.manualPriority)return {...off,reason:'manual'};
 const show=input.show;
 if(!show?.active||!show.scene||!(show.scene in GESTURE)||
    !Number.isInteger(show.segmentIndex)||show.segmentIndex<0||show.segmentIndex>6||
    typeof show.intensity!=='number'||!Number.isFinite(show.intensity)||show.intensity<=0||show.intensity>100||
    typeof show.fade!=='number'||!Number.isFinite(show.fade)||show.fade<=0||show.fade>1)
   return {...off,reason:'show'};
 if(!validClock(input.trackId,input.progressMs,input.durationMs))return {...off,reason:'clock'};
 if(typeof input.strength!=='number'||!Number.isFinite(input.strength)||
    input.strength<=0||input.strength>80)return off;
 // Stage templates are not trusted indicators of detected audience noise or vocals.
 // A verified hook can modestly alter *amplitude*, not synthesize an event.
 const observedHook=input.observedSection==='hook';
 const tier=input.performanceTier==='balanced'?.72:1;
 const gain=clamp(input.strength/100*(show.intensity/100)*show.fade*tier*(observedHook?1.07:1),0,.7);
 if(gain<.002)return off;
 let hash=2166136261;
 for(let i=0;i<Math.min(input.trackId!.length,120);i++)
   hash=Math.imul(hash^input.trackId!.charCodeAt(i),16777619);
 const phase=((hash>>>0)%4096)/4096*Math.PI*2;
 const gesture=GESTURE[show.scene];
 // With the same computed cue, a visible invitation elicits a quiet optical
 // answer from the existing crowd arms, never an audio response.
 const audienceReply=clamp(gain*(gesture==='invite'||gesture==='answer'?.76:
   gesture==='encore'?.82:gesture==='listen'?.12:.4),0,.55);
 return {active:true,reason:'planned',gesture,gain,phase,audienceReply};
}
/** A slow, bounded gesture cycle on the song clock. No beat/crowd event is fabricated. */
export function sampleAvatarAudienceInteractionV1074(
 cue:AvatarAudienceCueV1074|null|undefined,progressMs:number|null|undefined,
 slot=0,beatStrength=0):AvatarAudiencePoseV1074 {
 if(!cue?.active||typeof progressMs!=='number'||!Number.isFinite(progressMs)||progressMs<0||
    !Number.isInteger(slot)||slot<0||slot>3)return ZERO_AVATAR_AUDIENCE_POSE_V1074;
 const t=progressMs/1000,phase=cue.phase+slot*.9;
 const pulse=(p:number)=>.5+.5*Math.cos(p);
 const arc=pulse(t*.73+phase),answer=pulse(t*.73+phase+Math.PI*.9);
 const rest=cue.gesture==='listen'?.25:cue.gesture==='sweep'?.52:1;
 const hand=clamp(cue.gain*rest,0,.7);
 const left=clamp(hand*(.10+.42*arc),0,.22);
 const right=clamp(hand*(.10+.42*answer),0,.22);
 const yaw=clamp(cue.gain*.12*Math.sin(t*.47+phase),-.075,.075);
 const nod=clamp(cue.gain*.06*Math.sin(t*.73+phase),-.04,.04);
 const beat=clamp(beatStrength,0,1); // evidence only affects amplitude
 return {headYaw:yaw,headPitch:nod,leftLift:left*(.88+.12*beat),rightLift:right*(.88+.12*beat),
  audienceArms:clamp(cue.audienceReply*(.15+.58*answer),0,.42),
  audienceHead:clamp(cue.audienceReply*.12*Math.sin(t*.65+phase),-.06,.06)};
}
/** Exponential blend with bounded elapsed time; release approaches zero when inactive. */
export function blendAvatarAudiencePoseV1074(
 previous:AvatarAudiencePoseV1074,target:AvatarAudiencePoseV1074,delta:number):AvatarAudiencePoseV1074 {
 const mix=1-Math.exp(-5*clamp(delta,0,.1));
 return {
  headYaw:previous.headYaw+(target.headYaw-previous.headYaw)*mix,
  headPitch:previous.headPitch+(target.headPitch-previous.headPitch)*mix,
  leftLift:previous.leftLift+(target.leftLift-previous.leftLift)*mix,
  rightLift:previous.rightLift+(target.rightLift-previous.rightLift)*mix,
  audienceArms:previous.audienceArms+(target.audienceArms-previous.audienceArms)*mix,
  audienceHead:previous.audienceHead+(target.audienceHead-previous.audienceHead)*mix,
 };
}
