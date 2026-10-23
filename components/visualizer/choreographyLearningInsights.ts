/** V197: explainable local learning insights. No network or audio recording. */
import type {AdaptiveChoreographyState} from "./adaptiveChoreographyLearning";
import type {TimelinePhase} from "./musicStructureTimeline";
import type {InstalledCharacterMotion} from "./characterMotionLibrary";
export type MotionRecommendation={phase:TimelinePhase;motionId:string;name:string;genre:string;count:number;total:number;confidence:number;eligible:boolean;manual:boolean};
export function getLearningRecommendations(state:AdaptiveChoreographyState,avatarId:string,motions:InstalledCharacterMotion[],genre=""):MotionRecommendation[]{
 const available=motions.filter(m=>m.avatarId===avatarId);
 const rows:MotionRecommendation[]=[];
 for(const phase of ["verse","build","drop","break"] as TimelinePhase[]){
  const entries=state.counts.filter(c=>c.avatarId===avatarId&&c.phase===phase&&available.some(m=>m.id===c.motionId));
  const total=entries.reduce((sum,e)=>sum+e.count,0);
  for(const entry of entries){
   const motion=available.find(m=>m.id===entry.motionId)!;
   const matchesGenre=!genre||!motion.genre||motion.genre.toLowerCase().includes(genre.toLowerCase());
   if(!matchesGenre)continue;
   rows.push({phase,motionId:motion.id,name:motion.name,genre:motion.genre||"Alle Genres",count:entry.count,total,confidence:total?entry.count/total:0,eligible:total>=3&&entry.count/total>=0.6,manual:state.assignments[avatarId]?.[phase]===motion.id});
  }
 }
 return rows.sort((a,b)=>["verse","build","drop","break"].indexOf(a.phase)-["verse","build","drop","break"].indexOf(b.phase)||b.confidence-a.confidence||b.count-a.count||a.name.localeCompare(b.name));
}
/** Human overrides: Accept suggestion creates a manual assignment. Reject only clears its learned evidence. */
export function acceptLearningSuggestion(state:AdaptiveChoreographyState,avatarId:string,phase:TimelinePhase,motionId:string,motions:InstalledCharacterMotion[]):AdaptiveChoreographyState{
 if(!motions.some(m=>m.avatarId===avatarId&&m.id===motionId))return state;
 return {...state,assignments:{...state.assignments,[avatarId]:{...state.assignments[avatarId],[phase]:motionId}}};
}
export function dismissLearningSuggestion(state:AdaptiveChoreographyState,avatarId:string,phase:TimelinePhase,motionId:string):AdaptiveChoreographyState{
 return {...state,counts:state.counts.filter(c=>!(c.avatarId===avatarId&&c.phase===phase&&c.motionId===motionId))};
}
export function clearLearningHistory(state:AdaptiveChoreographyState,avatarId:string):AdaptiveChoreographyState{
 return {...state,counts:state.counts.filter(c=>c.avatarId!==avatarId)};
}
