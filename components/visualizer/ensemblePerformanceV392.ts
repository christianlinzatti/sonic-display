/**
 * V392 – opt-in multi-performer direction; stage-root yaw and reactive dynamics
 * only. Never modifies source GLB clips, foot anchors, manual vocal casting,
 * authored positions, or claims to identify voices in Spotify audio.
 */
export type EnsembleModeV392 = 'off' | 'subtle' | 'expressive';
export type EnsembleRoleV392 = 'lead' | 'backing' | 'dancer';
export type EnsembleSectionV392 = 'verse' | 'hook' | 'build' | 'drop' | 'break';
export interface EnsembleSettingsV392 { mode: EnsembleModeV392; strength: number; }
export interface EnsembleCueV392 {
  active:boolean; section:EnsembleSectionV392; leadSlot:number;
  roles:EnsembleRoleV392[]; gains:number[]; yaw:number[];
  phase:number; callResponse:boolean;
}
export interface EnsembleStateV392 {
  trackId:string; lastMs:number|null; elapsed:number;
  stable:EnsembleSectionV392; candidate:EnsembleSectionV392|null;
  candidateAt:number; switchedAt:number;
}
export const ENSEMBLE_KEY_V392='sonic.ensemble-performance-v392';
export const ENSEMBLE_EVENT_V392='sonic:ensemble-performance-v392';
export const DEFAULT_ENSEMBLE_V392:EnsembleSettingsV392={mode:'off',strength:60};
const clamp=(n:number,a:number,b:number)=>Math.min(b,Math.max(a,Number.isFinite(n)?n:a));
const finite=(x:unknown,d:number):number=>typeof x==='number'&&Number.isFinite(x)?x:d;
export function normalizeEnsembleV392(v:unknown):EnsembleSettingsV392 {
 const s=v&&typeof v==='object'?v as Partial<EnsembleSettingsV392>:{};
 return {mode:s.mode==='subtle'||s.mode==='expressive'?s.mode:'off',strength:Math.round(clamp(finite(s.strength,60),0,100))};
}
let cached:EnsembleSettingsV392|null=null;
export function readEnsembleV392():EnsembleSettingsV392 {
 if(cached)return cached;
 if(typeof window==='undefined')return {...DEFAULT_ENSEMBLE_V392};
 try{cached=normalizeEnsembleV392(JSON.parse(window.localStorage.getItem(ENSEMBLE_KEY_V392)||'null'));}
 catch{cached={...DEFAULT_ENSEMBLE_V392};}
 return cached;
}
export function saveEnsembleV392(v:unknown):EnsembleSettingsV392 {
 cached=normalizeEnsembleV392(v);
 if(typeof window!=='undefined'){
  try{window.localStorage.setItem(ENSEMBLE_KEY_V392,JSON.stringify(cached));}catch{}
  window.dispatchEvent(new Event(ENSEMBLE_EVENT_V392));
 }
 return cached;
}
export const initialEnsembleV392=():EnsembleStateV392=>({trackId:'',lastMs:null,elapsed:0,stable:'verse',candidate:null,candidateAt:0,switchedAt:0});
export interface EnsembleInputV392 {
 settings:EnsembleSettingsV392; trackId?:string|null; progressMs?:number|null;
 delta:number; playing:boolean; reducedMotion:boolean; manualPriority?:boolean;
 count:number; leader?:number|null; bpm?:number|null; section?:string|null;
 energy?:number; beat?:number; kick?:number; genre?:string|null;
}
function sectionHint(v:unknown):EnsembleSectionV392|null {
 if(typeof v!=='string')return null;
 const s=v.toLowerCase();
 if(s==='drop')return 'drop';
 if(s==='hook'||s==='chorus')return 'hook';
 if(s==='build'||s==='buildup'||s==='build-up')return 'build';
 if(s==='break'||s==='intro'||s==='outro')return 'break';
 if(s==='verse')return 'verse';
 return null;
}
/** Music-energy fallback is a *performance heuristic*, not true vocal classification. */
function heuristic(input:EnsembleInputV392):EnsembleSectionV392 {
 const energy=clamp(finite(input.energy,0),0,1),kick=clamp(finite(input.kick,0),0,1);
 if(energy<.18)return 'break';
 if(energy>.7&&kick>.65)return 'drop';
 if(energy>.57&&clamp(finite(input.beat,0),0,1)>.48)return 'hook';
 if(energy>.42&&kick<.3)return 'build';
 return 'verse';
}
const inactive=(count:number):EnsembleCueV392=>({active:false,section:'verse',leadSlot:0,phase:0,callResponse:false,
 roles:Array.from({length:count},(_,i)=>i===0?'lead':i===1?'backing':'dancer'),
 gains:Array(count).fill(1),yaw:Array(count).fill(0)});
/** Deterministic and frame-rate-independent role cue, bound to one shared song clock. */
export function advanceEnsembleV392(state:EnsembleStateV392,input:EnsembleInputV392):EnsembleCueV392 {
 const count=Math.round(clamp(finite(input.count,2),1,4));
 const dt=clamp(finite(input.delta,0),0,.15);
 const trackId=input.trackId??'';
 const ms=typeof input.progressMs==='number'&&Number.isFinite(input.progressMs)?Math.max(0,input.progressMs):null;
 const songChange=state.trackId!==trackId;
 const seek=ms!==null&&state.lastMs!==null&&(ms<state.lastMs-150||ms-state.lastMs>3500);
 if(songChange||seek){Object.assign(state,initialEnsembleV392(),{trackId});}
 state.trackId=trackId;
 if(ms!==null)state.lastMs=ms;
 if(input.settings.mode==='off'||input.manualPriority||!input.playing||input.reducedMotion||input.settings.strength<=0){
  state.candidate=null;
  return inactive(count);
 }
 // Prefer actual playback time for phrase-locked transitions; fall back to R3F delta.
 if(ms!==null)state.elapsed=ms/1000;else state.elapsed+=dt;
 const desired=sectionHint(input.section)??heuristic(input);
 if(desired===state.stable)state.candidate=null;
 else {
  if(state.candidate!==desired){state.candidate=desired;state.candidateAt=state.elapsed;}
  const hold=desired==='drop'?.30:.65;
  const cooldown=desired==='drop'?.8:1.35;
  if(state.elapsed-state.candidateAt>=hold&&state.elapsed-state.switchedAt>=cooldown){
   state.stable=desired;state.switchedAt=state.elapsed;state.candidate=null;
  }
 }
 const bpm=clamp(finite(input.bpm,120),55,240);
 const phase=Math.floor((ms!==null?ms/1000:state.elapsed)*bpm/60/4);
 const anchor=Math.floor(clamp(finite(input.leader??undefined,0),0,count-1));
 const section=state.stable;
 const callResponse=section==='verse'&&phase%4===3&&count>1;
 const leadSlot=callResponse?(anchor+1)%count:anchor;
 const strength=clamp(finite(input.settings.strength,60),0,100)/100*(input.settings.mode==='subtle'?.48:1);
 const rap=/rap|hip.?hop|trap/.test((input.genre??'').toLowerCase());
 const accent=clamp(finite(input.beat,0),0,1)*strength;
 const roles=Array.from({length:count},(_,i):EnsembleRoleV392=>i===leadSlot?'lead':(i+count-leadSlot)%count===1?'backing':'dancer');
 const gains=roles.map((role,i)=>{
  const base=section==='drop'?.96:section==='hook'?.88:section==='break'?.5:section==='build'?.72:role==='lead'?1:role==='backing'?.68:.56;
  const nudge=section==='drop'&&i%2===1?.04*accent:section==='verse'&&role==='lead'?.06*accent:0;
  return clamp(1+(base-1)*strength+nudge,.48,1.08);
 });
 const yaw=roles.map((role,i)=>{
  if(role==='lead'||section==='drop'||section==='break')return 0;
  const toward=leadSlot<i?-1:1;
  const phrase=section==='hook'?.65:section==='build'?.9:rap?1:.75;
  return toward*phrase*strength*(role==='backing'?.13:.09);
 });
 return {active:true,section,leadSlot,roles,gains,yaw,phase,callResponse};
}
