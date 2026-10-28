/** V614 – song-section-aware, conservative crossfade planning for automatic GLB clips.
 * This is a pure timing policy, NOT a replacement mixer or animation scheduler.
 * V537 owns entry-time matching; V135 owns planted IK feet; authored motion owns itself.
 * No vocal identity, song section, or beat can be inferred from clip filenames.
 */
export type MotionFlowStateV614 = Readonly<{
  trackId: string | null;
  lastClip: string | null;
  lastChangeMs: number | null;
  section: string | null;
}>;
export type MotionFlowPlanV614 = Readonly<{
  enabled: boolean;
  fadeSeconds: number;
  style: 'original'|'rap'|'build'|'break'|'hook'|'drop'|'foot-contact';
  acceleratedByOnset: boolean;
  previousSwitchWasRapid: boolean;
  state: MotionFlowStateV614;
}>;
const clamp = (n:number,min:number,max:number) => Math.max(min,Math.min(max,Number.isFinite(n)?n:min));
const valid = (n:number|undefined|null):n is number => typeof n === 'number' && Number.isFinite(n);
export const createNaturalMotionFlowStateV614 = ():MotionFlowStateV614 => ({
  trackId:null,lastClip:null,lastChangeMs:null,section:null,
});
export function planNaturalMotionFlowV614(state:MotionFlowStateV614,input:{
  trackId?:string|null; progressMs?:number|null;
  outgoingName?:string|null;incomingName?:string|null;
  outgoingDuration?:number|null;incomingDuration?:number|null;
  baseSeconds:number;section?:string|null;genre?:string|null;bpm?:number|null;
  energy?:number|null;kickOnset?:number|null;snareOnset?:number|null;
  plantedLeft:boolean;plantedRight:boolean;matchScore?:number|null;
  automatic:boolean;playing:boolean;reducedMotion:boolean;quality?:string|null;
}):MotionFlowPlanV614{
  const original=clamp(input.baseSeconds,.08,1.5);
  const trackId=typeof input.trackId==='string'&&input.trackId.length?input.trackId:null;
  const ms=valid(input.progressMs)&&input.progressMs>=0?input.progressMs:null;
  const section=typeof input.section==='string'?input.section.trim().toLowerCase():null;
  const changed=!!input.incomingName&&input.incomingName!==input.outgoingName;
  const sameTrack=trackId!==null&&state.trackId===trackId;
  // A backward seek or a new track invalidates switch history. The next clip
  // still follows the already-approved V537/V565 plan without interpolation surprises.
  const seekingBack=sameTrack&&ms!==null&&state.lastChangeMs!==null&&ms+800<state.lastChangeMs;
  const rapid=sameTrack&&!seekingBack&&ms!==null&&state.lastChangeMs!==null&&
    ms>=state.lastChangeMs&&ms-state.lastChangeMs<2300;
  const nextState:MotionFlowStateV614 = changed ? {
    trackId,lastClip:input.incomingName??null,lastChangeMs:ms,section,
  } : state;
  const unchanged=(style:MotionFlowPlanV614['style']='original'):MotionFlowPlanV614=>({
    enabled:false,fadeSeconds:original,style,acceleratedByOnset:false,previousSwitchWasRapid:false,state:nextState,
  });
  const outgoing=input.outgoingDuration,incoming=input.incomingDuration;
  if(!input.automatic||!input.playing||input.reducedMotion||input.quality==='low'||
     !changed||!input.outgoingName||!valid(outgoing)||!valid(incoming)||
     outgoing<.36||incoming<.36||!Number.isFinite(input.baseSeconds)||input.baseSeconds<=0||
     seekingBack)return unchanged();
  const planted=!!input.plantedLeft||!!input.plantedRight;
  const onset=Math.max(clamp(input.kickOnset??0,0,1),clamp(input.snareOnset??0,0,1));
  const measuredAccent=onset>=.52;
  const sect=section??'';
  const isRap=/(?:deutschrap|\brap\b|hip.?hop|trap)/i.test(input.genre??'');
  let style:MotionFlowPlanV614['style']='original';
  let multiplier=1;
  if(/^(break|breakdown|bridge|instrumental|interlude|intro|outro)$/.test(sect)){
    style='break';multiplier=1.25;
    if(valid(input.energy)&&input.energy>=0&&input.energy<.32)multiplier*=1.05;
  }else if(/^(build|buildup|prechorus|pre-chorus)$/.test(sect)){
    style='build';multiplier=1.13;
  }else if(/^(verse|strophe|rap)$/.test(sect)){
    style='rap';multiplier=isRap?1.20:1.10;
  }else if(/^(hook|chorus|refrain)$/.test(sect)){
    style='hook';multiplier=1.10;
  }else if(sect==='drop'){
    style='drop';multiplier=measuredAccent?0.91:1.08;
  }
  // No fabricated kick: a loudness value alone cannot authorize a drop cut.
  // On grounded feet V135 keeps IK anchors; increase the blend, never reset IK.
  if(planted){style='foot-contact';multiplier=Math.max(multiplier,1.22);}
  // When directors switch clips unusually soon, favor continuity over a hard cut.
  if(rapid)multiplier*=1.12;
  if(valid(input.matchScore)&&input.matchScore>.70)multiplier*=1.11;
  // Respect musical timing: more than ~2 beats on fast music can blur footwork.
  const bpm=valid(input.bpm)&&input.bpm>0?clamp(input.bpm,55,240):null;
  const beatCeiling=bpm===null?1.20:Math.min(1.20,120/bpm*(planted?1.85:1.55));
  // Importers can deliver short GLBs: don't crossfade through an entire clip.
  const clipCeiling=.42*Math.min(outgoing,incoming);
  const fade=clamp(Math.min(original*multiplier,beatCeiling,clipCeiling),.08,1.20);
  return {enabled:true,fadeSeconds:fade,style,
    acceleratedByOnset:style==='drop'&&measuredAccent,previousSwitchWasRapid:rapid,state:nextState};
}
