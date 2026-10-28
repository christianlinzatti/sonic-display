const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const Module=require('node:module');
const ts=require('./typescript-loader.cjs');
const root=path.resolve(__dirname,'..');
const read=f=>fs.readFileSync(path.join(root,f),'utf8');
function load(file){const full=path.join(root,file);const t=ts.transpileModule(read(file),{fileName:full,reportDiagnostics:true,compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}});assert.equal(t.diagnostics.filter(d=>d.category===ts.DiagnosticCategory.Error).length,0,file);const mod=new Module(full,module);mod.filename=full;mod.paths=Module._nodeModulePaths(path.dirname(full));mod._compile(t.outputText,full);return mod.exports;}
const {DEFAULT_LYRICS_LAYOUT_V381:d,normalizeSpatialLayoutV381:n,dragSpatialLayoutV381:drag,overlapRectsV381:overlap,
  checkFaceSafetyV381:check,findSafeLayoutV381:find,parseLayoutPresetsV381:parse}=load('components/visualizer/lyricsSpatialEditorV381.ts');
assert.deepEqual(n({}),{x:0,y:0,z:0,scale:1,safeMargin:.12,faceGuard:true});
assert.deepEqual(n(null),n(d));
assert.deepEqual(n({x:99,y:-99,z:99,scale:99,safeMargin:2}),{x:2,y:-1.4,z:1.5,scale:2,safeMargin:.4,faceGuard:true});
assert.deepEqual(n({x:NaN,y:Infinity,z:-Infinity,scale:NaN,safeMargin:NaN}),n(d));
assert.equal(n({faceGuard:false}).faceGuard,false);
assert.equal(drag(d,.4,-.3,'move').x,.4);
assert.equal(drag(d,.4,-.3,'move').y,-.3);
assert.equal(drag(d,0,-.3,'move').scale,1);
assert.ok(drag(d,.6,0,'scale').scale>1);
assert.equal(drag(d,999,0,'scale').scale,2);
assert.equal(drag(d,-999,0,'scale').scale,.55);
assert.equal(drag(d,NaN,Infinity,'move').x,0);
const caption={left:.3,right:.7,top:.3,bottom:.7};
const overlapping={left:.65,right:.8,top:.45,bottom:.55};
const clear={left:.81,right:.9,top:.2,bottom:.3};
assert.equal(overlap(caption,overlapping,0),true);
assert.equal(overlap(caption,clear,0),false);
assert.equal(overlap(caption,clear,.2),true);
assert.deepEqual(check(caption,[overlapping,clear],0),[0]);
assert.deepEqual(check(caption,[overlapping,clear],.2),[0,1]);
const safe=find(d,p=>Math.abs(p.x)<.3&&Math.abs(p.y)<.3);
assert.ok(safe&&Math.abs(safe.x)>=.3||safe&&Math.abs(safe.y)>=.3,'auto-place finds nearby safe position');
assert.equal(find(d,()=>true),null);
assert.deepEqual(find(d,()=>false),n(d));
assert.deepEqual(parse(null),[]);
assert.deepEqual(parse('not json'),[]);
assert.deepEqual(parse('{}'),[]);
assert.deepEqual(parse('[{"id":"a","name":"Deutschrap","layout":{"x":0.75,"scale":1.25}}]'),[{id:'a',name:'Deutschrap',layout:n({x:.75,scale:1.25})}]);
assert.deepEqual(parse('[{"id":"","name":""},null,42]'),[]);
const ui=read('components/VisualLyricsStudioV379.tsx');
for(const marker of ['3D-Layout V381','edit3d','setEdit3d','onLayoutChange={applyLayout}','onSafetyChange={onSafetyChange}',
  'autoPlaceRequest','Gesichts-Schutzzonen','Gesichter freihalten','Skalierung','Gespeicherte Layouts',
  'parseLayoutPresetsV381','localStorage.setItem','layout.faceGuard','setSavedLayouts','onChange={e=>loadLayout(e.target.value)}'])assert.ok(ui.includes(marker),'V381 studio: '+marker);
const scene=read('components/visualizer/RealLyricsStagePreviewV380.tsx');
for(const marker of ['SpatialLyricsHandlesV381','editMode','autoPlaceRequest','onLayoutChange','onSafetyChange','spatialLayoutV381:preferences.lyricsSpatialLayoutV381'])assert.ok(scene.includes(marker),'WebGL integration: '+marker);
const handles=read('components/visualizer/SpatialLyricsHandlesV381.tsx');
for(const marker of ['useThree','camera.updateMatrixWorld','onPointerDown','onPointerMove','onPointerUp','onPointerCancel',
  'setPointerCapture','releasePointerCapture','rayPointAtDepth','projectSpatialSafetyV381','findSafeLayoutV381','checkFaceSafetyV381'])assert.ok(handles.includes(marker),'3D editing: '+marker);
assert.ok(read('components/visualizer/Lyrics3DScene.tsx').includes('normalizeSpatialLayoutV381(scene.spatialLayoutV381)'),'real scene uses persistent layout');
assert.ok(read('components/visualizer/VisualizerStage.tsx').includes('spatialLayoutV381:preferences.lyricsSpatialLayoutV381'),'main stage forwards shared layout');
assert.ok(read('components/visualizer/registry.tsx').includes('spatialLayoutV381?:'));
assert.ok(read('context/UiPreferencesContext.tsx').includes('lyricsSpatialLayoutV381:{x:0'));
assert.ok(read('types/music.ts').includes('lyricsSpatialLayoutV381?:'));
assert.ok(read('app/globals.css').includes('v381-face-zone'));
require('./helpers/project-version-v651.cjs').assertProjectVersionAtLeast(381);
assert.ok(JSON.parse(read('package.json')).scripts['verify:offline'].includes('test:v381'));
assert.ok(read('README.md').includes('V381-VISUAL-3D-LYRICS-EDITOR.md'));
console.log('PASS V381 spatial drag, scale, limits, projected collision math, auto-layout, persistent presets and shared 3D stage wiring');
