import type {Lyrics} from "@/types/music";
import {compareRapArticulationWordV421,type RapComparisonOptionsV421,type RapWordSelectionV421,type RapMouthPoseV421} from "./rapArticulationComparisonV421";
import {rapWordKeyV420,normalizeRapMouthEditV420,type RapMouthWordEditV420,type RapMouthKeyframeV420} from "./rapSyllableKeyframesV420";

/** V422: candidate edits from *predicted* V419 motion, never an audio error measurement. */
export type RapArticulationSuggestionV422={
 id:"smooth"|"restrained";title:string;explanation:string;observations:string[];
 edit:RapMouthWordEditV420;estimatedPeakChange:number;wordDurationMs:number;
};
const clamp=(v:number,min=0,max=1)=>Number.isFinite(v)?Math.max(min,Math.min(max,v)):min;
const CHANNELS=["jaw","wide","round"] as const;
type Channel=typeof CHANNELS[number];
const makeFrame=(at:number,pose:Pick<RapMouthPoseV421,Channel>):RapMouthKeyframeV420=>({
 at:clamp(at),jaw:clamp(pose.jaw),wide:clamp(pose.wide),round:clamp(pose.round)
});
/** Proposals are disabled for already-edited words, invalid timebases and unusable predictions. */
export function suggestRapArticulationV422(
 lyrics:Lyrics|null,word:RapWordSelectionV421,options:RapComparisonOptionsV421
):RapArticulationSuggestionV422[]{
 if(!lyrics?.synced||!options.rapSyllableTrackIdV420||
    options.rapSyllableDocumentV420?.trackId!==options.rapSyllableTrackIdV420||
    !Number.isFinite(word?.startMs)||!Number.isFinite(word?.endMs)||
    word.endMs<=word.startMs||word.endMs-word.startMs>2100||
    options.rapSyllableDocumentV420.edits.some(e=>e.startMs===word.startMs&&e.text===rapWordKeyV420(word.text)))return [];
 const baseOptions={...options,rapSyllableDocumentV420:{trackId:options.rapSyllableTrackIdV420,edits:[]}};
 const samples=compareRapArticulationWordV421(lyrics,word,baseOptions,25).points;
 if(samples.length<17)return [];
 const duration=word.endMs-word.startMs;
 let maxStep=0,roundStep=0,jawStep=0;
 for(let i=1;i<samples.length;i++){
  const a=samples[i-1].automatic,b=samples[i].automatic;
  const changes=CHANNELS.map(k=>Math.abs(a[k]-b[k]));
  maxStep=Math.max(maxStep,...changes);roundStep=Math.max(roundStep,changes[2]);jawStep=Math.max(jawStep,changes[0]);
 }
 const quick=duration<=360;
 const observations:string[]=[];
 if(quick)observations.push(`Kurzes Wort (${duration} ms): Übergänge können sehr dicht aufeinanderliegen`);
 if(maxStep>.11)observations.push("Deutliche Formänderung zwischen benachbarten Vorhersagepunkten");
 if(roundStep>.095)observations.push("Schneller Wechsel der Lippenrundung");
 if(jawStep>.12)observations.push("Schnelle Änderung der Kieferöffnung");
 if(!observations.length)return [];
 // Local low-pass smoothing on the *same* V419 samples; five V420-authored keyframes.
 const indices=[0,6,12,18,24];
 const smoothed=indices.map(i=>{
  const center=samples[i].automatic;
  const neighbours=[samples[Math.max(0,i-2)].automatic,samples[Math.max(0,i-1)].automatic,
   center,samples[Math.min(24,i+1)].automatic,samples[Math.min(24,i+2)].automatic];
  const weights=[1,2,4,2,1];
  const pose={} as Pick<RapMouthPoseV421,Channel>;
  for(const channel of CHANNELS){
   const avg=neighbours.reduce((sum,item,j)=>sum+item[channel]*weights[j],0)/10;
   pose[channel]=clamp(center[channel]+clamp(avg-center[channel],-.18,.18)*.85);
  }
  return makeFrame(i/24,pose);
 });
 const proposals:RapArticulationSuggestionV422[]=[];
 const make=(id:RapArticulationSuggestionV422["id"],title:string,explanation:string,frames:RapMouthKeyframeV420[],strength:number)=>{
  const edit=normalizeRapMouthEditV420({startMs:word.startMs,text:word.text,strength,frames});
  if(edit)proposals.push({id,title,explanation,observations:[...observations],edit,
   estimatedPeakChange:maxStep,wordDurationMs:duration});
 };
 make("smooth","Weichere Übergänge","Fünf geglättete Keyframes aus dem V419-Verlauf; Bilabialverschlüsse schützt weiterhin die Live-Engine.",smoothed,85);
 if(quick||maxStep>.15){
  const restrained=smoothed.map(frame=>({...frame,jaw:clamp(frame.jaw*.89),
   wide:clamp(frame.wide*.92),round:clamp(frame.round*.93)}));
  make("restrained","Zurückhaltendere Artikulation","Reduzierte Ausschläge für dicht getaktete Wortbewegungen; keine automatische Qualitätsbewertung.",restrained,75);
 }
 return proposals;
}
