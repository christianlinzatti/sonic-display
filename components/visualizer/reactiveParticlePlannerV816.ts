/** V816 – verified music-to-particle director, independent of the 3D renderer.
 * All counts, gains and animation phases are finite, clamped, deterministic.
 * A verified V810 cue is required. No fake audio peaks or time-based triggers.
 */
import type {ConcertFxCueV810,ConcertFxSettingsV810} from './concertFxStudioV810';

export const PARTICLE_CAPS_V816=Object.freeze({sparks:96,shards:72,confetti:72,rings:8});
export interface ReactiveParticleCueV816 {
 active:boolean; sparks:number;shards:number;confetti:number;rings:number;
 sparkOpacity:number;shardOpacity:number;confettiOpacity:number;ringOpacity:number;
 phase:number;beat:number;primary:string;secondary:string;
}
export const PARTICLES_OFF_V816:Readonly<ReactiveParticleCueV816>={
 active:false,sparks:0,shards:0,confetti:0,rings:0,sparkOpacity:0,
 shardOpacity:0,confettiOpacity:0,ringOpacity:0,phase:0,beat:0,
 primary:'#ffffff',secondary:'#ffffff',
};
const clamp=(value:number)=>Math.min(1,Math.max(0,value));
const bounded=(v:number,max:number)=>Math.min(max,Math.max(0,Math.floor(v)));
export function planReactiveParticlesV816(input:{
 fx:ConcertFxCueV810;settings:ConcertFxSettingsV810;
 tier:'low'|'balanced'|'high';lyricsProtected:boolean;vocalFocus:boolean;groupCount:number;
 energy:number;kick:number;bass:number;highs:number;particleBudget:number;
}):ReactiveParticleCueV816 {
 const {fx,settings:s}=input;
 if(!fx.active||fx.reason!=='music'||!s.enabled||!s.reactiveParticles||
  input.tier==='low'||!Number.isInteger(input.groupCount)||input.groupCount<1||input.groupCount>4||
  !Number.isFinite(fx.phase)||fx.phase<0||
  ![s.intensity,s.particleIntensity,input.energy,input.kick,input.bass,input.highs,input.particleBudget].every(Number.isFinite)||
  s.intensity<=0||s.particleIntensity<=0||input.particleBudget<=0)return PARTICLES_OFF_V816;
 const section=fx.section==='drop'?1:fx.section==='finale'?.95:fx.section==='hook'?.65:
  fx.section==='build'?.50:fx.section==='intro'?.10:fx.section==='verse'?.15:0;
 const musical=clamp(input.energy*.30+input.kick*.46+input.bass*.16+input.highs*.08);
 // No bright FX during musical breaks or without an actual measured accent.
 if(section<=0||musical<.09)return PARTICLES_OFF_V816;
 const genre=fx.genre==='hardtekk'||fx.genre==='hardstyle'?1:
  fx.genre==='rock'?.88:fx.genre==='rap'?.65:.58;
 const quality=s.quality==='performance'?.28:s.quality==='balanced'?.60:1;
 const budget=clamp(input.particleBudget)*(input.tier==='balanced'?.72:1);
 const density=s.particleDensity==='subtle'?.42:s.particleDensity==='epic'?1:.70;
 const protection=(s.protectLyrics&&input.lyricsProtected?.54:1)*
  (input.vocalFocus?.58:1)*(input.groupCount>=3?.72:1);
 const power=clamp(s.intensity/100)*clamp(s.particleIntensity/100)*quality*budget*density*
  protection*genre*section*musical;
 const enabled=(flag:boolean,cap:number,weight:number)=>flag?bounded(cap*weight*quality*budget*density,cap):0;
 const kick=clamp(input.kick);
 const sparks=enabled(s.particleSparks,PARTICLE_CAPS_V816.sparks,fx.genre==='rap'?.55:1);
 const shards=enabled(s.particleShards,PARTICLE_CAPS_V816.shards,fx.genre==='rap'?.70:1);
 const confetti=enabled(s.particleConfetti&& (fx.section==='finale'||fx.section==='hook'),
  PARTICLE_CAPS_V816.confetti,fx.genre==='rock'||fx.genre==='pop'?1:.45);
 const rings=enabled(s.particleEnergyRings,PARTICLE_CAPS_V816.rings,1);
 const sparkOpacity=sparks?.62*power*(.36+.62*kick):0;
 const shardOpacity=shards?.50*power*(.28+.65*clamp(input.highs)):0;
 const confettiOpacity=confetti?.52*power*(.28+.58*kick):0;
 const ringOpacity=rings?.37*power*(.25+.70*clamp(input.bass)):0;
 return {active:sparkOpacity>.002||shardOpacity>.002||confettiOpacity>.002||ringOpacity>.002,
  sparks:sparkOpacity>.002?sparks:0,shards:shardOpacity>.002?shards:0,
  confetti:confettiOpacity>.002?confetti:0,rings:ringOpacity>.002?rings:0,
  sparkOpacity,shardOpacity,confettiOpacity,ringOpacity,phase:fx.phase,
  beat:kick,primary:fx.primary,secondary:fx.secondary};
}

/** Static, evenly distributed seed positions; NEVER placed in the central portrait lane. */
export function createParticleLayoutV816(count:number){
 const result:{x:number;y:number;z:number;offset:number;size:number;tilt:number}[]=[];
 for(let n=0;n<count;n++){
  const a=((n*73+13)%101)/101,b=((n*37+41)%97)/97,c=((n*59+11)%103)/103;
  const side=n%2===0?-1:1;
  result.push({x:side*(3.15+a*2.05),y:b,z:-2.05+c*.75,
   offset:((n*43)%89)/89,size:.6+((n*17)%23)/23*.8,tilt:(c-.5)*1.9});
 }
 return result;
}
