/** V351: shared, deterministic composition policy for the *existing* R3F stage.
 * No timers, audio listeners, GPU resources, content URLs or history are stored here. */
export type StageFocusV351 = 'auto'|'lyrics'|'avatars'|'photos'|'balanced';
export interface SmartStageSettingsV351 {
 enabled:boolean; focus:StageFocusV351; lyricsProtection:number; clearance:number;
 cameraProtection:number; lightProtection:number; maxPanelScale:number;
}
export interface SmartStageInputV351 {
 lyricsActive:boolean; lyricsSide?:'left'|'right'|null; section?:string;
 screenCount:number; avatarCount:number; playing:boolean; reducedMotion:boolean; beatAccent?:number;
}
export interface SmartStageCueV351 {
 active:boolean; focus:Exclude<StageFocusV351,'auto'>; protectLyrics:boolean;
 screenScale:number; photoOpacity:number; maxPhotos:number; photoMotionCap:number;
 lightGain:number; beamGain:number; fxGain:number;
 minCameraZ:number; minFov:number; maxCameraSway:number;
 lyricsOffsetX:number; lyricsSide:'left'|'right'|null; avatarCount:number;
 clearance:number; reason:string;
}
export const SMART_STAGE_KEY_V351='sonic-smart-stage-composition-v351';
export const SMART_STAGE_EVENT_V351='sonic:smart-stage-composition-v351';
export const DEFAULT_SMART_STAGE_V351:SmartStageSettingsV351={
 enabled:true,focus:'auto',lyricsProtection:.85,clearance:.65,cameraProtection:.7,
 lightProtection:.65,maxPanelScale:.92,
};
const finite=(x:unknown,fallback:number,min=0,max=1)=>typeof x==='number'&&Number.isFinite(x)?Math.max(min,Math.min(max,x)):fallback;
const inSet=(x:unknown):x is StageFocusV351=>x==='auto'||x==='lyrics'||x==='avatars'||x==='photos'||x==='balanced';
export function sanitizeSmartStageV351(raw:unknown):SmartStageSettingsV351 {
 const s=raw&&typeof raw==='object'&&!Array.isArray(raw)?raw as Partial<SmartStageSettingsV351>:{};
 return {enabled:s.enabled!==false,focus:inSet(s.focus)?s.focus:'auto',
  lyricsProtection:finite(s.lyricsProtection,.85),clearance:finite(s.clearance,.65),
  cameraProtection:finite(s.cameraProtection,.7),lightProtection:finite(s.lightProtection,.65),
  maxPanelScale:finite(s.maxPanelScale,.92,.4,1)};
}
export function readSmartStageV351():SmartStageSettingsV351 {
 if(typeof window==='undefined')return {...DEFAULT_SMART_STAGE_V351};
 try {const raw=window.localStorage.getItem(SMART_STAGE_KEY_V351);
  return raw===null?{...DEFAULT_SMART_STAGE_V351}:sanitizeSmartStageV351(JSON.parse(raw));}
 catch{return {...DEFAULT_SMART_STAGE_V351};}
}
export function saveSmartStageV351(settings:SmartStageSettingsV351):SmartStageSettingsV351 {
 const safe=sanitizeSmartStageV351(settings);
 if(typeof window!=='undefined'){
  try{window.localStorage.setItem(SMART_STAGE_KEY_V351,JSON.stringify(safe));}catch{}
  window.dispatchEvent(new Event(SMART_STAGE_EVENT_V351));
 }
 return safe;
}
const clamp=(n:number,a:number,b:number)=>Math.max(a,Math.min(b,n));
export function decideSmartStageV351(input:SmartStageInputV351,settings:SmartStageSettingsV351):SmartStageCueV351 {
 const s=sanitizeSmartStageV351(settings);
 const panels=Math.floor(finite(input.screenCount,0,0,5));
 const avatars=Math.floor(finite(input.avatarCount,1,1,8));
 const lyrics=input.lyricsActive===true;
 const side=lyrics?(input.lyricsSide==='left'||input.lyricsSide==='right'?input.lyricsSide:null):null;
 const section=(input.section||'').toLowerCase();
 const impact=/drop|hook|chorus|refrain|climax|peak/.test(section);
 const verse=/verse|strophe|intro|bridge|break|outro|pre.?chorus/.test(section);
 const focus:SmartStageCueV351['focus']=s.focus!=='auto'?s.focus:lyrics&&verse?'lyrics':
  lyrics&&impact?'avatars':!lyrics&&panels>0&&verse?'photos':impact?'avatars':lyrics?'lyrics':'balanced';
 const neutral:SmartStageCueV351={active:false,focus,protectLyrics:false,screenScale:1,
  photoOpacity:1,maxPhotos:8,photoMotionCap:Number.POSITIVE_INFINITY,lightGain:1,beamGain:1,fxGain:1,
  minCameraZ:0,minFov:0,maxCameraSway:Number.POSITIVE_INFINITY,lyricsOffsetX:0,
  lyricsSide:null,avatarCount:avatars,clearance:0,reason:'Bestehende Stage-Komposition'};
 if(!s.enabled)return neutral;
 const protection=lyrics?s.lyricsProtection:0;
 // Readability has a hard floor regardless of the selected artistic focus.
 const readability=lyrics?Math.max(.35,protection*(focus==='lyrics'?1:.72)):0;
 const beat=finite(input.beatAccent,0)*(input.playing ? .9 : 0);
 const slow=input.reducedMotion||!input.playing;
 const competingContent=panels>0||lyrics;
 const composition:SmartStageCueV351={active:true,focus,protectLyrics:lyrics,
  screenScale:clamp(s.maxPanelScale*(1-s.clearance*(avatars>=3 ? .17 : .09))*(lyrics ? .91 : 1),.38,1),
  photoOpacity:clamp(1-readability*(focus==='lyrics' ? .42 : .24),.55,1),
  maxPhotos:lyrics?(focus==='lyrics'?2:impact?3:3):focus==='avatars'?4:8,
  photoMotionCap:slow?0:lyrics?focus==='lyrics' ? .42 : .75:1+beat*.4,
  lightGain:clamp(1-readability*s.lightProtection*.38,.62,1),
  beamGain:clamp(1-readability*s.lightProtection*.65,.42,1),
  fxGain:clamp(1-readability*.65,.44,1),
  minCameraZ:competingContent ? (panels>0?5.1+s.cameraProtection*.7:4.1+s.cameraProtection*.5)+(avatars>=3?1.8:avatars===2 ? .65 : 0) : 0,
  minFov:competingContent ? 38+s.cameraProtection*4 : 0,
  maxCameraSway:competingContent ? clamp(.45-s.cameraProtection*.3,.12,.45) : Number.POSITIVE_INFINITY,
  lyricsOffsetX:side==='left'?-(.12+.16*protection):side==='right'?.12+.16*protection:0,
  lyricsSide:side,avatarCount:avatars,clearance:s.clearance,
  reason:focus==='lyrics'?'Text bleibt lesbar, Medien und Effekte treten zurück':
   focus==='avatars'?'Tänzer im Fokus – sichere Kamera und gedämpfte Lichtspitzen':
   focus==='photos'?'Bildschirme im Fokus – Avatar-Sicherheitsabstände bleiben erhalten':
   'Ausgewogene Bühne mit geschützten Inhaltszonen'};
 return composition;
}
export interface StagePanelPlacementV351 {x:number;y:number;z:number;scale:number;yaw:number;}
/** Apply bounded corrections in stage units; a rear projection is retained behind dancers. */
export function composeStagePanelsV351<T extends StagePanelPlacementV351 & {enabled:boolean;id:string}>(
 screens:readonly T[],cue:SmartStageCueV351):T[] {
 if(!cue.active)return [...screens];
 const occupied:StagePanelPlacementV351[]=[];
 return screens.map((screen):T=>{
  if(!screen.enabled)return screen;
  const rear=Math.abs(screen.x)<1.6&&screen.z<=-3.15;
  const sameSide=cue.protectLyrics&&cue.lyricsSide!==null&&Math.sign(screen.x)===(cue.lyricsSide==='left'?-1:1);
  let x=screen.x, y=screen.y, z=screen.z;
  let scale=clamp(screen.scale, .25, rear?cue.screenScale:Math.min(cue.screenScale,.72));
  if(rear){z=Math.min(z,-3.8);y=Math.max(y,.95);}
  else {
   if(Math.abs(x)<2.65){const preferred=cue.lyricsSide==='right'?-1:1;x=preferred*(3.05+cue.clearance*.45);}
   else x=Math.sign(x||1)*Math.max(Math.abs(x),3.05+cue.clearance*.45);
   if(sameSide||cue.lyricsSide!==null&&Math.sign(x)===(cue.lyricsSide==='left'?-1:1)){
    x+=Math.sign(x)*cue.clearance*.36;scale*=.85;
   }
   z=Math.min(z,-2.35);y=Math.max(y,.8);
  }
  // Adjacent side panels avoid sharing the same bounding rectangle when possible.
  for(const prev of occupied){
   const width=(scale+prev.scale)*2.0;
   if(Math.abs(x-prev.x)<width*.68&&Math.abs(y-prev.y)<(scale+prev.scale)*.8 && Math.abs(z-prev.z)<1.7){
    y=clamp(y+.7,-.4,3.3);scale*=.82;
   }
  }
  const next={...screen,x:clamp(x,-6,6),y:clamp(y,-.4,3.6),z:clamp(z,-7,-.6),scale:clamp(scale,.25,1.8)};
  occupied.push(next);
  return next;
 });
}
export function composeLegacyPlacementV351(placement:StagePanelPlacementV351,cue:SmartStageCueV351):StagePanelPlacementV351 {
 if(!cue.active)return placement;
 const rear=placement.z<=-3.1;
 if(rear)return {...placement,z:Math.min(-3.8,placement.z),scale:Math.min(placement.scale,cue.screenScale)};
 const sameSide=cue.lyricsSide!==null&&Math.sign(placement.x)===(cue.lyricsSide==='left'?-1:1);
 return {...placement,x:Math.sign(placement.x||1)*Math.max(Math.abs(placement.x),3.1+(sameSide?cue.clearance*.55:0)),
  scale:Math.max(.25,Math.min(placement.scale,cue.screenScale*(sameSide ? .85 : 1)))};
}
export function guardAutomaticCameraV351<T extends {x:number;z:number;fov:number}>(pose:T,cue?:SmartStageCueV351):T {
 if(!cue?.active)return pose;
 return {...pose,x:clamp(pose.x,-cue.maxCameraSway,cue.maxCameraSway),
  z:Math.max(pose.z,cue.minCameraZ),fov:Math.max(pose.fov,cue.minFov)};
}
/** V351 augments the V350 photo cue without mutating its saved settings. */
export function coordinatePhotosV351<T extends {active:boolean;visiblePhotos:number;photoOpacity:number;photoMotion:number}>(cue:T,stage?:SmartStageCueV351):T {
 if(!stage?.active)return cue;
 return {...cue,active:true,visiblePhotos:Math.min(cue.visiblePhotos,stage.maxPhotos),
  photoOpacity:Math.min(cue.photoOpacity,stage.photoOpacity),photoMotion:Math.min(cue.photoMotion,stage.photoMotionCap)};
}
