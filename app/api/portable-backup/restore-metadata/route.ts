import {NextRequest,NextResponse} from 'next/server';
import {isAdmin,sameOrigin} from '@/lib/avatarAdmin';
import {readAvatarConfig,updateAvatarMetadata,useBlob,blobModels} from '@/lib/avatarBlob';
import {defaultAvatarModels} from '@/config/avatarModels.default';
import {readdir} from 'node:fs/promises';
import path from 'node:path';
export const runtime='nodejs';
export async function POST(req:NextRequest){
 if(!await isAdmin())return NextResponse.json({error:'Anmeldung erforderlich'},{status:401});
 if(!sameOrigin(req))return NextResponse.json({error:'Origin ungültig'},{status:403});
 if(Number(req.headers.get('content-length')||0)>512000)return NextResponse.json({error:'Zu viel Konfiguration'},{status:413});
 try{
  const body=await req.json();if(!body||typeof body!=='object'||Array.isArray(body)||!body.config||typeof body.config!=='object'||Array.isArray(body.config))throw Error('Daten ungültig');
  const entries=Object.entries(body.config as Record<string,unknown>);if(entries.length>500)throw Error('Zu viele Einträge');
  const available=new Set(useBlob?(await blobModels()).map(b=>b.pathname.split('/').pop()):await readdir(path.join(process.cwd(),'public','avatars')));
  const defaults=new Set(defaultAvatarModels.map(m=>`default:${m.id}`));
  const existing=await readAvatarConfig();const overwrite=body.overwrite===true;
  const str=(v:unknown,max:number)=>typeof v==='string'&&v.length<=max?v:undefined;
  let applied=0,skipped=0;
  for(const [filename,raw] of entries){
   if(filename==='__proto__'||filename==='constructor'||filename.length>200||!raw||typeof raw!=='object'||Array.isArray(raw))throw Error('Unerlaubte Metadaten');
   if(!defaults.has(filename)&&!available.has(filename)) {skipped++;continue;}
   if(!overwrite&&Object.prototype.hasOwnProperty.call(existing,filename)){skipped++;continue;}
   const r=raw as Record<string,unknown>;const m:Record<string,unknown>={};
   for(const key of ['label','description','preview','category','modelUrl','animationUrl','sharedMotionUrl']){
    if(r[key]!==undefined){const v=str(r[key],key==='description'?500:900);if(v===undefined)throw Error('Ungültiges Feld '+key);if(['modelUrl','animationUrl','sharedMotionUrl','preview'].includes(key)&&v&&!/^(\/[^/]|https:\/\/)/.test(v))throw Error('Ungültige URL');m[key]=v;}
   }
   for(const key of ['genre','tags'])if(r[key]!==undefined){if(!Array.isArray(r[key])||r[key].length>20||!r[key].every((x:unknown)=>typeof x==='string'&&x.length<=50))throw Error('Ungültige Liste');m[key]=r[key];}
   if(typeof r.favorite==='boolean')m.favorite=r.favorite;
   if(typeof r.defaultDancePreset==='string'&&['auto','hardstyle','techno','rock-metal','robot','ambient','freestyle'].includes(r.defaultDancePreset))m.defaultDancePreset=r.defaultDancePreset;
   for(const key of ['sharedMotionFingerprint','sharedRigFingerprint'])if(r[key]!==undefined){if(typeof r[key]!=='string'||!/^[a-f0-9]{64}$/.test(r[key] as string))throw Error('Ungültiger Fingerprint');m[key]=r[key];}
   if(r.sharedMotionClipCount!==undefined){const clips=r.sharedMotionClipCount;if(typeof clips!=='number'||!Number.isInteger(clips)||clips<1||clips>200)throw Error('Ungültige Clipanzahl');m.sharedMotionClipCount=clips;}
   if(Object.keys(m).length){await updateAvatarMetadata(filename,m);applied++;}
  }
  return NextResponse.json({applied,skipped});
 }catch(e){console.error('Portable metadata restore',e);return NextResponse.json({error:'Avatar-Metadaten konnten nicht übernommen werden.'},{status:400});}
}
