import type {ImpactResult,ImpactSnapshot} from "./performanceOptimizationImpactV265";
import type {OptimizationAction} from "./performanceOptimizationAdvisorV264";
export type ExperimentConfig=Readonly<{mode:"auto"|"high"|"balanced"|"low";director:boolean}>;
export type PerformanceExperiment=Readonly<{id:string;at:number;actions:OptimizationAction[];before:ExperimentConfig;after:ExperimentConfig;baseline:ImpactSnapshot;impact:ImpactResult}>;
export const EXPERIMENT_KEY="sonic:v266:performance-experiments";
const MAX_EXPERIMENTS=20;
const validMode=(value:unknown):value is ExperimentConfig["mode"]=>["auto","high","balanced","low"].includes(String(value));
const metricValid=(v:unknown)=>{if(!v||typeof v!=='object')return false;const m=v as Record<string,unknown>;return (m.better===null||typeof m.better==='boolean')&&['before','after','difference','percent'].every(k=>m[k]===null||(typeof m[k]==='number'&&Number.isFinite(m[k])));};
export function isExperiment(value:unknown):value is PerformanceExperiment{
 if(!value||typeof value!=="object")return false;
 const v=value as Partial<PerformanceExperiment>;
 return typeof v.id==="string"&&v.id.length>0&&Number.isFinite(v.at)&&Array.isArray(v.actions)&&v.actions.every(a=>["render-low","render-balanced","multi-avatar-director"].includes(a))&&!!v.before&&validMode(v.before.mode)&&typeof v.before.director==="boolean"&&!!v.after&&validMode(v.after.mode)&&typeof v.after.director==="boolean"&&!!v.baseline&&['count','from','to'].every(k=>typeof (v.baseline as unknown as Record<string,unknown>)[k]==='number'&&Number.isFinite((v.baseline as unknown as Record<string,number>)[k]))&&['fps','p95FrameMs','slowPercent','avatarCallbackMeanMs','activeAvatars'].every(k=>(v.baseline as unknown as Record<string,unknown>)[k]===null||(typeof (v.baseline as unknown as Record<string,unknown>)[k]==='number'&&Number.isFinite((v.baseline as unknown as Record<string,number>)[k])))&&v.impact?.status==="ready"&&['fps','p95FrameMs','slowPercent','avatarCallbackMeanMs'].every(k=>metricValid((v.impact?.metrics as unknown as Record<string,unknown>)?.[k]));
}
export function decodeExperiments(json:string|null):PerformanceExperiment[]{
 if(!json)return [];
 try{const data:unknown=JSON.parse(json);return Array.isArray(data)?data.filter(isExperiment).slice(-MAX_EXPERIMENTS):[];}catch{return []}
}
export function addExperiment(existing:readonly PerformanceExperiment[],next:PerformanceExperiment):PerformanceExperiment[]{
 return [...existing.filter(e=>e.id!==next.id),next].slice(-MAX_EXPERIMENTS);
}
export function scoreExperiment(e:PerformanceExperiment):number|null{
 // Higher frame-rate, lower P95 and fewer slow frames. Null when there is no comparable FPS.
 if(!isExperiment(e))return null;
 const fps=e.impact.metrics.fps;
 if(fps.before===null||fps.after===null||fps.after<=0||!Number.isFinite(fps.after))return null;
 const p95=e.impact.metrics.p95FrameMs.after;
 const slow=e.impact.metrics.slowPercent.after;
 return fps.after - (p95===null?0:Math.max(0,p95-16.7)*0.3) - (slow===null?0:Math.max(0,slow)*0.12);
}
export function bestExperiment(experiments:readonly PerformanceExperiment[]):PerformanceExperiment|null{
 const comparable=experiments.map(e=>({e,score:scoreExperiment(e)})).filter((x):x is {e:PerformanceExperiment;score:number}=>x.score!==null);
 comparable.sort((a,b)=>b.score-a.score);return comparable[0]?.e??null;
}
