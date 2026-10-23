/** V176: deterministic, explainable dashboard and preset hints from local feedback. */
import { normalizeLightingGenre, sanitizeLightingLearning, suggestLearnedCueOffset, type LightingLearningState } from "./lightingLearningEngine";
import type { LightCueKind } from "./lightingTimeline";
export const LIGHTING_KINDS:LightCueKind[]=["drop","build","blackout","strobe","color"];
export type LightingKindSummary={kind:LightCueKind;accepted:number;rejected:number;edited:number;total:number;approvalRate:number|null;averageOffsetMs:number;recommendation:string};
export type LightingGenreSummary={genre:string;total:number;accepted:number;rejected:number;edited:number;kinds:LightingKindSummary[];recommendedPreset:"balanced"|"hard-dance"|"cinematic";reason:string;sampleSufficient:boolean};
function cueSummary(state:LightingLearningState,genre:string,kind:LightCueKind):LightingKindSummary{
 const events=state.events.filter(e=>e.genre===genre&&e.kind===kind);
 const accepted=events.filter(e=>e.action==="accept").length,rejected=events.filter(e=>e.action==="reject").length,edited=events.filter(e=>e.action==="edit").length;
 const votes=accepted+rejected;
 const averageOffsetMs=edited>=3?suggestLearnedCueOffset(state,genre,kind):0;
 return {kind,accepted,rejected,edited,total:events.length,approvalRate:votes?accepted/votes:null,averageOffsetMs,recommendation:votes<3?"Zu wenig Feedback":accepted>rejected?"Bevorzugt":"Eher vermeiden"};
}
/** Only recommend a non-default preset after >=6 votes from this genre; never mutate saved presets. */
export function summarizeLightingLearning(input:LightingLearningState):LightingGenreSummary[]{
 const state=sanitizeLightingLearning(input),genres=[...new Set(state.events.map(e=>normalizeLightingGenre(e.genre)))].sort();
 return genres.map(genre=>{
  const kinds=LIGHTING_KINDS.map(kind=>cueSummary(state,genre,kind));
  const accepted=kinds.reduce((n,k)=>n+k.accepted,0),rejected=kinds.reduce((n,k)=>n+k.rejected,0),edited=kinds.reduce((n,k)=>n+k.edited,0);
  const votes=accepted+rejected;
  const hardVotes=kinds.filter(k=>["drop","strobe","blackout"].includes(k.kind)).reduce((s,k)=>s+k.accepted-k.rejected,0);
  const calmVotes=kinds.filter(k=>["color","build"].includes(k.kind)).reduce((s,k)=>s+k.accepted-k.rejected,0);
  const recommendedPreset=votes<6?"balanced":hardVotes>=3&&hardVotes>calmVotes?"hard-dance":calmVotes>=3&&calmVotes>hardVotes?"cinematic":"balanced";
  const reason=votes<6?`Noch zu wenig Daten (${votes}/6 Entscheidungen)`:recommendedPreset==="hard-dance"?"Häufig bestätigte Drop-/Blackout-/Strobe-Effekte":recommendedPreset==="cinematic"?"Häufig bestätigte Farbwechsel und Build-ups":"Keine eindeutige Präferenz – ausgewogenes Preset";
  return {genre,total:accepted+rejected+edited,accepted,rejected,edited,kinds,recommendedPreset,reason,sampleSufficient:votes>=6};
 });
}
