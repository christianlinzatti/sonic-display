'use strict';
/** Real Chromium/CDP measurement of V777 GLB concert fixture. Requires a running LOCAL Next.js server.
 * Usage: node scripts/v777-concert-benchmark-browser.cjs --url=http://127.0.0.1:3000 --label=V777 --out=artifacts/v777/current.json
 */
const fs=require('node:fs'),path=require('node:path'),os=require('node:os');
const {spawn}=require('node:child_process');const {setTimeout:pause}=require('node:timers/promises');
const arg=(k,def)=>process.argv.find(x=>x.startsWith('--'+k+'='))?.slice(k.length+3)??def;
const numeric=(k,def,min,max)=>{const n=Number(arg(k,String(def)));if(!Number.isFinite(n)||n<min||n>max||!Number.isInteger(n))throw Error(k+' außerhalb '+min+'–'+max);return n;};
const localUrl=s=>{try{const u=new URL(s);return ['localhost','127.0.0.1','[::1]'].includes(u.hostname)&&['http:','https:'].includes(u.protocol)&&!u.username&&!u.password;}catch{return false;}};
async function run(){
 let chrome,dir,ws;const pending=new Map();let seq=0;
 const out=path.resolve(arg('out','artifacts/v777/current.json'));
 const record={status:'blocked',source:'real-browser',message:'Unbekannt',createdAt:new Date().toISOString()};
 try{
  const root=arg('url','http://127.0.0.1:3000');if(!localUrl(root))throw Error('Ausschließlich lokale URLs erlaubt');
  const label=arg('label','V777').slice(0,80),passes=numeric('passes',2,1,4),warmupFrames=numeric('warmup',60,45,240),sampleFrames=numeric('frames',180,90,600);
  const u=new URL('/diagnostics/concert-benchmark',root);u.searchParams.set('concertBenchV777','1');
  const motionV781=process.argv.includes('--motionV781');if(motionV781)u.searchParams.set('motionV781','1');
  const interpolationV782=arg('interpolationV782',null);if(interpolationV782!==null){if(!['on','off'].includes(interpolationV782))throw Error('Ungültiger V782-Modus');u.searchParams.set('interpolationV782',interpolationV782)}
  const lipGuardV783=arg('lipGuardV783',null);if(lipGuardV783!==null){if(!['on','off'].includes(lipGuardV783)||interpolationV782!=='on')throw Error('V783 benötigt explizite V782-Interpolation');u.searchParams.set('lipGuardV783',lipGuardV783)}
  const cameraV784=arg('cameraV784',null);if(cameraV784!==null){if(!['on','off'].includes(cameraV784))throw Error('Ungültiger V784-Kameramodus');u.searchParams.set('cameraV784',cameraV784)}
  const lyricsV785=arg('lyricsV785',null);if(lyricsV785!==null){if(!['on','off'].includes(lyricsV785)||cameraV784!=='on')throw Error('V785 benötigt V784-Kamera=on und Lyrics=on/off');u.searchParams.set('lyricsV785',lyricsV785)}
  const governorV788=arg('governorV788',null);const targetV788=arg('targetV788',null);
  if(governorV788!==null){if(!['on','off'].includes(governorV788)||![30,45,60].includes(Number(targetV788)))throw Error('Ungültiger V788-Modus/FPS-Ziel');u.searchParams.set('governorV788',governorV788);u.searchParams.set('targetV788',targetV788)}
  const qualityProfile=arg('profile',null);
  if(qualityProfile!==null){if(!['cinematic','balanced','economy'].includes(qualityProfile))throw Error('Unbekanntes V779-Profil');u.searchParams.set('profileV779',qualityProfile)}
  const assetOk=s=>typeof s==='string'&&s.startsWith('/')&&!s.startsWith('//')&&!s.includes('\\')&&!s.includes('?')&&!s.includes('#')&&!/%2f|%5c|%2e/i.test(s)&&!s.split('/').some(x=>x==='..'||x==='.')&&/\.glb$/i.test(s)&&s.length<=500;
  for(const key of ['glb','glb2']){const value=arg(key,null);if(value!==null){if(!assetOk(value))throw Error('Ungültiger lokaler GLB-Pfad: '+key);u.searchParams.set(key,value)}}
  const check=await fetch(u.origin,{signal:AbortSignal.timeout(7000)}).catch(()=>null);
  if(!check||!check.ok)throw Error('Next.js-Server nicht erreichbar: '+u.origin);
  dir=fs.mkdtempSync(path.join(os.tmpdir(),'sonic-v777-chromium-'));
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
  await wait(()=>evalJs('document.readyState==="complete" && !!window.__sonicV777 && !!document.querySelector("canvas")'),
    'React Canvas bereit',60000);
  if(lyricsV785!==null)await wait(()=>evalJs('!!window.__sonicV785'),'V785-Lyricsdiagnose bereit',15000);
  if(governorV788!==null)await wait(()=>evalJs('!!window.__sonicV788'),'V788-Qualitätsregler bereit',15000);
  if(cameraV784!==null)await wait(()=>evalJs('!!window.__sonicV784'),'V784-Kameradiagnose bereit',15000);
  if(qualityProfile!==null){const applied=await evalJs('window.__sonicV777.profile?.()');
    if(applied!==qualityProfile)throw Error('V779-Profil nicht aktiviert: '+String(applied));
    record.profileV779=qualityProfile;}
  const opts=JSON.stringify({label,passes,warmupFrames,sampleFrames,motionV781});
  await evalJs(`(()=>{window.__stageV777Run={status:'running'};window.__sonicV777.run(${opts})
    .then(result=>window.__stageV777Run={status:'done',result})
    .catch(error=>window.__stageV777Run={status:'error',message:String(error?.message||error)});return true})()`);
  const expectedMs=6*(passes+1)*(warmupFrames+sampleFrames)*1000/20;
  const state=await wait(async()=>{const v=await evalJs('({status:window.__stageV777Run?.status,message:window.__stageV777Run?.message})');
    return v?.status&&v.status!=='running'?v:null;},'Bühnenbenchmark',Math.max(180000,Math.min(1800000,expectedMs*3)));
  if(state.status!=='done')throw Error(state.message||'Unbekannter Browserfehler');
  const result=await evalJs('window.__stageV777Run.result');
  if(result?.format!=='sonic-concert-benchmark-v777'||result.scenes?.length!==6||result.scenes?.some(x=>x.frames<sampleFrames-3))
    throw Error('Unvollständige echte Bildmessungen');
  if(result.scenes.some(x=>x.avgCalls<=0||x.fps<=0))throw Error('Keine validen Draw Calls / FPS');
  if(interpolationV782!==null&&result.config?.interpolationV782!==interpolationV782)throw Error('V782-Modus im Browserbericht fehlt oder weicht ab');
  if(lipGuardV783!==null&&result.config?.lipGuardV783!==lipGuardV783)throw Error('V783-Modus im Browserbericht fehlt oder weicht ab');
  if(cameraV784!==null){
    if(result.config?.cameraV784!==cameraV784)throw Error('V784-Kamera-Modus im FPS-Bericht fehlt');
    const camera=await evalJs('window.__sonicV784?.report()');
    if(camera?.format!=='sonic-camera-smoothness-v784'||camera.version!==1||camera.mode!==cameraV784||
      camera.scenes?.length!==passes*6||camera.scenes.some(s=>s.frames<sampleFrames-3))throw Error('V784 Kameraframes fehlen');
    record.cameraV784=camera;
  }
  if(lyricsV785!==null){
    if(result.config?.lyricsV785!==lyricsV785)throw Error('V785 Lyrics-Modus im FPS-Bericht fehlt');
    const lyrics=await evalJs('window.__sonicV785?.report()');
    if(lyrics?.format!=='sonic-lyrics-protection-v785'||lyrics.version!==1||lyrics.mode!==lyricsV785||
      lyrics.scenes?.length!==passes*6||lyrics.scenes.some(s=>s.frames<sampleFrames-3||!Number.isFinite(s.clipPct)))throw Error('V785 echte Glyph-Framemessungen fehlen');
    record.lyricsV785=lyrics;
  }
  if(governorV788!==null){
    if(result.config?.governorV788!==governorV788||result.config?.targetV788!==Number(targetV788))throw Error('V788-Modus/Ziel im FPS-Bericht fehlt');
    const governor=await evalJs('window.__sonicV788?.report()');
    if(governor?.format!=='sonic-concert-governor-v788'||governor.version!==1||governor.mode!==governorV788||
      governor.target!==Number(targetV788)||governor.scenes?.length!==passes*6||
      governor.scenes.some(s=>s.frames<sampleFrames-3||s.invalidFrames>0))throw Error('V788-Governor-Messpunkte fehlen');
    record.governorV788=governor;
  }
  if(motionV781){
    const motion=await evalJs('window.__sonicV781?.report()');
    if(motion?.format!=='sonic-motion-smoothness-v781'||motion.version!==1||motion.profile!==qualityProfile||
      motion.scenes?.length!==passes*6||motion.scenes.some(s=>s.samples<s.avatars*80))
      throw Error('V781-Bewegungssamples fehlen oder sind unvollständig');
    record.motionV781=motion;
  }
  record.status='ok';record.message='Gemessene GLB-Konzertszenen (nicht Spotify-Audio)';record.report=result;
  record.browser=await evalJs('({userAgent:navigator.userAgent,hidden:document.hidden,canvasCount:document.querySelectorAll("canvas").length})');
  if(record.browser.hidden||record.browser.canvasCount!==1)throw Error('Benchmark-Tab muss sichtbar sein und genau ein Canvas enthalten');
  console.log('V777 browser: 3 stages × 2/4 GLBs, '+result.scenes.reduce((s,x)=>s+x.frames,0)+' frames, '+result.environment.renderer);
 }catch(error){record.status='blocked';record.message=String(error?.message||error);console.error('V777 BLOCKED:',record.message);process.exitCode=1;}
 finally{try{fs.mkdirSync(path.dirname(out),{recursive:true});fs.writeFileSync(out,JSON.stringify(record,null,2)+'\n');console.log('V777 JSON:',out)}catch(e){console.error(e);process.exitCode=1;}
  for(const t of pending.values())clearTimeout(t.timer);
  try{ws?.close()}catch{}if(chrome)chrome.kill('SIGKILL');if(dir)try{fs.rmSync(dir,{recursive:true,force:true,maxRetries:2})}catch{}
 }
}
if(require.main===module)run().catch(e=>{console.error(e);process.exitCode=1});
module.exports={localUrl,numeric};
