'use strict';
/** V771 headless Chromium long-run experiment over REAL StageEnvironment and avatar clones.
 * No renderer is mocked. Run a local Next.js server first. A stable result is not leak proof.
 * Example: npm run test:v771:browser -- --cycles=90 --model=/models/avatar.glb
 */
const fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const {spawn}=require('node:child_process');
const {setTimeout:delay}=require('node:timers/promises');
const {assessLongRunV771}=require('./v771-longrun-assessment.cjs');
const {isLoopback}=require('./v767-gpu-memory-browser.cjs');
const validModel=value=>{try{const u=new URL(value,origin),app=new URL(origin);return u.origin===app.origin&&/\.(?:glb|gltf)$/i.test(u.pathname);}catch{return false;}};
const options=process.argv.slice(2);
const option=(name,fallback)=>options.find(x=>x.startsWith(`--${name}=`))?.slice(name.length+3)??fallback;
const numberOption=(name,fallback,min,max)=>{
  const raw=option(name,String(fallback)),value=Number(raw);
  if(!Number.isSafeInteger(value)||value<min||value>max)throw Error(`--${name} muss zwischen ${min} und ${max} liegen`);
  return value;
};
const models=options.filter(x=>x.startsWith('--model=')).map(x=>x.slice(8));
const origin=option('url','http://127.0.0.1:3000');
const browser=option('chromium',process.env.CHROMIUM_PATH||'chromium');
const out=path.resolve(option('out','artifacts/v771/longrun-report.json'));
async function main(){
 const report={format:'sonic-v771-longrun',version:1,scope:'real-stage-and-avatar-harness',
  createdAt:new Date().toISOString(),status:'blocked',limitations:[
    'WebGL-Zähler sind Objektzahlen, keine VRAM-Bytes.',
    'Die Diagnose testet die Bühnen- und Avatar-Harness, nicht die komplette Spotify-Live-Konzertshow.',
    'Ein unauffälliger Test schließt Speicherlecks nicht aus.']};
 let chrome,dir,ws;const pending=new Map();let seq=0;
 const startedAt=Date.now();
 try{
  const cycles=numberOption('cycles',90,24,600),batchSize=numberOption('batch',15,8,100);
  const settleMs=numberOption('settle-ms',800,100,10000),maxMinutes=numberOption('max-minutes',90,1,240);
  if(!isLoopback(origin))throw Error('Nur Loopback-Server zulässig.');
  if(models.length>4||models.some(x=>!validModel(x)))throw Error('Maximal vier gleichursprüngliche GLB/GLTF-Modelle zulässig.');
  if(cycles<24||Math.ceil(cycles/batchSize)<3)throw Error('Mindestens 3 Blöcke und insgesamt 24 Zyklen erforderlich.');
  const blockCount=Math.ceil(cycles/batchSize);
  if(blockCount>Math.floor(cycles/8))throw Error('Zu viele Testblöcke für mindestens acht Zyklen pro Block.');
  const counts=Array.from({length:blockCount},(_,i)=>Math.floor(cycles/blockCount)+(i<cycles%blockCount?1:0));
  if(counts.some(v=>v<8||v>100))throw Error('Zykluskonfiguration ist nicht in gültige Blöcke aufteilbar.');
  const url=new URL('/diagnostics/gpu-memory',origin);url.searchParams.set('gpuLeakV767','1');
  for(const model of models)url.searchParams.append('model',model);
  const ready=await fetch(origin,{signal:AbortSignal.timeout(8000)}).catch(()=>null);
  if(!ready)throw Error('Kein lokaler Next.js-Server erreichbar. npm run dev oder npm run start ausführen.');
  dir=fs.mkdtempSync(path.join(os.tmpdir(),'sonic-v771-chromium-'));
  chrome=spawn(browser,['--headless=new','--no-sandbox','--disable-dev-shm-usage','--enable-unsafe-swiftshader',
    '--no-first-run','--no-default-browser-check','--remote-debugging-port=0',`--user-data-dir=${dir}`,'about:blank'],{stdio:'ignore'});
  chrome.on('error',()=>{});
  const wait=async(fn,name,ms)=>{const start=Date.now();while(Date.now()-start<ms){
    if(Date.now()-startedAt>maxMinutes*60000)throw Error('Maximale Testlaufzeit überschritten.');
    if(chrome.exitCode!==null)throw Error('Chromium vorzeitig beendet.');
    const value=await fn();if(value)return value;await delay(250);
  }throw Error(`${name}: Zeitüberschreitung`);};
  const port=await wait(()=>fs.existsSync(path.join(dir,'DevToolsActivePort'))?Number(fs.readFileSync(path.join(dir,'DevToolsActivePort'),'utf8').split('\n')[0]):0,'Chromium-Start',30000);
  const pages=await (await fetch(`http://127.0.0.1:${port}/json`)).json();
  const tab=pages.find(p=>p.type==='page'&&p.webSocketDebuggerUrl);if(!tab)throw Error('Kein Chromium-CDP-Tab');
  ws=new WebSocket(tab.webSocketDebuggerUrl);
  await new Promise((resolve,reject)=>{ws.addEventListener('open',resolve,{once:true});ws.addEventListener('error',reject,{once:true});});
  ws.addEventListener('message',event=>{try{const msg=JSON.parse(event.data),task=pending.get(msg.id);if(!task)return;
    pending.delete(msg.id);clearTimeout(task.timer);
    msg.error?task.reject(Error(msg.error.message)):task.resolve(msg.result);
  }catch{}});
  const send=(method,params={})=>new Promise((resolve,reject)=>{
    const id=++seq,timer=setTimeout(()=>{pending.delete(id);reject(Error(`CDP ${method}: Timeout`));},25000);
    pending.set(id,{resolve,reject,timer});ws.send(JSON.stringify({id,method,params}));
  });
  const evaluate=async expression=>{
    const response=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:false});
    if(response.exceptionDetails)throw Error(response.exceptionDetails.text||'Browser-Skriptfehler');
    return response.result?.value;
  };
  await send('Runtime.enable');await send('Page.enable');await send('Performance.enable');
  await send('Emulation.setDeviceMetricsOverride',{width:1280,height:800,deviceScaleFactor:1,mobile:false});
  const navigation=await send('Page.navigate',{url:url.href});if(navigation.errorText)throw Error(navigation.errorText);
  await wait(()=>evaluate('document.readyState==="complete" && !!window.__sonicV767 && !!document.querySelector("canvas")'), 'Renderer bereit',60000);
  const batches=[];report.config={cycles,batches:counts.length,batchSize,settleMs,models:models.map(x=>x)};
  for(let i=0;i<counts.length;i++){
    const count=counts[i];
    // Store intermediate run on window, avoiding CDP timeouts on a long awaited Promise.
    await evaluate(`(()=>{window.__v771Batch={state:'running'};window.__sonicV767.run(${count})
      .then(data=>window.__v771Batch={state:'done',data})
      .catch(err=>window.__v771Batch={state:'failed',error:String(err?.message||err)});return true;})()`);
    const state=await wait(async()=>{const state=await evaluate('({state:window.__v771Batch?.state,error:window.__v771Batch?.error})');
      return state?.state!=='running'&&state?.state?state:null;},`Testblock ${i+1}`,Math.min(maxMinutes*60000,Math.max(180000,count*25000)));
    if(state.state!=='done')throw Error(`Testblock ${i+1}: ${state.error||'unbekannter Fehler'}`);
    await delay(settleMs);
    const data=await evaluate('window.__v771Batch.data');
    if(!data||data.cycles!==count||data.format!=='sonic-v767-gpu-memory')throw Error(`Block ${i+1}: unvollständiger Renderer-Bericht`);
    await send('HeapProfiler.collectGarbage');await delay(Math.max(150,Math.floor(settleMs/3)));
    const renderer=await evaluate('window.__sonicV767.snapshot?.()??null');
    const cache=await evaluate('window.__sonicV767.cache?.()??null');
    const metrics=await send('Performance.getMetrics');
    const jsHeapUsedBytes=metrics.metrics?.find(m=>m.name==='JSHeapUsedSize')?.value??null;
    const finalized={...data,afterGc:{jsHeapUsedBytes,renderer,cache}};
    batches.push(finalized);
    // Keep all anchors but not every per-frame/stage sample in final report.
    const stride=6*(models.length+2)+1;
    report.progress=[...(report.progress||[]),{batch:i+1,cycles:count,anchorSamples:data.samples.filter(s=>s.phase==='measure'&&s.step%stride===0),afterGc:finalized.afterGc}];
    const result=assessLongRunV771(batches,{minimumCycles:24});
    console.log(`V771 Block ${i+1}/${counts.length}: ${count} Zyklen, GPU Geometrien ${renderer?.geometries??'-'}, Texturen ${renderer?.textures??'-'}, Heap nach GC ${jsHeapUsedBytes==null?'-':(jsHeapUsedBytes/1048576).toFixed(1)+' MiB'}; bisher ${result.status}`);
    await evaluate('delete window.__v771Batch;true');
    if(renderer?.contextLost)throw Error('WebGL-Kontext nach einem Block verloren');
  }
  const assessment=assessLongRunV771(batches,{minimumCycles:24});
  report.status=assessment.status;report.assessment=assessment;
  report.durationSeconds=Math.round((Date.now()-startedAt)/1000);
  report.environment=await evaluate('({userAgent:navigator.userAgent,canvasCount:document.querySelectorAll("canvas").length,visibility:document.visibilityState})');
  if(report.environment.canvasCount!==1){report.status='inconclusive';report.error='Unerwartete Anzahl WebGL-Canvas';}
  if(report.status!=='stable')process.exitCode=report.status==='suspect'?2:1;
  console.log('V771 Ergebnis:',report.status,'–',assessment.totalCycles,'Zyklen,',assessment.transitions,'Avatar/Bühnen-Kombinationen.');
 }catch(error){report.status='blocked';report.error=String(error?.message||error);process.exitCode=1;console.error('V771 BLOCKED:',report.error);}
 finally{
  report.durationSeconds??=Math.round((Date.now()-startedAt)/1000);
  try{fs.mkdirSync(path.dirname(out),{recursive:true});fs.writeFileSync(out,JSON.stringify(report,null,2)+'\n');console.log('JSON:',out);}catch(err){console.error(err);process.exitCode=1;}
  for(const task of pending.values())clearTimeout(task.timer);
  try{ws?.close();}catch{}
  if(chrome)chrome.kill('SIGKILL');
  if(dir)try{fs.rmSync(dir,{recursive:true,force:true,maxRetries:3});}catch{}
 }
}
if(require.main===module)main().catch(error=>{console.error(error);process.exitCode=1;});
module.exports={numberOption};
