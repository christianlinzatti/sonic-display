const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const ts = require('./typescript-loader.cjs');
const root = path.resolve(__dirname,'..');
const read = file => fs.readFileSync(path.join(root,file),'utf8');
const cache = new Map();
function load(file) {
  const full = path.resolve(root,file);
  if (cache.has(full)) return cache.get(full).exports;
  const code = ts.transpileModule(fs.readFileSync(full,'utf8'),{
    fileName:full,reportDiagnostics:true,
    compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}
  });
  assert.equal(code.diagnostics.filter(d=>d.category===ts.DiagnosticCategory.Error).length,0,`transpile: ${file}`);
  const mod = new Module(full,module);
  mod.filename=full;mod.paths=Module._nodeModulePaths(path.dirname(full));cache.set(full,mod);
  const nativeRequire=mod.require.bind(mod);
  mod.require=name=>name.startsWith('./')?load(path.join(path.relative(root,path.dirname(full)),`${name}.ts`)):nativeRequire(name);
  mod._compile(code.outputText,full);
  return mod.exports;
}
const {timingQualityV379,activeStudioLineV379,resolveStudioCompositionV379,
  DEMO_LYRICS_V379,DEMO_DURATION_V379,STUDIO_PRESETS_V379}=load('components/visualizer/visualLyricsStudioV379.ts');
assert.equal(DEMO_LYRICS_V379.lines.length,4);
assert.equal(DEMO_DURATION_V379,16000);
assert.equal(timingQualityV379(DEMO_LYRICS_V379),'word');
assert.equal(timingQualityV379({...DEMO_LYRICS_V379,lines:DEMO_LYRICS_V379.lines.map(({words,...line})=>line)}),'line');
assert.equal(timingQualityV379({...DEMO_LYRICS_V379,synced:false}),'plain');
assert.equal(timingQualityV379(null),'missing');
assert.equal(timingQualityV379({...DEMO_LYRICS_V379,lines:[]}), 'missing');
assert.equal(activeStudioLineV379(DEMO_LYRICS_V379,-1),-1);
assert.equal(activeStudioLineV379(DEMO_LYRICS_V379,0),0);
assert.equal(activeStudioLineV379(DEMO_LYRICS_V379,4000),1);
assert.equal(activeStudioLineV379(DEMO_LYRICS_V379,10800),3);
assert.equal(activeStudioLineV379(DEMO_LYRICS_V379,NaN),-1);
assert.equal(activeStudioLineV379(null,4000),-1);
for(const line of DEMO_LYRICS_V379.lines) {
  assert.ok(line.words?.length>0 && line.words.map(w=>w.text).join(' ').replace(/\s+/g,' ').length>0);
  assert.ok(line.words.every(w=>Number.isFinite(w.startMs)&&w.startMs>=line.startMs&&w.endMs<=line.endMs));
}
const opts = { lyrics:DEMO_LYRICS_V379,progressMs:4000,playing:true,immersive:true,section:'verse',
  preferences:{lyricsImmersiveSide:'right',avatarLyricsCameraModeV378:'cinematic',avatarLyricsCameraStrengthV378:70,reducedMotion:false} };
const view=more=>resolveStudioCompositionV379({...opts,...more});
assert.equal(view().shot,'balanced');
assert.equal(view().activeLine,1);
assert.equal(view().timing,'word');
assert.equal(view().safeZone,'right');
assert.equal(view({section:'hook'}).shot,'group');
assert.equal(view({section:'drop'}).shot,'group');
assert.equal(view({progressMs:15000}).shot,'lyrics','word timed ending receives optional editorial emphasis');
assert.equal(view({progressMs:15000,preferences:{...opts.preferences,avatarLyricsCameraModeV378:'readable'}}).shot,'balanced');
assert.equal(view({preferences:{...opts.preferences,lyricsImmersiveSide:'left'}}).safeZone,'left');
assert.equal(view({immersive:false}).safeZone,'bottom');
assert.equal(view({immersive:false}).shot,'none');
assert.equal(view({playing:false}).shot,'none');
assert.equal(view({progressMs:19000}).shot,'none');
assert.equal(view({preferences:{...opts.preferences,reducedMotion:true}}).shot,'none');
assert.equal(view({preferences:{...opts.preferences,avatarLyricsCameraModeV378:'off'}}).shot,'none');
assert.equal(view({lyrics:null}).timing,'missing');
assert.equal(view({lyrics:null}).shot,'none');
assert.deepEqual(view(),view(),'editor preview is clock-deterministic');
for(const name of ['deutschrap','festival','cinematic']){
  const preset=STUDIO_PRESETS_V379[name];
  assert.ok(['kinetic','neon','cinematic'].includes(preset.lyricsStyle));
  assert.ok(['bold','rounded','serif'].includes(preset.lyricsFontFamilyV379));
  assert.ok(preset.lyricsFontSize>=60 && preset.lyricsFontSize<=180);
  assert.match(preset.lyricsGradientFrom,/^#[0-9a-f]{6}$/i);
  assert.equal(typeof preset.avatarLyricsContrastV378,'boolean');
}
const ui=read('components/VisualLyricsStudioV379.tsx');
for(const marker of ['KineticLyrics','useMusic','useUiPreferences','DEMO_LYRICS_V379','STUDIO_PRESETS_V379',
  'Spotify nur beobachten','source!=="demo"','role="tablist"','Schrift &amp; Layout','Kamera &amp; 3D',
  'lyricsImmersiveDepth','lyricsOffsetMs','lyricsFontFamilyV379','avatarLyricsCameraModeV378'])assert.ok(ui.includes(marker),`studio UI: ${marker}`);
assert.ok(!ui.includes('music.refresh(') && !ui.includes('music.disconnect(') && !ui.includes('seekTo('), 'studio does not control Spotify playback');
const kinetic=read('components/KineticLyrics.tsx');
assert.ok(kinetic.includes('lyricsFontFamilyV379') && kinetic.includes('--studio-font-family'));
assert.ok(read('app/globals.css').includes('v379-captions-contrast'));
assert.ok(read('app/globals.css').includes('v379-stage-display'));
assert.ok(read('components/SettingsPanel.tsx').includes('<VisualLyricsStudioV379 />'));
assert.ok(read('context/UiPreferencesContext.tsx').includes('lyricsFontFamilyV379: "system"'));
assert.ok(read('types/music.ts').includes('lyricsFontFamilyV379?:'));
const pkg=require('../package.json');
assert.ok(['0.1.0-v379','0.1.0-v380','0.1.0-v381','0.1.0-v382','0.1.0-v383','0.1.0-v384','0.1.0-v385','0.1.0-v386','0.1.0-v387','0.1.0-v390','0.1.0-v391','0.1.0-v392','0.1.0-v393','0.1.0-v394','0.1.0-v395','0.1.0-v396','0.1.0-v397','0.1.0-v390','0.1.0-v391','0.1.0-v398','0.1.0-v399','0.1.0-v400','0.1.0-v401', '0.1.0-v402','0.1.0-v403','0.1.0-v404','0.1.0-v405','0.1.0-v406','0.1.0-v407','0.1.0-v408','0.1.0-v409','0.1.0-v411','0.1.0-v412','0.1.0-v413','0.1.0-v414','0.1.0-v415','0.1.0-v416','0.1.0-v417','0.1.0-v418','0.1.0-v419','0.1.0-v420','0.1.0-v422','0.1.0-v424','0.1.0-v425','0.1.0-v426'].includes(pkg.version));
assert.ok(pkg.scripts['verify:offline'].includes('test:v379'));
assert.ok(read('README.md').includes('V379-VISUAL-LYRICS-STUDIO.md'));
console.log('PASS V379 demo timing, preview plans, presets, sources, safe zones, typography, accessibility, state wiring and Spotify read-only');
