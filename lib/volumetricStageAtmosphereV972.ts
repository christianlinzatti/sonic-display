/** V972 - Volumetric Stage Atmosphere (bounded screen-space approximations).
 * Layered 3D translucent shader planes; no raymarching, extra lights or animation loop.
 * The verified, user-approved V966 cue is authoritative. No hardware commands.
 */
import type {ImmersiveCueV966} from './immersiveConcertEngineV966';
import type {ConcertSceneV958,ConcertSettingsV958} from './ultimateConcertRoadmapV958';

export type AtmosphereQualityV972='eco'|'balanced'|'cinematic';
export type VolumetricCueV972=Readonly<{
 active:boolean;quality:AtmosphereQualityV972;
 beamLayers:number;hazeLayers:number;beamOpacity:number;hazeOpacity:number;floorOpacity:number;
 colorA:string;colorB:string;phase:number;fanWidth:number;
}>;
export type VolumetricInputV972=Readonly<{
 immersive:ImmersiveCueV966;scene:ConcertSceneV958|null;settings:ConcertSettingsV958;
 positionMs:number;playing:boolean;authoredStage:boolean;lowPerformance:boolean;
 reducedMotion:boolean;lyricsVisible:boolean;
}>;
const OFF:VolumetricCueV972=Object.freeze({active:false,quality:'eco',beamLayers:0,hazeLayers:0,
 beamOpacity:0,hazeOpacity:0,floorOpacity:0,colorA:'#000000',colorB:'#000000',phase:0,fanWidth:1});
const clamp=(n:number)=>Math.min(1,Math.max(0,n));
const VALID_QUALITIES:Readonly<AtmosphereQualityV972[]>=['eco','balanced','cinematic'];
/** Explicit opt-in and scene priority: manual timelines and slow devices always win.
 * Existing V966 scene verification, confidence, active track and section fades are inherited.
 */
export function planVolumetricStageV972(input:VolumetricInputV972):VolumetricCueV972{
 const {settings:s,scene,immersive:cue}=input;
 if(!s.enabled||!s.virtualFx||!s.immersiveV966||!s.volumetricV972||!cue.active||
   !scene?.verified||scene.timelineOverride||!input.playing||input.authoredStage||input.lowPerformance||
   !Number.isFinite(input.positionMs)||input.positionMs<0||
   !Number.isFinite(s.volumetricStrengthV972)||s.volumetricStrengthV972<=0||
   s.volumetricStrengthV972>100||!VALID_QUALITIES.includes(s.volumetricQualityV972))return OFF;
 const quality=s.volumetricQualityV972;
 const beamLayers=quality==='eco'?1:quality==='balanced'?2:3;
 const hazeLayers=quality==='eco'?1:quality==='balanced'?2:3;
 const gain=clamp(s.volumetricStrengthV972/100);
 // V966 fade, camera/lyric attenuation and palette are inherited from the masked cue.
 const beamOpacity=Math.min(.072,Math.max(0,cue.beamOpacity*.62*gain));
 const hazeOpacity=Math.min(.065,Math.max(0,cue.backHazeOpacity*.64*gain));
 const floorOpacity=Math.min(.075,Math.max(0,cue.floorGlowOpacity*.44*gain));
 if(Math.max(beamOpacity,hazeOpacity,floorOpacity)<=.0001)return OFF;
 // Deliberately slow, deterministic light drift, at most one subtle cycle every ~22 sec.
 const phase=input.reducedMotion?0:input.positionMs/6500;
 const fanWidth=input.reducedMotion?1:1+.045*Math.sin(phase);
 return {active:true,quality,beamLayers,hazeLayers,
   beamOpacity:input.lyricsVisible?beamOpacity*.75:beamOpacity,
   hazeOpacity:input.lyricsVisible?hazeOpacity*.72:hazeOpacity,
   floorOpacity:input.lyricsVisible?floorOpacity*.72:floorOpacity,
   colorA:cue.colorA,colorB:cue.colorB,phase,fanWidth};
}
