/** V657: enumerate only managed first-party media. Never proxy arbitrary user URLs. */
import { list } from '@vercel/blob';
import { readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import { useBlob } from './avatarBlob';
import {validAssetNameV657,type PortableKindV657} from '@/services/settings/portableArchiveV657';
export type ServerBackupAssetV657={kind:PortableKindV657;filename:string;size:number;url:string;blobUrl?:string;localPath?:string};
const kinds:PortableKindV657[]=['models','animations','previews'];
export async function listPortableAssetsV657():Promise<ServerBackupAssetV657[]>{
 const assets:ServerBackupAssetV657[]=[];
 if(useBlob){
  for(const kind of kinds){let cursor:string|undefined;do{
   const page=await list({prefix:`sonic/${kind}/`,limit:1000,cursor});
   for(const item of page.blobs){const filename=item.pathname.slice(`sonic/${kind}/`.length);
    if(!validAssetNameV657(filename)||!appropriateV657(kind,filename)||item.size>100*1024*1024||item.size<12)continue;
    assets.push({kind,filename,size:item.size,url:item.url,blobUrl:item.url});
   }
   cursor=page.hasMore?page.cursor:undefined;
  }while(cursor);
  }
 }else{
  const dirs:Record<PortableKindV657,string[]>={models:['avatars','models'],animations:['animations'],previews:['previews']};
  const seen=new Set<string>();
  for(const kind of kinds)for(const dirname of dirs[kind]){
   const base=path.join(process.cwd(),'public',dirname);
   for(const filename of await readdir(base).catch(()=>[])){
    if(!validAssetNameV657(filename)||!appropriateV657(kind,filename))continue;
    const file=path.join(base,filename);const info=await stat(file).catch(()=>null);
    if(info?.isFile()&&info.size>=12&&info.size<=100*1024*1024&&!seen.has(`${kind}/${filename}`)){
      seen.add(`${kind}/${filename}`);
      assets.push({kind,filename,size:info.size,url:`/${dirname}/${encodeURIComponent(filename)}`,localPath:file});
    }
   }
  }
 }
 // Prefer public/avatars over public/models when both hold the same basename.
 const uniq=new Map<string,ServerBackupAssetV657>();
 for(const asset of assets){const key=`${asset.kind}/${asset.filename}`;if(!uniq.has(key))uniq.set(key,asset);}
 return [...uniq.values()].sort((a,b)=>a.kind.localeCompare(b.kind)||a.filename.localeCompare(b.filename));
}
export function appropriateV657(kind:PortableKindV657,filename:string){return kind==='previews'?/\.(png|jpe?g|webp)$/i.test(filename):/\.glb$/i.test(filename);}
