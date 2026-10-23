const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const load=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
const scheduler=load('components/visualizer/adaptiveAnimationScheduler.ts'), scene=load('components/visualizer/ThreeAvatar.tsx'), panel=load('components/visualizer/RenderDiagnosticsPanel.tsx'), pkg=require('../package.json');
const checks=[
 scheduler.includes('type SchedulerTier = "normal" | "constrained" | "critical"'),
 scheduler.includes('total >= 15'),scheduler.includes('total >= 8'),
 scheduler.includes('healthyIntervals >= 5'),scheduler.includes('Date.now() - profiler.updatedAt > 6000'),
 scheduler.includes('lastRun.get(key)'),scheduler.includes('lastRun.set(key, nowSeconds)'),
 scheduler.includes('force = false'),scheduler.includes('setAnimationSchedulerEnabled'),
 scheduler.includes('constrained: { director: 3, formation: 1 / 24, preview: 0.3 }'),
 scene.includes('evaluateAnimationBudget(now)'),scene.includes('shouldRunScheduledTask(schedulerInstance, "director"'),
 scene.includes('shouldRunScheduledTask(schedulerInstance, "preview"'),scene.includes('shouldRunScheduledTask("duo", "formation"'),
 scene.includes('const scene = cachedFormation.current!'),
 scene.includes('measureProfilerPhase("footIK"'),scene.includes('measureProfilerPhase("handIK"'),
 panel.includes('getAnimationSchedulerSnapshot'),panel.includes('setAnimationSchedulerEnabled'),
 pkg.version==='0.1.0-v248', pkg.scripts['verify:offline'].includes('test:animation-scheduler')];
checks.forEach((ok,i)=>assert.ok(ok,`scheduler integration ${i+1}`));
console.log(`V164 adaptive scheduler: ${checks.length} integration checks passed`);
