'use strict';
/** Real Chromium/CDP leak investigation. Requires running local Next.js, not an offline/mock test.
 * Usage: node scripts/v767-gpu-memory-browser.cjs --url=http://127.0.0.1:3000 --cycles=30 --model=/my.glb
 */
const fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const {spawn}=require('node:child_process');const {setTimeout:delay}=require('node:timers/promises');
const args=process.argv.slice(2);
const opt=(key,fallback)=>args.find(s=>s.startsWith('--'+key+'='))?.slice(key.length+3)??fallback;
const origin=opt('url','http://127.0.0.1:3000');
const cycles=Math.max(8,Math.min(100,Number(opt('cycles','30'))));
const browser=opt('chromium',process.env.CHROMIUM_PATH||'chromium');
const models=args.filter(s=>s.startsWith('--model=')).map(s=>s.slice(8));
const out=path.resolve(opt('out','artifacts/v767/gpu-memory.json'));
const report={format:'sonic-v767-browser-run',mode:'real-webgl',status:'blocked',generatedAt:new Date().toISOString(),
 limitations:['renderer.info.memory measures object counts, NOT VRAM bytes.','A dedicated stage-and-avatar harness is not the entire concert/show runtime.',
 'No stable test proves the absence of all memory leaks.']};
const isLoopback=u=>{
 try{const v=new URL(u);return ['localhost','127.0.0.1','[::1]'].includes(v.hostname)&&['http:','https:'].includes(v.protocol)&&!v.username&&!v.password;}catch{return false;}
};
const validModel=value=>{
 try{const v=new URL(value,origin);return v.origin===new URL(origin).origin&&/\.(glb|gltf)$/i.test(v.pathname);}catch{return false;}
};
async function main(){
 let chrome,dir,ws;const pending=new Map();let seq=0;
 try{
  if(!isLoopback(origin))throw Error('Nur lokale Loopback-URLs erlaubt');
  if(models.some(v=>!validModel(v)))throw Error('Modelle müssen gleichursprüngliche .glb/.gltf-URLs sein');
  const url=new URL('/diagnostics/gpu-memory',origin);
  url.searchParams.set('gpuLeakV767','1');for(const model of models)url.searchParams.append('model',model);
  const ready=await fetch(url.origin,{signal:AbortSignal.timeout(8000)}).catch(()=>null);
  if(!ready)throw Error('Keine lokale Sonic-Display-App erreichbar (npm run dev/start erforderlich)');
  dir=fs.mkdtempSync(path.join(os.tmpdir(),'sonic-v767-chrome-'));
  chrome=spawn(browser,['--headless=new','--no-sandbox','--disable-dev-shm-usage','--enable-unsafe-swiftshader',
   '--no-first-run','--no-default-browser-check','--remote-debugging-port=0',`--user-data-dir=${dir}`,'about:blank'],{stdio:'ignore'});
  chrome.on('error',()=>{});
  const wait=async(check,description,timeout=25000)=>{
   const started=Date.now();while(Date.now()-started<timeout){const result=await check();if(result)return result;await delay(220);}
   throw Error(`${description}: Zeitüberschreitung`);
  };
  const port=await wait(()=>fs.existsSync(path.join(dir,'DevToolsActivePort'))?Number(fs.readFileSync(path.join(dir,'DevToolsActivePort'),'utf8').split('\n')[0]):0,'Chromium');
  const tabs=await (await fetch(`http://127.0.0.1:${port}/json`)).json();const tab=tabs.find(t=>t.type==='page'&&t.webSocketDebuggerUrl);
  if(!tab)throw Error('Kein Chromium-CDP-Tab');
  ws=new WebSocket(tab.webSocketDebuggerUrl);
  await new Promise((resolve,reject)=>{ws.addEventListener('open',resolve,{once:true});ws.addEventListener('error',reject,{once:true});});
  ws.addEventListener('message',e=>{try{const p=JSON.parse(e.data),task=pending.get(p.id);if(!task)return;
   pending.delete(p.id);clearTimeout(task.timer);p.error?task.reject(Error(p.error.message)):task.resolve(p.result);}catch{}});
  const send=(method,params={})=>new Promise((resolve,reject)=>{const id=++seq;
   const timer=setTimeout(()=>{pending.delete(id);reject(Error('CDP '+method+' timeout'));},20000);
   pending.set(id,{resolve,reject,timer});ws.send(JSON.stringify({id,method,params}));});
  const evaluate=async expr=>{const data=await send('Runtime.evaluate',{expression:expr,returnByValue:true,awaitPromise:true});
   if(data.exceptionDetails)throw Error(data.exceptionDetails.text||'Browser exception');return data.result?.value;};
  await send('Runtime.enable');await send('Page.enable');
  await send('Emulation.setDeviceMetricsOverride',{width:1280,height:800,deviceScaleFactor:1,mobile:false});
  const nav=await send('Page.navigate',{url:url.href});if(nav.errorText)throw Error(nav.errorText);
  await wait(()=>evaluate('document.readyState==="complete" && !!window.__sonicV767 && !!document.querySelector("canvas")'),'React/Canvas bereit',60000);
  const started=await evaluate(`(()=>{window.__v767Run={status:'running'};window.__sonicV767.run(${cycles}).then(result=>window.__v767Run={status:'done',result}).catch(e=>window.__v767Run={status:'failed',error:String(e?.message||e)});return true;})()`);
  if(!started)throw Error('Test konnte nicht gestartet werden');
  const state=await wait(async()=>{const x=await evaluate('window.__v767Run');return x?.status!=='running'?x:null;},'GPU-Check',Math.max(120000,cycles*10000));
  if(state.status!=='done')throw Error(state.error||'Browser-Stresstest fehlgeschlagen');
  const data=state.result;
  if(data?.format!=='sonic-v767-gpu-memory'||data.cycles!==cycles||data.samples?.length<cycles*12||data.assessment?.comparisons!==cycles)
   throw Error('Nicht genügend reale GPU-Messpunkte');
  if(data.samples.some(s=>s.contextLost||s.geometries<0||s.textures<0||s.drawCalls<0))throw Error('Ungültiger Renderer oder Kontextverlust');
  if(!data.samples.some(s=>s.drawCalls>0))throw Error('Keine tatsächlichen GPU-Draw-Calls');
  report.status=data.status;report.harness=data;report.browser=await evaluate('({userAgent:navigator.userAgent,webglCanvases:document.querySelectorAll("canvas").length,hidden:document.hidden})');
  console.log(`V767 reale GPU-Messung: ${report.status}; ${data.samples.length} Samples; ${data.assessment.comparisons} Ankerpunkte. Modelle: ${models.length}.`);
  if(report.status!=='stable')process.exitCode=1;
 }catch(error){report.status='blocked';report.error=String(error?.message||error);process.exitCode=1;console.error('V767 BLOCKED:',report.error);}
 finally{
  try{fs.mkdirSync(path.dirname(out),{recursive:true});fs.writeFileSync(out,JSON.stringify(report,null,2)+'\n');console.log('JSON:',out);}catch(error){console.error(error);process.exitCode=1;}
  for(const task of pending.values())clearTimeout(task.timer);
  if(ws)try{ws.close();}catch{}
  if(chrome)chrome.kill('SIGKILL');if(dir)try{fs.rmSync(dir,{recursive:true,force:true,maxRetries:2});}catch{}
 }
}
if(require.main===module)main().catch(e=>{console.error(e);process.exitCode=1;});
module.exports={isLoopback,validModel};
