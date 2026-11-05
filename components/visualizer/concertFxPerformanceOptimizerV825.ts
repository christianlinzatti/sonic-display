/** V825: bounded, allocation-free frame-cadence governor for existing concert FX.
 * Frame delta is a render-cadence proxy, NOT GPU profiling. No timers or new GPU assets.
 * V810 safety/verification and V823 authored cue rules remain authoritative.
 */
import type {ConcertFxSettingsV810,ConcertFxCueV810} from './concertFxStudioV810';

export type FxPerfLaneV825='laser'|'led'|'particles'|'foam'|'transition'|'crowd'|'spectral'|'haze'|'kinetic'|'vocal';
export type FxPerfModeV825='balanced'|'fps'|'quality';
export type FxPerfTierV825='low'|'balanced'|'high';
export type FxPerfGainsV825=Record<FxPerfLaneV825,number>;
export interface FxPerfStateV825 {
  pressure:number;
  slowSeconds:number;
  recoverSeconds:number;
  samples:number;
}
export interface FxPerfPlanV825 {
  active:boolean;
  reason:'off'|'unverified'|'ok'|'throttled';
  pressure:number;
  capacity:number; // relative visual-cost model, not measured GPU utilization
  cost:number; // estimated normalized effect work (not GPU milliseconds)
  gains:FxPerfGainsV825;
  throttled:FxPerfLaneV825[];
}
const LANES:readonly FxPerfLaneV825[]=['laser','led','particles','foam','transition','crowd','spectral','haze','kinetic','vocal'];
const COST:FxPerfGainsV825={laser:1.5,led:1.1,particles:2.5,foam:2.3,transition:.6,crowd:1.8,spectral:2.0,haze:1.1,kinetic:.9,vocal:.8};
const FLOOR:FxPerfGainsV825={laser:.15,led:.65,particles:0,foam:0,transition:.55,crowd:0,spectral:0,haze:0,kinetic:.25,vocal:.78};
const PRIORITY:FxPerfGainsV825={laser:5,led:9,particles:2,foam:1,transition:7,crowd:2.5,spectral:3,haze:3.5,kinetic:5.5,vocal:10};
const neutral=():FxPerfGainsV825=>({laser:1,led:1,particles:1,foam:1,transition:1,crowd:1,spectral:1,haze:1,kinetic:1,vocal:1});
const finite=(n:unknown):n is number=>typeof n==='number'&&Number.isFinite(n);
const clamp=(n:number,min:number,max:number)=>Math.max(min,Math.min(max,n));
export const createFxPerfStateV825=():FxPerfStateV825=>({pressure:0,slowSeconds:0,recoverSeconds:0,samples:0});
/** In-place update. Ignore tab-wakeup spikes, zero frames and pauses. Builds pressure
 * only after a sustained slow interval, and recovers more slowly than it degrades.
 * No Date.now, dynamic allocations, or instrumentation outside the existing R3F loop.
 */
export function advanceFxPerfStateV825(s:FxPerfStateV825,frameSeconds:number,active:boolean,targetFps=60):FxPerfStateV825 {
  if(!active){s.slowSeconds=0;s.recoverSeconds=0;s.pressure=Math.max(0,s.pressure-.012);return s;}
  if(!finite(frameSeconds)||frameSeconds<=0||frameSeconds>.20)return s;
  const target=targetFps===30?1/30:1/60;
  s.samples=Math.min(1000000,s.samples+1);
  const slow=frameSeconds>target*1.35;
  if(slow){
    s.slowSeconds=clamp(s.slowSeconds+frameSeconds,0,4);
    s.recoverSeconds=0;
    if(s.slowSeconds>.28){
      const severity=clamp(frameSeconds/target-1.1,0,1.8);
      s.pressure=clamp(s.pressure+frameSeconds*(.54+.38*severity),0,1);
    }
  }else{
    s.slowSeconds=Math.max(0,s.slowSeconds-frameSeconds*2);
    s.recoverSeconds=clamp(s.recoverSeconds+frameSeconds,0,10);
    if(s.recoverSeconds>.85){s.pressure=Math.max(0,s.pressure-frameSeconds*.15);}
  }
  return s;
}
/** Prioritized cost shedding, never adds/activates an effect. Existing planner caps
 * are still applied after the returned multiplier. Manual timeline lanes are
 * allocated earlier than un-authored decorative layers, but critical pressure
 * may degrade them to keep playback responsive.
 */
export function planFxPerformanceV825(i:{
 settings?:Partial<ConcertFxSettingsV810>|null;
 fx:ConcertFxCueV810;tier:FxPerfTierV825;
 pressure:number;lyricsProtected:boolean;vocalFocus:boolean;groupCount:number;
 authoredLanes?:readonly FxPerfLaneV825[];
}):FxPerfPlanV825{
 const gains=neutral();
 const off=(reason:FxPerfPlanV825['reason']):FxPerfPlanV825=>({active:false,reason,pressure:0,capacity:0,cost:0,gains,throttled:[]});
 if(i.settings?.enabled===false||i.settings?.perfOptimizerV825===false)return off('off');
 // Low-tier FX remain untouched unless the user explicitly enables BOTH V980 and Pi protection.
 if(!i.fx.active||i.fx.reason!=='music'||
   (i.tier==='low'&&!(i.settings?.concertQualityDirectorV980===true&&i.settings?.concertQualityPiV980===true))||
   !Number.isInteger(i.groupCount)||i.groupCount<1||i.groupCount>4)return off('unverified');
 const mode:FxPerfModeV825=i.settings?.perfModeV825==='fps'||i.settings?.perfModeV825==='quality'?i.settings.perfModeV825:'balanced';
 const sensitivity=finite(i.settings?.perfSensitivityV825)?clamp(i.settings!.perfSensitivityV825!,0,100)/100:.65;
 const observed=finite(i.pressure)?clamp(i.pressure,0,1):0;
 // Only the FX layers are modeled. Device budget and genre-quality gates remain upstream.
 const tierPenalty=i.tier==='balanced'?.12:0;
 const qualityPenalty=i.settings?.quality==='ultra'?.04:0;
 const pressure=clamp((observed+tierPenalty+qualityPenalty)*(0.65+sensitivity*.7),0,1);
 const degrade=mode==='fps'?1.24:mode==='quality'?.70:1;
 const authored=new Set(i.authoredLanes??[]);
 const s=i.settings;
 const enabled:Record<FxPerfLaneV825,boolean>={
  laser:s?.lasers!==false||s?.ribbons!==false,led:s?.ledWall!==false,
  particles:s?.reactiveParticles!==false,foam:s?.foamCannon!==false,
  transition:s?.sceneTransitions!==false,crowd:s?.virtualCrowd!==false,
  spectral:s?.spectralVisuals!==false,haze:s?.atmosphericFx!==false,
  kinetic:s?.kineticStage!==false,vocal:s?.vocalFx!==false,
 };
 const total=LANES.reduce((sum,lane)=>sum+(enabled[lane]?COST[lane]:0),0);
 const capacity=total*(1-.68*pressure*degrade);
 let excess=Math.max(0,total-capacity);
 // Sacrifice the least important lanes first. Lyrics/vocal focus makes decorative
 // layers even less desirable, not more; authored cues are prioritized to survive.
 const ordered=[...LANES].sort((a,b)=>{
  const value=(lane:FxPerfLaneV825)=>PRIORITY[lane]+(authored.has(lane)?5:0)
   -(i.lyricsProtected&&(lane==='particles'||lane==='foam'||lane==='laser')?2:0)
   -(i.vocalFocus&&(lane==='particles'||lane==='foam'||lane==='crowd')?2:0);
  return value(a)-value(b)||LANES.indexOf(a)-LANES.indexOf(b);
 });
 for(const lane of ordered){
  if(excess<=1e-8)break;
  if(!enabled[lane])continue;
  const available=COST[lane]*(1-FLOOR[lane]);
  const reduction=Math.min(excess,available);
  gains[lane]=Math.round((1-reduction/COST[lane])*1e5)/1e5;
  excess-=reduction;
 }
 const throttled=LANES.filter(lane=>gains[lane]<.99999);
 const cost=LANES.reduce((sum,lane)=>sum+(enabled[lane]?COST[lane]*gains[lane]:0),0);
 return {active:true,reason:throttled.length?'throttled':'ok',pressure,capacity,cost,gains,throttled};
}
