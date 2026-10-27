'use strict';
/**
 * V571: real Chromium/CDP browser smoke test, with no npm browser automation dependency.
 * A screenshot alone is NOT evidence of a working WebGL stage, loaded GLB or correct animation.
 * CLI: node scripts/v571-browser-smoke.cjs --url=http://127.0.0.1:3000 \
 *        --open-selector='[data-v571-preview-open]' --expect-selector='[data-v571-preview-root]' \
 *        --require-webgl --require-glb --out=artifacts/v571/browser
 */
const fs=require('node:fs');
const path=require('node:path');
const os=require('node:os');
const {spawn}=require('node:child_process');
const http=require('node:http');
const {setTimeout:delay}=require('node:timers/promises');
const args=process.argv.slice(2);
const option=(key,fallback)=>{const item=args.find(v=>v.startsWith(`--${key}=`));return item?item.slice(key.length+3):fallback;};
const flag=k=>args.includes(`--${k}`);
const timeoutMs=Math.min(90000,Math.max(3000,Number(option('timeout','30000'))||30000));
const url=option('url','http://127.0.0.1:3000/');
const chromium=option('chromium',process.env.CHROMIUM_PATH||'chromium');
const out=path.resolve(process.cwd(),option('out','artifacts/v571/browser'));
const openSelector=option('open-selector','');
const navigateSelector=option('navigate-selector',openSelector?'.settings-trigger':'');
const tabSelector=option('tab-selector',openSelector?'[data-v571-tab="avatar"]':'');
const expectSelector=option('expect-selector',openSelector?'[data-v571-preview-root]':'body');
const requireWebgl=flag('require-webgl');
const requireGlb=flag('require-glb');
const selfTest=flag('self-test');
const isLoopback=x=>{try{const u=new URL(x);return ['127.0.0.1','localhost','[::1]'].includes(u.hostname)&&['http:','https:'].includes(u.protocol);}catch{return false;}};
const failure=(message)=>{throw new Error(message);};
function ensureSafeUrl(value){if(!isLoopback(value))failure('Only local http(s) URLs are accepted (localhost/127.0.0.1/::1).');}
async function waitFor(f,what,ms){const start=Date.now();while(Date.now()-start<ms){const val=await f();if(val)return val;await delay(125);}failure(`${what}: timeout after ${ms} ms`);}
async function run() {
 let child, directory, fixtureServer, websocket, pending=new Map(), nextId=0;
 let screenshotPath, reportPath, result={kind:selfTest?'test-fixture':'application',url,checkedAt:new Date().toISOString(),status:'blocked',requirements:{webgl:requireWebgl,glb:requireGlb},checks:{},limitations:['Does not confirm animation quality, real singer identity, Spotify audio sync, FPS or Raspberry Pi stability.']};
 try{
  let targetUrl=url;
  if(selfTest){
   fixtureServer=http.createServer((req,res)=>{
     res.setHeader('Content-Type','text/html; charset=utf-8');
     res.end('<!doctype html><html lang="de"><head><title>V571 Chrome Fixture</title></head><body><main data-v571-fixture="true">V571 TEST FIXTURE – keine echte Konzertshow</main></body></html>');
   });
   await new Promise(resolve=>fixtureServer.listen(0,'127.0.0.1',resolve));
   targetUrl=`http://127.0.0.1:${fixtureServer.address().port}/`;
  }
  result.url=targetUrl;
  try{fs.rmSync(out+'.png',{force:true});}catch{} // Old screenshots must not look like a new successful run.
  ensureSafeUrl(targetUrl);
  directory=fs.mkdtempSync(path.join(os.tmpdir(),'sonic-v571-chrome-'));
  child=spawn(chromium,['--headless=new','--no-sandbox','--disable-dev-shm-usage','--enable-unsafe-swiftshader','--hide-scrollbars','--no-first-run','--no-default-browser-check','--remote-debugging-port=0',`--user-data-dir=${directory}`,'about:blank'],{stdio:'ignore'});
  child.on('error',()=>{});
  const port=await waitFor(()=>{
    const file=path.join(directory,'DevToolsActivePort');
    if(!fs.existsSync(file))return null;
    const n=Number(fs.readFileSync(file,'utf8').split('\n')[0]);return n>0?n:null;
  },'Chromium remote debugging startup',timeoutMs);
  const listing=await (await fetch(`http://127.0.0.1:${port}/json`)).json();
  const tab=listing.find(x=>x.type==='page'&&x.webSocketDebuggerUrl);
  if(!tab)failure('Chromium did not expose a page target');
  websocket=new WebSocket(tab.webSocketDebuggerUrl);
  await new Promise((resolve,reject)=>{websocket.addEventListener('open',resolve,{once:true});websocket.addEventListener('error',reject,{once:true});});
  websocket.addEventListener('message',evt=>{
   try{const payload=JSON.parse(evt.data);if(!payload.id)return;const item=pending.get(payload.id);if(!item)return;pending.delete(payload.id);clearTimeout(item.timer);payload.error?item.reject(new Error(JSON.stringify(payload.error))):item.resolve(payload.result);}catch{}
  });
  const call=(method,params={})=>new Promise((resolve,reject)=>{
    const id=++nextId;
    const timer=setTimeout(()=>{pending.delete(id);reject(new Error(`CDP ${method} timeout`));},timeoutMs);
    pending.set(id,{resolve,reject,timer});
    websocket.send(JSON.stringify({id,method,params}));
  });
  const evaluate=async expression=>{
   const reply=await call('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});
   if(reply.exceptionDetails)failure(`Browser JS exception: ${reply.exceptionDetails.text}`);
   return reply.result?.value;
  };
  await call('Page.enable');await call('Runtime.enable');
  await call('Emulation.setDeviceMetricsOverride',{width:1280,height:800,deviceScaleFactor:1,mobile:false});
  await call('Page.navigate',{url:targetUrl});
  await waitFor(()=>evaluate(`location.href.startsWith(${JSON.stringify(targetUrl)}) && document.readyState === "complete" && !!document.body`),'target document ready',timeoutMs);
  if(navigateSelector){
    const selector=JSON.stringify(navigateSelector);
    await waitFor(()=>evaluate(`!!document.querySelector(${selector})`),`navigation selector ${navigateSelector}`,timeoutMs);
    await evaluate(`(()=>{const button=document.querySelector(${selector});if(button)button.click();return !!button})()`);
  }
  if(tabSelector){
    const selector=JSON.stringify(tabSelector);
    await waitFor(()=>evaluate(`!!document.querySelector(${selector})`),`tab selector ${tabSelector}`,timeoutMs);
    await evaluate(`(()=>{const button=document.querySelector(${selector});if(button)button.click();return !!button})()`);
  }
  if(openSelector){
    const selector=JSON.stringify(openSelector);
    await waitFor(()=>evaluate(`!!document.querySelector(${selector})`),`open selector ${openSelector}`,timeoutMs);
    await evaluate(`(()=>{const button=document.querySelector(${selector});if(button)button.click();return !!button})()`);
  }
  const expected=JSON.stringify(expectSelector);
  await waitFor(()=>evaluate(`!!document.querySelector(${expected})`),`expected DOM selector ${expectSelector}`,timeoutMs);
  await delay(750); // Give R3F at least a few frames after the modal mounts.
  result.url=targetUrl;
  result.checks=await evaluate(`(()=>{
    const canvas=[...document.querySelectorAll('canvas')];
    const glCanvas=canvas.filter(c=>{try{const gl=c.getContext('webgl2')||c.getContext('webgl');return !!gl&&gl.drawingBufferWidth>0&&gl.drawingBufferHeight>0;}catch{return false;}});
    const modal=document.querySelector('[data-v571-preview-root]');
    const audit=document.querySelector('[data-v570-audit]');
    const items=[...(audit?.querySelectorAll('[data-v570-status]')||[])].map(el=>({id:el.getAttribute('data-v571-audit-id'),status:el.getAttribute('data-v570-status'),text:(el.textContent||'').trim().slice(0,350)}));
    return {title:document.title,expectedSelectorFound:!!document.querySelector(${expected}),
      previewOpen:!!modal,webglCanvasCount:glCanvas.length,totalCanvasCount:canvas.length,
      glbRigChecks:items.filter(x=>x.id==='rig-1'||x.id==='rig-2'),
      inputAudit:items,consoleNotInspected:true};
  })()`);
  result.checks.webglReady=result.checks.webglCanvasCount>0&&result.checks.previewOpen;
  result.checks.glbRigReady=result.checks.previewOpen&&result.checks.glbRigChecks.some(x=>x.id==='rig-1'&&x.status==='ok')&&result.checks.glbRigChecks.every(x=>x.status==='ok');
  const problems=[];
  if(requireWebgl&&!result.checks.webglReady)problems.push('WebGL preview canvas not active');
  if(requireGlb&&!result.checks.glbRigReady)problems.push('No positively scanned GLB mouth rig in V570 audit');
  result.status=problems.length?'failed':'passed';result.problems=problems;
  const png=await call('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});
  fs.mkdirSync(path.dirname(out),{recursive:true});
  screenshotPath=out+'.png';reportPath=out+'.json';
  fs.writeFileSync(screenshotPath,Buffer.from(png.data,'base64'));
  console.log(`V571 browser smoke: ${result.status} (${result.kind})`);
  console.log(`Screenshot: ${screenshotPath}`);
  if(problems.length)console.error(problems.join('; '));
 }catch(error){result.status='blocked';result.error=String(error.message||error);console.error('V571 browser smoke BLOCKED:',result.error);}
 finally{
  if(out){try{fs.mkdirSync(path.dirname(out),{recursive:true});reportPath=out+'.json';fs.writeFileSync(reportPath,JSON.stringify(result,null,2)+'\n');}catch(e){console.error('Could not save browser report:',e.message);}}
  if(websocket){try{websocket.close();}catch{}}
  for(const item of pending.values())clearTimeout(item.timer);
  if(child){try{child.kill('SIGKILL');}catch{}}
  if(fixtureServer)await new Promise(resolve=>fixtureServer.close(resolve));
  if(directory){try{fs.rmSync(directory,{recursive:true,force:true,maxRetries:5,retryDelay:250});}catch{}}
 }
 if(result.status!=='passed')process.exitCode=1;
}
run().catch(err=>{console.error(err);process.exitCode=1;});
