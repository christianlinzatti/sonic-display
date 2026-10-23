import type {ShowCue} from "./ultimateShowDirectorV306";

/** V313: song-length-aware narrative arcs for the existing V306/V310/V312 directors.
 * Pure music-time calculations; no Date.now, per-frame randomness or new clip/lighting timeline. */
export const DANCE_SHOW_EVOLUTION_KEY_V313 = "sonic-dance-show-evolution-v313";
export const DANCE_SHOW_EVOLUTION_EVENT_V313 = "sonic-dance-show-evolution-v313-change";
export type EvolutionPhaseV313 = "intro" | "groove" | "rise" | "peak" | "finale";
export type EvolutionDirectiveV313 = {
  phase: EvolutionPhaseV313;
  progress: number;
  dancerScale: number;
  duetWeight: number;
  sceneLift: number;
};
export type EvolutionSettingsV313 = {
  enabled:boolean;
  arcStrength:number;
  calmIntro:number;
  climaxLift:number;
  finaleEnabled:boolean;
  musicalPriority:boolean;
};
export const DEFAULT_EVOLUTION_V313:Readonly<EvolutionSettingsV313>=Object.freeze({
  enabled:true,arcStrength:70,calmIntro:65,climaxLift:75,finaleEnabled:true,musicalPriority:true,
});
const clamp=(v:number,a:number,b:number)=>Number.isFinite(v)?Math.min(b,Math.max(a,v)):a;
const percentage=(v:unknown,d:number)=>typeof v==="number"&&Number.isFinite(v)?Math.round(clamp(v,0,100)):d;
const smooth=(x:number)=>{const u=clamp(x,0,1);return u*u*(3-2*u);};
export function normalizeEvolutionV313(raw:unknown):EvolutionSettingsV313 {
  const value=raw&&typeof raw==="object"&&!Array.isArray(raw)?raw as Record<string,unknown>:{};
  return {enabled:value.enabled!==false,arcStrength:percentage(value.arcStrength,70),calmIntro:percentage(value.calmIntro,65),
    climaxLift:percentage(value.climaxLift,75),finaleEnabled:value.finaleEnabled!==false,musicalPriority:value.musicalPriority!==false};
}
export function readEvolutionV313():EvolutionSettingsV313 {
  if(typeof window==="undefined")return {...DEFAULT_EVOLUTION_V313};
  try{return normalizeEvolutionV313(JSON.parse(window.localStorage.getItem(DANCE_SHOW_EVOLUTION_KEY_V313)??"null"));}
  catch{return {...DEFAULT_EVOLUTION_V313};}
}
export function writeEvolutionV313(value:unknown):EvolutionSettingsV313 {
  const next=normalizeEvolutionV313(value);
  if(typeof window!=="undefined"){
    try{window.localStorage.setItem(DANCE_SHOW_EVOLUTION_KEY_V313,JSON.stringify(next));}catch{/* private browsing */}
    window.dispatchEvent(new Event(DANCE_SHOW_EVOLUTION_EVENT_V313));
  }
  return next;
}
export type EvolutionInputV313={trackId:string;progressMs:number;durationMs?:number|null;playing:boolean;reducedMotion:boolean;
  energy:number;cue:ShowCue;settings:EvolutionSettingsV313;fxBudget?:number;lightBudget?:number;beamBudget?:number;};
export type EvolutionStateV313={trackId:string;atMs:number;durationMs:number;seeked:boolean;directive:EvolutionDirectiveV313|null;};
export const initialEvolutionV313=():EvolutionStateV313=>({trackId:"",atMs:-1,durationMs:0,seeked:false,directive:null});
/** If duration is unavailable or implausibly short, keep V306's section-led show unchanged. */
export function computeEvolutionDirectiveV313(input:EvolutionInputV313):EvolutionDirectiveV313|null {
  if(!input.settings.enabled||!input.cue.enabled||!Number.isFinite(input.durationMs)||!((input.durationMs as number)>=45_000))return null;
  const ms=clamp(input.progressMs,0,input.durationMs!);
  const progress=clamp(ms/input.durationMs!,0,1);
  const section=input.cue.section;
  const isHook=section==="hook"||section==="drop";
  const isBreak=section==="break";
  const arc=input.settings.arcStrength/100;
  const intro=input.settings.calmIntro/100;
  const peak=input.settings.climaxLift/100;
  let phase:EvolutionPhaseV313;
  if(progress<.12)phase="intro";
  else if(progress<.52)phase="groove";
  else if(progress<.77)phase="rise";
  else if(progress<.92 || !input.settings.finaleEnabled)phase="peak";
  else phase="finale";
  // Broad ease curves avoid a hard jump at scene boundaries. The song is a guide, not a fake drop detector.
  const entry=smooth(progress/.16);
  const late=smooth((progress-.47)/.36);
  const finish=smooth((progress-.90)/.10);
  let sceneLift=(-.28*intro*(1-entry) + .18*late*peak + .11*finish*peak)*arc;
  if(input.settings.musicalPriority){
    if(isBreak)sceneLift=Math.min(sceneLift, -.10*arc);
    if(isHook)sceneLift+=.06*arc*peak;
  }
  sceneLift=clamp(sceneLift,-.30,.29);
  const energy=clamp(input.energy,0,1);
  // The dancer stays present even during a calm intro; no avatar is hidden and no position is teleported.
  const dancerScale=clamp(1 + sceneLift*.53-(isBreak ? .075*arc : 0)+ (isHook ? .04*energy*arc : 0),.73,1.19);
  const duetWeight=clamp((.38 + .38*late + .16*finish)*arc + .20*(1-arc),0,1);
  return {phase,progress,dancerScale,duetWeight,sceneLift};
}
/** State is only for track/seek diagnostics; output depends on music clock, not render FPS. */
export function advanceEvolutionV313(state:EvolutionStateV313,input:EvolutionInputV313):EvolutionStateV313 {
  const at=clamp(input.progressMs,0,Number.MAX_SAFE_INTEGER);
  if(!input.settings.enabled||!input.cue.enabled)return initialEvolutionV313();
  const duration=typeof input.durationMs==="number"&&Number.isFinite(input.durationMs)?Math.max(0,input.durationMs):0;
  const reset=state.trackId!==input.trackId||state.atMs<0||at<state.atMs-1200||at>state.atMs+10000||duration!==state.durationMs;
  if(!input.playing && !reset)return {...state,atMs:at};
  return {trackId:input.trackId,atMs:at,durationMs:duration,seeked:reset, directive:computeEvolutionDirectiveV313(input)};
}
/** No global scene overwrite, no manual camera/keyframe edits, no fabricated impact cue. */
export function applyEvolutionV313(base:ShowCue,state:EvolutionStateV313,input:EvolutionInputV313):ShowCue {
  const evolution=state.directive;
  if(!evolution||!input.settings.enabled||!base.enabled||!input.playing||input.reducedMotion)return base;
  const lift=evolution.sceneLift;
  const accent=base.accent; // only V306's actual section transition can create an accent
  const inBreak=base.section==="break";
  const lightGain=base.lightingEnabled?Math.min(clamp(input.lightBudget??1.53,.6,1.53),clamp(base.lightGain*(1+.42*lift),.6,1.53)):base.lightGain;
  const beamGain=base.lightingEnabled?Math.min(clamp(input.beamBudget??1.65,.48,1.65),clamp(base.beamGain*(1+.64*lift),.48,1.65)):base.beamGain;
  const fxGain=base.fxEnabled?Math.min(clamp(input.fxBudget??1,0,1),clamp(base.fxGain*(1+lift*.72)*(inBreak ? .75 : 1),0,1)):base.fxGain;
  const cameraGain=base.cameraEnabled?clamp(base.cameraGain*(1+.27*lift),0,1):base.cameraGain;
  // Finale composition is only suggested for existing high-energy sections, never a synthetic climax.
  const finaleShot=evolution.phase==="finale"&&(base.section==="hook"||base.section==="drop")
    && base.sectionStartMs>=(typeof input.durationMs==="number"?input.durationMs*.90:Number.POSITIVE_INFINITY);
  return {...base,lightGain,beamGain,fxGain,cameraGain,
    cameraShot:base.cameraEnabled&&finaleShot?"wide":base.cameraShot,
    formation:base.formationsEnabled&&finaleShot?"sync":base.formation,
    accent, evolution};
}
