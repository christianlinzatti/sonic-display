const assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const root=path.resolve(__dirname,"..");
const optimizer=fs.readFileSync(path.join(root,"components/visualizer/benchmarkOptimizer.ts"),"utf8");
const ui=fs.readFileSync(path.join(root,"components/visualizer/PerformanceBenchmarkPanel.tsx"),"utf8");
const profile=fs.readFileSync(path.join(root,"components/visualizer/PerformanceProfiles.tsx"),"utf8");
for(const token of ["measurements.length !== 3","new Set(measurements.map", "m.samples >= 2","m.fps >= targetFps", "m.slowPercent < maxSlowPercent", "a.slowPercent - b.slowPercent", "recommended: null", "meetsTarget: false"]){assert.ok(optimizer.includes(token),token)}
assert.match(ui,/recommendPerformanceProfile\(results\)/);
assert.match(ui,/advice\.explanation/);
assert.match(ui,/setPerformanceMode\(run.previousMode\)/);
assert.match(profile,/Benchmark-Empfehlung/);
console.log("V224 profile optimizer integration regression passed (12 checks)");
