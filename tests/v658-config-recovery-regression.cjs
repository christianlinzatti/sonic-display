'use strict';
/** V658 functional tests: deterministic conflict projection, local atomic backup + recovery,
 * shared-Blob optimistic revisions, malformed immutable entries, 1000+ pagination.
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const fsp=require('node:fs/promises');
const path=require('node:path');
const Module=require('node:module');
const os=require('node:os');
const ts=require('./typescript-loader.cjs');
const {load}=require('./helpers/ts-loader-v404.cjs');
const safety=load('lib/avatarConfigSafetyV658');
const r1=safety.revisionV658({name:'One',genre:['rap'],favorite:true});
assert.equal(r1,safety.revisionV658({favorite:true,genre:['rap'],name:'One'}));
const base=Object.assign(Object.create(null),{'artist.glb':{name:'One'}});
const expected=safety.revisionV658(base['artist.glb']);
const events=[{filename:'artist.glb',patch:{name:'Two'},expectedRevision:expected,opId:'a'},
 {filename:'artist.glb',patch:{name:'Three'},expectedRevision:expected,opId:'b'},
 {filename:'second.glb',patch:{genre:'hardtekk'},opId:'c'}];
const projected=safety.projectAvatarJournalV658(base,events);
assert.equal(projected.config['artist.glb'].name,'Two');
assert.equal(projected.config['second.glb'].genre,'hardtekk');
assert.deepEqual(projected.conflicts.map(c=>c.opId),['b']);
assert(projected.applied.has('a')&&!projected.applied.has('b'));
assert.throws(()=>safety.normalizeAvatarConfigV658(JSON.parse('{"__proto__":{"x":1}}')),/Invalid/);
// The old V654 test deliberately compiles avatarBlob.ts alone; module dependency is injected.
const oldLoad=Module._load;
const oldToken=process.env.BLOB_READ_WRITE_TOKEN;
const oldFetch=global.fetch;
const oldCwd=process.cwd();
const file=path.join(oldCwd,'lib/avatarBlob.ts');
const compiled=ts.transpileModule(fs.readFileSync(file,'utf8'),{fileName:file,
 compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText;
function importAvatarBlob(api){
 Module._load=function(id,parent,isMain){
  if(id==='@vercel/blob')return api;
  if(id==='./avatarConfigSafetyV658')return safety;
  return oldLoad.call(this,id,parent,isMain);
 };
 try{const mod=new Module(file,module);mod.filename=file;mod.paths=Module._nodeModulePaths(path.dirname(file));mod._compile(compiled,file);return mod.exports;}
 finally{Module._load=oldLoad;}
}
async function main(){
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'sonic-v658-config-'));
 try{
  delete process.env.BLOB_READ_WRITE_TOKEN;process.chdir(dir);
  const local=importAvatarBlob({list(){throw Error('blob unused')},put(){throw Error('blob unused')}});
  const v0=safety.revisionV658({});
  await local.updateAvatarMetadata('model.glb',{label:'A'},{expectedRevision:v0});
  const first=await local.readAvatarConfigStateV658();
  assert.equal(first.metadata['model.glb'].label,'A');
  assert.equal(first.diagnostics.source,'primary');
  const revision=first.revisions['model.glb'];
  const pair=await Promise.allSettled([
   local.updateAvatarMetadata('model.glb',{label:'B'},{expectedRevision:revision}),
   local.updateAvatarMetadata('model.glb',{label:'C'},{expectedRevision:revision})
  ]);
  assert.equal(pair.filter(p=>p.status==='fulfilled').length,1);
  assert.equal(pair.filter(p=>p.status==='rejected'&&p.reason.status===409).length,1);
  const current=await local.readAvatarConfigStateV658();
  assert.equal(current.metadata['model.glb'].label,'B');
  assert(current.diagnostics.backupAvailable);
  const mainFile=path.join(dir,'data','avatars.local.json');
  fs.writeFileSync(mainFile,'{ corrupted JSON');
  const fallback=await local.readAvatarConfigStateV658();
  assert.equal(fallback.diagnostics.source,'backup');
  assert.equal(fallback.metadata['model.glb'].label,'A');
  await local.restoreAvatarLocalBackupV658();
  const restored=await local.readAvatarConfigStateV658();
  assert.equal(restored.diagnostics.source,'primary');
  assert.equal(restored.metadata['model.glb'].label,'A');
  // Failure to read either copy MUST NOT silently reset to empty config.
  fs.writeFileSync(mainFile,'broken');fs.writeFileSync(mainFile+'.bak','broken');
  await assert.rejects(local.readAvatarConfigStateV658(),e=>e.status===503);
  console.log('PASS V658 local: concurrent same-model edits reject stale revision; previous file restores after corruption; double corruption blocks writes');
 }finally{process.chdir(oldCwd);await fsp.rm(dir,{recursive:true,force:true});}
 try{
  process.env.BLOB_READ_WRITE_TOKEN='test-token';
  const snapshots=[];const entries=[];const content=new Map();let counter=0;
  function add(collection,pathname,data,time){const url='https://mock.invalid/'+pathname;collection.push({pathname,url,uploadedAt:new Date(time)});content.set(url,data);}
  for(let i=0;i<1001;i++)add(snapshots,`sonic/config/avatars-${String(i).padStart(5,'0')}.json`,{},1_000+i);
  add(snapshots,'sonic/config/avatars-good.json',{'model.glb':{label:'Original'}},20_000);
  add(snapshots,'sonic/config/avatars-corrupt.json','BAD',21_000);
  const api={
   async list({prefix,limit,cursor}){const source=prefix.includes('avatars-')?snapshots:entries;const start=Number(cursor||0);return{blobs:source.slice(start,start+limit),hasMore:start+limit<source.length,cursor:String(start+limit)};},
   async put(pathname,json){add(entries,pathname,JSON.parse(json),30_000+counter++);return{pathname,url:'https://mock.invalid/'+pathname};}
  };
  global.fetch=async url=>({ok:content.has(url),async json(){const data=content.get(url);if(data==='BAD')throw Error('corrupted snapshot');return data;}});
  const blob=importAvatarBlob(api);
  const starting=await blob.readAvatarConfigStateV658();
  assert.equal(starting.metadata['model.glb'].label,'Original');
  assert(starting.diagnostics.warnings.some(x=>x.includes('corrupt')));
  const revision=starting.revisions['model.glb'];
  const pair=await Promise.allSettled([
   blob.updateAvatarMetadata('model.glb',{label:'One'},{expectedRevision:revision}),
   blob.updateAvatarMetadata('model.glb',{label:'Two'},{expectedRevision:revision}),
   blob.updateAvatarMetadata('another.glb',{favorite:true},{expectedRevision:safety.revisionV658({})})
  ]);
  const combined=await blob.readAvatarConfigStateV658();
  assert(['One','Two'].includes(combined.metadata['model.glb'].label));
  assert.equal(combined.metadata['another.glb'].favorite,true);
  assert.equal(combined.diagnostics.journalConflicts.length,1,'same revision twice cannot silently overwrite first event');
  assert.equal(pair[2].status,'fulfilled');
  assert(pair.slice(0,2).some(p=>p.status==='rejected'&&p.reason.status===409));
  assert(entries.every(e=>e.pathname.startsWith('sonic/config/entry-')));
  // Bad immutable events do not silently disappear and cannot be followed by a blind overwrite.
  add(entries,'sonic/config/entry-broken.json','BAD',40_000);
  const unsafe=await blob.readAvatarConfigStateV658();
  assert.equal(unsafe.diagnostics.unsafe,true);
  await assert.rejects(blob.updateAvatarMetadata('another.glb',{favorite:false}),e=>e.status===503);
  console.log('PASS V658 Blob: 1000+ pagination, broken snapshot fallback, convergent same-model conflicts, cross-model preservation, corrupt journal safety');
 }finally{
  global.fetch=oldFetch;
  if(oldToken===undefined)delete process.env.BLOB_READ_WRITE_TOKEN;else process.env.BLOB_READ_WRITE_TOKEN=oldToken;
 }
 const route=fs.readFileSync('app/api/avatars/config/route.ts','utf8');
 const ui=fs.readFileSync('components/SettingsPanel.tsx','utf8');
 const recovery=fs.readFileSync('app/api/avatars/config/recovery/route.ts','utf8');
 for(const token of ['expectedRevision','currentRevision','status:409','readAvatarConfigStateV658','emptyRevision'])assert(route.includes(token),token);
 for(const token of ['avatarRevisionRef','expectedRevision:avatarRevisionRef.current','response.status===409','restoreAvatarBackup','avatarRecovery'])assert(ui.includes(token),token);
 for(const token of ['isAdmin','sameOrigin','restoreAvatarLocalBackupV658','confirmed!==true'])assert(recovery.includes(token),token);
 console.log('PASS V658 API/UI: admin-only recovery, origin/confirmation, revision-aware edit, explicit conflict feedback');
}
main().catch(e=>{console.error(e);process.exitCode=1;});
