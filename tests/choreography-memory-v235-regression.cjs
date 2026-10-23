const fs=require('fs'),assert=require('assert');const root=require('path').join(__dirname,'..');
const model=fs.readFileSync(root+'/components/visualizer/choreographyContextMemory.ts','utf8');
const panel=fs.readFileSync(root+'/components/visualizer/AdaptiveChoreographyTimeline.tsx','utf8');
const resolver=fs.readFileSync(root+'/components/visualizer/adaptiveChoreographyLearning.ts','utf8');
for(const x of ['sanitizeContextMemory','rankContextMotions','observeContextMemory','records.slice(-160)','history:[...s.history','if(!s.learn','if(!s.enabled)','count>=3','avoidRepeats','bpmBand'])assert(model.includes(x),x);
for(const x of ['Adaptive Choreography Memory · V235','loadContextMemory','saveContextMemory','observeContextMemory','Kontext-Lernwerte zurücksetzen'])assert(panel.includes(x),x);
assert(resolver.includes('if(memoryChoice)return memoryChoice'));assert(resolver.indexOf('if(manual)')<resolver.indexOf('if(memoryChoice)'));
console.log('V235 context memory regression: passed');
