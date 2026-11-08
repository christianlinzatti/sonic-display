#!/usr/bin/env node
'use strict';
const fs=require('node:fs'),path=require('node:path');
/**
 * Keep the visible Actions run titles on the actual imported version.
 * Only writes the top-level `run-name` line. Never executes workflow content,
 * changes triggers, credentials, permissions, actions, or job steps.
 * The protected importer calls --apply after validation, before staging Git.
 */
function formatActionTitlesV1016(root,apply=false){
 const pkg=JSON.parse(fs.readFileSync(path.join(root,'package.json'),'utf8'));
 const v=/^0\.1\.0-v([1-9]\d*)$/.exec(pkg.version);
 if(!v||pkg.sonicFeatureRelease!==`v${v[1]}`||pkg.sonicRoadmapRelease!==`v${v[1]}`)
  throw Error('Cannot retitle workflows: inconsistent release metadata');
 const release=`V${v[1]}`,directory=path.join(root,'.github/workflows');
 let changed=0;
 const mismatched=[];
 const files=fs.readdirSync(directory).filter(x=>/\.ya?ml$/.test(x));
 for(const filename of files){
  const file=path.join(directory,filename),original=fs.readFileSync(file,'utf8');
  // Never use a value supplied by an untrusted ZIP as an expression.
  const name=/^name:\s*(.+)\s*$/m.exec(original)?.[1]?.trim();
  if(!name)throw Error(`Invalid workflow heading: ${filename}`);
  let runName;
  if(filename==='v965-room-wave-production.yml')
   runName=`Sonic Display · \${{ inputs.release || '${release}' }} · Production & Playwright · \${{ github.event_name }}`;
  else if(filename==='project-archive-import.yml')
   runName=`Sonic Display · \${{ inputs.archive || '${release}' }} · Projekt-ZIP-Import`;
  else if(filename==='v965-deployment-smoke.yml')
   runName=`Sonic Display · ${release} · Deployment reachability · manuell`;
  else runName=`Sonic Display · ${release} · ${name.replace(/^Sonic Display\s*[·–-]?\s*/,'')}`;
  // One top-level run-name only; leave all other YAML bytes exactly as-is.
  const without=original.replace(/^run-name:[^\n]*(?:\n|$)/gm,'');
  const desired=without.replace(/^name:[^\n]*\n/m,(line)=>line+`run-name: ${runName}\n`);
  if(desired!==original){changed++;mismatched.push(filename);if(apply)fs.writeFileSync(file,desired,'utf8');}
 }
 return {release,total:files.length,changed,mismatched};
}
if(require.main===module){try{
 const apply=process.argv.includes('--apply'),check=process.argv.includes('--check');
 const result=formatActionTitlesV1016(path.resolve(__dirname,'..'),apply);
 console.log(`${result.release} Actions: ${result.total} Workflow-Titel, ${result.changed} ${apply?'aktualisiert':'abweichend'}`);
 if(check&&result.changed){
  console.error('Protected workflow titles differ from the imported release: '+result.mismatched.join(', '));
  console.error('The ZIP importer does not replace .github/workflows; synchronize these trusted files with a workflow-authorized GitHub connection.');
  process.exitCode=1;
 }
}catch(error){console.error(error);process.exitCode=1;}}
module.exports={formatActionTitlesV1016};
