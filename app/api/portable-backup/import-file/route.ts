import { NextRequest,NextResponse } from 'next/server';
import { isAdmin,sameOrigin } from '@/lib/avatarAdmin';
import {useBlob} from '@/lib/avatarBlob';
import {isPortableKindV657,validAssetNameV657} from '@/services/settings/portableArchiveV657';
import {appropriateV657} from '@/lib/portableBackupAssetsV657';
import {mkdir,writeFile} from 'node:fs/promises';
import path from 'node:path';
import {randomUUID} from 'node:crypto';
export const runtime='nodejs';
export async function POST(req:NextRequest){
 if(!await isAdmin())return NextResponse.json({error:'Anmeldung erforderlich'},{status:401});
 if(!sameOrigin(req))return NextResponse.json({error:'Origin ungültig'},{status:403});
 if(useBlob||process.env.NODE_ENV!=='development')return NextResponse.json({error:'Lokaler Import nur im Entwicklungsmodus; auf Vercel Blob-Upload verwenden.'},{status:403});
 if(Number(req.headers.get('content-length')||0)>36*1024*1024)return NextResponse.json({error:'Datei zu groß'},{status:413});
 try{
  const form=await req.formData(),kind=form.get('kind'),file=form.get('file');
  if(!isPortableKindV657(kind)||!(file instanceof File)||!validAssetNameV657(file.name)||!appropriateV657(kind,file.name))return NextResponse.json({error:'Unerlaubter Dateityp'},{status:400});
  const max=kind==='previews'?5*1024*1024:35*1024*1024;
  if(file.size>max||file.size<12)return NextResponse.json({error:'Dateigröße ungültig'},{status:413});
  const bytes=new Uint8Array(await file.arrayBuffer());
  const isGlb=/\.glb$/i.test(file.name);
  if(isGlb&&(new TextDecoder().decode(bytes.slice(0,4))!=='glTF'||new DataView(bytes.buffer).getUint32(4,true)!==2||new DataView(bytes.buffer).getUint32(8,true)!==bytes.length))return NextResponse.json({error:'GLB-Datei ungültig'},{status:400});
  if(/\.gltf$/i.test(file.name)){try{const v=JSON.parse(new TextDecoder().decode(bytes));if(!v.asset?.version)throw Error('no version');}catch{return NextResponse.json({error:'glTF-Datei ungültig'},{status:400});}}
  if(kind==='previews'){const png=bytes[0]===137&&bytes[1]===80&&bytes[2]===78&&bytes[3]===71;const jpg=bytes[0]===255&&bytes[1]===216&&bytes[2]===255;const webp=new TextDecoder().decode(bytes.slice(0,4))==='RIFF'&&new TextDecoder().decode(bytes.slice(8,12))==='WEBP';if(!((/\.png$/i.test(file.name)&&png)||(/\.jpe?g$/i.test(file.name)&&jpg)||(/\.webp$/i.test(file.name)&&webp)))return NextResponse.json({error:'Bildsignatur ungültig'},{status:400});}
  const ext=file.name.split('.').pop()!.toLowerCase();const base=file.name.slice(0,-ext.length-1).replace(/[^A-Za-z0-9_-]/g,'-').slice(0,46)||'asset';const filename=`${base}-${randomUUID().slice(0,12)}.${ext}`;
  const dir=kind==='models'?'avatars':kind;const output=path.join(process.cwd(),'public',dir);await mkdir(output,{recursive:true});await writeFile(path.join(output,filename),bytes,{flag:'wx'});
  return NextResponse.json({url:`/${dir}/${encodeURIComponent(filename)}`,filename,kind});
 }catch(e){console.error('Portable import',e);return NextResponse.json({error:'Datei-Installation fehlgeschlagen'},{status:500});}
}
