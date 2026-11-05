/** V995 – Duet & Ensemble 3.0.
 * A tiny, opt-in refinement of existing VERIFIED V807/V838 performer gestures.
 * Singer assignment belongs exclusively to V416/V496/V528; this module never
 * detects voices, moves feet, rewrites clips, changes lip sync or owns a camera.
 * Stateless by design: seeks, pauses and track changes cannot replay old cues.
 */
import type {StageInteractionV807,VocalEvidenceV807} from './naturalMultiArtistStageInteractionV807';
import type {VocalDuetPlanV838} from './intelligentVocalDuetDirectorV838';

export const DUET_KEY_V995='sonic.v995.duet-ensemble';
export type DuetStyleV995='natural'|'responsive'|'arena';
export type DuetSettingsV995=Readonly<{
 enabled:boolean;style:DuetStyleV995;intensity:number;
 partnerGaze:boolean;handoffGestures:boolean;sharedHooks:boolean;protectLyrics:boolean;
}>;
export const DEFAULT_DUET_V995:DuetSettingsV995=Object.freeze({
 enabled:false,style:'natural',intensity:55,partnerGaze:true,
 handoffGestures:true,sharedHooks:true,protectLyrics:true,
});
const finite=(x:unknown):x is number=>typeof x==='number'&&Number.isFinite(x);
const clamp=(v:number,min:number,max:number)=>Math.min(max,Math.max(min,v));
const ease=(x:number)=>{const t=clamp(x,0,1);return t*t*(3-2*t);};
const pulse=(t:number,peak:number,width:number)=>ease(1-Math.abs(t-peak)/width);
export function normalizeDuetV995(raw:unknown):DuetSettingsV995{
 const value=raw&&typeof raw==='object'&&!Array.isArray(raw)?raw as Partial<DuetSettingsV995>:{};
 const flag=(k:'partnerGaze'|'handoffGestures'|'sharedHooks'|'protectLyrics')=>
  typeof value[k]==='boolean'?value[k] as boolean:DEFAULT_DUET_V995[k];
 return {enabled:value.enabled===true,
  style:value.style==='arena'||value.style==='responsive'?value.style:'natural',
  intensity:finite(value.intensity)?Math.round(clamp(value.intensity,0,100)):55,
  partnerGaze:flag('partnerGaze'),handoffGestures:flag('handoffGestures'),
  sharedHooks:flag('sharedHooks'),protectLyrics:flag('protectLyrics')};
}
export type DuetInputV995={
 settings:DuetSettingsV995|undefined;trackId:string;cueTrackId:string;
 cue:VocalEvidenceV807;progressMs:number;count:number;
 positions:readonly (readonly number[])[];playing:boolean;reducedMotion:boolean;
 automatic:boolean;manualPriority:boolean;lyricsVisible:boolean;
 tier:'low'|'balanced'|'high';collisionRisk?:readonly (number|undefined)[];
};
export type DuetResultV995={stage:StageInteractionV807;active:boolean;
 mode:'reply'|'duet'|'hook'|'off';affectedSlots:readonly number[]};
const off=(stage:StageInteractionV807):DuetResultV995=>({stage,active:false,mode:'off',affectedSlots:[]});
/** Changes only V807 look and upper-body gesture channels. No extra renderer. */
export function refineDuetEnsembleV995(stage:StageInteractionV807,
  duet:VocalDuetPlanV838|undefined,input:DuetInputV995):DuetResultV995{
 const s=normalizeDuetV995(input.settings),cue=input.cue;
 if(!s.enabled||s.intensity===0||!input.automatic||!input.playing||input.reducedMotion||
  input.manualPriority||input.tier==='low'||(s.protectLyrics&&input.lyricsVisible)||
  !stage?.active||stage.reason!=='verified-vocal'||!cue?.active||cue.source==='none'||
  !input.trackId||input.trackId.length>160||input.cueTrackId!==input.trackId||
  !finite(input.progressMs)||!finite(cue.startMs)||!finite(cue.endMs)||cue.startMs<0||
  cue.endMs<=cue.startMs||input.progressMs<cue.startMs||input.progressMs>=cue.endMs||
  !Number.isInteger(cue.lineIndex)||cue.lineIndex<0||
  !Number.isInteger(input.count)||input.count<2||input.count>4||cue.count!==input.count||
  stage.slots.length!==input.count||!Number.isInteger(cue.leadSlot)||
  cue.leadSlot<0||cue.leadSlot>=input.count||stage.leadSlot!==cue.leadSlot||
  !Array.isArray(cue.singingSlots)||cue.singingSlots.length<1||
  new Set(cue.singingSlots).size!==cue.singingSlots.length||
  cue.singingSlots.some(n=>!Number.isInteger(n)||n<0||n>=input.count)||
  !cue.singingSlots.includes(cue.leadSlot)||
  !Array.isArray(input.positions)||input.positions.length!==input.count||
  input.positions.some(p=>!p||p.length<3||!p.slice(0,3).every(finite))||
  stage.slots.some((slot,index)=>slot.slot!==index||
   ![slot.look.yaw,slot.look.eyeYaw,slot.look.weight,slot.gesture.leftLift,
     slot.gesture.rightLift,slot.gesture.shoulder,slot.gesture.lean,slot.gesture.intensity].every(finite))||
  (input.collisionRisk&&input.collisionRisk.some(r=>r!==undefined&&(!finite(r)||r<0||r>1))))return off(stage);
 const handoff=cue.style==='reply'&&stage.mode==='reply'&&s.handoffGestures&&
  duet?.active&&duet.mode==='handoff'&&duet.respondingSlot===cue.handoffFrom&&
  cue.handoffFrom!==null&&cue.singingSlots.length===1;
 const duetMode=cue.style==='duet'&&stage.mode==='duet'&&
  duet?.active&&duet.mode==='duet'&&duet.respondingSlot===cue.partnerSlot&&
  cue.partnerSlot!==null&&cue.singingSlots.length===2;
 const hook=cue.style==='hook'&&stage.mode==='hook'&&s.sharedHooks&&
  cue.singingSlots.length===input.count;
 if(!handoff&&!duetMode&&!hook)return off(stage);
 if(duet?.active&&(duet.trackId!==input.trackId||duet.leadSlot!==cue.leadSlot||
  duet.participants.some(i=>!Number.isInteger(i)||i<0||i>=input.count)))return off(stage);
 // Even shared hooks must not exaggerate poses when performers intersect.
 if(hook){
  for(let a=0;a<input.count;a++)for(let b=a+1;b<input.count;b++){
   const p=input.positions[a],q=input.positions[b];
   const gap=Math.hypot(p[0]-q[0],p[2]-q[2]);
   if(!finite(gap)||gap<.85)return off(stage);
  }
 }
 const old=handoff?cue.handoffFrom:duetMode?cue.partnerSlot:null;
 const involved=hook?Array.from({length:input.count},(_,i)=>i):[cue.leadSlot,old!];
 if(!hook&&(!duet?.active||new Set(duet.participants).size!==2||
  duet.participants.length!==2||involved.some(i=>!duet.participants.includes(i))))return off(stage);
 // Refuse close/intersecting or widely separated performers, even for a virtual gaze.
 if(old!==null){
  const a=input.positions[old],b=input.positions[cue.leadSlot];
  const distance=Math.hypot(a[0]-b[0],a[2]-b[2]);
  if(!finite(distance)||distance<1||distance>5.4)return off(stage);
 }
 const inTime=input.progressMs-cue.startMs,remaining=cue.endMs-input.progressMs;
 const envelope=ease(inTime/330)*ease(remaining/410);
 const strength=s.intensity/100*envelope*(input.tier==='balanced'?.58:1)*
  (s.style==='arena'?1:s.style==='responsive'?.82:.65);
 if(strength<.0001)return off(stage);
 const progress=inTime/(cue.endMs-cue.startMs);
 let changed=false;
 const slots=stage.slots.map((slot,index)=>{
  if(!involved.includes(index))return slot;
  const risk=input.collisionRisk?.[index]??0;
  if(risk>=.22)return slot;
  const safe=clamp(1-risk*3,0,1);
  const isLead=index===cue.leadSlot;
  const accent=hook?pulse(progress,.52,.36)*.8:
    handoff?pulse(progress,isLead?.64:.32,.26):
    pulse(progress,isLead?.29:.62,.30);
  const amount=strength*safe*accent;
  if(amount<=.00001)return slot;
  changed=true;
  const left=(hook?(index%2===0):isLead);
  const gesture={...slot.gesture,
   leftLift:clamp(slot.gesture.leftLift+amount*(left?.016:.006),-.08,.08),
   rightLift:clamp(slot.gesture.rightLift+amount*(left?.006:.016),-.08,.08),
   shoulder:clamp(slot.gesture.shoulder+amount*.010,-.06,.06),
   intensity:clamp(slot.gesture.intensity+amount*.024,0,.12)};
  let look=slot.look;
  if(!hook&&s.partnerGaze&&old!==null){
   const other=input.positions[isLead?old:cue.leadSlot],self=input.positions[index];
   const gaze=pulse(progress,handoff?(isLead?.29:.61):(isLead?.55:.31),.22)*strength*safe;
   const delta=clamp(Math.atan2(other[0]-self[0],Math.max(1.7,3+other[2]-self[2])),-.35,.35)*gaze*.18;
   look={...slot.look,yaw:clamp(slot.look.yaw+delta,-.42,.42),
    eyeYaw:clamp(slot.look.eyeYaw+delta*.20,-.11,.11),
    weight:clamp(slot.look.weight+gaze*.026,0,.46)};
  }
  return {...slot,gesture,look};
 });
 return changed?{stage:{...stage,slots},active:true,
  mode:hook?'hook':handoff?'reply':'duet',affectedSlots:involved}:off(stage);
}
