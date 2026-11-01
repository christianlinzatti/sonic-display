'use strict';
/** V696: user-directed, evidence-backed multi-ensemble production acceptance.
 * Six real V592 captures + explicitly edited manual findings. No playback emulation,
 * fake GLBs, automatic subjective scoring, credentials, CDN requests or GPU promises.
 */
const fs=require('node:fs'),path=require('node:path');
const ROOT=path.resolve(__dirname,'..');
const SCENARIOS=Object.freeze([
 {id:'rap-solo',genre:'Deutschrap',actors:1},
 {id:'rap-duet',genre:'Deutschrap',actors:2},
 {id:'rap-quartet',genre:'Deutschrap',actors:4},
 {id:'tekk-solo',genre:'Hardstyle/Hardtekk',actors:1},
 {id:'tekk-duet',genre:'Hardstyle/Hardtekk',actors:2},
 {id:'tekk-quartet',genre:'Hardstyle/Hardtekk',actors:4}
]);
const COMMON=Object.freeze(['glb-and-rig','foot-contact','motion-transitions','lyrics-contrast','lyrics-head-separation','camera-framing','camera-variety','moving-heads-gobo-fog','performance-smoothness','long-song-dramaturgy']);
function criteriaFor(s){return [...COMMON,...(s.genre==='Deutschrap'?['vocal-lip-sync','verse-hook-flow']:['kick-drop-choreography','energy-build-drop']),...(s.actors>1?['ensemble-spacing','performer-handoffs']:[]),...(s.actors===4?['four-performer-legibility']:[])];}
function blankReview(){return {format:'sonic-v696-manual-review',schema:1,reviewer:'',device:'',browser:'',scenarios:SCENARIOS.map(s=>({id:s.id,genreConfirmed:false,notes:'',checks:criteriaFor(s).map(id=>({id,status:'pending',note:'',songTimeSec:null}))}))};}
const isObj=x=>x!==null&&typeof x==='object'&&!Array.isArray(x);
const boundedString=(v,max=300)=>typeof v==='string'&&v.length<=max;
function validateReview(raw){
 if(!isObj(raw)||raw.format!=='sonic-v696-manual-review'||raw.schema!==1||!boundedString(raw.reviewer,80)||!boundedString(raw.device,120)||!boundedString(raw.browser,120)||
    !Array.isArray(raw.scenarios)||raw.scenarios.length!==SCENARIOS.length)throw Error('Ungültiges V696-Prüfblatt; zunächst --init ausführen');
 if(new Set(raw.scenarios.map(s=>s?.id)).size!==SCENARIOS.length)throw Error('Doppelte oder fehlende Szenarien');
 for(const scenario of SCENARIOS){const s=raw.scenarios.find(x=>x.id===scenario.id);
  if(!s||typeof s.genreConfirmed!=='boolean'||!boundedString(s.notes,1000)||!Array.isArray(s.checks)||s.checks.length!==criteriaFor(scenario).length||
     new Set(s.checks.map(c=>c?.id)).size!==s.checks.length)throw Error(`Ungültige Checkliste ${scenario.id}`);
  for(const id of criteriaFor(scenario)){
   const c=s.checks.find(x=>x.id===id);
   if(!c||!['pending','pass','fail'].includes(c.status)||!boundedString(c.note,800)||
      !(c.songTimeSec===null||(Number.isFinite(c.songTimeSec)&&c.songTimeSec>=0&&c.songTimeSec<=86400)))throw Error(`Ungültiger Eintrag ${scenario.id}/${id}`);
   if(c.status!=='pending'&&(c.note.trim().length<12||c.songTimeSec===null))throw Error(`Ausgefüllter Check benötigt Begründung + Song-Zeitmarke: ${scenario.id}/${id}`);
  }
 }
 return raw;
}
function safeReadJson(file,max=2_000_000){const st=fs.statSync(file);if(!st.isFile()||st.size<5||st.size>max)throw Error('Bericht ungültig oder zu groß');return JSON.parse(fs.readFileSync(file,'utf8'));}
const PNG_SIGNATURE=Buffer.from([137,80,78,71,13,10,26,10]);
const CRC_TABLE=Array.from({length:256},(_,i)=>{let c=i;for(let j=0;j<8;j++)c=c&1?0xedb88320^(c>>>1):c>>>1;return c>>>0;});
function crc32(buf,start,end){let c=0xffffffff;for(let i=start;i<end;i++)c=CRC_TABLE[(c^buf[i])&255]^(c>>>8);return (c^0xffffffff)>>>0;}
function validPng(file){try{const stat=fs.statSync(file);if(!stat.isFile()||stat.size<120||stat.size>16_000_000)return false;
 const buf=fs.readFileSync(file);if(!buf.subarray(0,8).equals(PNG_SIGNATURE))return false;
 let offset=8,chunkIndex=0,hasPixels=false,hasEnd=false;
 while(offset+12<=buf.length){const size=buf.readUInt32BE(offset),end=offset+12+size;
  if(size>16_000_000||end>buf.length)return false;
  const type=buf.toString('ascii',offset+4,offset+8),stored=buf.readUInt32BE(end-4);
  if(stored!==crc32(buf,offset+4,end-4))return false;
  if(chunkIndex===0){if(type!=='IHDR'||size!==13)return false;
   const width=buf.readUInt32BE(offset+8),height=buf.readUInt32BE(offset+12);
   if(width<640||width>3840||height<480||height>2160)return false;
  }
  if(type==='IDAT'&&size>0)hasPixels=true;
  if(type==='IEND'){if(size!==0||end!==buf.length)return false;hasEnd=true;break;}
  offset=end;chunkIndex++;
 }
 return hasEnd&&hasPixels;
 }catch{return false;}}

function finite(v,min,max){return typeof v==='number'&&Number.isFinite(v)&&v>=min&&v<=max;}
function inspectCapture(root,scenario,now=Date.now()){
 const dir=path.join(root,'artifacts/v696/captures',scenario.id),file=path.join(dir,'report.json');
 const result={id:scenario.id,genre:scenario.genre,actors:scenario.actors,status:'blocked',issues:[],trackId:null,metrics:null,sceneMoments:[],screenshots:[],source:'V592 real-stage capture'};
 if(!fs.existsSync(file)){result.issues.push('Kein V592-Livebericht vorhanden');return result;}
 try{
  const r=safeReadJson(file);
  if(r.format!=='sonic-v592-live-concert-review'||r.status!=='measured-needs-human-review'||r.source!=='actual-spotify-visualizer-stage'||
      !['existing-local-chromium','headed-local-chromium','headless-local-chromium'].includes(r.mode))throw Error('Kein akzeptierter V592-Livebericht');
  const captureTime=Date.parse(r.capturedAt);
  if(!Number.isFinite(captureTime)||captureTime>now+60000||now-captureTime>7*86400000)throw Error('Aufnahme älter als 7 Tage oder Datum ungültig');
  if(r.modelCount!==scenario.actors||r.minGlb!==scenario.actors)throw Error(`Erwartet genau ${scenario.actors} GLB-Avatare; V592 muss mit --min-glb=${scenario.actors} laufen`);
  if(typeof r.sourceTrack!=='string'||r.sourceTrack.length<2||r.sourceTrack.length>200||!finite(r.progressMs,1300,24*60*60*1000))throw Error('Echter Songfortschritt / Track-ID fehlt');
  if(!isObj(r.screen)||!finite(r.screen.width,640,3840)||!finite(r.screen.height,480,2160))throw Error('Bildschirmgröße fehlt');
  if(!isObj(r.frameTiming)||r.frameTiming.status!=='measured'||!finite(r.frameTiming.averageFps,1,500)||!finite(r.frameTiming.p95FrameMs,1,3000)||r.frameTiming.contextLosses!==0)throw Error('Frame-Messungen fehlen oder WebGL Context Loss');
  if(!Array.isArray(r.screenshots)||r.screenshots.length<3||r.screenshots.length>8)throw Error('Mindestens drei echte Bühnen-Screenshots erforderlich');
  let previous=-1;
  for(const shot of r.screenshots){
   if(!isObj(shot)||!/^live-\d{2}\.png$/.test(shot.file)||shot.actors!==scenario.actors||!finite(shot.progressMs,0,24*60*60*1000)||shot.progressMs<=previous||
      !Array.isArray(shot.actorBounds)||shot.actorBounds.length!==scenario.actors||!shot.actorBounds.every(a=>isObj(a)&&Number.isInteger(a.meshes)&&a.meshes>0&&isObj(a.bounds)&&
        ['minX','maxX','minY','maxY'].every(k=>finite(a.bounds[k],-100,100))&&a.bounds.maxX>a.bounds.minX&&a.bounds.maxY>a.bounds.minY)||
      !validPng(path.join(dir,shot.file)))throw Error(`Kein korrekter GLB-/PNG-/Songnachweis in ${shot.file||'Screenshot'}`);
   previous=shot.progressMs;
   const ev=shot.sceneEvidence||{};
   result.sceneMoments.push({timeSec:Math.round(shot.progressMs/100)/10,act:String(ev.act||'').slice(0,50),moment:String(ev.moment||'').slice(0,50),genreSignal:String(ev.genre||'').slice(0,50),shot:String(ev.shot||'').slice(0,50)});
   result.screenshots.push(shot.file);
  }
  if(r.screenshots.at(-1).progressMs-r.screenshots[0].progressMs<1300)throw Error('Screenshots zeigen zu wenig Songfortschritt');
  result.trackId=r.sourceTrack;
  result.metrics={fps:r.frameTiming.averageFps,p95Ms:r.frameTiming.p95FrameMs,contextLosses:r.frameTiming.contextLosses,
   drawCalls:r.screenshots.reduce((sum,s)=>sum+(finite(s.drawCalls,0,100000)?s.drawCalls:0),0)/r.screenshots.length,
   screen:{width:r.screen.width,height:r.screen.height},mode:r.mode,modelCount:r.modelCount,progressMs:r.progressMs,shots:r.screenshots.length};
  result.status='measured-needs-human-review';
  if(new Set(result.sceneMoments.map(s=>s.moment).filter(Boolean)).size<2)result.issues.push('Keine bestätigte Abschnittsvielfalt: Verse/Hook/Drop bewusst visuell prüfen.');
 }catch(e){result.issues.push(`Messnachweis abgewiesen: ${String(e.message||e).slice(0,220)}`);}
 return result;
}
function assessV696(captures,review){
 const submissions=SCENARIOS.map(s=>{const cap=captures.find(c=>c.id===s.id);const entry=review.scenarios.find(e=>e.id===s.id);
  const checks=entry.checks.map(c=>({id:c.id,status:c.status,note:c.note,songTimeSec:c.songTimeSec}));
  const failed=checks.filter(c=>c.status==='fail').length,finished=checks.filter(c=>c.status!=='pending').length;
  return {...cap,manual:{genreConfirmed:entry.genreConfirmed,notes:entry.notes,finished,total:checks.length,failed,checks}};
 });
 const issues=[];const comparisons=[];
 for(const genre of ['Deutschrap','Hardstyle/Hardtekk']){
  const three=submissions.filter(s=>s.genre===genre);
  const comparable=three.every(s=>s.status==='measured-needs-human-review')&&new Set(three.map(s=>s.trackId)).size===1&&
   new Set(three.map(s=>`${s.metrics?.screen?.width}x${s.metrics?.screen?.height}`)).size===1&&
   new Set(three.map(s=>s.metrics?.mode)).size===1;
  comparisons.push({genre,comparable,reason:comparable?'Gleicher Track, Auflösung und Chromium-Aufnahmemodus; Grafik-/Szenenlast kann dennoch variieren.':
   'Für FPS-Vergleich denselben Track, dieselbe Auflösung und denselben Aufnahmemodus bei 1/2/4 Avataren verwenden.',
   profiles:three.map(s=>({actors:s.actors,measured:s.status==='measured-needs-human-review',fps:s.metrics?.fps??null,p95Ms:s.metrics?.p95Ms??null,
    relativeP95ToSolo:comparable?Math.round(s.metrics.p95Ms/three[0].metrics.p95Ms*100)/100:null}))});
 }
 for(const s of submissions){if(s.status!=='measured-needs-human-review')issues.push(`${s.id}: Live-Capture fehlt oder wurde abgewiesen`);
  if(!s.manual.genreConfirmed)issues.push(`${s.id}: Genre nicht manuell bestätigt`);
  if(s.manual.finished!==s.manual.total)issues.push(`${s.id}: ${s.manual.total-s.manual.finished} Sichtprüfungen offen`);
  if(s.manual.failed)issues.push(`${s.id}: ${s.manual.failed} Sichtprüfungen fehlgeschlagen`);
 }
 if(!boundedString(review.reviewer,80)||review.reviewer.trim().length<2||review.device.trim().length<3||review.browser.trim().length<3)issues.push('Prüfer, Gerät und Browser im Prüfblatt fehlen');
 if(comparisons.some(c=>!c.comparable))issues.push('Nicht alle sechs Performance-Profile sind vergleichbar');
 const completeCaptures=submissions.every(s=>s.status==='measured-needs-human-review');
 const manualCompleted=submissions.every(s=>s.manual.genreConfirmed&&s.manual.finished===s.manual.total&&s.manual.failed===0);
 const status=completeCaptures&&manualCompleted&&comparisons.every(c=>c.comparable)&&issues.length===0?'ready-for-final-signoff':
  submissions.some(s=>s.manual.failed>0)?'issues-found':completeCaptures?'needs-manual-review':'blocked';
 return {format:'sonic-v696-production-acceptance',schema:1,version:'0.1.0-v696',status,approved:false,manualSignoffRequired:true,
  createdAt:new Date().toISOString(),scope:'Deutschrap + Hardstyle/Hardtekk × 1/2/4 genuine GLB actors',reviewer:review.reviewer,device:review.device,browser:review.browser,
  scenarios:submissions,comparisons,issues,
  limitations:['Submitted local V592 JSON/PNGs are evidence to inspect, not tamper-proof proof of authenticity.',
   'Lyrics legibility, vocal lip sync, natural dance, rhythm alignment, fog and lighting require independent human watching.',
   'Browser rAF metrics are not GPU frame time, audio latency, thermals, or performance on an untested Raspberry Pi.',
   'Even a complete six-scenario checklist is not an automatic production release. V695 build/browser gate remains independent.']};
}
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function renderHtmlV696(report){const statuses={'blocked':'Blockiert','needs-manual-review':'Sichtprüfung offen','issues-found':'Mängel gefunden','ready-for-final-signoff':'Bereit für abschließende Freigabeprüfung'};
 const sections=report.scenarios.map(s=>{const screenshots=s.screenshots.map(file=>`<a href="captures/${esc(s.id)}/${esc(file)}"><img loading="lazy" src="captures/${esc(s.id)}/${esc(file)}" alt="${esc(s.id)} ${esc(file)}"></a>`).join('');
 const checks=s.manual.checks.map(c=>`<tr><td>${esc(c.id)}</td><td>${esc(c.status)}</td><td>${c.songTimeSec===null?'–':esc(c.songTimeSec)+' s'}</td><td>${esc(c.note)}</td></tr>`).join('');
 return `<section><h2>${esc(s.genre)} · ${s.actors} GLB-Avatar${s.actors===1?'':'e'}</h2><p>Status: ${esc(s.status)} · ${s.manual.finished}/${s.manual.total} Sichtprüfungen · ${s.manual.failed} Mängel</p><p>FPS: ${s.metrics?esc(s.metrics.fps.toFixed(1)):'–'} · P95: ${s.metrics?esc(s.metrics.p95Ms.toFixed(1)):'–'} ms · ${esc(s.issues.join('; ')||'Keine automatischen Zusatzhinweise')}</p><div class="shots">${screenshots}</div><table><thead><tr><th>Prüfpunkt</th><th>Bewertung</th><th>Songzeit</th><th>Begründung</th></tr></thead><tbody>${checks}</tbody></table></section>`;}).join('');
 const comp=report.comparisons.map(c=>`<section><h2>Vergleich: ${esc(c.genre)}</h2><p>${esc(c.reason)}</p><table><thead><tr><th>Avatare</th><th>FPS</th><th>P95 (ms)</th><th>P95-Verhältnis zu Solo</th></tr></thead><tbody>${c.profiles.map(p=>`<tr><td>${p.actors}</td><td>${p.fps===null?'–':esc(p.fps.toFixed(1))}</td><td>${p.p95Ms===null?'–':esc(p.p95Ms.toFixed(1))}</td><td>${p.relativeP95ToSolo===null?'nicht vergleichbar':esc(p.relativeP95ToSolo.toFixed(2))+'×'}</td></tr>`).join('')}</tbody></table></section>`).join('');
 return `<!doctype html><html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>V696 – Konzertabnahme</title><style>body{background:#0c1423;color:#f1f4fa;font:15px/1.5 system-ui;max-width:1200px;margin:20px auto;padding:0 18px}section{background:#172338;border:1px solid #43546c;border-radius:12px;padding:16px;margin:20px 0}p,li{color:#ced9e8}.shots{display:flex;gap:8px;overflow-x:auto}.shots img{width:220px;max-width:40vw;border-radius:7px}table{width:100%;border-collapse:collapse}td,th{text-align:left;vertical-align:top;border-bottom:1px solid #43546c;padding:8px;font-size:13px}h1{font-size:24px}h2{font-size:18px}</style></head><body><h1>Sonic Display V696 – Produktive Konzertabnahme</h1><p>Gesamtstatus: <strong>${esc(statuses[report.status]||report.status)}</strong>. Keine automatische Freigabe. Erfasst: ${esc(report.createdAt)} · Gerät: ${esc(report.device||'unbekannt')} · Prüfer: ${esc(report.reviewer||'offen')}</p><p>Musik und Avatare stammen ausschließlich aus ausdrücklich aufgezeichneten Live-Berichten. Jede künstlerische Bewertung muss ein Mensch vornehmen.</p>${comp}${sections}<section><h2>Offene Punkte</h2><ul>${report.issues.map(i=>`<li>${esc(i)}</li>`).join('')}</ul></section><p>${report.limitations.map(esc).join(' ')}</p></body></html>`;
}
function parseOptions(argv){let mode='evaluate';let out='artifacts/v696/acceptance';for(const a of argv){if(a==='--init')mode='init';else if(a==='--evaluate')mode='evaluate';else if(a.startsWith('--out='))out=a.slice(6);else throw Error(`Unbekannte Option: ${a}`);}
 if(!out||out.length>200||path.isAbsolute(out))throw Error('Ausgabepfad muss relativ zum Projekt liegen');return {mode,out};}
function insideRoot(root,name){const full=path.resolve(root,name);if(!full.startsWith(root+path.sep))throw Error('Pfad außerhalb des Projekts abgewiesen');return full;}
function run(root,options,now=Date.now()){
 const reviewFile=path.join(root,'artifacts/v696/review.json');fs.mkdirSync(path.dirname(reviewFile),{recursive:true});
 if(options.mode==='init'){
  if(fs.existsSync(reviewFile))return {status:'existing',path:reviewFile};
  fs.writeFileSync(reviewFile,JSON.stringify(blankReview(),null,2)+'\n');return {status:'created',path:reviewFile};
 }
 const review=fs.existsSync(reviewFile)?validateReview(safeReadJson(reviewFile)):blankReview();
 const report=assessV696(SCENARIOS.map(s=>inspectCapture(root,s,now)),review);
 if(!fs.existsSync(reviewFile))report.issues.push('Kein manuelles Prüfblatt: npm run audit:v696:init ausführen');
 const output=insideRoot(root,options.out);
 if([reviewFile,...SCENARIOS.map(s=>path.join(root,'artifacts/v696/captures',s.id,'report.json'))].some(f=>f===output||f===output+'.json'||f===output+'.html'))throw Error('Schreibschutz: Quelldaten dürfen nicht überschrieben werden');
 fs.mkdirSync(path.dirname(output),{recursive:true});fs.writeFileSync(output+'.json',JSON.stringify(report,null,2)+'\n');
 // HTML paths are anchored relative to the default artifacts/v696 report directory.
 const html=renderHtmlV696(report).replace(/(href|src)="captures\//g,(_m,k)=>`${k}="${esc(path.relative(path.dirname(output),path.join(root,'artifacts/v696/captures')).replace(/\\/g,'/'))}/`);
 fs.writeFileSync(output+'.html',html);return {...report,reportPath:output+'.json'};
}
function main(argv=process.argv.slice(2),root=ROOT){try{const options=parseOptions(argv);const result=run(root,options);
 if(options.mode==='init'){console.log(`V696 Prüfblatt ${result.status}: ${result.path}`);return 0;}
 console.log(`V696: ${result.status}; ${result.scenarios.filter(s=>s.status==='measured-needs-human-review').length}/6 echte Aufnahmen, Bericht: ${result.reportPath}`);
 result.issues.slice(0,20).forEach(i=>console.log('  - '+i));return result.status==='ready-for-final-signoff'?0:1;
 }catch(e){console.error('V696 Abnahme blockiert:',e.message);return 2;}}
module.exports={SCENARIOS,criteriaFor,blankReview,validateReview,validPng,inspectCapture,assessV696,renderHtmlV696,parseOptions,insideRoot,run,main};
if(require.main===module)process.exitCode=main();
