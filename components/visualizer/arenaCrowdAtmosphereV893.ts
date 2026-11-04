/** V893 – Arena Crowd Atmosphere. Read-only artistic modulation of V815–V880.
 * No new crowd rigs, draw calls, music detection, timers, or external devices.
 * Existing FX authorization, song-scoped verified V604 scenes, manual controls,
 * lyrics/camera protection and the V825 performance governor always win.
 */
import type {VirtualCrowdCueV815} from './virtualConcertCrowdPlannerV815';
import type {AtmospherePlanV885} from './dynamicConcertAtmosphereV885';

export type ArenaCrowdStyleV893='auto'|'cinematic'|'balanced'|'festival';
export interface ArenaCrowdSettingsV893 {
 enabled:boolean;style:ArenaCrowdStyleV893;intensity:number;
 phones:boolean;waves:boolean;silhouettes:boolean;protectLyrics:boolean;
}
export const ARENA_CROWD_KEY_V893='sonic-arena-crowd-v893';
export const DEFAULT_ARENA_CROWD_V893:Readonly<ArenaCrowdSettingsV893>={
 enabled:true,style:'auto',intensity:60,phones:true,waves:true,silhouettes:true,protectLyrics:true,
};
const styles:readonly ArenaCrowdStyleV893[]=['auto','cinematic','balanced','festival'];
const finite=(n:unknown):n is number=>typeof n==='number'&&Number.isFinite(n);
const unit=(n:number)=>Math.min(1,Math.max(0,n));
export function normalizeArenaCrowdV893(raw:unknown):ArenaCrowdSettingsV893 {
 const r=raw&&typeof raw==='object'&&!Array.isArray(raw)?raw as Partial<ArenaCrowdSettingsV893>:{};
 const flag=(name:keyof ArenaCrowdSettingsV893,defaultValue:boolean)=>
  typeof r[name]==='boolean'?r[name] as boolean:defaultValue;
 return {enabled:flag('enabled',true),style:styles.includes(r.style as ArenaCrowdStyleV893)?r.style as ArenaCrowdStyleV893:'auto',
  intensity:finite(r.intensity)?Math.round(Math.max(0,Math.min(100,r.intensity))):60,
  phones:flag('phones',true),waves:flag('waves',true),silhouettes:flag('silhouettes',true),
  protectLyrics:flag('protectLyrics',true)};
}
export interface ArenaCrowdSceneV893 {index:number;startMs:number;endMs:number;section:string;intent:string;look:string}
export interface ArenaCrowdPlanV893 {trackId:string;durationMs:number;source:'verified-v604'|'unavailable';scenes:readonly ArenaCrowdSceneV893[]}
const allowedSections=new Set(['intro','verse','hook','build','drop','break','finale','outro']);
export function buildArenaCrowdPlanV893(atmosphere:AtmospherePlanV885|null|undefined):ArenaCrowdPlanV893 {
 const trackId=atmosphere?.trackId??'',durationMs=atmosphere?.durationMs??0;
 const off:ArenaCrowdPlanV893={trackId,durationMs,source:'unavailable',scenes:[]};
 if(atmosphere?.source!=='verified-v604'||typeof trackId!=='string'||!trackId||trackId.length>160||
  !finite(durationMs)||durationMs<10000||durationMs>1800000)return off;
 const scenes:ArenaCrowdSceneV893[]=[];
 for(const sc of atmosphere.scenes){
  if(!Number.isInteger(sc.index)||sc.index<0||!finite(sc.startMs)||!finite(sc.endMs)||
   sc.startMs<0||sc.endMs>durationMs||sc.endMs<=sc.startMs||
   !allowedSections.has(sc.section)||typeof sc.intent!=='string'||sc.intent.length>80)continue;
  if(scenes.length&&sc.startMs<scenes[scenes.length-1].endMs)continue;
  scenes.push({index:sc.index,startMs:sc.startMs,endMs:sc.endMs,
   section:sc.section,intent:sc.intent,look:sc.name.slice(0,64)});
  if(scenes.length>=64)break;
 }
 return scenes.length?{trackId,durationMs,source:'verified-v604',scenes}:off;
}
export type ArenaCrowdCueV893=VirtualCrowdCueV815&Readonly<{
 arenaActiveV893:boolean;arenaWaveV893:number;arenaPhonePulseV893:number;
 arenaSilhouetteV893:number;arenaPhaseV893:number;arenaMoodV893:string;
}>;
export const ARENA_CROWD_OFF_V893:Readonly<Pick<ArenaCrowdCueV893,'arenaActiveV893'|'arenaWaveV893'|'arenaPhonePulseV893'|'arenaSilhouetteV893'|'arenaPhaseV893'|'arenaMoodV893'>>={
 arenaActiveV893:false,arenaWaveV893:0,arenaPhonePulseV893:0,arenaSilhouetteV893:0,arenaPhaseV893:0,arenaMoodV893:'off',
};
export interface ArenaCrowdInputV893 {
 base:VirtualCrowdCueV815;plan?:ArenaCrowdPlanV893|null;settings:ArenaCrowdSettingsV893;
 trackId:string;durationMs:number;positionMs:number;playing:boolean;autoEnabled:boolean;
 tier:'low'|'balanced'|'high';reducedMotion:boolean;seekBlocked?:boolean;
 blackout?:boolean;manualLighting?:boolean;manualFx?:boolean;lyricsProtected?:boolean;
 lyricsVisible?:boolean;vocalFocus?:boolean;manualCamera?:boolean;
 genre?:string|null;energy?:number;kick?:number;
}
const sectionGain:Readonly<Record<string,number>>={intro:.28,verse:.36,hook:.88,build:.60,drop:1,break:.12,finale:.94,outro:.18};
/** Sample one verified song-time scene; outputs keep every V815 authorized lane in bounds.
 * A disabled phone/arm/density lane can never be re-enabled by this planner.
 */
export function planArenaCrowdV893(i:ArenaCrowdInputV893):ArenaCrowdCueV893 {
 const b=i.base,s=i.settings,p=i.plan;
 const off=():ArenaCrowdCueV893=>({...b,...ARENA_CROWD_OFF_V893});
 if(!s.enabled||s.intensity<=0||!i.autoEnabled||!i.playing||i.reducedMotion||i.seekBlocked||
  i.blackout||i.manualLighting||i.manualFx||i.manualCamera||i.tier==='low'||!b.active||b.count<2||b.count>72||
  !Number.isInteger(b.count)||!p||p.source!=='verified-v604'||!i.trackId||
  p.trackId!==i.trackId||p.durationMs!==i.durationMs||
  !finite(i.durationMs)||!finite(i.positionMs)||i.positionMs<0||i.positionMs>=i.durationMs||
  ![b.movement,b.phoneOpacity,b.lightGain,b.phase,b.count].every(Number.isFinite))return off();
 const scene=p.scenes.find(sc=>i.positionMs>=sc.startMs&&i.positionMs<sc.endMs);
 if(!scene)return off();
 const quiet=['breath','portrait','dialogue'].includes(scene.intent)||scene.section==='break'||scene.section==='outro';
 const protectedFrame=s.protectLyrics&&(i.lyricsProtected||i.lyricsVisible||i.vocalFocus);
 const resolvedStyle=s.style==='auto'?
  /tekk|hardstyle|hardcore|edm/i.test(i.genre??'')?'festival':/rock|metal/i.test(i.genre??'')?'balanced':'cinematic':s.style;
 const style=resolvedStyle==='festival'?1:resolvedStyle==='balanced'?.78:.52;
 const baseEnergy=finite(i.energy)?unit(i.energy):.4;
 const kick=finite(i.kick)?unit(i.kick):.25;
 const age=i.positionMs-scene.startMs;
 const fade=unit(age/1100)*unit((scene.endMs-i.positionMs)/900);
 const gain=unit(s.intensity/100)*style*(sectionGain[scene.section]??0)*
  (quiet?.38:1)*(protectedFrame?.27:1)*(i.tier==='balanced'?.66:1)*
  (.68+.2*baseEnergy+.12*kick)*fade;
 if(gain<.001)return off();
 // The original V815 phone/arm controls and performance caps MUST remain the authority.
 const phone=s.phones&&b.phoneOpacity>0?gain*unit(b.phoneOpacity/.34):0;
 const wave=s.waves&&b.movement>0?gain*unit(b.movement/.22):0;
 const silhouette=s.silhouettes&&b.lightGain>0?gain*unit(b.lightGain/.25):0;
 return {...b,arenaActiveV893:true,arenaMoodV893:scene.section,
  arenaWaveV893:Math.min(.25,wave*.25),arenaPhonePulseV893:Math.min(.55,phone*.55),
  arenaSilhouetteV893:Math.min(.16,silhouette*.16),
  arenaPhaseV893:((i.positionMs-scene.startMs)/1000)*(resolvedStyle==='festival'?2.2:resolvedStyle==='balanced'?1.5:.9),
  phoneOpacity:Math.min(.38,b.phoneOpacity*(1+.26*phone)),
  movement:Math.min(.22,b.movement*(1+.12*wave)),
  lightGain:Math.min(.25,b.lightGain*(1+.10*silhouette))};
}
export function exportArenaCrowdV893(plan:ArenaCrowdPlanV893,settings:ArenaCrowdSettingsV893):string|null {
 if(plan.source!=='verified-v604'||!plan.trackId||!plan.scenes.length)return null;
 return JSON.stringify({schema:'sonic-arena-crowd-v893',version:1,trackId:plan.trackId,
  durationMs:plan.durationMs,source:plan.source,settings:normalizeArenaCrowdV893(settings),scenes:plan.scenes,
  note:'Nur virtuelle V815-Instanzen und bestätigte V604-Szenen; keine Audio- oder Publikums-Erkennung.'},null,2);
}
