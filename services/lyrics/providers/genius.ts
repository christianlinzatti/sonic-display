import {Parser} from 'htmlparser2';
import type {Lyrics} from '@/types/music';
import type {LyricsQuery} from '@/services/lyrics/server';
import {withDeadlineV734} from '@/lib/requestDeadlineV734';
import {normalizedSongTextV447} from '@/services/genius/songInsightsV447';

export function safeGeniusLyricsUrlV1009(value:unknown):URL|null{
 if(typeof value!=='string')return null;
 try{const u=new URL(value);return u.protocol==='https:'&&u.hostname==='genius.com'&&!u.username&&!u.password&&(!u.port||u.port==='443')?u:null;}catch{return null;}
}
/** Decode only lyrics containers, never scripts, HTML attributes or unrelated page text. */
export function parseGeniusLyricsV1009(html:string):string|null{
 if(html.length>1_500_000)return null;
 const chunks:string[]=[];let depth=0,lyricsDepth=0,skip=0;
 const parser=new Parser({
  onopentag(name,attributes){
   depth++;
   if(!lyricsDepth&&(attributes['data-lyrics-container']==='true'||(attributes.class||'').split(/\s+/).includes('lyrics'))){lyricsDepth=depth;chunks.push('\n');}
   if(lyricsDepth&&(name==='script'||name==='style'))skip++;
   if(lyricsDepth&&name==='br'&&!skip)chunks.push('\n');
  },
  ontext(text){if(lyricsDepth&&!skip)chunks.push(text);},
  onclosetag(name){
   if(lyricsDepth){if((name==='script'||name==='style')&&skip)skip--;if(['p','div'].includes(name)&&!skip)chunks.push('\n');if(depth===lyricsDepth)lyricsDepth=0;}
   depth--;
  },
 },{decodeEntities:true});
 parser.write(html);parser.end();
 const text=chunks.join('').split(/\r?\n/).map(line=>line.trim()).filter(Boolean).join('\n');
 return text&&text.length<=100000?text:null;
}
async function boundedText(response:Response,limit:number):Promise<string>{
 if(Number(response.headers.get('content-length'))>limit){await response.body?.cancel();throw Error('Lyrics response too large');}
 if(!response.body)return '';
 const reader=response.body.getReader(),parts:Uint8Array[]=[];let size=0;
 try{for(;;){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>limit)throw Error('Lyrics response too large');parts.push(value);}}
 catch(error){void reader.cancel().catch(()=>{});throw error;}finally{reader.releaseLock();}
 const buffer=new Uint8Array(size);let offset=0;for(const part of parts){buffer.set(part,offset);offset+=part.length;}return new TextDecoder().decode(buffer);
}
/** Native fetch replaces the abandoned scraper tree. One deadline covers search, page and decoding. */
export async function lookupGeniusLyrics(query:LyricsQuery,parent?:AbortSignal):Promise<Lyrics|null>{
 const apiKey=process.env.GENIUS_ACCESS_TOKEN;if(!apiKey)return null;
 return withDeadlineV734(async signal=>{
  const url=new URL('https://api.genius.com/search');url.searchParams.set('q',`${query.title} ${query.artist}`);
  const search=await fetch(url,{headers:{Authorization:`Bearer ${apiKey}`,Accept:'application/json'},redirect:'error',cache:'no-store',signal});
  if(!search.ok){await search.body?.cancel();throw Error(`Genius search HTTP ${search.status}`);}
  const data=JSON.parse(await boundedText(search,512000));
  const title=normalizedSongTextV447(query.title),artist=normalizedSongTextV447(query.artist);
  const hits=Array.isArray(data?.response?.hits)?data.response.hits.slice(0,20):[];
  const song=hits.map((h:{result?:unknown})=>h?.result).find((v:{title?:unknown;primary_artist?:{name?:unknown};url?:unknown})=>typeof v?.title==='string'&&typeof v.primary_artist?.name==='string'&&normalizedSongTextV447(v.title)===title&&normalizedSongTextV447(v.primary_artist.name)===artist&&safeGeniusLyricsUrlV1009(v.url));
  let page=safeGeniusLyricsUrlV1009(song?.url);if(!page)return null;
  for(let redirects=0;redirects<4;redirects++){
   const response:Response=await fetch(page,{headers:{Accept:'text/html'},redirect:'manual',cache:'no-store',signal});
   if([301,302,303,307,308].includes(response.status)){
    const location:string|null=response.headers.get('location');void response.body?.cancel().catch(()=>{});
    page=location?safeGeniusLyricsUrlV1009(new URL(location,page).href):null;if(!page)return null;continue;
   }
   if(!response.ok){await response.body?.cancel();throw Error(`Genius lyrics HTTP ${response.status}`);}
   const text=parseGeniusLyricsV1009(await boundedText(response,1500000));if(!text)return null;
   return {provider:'genius',synced:false,plainText:text,lines:text.split('\n').map(text=>({startMs:0,endMs:null,text}))};
  }
  return null;
 },5000,parent);
}
