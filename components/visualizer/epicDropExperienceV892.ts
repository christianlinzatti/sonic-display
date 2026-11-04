/** V892 – one verified, song-scoped drop conductor, not an audio onset detector.
 * Only modulates existing enabled renderers. Never creates a camera, light,
 * strobe, physical pyro command, timer or additional frame-loop allocations.
 */
import type {ConcertMomentsPlanV883,ConcertMomentV883} from './intelligentConcertMomentsV883';
export type EpicStyleV892='cinematic'|'balanced'|'festival';
export interface EpicDropSettingsV892 {
 enabled:boolean;style:EpicStyleV892;intensity:number;protectLyrics:boolean;
 stage:boolean;led:boolean;laser:boolean;spotlight:boolean;pyro:boolean;dance:boolean;camera:boolean;
}
export const EPIC_DROP_KEY_V892='sonic-epic-drop-experience-v892';
export const DEFAULT_EPIC_DROP_V892:Readonly<EpicDropSettingsV892>={
 enabled:true,style:'balanced',intensity:65,protectLyrics:true,
 stage:true,led:true,laser:true,spotlight:true,pyro:true,dance:true,camera:true,
};
const styles:readonly EpicStyleV892[]=['cinematic','balanced','festival'];
const finite=(n:unknown):n is number=>typeof n==='number'&&Number.isFinite(n);
const clamp=(n:number,min=0,max=1)=>Math.min(max,Math.max(min,n));
export function normalizeEpicDropV892(raw:unknown):EpicDropSettingsV892 {
 const r=raw&&typeof raw==='object'&&!Array.isArray(raw)?raw as Partial<EpicDropSettingsV892>:{};
 const bool=(k:keyof EpicDropSettingsV892)=>typeof r[k]==='boolean'?r[k] as boolean:DEFAULT_EPIC_DROP_V892[k] as boolean;
 return {enabled:bool('enabled'),style:styles.includes(r.style as EpicStyleV892)?r.style as EpicStyleV892:'balanced',
  intensity:finite(r.intensity)?Math.round(clamp(r.intensity,0,100)):65,
  protectLyrics:bool('protectLyrics'),stage:bool('stage'),led:bool('led'),laser:bool('laser'),
  spotlight:bool('spotlight'),pyro:bool('pyro'),dance:bool('dance'),camera:bool('camera')};
}
export interface EpicDropBeatV892 {
 id:string;sceneIndex:number;kind:'drop'|'finale';startMs:number;endMs:number;label:string;
}
export interface EpicDropPlanV892 {
 trackId:string;durationMs:number;source:'verified-v604'|'unavailable';beats:readonly EpicDropBeatV892[];
}
export function buildEpicDropPlanV892(plan:ConcertMomentsPlanV883):EpicDropPlanV892 {
 const off:EpicDropPlanV892={trackId:plan.trackId,durationMs:plan.durationMs,source:'unavailable',beats:[]};
 if(plan.source!=='verified-v604'||!plan.trackId||!finite(plan.durationMs)||plan.durationMs<10000||plan.durationMs>1800000)return off;
 const beats:EpicDropBeatV892[]=[];
 for(const m of plan.moments){
  if((m.kind!=='drop'&&m.kind!=='finale')||!Number.isInteger(m.sceneIndex)||m.sceneIndex<0||
   !finite(m.startMs)||!finite(m.endMs)||m.startMs<0||m.endMs>plan.durationMs||
   m.endMs-m.startMs<1800||typeof m.id!=='string'||m.id.length>80)continue;
  // Never place a drop inside another selected cue; V883 already spaces them.
  if(beats.some(b=>Math.abs(b.startMs-m.startMs)<6500))continue;
  beats.push({id:m.id,sceneIndex:m.sceneIndex,kind:m.kind,startMs:m.startMs,
   endMs:m.endMs,label:m.label.slice(0,80)});
 }
 beats.sort((a,b)=>a.startMs-b.startMs);
 return {trackId:plan.trackId,durationMs:plan.durationMs,source:'verified-v604',beats};
}
export type EpicDropPhaseV892='idle'|'impact'|'drive'|'release';
export interface EpicDropCueV892 {
 active:boolean;id:string;kind:'drop'|'finale'|null;phase:EpicDropPhaseV892;power:number;
 ringGain:number;ledGain:number;laserGain:number;spotlightGain:number;pyroGain:number;
 danceGain:number;cameraRate:number;label:string;
}
export const EPIC_DROP_OFF_V892:Readonly<EpicDropCueV892>={active:false,id:'',kind:null,phase:'idle',power:0,
 ringGain:1,ledGain:1,laserGain:1,spotlightGain:1,pyroGain:1,danceGain:1,cameraRate:1,label:''};
export interface EpicDropInputV892 {
 plan?:EpicDropPlanV892|null;settings:EpicDropSettingsV892;
 trackId:string;durationMs:number;positionMs:number;playing:boolean;autoEnabled:boolean;
 reducedMotion:boolean;tier:'low'|'balanced'|'high';seekBlocked?:boolean;blackout?:boolean;
 manualFx?:boolean;manualLighting?:boolean;manualCamera?:boolean;manualDance?:boolean;
 lyricsProtected?:boolean;vocalFocus?:boolean;
}
export function sampleEpicDropV892(i:EpicDropInputV892):EpicDropCueV892 {
 const s=i.settings,p=i.plan;
 if(!s.enabled||s.intensity<=0||!i.autoEnabled||!i.playing||i.reducedMotion||
  i.seekBlocked||i.blackout||i.manualFx||i.tier==='low'||!p||!i.trackId||
  p.source!=='verified-v604'||p.trackId!==i.trackId||p.durationMs!==i.durationMs||
  !finite(i.durationMs)||i.durationMs<10000||i.durationMs>1800000||
  !finite(i.positionMs)||i.positionMs<0||i.positionMs>=i.durationMs)return {...EPIC_DROP_OFF_V892};
 const beat=p.beats.find(b=>i.positionMs>=b.startMs&&i.positionMs<Math.min(b.endMs,b.startMs+(b.kind==='finale'?4700:3600)));
 if(!beat)return {...EPIC_DROP_OFF_V892};
 const age=i.positionMs-beat.startMs;
 const lifetime=Math.min(beat.kind==='finale'?4700:3600,beat.endMs-beat.startMs);
 const rise=clamp(age/250),fall=clamp((lifetime-age)/800);
 const envelope=rise*rise*(3-2*rise)*fall*fall*(3-2*fall);
 const genreGain=s.style==='festival'?1:s.style==='balanced'?.78:.54;
 const tierGain=i.tier==='balanced'?.68:1;
 // Lyrics/facial performance are protected by quieter visuals, not a full
 // cancellation of the musical moment. Camera and follow-spot stay neutral.
 const protectedFrame=s.protectLyrics&&(i.lyricsProtected||i.vocalFocus);
 const power=clamp(envelope*genreGain*tierGain*(s.intensity/100)*(protectedFrame?.38:1));
 if(power<.005)return {...EPIC_DROP_OFF_V892};
 const phase:EpicDropPhaseV892=age<700?'impact':age<2100?'drive':'release';
 const lightsSafe=!i.manualLighting;
 const flashFreeImpact=phase==='impact'?1:phase==='drive'?.75:.38;
 const drive=phase==='impact'?.45:phase==='drive'?1:.58;
 return {active:true,id:beat.id,kind:beat.kind,phase,power,label:beat.label,
  ringGain:s.stage?1+.30*power*flashFreeImpact:1,
  ledGain:s.led&&lightsSafe?1+.20*power*flashFreeImpact:1,
  laserGain:s.laser&&lightsSafe?1+.20*power*drive:1,
  spotlightGain:s.spotlight&&lightsSafe&&!protectedFrame?1+.10*power*drive:1,
  pyroGain:s.pyro&&lightsSafe?1+.13*power*drive:1,
  danceGain:s.dance&&!i.manualDance?1+.07*power*drive:1,
  cameraRate:s.camera&&!i.manualCamera&&!protectedFrame?1-.23*power:1};
}
export function exportEpicDropPlanV892(plan:EpicDropPlanV892,settings:EpicDropSettingsV892):string|null {
 if(plan.source!=='verified-v604'||!plan.trackId||!plan.beats.length)return null;
 return JSON.stringify({schema:'sonic-epic-drop-experience-v892',version:1,
  note:'Konzertregie auf Basis bestätigter V604-Szenen. Keine Beat-Erkennung, Hardware-Pyro oder zusätzlichen Blitze.',
  trackId:plan.trackId,durationMs:plan.durationMs,source:plan.source,
  settings:normalizeEpicDropV892(settings),beats:plan.beats},null,2);
}
