#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const {load}=require('./helpers/ts-loader-v404.cjs');
const {
 DEFAULT_GOVEE_SYNC_V1027:DEFAULT,normalizeGoveeSyncV1027:normalize,
 planGoveeSyncV1027:plan,applyGoveeSyncV1027:apply,visualAdvanceV1027:advance,
 GOVEE_ZONES_V1027:zones,safeGoveeSyncProgressV1027:safePosition
}=load('lib/goveeConcertSyncV1027');
assert.equal(DEFAULT.enabled,false,'default requires explicit opt-in');
assert.deepEqual(zones,['wall','rhythm','neon','ambient']);
const ips=['192.168.1.21','192.168.1.22','192.168.1.23','192.168.1.24'];
const safe=normalize({enabled:true,strength:1000,transitionMs:10,
 fixtureIps:{wall:ips[0],rhythm:ips[1],neon:ips[2],ambient:ips[3]},
 visualDelayMs:{[ips[0]]:170,[ips[1]]:NaN,[ips[2]]:9999}});
assert.equal(safe.strength,65);assert.equal(safe.transitionMs,1200);
assert.equal(safe.visualDelayMs[ips[0]],170);assert.equal(safe.visualDelayMs[ips[1]],0);
assert.equal(safe.visualDelayMs[ips[2]],350);
assert.equal(advance(safe,ips[0],250),250,'V927 visual delay is MAX not sum');
assert.equal(advance(safe,ips[2],120),350);
assert.equal(advance(safe,ips[0],999),350,'bounded manual delay');
assert.equal(advance(DEFAULT,ips[0],-20),0);
assert.equal(safePosition(9950,150,0,10000,10000),9950,'no early next hook');
assert.equal(safePosition(9800,150,0,10000,10000),9950,'within same section');
assert.equal(safePosition(9950,100,0,20000,10000),9950,'overlap next marker also protected');
assert.equal(safePosition(25000,100,25000,10000,35000),25100,'exact new marker is valid');
assert.equal(safePosition(3000,100,null,null),3000);
assert.equal(safePosition(NaN,100,0,10000),NaN);
assert.equal(safePosition(2500,1000,0,10000),2500,'impossible lag not used');

const attack=normalize({enabled:true,fixtureIps:{wall:'8.8.8.8',rhythm:ips[0],neon:ips[0],ambient:'127.0.0.1'},
 visualDelayMs:{'8.8.8.8':100,[ips[0]]:170}});
assert.equal(attack.fixtureIps.wall,'');assert.equal(attack.fixtureIps.rhythm,ips[0]);
assert.equal(attack.fixtureIps.neon,'');assert.equal(attack.fixtureIps.ambient,'');
assert(!('8.8.8.8' in attack.visualDelayMs));
const phase={phase:'hook',previous:'verse',transition:.75,verified:true};
const input={settings:safe,ip:ips[0],selectedIps:ips,bridgeEnabled:true,autoSync:true,
 directorEnabled:true,playing:true,visible:true,progressMs:12000,durationMs:120000,
 phase,stageCamera:'wide'};
const get=patch=>plan({...input,...patch});
const yes=get();assert(yes.active&&yes.zone==='wall'&&yes.phase==='hook');
assert(yes.brightnessFactor>=.88&&yes.brightnessFactor<=1);
assert(yes.mix>0&&yes.mix<=.13);
assert(get({ip:ips[1]}).active&&get({ip:ips[1]}).zone==='rhythm');
assert(get({ip:ips[2]}).active&&get({ip:ips[2]}).zone==='neon');
assert(get({ip:ips[3]}).active&&get({ip:ips[3]}).zone==='ambient');
assert(!get({settings:DEFAULT}).active);
assert(!get({settings:{...safe,enabled:false}}).active);
assert(!get({settings:{...safe,strength:0}}).active);
for(const [reason,patch] of Object.entries({
 bridgeDisabled:{bridgeEnabled:false},autoDisabled:{autoSync:false},directorDisabled:{directorEnabled:false},
 paused:{playing:false},hidden:{visible:false},manual:{manualOverride:true},show:{savedShowActive:true},
 authored:{authoredStageActive:true},recovering:{recovering:true},reduced:{reducedMotion:true},
 lyrics:{lyricsVisible:true},voice:{voiceActive:true},atmosphere:{roomAtmosphereActive:true},unison:{groupUnisonActive:true},unselected:{ip:'192.168.1.26'},
 foreign:{selectedIps:['192.168.1.26']},tooMany:{selectedIps:[...ips,'192.168.1.25']},
 duplicated:{selectedIps:[ips[0],ips[0]]},badPosition:{progressMs:Infinity},
 negativePosition:{progressMs:-1},expired:{progressMs:120000},badDuration:{durationMs:NaN},
 unsupported:{phase:{phase:'ambient',previous:'ambient',transition:1,verified:false}},
 fake:{phase:{phase:'drop',previous:'verse',transition:1,verified:false}},
 invalidTransition:{phase:{phase:'hook',previous:'verse',transition:NaN,verified:true}},
 missingPhase:{phase:{phase:'ambient',previous:'ambient',transition:1,verified:true}},
 unassigned:{settings:{...safe,fixtureIps:{...safe.fixtureIps,wall:''}}}
})){
 const x=get(patch);assert(!x.active,'must reject '+reason);assert.equal(x.mix,0);
}
const source={brightness:55,color:{r:80,g:40,b:150}};
const earlier={brightness:40,color:{r:20,g:18,b:18}};
const applied=apply(source,earlier,yes,70);
assert(applied.brightness<=source.brightness&&applied.brightness<=70&&applied.brightness<=earlier.brightness+7);
for(const k of ['r','g','b'])assert(Math.abs(applied.color[k]-earlier.color[k])<=18,`slew ${k}`);
assert.deepEqual(apply(source,earlier,get({playing:false}),70),source);
assert.deepEqual(apply(source,earlier,yes,NaN),source);
assert.deepEqual(apply({...source,brightness:NaN},earlier,yes,70),{...source,brightness:NaN});
assert.deepEqual(apply(source,earlier,{...yes,mix:100},70),source);
assert.deepEqual(apply(source,undefined,yes,45).brightness,45);
const calm=get({phase:{phase:'break',previous:'build',transition:1,verified:true}});
assert(calm.active&&calm.brightnessFactor<yes.brightnessFactor,'break is calmer than hook');
const subtle=get({stageCamera:'close',ip:ips[2]});
const neonWide=get({ip:ips[2],stageCamera:'wide'});assert(subtle.mix<neonWide.mix);
assert.equal(normalize(null).enabled,false);assert.equal(normalize({enabled:'true'}).enabled,false);
const moduleSource=read('lib/goveeConcertSyncV1027.ts');
for(const forbidden of ['fetch(','setInterval(','setTimeout(','goveeBridgeRequest','/command','navigator.','new WebSocket','new SpotLight','new PointLight'])
 assert(!moduleSource.includes(forbidden),'no networking or extra stage light from module: '+forbidden);
const sender=read('components/GoveeMusicSyncV909.tsx');
assert(sender.includes('const syncDecisionV1027=planGoveeSyncV1027({'));
assert(sender.includes('const syncedLookV1027=applyGoveeSyncV1027(voiceLookV970,previous,syncDecisionV1027,'));
assert(sender.indexOf('const syncedLookV1027=')<sender.indexOf('governConcertLookV961(previous,syncedLookV1027,'));
assert.equal((sender.match(/goveeBridgeRequestV909\(config,'\/command','POST',\{ip,action:'look',value:finalLook\}\)/g)||[]).length,1);
assert(sender.includes('visualAdvanceV1027(syncSettingsV1027,ip,visualAdvance)'));
assert(sender.includes('savedShowActive:Boolean(show),authoredStageActive:stage?.source===\'authored\''));
assert(sender.includes('const safeProgressV1027=safeGoveeSyncProgressV1027(progress,advanceV1027,'));
assert(sender.includes('Math.min(config.masterBrightness,festivalDeliveredLook.brightness)'));
assert(sender.includes('roomAtmosphereActive:roomDecisionV987.active,groupUnisonActive:group?.mode===\'unison\''));
assert.deepEqual(apply(source,earlier,{...yes,accent:{r:Infinity,g:0,b:0}},70),source);
const panel=read('components/GoveeLanPanelV909.tsx'),settings=read('components/GoveeConcertSyncStudioV1027.tsx');
assert(panel.includes('<GoveeConcertSyncStudioV1027 config={config} devices={devices} onConfig={update}/>'));
assert(settings.includes('onConfig({autoSync:false})'),'explicit manual button shuts down entire autoSync');
assert(panel.includes('if(config.autoSync)update({autoSync:false});'),'existing manual commands override automatic cues');
const pkg=JSON.parse(read('package.json')),lock=JSON.parse(read('package-lock.json'));
assert(Number(/^0\.1\.0-v(\d+)$/.exec(pkg.version)?.[1])>=1027);assert.equal(pkg.version,lock.version);
assert.equal(pkg.sonicFeatureRelease,pkg.version.split('-')[1]);assert.equal(pkg.sonicRoadmapRelease,pkg.version.split('-')[1]);
assert(pkg.scripts.prebuild.includes('npm run test:v1027 &&'));
for(const script of ['scripts/v931-production-gate.cjs','scripts/vercel-production-build.cjs'])
 assert(read(script).includes('tests/v1027-govee-concert-sync-regression.cjs'));
assert(read('scripts/v959-source-preflight.cjs').includes('inspectReleaseV1027(root)'));
console.log('PASS V1027 4 opt-in zones, validated LAN IPs, verified song sections, manual priority, visual lag cap, rate-limited in-place overlay and CI');
