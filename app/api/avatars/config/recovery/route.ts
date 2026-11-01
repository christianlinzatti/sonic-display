import {NextRequest,NextResponse} from 'next/server';
import {isAdmin,sameOrigin} from '@/lib/avatarAdmin';
import {readAvatarConfigStateV658,restoreAvatarLocalBackupV658,useBlob} from '@/lib/avatarBlob';
export const runtime='nodejs';export const dynamic='force-dynamic';
/** Admin-only diagnostics; the restoration explicitly requires a confirmation from the UI. */
export async function GET(){
 if(!await isAdmin())return NextResponse.json({error:'Nicht angemeldet'},{status:401});
 try {const state=await readAvatarConfigStateV658();return NextResponse.json({diagnostics:state.diagnostics,modelCount:Object.keys(state.metadata).length,canRestoreLocal:!useBlob&&state.diagnostics.backupAvailable},{headers:{'Cache-Control':'no-store'}});}
 catch{return NextResponse.json({error:'Konfiguration nicht lesbar'},{status:503});}
}
export async function POST(req:NextRequest){
 if(!await isAdmin())return NextResponse.json({error:'Nicht angemeldet'},{status:401});
 if(!sameOrigin(req))return NextResponse.json({error:'Origin mismatch'},{status:403});
 if(useBlob)return NextResponse.json({error:'Manuelle Wiederherstellung einer lokalen Sicherung ist nur im lokalen Betrieb möglich'},{status:400});
 try{
  const payload=await req.json();
  if(payload?.action!=='restore-local-backup'||payload?.confirmed!==true)return NextResponse.json({error:'Bestätigung fehlt'},{status:400});
  await restoreAvatarLocalBackupV658();
  return NextResponse.json({ok:true});
 }catch(error){console.error('Recovery failed',error);return NextResponse.json({error:'Wiederherstellung fehlgeschlagen'},{status:500});}
}
