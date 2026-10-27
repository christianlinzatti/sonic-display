'use strict';
/** CDP capture of the ENTIRE visible concert fixture (actual multi-GLB canvas + DOM lyrics).
 * No synthetic GLBs/frames, no remote browser URLs, no claimed production-live validation.
 */
const fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const {spawn}=require('node:child_process');const {setTimeout:delay}=require('node:timers/promises');
const {safeOrigin,safeGlb}=require('./v590-real-concert-visual-benchmark.cjs');
const {analyzePngs,contentCoverage}=require('./v590-visual-image.cjs');
const {summarizeFrames}=require('./v580-benchmark-metrics.cjs');
const {renderV591Report}=require('./v591-concert-visual-report.cjs');
const argv=process.argv.slice(2),opt=(name,def)=>argv.find(a=>a.startsWith(`--${name}=`))?.slice(name.length+3)??def;
const url=opt('url','http://127.0.0.1:3000'),models=opt('models','').split(','),clips=opt('clips','').split(',').map(Number);
const script=opt('script',''),seconds=Number(opt('seconds','15'));
const out=path.resolve(opt('out','artifacts/v591/concert'));
const chromium=opt('chromium',process.env.CHROMIUM_PATH||'chromium');const headed=argv.includes('--headed');
const report={format:'sonic-v591-integrated-concert-visual-review',status:'blocked',capturedAt:new Date().toISOString(),
 mode:headed?'visible-browser':'headless-diagnostic',platform:process.platform,architecture:process.arch,
 source:{url,models,clips,script:script||null},screenshots:[],transitions:[],warnings:[],
 limitations:['Independent review fixture with real GLBs, not the full Spotify or production visualizer pipeline.',
  'Default cue text is DEMO content, not retrieved or timestamped real song lyrics.',
  'Screenshot pixel deltas and NDC bounds are heuristic; actual artistic quality needs human approval.',
  'Measured rAF timing is not GPU timing or Raspberry Pi thermals.']};
const validPath=p=>typeof p==='string'&&p.length<=240&&p.startsWith('/')&&!p.startsWith('//')&&!p.includes('\\')&&!/[?#]/.test(p)&&(()=>{
 try{const d=decodeURIComponent(p);return d.startsWith('/')&&!d.startsWith('//')&&!d.split('/').some(v=>v==='.'||v==='..')&&!/[\u0000-\u001f\u007f\\]/.test(d)&&d.toLowerCase().endsWith('.json');}catch{return false;}
})();
async function main(){let chrome,dir,ws;const pending=new Map();let seq=0;
 try{
  if(!safeOrigin(url)||models.length<2||models.length>4||models.some(m=>!safeGlb(m))||
    clips.length!==models.length||clips.some(i=>!Number.isInteger(i)||i<0||i>999)||script&&!validPath(script))
   throw Error('Requires local loopback origin, 2..4 safe local GLBs, matching nonnegative clip indices and optional local JSON cue URL.');
  if(!Number.isInteger(seconds)||seconds<5||seconds>600)throw Error('--seconds must be 5..600');
  if(!globalThis.WebSocket)throw Error('Node 22+ WebSocket required');
  const sceneUrl=`${url.replace(/\/$/,'')}/benchmark/v591?models=${encodeURIComponent(models.join(','))}&clips=${encodeURIComponent(clips.join(','))}${script?`&script=${encodeURIComponent(script)}`:''}`;
  const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),12000);
  try{const response=await fetch(sceneUrl,{signal:controller.signal});if(!response.ok)throw Error(`V591 page HTTP ${response.status}`);}finally{clearTimeout(timeout);}
  dir=fs.mkdtempSync(path.join(os.tmpdir(),'sonic-v591-'));
  chrome=spawn(chromium,[...(headed?[]:['--headless=new']),'--no-sandbox','--disable-dev-shm-usage','--no-first-run',
   '--disable-background-timer-throttling','--disable-renderer-backgrounding','--remote-debugging-port=0',`--user-data-dir=${dir}`,'about:blank'],{stdio:'ignore'});
  chrome.on('error',()=>{});
  let port=0;for(let i=0;i<140;i++){const file=path.join(dir,'DevToolsActivePort');if(fs.existsSync(file)){port=Number(fs.readFileSync(file,'utf8').split('\n')[0]);if(port)break;}await delay(100);}
  if(!port)throw Error('Local Chromium unavailable');
  const tabs=await(await fetch(`http://127.0.0.1:${port}/json`)).json(),tab=tabs.find(t=>t.type==='page'&&t.webSocketDebuggerUrl);
  if(!tab)throw Error('No Chromium page');
  ws=new WebSocket(tab.webSocketDebuggerUrl);
  await new Promise((resolve,reject)=>{ws.addEventListener('open',resolve,{once:true});ws.addEventListener('error',reject,{once:true});});
  ws.addEventListener('message',event=>{try{const m=JSON.parse(event.data),p=pending.get(m.id);if(!p)return;
    pending.delete(m.id);clearTimeout(p.timer);m.error?p.reject(Error(JSON.stringify(m.error))):p.resolve(m.result);}catch{}});
  const send=(method,params={},wait=30000)=>new Promise((resolve,reject)=>{const id=++seq,timer=setTimeout(()=>{pending.delete(id);reject(Error(`${method} timeout`));},wait);
   pending.set(id,{resolve,reject,timer});ws.send(JSON.stringify({id,method,params}));});
  const evaluate=async expression=>{const r=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true},(seconds+40)*1000);
   if(r.exceptionDetails)throw Error(r.exceptionDetails.text||'Browser evaluate failed');return r.result?.value;};
  await send('Page.enable');await send('Runtime.enable');
  await send('Emulation.setDeviceMetricsOverride',{width:1200,height:820,deviceScaleFactor:1,mobile:false});
  await send('Page.navigate',{url:sceneUrl});
  let state,rect;for(let i=0;i<160;i++){
   const probe=await evaluate(`(()=>({status:document.querySelector('[data-v591-status]')?.getAttribute('data-v591-status'),state:window.__sonicV591?.state?.(),rect:(()=>{const e=document.querySelector('[data-v591-stage]');if(!e)return null;const r=e.getBoundingClientRect();const c=e.querySelector('canvas');return {x:r.x,y:r.y,width:r.width,height:r.height,canvasWidth:c?.width,canvasHeight:c?.height,hasLyrics:!!e.querySelector('[data-v591-lyrics]')}})()}))()`);
   state=probe.state;rect=probe.rect;
   if(probe.status==='blocked'||state?.error)throw Error(state?.error||'Scene rejected sources or cue data');
   if(probe.status==='ready'&&state?.ready&&state?.appliedGeneration===0&&rect?.canvasWidth>0&&rect?.hasLyrics)break;
   await delay(200);
  }
  if(!state?.ready||state.appliedGeneration!==0||!rect?.hasLyrics)throw Error('No real two-to-four-performer GLB/WebGL scene ready');
  if(state.actors.length!==models.length||state.actors.some(a=>!a.ready||a.meshes<1||!(a.duration>0))||!state.webglVersion)
   throw Error('Not all GLB performers contain compatible visible animation');
  const readCues=await evaluate(`(()=>Array.from(document.querySelector('[data-v591-cue-picker]')?.options??[]).map(x=>({index:Number(x.value)})))()`);
  if(readCues.length<2||readCues.length>16)throw Error('No valid sequence of authored review cues');
  report.browser={userAgent:await evaluate('navigator.userAgent'),webglVersion:state.webglVersion,actorCount:state.actors.length,
    actorClips:state.actors.map(x=>({name:x.name,duration:x.duration,meshes:x.meshes})),canvas:{width:rect.canvasWidth,height:rect.canvasHeight}};
  if(!state.scripted)report.warnings.push('Only DEMO lyric text used; not a synced real track.');
  fs.mkdirSync(out,{recursive:true});let previous=null,previousId=null;
  for(const {index} of readCues){
   if(!(await evaluate(`window.__sonicV591.seekCue(${index})`)))throw Error(`Cue ${index} rejected`);
   let frame=null;for(let j=0;j<60;j++){
    frame=await evaluate('window.__sonicV591.state()');
    if(frame?.ready&&frame.cueIndex===index&&frame.appliedGeneration===frame.generation&&frame.actors.every(a=>a.appliedGeneration===frame.generation))break;
    await delay(85);
   }
   if(!frame||frame.appliedGeneration!==frame.generation)throw Error(`Cue ${index} missing measured WebGL pose`);
   await evaluate('new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(()=>resolve(true))))');
   const bounds=await evaluate(`(()=>{const r=document.querySelector('[data-v591-stage]').getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height}})()`);
   const capture=await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false,clip:{...bounds,scale:1}});
   const buffer=Buffer.from(capture.data,'base64'),file=`cue-${String(index).padStart(2,'0')}-${frame.cue.id.replace(/[^a-z0-9_-]/gi,'_')}.png`;
   fs.writeFileSync(path.join(out,file),buffer);
   const composition=compositionActorBounds(frame.actors.map(x=>x.bounds),true),coverage=contentCoverage(buffer);
   const shot={file,cue:frame.cue,composition,coverage,drawCalls:frame.drawCalls,triangles:frame.triangles};
   report.screenshots.push(shot);
   for(const w of composition.warnings)report.warnings.push(`${frame.cue.id}: ${w}`);
   if(coverage.nonBackgroundFraction<.01)report.warnings.push(`${frame.cue.id}: mostly uniform screenshot; inspect manually.`);
   if(previous){const diff=analyzePngs(previous,buffer);report.transitions.push({from:previousId,to:frame.cue.id,...diff});
    if(diff.changedPixelFraction<.004)report.warnings.push(`${frame.cue.id}: scene nearly identical to prior cue.`);}
   previous=buffer;previousId=frame.cue.id;
  }
  const observation=await evaluate(`new Promise(resolve=>{const samples=[],longTasks=[];let previous=0,loss=0,cueChanges=0,nextCue=0,cueIndex=0;
   const canvas=document.querySelector('[data-v591-stage] canvas'),onLost=()=>loss++;
   canvas.addEventListener('webglcontextlost',onLost);let observer;
   try{observer=new PerformanceObserver(l=>{for(const x of l.getEntries())longTasks.push(x.duration)});observer.observe({entryTypes:['longtask']});}catch{}
   const start=performance.now(),finish=start+${seconds*1000};
   function step(t){if(previous&&t>previous)samples.push(t-previous);previous=t;
    if(t>=nextCue&&t<finish){const next=(cueIndex+1)%${readCues.length};
      if(window.__sonicV591?.seekCue(next)){cueIndex=next;cueChanges++;}nextCue=t+1800;}
    if(t<finish)return requestAnimationFrame(step);
    observer?.disconnect();canvas.removeEventListener('webglcontextlost',onLost);
    resolve({samples,elapsedMs:performance.now()-start,longTaskCount:longTasks.length,contextLosses:loss,cueChanges,hidden:document.hidden});}
   requestAnimationFrame(step);})`);
  const stats=summarizeFrames(observation.samples,{targetFps:30});
  if(stats.status!=='measured'||observation.hidden)throw Error('No actually measured visible rAF frames');
  report.frameTiming={...stats,elapsedMs:observation.elapsedMs,longTaskCount:observation.longTaskCount,contextLosses:observation.contextLosses,cueChanges:observation.cueChanges};
  report.status='measured-needs-human-review';
  const html=renderV591Report(report);fs.writeFileSync(path.join(out,'report.html'),html);
  console.log(`V591: ${report.screenshots.length} real scene captures, ${report.transitions.length} transitions, ${stats.averageFps} rAF/s, ${report.warnings.length} warnings. Needs HUMAN review.`);
 }catch(error){report.error=String(error?.message||error);console.error('V591 BLOCKED:',report.error);}
 finally{fs.mkdirSync(out,{recursive:true});fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(report,null,2)+'\n');
  if(ws)try{ws.close();}catch{}for(const p of pending.values())clearTimeout(p.timer);
  if(chrome)chrome.kill('SIGKILL');if(dir)try{fs.rmSync(dir,{recursive:true,force:true});}catch{}
 }
 if(report.status!=='measured-needs-human-review')process.exitCode=1;
}
function compositionActorBounds(bounds,visible){
 const warnings=[];let valid=0,clipped=0,lyricIntersections=0;
 bounds.forEach((b,i)=>{if(!b||![b.minX,b.maxX,b.minY,b.maxY].every(Number.isFinite)||b.maxX<=b.minX||b.maxY<=b.minY){warnings.push(`Avatar ${i+1}: keine messbaren Grenzen`);return;}
  valid++;if(b.minX<-.96||b.maxX>.96||b.minY<-.96||b.maxY>.96){clipped++;warnings.push(`Avatar ${i+1}: möglicherweise angeschnitten`);}
  if(visible&&b.maxX>-.83&&b.minX<.83&&b.minY<-.46&&b.maxY>-1){lyricIntersections++;warnings.push(`Avatar ${i+1}: mögliche Lyrics-Überlagerung`);}
 });
 return {status:valid===0?'unmeasured':warnings.length?'review':'no-obvious-warning',actorsMeasured:valid,clipped,lyricIntersections,warnings};
}
if(require.main===module)main().catch(e=>{console.error(e);process.exitCode=1;});
module.exports={validPath,compositionActorBounds};
