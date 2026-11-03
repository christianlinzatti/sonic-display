#!/usr/bin/env node
'use strict';
/** V867: observe the unchanged mandatory V831 release gate and publish diagnostics, without bypassing a failure. */
const {spawn} = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const {buildPlatformReport,writeReport} = require('./v867-release-dashboard.cjs');
const ROOT = path.resolve(__dirname,'..');
const npm=process.platform==='win32'?'cmd.exe':'npm';
const args=process.platform==='win32'?['/d','/c','npm run verify:production:v831']:['run','verify:production:v831'];
let log='';
const append=s=>{log=(log+s).slice(-48000);};
// Clear stale artifacts before launching the mandatory gate. A previous green report cannot mask a failed start.
for(const name of ['v831-production-gate-result.json','v867-release-dashboard.json','v867-release-dashboard.html']) {
  try { fs.rmSync(path.join(ROOT,name),{force:true}); } catch (e) { console.error('V867: Altes Ergebnis konnte nicht entfernt werden:',e.message); process.exit(1); }
}
const child=spawn(npm,args,{cwd:ROOT,env:process.env,windowsHide:true,stdio:['inherit','pipe','pipe']});
child.stdout.on('data',buffer=>{const str=buffer.toString();process.stdout.write(str);append(str);});
child.stderr.on('data',buffer=>{const str=buffer.toString();process.stderr.write(str);append(str);});
function readJson(p){try{return JSON.parse(fs.readFileSync(p,'utf8'));}catch{return null;}}
child.on('error',e=>{append('\n'+e.stack);});
child.on('close',(code,signal)=>{
  const gate=readJson(path.join(ROOT,'v831-production-gate-result.json'));
  const readiness=gate?.readiness||readJson(path.join(ROOT,'v831-build-readiness-result.json'));
  const report=buildPlatformReport({gate,readiness,log,platform:process.env.V867_PLATFORM||process.platform,exitCode:code===null?1:code});
  writeReport(report,ROOT);
  console.log('V867: dashboard erstellt; status:',report.status,'Diagnose:',report.diagnosis?.category||'keine');
  if(signal)console.error('V867: Gate durch Signal beendet:',signal);
  process.exitCode=(code===0&&report.technicalGatesPassed)?0:(code||1);
});
