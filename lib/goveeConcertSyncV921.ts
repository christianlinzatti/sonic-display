/** V921 – share real V354/V356 stage cue decisions with the existing Govee music loop.
 * Pure transforms only. No LAN commands, automatic power control, RGBIC segments,
 * invented beat/verse/drop detection or new source of musical truth.
 */
import type {GoveeLookV909} from '@/lib/goveeLanV909';
import type {GoveeRoleV911} from '@/lib/goveeConcertDirectorV911';
import type {CameraShotV354,DanceFormationV354,ShowLaneV354,ShowTimelineCueV354} from '@/services/stageContent/showTimelineV354';

export const GOVEE_CINEMATIC_KEY_V921='sonic-display:govee-cinematic-sync-v921';
export const GOVEE_CINEMATIC_EVENT_V921='sonic-display:govee-cinematic-sync-changed-v921';
export const GOVEE_STAGE_CUE_EVENT_V921='sonic-display:stage-cue-v921';
export type GoveeConcertSyncSettingsV921={enabled:boolean;strength:number;maxChangePoints:number;
 followCamera:boolean;followDance:boolean;followLighting:boolean;protectLyrics:boolean;includeAutomatic:boolean};
export const DEFAULT_GOVEE_CINEMATIC_V921:GoveeConcertSyncSettingsV921={enabled:false,strength:65,maxChangePoints:10,
 followCamera:true,followDance:true,followLighting:true,protectLyrics:true,includeAutomatic:true};
export type GoveeStageSourceV921='authored'|'automatic'|'none';
export type GoveeStageCueV921={trackId:string;progressMs:number;capturedAt:number;playing:boolean;
 source:GoveeStageSourceV921;activeLanes:ShowLaneV354[];cameraShot?:CameraShotV354;
 danceFormation?:DanceFormationV354;lightGain:number;lyricsVisible:boolean;lyricsFocus:boolean;reducedMotion:boolean};
export type GoveeCinematicDecisionV921={active:boolean;source:GoveeStageSourceV921;
 camera:boolean;dance:boolean;lighting:boolean;lyrics:boolean;weight:number;reason:string};
const clamp=(v:number,lo:number,hi:number)=>Math.min(hi,Math.max(lo,Number.isFinite(v)?v:lo));
const num=(v:unknown,defaultValue:number,lo:number,hi:number)=>typeof v==='number'&&Number.isFinite(v)?Math.round(clamp(v,lo,hi)):defaultValue;
const lanes:ShowLaneV354[]=['dance','camera','lighting','effects','photos','lyrics'];
const shots:CameraShotV354[]=['wide','medium','close','orbit'];
const formations:DanceFormationV354[]=['solo','sync','mirror','duet'];
const activeSources:GoveeStageSourceV921[]=['authored','automatic','none'];
export function normalizeGoveeCinematicV921(raw:unknown):GoveeConcertSyncSettingsV921{
 const v=raw&&typeof raw==='object'&&!Array.isArray(raw)?raw as Partial<GoveeConcertSyncSettingsV921>:{};
 return {enabled:v.enabled===true,strength:num(v.strength,65,0,100),maxChangePoints:num(v.maxChangePoints,10,0,12),
  followCamera:v.followCamera!==false,followDance:v.followDance!==false,
  followLighting:v.followLighting!==false,protectLyrics:v.protectLyrics!==false,includeAutomatic:v.includeAutomatic!==false};
}
export function loadGoveeCinematicV921():GoveeConcertSyncSettingsV921{
 if(typeof window==='undefined')return {...DEFAULT_GOVEE_CINEMATIC_V921};
 try{return normalizeGoveeCinematicV921(JSON.parse(window.localStorage.getItem(GOVEE_CINEMATIC_KEY_V921)||'null'));}
 catch{return {...DEFAULT_GOVEE_CINEMATIC_V921};}
}
export function saveGoveeCinematicV921(value:GoveeConcertSyncSettingsV921):void{
 if(typeof window==='undefined')return;
 const safe=normalizeGoveeCinematicV921(value);
 window.localStorage.setItem(GOVEE_CINEMATIC_KEY_V921,JSON.stringify(safe));
 window.dispatchEvent(new Event(GOVEE_CINEMATIC_EVENT_V921));
}
/** Only one event per 1.4s from the already-mounted 3D stage; Govee does no new polling. */
export function makeGoveeStageCueV921(input:{trackId?:string|null;progressMs?:number;capturedAt:number;playing:boolean;
 source:GoveeStageSourceV921;cue:ShowTimelineCueV354;danceFormation?:string|null;
 lyricsVisible:boolean;reducedMotion:boolean}):GoveeStageCueV921{
 const cue=input.cue;
 return {trackId:typeof input.trackId==='string'?input.trackId.slice(0,160):'',
  progressMs:typeof input.progressMs==='number'&&Number.isFinite(input.progressMs)?input.progressMs:-1,
  capturedAt:Number.isFinite(input.capturedAt)?input.capturedAt:0,playing:input.playing===true,
  source:activeSources.includes(input.source)?input.source:'none',
  activeLanes:cue.active?lanes.filter(l=>cue.activeLanes.includes(l)):[],
  cameraShot:cue.active&&shots.includes(cue.cameraShot as CameraShotV354)?cue.cameraShot:undefined,
  danceFormation:cue.active&&formations.includes(input.danceFormation as DanceFormationV354)?input.danceFormation as DanceFormationV354:undefined,
  lightGain:cue.active?clamp(cue.lightGain,.25,1.8):1,
  lyricsVisible:input.lyricsVisible===true,lyricsFocus:cue.active&&cue.lyricsFocus===true,
  reducedMotion:input.reducedMotion===true};
}
/** An event must be from the SAME track and playback clock and must still be fresh.
 * A resumed/stale/unmounted stage never supplies a valid cue. */
export function validGoveeStageCueV921(cue:GoveeStageCueV921|null|undefined,trackId:string,progressMs:number,now:number):cue is GoveeStageCueV921{
 return Boolean(cue&&cue.playing&&trackId&&cue.trackId===trackId&&
  Number.isFinite(now)&&Number.isFinite(cue.capturedAt)&&now>=cue.capturedAt&&now-cue.capturedAt<=4000&&
  Number.isFinite(progressMs)&&progressMs>=0&&Number.isFinite(cue.progressMs)&&cue.progressMs>=0&&
  Math.abs(progressMs-(cue.progressMs+(now-cue.capturedAt)))<=3000&&
  activeSources.includes(cue.source));
}
const cameraWeights:Record<CameraShotV354,Partial<Record<GoveeRoleV911,number>>>= {
 wide:{wall:.42,rhythm:.08,neon:.23,ambient:.18},
 medium:{wall:.10,rhythm:.04,neon:.08},
 close:{wall:-.14,rhythm:-.25,neon:-.19,ambient:-.03},
 orbit:{wall:.21,rhythm:.12,neon:.32,ambient:.05},
};
const danceWeights:Record<DanceFormationV354,Partial<Record<GoveeRoleV911,number>>>= {
 solo:{wall:.08,rhythm:-.14,neon:-.09},
 sync:{wall:.28,rhythm:.40,neon:.25,ambient:.02},
 mirror:{wall:.24,rhythm:.27,neon:.32},
 duet:{wall:.24,rhythm:.12,neon:.20,ambient:.07},
};
const lightingWeights:Record<GoveeRoleV911,number>={wall:.85,rhythm:.72,neon:.78,ambient:.38};
const lyricsWeights:Record<GoveeRoleV911,number>={wall:-.16,rhythm:-.48,neon:-.34,ambient:.04};
const inactive=(reason:string):GoveeCinematicDecisionV921=>({active:false,source:'none',camera:false,dance:false,lighting:false,lyrics:false,weight:0,reason});
/** Shared cues, not an observation of actual camera lens movement: manual camera priority
 * can override the V354/V356 plan. No synchronized cue without the stage signal. */
export function planGoveeCinematicV921(cue:GoveeStageCueV921|null|undefined,trackId:string,progressMs:number,now:number,
 role:GoveeRoleV911,settings:GoveeConcertSyncSettingsV921):GoveeCinematicDecisionV921{
 const s=normalizeGoveeCinematicV921(settings);
 if(!s.enabled||s.strength===0||s.maxChangePoints===0)return inactive('V921 ausgeschaltet');
 if(!validGoveeStageCueV921(cue,trackId,progressMs,now))return inactive('Kein aktueller Bühnen-Cue für diesen Track');
 const permitted=cue.source==='authored'||cue.source==='automatic'&&s.includeAutomatic;
 const camera=permitted&&!cue.reducedMotion&&s.followCamera&&cue.activeLanes.includes('camera')&&
  Boolean(cue.cameraShot&&shots.includes(cue.cameraShot));
 const dance=permitted&&!cue.reducedMotion&&s.followDance&&cue.activeLanes.includes('dance')&&
  Boolean(cue.danceFormation&&formations.includes(cue.danceFormation));
 const lighting=permitted&&!cue.reducedMotion&&s.followLighting&&cue.activeLanes.includes('lighting')&&
  Number.isFinite(cue.lightGain);
 // Real displayed lyrics can be protected even without a staged camera/dance cue.
 const lyrics=s.protectLyrics&&(cue.lyricsVisible||permitted&&cue.lyricsFocus);
 if(!camera&&!dance&&!lighting&&!lyrics)return inactive('Keine freigegebenen aktiven Show-Cues');
 let weight=0;
 if(camera)weight+=cameraWeights[cue.cameraShot!][role]??0;
 if(dance)weight+=danceWeights[cue.danceFormation!][role]??0;
 if(lighting)weight+=clamp(cue.lightGain-1,-.45,.45)*lightingWeights[role]*1.25;
 if(lyrics)weight+=lyricsWeights[role];
 weight=clamp(weight,-1,1);
 return {active:true,source:cue.source,camera,dance,lighting,lyrics,weight,
  reason:cue.source==='authored'?'Gemeinsame V354-Timeline':cue.source==='automatic'?'Gemeinsame V356-Show-Cues':'Tatsächlich sichtbare Lyrics'};
}
/** Maintain the previous color, role, group brightness and fade. A single bounded
 * brightness adjustment is passed to the EXISTING rate-limited Govee command loop. */
export function applyGoveeCinematicV921(base:GoveeLookV909,decision:GoveeCinematicDecisionV921,
 settings:GoveeConcertSyncSettingsV921,masterBrightness:number):GoveeLookV909{
 if(!decision.active||!Number.isFinite(base.brightness))return base;
 const s=normalizeGoveeCinematicV921(settings);
 if(!s.enabled||s.strength===0||s.maxChangePoints===0)return base;
 const delta=clamp(Math.round(decision.weight*s.maxChangePoints*s.strength/100),-s.maxChangePoints,s.maxChangePoints);
 if(delta===0)return base;
 const b=clamp(base.brightness,1,100);
 const max=Math.min(100,Math.max(b,clamp(masterBrightness,1,100)+s.maxChangePoints));
 const brightness=delta>0?Math.min(max,b+delta):Math.max(20,b+delta);
 return brightness===base.brightness?base:{...base,brightness};
}
/** Explicit synthetic stage cue for an offline preview – never used for hardware dispatch. */
export function previewGoveeCinematicV921(role:GoveeRoleV911,settings:GoveeConcertSyncSettingsV921,
 options:{camera?:CameraShotV354;dance?:DanceFormationV354;lyrics?:boolean;lightingGain?:number;source?:GoveeStageSourceV921},
 brightness=55,master=75){
 const cue:GoveeStageCueV921={trackId:'v921-preview',progressMs:10000,capturedAt:1000,playing:true,
  source:options.source??'authored',activeLanes:[...(options.camera?['camera' as const]:[]),
   ...(options.dance?['dance' as const]:[]),...(options.lightingGain!==undefined?['lighting' as const]:[])],
  cameraShot:options.camera,danceFormation:options.dance,lyricsVisible:options.lyrics===true,
  lyricsFocus:options.lyrics===true,lightGain:options.lightingGain??1,reducedMotion:false};
 const effective={...settings,enabled:true};
 const decision=planGoveeCinematicV921(cue,cue.trackId,10200,1200,role,effective);
 const look=applyGoveeCinematicV921({color:{r:120,g:42,b:160},brightness},decision,effective,master);
 return {base:brightness,result:look.brightness,decision};
}
