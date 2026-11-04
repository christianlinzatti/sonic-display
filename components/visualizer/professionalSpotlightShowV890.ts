/** V890 – Professional Spotlight Show.
 * Deterministic reductions/aim accents on existing V308 spotlights + beam cones.
 * No extra lights, shadow maps, postprocessing, strobe or singer attribution.
 * A VERIFIED V604 timeline and the active V882 song-scoped signal are required.
 */
import type {AtmospherePlanV885,AtmosphereSceneV885} from './dynamicConcertAtmosphereV885';

export type SpotlightStyleV890='auto'|'portrait'|'follow'|'fan'|'cross';
export type SpotlightMoodV890='auto'|'noir'|'electric'|'arena'|'dream';
export interface SpotlightSettingsV890 {
 enabled:boolean;style:SpotlightStyleV890;mood:SpotlightMoodV890;
 intensity:number;followArtists:boolean;protectLyrics:boolean;softTransitions:boolean;
}
export const SPOTLIGHT_STORAGE_KEY_V890='sonic-professional-spotlight-v890';
export const DEFAULT_SPOTLIGHT_V890:Readonly<SpotlightSettingsV890>={
 enabled:true,style:'auto',mood:'auto',intensity:70,followArtists:true,
 protectLyrics:true,softTransitions:true,
};
const styles:readonly SpotlightStyleV890[]=['auto','portrait','follow','fan','cross'];
const moods:readonly SpotlightMoodV890[]=['auto','noir','electric','arena','dream'];
const finite=(n:unknown):n is number=>typeof n==='number'&&Number.isFinite(n);
const clamp=(n:number,a=0,b=1)=>Math.max(a,Math.min(b,n));
export function normalizeSpotlightV890(raw:unknown):SpotlightSettingsV890 {
 const s=raw&&typeof raw==='object'&&!Array.isArray(raw)?raw as Partial<SpotlightSettingsV890>:{};
 return {
  enabled:typeof s.enabled==='boolean'?s.enabled:true,
  style:styles.includes(s.style as SpotlightStyleV890)?s.style as SpotlightStyleV890:'auto',
  mood:moods.includes(s.mood as SpotlightMoodV890)?s.mood as SpotlightMoodV890:'auto',
  intensity:finite(s.intensity)?Math.round(clamp(s.intensity,0,100)):70,
  followArtists:typeof s.followArtists==='boolean'?s.followArtists:true,
  protectLyrics:typeof s.protectLyrics==='boolean'?s.protectLyrics:true,
  softTransitions:typeof s.softTransitions==='boolean'?s.softTransitions:true,
 };
}
export function spotlightMoodV890(genre:string,mood:SpotlightMoodV890):Exclude<SpotlightMoodV890,'auto'> {
 if(mood!=='auto')return mood;
 const g=genre.toLowerCase();
 if(/hardtekk|hardstyle|hardcore|techno/.test(g))return 'electric';
 if(/deutschrap|hip.?hop|\brap\b|trap/.test(g))return 'noir';
 if(/rock|metal|industrial|ndh|punk/.test(g))return 'arena';
 return 'dream';
}
export function suggestedSpotlightV890(section:string,intent:string,genre:string):Exclude<SpotlightStyleV890,'auto'> {
 const g=spotlightMoodV890(genre,'auto');
 if(section==='break'||intent==='portrait'||intent==='breath')return 'portrait';
 if(section==='verse')return 'follow';
 if(section==='build')return 'cross';
 if(section==='drop')return g==='noir'?'cross':'fan';
 if(section==='hook'||section==='finale')return 'fan';
 return 'portrait';
}
export interface SpotlightCueV890 {
 active:boolean;style:Exclude<SpotlightStyleV890,'auto'>|null;
 sceneIndex:number;section:string;label:string;
 /** Multipliers never exceed existing V308 spotlight/beam budgets. */
 leftGain:number;rightGain:number;beamGain:number;
 /** Existing spot angle; V308 default is 0.30 radians. */
 angle:number;leftShift:number;rightShift:number;follow:boolean;
}
export const SPOTLIGHT_OFF_V890:Readonly<SpotlightCueV890>={
 active:false,style:null,sceneIndex:-1,section:'',label:'',
 leftGain:1,rightGain:1,beamGain:1,angle:.30,leftShift:0,rightShift:0,follow:false,
};
export interface SpotlightInputV890 {
 settings:SpotlightSettingsV890;plan?:AtmospherePlanV885|null;
 trackId:string;durationMs:number;positionMs:number;playing:boolean;
 autoEnabled:boolean;reducedMotion:boolean;seekBlocked?:boolean;blackout?:boolean;
 manualLighting?:boolean;manualFx?:boolean;lyricsProtected?:boolean;
 tier:'low'|'balanced'|'high';stageSpots:boolean;beams:boolean;
 groupCount:number;genre:string;existingGain:number;
}
function activeScene(plan:AtmospherePlanV885,pos:number):AtmosphereSceneV885|null {
 let lo=0,hi=plan.scenes.length-1;
 while(lo<=hi){const mid=(lo+hi)>>>1,s=plan.scenes[mid];
  if(pos<s.startMs)hi=mid-1;else if(pos>=s.endMs)lo=mid+1;else return s;
 }
 return null;
}
export function planSpotlightV890(i:SpotlightInputV890):SpotlightCueV890 {
 const s=i.settings,p=i.plan;
 if(!s.enabled||s.intensity<=0||!i.playing||!i.autoEnabled||i.reducedMotion||i.seekBlocked||
  i.blackout||i.manualLighting||i.manualFx||(s.protectLyrics&&i.lyricsProtected)||
  i.tier==='low'||(!i.stageSpots&&!i.beams)||!finite(i.existingGain)||i.existingGain<=.001||
  !finite(i.durationMs)||i.durationMs<10000||i.durationMs>1800000||
  !finite(i.positionMs)||i.positionMs<0||i.positionMs>=i.durationMs||
  !Number.isInteger(i.groupCount)||i.groupCount<1||i.groupCount>4||
  !p||p.source!=='verified-v604'||p.trackId!==i.trackId||p.durationMs!==i.durationMs)
  return {...SPOTLIGHT_OFF_V890};
 const scene=activeScene(p,i.positionMs);
 if(!scene)return {...SPOTLIGHT_OFF_V890};
 const style=s.style==='auto'?suggestedSpotlightV890(scene.section,scene.intent,i.genre):s.style;
 const mood=spotlightMoodV890(i.genre,s.mood);
 const power=clamp(s.intensity/100,0,1)*(i.tier==='balanced'?.7:1);
 // These edit the *relative* balance only. V308's absolute light caps win.
 const portrait=style==='portrait'||style==='follow';
 const moodBoost=mood==='electric'?.06:mood==='arena'?.04:0;
 const side=style==='cross'?.44:style==='fan'?.30:0;
 const leftGain=clamp(1-(style==='portrait'?.32:style==='follow'?.18:style==='cross'?.12:.04)*power,.52,1);
 const rightGain=clamp(1-(portrait?.54:style==='cross'?.12:.04)*power,.44,1);
 const beamGain=clamp(1-(portrait?.30:.08)*power,.55,1);
 const angle=clamp(.30+(style==='fan'?.09:style==='cross'?.02:-.065)*power+moodBoost*power,.22,.41);
 const shift=side*power;
 const fadeMs=s.softTransitions?Math.min(1800,Math.max(400,(scene.endMs-scene.startMs)*.12)):150;
 const elapsed=Math.min(i.positionMs-scene.startMs,scene.endMs-i.positionMs);
 const blend=clamp(elapsed/fadeMs);
 return {active:true,style,section:scene.section,sceneIndex:scene.index,
  label:`${style==='portrait'?'Portrait':style==='follow'?'Follow-Spot':style==='fan'?'Lichtfächer':'Kreuzlicht'} · ${scene.section}`,
  leftGain:1+(leftGain-1)*blend,rightGain:1+(rightGain-1)*blend,
  beamGain:1+(beamGain-1)*blend,angle:.30+(angle-.30)*blend,
  leftShift:shift*blend,rightShift:-shift*blend,
  follow:s.followArtists&&portrait};
}
export function exportSpotlightPlanV890(plan:AtmospherePlanV885|null|undefined,settings:SpotlightSettingsV890,genre:string):string|null {
 if(!plan||plan.source!=='verified-v604'||!plan.trackId||!plan.scenes.length)return null;
 return JSON.stringify({schema:'sonic-professional-spotlight-v890',version:1,
  note:'Nur virtuelle bestehende V308-Lichter. Keine zusätzlichen Scheinwerfer, kein Hardware-Licht und keine Sänger-Identifikation.',
  trackId:plan.trackId,durationMs:plan.durationMs,source:plan.source,settings:normalizeSpotlightV890(settings),
  scenes:plan.scenes.map(sc=>({startMs:sc.startMs,endMs:sc.endMs,section:sc.section,
   intent:sc.intent,style:settings.style==='auto'?suggestedSpotlightV890(sc.section,sc.intent,genre):settings.style}))},null,2);
}
