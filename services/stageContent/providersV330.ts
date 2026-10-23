import {
  buildStageEndpointV330,normalizeStageResponseV330,safeStageMediaV330,
  type StageContentV330,type StageContentSourceV330,type StageContentSettingsV330,
} from "./stageContentV330";
export interface StageContentContextV330 { id:string; title:string; artist:string; albumCoverUrl:string|null; }
export interface StageContentProviderV330 {
  readonly id:StageContentSourceV330;
  readonly label:string;
  load(ctx:StageContentContextV330,settings:StageContentSettingsV330,signal:AbortSignal):Promise<StageContentV330|null>;
}
async function readJson(url:string,signal:AbortSignal):Promise<unknown>{
  const res=await fetch(url,{signal,cache:"no-store",credentials:"same-origin",headers:{Accept:"application/json"}});
  if(!res.ok)throw Error(`API ${res.status}`);
  return res.json() as Promise<unknown>;
}
const fromEndpoint=(source:"text"|"photos"|"concerts",label:string):StageContentProviderV330=>({
  id:source,label,
  async load(track,settings,signal){
    const url=buildStageEndpointV330(settings.endpoints[source],track);
    if(!url)return null;
    return normalizeStageResponseV330(source,await readJson(url,signal));
  },
});
/** Extend this array to install a new built-in adapter. The 3D renderer is schema-independent. */
export const STAGE_CONTENT_PROVIDERS_V330:readonly StageContentProviderV330[]=[
  {id:"canvas",label:"Spotify Canvas",async load(track,_settings,signal){
    if(!/^[a-zA-Z0-9]{22}$/.test(track.id))return null;
    const data=await readJson(`/api/canvas?trackId=${encodeURIComponent(track.id)}`,signal);
    const video=isRecord(data) ? safeStageMediaV330(data.canvasUrl) : undefined;
    return video ? {source:"canvas",kind:"video",url:video,title:track.title||"Spotify Canvas"}:null;
  }},
  {id:"cover",label:"Albumcover",async load(track){
    const url=safeStageMediaV330(track.albumCoverUrl);
    return url ? {source:"cover",kind:"image",url,title:track.title||"Albumcover"}:null;
  }},
  fromEndpoint("text","API-Text / Künstler-Biografie"),
  fromEndpoint("photos","Künstlerfotos"),
  fromEndpoint("concerts","Konzerttermine"),
];
function isRecord(value:unknown):value is Record<string,unknown>{return typeof value==="object"&&value!==null&&!Array.isArray(value);}
export async function loadStageSlidesV330(track:StageContentContextV330,settings:StageContentSettingsV330,signal:AbortSignal):Promise<StageContentV330[]>{
  const selected=STAGE_CONTENT_PROVIDERS_V330.filter(p=>settings.sources[p.id]);
  // One failing / unauthorized provider must not prevent other sources from appearing.
  const results=await Promise.all(selected.map(p=>p.load(track,settings,signal).catch(()=>null)));
  if(signal.aborted)return [];
  return results.filter((x):x is StageContentV330=>x!==null);
}
