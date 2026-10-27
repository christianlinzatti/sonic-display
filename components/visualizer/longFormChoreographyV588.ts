/** V588 - long-song rotation for ALREADY LOADED GLB actions.
 * Pure, deterministic musical-window planner. No new clips, mixers, frame loops or
 * unverified singer assignments. Authored clips and source animation data are untouched.
 */
import {
  motionSectionV536, rankGenreMotionsV536, type GenreMotionCandidateV536,
  type GenreMotionInputV536, type GenreMotionStateV536,
} from './genreAwareMotionDirectorV536';

export type LongFormMotionStateV588={
  trackId:string;modelKey:string;selectedName:string|null;
  lastPositionMs:number;lastSwitchMs:number;windowIndex:number;
  signature:string;clips:readonly GenreMotionCandidateV536[]|null;
  poolSize:number;pendingSignature:string;pendingName:string|null;
};
export const newLongFormMotionStateV588=():LongFormMotionStateV588=>({
  trackId:'',modelKey:'',selectedName:null,lastPositionMs:0,lastSwitchMs:-Infinity,
  windowIndex:-1,signature:'',clips:null,poolSize:0,pendingSignature:'',pendingName:null,
});
const finite=(value:number|null|undefined,fallback:number,min:number,max:number)=>
  typeof value==='number'&&Number.isFinite(value)?Math.max(min,Math.min(max,value)):fallback;
function hash(text:string):number{
  let result=2166136261;
  for(let i=0;i<text.length;i++)result=Math.imul(result^text.charCodeAt(i),16777619);
  return result>>>0;
}
export function musicalWindowV588(input:Pick<GenreMotionInputV536,'bpm'|'progressMs'>):{index:number;durationMs:number}{
  // 32 beats (~8 bars in 4/4); leave 8s+ between possible changes, even in Hardtekk.
  const durationMs=Math.max(10_000,Math.min(28_000,32*60_000/finite(input.bpm,120,55,220)));
  return {index:Math.floor(finite(input.progressMs,0,0,1_000_000_000)/durationMs),durationMs};
}
export type LongFormPlanV588={name:string|null;poolSize:number;windowIndex:number;durationMs:number};
/** Choice does not depend on React render count or the order playback reaches the window. */
export function planLongFormChoreographyV588(input:GenreMotionInputV536):LongFormPlanV588 {
  const {index,durationMs}=musicalWindowV588(input);
  if(!input.trackId||!input.modelKey||!input.playing||input.manualPriority||input.reducedMotion)
    return {name:null,poolSize:0,windowIndex:index,durationMs};
  const ranked=rankGenreMotionsV536(input,`v588:${motionSectionV536(input.section)}:${index}`);
  if(!ranked.length)return {name:null,poolSize:0,windowIndex:index,durationMs};
  // Select only close, musically compatible alternatives. Keep unsafe locomotion
  // out of the rotation when stationary clips are available; leave V536 fallback.
  const categories=new Map(input.clips.map(c=>[c.name,c.category] as const));
  const eligible=ranked.filter(r=>r.score>=ranked[0].score-1.75 && categories.get(r.name)!=='locomotion');
  if(eligible.length<2)return {name:null,poolSize:eligible.length,windowIndex:index,durationMs};
  // Stable ordering creates real repertoire rotation, including clips added to the
  // extensible library. No artificial cap of 20 or 64 candidates.
  const repertoire=eligible.map(r=>r.name).sort();
  const seed=hash(`${input.trackId}|${input.modelKey}|${input.genre??''}|${motionSectionV536(input.section)}|${Math.floor(finite(input.slot,0,0,15))}`);
  const name=repertoire[(seed%repertoire.length+index)%repertoire.length];
  return {name,poolSize:repertoire.length,windowIndex:index,durationMs};
}
/** Guard crossfades against rapid section changes, clip removal, manual override
 * and song/GLB seeking. At most one 8s-bounded new selection, no render-side mutation.
 */
export function stepLongFormChoreographyV588(
  previous:LongFormMotionStateV588,input:GenreMotionInputV536,baseline:GenreMotionStateV536,
):LongFormMotionStateV588{
  const trackId=input.trackId??'',position=finite(input.progressMs,0,0,1_000_000_000);
  const seek=position<previous.lastPositionMs-1500||position>previous.lastPositionMs+60_000;
  const fresh=trackId!==previous.trackId||input.modelKey!==previous.modelKey||seek;
  const state=fresh?newLongFormMotionStateV588():previous;
  const base={...state,trackId,modelKey:input.modelKey,lastPositionMs:position};
  if(!trackId||!input.modelKey||!input.playing||input.manualPriority||input.reducedMotion)
    return {...base,selectedName:null,signature:'',poolSize:0,clips:null,pendingSignature:'',pendingName:null};
  const window=musicalWindowV588(input),energy=finite(input.energy,.5,0,1);
  const bin=energy<.33?'low':energy>.78?'high':'mid';
  const signature=`${window.index}|${input.section??''}|${input.genre??''}|${bin}|${input.slot}`;
  const valid=state.selectedName!==null&&input.clips.some(c=>c.name===state.selectedName);
  // Cheap when progress changes per frame: scoring/sorting happens only when a
  // phrase, section, genre, available clip list or meaningful energy tier changes.
  if(valid&&state.signature===signature&&state.clips===input.clips)return base;
  // Pending sections must not re-rank the entire motion library at 60fps while
  // waiting for the 8-second safety interval.
  if(valid&&state.pendingSignature===signature&&state.clips===input.clips&&state.pendingName){
    if(position-state.lastSwitchMs<8_000)return base;
    return {...base,selectedName:state.pendingName,lastSwitchMs:position,signature,
      pendingSignature:'',pendingName:null};
  }
  const plan=planLongFormChoreographyV588(input);
  const target=plan.name??baseline.selectedName;
  if(!target)return {...base,selectedName:null,signature,clips:input.clips,windowIndex:window.index,poolSize:plan.poolSize,pendingSignature:'',pendingName:null};
  const limited=valid&&!fresh&&target!==state.selectedName&&position-state.lastSwitchMs<8_000;
  // Do not memoize a blocked candidate: retry the request once the safe interval
  // elapses, even if the musical window has not changed.
  if(limited)return {...base,signature:'',clips:input.clips,windowIndex:window.index,poolSize:plan.poolSize,
    pendingSignature:signature,pendingName:target};
  return {...base,selectedName:target,lastSwitchMs:target!==state.selectedName?position:state.lastSwitchMs,
    signature,clips:input.clips,windowIndex:window.index,poolSize:plan.poolSize,pendingSignature:'',pendingName:null};
}
