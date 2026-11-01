/** V838 – Intelligent Vocal & Duet Director 3.0.
 * A conservative finishing layer over the VERIFIED V528/V797 singer cast.
 * Does not discover singers, invent adlibs, edit vocal tracks, or own a camera.
 * Stateless: seek/switch-safe, no new render loop or GLB allocations.
 */
import type {ConcertSceneV528,ConcertAnchorV528,CameraPoseV528} from './cinematicConcertCoordinationV528';
import type {MultiVocalSpotlightCueV797} from './multiVocalSpotlightDirectorV797';
import type {StageInteractionV807} from './naturalMultiArtistStageInteractionV807';
import type {VocalDirectorV632} from './multiArtistVocalDirectorV632';
import {measureConcertFrameV550} from './cinematicConcertCameraV550';
import {measureScreenFrameV540} from './cinematicCameraCompositionV540';

export type VocalDuetModeV838='off'|'handoff'|'duet'|'ensemble';
export type VocalDuetPlanV838=Readonly<{
 active:boolean;mode:VocalDuetModeV838;trackId:string;leadSlot:number;
 respondingSlot:number|null;participants:readonly number[];
 handoffBlend:number;glanceStrength:number;cameraStrength:number;lightingStrength:number;
}>;
export const VOCAL_DUET_OFF_V838:VocalDuetPlanV838=Object.freeze({
 active:false,mode:'off',trackId:'',leadSlot:-1,respondingSlot:null,participants:[],
 handoffBlend:1,glanceStrength:0,cameraStrength:0,lightingStrength:0,
});
const finite=(v:unknown):v is number=>typeof v==='number'&&Number.isFinite(v);
const clamp=(v:number,min:number,max:number)=>Math.min(max,Math.max(min,v));
const ease=(v:number)=>{const t=clamp(v,0,1);return t*t*(3-2*t);};
/** Both directors must agree on the current verified cast, track and interval.
 * V797 already fails closed on lyrics, manual camera and lighting priorities.
 */
export function planIntelligentVocalDuetV838(input:{
 scene:ConcertSceneV528|null|undefined;spotlight:MultiVocalSpotlightCueV797|null|undefined;
 trackId:string;progressMs:number;playing:boolean;reducedMotion:boolean;
 tier:'low'|'balanced'|'high';manualVocal:boolean;
}):VocalDuetPlanV838{
 const {scene:s,spotlight:v,progressMs:t}=input;
 if(!input.playing||input.reducedMotion||input.tier==='low'||input.manualVocal||
   !input.trackId||input.trackId.length>180||!s?.active||!v?.active||
   !finite(t)||!finite(s.cueStartMs)||!finite(s.cueEndMs)||
   s.cueStartMs<0||s.cueEndMs<=s.cueStartMs||t<s.cueStartMs||t>=s.cueEndMs||
   s.trackId!==input.trackId||v.trackId!==input.trackId||
   !Number.isInteger(s.count)||s.count<2||s.count>4||
   !Number.isInteger(s.leadSlot)||s.leadSlot<0||s.leadSlot>=s.count||
   v.leadSlot!==s.leadSlot||!finite(s.strength)||s.strength<=0||s.strength>.8||
   !Array.isArray(s.singingSlots)||s.singingSlots.length<1||s.singingSlots.length>s.count||
   s.singingSlots.some(i=>!Number.isInteger(i)||i<0||i>=s.count)||
   new Set(s.singingSlots).size!==s.singingSlots.length||
   !s.singingSlots.includes(s.leadSlot)||!Array.isArray(v.activeSlots)||
   v.activeSlots.some(i=>!Number.isInteger(i)||i<0||i>=s.count)||
   !finite(v.intensity)||v.intensity<=0||v.intensity>.8||
   !finite(v.cameraWeight)||v.cameraWeight<0||v.cameraWeight>.256)return VOCAL_DUET_OFF_V838;
 let mode:VocalDuetModeV838='off';
 let participants:readonly number[]=[];
 let respondingSlot:number|null=null;
 if(s.focus==='handoff'&&v.mode==='handoff'&&s.singingSlots.length===1&&
   s.handoffFrom!==null&&Number.isInteger(s.handoffFrom)&&
   s.handoffFrom>=0&&s.handoffFrom<s.count&&s.handoffFrom!==s.leadSlot&&
   v.partnerSlot===s.handoffFrom){
   mode='handoff';participants=[s.handoffFrom,s.leadSlot];respondingSlot=s.handoffFrom;
 }else if(s.focus==='lead'&&v.mode==='duet'&&s.singingSlots.length===2&&
   v.partnerSlot!==null&&s.singingSlots.includes(v.partnerSlot)&&v.partnerSlot!==s.leadSlot){
   mode='duet';participants=[s.leadSlot,v.partnerSlot];respondingSlot=v.partnerSlot;
 }else if(s.focus==='ensemble'&&v.mode==='ensemble'&&s.count>=3&&
   s.singingSlots.length===s.count){
   mode='ensemble';participants=[...s.singingSlots];
 }else return VOCAL_DUET_OFF_V838;
 if(v.activeSlots.length!==participants.length||
   new Set(v.activeSlots).size!==participants.length||
   participants.some(p=>!v.activeSlots.includes(p)))return VOCAL_DUET_OFF_V838;
 const elapsed=t-s.cueStartMs,remaining=s.cueEndMs-t;
 const envelope=ease(elapsed/370)*ease(remaining/440);
 const handoffBlend=mode==='handoff'?ease(elapsed/920):1;
 // A bounded accent. Never creates a source or extends a cue beyond its end.
 const strength=clamp(s.strength*(input.tier==='balanced'?.55:.82)*envelope,0,.6);
 return {active:strength>.000001,mode,trackId:input.trackId,leadSlot:s.leadSlot,
  respondingSlot,participants,handoffBlend,
  glanceStrength:mode==='ensemble'?0:strength*.34,
  cameraStrength:v.cameraActive?strength*(mode==='handoff'?.22:.10):0,
  lightingStrength:v.lightingActive?strength*.05:0};
}
/** Only existing V797 light multipliers are touched; inactive authored lanes stay off. */
export function refineVocalSpotlightV838(base:MultiVocalSpotlightCueV797,
 plan:VocalDuetPlanV838):MultiVocalSpotlightCueV797{
 if(!plan.active||!base.active||!base.lightingActive||base.trackId!==plan.trackId||
   base.leadSlot!==plan.leadSlot||plan.lightingStrength<=0)return base;
 const gain=plan.lightingStrength*(plan.mode==='handoff'?1-plan.handoffBlend*.35:1);
 return {...base,keyGain:clamp(base.keyGain+gain*.17,1,1.025),
   fillGain:clamp(base.fillGain+gain*.30,1,1.045)};
}
/** Micro-pan on the SAME existing camera after V809 and before V351 lyrics guard.
 * Reject any framing that worsens the V540/V550 projected overflow metrics.
 */
export function composeIntelligentVocalDuetCameraV838<T extends CameraPoseV528>(
 pose:T,plan:VocalDuetPlanV838,anchors:readonly ConcertAnchorV528[],
 options:{automatic:boolean;authored:boolean;lyricsProtected:boolean;
 reducedMotion:boolean;aspect:number;faceY?:number|null;lyricsSide?:'left'|'right'|null}
):T{
 if(!plan.active||!plan.cameraStrength||!options.automatic||options.authored||
   options.lyricsProtected||options.reducedMotion||!finite(options.aspect)||
   options.aspect<.55||options.aspect>3.5||!Array.isArray(anchors)||
   ![pose.x,pose.y,pose.z,pose.targetX??0,pose.targetY,pose.targetZ??0,pose.fov].every(finite)||
   pose.fov<28||pose.fov>76)return pose;
 const selected=plan.participants.map(slot=>{
  const matches=anchors.filter(a=>a.slot===slot&&a.visible&&
    [a.x,a.y,a.z].every(finite)&&Math.abs(a.x)<35&&Math.abs(a.y)<35&&Math.abs(a.z)<35);
  return matches.length===1?matches[0]:null;
 });
 if(selected.some(a=>!a))return pose;
 const cast=selected as ConcertAnchorV528[];
 const faceY=finite(options.faceY)?clamp(options.faceY,.7,2.7):1.55;
 const before=measureConcertFrameV550(pose,cast,options.aspect,options.lyricsSide??null,false,faceY);
 const before540=measureScreenFrameV540(pose,cast,options.aspect,options.lyricsSide??null);
 if(!before||!before540)return pose;
 const lead=cast.find(a=>a.slot===plan.leadSlot)!;
 const center=cast.reduce((sum,a)=>sum+a.x,0)/cast.length;
 const wished=plan.mode==='handoff'?center+(lead.x-center)*plan.handoffBlend*.4:center;
 const shift=clamp((wished-(pose.targetX??0))*plan.cameraStrength,-.10,.10);
 if(Math.abs(shift)<.000001)return pose;
 const next={...pose,x:pose.x+shift,targetX:(pose.targetX??0)+shift};
 const after=measureConcertFrameV550(next,cast,options.aspect,options.lyricsSide??null,false,faceY);
 const after540=measureScreenFrameV540(next,cast,options.aspect,options.lyricsSide??null);
 return after&&after540&&after.overflow<=before.overflow+1e-6&&
   after.headOverflow<=before.headOverflow+1e-6&&
   after.fullBodyOverflow<=before.fullBodyOverflow+1e-6&&
   after540.overflow<=before540.overflow+1e-6?next:pose;
}
/** Accent the existing V807 look overlay only – no root movement, mouth, IK or clips.
 * Explicit V528 evidence and current, safely spaced group roots are required.
 */
export function refineIntelligentDuetLooksV838(
 base:StageInteractionV807,plan:VocalDuetPlanV838,
 positions:readonly (readonly number[])[],manualPriority:boolean,
 vocal?:VocalDirectorV632|null
):StageInteractionV807{
 if(!base.active||!plan.active||manualPriority||!plan.glanceStrength||
   base.leadSlot!==plan.leadSlot||!Array.isArray(positions)||
   plan.mode==='ensemble'||plan.respondingSlot===null||
   base.slots.length>4||base.slots.length<2||
   plan.participants.some(i=>i>=positions.length||i>=base.slots.length)||
   base.slots.some((s,i)=>s.slot!==i))return base;
 const old=plan.respondingSlot,lead=plan.leadSlot;
 // Adlibs are NEVER inferred from the second artist or track credits. V632
 // must already have an explicit, live backing role for exactly this singer.
 const adlib=vocal?.scene==='adlib';
 if(adlib&&(!vocal?.active||vocal.trackId!==plan.trackId||
   vocal.leadSlot!==lead||vocal.count!==base.slots.length||
   !vocal.singingSlots.includes(old)||vocal.role[old]!=='backing'))return base;
 const a=positions[old],b=positions[lead];
 if(!a||!b||a.length<3||b.length<3||
   ![a[0],a[1],a[2],b[0],b[1],b[2]].every(finite))return base;
 const dx=b[0]-a[0],dz=b[2]-a[2],distance=Math.hypot(dx,dz);
 if(distance<.95||distance>5.5)return base;
 const amount=plan.glanceStrength*(plan.mode==='handoff'?1-plan.handoffBlend*.45:1)*(adlib?.72:1);
 const yaw=clamp(Math.atan2(dx,Math.max(1.6,3+dz)),-.38,.38);
 return {...base,slots:base.slots.map((s,i)=>{
   if(i!==old&&i!==lead)return s;
   const offset=(i===old?1:-1)*yaw*amount;
   const look=s.look;
   return {...s,look:{...look,yaw:clamp(look.yaw+offset,-.42,.42),
      eyeYaw:clamp(look.eyeYaw+offset*.22,-.11,.11),
      weight:clamp(look.weight+amount*.13,0,.46)}};
 })};
}
