/** V174: bounded live-playback observations; not a full-song Spotify audio analysis. */
import { sanitizeLightCues, type LightCue, type LightCueKind } from "./lightingTimeline";
export type LightingObservation = { atMs:number; energy:number; bass:number; beatStrength:number; beat:boolean };
export type AnalyzedLightCue = { cue:LightCue; confidence:number; reason:string; evidence:number };
const clamp=(v:number,a=0,b=1)=>Number.isFinite(v)?Math.max(a,Math.min(b,v)):a;
export function sanitizeLightingObservations(input:LightingObservation[],durationMs:number):LightingObservation[]{
 const end=clamp(durationMs,0,1800000);if(!Array.isArray(input))return [];
 return input.slice(-1800).filter(o=>o&&Number.isFinite(o.atMs)&&o.atMs>=0&&o.atMs<=end).map(o=>({atMs:Math.round(o.atMs),energy:clamp(o.energy),bass:clamp(o.bass),beatStrength:clamp(o.beatStrength),beat:Boolean(o.beat)})).sort((a,b)=>a.atMs-b.atMs);
}
/** Analyze only observed playback; confidence discounts sparse observations, noisy changes and short time windows. */
export function analyzeLightingObservations(input:LightingObservation[],durationMs:number):AnalyzedLightCue[]{
 const points=sanitizeLightingObservations(input,durationMs);if(points.length<20)return [];
 const windows:{atMs:number;energy:number;bass:number;beats:number;count:number}[]=[];
 const first=Math.floor(points[0].atMs/2000),last=Math.floor(points[points.length-1].atMs/2000);
 for(let i=first;i<=last;i++){
  const sample=points.filter(p=>Math.floor(p.atMs/2000)===i);
  if(sample.length<3)continue;
  windows.push({atMs:i*2000,energy:sample.reduce((s,p)=>s+p.energy,0)/sample.length,bass:sample.reduce((s,p)=>s+p.bass,0)/sample.length,beats:sample.reduce((s,p)=>s+(p.beat?1:0),0),count:sample.length});
 }
 const candidates:AnalyzedLightCue[]=[];
 for(let i=2;i<windows.length-1;i++){
  const prev=windows[i-1],now=windows[i],previous=windows[i-2],next=windows[i+1];
  if(now.atMs-prev.atMs!==2000||prev.atMs-previous.atMs!==2000||next.atMs-now.atMs!==2000)continue;
  const rise=now.energy-prev.energy,drop=prev.energy-now.energy;
  const quiet=now.energy<.34&&previous.energy>.47&&drop>.16;
  const peak=now.energy>.55&&rise>.17&&now.bass>prev.bass+.09;
  const build=rise>.09&&next.energy>now.energy+.045;
  let kind:LightCueKind|null=null,score=0,reason="";
  if(quiet){kind="blackout";score=clamp(.38+drop*.7);reason="Deutlicher Energieabfall nach lauter Passage (möglicher Break)";}
  else if(peak){kind="drop";score=clamp(.36+rise*.7+(now.bass-prev.bass)*.3);reason="Bass- und Energieanstieg (möglicher Drop)";}
  else if(build){kind="build";score=clamp(.32+rise*.9);reason="Steigende Energie in aufeinanderfolgenden Fenstern";}
  if(!kind)continue;
  const continuity=clamp(Math.min(prev.count,now.count,next.count)/8);
  const confidence=clamp(score*(.55+.45*continuity),0,.9);
  const atMs=now.atMs;
  const cue:LightCue={id:`analysis-${kind}-${atMs}`,kind,atMs,strength:clamp(.3+confidence*.6),durationMs:kind==="blackout"?320:kind==="build"?3500:1600};
  candidates.push({cue,confidence,reason,evidence:prev.count+now.count+next.count});
 }
 // A two-second peak should not create many near-duplicate cues.
 const result:AnalyzedLightCue[]=[];
 for(const item of candidates.sort((a,b)=>b.confidence-a.confidence)){
  if(result.some(other=>Math.abs(other.cue.atMs-item.cue.atMs)<6000))continue;
  result.push(item);if(result.length>=32)break;
 }
 return result.sort((a,b)=>a.cue.atMs-b.cue.atMs);
}
export function combineAnalyzedLightingCues(estimated:LightCue[],analyzed:AnalyzedLightCue[],durationMs:number):AnalyzedLightCue[]{
 const automatic=sanitizeLightCues(estimated,durationMs).map(cue=>({cue,confidence:.22,reason:"BPM-/Phrasen-Schätzung ohne gemessene Audioevidenz",evidence:0}));
 const strong=analyzed.filter(c=>c.confidence>=.3);
 return [...strong,...automatic.filter(c=>!strong.some(s=>Math.abs(s.cue.atMs-c.cue.atMs)<3500))].sort((a,b)=>a.cue.atMs-b.cue.atMs).slice(0,120);
}
