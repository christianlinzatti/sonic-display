#!/usr/bin/env node
'use strict';
// Explicit, user-initiated display. Never print the token in the background systemd journal.
const fs=require('node:fs');
const os=require('node:os');
const path=require('node:path');
const filename=path.join(os.homedir(),'.sonic-display','govee-bridge-token');
try{
 const token=fs.readFileSync(filename,'utf8').trim();
 if(token.length<24)throw Error('Token zu kurz.');
 console.log(token);
}catch{
 console.error('Noch kein Bridge-Token: Bitte zuerst die Bridge starten (systemctl --user start sonic-govee-bridge-v910.service).');
 process.exitCode=1;
}
