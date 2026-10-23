/** V185 browser-local named snapshots and migration diagnostics. No secrets or binary files. */
import { createUnifiedBackup, groupForBackupKey, parseUnifiedBackup, previewUnifiedBackup, type BackupData, type BackupGroup } from './unifiedBackup';
export const BACKUP_MANAGER_KEY='sonic-display:v185:backup-manager';
export const MAX_SNAPSHOTS=6;
export type NamedSnapshot={id:string;name:string;createdAt:string;data:BackupData};
export type BackupComparison={added:string[];changed:string[];removed:string[];unchanged:number;groups:Partial<Record<BackupGroup,number>>};
export type ReferencedAsset={path:string;source:string;kind:'local'|'external'|'ephemeral'};
const assetRegex=/(?:https?:\/\/[^\s"'<>\\]+|blob:[^\s"'<>\\]+|\/(?:avatars?|animations?|models?|uploads?|assets?)\/[^\s"'<>\\]+?\.(?:glb|gltf|fbx|bvh|vrm|obj|bin|png|jpe?g|webp))/gi;
const trimAsset=(v:string)=>v.replace(/[),;]+$/,'');
export function analyzeAssetReferences(data:BackupData):ReferencedAsset[]{
 const discovered=new Map<string,ReferencedAsset>();
 for(const [key,value] of Object.entries(data.entries)){
  if(groupForBackupKey(key)!=='avatar')continue;
  for(const hit of value.matchAll(assetRegex)){
   const path=trimAsset(hit[0]);const kind=path.startsWith('blob:')?'ephemeral':path.startsWith('http')?'external':'local';
   if(!discovered.has(path))discovered.set(path,{path,source:key,kind});
  }
 }
 return Array.from(discovered.values()).slice(0,150);
}
export function compareBackups(target:BackupData,current:BackupData):BackupComparison{
 const added:string[]=[],changed:string[]=[],removed:string[]=[];let unchanged=0;
 const groups:Partial<Record<BackupGroup,number>>={};
 for(const [k,v] of Object.entries(target.entries)){
  if(!(k in current.entries))added.push(k);else if(current.entries[k]!==v)changed.push(k);else unchanged++;
  const group=groupForBackupKey(k);if(group)groups[group]=(groups[group]||0)+1;
 }
 for(const k of Object.keys(current.entries))if(!(k in target.entries))removed.push(k);
 return {added,changed,removed,unchanged,groups};
}
export function parseNamedSnapshots(text:string):NamedSnapshot[]{
 if(text.length>8*1024*1024)throw new Error('Sicherungsverlauf zu groß.');
 const input:unknown=JSON.parse(text);
 if(!Array.isArray(input)||input.length>MAX_SNAPSHOTS)throw new Error('Ungültiger Sicherungsverlauf.');
 return input.map((item:unknown)=>{
  if(!item||typeof item!=='object')throw new Error('Ungültiger Sicherungseintrag.');
  const e=item as Partial<NamedSnapshot>;
  if(typeof e.id!=='string'||!/^[\w-]{1,70}$/.test(e.id)||typeof e.name!=='string'||e.name.length>70||typeof e.createdAt!=='string'||!e.data)throw new Error('Ungültige Sicherungsmetadaten.');
  const data=parseUnifiedBackup(JSON.stringify(e.data));
  return {id:e.id,name:e.name,createdAt:e.createdAt,data};
 });
}
export function loadSnapshots(storage:Pick<Storage,'getItem'>):NamedSnapshot[]{
 try{const raw=storage.getItem(BACKUP_MANAGER_KEY);return raw?parseNamedSnapshots(raw):[];}catch{return [];}
}
export function createSnapshot(storage:Pick<Storage,'length'|'key'|'getItem'|'setItem'>,name:string):NamedSnapshot[]{
 const clean=name.trim().slice(0,70);if(!clean)throw new Error('Bitte eine Bezeichnung eingeben.');
 const old=loadSnapshots(storage);
 const snapshot:NamedSnapshot={id:`${Date.now()}-${Math.random().toString(36).slice(2,10)}`,name:clean,createdAt:new Date().toISOString(),data:createUnifiedBackup(storage)};
 const next=[snapshot,...old].slice(0,MAX_SNAPSHOTS);
 storage.setItem(BACKUP_MANAGER_KEY,JSON.stringify(next));return next;
}
export function removeSnapshot(storage:Pick<Storage,'getItem'|'setItem'>,id:string):NamedSnapshot[]{
 const next=loadSnapshots(storage).filter(s=>s.id!==id);storage.setItem(BACKUP_MANAGER_KEY,JSON.stringify(next));return next;
}
export function previewSnapshot(snapshot:NamedSnapshot,storage:Pick<Storage,'getItem'>){return previewUnifiedBackup(snapshot.data,storage);}
