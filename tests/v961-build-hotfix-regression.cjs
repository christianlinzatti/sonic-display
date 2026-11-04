'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');const path=require('node:path');const ts=require('./typescript-loader.cjs');
const root=path.resolve(__dirname,'..');const read=x=>fs.readFileSync(path.join(root,x),'utf8');
const dynamic=read('components/visualizer/DynamicStage.tsx');
const live=read('components/visualizer/LiveFxDeckV881.tsx');
assert.match(dynamic,/const cinematicFogV887=planCinematicFogV887\([\s\S]*?genre:genre\?\?''/);
assert.match(dynamic,/const particleMixV889=directParticlesV889\(\{[\s\S]{0,240}?genre:genre\?\?''/);
assert.match(live,/onChange=\{\(e:\{target:\{value:string\}\}\)=>updateSpotlightV890\(\{style:e\.target\.value/);
assert.match(live,/onChange=\{\(e:\{target:\{value:string\}\}\)=>updateSpotlightV890\(\{mood:e\.target\.value/);
for(const file of ['components/visualizer/DynamicStage.tsx','components/visualizer/LiveFxDeckV881.tsx']){
 const s=read(file);const node=ts.createSourceFile(file,s,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);
 assert.equal(node.parseDiagnostics.length,0,'No syntax errors '+file);
}
console.log('V961 build hotfix: 6 TS/source regression checks PASS');
