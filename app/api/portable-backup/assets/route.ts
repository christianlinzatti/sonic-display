import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/avatarAdmin';
import { readAvatarConfig,useBlob } from '@/lib/avatarBlob';
import { listPortableAssetsV657 } from '@/lib/portableBackupAssetsV657';
export const runtime='nodejs';export const dynamic='force-dynamic';
// Only an authenticated administrator can enumerate or export private configuration.
export async function GET(){
 if(!await isAdmin())return NextResponse.json({error:'Administrator-Anmeldung erforderlich.'},{status:401});
 try{
  const [list,config]=await Promise.all([listPortableAssetsV657(),readAvatarConfig()]);
  const allowed=['label','description','preview','category','genre','tags','favorite','defaultDancePreset','modelUrl','animationUrl','sharedMotionUrl','sharedMotionFingerprint','sharedRigFingerprint','sharedMotionClipCount'];
  const avatarConfig:Record<string,Record<string,unknown>>=Object.create(null);
  for(const [key,data] of Object.entries(config))if(key!=='__proto__'&&key!=='constructor'&&key.length<200){
   avatarConfig[key]=Object.fromEntries(Object.entries(data).filter(([name])=>allowed.includes(name)));
  }
  return NextResponse.json({blobEnabled:useBlob,assets:list.map(({kind,filename,size,url})=>({kind,filename,size,url,downloadUrl:`/api/portable-backup/asset?kind=${kind}&name=${encodeURIComponent(filename)}`})),avatarConfig},{headers:{'Cache-Control':'no-store'}});
 }catch(e){console.error('Portable backup list',e);return NextResponse.json({error:'Asset-Verzeichnis konnte nicht gelesen werden.'},{status:500});}
}
