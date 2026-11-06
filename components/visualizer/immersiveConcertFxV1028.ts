/** V1028 – Immersive Concert FX 5.0.
 * Dependency-free, seek-stable choreography over EXISTING V814/V816/V817/V844/V882 cues.
 * All output gains are <=1: cannot revive disabled effects, exceed the V825 quality
 * budget, override authored cues, or trigger a new light/pyro/hardware pulse.
 */
export type ImmersiveFxActV1028='off'|'portrait'|'rising'|'impact'|'finale'|'breath';
export interface ImmersiveFxPlanV1028 {
 active:boolean;act:ImmersiveFxActV1028;reason:'verified'|'protected';
 waveGain:number;beamGain:number;fogGain:number;confettiGain:number;
 sparkGain:number;foamGain:number;intensity:number;
}
export const IMMERSIVE_OFF_V1028:Readonly<ImmersiveFxPlanV1028>=Object.freeze({
 active:false,act:'off',reason:'protected',waveGain:1,beamGain:1,fogGain:1,
 confettiGain:1,sparkGain:1,foamGain:1,intensity:0,
});
const clamp=(n:number)=>Math.max(0,Math.min(1,n));
export function planImmersiveConcertFxV1028(i:{
 enabled:boolean;masterEnabled:boolean;strength:number;
 fx:{active:boolean;reason:string;section:string;phase:number};
 positionMs:number;startMs:number;endMs:number;durationMs:number;
 playing:boolean;reducedMotion:boolean;blackout:boolean;manualLighting:boolean;
 manualFx:boolean;seekBlocked:boolean;authoredLanes:readonly string[];
 lyricsProtected:boolean;lyricsVisible:boolean;vocalFocus:boolean;cameraCloseup:boolean;
 groupCount:number;tier:'low'|'balanced'|'high';energy:number;kick:number;
 budget:number;pressure:number;
}):ImmersiveFxPlanV1028 {
 const f=i.fx;
 if(!i.enabled||!i.masterEnabled||!f.active||f.reason!=='music'||!i.playing||
  i.reducedMotion||i.blackout||i.manualLighting||i.manualFx||i.seekBlocked||
  i.tier==='low'||i.authoredLanes.length>0||
  i.lyricsProtected||i.lyricsVisible||i.vocalFocus||i.cameraCloseup||
  !Number.isInteger(i.groupCount)||i.groupCount<1||i.groupCount>4||
  ![i.strength,i.positionMs,i.startMs,i.endMs,i.durationMs,f.phase,i.energy,i.kick,i.budget,i.pressure].every(Number.isFinite)||
  i.strength<=0||i.startMs<0||i.startMs>=i.endMs||i.endMs>i.durationMs||
  i.positionMs<i.startMs||i.positionMs>=i.endMs||f.phase<0||
  i.budget<=0||i.pressure>=.85) return IMMERSIVE_OFF_V1028;
 // The V604/V761-confirmed act and V810 active cue must agree on the same song clock.
 // Absolute song phase does not predict or synthesize new beat onsets.
 if(Math.abs(f.phase*1000-i.positionMs)>75)return IMMERSIVE_OFF_V1028;
 let act:ImmersiveFxActV1028='portrait';
 if(f.section==='build')act='rising';
 else if(f.section==='break'||f.section==='intro')act='breath';
 else if(f.section==='finale')act='finale';
 else if(f.section==='drop'||f.section==='hook')act='impact';
 else if(f.section!=='verse')return IMMERSIVE_OFF_V1028;
 const fade=clamp(Math.min((i.positionMs-i.startMs)/1200,(i.endMs-i.positionMs)/1200));
 const quality=clamp((.85-i.pressure)/.65)*clamp(i.budget)*(i.tier==='balanced'?.74:1);
 const intensity=clamp(i.strength/100)*fade*quality;
 if(intensity<.005)return IMMERSIVE_OFF_V1028;
 const kick=clamp(i.kick),energy=clamp(i.energy);
 const measuredImpact=(act==='impact'||act==='finale')&&kick>=.46&&energy>=.40;
 const impact=measuredImpact?clamp((kick-.46)/.54)*intensity:0;
 const build=act==='rising'?intensity*energy:0;
 const calm=act==='breath'?intensity:0;
 // All gains are reduction-only, and smoother contrast is achieved by dimming the
 // competing lanes, never by bypassing V823/V825/V871/V889 costs or counts.
 const waveGain=clamp(1-intensity*.36+impact*.36);
 const beamGain=clamp(1-intensity*.30+impact*.30);
 const fogGain=clamp(1-intensity*.32+build*.32-calm*.22);
 const confettiGain=clamp(1-intensity*.70+(measuredImpact?intensity*.70:0));
 const sparkGain=clamp(1-intensity*.52+Math.max(build,impact)*.52);
 const foamGain=clamp(1-intensity*.44+(build+impact)*.25);
 return {active:true,act,reason:'verified',waveGain,beamGain,fogGain,
  confettiGain,sparkGain,foamGain,intensity};
}
/** Immutable late post-budget mix. An inactive or manually protected source stays inactive. */
export function mixImmersiveConcertFxV1028<
 S extends {ringOpacity:number;beamGain:number},
 P extends {active:boolean;ringOpacity:number;confettiOpacity:number;sparkOpacity:number},
 F extends {active:boolean;opacity:number;power:number},
>(plan:ImmersiveFxPlanV1028,stage:S,particles:P,foam:F):{stage:S;particles:P;foam:F}{
 if(!plan.active)return {stage,particles,foam};
 return {
  stage:{...stage,ringOpacity:stage.ringOpacity*plan.waveGain,beamGain:stage.beamGain*plan.beamGain},
  particles:particles.active?{...particles,ringOpacity:particles.ringOpacity*plan.waveGain,
   confettiOpacity:particles.confettiOpacity*plan.confettiGain,
   sparkOpacity:particles.sparkOpacity*plan.sparkGain}:particles,
  foam:foam.active?{...foam,opacity:foam.opacity*plan.foamGain,power:foam.power*plan.foamGain}:foam,
 };
}
