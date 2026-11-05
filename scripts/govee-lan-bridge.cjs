#!/usr/bin/env node
'use strict';
/**
 * Sonic Display local Govee bridge. HTTP loopback only; UDP never leaves the LAN.
 * A bearer token protects cross-origin commands and an explicit Origin allowlist
 * prevents arbitrary websites from controlling lights via this user's browser.
 */
const http=require('node:http');
const dgram=require('node:dgram');
const fs=require('node:fs');
const os=require('node:os');
const path=require('node:path');
const crypto=require('node:crypto');
const {SCAN_ADDRESS,SCAN_PORT,REPLY_PORT,COMMAND_PORT,isPrivateIPv4,scan,status,command,parseReply}=require('./govee-lan-protocol.cjs');
const PORT=Number(process.env.GOVEE_BRIDGE_PORT || 8765);
const flags=process.argv.slice(2);
const origins=new Set(['http://localhost:3000','http://127.0.0.1:3000']);
function allowOrigin(value){
 const origin=String(value).trim();let parsed;
 try{parsed=new URL(origin);}catch{throw Error('Ungültiger Bridge-Origin: '+origin);}
 const local=parsed.protocol==='http:'&&['localhost','127.0.0.1'].includes(parsed.hostname);
 if(!origin||parsed.origin!==origin||parsed.username||parsed.password||!(parsed.protocol==='https:'||local))
  throw Error('Bridge-Origin muss eine exakte HTTPS-Origin (oder localhost) ohne Pfad sein.');
 origins.add(origin);
}
for(const origin of (process.env.GOVEE_BRIDGE_ORIGINS||'').split(',').filter(Boolean))allowOrigin(origin);
for(let i=0;i<flags.length;i++)if(flags[i]==='--origin'&&flags[i+1])allowOrigin(flags[++i]);

function readToken() {
  if (process.env.GOVEE_BRIDGE_TOKEN && process.env.GOVEE_BRIDGE_TOKEN.length>=24) return process.env.GOVEE_BRIDGE_TOKEN;
  const folder=path.join(os.homedir(),'.sonic-display');
  fs.mkdirSync(folder,{recursive:true,mode:0o700});
  const file=path.join(folder,'govee-bridge-token');
  if(fs.existsSync(file)){
    const value=fs.readFileSync(file,'utf8').trim();
    if(value.length>=24) return value;
  }
  const token=crypto.randomBytes(24).toString('hex');
  fs.writeFileSync(file,token,{encoding:'utf8',mode:0o600,flag:'w'});
  return token;
}
const TOKEN=readToken();
const devices=new Map();
let lastScanAt=0;
let scanTimer=null;let presenceTimer=null;
const startedAt=Date.now();
const isOnline=(d)=>Boolean(d.lastSeen&&Date.now()-d.lastSeen<90000);
const withPresence=(d)=>({...d,online:isOnline(d)});
let udpProblem='';
const socket=dgram.createSocket({type:'udp4',reuseAddr:false});
socket.on('error',error=>{udpProblem=error.message;console.error('[Govee LAN] UDP:',error.message);});
socket.on('message',(raw,peer)=>{
  const result=parseReply(raw,peer.address);
  if(!result) return;
  if(result.type==='scan'){
    const old=devices.get(result.ip)||{};
    devices.set(result.ip,{...old,...result,lastSeen:Date.now(),manual:false});
  } else if(result.type==='devStatus'&&devices.has(result.ip)){
    const old=devices.get(result.ip);
    devices.set(result.ip,{...old,status:{on:result.on??null,brightness:result.brightness??null,color:result.color??null},lastSeen:Date.now()});
  }
});
socket.bind(REPLY_PORT,'0.0.0.0',()=>{
  udpProblem='';
  try {socket.setBroadcast(true);socket.setMulticastTTL(2);} catch(error){udpProblem=error.message;}
  console.log('[Govee LAN] UDP response port', REPLY_PORT);
  // A restarted Pi should rediscover lamps on its own, even before Settings opens.
  const discover=async()=>{
   if(udpProblem)return;
   lastScanAt=Date.now();
   await send(scan(),SCAN_ADDRESS,SCAN_PORT).catch(()=>{});
   await send(scan(),'255.255.255.255',SCAN_PORT).catch(()=>{});
  };
  void discover();
  scanTimer=setInterval(()=>void discover(),120000);
  // Status is observational only: never change power/color without explicit opt-in.
  presenceTimer=setInterval(()=>{
   for(const d of devices.values())void send(status(),d.ip,COMMAND_PORT).catch(()=>{});
  },35000);
});
function send(data,ip,port){
  if(udpProblem) return Promise.reject(new Error('UDP nicht verfügbar: '+udpProblem));
  return new Promise((resolve,reject)=>socket.send(data,port,ip,error=>error?reject(error):resolve()));
}
function pause(ms){return new Promise(resolve=>setTimeout(resolve,ms));}
function body(req){return new Promise((resolve,reject)=>{
  let value='';
  req.on('data',chunk=>{value+=chunk;if(value.length>4096){reject(new Error('Request too large'));req.destroy();}});
  req.on('end',()=>{try{resolve(value?JSON.parse(value):{});}catch{reject(new Error('Invalid JSON'));}});
  req.on('error',reject);
});}
function respond(res,code,payload){res.writeHead(code,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'});res.end(JSON.stringify(payload));}
const server=http.createServer(async(req,res)=>{
  const origin=req.headers.origin;
  if(origin && !origins.has(origin)) {respond(res,403,{error:'Origin nicht freigegeben. Bridge mit --origin '+origin+' starten.'});return;}
  if(origin){res.setHeader('Access-Control-Allow-Origin',origin);res.setHeader('Vary','Origin');
    res.setHeader('Access-Control-Allow-Private-Network','true');
    res.setHeader('Access-Control-Allow-Headers','Authorization,Content-Type');
    res.setHeader('Access-Control-Allow-Methods','GET,POST,OPTIONS');}
  if(req.method==='OPTIONS'){res.writeHead(204);res.end();return;}
  const supplied=(req.headers.authorization||'').replace(/^Bearer\s+/i,'');
  const correct=Buffer.from(supplied);const expected=Buffer.from(TOKEN);
  if(correct.length!==expected.length||!crypto.timingSafeEqual(correct,expected)) {respond(res,401,{error:'Bridge-Token fehlt oder ist ungültig.'});return;}
  try{
    const url=new URL(req.url||'/', 'http://localhost');
    if(req.method==='GET'&&url.pathname==='/health') return respond(res,200,{ok:!udpProblem,udpError:udpProblem||null,devices:devices.size,onlineDevices:[...devices.values()].filter(isOnline).length,uptimeSeconds:Math.floor((Date.now()-startedAt)/1000),lastScanAt,version:'v910'});
    if(req.method==='GET'&&url.pathname==='/devices') return respond(res,200,{devices:Array.from(devices.values()).sort((a,b)=>a.ip.localeCompare(b.ip)).map(withPresence)});
    if(req.method==='POST'&&url.pathname==='/scan') {
      lastScanAt=Date.now();
      await send(scan(),SCAN_ADDRESS,SCAN_PORT);
      // Some Wi-Fi APs block multicast; a broadcast scan is also best-effort.
      await send(scan(),'255.255.255.255',SCAN_PORT).catch(()=>{});
      await pause(1400);
      return respond(res,200,{devices:Array.from(devices.values()).map(withPresence)});
    }
    if(req.method==='POST'&&url.pathname==='/devices/add') {
      const payload=await body(req);const ip=payload.ip;
      if(!isPrivateIPv4(ip))return respond(res,400,{error:'Bitte eine private IPv4-Adresse (10.x, 172.16–31.x, 192.168.x) angeben.'});
      const old=devices.get(ip)||{};
      devices.set(ip,{...old,type:'manual',ip,sku:old.sku||'',name:typeof payload.name==='string'?payload.name.slice(0,80):old.name||'',device:old.device||'',manual:true,lastSeen:old.lastSeen||null});
      await send(scan(),ip,SCAN_PORT).catch(()=>{});
      return respond(res,200,{device:withPresence(devices.get(ip))});
    }
    if(req.method==='POST'&&url.pathname==='/status') {
      const {ip}=await body(req);
      if(!isPrivateIPv4(ip)||!devices.has(ip))return respond(res,404,{error:'Gerät nicht registriert.'});
      await send(status(),ip,COMMAND_PORT);
      await pause(350);
      return respond(res,200,{device:withPresence(devices.get(ip))});
    }
    if(req.method==='POST'&&url.pathname==='/command') {
      const payload=await body(req);const {ip,action,value}=payload;
      if(!isPrivateIPv4(ip)||!devices.has(ip))return respond(res,404,{error:'Gerät nicht registriert. Zuerst suchen oder manuell hinzufügen.'});
      const packets=command(action,value); // validate before emitting anything
      for(const packet of packets){await send(packet,ip,COMMAND_PORT);if(packets.length>1)await pause(60);}
      return respond(res,200,{ok:true,sent:packets.length}); // UDP is unacknowledged, not verified device state
    }
    return respond(res,404,{error:'Unknown endpoint'});
  }catch(error){return respond(res,400,{error:error instanceof Error?error.message:'Unexpected error'});}
});
server.listen(PORT,'127.0.0.1',()=>{
  console.log('\nSONIC DISPLAY · GOVEE LAN BRIDGE');
  console.log('Nur lokal erreichbar: http://127.0.0.1:'+PORT);
  if(process.env.GOVEE_BRIDGE_PRINT_TOKEN==='1')
   console.log('Token (im Sonic-Display-Govee-Tab eintragen):',TOKEN);
  else console.log('Token bewusst nicht ins Systemjournal geschrieben; mit node scripts/print-govee-token-v971.cjs (oder show-token.sh/.cmd) anzeigen.');
  console.log('Freigegebene Browser-Origins:',Array.from(origins).join(', '));
  console.log('Govee: UDP 4001 (Scan), 4002 (Antwort), 4003 (Steuerung).\n');
});
function stop(){if(scanTimer)clearInterval(scanTimer);if(presenceTimer)clearInterval(presenceTimer);server.close();socket.close();}
process.once('SIGINT',stop);process.once('SIGTERM',stop);
