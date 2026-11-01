/** V808 – safe, time-bounded artist positioning on the EXISTING stage roots.
 * Uses only explicit V416/V496 voice assignment (never inferred singers),
 * actual stage coordinates and the existing collision/grounding evidence.
 * No renderer, clip, foot IK, persistent setting, camera or animation mixer.
 */
export type VocalPositionEvidenceV808={active:boolean;source:'none'|'line-timed'|'word-timed';
 style:'solo'|'reply'|'duet'|'hook'|null;lineIndex:number;leadSlot:number;
 partnerSlot:number|null;handoffFrom:number|null;singingSlots:readonly number[];
 startMs:number;endMs:number;count:number};
export type PositionInputV808={trackId?:string|null;cueTrackId?:string|null;
 cue:VocalPositionEvidenceV808;progressMs:number;count:number;
 positions:readonly (readonly number[])[];playing:boolean;reducedMotion:boolean;
 manualPriority:boolean;tier:'low'|'balanced'|'high';strength?:number;
 /** Foot-contact must be cleared PER performer before any root travel. */
 footReady:readonly boolean[];risks:readonly number[];
};
export type PositionSlotV808=Readonly<{slot:number;role:'lead'|'partner'|'handoff'|'chorus'|'support';offsetZ:number}>;
export type PositionPlanV808=Readonly<{active:boolean;reason:'verified'|'off';mode:'duet'|'reply'|'hook'|'off';slots:readonly PositionSlotV808[]}>;
const OFF:PositionPlanV808=Object.freeze({active:false,reason:'off',mode:'off',slots:[]});
const finite=(n:unknown):n is number=>typeof n==='number'&&Number.isFinite(n);
const clamp=(n:number,lo:number,hi:number)=>Math.min(hi,Math.max(lo,n));
const ease=(t:number)=>{const x=clamp(t,0,1);return x*x*(3-2*x);};
/** Strictly fail closed if roles, song, stage roots, timing or safety are unverified. */
export function planNaturalPerformerPositioningV808(input:PositionInputV808):PositionPlanV808{
 const {cue,count,positions,progressMs,footReady,risks}=input;
 if(!input.playing||input.reducedMotion||input.manualPriority||input.tier==='low'||
    !input.trackId||input.trackId!==input.cueTrackId||input.trackId.length>180||
    !cue?.active||cue.source==='none'||
    (cue.style!=='duet'&&cue.style!=='reply'&&cue.style!=='hook')||
    !Number.isInteger(cue.lineIndex)||cue.lineIndex<0||
    !Number.isInteger(count)||count<2||count>4||cue.count!==count||
    !finite(progressMs)||!finite(cue.startMs)||!finite(cue.endMs)||
    cue.startMs<0||cue.endMs<=cue.startMs||progressMs<cue.startMs||progressMs>=cue.endMs||
    !Number.isInteger(cue.leadSlot)||cue.leadSlot<0||cue.leadSlot>=count||
    !Array.isArray(cue.singingSlots)||cue.singingSlots.length<1||cue.singingSlots.length>count||
    cue.singingSlots.some(s=>!Number.isInteger(s)||s<0||s>=count)||
    new Set(cue.singingSlots).size!==cue.singingSlots.length||
    !cue.singingSlots.includes(cue.leadSlot)||
    (cue.style==='hook'&&cue.singingSlots.length!==count)||
    (cue.style==='reply'&&(cue.singingSlots.length!==1||cue.handoffFrom===null||
      !Number.isInteger(cue.handoffFrom)||cue.handoffFrom<0||cue.handoffFrom>=count||cue.handoffFrom===cue.leadSlot))||
    (cue.style==='duet'&&(cue.singingSlots.length!==2||cue.partnerSlot===null||
      !Number.isInteger(cue.partnerSlot)||cue.partnerSlot<0||cue.partnerSlot>=count||
      cue.partnerSlot===cue.leadSlot||!cue.singingSlots.includes(cue.partnerSlot)))||
    !Array.isArray(positions)||positions.length<count||
    positions.slice(0,count).some(p=>!p||p.length<3||!p.slice(0,3).every(finite))||
    !Array.isArray(footReady)||footReady.length<count||
    footReady.slice(0,count).some(v=>typeof v!=='boolean')||
    !Array.isArray(risks)||risks.length<count||
    risks.slice(0,count).some(v=>!finite(v)||v<0||v>1)||
    !finite(input.strength??65)||(input.strength??65)<=0||(input.strength??65)>100)return OFF;
 // No lane swapping or crossing. Each performer stays in their original X lane.
 // All participants must be well separated before and after the proposed step.
 for(let i=0;i<count;i++)for(let j=i+1;j<count;j++){
    if(Math.hypot(positions[i][0]-positions[j][0],positions[i][2]-positions[j][2])<1.5)return OFF;
 }
 const envelope=ease((progressMs-cue.startMs)/540)*ease((cue.endMs-progressMs)/640);
 const gain=envelope*(input.strength??65)/100*(input.tier==='balanced'?.6:1);
 if(gain<.00001)return OFF;
 const slots=Array.from({length:count},(_,slot):PositionSlotV808=>{
   const singing=cue.singingSlots.includes(slot);
   const role:PositionSlotV808['role']=cue.style==='hook'?'chorus':slot===cue.leadSlot?'lead':
     cue.style==='duet'&&slot===cue.partnerSlot?'partner':
     cue.style==='reply'&&slot===cue.handoffFrom?'handoff':'support';
   // No motion of background dancers or unconfirmed performer roots.
   const centered=slot-(count-1)/2;
   const target=cue.style==='hook'?(Math.abs(centered)*.035-.045):
     role==='lead'?-.085:role==='partner'?-.045:role==='handoff'?.035:0;
   const safe=singing||role==='handoff';
   return {slot,role,offsetZ:safe&&footReady[slot]&&risks[slot]<.18?
      clamp(target*gain,-.075,.06):0};
 });
 if(slots.every(s=>s.offsetZ===0))return OFF;
 // Recheck pair distances at proposed positions, conservatively disallow any
 // significant loss of clearance. This is not a claimed mesh collision test.
 for(let i=0;i<count;i++)for(let j=i+1;j<count;j++){
   const dx=positions[i][0]-positions[j][0];
   const dz=positions[i][2]-positions[j][2];
   const before=Math.hypot(dx,dz);
   const after=Math.hypot(dx,dz+slots[i].offsetZ-slots[j].offsetZ);
   if(after<1.5||after+0.025<before)return OFF;
 }
 return {active:true,reason:'verified',mode:cue.style,slots};
}
/** Adapt existing V494 observations, not a fabricated foot-contact guess. */
export function canRepositionWithGroundV808(ground:{active:boolean;phase:string;support:string;
 gain:number;driftCm:number}|undefined,footLock:boolean):boolean{
 return !footLock&&!!ground?.active&&finite(ground.gain)&&ground.gain>.2&&
   finite(ground.driftCm)&&ground.driftCm>=0&&ground.driftCm<=3&&
   ground.support!=='both'&&ground.phase!=='low'&&ground.phase!=='lowering'&&
   ground.phase!=='rising';
}

/** V808: use the existing V487 measured contact when V494 is intentionally
 * unavailable due to a song-authored vocal assignment. Unknown observations
 * always fail closed: a root may move only during a measured single-support
 * step with low drift and reliable foot confidence. */
export function canRepositionWithObservationV808(observation:{
 tracked:boolean;leftPlanted:boolean;rightPlanted:boolean;
 leftConfidence:number;rightConfidence:number;
 leftDriftCm:number;rightDriftCm:number;
}|undefined,footLock:boolean,lowPose:boolean):boolean{
 if(!observation?.tracked||footLock||lowPose||
   (observation.leftPlanted&&observation.rightPlanted))return false;
 const left=observation.leftPlanted&&finite(observation.leftConfidence)&&observation.leftConfidence>=.45;
 const right=observation.rightPlanted&&finite(observation.rightConfidence)&&observation.rightConfidence>=.45;
 if(left===right)return false; // No verified support, or both planted.
 const drift=left?observation.leftDriftCm:observation.rightDriftCm;
 return finite(drift)&&drift>=0&&drift<=1.2;
}
