'use strict';
/** Real Chromium/CDP measurement of the V776 benchmark fixture. Requires a running LOCAL Next.js server.
 * Usage: node scripts/v776-stage-benchmark-browser.cjs --url=http://127.0.0.1:3000 --label=V776 --out=artifacts/v776/current.json
 */
const fs=require('node:fs'),path=require('node:path'),os=require('node:os');
const {spawn}=require('node:child_process');const {setTimeout:pause}=require('node:timers/promises');
const arg=(k,def)=>process.argv.find(x=>x.startsWith('--'+k+'='))?.slice(k.length+3)??def;
const numeric=(k,def,min,max)=>{const n=Number(arg(k,String(def)));if(!Number.isFinite(n)||n<min||n>max||!Number.isInteger(n))throw Error(k+' außerhalb '+min+'–'+max);return n;};
const localUrl=s=>{try{const u=new URL(s);return ['localhost','127.0.0.1','[::1]'].includes(u.hostname)&&['http:','https:'].includes(u.protocol)&&!u.username&&!u.password;}catch{return false;}};
async function run(){
 let chrome,dir,ws;const pending=new Map();let seq=0;
 const out=path.resolve(arg('out','artifacts/v776/current.json'));
 const record={status:'blocked',source:'real-browser',message:'Unbekannt',createdAt:new Date().toISOString()};
 try{
  const root=arg('url','http://127.0.0.1:3000');if(!localUrl(root))throw Error('Ausschließlich lokale URLs erlaubt');
  const label=arg('label','V776').slice(0,80),passes=numeric('passes',2,1,5),warmupFrames=numeric('warmup',60,30,240),sampleFrames=numeric('frames',240,90,1200);
  const u=new URL('/diagnostics/stage-benchmark',root);u.searchParams.set('stageBenchV776','1');
  const check=await fetch(u.origin,{signal:AbortSignal.timeout(7000)}).catch(()=>null);
  if(!check||!check.ok)throw Error('Next.js-Server nicht erreichbar: '+u.origin);
  dir=fs.mkdtempSync(path.join(os.tmpdir(),'sonic-v776-chromium-'));
  const executable=arg('chromium',process.env.CHROMIUM_PATH||'chromium');
  const flags=['--headless=new','--no-sandbox','--disable-dev-shm-usage','--no-first-run','--no-default-browser-check',
    '--disable-background-timer-throttling','--disable-renderer-backgrounding',
    '--remote-debugging-port=0',`--user-data-dir=${dir}`];
  if(process.argv.includes('--software'))flags.push('--enable-unsafe-swiftshader');
  chrome=spawn(executable,[...flags,'about:blank'],{stdio:'ignore'});chrome.on('error',()=>{});
  const wait=async(fn,label,timeout=30000)=>{const start=Date.now();while(Date.now()-start<timeout){const v=await fn();if(v)return v;await pause(180);}throw Error(label+': Zeitüberschreitung');};
  const port=await wait(()=>fs.existsSync(path.join(dir,'DevToolsActivePort'))?Number(fs.readFileSync(path.join(dir,'DevToolsActivePort'),'utf8').split('\n')[0]):0,'Chromium',30000);
  const tabs=await (await fetch(`http://127.0.0.1:${port}/json`)).json();const tab=tabs.find(t=>t.type==='page'&&t.webSocketDebuggerUrl);
  if(!tab)throw Error('CDP-Seite fehlt');ws=new WebSocket(tab.webSocketDebuggerUrl);
  await new Promise((ok,bad)=>{ws.addEventListener('open',ok,{once:true});ws.addEventListener('error',bad,{once:true});});
  ws.addEventListener('message',ev=>{try{const msg=JSON.parse(ev.data);if(!pending.has(msg.id))return;
    const t=pending.get(msg.id);pending.delete(msg.id);clearTimeout(t.timer);
    msg.error?t.reject(Error(msg.error.message)):t.resolve(msg.result);}catch{}});
  const send=(method,params={})=>new Promise((resolve,reject)=>{const id=++seq;
    const timer=setTimeout(()=>{pending.delete(id);reject(Error('CDP timeout: '+method));},20000);
    pending.set(id,{resolve,reject,timer});ws.send(JSON.stringify({id,method,params}));});
  const evalJs=async(expression)=>{const x=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:false});
    if(x.exceptionDetails)throw Error(x.exceptionDetails.text||'Browser JavaScript error');return x.result?.value;};
  await send('Runtime.enable');await send('Page.enable');
  await send('Emulation.setDeviceMetricsOverride',{width:1280,height:800,deviceScaleFactor:1,mobile:false});
  const nav=await send('Page.navigate',{url:u.href});if(nav.errorText)throw Error(nav.errorText);
  await wait(()=>evalJs('document.readyState==="complete" && !!window.__sonicV776 && !!document.querySelector("canvas")'),
    'React Canvas bereit',60000);
  const opts=JSON.stringify({label,passes,warmupFrames,sampleFrames});
  await evalJs(`(()=>{window.__stageV776Run={status:'running'};window.__sonicV776.run(${opts})
    .then(result=>window.__stageV776Run={status:'done',result})
    .catch(error=>window.__stageV776Run={status:'error',message:String(error?.message||error)});return true})()`);
  const expectedMs=6*(passes+2)*(warmupFrames+sampleFrames)*1000/20;
  const state=await wait(async()=>{const v=await evalJs('({status:window.__stageV776Run?.status,message:window.__stageV776Run?.message})');
    return v?.status&&v.status!=='running'?v:null;},'Bühnenbenchmark',Math.max(180000,Math.min(1800000,expectedMs*3)));
  if(state.status!=='done')throw Error(state.message||'Unbekannter Browserfehler');
  const result=await evalJs('window.__stageV776Run.result');
  if(result?.format!=='sonic-stage-benchmark-v776'||result.scenes?.length!==6||result.scenes?.some(x=>x.frames<sampleFrames-3))
    throw Error('Unvollständige echte Bildmessungen');
  if(result.scenes.some(x=>x.avgCalls<=0||x.fps<=0))throw Error('Keine validen Draw Calls / FPS');
  record.status='ok';record.message='Gemessene Bildzeiten und Renderer-Zähler';record.report=result;
  record.browser=await evalJs('({userAgent:navigator.userAgent,hidden:document.hidden,canvasCount:document.querySelectorAll("canvas").length})');
  if(record.browser.hidden||record.browser.canvasCount!==1)throw Error('Benchmark-Tab muss sichtbar sein und genau ein Canvas enthalten');
  console.log('V776 browser: six scenes, '+result.scenes.reduce((s,x)=>s+x.frames,0)+' frames, '+result.environment.renderer);
 }catch(error){record.status='blocked';record.message=String(error?.message||error);console.error('V776 BLOCKED:',record.message);process.exitCode=1;}
 finally{try{fs.mkdirSync(path.dirname(out),{recursive:true});fs.writeFileSync(out,JSON.stringify(record,null,2)+'\n');console.log('V776 JSON:',out)}catch(e){console.error(e);process.exitCode=1;}
  for(const t of pending.values())clearTimeout(t.timer);
  try{ws?.close()}catch{}if(chrome)chrome.kill('SIGKILL');if(dir)try{fs.rmSync(dir,{recursive:true,force:true,maxRetries:2})}catch{}
 }
}
if(require.main===module)run().catch(e=>{console.error(e);process.exitCode=1});
module.exports={localUrl,numeric};
