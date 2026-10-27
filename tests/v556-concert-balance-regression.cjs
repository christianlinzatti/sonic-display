'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const ts=require('./typescript-loader.cjs');
const root=path.resolve(__dirname,'..');
const src=(p)=>fs.readFileSync(path.join(root,p),'utf8');
const cache=new Map();
function transpile(relative){
 if(cache.has(relative))return cache.get(relative);
 const file=relative.endsWith('.ts')||relative.endsWith('.tsx')?relative:relative+'.ts';
 const compiled=ts.transpileModule(src(file),{fileName:file,reportDiagnostics:true,
  compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX}});
 assert.equal(compiled.diagnostics?.length??0,0,`syntax ${file}`);
 const m={exports:{}};cache.set(relative,m.exports);
 const req=(id)=>id.startsWith('./')?transpile(path.posix.join(path.posix.dirname(file),id)):require(id);
 new Function('module','exports','require',compiled.outputText)(m,m.exports,req);
 cache.set(relative,m.exports);return m.exports;
}
const {balanceConcertDetailsV556:balance}=transpile('components/visualizer/concertBalanceV556.ts');
const {concertPreviewV556:demo}=transpile('components/visualizer/concertDetailPreviewV556.ts');
const {DEFAULT_CONCERT_DETAILS_V555:base}=transpile('components/visualizer/concertDetailEffectsV555.ts');
let count=0;
function test(name,fn){fn();++count;console.log('PASS V556',name);}
const result=(mode='hook',settings=base,reduce=false,tier='balanced',playing=true)=>demo(mode,settings,reduce,tier,playing);
test('Hook-Projektion bleibt verfügbar, wenn die Lyrics nicht dicht sind',()=>{
 const hook=result('hook');assert.equal(hook.cue.hook,true);
 assert.equal(hook.cue.projectedWord,'HEUTE');assert.ok(hook.balance.projection>0);
 assert.ok(hook.balance.pixelWall>0);
});
test('Strophe ohne Projektion, aber mit Gobo und LED',()=>{
 const verse=result('verse');assert.equal(verse.cue.hook,false);assert.equal(verse.balance.projection,0);
 assert.ok(verse.balance.gobo>0);assert.ok(verse.balance.pixelWall>0);
});
test('Dichter Deutschrap regelt Pixelwand herunter und blendet Hook-Schrift aus',()=>{
 const dense=result('dense');const verse=result('verse');
 assert.equal(dense.balance.isDense,true);assert.equal(dense.cue.projectedWord,'');
 assert.equal(dense.balance.projection,0);assert.ok(dense.balance.pixelWall<verse.balance.pixelWall);
});
test('Projektionspriorität reduziert Gobo und LED gegenüber regulären Hook-Lichtern',()=>{
 const hook=result('hook');const noProj=result('hook',{...base,hookProjection:false});
 assert.ok(hook.balance.gobo<noProj.balance.gobo);
 assert.ok(hook.balance.pixelWall<noProj.balance.pixelWall);
 assert.equal(noProj.balance.projection,0);
});
test('Stärkeregler 0-100 begrenzt additive Gesamthelligkeit',()=>{
 for(const strength of [0,25,45,100,NaN,-50,Infinity]){
  const out=result('hook',{...base,strength}).balance;
  assert.ok([out.gobo,out.pixelWall,out.floorFog,out.projection].every(v=>Number.isFinite(v)&&v>=0));
  assert.ok(out.gobo+out.pixelWall+out.projection<=.350001);
  if(strength===0||!Number.isFinite(strength)||strength<0) assert.equal(out.projection,0);
 }
});
test('Schalter wirken unabhängig voneinander',()=>{
 assert.equal(result('hook',{...base,gobo:false}).balance.gobo,0);
 assert.equal(result('hook',{...base,pixelWall:false}).balance.pixelWall,0);
 assert.equal(result('hook',{...base,floorFog:false}).balance.floorFog,0);
 assert.equal(result('hook',{...base,hookProjection:false}).balance.projection,0);
 assert.equal(result('hook',{...base,enabled:false}).balance.projectedWord,'');
});
test('Low-Tier und reduzierte Bewegung schützen den Raspberry Pi',()=>{
 const low=result('hook',base,false,'low').balance;
 assert.equal(low.gobo,0);assert.equal(low.projection,0);assert.equal(low.floorFog,0);
 assert.ok(low.pixelWall<=.12);
 const reduce=result('hook',base,true).balance;
 assert.equal(reduce.projection,0);assert.ok(reduce.pixelWall<result('hook').balance.pixelWall);
});
test('Pausieren schaltet Zusatzlicht und Projektion aus',()=>{
 const stopped=result('hook',base,false,'balanced',false);
 assert.equal(stopped.balance.pixelWall,0);assert.equal(stopped.balance.gobo,0);
 assert.equal(stopped.balance.projection,0);assert.equal(stopped.cue.projectedWord,'');
});
test('Beispiele sind gekennzeichnet und verändern keine Track-Lyrics',()=>{
 assert.match(result('hook').caption,/NACHT/);assert.match(result('dense').caption,/Gedanken/i);
 const preview=src('components/visualizer/StagePreviewModal.tsx');
 assert.match(preview,/ConcertDetailStageV555/);assert.match(preview,/concertPreviewV556\(concertMode/);
 assert.match(preview,/LESEBEREICH · BEISPIELTEXT/);
 assert.match(preview,/Strophe/);assert.match(preview,/Dichter Deutschrap/);
 assert.match(preview,/aria-pressed=\{concertMode===mode\}/);
});
test('Vorschau und Live benutzen dieselbe Budgetfunktion und behalten Standardregler',()=>{
 const live=src('components/visualizer/ThreeAvatar.tsx');
 assert.match(live,/ConcertDetailStageV555/);
 const renderer=src('components/visualizer/ConcertDetailStageV555.tsx');
 assert.match(renderer,/balanceConcertDetailsV556/);
 // V601 keeps the same V556 budget but transitions its intensity smoothly.
 assert.match(renderer,/wallUniforms.uIntensity.value=(?:balance.pixelWall|move\(wallUniforms.uIntensity.value,balance.pixelWall\))/);
 const settings=src('components/SettingsPanel.tsx');
 assert.match(settings,/ConcertDetailPreviewLauncherV556/);
 assert.match(settings,/concertDetailStrengthV555/);
 const grid=src('components/visualizer/StageThemePreviewGrid.tsx');
 assert.match(grid,/concertDetailsV555=\{concertDetailsV555\}/);
});
test('TSX-Dateien sind syntaktisch gültig',()=>{
 for(const filename of ['components/visualizer/StagePreviewModal.tsx','components/visualizer/ConcertDetailStageV555.tsx',
  'components/visualizer/ConcertDetailPreviewLauncherV556.tsx','components/visualizer/StageThemePreviewGrid.tsx',
  'components/SettingsPanel.tsx']){
  const output=ts.transpileModule(src(filename),{fileName:filename,reportDiagnostics:true,compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.ESNext,jsx:ts.JsxEmit.ReactJSX}});
  assert.equal(output.diagnostics?.length??0,0,filename);
 }
});
console.log('V556 regression checks:',count,'passed.');
