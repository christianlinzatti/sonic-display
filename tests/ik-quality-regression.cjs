const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const read=x=>fs.readFileSync(path.resolve(__dirname,'../components/visualizer',x),'utf8');
const engine=read('ikMotionAnalyzer.ts');const avatar=read('ThreeAvatar.tsx');const panel=read('DanceDiagnosticsPanel.tsx');
const checks=[
['external-store subscription',engine.includes('useSyncExternalStore')],
['foot anchor measured',engine.includes('distanceTo(leg.planted)')],
['planted-only samples',engine.includes('leg.contact.phase !== "planted"')],
['hand target error',engine.includes('Math.hypot(pos.x-x,pos.y-y,pos.z-z)')],
['hand IK correction measurement',engine.includes('handState.upperOffset.w')],
['invalid dt rejected',engine.includes('dt > 0.25')],
['inactive samples cleared',engine.includes('Object.assign(s, createIKQualitySampler())')],
['rate-limited reports',engine.includes('s.time < 1')],
['recommendations only',engine.includes('recommendations.push')],
['frame loop wiring',avatar.includes('sampleIKQuality(ikQualitySampler.current')],
['diagnostic panel',panel.includes('useIKQuality()')],
['disclosed units',panel.includes('world units')],
['disclosed duo behavior',panel.includes('zuletzt gemeldeten Tänzer')],
['no tuning writes',!engine.includes('localStorage.setItem')],
];for(const [name,okay] of checks){assert.ok(okay,name);console.log('✓',name)}
console.log(`${checks.length} V157 IK quality tests passed`);
