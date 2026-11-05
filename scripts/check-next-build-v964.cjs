#!/usr/bin/env node
'use strict';
/** V964 deployment artifact check: validates emitted Next.js build metadata.
 * Required AFTER a genuine Next.js build, never a substitute for compilation.
 * No routes or secrets are uploaded; only a bounded status summary is printed.
 */
const fs=require('node:fs');
const path=require('node:path');
function inspectBuild(root,notBeforeMs){
 const directory=path.join(root,'.next');
 const issues=[];
 const read=(name)=>{
  const full=path.join(directory,name);
  try {
   const stat=fs.statSync(full);
   if(!stat.isFile()||stat.size<=0)throw Error('empty');
   if(Number.isFinite(notBeforeMs)&&notBeforeMs>0&&stat.mtimeMs+2000<notBeforeMs)
    throw Error('stale');
   return fs.readFileSync(full,'utf8');
  } catch(e){issues.push(name+': '+(e.code||e.message));return null;}
 };
 const buildId=read('BUILD_ID');
 if(buildId&&!/^[\w-]{8,200}\s*$/.test(buildId))issues.push('BUILD_ID: invalid id');
 const manifests=['build-manifest.json','prerender-manifest.json','server/app-paths-manifest.json'];
 let appPages=0;
 for(const file of manifests){
  const raw=read(file);
  if(!raw)continue;
  try {
   const data=JSON.parse(raw);
   if(!data||typeof data!=='object'||Array.isArray(data))throw Error('invalid object');
   if(file==='server/app-paths-manifest.json'){
    appPages=Object.keys(data).filter(x=>x.endsWith('/page')||x==='/page').length;
    if(appPages===0)issues.push('No app router pages emitted');
   } else if(file==='build-manifest.json' && !data.pages)issues.push('No webpack page manifest');
   else if(file==='prerender-manifest.json'&&!data.routes)issues.push('No prerender manifest routes');
  }catch(e){issues.push(file+': '+e.message);}
 }
 return {passed:issues.length===0,issues,appPageCount:appPages};
}
if(require.main===module){
 const notBeforeMs=Number(process.argv[2]);
 if(!Number.isFinite(notBeforeMs)||notBeforeMs<0){
  console.error('NEXT_BUILD_ARTIFACT_V964 FAIL: invalid start timestamp');process.exitCode=1;
 }else{
  const result=inspectBuild(path.resolve(__dirname,'..'),notBeforeMs);
  console.log('NEXT_BUILD_ARTIFACT_V964 '+(result.passed?'PASS':'FAIL')+': '+
   result.appPageCount+' app routes; '+result.issues.join('; '));
  if(!result.passed)process.exitCode=1;
 }
}
module.exports={inspectBuild};
