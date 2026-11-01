'use strict';
/** Captures REAL GLB WebGL canvas pixels at fixed logical frames, via Chromium CDP.
 * No fabricated images, metrics or screenshot placeholders. Runs only on loopback.
 */
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),crypto=require('node:crypto');
const {spawn}=require('node:child_process'),{setTimeout:pause}=require('node:timers/promises');
const {write}=require('./v780-visual-quality-report.cjs');
const Module=require('node:module'),ts=require('../tests/typescript-loader.cjs');
const planFile=path.resolve(__dirname,'../services/monitoring/visualQualityPlanV780.ts');
const compiled=ts.transpileModule(fs.readFileSync(planFile,'utf8'),{fileName:planFile,compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS}});
const planModule=new Module(planFile,module);planModule.filename=planFile;planModule.paths=Module._nodeModulePaths(path.dirname(planFile));planModule._compile(compiled.outputText,planFile);
const {visualPlanV780,normalizeVisualFramesV780}=planModule.exports;
const arg=(k,def)=>process.argv.find(x=>x.startsWith('--'+k+'='))?.slice(k.length+3)??def;
const localUrl=s=>{try{const u=new URL(s);return ['localhost','127.0.0.1','[::1]'].includes(u.hostname)&&['http:','https:'].includes(u.protocol)&&!u.username&&!u.password;}catch{return false}};
const glbPath=s=>typeof s==='string'&&s.startsWith('/')&&!s.startsWith('//')&&!s.includes('\\')&&!s.includes('?')&&!s.includes('#')&&!/%2f|%5c|%2e/i.test(s)&&!s.split('/').some(x=>x==='..'||x==='.')&&/\.glb$/i.test(s)&&s.length<=500;
function frames(s){return normalizeVisualFramesV780(String(s).split(',').map(Number))}
function config(){const root=arg('url','http://127.0.0.1:3000'),glb=arg('glb',null),glb2=arg('glb2',null),out=path.resolve(arg('out','artifacts/v780'));
 if(!localUrl(root))throw Error('Nur lokaler Next.js-Server erlaubt');if(glb!==null&&!glbPath(glb))throw Error('Ungültige GLB-URL');if(glb2!==null&&!glbPath(glb2))throw Error('Ungültige GLB2-URL');
 return {root,glb,glb2,out,frames:frames(arg('frames','96,208'))};}
async function run(){let chrome,dir,ws;const pending=new Map();let id=0;
 let cfg,manifest={format:'sonic-visual-quality-v780',status:'blocked',createdAt:new Date().toISOString(),frames:[],images:[],message:'Messung nicht gestartet'};
 try{cfg=config();manifest.frames=cfg.frames;fs.mkdirSync(cfg.out,{recursive:true});
  const target=new URL('/diagnostics/concert-benchmark',cfg.root);
  const alive=await fetch(target.origin,{signal:AbortSignal.timeout(7000)}).catch(()=>null);
  if(!alive?.ok)throw Error('Next.js-Server nicht erreichbar: '+target.origin);
  dir=fs.mkdtempSync(path.join(os.tmpdir(),'sonic-v780-chrome-'));
  const flags=['--headless=new','--no-sandbox','--disable-dev-shm-usage','--no-first-run','--no-default-browser-check','--disable-background-timer-throttling','--disable-renderer-backgrounding','--remote-debugging-port=0',`--user-data-dir=${dir}`];
  if(process.argv.includes('--software'))flags.push('--enable-unsafe-swiftshader');
  chrome=spawn(arg('chromium',process.env.CHROMIUM_PATH||'chromium'),[...flags,'about:blank'],{stdio:'ignore'});chrome.on('error',()=>{});
  const wait=async(fn,label,timeout=45000)=>{const begin=Date.now();while(Date.now()-begin<timeout){const v=await fn();if(v)return v;await pause(120)}throw Error(label+' timeout')};
  const port=await wait(()=>fs.existsSync(path.join(dir,'DevToolsActivePort'))?Number(fs.readFileSync(path.join(dir,'DevToolsActivePort'),'utf8').split('\n')[0]):0,'Chromium');
  const tabs=await (await fetch(`http://127.0.0.1:${port}/json`)).json();const tab=tabs.find(t=>t.type==='page'&&t.webSocketDebuggerUrl);if(!tab)throw Error('Kein CDP-Tab');
  ws=new WebSocket(tab.webSocketDebuggerUrl);
  await new Promise((ok,bad)=>{ws.addEventListener('open',ok,{once:true});ws.addEventListener('error',bad,{once:true})});
  ws.addEventListener('message',event=>{try{const m=JSON.parse(event.data),p=pending.get(m.id);if(!p)return;pending.delete(m.id);clearTimeout(p.timer);m.error?p.reject(Error(m.error.message)):p.resolve(m.result)}catch{}});
  const send=(method,params={},timeout=45000)=>new Promise((resolve,reject)=>{const key=++id;
   const timer=setTimeout(()=>{pending.delete(key);reject(Error('CDP timeout: '+method))},timeout);
   pending.set(key,{resolve,reject,timer});ws.send(JSON.stringify({id:key,method,params}));});
  const evalJs=async(expression,awaitPromise=false)=>{const r=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise},120000);if(r.exceptionDetails)throw Error(r.exceptionDetails.text||'Browser exception');return r.result?.value};
  await send('Runtime.enable');await send('Page.enable');await send('Emulation.setDeviceMetricsOverride',{width:1280,height:800,deviceScaleFactor:1,mobile:false});
  const baseFingerprint={};
  for(const profile of ['cinematic','balanced','economy']){
   target.searchParams.set('concertBenchV777','1');target.searchParams.set('visualV780','1');target.searchParams.set('profileV779',profile);
   if(cfg.glb)target.searchParams.set('glb',cfg.glb);if(cfg.glb2)target.searchParams.set('glb2',cfg.glb2);
   const nav=await send('Page.navigate',{url:target.href});if(nav.errorText)throw Error(nav.errorText);
   await wait(()=>evalJs('document.readyState==="complete" && !!window.__sonicV780 && !!document.querySelector("canvas")'),'Visual fixture ready',60000);
   if(await evalJs('document.querySelectorAll("canvas").length')!==1)throw Error('Mehr als ein Canvas');
   if(await evalJs('document.hidden'))throw Error('Browser-Tab ist verborgen');
   for(const {stage,avatars,frame,filename} of visualPlanV780(cfg.frames).filter(s=>s.profile===profile)){
    const options=JSON.stringify({stage,avatars,frame});
    const capture=await evalJs(`window.__sonicV780.capture(${options})`,true);
    if(capture?.format!=='sonic-visual-capture-v780'||capture.profile!==profile||capture.stage!==stage||capture.avatars!==avatars||capture.frame!==frame||!capture.dataUrl?.startsWith('data:image/png;base64,'))throw Error('Ungültige WebGL-Capture-Antwort');
    if(capture.viewport!=='960x540')throw Error('Canvas-Auflösung weicht ab: '+capture.viewport);
    const fingerprint=JSON.stringify([capture.hashes,capture.renderer,capture.viewport,capture.assetMode]);
    if(baseFingerprint.value && baseFingerprint.value!==fingerprint)throw Error('GLB, Renderer oder Viewport zwischen Profilen verändert');baseFingerprint.value=fingerprint;
    const png=Buffer.from(capture.dataUrl.slice('data:image/png;base64,'.length),'base64');
    const file=filename;
    fs.writeFileSync(path.join(cfg.out,file),png);
    manifest.images.push({file,stage,avatars,frame,profile,viewport:capture.viewport,renderer:capture.renderer,assetMode:capture.assetMode,hashes:capture.hashes,
     sha256:crypto.createHash('sha256').update(png).digest('hex'),bytes:png.length});
    console.log('V780 PNG:',file,png.length,'bytes');
   }
  }
  manifest.status='ok';manifest.message='Echte GLB-WebGL-Canvas-Aufnahmen; kein Spotify-Audio';
 }catch(e){manifest.status='blocked';manifest.message=String(e?.message||e);process.exitCode=2;console.error('V780 BLOCKED:',manifest.message)}
 finally{if(cfg){try{fs.mkdirSync(cfg.out,{recursive:true});fs.writeFileSync(path.join(cfg.out,'manifest.json'),JSON.stringify(manifest,null,2)+'\n');
    const result=write(cfg.out,manifest);if(result.status!=='ready')process.exitCode=2;
    console.log('V780:',result.status,'HTML:',path.join(cfg.out,'index.html'))}catch(e){console.error('V780 report:',e.message);process.exitCode=2}}
  for(const p of pending.values())clearTimeout(p.timer);try{ws?.close()}catch{}if(chrome)chrome.kill('SIGKILL');if(dir)try{fs.rmSync(dir,{recursive:true,force:true,maxRetries:2})}catch{}}
}
if(require.main===module)run().catch(e=>{console.error(e);process.exitCode=2});
module.exports={config,frames,localUrl,glbPath};
