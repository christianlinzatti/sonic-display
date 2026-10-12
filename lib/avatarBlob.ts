import { list, put } from "@vercel/blob";
import { readFile, writeFile, mkdir, rename } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
export const useBlob = Boolean(process.env.BLOB_READ_WRITE_TOKEN);
const configFile=path.join(process.cwd(),"data","avatars.local.json");
export type Metadata=Record<string,unknown>;
export async function readAvatarConfig():Promise<Record<string,Metadata>> { if (useBlob) { const items=await list({prefix:"sonic/config/avatars-",limit:1000}); const latest=items.blobs.sort((a,b)=>b.uploadedAt.getTime()-a.uploadedAt.getTime())[0]; if (!latest) return {}; const response=await fetch(latest.url,{cache:"no-store"}); if(!response.ok) throw Error("Blob config read failed");return await response.json(); } try { return JSON.parse(await readFile(configFile,"utf8")); } catch(e) { if ((e as NodeJS.ErrnoException).code==="ENOENT") return {}; throw e; } }
export async function writeAvatarConfig(config:Record<string,Metadata>) { if(useBlob) { await put(`sonic/config/avatars-${randomUUID()}.json`,JSON.stringify(config,null,2),{access:"public",contentType:"application/json",addRandomSuffix:false}); return; } await mkdir(path.dirname(configFile),{recursive:true});const tmp=configFile+"."+randomUUID()+".tmp";await writeFile(tmp,JSON.stringify(config,null,2));await rename(tmp,configFile); }
export async function blobModels() { if(!useBlob) return []; const results=[];let cursor: string|undefined;do { const page=await list({prefix:"sonic/models/",limit:1000,cursor});results.push(...page.blobs);cursor=page.hasMore?page.cursor:undefined; } while(cursor);return results.filter(x=>/\.glb$/i.test(x.pathname)); }
