import { NextRequest,NextResponse } from 'next/server';
import { isAdmin } from '@/lib/avatarAdmin';
import { listPortableAssetsV657 } from '@/lib/portableBackupAssetsV657';
import { isPortableKindV657,validAssetNameV657 } from '@/services/settings/portableArchiveV657';
import {createReadStream} from 'node:fs';
import {Readable} from 'node:stream';
export const runtime='nodejs';export const dynamic='force-dynamic';
export async function GET(req:NextRequest){
 if(!await isAdmin())return NextResponse.json({error:'Anmeldung erforderlich'},{status:401});
 const kind=req.nextUrl.searchParams.get('kind'),filename=req.nextUrl.searchParams.get('name');
 if(!isPortableKindV657(kind)||!filename||!validAssetNameV657(filename))return NextResponse.json({error:'Ungültige Datei'},{status:400});
 const asset=(await listPortableAssetsV657()).find(x=>x.kind===kind&&x.filename===filename);
 if(!asset)return NextResponse.json({error:'Datei nicht gefunden'},{status:404});
 try{
  if(asset.blobUrl){const response=await fetch(asset.blobUrl,{cache:'no-store',signal:AbortSignal.timeout(90000)});
   if(!response.ok||!response.body)return NextResponse.json({error:'Blob-Download fehlgeschlagen'},{status:502});
   return new Response(response.body,{headers:{'Content-Type':'application/octet-stream','Content-Length':String(asset.size),'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
  }
  if(!asset.localPath)throw Error('No local file');
  return new Response(Readable.toWeb(createReadStream(asset.localPath)) as unknown as ReadableStream,{headers:{'Content-Type':'application/octet-stream','Content-Length':String(asset.size),'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
 }catch(e){console.error('Portable asset',e);return NextResponse.json({error:'Datei nicht lesbar'},{status:500});}
}
