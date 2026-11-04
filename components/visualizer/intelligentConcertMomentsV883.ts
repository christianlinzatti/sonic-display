/** V883: conservative, song-scoped *visual suggestions* derived solely from
 * the previously verified V604/V763 stage intervals. Not beat/vocal detection.
 * Pure functions: independent of React, Spotify, storage and the render loop. */
import {verifiedLiveFxScenesV881,type LiveFxTimelineV881} from './liveFxDeckPlannerV881';

export type ConcertMomentKindV883='rise'|'hook'|'drop'|'finale';
export type ConcertMomentStyleV883='balanced'|'cinematic'|'festival';
export interface ConcertMomentsSettingsV883 {
 enabled:boolean; style:ConcertMomentStyleV883; showOverlay:boolean; showCountdown:boolean;
}
export const CONCERT_MOMENTS_KEY_V883='sonic-concert-moments-v883';
export const DEFAULT_CONCERT_MOMENTS_V883:Readonly<ConcertMomentsSettingsV883>={
 enabled:true,style:'balanced',showOverlay:true,showCountdown:true,
};
export interface ConcertMomentV883 {
 id:string; sceneIndex:number; kind:ConcertMomentKindV883; startMs:number;
 endMs:number; section:string; label:string; reason:string;
}
export interface ConcertMomentsPlanV883 {
 trackId:string; durationMs:number; source:'verified-v604'|'unavailable';
 moments:readonly ConcertMomentV883[];
}
export interface ConcertMomentCueV883 {
 kind:ConcertMomentKindV883|null; id:string; startMs:number; power:number;
 label:string; next:ConcertMomentV883|null; secondsUntilNext:number|null;
}
const finite=(n:unknown):n is number=>typeof n==='number'&&Number.isFinite(n);
const modes:readonly ConcertMomentStyleV883[]=['balanced','cinematic','festival'];
const safeNumber=(n:number,a:number,b:number)=>Math.min(b,Math.max(a,n));
export function normalizeConcertMomentsV883(raw:unknown):ConcertMomentsSettingsV883 {
 const v=raw&&typeof raw==='object'&&!Array.isArray(raw)?raw as Partial<ConcertMomentsSettingsV883>:{};
 return {enabled:typeof v.enabled==='boolean'?v.enabled:true,
  style:modes.includes(v.style as ConcertMomentStyleV883)?v.style as ConcertMomentStyleV883:'balanced',
  showOverlay:typeof v.showOverlay==='boolean'?v.showOverlay:true,
  showCountdown:typeof v.showCountdown==='boolean'?v.showCountdown:true};
}
const labels:Record<ConcertMomentKindV883,string>={rise:'SPANNUNGSAUFBAU',hook:'HOOK MOMENT',drop:'DROP IMPACT',finale:'SHOW FINALE'};
const weights:Record<ConcertMomentKindV883,number>={rise:35,hook:70,drop:90,finale:110};
const lifetime:Record<ConcertMomentKindV883,number>={rise:3800,hook:3400,drop:2900,finale:5200};
const spacing=18500;
/** Never emit a moment for stale, malformed or unverified scene data.
 * A finale is an editorial cue *within* a verified closing interval, not a
 * claim that the song has a recognized outro, beat, artist or live audience. */
export function buildConcertMomentsV883(input:{timeline?:LiveFxTimelineV881|null;
 trackId:string;durationMs:number}):ConcertMomentsPlanV883 {
 const {timeline,trackId,durationMs}=input;
 const off:ConcertMomentsPlanV883={trackId,durationMs,source:'unavailable',moments:[]};
 const scenes=verifiedLiveFxScenesV881(timeline,trackId,durationMs);
 if(!scenes.length)return off;
 const candidates:ConcertMomentV883[]=[];
 for(const scene of scenes){
  if(['breath','portrait','dialogue'].includes(scene.intent)||scene.section==='break')continue;
  let kind:ConcertMomentKindV883|null=null;
  if(scene.section==='drop')kind='drop';
  else if(scene.section==='hook'&&scene.intent!=='breath'&&scene.intent!=='portrait'&&scene.intent!=='dialogue')kind='hook';
  else if((scene.section==='build'||scene.intent==='rise')&&scene.intent!=='breath')kind='rise';
  if(!kind||scene.endMs-scene.startMs<2300||scene.startMs>durationMs-4500)continue;
  candidates.push({id:`${scene.index}-${kind}`,sceneIndex:scene.index,kind,
   startMs:scene.startMs,endMs:scene.endMs,section:scene.section,
   label:labels[kind],reason:'Einstieg in bestätigten '+scene.section+'-Abschnitt'});
 }
 const last=scenes[scenes.length-1];
 if(last&&last.endMs>=durationMs-1000&&last.endMs-last.startMs>=6500&&
  ['outro','hook','drop'].includes(last.section)&&last.intent!=='breath'&&last.intent!=='portrait'){
  // Within the real final interval, never outside the verified plan.
  const start=Math.max(last.startMs,durationMs-6200);
  candidates.push({id:`${last.index}-finale`,sceneIndex:last.index,kind:'finale',
   startMs:start,endMs:last.endMs,section:last.section,label:labels.finale,
   reason:'Visueller Abschluss im letzten bestätigten Show-Abschnitt'});
 }
 // Prefer rare peaks over frequent build-up triggers; no repetitive FX spam.
 const selected:ConcertMomentV883[]=[];
 for(const c of [...candidates].sort((a,b)=>weights[b.kind]-weights[a.kind]||a.startMs-b.startMs)){
  if(selected.length>=6)break;
  // Reserve room for later acts instead of spending every accent in the intro.
  const slot=(m:ConcertMomentV883)=>Math.min(3,Math.floor(m.startMs/durationMs*4));
  if(selected.filter(m=>slot(m)===slot(c)).length>=2)continue;
  if(selected.some(p=>Math.abs(p.startMs-c.startMs)<spacing))continue;
  selected.push(c);
 }
 selected.sort((a,b)=>a.startMs-b.startMs);
 return {trackId,durationMs,source:'verified-v604',moments:selected};
}
export function planConcertMomentV883(input:{plan:ConcertMomentsPlanV883;
 trackId:string;durationMs:number;positionMs:number;playing:boolean;reducedMotion:boolean;
 settings:ConcertMomentsSettingsV883;autoEnabled:boolean}):ConcertMomentCueV883 {
 const off:ConcertMomentCueV883={kind:null,id:'',startMs:-1,power:0,
  label:'',next:null,secondsUntilNext:null};
 const {plan,trackId,durationMs,positionMs,playing,reducedMotion,settings,autoEnabled}=input;
 if(!playing||reducedMotion||!settings.enabled||!autoEnabled||!trackId||
  plan.source!=='verified-v604'||plan.trackId!==trackId||plan.durationMs!==durationMs||
  !finite(positionMs)||positionMs<0||positionMs>durationMs+1500)return off;
 const active=plan.moments.find(m=>positionMs>=m.startMs&&
  positionMs<Math.min(m.endMs,m.startMs+lifetime[m.kind]));
 const next=plan.moments.find(m=>m.startMs>positionMs)??null;
 if(!active)return {...off,next,secondsUntilNext:next?Math.ceil((next.startMs-positionMs)/1000):null};
 const p=safeNumber((positionMs-active.startMs)/lifetime[active.kind],0,1);
 // Fast but smooth onset; never a strobe or full-stage flash.
 const envelope=Math.min(1,p/.18)*Math.min(1,(1-p)/.42);
 const styleGain=settings.style==='festival'?1:settings.style==='cinematic'?.60:.80;
 return {kind:active.kind,id:active.id,startMs:active.startMs,
  power:safeNumber(envelope*styleGain,0,1),label:active.label,next,
  secondsUntilNext:next?Math.ceil((next.startMs-positionMs)/1000):null};
}
/** Export only verified visual timing recommendations, without inventing sound events. */
export function exportConcertMomentsV883(plan:ConcertMomentsPlanV883,
 settings:ConcertMomentsSettingsV883):string|null {
 if(plan.source!=='verified-v604'||!plan.moments.length)return null;
 return JSON.stringify({schema:'sonic-concert-moments-v883',version:1,
  source:'verified-v604-concert-timeline',
  note:'Visuelle Dramaturgie-Vorschläge, keine Beat-/Vokal- oder Kamera-Analyse.',
  trackId:plan.trackId,durationMs:plan.durationMs,settings:normalizeConcertMomentsV883(settings),
  moments:plan.moments},null,2);
}
