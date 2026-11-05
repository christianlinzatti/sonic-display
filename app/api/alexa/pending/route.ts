/** V967: Logged-in display polls last short-lived voice command; no Alexa secret is exposed. */
import {getValidSession} from '@/lib/spotify';
import {alexaRelayConfiguredV967,readAlexaCommandV967} from '@/lib/alexaRedisV967';
export const runtime='nodejs';
export const dynamic='force-dynamic';
export async function GET():Promise<Response>{
 const headers={'Cache-Control':'private, no-store'};
 try{if(!await getValidSession())return Response.json({error:'Unauthorized'},{status:401,headers});}
 catch{return Response.json({error:'Unauthorized'},{status:401,headers});}
 if(!alexaRelayConfiguredV967()||(process.env.ALEXA_BRIDGE_SECRET||'').length<32)
  return Response.json({error:'Alexa not configured'},{status:503,headers});
 try{return Response.json({command:await readAlexaCommandV967()},{headers});}
 catch{return Response.json({error:'Relay unavailable'},{status:503,headers});}
}
