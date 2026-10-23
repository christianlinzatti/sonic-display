import type { AvatarModelComparison } from "./avatarFrameProfiler";

/** Advisory proxy ONLY: estimates callback CPU consumption, never actual GPU or FPS. */
export type AvatarRecommendation = {label:string; p95Ms:number; samples:number; activeInstances:number; tier:"efficient"|"balanced"|"expensive"; confidence:"limited"|"moderate"|"good"};
export type AvatarAdvisorResult = {candidates:AvatarRecommendation[]; suggested:AvatarRecommendation[]; estimatedCallbackBudgetMs:number; usedCallbackBudgetMs:number; note:string};
const MAX_MODELS=4;
const CALLBACK_BUDGET_MS=3.5;
export function adviseAvatarModels(models:readonly AvatarModelComparison[], targetCount=2):AvatarAdvisorResult {
  const count=Math.max(1,Math.min(MAX_MODELS,Math.floor(Number.isFinite(targetCount)?targetCount:2)));
  const candidates=models.filter(m=>Number.isFinite(m.p95Ms)&&m.p95Ms>=0&&m.samples>=30)
    .map(m=>({label:m.label,p95Ms:m.p95Ms,samples:m.samples,activeInstances:m.activeInstances,
      tier:(m.p95Ms<=0.6?"efficient":m.p95Ms<=1.6?"balanced":"expensive") as AvatarRecommendation["tier"],
      confidence:(m.samples>=180?"good":m.samples>=80?"moderate":"limited") as AvatarRecommendation["confidence"]}))
    .sort((a,b)=>a.p95Ms-b.p95Ms||b.samples-a.samples);
  const suggested:AvatarRecommendation[]=[];
  let used=0;
  for(const model of candidates){
    if(suggested.length>=count)break;
    // P95 values from separate callbacks are approximate; this is not a frame budget guarantee.
    if(used+model.p95Ms>CALLBACK_BUDGET_MS && suggested.length>0)continue;
    suggested.push(model);used+=model.p95Ms;
  }
  return {candidates,suggested,estimatedCallbackBudgetMs:CALLBACK_BUDGET_MS,usedCallbackBudgetMs:used,
    note:"Nur gemessene Animations-Callbacks (P95), keine GPU-, React- oder vollständige Framezeit. Ähnliche Szenen/Motions vergleichen. Die Empfehlung ist keine FPS-Garantie."};
}
