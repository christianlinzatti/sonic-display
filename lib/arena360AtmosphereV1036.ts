/** V1036 · deterministic, performance-bounded 360° atmosphere and show highlights.
 * Real audio energy / classified sections are required for highlight triggers.
 * No external AI, no autonomous pyro, no flashes, no camera ownership.
 */
import {planArenaTimelineV1035} from './arena360DirectorV1035';
export type ArenaTierV1036='low'|'balanced'|'high';
export type ArenaAtmosphereCueV1036={laser:number;sky:number;fog:number;movement:number;act:string;section:string};
const clamp01=(n:number|undefined|null)=>typeof n==='number'&&Number.isFinite(n)?Math.min(1,Math.max(0,n)):0;
export function planArenaAtmosphereV1036(o:{enabled:boolean;playing:boolean;reducedMotion:boolean;
 reactive:boolean;section?:string;progressMs?:number;durationMs?:number;energy?:number;intensity?:number;
 peak?:number}):ArenaAtmosphereCueV1036{
 const base=planArenaTimelineV1035({enabled:o.enabled,playing:o.playing,reducedMotion:o.reducedMotion,
  reactive:o.reactive,section:o.section,progressMs:o.progressMs,durationMs:o.durationMs,
  energy:o.energy,intensity:o.intensity});
 const active=o.enabled&&o.playing&&!o.reducedMotion&&o.reactive&&clamp01((o.intensity??65)/100)>0;
 if(!active)return {laser:0,sky:.12,fog:0,movement:0,act:base.act,section:base.section};
 const e=clamp01(o.energy),peak=clamp01(o.peak);
 const sectionBoost=base.section==='drop'?.22:base.section==='hook'?.14:base.section==='build'?.10:0;
 const weight=clamp01((o.intensity??65)/100);
 return {laser:clamp01((.12+base.columnEnergy*.72+sectionBoost+peak*.25)*weight),
  sky:clamp01(.22+base.ambience*.60+peak*.25),
  fog:clamp01((.13+.30*e+.16*base.columnEnergy)*weight),
  movement:clamp01(.16+base.columnEnergy*.6+peak*.2),act:base.act,section:base.section};
}

/** 12–22 s between accent events; beat-edge required so held beats cannot repeat. */
export type ArenaPeakStateV1036={energy:number;cooldown:number;beatHeld:boolean;count:number};
export const INITIAL_ARENA_PEAK_V1036:ArenaPeakStateV1036={energy:0,cooldown:0,beatHeld:false,count:0};
export function stepArenaPeakV1036(previous:ArenaPeakStateV1036,dt:number,o:{enabled:boolean;
 playing:boolean;reducedMotion:boolean;reactive:boolean;section?:string;beat?:boolean;
 beatStrength?:number;energy?:number;progressMs?:number;durationMs?:number}):ArenaPeakStateV1036{
 const safeDt=Number.isFinite(dt)?Math.min(.1,Math.max(0,dt)):0;
 if(!o.enabled||!o.playing||o.reducedMotion||!o.reactive)
  return {...INITIAL_ARENA_PEAK_V1036,count:previous.count};
 const section=planArenaTimelineV1035({enabled:true,playing:true,reducedMotion:false,reactive:true,
  section:o.section,progressMs:o.progressMs,durationMs:o.durationMs,energy:o.energy}).section;
 const isBeat=Boolean(o.beat),strong=clamp01(o.beatStrength),energy=clamp01(o.energy);
 const allowed=section==='drop'||section==='hook';
 const qualify=(section==='drop'&&strong>=.78&&energy>=.60)||
  (section==='hook'&&strong>=.92&&energy>=.78);
 const cooldown=Math.max(0,previous.cooldown-safeDt);
 if(allowed&&qualify&&isBeat&&!previous.beatHeld&&cooldown===0)
  return {energy:1,cooldown:18,beatHeld:true,count:previous.count+1};
 return {energy:Math.max(0,previous.energy-safeDt*.58),cooldown,beatHeld:isBeat,count:previous.count};
}
export type ArenaLaserV1036={angle:number;originX:number;originZ:number;originY:number;offset:number};
export function createArenaLasersV1036(tier:ArenaTierV1036):ArenaLaserV1036[]{
 const count=tier==='low'?6:tier==='balanced'?12:18;
 return Array.from({length:count},(_,i)=>{
  const angle=2*Math.PI*(i+.5)/count;
  return {angle,originX:4.20*Math.cos(angle),originZ:4.20*Math.sin(angle),originY:2.58,
   offset:i%3-1};
 });
}
export function sampleArenaLaserV1036(f:ArenaLaserV1036,seconds:number,cue:ArenaAtmosphereCueV1036){
 const t=Number.isFinite(seconds)?Math.max(0,seconds):0;
 const orbit=f.angle*2+Math.sin(t*(.16+cue.movement*.18)+f.angle*3)*(.48+cue.movement*.35);
 // Targets remain above stage deck / away from spectator heads.
 const targetX=Math.cos(orbit)*(1.0+cue.movement*.65),targetZ=Math.sin(orbit)*(1.0+cue.movement*.65);
 const targetY=.70+1.18*(.5+.5*Math.sin(t*.18+f.angle*2));
 return {targetX,targetY,targetZ,brightness:Math.min(.64,Math.max(.04,cue.laser*(.42+.22*Math.sin(t*.25+f.angle))))};
}
export type ArenaSkyPixelV1036={angle:number;radius:number;y:number;ring:number;phase:number};
export function createArenaSkyPixelsV1036(tier:ArenaTierV1036):ArenaSkyPixelV1036[]{
 const perRing=tier==='low'?12:tier==='balanced'?20:30;
 const rings=tier==='low'?2:tier==='balanced'?3:4;
 return Array.from({length:perRing*rings},(_,index)=>{
  const ring=Math.floor(index/perRing),slot=index%perRing;
  const angle=Math.PI*2*(slot+.5*(ring%2))/perRing;
  return {angle,ring,radius:4.25+ring*.73,y:3.18+ring*.22,phase:ring*.72+slot*.13};
 });
}
export function sampleArenaSkyPixelV1036(p:ArenaSkyPixelV1036,t:number,cue:ArenaAtmosphereCueV1036){
 const seconds=Number.isFinite(t)?Math.max(0,t):0;
 const traveling=Math.sin(seconds*(.45+cue.movement*.8)-p.angle*2.3-p.phase);
 return {lift:cue.movement*.11*traveling,
  brightness:Math.min(.82,Math.max(.10,cue.sky*(.53+.30*(.5+.5*traveling))))};
}
export type ArenaFogBankV1036={angle:number;radius:number;phase:number;size:number};
export function createArenaFogBanksV1036(tier:ArenaTierV1036):ArenaFogBankV1036[]{
 const count=tier==='low'?5:tier==='balanced'?9:14;
 return Array.from({length:count},(_,i)=>({angle:i*Math.PI*2/count,
  radius:2.7+(i%3)*.36,phase:i*.917,size:.86+(i%3)*.24}));
}
export function sampleArenaFogV1036(b:ArenaFogBankV1036,t:number,cue:ArenaAtmosphereCueV1036){
 const seconds=Number.isFinite(t)?Math.max(0,t):0;
 const a=b.angle+Math.sin(seconds*.12+b.phase)*(.10+cue.movement*.055);
 return {x:Math.cos(a)*b.radius,z:Math.sin(a)*b.radius,
  size:b.size*(1+cue.fog*.18),height:-1.77+.035*Math.sin(seconds*.3+b.phase),
  alpha:Math.min(.18,Math.max(0,cue.fog*.17))};
}
