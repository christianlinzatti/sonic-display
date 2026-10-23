/** V464 Automatic Concert Experience 3.0.
 * A deterministic, bounded long-form VISUAL pacing layer for V446/V456/V457/V460.
 * No additional ticker, audio processing, inferred singer identities, saved edits or GPU lights.
 */
import type {SmartShowPlanV446} from '../../components/visualizer/smartAutomaticRapShowV446';
import type {FeatureDirectionV460} from '../../components/visualizer/intelligentFeaturePerformanceV460';
import type {UltimateShowDirectionV456} from './ultimateAutomaticShowV456';
import type {ShowQualityTierV457} from './showContinuityV457';

export type ConcertActV464='off'|'opening'|'development'|'climax'|'finale';
export interface ConcertExperienceV464 {
  active:boolean;
  act:ConcertActV464;
  /** Purely visual phrase breathing: no modification of lip-sync timestamps. */
  breathing:boolean;
  peak:number;
  hookOrdinal:number;
  eventId:string;
  direction:UltimateShowDirectionV456;
  feature:FeatureDirectionV460;
  /** Additional automatic motion energy only (never lowers real live energy). */
  energyAccent:number;
}
const clamp=(n:number,a:number,b:number)=>Number.isFinite(n)?Math.max(a,Math.min(b,n)):a;
const mix=(a:number,b:number,t:number)=>a+(b-a)*clamp(t,0,1);
const smooth=(t:number)=>{const x=clamp(t,0,1);return x*x*(3-2*x);};

/** All decisions derive from the validated, bounded V446 phrase score. There is no
 * pseudo-random sampling or authoring of new musician/voice assignments.
 */
export function planAutomaticConcertExperienceV464(input:{
  plan:SmartShowPlanV446|null|undefined;
  progressMs:number;trackId:string;playing:boolean;reducedMotion:boolean;
  direction:UltimateShowDirectionV456;
  feature:FeatureDirectionV460;
  quality:ShowQualityTierV457;
}):ConcertExperienceV464 {
  const original:ConcertExperienceV464={active:false,act:'off',breathing:false,peak:0,
    hookOrdinal:0,eventId:'v464:inactive',direction:input.direction,feature:input.feature,energyAccent:0};
  const plan=input.plan;
  if(!input.playing||input.reducedMotion||!input.direction.active||!plan||
    plan.trackId!==input.trackId||!plan.trackId||!Number.isFinite(input.progressMs)||input.progressMs<0||
    !plan.beats.length||input.direction.count!==plan.count)return original;
  const beats=plan.beats;
  let low=0,high=beats.length-1,index=-1;
  while(low<=high){const mid=(low+high)>>1;if(beats[mid].atMs<=input.progressMs){index=mid;low=mid+1;}else high=mid-1;}
  if(index<0)return original;
  const beat=beats[index];
  if(input.progressMs>=beat.untilMs||beat.untilMs<=beat.atMs)return original;
  // Infer a show arc from the existing song duration, NOT claimed musical sections.
  // An unknown duration keeps a conservative, unaccented presentation.
  const duration=beats[beats.length-1].untilMs;
  const reliableDuration=Number.isFinite(duration)&&duration>=30000&&duration<3600000;
  const position=reliableDuration?clamp(input.progressMs/duration,0,1):.35;
  const act:ConcertActV464=!reliableDuration?'development':position<.16?'opening':
    position<.56?'development':position<.86?'climax':'finale';
  const phraseDuration=beat.untilMs-beat.atMs;
  const phraseProgress=clamp((input.progressMs-beat.atMs)/phraseDuration,0,1);
  // Keep long verses calmer briefly between visual accents, without stopping an
  // installed GLB clip or changing manually authored dancing / voice assignments.
  const breathing=phraseDuration>=12500&&!input.feature.group&&
    input.feature.moment!=='reply'&&phraseProgress>=.57&&phraseProgress<.83;
  const hookOrdinal=beat.section==='hook'?beats.slice(0,index+1).filter(b=>b.section==='hook').length:0;
  const visualPeak=input.direction.moment==='crew';
  const momentWeight=act==='opening' ? .63 : act==='development' ? .82 : act==='climax' ? 1 : act==='finale' ? .90 : .82;
  // Later repeats can grow, but do not claim actual detected chorus performers.
  const repeatLift=visualPeak?Math.min(.12,Math.max(0,hookOrdinal-1)*.055):0;
  const peak=clamp((visualPeak ? .64 : input.feature.moment==='reply' ? .42 : .26)*momentWeight+repeatLift,0,.82);
  const qualityFactor=input.quality==='low' ? .20 : input.quality==='balanced' ? .65 : 1;
  const lyricFactor=input.direction.balance.attention==='lyrics' ? .60 : 1;
  const breathFactor=breathing ? .46 : 1;
  const accent=peak*qualityFactor*lyricFactor*breathFactor;
  // Envelope preserves the first/last seconds of a scene and honors V457 smoothing.
  const enter=smooth((input.progressMs-beat.atMs)/1500);
  const leave=smooth((beat.untilMs-input.progressMs)/1200);
  const envelope=Math.min(enter,leave);
  const liveAccent=accent*envelope;
  const lightMultiplier=clamp(mix(input.direction.lightMultiplier,
    input.direction.moment==='crew' ? 1.145 : breathing ? .955 : 1.045,liveAccent),.90,1.15);
  const interactionMultiplier=clamp(mix(input.direction.interactionMultiplier,
    visualPeak ? 1.10 : breathing ? .93 : 1.035,liveAccent),.90,1.10);
  // Shared director remains authoritative for camera selection, scene and balance.
  const direction={...input.direction,lightMultiplier,interactionMultiplier};
  // V460 visual reply is an animation cue, never a vocalist attribution. Keep
  // its event identity and all credited name labels unchanged.
  const replyBoost=input.feature.active&&input.feature.moment==='reply'
    ?clamp(mix(input.feature.responseGain,Math.min(1,input.feature.responseGain*1.08),liveAccent),0,1)
    :input.feature.responseGain;
  const feature=replyBoost===input.feature.responseGain?input.feature:
    {...input.feature,responseGain:replyBoost};
  return {active:true,act,breathing,peak,hookOrdinal,
    eventId:`v464:${plan.trackId}:${beat.id}:${act}`,direction,feature,
    energyAccent:clamp(liveAccent*.10,0,.075)};
}

/** Adds a subtle automatic emphasis for the shared score while preserving the
 * live audio floor and manual-performance precedence (inactive = exact passthrough).
 */
export function concertMotionEnergyV464(score:ConcertExperienceV464,
  energy:number,liveEnergy:number):number {
  if(!score.active)return energy;
  return clamp(Math.max(clamp(liveEnergy,0,1),clamp(energy,0,1)+score.energyAccent),0,1);
}
