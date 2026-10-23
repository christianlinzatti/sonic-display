import {NextResponse} from "next/server";
import {timingSafeEqual} from "node:crypto";
import {publishStageRealtimeV332,realtimeConfigV332} from "@/services/stageContent/realtimeV332";
import {publishStageMessageV331,validateLiveStageMessageV331} from "@/services/stageContent/pushV331";
export const runtime="nodejs";
export const dynamic="force-dynamic";
const matches=(supplied:string,expected:string)=>{
  const a=Buffer.from(supplied),b=Buffer.from(expected);
  return a.length===b.length&&a.length>0&&timingSafeEqual(a,b);
};
export async function POST(request:Request){
  const expected=process.env.STAGE_CONTENT_PUSH_TOKEN;
  const supplied=request.headers.get("authorization")?.replace(/^Bearer\s+/i,"")??"";
  if(!expected||!matches(supplied,expected))return NextResponse.json({error:"Unauthorized"},{status:401});
  const length=Number(request.headers.get("content-length")??0);
  if(Number.isFinite(length)&&length>8192)return NextResponse.json({error:"Payload too large"},{status:413});
  let body:unknown;
  try{const raw=await request.text();if(raw.length>8192)return NextResponse.json({error:"Payload too large"},{status:413});body=JSON.parse(raw);}catch{return NextResponse.json({error:"Invalid JSON"},{status:400});}
  const message=validateLiveStageMessageV331(body);
  if(!message)return NextResponse.json({error:"Missing text"},{status:400});
  if(realtimeConfigV332().enabled){
    try{await publishStageRealtimeV332(message);}catch{
      // Fail explicitly instead of reporting delivery that might never happen.
      return NextResponse.json({error:"Realtime provider unavailable"},{status:503});
    }
  }else{
    publishStageMessageV331(message);
  }
  return NextResponse.json({ok:true,id:message.id,expiresAt:message.receivedAt+message.durationSeconds*1000},{headers:{"Cache-Control":"no-store"}});
}
