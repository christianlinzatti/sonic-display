/** V969 – Smart Concert Presets: deterministic, virtual-only show looks.
 * Reuses verified V958 scene and V966 immersion; no Spotify, hardware, timers,
 * camera movements or new R3F render loops. User-authored shows always win.
 */
import type {
 ConcertGenreV947,ConcertPhaseV958,ConcertSceneV958,ConcertSettingsV958,
 ConcertFxV955,ConcertWallV951,ConcertPresetIdV969
} from './ultimateConcertRoadmapV958';

export const SMART_CONCERT_PRESETS_V969:ReadonlyArray<{
 id:ConcertPresetIdV969;label:string;description:string
}>=[
 {id:'off',label:'Kein zusätzliches Preset',description:'Vorhandene automatische Regie unverändert'},
 {id:'auto',label:'Smart Automatik',description:'Genreabhängige Konzertkulisse'},
 {id:'arena',label:'Arena Live',description:'Breite LED-Wand und große Lichtkegel'},
 {id:'festival',label:'Festival Peak',description:'Spektakuläre Drops und dynamische Hintergrundmuster'},
 {id:'club',label:'Neon Club',description:'Kompaktes, pulsierendes Clublicht'},
 {id:'cinematic',label:'Cinematic Night',description:'Düstere, filmische Verse und fokussierte Hooks'},
 {id:'hardtekk',label:'Hardtekk Reactor',description:'Kühle Neon-Geometrie und harte Bassakzente'},
 {id:'rock',label:'Rock Arena',description:'Warme, kraftvolle Bühnenstimmung'}
] as const;

type ActivePresetV969=Exclude<ConcertPresetIdV969,'off'|'auto'>;
type PresetSpec={palette:readonly [string,string];walls:readonly [ConcertWallV951,ConcertWallV951,ConcertWallV951];
 boost:number;ambient:ConcertFxV955;peak:ConcertFxV955;impact:ConcertFxV955};
const PROFILES:Record<ActivePresetV969,PresetSpec>={
 arena:{palette:['#e2a27e','#5276df'],walls:['equalizer','ribbons','geometry'],boost:.06,ambient:'beams',peak:'sweep',impact:'bass-impact'},
 festival:{palette:['#ed43b3','#35bbeb'],walls:['geometry','pulse','ribbons'],boost:.12,ambient:'beams',peak:'sweep',impact:'bass-impact'},
 club:{palette:['#9259ed','#00b7d2'],walls:['pulse','equalizer','geometry'],boost:.01,ambient:'fog',peak:'beams',impact:'sweep'},
 cinematic:{palette:['#9d3752','#4b3c8d'],walls:['starfield','ribbons','pulse'],boost:-.09,ambient:'fog',peak:'beams',impact:'sweep'},
 hardtekk:{palette:['#00c9ef','#e730c7'],walls:['geometry','pulse','equalizer'],boost:.10,ambient:'beams',peak:'sweep',impact:'bass-impact'},
 rock:{palette:['#ed8d3e','#b92c57'],walls:['ribbons','equalizer','pulse'],boost:.05,ambient:'fog',peak:'beams',impact:'bass-impact'}
};
const moods:Record<ConcertPhaseV958,number>={verse:.72,hook:1.0,build:.87,drop:1.08,break:.48,outro:.60};
const clamp=(x:number,a:number,b:number)=>Math.min(b,Math.max(a,x));

/** Auto picks a relevant show-world without misclassifying an unknown track. */
export function resolveSmartConcertPresetV969(selection:ConcertPresetIdV969,genre:ConcertGenreV947):ActivePresetV969|null{
 if(selection==='off')return null;
 if(selection!=='auto')return PROFILES[selection]?selection:null;
 if(genre==='hardtekk'||genre==='hardstyle')return 'hardtekk';
 if(genre==='deutschrap')return 'cinematic';
 if(genre==='deutschrock')return 'rock';
 return 'arena';
}

/** Selecting any room preset does not turn on real lights; old room maps and
 * per-track timelines are preserved by reference. Strength is virtual only. */
export function selectSmartConcertPresetV969(settings:ConcertSettingsV958,selection:ConcertPresetIdV969):ConcertSettingsV958{
 const valid=SMART_CONCERT_PRESETS_V969.some(p=>p.id===selection)?selection:'off';
 if(valid==='off')return {...settings,hardwareSync:false,concertPresetV969:'off'};
 const intensity=valid==='cinematic'?48:valid==='club'?62:valid==='festival'?88:valid==='hardtekk'?85:74;
 return {...settings,concertPresetV969:valid,enabled:true,virtualFx:true,hardwareSync:false,
  immersiveV966:true,strength:intensity,immersiveStrengthV966:Math.min(88,intensity),
  voiceZoneV968:'all',voiceMoodV968:'auto',voiceFxV968:'auto'};
}

export type SmartPresetOptionsV969={authoredStage:boolean;reducedMotion:boolean;lowPerformance:boolean};
/** Song phase + distinct section index create controlled variation without per-frame randomness.
 * Does not override camera, dance, saved cues, V968 explicit FX selections or hardware.
 */
export function applySmartConcertPresetV969(scene:ConcertSceneV958|null,settings:ConcertSettingsV958,
 options:SmartPresetOptionsV969):ConcertSceneV958|null{
 if(!scene||!scene.verified||scene.timelineOverride||options.authoredStage||options.lowPerformance||
  !settings.enabled||!settings.virtualFx)return scene;
 const id=resolveSmartConcertPresetV969(settings.concertPresetV969,scene.genre);
 if(!id)return scene;
 const spec=PROFILES[id];
 const isPeak=scene.phase==='hook'||scene.phase==='drop';
 const isBuild=scene.phase==='build';
 const isQuiet=scene.phase==='verse'||scene.phase==='break'||scene.phase==='outro';
 const segment=Number(scene.id.split('|').at(-2));
 const variation=Number.isFinite(segment)?Math.abs(Math.floor(segment))%3:0;
 const wall=spec.walls[(variation+(isPeak?1:isBuild?2:0))%3];
 const phaseGain=moods[scene.phase];
 const target=clamp(scene.intensity*phaseGain+spec.boost,.10,.96);
 const intensity=options.reducedMotion?Math.min(target,.62):target;
 const colors:[string,string]=[spec.palette[0],spec.palette[1]];
 const effects:ConcertFxV955[]=[];
 if(!options.reducedMotion){
  if(isQuiet)effects.push(spec.ambient);
  if(isBuild)effects.push('beams');
  if(isPeak)effects.push(spec.peak);
  if(scene.phase==='drop'&&id!=='cinematic')effects.push(spec.impact);
  if(scene.finale&&(scene.phase==='hook'||scene.phase==='drop'||scene.phase==='outro'))effects.push('confetti');
 }
 // Original lighting/camera/formation/manual settings are not altered.
 return {...scene,wall,palette:colors,effects:[...new Set(effects)].slice(0,3),intensity,
  reason:`${scene.reason} · V969 ${id} (virtuell)`};
}
