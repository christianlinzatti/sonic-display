'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs');
const {load}=require('./helpers/ts-loader-v404.cjs');
const {decideSmartPresetV651:decide,isSmartPresetModeV651:isMode,
 SMART_PRESET_MODE_KEY_V651:key,SMART_PRESET_STABLE_MS_V651:stable,
 SMART_PRESET_AUTO_WINDOW_MS_V651:windowMs}=load('components/smartPresetAutomationV651');
const {FACTORY_PRESETS_V650:presets,sanitizeConcertPatchV650:sanitize}=load('components/concertPresetsV650');
const {CONTROLLABLE_KEYS_V649:keys,undoControlPatchV649:undo}=load('components/concertControlPolicyV649');
const read=file=>fs.readFileSync(file,'utf8');
const hook=read('components/useSmartPresetAutomationV651.ts');
const touch=read('components/TouchKioskControls.tsx');
const panel=read('components/ConcertControlCenterV649.tsx');
const manager=read('components/ConcertPresetManagerV650.tsx');
const css=read('app/globals.css');
const pkg=JSON.parse(read('package.json'));
let groups=0,samples=0;
function test(name,fn){try{fn();groups++;}catch(e){e.message=`V651 ${name}: ${e.message}`;throw e;}}
function has(text,token){assert(text.includes(token),`Missing ${token}`);}
const base={trackId:'track-1',genre:'deutschrap',genreStatus:'detected',genreSource:'track',genreOverride:null,genreConfidence:93,isPlaying:true,progressMs:2400,mode:'auto',lockedTrackId:null,alreadyAppliedTrackId:null,autoSkipTrackId:null};
const choice=(patch={})=>decide({...base,...patch});
for(const name of ['off','suggest','auto'])test(`mode ${name}`,()=>assert(isMode(name)));
for(const name of ['',null,false,0,{},'automatic','ON','Auto'])test(`invalid mode ${String(name)}`,()=>assert(!isMode(name)));
test('default mode has no action',()=>assert(!choice({mode:'off'}).canAutoApply));
test('default mode no suggestion',()=>assert(!choice({mode:'off'}).canSuggest));
test('suggest returns recommended preset',()=>assert.equal(choice({mode:'suggest'}).preset?.id,'builtin:deutschrap'));
test('suggest never auto applies',()=>assert(!choice({mode:'suggest'}).canAutoApply));
test('auto permitted for verified high confidence',()=>assert(choice().canAutoApply));
test('track source threshold 79 rejects',()=>assert(!choice({genreConfidence:79}).canSuggest));
test('track source 80 allows',()=>assert(choice({genreConfidence:80}).canAutoApply));
test('artist threshold 87 rejects',()=>assert(!choice({genreSource:'artist',genreConfidence:87}).canSuggest));
test('artist threshold 88 allows',()=>assert(choice({genreSource:'artist',genreConfidence:88}).canAutoApply));
test('fallback unknown status rejected',()=>assert(!choice({genreStatus:'unknown'}).canSuggest));
test('loading genre rejected',()=>assert(!choice({genreStatus:'loading'}).canSuggest));
test('error genre rejected',()=>assert(!choice({genreStatus:'error'}).canSuggest));
test('idle genre rejected',()=>assert(!choice({genreStatus:'idle'}).canSuggest));
test('no genre rejected',()=>assert(!choice({genre:null}).canSuggest));
test('no track rejected',()=>assert(!choice({trackId:''}).canSuggest));
test('missing source rejected',()=>assert(!choice({genreSource:null}).canSuggest));
test('manual source rejected',()=>assert(!choice({genreSource:'manual'}).canSuggest));
test('manual correction rejected',()=>assert(!choice({genreOverride:'hardstyle'}).canSuggest));
test('manual lock suppresses auto',()=>assert(!choice({lockedTrackId:'track-1'}).canAutoApply));
test('manual lock suppresses suggestion',()=>assert(!choice({lockedTrackId:'track-1'}).canSuggest));
test('other track manual lock irrelevant',()=>assert(choice({lockedTrackId:'track-0'}).canAutoApply));
test('already processed current song cannot reapply',()=>assert(!choice({alreadyAppliedTrackId:'track-1'}).canSuggest));
test('previous song already applied irrelevant',()=>assert(choice({alreadyAppliedTrackId:'old-song'}).canAutoApply));
test('auto armed on current track only suggests',()=>{const d=choice({autoSkipTrackId:'track-1'});assert(d.canSuggest&&!d.canAutoApply)});
test('auto armed on previous track can apply next',()=>assert(choice({autoSkipTrackId:'old-song'}).canAutoApply));
test('paused song only suggested',()=>{const d=choice({isPlaying:false});assert(d.canSuggest&&!d.canAutoApply)});
test('12-second limit inclusive',()=>assert(choice({progressMs:windowMs}).canAutoApply));
test('12-second limit exceeded -> proposal only',()=>{const d=choice({progressMs:windowMs+1});assert(d.canSuggest&&!d.canAutoApply)});
test('negative playback clock never auto',()=>assert(!choice({progressMs:-1}).canAutoApply));
test('NaN clock never auto',()=>assert(!choice({progressMs:NaN}).canAutoApply));
test('Infinity clock never auto',()=>assert(!choice({progressMs:Infinity}).canAutoApply));
test('untrusted confidence NaN fails closed',()=>assert(!choice({genreConfidence:NaN}).canSuggest));
test('untrusted confidence Infinity fails closed',()=>assert(!choice({genreConfidence:Infinity}).canSuggest));
test('untrusted confidence negative fails closed',()=>assert(!choice({genreConfidence:-1}).canSuggest));
test('untrusted confidence >100 fails closed',()=>assert(!choice({genreConfidence:101}).canSuggest));
test('unknown but supported genre classifier does not apply',()=>assert(!choice({genre:'techno'}).canSuggest));
test('electronic does not guess hardtekk',()=>assert(!choice({genre:'trance'}).canSuggest));
for(const [genre,preset] of Object.entries({deutschrap:'deutschrap',hiphop:'deutschrap',trap:'deutschrap',drill:'deutschrap',boombap:'deutschrap',rnb:'deutschrap',
 hardtekk:'hardtekk',uptempo:'hardtekk',hardstyle:'hardstyle',rawstyle:'hardstyle',hardcore:'hardstyle',
 rock:'rock',metal:'rock',poprock:'rock',indierock:'rock',alternativerock:'rock',punkrock:'rock',
 pop:'pop',indiepop:'pop',electropop:'pop',dancepop:'pop'})){
 test(`genre ${genre} => ${preset}`,()=>{const d=choice({genre});assert.equal(d.preset?.id,`builtin:${preset}`);assert(d.canAutoApply);assert.deepEqual(sanitize(d.preset.patch),d.preset.patch);});
}
test('selected preset is existing factory profile',()=>assert(presets.includes(choice().preset)));
test('no sensitive settings in any auto profile',()=>{for(const genre of ['deutschrap','hardtekk','hardstyle','rock','pop'])for(const k of Object.keys(choice({genre}).preset.patch))assert(keys.includes(k),k);});
test('stability delay positive',()=>assert(stable>=500&&stable<=2500));
test('only a short start window',()=>assert(windowMs<=15000));
test('persisted mode isolated from preferences',()=>assert(!key.includes('ui-preferences')));
test('mode stored only after explicit user change',()=>has(hook,'localStorage.setItem(SMART_PRESET_MODE_KEY_V651,next)'));
test('hydrate no implicit auto mode default',()=>has(hook,'useState<SmartPresetModeV651>("off")'));
test('mode validated at hydration',()=>has(hook,'isSmartPresetModeV651(stored)'));
test('mode current-song arming guard',()=>has(hook,'skipAutoTrackRef.current=trackId'));
test('auto operates while center is closed',()=>has(touch,'useSmartPresetAutomationV651('));
test('no new animation loop',()=>{for(const str of [hook,manager,panel])for(const prohibited of ['useFrame(', 'new AudioContext(', 'GLTFLoader','new Canvas'])assert(!str.includes(prohibited));});
test('manual changes lock song',()=>has(hook,'setLockedTrack(trackId)'));
test('manual panel controls lock automation',()=>has(panel,'automationV651.manualChange()'));
test('manual touch view lock automation',()=>has(touch,'automationV651.manualChange();kiosk.setView(mode)'));
test('manual touch readability lock automation',()=>has(touch,'automationV651.manualChange();kiosk.setReadabilityV648'));
test('manual quality profile lock automation',()=>has(touch,'automationV651.manualChange();kiosk.setDisplayProfile'));
test('automatic only when policy allows',()=>has(hook,'if(!decision.canAutoApply'));
test('automatic uses stability timeout',()=>has(hook,'SMART_PRESET_STABLE_MS_V651'));
test('automatic timer cleaned on track/status changes',()=>has(hook,'window.clearTimeout(handle)'));
test('profile patch strictly validated before applying',()=>has(hook,'sanitizeConcertPatchV650(preset.patch)'));
test('only changed keys applied, not whole settings object',()=>has(hook,'updatePreferences(changed)'));
test('auto undo snapshots only changed fields',()=>has(hook,'undoControlPatchV649(preferences,changed)'));
test('auto undo restores kiosk presentation',()=>has(hook,'if(previous.presentation.readability!==undefined)kiosk.setReadabilityV648(previous.presentation.readability)'));
test('auto undo only restores changed presentation keys',()=>{has(hook,'if(previous.presentation.view!==undefined)');has(hook,'if(previous.presentation.displayProfile!==undefined)');});
test('auto undo can suppress auto for same song',()=>has(hook,'setLockedTrack(trackId)'));
test('auto undo only for correct song',()=>has(hook,'previous.trackId!==trackId'));
test('track change clears undo',()=>has(hook,'undoRef.current=null;setCanUndo(false);setLastAction("")'));
test('no third-party fetch needed for genre policy',()=>{const policy=read('components/smartPresetAutomationV651.ts');for(const token of ['fetch(', 'localStorage', 'window.', 'document.', 'SpotifyOAuth'])assert(!policy.includes(token));});
test('manager explicit 3-state accessible mode selection',()=>{has(manager,'value:"suggest"');has(manager,'value:"auto"');has(manager,'type="radio"');});
test('manager shows score with heuristic wording',()=>{has(manager,'heuristisch');has(manager,'automationV651.score');});
test('manager gives opt-in explicit apply',()=>has(manager,'automationV651.applySuggested()'));
test('manager gives one-click rollback',()=>has(manager,'automationV651.undoLast()'));
test('large touch controls',()=>{has(css,'.v651-automation button{min-height:48px');has(css,'.v651-modes label{display:flex');});
test('release scripts',()=>{for(const k of ['test:v651','test:v651:types','test:smoke:v651','verify:v651'])assert(pkg.scripts[k],k);});
test('release version',()=>assert.equal(pkg.version,'0.1.0-v651'));
// The isolated V649 stub must never shadow the production music types during the root typecheck.
test('isolated V649 test types excluded from application typecheck',()=>{
 const rootConfig=JSON.parse(read('tsconfig.json'));
 const isolatedConfig=JSON.parse(read('tests/tsconfig.v649-core.json'));
 assert(rootConfig.exclude.includes('tests/v649-ui-preferences.d.ts'));
 assert(isolatedConfig.files.includes('v649-ui-preferences.d.ts'));
 assert(fs.existsSync('types/music.ts'));
});

test('release documentation',()=>has(read('ARCHITECTURE.md'),'**Dokumentationsstand:** V651'));
test('readme new version',()=>has(read('README.md'),'V651'));
test('new release description',()=>has(read('V651-SMART-PRESET-AUTOMATION.md'),'# V651'));
let seed=651;function rnd(){seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/2**32;}
test('12k simulated genre timing and manual-boundary inputs',()=>{
 for(let i=0;i<12000;i++){
  const confidence=Math.floor(rnd()*101),source=rnd()<.55?'track':'artist',position=Math.floor(rnd()*280000);
  const mode=rnd()<.3?'off':rnd()<.4?'suggest':'auto';
  const genre=['deutschrap','hardtekk','hardstyle','rock','pop','techno'][i%6];
  const locked=rnd()<.17?'track-1':null,already=rnd()<.08?'track-1':null;
  const d=choice({genre,genreConfidence:confidence,genreSource:source,progressMs:position,mode,lockedTrackId:locked,alreadyAppliedTrackId:already});
  if(d.canAutoApply){assert(d.canSuggest);assert.equal(mode,'auto');assert.equal(locked,null);assert.equal(already,null);assert(position<=windowMs);assert(confidence>=(source==='track'?80:88));assert.notEqual(genre,'techno');}
  if(!d.canSuggest)assert(!d.canAutoApply);
  samples++;
 }
});
console.log(`PASS V651 smart preset automation: ${groups} regression groups, ${samples} simulated inputs`);
