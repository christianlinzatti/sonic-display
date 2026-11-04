/** V888 – Laser Show Director.
 * Choreographs the existing V811 stage-backdrop shader, with no new lights,
 * render passes or meshes. Never triggers real laser hardware or strobes.
 * Verified V885 storyboard is a *requirement* for new automatic graphics.
 */
import type {AtmospherePlanV885,AtmosphereSceneV885} from './dynamicConcertAtmosphereV885';

export type LaserPatternV888='auto'|'fan'|'tunnel'|'cross'|'prism';
export type LaserMotionV888='calm'|'cinematic'|'festival';
export interface LaserShowSettingsV888 {
 enabled:boolean; pattern:LaserPatternV888; motion:LaserMotionV888;
 intensity:number; protectLyrics:boolean; useScenePalette:boolean;
}
export const LASER_SHOW_KEY_V888='sonic-laser-show-director-v888';
export const DEFAULT_LASER_SHOW_V888:Readonly<LaserShowSettingsV888>={
 enabled:true,pattern:'auto',motion:'cinematic',intensity:70,
 protectLyrics:true,useScenePalette:true,
};
const patterns:readonly LaserPatternV888[]=['auto','fan','tunnel','cross','prism'];
const motions:readonly LaserMotionV888[]=['calm','cinematic','festival'];
const finite=(n:unknown):n is number=>typeof n==='number'&&Number.isFinite(n);
const clamp=(n:number,lo=0,hi=1)=>Math.max(lo,Math.min(hi,n));
export function normalizeLaserShowV888(raw:unknown):LaserShowSettingsV888 {
 const s=raw&&typeof raw==='object'&&!Array.isArray(raw)?raw as Partial<LaserShowSettingsV888>:{};
 return {enabled:typeof s.enabled==='boolean'?s.enabled:true,
  pattern:patterns.includes(s.pattern as LaserPatternV888)?s.pattern as LaserPatternV888:'auto',
  motion:motions.includes(s.motion as LaserMotionV888)?s.motion as LaserMotionV888:'cinematic',
  intensity:finite(s.intensity)?Math.round(clamp(s.intensity,0,100)):70,
  protectLyrics:typeof s.protectLyrics==='boolean'?s.protectLyrics:true,
  useScenePalette:typeof s.useScenePalette==='boolean'?s.useScenePalette:true};
}
export const LASER_PATTERN_LABELS_V888:Record<Exclude<LaserPatternV888,'auto'>,string>={
 fan:'Laserfächer',tunnel:'Lichttunnel',cross:'Kreuzstrahlen',prism:'Laserprisma',
};
const mode:Record<Exclude<LaserPatternV888,'auto'>,1|2|3|4>={fan:1,tunnel:2,cross:3,prism:4};
function sceneAt(plan:AtmospherePlanV885,time:number):AtmosphereSceneV885|null {
 let lo=0,hi=plan.scenes.length-1;
 while(lo<=hi){const mid=(lo+hi)>>>1;const s=plan.scenes[mid];
  if(time<s.startMs)hi=mid-1;else if(time>=s.endMs)lo=mid+1;else return s;
 }
 return null;
}
export function chooseLaserPatternV888(section:string,intent:string):Exclude<LaserPatternV888,'auto'> {
 if(section==='drop')return 'tunnel';
 if(section==='hook')return 'prism';
 if(section==='build')return 'cross';
 // Breaks/outros stay intentionally quiet through the section gain, not hidden drops.
 if(section==='break'||section==='outro'||intent==='portrait'||intent==='breath')return 'fan';
 return 'fan';
}
export interface LaserShowCueV888 {
 active:boolean;pattern:Exclude<LaserPatternV888,'auto'>|null;label:string;
 power:number;mode:0|1|2|3|4;phase:number;motion:number;spread:number;
 primary:string;secondary:string;
}
export const LASER_SHOW_OFF_V888:Readonly<LaserShowCueV888>={
 active:false,pattern:null,label:'',power:0,mode:0,phase:0,motion:0,
 spread:1,primary:'#35b5d8',secondary:'#8d3bd2',
};
export interface LaserShowInputV888 {
 settings:LaserShowSettingsV888;plan?:AtmospherePlanV885|null;
 trackId:string;durationMs:number;positionMs:number;playing:boolean;autoEnabled:boolean;
 reducedMotion:boolean;seekBlocked?:boolean;blackout?:boolean;
 manualLighting?:boolean;manualLaser?:boolean;manualFx?:boolean;
 lyricsProtected?:boolean;tier:'low'|'balanced'|'high';
 budget:number;performanceGain:number;existingLaserOpacity:number;
 laserEnabled:boolean;
}
/** All protection is checked every frame. No new effect without both V604 scene
 * evidence and an already-authorized V810 laser. Manual V823 laser lanes win. */
export function planLaserShowV888(i:LaserShowInputV888):LaserShowCueV888 {
 const {settings:s,plan}=i;
 if(!s.enabled||!i.laserEnabled||!i.playing||!i.autoEnabled||i.reducedMotion||i.seekBlocked||i.blackout||
  i.manualLighting||i.manualLaser||i.manualFx||(s.protectLyrics&&i.lyricsProtected)||i.tier==='low'||
  !finite(i.durationMs)||i.durationMs<10000||i.durationMs>1800000||
  !finite(i.positionMs)||i.positionMs<0||i.positionMs>=i.durationMs||
  !finite(s.intensity)||s.intensity<=0||s.intensity>100||
  !finite(i.budget)||i.budget<=0||!finite(i.performanceGain)||i.performanceGain<=0||
  !finite(i.existingLaserOpacity)||i.existingLaserOpacity<=.001)return {...LASER_SHOW_OFF_V888};
 if(!plan||plan.source!=='verified-v604'||plan.trackId!==i.trackId||plan.durationMs!==i.durationMs)return {...LASER_SHOW_OFF_V888};
 const scene=sceneAt(plan,i.positionMs);
 if(!scene)return {...LASER_SHOW_OFF_V888};
 const pattern=s.pattern==='auto'?chooseLaserPatternV888(scene.section,scene.intent):s.pattern;
 const sectionGain=scene.section==='drop'?1:scene.section==='hook'?.88:scene.section==='build'?.72:
  scene.section==='verse'?.53:.24;
 const motionFactor=s.motion==='calm'?.18:s.motion==='festival'?.72:.38;
 const power=clamp(s.intensity/100*sectionGain*clamp(i.budget)*clamp(i.performanceGain)*
  (i.tier==='balanced'?.72:1),0,.9);
 if(power<=.002)return {...LASER_SHOW_OFF_V888};
 const paletteOK=s.useScenePalette&&/^#[0-9a-fA-F]{6}$/.test(scene.primary)&&
  /^#[0-9a-fA-F]{6}$/.test(scene.secondary);
 return {active:true,pattern,label:`${LASER_PATTERN_LABELS_V888[pattern]} · ${scene.section}`,
  mode:mode[pattern],power,phase:i.positionMs/1000,motion:motionFactor,
  spread:1+power*.40,primary:paletteOK?scene.primary:LASER_SHOW_OFF_V888.primary,
  secondary:paletteOK?scene.secondary:LASER_SHOW_OFF_V888.secondary};
}
export function exportLaserShowV888(plan:AtmospherePlanV885|null|undefined,settings:LaserShowSettingsV888):string|null {
 if(!plan||plan.source!=='verified-v604'||!plan.trackId||!plan.scenes.length)return null;
 return JSON.stringify({schema:'sonic-laser-show-v888',version:1,
  note:'Virtuelle Grafiken auf vorhandener V811-Laserfläche; keine Hardwarelaser oder Stroboskop-Auslösung.',
  trackId:plan.trackId,durationMs:plan.durationMs,source:plan.source,
  settings:normalizeLaserShowV888(settings),
  scenes:plan.scenes.map(s=>({startMs:s.startMs,endMs:s.endMs,section:s.section,
   pattern:settings.pattern==='auto'?chooseLaserPatternV888(s.section,s.intent):settings.pattern,
   intent:s.intent,primary:s.primary,secondary:s.secondary}))},null,2);
}
