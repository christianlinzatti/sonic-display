#!/usr/bin/env node
'use strict';
/** Loopback health probe, read-only; token never printed. */
const fs=require('node:fs');const os=require('node:os');const path=require('node:path');
async function main(){
 const port=Number(process.env.GOVEE_BRIDGE_PORT||8765);
 if(!Number.isInteger(port)||port<1||port>65535)throw Error('Ungueltiger lokaler Bridge-Port.');
 let token=process.env.GOVEE_BRIDGE_TOKEN;
 if(!token)token=fs.readFileSync(path.join(os.homedir(),'.sonic-display','govee-bridge-token'),'utf8').trim();
 if(token.length<24)throw Error('Bridge-Token zu kurz.');
 const ctrl=new AbortController();const timer=setTimeout(()=>ctrl.abort(),2500);
 try{
  const response=await fetch(`http://127.0.0.1:${port}/health`,{headers:{Authorization:'Bearer '+token},signal:ctrl.signal});
  if(!response.ok)throw Error('Bridge antwortet mit HTTP '+response.status);
  const health=await response.json();
  if(!health.ok)throw Error('Bridge laeuft, UDP hat einen Fehler: '+(health.udpError||'unbekannt'));
  console.log('Govee LAN Bridge erreichbar (nur Statusabfrage).');
  console.log('Bridge-Version:',health.version,'| Leuchten:',health.devices,'| zuletzt erreichbar:',health.onlineDevices);
 }finally{clearTimeout(timer);}
}
if(require.main===module)main().catch(error=>{console.error('Bridge-Diagnose:',error.message);process.exitCode=1;});
module.exports={main};
