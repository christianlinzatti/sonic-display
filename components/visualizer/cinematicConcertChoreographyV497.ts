import {resolveVocalTimeCueV496,type VocalTimeSegmentV496} from "./vocalTimeDirectorV496";

/** V497 only orchestrates existing stage systems; no renderer, mixer, scene writer or timers. */
export type CinematicBeatV497="solo"|"duet"|"hook";
export type CinematicConcertCueV497={
 active:boolean;trackId:string;startMs:number;endMs:number;leadSlot:number;
 singerSlots:readonly number[];beat:CinematicBeatV497;emphasis:number;
 cameraActive:boolean;lightingActive:boolean;lyricsProtected:boolean;
 cameraWeight:number;lightGain:number;beamGain:number;focusSlot:number|null;
};
const clamp=(n:number,min:number,max:number)=>Math.max(min,Math.min(max,n));
const idle: CinematicConcertCueV497={active:false,trackId:"",startMs:0,endMs:0,leadSlot:0,
 singerSlots:[],beat:"solo",emphasis:0,cameraActive:false,lightingActive:false,
 lyricsProtected:false,cameraWeight:0,lightGain:1,beamGain:1,focusSlot:null};
export function planCinematicConcertV497(input:{
 trackId:string;cueTrackId:string;progressMs:number;playing:boolean;reducedMotion:boolean;
 enabled:boolean;castCount:number;segments:readonly VocalTimeSegmentV496[]|undefined;
 manualVocalPriority:boolean;manualCameraPriority:boolean;manualLightingPriority:boolean;
 cameraEnabled:boolean;lightingEnabled:boolean;lyricsActive:boolean;
}):CinematicConcertCueV497{
 if(!input.trackId||input.trackId!==input.cueTrackId||!input.enabled||!input.playing||
    !Number.isFinite(input.progressMs)||input.progressMs<0||input.manualVocalPriority||
    !Number.isInteger(input.castCount)||input.castCount<2||input.castCount>4)return idle;
 const cue=resolveVocalTimeCueV496({trackId:input.cueTrackId,progressMs:input.progressMs,
  playing:input.playing,enabled:true,count:input.castCount,segments:input.segments,
  reducedMotion:input.reducedMotion});
 if(!cue.active||!cue.style)return idle;
 const beat:CinematicBeatV497=cue.style==="hook"?"hook":cue.style==="duet"?"duet":"solo";
 const calm=input.reducedMotion?0:clamp(cue.emphasis,0,1);
 const cameraActive=input.cameraEnabled&&!input.manualCameraPriority&&calm>0;
 const lightingActive=input.lightingEnabled&&!input.manualLightingPriority&&calm>0;
 // Cap automatic accents. Explicit stage blackouts are handled again at light-apply time.
 const cameraWeight=cameraActive?calm*(input.lyricsActive?.5:.85):0;
 const lightGain=lightingActive?1+calm*(beat==="hook"?.11:.065):1;
 const beamGain=lightingActive?1+calm*(beat==="hook"?.13:.10)*(input.lyricsActive?.45:1):1;
 return {active:true,trackId:input.trackId,startMs:cue.startMs,endMs:cue.endMs,
   leadSlot:cue.leadSlot,singerSlots:cue.singingSlots,beat,emphasis:calm,
   cameraActive,lightingActive,lyricsProtected:input.lyricsActive,cameraWeight,
   lightGain,beamGain,focusSlot:lightingActive&&beat!=="hook"?cue.leadSlot:null};
}
/** Finishing pass on automatic camera poses only. Existing singer tracking owns X/Y and target position.
 * Keep FOV changes small and keep lyrics readable; never touch explicitly authored camera poses.
 */
export function composeCinematicConcertCameraV497<T extends {fov:number;z:number}>(
 base:T,cue:CinematicConcertCueV497|undefined,{authored,lyricsProtected}:{authored:boolean;lyricsProtected:boolean}):T{
 if(!cue?.cameraActive||authored||!Number.isFinite(base.fov)||!Number.isFinite(base.z))return base;
 const gain=cue.cameraWeight*(lyricsProtected?.6:1);
 const fovOffset=cue.beat==="hook"?1.25:cue.beat==="duet"?.65:-.9;
 const zOffset=cue.beat==="hook"?.065:cue.beat==="duet"?.025:-.05;
 return {...base,fov:clamp(base.fov+fovOffset*gain,27,68),
   z:Math.max(2.5,base.z+zOffset*gain)};
}
/** Lighting will be applied only after checking actual authored timelines/blackouts in DynamicStage. */
export function concertLightMultiplierV497(cue:CinematicConcertCueV497|undefined,kind:"key"|"beam",options:{
 authored:boolean;blackout:boolean;playing:boolean;reducedMotion:boolean;lowTier?:boolean;
}):number{
 if(!cue?.lightingActive||options.authored||options.blackout||!options.playing||options.reducedMotion)return 1;
 const raw=kind==="key"?cue.lightGain:cue.beamGain;
 return clamp(1+(raw-1)*(options.lowTier?.5:1),1,kind==="key"?1.11:1.13);
}
