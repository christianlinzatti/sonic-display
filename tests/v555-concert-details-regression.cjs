'use strict';
const fs=require('node:fs');
const assert=require('node:assert/strict');
const path=require('node:path');
const ts=require('./typescript-loader.cjs');
const root=path.resolve(__dirname,'..');
function moduleFromTS(file){const src=fs.readFileSync(path.join(root,file),'utf8');
 const out=ts.transpileModule(src,{fileName:file,reportDiagnostics:true,compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}});
 assert.equal(out.diagnostics?.length??0,0,'typescript syntax: '+file);
 const obj={exports:{}};new Function('module','exports','require',out.outputText)(obj,obj.exports,require);return obj.exports;
}
const {planConcertDetailsV555,DEFAULT_CONCERT_DETAILS_V555,rhymeAccentV555,splitRhymeEndV555}=moduleFromTS('components/visualizer/concertDetailEffectsV555.ts');
const make=(line)=>({provider:'lrclib',synced:true,lines:[{startMs:0,endMs:1800,text:'Wir gehen'},
 {startMs:1800,endMs:4200,text:line}],plainText:null});
const plan=(patch={})=>planConcertDetailsV555({lyrics:make('Wir sehen'),progressMs:2200,activeIndex:1,
 playing:true,reducedMotion:false,section:'verse',count:2,...patch});
let pass=0;
function test(label,run){try{run();pass++;console.log('PASS V555',label);}catch(e){console.error('FAIL V555',label);throw e;}}
test('reimendes letztes Wort erkannt – ohne Phonetikversprechen',()=>{
 const result=rhymeAccentV555(make('Wir sehen'),1);
 assert.equal(result.word,'sehen');assert.match(result.color,/^#[0-9a-f]{6}$/i);
 assert.equal(splitRhymeEndV555('Wir sehen!',result.word).match,'sehen');
 assert.equal(splitRhymeEndV555('Wir lachen','sehen'),null);
});
test('keine falsche Reimerkennung und kein Echo ohne Markierung',()=>{
 const cue=plan({lyrics:make('ein ganz anderer Satz')});
 assert.equal(cue.rhymeWord,'');assert.equal(cue.adlib,'');assert.equal(cue.arcSlots,null);
});
test('Gobo/LED-Hook-Akzent nur bei passender Sektion',()=>{
 assert.equal(plan().hook,false);
 const hook=plan({section:'hook',lyrics:make('Komm wir gehen')});
 assert.equal(hook.hook,true);assert.equal(hook.projectedWord,'KOMM');
 assert.ok(hook.backdropOpacity>0);
});
test('dichte Lyrics beruhigen LED und deaktivieren Hook-Schrift',()=>{
 const long='eins zwei drei vier fünf sechs sieben acht neun zehn elf zwölf dreizehn vierzehn fünfzehn';
 const dense=plan({section:'hook',lyrics:make(long)});
 assert.ok(dense.density>=.8);assert.equal(dense.projectedWord,'');
});
test('Adlib nur bei expliziter Markierung, zeitlich limitiert',()=>{
 const lyrics={...make('(Hey) es wird laut'),lines:[{startMs:1800,endMs:4600,text:'(Hey) es wird laut'}]};
 const first=plan({lyrics,progressMs:2000,activeIndex:0});
 assert.equal(first.adlib,'Hey');assert.ok(first.adlibOpacity>0);
 const late=plan({lyrics,progressMs:3001,activeIndex:0});
 assert.equal(late.adlib,'');
 const marked=plan({lyrics:{...lyrics,lines:[{startMs:1800,endMs:4600,text:'[adlib:Yo] hier'}]},progressMs:2000,activeIndex:0});
 assert.equal(marked.adlib,'Yo');
});
test('kein Lichtbogen ohne verifizierte Sängerzuordnung',()=>{
 assert.equal(plan().arcSlots,null);
 const scene={active:true,trackId:'track',cueStartMs:1900,cueEndMs:4000,count:2,focus:'handoff',leadSlot:1,
  singingSlots:[1],handoffFrom:0,strength:.7,lyricMotionGain:1,readingBoost:1,plateBoost:0};
 assert.deepEqual(plan({scene}).arcSlots,[0,1]);
 assert.equal(plan({scene:{...scene,handoffFrom:null}}).arcSlots,null);
 assert.equal(plan({scene,count:1}).arcSlots,null);
 assert.equal(plan({scene,progressMs:3000}).arcSlots,null);
});
test('pausiert, Zeit abgelaufen und Hauptschalter ausgeschaltet',()=>{
 assert.equal(plan({playing:false}).backdropOpacity,0);
 assert.equal(plan({progressMs:4300}).projectedWord,'');
 assert.equal(plan({settings:{enabled:false},section:'hook'}).projectedWord,'');
});
test('reduzierte Bewegung blockiert Zusatztexte und den Duettbogen',()=>{
 const lyrics={...make('(Yeah)'),lines:[{startMs:1800,endMs:4600,text:'(Yeah)'}]};
 const result=plan({lyrics,activeIndex:0,progressMs:2000,section:'hook',reducedMotion:true});
 assert.equal(result.projectedWord,'');assert.equal(result.adlib,'');assert.equal(result.arcSlots,null);
});
test('einzelne Schalter sind wirksam',()=>{
 assert.equal(plan({section:'hook',settings:{hookProjection:false}}).projectedWord,'');
 assert.equal(plan({settings:{rhymeAccent:false}}).rhymeColor,null);
 const lyrics={...make('(Hey)'),lines:[{startMs:1800,endMs:4600,text:'(Hey)'}]};
 assert.equal(plan({lyrics,activeIndex:0,progressMs:2000,settings:{adlibEcho:false}}).adlib,'');
 assert.equal(DEFAULT_CONCERT_DETAILS_V555.strength,45);
});
test('Integration: Hauptlyrics unverändert, R3F Effektbudget, Settings, kein Laser',()=>{
 const read=file=>fs.readFileSync(path.join(root,file),'utf8');
 const stage=read('components/visualizer/ConcertDetailStageV555.tsx');
 assert.match(stage,/frameTier(?:!==|===)'low'/);assert.match(stage,/line\.visible=visible/);
 assert.match(stage,/depthWrite=\{false\}/);assert.doesNotMatch(stage,/<laser/i);
 const lyrics=read('components/KineticLyrics.tsx');
 assert.match(lyrics,/line\.text \|\| "♪"/);assert.match(lyrics,/aria-hidden="true"/);
 const setup=read('components/SettingsPanel.tsx');
 for(const setting of ['concertGoboV555','concertPixelWallV555','concertFloorFogV555',
  'concertDuetArcV555','concertAdlibEchoV555','concertHookProjectionV555','concertRhymeAccentV555'])assert.ok(setup.includes(setting));
 const bridge=read('components/visualizer/VisualizerStage.tsx');assert.ok(bridge.includes('concertDetailsV555='));
});
console.log('V555 regression checks:',pass,'passed.');
