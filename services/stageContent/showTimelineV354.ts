/** V354: bounded, deterministic show score, independent of any React component or 3D renderer.
 * Tracks are evaluated at Spotify song time. Manual camera edits and V351 safety take precedence. */
export const SHOW_TIMELINE_KEY_V354='sonic-show-timeline-v354';
export const SHOW_TIMELINE_EVENT_V354='sonic:show-timeline-v354';
export type ShowLaneV354='dance'|'camera'|'lighting'|'effects'|'photos'|'lyrics';
export type CameraShotV354='wide'|'medium'|'close'|'orbit';
export type DanceFormationV354='solo'|'sync'|'mirror'|'duet';
export type ShowValueV354=string|number;
export type ShowClipV354={id:string;lane:ShowLaneV354;startMs:number;durationMs:number;value:ShowValueV354;label:string};
export type ShowTimelineV354={version:1;enabled:boolean;name:string;durationMs:number;trackId:string;clips:ShowClipV354[]};
export type ShowTimelineInputV354={progressMs?:number;trackId?:string|null;playing:boolean;reducedMotion:boolean;lyricsActive:boolean};
export type ShowTimelineCueV354={active:boolean;danceFormation?:DanceFormationV354;cameraShot?:CameraShotV354;
 lightGain:number;fxGain:number;photoOpacity:number;lyricsFocus:boolean;timeMs:number;activeLanes:ShowLaneV354[]};
export const SHOW_LANES_V354:ShowLaneV354[]=['dance','camera','lighting','effects','photos','lyrics'];
const defaults:Record<ShowLaneV354,ShowValueV354>={dance:'sync',camera:'wide',lighting:1.2,effects:1.3,photos:.7,lyrics:'focus'};
export const DEFAULT_TIMELINE_V354:ShowTimelineV354={version:1,enabled:false,name:'Meine Show',durationMs:180000,trackId:'',clips:[]};
const clipMax=400;
const num=(v:unknown,f:number,a:number,b:number)=>typeof v==='number'&&Number.isFinite(v)?Math.min(b,Math.max(a,v)):f;
const str=(v:unknown,max:number)=>typeof v==='string'?v.trim().slice(0,max):'';
const lane=(v:unknown):v is ShowLaneV354=>SHOW_LANES_V354.includes(v as ShowLaneV354);
const validValue=(l:ShowLaneV354,v:unknown):ShowValueV354=>{
 switch(l){
 case 'dance':return ['solo','sync','mirror','duet'].includes(String(v))?String(v):'sync';
 case 'camera':return ['wide','medium','close','orbit'].includes(String(v))?String(v):'wide';
 case 'lyrics':return v==='focus'?'focus':'normal';
 case 'lighting':return num(v,1,.25,1.8);
 case 'effects':return num(v,1,0,1.8);
 case 'photos':return num(v,1,0,1);
 }
};
export function sanitizeTimelineV354(raw:unknown):ShowTimelineV354 {
 const s:Partial<ShowTimelineV354>=raw&&typeof raw==='object'&&!Array.isArray(raw)?raw as Partial<ShowTimelineV354>:{};
 const durationMs=Math.round(num(s.durationMs,180000,10000,1800000));
 const clips:ShowClipV354[]=[];
 if(Array.isArray(s.clips))for(const v of s.clips.slice(0,clipMax*2)){
  if(clips.length>=clipMax)break;
  if(!v||typeof v!=='object'||!lane(v.lane))continue;
  const id=str(v.id,36);if(!/^[a-zA-Z0-9-]{1,36}$/.test(id)||clips.some(c=>c.id===id))continue;
  const startMs=Math.round(num(v.startMs,0,0,durationMs-1));
  const clipDuration=Math.round(num(v.durationMs,4000,250,Math.max(250,durationMs-startMs)));
  clips.push({id,lane:v.lane,startMs,durationMs:Math.min(clipDuration,durationMs-startMs),value:validValue(v.lane,v.value),label:str(v.label,60)||v.lane});
 }
 return {version:1,enabled:s.enabled===true,name:str(s.name,60)||'Meine Show',durationMs,trackId:str(s.trackId,160),clips};
}
export function readTimelineV354():ShowTimelineV354 {
 if(typeof window==='undefined')return sanitizeTimelineV354(DEFAULT_TIMELINE_V354);
 try{return sanitizeTimelineV354(JSON.parse(window.localStorage.getItem(SHOW_TIMELINE_KEY_V354)||'null'));}catch{return sanitizeTimelineV354(null);}
}
export function saveTimelineV354(score:ShowTimelineV354):ShowTimelineV354 {
 const clean=sanitizeTimelineV354(score);
 if(typeof window!=='undefined'){
  try{window.localStorage.setItem(SHOW_TIMELINE_KEY_V354,JSON.stringify(clean));}catch{}
  window.dispatchEvent(new Event(SHOW_TIMELINE_EVENT_V354));
 }
 return clean;
}
export function addTimelineClipV354(score:ShowTimelineV354,l:ShowLaneV354,atMs:number):ShowTimelineV354 {
 const s=sanitizeTimelineV354(score);if(s.clips.length>=clipMax||!lane(l))return s;
 let idNo=1;while(s.clips.some(c=>c.id===`cue-${idNo}`))idNo++;
 const startMs=Math.round(num(atMs,0,0,s.durationMs-1));
 const clip:ShowClipV354={id:`cue-${idNo}`,lane:l,startMs,durationMs:Math.min(8000,s.durationMs-startMs),value:defaults[l],label:`${l} ${idNo}`};
 return {...s,clips:[...s.clips,clip]};
}
export function updateTimelineClipV354(score:ShowTimelineV354,id:string,patch:Partial<ShowClipV354>):ShowTimelineV354 {
 const s=sanitizeTimelineV354(score);
 return sanitizeTimelineV354({...s,clips:s.clips.map(c=>c.id===id?{...c,...patch,id:c.id,lane:c.lane}:c)});
}
export function deleteTimelineClipV354(score:ShowTimelineV354,id:string):ShowTimelineV354 {
 const s=sanitizeTimelineV354(score);return {...s,clips:s.clips.filter(c=>c.id!==id)};
}
const unit=(v:number)=>Math.max(0,Math.min(1,v));
export function evaluateTimelineV354(raw:ShowTimelineV354,input:ShowTimelineInputV354):ShowTimelineCueV354 {
 const score=sanitizeTimelineV354(raw);
 const timeMs=num(input.progressMs,0,0,1800000);
 const neutral:ShowTimelineCueV354={active:false,lightGain:1,fxGain:1,photoOpacity:1,lyricsFocus:false,timeMs,activeLanes:[]};
 // No invented song clock. Play only with an actual finite playback progress and matching track scope.
 if(!score.enabled||!input.playing||!Number.isFinite(input.progressMs)||timeMs>=score.durationMs||
  (score.trackId&&score.trackId!==input.trackId))return neutral;
 const selection=new Map<ShowLaneV354,ShowClipV354>();
 for(const c of score.clips){
  if(c.startMs>timeMs||timeMs>=c.startMs+c.durationMs)continue;
  const previous=selection.get(c.lane);
  if(!previous||c.startMs>=previous.startMs)selection.set(c.lane,c);
 }
 if(!selection.size)return neutral;
 const get=(l:ShowLaneV354)=>selection.get(l)?.value;
 const lyricsFocus=get('lyrics')==='focus';
 const protection=input.lyricsActive ? .75 : 1;
 return {active:true,timeMs,activeLanes:[...selection.keys()],
  danceFormation:input.reducedMotion?undefined:get('dance') as DanceFormationV354|undefined,
  cameraShot:input.reducedMotion?undefined:get('camera') as CameraShotV354|undefined,
  lightGain:input.reducedMotion||!selection.has('lighting')?1:num(get('lighting'),1,.25,1.8)*(input.lyricsActive?.88:1),
  fxGain:!selection.has('effects')?1:input.reducedMotion?0:num(get('effects'),1,0,1.8)*protection,
  photoOpacity:unit((selection.has('photos')?num(get('photos'),1,0,1):1)*(selection.has('photos')&&input.lyricsActive?.85:1)*(lyricsFocus?.68:1)),
  lyricsFocus};
}
/** Additive cue to automatic camera positions only, never to saved/manual editor poses. */
export function directCameraV354<T extends {x:number;z:number;fov:number}>(pose:T,shot:CameraShotV354|undefined,timeMs:number):T {
 if(!shot)return pose;
 const base={...pose};
 switch(shot){
 case 'wide':return {...base,z:base.z*1.16,fov:Math.min(60,base.fov+4)};
 case 'medium':return {...base,z:base.z*1.03};
 case 'close':return {...base,z:base.z*.88,fov:Math.max(30,base.fov-3)};
 case 'orbit':return {...base,x:base.x+Math.sin(timeMs/2600)*.55,z:base.z*1.08};
 }
}
