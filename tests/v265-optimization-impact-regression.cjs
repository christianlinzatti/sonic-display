const fs=require("node:fs"),assert=require("node:assert/strict");
const read=p=>fs.readFileSync(p,"utf8");
const policy=read("services/monitoring/performanceOptimizationImpactV265.ts"),ui=read("components/PerformanceOptimizationAssistantV264.tsx");
for(const text of ["summarizeImpactWindow","assessOptimizationImpact","s.at>appliedAt","difference<0","difference>0","count:post.length"])assert.ok(policy.includes(text));
for(const text of ["const baseline=summarizeImpactWindow(sampleWindow,6)","const appliedAt=Date.now()","setImpact(baseline?","setImpact(null)","V265 · Vorher/Nachher-Performance","impactResult.status===\"ready\""])assert.ok(ui.includes(text));
assert.ok(Number(JSON.parse(read("package.json")).version.match(/v(\d+)$/)?.[1])>=265);
console.log("V265 optimization impact regression: OK");
