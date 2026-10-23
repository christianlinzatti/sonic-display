import {NextResponse} from 'next/server';
import {clearSessionCookie} from '@/lib/session';
import {getValidSession,refreshSession} from '@/lib/spotify';
import {pushConfigured,pushSecrets,revokePushAccount} from '@/lib/push-storage-v365';
import {pushUserId} from '@/lib/push-v365';
/** Disconnect also revokes opted-in background access: do not leave a refresh token behind. */
export async function POST(){
 if(pushConfigured()){
  try{
   const valid=await getValidSession();
   if(valid){
    const fetchProfile=(token:string)=>fetch('https://api.spotify.com/v1/me',{headers:{Authorization:`Bearer ${token}`},cache:'no-store',signal:AbortSignal.timeout(9000)});
    let profile=await fetchProfile(valid.session.accessToken);
    if(profile.status===401){const refreshed=await refreshSession(valid.session);profile=await fetchProfile(refreshed.accessToken);}
    if(!profile.ok)return NextResponse.json({code:'disconnect_push_cleanup_failed',message:'Push-Daten konnten nicht gelöscht werden. Bitte erneut versuchen.'},{status:503});
    const me=await profile.json() as {id?:unknown};
    if(typeof me.id!=='string'||!me.id)return NextResponse.json({code:'disconnect_push_cleanup_failed'},{status:503});
    await revokePushAccount(pushUserId(me.id,pushSecrets().key));
   }
  }catch{return NextResponse.json({code:'disconnect_push_cleanup_failed',message:'Push-Daten konnten nicht sicher gelöscht werden.'},{status:503});}
 }
 const res=NextResponse.json({ok:true},{headers:{'Cache-Control':'no-store'}});clearSessionCookie(res);return res;
}
