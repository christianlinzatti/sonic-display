const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const Module=require('node:module');
const ts=require('./typescript-loader.cjs');
const root=path.resolve(__dirname,'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
function load(file){
  const full=path.join(root,file);
  const result=ts.transpileModule(read(file),{fileName:full,reportDiagnostics:true,
    compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}});
  assert.equal(result.diagnostics.filter(d=>d.category===ts.DiagnosticCategory.Error).length,0,`transpile ${file}`);
  const mod=new Module(full,module);mod.filename=full;mod.paths=Module._nodeModulePaths(path.dirname(full));mod._compile(result.outputText,full);
  return mod.exports;
}
const {resolveKineticStyleV382:style,kineticWordRangeV382:range,resolveKineticWordV382:word,
  kineticDropCueV382:drop,blendKineticColorV382:blend}=load('components/visualizer/kineticLyricsV382.ts');
assert.equal(style('off','neon','hardstyle'),null);
assert.equal(style('rap','neon','hardstyle'),'rap');
assert.equal(style('auto','cinematic',''),'cinematic');
assert.equal(style('auto','kinetic','Deutschrap'),'rap');
assert.equal(style('auto','kinetic','Hardtekk'),'festival');
assert.equal(style('auto','kinetic','hardstyle'),'festival');
assert.equal(style('auto','kinetic',''),'rap');
const line={startMs:1000,endMs:2800,text:'Mein Beat ist stark',words:[
  {text:'Mein',startMs:1000,endMs:1450},{text:'Beat',startMs:1450,endMs:1860},
  {text:'ist',startMs:1860,endMs:2160},{text:'stark',startMs:2160,endMs:2800}]};
assert.deepEqual(range(line,undefined,1),{startMs:1450,endMs:1860,timing:'word'});
assert.deepEqual(range({...line,words:undefined},undefined,1),{startMs:1450,endMs:1900,timing:'estimated'});
assert.deepEqual(range({startMs:0,endMs:null,text:'A B'},3000,0),{startMs:0,endMs:1500,timing:'estimated'});
assert.equal(range({...line,words:[{text:'',startMs:1000,endMs:1100}]},undefined,0).timing,'estimated');
assert.equal(range({...line,words:[{text:'hi',startMs:1000,endMs:3200}]},undefined,0).timing,'estimated');
assert.equal(range({startMs:0,endMs:1000,text:''},undefined,0),null);
const cue=more=>word({line,index:1,progressMs:1500,synced:true,playing:true,reducedMotion:false,preset:'rap',strength:65,...more});
assert.equal(cue({progressMs:1200}).fill,0);
assert.ok(cue({progressMs:1430}).anticipation>0);
assert.ok(cue().fill>0);
assert.ok(cue().scale>1);
assert.ok(cue().lift>0);
assert.ok(cue({progressMs:1860}).fill===1);
assert.equal(cue({progressMs:1860}).enter,0);
assert.equal(cue({strength:0}).scale,1);
assert.equal(cue({playing:false}).scale,1);
assert.equal(cue({playing:false}).fill,cue().fill);
assert.equal(cue({reducedMotion:true}).glow,0);
assert.equal(cue({synced:false}).timing,'none');
assert.equal(cue({progressMs:NaN}).fill,0);
assert.ok(cue({preset:'festival',drop:.9}).scale>cue({preset:'cinematic'}).scale);
assert.equal(cue({preset:'rap',drop:.9}).drop,0);
assert.equal(drop({attack:.9,bass:.8,volume:.7,enabled:false,playing:true}),0);
assert.equal(drop({attack:.9,bass:.8,volume:.7,enabled:true,playing:false}),0);
assert.equal(drop({attack:.5,bass:.8,volume:.7,enabled:true,playing:true}),0);
assert.ok(drop({attack:.9,bass:.8,volume:.7,enabled:true,playing:true})>0);
assert.equal(blend('#000000','#ffffff',0),'#000000');
assert.equal(blend('#000000','#ffffff',1),'#ffffff');
assert.equal(blend('#000000','#ffffff',.5),'#808080');
assert.equal(blend('#zzzzzz','#ffffff',.5),'#zzzzzz');
assert.deepEqual(cue(),cue(),'time-based motion must be deterministic across replays and seeks');
for(const file of ['components/KineticLyrics.tsx','components/visualizer/Lyrics3DScene.tsx']) {
  const s=read(file);assert.ok(s.includes('resolveKineticWordV382'),`common cues in ${file}`);
  assert.ok(s.includes('kineticDropCueV382'),`drop gating in ${file}`);
}
const scene=read('components/visualizer/Lyrics3DScene.tsx');
assert.ok(scene.includes('blendKineticColorV382'),'3D text colors transition smoothly');
for(const file of ['components/visualizer/VisualizerStage.tsx','components/visualizer/RealLyricsStagePreviewV380.tsx']) {
  const s=read(file);assert.ok(s.includes('kineticPresetV382:preferences.lyricsKineticPresetV382'),'3D preview and live stage receive identical settings');
}
for(const file of ['components/SettingsPanel.tsx','components/VisualLyricsStudioV379.tsx']){
  const s=read(file);assert.ok(s.includes('lyricsKineticPresetV382'),'V382 settings exposed '+file);
}
const css=read('app/globals.css');
assert.ok(css.includes('.v382-preset-rap')&&css.includes('.v382-preset-festival')&&css.includes('.v382-preset-cinematic'));
assert.ok(css.includes('@media(prefers-reduced-motion:reduce)'),'accessible reduced motion');
for(const key of ['lyricsKineticPresetV382','lyricsKineticStrengthV382','lyricsKineticDropsV382']) {
  assert.ok(read('types/music.ts').includes(key),'type: '+key);
  assert.ok(read('context/UiPreferencesContext.tsx').includes(key),'default: '+key);
}
const pkg=JSON.parse(read('package.json'));
// Forward-compatible release check: the old finite list stopped at V426.
const version = /^0\.1\.0-v(\d+)$/.exec(pkg.version);
assert.ok(version && Number(version[1]) >= 382, 'V382 feature must survive future releases');
assert.ok(pkg.scripts['verify:offline'].includes('test:v382'));
assert.ok(read('README.md').includes('V382-ADVANCED-KINETIC-LYRICS.md'));
console.log('PASS V382 synchronized word envelopes, estimates, reduced motion, pause, rap/festival/cinematic, measured drop gates, 2D+3D and settings');
