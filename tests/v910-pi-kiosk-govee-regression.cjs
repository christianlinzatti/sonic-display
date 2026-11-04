'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const os=require('node:os');
const path=require('node:path');
const net=require('node:net');
const {spawn,spawnSync}=require('node:child_process');
const P=require('../scripts/pi/install-v910.cjs');
const root=path.resolve(__dirname,'..');
let checks=0;
function check(label,fn){fn();checks++;console.log('PASS V910 — '+label);}
check('HTTPS deployment URL becomes exact allowed Origin',()=>{
 const p=P.parseVercelUrl('https://sonic-test.vercel.app/');assert.equal(p.origin,'https://sonic-test.vercel.app');
 for(const url of ['http://site.vercel.app','https://user:pass@site.vercel.app','https://site.vercel.app?token=abc',
  'https://site.vercel.app/#url','https://localhost','https://192.168.1.2','https://site.vercel.app/foo;bad'])
  assert.throws(()=>P.parseVercelUrl(url),url);
});
check('labwc startup block preserves unrelated entries and re-installs idempotently',()=>{
 const original='swaybg -c black &\n';const line="'/home/test/.local/bin/sonic-display-kiosk-v910' &";
 const once=P.replaceAutoStart(original,line);const twice=P.replaceAutoStart(once,line);
 assert.equal(once,twice);assert.match(twice,/swaybg -c black/);assert.equal(twice.split(P.BEGIN).length,2);
 assert.throws(()=>P.replaceAutoStart(P.BEGIN+'\n',line));
});
check('installer generates private config, user service and kiosk launcher without sudo',()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'sonic-v910-'));const home=path.join(dir,'test-user');
 try{
  fs.mkdirSync(path.join(home,'.config','labwc'),{recursive:true});
  const autostart=path.join(home,'.config','labwc','autostart');
  fs.writeFileSync(autostart,'# preserve custom config\nswaybg -c black &\n');
  const plan=P.plan({home,projectDir:root,nodePath:process.execPath,url:'https://sonic-test.vercel.app'});
  P.install(plan);
  const unit=fs.readFileSync(plan.serviceFile,'utf8'),env=fs.readFileSync(plan.bridgeEnv,'utf8');
  assert.match(unit,/Restart=always/);assert.match(unit,/WantedBy=default.target/);
  assert.match(unit,/127\.0\.0\.1|govee-lan-bridge\.cjs/);assert(!unit.includes('sudo '));
  assert.equal(env,'GOVEE_BRIDGE_ORIGINS=https://sonic-test.vercel.app\n');
  assert.match(fs.readFileSync(plan.kioskEnv,'utf8'),/SONIC_DISPLAY_URL='https:\/\/sonic-test\.vercel\.app\/'/);
  assert.match(fs.readFileSync(plan.autostart,'utf8'),/preserve custom config/);
  assert.match(fs.readFileSync(plan.bin,'utf8'),/chromium-profile/);
  if(process.platform!=='win32'){
   assert.equal(fs.statSync(plan.bridgeEnv).mode&0o777,0o600);
   assert.equal(fs.statSync(plan.kioskEnv).mode&0o777,0o600);
  }
  const once=fs.readFileSync(plan.autostart,'utf8');P.install(plan);
  assert.equal(fs.readFileSync(plan.autostart,'utf8'),once);
  assert.equal(fs.existsSync(path.join(home,'.sonic-display','govee-bridge-token')),false,'installer must not fake or print secrets');
 }finally{fs.rmSync(dir,{recursive:true,force:true});}
});
check('kiosk Bash script validates and retains Chromium protections',()=>{
 const f=path.join(root,'scripts/pi/sonic-display-kiosk-v910.sh');
 if(process.platform!=='win32'){
  const syntax=spawnSync('bash',['-n',f]);assert.equal(syntax.status,0,syntax.stderr?.toString());
 }
 const text=fs.readFileSync(f,'utf8');assert.match(text,/--kiosk/);assert.match(text,/--user-data-dir=/);
 assert.match(text,/flock -n/);assert.match(text,/curl -sSLI/);
 assert.doesNotMatch(text,/--no-sandbox|--disable-web-security|--allow-running-insecure-content|--disable-features=BlockInsecurePrivateNetworkRequests/);
});
check('app uses browser-controlled loopback LNA and reconnect status',()=>{
 const request=fs.readFileSync(path.join(root,'lib/goveeLanV909.ts'),'utf8');
 const panel=fs.readFileSync(path.join(root,'components/GoveeLanPanelV909.tsx'),'utf8');
 assert.match(request,/targetAddressSpace:'loopback'/);
 assert.match(panel,/setInterval\(\(\)=>void poll\(\),12000\)/);
 assert.match(panel,/if\(!checkInitiated\|\|!config\.token\.trim\(\)\)return/);
 assert.match(panel,/systemd/);
});
check('package keeps historical V908 prebuild guard and adds V910 test',()=>{
 const scripts=JSON.parse(fs.readFileSync(path.join(root,'package.json'),'utf8')).scripts;
 assert(scripts.prebuild.startsWith('npm run test:v908'));
 assert(scripts.prebuild.includes('test:v910'));
 assert(scripts['pi:install'].includes('install-v910.cjs'));
});
function port(){return new Promise((resolve,reject)=>{const s=net.createServer();s.on('error',reject);s.listen(0,'127.0.0.1',()=>{const p=s.address().port;s.close(()=>resolve(p));});});}
async function live(){
 const temp=fs.mkdtempSync(path.join(os.tmpdir(),'sonic-v910-bridge-'));
 const portNumber=await port();const token='private-v910-bridge-token-012345678901234';
 const child=spawn(process.execPath,[path.join(root,'scripts/govee-lan-bridge.cjs'),'--origin','https://sonic-test.vercel.app'],{
  env:{...process.env,HOME:temp,USERPROFILE:temp,GOVEE_BRIDGE_PORT:String(portNumber),GOVEE_BRIDGE_TOKEN:token},stdio:['ignore','pipe','pipe']});
 let logs='';child.stdout.on('data',c=>logs+=c.toString());child.stderr.on('data',c=>logs+=c.toString());
 try{
  let data;let ready=false;
  for(let i=0;i<80;i++){
   if(child.exitCode!==null)throw Error('Bridge exited: '+logs);
   try{
    const r=await fetch('http://127.0.0.1:'+portNumber+'/health',{headers:{Authorization:'Bearer '+token,Origin:'https://sonic-test.vercel.app'}});
    if(r.status===200){data=await r.json();ready=true;break;}
   }catch{}await new Promise(r=>setTimeout(r,30));
  }
  assert(ready,'bridge ready: '+logs);
  assert.equal(data.version,'v910');assert.equal(typeof data.ok,'boolean');
  assert(Number.isFinite(data.lastScanAt));assert(Number.isInteger(data.onlineDevices));
  assert(data.onlineDevices>=0&&data.onlineDevices<=data.devices);
  const bridgeSource=fs.readFileSync(path.join(root,'scripts/govee-lan-bridge.cjs'),'utf8');
  assert.match(bridgeSource,/scanTimer=setInterval\(\(\)=>void discover\(\),120000\)/);
  assert.match(bridgeSource,/presenceTimer=setInterval/);
  const r=await fetch('http://127.0.0.1:'+portNumber+'/health',{headers:{Authorization:'Bearer '+token,Origin:'https://not-allowed.example'}});
  assert.equal(r.status,403);
  assert(!logs.includes(token),'token must not appear in systemd journal / piped stdout');
  console.log('PASS V910 — live bridge startup/discovery/health/auth and secret-safe logs');checks++;
 }finally{
  child.kill('SIGTERM');
  await Promise.race([new Promise(r=>child.once('exit',r)),new Promise(r=>setTimeout(r,2000))]);
  if(child.exitCode===null)child.kill('SIGKILL');
  fs.rmSync(temp,{recursive:true,force:true});
 }
}
live().then(()=>console.log('V910 PASS '+checks+' groups')).catch(e=>{console.error(e);process.exitCode=1;});
