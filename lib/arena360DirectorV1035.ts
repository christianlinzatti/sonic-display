/** V1035 – local adaptive arena show orchestration.
 * Uses song position, EXISTING section detection and measured beat energy.
 * This is a deterministic director, not a generative model or a network AI call.
 * It intentionally never hallucinates a drop or automatically fires effects on time alone.
 */
import {normalizeArenaSectionV1034,type ArenaSectionV1034} from './arena360ShowV1034';
export type ArenaActV1035='opening'|'journey'|'climax'|'finale'|'untracked';
export type ArenaCueV1035={act:ArenaActV1035;section:ArenaSectionV1034;progress:number|null;
  ambience:number;crowdEnergy:number;columnEnergy:number;pyroArmed:boolean};
const safe01=(v:number|undefined|null)=>typeof v==='number'&&Number.isFinite(v)?Math.max(0,Math.min(1,v)):0;
export function planArenaTimelineV1035(opts:{
 enabled:boolean;playing:boolean;reducedMotion:boolean;reactive:boolean;
 progressMs?:number|null;durationMs?:number|null;section?:string|null;energy?:number|null;
 intensity?:number;
}):ArenaCueV1035{
 const section=normalizeArenaSectionV1034(opts.section);
 const tracked=typeof opts.durationMs==='number'&&Number.isFinite(opts.durationMs)&&opts.durationMs>0&&
  typeof opts.progressMs==='number'&&Number.isFinite(opts.progressMs)&&opts.progressMs>=0;
 const progress=tracked?Math.max(0,Math.min(1,opts.progressMs!/opts.durationMs!)):null;
 const act:ArenaActV1035=progress===null?'untracked':progress<.09?'opening':progress>=.87?'finale':
   progress>=.60?'climax':'journey';
 const intensity=safe01((opts.intensity??65)/100),energy=safe01(opts.energy);
 const active=opts.enabled&&opts.playing&&!opts.reducedMotion&&opts.reactive&&intensity>0;
 if(!active)return {act,section,progress,ambience:.22,crowdEnergy:0,columnEnergy:0,pyroArmed:false};
 const actGain=act==='opening'?.32:act==='journey'?.65:act==='climax'?.86:act==='finale'?.92:.56;
 const sectionGain=section==='hook'?.83:section==='drop'?1:section==='build'?.69:section==='break'?.18:.39;
 const movement=(.28+.72*energy)*actGain*sectionGain*intensity;
 const crowd=section==='hook'||section==='drop' ? Math.min(1,movement*1.55): movement*.28;
 // Pyro requires an observed, classified drop. A finale/strong bass alone cannot trigger it.
 return {act,section,progress,ambience:.2+Math.min(.65,movement*.9),
  crowdEnergy:Math.max(0,Math.min(1,crowd)),columnEnergy:Math.max(0,Math.min(1,movement)),
  pyroArmed:section==='drop'&&intensity>=.20&&(act!=='opening'||progress===null)};
}
export type ArenaColumnV1035={index:number;angle:number;x:number;z:number};
export function createArenaColumnsV1035(tier:'low'|'balanced'|'high'):ArenaColumnV1035[]{
 const count=tier==='low'?8:tier==='balanced'?12:16;
 return Array.from({length:count},(_,index)=>{
  const angle=Math.PI*2*(index+.5)/count;
  return {index,angle,x:3.48*Math.cos(angle),z:3.48*Math.sin(angle)};
 });
}
export function sampleArenaColumnV1035(f:ArenaColumnV1035,atSeconds:number,cue:ArenaCueV1035){
 const time=Number.isFinite(atSeconds)?Math.max(0,atSeconds):0;
 const swirl=cue.columnEnergy>0?.5+.5*Math.sin(f.angle*3-time*.7):.45;
 const height=.62+cue.columnEnergy*(.3+.42*swirl);
 return {height:Math.max(.6,Math.min(1.35,height)),
  twist:cue.columnEnergy*Math.sin(time*.5+f.angle)*.2,
  light:Math.max(.12,Math.min(.85,cue.ambience*(.5+.45*swirl)))};
}
/** Rising particles are purely virtual WebGL meshes. No physical pyro, flashes,
 * screen overlays, spotLight additions or uncapped particle allocations. */
export type ArenaPyroV1035={energy:number;cooldown:number;beatHeld:boolean;burst:number};
export const INITIAL_ARENA_PYRO_V1035:ArenaPyroV1035={energy:0,cooldown:0,beatHeld:false,burst:0};
export function stepArenaPyroV1035(prev:ArenaPyroV1035,delta:number,opts:{
 enabled:boolean;playing:boolean;reducedMotion:boolean;armed:boolean;beat:boolean;
 beatStrength?:number|null;energy?:number|null;
}):ArenaPyroV1035{
 if(!opts.enabled||!opts.playing||opts.reducedMotion||!opts.armed)return {...INITIAL_ARENA_PYRO_V1035,burst:prev.burst};
 const dt=Number.isFinite(delta)?Math.max(0,Math.min(.1,delta)):0;
 const cooldown=Math.max(0,prev.cooldown-dt);
 const isBeat=Boolean(opts.beat);
 const triggering=isBeat&&!prev.beatHeld&&cooldown<=0&&safe01(opts.beatStrength)>=.72&&safe01(opts.energy)>=.45;
 if(triggering)return {energy:.82,cooldown:5.5,beatHeld:true,burst:prev.burst+1};
 return {energy:Math.max(0,prev.energy-dt*.55),cooldown,beatHeld:isBeat,burst:prev.burst};
}
export function sampleArenaPyroSparkV1035(index:number,amount:number,state:ArenaPyroV1035){
 if(state.energy<=0)return {rise:0,height:0,brightness:0};
 const slot=index%amount;const step=Math.floor(index/amount);
 const energy=state.energy;
 const phase=(slot*.173+step*.29+state.burst*.113)%1;
 const rise=.25+(.82-energy)*2.3+phase*.25;
 const height=(.12+.32*(1-phase))*Math.min(1,energy*2.4);
 return {rise:Math.min(2.8,rise),height,brightness:Math.min(.8,energy*(.56+.38*(1-phase)))};
}
/** Crowd hook choreography kept subtle; separate from existing wave system. */
export function sampleArenaCrowdHookV1035(cue:ArenaCueV1035,angle:number,seconds:number){
 if(cue.crowdEnergy<=0)return 0;
 const time=Number.isFinite(seconds)?seconds:0;
 return Math.max(0,Math.min(.14,cue.crowdEnergy*(.038+.07*(.5+.5*Math.sin(time*3.1+angle*2)))));
}
