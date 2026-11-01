/** V657: dependency-free portable TAR envelope, with checked file paths and SHA-256.
 * Archive is NOT an authentication or trust mechanism; a SHA-256 digest detects corruption.
 * No filesystem paths or dynamic executable content may be read from an imported archive.
 */
import { parseUnifiedBackup, type BackupData } from './unifiedBackup';
export const PORTABLE_FORMAT_V657 = 'sonic-display-portable-v657';
export const PORTABLE_ASSET_LIMIT = 150;
export const PORTABLE_FILE_LIMIT = 100 * 1024 * 1024;
export const PORTABLE_TOTAL_LIMIT = 650 * 1024 * 1024;
export type PortableKindV657='models'|'animations'|'previews';
export type PortableAssetV657={path:string;kind:PortableKindV657;filename:string;url:string;size:number;sha256:string};
export type PortableManifestV657={format:typeof PORTABLE_FORMAT_V657;version:1;createdAt:string;settings:BackupData;settingsSha256:string;avatarConfig:Record<string,Record<string,unknown>>;avatarConfigSha256:string;assets:PortableAssetV657[];unresolved:string[]};
export type PortableFileV657={kind:PortableKindV657;filename:string;url:string;size:number;downloadUrl:string};
const utf8=new TextEncoder();
const decode=new TextDecoder('utf-8',{fatal:true});
export const validAssetNameV657=(s:string)=>/^[A-Za-z0-9][A-Za-z0-9_.-]{0,159}\.(glb|gltf|png|jpg|jpeg|webp)$/i.test(s)&&!s.includes('..');
export function isPortableKindV657(s:unknown):s is PortableKindV657 {return s==='models'||s==='animations'||s==='previews';}
function safePath(path:string){return /^assets\/[0-9]{5}\.(?:glb|png|jpg|jpeg|webp)$/.test(path);}
function sha256OfBytes(bytes:Uint8Array):Promise<string>{
 if(!globalThis.crypto?.subtle)throw Error('SHA-256 benötigt HTTPS oder localhost.');
 return crypto.subtle.digest('SHA-256',bytes as BufferSource).then(buf=>Array.from(new Uint8Array(buf),v=>v.toString(16).padStart(2,'0')).join(''));
}
export async function sha256TextV657(value:string):Promise<string>{return sha256OfBytes(utf8.encode(value));}
export async function sha256BlobV657(blob:Blob):Promise<string>{if(blob.size>PORTABLE_FILE_LIMIT)throw Error('Eine Datei ist größer als 100 MB.');return sha256OfBytes(new Uint8Array(await blob.arrayBuffer()));}
function oct(n:number,length:number){const value=n.toString(8);if(value.length>length-1)throw Error('TAR-Nummer zu groß.');return value.padStart(length-1,'0')+'\0';}
function header(name:string,size:number):Uint8Array{
 if(!/^(manifest\.json|assets\/[0-9]{5}\.(glb|png|jpg|jpeg|webp))$/.test(name))throw Error('Ungültiger TAR-Dateiname.');
 if(!Number.isSafeInteger(size)||size<0||size>PORTABLE_FILE_LIMIT)throw Error('Ungültige TAR-Dateigröße.');
 const b=new Uint8Array(512);const field=(start:number,length:number,s:string)=>{const raw=utf8.encode(s);if(raw.byteLength>length)throw Error('TAR-Feld zu lang.');b.set(raw,start);};
 field(0,100,name);field(100,8,oct(0o644,8));field(108,8,oct(0,8));field(116,8,oct(0,8));field(124,12,oct(size,12));field(136,12,oct(0,12));b.fill(32,148,156);field(156,1,'0');field(257,6,'ustar\0');field(263,2,'00');
 const sum=b.reduce((a,v)=>a+v,0);field(148,8,sum.toString(8).padStart(6,'0')+'\0 ');return b;
}
function pad(n:number){return new Uint8Array((512-n%512)%512);}
export function validatePortableManifestV657(value:unknown):PortableManifestV657{
 if(!value||typeof value!=='object'||Array.isArray(value))throw Error('Ungültiges Portables-Backup-Manifest.');
 const m=value as Partial<PortableManifestV657>;
 if(m.format!==PORTABLE_FORMAT_V657||m.version!==1||typeof m.createdAt!=='string'||!m.settings||!Array.isArray(m.assets)||!Array.isArray(m.unresolved)||!m.avatarConfig||typeof m.avatarConfig!=='object'||Array.isArray(m.avatarConfig))throw Error('Unbekanntes Sicherungsformat.');
 if(m.assets.length>PORTABLE_ASSET_LIMIT||m.unresolved.length>500)throw Error('Zu viele Dateien oder Referenzen.');
 if(typeof m.settingsSha256!=='string'||!/^[a-f0-9]{64}$/.test(m.settingsSha256)||typeof m.avatarConfigSha256!=='string'||!/^[a-f0-9]{64}$/.test(m.avatarConfigSha256))throw Error('Prüfsumme des Manifests fehlt.');
 const paths=new Set<string>();const sources=new Set<string>();let total=0;
 for(const a of m.assets){
  if(!a||typeof a!=='object'||!isPortableKindV657(a.kind)||!validAssetNameV657(a.filename)||((a.kind==='previews')!==/\.(?:png|jpe?g|webp)$/i.test(a.filename))||typeof a.path!=='string'||!safePath(a.path)||a.path.split('.').pop()?.toLowerCase()!==a.filename.split('.').pop()?.toLowerCase()||typeof a.url!=='string'||a.url.length>1200||!Number.isSafeInteger(a.size)||a.size<12||a.size>PORTABLE_FILE_LIMIT||!/^([a-f0-9]{64})$/.test(a.sha256))throw Error('Ungültiger Dateieintrag.');
  if(paths.has(a.path)||sources.has(`${a.kind}/${a.filename}`))throw Error('Doppelte Archivdatei.');paths.add(a.path);sources.add(`${a.kind}/${a.filename}`);total+=a.size;
 }
 if(total>PORTABLE_TOTAL_LIMIT)throw Error('Archiv zu groß.');
 for(const ref of m.unresolved)if(typeof ref!=='string'||ref.length>1200)throw Error('Ungültige externe Referenz.');
 const config=Object.entries(m.avatarConfig);
 if(config.length>500||JSON.stringify(m.avatarConfig).length>512000)throw Error('Avatar-Metadaten zu groß.');
 for(const [key,data] of config){if(key.length>200||!data||typeof data!=='object'||Array.isArray(data)||key==='__proto__'||key==='constructor')throw Error('Ungültige Avatar-Metadaten.');}
 // Reuse strict v184 allowlist/size/security checks.
 const settings=parseUnifiedBackup(JSON.stringify(m.settings));
 return {...m,settings,assets:m.assets} as PortableManifestV657;
}
export function createPortableTarV657(manifest:PortableManifestV657,blobs:Map<string,Blob>):Blob{
 validatePortableManifestV657(manifest);
 const raw=utf8.encode(JSON.stringify(manifest));if(raw.byteLength>2*1024*1024)throw Error('Manifest zu groß.');
 const parts:BlobPart[]=[Uint8Array.from(header('manifest.json',raw.byteLength)).buffer,raw as BlobPart,pad(raw.byteLength) as BlobPart];
 for(const asset of manifest.assets){const b=blobs.get(asset.path);if(!b||b.size!==asset.size)throw Error('Archivdatei fehlt: '+asset.filename);parts.push(header(asset.path,b.size) as BlobPart,b,pad(b.size) as BlobPart);}
 parts.push(new Uint8Array(1024) as BlobPart);return new Blob(parts,{type:'application/x-tar'});
}
function textField(h:Uint8Array,start:number,len:number){const raw=h.slice(start,start+len);const end=raw.indexOf(0);return decode.decode(end>=0?raw.slice(0,end):raw).trim();}
function parseHeader(h:Uint8Array){const name=textField(h,0,100),rawSize=textField(h,124,12),checksum=textField(h,148,8);if(!/^[0-7]+$/.test(rawSize)||!/^[0-7]+$/.test(checksum))throw Error('TAR-Kopf beschädigt.');const size=parseInt(rawSize,8),expected=parseInt(checksum,8);const copy=h.slice();copy.fill(32,148,156);if(copy.reduce((a,v)=>a+v,0)!==expected)throw Error('TAR-Prüfsumme falsch.');if(h[156]!==48)throw Error('Unerlaubter Archiv-Eintrag.');return {name,size};}
export async function readPortableTarV657(file:File):Promise<{manifest:PortableManifestV657;assets:Map<string,Blob>}>{
 if(file.size<1536||file.size>PORTABLE_TOTAL_LIMIT+3*1024*1024)throw Error('Archivgröße außerhalb der Grenzen.');
 let pos=0;let manifest:PortableManifestV657|null=null;let index=0;let ended=false;const assets=new Map<string,Blob>();
 while(pos+512<=file.size){const h=new Uint8Array(await file.slice(pos,pos+512).arrayBuffer());if(h.every(v=>v===0)){if(pos+1024!==file.size)throw Error("TAR-Abschluss unvollständig oder zusätzliche Daten.");const second=new Uint8Array(await file.slice(pos+512,pos+1024).arrayBuffer());if(!second.every(v=>v===0))throw Error("TAR-Abschluss beschädigt.");if(pos+1024!==file.size)throw Error("TAR-Abschluss mit zusätzlichen Daten.");ended=true;break;}const {name,size}=parseHeader(h);
  if(!Number.isSafeInteger(size)||size<0||size>PORTABLE_FILE_LIMIT||pos+512+size>file.size)throw Error('Trunkiertes Archiv.');
  if(index===0){if(name!=='manifest.json'||size>2*1024*1024)throw Error('Manifest muss erster Eintrag sein.');try{manifest=validatePortableManifestV657(JSON.parse(await file.slice(pos+512,pos+512+size).text()));}catch(e){throw Error('Manifest ungültig: '+(e instanceof Error?e.message:'Formatfehler'));}}
  else{const expected=manifest?.assets[index-1];if(!expected||name!==expected.path||size!==expected.size)throw Error('Unerwartete oder fehlende Datei: '+name);const b=file.slice(pos+512,pos+512+size);if(await sha256BlobV657(b)!==expected.sha256)throw Error('SHA-256 falsch: '+expected.filename);assets.set(name,b);}
  pos+=512+Math.ceil(size/512)*512;index++;if(index>PORTABLE_ASSET_LIMIT+1)throw Error('Zu viele Einträge.');
 }
 if(!ended||!manifest||index!==manifest.assets.length+1)throw Error('Das Archiv ist unvollständig.');
 if(await sha256TextV657(JSON.stringify(manifest.settings))!==manifest.settingsSha256||await sha256TextV657(JSON.stringify(manifest.avatarConfig))!==manifest.avatarConfigSha256)throw Error('SHA-256 des Manifests stimmt nicht.');
 return {manifest,assets};
}
// JSON strings in settings may contain URLs and local:<filename> IDs nested in arrays/objects.
export function remapSettingsV657(data:BackupData,mapping:Record<string,string>):BackupData{
 const replace=(s:string)=>mapping[s]??s;
 const walk=(v:unknown):unknown=>typeof v==='string'?replace(v):Array.isArray(v)?v.map(walk):v&&typeof v==='object'?Object.fromEntries(Object.entries(v).map(([k,val])=>[k,walk(val)])):v;
 const entries:Record<string,string>=Object.create(null);
 for(const [key,raw] of Object.entries(data.entries)){
  try{const parsed=JSON.parse(raw);entries[key]=JSON.stringify(walk(parsed));}catch{entries[key]=replace(raw);}
 }
 return parseUnifiedBackup(JSON.stringify({...data,entries}));
}
