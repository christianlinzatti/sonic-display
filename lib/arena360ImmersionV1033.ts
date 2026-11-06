/** V1033 Immersive Arena – deterministic show envelopes and pixel placement.
 * No React, WebGL, browser clocks or RNG: usable in node CI and on low-power GPUs.
 */
export type ArenaPhoneModeV1033 = 'pulse' | 'wave' | 'chase';
export type ArenaWaveStateV1033 = {age:number;cooldown:number;previousBeat:boolean};
export const INITIAL_ARENA_WAVE_V1033:ArenaWaveStateV1033 = {age:-1,cooldown:0,previousBeat:false};
export type ArenaFlyoverStateV1033 = {age:number;cooldown:number;previousBeat:boolean;previousDrop:boolean};
export const INITIAL_ARENA_FLYOVER_V1033:ArenaFlyoverStateV1033 = {age:-1,cooldown:0,previousBeat:false,previousDrop:false};
const TAU=Math.PI*2;
const unit=(value:number|undefined)=>Number.isFinite(value)?Math.max(0,Math.min(1,value!)):0;
const timestep=(value:number)=>Number.isFinite(value)?Math.max(0,Math.min(.1,value)):0;
const angleDistance=(a:number,b:number)=>Math.atan2(Math.sin(a-b),Math.cos(a-b));
export const ARENA_WAVE_DURATION_V1033=3.6;
export const ARENA_FLYOVER_DURATION_V1033=3.4;

/** Beat rising edge starts at most one travelling crowd wave every 5 seconds. */
export function stepArenaWaveV1033(previous:ArenaWaveStateV1033, deltaSeconds:number, options:{
  enabled:boolean;playing:boolean;reducedMotion:boolean;reactive:boolean;
  beat?:boolean;beatStrength?:number;bass?:number;
}):ArenaWaveStateV1033 {
  const beat=options.beat===true;
  if(!options.enabled||!options.playing||options.reducedMotion||!options.reactive)
    return {...INITIAL_ARENA_WAVE_V1033,previousBeat:beat};
  const dt=timestep(deltaSeconds);
  const cooldown=Math.max(0,previous.cooldown-dt);
  const active=previous.age>=0&&previous.age<ARENA_WAVE_DURATION_V1033;
  const age=active?Math.min(ARENA_WAVE_DURATION_V1033,previous.age+dt):-1;
  const trigger=beat&&!previous.previousBeat&&unit(options.beatStrength)>=.58&&unit(options.bass)>=.38&&cooldown===0;
  return {age:trigger?0:age,cooldown:trigger?5:cooldown,previousBeat:beat};
}

/** Y jump and shoulder sway for one audience member in a ring, bounded and finite. */
export function sampleArenaCrowdWaveV1033(x:number,z:number,age:number):number {
  if(!Number.isFinite(x)||!Number.isFinite(z)||!Number.isFinite(age)||age<0||age>=ARENA_WAVE_DURATION_V1033)return 0;
  const angle=(Math.atan2(z,x)+TAU)%TAU;
  const front=(age/ARENA_WAVE_DURATION_V1033)*TAU;
  const delta=angleDistance(angle,front);
  const strength=Math.exp(-.5*(delta/.38)**2)*Math.min(1,age/.24);
  return Math.max(0,Math.min(1,strength));
}

/** Each phone remains a cheap instanced plane; color tint conveys brightness. */
export function sampleArenaPhoneV1033(angle:number,timeSeconds:number,mode:ArenaPhoneModeV1033,
  beatStrength:number,waveStrength:number):number {
  if(!Number.isFinite(angle)||!Number.isFinite(timeSeconds))return .3;
  const beat=unit(beatStrength),wave=unit(waveStrength);
  if(mode==='wave')return .20+.64*wave+.12*beat;
  if(mode==='chase')return .19+.61*Math.pow(.5+.5*Math.cos(angle*3-timeSeconds*1.7),4)+.12*beat;
  return .28+.42*beat+.16*(.5+.5*Math.sin(timeSeconds*1.6));
}

export type ArenaDomePixelV1033={x:number;y:number;z:number;angle:number;ring:number};
/** A vaulted overhead display, not a rear-facing flat wall. Batch per performance tier. */
export function createArenaDomePixelsV1033(tier:'low'|'balanced'|'high'):ArenaDomePixelV1033[]{
  const counts=tier==='low'?[32,24]:tier==='balanced'?[44,36,28]:[52,48,40,32];
  const radii=[3.56,2.84,2.08,1.22],heights=[3.25,3.67,4.01,4.25];
  return counts.flatMap((count,ring)=>Array.from({length:count},(_,index)=>{
    const angle=TAU*(index+(ring%2)*.5)/count;
    return {x:radii[ring]*Math.cos(angle),y:heights[ring],z:radii[ring]*Math.sin(angle),angle,ring};
  }));
}

/** LED dome is lively without flashes; luminance always remains in [0.15,0.95]. */
export function sampleArenaDomePixelV1033(pixel:ArenaDomePixelV1033,time:number,bass:number,beat:number):number{
  if(!Number.isFinite(time))return .3;
  const swirl=.5+.5*Math.sin(pixel.angle*5-time*(.85+pixel.ring*.11)+pixel.ring*.9);
  const value=.19+.38*swirl+.2*unit(bass)+.14*unit(beat);
  return Math.max(.15,Math.min(.95,value));
}

/** 13s cooldown; one cinematic flyover per strong new drop/marked drop section. */
export function stepArenaFlyoverV1033(previous:ArenaFlyoverStateV1033,deltaSeconds:number,options:{
  enabled:boolean;playing:boolean;reducedMotion:boolean;protectedShot:boolean;
  beat?:boolean;beatStrength?:number;bass?:number;dropSection?:boolean;
}):ArenaFlyoverStateV1033 {
  const beat=options.beat===true,drop=options.dropSection===true;
  if(!options.enabled||!options.playing||options.reducedMotion||options.protectedShot)
    return {...INITIAL_ARENA_FLYOVER_V1033,previousBeat:beat,previousDrop:drop};
  const dt=timestep(deltaSeconds),cooldown=Math.max(0,previous.cooldown-dt);
  const age=previous.age>=0&&previous.age<ARENA_FLYOVER_DURATION_V1033
    ?Math.min(ARENA_FLYOVER_DURATION_V1033,previous.age+dt):-1;
  const onset=(drop&&!previous.previousDrop)||(beat&&!previous.previousBeat&&unit(options.beatStrength)>.80&&unit(options.bass)>.65);
  const trigger=onset&&cooldown===0;
  return {age:trigger?0:age,cooldown:trigger?13:cooldown,previousBeat:beat,previousDrop:drop};
}

/** Fly over the crowd, approach the central stage, return to original framing.
 * Only composed into the ALREADY active camera director, never spawns a camera.
 */
export function composeArenaFlyoverV1033<T extends {x:number;y:number;z:number;fov:number;targetX?:number;targetY:number;targetZ?:number}>(
  pose:T,state:ArenaFlyoverStateV1033,allowed:boolean):T {
  if(!allowed||state.age<0||state.age>=ARENA_FLYOVER_DURATION_V1033)return pose;
  const tx=pose.targetX??0,tz=pose.targetZ??0;
  const x=pose.x-tx,z=pose.z-tz,radius=Math.hypot(x,z);
  if(!Number.isFinite(radius)||radius<4.0)return pose;
  const progress=state.age/ARENA_FLYOVER_DURATION_V1033;
  // Smooth both boundaries so an authored camera can regain control without a jump.
  const blend=Math.sin(Math.PI*progress)**2;
  const approach=Math.min(2.2,radius*.19)*blend;
  const elevatedY=Math.min(2.1,1.8+radius*.03)*blend;
  return {...pose,x:pose.x-x/radius*approach,y:pose.y+elevatedY,
    z:pose.z-z/radius*approach,
    targetY:pose.targetY+.19*blend,
    fov:Math.max(34,Math.min(78,pose.fov+4*blend))};
}
