/** V310 Smart Show Quality Director: deterministic, playback-time-only show pacing. */
import type { StageSection } from "./stageDirectorV287";
import type { ShowCameraShot, ShowCue, ShowFormation } from "./ultimateShowDirectorV306";

export const SHOW_QUALITY_KEY_V310 = "sonic-show-quality-v310";
export const SHOW_QUALITY_EVENT_V310 = "sonic-show-quality-v310-change";
export type ShowQualitySettingsV310 = {
  enabled: boolean;
  variety: number; // 0-100: more variety, but never off-phrase randomness
  minHoldSeconds: number; // minimum duration before a within-section camera change
  dancerFocus: number; // 0-100: prevent excess lights/effects obscuring the avatars
  fxCeiling: number; // 0-100: maximum automatic cue effects
};
export const DEFAULT_SHOW_QUALITY_V310: Readonly<ShowQualitySettingsV310> = Object.freeze({
  enabled: true, variety: 65, minHoldSeconds: 14, dancerFocus: 70, fxCeiling: 75,
});
const clamp = (value:number,min:number,max:number):number => Number.isFinite(value) ? Math.max(min,Math.min(max,value)) : min;
const num = (raw:unknown,def:number,min:number,max:number):number => typeof raw === "number" && Number.isFinite(raw) ? Math.round(clamp(raw,min,max)) : def;
export function normalizeShowQualitySettingsV310(raw:unknown):ShowQualitySettingsV310 {
  if(!raw || typeof raw!=="object" || Array.isArray(raw))return {...DEFAULT_SHOW_QUALITY_V310};
  const p=raw as Record<string,unknown>;
  return {enabled:p.enabled!==false,variety:num(p.variety,65,0,100),minHoldSeconds:num(p.minHoldSeconds,14,8,40),dancerFocus:num(p.dancerFocus,70,0,100),fxCeiling:num(p.fxCeiling,75,0,100)};
}
export function readShowQualitySettingsV310():ShowQualitySettingsV310 {
  if(typeof window==="undefined")return {...DEFAULT_SHOW_QUALITY_V310};
  try{return normalizeShowQualitySettingsV310(JSON.parse(window.localStorage.getItem(SHOW_QUALITY_KEY_V310)??"null"));}catch{return {...DEFAULT_SHOW_QUALITY_V310};}
}
export function writeShowQualitySettingsV310(value:ShowQualitySettingsV310):void {
  if(typeof window==="undefined")return;
  try{window.localStorage.setItem(SHOW_QUALITY_KEY_V310,JSON.stringify(normalizeShowQualitySettingsV310(value)));}catch{/* storage blocked */}
  window.dispatchEvent(new Event(SHOW_QUALITY_EVENT_V310));
}
export type ShowQualityInputV310 = {
  trackId:string; progressMs:number; playing:boolean; reducedMotion:boolean;
  bpm?:number|null; energy:number; cue:ShowCue; settings:ShowQualitySettingsV310;
};
export type ShowQualityStateV310 = {
  trackId:string; at:number; section:StageSection; style:ShowCue["style"];
  decisionAtMs:number; shot:ShowCameraShot; formation:ShowFormation;
  shotHistory:ShowCameraShot[]; formationHistory:ShowFormation[]; revision:number;
};
export function initialShowQualityV310():ShowQualityStateV310 {
  return {trackId:"",at:-1,section:"verse",style:"cinematic",decisionAtMs:-1,shot:"groove",formation:"solo",shotHistory:[],formationHistory:[],revision:0};
}
const SHOTS:Record<StageSection,readonly ShowCameraShot[]> = {
  verse:["groove","intimate","hero"],hook:["hero","wide","groove"],
  build:["rise","hero"],drop:["wide","hero"],break:["intimate","groove"],
};
const FORMATIONS:Record<ShowCue["style"],Record<StageSection,readonly ShowFormation[]>> = {
  rave:{verse:["duet","mirror"],hook:["mirror","sync"],build:["duet","mirror"],drop:["sync"],break:["solo","duet"]},
  rap:{verse:["solo","duet"],hook:["duet","sync"],build:["mirror","duet"],drop:["sync"],break:["solo"]},
  cinematic:{verse:["duet","solo"],hook:["mirror","duet"],build:["duet","mirror"],drop:["sync"],break:["solo","duet"]},
};
function nextChoice<T extends string>(options:readonly T[],preferred:T,recent:readonly T[],variety:number,revision:number):T {
  if(variety<20 || options.length<2 || recent.length===0)return options.includes(preferred)?preferred:options[0];
  // Strongly discourage the previous choice; older history is a weaker signal.
  const weights=options.map((candidate,index)=>{
    const last=recent[recent.length-1];
    const previous=recent[recent.length-2];
    const prior=recent[recent.length-3];
    const repetition=(candidate===last?5:0)+(candidate===previous?2:0)+(candidate===prior?1:0);
    const preferredPenalty=candidate===preferred?0:1.3;
    return {candidate,score:repetition*(variety/100)+preferredPenalty+(index+revision%2)*.001};
  });
  weights.sort((a,b)=>a.score-b.score);
  return weights[0].candidate;
}
function reset(input:ShowQualityInputV310,at:number):ShowQualityStateV310 {
  return {trackId:input.trackId,at,section:input.cue.section,style:input.cue.style,decisionAtMs:at,
    shot:input.cue.cameraShot,formation:input.cue.formation,
    shotHistory:[input.cue.cameraShot],formationHistory:[input.cue.formation],revision:0};
}
/** Never select based on Date.now, rendered frames or unstable random values.
 * Track/seek resets and pause freeze the planner. Phrases gate within-section edits.
 */
export function advanceShowQualityV310(state:ShowQualityStateV310,input:ShowQualityInputV310):ShowQualityStateV310 {
  const at=Number.isFinite(input.progressMs)?Math.max(0,input.progressMs):0;
  if(state.trackId!==input.trackId || state.at<0 || at<state.at-1200 || at>state.at+10_000)return reset(input,at);
  if(!input.settings.enabled || !input.cue.enabled)return {...state,at};
  if(!input.playing || at<=state.at)return {...state,at};
  const sectionChanged=state.section!==input.cue.section || state.style!==input.cue.style;
  const bpm=typeof input.bpm==="number"&&Number.isFinite(input.bpm)&&input.bpm>=55&&input.bpm<=240?input.bpm:120;
  // Eight bars; coarse musical slots that do not depend on React render frequency.
  const phraseMs=32*60_000/bpm;
  const advancedPhrase=Math.floor(at/phraseMs)>Math.floor(state.decisionAtMs/phraseMs);
  const heldMs=at-state.decisionAtMs;
  const optionalPhrase=advancedPhrase&&heldMs>=input.settings.minHoldSeconds*1000&&input.settings.variety>=45;
  if(!sectionChanged && !optionalPhrase)return {...state,at};
  const shot=nextChoice(SHOTS[input.cue.section],input.cue.cameraShot,state.shotHistory,input.settings.variety,state.revision);
  // A drop must remain synchronous; no arbitrary group swap inside one section.
  const formation=sectionChanged
    ? nextChoice(FORMATIONS[input.cue.style][input.cue.section],input.cue.formation,state.formationHistory,input.settings.variety,state.revision)
    : state.formation;
  return {...state,at,section:input.cue.section,style:input.cue.style,decisionAtMs:at,shot,formation,
    shotHistory:[...state.shotHistory,shot].slice(-4),
    formationHistory:sectionChanged?[...state.formationHistory,formation].slice(-4):state.formationHistory,
    revision:state.revision+1};
}
/** V310 never enables an opt-out subsystem, introduces camera movement in reduced-motion
 * mode, or overrides manually authored lighting blackouts/keyframes. */
export function applyShowQualityV310(base:ShowCue,state:ShowQualityStateV310,input:ShowQualityInputV310):ShowCue {
  if(!base.enabled || !input.settings.enabled)return base;
  const lowEnergy=clamp(input.energy,0,1);
  const focus=clamp(input.settings.dancerFocus/100,0,1);
  const quiet=base.section==="break" || (base.section==="verse"&&lowEnergy<.40);
  const energyPacing=quiet ? .48 + lowEnergy*.30 : 1;
  const showFxMax=clamp(input.settings.fxCeiling/100,0,1);
  const fxFocus=1-.48*focus;
  const fxGain=base.fxEnabled ? Math.min(base.fxGain,showFxMax)*fxFocus*energyPacing : 0;
  const lightGain=base.lightingEnabled ? Math.min(base.lightGain,1.42-.20*focus)*(quiet?1-.10*focus:1) : base.lightGain;
  const beamGain=base.lightingEnabled ? Math.min(base.beamGain,1.45-.30*focus)*(quiet?1-.22*focus:1) : base.beamGain;
  const shot=base.cameraEnabled&&!input.reducedMotion?state.shot:base.cameraShot;
  const cameraGain=base.cameraEnabled&&!input.reducedMotion?base.cameraGain*(quiet?1-.35*focus:1-.16*focus):base.cameraGain;
  const formation=base.formationsEnabled&&!input.reducedMotion?state.formation:base.formation;
  return {...base,cameraShot:shot,formation,cameraGain,fxGain,lightGain,beamGain};
}
