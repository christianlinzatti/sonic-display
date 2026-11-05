/** V966 – Immersive Concert Engine 3.0.
 * Virtual-only atmosphere derived from a VERIFIED section of the existing V318
 * analysis and V958 concert scene. Never controls hardware, camera, audio, show
 * timelines, crowd instances, pyro or light power. Authored scenes always win.
 */
import type {ConcertSceneV958,ConcertSettingsV958,ConcertPhaseV958} from './ultimateConcertRoadmapV958';

export type ImmersiveMoodV966='intimate'|'anthem'|'anticipation'|'impact'|'breathing'|'finale';
export type ImmersiveCueV966=Readonly<{
 active:boolean; mood:ImmersiveMoodV966; colorA:string;colorB:string;
 beamOpacity:number; sideGlowOpacity:number;floorGlowOpacity:number;
 backHazeOpacity:number; audienceEdgeOpacity:number;
 motionPhase:number; archScale:number;
}>;
export type ImmersiveInputV966=Readonly<{
 scene:ConcertSceneV958|null|undefined;settings:ConcertSettingsV958;
 sectionLabel:string;sectionConfidence:number;sectionStartMs:number;sectionDurationMs:number;
 trackId:string;analysisTrackId:string;positionMs:number;durationMs:number;
 energy:number;bass:number;playing:boolean;reducedMotion:boolean;
 authoredStage:boolean;lyricsVisible:boolean;lowPerformance:boolean;
}>;
const OFF:ImmersiveCueV966=Object.freeze({active:false,mood:'breathing',colorA:'#000000',colorB:'#000000',
 beamOpacity:0,sideGlowOpacity:0,floorGlowOpacity:0,backHazeOpacity:0,audienceEdgeOpacity:0,
 motionPhase:0,archScale:1});
const PHASES:Readonly<Record<ConcertPhaseV958,ImmersiveMoodV966>>={
 verse:'intimate',hook:'anthem',build:'anticipation',drop:'impact',break:'breathing',outro:'finale'};
const WEIGHTS:Readonly<Record<ImmersiveMoodV966,readonly [number,number,number,number,number]>>={
 intimate:[.30,.25,.28,.30,.15],anthem:[.78,.74,.63,.70,.75],
 anticipation:[.67,.62,.58,.78,.50],impact:[.90,.88,.82,.80,.85],
 breathing:[.16,.16,.21,.23,.12],finale:[.84,.82,.77,.73,.90]};
const clamp01=(n:number)=>Math.max(0,Math.min(1,n));
const smooth=(x:number)=>{const a=clamp01(x);return a*a*(3-2*a)};
const safeNumber=(...values:number[])=>values.every(Number.isFinite);
const palette=/^#[0-9a-fA-F]{6}$/;
/** No randomness or wall clock: identical verified cues are pixel-stable.
 * A 600ms section crossfade avoids abrupt stage flashes on drop/seek.
 */
export function planImmersiveConcertV966(i:ImmersiveInputV966):ImmersiveCueV966{
 const s=i.settings,scene=i.scene;
 if(!s.enabled||!s.virtualFx||!s.immersiveV966||!i.playing||!scene?.verified||
   i.authoredStage||scene.timelineOverride||!i.trackId||i.trackId!==i.analysisTrackId||i.lowPerformance||
   !safeNumber(i.positionMs,i.durationMs,i.sectionStartMs,i.sectionDurationMs,
    i.sectionConfidence,i.energy,i.bass,s.immersiveStrengthV966)||
   i.durationMs<=0||i.positionMs<0||i.positionMs>i.durationMs+1000||
   i.sectionConfidence<.75||i.sectionConfidence>1||
   i.sectionStartMs<0||i.sectionDurationMs<1400||
   i.sectionStartMs+i.sectionDurationMs>i.durationMs+1000||
   i.positionMs<i.sectionStartMs||i.positionMs>=i.sectionStartMs+i.sectionDurationMs||
   !Object.hasOwn(PHASES,scene.phase)||scene.phase!==i.sectionLabel||
   !palette.test(scene.palette[0])||!palette.test(scene.palette[1])||
   s.immersiveStrengthV966<=0||s.immersiveStrengthV966>100)return OFF;
 const mood=PHASES[scene.phase];
 const [beams,sides,floor,haze,crowd]=WEIGHTS[mood];
 const localMs=i.positionMs-i.sectionStartMs;
 const remaining=i.sectionDurationMs-localMs;
 const fade=smooth(Math.min(localMs,remaining)/600);
 const intensity=clamp01(s.immersiveStrengthV966/100)*fade;
 if(intensity<=.0001)return OFF;
 // No sudden photo-sensitive flash: mostly static translucent geometry.
 const energy=clamp01(.65*clamp01(i.energy)+.35*clamp01(i.bass));
 const response=.75+.25*energy;
 const focus=(i.lyricsVisible||scene.camera==='close') ? .60 : 1;
 const motionPhase=i.reducedMotion?0:
   (Math.floor(localMs/2000)%12)*Math.PI/6;
 const scale=i.reducedMotion?1:1+.012*Math.sin(motionPhase);
 const gain=(base:number,max:number)=>Math.min(max,max*base*intensity*response*focus);
 return {active:intensity>.0001,mood,colorA:scene.palette[0],colorB:scene.palette[1],
   beamOpacity:gain(beams,.085),sideGlowOpacity:gain(sides,.20),
   floorGlowOpacity:gain(floor,.14),backHazeOpacity:gain(haze,.09),
   audienceEdgeOpacity:gain(crowd,.16),motionPhase,archScale:scale};
}
