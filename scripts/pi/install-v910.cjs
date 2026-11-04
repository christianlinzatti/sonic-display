#!/usr/bin/env node
'use strict';
/**
 * V910: Unprivileged Raspberry Pi OS (labwc) kiosk + Govee Bridge installer.
 * It never configures router ports, weakens Chromium security, or requires sudo.
 */
const fs=require('node:fs');
const os=require('node:os');
const path=require('node:path');
const {spawnSync}=require('node:child_process');
const BEGIN='# >>> SONIC DISPLAY V910 KIOSK >>>';
const END='# <<< SONIC DISPLAY V910 KIOSK <<<';
const SERVICE='sonic-govee-bridge-v910.service';

function parseVercelUrl(value){
 if(typeof value!=='string'||!value.trim())throw Error('Die HTTPS-Vercel-URL fehlt. Beispiel: --url https://mein-projekt.vercel.app');
 let url;try{url=new URL(value.trim());}catch{throw Error('Ungültige Vercel-URL.');}
 if(url.protocol!=='https:'||url.username||url.password||url.hash||url.search||url.port||!url.hostname||
    /^(?:localhost|127\.|10\.|192\.168\.|172\.(?:1[6-9]|2\d|3[01])\.)/i.test(url.hostname))
  throw Error('Nur eine öffentliche HTTPS-URL ohne Zugangsdaten, Query oder Fragment zulässig.');
 if(!/^[a-z0-9.-]+$/i.test(url.hostname)||url.hostname.startsWith('-')||url.hostname.endsWith('-'))throw Error('Ungültiger Hostname.');
 // Keep shell/env files simple and prevent untrusted shell expansion/line breaks.
 if(!/^\/[a-zA-Z0-9_./~%+-]*$/.test(url.pathname))throw Error('Bitte eine einfache URL ohne Sonderzeichen verwenden.');
 return {url:url.origin+url.pathname,origin:url.origin};
}
function escapeService(value){
 if(/[\r\n\0]/.test(value))throw Error('Ungültiger Pfad.');
 return '"'+value.replace(/%/g,'%%').replace(/\\/g,'\\\\').replace(/"/g,'\\"')+'"';
}
function quoteShell(value){return "'"+value.replace(/'/g,"'\\''")+"'";}
function replaceAutoStart(source,command){
 if(source.includes(BEGIN)!==source.includes(END))throw Error('labwc/autostart hat einen unvollständigen Sonic-Display-Block. Bitte manuell prüfen.');
 const regex=/# >>> SONIC DISPLAY V910 KIOSK >>>[\s\S]*?# <<< SONIC DISPLAY V910 KIOSK <<<\s*/g;
 const rest=source.replace(regex,'').trimEnd();
 return `${rest}${rest?'\n\n':''}${BEGIN}\n${command}\n${END}\n`;
}
function plan({home=os.homedir(),projectDir=path.resolve(__dirname,'../..'),nodePath=process.execPath,url}){
 const deployment=parseVercelUrl(url);
 const bin=path.join(home,'.local','bin','sonic-display-kiosk-v910');
 const profile=path.join(home,'.config','sonic-display');
 const serviceFile=path.join(home,'.config','systemd','user',SERVICE);
 const autostart=path.join(home,'.config','labwc','autostart');
 const kioskScript=path.join(projectDir,'scripts','pi','sonic-display-kiosk-v910.sh');
 const bridgeScript=path.join(projectDir,'scripts','govee-lan-bridge.cjs');
 return {deployment,bin,profile,serviceFile,autostart,kioskScript,bridgeScript,nodePath,projectDir,home,
  bridgeEnv:path.join(profile,'bridge.env'),kioskEnv:path.join(profile,'pi-kiosk.env'),
  unit:`[Unit]\nDescription=Sonic Display V910 Govee LAN Bridge (localhost only)\nAfter=network-online.target\nWants=network-online.target\n\n[Service]\nType=exec\nWorkingDirectory=${escapeService(projectDir)}\nExecStart=${escapeService(nodePath)} ${escapeService(bridgeScript)}\nEnvironmentFile=${escapeService(path.join(profile,'bridge.env'))}\nRestart=always\nRestartSec=5\nNoNewPrivileges=true\nPrivateTmp=true\nProtectSystem=full\n\n[Install]\nWantedBy=default.target\n`,
  autostartCommand:`${quoteShell(bin)} &`};
}
function writePrivate(filename,content,mode=0o600){
 fs.mkdirSync(path.dirname(filename),{recursive:true,mode:0o700});
 fs.writeFileSync(filename,content,{mode,encoding:'utf8'});
 fs.chmodSync(filename,mode);
}
function install(p){
 if(!fs.existsSync(p.bridgeScript)||!fs.existsSync(p.kioskScript))throw Error('Bitte das Installationsskript aus dem vollständigen Sonic-Display-Paket starten.');
 fs.mkdirSync(p.profile,{recursive:true,mode:0o700});
 writePrivate(p.kioskEnv,`SONIC_DISPLAY_URL=${quoteShell(p.deployment.url)}\n`);
 writePrivate(p.bridgeEnv,`GOVEE_BRIDGE_ORIGINS=${p.deployment.origin}\n`);
 writePrivate(p.serviceFile,p.unit,0o644);
 writePrivate(p.bin,fs.readFileSync(p.kioskScript,'utf8'),0o755);
 const previous=fs.existsSync(p.autostart)?fs.readFileSync(p.autostart,'utf8'):'';
 writePrivate(p.autostart,replaceAutoStart(previous,p.autostartCommand),0o644);
 return [p.kioskEnv,p.bridgeEnv,p.serviceFile,p.bin,p.autostart];
}
function systemctl(args){
 const result=spawnSync('systemctl',['--user',...args],{stdio:'inherit'});
 return !result.error&&result.status===0;
}
function main(args=process.argv.slice(2)){
 if(args.includes('--help')||args.includes('-h')){
  console.log('Auf Raspberry Pi OS (Desktop/labwc): node scripts/pi/install-v910.cjs --url https://DEIN-PROJEKT.vercel.app [--no-start]');return;
 }
 const index=args.indexOf('--url');if(index<0||!args[index+1])throw Error('Erforderlich: --url https://DEIN-PROJEKT.vercel.app');
 if(process.platform!=='linux')throw Error('Der Installer ist für Raspberry Pi OS / Linux vorgesehen.');
 const p=plan({url:args[index+1]});
 const files=install(p);
 console.log('Sonic Display V910 eingerichtet für '+p.deployment.url+'\n'+files.join('\n'));
 if(!args.includes('--no-start')){
  if(systemctl(['daemon-reload'])){
   if(!systemctl(['enable','--now',SERVICE]))console.warn('Bridge bitte nach dem Desktop-Login starten: systemctl --user enable --now '+SERVICE);
   else if(!systemctl(['restart',SERVICE]))console.warn('Bitte Dienst manuell neu starten: systemctl --user restart '+SERVICE);
  }else console.warn('Keine aktive systemd-Benutzersitzung. Nach Desktop-Login ausführen: systemctl --user daemon-reload && systemctl --user enable --now '+SERVICE);
 }
 console.log('Bridge-Status: systemctl --user status '+SERVICE);
 console.log('Bridge-Token anzeigen: node scripts/pi/print-govee-token-v910.cjs');
 console.log('Desktop-Autologin ggf. über sudo raspi-config aktivieren; danach Raspberry Pi neu starten.');
}
if(require.main===module){try{main();}catch(err){console.error('V910 Installer: '+err.message);process.exitCode=1;}}
module.exports={parseVercelUrl,replaceAutoStart,plan,install,main,BEGIN,END,SERVICE};
