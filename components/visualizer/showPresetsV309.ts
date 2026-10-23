import {DEFAULT_NATURAL_DANCE_V320,normalizeNaturalDanceV320,type NaturalDanceSettingsV320} from "./naturalDanceIntelligenceV320";
import {DEFAULT_EVOLUTION_V313,normalizeEvolutionV313,type EvolutionSettingsV313} from "./danceShowEvolutionV313";
import {DEFAULT_CHOREOGRAPHY_V312,normalizeChoreographyV312,type ChoreographySettingsV312} from "./intelligentDanceChoreographyV312";
/** V309 — whole-show presets: one coordinated state change, never overwrite avatar assets. */
import {DEFAULT_DANCE_PERFORMANCE_V311, normalizeDancePerformanceV311, type AdvancedDanceSettingsV311} from "./advancedDancePerformanceV311";
import type { UiPreferences } from "@/types/music";
import { isStageEnvironmentId } from "./stages";
import { DEFAULT_SHOW_QUALITY_V310, normalizeShowQualitySettingsV310, type ShowQualitySettingsV310 } from "./smartShowQualityV310";
import { DEFAULT_SHOW_SETTINGS, type ShowSettings } from "./ultimateShowDirectorV306";
import { DEFAULT_DANCE_QUALITY, type DanceQualitySettings } from "./danceQualityV307";
import { DEFAULT_CONCERT_ATMOSPHERE, type AtmosphereSettingsV308 } from "./concertAtmosphereV308";
import { DEFAULT_STAGE_DIRECTOR, type StageDirectorSettings } from "./stageDirectorV287";

export const SHOW_PRESET_SESSION_KEY = "sonic-show-preset-undo-v309";
export const SHOW_PRESET_LIBRARY_KEY = "sonic-custom-show-presets-v309";
export const SHOW_PRESET_APPLIED_EVENT = "sonic-show-preset-v309-applied";
export const MAX_CUSTOM_SHOW_PRESETS = 12;

export const SHOW_UI_KEYS = ["visualizerMode", "stageTheme", "stageReactive", "stageLightStrength", "duoDirectorEnabled", "multiAvatarMode", "smartDanceEnabled", "danceMotionStyle", "danceAggression", "danceVariation", "avatarAnimationIntensity", "danceFxEnabled", "danceFxStrength", "danceFxShockwaves", "danceFxFootprints", "danceFxTrails"] as const;
export type ShowUiPatch = Partial<Pick<UiPreferences, typeof SHOW_UI_KEYS[number]>>;
export type ShowPresetSettings = {
  ui: ShowUiPatch;
  show: ShowSettings;
  dance: DanceQualitySettings;
  atmosphere: AtmosphereSettingsV308;
  director: StageDirectorSettings;
  quality: ShowQualitySettingsV310;
  performanceV311: AdvancedDanceSettingsV311;
  choreographyV312: ChoreographySettingsV312;
  evolutionV313: EvolutionSettingsV313;
  naturalV320: NaturalDanceSettingsV320;
};
export type ShowPreset = ShowPresetSettings & {
  id: string;
  name: string;
  description: string;
  tag: string;
};

const rave: ShowPreset = {
  id:"rave",name:"Hardtekk Mainstage",description:"Kraftvolle Drops, synchrone Duo-Choreografien, dynamische Totale und pulsierendes Festivallicht.",tag:"Hardtekk / Hardstyle",
  ui:{visualizerMode:"avatar",stageTheme:"festival",stageReactive:true,stageLightStrength:95,duoDirectorEnabled:true,multiAvatarMode:"sync",smartDanceEnabled:true,danceMotionStyle:"sharp",danceAggression:.83,danceVariation:.67,avatarAnimationIntensity:1.25,danceFxEnabled:true,danceFxStrength:72,danceFxShockwaves:true,danceFxFootprints:true,danceFxTrails:true},
  show:{...DEFAULT_SHOW_SETTINGS,enabled:true,style:"rave",intensity:90},
  dance:{...DEFAULT_DANCE_QUALITY,enabled:true,style:"rave",intensity:78},
  atmosphere:{...DEFAULT_CONCERT_ATMOSPHERE,enabled:true,intensity:84,hazeDensity:52,sweep:72},
  director:{...DEFAULT_STAGE_DIRECTOR,enabled:true,cinematic:true,realCamera:true,cameraIntensity:78,transitionMs:650},
  quality:{...DEFAULT_SHOW_QUALITY_V310,variety:85,minHoldSeconds:12,dancerFocus:65,fxCeiling:85},
  performanceV311:{...DEFAULT_DANCE_PERFORMANCE_V311,style:"rave",fluidity:48,balance:66,footProtection:90,transitionPolish:70},
  choreographyV312:{...DEFAULT_CHOREOGRAPHY_V312,style:"rave",barsPerExchange:2,soloContrast:78,interaction:75,variety:85,dropTogether:true},
  evolutionV313:{...DEFAULT_EVOLUTION_V313,arcStrength:90,calmIntro:45,climaxLift:94},
  naturalV320:{...DEFAULT_NATURAL_DANCE_V320,style:"rave",weightTransfer:78,followThrough:54,groove:84,footSafety:94},
};
const rap: ShowPreset = {
  id:"rap",name:"Deutschrap Spotlight",description:"Entspannte Grooves, präzise Rap-Gesten und gezielte Spotlight-Kamerafahrten.",tag:"Deutschrap / Hip-Hop",
  ui:{visualizerMode:"avatar",stageTheme:"white",stageReactive:true,stageLightStrength:58,duoDirectorEnabled:false,multiAvatarMode:"solo",smartDanceEnabled:true,danceMotionStyle:"smooth",danceAggression:.42,danceVariation:.58,avatarAnimationIntensity:1,danceFxEnabled:false,danceFxStrength:30,danceFxShockwaves:false,danceFxFootprints:false,danceFxTrails:false},
  show:{...DEFAULT_SHOW_SETTINGS,enabled:true,style:"rap",intensity:55},
  dance:{...DEFAULT_DANCE_QUALITY,enabled:true,style:"rap",intensity:68},
  atmosphere:{...DEFAULT_CONCERT_ATMOSPHERE,enabled:true,intensity:43,hazeDensity:20,sweep:27},
  director:{...DEFAULT_STAGE_DIRECTOR,enabled:true,cinematic:true,realCamera:true,cameraIntensity:38,transitionMs:1000},
  quality:{...DEFAULT_SHOW_QUALITY_V310,variety:45,minHoldSeconds:22,dancerFocus:88,fxCeiling:35},
  performanceV311:{...DEFAULT_DANCE_PERFORMANCE_V311,style:"rap",fluidity:72,balance:64,footProtection:88,transitionPolish:80},
  choreographyV312:{...DEFAULT_CHOREOGRAPHY_V312,style:"dialogue",barsPerExchange:4,soloContrast:84,interaction:70,variety:60,dropTogether:true},
  evolutionV313:{...DEFAULT_EVOLUTION_V313,arcStrength:55,calmIntro:72,climaxLift:45},
  naturalV320:{...DEFAULT_NATURAL_DANCE_V320,style:"rap",weightTransfer:70,followThrough:78,groove:70,footSafety:90},
};
const cinematic: ShowPreset = {
  id:"cinematic",name:"Cinematic Festival",description:"Elegante Kamerafahrten, heroische Formationen, abgestuftes Licht und atmosphärische Übergänge.",tag:"Filmisch / Konzert",
  ui:{visualizerMode:"avatar",stageTheme:"neon",stageReactive:true,stageLightStrength:75,duoDirectorEnabled:true,multiAvatarMode:"duet",smartDanceEnabled:true,danceMotionStyle:"balanced",danceAggression:.56,danceVariation:.48,avatarAnimationIntensity:1.05,danceFxEnabled:true,danceFxStrength:36,danceFxShockwaves:false,danceFxFootprints:false,danceFxTrails:true},
  show:{...DEFAULT_SHOW_SETTINGS,enabled:true,style:"cinematic",intensity:73},
  dance:{...DEFAULT_DANCE_QUALITY,enabled:true,style:"cinematic",intensity:48},
  atmosphere:{...DEFAULT_CONCERT_ATMOSPHERE,enabled:true,intensity:73,hazeDensity:60,sweep:34},
  director:{...DEFAULT_STAGE_DIRECTOR,enabled:true,cinematic:true,realCamera:true,cameraIntensity:62,transitionMs:1250},
  quality:{...DEFAULT_SHOW_QUALITY_V310,variety:70,minHoldSeconds:18,dancerFocus:75,fxCeiling:65},
  performanceV311:{...DEFAULT_DANCE_PERFORMANCE_V311,style:"cinematic",fluidity:85,balance:55,footProtection:90,transitionPolish:75},
  choreographyV312:{...DEFAULT_CHOREOGRAPHY_V312,style:"cinematic",barsPerExchange:8,soloContrast:55,interaction:45,variety:55,dropTogether:true},
  evolutionV313:{...DEFAULT_EVOLUTION_V313,arcStrength:85,calmIntro:82,climaxLift:78},
  naturalV320:{...DEFAULT_NATURAL_DANCE_V320,style:"cinematic",weightTransfer:60,followThrough:85,groove:48,footSafety:92},
};
const ambient: ShowPreset = {
  id:"ambient",name:"Ambient Night",description:"Sanfte Bewegungen, reduzierte Kamerawechsel und stimmungsvolles Licht mit wenig Nebel.",tag:"Ambient / Chill",
  ui:{visualizerMode:"avatar",stageTheme:"galaxy",stageReactive:true,stageLightStrength:40,duoDirectorEnabled:false,multiAvatarMode:"solo",smartDanceEnabled:true,danceMotionStyle:"smooth",danceAggression:.24,danceVariation:.30,avatarAnimationIntensity:.82,danceFxEnabled:false,danceFxStrength:15,danceFxShockwaves:false,danceFxFootprints:false,danceFxTrails:false},
  show:{...DEFAULT_SHOW_SETTINGS,enabled:true,style:"cinematic",intensity:32,formations:false},
  dance:{...DEFAULT_DANCE_QUALITY,enabled:true,style:"cinematic",intensity:28},
  atmosphere:{...DEFAULT_CONCERT_ATMOSPHERE,enabled:true,intensity:42,hazeDensity:30,sweep:12},
  director:{...DEFAULT_STAGE_DIRECTOR,enabled:true,cinematic:true,realCamera:true,cameraIntensity:20,transitionMs:1700},
  quality:{...DEFAULT_SHOW_QUALITY_V310,variety:30,minHoldSeconds:28,dancerFocus:90,fxCeiling:20},
  performanceV311:{...DEFAULT_DANCE_PERFORMANCE_V311,style:"cinematic",fluidity:90,balance:35,footProtection:95,transitionPolish:80},
  choreographyV312:{...DEFAULT_CHOREOGRAPHY_V312,enabled:false,style:"cinematic",barsPerExchange:8,soloContrast:20,interaction:20,variety:20},
  evolutionV313:{...DEFAULT_EVOLUTION_V313,arcStrength:25,calmIntro:90,climaxLift:18},
  naturalV320:{...DEFAULT_NATURAL_DANCE_V320,style:"cinematic",weightTransfer:40,followThrough:80,groove:25,footSafety:95},
};
export const BUILTIN_SHOW_PRESETS: readonly ShowPreset[] = [rave,rap,cinematic,ambient];

/** Copy only the show-controlled preferences; never touch selected avatar, imported motions, accessibility or mic. */
export function captureShowUiPreferences(preferences: UiPreferences): ShowUiPatch {
  const captured: ShowUiPatch = {};
  for (const key of SHOW_UI_KEYS) {
    // The indexed assignment is safe because the value is read from the same UiPreferences key.
    (captured as Record<string,unknown>)[key] = preferences[key];
  }
  return captured;
}
export function captureShowSettings(preferences: UiPreferences, current: Omit<ShowPresetSettings,"ui">): ShowPresetSettings {
  return {ui:captureShowUiPreferences(preferences),show:{...current.show},dance:{...current.dance},atmosphere:{...current.atmosphere},director:{...current.director},quality:{...current.quality},performanceV311:{...current.performanceV311},choreographyV312:{...current.choreographyV312},evolutionV313:{...current.evolutionV313},naturalV320:{...current.naturalV320}};
}

const clamp = (value:unknown,min:number,max:number,fallback:number) => typeof value==="number" && Number.isFinite(value) ? Math.min(max,Math.max(min,value)) : fallback;
const bool = (v:unknown, fallback:boolean):boolean => typeof v === "boolean" ? v : fallback;
const record = (value:unknown):value is Record<string,unknown> => Boolean(value && typeof value==="object" && !Array.isArray(value));
/** LocalStorage is untrusted: deserialize only known fields with bounded numeric values. */
export function normalizeSavedShowPreset(value:unknown):ShowPreset|null {
  if(!record(value) || typeof value.id!=="string" || !/^custom-[a-zA-Z0-9-]{1,80}$/.test(value.id) || typeof value.name!=="string" || !value.name.trim() || !record(value.ui) || !record(value.show) || !record(value.dance) || !record(value.atmosphere) || !record(value.director))return null;
  const ui=value.ui;
  const cleaned:ShowUiPatch = {};
  if(ui.visualizerMode==="avatar"||ui.visualizerMode==="wave"||ui.visualizerMode==="particles"||ui.visualizerMode==="album-glow")cleaned.visualizerMode=ui.visualizerMode;
  if (isStageEnvironmentId(ui.stageTheme)) cleaned.stageTheme=ui.stageTheme;
  if(typeof ui.stageReactive==="boolean")cleaned.stageReactive=ui.stageReactive;
  if(typeof ui.stageLightStrength==="number")cleaned.stageLightStrength=clamp(ui.stageLightStrength,0,100,60);
  if(typeof ui.duoDirectorEnabled==="boolean")cleaned.duoDirectorEnabled=ui.duoDirectorEnabled;
  if(ui.multiAvatarMode==="solo"||ui.multiAvatarMode==="sync"||ui.multiAvatarMode==="mirror"||ui.multiAvatarMode==="duet")cleaned.multiAvatarMode=ui.multiAvatarMode;
  if(typeof ui.smartDanceEnabled==="boolean")cleaned.smartDanceEnabled=ui.smartDanceEnabled;
  if(ui.danceMotionStyle==="sharp"||ui.danceMotionStyle==="balanced"||ui.danceMotionStyle==="smooth")cleaned.danceMotionStyle=ui.danceMotionStyle;
  if(typeof ui.danceAggression==="number")cleaned.danceAggression=clamp(ui.danceAggression,0,1,.5);
  if(typeof ui.danceVariation==="number")cleaned.danceVariation=clamp(ui.danceVariation,0,1,.5);
  if(typeof ui.avatarAnimationIntensity==="number")cleaned.avatarAnimationIntensity=clamp(ui.avatarAnimationIntensity,0,2,1);
  if(typeof ui.danceFxEnabled==="boolean")cleaned.danceFxEnabled=ui.danceFxEnabled;
  if(typeof ui.danceFxStrength==="number")cleaned.danceFxStrength=clamp(ui.danceFxStrength,0,100,60);
  for(const k of ["danceFxShockwaves","danceFxFootprints","danceFxTrails"] as const) if(typeof ui[k]==="boolean")cleaned[k]=ui[k];
  const s=value.show,d=value.dance,a=value.atmosphere,dir=value.director;
  const style = (x:unknown) => x==="auto" || x==="rave" || x==="rap" || x==="cinematic" ? x : "auto";
  return {id:value.id,name:value.name.trim().slice(0,50),description:typeof value.description==="string"?value.description.slice(0,160):"Mein gespeichertes Show-Preset",tag:"Eigenes Preset",
    ui:cleaned,
    show:{enabled:bool(s.enabled,false),style:style(s.style),intensity:clamp(s.intensity,0,100,70),camera:bool(s.camera,true),lighting:bool(s.lighting,true),effects:bool(s.effects,true),formations:bool(s.formations,true)},
    dance:{enabled:bool(d.enabled,true),style:style(d.style),intensity:clamp(d.intensity,0,100,55),expressiveArms:bool(d.expressiveArms,true),bodyGroove:bool(d.bodyGroove,true),plantedFootSafety:bool(d.plantedFootSafety,true)},
    atmosphere:{enabled:bool(a.enabled,true),beams:bool(a.beams,true),haze:bool(a.haze,true),stageSpots:bool(a.stageSpots,true),syncToShow:bool(a.syncToShow,true),intensity:clamp(a.intensity,0,100,65),hazeDensity:clamp(a.hazeDensity,0,100,40),sweep:clamp(a.sweep,0,100,45)},
    director:{enabled:bool(dir.enabled,false),transitionMs:clamp(dir.transitionMs,250,1800,700),energySensitive:bool(dir.energySensitive,true),cinematic:bool(dir.cinematic,true),cameraMotion:bool(dir.cameraMotion,true),dropFlash:bool(dir.dropFlash,true),realCamera:bool(dir.realCamera,false),cameraIntensity:clamp(dir.cameraIntensity,0,100,55)},
    quality:normalizeShowQualitySettingsV310(value.quality),
    performanceV311:normalizeDancePerformanceV311(value.performanceV311),
    choreographyV312:value.choreographyV312===undefined?{...DEFAULT_CHOREOGRAPHY_V312,enabled:false}:normalizeChoreographyV312(value.choreographyV312),
    evolutionV313:value.evolutionV313===undefined?{...DEFAULT_EVOLUTION_V313,enabled:false}:normalizeEvolutionV313(value.evolutionV313),
    naturalV320:value.naturalV320===undefined?{...DEFAULT_NATURAL_DANCE_V320,enabled:false}:normalizeNaturalDanceV320(value.naturalV320)
  };
}
export function decodeSavedShowPresets(input:unknown):ShowPreset[] {
  if(!Array.isArray(input))return [];
  const ids=new Set<string>();
  return input.map(normalizeSavedShowPreset).filter((preset):preset is ShowPreset=>{
    if(!preset || ids.has(preset.id))return false;ids.add(preset.id);return true;
  }).slice(0,MAX_CUSTOM_SHOW_PRESETS);
}
export function readCustomShowPresets():ShowPreset[] {
  if(typeof window==="undefined")return [];
  try{return decodeSavedShowPresets(JSON.parse(window.localStorage.getItem(SHOW_PRESET_LIBRARY_KEY)??"[]"));}catch{return [];}
}
export function writeCustomShowPresets(presets:ShowPreset[]):boolean {
  if(typeof window==="undefined")return false;
  try{window.localStorage.setItem(SHOW_PRESET_LIBRARY_KEY,JSON.stringify(decodeSavedShowPresets(presets)));return true;}catch{return false;}
}
export function readUndoShowPreset():ShowPresetSettings|null {
  if(typeof window==="undefined")return null;
  try{const raw=JSON.parse(window.sessionStorage.getItem(SHOW_PRESET_SESSION_KEY)??"null");return normalizeSavedShowPreset({...raw,id:"custom-undo",name:"Vorherige Einstellungen"});}catch{return null;}
}
export function saveUndoShowPreset(value:ShowPresetSettings|null):void {
  if(typeof window==="undefined")return;
  try{if(value)window.sessionStorage.setItem(SHOW_PRESET_SESSION_KEY,JSON.stringify(value));else window.sessionStorage.removeItem(SHOW_PRESET_SESSION_KEY);}catch{/* in-memory undo remains available */}
}
export function notifyPresetStageChange(theme:UiPreferences["stageTheme"]|undefined):void {
  if(typeof window!=="undefined")window.dispatchEvent(new CustomEvent(SHOW_PRESET_APPLIED_EVENT,{detail:{theme}}));
}
