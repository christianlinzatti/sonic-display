import {list,put} from '@vercel/blob';
import {readFile,writeFile,mkdir,rename,copyFile,rm,open} from 'node:fs/promises';
import path from 'node:path';
import {randomUUID} from 'node:crypto';
import {
  type AvatarRecordV658, type AvatarJournalEventV658, type AvatarJournalConflictV658,
  isAvatarRecordV658, normalizeAvatarConfigV658, projectAvatarJournalV658,
  revisionV658,validConfigKeyV658,AvatarRevisionConflictV658,AvatarConfigUnsafeV658,
} from './avatarConfigSafetyV658';
export const useBlob=Boolean(process.env.BLOB_READ_WRITE_TOKEN);
const configFile=path.join(process.cwd(),'data','avatars.local.json');
const backupFile=configFile+'.bak';
export type Metadata=Record<string,unknown>;
type StoredBlob={pathname:string;url:string;uploadedAt:Date};
export type AvatarConfigStateV658={
  metadata:Record<string,Metadata>;revisions:Record<string,string>;
  diagnostics:{source:string;warnings:string[];journalConflicts:AvatarJournalConflictV658[];unsafe:boolean;backupAvailable:boolean};
  applied:Set<string>;
};
async function allConfigBlobs(prefix:string):Promise<StoredBlob[]>{
  const result:StoredBlob[]=[];
  let cursor:string|undefined;const seen=new Set<string>();
  do{
    const page=await list({prefix,limit:1000,cursor});
    result.push(...page.blobs);
    if(!page.hasMore)break;
    const nextCursor=page.cursor;
    if(!nextCursor||seen.has(nextCursor))throw new Error('Configuration listing pagination loop');
    cursor=nextCursor;seen.add(nextCursor);
  }while(true);
  return result;
}
async function fetchJson(url:string):Promise<unknown>{
  const response=await fetch(url,{cache:'no-store'});
  if(!response.ok)throw Error('Blob config read failed');
  return response.json();
}
async function readLocal(source:string):Promise<Record<string,Metadata>>{
  const raw=JSON.parse(await readFile(source,'utf8'));
  return normalizeAvatarConfigV658(raw);
}
const missing=(e:unknown)=> (e as NodeJS.ErrnoException)?.code==='ENOENT';
export async function readAvatarConfigStateV658():Promise<AvatarConfigStateV658>{
  const warnings:string[]=[];
  if(useBlob){
    let baseline:Record<string,Metadata>=Object.create(null);
    let source='empty';
    let unsafe=false;
    const snapshots=(await allConfigBlobs('sonic/config/avatars-'))
      .filter(b=>/^sonic\/config\/avatars-[\w-]+\.json$/.test(b.pathname))
      .sort((a,b)=>b.uploadedAt.getTime()-a.uploadedAt.getTime()||b.pathname.localeCompare(a.pathname));
    for(const snapshot of snapshots){
      try{baseline=normalizeAvatarConfigV658(await fetchJson(snapshot.url));source=snapshot.pathname;break;}
      catch{warnings.push(`Beschädigter/unlesbarer Snapshot: ${snapshot.pathname}`);}
    }
    if(snapshots.length&&source==='empty'){unsafe=true;warnings.push('Kein gültiger Snapshot gefunden');}
    const patches=(await allConfigBlobs('sonic/config/entry-'))
      .filter(b=>/^sonic\/config\/entry-[\w-]+\.json$/.test(b.pathname))
      .sort((a,b)=>a.uploadedAt.getTime()-b.uploadedAt.getTime()||a.pathname.localeCompare(b.pathname));
    const events:AvatarJournalEventV658[]=[];
    for(let offset=0;offset<patches.length;offset+=12){
      const batch=await Promise.allSettled(patches.slice(offset,offset+12).map(p=>fetchJson(p.url)));
      batch.forEach((item,i)=>{
        const filename=patches[offset+i].pathname;
        const raw=item.status==='fulfilled'?item.value:null;
        if(!isAvatarRecordV658(raw)){
          unsafe=true;warnings.push(`Unvollständiger/ungültiger Journal-Eintrag: ${filename}`);return;
        }
        const name=raw.filename;
        const patch=raw.patch;
        if(typeof name!=='string'||!validConfigKeyV658(name)||!isAvatarRecordV658(patch)){
          unsafe=true;warnings.push(`Unvollständiger/ungültiger Journal-Eintrag: ${filename}`);return;
        }
        if(raw.expectedRevision!==undefined&&
           (typeof raw.expectedRevision!=='string'||!/^[a-f0-9]{64}$/.test(raw.expectedRevision))){
          unsafe=true;warnings.push(`Ungültige Revision: ${filename}`);return;
        }
        events.push({filename:name,patch,
          ...(typeof raw.expectedRevision==='string'?{expectedRevision:raw.expectedRevision}:{}),
          ...(typeof raw.opId==='string'?{opId:raw.opId}:{})});
      });
    }
    const result=projectAvatarJournalV658(baseline,events);
    if(result.conflicts.length)warnings.push(`${result.conflicts.length} konkurrierende Avatar-Änderung(en) verworfen, im Journal erhalten`);
    return {metadata:result.config,revisions:result.revisions,applied:result.applied,
      diagnostics:{source,warnings,journalConflicts:result.conflicts,unsafe,backupAvailable:snapshots.length>1}};
  }
  let metadata:Record<string,Metadata>;
  let source='primary';
  let backupAvailable=false;
  try{await readLocal(backupFile);backupAvailable=true;}catch{}
  try{metadata=await readLocal(configFile);}
  catch(error){
    if(!missing(error))warnings.push('Aktuelle Avatar-Konfiguration unlesbar; versuche Sicherungskopie');
    try{metadata=await readLocal(backupFile);source='backup';warnings.push('Avatar-Konfiguration aus letzter gültiger Sicherung gelesen');}
    catch(backupError){
      if(!missing(error)||!missing(backupError))throw new AvatarConfigUnsafeV658();
      metadata=Object.create(null);source='empty';
    }
  }
  const revisions=Object.fromEntries(Object.entries(metadata).map(([k,v])=>[k,revisionV658(v)]));
  return {metadata,revisions,applied:new Set(),diagnostics:{source,warnings,journalConflicts:[],unsafe:false,backupAvailable}};
}
export async function readAvatarConfig():Promise<Record<string,Metadata>>{
  return (await readAvatarConfigStateV658()).metadata;
}
let pendingWrite:Promise<void>=Promise.resolve();
export function updateAvatarMetadata(filename:string,patch:Metadata,options:{expectedRevision?:string}={}):Promise<void>{
  if(!validConfigKeyV658(filename)||!isAvatarRecordV658(patch))return Promise.reject(new Error('Invalid avatar update'));
  if(useBlob){
    return (async()=>{
      const before=await readAvatarConfigStateV658();
      if(before.diagnostics.unsafe)throw new AvatarConfigUnsafeV658();
      const current=before.revisions[filename]??revisionV658({});
      if(options.expectedRevision!==undefined&&options.expectedRevision!==current)
        throw new AvatarRevisionConflictV658(current);
      const opId=randomUUID();
      await put(`sonic/config/entry-${randomUUID()}.json`,JSON.stringify({filename,patch,opId,
        ...(options.expectedRevision===undefined?{}:{expectedRevision:options.expectedRevision})}),
        {access:'public',contentType:'application/json',addRandomSuffix:false});
      // Verification does not replace a transactional/CAS store. Projection deterministically
      // rejects competing revisions even if requests raced on different Vercel instances.
      if(options.expectedRevision!==undefined){
        const after=await readAvatarConfigStateV658();
        if(after.diagnostics.unsafe)throw new AvatarConfigUnsafeV658();
        if(!after.applied.has(opId)){
          const conflict=after.diagnostics.journalConflicts.find(c=>c.opId===opId);
          if(conflict)throw new AvatarRevisionConflictV658(conflict.actualRevision);
          // Blob listing may be eventually consistent: do not claim a confirmed commit.
          throw new Error('Konfigurationsänderung noch nicht bestätigt. Bitte erneut laden.');
        }
      }
    })();
  }
  const operation=pendingWrite.catch(()=>{}).then(async()=>{
    const current=await readAvatarConfigStateV658();
    if(current.diagnostics.unsafe)throw new AvatarConfigUnsafeV658();
    const actual=current.revisions[filename]??revisionV658({});
    if(options.expectedRevision!==undefined&&options.expectedRevision!==actual)
      throw new AvatarRevisionConflictV658(actual);
    const merged={...current.metadata,[filename]:{...(current.metadata[filename]??{}),...patch}};
    await writeAvatarConfig(merged);
  });
  pendingWrite=operation;
  return operation;
}
/** Atomic replacement: a valid previous file is backed up before committing the new file. */
export async function writeAvatarConfig(config:Record<string,Metadata>):Promise<void>{
  normalizeAvatarConfigV658(config);
  if(useBlob){
    await put(`sonic/config/avatars-${randomUUID()}.json`,JSON.stringify(config,null,2),
      {access:'public',contentType:'application/json',addRandomSuffix:false});
    return;
  }
  await mkdir(path.dirname(configFile),{recursive:true});
  const tmp=configFile+'.'+randomUUID()+'.tmp';
  const backupTmp=backupFile+'.'+randomUUID()+'.tmp';
  try{
    const handle=await open(tmp,'wx');
    try{await handle.writeFile(JSON.stringify(config,null,2));await handle.sync();}finally{await handle.close();}
    // Never replace a valid backup with corrupt primary content.
    try{
      await readLocal(configFile);
      await copyFile(configFile,backupTmp);
      await rename(backupTmp,backupFile);
    }catch(error){if(!missing(error)&&!(error instanceof SyntaxError)&&!(error instanceof Error&&/Invalid avatar config/.test(error.message)))throw error;}
    await rename(tmp,configFile);
  }finally{await Promise.allSettled([rm(tmp,{force:true}),rm(backupTmp,{force:true})]);}
}
export async function restoreAvatarLocalBackupV658():Promise<void>{
  if(useBlob)throw new Error('Blob-Snapshots werden automatisch als Lese-Fallback verwendet; keine lokale Sicherung verfügbar');
  const operation=pendingWrite.catch(()=>{}).then(async()=>{
    const backup=await readLocal(backupFile);
    await writeAvatarConfig(backup);
  });
  pendingWrite=operation;
  return operation;
}
export async function blobModels(){
  if(!useBlob)return [];
  const results:StoredBlob[]=[];let cursor:string|undefined;
  do{const page=await list({prefix:'sonic/models/',limit:1000,cursor});results.push(...page.blobs);cursor=page.hasMore?page.cursor:undefined;}while(cursor);
  return results.filter(x=>/\.glb$/i.test(x.pathname));
}
