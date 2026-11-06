/** V1032 – deterministic, frame-rate-independent plans for the immersive 360° arena.
 * Pure helpers allow CI coverage without WebGL, audio hardware or a browser.
 */
export type ArenaAudienceTierV1032 = 'low' | 'balanced' | 'high';
export type ArenaCameraModeV1032 = 'arc' | 'orbit';
export type ArenaAudienceMemberV1032 = {
  x: number; y: number; z: number; height: number; hue: number; armRaised: boolean;
};

const TAU = Math.PI * 2;
const finiteUnit = (v: number | null | undefined) => Number.isFinite(v) ? Math.min(1,Math.max(0,v!)) : 0;

/** Spectators occupy the stationary concourse OUTSIDE the rotating stage.
 * Low-end devices use a reduced single-row crowd. No random() or per-frame allocation.
 */
export function createArenaAudienceV1032(tier: ArenaAudienceTierV1032, enabled=true): ArenaAudienceMemberV1032[] {
  if (!enabled) return [];
  const rows = tier === 'low' ? [36] : tier === 'balanced' ? [44,56] : [48,64,76];
  const members: ArenaAudienceMemberV1032[] = [];
  rows.forEach((count,row)=>{
    const radius = 4.45 + row * 1.03;
    for(let index=0;index<count;index++){
      const seed=(index*13+row*47)%101;
      const angle=(index + (row%2)*.42) * TAU/count;
      // Gentle variation, but never place a spectator on the rotating deck.
      const jitter=((seed%9)-4)*.027;
      const distance=radius+jitter;
      members.push({
        x:Math.cos(angle)*distance,
        y:-1.90+row*.22,
        z:Math.sin(angle)*distance,
        height:.79 + ((seed*3)%11)*.025,
        hue:(index*7+row*17)%5,
        armRaised:(index+row)%9===0,
      });
    }
  });
  return members;
}

export type ArenaDropStateV1032 = {energy:number; cooldown:number; previousOnset:boolean};
export const INITIAL_ARENA_DROP_V1032: ArenaDropStateV1032 = {energy:0,cooldown:0,previousOnset:false};

/** One beat onset -> one soft, bounded glow pulse. No full-screen flash or strobe.
 * 6s retrigger lockout, ~1.7s fade and consistent behavior at any frame rate.
 */
export function stepArenaDropV1032(
  previous:ArenaDropStateV1032,
  deltaSeconds:number,
  options:{playing:boolean;reducedMotion:boolean;enabled:boolean;reactive:boolean;beat:boolean;
    beatStrength?:number;bass?:number;energyEnvelope?:number;kickAccentIntensity?:number},
):ArenaDropStateV1032 {
  const delta=Number.isFinite(deltaSeconds)?Math.max(0,Math.min(.1,deltaSeconds)):0;
  const onset=options.beat===true;
  if(!options.playing||options.reducedMotion||!options.enabled||!options.reactive){
    return {energy:0,cooldown:0,previousOnset:onset};
  }
  const cooldown=Math.max(0,previous.cooldown-delta);
  const previousEnergy=finiteUnit(previous.energy);
  const energy=Math.max(0,previousEnergy-delta*.62);
  const strongOnset=onset&&!previous.previousOnset&&
    finiteUnit(options.beatStrength)>=.74 &&
    finiteUnit(options.bass)>=.53 &&
    (finiteUnit(options.energyEnvelope)>=.56 || finiteUnit(options.kickAccentIntensity)>=.74);
  return {energy:strongOnset&&cooldown===0?1:energy,
    cooldown:strongOnset&&cooldown===0?6:cooldown,previousOnset:onset};
}

/** One camera owner keeps authority: adds only a bounded 360° orbit or short arc
 * to an eligible automatic shot. Authored/lyric/duet/close-up/manual shots do not move.
 */
export function composeArenaCameraV1032<T extends {x:number;y:number;z:number;fov:number;targetX?:number;targetY:number;targetZ?:number}>(
  pose:T,
  options:{enabled:boolean;playing:boolean;reducedMotion:boolean;automatic:boolean;
    protectedShot:boolean;seconds:number;mode?:ArenaCameraModeV1032},
):T {
  if(!options.enabled||!options.playing||options.reducedMotion||!options.automatic||options.protectedShot||
    !Number.isFinite(options.seconds))return pose;
  const tx=pose.targetX??0, tz=pose.targetZ??0;
  const x=pose.x-tx, z=pose.z-tz;
  const radius=Math.hypot(x,z);
  // Avoid a dramatic spin on portrait/camera-closeup shots.
  if(!Number.isFinite(radius)||radius<4.0)return pose;
  const t=Math.max(0,options.seconds);
  const angle=(options.mode==='orbit')? t*TAU/100 : Math.sin(t*.075)*.45;
  const c=Math.cos(angle),s=Math.sin(angle);
  return {...pose,x:tx+x*c+z*s,z:tz+z*c-x*s};
}
