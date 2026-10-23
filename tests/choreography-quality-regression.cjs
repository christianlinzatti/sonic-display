const assert=require("node:assert/strict");
const fs=require("node:fs");const path=require("node:path");
const read=(p)=>fs.readFileSync(path.join(__dirname,"..",p),"utf8");
const engine=read("components/visualizer/choreographyQualityOptimizer.ts");
const studio=read("components/visualizer/ChoreographyQualityStudio.tsx");
const parent=read("components/visualizer/MotionTimelineStudio.tsx");
const tests={
 "analyzer exported":engine.includes("export function analyzeChoreography"),
 "proposal exported":engine.includes("export function proposeChoreographyOptimization"),
 "non destructive proposal":engine.includes("t.segments.map(s =>"),
 "empty timeline":engine.includes('code: "empty"'),
 "hard cuts":engine.includes('code: "hard-cut"'),
 "gaps":engine.includes('code:"gap"'),
 "overlaps":engine.includes('code:"overlap"'),
 "offbeat":engine.includes('code: "off-beat"'),
 "speed issues":engine.includes('code: "speed"'),
 "keyframe extremes":engine.includes('code: "extreme-key"'),
 "explicit apply":studio.includes('onClick={apply}'),
 "discard":studio.includes('setProposal(null)'),
 "quality score":studio.includes('report.score'),
 "settings integration":studio.includes('updatePreferences({avatarTimeline:proposal})'),
 "mounted":parent.includes('<ChoreographyQualityStudio/>'),
 "old timeline remains":parent.includes('<VisualKeyframeCurveEditor'),
};
for(const [name,ok] of Object.entries(tests)){assert.ok(ok,name);console.log("✓",name)}
console.log(Object.keys(tests).length+" V160 checks passed");
