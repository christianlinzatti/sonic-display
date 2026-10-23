import {validProfile,storeProfile,type DevicePerformanceProfile} from './adaptivePerformanceProfilesV267';
export const BACKUP_FORMAT='sonic-display.performance-profiles';
export const BACKUP_VERSION=1;
export const MAX_BACKUP_BYTES=256*1024;
export type BackupConflict='skip'|'replace';
export type ParsedBackup=Readonly<{exportedAt:string;profiles:DevicePerformanceProfile[]}>;
export type ImportChoice=Readonly<{id:string;selected:boolean;conflict:BackupConflict}>;
export function exportProfileBackup(profiles:readonly DevicePerformanceProfile[],now=new Date()):string{
 if(profiles.length>30||profiles.some(p=>!validProfile(p)))throw new Error('Ungültige Profile können nicht exportiert werden.');
 return JSON.stringify({format:BACKUP_FORMAT,version:BACKUP_VERSION,exportedAt:now.toISOString(),profiles},null,2);
}
export function parseProfileBackup(text:string):ParsedBackup{
 if(new TextEncoder().encode(text).byteLength>MAX_BACKUP_BYTES)throw new Error('Die Sicherung ist zu groß (max. 256 KB).');
 let raw:unknown;
 try{raw=JSON.parse(text);}catch{throw new Error('Die Datei enthält kein gültiges JSON.');}
 if(!raw||typeof raw!=='object'||Array.isArray(raw))throw new Error('Ungültiges Sicherungsformat.');
 const b=raw as Record<string,unknown>;
 if(b.format!==BACKUP_FORMAT||b.version!==BACKUP_VERSION)throw new Error('Unbekanntes Sicherungsformat oder Versionsnummer.');
 if(typeof b.exportedAt!=='string'||!Number.isFinite(Date.parse(b.exportedAt)))throw new Error('Ungültiges Exportdatum.');
 if(!Array.isArray(b.profiles)||b.profiles.length>30)throw new Error('Die Sicherung enthält zu viele oder keine gültige Profilliste.');
 if(b.profiles.some(p=>!validProfile(p)))throw new Error('Die Sicherung enthält ungültige Profilwerte.');
 const ids=new Set<string>();
 for(const p of b.profiles as DevicePerformanceProfile[]){if(ids.has(p.id))throw new Error('Doppelte Profil-IDs in der Sicherung.');ids.add(p.id);}
 return {exportedAt:b.exportedAt,profiles:b.profiles as DevicePerformanceProfile[]};
}
export function mergeImportedProfiles(existing:readonly DevicePerformanceProfile[],incoming:readonly DevicePerformanceProfile[],choices:readonly ImportChoice[]):DevicePerformanceProfile[]{
 const choiceById=new Map(choices.map(c=>[c.id,c]));
 let next=[...existing];
 for(const profile of incoming){
  if(!validProfile(profile))continue;
  const choice=choiceById.get(profile.id);
  if(!choice?.selected)continue;
  if(next.some(p=>p.id===profile.id)&&choice.conflict!=='replace')continue;
  next=storeProfile(next,profile);
 }
 return next;
}
