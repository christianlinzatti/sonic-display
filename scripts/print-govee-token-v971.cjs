#!/usr/bin/env node
'use strict';
/** Prints the token only when explicitly invoked by the local operator. */
const fs=require('node:fs');const os=require('node:os');const path=require('node:path');
try{
 const token=process.env.GOVEE_BRIDGE_TOKEN||fs.readFileSync(path.join(os.homedir(),'.sonic-display','govee-bridge-token'),'utf8').trim();
 if(token.length<24)throw Error('token invalid');
 process.stdout.write('Dein privates Bridge-Token (nicht weitergeben):\n'+token+'\n');
}catch{console.error('Bridge-Token fehlt. Erst die Bridge mit start-govee-bridge.cmd oder bash start-govee-bridge.sh starten.');process.exitCode=1;}
