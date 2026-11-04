/** V891 – Virtual Pyrotechnics. Entirely local 3D graphics; never controls real devices.
 * A song-scoped VERIFIED V604 timeline is the sole authority for automatic bursts.
 * No guessed onsets, no strobe, no external timers, and no override of authored lanes.
 */
import type {AtmospherePlanV885,AtmosphereSceneV885} from './dynamicConcertAtmosphereV885';
export type PyroTypeV891='none'|'flames'|'jets'|'sparks';
export type PyroStyleV891='auto'|Exclude<PyroTypeV891,'none'>;
export type PyroModeV891='cinematic'|'balanced'|'festival';
export interface PyroSettingsV891 {
 enabled:boolean;style:PyroStyleV891;mode:PyroModeV891;
 intensity:number;protectLyrics:boolean;flames:boolean;jets:boolean;sparks:boolean;
}
export const PYRO_STORAGE_KEY_V891='sonic-virtual-pyrotechnics-v891';
export const DEFAULT_PYRO_V891:Readonly<PyroSettingsV891>={
 enabled:false,style:'auto',mode:'cinematic',intensity:60,
 protectLyrics:true,flames:true,jets:true,sparks:true,
};
const modes:readonly PyroModeV891[]=['cinematic','balanced','festival'];
const styles:readonly PyroStyleV891[]=['auto','flames','jets','sparks'];
const finite=(x:unknown):x is number=>typeof x==='number'&&Number.isFinite(x);
const clamp=(v:number,a=0,b=1)=>Math.min(b,Math.max(a,v));
export function normalizePyroV891(raw:unknown):PyroSettingsV891 {
 const s=raw&&typeof raw==='object'&&!Array.isArray(raw)?raw as Partial<PyroSettingsV891>:{};
 return {enabled:typeof s.enabled==='boolean'?s.enabled:false,
  style:styles.includes(s.style as PyroStyleV891)?s.style as PyroStyleV891:'auto',
  mode:modes.includes(s.mode as PyroModeV891)?s.mode as PyroModeV891:'cinematic',
  intensity:finite(s.intensity)?Math.round(clamp(s.intensity,0,100)):60,
  protectLyrics:typeof s.protectLyrics==='boolean'?s.protectLyrics:true,
  flames:typeof s.flames==='boolean'?s.flames:true,
  jets:typeof s.jets==='boolean'?s.jets:true,
  sparks:typeof s.sparks==='boolean'?s.sparks:true};
}
export function suggestedPyroV891(section:string,genre:string):PyroTypeV891 {
 const g=genre.toLowerCase();
 if(section==='build')return 'jets';
 if(section==='drop')return /hardtekk|hardstyle|hardcore|techno|rock|metal|industrial/.test(g)?'flames':'jets';
 if(section==='hook')return /pop|dream|ambient/.test(g)?'jets':'sparks';
 if(section==='finale')return 'sparks';
 return 'none';
}
export interface PyroCueV891 {
 active:boolean;kind:PyroTypeV891;sceneIndex:number;section:string;label:string;
 /** Hard caps: [0,0.65]; never used as illumination or hardware signal. */
 opacity:number;phase:number;count:number;
}
export const PYRO_OFF_V891:Readonly<PyroCueV891>={
 active:false,kind:'none',sceneIndex:-1,section:'',label:'',opacity:0,phase:0,count:0,
};
export interface PyroInputV891 {
 settings:PyroSettingsV891;plan?:AtmospherePlanV885|null;
 trackId:string;durationMs:number;positionMs:number;genre:string;
 playing:boolean;autoEnabled:boolean;reducedMotion:boolean;seekBlocked?:boolean;
 blackout?:boolean;manualLighting?:boolean;manualFx?:boolean;authoredParticles?:boolean;
 lyricsProtected?:boolean;vocalFocus?:boolean;
 tier:'low'|'balanced'|'high';existingCo2?:boolean;
}
const permitted=(k:PyroTypeV891,section:string)=>k==='jets'?
 ['build','hook','drop','finale'].includes(section):k==='flames'?
 ['drop','finale'].includes(section):k==='sparks'?
 ['hook','drop','finale'].includes(section):false;
function sceneAt(plan:AtmospherePlanV885,positionMs:number):AtmosphereSceneV885|null {
 let low=0,high=plan.scenes.length-1;
 while(low<=high){const mid=(low+high)>>>1,s=plan.scenes[mid];
  if(positionMs<s.startMs)high=mid-1;
  else if(positionMs>=s.endMs)low=mid+1;
  else return s;
 }return null;
}
export function planPyroV891(i:PyroInputV891):PyroCueV891 {
 const s=i.settings,p=i.plan;
 if(!s.enabled||s.intensity<=0||!i.playing||!i.autoEnabled||i.reducedMotion||
  i.seekBlocked||i.blackout||i.manualLighting||i.manualFx||i.authoredParticles||
  i.tier==='low'||(s.protectLyrics&&(i.lyricsProtected||i.vocalFocus))||
  !finite(i.durationMs)||i.durationMs<10000||i.durationMs>1800000||
  !finite(i.positionMs)||i.positionMs<0||i.positionMs>=i.durationMs||
  !p||p.source!=='verified-v604'||p.trackId!==i.trackId||p.durationMs!==i.durationMs||
  !i.trackId)return {...PYRO_OFF_V891};
 const scene=sceneAt(p,i.positionMs);
 if(!scene)return {...PYRO_OFF_V891};
 const kind=s.style==='auto'?suggestedPyroV891(scene.section,i.genre):s.style;
 if(!permitted(kind,scene.section))return {...PYRO_OFF_V891};
 if((kind==='flames'&&!s.flames)||(kind==='jets'&&!s.jets)||(kind==='sparks'&&!s.sparks))
  return {...PYRO_OFF_V891};
 // Existing V844 CO2 has priority: do not emit a second CO2 system on top of it.
 if(kind==='jets'&&i.existingCo2)return {...PYRO_OFF_V891};
 const duration=scene.endMs-scene.startMs;
 if(duration<1600)return {...PYRO_OFF_V891};
 // One scripted accent per validated scene; never loop every beat/frame.
 const start=scene.startMs+Math.min(850,duration*.12);
 const age=i.positionMs-start;
 const life=kind==='jets'?2400:kind==='sparks'?2100:1850;
 if(age<0||age>=Math.min(life,scene.endMs-start))return {...PYRO_OFF_V891};
 const phase=clamp(age/life);
 const envelope=Math.min(1,age/240,(life-age)/650);
 const mode=s.mode==='festival'?1:s.mode==='balanced'?.8:.65;
 const quality=i.tier==='balanced'?.65:1;
 const opacity=clamp(envelope*(s.intensity/100)*mode*quality,0,.65);
 const max=kind==='sparks'?18:kind==='jets'?14:6;
 const count=Math.min(max,Math.max(0,Math.floor(max*mode*quality)));
 if(opacity<=.002||count<2)return {...PYRO_OFF_V891};
 return {active:true,kind,sceneIndex:scene.index,section:scene.section,
  label:(kind==='flames'?'Virtuelle Flammen':kind==='jets'?'CO₂-Jets':'Funkenfontänen')+' · '+scene.section,
  opacity,phase,count};
}
export function exportPyroPlanV891(plan:AtmospherePlanV885|null|undefined,settings:PyroSettingsV891,genre:string):string|null {
 if(!plan||plan.source!=='verified-v604'||!plan.trackId||!plan.scenes.length)return null;
 return JSON.stringify({schema:'sonic-virtual-pyrotechnics-v891',version:1,
  note:'Ausschließlich virtuelle 3D-Effekte, keine Pyrotechnik, Hardwaresteuerung oder Stroboskope.',
  trackId:plan.trackId,durationMs:plan.durationMs,source:plan.source,
  settings:normalizePyroV891(settings),
  cues:plan.scenes.map(sc=>({sceneIndex:sc.index,section:sc.section,startMs:sc.startMs,
   endMs:sc.endMs,kind:settings.style==='auto'?suggestedPyroV891(sc.section,genre):
    permitted(settings.style,sc.section)?settings.style:'none'}))},null,2);
}
