'use strict';
/** V590 local genuine GLB Chromium benchmark via DevTools, no synthetic frames.
 * Requires a RUNNING Sonic Display Next.js server and GLBs served from its local origin.
 * Example: npm run benchmark:v590:visual -- --model=/avatars/performer.glb --original=0 --following=1 --seconds=12
 */
const fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const {spawn}=require('node:child_process');const {setTimeout:delay}=require('node:timers/promises');
const {summarizeFrames}=require('./v580-benchmark-metrics.cjs');
const {analyzePngs,contentCoverage}=require('./v590-visual-image.cjs');
const {assessFraming}=require('./v590-visual-geometry.cjs');
const {renderVisualReportV590}=require('./v590-visual-report.cjs');
const argv=process.argv.slice(2),option=(name,defaultValue)=>argv.find(x=>x.startsWith(`--${name}=`))?.slice(name.length+3)??defaultValue;
const url=option('url','http://127.0.0.1:3000'),model=option('model',''),motion=option('motion','');
const original=Number(option('original','0')),following=Number(option('following','1'));
const times=option('times','0.1,0.5,1.1').split(',').map(Number),seconds=Number(option('seconds','12'));
const out=path.resolve(option('out','artifacts/v590/visual'));
const chromium=option('chromium',process.env.CHROMIUM_PATH||'chromium');
const headless=!argv.includes('--headed');const isPi=process.platform==='linux'&&['arm','arm64'].includes(process.arch);
const report={format:'sonic-v590-real-concert-visual-benchmark',capturedAt:new Date().toISOString(),status:'blocked',
 platform:process.platform,architecture:process.arch,piCandidate:isPi,mode:headless?'headless-diagnostic':'visible-browser',
 source:{url,model,motion:motion||null,original,following,times},screenshots:[],comparisons:[],warnings:[],
 limitations:['Screenshots are of actual GLB WebGL canvas in a local Chromium session, not proof of artistic quality.',
  'rAF frame timing is browser scheduling, not GPU frame time, and cannot establish Pi thermals.',
  'A standalone preview does not reproduce the entire live Spotify/lyrics/stage scene.',
  'External motion retargeting runs in a temporary Chromium profile: saved per-model browser calibration is NOT imported.',
  'Headless screenshots are not physical touchscreen/display validation. Human GLB review is still required.']};
const safeOrigin=u=>{try{const x=new URL(u);return ['http:','https:'].includes(x.protocol)&&['localhost','127.0.0.1','[::1]'].includes(x.hostname)&&!x.username&&!x.password&&!x.search&&!x.hash&&(x.pathname==='/'||x.pathname==='');}catch{return false;}};
const safeGlb=p=>{if(!p||!p.startsWith('/')||p.startsWith('//')||p.includes('\\')||p.includes('?')||p.includes('#'))return false;
 try{const d=decodeURIComponent(p);return d.startsWith('/')&&!d.startsWith('//')&&!d.includes('\\')&&!d.split('/').some(s=>s==='..'||s==='.')&&d.toLowerCase().endsWith('.glb')&&!/[\x00-\x1f]/.test(d);}catch{return false;}};
const passInt=n=>Number.isInteger(n)&&n>=0;
async function main(){let child,dir,ws;let pending=new Map(),next=0;
 try{
  if(!safeOrigin(url)||!safeGlb(model)||(motion&&!safeGlb(motion)))throw Error('Use a loopback URL and only same-origin /path/*.glb sources.');
  if(!passInt(original)||!passInt(following)||original===following)throw Error('Specify distinct nonnegative --original and --following clip indices.');
  if(!Number.isInteger(seconds)||seconds<5||seconds>600)throw Error('Use --seconds=5..600 (measured actual requestAnimationFrame ticks).');
  if(!times.length||times.length>12||times.some(t=>!Number.isFinite(t)||t<0||t>600))throw Error('Use 1..12 valid --times=0.1,0.5,1.1 in seconds.');
  if(!globalThis.WebSocket)throw Error('Node.js 22+ WebSocket support required.');
  const sceneUrl=`${url.replace(/\/$/,'')}/benchmark/v590?model=${encodeURIComponent(model)}${motion?`&motion=${encodeURIComponent(motion)}`:''}`;
  const ctrl=new AbortController(),abort=setTimeout(()=>ctrl.abort(),12000);
  try{const response=await fetch(sceneUrl,{signal:ctrl.signal});if(!response.ok)throw Error(`Benchmark page HTTP ${response.status}`);}finally{clearTimeout(abort);}
  dir=fs.mkdtempSync(path.join(os.tmpdir(),'sonic-v590-'));
  child=spawn(chromium,[...(headless?['--headless=new']:[]),'--no-sandbox','--disable-dev-shm-usage','--no-first-run',
    '--disable-background-timer-throttling','--disable-renderer-backgrounding','--remote-debugging-port=0',`--user-data-dir=${dir}`,'about:blank'],{stdio:'ignore'});
  child.on('error',()=>{});
  let port=0;for(let i=0;i<140;i++){const f=path.join(dir,'DevToolsActivePort');if(fs.existsSync(f)){port=Number(fs.readFileSync(f,'utf8').split('\n')[0]);if(port)break;}await delay(100);}
  if(!port)throw Error('Local Chromium did not start; supply --chromium=...');
  const tabs=await(await fetch(`http://127.0.0.1:${port}/json`)).json(),tab=tabs.find(t=>t.type==='page'&&t.webSocketDebuggerUrl);
  if(!tab)throw Error('No Chromium page tab');
  ws=new WebSocket(tab.webSocketDebuggerUrl);
  await new Promise((resolve,reject)=>{ws.addEventListener('open',resolve,{once:true});ws.addEventListener('error',reject,{once:true});});
  ws.addEventListener('message',event=>{try{const m=JSON.parse(event.data),p=pending.get(m.id);if(!p)return;
   pending.delete(m.id);clearTimeout(p.timer);m.error?p.reject(Error(JSON.stringify(m.error))):p.resolve(m.result);}catch{}});
  const send=(method,params={},maxWait=30000)=>new Promise((resolve,reject)=>{const id=++next,timer=setTimeout(()=>{pending.delete(id);reject(Error(`CDP ${method} timeout`));},maxWait);
   pending.set(id,{resolve,reject,timer});ws.send(JSON.stringify({id,method,params}));});
  const evaluate=async expression=>{const r=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true},Math.max(30000,(seconds+30)*1000));
   if(r.exceptionDetails)throw Error(r.exceptionDetails.text||'Runtime JS exception');return r.result?.value;};
  await send('Page.enable');await send('Runtime.enable');
  await send('Emulation.setDeviceMetricsOverride',{width:1280,height:820,deviceScaleFactor:1,mobile:false});
  await send('Page.navigate',{url:sceneUrl});
  let state=null,rect=null;for(let i=0;i<140;i++){
   const v=await evaluate(`(()=>({state:window.__sonicV590?.state?.()??null,status:document.querySelector('[data-v590-status]')?.getAttribute('data-v590-status'),
    rect:(()=>{const c=document.querySelector('[data-v590-scene] canvas');if(!c)return null;const r=c.getBoundingClientRect();return {x:r.left,y:r.top,width:r.width,height:r.height,backingWidth:c.width,backingHeight:c.height}})()}))()`);
   state=v.state;rect=v.rect;if(v.status==='blocked')throw Error('GLB scene rejected the provided local model or motion');
   if(state?.error)throw Error(state.error);
   if(state?.ready&&state?.appliedGeneration>=0&&rect?.width>0&&rect?.backingWidth>0)break;
   await delay(180);
  }
  if(!state?.ready||!rect?.backingWidth)throw Error('No ready REAL animated GLB stage within 25 seconds; check local file and browser console.');
  if(!state.webglVersion||state.meshes<1||!state.clipNames?.length)throw Error('No real WebGL GLB animation loaded.');
  if(original>=state.clipNames.length||following>=state.clipNames.length)throw Error(`Clips unavailable: GLB contains ${state.clipNames.length} clips`);
  for(const ix of [original,following])if(times.some(t=>t>=state.clipDurations[ix]))throw Error(`Clip ${ix} shorter than requested --times. Durations: ${state.clipDurations}`);
  report.browser={userAgent:await evaluate('navigator.userAgent'),webglVersion:state.webglVersion,meshes:state.meshes,
   skinnedMeshes:state.skinnedMeshes,clipNames:state.clipNames,clipDurations:state.clipDurations,
   canvas:{width:rect.backingWidth,height:rect.backingHeight}};
  fs.mkdirSync(out,{recursive:true});
  const shotBuffers=new Map();
  for(const [clipRole,clipIndex] of [['original',original],['following',following]]){
   for(let i=0;i<times.length;i++){
    const time=times[i];const accepted=await evaluate(`window.__sonicV590.seek(${clipIndex},${time})`);
    if(!accepted)throw Error(`Scene rejected clip ${clipIndex} seek ${time}`);
    let frame=null;for(let attempt=0;attempt<40;attempt++){
     frame=await evaluate(`window.__sonicV590.state()`);
     if(frame?.appliedGeneration===frame?.generation&&frame?.clipIndex===clipIndex&&frame?.seconds===time)break;
     await delay(80);
    }
    if(!frame||frame.appliedGeneration!==frame.generation)throw Error('GLB pose did not render at requested timestamp.');
    // Wait for two real compositor frames after the Three.js mixer applied seek.
    await evaluate('new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(()=>resolve(true))))');
    rect=await evaluate(`(()=>{const r=document.querySelector('[data-v590-scene] canvas').getBoundingClientRect();return {x:r.left,y:r.top,width:r.width,height:r.height}})()`);
    const capture=await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false,
     clip:{x:rect.x,y:rect.y,width:rect.width,height:rect.height,scale:1}});
    const buffer=Buffer.from(capture.data,'base64'),name=`${clipRole}-clip${clipIndex}-t${String(i).padStart(2,'0')}.png`;
    const file=path.join(out,name);fs.writeFileSync(file,buffer);shotBuffers.set(`${clipRole}:${i}`,buffer);
    const framing=assessFraming(frame.bounds),coverage=contentCoverage(buffer);
    const shot={clipRole,clipIndex,clipName:frame.clipNames[clipIndex],seconds:time,file:name,
     bounds:frame.bounds,framing,coverage,drawCalls:frame.drawCalls,triangles:frame.triangles};
    report.screenshots.push(shot);
    if(framing.status!=='within-frame')report.warnings.push(`${name}: framing ${framing.status}`);
    if(coverage.nonBackgroundFraction<.01)report.warnings.push(`${name}: screenshot may be empty`);
   }
  }
  for(const role of ['original','following'])for(let i=1;i<times.length;i++){
   const prior=shotBuffers.get(`${role}:${i-1}`),current=shotBuffers.get(`${role}:${i}`);
   const progression=analyzePngs(prior,current);
   if(progression.changedPixelFraction<.004)report.warnings.push(`${role}: between ${times[i-1]}s and ${times[i]}s motion looks nearly identical (verify animation channels).`);
  }
  for(let i=0;i<times.length;i++){
   const diff=analyzePngs(shotBuffers.get(`original:${i}`),shotBuffers.get(`following:${i}`));
   report.comparisons.push({seconds:times[i],original:`original-clip${original}-t${String(i).padStart(2,'0')}.png`,
    following:`following-clip${following}-t${String(i).padStart(2,'0')}.png`,...diff,
    note:'Differences show pixel changes, not whether a choreographic transition is good.'});
   if(diff.changedPixelFraction<.004)report.warnings.push(`t=${times[i]}s: clips appear nearly identical`);
  }
  // rAF frame pacing while the genuinely rendered GLB scene is visible; not GPU timings.
  const observation=await evaluate(`new Promise(resolve=>{const samples=[],longTasks=[];let previous=0,losses=0;
    const canvas=document.querySelector('[data-v590-scene] canvas');
    const onLost=()=>{losses++};canvas.addEventListener('webglcontextlost',onLost);
    let observer;try{observer=new PerformanceObserver(l=>{for(const t of l.getEntries())longTasks.push(t.duration)});observer.observe({entryTypes:['longtask']});}catch{}
    const started=performance.now(),stopAt=started+${seconds*1000};
    function frame(t){if(previous&&t>previous)samples.push(t-previous);previous=t;
     if(t<stopAt){requestAnimationFrame(frame);return;}
     observer?.disconnect();canvas.removeEventListener('webglcontextlost',onLost);
     resolve({samples,elapsedMs:performance.now()-started,longTaskCount:longTasks.length,
       longestTaskMs:Math.max(0,...longTasks),contextLosses:losses,hidden:document.hidden});}
    requestAnimationFrame(frame);
   })`);
  const stats=summarizeFrames(observation.samples,{targetFps:30});
  if(stats.status!=='measured'||observation.hidden)throw Error('No genuine visible-frame benchmark was measured.');
  report.frameTiming={...stats,elapsedMs:observation.elapsedMs,longTaskCount:observation.longTaskCount,
   longestTaskMs:observation.longestTaskMs,contextLosses:observation.contextLosses};
  report.status='measured-needs-human-review';
  console.log(`V590: ${report.screenshots.length} GLB screenshots, ${report.comparisons.length} pixel comparisons, ${stats.averageFps} rAF/s, ${report.warnings.length} warnings (NOT visual sign-off).`);
 }catch(error){report.error=String(error?.message||error);console.error('V590 BLOCKED:',report.error);}
 finally{
  fs.mkdirSync(out,{recursive:true});fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(report,null,2)+'\n');
  if(ws)try{ws.close();}catch{}for(const q of pending.values())clearTimeout(q.timer);
  if(child)child.kill('SIGKILL');if(dir)try{fs.rmSync(dir,{recursive:true,force:true});}catch{}
 }
 if(report.status!=='measured-needs-human-review')process.exitCode=1;
}
if(require.main===module)main().catch(e=>{console.error(e);process.exitCode=1;});
module.exports={safeOrigin,safeGlb};
