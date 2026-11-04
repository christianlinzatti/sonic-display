'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const ts=require('./typescript-loader.cjs');
let count=0;
function test(name,fn){try{fn();count++;}catch(e){e.message=`V725 ${name}: ${e.message}`;throw e;}}
const filename='services/system/connectedServicesV725.ts';
const raw=fs.readFileSync(filename,'utf8');
const code=ts.transpileModule(raw,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022},reportDiagnostics:true});
assert.equal((code.diagnostics||[]).filter(x=>x.category===ts.DiagnosticCategory.Error).length,0);
const context={exports:{},Date,Math,Number,String,Array,Object,JSON,Intl,Map,Set,Boolean};
vm.runInNewContext(code.outputText,context,{filename});
const {buildConnectedServicesV725:build,summarizeConnectedServicesV725:summarize}=context.exports;
const baseNow=Date.parse('2026-10-29T12:00:00Z');
const definitions=[
 ['spotify',true,true],['lastfm',true,true],['lrclib',true,true],['lyrics-ovh',true,true],['genius',true,true],['spotify-lyrics',true,false],['musixmatch',false,false],
 ['musicbrainz',true,true],['theaudiodb',false,false],['flickr',false,false],['blob',true,true],['push',false,false],['admin',true,true]];
const server={version:667,services:definitions.map(([id,configured,enabled])=>({id,label:String(id),configured,enabled,note:'Konfiguration vorhanden'}))};
function data(p={}){return {snapshot:server,serverError:false,now:baseNow,
 spotify:{connected:true,error:null,fetchedAt:baseNow-1000},
 lyrics:{hasTrack:true,provider:'lrclib',enabled:true},
 lastfm:{user:'listener',consent:true,consentError:null,lastSuccessAt:new Date(baseNow-5000).toISOString(),added:3,storageError:false},...p};}
const cards=build(data());
const by=(arr,id)=>arr.find(x=>x.id===id);
test('all ids unique',()=>assert.equal(new Set(cards.map(x=>x.id)).size,cards.length));
test('all configured services represented',()=>assert.equal(cards.length,13));
test('three groups',()=>assert.deepEqual([...new Set(cards.map(x=>x.group))],['core','lyrics','optional']));
test('spotify working with fresh success',()=>assert.equal(by(cards,'spotify').state,'working'));
test('spotify evidence time',()=>assert(by(cards,'spotify').observedAt));
test('lastfm success',()=>assert.equal(by(cards,'lastfm').state,'working'));
test('lastfm consent shown',()=>assert.equal(by(cards,'lastfm').enabled,true));
test('lastfm success count shown',()=>assert(by(cards,'lastfm').explanation.includes('3 neue Scrobbles')));
test('spotify-lyrics not assumed active',()=>assert.equal(by(cards,'spotify-lyrics').state,'disabled'));
test('lyrics provider confirmed',()=>assert.equal(by(cards,'lrclib').state,'working'));
test('unused lyrics provider not confirmed',()=>assert.equal(by(cards,'genius').state,'unknown'));
test('public lyrics no network assumption',()=>assert.equal(by(cards,'lyrics-ovh').state,'unknown'));
test('optional configured not working',()=>assert.equal(by(cards,'blob').state,'unknown'));
test('optional disabled distinct from error',()=>assert.equal(by(cards,'flickr').state,'disabled'));
test('other provider names',()=>assert(by(cards,'musixmatch').label==='musixmatch'));
test('summary totals',()=>{const s=summarize(cards);assert.equal(s.total,13);assert.equal(s.working,3);assert.equal(Object.values(s).slice(0,4).reduce((a,b)=>a+b,0),13);});
const spotifyVariants=[
 ['not connected', {connected:false,error:null,fetchedAt:baseNow-1000},'unknown'],
 ['fresh not fetched',{connected:true,error:null,fetchedAt:0},'unknown'],
 ['expired',{connected:true,error:null,fetchedAt:baseNow-60001},'unknown'],
 ['boundary',{connected:true,error:null,fetchedAt:baseNow-60000},'working'],
 ['future within tolerance',{connected:true,error:null,fetchedAt:baseNow+59000},'working'],
 ['future too far',{connected:true,error:null,fetchedAt:baseNow+61000},'unknown'],
 ['error overrides connected',{connected:true,error:'Unauthorized',fetchedAt:baseNow},'attention'],
 ['error disconnected',{connected:false,error:'login error',fetchedAt:0},'attention'],
 ['nan time',{connected:true,error:null,fetchedAt:NaN},'unknown'],
 ['negative time',{connected:true,error:null,fetchedAt:-500},'unknown']
];
for(const [label,value,state] of spotifyVariants)test('spotify '+label,()=>assert.equal(by(build(data({spotify:value})),'spotify').state,state));
for(const [stateName,props,expected] of [
 ['off',{consent:false},'disabled'],['no user',{user:null},'unknown'],['unavailable storage',{storageError:true},'attention'],
 ['corrupt consent',{consentError:'Einstellung beschädigt'},'attention'],
 ['never checked',{lastSuccessAt:null},'unknown'],
 ['old last poll',{lastSuccessAt:new Date(baseNow-900001).toISOString()},'attention'],
 ['exact 15 minutes',{lastSuccessAt:new Date(baseNow-900000).toISOString()},'working'],
 ['future date',{lastSuccessAt:new Date(baseNow+62000).toISOString()},'unknown'],
 ['bad date',{lastSuccessAt:'invalid'},'unknown'],
 ['epoch',{lastSuccessAt:'1970-01-01T00:00:00.000Z'},'unknown'],
 ['empty user',{user:''},'unknown']]){
 test('lastfm '+stateName,()=>assert.equal(by(build(data({lastfm:{...data().lastfm,...props}})),'lastfm').state,expected));
}
for(const p of ['lrclib','lyrics.ovh','genius','spotify']){
 const id=({'lyrics.ovh':'lyrics-ovh','spotify':'spotify-lyrics'})[p]||p;
 test('active provider '+p,()=>assert.equal(by(build(data({lyrics:{hasTrack:true,provider:p,enabled:true}})),id).state,'working'));
}
test('no song provider not confirmed',()=>assert.equal(by(build(data({lyrics:{hasTrack:false,provider:'genius',enabled:true}})),'genius').state,'unknown'));
test('disabled lyrics provider not confirmed',()=>assert.equal(by(build(data({lyrics:{hasTrack:true,provider:'genius',enabled:false}})),'genius').state,'unknown'));
test('unknown lyrics name does not confirm anything',()=>assert.equal(build(data({lyrics:{hasTrack:true,provider:'unexpected',enabled:true}})).filter(x=>x.group==='lyrics'&&x.state==='working').length,0));
test('missing snapshot no provider green',()=>assert.equal(build(data({snapshot:null,serverError:true,lyrics:{hasTrack:false,provider:null,enabled:true}})).filter(x=>x.group==='optional'&&x.state==='working').length,0));
test('server error warning explained',()=>assert(by(build(data({snapshot:null,serverError:true})),'genius').explanation.includes('Serverstatus nicht erreichbar')));
test('unknown config distinct',()=>assert.equal(by(build(data({snapshot:null})),'spotify').configured,null));
test('missing server uses no fake enabled',()=>assert.equal(by(build(data({snapshot:null})),'genius').enabled,null));
test('broken spotify configuration',()=>{const s={version:667,services:server.services.map(x=>x.id==='spotify'?{...x,configured:false,enabled:false}:x)};assert.equal(by(build(data({snapshot:s,spotify:{connected:false,error:null,fetchedAt:0}})),'spotify').state,'attention');});
test('Lastfm key absent warns',()=>{const s={version:667,services:server.services.map(x=>x.id==='lastfm'?{...x,configured:false,enabled:false}:x)};assert.equal(by(build(data({snapshot:s})),'lastfm').state,'attention');});
test('Lastfm separate Spotify scrobbling mentioned',()=>assert(by(build(data({lastfm:{...data().lastfm,consent:false}})),'lastfm').explanation.includes('Spotify-Scrobbling')));
test('no client key exposed',()=>assert(!/SPOTIFY_CLIENT_SECRET|LASTFM_API_KEY\s*=/.test(raw)));
test('no fetch or outgoing requests in pure module',()=>assert(!/\bfetch\s*\(|axios|XMLHttpRequest|https?:\/\//.test(raw)));
test('no LastFm storage mutations in pure module',()=>assert(!/setItem|appendLongtermHistory|scrobbleTrack/i.test(raw)));
test('no provider success on configuration alone',()=>assert(build(data({spotify:{connected:false,error:null,fetchedAt:0},lastfm:{...data().lastfm,consent:false},lyrics:{hasTrack:false,provider:null,enabled:true}})).every(c=>c.state!=='working')));
const ui=fs.readFileSync('components/ConnectedServicesMonitorV725.tsx','utf8');
const parent=fs.readFileSync('components/ServiceStatusDashboardV667.tsx','utf8');
const settings=fs.readFileSync('components/SettingsPanel.tsx','utf8');
const css=fs.readFileSync('app/globals.css','utf8');
const docs=fs.readFileSync('README.md','utf8');
test('monitor in existing status panel',()=>assert(parent.includes('<ConnectedServicesMonitorV725 snapshot={server}')));
test('not replacing original dashboard',()=>assert(parent.includes('<DiagnosticAssistantV668 rows={rows}')));
test('server endpoint unchanged',()=>assert(fs.readFileSync('app/api/system/status/route.ts','utf8').includes('getConfigurationSnapshotV667')));
test('new UI reads consent from existing V708',()=>assert(ui.includes('readLastFmAutoConsentV708(window.localStorage,raw)')));
test('new UI reads last success from V708',()=>assert(ui.includes('readLastFmAutoStatusV708(window.localStorage,raw)')));
test('new UI accounts scoped',()=>assert(ui.includes('V706_USERNAME_KEY')));
test('new UI safe on blocked storage',()=>assert(ui.includes('catch{return {...empty,storageError:true}')));
test('new UI cross-tab listener',()=>assert(ui.includes("addEventListener('storage',update)")));
test('new UI v708 events',()=>assert(ui.includes('V708_STATUS_EVENT')&&ui.includes('V708_CHANGE_EVENT')));
test('new UI 60 sec refresh',()=>assert(ui.includes('setInterval(update,60_000)')));
test('new UI read-only provider status',()=>assert(!/fetch\s*\(|api\/lastfm|appendLongtermHistory|writeLastFmArchive/.test(ui)));
test('new UI aria pressed filters',()=>assert(ui.includes('aria-pressed={filter===id}')));
test('new UI 4 filters',()=>assert(ui.includes("['attention','Zu prüfen'")&&ui.includes("['unknown','Ungeprüft'")));
test('new UI true config vs active',()=>assert(ui.includes("Konfiguriert:")&&ui.includes("Aktiv:")));
test('new UI 44 px touch',()=>assert(css.includes('.services-head-v725 button,.services-summary-v725 button{min-height:44px')));
test('new UI mobile',()=>assert(css.includes('@media(max-width:640px){.services-v725')));
test('new UI focus',()=>assert(css.includes('.services-v725 button:focus-visible')));
test('new UI reduced motion',()=>assert(css.includes('@media(prefers-reduced-motion:reduce){.services-v725')));
test('settings labelled correctly',()=>assert(settings.includes('label: "Dienste & Status"')));
test('settings retains dashboard tab id',()=>assert(settings.includes('id: "dashboard", label: "Dienste & Status"')));
test('settings mounts old parent',()=>assert(settings.includes('<ServiceStatusDashboardV667 onNavigate={setTab} />')));
test('existing source docs retained',()=>assert(docs.includes('V724')));
test('new documentation',()=>assert(fs.existsSync('docs/versions/V725-CONNECTED-SERVICES-MONITOR.md')));
test('new verification',()=>assert(fs.existsSync('docs/versions/V725-VERIFICATION.md')));
test('package scripts',()=>{const p=require('../package.json');require('./helpers/project-version-v651.cjs').assertProjectVersionAtLeast(725);assert(p.scripts['test:quick'].includes('npm run test:v725 && npm run test:v725:types && npm run test:v725:ui-types &&'));});
console.log(`PASS: V725 Connected Services Monitor – ${count} checks.`);
