import {NextResponse} from "next/server";
import {getValidSession, ReauthRequiredError} from "@/lib/spotify";
import {setSessionCookie} from "@/lib/session";

// Unofficial Spotify endpoint. It can change or disappear without notice.
// Requests are strictly scoped to a Spotify ID; the bearer token never reaches the browser.
export async function GET(request: Request) {
  const trackId=new URL(request.url).searchParams.get("trackId") ?? "";
  if(!/^[a-zA-Z0-9]{22}$/.test(trackId))return NextResponse.json({error:"Invalid trackId"},{status:400});
  let credentials: Awaited<ReturnType<typeof getValidSession>> = null;
  try { credentials=await getValidSession(); }
  catch(error){return NextResponse.json({error:error instanceof ReauthRequiredError?"Unauthorized":"Token unavailable"},{status:error instanceof ReauthRequiredError?401:503});}
  if(!credentials)return NextResponse.json({error:"Unauthorized"},{status:401});
  try{
    const response=await fetch(`https://spclient.wg.spotify.com/canvaz-cache/v1/tracks?track_ids=${trackId}`,{
      headers:{Authorization:`Bearer ${credentials.session.accessToken}`,Accept:"application/json"},
      cache:"no-store",signal:AbortSignal.timeout(7000),
    });
    // Internal API may reject ordinary OAuth tokens, use a cover fallback rather than surfacing errors.
    let canvasUrl:string|null=null;
    if(response.ok){
      const json=await response.json() as {canvases?:Array<{canvasUrl?:string;canvas_url?:string;url?:string}>};
      const raw=json.canvases?.[0]?.canvasUrl??json.canvases?.[0]?.canvas_url??json.canvases?.[0]?.url??"";
      try{const url=new URL(raw);if(url.protocol==="https:")canvasUrl=url.href;}catch{/* malformed/absent media */}
    }
    const res=NextResponse.json({canvasUrl});
    res.headers.set("Cache-Control","private, no-store");
    if(credentials.refreshed)setSessionCookie(res,credentials.session);
    return res;
  }catch{
    const res=NextResponse.json({canvasUrl:null});
    res.headers.set("Cache-Control","private, no-store");
    if(credentials.refreshed)setSessionCookie(res,credentials.session);
    return res;
  }
}
