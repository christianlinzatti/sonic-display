import { NextRequest, NextResponse } from "next/server";
import { inferMusicGenre, type GenreEvidence } from "@/services/genre/genreIntelligence";
async function tags(method:"track.getTopTags"|"artist.getTopTags",artist:string,track?:string):Promise<GenreEvidence[]> {
 const key=process.env.LASTFM_API_KEY;if(!key)throw new Error("Last.fm API key is not configured");
 const url=new URL("https://ws.audioscrobbler.com/2.0/");
 url.searchParams.set("method",method);url.searchParams.set("api_key",key);url.searchParams.set("format","json");url.searchParams.set("artist",artist);
 if(track)url.searchParams.set("track",track);
 const response=await fetch(url,{signal:AbortSignal.timeout(7000),next:{revalidate:86400}});
 if(!response.ok)throw new Error(`Last.fm HTTP ${response.status}`);
 const data=await response.json();if(data.error)throw new Error(data.message||`Last.fm error ${data.error}`);
 const value=data.toptags?.tag;
 return (Array.isArray(value)?value:value?[value]:[]).map((tag:{name?:string;count?:string|number})=>({name:String(tag.name||""),count:Number(tag.count||0)})).filter((tag:GenreEvidence)=>tag.name);
}
export async function GET(request:NextRequest){
 const artist=request.nextUrl.searchParams.get("artist")?.trim();const track=request.nextUrl.searchParams.get("track")?.trim();
 const bpmText=request.nextUrl.searchParams.get("bpm");const bpm=bpmText?Number(bpmText):null;
 if(!artist||!track||artist.length>200||track.length>200)return NextResponse.json({error:"artist and track are required"},{status:400});
 try{
  let found=await tags("track.getTopTags",artist,track);let source:"track"|"artist"="track";
  if(!found.length){found=await tags("artist.getTopTags",artist);source="artist";}
  const result=inferMusicGenre(found,track,artist,source,bpm);
  return NextResponse.json({...result,tags:found.slice(0,10).map(t=>t.name),provider:"last.fm",bpmUsed:bpm!==null&&Number.isFinite(bpm)&&bpm>=50&&bpm<=240},{headers:{"Cache-Control":"private, max-age=60"}});
 }catch(error){return NextResponse.json({genre:null,confidence:0,error:error instanceof Error?error.message:"Last.fm lookup failed",provider:"last.fm"},{status:200});}
}
