/** V175: local, bounded feedback on lighting suggestions; no network calls. */
import type { LightCue, LightCueKind } from "./lightingTimeline";
import type { AnalyzedLightCue } from "./lightingTimelineAnalyzer";
export type LightingFeedbackKind = "accept"|"reject"|"edit";
export type LightingFeedback = { genre:string; kind:LightCueKind; action:LightingFeedbackKind; atMs:number; deltaMs:number; createdAt:number };
export type LightingLearningState = { version:1; events:LightingFeedback[] };
export type LearnedLightCue = AnalyzedLightCue & { learnedConfidence:number; adjustment:number; explanation:string };
const STORAGE_KEY="sonic-display:lighting-learning-v175";
const EMPTY:LightingLearningState={version:1,events:[]};
const clamp=(n:number,min:number,max:number)=>Number.isFinite(n)?Math.max(min,Math.min(max,n)):min;
export const normalizeLightingGenre=(genre:string)=>{
 const clean=String(genre||"").toLowerCase().trim().slice(0,64);
 if(/hardtekk|hardtek/.test(clean))return "hardtekk";
 if(/hardstyle|hardcore|hard dance/.test(clean))return "hardstyle";
 if(/techno/.test(clean))return "techno";
 if(/hip.hop|rap/.test(clean))return "hip-hop";
 if(/ambient|chill|lofi/.test(clean))return "ambient";
 return "general";
};
export function sanitizeLightingLearning(input:unknown):LightingLearningState{
 if(!input||typeof input!=="object")return {...EMPTY};
 const data=input as Partial<LightingLearningState>;
 if(data.version!==1||!Array.isArray(data.events))return {...EMPTY};
 const events=data.events.slice(-250).filter(e=>e&&typeof e==="object"&&["accept","reject","edit"].includes(e.action)&&["drop","build","blackout","strobe","color"].includes(e.kind)&&Number.isFinite(e.atMs)&&Number.isFinite(e.deltaMs)&&Number.isFinite(e.createdAt)).map(e=>({genre:normalizeLightingGenre(e.genre),kind:e.kind,action:e.action,atMs:Math.round(clamp(e.atMs,0,1800000)),deltaMs:Math.round(clamp(e.deltaMs,-30000,30000)),createdAt:Math.round(clamp(e.createdAt,0,9999999999999))}));
 return {version:1,events};
}
export function loadLightingLearning():LightingLearningState{
 try{if(typeof window==="undefined")return {...EMPTY};return sanitizeLightingLearning(JSON.parse(localStorage.getItem(STORAGE_KEY)||"null"));}catch{return {...EMPTY};}
}
export function saveLightingLearning(state:LightingLearningState):boolean{
 try{if(typeof window==="undefined")return false;localStorage.setItem(STORAGE_KEY,JSON.stringify(sanitizeLightingLearning(state)));return true;}catch{return false;}
}
export function resetLightingLearning():boolean{
 try{if(typeof window==="undefined")return false;localStorage.removeItem(STORAGE_KEY);return true;}catch{return false;}
}
export function recordLightingFeedback(state:LightingLearningState,genre:string,cue:Pick<LightCue,"kind"|"atMs">,action:LightingFeedbackKind,deltaMs=0,createdAt=Date.now()):LightingLearningState{
 return sanitizeLightingLearning({version:1,events:[...sanitizeLightingLearning(state).events,{genre:normalizeLightingGenre(genre),kind:cue.kind,action,atMs:cue.atMs,deltaMs,createdAt}]});
}
/** Prior experience adjusts the *heuristic score*, not calibrated probability.
 * Strong live evidence is never discarded, and explicit manual approval remains required. */
export function rankLearnedLightCues(cues:AnalyzedLightCue[],state:LightingLearningState,genre:string):LearnedLightCue[]{
 const target=normalizeLightingGenre(genre),history=sanitizeLightingLearning(state).events;
 return cues.map(candidate=>{
  const matching=history.filter(e=>e.kind===candidate.cue.kind&&(e.genre===target||e.genre==="general"));
  const weight=matching.reduce((sum,e)=>sum+(e.genre===target?1:.35),0);
  const reward=matching.reduce((sum,e)=>sum+(e.action==="accept"?1:e.action==="reject"?-1:.35)*(e.genre===target?1:.35),0);
  // Shrink toward zero with few observations and cap at ±.15 to retain detector evidence.
  const adjustment=clamp(reward/(weight+6)*.15,-.15,.15);
  const learnedConfidence=clamp(candidate.confidence+adjustment,.05,.95);
  const explanation=weight<1?"Noch kein relevantes Feedback":`${matching.length} frühere Bewertungen (${target}), Änderung ${Math.round(adjustment*100)} Punkte`;
  return {...candidate,learnedConfidence,adjustment,explanation};
 }).sort((a,b)=>b.learnedConfidence-a.learnedConfidence||a.cue.atMs-b.cue.atMs);
}
export function suggestLearnedCueOffset(state:LightingLearningState,genre:string,kind:LightCueKind):number{
 const target=normalizeLightingGenre(genre);
 const changes=sanitizeLightingLearning(state).events.filter(e=>e.action==="edit"&&e.kind===kind&&e.genre===target);
 if(changes.length<3)return 0;
 return Math.round(clamp(changes.reduce((s,e)=>s+e.deltaMs,0)/changes.length,-1500,1500));
}
