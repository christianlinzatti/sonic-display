import type { ShowCue } from "./ultimateShowDirectorV306";
import type { MultiAvatarCue, DuoRole } from "./multiAvatarChoreography";

/** V312 — phrase-quantized, playback-clock-based duet choreography.
 * V306 is the single section authority. This module never reads Spotify audio/stems,
 * changes animation assets, or generates per-frame random role changes. */
export const CHOREOGRAPHY_V312_KEY = "sonic-intelligent-choreography-v312";
export const CHOREOGRAPHY_V312_EVENT = "sonic-intelligent-choreography-v312-change";
export type ChoreographyStyleV312 = "auto" | "dialogue" | "rave" | "cinematic";
export type InteractionV312 = "exchange" | "spotlight" | "unison" | "rest";
export interface ChoreographySettingsV312 {
  enabled: boolean;
  style: ChoreographyStyleV312;
  barsPerExchange: number;
  soloContrast: number;
  interaction: number;
  variety: number;
  dropTogether: boolean;
}
export const DEFAULT_CHOREOGRAPHY_V312: ChoreographySettingsV312 = {
  enabled:true, style:"auto", barsPerExchange:4, soloContrast:68, interaction:60, variety:65, dropTogether:true,
};
const bound=(v:unknown,def:number,min:number,max:number)=>typeof v==="number"&&Number.isFinite(v)?Math.max(min,Math.min(max,v)):def;
const safeMs=(v:number)=>Number.isFinite(v)?Math.max(0,v):0;
export function normalizeChoreographyV312(v:unknown):ChoreographySettingsV312 {
  const x=v&&typeof v==="object"&&!Array.isArray(v)?v as Partial<ChoreographySettingsV312>:{};
  return {enabled:x.enabled!==false,style:x.style==="dialogue"||x.style==="rave"||x.style==="cinematic"?x.style:"auto",
    barsPerExchange:Math.round(bound(x.barsPerExchange,4,2,16)),soloContrast:Math.round(bound(x.soloContrast,68,0,100)),
    interaction:Math.round(bound(x.interaction,60,0,100)),variety:Math.round(bound(x.variety,65,0,100)),dropTogether:x.dropTogether!==false};
}
export function readChoreographyV312():ChoreographySettingsV312 {
  if(typeof window==="undefined")return {...DEFAULT_CHOREOGRAPHY_V312};
  try{return normalizeChoreographyV312(JSON.parse(window.localStorage.getItem(CHOREOGRAPHY_V312_KEY)??"null"));}catch{return {...DEFAULT_CHOREOGRAPHY_V312};}
}
export function writeChoreographyV312(value:unknown):ChoreographySettingsV312 {
  const next=normalizeChoreographyV312(value);
  if(typeof window!=="undefined"){
    try{window.localStorage.setItem(CHOREOGRAPHY_V312_KEY,JSON.stringify(next));}catch{}
    window.dispatchEvent(new Event(CHOREOGRAPHY_V312_EVENT));
  }
  return next;
}
export type ChoreographyCueV312 = MultiAvatarCue & { interactionMode:InteractionV312; interactionStrength:number; variation:number; };
export type ChoreographyStateV312={trackId:string; atMs:number; section:ShowCue["section"]|null; phrase:number; cue:ChoreographyCueV312|null};
export const initialChoreographyV312=():ChoreographyStateV312=>({trackId:"",atMs:-1,section:null,phrase:-1,cue:null});
export type ChoreographyInputV312={trackId:string;progressMs:number;playing:boolean;reducedMotion:boolean;bpm:number|null|undefined;genre?:string|null;showCue:ShowCue;settings:ChoreographySettingsV312};

function chooseStyle(input:ChoreographyInputV312):Exclude<ChoreographyStyleV312,"auto">{
  if(input.settings.style!=="auto")return input.settings.style;
  if(input.showCue.style==="rap"||/rap|hip.?hop|trap|drill/i.test(input.genre??""))return "dialogue";
  if(input.showCue.style==="rave")return "rave";
  return "cinematic";
}
function phraseCue(input:ChoreographyInputV312,phrase:number,canAccent:boolean):ChoreographyCueV312{
  const section=input.showCue.section;
  const style=chooseStyle(input);
  const intensity=input.settings.interaction/100;
  const contrast=input.settings.soloContrast/100;
  const variation=input.settings.variety/100;
  const energy=section==="drop"||section==="hook";
  let role:DuoRole="together";
  let interactionMode:InteractionV312="unison";
  if(section==="break") {role="lead-solo";interactionMode="rest";}
  else if(section==="build") {role="partner-solo";interactionMode="spotlight";}
  else if(section==="drop") {role=input.settings.dropTogether?"together":phrase%2?"partner-solo":"lead-solo";interactionMode=role==="together"?"unison":"spotlight";}
  else if(section==="verse"||section==="hook"){
    if(section==="hook" && style==="rave") {role="together";interactionMode="unison";}
    else {
      const cycle=(style==="cinematic"||variation<.25)?["lead-solo","partner-solo","together"]:["lead-solo","partner-solo","together","partner-solo"];
      role=cycle[phrase%cycle.length] as DuoRole;
      interactionMode=role==="together"?"unison":"exchange";
    }
  }
  // V313 adds the song-wide narrative without replacing V312's phrase clock or authored choreography.
  const narrative=input.showCue.evolution;
  if(narrative && !input.reducedMotion){
    if(narrative.phase==="intro" && section==="verse"){role="lead-solo";interactionMode="spotlight";}
    if(narrative.phase==="rise" && section==="build"){role="partner-solo";interactionMode="spotlight";}
    if(narrative.phase==="finale" && energy){role="together";interactionMode="unison";}
  }
  const quiet=1-.88*contrast;
  const together=role==="together";
  const showWide=(section==="drop"||section==="hook"&&style==="rave");
  return {
    scene:together?(showWide?"sync":style==="cinematic"?"mirror":"sync"):"duet",
    role,leadGain:role==="partner-solo"?quiet:1,partnerGain:role==="lead-solo"?quiet:1,phrase,
    formation:showWide?"wide":section==="build"||interactionMode==="exchange"&&phrase%2!==0&&variation>.3?"diagonal":"line",
    partnerDelayBeats:together?0:interactionMode==="exchange"?Math.round(intensity*2)/2:0,
    dropAccent:canAccent&&section==="drop"&&input.settings.dropTogether&&!input.reducedMotion,
    interactionMode,interactionStrength:input.reducedMotion?0:intensity*(narrative?.phase==="intro"?.5:1),variation:energy?variation:variation*.6
  };
}
/** Returns the previous cue for pause/duplicate clock samples; reinitializes cleanly on seek and track change. */
export function advanceChoreographyV312(state:ChoreographyStateV312,input:ChoreographyInputV312):ChoreographyStateV312 {
  const at=safeMs(input.progressMs);
  const bpm=bound(input.bpm,120,60,220);
  const beatMs=60_000/bpm;
  const bars=input.settings.barsPerExchange;
  const sectionStart=Math.max(0,Math.min(at,safeMs(input.showCue.sectionStartMs)));
  const phrase=Math.max(0,Math.floor((at-sectionStart)/(beatMs*4*bars)));
  const reset=state.trackId!==input.trackId||state.atMs<0||at<state.atMs-1200||at>state.atMs+10000;
  const sectionChanged=state.section!==input.showCue.section;
  if(!input.settings.enabled||!input.showCue.enabled||!input.showCue.formationsEnabled)return initialChoreographyV312();
  if(input.reducedMotion){
    const still=phraseCue({...input,settings:{...input.settings,dropTogether:false}},0,false);
    return {trackId:input.trackId,atMs:at,section:input.showCue.section,phrase:0,cue:{...still,scene:"sync",role:"together",formation:"line",leadGain:1,partnerGain:1,partnerDelayBeats:0,dropAccent:false,interactionMode:"rest",interactionStrength:0}};
  }
  if(!input.playing&&state.cue&&!reset)return {...state,atMs:at,cue:{...state.cue,dropAccent:false}};
  if(!input.playing)return {trackId:input.trackId,atMs:at,section:input.showCue.section,phrase,cue:{...phraseCue(input,phrase,false),dropAccent:false}};
  if(!reset&&!sectionChanged&&state.phrase===phrase&&state.cue) {
    // Impact expires in a bounded musical window; the rest of the choreography is stable.
    const accent=state.cue.dropAccent&&at-sectionStart<beatMs*2;
    return {...state,atMs:at,cue:accent===state.cue.dropAccent?state.cue:{...state.cue,dropAccent:false}};
  }
  const impact=!reset&&sectionChanged&&input.showCue.section==="drop"&&at-sectionStart<beatMs*2;
  return {trackId:input.trackId,atMs:at,section:input.showCue.section,phrase,cue:phraseCue(input,phrase,impact)};
}
