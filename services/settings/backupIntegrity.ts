/** V186: portable integrity envelope and migration diagnostics. Checksum detects accidental changes, not malicious tampering. */
import {MAX_BACKUP_BYTES,parseUnifiedBackup,previewUnifiedBackup,applyUnifiedBackup,groupForBackupKey,type BackupData,type BackupGroup} from './unifiedBackup';
import {analyzeAssetReferences,type ReferencedAsset} from './backupManager';
export const INTEGRITY_FORMAT='sonic-display-integrity';
export const INTEGRITY_VERSION=1;
export type IntegrityEnvelope={format:typeof INTEGRITY_FORMAT;version:1;checksum:{algorithm:'SHA-256';hex:string};backup:BackupData};
export type MigrationReport={verified:boolean;createdAt:string;newKeys:number;conflicts:number;identical:number;applied:number;skipped:number;groups:Record<string,number>;assets:ReferencedAsset[];assetStatus:Record<string,'found'|'missing'|'unknown'>;warnings:string[]};
const bytes=(text:string)=>new TextEncoder().encode(text);
export async function sha256Hex(text:string):Promise<string>{
 if(!globalThis.crypto?.subtle)throw new Error('SHA-256 benötigt einen sicheren Browser-Kontext (HTTPS oder localhost).');
 const digest=await crypto.subtle.digest('SHA-256',bytes(text));
 return Array.from(new Uint8Array(digest),v=>v.toString(16).padStart(2,'0')).join('');
}
export async function createIntegrityEnvelope(backup:BackupData):Promise<IntegrityEnvelope>{
 const validated=parseUnifiedBackup(JSON.stringify(backup));
 return {format:INTEGRITY_FORMAT,version:1,checksum:{algorithm:'SHA-256',hex:await sha256Hex(JSON.stringify(validated))},backup:validated};
}
export async function verifyIntegrityEnvelope(text:string):Promise<{backup:BackupData;verified:boolean;legacy:boolean}>{
 if(bytes(text).length>MAX_BACKUP_BYTES+4096)throw new Error('Sicherungsdatei zu groß.');
 let raw:unknown;try{raw=JSON.parse(text);}catch{throw new Error('Ungültiges JSON.');}
 if(!raw||typeof raw!=='object'||Array.isArray(raw))throw new Error('Ungültige Sicherung.');
 const object=raw as Record<string,unknown>;
 if(object.format!==(INTEGRITY_FORMAT as string)){
  const backup=parseUnifiedBackup(text);return {backup,verified:false,legacy:true};
 }
 if(object.version!==1||!object.checksum||typeof object.checksum!=='object'||!object.backup)throw new Error('Unbekanntes Integritätsformat.');
 const check=object.checksum as Record<string,unknown>;
 if(check.algorithm!=='SHA-256'||typeof check.hex!=='string'||!/^[a-f0-9]{64}$/.test(check.hex))throw new Error('Ungültige SHA-256-Prüfsumme.');
 const backup=parseUnifiedBackup(JSON.stringify(object.backup));
 const actual=await sha256Hex(JSON.stringify(backup));
 if(actual!==check.hex)throw new Error('SHA-256-Prüfsumme stimmt nicht: Backup beschädigt oder verändert. Import abgebrochen.');
 return {backup,verified:true,legacy:false};
}
export function createMigrationReport(backup:BackupData,store:Pick<Storage,'getItem'>,verified:boolean,assetStatus:MigrationReport['assetStatus']={},applied=0):MigrationReport{
 const preview=previewUnifiedBackup(backup,store),assets=analyzeAssetReferences(backup);
 const warnings:string[]=[];
 if(!verified)warnings.push('Legacy-Sicherung ohne kryptografische Integritätsprüfung.');
 if(assets.some(a=>a.kind!=='local'))warnings.push('Externe URLs/Blob-Dateien müssen separat übertragen und überprüft werden.');
 if(assets.some(a=>assetStatus[a.path]==='missing'))warnings.push('Mindestens eine referenzierte Datei ist nicht erreichbar.');
 if(assets.some(a=>!assetStatus[a.path]))warnings.push('Nicht alle Asset-Referenzen wurden geprüft.');
 if(preview.conflicts.length)warnings.push('Abweichende Einstellungen erfordern eine bewusste Konfliktentscheidung.');
 return {verified,createdAt:new Date().toISOString(),newKeys:preview.newKeys.length,conflicts:preview.conflicts.length,identical:preview.same.length,applied,skipped:0,groups:preview.counts,assets,assetStatus,warnings};
}
export function applyMigration(backup:BackupData,store:Pick<Storage,'getItem'|'setItem'|'removeItem'>,groups:BackupGroup[],overwrite:boolean,verified:boolean):MigrationReport{
 const before=createMigrationReport(backup,store,verified);
 const applied=applyUnifiedBackup(previewUnifiedBackup(backup,store),store,{groups,overwrite});
 return {...before,applied,skipped:Object.entries(backup.entries).filter(([key])=>!groups.includes(groupForBackupKey(key) as BackupGroup)).length};
}
