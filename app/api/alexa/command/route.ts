/** V967 signed private relay endpoint, NOT an Alexa HTTPS skill endpoint.
 * Alexa invokes a locked-down AWS Lambda via the official Alexa Skills Kit trigger.
 * That Lambda signs requests to this endpoint; no direct public skill payloads are accepted.
 */
import {createHmac,randomUUID,timingSafeEqual} from 'node:crypto';
import {isAlexaConcertCommandV968} from '@/lib/alexaConcertV968';
import {isAlexaCommandV970} from '@/lib/alexaGoveeV970';
import {alexaRelayConfiguredV967,claimAlexaNonceV967,saveAlexaCommandV967} from '@/lib/alexaRedisV967';
export const runtime='nodejs';
export const dynamic='force-dynamic';
const common={'Cache-Control':'no-store'};
export async function POST(request:Request):Promise<Response>{
 const secret=process.env.ALEXA_BRIDGE_SECRET||'';
 if(secret.length<32||!alexaRelayConfiguredV967())return Response.json({error:'Alexa bridge not configured'},{status:503,headers:common});
 const stamp=request.headers.get('x-sonic-timestamp')||'';
 const nonce=request.headers.get('x-sonic-nonce')||'';
 const signature=request.headers.get('x-sonic-signature')||'';
 const contentType=request.headers.get('content-type')||'';
 if(!/^\d{13}$/.test(stamp)||Math.abs(Date.now()-Number(stamp))>60000||
  !/^[a-zA-Z0-9-]{16,80}$/.test(nonce)||!/^[a-f0-9]{64}$/i.test(signature)||
  !/^application\/json(?:\s*;|$)/i.test(contentType))return Response.json({error:'Unauthorized'},{status:401,headers:common});
 const size=Number(request.headers.get('content-length')||0);
 if(size>2048)return Response.json({error:'Too large'},{status:413,headers:common});
 const body=await request.text().catch(()=>null);
 if(body===null||Buffer.byteLength(body,'utf8')>2048)return Response.json({error:'Invalid payload'},{status:400,headers:common});
 const expected=createHmac('sha256',secret).update(`${stamp}.${nonce}.${body}`).digest();
 const supplied=Buffer.from(signature,'hex');
 if(supplied.length!==expected.length||!timingSafeEqual(supplied,expected))
  return Response.json({error:'Unauthorized'},{status:401,headers:common});
 let input:unknown;
 try{input=JSON.parse(body);}catch{return Response.json({error:'Invalid JSON'},{status:400,headers:common});}
 const cmd=(input&&typeof input==='object'&&!Array.isArray(input))?(input as {command?:unknown}).command:null;
 if(!isAlexaConcertCommandV968(cmd)&&!isAlexaCommandV970(cmd))return Response.json({error:'Unsupported command'},{status:400,headers:common});
 try{
  if(!await claimAlexaNonceV967(nonce))return Response.json({error:'Duplicate request'},{status:409,headers:common});
  const message={id:randomUUID(),command:cmd,createdAt:Date.now()};
  await saveAlexaCommandV967(message);
  return Response.json({queued:true,id:message.id,expiresInSeconds:75},{headers:common});
 }catch{return Response.json({error:'Command relay unavailable'},{status:503,headers:common});}
}
