/** V639 – whole-song, quality-aware rotation of ALREADY LOADED GLB actions.
 * Runs after V536/V588/V615 and before the existing GLB crossfade hook.
 * No clip loading, pose edits, mixer ownership, probabilistic choices or clock.
 */
import {
  motionSectionV536, rankGenreMotionsV536, validGenreCandidateV536,
  type GenreMotionCandidateV536, type GenreMotionInputV536,
} from './genreAwareMotionDirectorV536';
import {musicalWindowV588} from './longFormChoreographyV588';

export type IntelligentMotionLibraryStateV639={
  trackId:string;modelKey:string;selectedName:string|null;
  lastPositionMs:number;lastSwitchMs:number;
  signature:string;clips:readonly GenreMotionCandidateV536[]|null;
  proposal:string|null;recent:readonly string[];
  usage:Readonly<Record<string,number>>;
  pendingSignature:string;pendingName:string|null;
};
export const newIntelligentMotionLibraryStateV639=():IntelligentMotionLibraryStateV639=>({
  trackId:'',modelKey:'',selectedName:null,lastPositionMs:0,lastSwitchMs:-Infinity,
  signature:'',clips:null,proposal:null,recent:[],usage:{},
  pendingSignature:'',pendingName:null,
});
const validNumber=(v:number|null|undefined,fallback:number,min:number,max:number)=>
  typeof v==='number'&&Number.isFinite(v)?Math.min(max,Math.max(min,v)):fallback;
export const MOTION_LIBRARY_COOLDOWN_V639=10_000;
const RECENT=8;
const SUITABILITY_BAND=1.75;

export type MotionLibraryRankV639={name:string;score:number;category:string};
/** Musical suitability is determined by V536 first. V639 cannot put an
 * incompatible action into the candidate pool merely to increase novelty.
 */
export function rankIntelligentMotionLibraryV639(
  input:GenreMotionInputV536,state:IntelligentMotionLibraryStateV639,proposed:string|null,
):MotionLibraryRankV639[]{
  const phrase=musicalWindowV588(input).index;
  const baseline=rankGenreMotionsV536(input,`v615:${motionSectionV536(input.section)}:${phrase}`);
  const byName=new Map(input.clips.filter(validGenreCandidateV536).map(c=>[c.name,c] as const));
  const stationary=baseline.filter(c=>byName.get(c.name)?.category!=='locomotion');
  const safe=stationary.length?stationary:baseline;
  if(!safe.length)return [];
  const best=safe[0].score;
  const qualified=safe.filter(c=>c.score>=best-SUITABILITY_BAND);
  const last=state.recent[state.recent.length-1];
  const lastCategory=last?byName.get(last)?.category:null;
  const categories=new Set(qualified.map(c=>byName.get(c.name)?.category));
  const leastUsed=Math.min(...qualified.map(c=>state.usage[c.name]??0));
  return qualified.map(c=>{
    const item=byName.get(c.name)!;
    const use=state.usage[c.name]??0;
    const seen=state.recent.lastIndexOf(c.name);
    const age=seen<0?Infinity:state.recent.length-1-seen;
    // Prefer fresh, less-used clips only INSIDE the near-best genre/section set.
    const recentPenalty=age===0?2.6:age===1?1.8:age===2?1.1:age<RECENT?.45:0;
    const usagePenalty=Math.min(1.05,Math.max(0,use-leastUsed)*.24);
    // Source metadata is evidence of coverage, not a claim that the animation
    // looks anatomically correct. Small hints, never hard-gate imported clips.
    const lengthBonus=item.duration<1.2?-.38:item.duration<2?-.13:item.duration<=22?.12:0;
    const coverageBonus=item.trackCount<8?-.24:item.trackCount>=25?.10:0;
    const categoryBonus=categories.size>1&&item.category!==lastCategory?.16:0;
    // Preserve the V615-approved motion whenever it remains comparably suitable.
    const proposalBonus=c.name===proposed?.58:0;
    return {name:c.name,category:item.category,
      score:c.score-recentPenalty-usagePenalty+lengthBonus+coverageBonus+categoryBonus+proposalBonus};
  }).sort((a,b)=>b.score-a.score||a.name.localeCompare(b.name));
}

function commit(
  state:IntelligentMotionLibraryStateV639,name:string,at:number,signature:string,
  input:GenreMotionInputV536,proposed:string|null,
):IntelligentMotionLibraryStateV639{
  const available=new Set(input.clips.filter(validGenreCandidateV536).map(c=>c.name));
  const usage:Record<string,number>={};
  // Keep history scoped to the present model/library; unlimited candidate count,
  // but no stale usage entries after a library replacement/removal.
  for(const candidate of available)if(state.usage[candidate])usage[candidate]=state.usage[candidate];
  usage[name]=Math.min(65535,(usage[name]??0)+1);
  return {...state,selectedName:name,lastSwitchMs:at,signature,
    clips:input.clips,proposal:proposed,recent:[...state.recent.filter(n=>available.has(n)),name].slice(-RECENT),
    usage,pendingSignature:'',pendingName:null};
}

/** One stable selection per musical window; cooldown on every automatic switch.
 * Pause/manual/reduced motion clear authority; song/model/seek reset history.
 */
export function stepIntelligentMotionLibraryV639(
  previous:IntelligentMotionLibraryStateV639,input:GenreMotionInputV536,proposed:string|null,
):IntelligentMotionLibraryStateV639{
  const trackId=(input.trackId??'').trim();
  const position=validNumber(input.progressMs,0,0,1_000_000_000);
  const seek=position<previous.lastPositionMs-1500||position>previous.lastPositionMs+60_000;
  const reset=seek||trackId!==previous.trackId||input.modelKey!==previous.modelKey;
  const state=reset?newIntelligentMotionLibraryStateV639():previous;
  const base={...state,trackId,modelKey:input.modelKey,lastPositionMs:position};
  if(!trackId||!input.modelKey||!input.playing||input.reducedMotion||input.manualPriority)
    return {...base,selectedName:null,signature:'',clips:null,proposal:null,
      recent:[],usage:{},pendingSignature:'',pendingName:null};
  const energy=validNumber(input.energy,.5,0,1);
  const energyBin=energy<.33?'quiet':energy>.78?'peak':'normal';
  const signature=`${musicalWindowV588(input).index}|${motionSectionV536(input.section)}|${input.genre??''}|${energyBin}|${input.slot}`;
  const valid=!!state.selectedName&&input.clips.some(c=>c.name===state.selectedName&&validGenreCandidateV536(c));
  if(valid&&state.signature===signature&&state.clips===input.clips&&state.proposal===proposed)return base;
  if(valid&&state.pendingSignature===signature&&state.clips===input.clips&&state.proposal===proposed&&state.pendingName){
    if(position-state.lastSwitchMs<MOTION_LIBRARY_COOLDOWN_V639)return base;
    if(input.clips.some(c=>c.name===state.pendingName&&validGenreCandidateV536(c)))
      return commit(base,state.pendingName,position,signature,input,proposed);
  }
  const ranked=rankIntelligentMotionLibraryV639(input,state,proposed);
  if(!ranked.length)return {...base,selectedName:null,signature,clips:input.clips,
    proposal:proposed,pendingSignature:'',pendingName:null,recent:[],usage:{}};
  // The initial V615 recommendation has already passed the genre and manual
  // owners. Never surprise the first frame with a different action.
  const initial=ranked.some(r=>r.name===proposed)?proposed:ranked[0].name;
  const desired=!valid?initial!:ranked[0].name;
  if(desired===state.selectedName)return {...base,signature,clips:input.clips,proposal:proposed,
    pendingSignature:'',pendingName:null};
  if(valid&&position-state.lastSwitchMs<MOTION_LIBRARY_COOLDOWN_V639)
    return {...base,signature:'',clips:input.clips,proposal:proposed,
      pendingSignature:signature,pendingName:desired};
  return commit(base,desired,position,signature,input,proposed);
}
