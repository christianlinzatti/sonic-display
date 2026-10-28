/** V615: deterministic, full-song repertoire variety for already-loaded GLB actions.
 * Used AFTER the existing V536/V588 directors; does not load clips or own a mixer.
 * Never makes singer or vocal-cue claims. Manual/timeline/loop ownership stays upstream.
 */
import {
  motionSectionV536, rankGenreMotionsV536, validGenreCandidateV536,
  type GenreMotionCandidateV536, type GenreMotionInputV536,
} from './genreAwareMotionDirectorV536';
import {musicalWindowV588} from './longFormChoreographyV588';

export type ChoreographyVarietyStateV615={
  trackId:string;modelKey:string;selectedName:string|null;
  lastPositionMs:number;lastSwitchMs:number;signature:string;
  clips:readonly GenreMotionCandidateV536[]|null;
  recent:readonly string[];
  usage:Readonly<Record<string,number>>;
  pendingSignature:string;pendingName:string|null;
};
export const newChoreographyVarietyStateV615=():ChoreographyVarietyStateV615=>({
  trackId:'',modelKey:'',selectedName:null,lastPositionMs:0,lastSwitchMs:-Infinity,
  signature:'',clips:null,recent:[],usage:{},pendingSignature:'',pendingName:null,
});
const bounded=(value:number|null|undefined,otherwise:number,low:number,high:number)=>
  typeof value==='number'&&Number.isFinite(value)?Math.min(high,Math.max(low,value)):otherwise;
const RECENT_LENGTH=6;
const MIN_SWITCH_MS=9_000;

/** Near-best repertoire only: never trade genre compatibility for novelty. */
export function rankChoreographyVarietyV615(
  input:GenreMotionInputV536,previous:ChoreographyVarietyStateV615,proposed:string|null,
):readonly {name:string;score:number}[]{
  const phrase=`v615:${motionSectionV536(input.section)}:${musicalWindowV588(input).index}`;
  const ranked=rankGenreMotionsV536(input,phrase);
  if(!ranked.length)return [];
  const categoryByName=new Map(input.clips.filter(validGenreCandidateV536).map(c=>[c.name,c.category] as const));
  const stationary=ranked.filter(entry=>categoryByName.get(entry.name)!=='locomotion');
  const safe=stationary.length?stationary:ranked;
  const top=safe[0].score;
  // Candidates remain unlimited; scoring applies only to musically similar options.
  const alternatives=safe.filter(entry=>entry.score>=top-1.75);
  const candidates=alternatives.length?alternatives:[safe[0]];
  const maxUsage=candidates.reduce((max,item)=>Math.max(max,previous.usage[item.name]??0),0);
  const last=previous.recent[previous.recent.length-1];
  const lastCategory=last?categoryByName.get(last):undefined;
  const categoryOptions=new Set(candidates.map(entry=>categoryByName.get(entry.name)));
  return candidates.map(entry=>{
    const recency=previous.recent.lastIndexOf(entry.name);
    const age=recency<0?Infinity:previous.recent.length-1-recency;
    const recencyPenalty=age===0?3.0:age===1?2.15:age===2?1.45:age<RECENT_LENGTH?.7:0;
    // Favor underused clips; bounded so novelty never overwhelms musical suitability.
    const frequencyPenalty=Math.min(1.05,Math.max(0,(previous.usage[entry.name]??0)-(maxUsage-3))*.22);
    const categoryPenalty=categoryOptions.size>1&&categoryByName.get(entry.name)===lastCategory?.22:0;
    const proposalBonus=entry.name===proposed?.7:0;
    return {name:entry.name,score:entry.score-recencyPenalty-frequencyPenalty-categoryPenalty+proposalBonus};
  }).sort((a,b)=>b.score-a.score||a.name.localeCompare(b.name));
}

export function stepChoreographyVarietyV615(
  previous:ChoreographyVarietyStateV615,input:GenreMotionInputV536,proposed:string|null,
):ChoreographyVarietyStateV615{
  const position=bounded(input.progressMs,0,0,1_000_000_000),trackId=input.trackId??'';
  const seek=position<previous.lastPositionMs-1_500||position>previous.lastPositionMs+60_000;
  const reset=trackId!==previous.trackId||input.modelKey!==previous.modelKey||seek;
  const state=reset?newChoreographyVarietyStateV615():previous;
  const base={...state,trackId,modelKey:input.modelKey,lastPositionMs:position};
  if(!trackId||!input.modelKey||!input.playing||input.reducedMotion||input.manualPriority)
    return {...base,selectedName:null,signature:'',clips:null,recent:[],usage:{},pendingSignature:'',pendingName:null};
  const valid=state.selectedName!==null&&input.clips.some(c=>c.name===state.selectedName&&validGenreCandidateV536(c));
  const window=musicalWindowV588(input).index;
  const energy=bounded(input.energy,.5,0,1);
  const tier=energy<.33?'quiet':energy>.78?'peak':'normal';
  const signature=`${window}|${motionSectionV536(input.section)}|${input.genre??''}|${tier}|${input.slot}`;
  if(valid&&state.signature===signature&&state.clips===input.clips)return base;
  // An already-scored blocked change waits without rescoring hundreds of clips per frame.
  if(valid&&state.pendingSignature===signature&&state.clips===input.clips&&state.pendingName){
    if(position-state.lastSwitchMs<MIN_SWITCH_MS)return base;
    if(input.clips.some(c=>c.name===state.pendingName&&validGenreCandidateV536(c)))
      return commit(base,state.pendingName,position,signature,input.clips);
  }
  const ranked=rankChoreographyVarietyV615(input,state,proposed);
  const desired=ranked[0]?.name??null;
  if(!desired)return {...base,selectedName:null,signature,clips:input.clips,pendingSignature:'',pendingName:null};
  // Trust V588's initial selection if musically eligible; the variety policy takes
  // over on following windows using real play history rather than random shuffling.
  const eligible=ranked.some(c=>c.name===proposed);
  const target=!valid&&eligible&&proposed?proposed:desired;
  if(valid&&target!==state.selectedName&&position-state.lastSwitchMs<MIN_SWITCH_MS)
    return {...base,signature:'',clips:input.clips,pendingSignature:signature,pendingName:target};
  if(target===state.selectedName)
    return {...base,signature,clips:input.clips,pendingSignature:'',pendingName:null};
  return commit(base,target,position,signature,input.clips);
}
function commit(
  base:ChoreographyVarietyStateV615,name:string,position:number,signature:string,
  clips:readonly GenreMotionCandidateV536[],
):ChoreographyVarietyStateV615{
  return {...base,selectedName:name,lastSwitchMs:position,signature,clips,
    recent:[...base.recent,name].slice(-RECENT_LENGTH),
    usage:{...base.usage,[name]:(base.usage[name]??0)+1},pendingSignature:'',pendingName:null};
}
