'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const Module=require('node:module');
const path=require('node:path');
const ts=require('./typescript-loader.cjs');
const file=path.join(process.cwd(),'lib/avatarBlob.ts');
const snapshots=[];const entries=[];const content=new Map();
let counter=0;
function add(collection,pathname,data,uploadedAt){
 const url='https://mock.invalid/'+pathname;
 collection.push({pathname,url,uploadedAt:new Date(uploadedAt)});content.set(url,data);
}
for(let i=0;i<1001;i++)add(snapshots,`sonic/config/avatars-${String(i).padStart(5,'0')}.json`,{},1_000+i);
add(snapshots,'sonic/config/avatars-newest.json',{'model-a.glb':{label:'Old'},'model-b.glb':{label:'Prior'}},20_000);
let pages=0;
const api={
 async list({prefix,limit,cursor}){
  pages++;
  const source=prefix.includes('avatars-')?snapshots:entries;
  const index=Number(cursor||0);
  return {blobs:source.slice(index,index+limit),hasMore:index+limit<source.length,cursor:String(index+limit)};
 },
 async put(pathname,json){
  const data=JSON.parse(json);add(entries,pathname,data,30_000+counter++);
  return {pathname,url:'https://mock.invalid/'+pathname};
 }
};
const prior=process.env.BLOB_READ_WRITE_TOKEN;process.env.BLOB_READ_WRITE_TOKEN='test-token';
const oldFetch=global.fetch;
global.fetch=async url=>({ok:content.has(url),async json(){return content.get(url);}});
const original=Module._load;
const {load}=require("./helpers/ts-loader-v404.cjs");
const safety=load("lib/avatarConfigSafetyV658");
Module._load=function(id,parent,isMain){if(id==='@vercel/blob')return api;if(id==='./avatarConfigSafetyV658')return safety;return original.call(this,id,parent,isMain);};
(async()=>{
 try{
  const compiled=ts.transpileModule(fs.readFileSync(file,'utf8'),{fileName:file,compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText;
  const mod=new Module(file,module);mod.filename=file;mod.paths=Module._nodeModulePaths(path.dirname(file));mod._compile(compiled,file);
  const {readAvatarConfig,updateAvatarMetadata}=mod.exports;
  let current=await readAvatarConfig();
  assert.equal(current['model-a.glb'].label,'Old','newest snapshot on second list page');
  assert(pages>=2,'pagination must fetch second page');
  await Promise.all([
   updateAvatarMetadata('model-a.glb',{description:'First request'}),
   updateAvatarMetadata('model-b.glb',{description:'Second request'}),
   updateAvatarMetadata('model-a.glb',{category:'Concurrent update'}),
  ]);
  current=await readAvatarConfig();
  assert.deepEqual(current['model-a.glb'],{label:'Old',description:'First request',category:'Concurrent update'});
  assert.deepEqual(current['model-b.glb'],{label:'Prior',description:'Second request'});
  assert.equal(entries.length,3,'updates must be append-only, not overwrite a whole config');
  assert(entries.every(e=>e.pathname.startsWith('sonic/config/entry-')));
  console.log('PASS V654 Blob: newest configuration beyond page 1000, three parallel updates retained across two models');
 }finally{
  Module._load=original;global.fetch=oldFetch;
  if(prior===undefined)delete process.env.BLOB_READ_WRITE_TOKEN;
  else process.env.BLOB_READ_WRITE_TOKEN=prior;
 }
})().catch(e=>{console.error(e);process.exitCode=1;});
