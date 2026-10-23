const assert=require('node:assert/strict');const fs=require('node:fs');const path=require('node:path');
const root=path.join(__dirname,'..');const read=f=>fs.readFileSync(path.join(root,f),'utf8');
const engine=read('components/visualizer/lightingLearningEngine.ts');
const studio=read('components/visualizer/LightingChoreographyStudio.tsx');
const pkg=require('../package.json');
const checks=[
 engine.includes('normalizeLightingGenre'),engine.includes('hardtekk'),engine.includes('recordLightingFeedback'),
 engine.includes('rankLearnedLightCues'),engine.includes('suggestLearnedCueOffset'),engine.includes('sanitizeLightingLearning'),
 engine.includes('slice(-250)'),engine.includes('weight+6'),engine.includes('-.15,.15'),
 engine.includes('changes.length<3'),engine.includes('resetLightingLearning'),engine.includes('localStorage.removeItem'),
 studio.includes('Lernfunktion aktivieren'),studio.includes('Lernfeedback zurücksetzen'),studio.includes('learningEnabled'),
 studio.includes('recordLightingFeedback'),studio.includes('rankLearnedLightCues'),studio.includes('feedback(c,"reject")'),
 studio.includes('feedback(old,"edit"'),studio.includes('mergeAcceptedLightCues'),
 Number(pkg.version.match(/v(\d+)$/)?.[1])>=248,typeof pkg.scripts['test:lighting-learning']==='string'
];checks.forEach((ok,i)=>assert.ok(ok,`V175 integration check ${i+1}`));
console.log(`V175 lighting learning: ${checks.length} checks passed`);
