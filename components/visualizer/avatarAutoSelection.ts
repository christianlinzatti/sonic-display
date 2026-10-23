import type {AvatarModelComparison} from "./avatarFrameProfiler";
import {adviseAvatarModels} from "./avatarPerformanceAdvisor";

/** Resolve only known, installed models; never turn a display label into an unverified URL. */
export function proposeAvatarSelection(models:readonly AvatarModelComparison[], availableIds:readonly string[], count:1|2=2){
  const eligible=models.filter(m=>m.samples>=80 && Number.isFinite(m.p95Ms) && m.p95Ms>=0);
  const allowed=new Set(availableIds);
  const eligibleModels=eligible.filter(m=>m.label.startsWith("GLTF: ") && allowed.has(m.label.slice(6)));
  const advice=adviseAvatarModels(eligibleModels,count);
  const ids=advice.suggested.map(m=>m.label.slice(6));
  return {ids, ready:ids.length===count, estimatedMs:advice.usedCallbackBudgetMs,
    reason: ids.length===count?"Ausreichend gemessene, verfügbare Modelle":"Zu wenige ausreichend gemessene, verfügbare Modelle (mindestens 80 Stichproben je Modell)"};
}
