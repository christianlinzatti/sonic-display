/** V899 – Advanced Dance Show Director.
 * Verified V604/V895 scene authority; existing V324/V325/V322 formation, foot and
 * authored choreography remain the owner. Scene-based bounded root-spacing only:
 * never edits animation clips, skeletons, foot locks or vocal assignments.
 * No new GLB, scheduler, timer, draw call, event listener or per-frame React state.
 */
import type {DirectorPlanV895} from './aiConcertDirectorV895';
import type {EnergyStateV896} from './musicalEnergyIntelligenceV896';
export type DanceShowStyleV899='cinematic'|'balanced'|'arena';
export type DanceShowFormationV899='neutral'|'close'|'wide'|'diagonal';
export interface DanceShowSettingsV899 {
 enabled:boolean;style:DanceShowStyleV899;intensity:number;
 formations:boolean;transitions:boolean;cameraSync:boolean;energyResponse:boolean;
 protectLyrics:boolean;protectFootwork:boolean;
}
export const DANCE_SHOW_KEY_V899='sonic-advanced-dance-show-v899';
export const DEFAULT_DANCE_SHOW_V899:Readonly<DanceShowSettingsV899>={
 enabled:true,style:'balanced',intensity:55,formations:true,transitions:true,
 cameraSync:true,energyResponse:true,protectLyrics:true,protectFootwork:true,
};
export interface DanceShowCueV899 {
 active:boolean;formation:DanceShowFormationV899;section:string;sceneIndex:number;
 spacing:number;depth:number;blend:number;cameraRate:number;energyUsed:boolean;
 reason:'active'|'disabled'|'unverified'|'protected';
}
export const DANCE_SHOW_OFF_V899:Readonly<DanceShowCueV899>={active:false,formation:'neutral',
 section:'',sceneIndex:-1,spacing:0,depth:0,blend:0,cameraRate:1,energyUsed:false,reason:'disabled'};
const finite=(n:unknown):n is number=>typeof n==='number'&&Number.isFinite(n);
const clamp=(v:number,a:number,b:number)=>Math.max(a,Math.min(b,v));
const smooth=(v:number)=>{const t=clamp(v,0,1);return t*t*(3-2*t);};
const styles:readonly DanceShowStyleV899[]=['cinematic','balanced','arena'];
export function normalizeDanceShowV899(raw:unknown):DanceShowSettingsV899 {
 const obj=raw&&typeof raw==='object'&&!Array.isArray(raw)?raw as Partial<DanceShowSettingsV899>:{};
 const flag=(k:keyof DanceShowSettingsV899):boolean=>typeof obj[k]==='boolean'?obj[k] as boolean:DEFAULT_DANCE_SHOW_V899[k] as boolean;
 return {enabled:flag('enabled'),style:styles.includes(obj.style as DanceShowStyleV899)?obj.style as DanceShowStyleV899:'balanced',
  intensity:finite(obj.intensity)?Math.round(clamp(obj.intensity,0,100)):55,
  formations:flag('formations'),transitions:flag('transitions'),cameraSync:flag('cameraSync'),
  energyResponse:flag('energyResponse'),protectLyrics:flag('protectLyrics'),protectFootwork:flag('protectFootwork')};
}
export interface DanceShowInputV899 {
 settings:DanceShowSettingsV899;plan?:DirectorPlanV895|null;
 trackId:string;durationMs:number;positionMs:number;playing:boolean;autoEnabled:boolean;
 directorEnabled:boolean;danceEnabled:boolean;cameraEnabled:boolean;
 duo:boolean;count:number;tier:'low'|'balanced'|'high';reducedMotion:boolean;
 manualDance?:boolean;manualCamera?:boolean;manualFx?:boolean;
 manualFormation?:boolean;footLocked?:boolean;collisionRisk?:boolean;
 seekBlocked?:boolean;blackout?:boolean;lyricsVisible?:boolean;
 energy?:EnergyStateV896|null;
}
/** Pure, frame-rate independent cue. Does not infer musical beats, dancer roles or energy. */
export function sampleDanceShowV899(i:DanceShowInputV899):DanceShowCueV899 {
 const s=i.settings,p=i.plan,off=(reason:DanceShowCueV899['reason']):DanceShowCueV899=>({...DANCE_SHOW_OFF_V899,reason});
 if(!s.enabled||s.intensity<=0||(!s.formations&&!s.cameraSync)||!i.playing||!i.autoEnabled||
  !i.directorEnabled||!i.danceEnabled||i.manualDance||i.manualFx||i.manualFormation||
  i.reducedMotion||i.tier==='low'||i.blackout||i.seekBlocked||
  (s.protectFootwork&&(i.footLocked||i.collisionRisk))||
  (s.protectLyrics&&i.lyricsVisible))return off('protected');
 if(!p||p.source!=='verified-v604'||!i.trackId||i.trackId.length>160||p.trackId!==i.trackId||
  p.durationMs!==i.durationMs||!finite(i.durationMs)||i.durationMs<10000||i.durationMs>1800000||
  !finite(i.positionMs)||i.positionMs<0||i.positionMs>=i.durationMs||
  !Number.isInteger(i.count)||i.count<1||i.count>4)return off('unverified');
 const sc=p.scenes.find(x=>i.positionMs>=x.startMs&&i.positionMs<x.endMs);
 if(!sc)return off('unverified');
 const styleScale=s.style==='cinematic'?.62:s.style==='arena'?1.1:.84;
 const phaseFade=s.transitions?smooth((i.positionMs-sc.startMs)/1250)*smooth((sc.endMs-i.positionMs)/950):1;
 const gain=clamp(s.intensity/100*styleScale*(i.tier==='balanced'?.72:1)*phaseFade,0,1);
 const presentEnergy=i.energy;
 const energyUsed=!!s.energyResponse&&!!presentEnergy&&presentEnergy.source==='live-normalized-audio'&&
  presentEnergy.trackId===i.trackId&&presentEnergy.durationMs===i.durationMs&&presentEnergy.samples>=3&&
  Math.abs(presentEnergy.positionMs-i.positionMs)<=600&&finite(presentEnergy.smoothed)&&
  presentEnergy.smoothed>=0&&presentEnergy.smoothed<=1&&finite(presentEnergy.trend)&&
  Math.abs(presentEnergy.trend)<=1;
 const energyFactor=energyUsed?clamp(.88+presentEnergy!.smoothed*.24+presentEnergy!.trend*.10,.82,1.18):1;
 // Alternate explicitly scene-bound configurations rather than random per-frame moves.
 // A single performer has no partner to reposition, but may influence camera pacing.
 let formation:DanceShowFormationV899='neutral';
 if(i.duo&&i.count>=2){
  if(sc.section==='hook'||sc.section==='drop'||sc.section==='finale')formation='wide';
  else if(sc.section==='verse'||sc.section==='break'||sc.focus==='lyrics')formation='close';
  else formation=sc.index%2===0?'diagonal':'neutral';
 }
 const envelope=clamp(gain*energyFactor,0,1);
 const spacing=s.formations?(formation==='wide'?.22:formation==='close'?-.11:formation==='diagonal'?.10:0)*envelope:0;
 const depth=s.formations&&formation==='diagonal'?.16*envelope:0;
 // Camera rate cannot bypass V898 and V351 safety framing; neutral on manual camera.
 const cameraRate=s.cameraSync&&i.cameraEnabled&&!i.manualCamera?clamp(1+(formation==='wide'?-.035:formation==='close'?.018:0)*envelope,.96,1.025):1;
 return {active:envelope>.0001,formation,section:sc.section,sceneIndex:sc.index,
  spacing,depth,blend:envelope,cameraRate,energyUsed,reason:'active'};
}
export function exportDanceShowV899(plan:DirectorPlanV895,settings:DanceShowSettingsV899):string|null {
 if(plan.source!=='verified-v604'||!plan.trackId||!plan.scenes.length)return null;
 return JSON.stringify({schema:'sonic-dance-show-v899',version:1,source:plan.source,
  trackId:plan.trackId,durationMs:plan.durationMs,settings:normalizeDanceShowV899(settings),
  scenes:plan.scenes.map(s=>({index:s.index,startMs:s.startMs,endMs:s.endMs,
   section:s.section,focus:s.focus})),
  note:'Only confirmed song sections. No new dance clips, singer attribution, beat inference or manual timeline edits.'},null,2);
}
