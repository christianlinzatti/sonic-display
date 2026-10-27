'use strict';
/** V580 – REAL local Chromium WebGL workload benchmark on the measured machine.
 * Run on Raspberry Pi (Node arm/arm64 Linux) against an already running Sonic Display.
 * The script never synthesizes FPS and never silently calls a desktop a Pi.
 *   node scripts/v580-pi-benchmark.cjs --url=http://127.0.0.1:3000/ --seconds=120 --out=artifacts/v580/pi
 */
const fs=require('node:fs');
const os=require('node:os');
const path=require('node:path');
const {spawn}=require('node:child_process');
const {setTimeout:delay}=require('node:timers/promises');
const {summarizeFrames}=require('./v580-benchmark-metrics.cjs');
const argv=process.argv.slice(2), option=(name,backup)=>argv.find(x=>x.startsWith(`--${name}=`))?.slice(name.length+3)??backup;
const allowedDesktop=argv.includes('--allow-desktop');
const url=option('url','http://127.0.0.1:3000/'),out=path.resolve(option('out','artifacts/v580/pi'));
const seconds=Number(option('seconds','120')),chromium=option('chromium',process.env.CHROMIUM_PATH||'chromium');
const expectedStage=option('expect-selector','.three-avatar-stage');
const isPi=process.platform==='linux'&&['arm','arm64'].includes(process.arch);
// A physical Pi should benchmark a visible Chromium window / actual display compositor.
const headless=argv.includes('--headless')||(!isPi&&!argv.includes('--headed'));
const targetFps=Number(option('target-fps','30'));
const timeout=Math.max(30000,Math.min(7350000,(seconds+40)*1000));
const report={kind:'real-browser-benchmark',version:'v580',platform:process.platform,architecture:process.arch,
 hardware:isPi?'linux-arm-pi-candidate':'non-pi',browserMode:headless?'headless-diagnostic':'visible-browser',
 url,requestedSeconds:seconds,targetFps,
 collectedAt:new Date().toISOString(),status:'blocked',limitations:[
  'rAF timing is not GPU utilization or proof of correct animation, audio/lyrics sync or lip movements.',
  'Node arm/arm64 on Linux suggests Pi-class hardware but does not identify the board model.',
  'Headless Chrome results, if requested, are diagnostic only and not a full kiosk/display benchmark.',
  'Measured graphics workload must be verified manually with real GLBs, lyrics and music; thermal data is not collected.'
 ]};
const safeUrl=value=>{try{const u=new URL(value);return ['http:','https:'].includes(u.protocol)&&
 ['localhost','127.0.0.1','[::1]'].includes(u.hostname);}catch{return false;}};
async function main(){
 let dir,child,ws;const pending=new Map();let next=0;
 try{
  if(!Number.isFinite(seconds)||seconds<10||seconds>7200||!Number.isFinite(targetFps)||targetFps<1||targetFps>240)
   throw Error('Use --seconds=10..7200 and --target-fps=1..240');
  if(!safeUrl(url))throw Error('Only locally hosted application URLs are supported.');
  if(!expectedStage.trim())throw Error('A real stage selector is required.');
  if(!isPi&&!allowedDesktop)throw Error('This is not a Linux ARM device. Use --allow-desktop for a DESKTOP smoke benchmark (never Pi evidence).');
  if(!globalThis.WebSocket)throw Error('Node >=22 WebSocket is required.');
  try{fs.rmSync(out+'.png',{force:true});}catch{}
  const health=new AbortController();const abort=setTimeout(()=>health.abort(),7000);
  try{const response=await fetch(url,{signal:health.signal});if(!response.ok)throw Error(`Application HTTP ${response.status}`);}finally{clearTimeout(abort);}
  dir=fs.mkdtempSync(path.join(os.tmpdir(),'sonic-v580-'));
  child=spawn(chromium,[...(headless?['--headless=new']:[]),'--no-sandbox','--disable-dev-shm-usage','--no-first-run',
   '--remote-debugging-port=0',`--user-data-dir=${dir}`,'about:blank'],{stdio:'ignore'});
  child.on('error',()=>{});
  const started=Date.now();let port=0;
  while(Date.now()-started<20000){const file=path.join(dir,'DevToolsActivePort');
    if(fs.existsSync(file)){port=Number(fs.readFileSync(file,'utf8').split('\n')[0]);if(port>0)break;}await delay(120);}
  if(!port)throw Error('Local Chromium did not start (check --chromium=path)');
  const targets=await(await fetch(`http://127.0.0.1:${port}/json`)).json();
  const tab=targets.find(x=>x.type==='page'&&x.webSocketDebuggerUrl);
  if(!tab)throw Error('No Chromium page target');
  ws=new WebSocket(tab.webSocketDebuggerUrl);
  await new Promise((resolve,reject)=>{ws.addEventListener('open',resolve,{once:true});ws.addEventListener('error',reject,{once:true});});
  ws.addEventListener('message',event=>{try{const message=JSON.parse(event.data);const q=pending.get(message.id);
   if(!q)return;pending.delete(message.id);clearTimeout(q.timer);
   message.error?q.reject(Error(JSON.stringify(message.error))):q.resolve(message.result);}catch{}});
  const send=(method,params={},maxMs=timeout)=>new Promise((resolve,reject)=>{
    const id=++next,timer=setTimeout(()=>{pending.delete(id);reject(Error(`CDP ${method} timed out`));},maxMs);
    pending.set(id,{timer,resolve,reject});ws.send(JSON.stringify({id,method,params}));
  });
  const evalJs=async expression=>{const r=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});
    if(r.exceptionDetails)throw Error(r.exceptionDetails.text);return r.result?.value;};
  await send('Page.enable');await send('Runtime.enable');
  await send('Emulation.setDeviceMetricsOverride',{width:1280,height:800,deviceScaleFactor:1,mobile:false});
  await send('Page.navigate',{url});
  const readyAt=Date.now();let check;
  do{check=await evalJs(`({ready:document.readyState==='complete',title:document.title,
   canvases:document.querySelectorAll('canvas').length})`);
   if(check.ready&&check.canvases>0)break;await delay(250);}while(Date.now()-readyAt<30000);
  if(!check?.ready||!check.canvases)throw Error('No loaded Sonic Display canvas; open a real stage in the app.');
  await delay(1500);
  if(!await evalJs(`!!document.querySelector(${JSON.stringify(expectedStage)})`))
    throw Error(`Expected real stage ${expectedStage} not found. Enable avatar visualizer mode.`);
  const gl=await evalJs(`(()=>{let ready=0,version='';for(const c of document.querySelectorAll('canvas')){
    const g=c.getContext('webgl2')||c.getContext('webgl');if(g&&g.drawingBufferWidth>0){ready++;version=g.getParameter(g.VERSION);}}
    return {ready,version,hidden:document.hidden,userAgent:navigator.userAgent,
      displayWidth:screen.width,displayHeight:screen.height,pixelRatio:devicePixelRatio};})()`);
  if(!gl.ready||gl.hidden)throw Error('No visible WebGL drawing buffer; benchmark refused.');
  const expression=`new Promise(resolve=>{
   const samples=[],longTasks=[];let losses=0,starts=performance.now(),previous=0;
   const onLost=()=>{losses++};addEventListener('webglcontextlost',onLost);
   let observer=null;
   try{observer=new PerformanceObserver(list=>{for(const item of list.getEntries())longTasks.push(item.duration)});
     observer.observe({entryTypes:['longtask']});}catch{}
   let stop=false;const timeout=setTimeout(()=>{stop=true},${Math.round(seconds*1000)});
   const frame=t=>{if(previous&&t>previous&&samples.length<${Math.ceil(seconds*240)})samples.push(t-previous);
      previous=t;if(!stop){requestAnimationFrame(frame);return;}
      clearTimeout(timeout);observer?.disconnect();removeEventListener('webglcontextlost',onLost);
      resolve({samples,longTaskCount:longTasks.length,maxLongTaskMs:longTasks.reduce((a,b)=>Math.max(a,b),0),
       elapsedSeconds:(performance.now()-starts)/1000,contextLosses:losses,
       heapUsedBytes:performance.memory?.usedJSHeapSize??null,visibility:document.visibilityState});};
   requestAnimationFrame(frame);
  })`;
  const observation=await evalJs(expression);
  const stats=summarizeFrames(observation.samples,{targetFps});
  if(stats.status!=='measured')throw Error('Not enough real animation frames for a report.');
  const {samples,...rest}=observation;
  report.browser={...gl,canvasCount:check.canvases,title:check.title,stageSelector:expectedStage};
  report.measurement={...rest,...stats};
  report.status='measured';
  const png=await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false},20000);
  fs.mkdirSync(path.dirname(out),{recursive:true});fs.writeFileSync(out+'.png',Buffer.from(png.data,'base64'));
  console.log(`V580 ${isPi?'ARM':'DESKTOP'} ${headless?'HEADLESS DIAGNOSTIC':'VISIBLE CHROMIUM'} measured: ${stats.averageFps} rAF/s, p95 ${stats.p95FrameMs} ms (${stats.frames} frames)`);
 }catch(error){report.error=String(error.message||error);console.error('V580 BLOCKED:',report.error);}
 finally{fs.mkdirSync(path.dirname(out),{recursive:true});fs.writeFileSync(out+'.json',JSON.stringify(report,null,2)+'\n');
  if(ws)try{ws.close();}catch{}for(const q of pending.values())clearTimeout(q.timer);
  if(child)child.kill('SIGKILL');if(dir)try{fs.rmSync(dir,{recursive:true,force:true});}catch{}}
 if(report.status!=='measured')process.exitCode=1;
}
if(require.main===module)main().catch(e=>{console.error(e);process.exitCode=1});
module.exports={safeUrl};
