import type { DanceSection } from "./intelligentDanceCombinationV242";

/** Observational, causal detector: does not pretend to receive isolated Spotify stems. */
export type MusicStructureSample = { energy:number; bass:number; kick:number; attack:number; anticipation:number; playing:boolean; progressMs:number; trackId:string };
export type LiveStructureState = {trackId:string;at:number;section:DanceSection;since:number;energy:number;previousEnergy:number;quietMs:number;highMs:number;buildMs:number;confidence:number;revision:number};
const clip=(n:number)=>Number.isFinite(n)?Math.max(0,Math.min(1,n)):0;
export const initialLiveStructure=():LiveStructureState=>({trackId:"",at:-1,section:"verse",since:0,energy:0,previousEnergy:0,quietMs:0,highMs:0,buildMs:0,confidence:0,revision:0});
/** Music time, not wall-clock: seek/restart and pause cannot produce phantom transitions. */
export function advanceLiveStructure(s:LiveStructureState,x:MusicStructureSample):LiveStructureState {
 const at=Number.isFinite(x.progressMs)?Math.max(0,x.progressMs):0;
 if(!x.playing)return {...s,at,quietMs:0,highMs:0,buildMs:0};
 if(x.trackId!==s.trackId||at<s.at-1200)return {...initialLiveStructure(),trackId:x.trackId,at,since:at};
 const dt=s.at<0?0:Math.max(0,Math.min(350,at-s.at));
 if(dt===0)return s;
 const energy=s.energy+(clip(x.energy)-s.energy)*Math.min(1,dt/620);
 const bass=clip(x.bass),kick=clip(x.kick),attack=clip(x.attack),anticipation=clip(x.anticipation);
 const quiet=energy<.22&&bass<.23&&kick<.24;
 const strong=energy>.50&&(bass>.34||kick>.43);
 const rising=energy-s.energy>.018||anticipation>.64;
 const quietMs=quiet?Math.min(6000,s.quietMs+dt):0;
 const highMs=strong?Math.min(6000,s.highMs+dt):0;
 const buildMs=rising&&energy>.26?Math.min(5000,s.buildMs+dt):Math.max(0,s.buildMs-dt*.65);
 let section=s.section, confidence=s.confidence;
 const since=at-s.since;
 // Strong onset after a build/break is a high-confidence drop cue.
 if((s.section==='build'||s.section==='break')&&strong&&attack>.55&&since>=850){section='drop';confidence=.85;}
 else if(s.section==='drop'&&since>=2600&&highMs>=950){section='hook';confidence=.66;}
 else if(quietMs>=1350&&since>=1600){section='break';confidence=.76;}
 else if(buildMs>=650&&since>=1600&&section!=='drop'){section='build';confidence=.63;}
 else if(strong&&highMs>=1500&&since>=2300&&section!=='drop'){section='hook';confidence=.64;}
 else if(section==='build'&&buildMs<150&&since>=3200){section='verse';confidence=.5;}
 else if(section==='break'&&energy>.27&&since>=1800){section='verse';confidence=.51;}
 else if(section==='hook'&&highMs===0&&since>=2300){section='verse';confidence=.52;}
 return {trackId:x.trackId,at,section,since:section!==s.section?at:s.since,energy,previousEnergy:s.energy,quietMs,highMs,buildMs,confidence,revision:s.revision+(section!==s.section?1:0)};
}
/** Musical transitions allow a single extra selection, but never restart each frame. */
export function musicAwareSlot(phraseSlot:number,state:LiveStructureState):string {
 return `${phraseSlot}:${state.revision}`;
}
