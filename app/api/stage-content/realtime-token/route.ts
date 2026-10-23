import {getValidSession} from "@/lib/spotify";
import {realtimeConfigV332,requestStageRealtimeTokenV332} from "@/services/stageContent/realtimeV332";
export const runtime="nodejs";
export const dynamic="force-dynamic";
export async function GET(){
  try{
    if(!await getValidSession())return Response.json({error:"Unauthorized"},{status:401});
    if(!realtimeConfigV332().enabled)return Response.json({error:"Realtime not configured"},{status:503});
    return Response.json(await requestStageRealtimeTokenV332(),{headers:{"Cache-Control":"no-store"}});
  }catch{return Response.json({error:"Realtime unavailable"},{status:503});}
}
