/** Sonic Display V584 – Natural Duet & Stage Interaction 3.0.
 * A small pure overlay on the existing V500/V575 editorial duet planner.
 * An explicitly track-matched V416/V496 singer cue is the ONLY source of roles;
 * this function never detects, changes or claims to identify a recorded voice.
 * Outputs are upper-body V144/V145 look/gesture overlays only, not root or IK.
 */
import type {RapDuetInputV500,RapDuetPlanV500} from './intelligentRapDuetPerformanceV500';
import type {PartnerGestureCue} from './partnerGestureEngine';

const clamp=(n:number,lo:number,hi:number)=>Number.isFinite(n)?Math.max(lo,Math.min(hi,n)):lo;
const ease=(n:number)=>{const v=clamp(n,0,1);return v*v*(3-2*v);};
const bell=(ms:number,peak:number,halfWidth:number)=>ease(1-Math.abs(ms-peak)/halfWidth);
const zero=(g:PartnerGestureCue)=>({leftLift:g.leftLift,rightLift:g.rightLift,shoulder:g.shoulder,lean:g.lean,intensity:g.intensity});
/** Deterministic mirror chosen by a specific lyric line, cast and track. */
function mirror(trackId:string,lineIndex:number,slot:number){
 let h=2166136261;
 for(let i=0;i<trackId.length;i++)h=Math.imul(h^trackId.charCodeAt(i),16777619);
 return ((h^Math.imul(lineIndex+1,131)^Math.imul(slot+1,61))>>>0)&1;
}
function nearby(a:readonly number[],b:readonly number[]){
 const d=Math.hypot(a[0]-b[0],a[2]-b[2]);
 return Number.isFinite(d)&&d>=.85&&d<=6;
}
/** All added amplitudes are below the existing V452 combine limits.
 * Determinism is based on playback time, not previous frames: seeking backward
 * produces exactly the same pose, and no global timers, sampling or state exist.
 */
export function refineNaturalDuetStageV584(base:RapDuetPlanV500,input:RapDuetInputV500):RapDuetPlanV500{
 const {cue,count,positions,progressMs}=input;
 if(!base.active||base.kind==='off'||base.kind!==cue.style||
    !input.playing||input.reducedMotion||input.manualPriority||input.tier==='low'||
    !input.trackId||input.trackId!==input.cueTrackId||!cue.active||
    !Number.isInteger(count)||count<2||count>4||base.slots.length!==count||cue.count!==count||
    !Number.isFinite(progressMs)||!Number.isFinite(cue.startMs)||!Number.isFinite(cue.endMs)||
    cue.endMs<=cue.startMs||progressMs<cue.startMs||progressMs>=cue.endMs||
    !Number.isInteger(cue.leadSlot)||cue.leadSlot<0||cue.leadSlot>=count||
    !Array.isArray(cue.singingSlots)||!cue.singingSlots.includes(cue.leadSlot)||
    cue.singingSlots.some(s=>!Number.isInteger(s)||s<0||s>=count)||
    positions.length<count||positions.slice(0,count).some(p=>p.length<3||!p.slice(0,3).every(Number.isFinite)))return base;
 const amount=clamp(input.strength??65,0,100)/100*(input.tier==='balanced'?.5:1);
 if(amount<.001)return base;
 const elapsed=progressMs-cue.startMs;
 const fade=ease(elapsed/220)*ease((cue.endMs-progressMs)/260);
 if(fade<=.00001)return base;
 // There is no reliable choreography beat when audio data is absent; impulses
 // use only the authored phrase clock. 2.4-second pulses are intentionally sparse.
 const phrase=((elapsed%2400)+2400)%2400;
 const singers=new Set(cue.singingSlots);
 const lead=cue.leadSlot;
 const outgoing=cue.handoffFrom!==null&&Number.isInteger(cue.handoffFrom)&&
   cue.handoffFrom>=0&&cue.handoffFrom<count&&cue.handoffFrom!==lead?cue.handoffFrom:null;
 const chorus=cue.style==='hook'&&singers.size===count;
 const duet=cue.style==='duet'&&cue.partnerSlot!==null&&
   Number.isInteger(cue.partnerSlot)&&cue.partnerSlot>=0&&cue.partnerSlot<count&&
   cue.partnerSlot!==lead&&singers.has(cue.partnerSlot);
 if(cue.style==='hook'&&!chorus || cue.style==='duet'&&!duet)return base;
 let changed=false;
 const slots=base.slots.map((entry,slot)=>{
   const singing=singers.has(slot);
   const side=mirror(input.trackId!,cue.lineIndex,slot)===0?1:0;
   let impulse=0,lookBoost=0;
   if(chorus){
     // A shared but alternating hook accent. Keep all faces to the audience.
     impulse=bell(phrase,420,300)*.025;
   }else if(outgoing!==null&&(slot===lead||slot===outgoing)&&nearby(positions[lead],positions[outgoing])){
     // Authored handoff: the new vocalist answers and the outgoing performer
     // acknowledges briefly. Never add a new singing slot or move the mouth.
     impulse=slot===lead?bell(elapsed,330,350)*.032:bell(elapsed,490,420)*.019;
     if(slot===outgoing)lookBoost=bell(elapsed,480,450)*.022;
   }else if(duet&&singing){
     const partner=slot===lead?cue.partnerSlot!:lead;
     if(nearby(positions[slot],positions[partner])){
       // Two voices remain front-facing most of the time; glance only briefly.
       const accent=bell(phrase,slot===lead?540:1110,350);
       impulse=accent*.025;
       lookBoost=accent*.025;
     }
   }else if(!singing&&nearby(positions[slot],positions[lead])){
     // Stagger listeners by slot so the full crew doesn't react in lockstep.
     impulse=bell(phrase,520+(slot%3)*410,260)*.014;
     lookBoost=impulse*.35;
   }
   const add=impulse*fade*amount;
   const glance=lookBoost*fade*amount;
   if(add<=.000001&&glance<=.000001)return entry;
   changed=true;
   // Existing V452 bounds are stricter; preserve the original role and
   // existing gaze direction instead of introducing a second look target.
   const gesture=zero(entry.gesture);
   gesture.leftLift=clamp(gesture.leftLift+add*(side?.75:.28),0,.13);
   gesture.rightLift=clamp(gesture.rightLift+add*(side?.28:.75),0,.13);
   gesture.shoulder=clamp(gesture.shoulder+add*.3,0,.065);
   gesture.intensity=clamp(gesture.intensity+add*.65,0,.28);
   return {...entry,gesture,look:glance>0&&entry.look.weight>0?
     {...entry.look,weight:clamp(entry.look.weight+glance,0,.46)}:entry.look};
 });
 return changed?{...base,slots}:base;
}
