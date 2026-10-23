/** V184: browser-local settings export/import, excluding tokens, cookies and secrets. */
export const UNIFIED_BACKUP_FORMAT = "sonic-display-settings";
export const UNIFIED_BACKUP_VERSION = 1;
export const MAX_BACKUP_BYTES = 2 * 1024 * 1024;
export type BackupGroup = "genre" | "lighting" | "timeline" | "avatar" | "device" | "ui";
export type BackupData = { format: typeof UNIFIED_BACKUP_FORMAT; version: 1; exportedAt: string; entries: Record<string,string> };
export type BackupPreview = { data: BackupData; newKeys: string[]; conflicts: string[]; same: string[]; counts: Record<BackupGroup,number> };
const EXACT: Record<string,BackupGroup> = {
 "sonic-display-ui-preferences-v1":"ui",
 "sonic-display:v181:genre-corrections":"genre",
 "sonic-display:v183:genre-memory-snapshots":"genre",
 "sonic-display:lighting-preset-v171":"lighting",
 "sonic-display:lighting-preset-library-v178":"lighting",
 "sonic-display:lighting-genre-profiles-v179":"lighting",
 "sonic-display:lighting-learning-v175":"lighting",
 "sonic-display:lighting-learning-enabled":"lighting",
 "sonic-display-avatar-loops-v94":"avatar",
 "sonic-display-active-avatar-loop-v94":"avatar",
 "sonic-display-choreographies-v95":"avatar",
 "sonic-display-active-choreography-v95":"avatar",
 "sonic-display-dance-studio-v45":"avatar",
 "sonic-motion-presets-v119":"avatar",
 "sonic-motion-layer-presets-v119":"avatar",
 "sonic-motion-layer-auto-v119":"avatar",
 "sonic-motion-morph-duration-v120":"avatar",
 "sonic-display:v165:pi-profile":"device",
 "sonic-display:v166:kiosk-enabled":"device",
 "sonic-display:v166:kiosk-view":"device",
 "sonic-display:v167:ambient":"device",
 "sonic-display:v167:auto-layout":"device",
 "sonic-display:v168:theme-enabled":"device",
 "sonic-performance-mode":"device",
 "sonic-performance-profiles-v85":"device",
 "sonic-performance-auto-profile-v85":"device"
};
const PREFIXES: Array<[RegExp,BackupGroup]> = [
 [/^sonic-display:light-timeline-v172:[A-Za-z0-9_-]{1,128}$/,"timeline"],
 [/^sonic-display:v152:skeleton:.{1,240}$/,"avatar"],
 [/^sonic-display:v153:joints:.{1,240}$/,"avatar"],
 [/^sonic-retarget:v103:.{1,240}$/,"avatar"],
 [/^sonic-skeleton-calibration-v156:.{1,240}$/,"avatar"],
 [/^sonic-avatar-anatomy-v151.{0,240}$/,"avatar"]
];
// Intentionally not a broad sonic-* matcher. Newly introduced keys require review.
export function groupForBackupKey(key:string): BackupGroup | null {
 if (key.length > 320 || /token|secret|password|authorization|cookie|credential|oauth|session|client[-_]?id/i.test(key)) return null;
 return EXACT[key] || PREFIXES.find(([pattern])=>pattern.test(key))?.[1] || null;
}
const groups:BackupGroup[]=["genre","lighting","timeline","avatar","device","ui"];
export function createUnifiedBackup(store:Pick<Storage,"length"|"key"|"getItem">): BackupData {
 const entries:Record<string,string>=Object.create(null);
 for(let i=0;i<store.length;i++) { const key=store.key(i);if(!key || !groupForBackupKey(key))continue;
   const value=store.getItem(key);if(typeof value==="string" && value.length<=150000)entries[key]=value;
 }
 return {format:UNIFIED_BACKUP_FORMAT,version:1,exportedAt:new Date().toISOString(),entries};
}
export function parseUnifiedBackup(text:string):BackupData {
 if(new TextEncoder().encode(text).length>MAX_BACKUP_BYTES)throw new Error("Die Sicherung ist zu groß (maximal 2 MB).");
 let value:unknown;try{value=JSON.parse(text);}catch{throw new Error("Ungültige JSON-Datei.");}
 if(!value || typeof value!=="object" || Array.isArray(value))throw new Error("Ungültiges Sicherungsformat.");
 const v=value as Partial<BackupData>;
 if(v.format!==UNIFIED_BACKUP_FORMAT || v.version!==1 || typeof v.exportedAt!=="string" || !v.entries || typeof v.entries!=="object" || Array.isArray(v.entries)) throw new Error("Unbekanntes Sicherungsformat oder Version.");
 const entries:Record<string,string>=Object.create(null);
 const pairs=Object.entries(v.entries);
 if(pairs.length>600)throw new Error("Zu viele Einträge.");
 for(const [key,content] of pairs){if(!groupForBackupKey(key))throw new Error(`Unzulässiger Schlüssel: ${key.slice(0,90)}`);
   if(typeof content!=="string"||content.length>150000)throw new Error("Ungültiger Einstellungswert.");
   // Structured settings must be valid JSON. Primitive flags and mode selectors are allowed.
   if(content.startsWith("{")||content.startsWith("[")){try{JSON.parse(content);}catch{throw new Error(`Beschädigter JSON-Wert: ${key}`);}}
   entries[key]=content;
 }
 return {format:UNIFIED_BACKUP_FORMAT,version:1,exportedAt:v.exportedAt,entries};
}
export function previewUnifiedBackup(data:BackupData,store:Pick<Storage,"getItem">):BackupPreview{
 const newKeys:string[]=[], conflicts:string[]=[],same:string[]=[];
 const counts=Object.fromEntries(groups.map(g=>[g,0])) as Record<BackupGroup,number>;
 for(const [key,content] of Object.entries(data.entries)){
  const group=groupForBackupKey(key);if(!group)continue;counts[group]++;
  const existing=store.getItem(key);
  if(existing===null)newKeys.push(key);else if(existing===content)same.push(key);else conflicts.push(key);
 }
 return {data,newKeys,conflicts,same,counts};
}
export function applyUnifiedBackup(preview:BackupPreview,store:Pick<Storage,"getItem"|"setItem"|"removeItem">,options:{overwrite:boolean;groups:BackupGroup[]}):number{
 // Only previously parsed data and explicitly selected groups are applied.
 const chosen=Object.entries(preview.data.entries).filter(([key])=>{const g=groupForBackupKey(key);return g!==null && options.groups.includes(g) && (options.overwrite || store.getItem(key)===null)});
 const prior=new Map(chosen.map(([key])=>[key,store.getItem(key)]));
 try{for(const [key,val] of chosen)store.setItem(key,val);}catch(e){
  for(const [key,val] of prior){try{if(val===null)store.removeItem(key);else store.setItem(key,val);}catch{/* storage quota prevents rollback */}}
  throw e;
 }
 return chosen.length;
}
