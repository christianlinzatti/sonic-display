const fs=require("node:fs"),assert=require("node:assert/strict");
const root=process.cwd(),read=p=>fs.readFileSync(`${root}/${p}`,"utf8");
const policy=read("services/monitoring/performanceOptimizationAdvisorV264.ts");
const ui=read("components/PerformanceOptimizationAssistantV264.tsx");
const parent=read("components/PerformanceSessionAnalyzerV262.tsx");
assert.match(policy,/proposeOptimizations/);assert.match(policy,/avatar-cpu/);assert.match(policy,/render-pressure/);
assert.match(ui,/selected\.includes/);assert.match(ui,/onClick=\{apply\}/);assert.match(ui,/setUndo\(original\)/);assert.match(ui,/setPerformanceMode\(undo.mode\)/);assert.match(ui,/setMultiAvatarDirectorEnabled\(undo.director\)/);
assert.match(parent,/PerformanceOptimizationAssistantV264/);console.log("V264 optimization assistant regression: OK");
