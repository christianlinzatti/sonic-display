/** V960: verified-section continuity and conservative render-budget planning.
 * Pure functions: no timers, network calls, renderer instances, storage or device writes.
 * A transition never changes the underlying detected song phase or a user-authored cue.
 */
import type {TrackAnalysisV318} from '@/services/musicAnalysis/trackAnalysisV318';
import {
 composeConcertSceneV958,
 type ConcertSceneV958,
 type ConcertSettingsV958,
 type ConcertCameraV940,
 type ConcertPhaseV958,
} from '@/lib/ultimateConcertRoadmapV958';

export type ConcertTransitionResultV960={scene:ConcertSceneV958;active:boolean;blend:number;
 durationMs:number;compact:boolean;autoVaried:boolean;reason:string};
export type ConcertTransitionOptionsV960={manualStage?:boolean;savedShowActive?:boolean;reducedMotion?:boolean};
export type PreviousSceneInputV960={analysis:TrackAnalysisV318|null|undefined;trackId:string;sectionIndex:number;
 durationMs:number;genre:string;energy:number;bass:number;lyricsVisible:boolean;reducedMotion:boolean;
 settings:ConcertSettingsV958};

const clamp=(x:number,lo:number,hi:number)=>Number.isFinite(x)?Math.max(lo,Math.min(hi,x)):lo;
const smooth=(x:number)=>{const t=clamp(x,0,1);return t*t*(3-2*t);};
const validPhase=(x:unknown):x is ConcertPhaseV958=>
 x==='verse'||x==='hook'||x==='build'||x==='drop'||x==='break'||x==='outro';
const cameras:ConcertCameraV940[]=['wide','medium','close','orbit'];

/** Only a contiguous, accurately labeled, high-confidence real V318 section is eligible.
 * Synthetic rehearsal scenes have a separate visual preview and never drive hardware.
 */
export function previousVerifiedConcertSceneV960(input:PreviousSceneInputV960):ConcertSceneV958|null{
 const {analysis,trackId,sectionIndex}=input;
 if(!analysis||analysis.trackId!==trackId||sectionIndex<1||sectionIndex>=analysis.sections.length)return null;
 const previous=analysis.sections[sectionIndex-1];
 const current=analysis.sections[sectionIndex];
 if(!validPhase(previous.label)||!validPhase(current.label)||previous.confidence<.5||current.confidence<.5||
  !Number.isFinite(previous.startMs)||!Number.isFinite(previous.durationMs)||
  !Number.isFinite(current.startMs)||previous.startMs<0||previous.durationMs<=0||
  previous.startMs+previous.durationMs>analysis.durationMs+1000||
  current.startMs<0||current.startMs>=analysis.durationMs||
  Math.abs(current.startMs-(previous.startMs+previous.durationMs))>1000)return null;
 const progressMs=previous.startMs+Math.min(previous.durationMs-1,Math.max(1,Math.floor(previous.durationMs*.75)));
 return composeConcertSceneV958({trackId,progressMs,durationMs:input.durationMs,phase:previous.label,
  sectionIndex:sectionIndex-1,sectionStartMs:previous.startMs,verified:true,
  genre:input.genre,energy:input.energy,bass:input.bass,lyricsVisible:input.lyricsVisible,
  reducedMotion:input.reducedMotion},input.settings);
}

export function concertTransitionDurationV960(phase:ConcertPhaseV958,genre:string):number{
 const defaults:Record<ConcertPhaseV958,number>={verse:2600,hook:2200,build:1600,drop:950,break:3100,outro:2900};
 const multiplier=/hardtekk|hardstyle|rawstyle/i.test(genre)?0.85:1;
 return Math.round(defaults[phase]*multiplier);
}

/** Decides one scene for existing R3F/Govee loops, with no additional work per frame.
 * Authored stages, V912 shows and manual timeline overrides are never remixed.
 */
export function applyConcertContinuityV960(scene:ConcertSceneV958,previous:ConcertSceneV958|null,
 elapsedMs:number,settings:ConcertSettingsV958,options:ConcertTransitionOptionsV960={}):ConcertTransitionResultV960{
 const compact=settings.compactFxV960===true;
 const durationMs=concertTransitionDurationV960(scene.phase,scene.genre);
 const blocked=options.manualStage===true||options.savedShowActive===true||scene.timelineOverride;
 const active=Boolean(settings.enabled&&settings.transitionsV960&&scene.verified&&!blocked&&previous?.verified);
 const blend=active?smooth(clamp(elapsedMs,0,durationMs)/durationMs):1;
 if(!settings.enabled||!scene.verified||blocked||(!active&&!compact&&!options.reducedMotion)){
  return {scene,active:false,blend:1,durationMs,compact:false,autoVaried:false,
   reason:blocked?'Manueller Cue oder gespeicherte Show hat Vorrang':'Keine bestätigte Übergangssequenz'};
 }
 let camera=scene.camera;
 let autoVaried=false;
 if(active&&previous&&previous.camera===camera&&previous.formation===scene.formation){
  // Repeated adjacent shots are swapped deterministically, never in a manual cue.
  camera=cameras[(cameras.indexOf(camera)+1)%cameras.length];
  autoVaried=true;
 }
 // FX count is bounded before the shared renderer sees this scene. No extra meshes/timers.
 const budget=options.reducedMotion?1:compact?2:3;
 const effects=scene.effects.filter(effect=>!options.reducedMotion||effect==='beams'||effect==='fog')
  .filter(effect=>!(active&&blend<.4&&(effect==='bass-impact'||effect==='confetti'||effect==='streamers')))
  .slice(0,budget);
 const intensity=active&&previous?previous.intensity+(scene.intensity-previous.intensity)*blend:scene.intensity;
 const next:ConcertSceneV958={...scene,camera,effects,intensity,
  transition:active?Math.min(scene.transition,blend):scene.transition};
 return {scene:next,active,blend,durationMs,compact,autoVaried,
  reason:active?'Bestätigter Abschnitt – weich überblendet':compact?'Kompakte virtuelle FX':'Bewegung reduziert'};
}

export function concertContinuityAuditV960(scenes:readonly ConcertSceneV958[],synthetic=false){
 let repeated=0,overBudget=0,phaseChanges=0;
 for(let i=0;i<scenes.length;i++){
  const s=scenes[i];
  if(s.effects.length>3)overBudget++;
  if(i){const p=scenes[i-1];if(p.phase!==s.phase)phaseChanges++;
   if(p.camera===s.camera&&p.formation===s.formation)repeated++;}
 }
 return {scenes:scenes.length,phaseChanges,repeated,overBudget,
  smoothable:Math.max(0,phaseChanges-repeated),syntheticOnly:synthetic};
}
