'use strict';
/** V695: provenance-bound, fail-closed release evidence. No synthetic pass and no credential reads. */
const fs=require('node:fs'), path=require('node:path');
const {spawnSync}=require('node:child_process');
const {inspectBuildEnvironmentV571}=require('./v571-build-readiness.cjs');
const ROOT=path.resolve(__dirname,'..');
const GATES=['lockfile','dependencies','typescript','next-build','qa-browser','webgl','glb-live','visual-review'];
const localUrl=s=>{try{const u=new URL(s);return ['http:','https:'].includes(u.protocol)&&['localhost','127.0.0.1','[::1]'].includes(u.hostname)&&!u.username&&!u.password&&!u.hash;}catch{return false;}};
const evidence=(status,detail,source='local-check')=>({status,detail,source});
function assessV695(gates){
 const rows=GATES.map(id=>({id,...(gates[id]||evidence('not-run','Kein ausgeführter Nachweis'))}));
 const allowed=new Set(['passed','failed','blocked','not-run','manual-required']);
 if(rows.some(r=>!allowed.has(r.status)))throw Error('Ungültiger Prüfstatus');
 const required=rows.filter(r=>r.id!=='visual-review');
 // A machine-produced report never certifies a subjective concert or lip-sync.
 return {status:required.every(r=>r.status==='passed')?'needs-human-review':'blocked',approved:false,humanReviewRequired:true,
  gates:rows,passCount:required.filter(r=>r.status==='passed').length,
  limitations:['Realistic GLB choreography, actual vocal/lip synchronization, face readability, moving light beams and perceived lyrics legibility require manual viewing.',
   'No Raspberry Pi / long-run temperature / GPU claims without measurements on target hardware.']};
}
function parseV695Options(argv){
 const opts={out:'artifacts/v695/release-quality.json',url:null,chromium:'chromium',liveReport:null};
 for(const a of argv){
  if(a.startsWith('--out='))opts.out=a.slice(6);
  else if(a.startsWith('--url='))opts.url=a.slice(6);
  else if(a.startsWith('--chromium='))opts.chromium=a.slice(11);
  else if(a.startsWith('--live-report='))opts.liveReport=a.slice(14);
  else throw Error(`Unbekannte Option ${a}`);
 }
 if(opts.url!==null&&!localUrl(opts.url))throw Error('Nur lokale Browser-URLs erlaubt');
 if(!opts.out||opts.out.length>300)throw Error('Ungültiger Berichtsdateiname');
 if(!opts.chromium||opts.chromium.length>250)throw Error('Ungültiger Chromium-Pfad');
 if(opts.liveReport!==null&&(!opts.liveReport||opts.liveReport.length>300))throw Error('Ungültiger Live-Bericht');
 return opts;
}
const labelCommand=cmd=>cmd==='typecheck'?'npm run typecheck':'npm run build';
function runNpm(root,cmd){
 const result=spawnSync('npm',['run',cmd],{cwd:root,encoding:'utf8',timeout:240_000,maxBuffer:4_000_000,
  env:{...process.env,CI:'true'}});
 const out=(result.stdout||'')+'\n'+(result.stderr||'');
 return {ok:result.status===0&&!result.error,detail:result.error?String(result.error.message):`Exit ${result.status??'unbekannt'}; ${(out.match(/(?:error TS\d+|error -|Error:|Module not found)/g)||[]).length} mögliche Fehlermeldungen`,
  source:labelCommand(cmd)};
}
function inspectAssetEvidence(root){
 const searchDirs=['public/avatars','public/animations'];const files=[];
 for(const dir of searchDirs){const full=path.join(root,dir);if(!fs.existsSync(full))continue;
  for(const name of fs.readdirSync(full)){if(/\.(glb|gltf)$/i.test(name)&&fs.statSync(path.join(full,name)).isFile())files.push(path.join(dir,name));}}
 return {files,detail:files.length?`${files.length} Avatar-/Animationsdateien gefunden; diese sind allein KEIN Live-GLB-Nachweis.`:'Keine eingebundenen GLB-/GLTF-Modelle im Projektpaket; importierte Benutzer-Avatare sind separat.'};
}
function inspectLiveV695(root,filename,now=Date.now()){
 if(!filename)return evidence('blocked','Kein V592-Live-Bericht übergeben.','V592-Chromium-Live-Benchmark');
 const file=path.resolve(root,filename);
 if(!file.startsWith(root+path.sep))return evidence('failed','Live-Bericht außerhalb des Projekts abgewiesen.','V695-Live-Nachweis');
 try{
  const stat=fs.statSync(file);if(stat.size>2_000_000)throw Error('Bericht zu groß');
  const r=JSON.parse(fs.readFileSync(file,'utf8'));
  if(r.format!=='sonic-v592-live-concert-review'||r.status!=='measured-needs-human-review'||
     r.source!=='actual-spotify-visualizer-stage'||!Number.isInteger(r.modelCount)||r.modelCount<1||r.modelCount>4||
     !Array.isArray(r.screenshots)||r.screenshots.length<2||!r.sourceTrack||!r.frameTiming||
     r.frameTiming.status!=='measured'||!Number.isFinite(r.progressMs)||r.progressMs<1300||
     !['headless-local-chromium','headed-local-chromium','existing-local-chromium'].includes(r.mode))throw Error('Kein echter positiver V592-Live-Nachweis');
  const capture=Date.parse(r.capturedAt);if(!Number.isFinite(capture)||capture>now+60000||now-capture>86_400_000)throw Error('Bericht älter als 24 Stunden oder ungültiges Datum');
  for(const shot of r.screenshots){
   if(!/^live-\d{2}\.png$/.test(shot.file)||!Number.isInteger(shot.actors)||shot.actors<1||shot.actors>4)throw Error('Fehlender gültiger GLB-Screenshot');
   const img=path.join(path.dirname(file),shot.file);if(!fs.existsSync(img)||fs.statSync(img).size<100)throw Error('Original-Screenshot fehlt');
   const signature=fs.readFileSync(img).subarray(0,8);if(!signature.equals(Buffer.from([137,80,78,71,13,10,26,10])))throw Error('Bild ist keine PNG');
  }
  return evidence('passed',`V592: ${r.modelCount} echte GLB-Darsteller, ${r.screenshots.length} Screenshots, ${r.progressMs} ms Songfortschritt; künstlerische Sichtkontrolle weiter erforderlich.`,'V592-Chromium-Live-Benchmark');
 }catch(err){return evidence('failed',`V592-Live-Nachweis nicht akzeptiert: ${String(err.message||err)}`,'V695-Live-Nachweis');}
}
function runV695(root,opts){
 const start=new Date().toISOString(),build=inspectBuildEnvironmentV571(root),asset=inspectAssetEvidence(root);
 const gates={};const add=(id,status,detail,source)=>{gates[id]=evidence(status,detail,source)};
 add('lockfile',build.lockStatus==='valid'?'passed':'blocked',build.lockIssue,'V571-Manifest-/Lockfile-Prüfung');
 add('dependencies',build.dependencyStatus==='installed'?'passed':'blocked',`${build.dependencyCount-build.missingDependencies.length}/${build.dependencyCount} direkte npm-Abhängigkeiten installiert`,'V571-Abhängigkeitsprüfung');
 if(gates.lockfile.status==='passed'&&gates.dependencies.status==='passed'&&build.nodeSupported){
  const type=runNpm(root,'typecheck');add('typescript',type.ok?'passed':'failed',type.detail,type.source);
  if(type.ok){const next=runNpm(root,'build');add('next-build',next.ok?'passed':'failed',next.detail,next.source);}
  else add('next-build','blocked','TypeScript-Projektprüfung gescheitert; Build nicht freigegeben','V695-Laufzeit-Gate');
 }else{
  add('typescript','blocked','Voraussetzungen: gültiges Lockfile, installierte Abhängigkeiten und Node 20+','V695-Laufzeit-Gate');
  add('next-build','blocked','Produktionsbuild ohne vollständige Abhängigkeiten nicht ausführbar','V695-Laufzeit-Gate');
 }
 add('qa-browser','not-run','Nur mit real gestarteter App und explizitem --url wird der QA-Browsercheck versucht.','V695-Realbrowser');
 add('webgl','not-run','WebGL-Rendering der realen App nicht geprüft.','V695-Realbrowser');
 if(opts.url&&gates['next-build'].status==='passed'){
  const browserOut=path.resolve(root,'artifacts/v695/qa-browser');
  const run=spawnSync(process.execPath,[path.join(root,'scripts/v695-browser-qa-smoke.cjs'),`--url=${opts.url}`,`--chromium=${opts.chromium}`,`--out=${browserOut}`],
   {cwd:root,encoding:'utf8',timeout:120_000,maxBuffer:200000});
  try{
   const report=JSON.parse(fs.readFileSync(browserOut+'.json','utf8'));
   const real=report.kind==='application'&&report.status==='passed'&&run.status===0;
   add('qa-browser',real?'passed':'failed',real?'QA-Ansicht & V694 localStorage nach Browserneustart geprüft':report.error||report.problems?.join('; ')||'Kein gültiger App-Browsernachweis','V695-Chromium-CDP');
   add('webgl',real&&report.checks?.webglCanvasCount>0?'passed':'blocked',`Aktive WebGL-Canvas der Anwendung: ${report.checks?.webglCanvasCount??0}`,'V695-Chromium-CDP');
  }catch{add('qa-browser','failed',`Browserprüfung nicht vollständig: ${run.error?.message||'Kein gültiger CDP-Bericht'}`,'V695-Chromium-CDP');}
 }else if(opts.url){add('qa-browser','blocked','App-Browserprüfung erst nach erfolgreichem Build; keine Fixture als Ersatz','V695-Laufzeit-Gate');}
 const live=inspectLiveV695(root,opts.liveReport);add('glb-live',live.status,`${asset.detail} ${live.detail}`,live.source);
 add('visual-review','manual-required','Sichtabnahme: reale GLB-Tänze/Lip-Sync, Lyrics in Strophe/Hook, Moving Heads, Gobo/Nebel und Kamera; zusätzlich Browserneustart und Backups auf echtem Profil.','Manuelle QA');
 const verdict=assessV695(gates);
 return {format:'sonic-v695-release-evidence',schema:1,release:JSON.parse(fs.readFileSync(path.join(root,'package.json'),'utf8')).version,
  checkedAt:start,environment:{node:process.version,lockStatus:build.lockStatus,missingDependencies:build.missingDependencies,
   modelFilesIncluded:asset.files.length},...verdict};
}
function main(argv=process.argv.slice(2),root=ROOT){
 let options;
 try{options=parseV695Options(argv);}catch(e){console.error('V695 ungültige Option:',e.message);return 2;}
 const out=path.resolve(root,options.out);
 // Refuse to write evidence outside project root.
 if(out!==root&&!out.startsWith(root+path.sep)){console.error('V695 Bericht muss innerhalb des Projekts liegen.');return 2;}
 const report=runV695(root,options);
 fs.mkdirSync(path.dirname(out),{recursive:true});fs.writeFileSync(out,JSON.stringify(report,null,2)+'\n');
 console.log(`V695 Release Gate: ${report.status}; ${report.passCount}/7 maschinelle Nachweise; Bericht: ${out}`);
 report.gates.forEach(g=>console.log(`  ${g.id}: ${g.status} — ${g.detail}`));
 // Fail closed even with complete machine evidence: human approval has not been recorded.
 return 1;
}
module.exports={GATES,localUrl,assessV695,parseV695Options,inspectAssetEvidence,inspectLiveV695,runV695,main};
if(require.main===module)process.exitCode=main();
