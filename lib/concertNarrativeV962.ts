/** V962 – phase-aware concert narrative for the existing V958/V960/V961 pipeline.
 * Pure bounded calculations: no timers, network calls, storage, audio capture, or 3D allocations.
 * Requires a verified real V318 section and explicit opt-in; saved and authored cues win.
 */
import type {GoveeLookV909} from '@/lib/goveeLanV909';
import type {ConcertSceneV958,ConcertPhaseV958} from '@/lib/ultimateConcertRoadmapV958';

export type ConcertNarrativePolicyV962={enabled:boolean;playing:boolean;elapsedMs:number;sectionDurationMs:number;
 savedShowActive?:boolean;authoredStageActive?:boolean;recovering?:boolean;reducedMotion?:boolean};
export type ConcertNarrativeResultV962={scene:ConcertSceneV958;active:boolean;factor:number;
 initialFactor:number;targetFactor:number;reason:string};
const clamp=(value:number,lo:number,hi:number)=>Number.isFinite(value)?Math.min(hi,Math.max(lo,value)):lo;
const smooth=(value:number)=>{const x=clamp(value,0,1);return x*x*(3-2*x);};
const phases:ConcertPhaseV958[]=['verse','hook','build','drop','break','outro'];
/** All factors are at or below one; V962 never requests brighter light than the original cue. */
export function concertNarrativeFactorV962(phase:ConcertPhaseV958,genre:string,progress:number):number{
 const p=clamp(progress,0,1);
 const hard=/hardtekk|hardstyle|rawstyle/i.test(genre);
 const rap=/deutschrap|hip.?hop|rap/i.test(genre);
 switch(phase){
 case 'verse':return rap?.9:.84;
 case 'hook':return rap?.98:.94;
 case 'build':return (hard?.78:.72)+(hard?.22:.27)*smooth(p);
 case 'drop':return 1;
 case 'break':return hard?.68:.64;
 case 'outro':return .79-.12*smooth(p);
 default:return .85;
 }
}
/** Controls the existing music-driven scene; never invents song sections or camera cuts.
 * A preceding scene is accepted only if verified by V960 and passed by the caller.
 */
export function planConcertNarrativeV962(scene:ConcertSceneV958,
 previous:ConcertSceneV958|null,policy:ConcertNarrativePolicyV962):ConcertNarrativeResultV962{
 const active=policy.enabled&&policy.playing&&scene.verified&&phases.includes(scene.phase)&&
  !scene.timelineOverride&&!policy.savedShowActive&&!policy.authoredStageActive&&!policy.recovering&&
  Number.isFinite(policy.elapsedMs)&&policy.elapsedMs>=0&&
  Number.isFinite(policy.sectionDurationMs)&&policy.sectionDurationMs>0;
 if(!active)return {scene,active:false,factor:1,initialFactor:1,targetFactor:1,
  reason:'Opt-in, bestätigte Phase oder Priorität einer gespeicherten/manuellen Show fehlt'};
 const progress=clamp(policy.elapsedMs/policy.sectionDurationMs,0,1);
 const targetFactor=concertNarrativeFactorV962(scene.phase,scene.genre,progress);
 // The previous phase may only influence the first seconds if supplied as a verified contiguous scene.
 const validPrevious=previous?.verified===true&&!previous.timelineOverride&&phases.includes(previous.phase);
 const initialFactor=validPrevious?concertNarrativeFactorV962(previous.phase,previous.genre,1):targetFactor;
 const fadeMs=scene.phase==='drop'?850:scene.phase==='hook'?1700:2600;
 const factor=clamp(initialFactor+(targetFactor-initialFactor)*smooth(policy.elapsedMs/fadeMs),0,1);
 const calmer=(scene.phase==='break'||scene.phase==='outro')&&factor<.82;
 const effects=calmer?scene.effects.filter(effect=>effect!=='bass-impact'&&effect!=='lasers'&&
  effect!=='confetti'&&effect!=='streamers'):scene.effects;
 const safeEffects=policy.reducedMotion?effects.filter(effect=>effect==='beams'||effect==='fog'):effects;
 return {scene:{...scene,intensity:clamp(scene.intensity*factor,0,scene.intensity),effects:safeEffects},
  active:true,factor,initialFactor,targetFactor,
  reason:'Bestätigte Songphase – dramaturgische Lichtkurve ohne neue Effekte'};
}
/** Keep V915 group brightness and V961 smoothing as strict upper bounds. */
export function dimConcertNarrativeLookV962(look:GoveeLookV909,plan:ConcertNarrativeResultV962):GoveeLookV909{
 if(!plan.active||!Number.isFinite(look.brightness)||look.brightness<0||look.brightness>100)return look;
 const next=Math.min(look.brightness,Math.round(look.brightness*clamp(plan.factor,0,1)));
 return next===look.brightness?look:{...look,brightness:next};
}
