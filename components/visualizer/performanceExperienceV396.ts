/** V396 – synchronized orchestration of *existing* festival, vocal and ensemble directors.
 * No audio capture, speech attribution, GPU allocations or synthetic beat events. */
export type ExperienceModeV396='off'|'balanced'|'expressive';
export type ExperienceSectionV396='break'|'verse'|'build'|'hook'|'drop';
export type ExperienceCueV396={active:boolean;section:ExperienceSectionV396;strength:number;
  visualGain:number;groupGain:number;vocalGain:number;ensembleMode:'off'|'subtle'|'expressive';
  concertMode:'off'|'balanced'|'festival';festivalMode:'off'|'cinematic'|'festival';
  vocalMode:'off'|'subtle'|'expressive';performanceTier:'low'|'balanced'|'high';};
export type ExperienceStateV396={trackId:string;lastMs:number;stable:ExperienceSectionV396;
 candidate:ExperienceSectionV396;candidateAt:number;changedAt:number};
export type ExperienceInputV396={trackId?:string;progressMs:number;playing:boolean;reducedMotion:boolean;
 mode?:ExperienceModeV396;strength?:number;section?:string|null;genre?:string|null;
 energy?:number;beat?:number;activeLyrics?:boolean;hasVocalTiming?:boolean;
 performers?:number;performanceTier?:'low'|'balanced'|'high'};
const clip=(value:number,min:number,max:number)=>Number.isFinite(value)?Math.min(max,Math.max(min,value)):min;
const sectionOf=(raw:string|null|undefined):ExperienceSectionV396=>raw==='break'||raw==='build'||raw==='hook'||raw==='drop'?raw:'verse';
export const initialExperienceV396=():ExperienceStateV396=>({trackId:'',lastMs:-1,stable:'verse',candidate:'verse',candidateAt:0,changedAt:0});
const empty=(section:ExperienceSectionV396,tier:'low'|'balanced'|'high'):ExperienceCueV396=>({active:false,section,strength:0,visualGain:1,groupGain:1,vocalGain:1,
 ensembleMode:'off',concertMode:'off',festivalMode:'off',vocalMode:'off',performanceTier:tier});
export function advanceExperienceV396(state:ExperienceStateV396,input:ExperienceInputV396):ExperienceCueV396{
 const time=Math.max(0,Number.isFinite(input.progressMs)?input.progressMs:0),trackId=input.trackId??'';
 const wanted=sectionOf(input.section),tier=input.performanceTier??'balanced';
 const reset=trackId!==state.trackId||state.lastMs<0||time<state.lastMs-350||time-state.lastMs>10000;
 if(reset){state.stable=wanted;state.candidate=wanted;state.candidateAt=time;state.changedAt=time;}
 else if(wanted!==state.candidate){state.candidate=wanted;state.candidateAt=time;}
 else if(wanted!==state.stable&&time-state.candidateAt>=300){state.stable=wanted;state.changedAt=time;}
 state.lastMs=time;state.trackId=trackId;
 const section=state.stable;
 if(!trackId||!input.playing||input.reducedMotion||input.mode==='off'||!input.mode||
   !Number.isFinite(input.progressMs)||!Number.isFinite(input.strength??65)||(input.strength??65)<=0)return empty(section,tier);
 const strength=clip((input.strength??65)/100,0,1)*(input.mode==='balanced'?.62:1);
 const budget=tier==='low'?.50:tier==='balanced'?.76:1;
 const energy=clip(input.energy??0,0,1),beat=clip(input.beat??0,0,1);
 const level={break:.12,verse:.46,build:.63,hook:.81,drop:1}[section];
 // No fabricated drops: a strong kick without a real section hint stays in its existing section.
 const onset=section==='drop'?beat*.10:0;
 const rise=Math.min(1,Math.max(0,(time-state.changedAt)/500));
 const drive=clip(strength*budget*level*(.55+.45*energy)*rise+onset*strength,0,.90);
 const electronic=/hardstyle|hardtekk|hardcore|techno|rave|trance/i.test(input.genre??'');
 const rap=/rap|hip.?hop|trap/i.test(input.genre??'');
 const count=Math.round(clip(input.performers??1,1,4));
 const vocal=input.activeLyrics===true&&input.hasVocalTiming===true;
 const groupGain=count>1?clip(1+(section==='hook'||section==='drop'?.12:section==='verse'?-.045:.03)*drive, .95,1.12):1;
 const vocalGain=vocal?clip(1+(rap&&section==='verse'?.18:section==='hook'?.10:.035)*drive,1,1.16):1;
 const visualGain=clip(1+(section==='break'?-0.055:.14)*drive,.96,1.13);
 // The director can opt-in compatible existing effects, never laser or strobes.
 return {active:true,section,strength,visualGain,groupGain,vocalGain,
  ensembleMode:count>1?(input.mode==='expressive'?'expressive':'subtle'):'off',
  concertMode:electronic&&input.mode==='expressive'?'festival':'balanced',
  festivalMode:electronic&&input.mode==='expressive'&&tier==='high'?'festival':'cinematic',
  vocalMode:vocal?(input.mode==='expressive'?'expressive':'subtle'):'off',performanceTier:tier};
}
/** A user-selected V392 mode has absolute priority; a manual staged group is gated later. */
export function resolveEnsembleSettingsV396<T extends {mode:'off'|'subtle'|'expressive';strength:number}>(
 configured:T,cue:ExperienceCueV396|undefined):T {
 if(!cue?.active||configured.mode!=='off'||cue.ensembleMode==='off')return configured;
 return {...configured,mode:cue.ensembleMode,strength:clip(55*cue.strength*cue.groupGain,0,100)};
}
/** Manual non-off modes and explicit strength settings are never changed. */
export function chooseExperienceModeV396<T extends string>(selected:T, fallback:T, cue:ExperienceCueV396):T {
 return cue.active&&selected==='off'?fallback:selected;
}
