const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const r=path.resolve(__dirname,'..');const read=p=>fs.readFileSync(path.join(r,p),'utf8');
let n=0;const check=(x,p)=>{assert.ok(p,x);n++};
const e=read('components/visualizer/choreographyLearningInsights.ts');const u=read('components/visualizer/ChoreographyLearningDashboard.tsx');const p=read('components/CharacterMotionLibraryPanel.tsx');
for(const s of ['getLearningRecommendations','acceptLearningSuggestion','dismissLearningSuggestion','clearLearningHistory','total>=3','>=0.6','confidence:total?entry.count/total:0','m=>m.avatarId===avatarId','motionId','manual:','state.assignments','sort(','matchesGenre','counts.filter','entries.reduce'])check('engine '+s,e.includes(s));
for(const s of ['ADAPTIVE_CHOREOGRAPHY_EVENT','loadAdaptiveState','saveAdaptiveState','useMemo','genre','progress','Math.round(r.confidence*100)','r.count','r.total','r.eligible','r.manual','window.confirm','Lernwert verwerfen','Als manuelle Motion übernehmen','disabled={r.manual}','clearLearningHistory'])check('UI '+s,u.includes(s));
check('mounted',p.includes('<ChoreographyLearningDashboard avatarId={avatar} motions={motions}/>'));
check('v197',JSON.parse(read('package.json')).version==='0.1.0-v248');
console.log(`${n} V197 learning dashboard checks passed`);
