import {stagePushBusV331,type LiveStageMessageV331} from "@/services/stageContent/pushV331";
import {getValidSession} from "@/lib/spotify";
export const runtime="nodejs";
export const dynamic="force-dynamic";
export async function GET(request:Request){
  // Do not expose pushed messages to anonymous clients.
  let session:Awaited<ReturnType<typeof getValidSession>>=null;
  try{session=await getValidSession();}catch{return new Response("Unauthorized",{status:401});}
  if(!session)return new Response("Unauthorized",{status:401});
  const encoder=new TextEncoder();const bus=stagePushBusV331();
  let unbind:()=>void=()=>{};
  const stream=new ReadableStream<Uint8Array>({
    start(controller){
      const send=(message:LiveStageMessageV331)=>{
        try{controller.enqueue(encoder.encode(`event: stage-message\ndata: ${JSON.stringify(message)}\n\n`));}catch{/* closed */}
      };
      const initial=bus.latest;
      if(initial&&Date.now()<initial.receivedAt+initial.durationSeconds*1000)send(initial);
      bus.listeners.add(send);
      const heartbeat=setInterval(()=>{try{controller.enqueue(encoder.encode(": heartbeat\n\n"));}catch{/* closed */}},20000);
      const stop=()=>{clearInterval(heartbeat);bus.listeners.delete(send);request.signal.removeEventListener("abort",stop);try{controller.close();}catch{/* closed */}};
      request.signal.addEventListener("abort",stop,{once:true});unbind=stop;
    },cancel(){unbind();}
  });
  return new Response(stream,{headers:{"Content-Type":"text/event-stream; charset=utf-8","Cache-Control":"private, no-cache, no-transform","Connection":"keep-alive","X-Accel-Buffering":"no"}});
}
