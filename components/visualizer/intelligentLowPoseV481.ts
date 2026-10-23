/** V481 – deterministic, bounded low-pose cues for AUTOMATIC 3–4 dancer groups.
 * Decisions are visual stage choreography; artist credits are not singer timestamps.
 * A pose describes intent, not a promise that an imported GLB contains that motion.
 */
export type LowPoseModeV481 = 'stand'|'crouch'|'low-bounce'|'kneel'|'rap-lean';
export type LowPoseIntensityV481 = 'subtle'|'medium'|'strong';
export type LowPoseSettingsV481 = {
  enabled:boolean; intensity:LowPoseIntensityV481; maxConcurrent:1|2|3|4;
  synchronizedDrops:boolean;
};
export type LowPoseSlotV481 = {mode:LowPoseModeV481; depth:number};
export type LowPosePlanV481 = {active:boolean;slots:LowPoseSlotV481[];source:'automatic-stage'|'disabled'};
export type LowPoseInputV481 = {
  settings:LowPoseSettingsV481; count:number; trackId?:string|null; seconds:number;
  cueSeconds:number; focus:number; drop:boolean; section?:string|null; genre?:string|null;
  beat:number; kick:number; energy:number; playing:boolean; reducedMotion:boolean;
  automaticGroup:boolean; manualPriority:boolean; lyricsForeground:boolean;
  tier:'high'|'balanced'|'low';
};
export const LOW_POSE_KEY_V481='sonic-low-pose-v481';
export const LOW_POSE_EVENT_V481='sonic:low-pose-v481';
export const DEFAULT_LOW_POSE_V481:LowPoseSettingsV481={enabled:true,intensity:'medium',maxConcurrent:2,synchronizedDrops:true};
const clamp=(n:number,min:number,max:number)=>Math.max(min,Math.min(max,n));
const finite=(n:unknown)=>typeof n==='number'&&Number.isFinite(n);
export function normalizeLowPoseV481(value:unknown):LowPoseSettingsV481{
 const raw=value&&typeof value==='object'&&!Array.isArray(value)?value as Partial<LowPoseSettingsV481>:{};
 return {enabled:raw.enabled!==false,
  intensity:raw.intensity==='subtle'||raw.intensity==='strong'?raw.intensity:'medium',
  maxConcurrent:raw.maxConcurrent===1||raw.maxConcurrent===3||raw.maxConcurrent===4?raw.maxConcurrent:2,
  synchronizedDrops:raw.synchronizedDrops!==false};
}
export function readLowPoseV481():LowPoseSettingsV481{
 if(typeof window==='undefined')return {...DEFAULT_LOW_POSE_V481};
 try{return normalizeLowPoseV481(JSON.parse(window.localStorage.getItem(LOW_POSE_KEY_V481)||'null'));}
 catch{return {...DEFAULT_LOW_POSE_V481};}
}
export function writeLowPoseV481(value:unknown):LowPoseSettingsV481{
 const clean=normalizeLowPoseV481(value);
 if(typeof window!=='undefined'){
  try{window.localStorage.setItem(LOW_POSE_KEY_V481,JSON.stringify(clean));}catch{/* Private browsing or quota. */}
  window.dispatchEvent(new Event(LOW_POSE_EVENT_V481));
 }
 return clean;
}
const disabled=(count:number):LowPosePlanV481=>({active:false,slots:Array.from({length:Math.max(0,Math.min(4,count||0))},()=>({mode:'stand',depth:0})),source:'disabled'});
/** Pure cue plan. Existing GLB motions, animation mixer and foot IK retain ownership. */
export function planLowPosesV481(input:LowPoseInputV481):LowPosePlanV481{
 const count=input.count;
 if(!input.settings.enabled||!input.automaticGroup||input.manualPriority||!input.playing||input.reducedMotion||
   input.lyricsForeground||!input.trackId||count<3||count>4||!Number.isInteger(count)||
   ![input.seconds,input.cueSeconds,input.focus,input.beat,input.kick,input.energy].every(finite)||
   input.seconds<0||input.cueSeconds<0||input.beat<0||input.kick<0||input.energy<0)
  return disabled(count);
 const slots:LowPoseSlotV481[]=Array.from({length:count},()=>({mode:'stand',depth:0}));
 const start=Math.max(0,input.seconds-input.cueSeconds);
 // A stable, seek-safe entry and exit; no random animation or external audio request.
 const fadeIn=clamp(start/.48,0,1);
 const phase=Math.floor(input.cueSeconds*2+0.5)+Math.floor(input.seconds/8);
 const rap=/rap|hip.?hop|trap|drill|deutsch/i.test(input.genre??'');
 const hard=/hardstyle|hardtekk|hardcore|gabber|techno/i.test(input.genre??'');
 const accent=Math.max(input.beat,input.kick);
 const hook=input.drop||/hook|chorus|drop|finale/i.test(input.section??'');
 const strength=input.settings.intensity==='subtle'?.42:input.settings.intensity==='strong'?1:.7;
 const quality=input.tier==='low'?.52:input.tier==='balanced'?.82:1;
 // No proof of a beat/drop means no invented shared drop; a chorus can still use subtle formation poses.
 const synchronized=hook&&input.settings.synchronizedDrops&&accent>=.56&&input.energy>=.3&&input.tier!=='low';
 const budget=synchronized?count:Math.min(count,input.settings.maxConcurrent,input.tier==='low'?1:count);
 const lead=input.focus>=0&&input.focus<count?input.focus:phase%count;
 const eligible=Array.from({length:count},(_,i)=>i).filter(i=>synchronized||i!==lead);
 const rotation=eligible.length?(phase%eligible.length):0;
 const selected=synchronized?eligible:eligible.slice(rotation).concat(eligible.slice(0,rotation)).slice(0,budget);
 const eligibleScene=hook||rap||hard||input.energy>.48;
 if(!eligibleScene)return disabled(count);
 for(const i of selected){
   const motif=synchronized?'crouch':hard&&input.kick>.63?'low-bounce':(phase+i)%5===0&&rap?'kneel':rap&&input.energy<.4?'rap-lean':'crouch';
   // Only an existing GLB clip can turn a requested squat or kneel into real skeletal motion.
   const bounce=motif==='low-bounce'?(.85+.15*clamp(input.beat,0,1)):1;
   const depth=clamp((.24+.34*strength)*quality*fadeIn*bounce,0,.58);
   slots[i]={mode:motif,depth:Math.round(depth*1000)/1000};
 }
 return {active:slots.some(s=>s.depth>.001),slots,source:'automatic-stage'};
}
/** Recognize credible existing GLB motion clips. Do not invent a clip from a partial rig. */
export function findLowPoseClipV481(names:readonly string[],mode:LowPoseModeV481):string|null{
 if(mode==='stand'||mode==='rap-lean')return null;
 const patterns:RegExp[]=mode==='kneel'?[/(?:^|[^a-z])kneel(?:ing)?(?:$|[^a-z])/i]:
  mode==='low-bounce'?[/low.?bounce|squat.?bounce/i,/(?:^|[^a-z])(?:squat|crouch)(?:ing)?(?:$|[^a-z])/i]:
  [/(?:^|[^a-z])(?:squat|crouch)(?:ing)?(?:$|[^a-z])/i];
 for(const pattern of patterns){const name=names.find(name=>pattern.test(name));if(name)return name;}
 return null;
}

/** V481: two equal-length procedural segments pivot symmetrically so ankle Y
 * remains at the rest position as the pelvis drops. This is kinematics, not
 * world-space collision detection or a replacement for GLB foot IK. */
export function solveProceduralLowLegV481(depth:number,legLength=.96):{drop:number;hipAngle:number;kneeAngle:number;ankleError:number}{
 const length=finite(legLength)&&legLength>.1?legLength:.96;
 const drop=clamp(finite(depth)?depth:0,0,length*.28);
 const hipAngle=Math.acos(clamp(1-drop/length,0,1));
 const kneeAngle=2*hipAngle;
 const ankleError=-drop-length*Math.cos(hipAngle)+length;
 return {drop,hipAngle,kneeAngle,ankleError};
}
