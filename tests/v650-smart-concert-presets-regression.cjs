'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs');
const {load}=require('./helpers/ts-loader-v404.cjs');
const {FACTORY_PRESETS_V650:factory,MAX_CUSTOM_PRESETS_V650:limit,PRESET_STORAGE_KEY_V650:key,
 sanitizeConcertPatchV650:sanitize,validateConcertPresetV650:validate,parsePresetLibraryV650:parse,
 emptyPresetLibraryV650:empty,captureConcertPresetV650:capture,mergePresetLibraryV650:merge}=load('components/concertPresetsV650');
const {CONTROLLABLE_KEYS_V649:keys,undoControlPatchV649:undo}=load('components/concertControlPolicyV649');
const rd=p=>fs.readFileSync(p,'utf8');
const panel=rd('components/ConcertControlCenterV649.tsx'), manager=rd('components/ConcertPresetManagerV650.tsx'),css=rd('app/globals.css');
const pkg=JSON.parse(rd('package.json'));
const pref={stageTheme:'classic',stageReactive:true,stageLightStrength:60,avatarVocalCameraV369:'auto',avatarVocalCameraStrengthV369:55,
 rapCameraEnabledV429:false,lyricsFontSize:100,lyricsFocusMode:true,lyricsImmersiveEnabled:false,multiAvatarMode:'solo',avatarDancePreset:'auto',
 avatarLipSyncEnabled:true,concertDetailEnabledV555:true,concertDetailStrengthV555:45,reducedMotion:false,
 vocalTimeSegmentsV496:{private:true},avatarCameraTimelineV400:{clips:['manual']},lyricsOffsetMs:120,spotifyAuth:'SECRET',microphoneEnabled:true};
let groups=0,samples=0;function test(name,fn){try{fn();groups++;}catch(e){e.message=`V650 ${name}: ${e.message}`;throw e;}}
function has(s,text){assert(s.includes(text),`Missing ${text}`);}
const one=(patch,view='stage',readability='clear',id='custom:abc')=>({id,name:'My Show',description:'test',patch,view,readability});
const state=()=>({schema:'sonic-concert-presets',version:1,profiles:[]});
test('6 built-in shows',()=>assert.equal(factory.length,6));
for(const [genre,id] of [['deutschrap','builtin:deutschrap'],['hardtekk','builtin:hardtekk'],['hardstyle','builtin:hardstyle'],['rock','builtin:rock'],['pop','builtin:pop'],['10-inch','builtin:touch']]){
 test(`factory ${genre} available`,()=>assert(factory.some(p=>p.id===id)));
 const p=factory.find(p=>p.id===id);
 test(`${genre} validated`,()=>assert.deepEqual(validate(p),p));
 test(`${genre} contains only V649 allowlisted values`,()=>assert.deepEqual(sanitize(p.patch),p.patch));
 test(`${genre} does not include spotify, singer roles, or user authored timelines`,()=>assert(Object.keys(p.patch).every(k=>keys.includes(k))));
}
test('builtin genre ids distinct',()=>assert.equal(new Set(factory.map(p=>p.id)).size,factory.length));
test('storage key independent of UI preferences key',()=>assert(!key.includes('ui-preferences')));
test('saved key versioned',()=>assert(key.includes('v650')));
test('no mixing config into auth',()=>assert(!keys.some(k=>/spotify|token|credential|vocalTimeSegments|CameraTimeline|microphone/.test(k))));
test('reject null patch',()=>assert.equal(sanitize(null),null));
test('reject array patch',()=>assert.equal(sanitize([]),null));
test('reject unknown property',()=>assert.equal(sanitize({stageTheme:'classic',spotifyToken:'secret'}),null));
test('reject prototype pollution key',()=>assert.equal(sanitize(JSON.parse('{"__proto__":{"admin":true}}')),null));
test('reject inherited object',()=>assert.equal(sanitize(Object.create({stageTheme:'rock'})),null));
test('reject empty patch',()=>assert.equal(sanitize({}),null));
test('reject invalid stage',()=>assert.equal(sanitize({stageTheme:'not-stage'}),null));
test('reject string numeric',()=>assert.equal(sanitize({lyricsFontSize:'140'}),null));
test('reject out of range rather than clamp',()=>assert.equal(sanitize({lyricsFontSize:999}),null));
test('reject fractional numbers rather than round',()=>assert.equal(sanitize({stageLightStrength:21.2}),null));
test('reject non-finite',()=>assert.equal(sanitize({stageLightStrength:Infinity}),null));
test('reject wrong boolean',()=>assert.equal(sanitize({reducedMotion:'false'}),null));
test('do not mutate patch',()=>{const before={stageTheme:'rock'};sanitize(before);assert.deepEqual(before,{stageTheme:'rock'});});
test('full captured whitelist',()=>{const p=capture('custom:sample','My Stage',pref,'split','large');assert(p);assert.deepEqual(Object.keys(p.patch).sort(),[...keys].sort());});
test('capture excludes private/auth fields',()=>{const p=capture('custom:sample','My Stage',pref,'split','large');assert(!('spotifyAuth'in p.patch));assert(!('vocalTimeSegmentsV496'in p.patch));assert(!('avatarCameraTimelineV400'in p.patch));});
test('capture includes kiosk presentation',()=>{const p=capture('custom:sample','My Stage',pref,'lyrics','large');assert.equal(p.view,'lyrics');assert.equal(p.readability,'large');});
test('capture fails malformed name',()=>assert.equal(capture('custom:ok','',pref,'split','clear'),null));
test('capture fails dangerous external id',()=>assert.equal(capture('__proto__','Safe',pref,'split','clear'),null));
test('capture explicit performance profile for different screens',()=>{const p=capture('custom:abc','My Stage',pref,'split','clear','eco');assert.equal(p.displayProfile,'eco')});
test('reject invalid display profile',()=>assert.equal(validate({...one({stageTheme:'rock'}),displayProfile:'ultra'}),null));
test('legacy profile without display profile accepted',()=>assert(!Object.hasOwn(validate(one({stageTheme:'rock'})),'displayProfile')));
test('capture honors missing optional settings',()=>{const p=capture('custom:ok','Safe',{...pref,avatarVocalCameraV369:undefined},'split','clear');assert(p);assert(!('avatarVocalCameraV369'in p.patch));});
for(const invalid of ['',null,0,false,[],{},'{bad json}','"str"'])test(`invalid library ${String(invalid)}`,()=>assert.equal(parse(invalid),null));
test('empty library valid',()=>assert.deepEqual(parse(JSON.stringify(state())),state()));
test('unsupported schema rejected',()=>assert.equal(parse({...state(),schema:'different'}),null));
test('unsupported version rejected',()=>assert.equal(parse({...state(),version:2}),null));
test('unknown properties in preset patch rejected',()=>assert.equal(parse({...state(),profiles:[one({stageTheme:'neon',lyricsOffsetMs:444})]}),null));
test('import rejects builtins into own storage',()=>assert.equal(parse({...state(),profiles:[factory[0]]}),null));
test('invalid view rejected',()=>assert.equal(validate(one({stageTheme:'neon'},'fullscreen')),null));
test('invalid readability rejected',()=>assert.equal(validate(one({stageTheme:'neon'},'stage','tiny')),null));
test('name whitespace canonicalized',()=>assert.equal(validate({...one({stageTheme:'neon'}),name:'  My   Show   '}).name,'My Show'));
test('too-long name rejected',()=>assert.equal(validate({...one({stageTheme:'neon'}),name:'A'.repeat(41)}),null));
test('too-long description rejected',()=>assert.equal(validate({...one({stageTheme:'neon'}),description:'A'.repeat(121)}),null));
test('suspicious id rejected',()=>assert.equal(validate({...one({stageTheme:'neon'}),id:'custom:../../etc'}),null));
test('non-custom id rejected by storage',()=>assert.equal(parse({...state(),profiles:[one({stageTheme:'neon'},'stage','clear','builtin:rock')]}),null));
test('import cannot shadow builtin name',()=>assert.equal(parse({...state(),profiles:[{...one({stageTheme:'neon'}),name:factory[0].name}]}),null));
test('reject duplicate IDs',()=>assert.equal(parse({...state(),profiles:[one({stageTheme:'neon'}),one({stageTheme:'rock'})]}),null));
test('reject duplicate case-insensitive names',()=>assert.equal(parse({...state(),profiles:[one({stageTheme:'neon'}),{...one({stageTheme:'rock'}),id:'custom:def',name:'my show'}]}),null));
test('max profiles enforced at parse time',()=>assert.equal(parse({...state(),profiles:Array.from({length:13},(_,i)=>({...one({stageTheme:'rock'}),id:`custom:id${i}`,name:`Name ${i}`}))}),null));
test('oversized JSON rejected',()=>assert.equal(parse(' '.repeat(65537)),null));
test('roundtrip export import retains only allowed',()=>{const p=capture('custom:abc','Saved',pref,'split','clear');const input={...state(),profiles:[p]};assert.deepEqual(parse(JSON.stringify(input)),input);});
test('merge adds new',()=>{const a=parse({...state(),profiles:[one({stageTheme:'rock'})]});const b=parse({...state(),profiles:[{...one({stageTheme:'neon'}),id:'custom:def',name:'Other'}]});const result=merge(a,b);assert.equal(result.added,1);assert.equal(result.library.profiles.length,2);});
test('merge never overwrites duplicate id',()=>{const a=parse({...state(),profiles:[one({stageTheme:'rock'})]});const b=parse({...state(),profiles:[{...one({stageTheme:'neon'}),name:'Different'}]});const result=merge(a,b);assert.equal(result.added,0);assert.equal(result.skipped,1);assert.equal(result.library.profiles[0].patch.stageTheme,'rock');});
test('merge never overwrites duplicate name',()=>{const a=parse({...state(),profiles:[one({stageTheme:'rock'})]});const b=parse({...state(),profiles:[{...one({stageTheme:'neon'}),id:'custom:def',name:'my show'}]});const result=merge(a,b);assert.equal(result.added,0);assert.equal(result.skipped,1);});
test('merge max 12',()=>{const a=parse({...state(),profiles:Array.from({length:12},(_,i)=>({...one({stageTheme:'rock'}),id:`custom:id${i}`,name:`Show ${i}`}))});const b=parse({...state(),profiles:[{...one({stageTheme:'neon'}),id:'custom:other',name:'Next'}]});const result=merge(a,b);assert.equal(result.added,0);assert.equal(result.library.profiles.length,12);});
test('merge does not mutate input library',()=>{const a=parse({...state(),profiles:[one({stageTheme:'rock'})]});const b=parse({...state(),profiles:[{...one({stageTheme:'neon'}),id:'custom:def',name:'Other'}]});merge(a,b);assert.equal(a.profiles.length,1);assert.equal(b.profiles.length,1);});
for(const [key,val] of [['stageTheme','neon'],['stageLightStrength',75],['multiAvatarMode','duet'],['avatarLipSyncEnabled',false],['lyricsFontSize',170]]){
 test(`one click changed ${key} and undo exact`,()=>{const patch=sanitize({[key]:val});const prior=undo(pref,patch);const after={...pref,...patch,...prior};assert.deepEqual(after,pref);});
}
test('manager uses browser local storage only',()=>has(manager,'localStorage.getItem(PRESET_STORAGE_KEY_V650)'));
test('manager explicit guarded save',()=>has(manager,'localStorage.setItem(PRESET_STORAGE_KEY_V650'));
test('user profiles stored after hydration only',()=>has(manager,'if(!loaded)return false'));
test('max 12 enforced in UI',()=>has(manager,'MAX_CUSTOM_PRESETS_V650'));
test('duplicate name rejects before persist',()=>has(manager,'Dieser Profilname existiert bereits'));
test('touch delete two-step confirm',()=>has(manager,'deletePending!==id'));
test('file upload size cap',()=>has(manager,'file.size>65536'));
test('upload format guarded',()=>has(manager,'parsePresetLibraryV650(await file.text())'));
test('import merges not overwrites',()=>has(manager,'mergePresetLibraryV650(library,incoming)'));
test('export emits own library only',()=>has(manager,'JSON.stringify(library,null,2)'));
test('presets do not call spotify playback',()=>assert(!/Spotify|spotify\.play|AudioContext|\.pause\(/.test(manager)));
test('factory presets shown',()=>has(manager,'FACTORY_PRESETS_V650.map'));
test('customs shown',()=>has(manager,'library.profiles.map'));
test('preset manager mounted in control center',()=>has(panel,'<ConcertPresetManagerV650'));
test('existing control tabs untouched',()=>has(panel,'V649_TABS.map'));
test('new profile tab accessible',()=>has(panel,'aria-selected={tab==="presets"}'));
test('atomic preference patch',()=>has(panel,'updatePreferences(changed)'));
test('view presentation captured for undo',()=>has(panel,'setUndoPresentationV650(presentationChanged?{view,readability,displayProfile}:null)'));
test('undo restores presentation',()=>has(panel,'setView(undoPresentationV650.view)'));
test('undo restores readability',()=>has(panel,'setReadability(undoPresentationV650.readability)'));
test('undo restores device quality profile',()=>has(panel,'setDisplayProfile(undoPresentationV650.displayProfile)'));
test('regular change clears old presentation undo',()=>has(panel,'setUndoPresentationV650(null);updatePreferences(patch)'));
test('display quality profile applied only when preset includes one',()=>has(panel,'if(preset.displayProfile!==undefined&&displayProfile!==preset.displayProfile)setDisplayProfile(preset.displayProfile)'));
test('new view and readability applied only when different',()=>{has(panel,'if(view!==preset.view)setView(preset.view)');has(panel,'if(readability!==preset.readability)setReadability(preset.readability)')});
test('existing V649 undo survives',()=>has(panel,'disabled={!undo}'));
test('pure policy no browser API',()=>{const s=rd('components/concertPresetsV650.ts');for(const x of ['localStorage','window.','document.','navigator.','fetch('])assert(!s.includes(x))});
test('new profile grid touch targets',()=>{has(css,'.v650-grid');has(css,'min-height:48px;min-width:48px')});
test('no GLB assets or WebGL render loop',()=>{for(const s of [panel,manager])for(const x of ['useFrame(', 'GLTFLoader', 'new PointLight', 'new Canvas']) assert(!s.includes(x))});
test('release scripts registered',()=>{for(const t of ['test:v650','test:v650:types','test:smoke:v650','verify:v650'])assert(pkg.scripts[t],t)});
test('version updated',()=>assert.equal(pkg.version,'0.1.0-v651'));
test('architecture current version',()=>has(rd('ARCHITECTURE.md'),'**Dokumentationsstand:** V651'));
test('documentation available',()=>has(rd('V650-SMART-CONCERT-PRESETS.md'),'# V650'));
let seed=650;function rand(){seed=(Math.imul(1664525,seed)+1013904223)>>>0;return seed/2**32;}
test('12k simulated profile captures, import roundtrip and undo',()=>{
 for(let i=0;i<12000;i++){
  const current={...pref,stageTheme:factory[i%factory.length].patch.stageTheme,lyricsFontSize:Math.floor(rand()*201)+40,
   stageLightStrength:Math.floor(rand()*101),avatarVocalCameraStrengthV369:Math.floor(rand()*101),
   concertDetailStrengthV555:Math.floor(rand()*101),reducedMotion:rand()<.5};
  const captured=capture('custom:bench'+i,'Set '+i,current,i%2?'stage':'split',i%3?'clear':'large');assert(captured);
  const library=parse(JSON.stringify({...empty(),profiles:[captured]}));assert(library);
  const before={...current};const chosen=factory[(i+1)%factory.length];
  const patch=sanitize(chosen.patch);assert(patch);const prior=undo(current,patch);
  const after={...current,...patch,...prior};assert.deepEqual(after,before);
  assert.equal(after.spotifyAuth,'SECRET');assert.deepEqual(after.vocalTimeSegmentsV496,{private:true});
  samples++;
 }
});
console.log(`PASS V650 smart concert presets: ${groups} regression groups, ${samples} simulated profile operations`);
