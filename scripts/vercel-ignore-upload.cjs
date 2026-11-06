#!/usr/bin/env node
'use strict';
/** Vercel ignored build step: exit 0 only for Git pushes containing an archive upload.
 * Everything else, including missing Git history, must be built (exit 1).
 * This avoids a redundant Vercel build just before GitHub Actions imports the ZIP.
 */
const path=require('node:path');
const {spawnSync}=require('node:child_process');
const root=path.resolve(__dirname,'..');
// Same safe, versioned filename grammar as scripts/project-archive-import.py.
// A descriptive suffix must not trigger an unnecessary pre-import Vercel build.
const ZIP_ONLY=/^releases\/SonicDisplay-V[1-9]\d*(?:-[A-Za-z0-9](?:[A-Za-z0-9._-]*[A-Za-z0-9])?)?\.zip$/;
function shouldSkipForPaths(paths) {
  return Array.isArray(paths) && paths.length>0 && paths.every(p=>
    typeof p==='string' && ZIP_ONLY.test(p) &&
    Buffer.byteLength(p.slice('releases/'.length),'utf8')<=255);
}
function main(){
  const result=spawnSync('git',['diff','--name-only','HEAD^','HEAD'],{
    cwd:root,encoding:'utf8',timeout:10000,windowsHide:true});
  if(result.error||result.status!==0){
    console.log('Vercel build kept: Git parent/diff unavailable');
    process.exitCode=1;return;
  }
  const paths=result.stdout.trim().split(/\r?\n/).filter(Boolean);
  const skip=shouldSkipForPaths(paths);
  console.log(skip
    ? 'Vercel skip: archive-only commit, awaiting imported project source commit'
    : 'Vercel build kept: code/config changes or uncertain Git diff');
  process.exitCode=skip?0:1;
}
if(require.main===module)main();
module.exports={shouldSkipForPaths};
