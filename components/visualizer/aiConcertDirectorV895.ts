/** V895 – evidence-gated, deterministic full-song concert director.
 * "AI" here means rule-based automated dramaturgy, NOT an LLM, source separation,
 * singer identification or fabricated beats. Existing V604 verified scenes are the
 * only authority. Gain multipliers only touch already enabled systems.
 */
import type {AtmospherePlanV885} from './dynamicConcertAtmosphereV885';

export type DirectorStyleV895='cinematic'|'balanced'|'festival';
export type DirectorFocusV895='performer'|'lyrics'|'ensemble'|'stage'|'impact';
export interface DirectorSettingsV895 {
 enabled:boolean;style:DirectorStyleV895;intensity:number;protectLyrics:boolean;
 camera:boolean;dance:boolean;lights:boolean;led:boolean;stage:boolean;
}
export const DIRECTOR_KEY_V895='sonic-ai-concert-director-v895';
export const DEFAULT_DIRECTOR_V895:Readonly<DirectorSettingsV895>={
 enabled:true,style:'balanced',intensity:60,protectLyrics:true,
 camera:true,dance:true,lights:true,led:true,stage:true,
};
const styles:readonly DirectorStyleV895[]=['cinematic','balanced','festival'];
const allowed=new Set(['intro','verse','hook','build','drop','break','finale','outro']);
const finite=(n:unknown):n is number=>typeof n==='number'&&Number.isFinite(n);
const clamp=(n:number,a:number,b:number)=>Math.max(a,Math.min(b,n));
const smooth=(n:number)=>{const v=clamp(n,0,1);return v*v*(3-2*v);};
export function normalizeDirectorV895(raw:unknown):DirectorSettingsV895 {
 const v=raw&&typeof raw==='object'&&!Array.isArray(raw)?raw as Partial<DirectorSettingsV895>:{};
 const yes=(key:keyof DirectorSettingsV895)=>typeof v[key]==='boolean'?v[key] as boolean:DEFAULT_DIRECTOR_V895[key] as boolean;
 return {enabled:yes('enabled'),style:styles.includes(v.style as DirectorStyleV895)?v.style as DirectorStyleV895:'balanced',
  intensity:finite(v.intensity)?Math.round(clamp(v.intensity,0,100)):60,
  protectLyrics:yes('protectLyrics'),camera:yes('camera'),dance:yes('dance'),lights:yes('lights'),
  led:yes('led'),stage:yes('stage')};
}
export interface DirectorSceneV895 {
 index:number;startMs:number;endMs:number;section:string;focus:DirectorFocusV895;
 label:string;reason:string;
}
export interface DirectorPlanV895 {
 trackId:string;durationMs:number;source:'verified-v604'|'unavailable';scenes:readonly DirectorSceneV895[];
}
/** Alternate portrait and lyric-centric verse scenes without erasing verified intent.
 * This is a role for *visual composition*, never a claim of speaker identity. */
export function buildDirectorPlanV895(source:AtmospherePlanV885|null|undefined):DirectorPlanV895 {
 const trackId=source?.trackId??'',durationMs=source?.durationMs??0;
 const unavailable:DirectorPlanV895={trackId,durationMs,source:'unavailable',scenes:[]};
 if(source?.source!=='verified-v604'||typeof trackId!=='string'||!trackId||trackId.length>160||
  !finite(durationMs)||durationMs<10000||durationMs>1800000||!Array.isArray(source.scenes))return unavailable;
 const scenes:DirectorSceneV895[]=[];
 let lastFocus:DirectorFocusV895|null=null;
 for(const s of source.scenes){
  if(!Number.isInteger(s.index)||s.index<0||!finite(s.startMs)||!finite(s.endMs)||
   s.startMs<0||s.endMs>durationMs||s.endMs<=s.startMs||!allowed.has(s.section)||
   typeof s.intent!=='string'||s.intent.length>80)continue;
  if(scenes.length&&s.startMs<scenes[scenes.length-1].endMs)continue;
  let focus:DirectorFocusV895;
  if(s.section==='drop'||s.section==='finale')focus='impact';
  else if(s.section==='hook')focus='ensemble';
  else if(s.section==='build'||s.section==='intro')focus='stage';
  else if(s.section==='break'||s.section==='outro'||s.intent==='breath'||s.intent==='dialogue')focus='lyrics';
  else focus=lastFocus==='performer'?'lyrics':'performer';
  // The musical section owns the direction; never invent a new drop.
  const labels:Record<DirectorFocusV895,string>={performer:'Künstlerfokus',lyrics:'Lyrics & Ruhe',ensemble:'Ensemble',stage:'Bühnenaufbau',impact:'Show-Höhepunkt'};
  scenes.push({index:s.index,startMs:s.startMs,endMs:s.endMs,section:s.section,focus,
   label:labels[focus],reason:`Bestätigter Songabschnitt: ${s.section}`});
  lastFocus=focus;
  if(scenes.length>=64)break;
 }
 return scenes.length?{trackId,durationMs,source:'verified-v604',scenes}:unavailable;
}
export interface DirectorCueV895 {
 active:boolean;sceneIndex:number;section:string;focus:DirectorFocusV895|null;
 label:string;cameraRate:number;danceGain:number;lightGain:number;ledGain:number;stageGain:number;
}
export const DIRECTOR_OFF_V895:Readonly<DirectorCueV895>={active:false,sceneIndex:-1,section:'',focus:null,label:'',
 cameraRate:1,danceGain:1,lightGain:1,ledGain:1,stageGain:1};
export interface DirectorInputV895 {
 plan?:DirectorPlanV895|null;settings:DirectorSettingsV895;
 trackId:string;durationMs:number;positionMs:number;playing:boolean;autoEnabled:boolean;
 tier:'low'|'balanced'|'high';reducedMotion:boolean;seekBlocked?:boolean;blackout?:boolean;
 manualCamera?:boolean;manualDance?:boolean;manualLighting?:boolean;manualFx?:boolean;
 lyricsProtected?:boolean;lyricsVisible?:boolean;vocalFocus?:boolean;
}
/** Multipliers remain neutral at boundaries, on user overrides, or without evidence.
 * The director never creates a render object, changes a camera target or enables FX. */
export function sampleDirectorV895(i:DirectorInputV895):DirectorCueV895 {
 const p=i.plan,s=i.settings;
 if(!s.enabled||s.intensity<=0||!i.autoEnabled||!i.playing||i.reducedMotion||i.seekBlocked||
  i.blackout||i.manualFx||i.tier==='low'||!p||p.source!=='verified-v604'||
  !i.trackId||p.trackId!==i.trackId||p.durationMs!==i.durationMs||
  !finite(i.durationMs)||i.durationMs<10000||i.durationMs>1800000||
  !finite(i.positionMs)||i.positionMs<0||i.positionMs>=i.durationMs||
  (!s.camera&&!s.dance&&!s.lights&&!s.led&&!s.stage))return DIRECTOR_OFF_V895;
 const scene=p.scenes.find(x=>i.positionMs>=x.startMs&&i.positionMs<x.endMs);
 if(!scene)return DIRECTOR_OFF_V895;
 const age=i.positionMs-scene.startMs;
 const fadeMs=s.style==='cinematic'?2900:s.style==='festival'?1000:1800;
 const envelope=smooth(age/fadeMs)*smooth((scene.endMs-i.positionMs)/Math.max(700,fadeMs*.5));
 const tierGain=i.tier==='balanced'?.72:1;
 const styleGain=s.style==='festival'?1:s.style==='cinematic'?.65:.82;
 const mix=envelope*clamp(s.intensity/100,0,1)*tierGain*styleGain;
 const base:Record<DirectorFocusV895,readonly [number,number,number,number,number]>={
  performer:[.91,.97,1.055,.86,.91],lyrics:[.87,.90,.90,.77,.80],
  ensemble:[1.065,1.065,1.04,1.075,1.045],stage:[1.045,.99,1.025,1.105,1.065],
  impact:[.92,1.05,1.06,1.11,1.09],
 };
 const [camera,dance,lights,led,stage]=base[scene.focus];
 const lyricsPriority=s.protectLyrics&&(i.lyricsProtected||i.lyricsVisible||i.vocalFocus);
 const adjust=(v:number,strength=mix)=>clamp(1+(v-1)*strength,.75,1.12);
 const cameraRate=s.camera&&!i.manualCamera&&!lyricsPriority?adjust(camera):1;
 const danceGain=s.dance&&!i.manualDance?adjust(dance,lyricsPriority?mix*.45:mix):1;
 const lightGain=s.lights&&!i.manualLighting&&!lyricsPriority?adjust(lights):1;
 const ledGain=s.led&&!i.manualLighting?adjust(led,lyricsPriority?mix*.35:mix):1;
 const stageGain=s.stage?adjust(stage,lyricsPriority?mix*.35:mix):1;
 return {active:mix>.002,sceneIndex:scene.index,section:scene.section,focus:scene.focus,
  label:scene.label,cameraRate,danceGain,lightGain,ledGain,stageGain};
}
export function exportDirectorV895(plan:DirectorPlanV895,settings:DirectorSettingsV895):string|null {
 if(plan.source!=='verified-v604'||!plan.trackId||!plan.scenes.length)return null;
 return JSON.stringify({schema:'sonic-ai-concert-director-v895',version:1,trackId:plan.trackId,
  durationMs:plan.durationMs,source:plan.source,settings:normalizeDirectorV895(settings),scenes:plan.scenes,
  note:'Regelbasierte virtuelle Show-Regie aus bestätigten Songabschnitten. Keine generative KI, Beat-/Sänger-Erkennung oder Hardwaresteuerung.'},null,2);
}
