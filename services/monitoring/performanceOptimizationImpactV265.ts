import type {AnalysisSample} from "./performanceSessionAnalyzerV262";
/** A baseline and a follow-up are disjoint 5-second sample windows. */
export type ImpactMetric = "fps" | "p95FrameMs" | "avatarCallbackMeanMs" | "slowPercent";
export type ImpactSnapshot = Readonly<{count:number; from:number; to:number; fps:number|null; p95FrameMs:number|null; avatarCallbackMeanMs:number|null; slowPercent:number|null; activeAvatars:number|null}>;
export type ImpactDelta = Readonly<{before:number|null; after:number|null; difference:number|null; percent:number|null; better:boolean|null}>;
export type ImpactResult = Readonly<{status:"collecting"|"ready"|"insufficient"; count:number; required:number; metrics:Record<ImpactMetric,ImpactDelta>; note:string}>;
const METRICS:readonly ImpactMetric[]=["fps","p95FrameMs","avatarCallbackMeanMs","slowPercent"];
const average=(values:readonly number[]):number|null=>values.length?values.reduce((a,b)=>a+b,0)/values.length:null;
export function summarizeImpactWindow(series:readonly AnalysisSample[], min=4):ImpactSnapshot|null {
 if(series.length<min)return null;
 const values=(key:ImpactMetric)=>series.map(s=>s[key]).filter((v):v is number=>v!==null&&Number.isFinite(v));
 const [first,last]=[series[0],series[series.length-1]];
 return {count:series.length,from:first.at,to:last.at,fps:average(values("fps")),p95FrameMs:average(values("p95FrameMs")),avatarCallbackMeanMs:average(values("avatarCallbackMeanMs")),slowPercent:average(values("slowPercent")),activeAvatars:average(series.map(s=>s.activeAvatars))};
}
export function assessOptimizationImpact(baseline:ImpactSnapshot, samples:readonly AnalysisSample[], appliedAt:number, required=6):ImpactResult {
 const post=samples.filter(s=>s.at>appliedAt).slice(0,required);
 const follow=summarizeImpactWindow(post,required);
 const metrics={} as Record<ImpactMetric,ImpactDelta>;
 for(const key of METRICS){
  const before=baseline[key],after=follow?.[key]??null;
  const difference=before===null||after===null?null:after-before;
  metrics[key]={before,after,difference,percent:difference===null||before===null||before===0?null:100*difference/Math.abs(before),better:difference===null?null:key==="fps"?difference>0:difference<0};
 }
 const complete=post.length>=required;
 const sameAvatars=follow!==null&&follow.activeAvatars!==null&&baseline.activeAvatars!==null&&Math.abs(follow.activeAvatars-baseline.activeAvatars)<0.25;
 return {status:complete?"ready":"collecting",count:post.length,required,metrics,note:complete?(sameAvatars?"Vergleich abgeschlossen. Szenen- und Musikwechsel können die Aussagekraft beeinflussen.":"Die Anzahl aktiver Avatare hat sich verändert; Vergleich nur eingeschränkt aussagekräftig."): `Weitere Messungen erforderlich (${post.length}/${required}). Wiedergabe muss laufen.`};
}
