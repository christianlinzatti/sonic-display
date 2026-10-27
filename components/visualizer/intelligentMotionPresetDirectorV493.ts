/** V493: deterministic, dependency-free GLB upper-body preset selection.
 * Presets stay attached to their installed base clip; never own the main mixer.
 */
export type MotionPresetCandidateV493={
  actionName:string; presetId:string; baseName:string; region:'arms'|'upper';
  genre:'all'|'rap'|'hard'; weight:number;
};
export type PresetDirectorStateV493={trackId:string;selectedId:string|null;lastSwitchMs:number;lastPositionMs:number;lastPhrase:string};
export type PresetDirectorInputV493={
  candidates:readonly MotionPresetCandidateV493[];selectedBase:string|null|undefined;
  trackId:string|null|undefined;positionMs:number;section:string|null|undefined;
  energy:number|null|undefined;bpm:number|null|undefined;slot:number;
  playing:boolean;reducedMotion:boolean;manualPriority:boolean;quality:'low'|'medium'|'high'|string;
};
export const newPresetDirectorStateV493=():PresetDirectorStateV493=>({trackId:'',selectedId:null,lastSwitchMs:-Infinity,lastPositionMs:0,lastPhrase:''});
const bounded=(x:number|null|undefined,min:number,max:number,fallback:number)=>
  typeof x==='number'&&Number.isFinite(x)?Math.max(min,Math.min(max,x)):fallback;
const stableHash=(text:string)=>{let hash=2166136261;for(let i=0;i<text.length;i++){hash=Math.imul(hash^text.charCodeAt(i),16777619);}return hash>>>0;};
const sectionClass=(section:string|null|undefined):'verse'|'hook'|'drop'|'break'=>{
  const value=(section??'').toLowerCase();
  if(/drop|climax/.test(value))return 'drop';
  if(/hook|chorus|refrain/.test(value))return 'hook';
  if(/break|intro|outro|quiet|ambient/.test(value))return 'break';
  return 'verse';
};
/** Pure state transition; a selection changes at most once per 10 seconds,
 * except when inputs become invalid, manual control wins or the song seeks. */
export function stepMotionPresetDirectorV493(previous:PresetDirectorStateV493,input:PresetDirectorInputV493):PresetDirectorStateV493{
  const trackId=input.trackId??'';
  const time=bounded(input.positionMs,0,1_000_000_000,0);
  const reset=trackId!==previous.trackId||time<previous.lastPositionMs-2500;
  const state=reset?newPresetDirectorStateV493():previous;
  const blank={...state,trackId,lastPositionMs:time,selectedId:null,lastPhrase:''};
  if(!trackId||!input.playing||input.reducedMotion||input.manualPriority||input.quality==='low'||!input.selectedBase)
    return blank;
  const candidates=input.candidates.filter(p=>p.baseName===input.selectedBase&&p.actionName.length>0&&
    p.presetId.length>0&&Number.isFinite(p.weight)&&p.weight>0&&p.weight<=.5);
  if(!candidates.length)return blank;
  const phase=sectionClass(input.section);
  const energy=bounded(input.energy,0,1,.45),bpm=bounded(input.bpm,45,240,120);
  const slot=Math.max(0,Math.min(7,Math.trunc(bounded(input.slot,0,7,0))));
  // Stable 16-second musical phrases; changes inside a phrase do not cause thrashing.
  const phrase=`${phase}:${Math.floor(time/16_000)}`;
  const scored=candidates.map(candidate=>{
    let score=0;
    if(candidate.region==='upper')score+=phase==='verse'?.26:phase==='break'?-.18:.12;
    if(candidate.region==='arms')score+=phase==='break'?.20:phase==='drop'?-.06:.04;
    score+=energy>.72?(candidate.weight>.27?.22:0):(candidate.weight<=.3?.16:0);
    if(phase==='drop'&&bpm>=145&&candidate.weight>=.28)score+=.26;
    if(phase==='verse'&&candidate.genre==='rap')score+=.18;
    if(phase==='drop'&&candidate.genre==='hard')score+=.22;
    // Different dancers get a stable but distinct choice when several presets fit.
    score+=(stableHash(`${trackId}:${phrase}:${slot}:${candidate.presetId}`)%997)/997*.23;
    return {candidate,score};
  }).sort((a,b)=>b.score-a.score||a.candidate.presetId.localeCompare(b.candidate.presetId));
  const winner=scored[0]?.candidate.actionName??null;
  const stillValid=candidates.some(candidate=>candidate.actionName===state.selectedId);
  if(!state.selectedId||!stillValid)return {...blank,selectedId:winner,lastSwitchMs:time,lastPhrase:phrase};
  if(winner!==state.selectedId&&phrase!==state.lastPhrase&&time-state.lastSwitchMs>=10_000)
    return {...blank,selectedId:winner,lastSwitchMs:time,lastPhrase:phrase};
  return {...blank,selectedId:state.selectedId,lastPhrase:phrase};
}
