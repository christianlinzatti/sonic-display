/** V607 — natural multi-artist interaction on the single authored V500 duet
 * channel. Upper-body only: no new singer inference, bones, movement clocks,
 * animation actions, GLB instances, root travel, IK, camera or lyric timing.
 * The same pure plan is consumed by both 2-performer and 3/4-performer stages.
 */
import type {RapDuetInputV500,RapDuetPlanV500} from './intelligentRapDuetPerformanceV500';
import {featureDuetEvidenceV599} from './featureDuetPerformanceV599';

const clamp=(n:number,min:number,max:number)=>Number.isFinite(n)?Math.max(min,Math.min(max,n)):min;
const smooth=(n:number)=>{const x=clamp(n,0,1);return x*x*(3-2*x);};
const accent=(at:number,centre:number,span:number)=>smooth(1-Math.abs(at-centre)/span);
const dist=(a:readonly number[],b:readonly number[])=>Math.hypot(a[0]-b[0],a[2]-b[2]);
const close=(a:readonly number[],b:readonly number[])=>{const d=dist(a,b);return Number.isFinite(d)&&d>=.85&&d<=6;};
const cycle=(ms:number,period:number)=>((ms%period)+period)%period;
/** Stable variation across authored lyric lines, without Math.random or frame state. */
function motif(track:string,line:number,slot:number):number{
 let hash=2166136261;
 for(let i=0;i<track.length;i++)hash=Math.imul(hash^track.charCodeAt(i),16777619);
 return ((hash^Math.imul(Number.isSafeInteger(line)?line+11:11,109)^Math.imul(slot+1,197))>>>0)%4;
}

export type MultiArtistEvidenceV607={status:'active'|'protected'|'invalid';
  kind:RapDuetPlanV500['kind']; singers:readonly number[]; lead:number|null;
  handoffFrom:number|null; partner:number|null; reason:string};
/** For explainable previews/tests. Does not assert actual acoustic recognition. */
export function multiArtistEvidenceV607(base:RapDuetPlanV500,input:RapDuetInputV500):MultiArtistEvidenceV607{
 const evidence=featureDuetEvidenceV599(base,input);
 const partner=input.cue?.partnerSlot??null;
 const initial={status:evidence.status,kind:evidence.kind,singers:evidence.singers,
   lead:evidence.lead,handoffFrom:evidence.handoffFrom,partner:null,reason:evidence.reason};
 if(evidence.status!=='active')return initial;
 const {cue,positions,count}=input;
 // A V500 plan may only ever describe the editor's singing slots. No role repair.
 if(base.slots.some((entry,i)=>!entry||!entry.look||!entry.gesture||
   entry.role!==(cue.style==='hook'?'chorus':
     cue.handoffFrom===i&&cue.handoffFrom!==cue.leadSlot?'handoff':
     cue.singingSlots.includes(i)?'singing':'listening')))
   return {...initial,status:'invalid',reason:'base singer roles disagree with authored cue'};
 if(!Number.isFinite(cue.emphasis)||cue.emphasis<0||cue.emphasis>1||
   !Number.isFinite(input.beat)||input.beat<0||input.beat>1||
   !Number.isFinite(input.strength??65)||(input.strength??65)<=0)
   return {...initial,status:'invalid',reason:'invalid cue/gain'};
 if(cue.style==='duet'&&(
   cue.singingSlots.length!==2||!Number.isInteger(partner)||partner===cue.leadSlot||
   !cue.singingSlots.includes(partner!)||!close(positions[cue.leadSlot],positions[partner!])))
   return {...initial,status:'invalid',reason:'duet requires two nearby authored voices'};
 if(cue.style==='reply'&&cue.handoffFrom!==null&&cue.handoffFrom!==cue.leadSlot&&
   !close(positions[cue.leadSlot],positions[cue.handoffFrom]))
   return {...initial,status:'invalid',reason:'handoff pair not safely separated'};
 if(cue.style==='hook'&&(cue.singingSlots.length!==count||partner!==null))
   return {...initial,status:'invalid',reason:'hook must have a complete authored cast'};
 return {...initial,status:'active',partner:cue.style==='duet'?partner:null,
   reason:'track-bound editorial singer and scene cue; distance-checked overlays'};
}

/** A brief, bounded ensemble finishing layer. All math is a pure function of
 * song time; backward seeks, pause/resume and replay never keep stale state.
 */
export function refineNaturalMultiArtistV607(base:RapDuetPlanV500,input:RapDuetInputV500):RapDuetPlanV500{
 const e=multiArtistEvidenceV607(base,input);
 if(e.status!=='active')return base;
 const {cue,positions,count,progressMs}=input;
 const gain=clamp(input.strength??65,0,100)/100*(input.tier==='balanced'?.5:1);
 if(gain<=0)return base;
 const elapsed=progressMs-cue.startMs;
 const envelope=smooth(elapsed/260)*smooth((cue.endMs-progressMs)/300);
 if(envelope<.000001)return base;
 const beat=clamp(input.beat,0,1);
 const time=cycle(elapsed,2800);
 const singers=new Set(e.singers);
 // V416 marks the inline response at 62% of an authored line; V496's
 // time-coded segment already starts on the actual saved singer boundary.
 const handoffAt=cue.style==='reply'&&cue.lineIndex>=0?
   (cue.endMs-cue.startMs)*.62:0;
 const responseMs=elapsed-handoffAt;
 const outgoing=e.handoffFrom!==null&&e.handoffFrom!==e.lead?e.handoffFrom:null;
 let changed=false;
 const slots=base.slots.map((s,i)=>{
   let gesture=0,lookAmount=0,lean=0;
   const variant=motif(input.trackId!,cue.lineIndex,i);
   const leftBias=(variant%2===0);
   const validLead=i!==e.lead&&close(positions[i],positions[e.lead!]);
   if(e.kind==='hook'){
     // Performers share a musical cue but not an identical animated pose.
     const centre=380+(variant%3)*140;
     const peak=accent(time,centre,410);
     gesture=(.016+(variant%3)*.003)*peak*(.55+.45*beat);
     lean=gesture*.13;
     // Hook remains audience-facing: intentionally no look change.
   } else if(e.kind==='duet'&&singers.has(i)&&e.partner!==null){
     // Two explicit singers trade small gestures (neither steals the lead).
     const order=i===e.lead?0:1;
     const peak=accent(time,order===0?560:1510,440);
     gesture=peak*(.021+(variant%2)*.002)*(.5+.5*beat);
     lookAmount=peak*.011;
     lean=-peak*.002;
   } else if(outgoing!==null&&(e.kind==='reply'||e.kind==='solo')&&
      (i===e.lead||i===outgoing)&&close(positions[e.lead!],positions[outgoing])){
     // The old voice acknowledges AFTER the authored handoff instant.
     const peak=responseMs>=0?accent(responseMs,i===e.lead?320:600,440):0;
     gesture=peak*(i===e.lead?.024:.016);
     lookAmount=i===outgoing?peak*.018:0;
     lean=-peak*.0015;
   } else if(!singers.has(i)&&validLead){
     // Supporting performers do not all echo the same lyric/beat.
     const peak=accent(time,920+(variant%3)*350,300);
     gesture=peak*.010*(.5+.5*beat);
     lookAmount=peak*.006;
   }
   const k=envelope*gain;
   const amount=gesture*k;
   const turn=lookAmount*k;
   if(amount<.0000005&&turn<.0000005)return s;
   const g=s.gesture;
   const updatedGesture={...g,
     leftLift:clamp(g.leftLift+amount*(leftBias?.73:.31),0,.13),
     rightLift:clamp(g.rightLift+amount*(leftBias?.31:.73),0,.13),
     shoulder:clamp(g.shoulder+amount*.28,0,.065),
     lean:clamp(g.lean+lean*k,-.028,.028),
     intensity:clamp(g.intensity+amount*.8,0,.28),
   };
   // Only amplify a gaze already directed at an authored stage partner.
   // Never introduce a new gaze in an audience-facing hook or solo lead.
   const target=e.kind==='duet'&&singers.has(i)?(i===e.lead?e.partner:e.lead):
     e.kind==='reply'&&i===outgoing?e.lead:
     !singers.has(i)?e.lead:null;
   let look=s.look;
   if(target!==null&&target!==undefined&&i!==target&&turn>0&&
      s.look.weight>.00001&&close(positions[i],positions[target])){
     const yaw=clamp(Math.atan2(positions[target][0]-positions[i][0],
       Math.max(1.6,3+positions[target][2]-positions[i][2])),-.38,.38);
     // Require the existing gaze to agree with the intended direction.
     const directionMatches=Math.abs(s.look.yaw)>.00001&&s.look.yaw*yaw>0;
     const yawDelta=directionMatches?Math.sign(yaw)*Math.min(turn*.45,.008):0;
     look={...s.look,
       yaw:clamp(s.look.yaw+yawDelta,-.42,.42),
       eyeYaw:clamp(s.look.eyeYaw+yawDelta*.22,-.11,.11),
       weight:clamp(s.look.weight+turn,0,.46)};
   }
   changed=true;
   return {...s,gesture:updatedGesture,look};
 });
 return changed?{...base,slots}:base;
}
