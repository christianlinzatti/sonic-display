'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.join(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const ts=require('./typescript-loader.cjs');
const source=read('lib/ultimateConcertRoadmapV958.ts');
const compiled=ts.transpileModule(source,{fileName:'ultimateConcertRoadmapV958.ts',reportDiagnostics:true,
 compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}});
assert.equal(compiled.diagnostics.length,0,'V958 compile syntax diagnostics');
const virtualModule={exports:{}};
vm.runInNewContext(compiled.outputText,{module:virtualModule,exports:virtualModule.exports,require(){throw Error('No runtime imports allowed');}},
 {filename:'ultimateConcertRoadmapV958.ts',timeout:10000});
const v=virtualModule.exports;
const settings={...v.DEFAULT_CONCERT_V958,enabled:true,virtualFx:true,hardwareSync:true,strength:80};
const src={trackId:'spotify-test',progressMs:45000,durationMs:180000,phase:'hook',sectionIndex:2,sectionStartMs:40000,
 verified:true,genre:'Deutschrap',energy:.7,bass:.7,lyricsVisible:false,reducedMotion:false};
const make=(patch={},options=settings)=>v.composeConcertSceneV958({...src,...patch},options);
const lamp={color:{r:100,g:80,b:40},brightness:55};
const normalized=x=>JSON.parse(JSON.stringify(x));
const tests=[];const test=(name,fn)=>tests.push([name,fn]);
// V930–V938: safety, recovery, network diagnostics, roles and rehearsal.
test('V930 first retry 2500ms',()=>assert.equal(v.recoveryDelayV930(1),2500));
test('V930 exponential backoff',()=>assert.equal(v.recoveryDelayV930(3),10000));
test('V930 cap of 60000ms and bounded stagger',()=>assert.ok(v.recoveryDelayV930(500,31)<=61000));
test('V930 non-finite failures bounded',()=>assert.ok(Number.isFinite(v.recoveryDelayV930(Infinity))));
test('V932 optical never inferred from RTT',()=>assert.equal(v.latencyAnalysisV932(0,750).opticalMs,0));
test('V932 RTT remains diagnostic',()=>assert.equal(v.latencyAnalysisV932(230,750).diagnosticRoundtripMs,750));
test('V932 explicitly denies auto calibration',()=>assert.equal(v.latencyAnalysisV932(230,750).autoCalibrated,false));
test('V933 source event identifier',()=>assert.equal(v.CONCERT_SIGNAL_EVENT_V933,'sonic-display:concert-light-signal-v933'));
test('V934 calm virtual fallback never exceeds 40%',()=>assert.ok(v.safeFallbackV934(lamp).brightness<=40));
test('V934 original lamp look immutable',()=>{const before=JSON.stringify(lamp);v.safeFallbackV934(lamp);assert.equal(JSON.stringify(lamp),before)});
test('V935 explicit role mapping',()=>assert.equal(v.resolveConcertRoleV935('192.168.0.3',{...settings,roleOverrides:{'192.168.0.3':'audience'}},'wall'),'audience'));
test('V935 legacy fallback role mapping',()=>assert.equal(v.resolveConcertRoleV935('192.168.0.3',settings,'rhythm'),'rhythm'));
test('V935 invalid public IP rejected',()=>assert.equal(Object.keys(v.normalizeConcertRoadmapV958({roleOverrides:{'8.8.8.8':'spotlight'}}).roleOverrides).length,0));
test('V936 preset saved without mutating source',()=>{const next=v.upsertRoomPresetV936(settings,{id:'room',name:'Raum',roles:{'192.168.0.2':'accent'},positions:{'192.168.0.2':{x:.3,y:.4}}});
 assert.equal(next.presets.length,1);assert.equal(settings.presets.length,0);});
test('V936 preset deduplicates',()=>{const p={id:'room',name:'Raum',roles:{},positions:{}};assert.equal(v.upsertRoomPresetV936(v.upsertRoomPresetV936(settings,p),p).presets.length,1)});
test('V936 never silently enables Govee',()=>assert.equal(v.upsertRoomPresetV936(settings,{id:'x',name:'x',roles:{},positions:{}}).hardwareSync,true));
test('V937 disabled applies nothing',()=>assert.deepEqual(normalized(v.mixConcertRoomLookV937(lamp,make(),'rhythm',{...settings,enabled:false},{savedShowActive:false,authoredStageActive:false})),lamp));
test('V937 enabled with no hardware opt in does nothing',()=>assert.deepEqual(normalized(v.mixConcertRoomLookV937(lamp,make(),'rhythm',{...settings,hardwareSync:false},{savedShowActive:false,authoredStageActive:false})),lamp));
test('V937 stored V912 show always wins',()=>assert.deepEqual(normalized(v.mixConcertRoomLookV937(lamp,make(),'rhythm',settings,{savedShowActive:true,authoredStageActive:false})),lamp));
test('V937 authored V354 stage always wins',()=>assert.deepEqual(normalized(v.mixConcertRoomLookV937(lamp,make(),'rhythm',settings,{savedShowActive:false,authoredStageActive:true})),lamp));
test('V937 unverified event never drives real lights',()=>assert.deepEqual(normalized(v.mixConcertRoomLookV937(lamp,make({verified:false}),'rhythm',settings,{savedShowActive:false,authoredStageActive:false})),lamp));
test('V937 brightness change max 8 points',()=>assert.ok(Math.abs(v.mixConcertRoomLookV937(lamp,make(),'rhythm',settings,{savedShowActive:false,authoredStageActive:false}).brightness-55)<=8));
test('V938 twelve synthetic scene plan',()=>assert.equal(v.rehearseConcertV938('track',180000,'Hardtekk',settings).scenes.length,12));
test('V938 rehearsal never fetches or commands LAN',()=>assert.ok(!/fetch\(|\/command|setInterval\(/.test(source)));
test('V938 synthetic rehearsal names synthetic',()=>assert.equal(v.rehearseConcertV938('track',180000,'Hardtekk',settings).synthetic,true));
// V939–V948 scenes/section transitions/genre/timeline.
test('V939 deterministic same inputs',()=>assert.deepEqual(normalized(make()),normalized(make())));
test('V939 composer has linked camera/formation/wall/lights',()=>{const s=make();assert.ok(s.camera&&s.formation&&s.wall&&s.lightGain>0)});
test('V940 protects authored camera',()=>assert.equal(make({authoredStage:true,stageCamera:'close'}).camera,'close'));
test('V941 protects authored dance formation',()=>assert.equal(make({authoredStage:true,stageFormation:'duet'}).formation,'duet'));
test('V942 lyrics lower spotlight and room light gain',()=>{const a=make(),b=make({lyricsVisible:true});assert.ok(b.spotlight<a.spotlight&&b.lightGain<a.lightGain)});
test('V943 drop contains bass-impact if verified and measured',()=>assert.ok(make({phase:'drop',bass:.85}).effects.includes('bass-impact')));
test('V943 unconfirmed drop has no high-risk drop effect',()=>assert.ok(!make({phase:'drop',verified:false}).effects.includes('bass-impact')));
test('V944 smooth transition at first 1600ms',()=>{const a=make({progressMs:40000}),b=make({progressMs:41600});assert.equal(a.transition,0);assert.equal(b.transition,1)});
test('V945 repeated hooks diversify scene composition',()=>{const hooks=[0,2,4,6,8,10].map(i=>make({sectionIndex:i}));assert.ok(new Set(hooks.map(s=>[s.camera,s.formation,s.wall].join('/'))).size>=4)});
test('V945 exact same index stays stable',()=>assert.equal(make({sectionIndex:3}).id,make({sectionIndex:3}).id));
test('V946 lower energy on break than drop',()=>assert.ok(make({phase:'drop'}).intensity>make({phase:'break'}).intensity));
test('V947 genres detected',()=>{for(const [genre,expected] of [['Deutschrap','deutschrap'],['Hardtekk','hardtekk'],['Hardstyle','hardstyle'],['Deutschrock','deutschrock']])assert.equal(v.genreConcertV947(genre),expected)});
test('V948 explicit timeline cue overrides generated camera',()=>{const updated={...settings,timeline:{'spotify-test':[{atMs:41000,phase:'hook',camera:'close',formation:'duet'}]}};const s=make({},updated);assert.equal(s.camera,'close');assert.equal(s.formation,'duet');assert.equal(s.timelineOverride,true);});
test('V948 one track timeline not applied to others',()=>{const changed={...settings,timeline:{other:[{atMs:41000,phase:'drop',camera:'close'}]}};assert.equal(make({},changed).timelineOverride,false)});
test('V948 injected timeline snippets rejected',()=>{const out=v.normalizeConcertRoadmapV958({timeline:{'bad < track':[{atMs:1,phase:'drop'}]}});assert.equal(Object.keys(out.timeline).length,0)});
// V949–V958 real 3D feature intents and quality.
test('V949 virtual volumetric beam intent',()=>assert.ok(make({energy:1}).effects.includes('beams')));
test('V950 no lasers for reduced-motion viewer',()=>assert.ok(!make({phase:'drop',genre:'Hardtekk',reducedMotion:true}).effects.includes('lasers')));
test('V950 virtual lasers for verified Hardstyle drop',()=>assert.ok(make({phase:'drop',genre:'Hardstyle'}).effects.includes('lasers')));
test('V951 led wall has animation motif',()=>assert.ok(['equalizer','geometry','pulse','starfield','ribbons'].includes(make().wall)));
test('V952 sweep on hook',()=>assert.ok(make({phase:'hook',reducedMotion:false}).effects.includes('sweep')));
test('V953 bass-impact gated by bass measurement',()=>assert.ok(!make({phase:'drop',bass:0}).effects.includes('bass-impact')));
test('V954 gentle fog on verse',()=>assert.ok(make({phase:'verse'}).effects.includes('fog')));
test('V955 confetti only at confirmed song end',()=>{const ending=make({progressMs:177000,phase:'outro'});assert.equal(ending.finale,true);assert.ok(ending.effects.includes('confetti'));});
test('V956 no finale for uncertain song clock',()=>assert.equal(make({progressMs:179000,verified:false}).finale,false));
test('V957 evaluates repetition',()=>{const x=make();const score=v.qualityConcertV957([x,x]);assert.equal(score.repetitions,1);assert.ok(score.score<100)});
test('V957 simultaneous FX max three',()=>assert.ok(v.rehearseConcertV938('track',180000,'Hardtekk',settings).scenes.every(s=>s.effects.length<=3)));
test('V958 inactive by default',()=>assert.equal(v.DEFAULT_CONCERT_V958.enabled,false));
test('V958 hardware off by default',()=>assert.equal(v.DEFAULT_CONCERT_V958.hardwareSync,false));
test('V958 3D off by default',()=>assert.equal(v.DEFAULT_CONCERT_V958.virtualFx,false));
test('V958 runtime includes existing Govee dispatcher',()=>{const source=read('components/GoveeMusicSyncV909.tsx');
 assert.ok(source.includes('mixConcertRoomLookV937('));assert.ok(source.includes("'/command'"));
 assert.ok(source.includes('validGoveeStageCueV921('));assert.ok(!source.includes('setTimeout(()=>void tick()'));
});
test('V958 virtual stage is mounted inside existing Canvas',()=>{const scene=read('components/visualizer/ThreeAvatar.tsx');
 assert.ok(scene.includes('<ConcertFestivalFxV958'));assert.ok(read('components/visualizer/ConcertFestivalFxV958.tsx').includes('useFrame('));});
test('V958 user UI wired into existing Govee panel',()=>assert.ok(read('components/GoveeLanPanelV909.tsx').includes('<ConcertRoadmapStudioV958 config={config}')));
test('V958 no new networking, local timer, or hardware laser commands in virtual stage',()=>{const src=read('components/visualizer/ConcertFestivalFxV958.tsx');
 assert.doesNotMatch(src,/\bfetch\s*\(|\bsetInterval\s*\(|goveeBridgeRequestV909|\/command|\bnew WebSocket\b/);
});
test('V958 3D scene requires explicit enable and verified V318',()=>{const src=read('components/visualizer/ConcertFestivalFxV958.tsx');assert.ok(src.includes('!settings.virtualFx')&&src.includes('!verified'))});
test('V958 original V912 show remains guarded in LAN mixer',()=>{const src=read('components/GoveeMusicSyncV909.tsx');assert.ok(src.includes('savedShowActive:Boolean(show)'))});
test('V958 role presets do not change V912 shows silently',()=>assert.ok(!read('components/ConcertRoadmapStudioV958.tsx').includes('saveGoveeShowsV912')));
test('V958 normalization constrains objects',()=>{const raw={enabled:true,virtualFx:true,hardwareSync:true,strength:500,presets:Array.from({length:50},(_,i)=>({id:`${i}`,name:'r',roles:{},positions:{}}))};
 const out=v.normalizeConcertRoadmapV958(raw);assert.equal(out.strength,100);assert.equal(out.presets.length,12);});

// Integrated stage adapter and realistic import-based quality, with strong preservation guards.
test('V934 recovery never brightens an already dimmed grouped lamp',()=>assert.equal(v.safeFallbackV934({...lamp,brightness:4}).brightness,4));
test('V934 reconnect respects authored stage and V912 show guards',()=>{
 const runtime=read('components/GoveeMusicSyncV909.tsx');
 assert.match(runtime,/recoveringDevices\.has\(ip\).*stage\?\.source!==\'authored\'/s);
});
test('V939 stage adapter activates coordinated lanes for verified section',()=>{
 const base={active:false,activeLanes:['lighting'],lightGain:1,fxGain:1,photoOpacity:0,lyricsFocus:false,timeMs:0};
 const next=v.overlayConcertStageV958(base,make(),{enabled:true,authored:false,manualFormation:false});
 assert.equal(next.active,true);assert.equal(next.cameraShot,make().camera);
 assert.equal(next.danceFormation,make().formation);assert.ok(next.activeLanes.includes('camera')&&next.activeLanes.includes('dance'));
 assert.deepEqual(base.activeLanes,['lighting']);
});
test('V939 stage adapter never overwrites V354 authored score',()=>{
 const base={active:true,activeLanes:['camera'],cameraShot:'wide',danceFormation:'solo'};
 assert.equal(v.overlayConcertStageV958(base,make(),{enabled:true,authored:true,manualFormation:false}),base);
});
test('V941 stage adapter leaves manual avatar formation intact',()=>{
 const base={active:true,activeLanes:['dance'],danceFormation:'duet'};
 assert.equal(v.overlayConcertStageV958(base,make(),{enabled:true,authored:false,manualFormation:true}),base);
});
test('V939 stage adapter never applies unverified or disabled scenes',()=>{
 const base={active:false,activeLanes:[]};
 assert.equal(v.overlayConcertStageV958(base,make({verified:false}),{enabled:true,authored:false,manualFormation:false}),base);
 assert.equal(v.overlayConcertStageV958(base,make(),{enabled:false,authored:false,manualFormation:false}),base);
});
test('V957 real V318 import quality reflects real labeled sections',()=>{
 const data={schema:'sonic-track-analysis-v318',trackId:'spotify-test',durationMs:180000,
  beats:[],bars:[],tempo:null,timeSignature:4,importedAt:0,source:'test',
  sections:[{startMs:0,durationMs:18000,confidence:.99,label:'verse'},
            {startMs:18000,durationMs:24000,confidence:.95,label:'hook'},
            {startMs:42000,durationMs:24000,confidence:.31,label:'drop'},
            {startMs:66000,durationMs:20000,confidence:.98,label:'hook'}]};
 const report=v.qualityImportedConcertV957(data,'Deutschrap',settings);
 assert.equal(report.available,true);assert.equal(report.scenes.length,3);
 assert.equal(report.scenes.every(x=>x.verified),true);
});
test('V957 rejects empty imported song quality and exposes unavailable flag',()=>{
 const report=v.qualityImportedConcertV957(null,'Deutschrap',settings);
 assert.equal(report.available,false);assert.equal(report.scenes.length,0);
});
test('V948 timeline editor renders saved cues with edit and remove actions',()=>{
 const ui=read('components/ConcertRoadmapStudioV958.tsx');
 assert.ok(ui.includes('changeTimeline('));assert.ok(ui.includes('deleteTimeline('));
 assert.ok(ui.includes('Gespeicherte Konzert-Cues'));
});

let passed=0;for(const [name,fn] of tests){try{fn();passed++;console.log('PASS '+name)}catch(error){console.error('FAIL '+name);throw error}}
console.log(`V958 concert roadmap: ${passed} groups passed, pure concert policy + R3F/Govee integration static guards`);
