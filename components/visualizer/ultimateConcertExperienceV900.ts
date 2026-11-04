/** V900 – Ultimate Concert Experience 5.0.
 * One evidence-gated, full-song visual score coordinates existing V895/896/897/899
 * channels. Does NOT fabricate beats, singers, avatar positions, animations or light cues.
 * Pure deterministic functions; no timers, GPU allocations or browser state.
 * Output is deliberately attenuation-only to respect upstream lighting/FX budgets.
 */
import type {DirectorPlanV895,DirectorFocusV895} from './aiConcertDirectorV895';
import type {EnergyStateV896} from './musicalEnergyIntelligenceV896';

export type UltimateStyleV900='cinematic'|'balanced'|'festival';
export type UltimateActV900='opening'|'development'|'climax'|'closing';
export type UltimateMotifV900='portrait'|'lyric-space'|'stage-reveal'|'ensemble-wide'|'impact'|'finale'|'breathing';
export type UltimateLensV900='close'|'medium'|'wide';
export interface UltimateSettingsV900 {
 enabled:boolean;style:UltimateStyleV900;intensity:number;protectLyrics:boolean;
 smoothTransitions:boolean;contrast:boolean;energyResponse:boolean;
 camera:boolean;dance:boolean;lights:boolean;led:boolean;stage:boolean;
}
export const ULTIMATE_KEY_V900='sonic-ultimate-concert-experience-v900';
export const DEFAULT_ULTIMATE_V900:Readonly<UltimateSettingsV900>={
 enabled:true,style:'balanced',intensity:65,protectLyrics:true,smoothTransitions:true,
 contrast:true,energyResponse:true,camera:true,dance:true,lights:true,led:true,stage:true,
};
const clamp=(n:number,lo:number,hi:number)=>Math.min(hi,Math.max(lo,n));
const finite=(n:unknown):n is number=>typeof n==='number'&&Number.isFinite(n);
const ease=(n:number)=>{const t=clamp(n,0,1);return t*t*(3-2*t);};
const styles:readonly UltimateStyleV900[]=['cinematic','balanced','festival'];
export function normalizeUltimateV900(raw:unknown):UltimateSettingsV900 {
 const v=raw&&typeof raw==='object'&&!Array.isArray(raw)?raw as Partial<UltimateSettingsV900>:{},d=DEFAULT_ULTIMATE_V900;
 const flag=(key:keyof UltimateSettingsV900):boolean=>typeof v[key]==='boolean'?v[key] as boolean:d[key] as boolean;
 return {enabled:flag('enabled'),style:styles.includes(v.style as UltimateStyleV900)?v.style as UltimateStyleV900:'balanced',
  intensity:finite(v.intensity)?Math.round(clamp(v.intensity,0,100)):65,
  protectLyrics:flag('protectLyrics'),smoothTransitions:flag('smoothTransitions'),contrast:flag('contrast'),
  energyResponse:flag('energyResponse'),camera:flag('camera'),dance:flag('dance'),lights:flag('lights'),
  led:flag('led'),stage:flag('stage')};
}
export interface UltimateSceneV900 {
 index:number;startMs:number;endMs:number;section:string;focus:DirectorFocusV895;
 act:UltimateActV900;motif:UltimateMotifV900;lens:UltimateLensV900;peakOrder:number;
}
export interface UltimatePlanV900 {
 trackId:string;durationMs:number;source:'verified-v604'|'unavailable';
 scenes:readonly UltimateSceneV900[];peakCount:number;variationCount:number;
}
const allowed=new Set(['intro','verse','hook','build','drop','break','finale','outro']);
/** Actual V895/V604 scene boundaries are the exclusive source of musical structure. */
export function buildUltimatePlanV900(p:DirectorPlanV895|null|undefined):UltimatePlanV900 {
 const trackId=p?.trackId??'',durationMs=p?.durationMs??0;
 const none:UltimatePlanV900={trackId,durationMs,source:'unavailable',scenes:[],peakCount:0,variationCount:0};
 if(p?.source!=='verified-v604'||!trackId||trackId.length>160||!finite(durationMs)||
    durationMs<10000||durationMs>1800000||!Array.isArray(p.scenes)||p.scenes.length<1)return none;
 const scenes:UltimateSceneV900[]=[];
 let peakCount=0,variationCount=0,previous:UltimateMotifV900|null=null,repeat=0;
 for(const s of p.scenes){
  if(!Number.isInteger(s.index)||s.index<0||!finite(s.startMs)||!finite(s.endMs)||
   s.startMs<0||s.endMs>durationMs||s.endMs<=s.startMs||!allowed.has(s.section)||
   (scenes.length>0&&s.startMs<scenes[scenes.length-1].endMs))return none;
  const fraction=(s.startMs+s.endMs)/2/durationMs;
  const act:UltimateActV900=s.section==='outro'?'closing':fraction<.16?'opening':fraction>=.77?'climax':'development';
  const motif:UltimateMotifV900=s.section==='finale'?'finale':
   s.section==='drop'?'impact':s.section==='hook'?'ensemble-wide':
   s.section==='build'||s.section==='intro'?'stage-reveal':
   s.section==='break'||s.section==='outro'?'breathing':
   s.focus==='lyrics'?'lyric-space':'portrait';
  if(motif===previous)repeat++;else repeat=0;
  const lens:UltimateLensV900=motif==='portrait'||motif==='lyric-space'?repeat%2===0?'close':'medium':
   motif==='stage-reveal'?repeat%2===0?'wide':'medium':
   motif==='ensemble-wide'?repeat%2===0?'wide':'medium':
   motif==='breathing'?'close':'wide';
  if(repeat>0)variationCount++;
  const peakOrder=motif==='impact'||motif==='finale'?++peakCount:0;
  scenes.push({index:s.index,startMs:s.startMs,endMs:s.endMs,section:s.section,focus:s.focus,
   act,motif,lens,peakOrder});
  previous=motif;
  if(scenes.length>=64)break;
 }
 return scenes.length?{trackId,durationMs,source:'verified-v604',scenes,peakCount,variationCount}:none;
}
export interface UltimateCueV900 {
 active:boolean;sceneIndex:number;act:UltimateActV900|null;motif:UltimateMotifV900|null;
 lens:UltimateLensV900|null;energyUsed:boolean;transition:number;
 cameraRate:number;danceGain:number;lightGain:number;ledGain:number;stageGain:number;
 reason:'active'|'disabled'|'unverified'|'protected';
}
export const ULTIMATE_OFF_V900:Readonly<UltimateCueV900>={active:false,sceneIndex:-1,act:null,
 motif:null,lens:null,energyUsed:false,transition:0,cameraRate:1,danceGain:1,lightGain:1,ledGain:1,stageGain:1,reason:'disabled'};
export interface UltimateInputV900 {
 plan?:UltimatePlanV900|null;settings:UltimateSettingsV900;
 trackId:string;durationMs:number;positionMs:number;playing:boolean;autoEnabled:boolean;
 directorEnabled:boolean;reducedMotion:boolean;tier:'low'|'balanced'|'high';
 seekBlocked?:boolean;blackout?:boolean;manualFx?:boolean;manualCamera?:boolean;
 manualDance?:boolean;manualLighting?:boolean;lyricsProtected?:boolean;
 lyricsVisible?:boolean;vocalFocus?:boolean;energy?:EnergyStateV896|null;
}
/** Never brightens existing sources. Contrasting quiet scenes makes existing verified
 * hooks/finales *feel* bigger, without inventing strobes, drop hits or draw calls. */
export function sampleUltimateV900(i:UltimateInputV900):UltimateCueV900 {
 const s=i.settings,p=i.plan;
 const off=(reason:UltimateCueV900['reason']):UltimateCueV900=>({...ULTIMATE_OFF_V900,reason});
 if(!s.enabled||s.intensity<=0||!i.directorEnabled||!i.autoEnabled||!i.playing||
  i.reducedMotion||i.tier==='low'||i.seekBlocked||i.blackout||i.manualFx||
  (!s.camera&&!s.dance&&!s.lights&&!s.led&&!s.stage))return off('protected');
 if(!p||p.source!=='verified-v604'||!i.trackId||i.trackId.length>160||p.trackId!==i.trackId||
  p.durationMs!==i.durationMs||!finite(i.durationMs)||i.durationMs<10000||i.durationMs>1800000||
  !finite(i.positionMs)||i.positionMs<0||i.positionMs>=i.durationMs)return off('unverified');
 const scene=p.scenes.find(x=>i.positionMs>=x.startMs&&i.positionMs<x.endMs);
 if(!scene)return off('unverified');
 const edgeMs=!s.smoothTransitions?0:s.style==='cinematic'?2600:s.style==='festival'?700:1450;
 const transition=edgeMs===0?1:ease((i.positionMs-scene.startMs)/edgeMs)*
  ease((scene.endMs-i.positionMs)/Math.max(450,edgeMs*.6));
 const scale=(s.intensity/100)*(i.tier==='balanced'?.72:1)*transition;
 const validEnergy=!!s.energyResponse&&!!i.energy&&i.energy.source==='live-normalized-audio'&&
  i.energy.trackId===i.trackId&&i.energy.durationMs===i.durationMs&&i.energy.samples>=3&&
  finite(i.energy.positionMs)&&Math.abs(i.energy.positionMs-i.positionMs)<=600&&
  finite(i.energy.smoothed)&&i.energy.smoothed>=0&&i.energy.smoothed<=1&&
  finite(i.energy.trend)&&Math.abs(i.energy.trend)<=1;
 const energyScale=validEnergy?clamp(.93+i.energy!.smoothed*.11+i.energy!.trend*.03,.90,1.06):1;
 // Scene-wide attention map, not a new spotlight, actor identification, or FX trigger.
 const looks:Record<UltimateMotifV900,readonly [number,number,number,number,number]>={
  'portrait':[.975,.91,.985,.75,.81],
  'lyric-space':[.91,.88,.96,.66,.75],
  'stage-reveal':[.98,.93,.975,.91,.95],
  'ensemble-wide':[1,.99,.99,.99,.97],
  'impact':[.97,1,1,1,1],
  'finale':[.99,1,1,1,1],
  'breathing':[.94,.89,.97,.73,.78],
 };
 const [camera,dance,lights,led,stage]=looks[scene.motif];
 // A verified late finale gets the most headroom; earlier peaks are slightly
 // restrained. This is a visual *contrast* choice, NOT inferred audio evidence.
 const peakRank=scene.peakOrder>0&&p.peakCount>1?
  (scene.peakOrder-1)/(p.peakCount-1):1;
 const earlyPeakTrim=scene.peakOrder>0&&s.contrast?.055*(1-peakRank):0;
 const actTrim=scene.act==='opening'&&s.contrast?.028:0;
 // Repeated motifs use different authored lens labels; pace differences are
 // subtle and do not move or replace a camera or override V351 safe framing.
 const lensTrim=scene.lens==='medium'?.008:0;
 const lyricGuard=s.protectLyrics&&(i.lyricsProtected||i.lyricsVisible||i.vocalFocus);
 const contrast=s.contrast?1:.4;
 const intensity=clamp(scale*contrast*energyScale,0,1);
 const attenuation=(desired:number)=>clamp(1-(1-desired)*intensity,.62,1);
 // Camera only slows; manual shots and lyrics-focus remain entirely untouched.
 const cameraRate=s.camera&&!i.manualCamera&&!lyricGuard?attenuation(camera-lensTrim):1;
 const danceGain=s.dance&&!i.manualDance?attenuation(dance):1;
 const lightGain=s.lights&&!i.manualLighting&&!lyricGuard?attenuation(lights):1;
 const ledGain=s.led&&!i.manualLighting&&!lyricGuard?attenuation(led-earlyPeakTrim-actTrim):1;
 const stageGain=s.stage&&!lyricGuard?attenuation(stage-earlyPeakTrim-actTrim):1;
 return {active:intensity>.00001,sceneIndex:scene.index,act:scene.act,motif:scene.motif,
  lens:scene.lens,energyUsed:validEnergy,transition:clamp(transition,0,1),cameraRate,danceGain,
  lightGain,ledGain,stageGain,reason:'active'};
}
export function exportUltimatePlanV900(plan:UltimatePlanV900,settings:UltimateSettingsV900):string|null {
 if(plan.source!=='verified-v604'||!plan.trackId||!plan.scenes.length)return null;
 return JSON.stringify({schema:'sonic-ultimate-concert-v900',version:1,source:plan.source,
  trackId:plan.trackId,durationMs:plan.durationMs,settings:normalizeUltimateV900(settings),
  peakCount:plan.peakCount,variationCount:plan.variationCount,scenes:plan.scenes,
  note:'Regelbasierte durchgehende Show-Partitur. Nur bestätigte Songabschnitte. Keine Erkennung von Sängeridentitäten, Beats, Stems oder Hardware-Pyrotechnik.'},null,2);
}
