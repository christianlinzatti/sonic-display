/** V884 – deterministic, opt-in cinematic seams at confirmed V604/V763 scene
 * boundaries. Pure song-time sampler: no invented beats, no extra camera or
 * light rig and no animations that outlive a seek, pause or track switch. */
import {verifiedLiveFxScenesV881,type LiveFxTimelineV881} from './liveFxDeckPlannerV881';

export type CinematicTransitionStyleV884='subtle'|'cinematic'|'arena';
export interface CinematicTransitionSettingsV884 {
 enabled:boolean;style:CinematicTransitionStyleV884;camera:boolean;lights:boolean;visual:boolean;
}
export const CINEMATIC_TRANSITIONS_KEY_V884='sonic-cinematic-transitions-v884';
export const DEFAULT_CINEMATIC_TRANSITIONS_V884:Readonly<CinematicTransitionSettingsV884>={
 enabled:true,style:'cinematic',camera:true,lights:true,visual:true,
};
export interface CinematicTransitionV884 {
 id:string;fromIndex:number;toIndex:number;atMs:number;windowMs:number;
 fromSection:string;toSection:string;kind:'rise'|'release'|'quiet'|'flow';
 label:string;
}
export interface CinematicTransitionsPlanV884 {
 trackId:string;durationMs:number;source:'verified-v604'|'unavailable';
 transitions:readonly CinematicTransitionV884[];
}
export interface CinematicTransitionCueV884 {
 active:boolean;id:string;label:string;kind:CinematicTransitionV884['kind']|'off';
 proximity:number;cameraRate:number;lightGain:number;lightOffset:number;visualOpacity:number;
}
export const OFF_CINEMATIC_TRANSITION_V884:Readonly<CinematicTransitionCueV884>={
 active:false,id:'',label:'',kind:'off',proximity:0,cameraRate:1,lightGain:1,lightOffset:0,visualOpacity:0,
};
const finite=(x:unknown):x is number=>typeof x==='number'&&Number.isFinite(x);
const clamp=(x:number,a:number,b:number)=>Math.max(a,Math.min(b,x));
const styles:readonly CinematicTransitionStyleV884[]=['subtle','cinematic','arena'];
const smooth=(p:number)=>{const v=clamp(p,0,1);return v*v*(3-2*v);};
export function normalizeCinematicTransitionsV884(raw:unknown):CinematicTransitionSettingsV884 {
 const s=raw&&typeof raw==='object'&&!Array.isArray(raw)?raw as Partial<CinematicTransitionSettingsV884>:{},
  valid=styles.includes(s.style as CinematicTransitionStyleV884);
 return {enabled:typeof s.enabled==='boolean'?s.enabled:true,
  style:valid?s.style as CinematicTransitionStyleV884:'cinematic',
  camera:typeof s.camera==='boolean'?s.camera:true,
  lights:typeof s.lights==='boolean'?s.lights:true,
  visual:typeof s.visual==='boolean'?s.visual:true};
}
/** Only adjacent verified intervals are eligible. A gap is never bridged. */
export function buildCinematicTransitionsV884(input:{timeline?:LiveFxTimelineV881|null;
 trackId:string;durationMs:number}):CinematicTransitionsPlanV884 {
 const {trackId,durationMs}=input;
 const off:CinematicTransitionsPlanV884={trackId,durationMs,source:'unavailable',transitions:[]};
 const scenes=verifiedLiveFxScenesV881(input.timeline,trackId,durationMs);
 if(!scenes.length)return off;
 const transitions:CinematicTransitionV884[]=[];
 for(let i=1;i<scenes.length;i++){
  const from=scenes[i-1],to=scenes[i];
  const fromDuration=from.endMs-from.startMs,toDuration=to.endMs-to.startMs;
  if(from.endMs!==to.startMs||fromDuration<3200||toDuration<3200)continue;
  if(from.section===to.section&&from.intent===to.intent)continue;
  const quiet=['break','outro'].includes(to.section)||['breath','portrait','dialogue'].includes(to.intent)||
   ['breath','portrait','dialogue'].includes(from.intent);
  const kind:CinematicTransitionV884['kind']=quiet?'quiet':
   to.section==='drop'||(to.section==='hook'&&from.section!=='hook')?'release':
   to.section==='build'||to.intent==='rise'?'rise':'flow';
  // 760–1700 ms either side, never overshoot either real scene interval.
  const windowMs=Math.floor(Math.min(1700,fromDuration*.24,toDuration*.24));
  if(windowMs<760)continue;
  transitions.push({id:`${i-1}-${i}-${to.startMs}`,fromIndex:i-1,toIndex:i,atMs:to.startMs,
   windowMs,fromSection:from.section,toSection:to.section,kind,
   label:`${from.section.toUpperCase()} → ${to.section.toUpperCase()}`});
 }
 return {trackId,durationMs,source:'verified-v604',transitions};
}
/** Multipliers only: camera easing, existing spotlight and optional tiny overlay.
 * Without an authoritative matching song/time or with a seek guard this is off. */
export function sampleCinematicTransitionV884(input:{plan?:CinematicTransitionsPlanV884|null;
 trackId:string;durationMs:number;positionMs:number;playing:boolean;reducedMotion:boolean;
 settings:CinematicTransitionSettingsV884;autoEnabled:boolean;seekBlocked?:boolean;
 manualCamera?:boolean;manualLighting?:boolean;lyricsProtected?:boolean;blackout?:boolean;
 tier?:'low'|'balanced'|'high';manualFx?:boolean;}):CinematicTransitionCueV884 {
 const {plan,trackId,durationMs,positionMs,playing,reducedMotion,settings,autoEnabled}=input;
 if(!plan||plan.source!=='verified-v604'||plan.trackId!==trackId||plan.durationMs!==durationMs||
  !settings.enabled||(!settings.camera&&!settings.lights&&!settings.visual)||!autoEnabled||
  !playing||reducedMotion||input.seekBlocked||input.blackout||
  input.tier==='low'||input.manualFx||!finite(positionMs)||positionMs<0||positionMs>=durationMs)
  return OFF_CINEMATIC_TRANSITION_V884;
 const seam=plan.transitions.find(s=>Math.abs(positionMs-s.atMs)<s.windowMs);
 if(!seam)return OFF_CINEMATIC_TRANSITION_V884;
 const proximity=smooth(1-Math.abs(positionMs-seam.atMs)/seam.windowMs);
 const styleGain=settings.style==='subtle'?.46:settings.style==='arena'?1:.74;
 const quietGain=seam.kind==='quiet'?.42:1;
 const amount=proximity*styleGain*quietGain*(input.tier==='balanced'?.8:1);
 // Quiet handoffs have the gentlest lighting. Keep existing rig beneath +8%.
 const lightChange=seam.kind==='quiet'?-.035:seam.kind==='rise'?-.025:.065;
 const lightGain=settings.lights&&!input.manualLighting&&!input.lyricsProtected?
  clamp(1+lightChange*amount,.94,1.08):1;
 const lightOffset=settings.lights&&!input.manualLighting&&!input.lyricsProtected?
  Math.sin((positionMs-seam.atMs)/seam.windowMs*Math.PI)*.19*amount:0;
 const cameraRate=settings.camera&&!input.manualCamera?clamp(1-.37*amount,.63,1):1;
 const visualOpacity=settings.visual&&!input.lyricsProtected?Math.min(.17,.16*amount):0;
 return {active:true,id:seam.id,label:seam.label,kind:seam.kind,proximity,
  cameraRate,lightGain,lightOffset,visualOpacity};
}
export function exportCinematicTransitionsV884(plan:CinematicTransitionsPlanV884,
 settings:CinematicTransitionSettingsV884):string|null {
 if(plan.source!=='verified-v604'||!plan.transitions.length)return null;
 return JSON.stringify({schema:'sonic-cinematic-transitions-v884',version:1,
  note:'Regelbasierte visuelle Übergänge aus bestätigten Songabschnitten; keine Beat- oder Kameraerkennung.',
  trackId:plan.trackId,durationMs:plan.durationMs,source:plan.source,
  settings:normalizeCinematicTransitionsV884(settings),transitions:plan.transitions},null,2);
}
