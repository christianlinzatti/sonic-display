/** V664 – Natural Duet & Feature Interaction.
 * Pure, optional refinement of the *existing* V500/V616 visual duet planner.
 * Only explicit, track-matched V416/V496 roles are admissible. This function
 * does not infer vocalist identity, modify lyrics, operate a rig, move actors,
 * change mouth shapes, or create a separate render loop.
 */
import type {RapDuetInputV500,RapDuetPlanV500} from './intelligentRapDuetPerformanceV500';

export type NaturalDuetModeV664='off'|'natural'|'live';
const MODES:readonly NaturalDuetModeV664[]=['off','natural','live'];
let modeForSong:{trackId:string;mode:NaturalDuetModeV664}|null=null;
export function setNaturalDuetModeV664(trackId:string,mode:NaturalDuetModeV664):boolean{
 if(typeof trackId!=='string'||!trackId.trim()||trackId.length>250||!MODES.includes(mode))return false;
 modeForSong=mode==='off'?null:{trackId,mode};return true;
}
export function getNaturalDuetModeV664(trackId:string):NaturalDuetModeV664{
 return modeForSong?.trackId===trackId?modeForSong.mode:'off';
}
export function clearNaturalDuetModeV664(){modeForSong=null;}
export function clearNaturalDuetOnTrackChangeV664(trackId:string){
 if(modeForSong&&modeForSong.trackId!==trackId)modeForSong=null;
}
const clamp=(n:number,min:number,max:number)=>Number.isFinite(n)?Math.max(min,Math.min(max,n)):min;
const ease=(n:number)=>{const v=clamp(n,0,1);return v*v*(3-2*v);};
const bell=(t:number,center:number,halfWidth:number)=>ease(1-Math.abs(t-center)/halfWidth);
const close=(a:readonly number[],b:readonly number[])=>{
 const d=Math.hypot(a[0]-b[0],a[2]-b[2]);
 return Number.isFinite(d)&&d>=.85&&d<=5.5;
};

export function refineNaturalDuetFeatureV664(base:RapDuetPlanV500,input:RapDuetInputV500):RapDuetPlanV500{
 const {cue,progressMs,count,positions}=input;
 const mode=input.interactionModeV664??'off';
 if(mode==='off'||!MODES.includes(mode)||!base.active||base.kind==='off'||
   base.kind!==cue.style||!input.playing||input.manualPriority||input.reducedMotion||
   input.tier==='low'||!input.trackId||input.trackId!==input.cueTrackId||
   !cue.active||!(cue.source==='line-timed'||cue.source==='word-timed'||
     (cue.source==='none'&&cue.lineIndex===-1))||
   !Number.isFinite(progressMs)||!Number.isFinite(cue.startMs)||!Number.isFinite(cue.endMs)||
   cue.endMs<=cue.startMs||cue.endMs-cue.startMs>14000||
   progressMs<cue.startMs||progressMs>=cue.endMs||
   !Number.isInteger(count)||count<2||count>4||cue.count!==count||base.slots.length!==count||
   !Number.isInteger(cue.leadSlot)||cue.leadSlot<0||cue.leadSlot>=count||
   !Array.isArray(cue.singingSlots)||!cue.singingSlots.includes(cue.leadSlot)||
   cue.singingSlots.some(n=>!Number.isInteger(n)||n<0||n>=count)||
   !Number.isInteger(cue.lineIndex)||cue.lineIndex< -1||
   positions.length<count||positions.slice(0,count).some(p=>p.length<3||!p.slice(0,3).every(Number.isFinite)))return base;
 const lead=cue.leadSlot;
 const partner=cue.partnerSlot;
 const duet=cue.style==='duet'&&partner!==null&&Number.isInteger(partner)&&
   partner>=0&&partner<count&&partner!==lead&&cue.singingSlots.includes(partner)&&
   close(positions[lead],positions[partner]);
 const reply=cue.style==='reply'&&cue.handoffFrom!==null&&
   Number.isInteger(cue.handoffFrom)&&cue.handoffFrom>=0&&cue.handoffFrom<count&&
   cue.handoffFrom!==lead&&close(positions[lead],positions[cue.handoffFrom]);
 const hook=cue.style==='hook'&&new Set(cue.singingSlots).size===count;
 if(!duet&&!reply&&!hook)return base;
 const gain=clamp(input.strength??65,0,100)/100*(mode==='live'?.92:.53)*
   (input.tier==='balanced'?.6:1);
 if(gain<=.0001)return base;
 const elapsed=progressMs-cue.startMs;
 const fade=ease(elapsed/160)*ease((cue.endMs-progressMs)/230);
 if(fade<=.00001)return base;
 const handoffStart=cue.lineIndex===-1?cue.startMs:
   cue.startMs+(cue.endMs-cue.startMs)*.62;
 const handoffElapsed=progressMs-handoffStart;
 const phrase=((elapsed%3200)+3200)%3200;
 let changed=false;
 const slots=base.slots.map((entry,slot)=>{
   let gestureAmount=0,lookAmount=0;
   if(reply){
     if(handoffElapsed<0||handoffElapsed>1250)return entry;
     if(slot===cue.handoffFrom){
       gestureAmount=bell(handoffElapsed,460,440)*.011;
       lookAmount=bell(handoffElapsed,430,420)*.009;
     }else if(slot===lead){
       gestureAmount=bell(handoffElapsed,690,500)*.012;
       lookAmount=bell(handoffElapsed,260,240)*.006;
     }
   }else if(duet&&(slot===lead||slot===partner)){
     // Gentle alternating glances: different singer on each half phrase.
     const center=slot===lead?650:1880;
     const accent=bell(phrase,center,420);
     gestureAmount=accent*.010;
     lookAmount=accent*.010;
   }else if(hook){
     // All singers remain audience-facing; vary accents without a common jump.
     const center=430+(slot%3)*340+((cue.lineIndex%2)*100);
     gestureAmount=bell(phrase,center,310)*.009;
   }
   const accent=gestureAmount*fade*gain;
   const glance=lookAmount*fade*gain;
   if(accent<=.0000001&&glance<=.0000001)return entry;
   const g=entry.gesture;
   // Existing V452 combination/rig safety still applies. No new look target:
   // a verified existing look must already be directed at the partner.
   const look=glance>0&&entry.look.weight>0&&Math.abs(entry.look.yaw)>1e-6?
     {...entry.look,weight:clamp(entry.look.weight+glance,0,.46)}:entry.look;
   const side=(slot+cue.lineIndex)%2===0;
   changed=true;
   return {...entry,look,gesture:{...g,
     leftLift:clamp(g.leftLift+accent*(side?.68:.25),0,.13),
     rightLift:clamp(g.rightLift+accent*(side?.25:.68),0,.13),
     shoulder:clamp(g.shoulder+accent*.25,0,.065),
     intensity:clamp(g.intensity+accent*.48,0,.28),
   }};
 });
 return changed?{...base,slots}:base;
}
