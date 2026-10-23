import type { CharacterMotionStore, InstalledCharacterMotion } from "./characterMotionLibrary";

/** A deterministic phrase-aware live playlist. Never edits assets or user-authored library metadata. */
export type DanceSection = "verse" | "hook" | "build" | "drop" | "break";
export type DanceSequenceState = { trackId: string; avatarId: string; slot: number; motionId: string | null; recent: string[]; eventSlot?: string };
export const emptyDanceSequence = (): DanceSequenceState => ({trackId:"",avatarId:"",slot:-1,motionId:null,recent:[],eventSlot:""});
export function danceSectionAt(progressMs:number,durationMs:number,energy:number):DanceSection {
  if(!Number.isFinite(durationMs)||durationMs<=0)return "verse";
  const phase=Math.max(0,Math.min(1,(Number.isFinite(progressMs)?progressMs:0)/durationMs));
  if(phase<.08 || (phase>=.43&&phase<.49))return "build";
  if((phase>=.08&&phase<.19)||(phase>=.49&&phase<.61))return "drop";
  if(phase>=.72&&phase<.82)return "break";
  if((phase>=.19&&phase<.32)||(phase>=.61&&phase<.72)||phase>=.90)return "hook";
  return "verse";
}
export function danceSlot(progressMs:number,bpm:number|undefined):number {
  const tempo=Number.isFinite(bpm)&&bpm!>=55&&bpm!<=240?bpm!:120;
  const phraseMs=60000/tempo*16; // four bars: switches occur at phrase boundaries
  return Math.max(0,Math.floor(Math.max(0,Number.isFinite(progressMs)?progressMs:0)/phraseMs));
}
function sectionFit(m:InstalledCharacterMotion,section:DanceSection):number {
  if(m.section===section)return 5;
  if(m.section==="any")return 2;
  if(section==="hook"&&m.section==="verse")return 3;
  if(section==="break"&&m.section==="verse")return 2;
  return -2;
}
/** Choose once per phrase. Apply an immediate reset for new tracks/avatars, not during each animation frame. */
export function nextDanceCombination(state:DanceSequenceState,store:CharacterMotionStore,params:{trackId:string;avatarId:string;genre:string;bpm?:number;progressMs:number;durationMs:number;energy:number;fallback?:string;detectedSection?:DanceSection;phraseSlot?:number;eventSlot?:string}):{state:DanceSequenceState;url:string|undefined;section:DanceSection} {
  const section=params.detectedSection ?? danceSectionAt(params.progressMs,params.durationMs,params.energy);
  if(!store.automatic)return {state:emptyDanceSequence(),url:params.fallback,section};
  const slot=Number.isFinite(params.phraseSlot)&&params.phraseSlot!>=0?Math.floor(params.phraseSlot!):danceSlot(params.progressMs,params.bpm);
  const candidates=store.motions.filter(m=>m.avatarId===params.avatarId && (!m.genre||m.genre.toLowerCase()===params.genre.toLowerCase()) && (!Number.isFinite(params.bpm)||(params.bpm!>=m.bpmMin&&params.bpm!<=m.bpmMax)));
  if(!candidates.length)return {state:emptyDanceSequence(),url:params.fallback,section};
  const sameTrack=state.trackId===params.trackId&&state.avatarId===params.avatarId;
  if(sameTrack&&state.slot===slot&&state.eventSlot===(params.eventSlot??"")){const selected=candidates.find(m=>m.id===state.motionId);if(selected)return {state,url:selected.url,section};}
  const recent=sameTrack&&slot>=state.slot?state.recent:[];
  const previous=sameTrack&&slot>=state.slot?state.motionId:null;
  const rank=(m:InstalledCharacterMotion)=>sectionFit(m,section)*8+(m.genre?10:0)+((m.bpmMax-m.bpmMin)<80?2:0)-(recent.includes(m.id)?24:0)-(m.id===previous?18:0);
  const ordered=candidates.slice().sort((a,b)=>rank(b)-rank(a)||a.id.localeCompare(b.id));
  const chosen=ordered[0];
  const history=[...recent,chosen.id].slice(-Math.min(3,Math.max(1,candidates.length-1)));
  return {state:{trackId:params.trackId,avatarId:params.avatarId,slot,motionId:chosen.id,recent:history,eventSlot:params.eventSlot??""},url:chosen.url,section};
}
