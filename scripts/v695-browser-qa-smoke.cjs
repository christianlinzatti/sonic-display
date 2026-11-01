'use strict';
/** V695: localhost-only REAL Chromium/CDP QA history reload test. --self-test is a labeled fixture, never product evidence. */
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),http=require('node:http');
const {spawn}=require('node:child_process');const {setTimeout:delay}=require('node:timers/promises');
const {localUrl}=require('./v695-release-quality-gate.cjs');
const argv=process.argv.slice(2), opt=(k,d)=>argv.find(x=>x.startsWith(`--${k}=`))?.slice(k.length+3)??d;
const fixture=argv.includes('--self-test'),url=opt('url','http://127.0.0.1:3000/'),chromium=opt('chromium',process.env.CHROMIUM_PATH||'chromium');
const out=path.resolve(opt('out','artifacts/v695/qa-browser'));
const historyKey='sonic-display:concert-qa-history:v694';
const archive={format:'sonic-v694-quality-history',schema:1,progress:{'v695-smoke:lyrics':'in-arbeit'},before:null,after:null,entries:[]};
const marker='v695-smoke:lyrics';
function fixtureHtml(){return `<!doctype html><html><meta charset="utf-8"><title>V695 Fixture – keine echte App</title><body><button class="v466-quality-toggle" onclick="document.querySelector('#qa').hidden=false;render()">QA</button><div id="qa" hidden><div data-v641-recorder="idle"></div><section class="v694-quality-history"><div class="v694-saved-tasks"></div></section></div><script>
function render(){const v=JSON.parse(localStorage.getItem(${JSON.stringify(historyKey)})||'null');document.querySelector('.v694-saved-tasks').textContent=v?.progress?.[${JSON.stringify(marker)}]?'${marker}: '+v.progress[${JSON.stringify(marker)}]:'(no QA data)'}</script></body></html>`;}
async function run(){
 let server,child,dir,ws;const pending=new Map();let nextId=0;
 const report={format:'sonic-v695-browser-qa',kind:fixture?'test-fixture':'application',status:'blocked',checkedAt:new Date().toISOString(),
  checks:{},limitations:['A fixture never validates Sonic Display React, GLB, vocals, lighting, lyrics or camera.',
   'Browser QA proof verifies local persistence and WebGL canvas presence, not objective artistic quality.']};
 try{
  try{fs.rmSync(out+'.png',{force:true});}catch{} // Never expose stale screenshots as fresh evidence.
  if(!fixture&&!localUrl(url))throw Error('Nur lokale Loopback-App-URLs erlaubt');
  let target=url;
  if(fixture){server=http.createServer((req,res)=>{res.writeHead(200,{'content-type':'text/html; charset=utf-8'});res.end(fixtureHtml());});
   await new Promise(r=>server.listen(0,'127.0.0.1',r));target=`http://127.0.0.1:${server.address().port}/`;}
  dir=fs.mkdtempSync(path.join(os.tmpdir(),'sonic-v695-chrome-'));
  child=spawn(chromium,['--headless=new','--no-sandbox','--disable-dev-shm-usage','--enable-unsafe-swiftshader','--no-first-run',
   '--no-default-browser-check','--remote-debugging-port=0',`--user-data-dir=${dir}`,'about:blank'],{stdio:'ignore'});
  child.on('error',()=>{});
  const wait=async(check,label,timeout=20000)=>{const start=Date.now();while(Date.now()-start<timeout){const value=await check();if(value)return value;await delay(140);}throw Error(`${label}: Zeitüberschreitung`);};
  const port=await wait(async()=>{const f=path.join(dir,'DevToolsActivePort');return fs.existsSync(f)?Number(fs.readFileSync(f,'utf8').split('\n')[0]):0;},'Chromium-Start');
  const tabs=await(await fetch(`http://127.0.0.1:${port}/json`,{signal:AbortSignal.timeout(6000)})).json();
  const tab=tabs.find(x=>x.type==='page'&&x.webSocketDebuggerUrl);if(!tab)throw Error('Chromium-CDP-Tab fehlt');
  ws=new WebSocket(tab.webSocketDebuggerUrl);
  await new Promise((resolve,reject)=>{ws.addEventListener('open',resolve,{once:true});ws.addEventListener('error',reject,{once:true});});
  ws.addEventListener('message',event=>{try{const p=JSON.parse(event.data);const entry=pending.get(p.id);if(!entry)return;
   pending.delete(p.id);clearTimeout(entry.timer);p.error?entry.reject(Error(p.error.message||'CDP Fehler')):entry.resolve(p.result);}catch{}});
  const call=(method,params={})=>new Promise((resolve,reject)=>{const id=++nextId;
   const timer=setTimeout(()=>{pending.delete(id);reject(Error(`CDP ${method} timeout`));},20000);
   pending.set(id,{resolve,reject,timer});ws.send(JSON.stringify({id,method,params}));});
  const evalJs=async(expression)=>{const r=await call('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});
   if(r.exceptionDetails)throw Error(r.exceptionDetails.text||'Browser JS Fehler');return r.result?.value;};
  await call('Runtime.enable');await call('Page.enable');
  await call('Emulation.setDeviceMetricsOverride',{width:1280,height:800,deviceScaleFactor:1,mobile:false});
  const navigate=async()=>{const nav=await call('Page.navigate',{url:target});if(nav.errorText)throw Error(`Chromium-Navigation blockiert: ${nav.errorText}`);
   await wait(()=>evalJs(`location.href.startsWith(${JSON.stringify(target)}) && document.readyState==='complete' && !!document.body`),'App geladen');};
  await navigate();
  if(!fixture){await wait(()=>evalJs(`!!document.querySelector('.v466-quality-toggle')`),'QA-Button in echter Anwendung',30000);}
  // Dedicated temporary Chromium profile. No existing user history or Spotify cookies are accessed.
  const seed=await evalJs(`(()=>{try{localStorage.setItem(${JSON.stringify(historyKey)},${JSON.stringify(JSON.stringify(archive))});return true}catch{return false}})()`);
  if(!seed)throw Error('localStorage im Chromium-Profil nicht verfügbar');
  await navigate(); // Real browser navigation/re-hydration, not just a JavaScript object mock.
  const clicked=await wait(()=>evalJs(`(()=>{const b=document.querySelector('.v466-quality-toggle');if(!b)return false;b.click();return true;})()`),'QA-Button nach Neustart');
  if(!clicked)throw Error('QA konnte nicht geöffnet werden');
  await wait(()=>evalJs(`!!document.querySelector('[data-v641-recorder]') && !!document.querySelector('.v694-quality-history')`),'QA-Dashboard V641/V694 sichtbar');
  const persisted=await wait(()=>evalJs(`(()=>{const el=document.querySelector('.v694-saved-tasks');return !!el && el.textContent.includes(${JSON.stringify(marker)}) && !!localStorage.getItem(${JSON.stringify(historyKey)})})()`),'Archiv-Aufgabenstatus nach Reload');
  const check=await evalJs(`(()=>{const canvas=[...document.querySelectorAll('canvas')];const gl=canvas.filter(c=>{try{const v=c.getContext('webgl2')||c.getContext('webgl');return !!v&&v.drawingBufferWidth>0&&v.drawingBufferHeight>0}catch{return false}});
   const a=JSON.parse(localStorage.getItem(${JSON.stringify(historyKey)}));
   return {qaButton:true,recorderVisible:!!document.querySelector('[data-v641-recorder]'),historyVisible:!!document.querySelector('.v694-quality-history'),
    savedTaskAfterReload:!!document.querySelector('.v694-saved-tasks')?.textContent.includes(${JSON.stringify(marker)}),
    historyStatus:a.progress[${JSON.stringify(marker)}],webglCanvasCount:gl.length,canvasCount:canvas.length};})()`);
  report.checks=check;
  if(!persisted||!check.savedTaskAfterReload||check.historyStatus!=='in-arbeit')throw Error('Lokale QA-Historie nach Neustart nicht korrekt angezeigt');
  if(!fixture&&check.webglCanvasCount<1)throw Error('Keine aktive WebGL-Canvas in echter Konzert-App');
  // Verify user-driven change persisted: React select change, not merely writing the storage key again.
  if(!fixture){
   const changed=await evalJs(`(()=>{const s=document.querySelector('.v694-saved-tasks select');if(!s)return false;
    const setter=Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype,'value')?.set;setter?.call(s,'manuell-geprueft');s.dispatchEvent(new Event('change',{bubbles:true}));return true;})()`);
   if(!changed)throw Error('Statusauswahl für gespeicherte Aufgabe fehlt');
   await wait(()=>evalJs(`(()=>{try{return JSON.parse(localStorage.getItem(${JSON.stringify(historyKey)})).progress[${JSON.stringify(marker)}]==='manuell-geprueft'}catch{return false}})()`),'Manuell geänderter Status gespeichert');
   await navigate();await wait(()=>evalJs(`!!document.querySelector('.v466-quality-toggle')`),'QA nach zweitem Reload');
   await evalJs(`document.querySelector('.v466-quality-toggle').click()`);
   await wait(()=>evalJs(`!!document.querySelector('.v694-saved-tasks')?.textContent.includes('manuell-geprueft')`),'Neuer Status nach zweitem Reload');
   report.checks.userStatusUpdatePersisted=true;
  }
  const image=await call('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});
  fs.mkdirSync(path.dirname(out),{recursive:true});fs.writeFileSync(out+'.png',Buffer.from(image.data,'base64'));
  report.status='passed';
  if(fixture)report.limitations.unshift('Self-test passed only Chromium + independent fixture. NOT a Sonic Display production test.');
  console.log(`V695 Chromium ${report.kind}: ${report.status}. WebGL canvas: ${check.webglCanvasCount}.`);
 }catch(err){report.status='blocked';report.error=String(err.message||err);console.error(`V695 Chromium ${report.kind} BLOCKIERT:`,report.error);}
 finally{
  try{fs.mkdirSync(path.dirname(out),{recursive:true});fs.writeFileSync(out+'.json',JSON.stringify(report,null,2)+'\n');}catch{}
  if(ws)try{ws.close();}catch{};for(const x of pending.values())clearTimeout(x.timer);
  if(child)try{child.kill('SIGKILL');}catch{}
  if(server)await new Promise(resolve=>server.close(resolve));
  if(dir)try{fs.rmSync(dir,{force:true,recursive:true,maxRetries:2});}catch{}
 }
 if(report.status!=='passed')process.exitCode=1;
}
run().catch(e=>{console.error(e);process.exitCode=1;});
