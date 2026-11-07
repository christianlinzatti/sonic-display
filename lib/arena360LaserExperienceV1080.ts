/** V1080 · Laser Show Experience 5.0.
 * Optical-only, pure stage-geometry variation for the EXISTING V1036/V1039
 * instanced lasers. No extra lights, beams, hardware outputs or audio polling.
 * Templates describe musical chapters; only measured beat inputs cause accents.
 */
import type {IntelligentLaserCueV1057} from './arena360IntelligentLaserV1057';
export type LaserFormationV1080='fan'|'tunnel'|'helix'|'crown';
export type LaserPointV1080={x:number;y:number;z:number};
export type LaserExperienceCueV1080={
 active:boolean;reason:'disabled'|'paused'|'motion'|'quality'|'clock'|'director'|'planned';
 formation:LaserFormationV1080;chapter:number;amount:number;twist:number;
 pulse:number;lift:number;radius:number;gain:number;
};
const TAU=Math.PI*2;
const clamp=(n:unknown,lo:number,hi:number,fallback:number)=>
 typeof n==='number'&&Number.isFinite(n)?Math.max(lo,Math.min(hi,n)):fallback;
const off=(reason:LaserExperienceCueV1080['reason']='disabled'):LaserExperienceCueV1080=>({
 active:false,reason,formation:'fan',chapter:-1,amount:0,twist:0,pulse:0,lift:0,radius:1.3,gain:1,
});
/** Existing V1057 opt-in and manual override have priority. On a low tier, omit
 * the new formation entirely. Strength and brightness are never amplified. */
export function planLaserExperienceV1080(input:{
 enabled:boolean;playing:boolean;reducedMotion:boolean;reactive:boolean;
 manualPattern:boolean;performanceTier?:'low'|'balanced'|'high'|null;
 progressMs?:number|null;durationMs?:number|null;
 director?:IntelligentLaserCueV1057|null;energy?:number|null;
 beat?:boolean;beatStrength?:number|null;strength?:number|null;
}):LaserExperienceCueV1080{
 if(!input.enabled||!input.reactive||input.manualPattern)return off();
 if(!input.playing)return off('paused');
 if(input.reducedMotion)return off('motion');
 if(input.performanceTier==='low')return off('quality');
 const {progressMs,durationMs,director}=input;
 if(!Number.isFinite(progressMs)||!Number.isFinite(durationMs)||
  (durationMs??0)<30000||(progressMs??-1)<0||(progressMs??0)>(durationMs??0))return off('clock');
 if(!director?.active||director.reason!=='planned'||director.chapter<0||director.chapter>6)return off('director');
 const amount=clamp(input.strength??55,0,80,0)/100*(input.performanceTier==='balanced'?.6:1);
 if(amount<=0)return off();
 const energy=clamp(input.energy,0,1,0);
 const beatStrength=clamp(input.beatStrength,0,1,0);
 // Beat accents require an actual observed beat, not a predicted chapter boundary.
 const accent=input.beat&&beatStrength>=.7?beatStrength*energy:0;
 const formation:LaserFormationV1080=director.pattern==='tunnel'?
  (director.chapter===6?'crown':'tunnel'):
  director.pattern==='spiral'?'helix':director.chapter===4?'crown':'fan';
 const weight=amount*clamp(director.beamGain,0,1,1);
 return {active:true,reason:'planned',formation,chapter:director.chapter,
  amount:weight,twist:clamp(weight*(formation==='helix'?.50:formation==='tunnel'?.17:.08),0,.40,0),
  pulse:clamp(accent*weight*.28,0,.22,0),lift:clamp(weight*(formation==='crown'?.34:.24),0,.27,0),
  radius:clamp(1.15+energy*.18+weight*(formation==='tunnel'?.38:.22),1.1,1.85,1.3),
  gain:clamp(1-weight*(formation==='crown'?.32:.14),.65,1,1)};
}
/** Modify a reused point in place, avoiding GC allocations in the render loop.
 * Every endpoint stays above the deck and inside the stage, never in the crowd. */
export function sampleLaserEndpointV1080(cue:LaserExperienceCueV1080,
 index:number,count:number,seconds:number,source:'fan'|'architecture',out:LaserPointV1080):void{
 if(!cue.active||!Number.isFinite(seconds)||count<=0||!Number.isInteger(index)||index<0||index>=count)return;
 const t=Math.max(0,Math.min(36000,seconds));
 const a=TAU*(index+.5)/count;
 const wave=Math.sin(t*.24+index*1.49);
 const band=index%3;
 const rate=cue.formation==='helix'?.52:cue.formation==='tunnel'?.16:.10;
 const angle=a+Math.sin(t*rate+index*.7)*cue.twist+(cue.formation==='helix'?t*.10*cue.twist:0);
 const radial=cue.formation==='crown'?1.65+band*.22:
  cue.formation==='tunnel'?cue.radius+band*.20:
  cue.formation==='helix'?cue.radius+band*.16:1.1+band*.24;
 const targetY=cue.formation==='crown'?1.52+band*.20+.12*wave:
  cue.formation==='tunnel'?.98+band*.35+.09*wave:
  cue.formation==='helix'?1.3+.46*Math.sin(a+t*.24):.82+band*.34+.17*wave;
 const mix=cue.amount*(source==='architecture'?.86:.72);
 const x=Math.cos(angle)*(radial+cue.pulse),z=Math.sin(angle)*(radial+cue.pulse);
 out.x=clamp(out.x*(1-mix)+x*mix,-3.9,3.9,0);
 out.y=clamp(out.y*(1-mix)+(targetY+cue.lift)*mix,.7,2.25,1.3);
 out.z=clamp(out.z*(1-mix)+z*mix,-3.9,3.9,0);
}
