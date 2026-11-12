'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const os=require('node:os');
const vm=require('node:vm');
const net=require('node:net');
const {spawn}=require('node:child_process');
const P=require('../scripts/govee-lan-protocol.cjs');

const ok=(label,fn)=>{fn();console.log('PASS V909 — '+label);};
const obj=buffer=>JSON.parse(buffer.toString('utf8')).msg;
ok('private IPv4 allows only RFC1918 device targets',()=>{
 for(const ip of ['10.1.2.3','172.16.0.5','172.31.1.2','192.168.1.9'])assert.equal(P.isPrivateIPv4(ip),true);
 for(const ip of ['127.0.0.1','8.8.8.8','169.254.1.2','172.32.0.1','::1','192.168.1.9;bad'])assert.equal(P.isPrivateIPv4(ip),false);
});
ok('official discovery/status and separate 4001/4002/4003 ports',()=>{
 assert.deepEqual([P.SCAN_PORT,P.REPLY_PORT,P.COMMAND_PORT],[4001,4002,4003]);
 assert.equal(obj(P.scan()).cmd,'scan');assert.equal(obj(P.scan()).data.account_topic,'reserve');
 assert.equal(obj(P.status()).cmd,'devStatus');
});
ok('power, brightness, color, temperature and look JSON',()=>{
 assert.deepEqual(obj(P.command('power',true)[0]),{cmd:'turn',data:{value:1}});
 assert.equal(obj(P.command('power',false)[0]).data.value,0);
 assert.equal(obj(P.command('brightness',67)[0]).data.value,67);
 assert.deepEqual(obj(P.command('color',{r:1,g:2,b:255})[0]),{cmd:'colorwc',data:{color:{r:1,g:2,b:255},colorTemInKelvin:0}});
 assert.equal(obj(P.command('temperature',4000)[0]).data.colorTemInKelvin,4000);
 const look=P.command('look',{color:{r:30,g:20,b:10},brightness:60});
 assert.deepEqual(look.map(obj).map(m=>m.cmd),['colorwc','brightness']);
});
ok('invalid commands are rejected before sending UDP',()=>{
 for(const values of [['unknown',1],['brightness',200],['brightness','10'],['temperature',100],['power',1],['color',{r:-1,g:0,b:4}],['look',{color:{r:1,g:2,b:3},brightness:0}]])
  assert.throws(()=>P.command(...values));
});
ok('Govee discovery uses remote address, not forged JSON IP',()=>{
 const payload=Buffer.from(JSON.stringify({msg:{cmd:'scan',data:{ip:'8.8.8.8',sku:'H1234',device:'abc'}}}));
 assert.equal(P.parseReply(payload,'192.168.0.51').ip,'192.168.0.51');
 assert.equal(P.parseReply(payload,'8.8.8.8'),null);
 assert.equal(P.parseReply(Buffer.from('not json'),'192.168.0.51'),null);
});

// Parse actual TSX edits, run the dependency-free planning TS through TypeScript.
const ts=(()=>{try{return require('typescript');}catch{return require(path.join(path.dirname(path.dirname(process.execPath)),'lib/node_modules/typescript'));}})();
for(const file of ['lib/goveeLanV909.ts','components/GoveeMusicSyncV909.tsx','components/GoveeLanPanelV909.tsx','components/SettingsPanel.tsx','app/page.tsx']){
 const source=fs.readFileSync(path.join(__dirname,'..',file),'utf8');
 const root=ts.createSourceFile(file,source,ts.ScriptTarget.Latest,true,file.endsWith('tsx')?ts.ScriptKind.TSX:ts.ScriptKind.TS);
 assert.equal(root.parseDiagnostics.length,0,`${file} must have valid TSX syntax`);
}
console.log('PASS V909 — changed TS/TSX files parse');
ok('settings tab and persistent music-sync root integration',()=>{
 const settings=fs.readFileSync(path.join(__dirname,'../components/SettingsPanel.tsx'),'utf8');
 const page=fs.readFileSync(path.join(__dirname,'../app/page.tsx'),'utf8');
 const panel=fs.readFileSync(path.join(__dirname,'../components/GoveeLanPanelV909.tsx'),'utf8');
 const sync=fs.readFileSync(path.join(__dirname,'../components/GoveeMusicSyncV909.tsx'),'utf8');
 const {SETTINGS_SECTIONS}=require('./helpers/load-stage-typescript.cjs')(path.join(__dirname,'../lib/settingsNavigation.ts'));
 assert(SETTINGS_SECTIONS.some(section=>section.id==='govee'),'Govee remains in the registered settings navigation');
 assert.match(settings,/const\s+sections\s*=\s*SETTINGS_SECTIONS/);assert.match(settings,/tab === "govee" && <GoveeLanPanelV909/);
 assert.match(page,/<GoveeMusicSyncV909\/>/);assert.match(panel,/if\(config\.autoSync\)update\(\{autoSync:false\}\)/);
 assert.match(sync,/if\(!state\.isPlaying\|\|!state\.track\)return/);
});
const js=ts.transpileModule(fs.readFileSync(path.join(__dirname,'../lib/goveeLanV909.ts'),'utf8'),
 {compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS}}).outputText;
const mod={exports:{}};vm.runInNewContext(js,{module:mod,exports:mod.exports,URL,console,setTimeout,clearTimeout});
const L=mod.exports;
ok('config defaults opt out and reject unsafe bridge hosts',()=>{
 const cfg=L.normalizeGoveeConfigV909({enabled:true,autoSync:true,selectedIps:['192.168.1.4','192.168.1.4','8.8.8.8'],masterBrightness:200});
 assert.equal(cfg.selectedIps.length,1);assert.equal(cfg.masterBrightness,100);
 assert.equal(L.normalizeGoveeConfigV909(null).enabled,false);
 assert.equal(L.normalizeGoveeConfigV909(null).autoSync,false);
 assert.equal(L.validBridgeUrlV909('http://localhost:8765'),'http://localhost:8765');
 assert.throws(()=>L.validBridgeUrlV909('http://192.168.1.2:8765'));
 assert.throws(()=>L.validBridgeUrlV909('http://localhost:8765/foo'));
});
ok('genre-aware gentle plans preserve capped brightness',()=>{
 const cfg={...L.DEFAULT_GOVEE_CONFIG_V909,masterBrightness:70,sensitivity:70};
 const base={durationMs:240000,progressMs:60000,config:cfg,metrics:{bass:0.6,beatStrength:0.7,energyEnvelope:0.5,volume:0.5},microphoneActive:true};
 const rap=L.planGoveeLookV909({...base,genre:'Deutschrap'});
 const tekk=L.planGoveeLookV909({...base,genre:'Hardtekk'});
 const rock=L.planGoveeLookV909({...base,genre:'Deutschrock'});
 assert.notDeepEqual(rap.color,tekk.color);assert.notDeepEqual(rock.color,tekk.color);
 for(const look of [rap,tekk,rock])assert.ok(look.brightness>=20&&look.brightness<=82);
});

async function port(){return new Promise((resolve,reject)=>{
 const s=net.createServer();s.on('error',reject);s.listen(0,'127.0.0.1',()=>{const p=s.address().port;s.close(()=>resolve(p));});
});}
async function bridge(){
 const portNumber=await port();const home=fs.mkdtempSync(path.join(os.tmpdir(),'sonic-govee-test-'));
 const token='govee-bridge-test-1234567890-123456';
 const child=spawn(process.execPath,[path.join(__dirname,'../scripts/govee-lan-bridge.cjs'),'--origin','https://sonic-test.vercel.app'],{
  env:{...process.env,HOME:home,USERPROFILE:home,GOVEE_BRIDGE_PORT:String(portNumber),GOVEE_BRIDGE_TOKEN:token},stdio:['ignore','pipe','pipe']});
 let logs='';child.stdout.on('data',chunk=>{logs+=chunk.toString();});child.stderr.on('data',chunk=>{logs+=chunk.toString();});
 try{
  const url='http://127.0.0.1:'+portNumber;
  const request=(path,options={})=>fetch(url+path,{...options});
  let ready=false;
  for(let i=0;i<60;i++){
   if(child.exitCode!==null)throw Error('Bridge unexpectedly quit: '+logs);
   try{const r=await request('/health',{headers:{Authorization:'Bearer '+token}});if(r.status===200){ready=true;break;}}catch{}
   await new Promise(resolve=>setTimeout(resolve,30));
  }
  assert.equal(ready,true,'Bridge must start: '+logs);
  let r=await request('/health');assert.equal(r.status,401);
  r=await request('/health',{headers:{Authorization:'Bearer '+token,Origin:'https://untrusted.example'}});assert.equal(r.status,403);
  r=await request('/health',{headers:{Authorization:'Bearer '+token,Origin:'http://localhost:3000'}});assert.equal(r.status,200);
  assert.equal(r.headers.get('access-control-allow-origin'),'http://localhost:3000');
  r=await request('/health',{headers:{Authorization:'Bearer '+token,Origin:'https://sonic-test.vercel.app'}});assert.equal(r.status,200);
  r=await request('/health',{method:'OPTIONS',headers:{Origin:'http://localhost:3000','Access-Control-Request-Private-Network':'true'}});assert.equal(r.status,204);
  assert.equal(r.headers.get('access-control-allow-private-network'),'true');
  r=await request('/devices/add',{method:'POST',headers:{Authorization:'Bearer '+token,'Content-Type':'application/json'},body:JSON.stringify({ip:'8.8.8.8'})});assert.equal(r.status,400);
  r=await request('/devices/add',{method:'POST',headers:{Authorization:'Bearer '+token,'Content-Type':'application/json'},body:JSON.stringify({ip:'192.168.1.77'})});assert.equal(r.status,200);
  r=await request('/command',{method:'POST',headers:{Authorization:'Bearer '+token,'Content-Type':'application/json'},body:JSON.stringify({ip:'192.168.1.77',action:'brightness',value:1000})});assert.equal(r.status,400);
  console.log('PASS V909 — live HTTP bridge auth/CORS/PNA/manual devices/validation');
 }finally{child.kill('SIGTERM');await new Promise(resolve=>child.once('exit',resolve));fs.rmSync(home,{recursive:true,force:true});}
}
bridge().catch(error=>{console.error(error);process.exitCode=1;});
