/** V402 – Unified Concert Show Director.
 * One section clock for existing camera, lighting, vocal and ensemble engines.
 * Pure CPU math; does not recognize singers, analyze audio, instantiate objects or override authored cues. */
import type {ExperienceCueV396} from './performanceExperienceV396';
import type {ConcertShowCueV387} from './concertShowDirectorV387';
export type UnifiedModeV402='off'|'balanced'|'festival';
export type UnifiedSectionV402='break'|'verse'|'build'|'hook'|'drop';
export type UnifiedTierV402='low'|'balanced'|'high';
export type UnifiedCueV402={active:boolean;section:UnifiedSectionV402;intensity:number;
 concertMode:'off'|'balanced'|'festival';festivalMode:'off'|'cinematic'|'festival';
 ensembleMode:'off'|'subtle'|'expressive';vocalMode:'off'|'subtle'|'expressive';
 concertStrength:number;festivalStrength:number;groupGain:number;vocalGain:number;
 lighting:boolean;camera:boolean;dance:boolean;vocal:boolean;performanceTier:UnifiedTierV402};
export type UnifiedStateV402={trackId:string;lastMs:number;section:UnifiedSectionV402;sectionSince:number;
 candidate:UnifiedSectionV402;candidateSince:number};
export type UnifiedInputV402={trackId?:string;progressMs:number;playing:boolean;reducedMotion:boolean;
 mode?:UnifiedModeV402;strength?:number;section?:string|null;genre?:string|null;energy?:number;beat?:number;
 performers?:number;activeLyrics?:boolean;hasVocalTiming?:boolean;performanceTier?:UnifiedTierV402;
 lighting?:boolean;camera?:boolean;dance?:boolean;vocal?:boolean};
const clamp=(value:number,min:number,max:number)=>Number.isFinite(value)?Math.min(max,Math.max(min,value)):min;
const asSection=(s:string|null|undefined):UnifiedSectionV402=>s==='break'||s==='build'||s==='hook'||s==='drop'?s:'verse';
const inactive=(section:UnifiedSectionV402,tier:UnifiedTierV402):UnifiedCueV402=>({active:false,section,intensity:0,
 concertMode:'off',festivalMode:'off',ensembleMode:'off',vocalMode:'off',concertStrength:0,festivalStrength:0,
 groupGain:1,vocalGain:1,lighting:false,camera:false,dance:false,vocal:false,performanceTier:tier});
export const initialUnifiedV402=():UnifiedStateV402=>({trackId:'',lastMs:-1,section:'verse',sectionSince:0,candidate:'verse',candidateSince:0});
export function advanceUnifiedV402(state:UnifiedStateV402,input:UnifiedInputV402):UnifiedCueV402{
 const ms=Number.isFinite(input.progressMs)?Math.max(0,input.progressMs):0;
 const id=input.trackId??'',wanted=asSection(input.section),tier=input.performanceTier??'balanced';
 const reset=id!==state.trackId||state.lastMs<0||ms<state.lastMs-350||ms-state.lastMs>10000;
 if(reset){state.section=wanted;state.sectionSince=ms;state.candidate=wanted;state.candidateSince=ms;}
 else if(state.candidate!==wanted){state.candidate=wanted;state.candidateSince=ms;}
 else if(state.section!==wanted&&ms-state.candidateSince>=320){state.section=wanted;state.sectionSince=ms;}
 state.trackId=id;state.lastMs=ms;
 const section=state.section;
 if(!id||!input.playing||input.reducedMotion||input.mode==='off'||!input.mode||
   !Number.isFinite(input.progressMs)||(input.strength??65)<=0||!Number.isFinite(input.strength??65))
   return inactive(section,tier);
 const power=clamp((input.strength??65)/100,0,1)*(input.mode==='balanced'?.68:1);
 const energy=clamp(input.energy??0,0,1),beat=clamp(input.beat??0,0,1);
 const tierGain=tier==='low'?.52:tier==='balanced'?.76:1;
 const phase=clamp((ms-state.sectionSince)/(section==='drop'?420:680),0,1);
 const eased=phase*phase*(3-2*phase);
 const level={break:.16,verse:.53,build:.70,hook:.86,drop:1}[section];
 const intensity=clamp(level*power*tierGain*(.55+.45*energy)*eased+ (section==='drop'?beat*.06*power:0),0,.94);
 const electronic=/hardstyle|hardtekk|hardcore|techno|rave|trance/i.test(input.genre??'');
 const rap=/rap|hip.?hop|trap/i.test(input.genre??'');
 const count=Math.round(clamp(input.performers??1,1,4));
 const vocal= input.vocal!==false&&!!input.activeLyrics&&!!input.hasVocalTiming;
 const dance= input.dance!==false&&count>1;
 const lighting=input.lighting!==false,camera=input.camera!==false;
 const festival=input.mode==='festival';
 return {active:true,section,intensity,concertMode:lighting||camera||dance?'balanced':'off',
   festivalMode:(lighting||camera)&&electronic?(festival&&tier==='high'?'festival':'cinematic'):'off',
   ensembleMode:dance?(festival&&section==='drop'?'expressive':'subtle'):'off',
   vocalMode:vocal?(festival&&rap&&section==='verse'?'expressive':'subtle'):'off',
   concertStrength:clamp(Math.round(48+intensity*43),0,100),
   festivalStrength:clamp(Math.round(50+intensity*42),0,100),
   groupGain:dance?clamp(1+(section==='hook'||section==='drop'?.15:section==='verse'?-.035:.025)*intensity,.96,1.14):1,
   vocalGain:vocal?clamp(1+(rap&&section==='verse'?.19:section==='hook'?.09:.03)*intensity,1,1.17):1,
   lighting,camera,dance,vocal,performanceTier:tier};
}
/** User-set modes and V396 have priority over V402 fallback. */
export function chooseUnifiedModeV402<T extends string>(user:T,previous:T,priorActive:boolean, fallback:T):T{
 return user!=='off'?user:priorActive?previous:fallback;
}
/** V396 remains authoritative if enabled. Existing V392/V393 manual modes are checked downstream. */
export function unifiedExperienceV402(base:ExperienceCueV396,cue:UnifiedCueV402):ExperienceCueV396{
 if(base.active||!cue.active)return base;
 return {active:true,section:cue.section,strength:cue.intensity,visualGain:1,groupGain:cue.groupGain,vocalGain:cue.vocalGain,
 ensembleMode:cue.ensembleMode,concertMode:cue.concertMode,festivalMode:cue.festivalMode,
 vocalMode:cue.vocalMode,performanceTier:cue.performanceTier};
}
/** Constrain implicit dance changes to the V402 dance switch; leave manually configured V387 untouched. */
export function gateUnifiedDanceV402(base:ConcertShowCueV387,cue:UnifiedCueV402,manualShow:boolean):ConcertShowCueV387{
 if(!cue.active||manualShow||cue.dance)return base;
 return {...base,danceGain:1};
}
