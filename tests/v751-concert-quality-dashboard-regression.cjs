'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {load}=require('./helpers/ts-loader-v404.cjs');
const {buildConcertDashboardV751:build,isConcertDashboardFreshV751:fresh,
 concertDashboardSignatureV751:signature,EMPTY_CONCERT_DASHBOARD_V751:empty}=
  load('components/visualizer/concertDashboardProjectionV751');
const {planIntegratedConcertQualityV750:quality,DEFAULT_CONCERT_QUALITY_V750:defaults}=
  load('components/visualizer/integratedConcertQualityV750');
let checks=0;
const eq=(a,b,msg)=>{assert.deepEqual(a,b,msg);checks++;};
const ok=(a,msg)=>{assert.ok(a,msg);checks++;};
const qbase={settings:defaults,trackId:'a',durationMs:180000,progressMs:20000,playing:true,
 reducedMotion:false,section:'verse',tier:'balanced',ensembleCount:2,lyricVisible:true,
 lyricSynced:true,activeLineLength:93,verifiedVocal:true,manualDance:false,
 manualCamera:false,manualLighting:false,repeatedAct:false};
const make=(options={})=>{
 const {qOverrides={},...p}=options;
 const qi={...qbase,...qOverrides};
 return build({...{
  now:1761840000000,playing:true,avatarStage:true,section:'verse',count:2,
  quality:quality(qi),qualityEnabled:true,danceEnabled:true,ensembleEnabled:true,
  vocalEnabled:true,cameraEnabled:true,lyricsEnabled:true,lightingEnabled:true,
  lyricsVisible:true,lyricsSynced:true,verifiedVocal:true,manualDance:false,
  manualCamera:false,manualLighting:false,reducedMotion:false},...p});
};
const baseline=make();
eq(baseline.rows.length,7);
eq(baseline.rows.map(r=>r.id),['quality','dance','ensemble','vocal','camera','lyrics','lighting']);
eq(baseline.rows.map(r=>r.configured),[true,true,true,true,true,true,true]);
for(const row of baseline.rows){eq(row.enabled,true);ok(['planned','ready'].includes(row.state));}
eq(baseline.rows.find(r=>r.id==='ensemble').state,'planned');
for(const id of baseline.rows.map(r=>r.id)){
 const key={quality:'qualityEnabled',dance:'danceEnabled',ensemble:'ensembleEnabled',
  vocal:'vocalEnabled',camera:'cameraEnabled',lyrics:'lyricsEnabled',lighting:'lightingEnabled'}[id];
 const report=make({[key]:false});
 eq(report.rows.find(r=>r.id===id).state,'disabled');
 eq(report.rows.filter(r=>r.state==='disabled').length,1);
}
for(const flag of ['manualDance','manualCamera','manualLighting']){
 const report=make({[flag]:true});
 const id={manualDance:'dance',manualCamera:'camera',manualLighting:'lighting'}[flag];
 eq(report.rows.find(r=>r.id===id).state,'manual');
 eq(report.rows.find(r=>r.id===id).reason,'Manueller Ablauf hat Vorrang');
}
for(const opts of [{playing:false},{avatarStage:false},{reducedMotion:true}]){
 const report=make(opts);
 for(const row of report.rows)eq(row.state,'idle');
}
eq(make({count:1}).rows.find(r=>r.id==='ensemble').state,'ready');
eq(make({verifiedVocal:false}).rows.find(r=>r.id==='vocal').state,'ready');
eq(make({lyricsSynced:false}).rows.find(r=>r.id==='lyrics').state,'ready');
eq(make({lyricsVisible:false}).rows.find(r=>r.id==='lyrics').state,'ready');
eq(fresh(empty,1761840000000),false);
eq(fresh(baseline,baseline.at),true);
eq(fresh(baseline,baseline.at+5000),true);
eq(fresh(baseline,baseline.at+5001),false);
eq(fresh(baseline,baseline.at-1),false);
eq(fresh(baseline,Number.NaN),false);
eq(signature(make()),signature(make()));
ok(!JSON.stringify(make()).includes('trackId'));ok(!JSON.stringify(make()).includes('title'));
for(let iter=0;iter<40000;iter++){
 const section=['verse','hook','drop','build','intro','outro','break'][iter%7];
 const n=1+iter%4;
 const song={...qbase,section,ensembleCount:n,tier:['low','balanced','high'][iter%3],
   verifiedVocal:iter%5===0,activeLineLength:iter%111,lyricVisible:iter%4!==0,
   lyricSynced:iter%2===0,manualCamera:iter%17===0,manualLighting:iter%23===0,
   manualDance:iter%19===0,progressMs:iter%180000};
 const r=make({now:1761840000000+iter,section,count:n,
  manualCamera:song.manualCamera,manualLighting:song.manualLighting,
  manualDance:song.manualDance,verifiedVocal:song.verifiedVocal,
  lyricsVisible:song.lyricVisible,lyricsSynced:song.lyricSynced,
  qOverrides:song});
 eq(r.rows.length,7);ok(r.rows.every(row=>row.configured===true));
 ok(r.rows.every(row=>['ready','planned','manual','disabled','idle'].includes(row.state)));
 ok(r.pressure>=0&&r.pressure<=1);
 ok(Object.values(r.factors).every(v=>v>=0&&v<=1));
 if(song.manualCamera)eq(r.rows.find(row=>row.id==='camera').state,'manual');
 if(song.manualLighting)eq(r.rows.find(row=>row.id==='lighting').state,'manual');
 if(song.manualDance)eq(r.rows.find(row=>row.id==='dance').state,'manual');
 if(!song.verifiedVocal)eq(r.rows.find(row=>row.id==='vocal').state,'ready');
}
const root=path.resolve(__dirname,'..');
const src=(p)=>fs.readFileSync(path.join(root,p),'utf8');
const stage=src('components/visualizer/VisualizerStage.tsx');
const settings=src('components/SettingsPanel.tsx');
const services=src('components/ServiceStatusDashboardV667.tsx');
const avatar=src('components/visualizer/ThreeAvatar.tsx');
const ui=src('components/visualizer/ConcertQualityDashboardV751.tsx');
const store=src('components/visualizer/concertDashboardStoreV751.ts');
for(const pattern of ['buildConcertDashboardV751','publishConcertDashboardV751','quality:qualityV750',
 'verifiedVocal:cinematicSceneV528','manualCamera:manualQualityV670.camera','manualLighting:manualQualityV670.lighting']){
 ok(stage.includes(pattern),`stage missing ${pattern}`);
}
ok(settings.includes('<ConcertQualityDashboardV751 avatarModelUrl={currentAvatar?.url??null} avatarChoicesV805={[...avatarModels.map'));
ok(services.includes('<ConcertQualityDashboardV751/>'));
ok(avatar.includes('V751_OPEN_RENDER_QA_EVENT'));
ok(ui.includes('useConcertQualityV466'));
ok(ui.includes('Nicht gemessen'));
ok(ui.includes('Automatisch vorgesehen'));
ok(ui.includes('keine GPU-Auslastung'));
ok(ui.includes('window.dispatchEvent(new Event(V751_OPEN_RENDER_QA_EVENT))'));
ok(store.includes('useSyncExternalStore'));
ok(store.includes('sig===signature&&next.at-snapshot.at<1000'));
ok(!store.includes('localStorage'));
ok(!store.includes('fetch('));
console.log(`PASS V751 Concert Quality Dashboard: ${checks.toLocaleString('en-US')} checks`);
