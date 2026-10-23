/** V352 Genre Visual Director – pure cue planning for the existing single Canvas.
 * Complements V351 rather than overwriting authored timelines or camera presets. */
import type {StageEnvironmentId} from '@/components/visualizer/stages';
import type {SmartStageCueV351} from './smartStageCompositionV351';
import type {MusicGenre, GenreFamily} from '@/config/musicGenres';
import type {GenreFusion} from '@/services/genre/genreIntelligence';

export type GenreVisualIdV352=MusicGenre;
export type GenreVisualModeV352='auto'|'manual'|'off';
export interface GenreVisualSettingsV352 {
 enabled:boolean;mode:GenreVisualModeV352;manualGenre:GenreVisualIdV352;
 intensity:number;automaticTheme:boolean;overrideTheme:boolean;genreColors:boolean;fusionEnabled?:boolean;
 coordinateCamera:boolean;coordinateLighting:boolean;coordinatePhotos:boolean;coordinateEffects:boolean;
}
export interface GenreVisualInputV352 {
 genre?:string|null;fusion?:GenreFusion|null;section?:string|null;playing:boolean;reducedMotion:boolean;
 beatAccent?:number;lyricsActive?:boolean;screenCount?:number;avatarCount?:number;
 currentTheme:StageEnvironmentId;
}
export interface GenreVisualCueV352 {
 active:boolean;genre:GenreVisualIdV352|null;label:string;description:string;
 theme:StageEnvironmentId;palette:{primary:string;secondary:string;glow:string}|null;
 lightGain:number;beamGain:number;fxGain:number;cameraMotion:number;
 photoMotion:number;photoOpacity:number;focus:'lyrics'|'avatars'|'photos'|'balanced';
 phase:'calm'|'verse'|'build'|'peak';reason:string;
}
export const GENRE_VISUAL_KEY_V352='sonic-genre-visual-director-v352';
export const GENRE_VISUAL_EVENT_V352='sonic:genre-visual-director-v352';
export const DEFAULT_GENRE_VISUAL_V352:GenreVisualSettingsV352={
 enabled:true,mode:'auto',manualGenre:'hiphop',intensity:.78,fusionEnabled:true,
 automaticTheme:true,overrideTheme:false,genreColors:true,
 coordinateCamera:true,coordinateLighting:true,coordinatePhotos:true,coordinateEffects:true,
};
const BASE_GENRE_VISUAL_PROFILES_V352={
 hiphop:{label:'Deutschrap / Hip-Hop',description:'Urbanes Studio, warme Akzente, ruhige Verse und prägnante Hooks',theme:'white',palette:{primary:'#ed9636',secondary:'#7858c9',glow:'#f4c36d'},light:.82,beam:.72,fx:.62,camera:.82,photo:.77},
 hardstyle:{label:'Hardstyle',description:'Festival-Show mit breiten Beams, pulsierendem Licht und Drop-Fokus',theme:'festival',palette:{primary:'#ff335f',secondary:'#8c43f4',glow:'#faff56'},light:1.12,beam:1.18,fx:1.17,camera:1.08,photo:1.05},
 hardtekk:{label:'Hardtekk',description:'Industrieller Rave mit schnellen Kontrasten und aggressiven Drop-Akzenten',theme:'cyberpunk',palette:{primary:'#f04fff',secondary:'#42fff0',glow:'#ffdd42'},light:1.13,beam:1.22,fx:1.22,camera:1.17,photo:1.15},
 techno:{label:'Techno',description:'Dunkler Neonclub, repetitiver Lichtpuls und kontrollierte Kamerabewegung',theme:'neon',palette:{primary:'#00e8cc',secondary:'#437dff',glow:'#b6ff6a'},light:.94,beam:1.06,fx:.83,camera:.73,photo:.79},
 rock:{label:'Rock',description:'Arena, warme Gegenlicht-Akzente und kräftige Refrains',theme:'rock',palette:{primary:'#ff913f',secondary:'#d84440',glow:'#ffdc8a'},light:1.07,beam:1.04,fx:1.03,camera:1.0,photo:.91},
 ambient:{label:'Ambient',description:'Kosmisches, ruhiges Licht, wenige Bewegungen, sanfte Übergänge',theme:'galaxy',palette:{primary:'#679ecf',secondary:'#ad85db',glow:'#e1f4ff'},light:.62,beam:.48,fx:.48,camera:.42,photo:.52},
 pop:{label:'Pop',description:'Farbiger Showroom, weichere Bewegungen und starke Refrains',theme:'vaporwave',palette:{primary:'#ff71b9',secondary:'#7e75ff',glow:'#ffe47e'},light:.96,beam:.94,fx:.87,camera:.92,photo:.96},
} as const satisfies Record<GenreFamily,{label:string;description:string;theme:StageEnvironmentId;palette:{primary:string;secondary:string;glow:string};light:number;beam:number;fx:number;camera:number;photo:number}>;
/** V469: every detectable genre has its own visual signature. Historic seven genre profiles are unchanged. */
export const GENRE_VISUAL_PROFILES_V352={
 ...BASE_GENRE_VISUAL_PROFILES_V352,
 deutschrap:{...BASE_GENRE_VISUAL_PROFILES_V352.hiphop,label:'Deutschrap',description:'Fokussierte Rap-Verse, warmes Spotlight und Hook-Akzente',palette:{primary:'#e8a34d',secondary:'#593a96',glow:'#ffe0a0'},camera:.72,fx:.54},
 trap:{...BASE_GENRE_VISUAL_PROFILES_V352.hiphop,label:'Trap',description:'Dunkle 808-Bass-Atmosphäre mit kurzen rhythmischen Akzenten',palette:{primary:'#ae74ff',secondary:'#251a50',glow:'#ffa957'},fx:.82,beam:.81},
 drill:{...BASE_GENRE_VISUAL_PROFILES_V352.hiphop,label:'Drill',description:'Kühle Spotlights und harte, präzise Bass-Akzente',theme:'neon',palette:{primary:'#7e8bff',secondary:'#171930',glow:'#e5fbff'},camera:.68,fx:.69},
 boombap:{...BASE_GENRE_VISUAL_PROFILES_V352.hiphop,label:'Boom Bap',description:'Oldschool-Groove, dezente Farben und stabile Kamera',palette:{primary:'#eda95f',secondary:'#5d3828',glow:'#ffe9b8'},camera:.53,fx:.45},
 hardtechno:{...BASE_GENRE_VISUAL_PROFILES_V352.techno,label:'Hard Techno',description:'Industrielle Club-Beams mit Kick-Puls und kontrollierten Strobes',theme:'cyberpunk',palette:{primary:'#ff4e87',secondary:'#251b43',glow:'#f5ff50'},light:1.12,beam:1.2,fx:1.12,camera:.91},
 schranz:{...BASE_GENRE_VISUAL_PROFILES_V352.techno,label:'Schranz',description:'Druckvolles mechanisches Licht, rhythmisch und repetitiv',theme:'cyberpunk',palette:{primary:'#ff633c',secondary:'#2b1722',glow:'#ffe87c'},light:1.11,beam:1.15,fx:1.1},
 rawstyle:{...BASE_GENRE_VISUAL_PROFILES_V352.hardstyle,label:'Rawstyle',description:'Dunkle Festival-Kicks, kantige Lichtwechsel und Drops',palette:{primary:'#ff284e',secondary:'#491052',glow:'#f3ff35'},fx:1.2},
 hardcore:{...BASE_GENRE_VISUAL_PROFILES_V352.hardstyle,label:'Hardcore / Gabber',description:'Gabber-Energie, kompakte Lichtimpulse und aggressive Hooks',palette:{primary:'#ff423f',secondary:'#300b1e',glow:'#f6f763'},camera:1.15,fx:1.23},
 uptempo:{...BASE_GENRE_VISUAL_PROFILES_V352.hardtekk,label:'Uptempo Hardcore',description:'Sehr schnelle Kicks, Fokus auf die Beams und auf kurzen Impact',palette:{primary:'#fc39e9',secondary:'#260c48',glow:'#fff02a'},fx:1.25,camera:1.06},
 house:{...BASE_GENRE_VISUAL_PROFILES_V352.techno,label:'House',description:'Warmer Club-Groove mit weichen Lichtwellen',theme:'neon',palette:{primary:'#43e3ae',secondary:'#273c80',glow:'#e9ffc5'},light:.85,beam:.78,fx:.61,camera:.6},
 trance:{...BASE_GENRE_VISUAL_PROFILES_V352.techno,label:'Trance',description:'Weite Lichtbögen und schwebende Übergänge mit großem Aufbau',theme:'galaxy',palette:{primary:'#66c9ff',secondary:'#423bd0',glow:'#d1efff'},light:.91,beam:1.02,fx:.74,camera:.7},
 psytrance:{...BASE_GENRE_VISUAL_PROFILES_V352.techno,label:'Psytrance',description:'Psychedelische Neonfarben und kosmische Bewegungsmuster',theme:'galaxy',palette:{primary:'#b9ff50',secondary:'#6633a8',glow:'#ff8ee8'},light:1.06,beam:1.12,fx:1.03,camera:.82},
 dnb:{...BASE_GENRE_VISUAL_PROFILES_V352.techno,label:'Drum & Bass',description:'Schnelle Bass-Akzente, klare Snare-Lichter und rhythmische Kamera',theme:'neon',palette:{primary:'#f5c242',secondary:'#2c2868',glow:'#58f8ff'},light:1.02,beam:1.1,fx:.99,camera:1.05},
 dubstep:{...BASE_GENRE_VISUAL_PROFILES_V352.techno,label:'Dubstep',description:'Halftime-Spannung und intensive Drop-Impulse',theme:'cyberpunk',palette:{primary:'#b78aff',secondary:'#27164a',glow:'#95ff7a'},light:.95,beam:1.1,fx:1.18,camera:.84},
 synthwave:{...BASE_GENRE_VISUAL_PROFILES_V352.techno,label:'Synthwave',description:'Retro-Neon, sanfte Bewegungen und warme Synth-Flächen',theme:'vaporwave',palette:{primary:'#ff77ae',secondary:'#462e9e',glow:'#62e7ff'},light:.77,beam:.7,fx:.62,camera:.55},
 reggaeton:{...BASE_GENRE_VISUAL_PROFILES_V352.pop,label:'Reggaeton',description:'Sommerliche Farben und tänzerische Latin-Grooves',palette:{primary:'#ff9e54',secondary:'#873d8c',glow:'#ffeb92'},light:.97,beam:.8,fx:.7},
 metal:{...BASE_GENRE_VISUAL_PROFILES_V352.rock,label:'Metal',description:'Dramatische Gegenlichter und ausdrucksstarke Refrains',palette:{primary:'#db5555',secondary:'#1c1b31',glow:'#e8edf5'},light:1.17,beam:1.16,fx:1.07},
 rnb:{...BASE_GENRE_VISUAL_PROFILES_V352.hiphop,label:'R&B / Soul',description:'Warme Gesangsszenen, weichere Kamerafahrten, weniger FX',palette:{primary:'#c492e8',secondary:'#492863',glow:'#ffc4a8'},light:.66,beam:.58,fx:.46,camera:.5},
 jazz:{...BASE_GENRE_VISUAL_PROFILES_V352.ambient,label:'Jazz',description:'Intimes Bühnenlicht und dezente Kamerabewegung',theme:'white',palette:{primary:'#dab17b',secondary:'#3a395b',glow:'#ffe9c4'},light:.73,beam:.42,fx:.35,camera:.38},
 classical:{...BASE_GENRE_VISUAL_PROFILES_V352.ambient,label:'Klassik',description:'Elegante Kamerafahrten und zurückhaltendes Orchesterlicht',theme:'white',palette:{primary:'#aac9ef',secondary:'#46517d',glow:'#f5f4ef'},light:.57,beam:.35,fx:.31,camera:.35},
 poprock:{...BASE_GENRE_VISUAL_PROFILES_V352.rock,label:'Pop-Rock',description:'Warme Gitarrenbühne mit melodischen Refrains',palette:{primary:'#ffae79',secondary:'#6b3f7e',glow:'#ffe59f'},light:1.0,beam:.96,fx:.84,camera:.89},
 indierock:{...BASE_GENRE_VISUAL_PROFILES_V352.rock,label:'Indie-Rock',description:'Intime Gitarrenperformance und natürliche Kamerafahrten',theme:'white',palette:{primary:'#dbaa72',secondary:'#364763',glow:'#fce1ae'},light:.78,beam:.6,fx:.55,camera:.65},
 alternativerock:{...BASE_GENRE_VISUAL_PROFILES_V352.rock,label:'Alternative Rock',description:'Dynamische Band-Kontraste und kräftige Hooks',palette:{primary:'#db6363',secondary:'#2b3458',glow:'#ffd3a3'},light:1.04,beam:1.06,fx:.99},
 punkrock:{...BASE_GENRE_VISUAL_PROFILES_V352.rock,label:'Punk-Rock',description:'Schnelle kraftvolle Stomps und direkte Bühnenenergie',palette:{primary:'#ff6073',secondary:'#2b2735',glow:'#f9f65e'},light:1.15,beam:1.1,fx:1.1,camera:1.13},
 indiepop:{...BASE_GENRE_VISUAL_PROFILES_V352.pop,label:'Indie-Pop',description:'Weiche Pastellfarben, dezente Bewegung und luftige Lyrics',palette:{primary:'#e3a6d9',secondary:'#586ac4',glow:'#ffe1b3'},light:.75,beam:.57,fx:.55,camera:.56},
 electropop:{...BASE_GENRE_VISUAL_PROFILES_V352.pop,label:'Electro-Pop',description:'Kühle Neonflächen und präziser Synth-Groove',theme:'neon',palette:{primary:'#62f3e7',secondary:'#7545bd',glow:'#ffc5ef'},light:.96,beam:.93,fx:.92,camera:.84},
 dancepop:{...BASE_GENRE_VISUAL_PROFILES_V352.pop,label:'Dance-Pop',description:'Glänzende Tanzbühne mit knackigen Refrain-Beats',palette:{primary:'#ff86c5',secondary:'#623eda',glow:'#fefa80'},light:1.06,beam:1.04,fx:1.03,camera:.98},
} as const satisfies Record<GenreVisualIdV352,{label:string;description:string;theme:StageEnvironmentId;palette:{primary:string;secondary:string;glow:string};light:number;beam:number;fx:number;camera:number;photo:number}>;
const ids=Object.keys(GENRE_VISUAL_PROFILES_V352) as GenreVisualIdV352[];
const isId=(x:unknown):x is GenreVisualIdV352=>typeof x==='string'&&ids.includes(x as GenreVisualIdV352);
const clamp=(x:number,low:number,high:number)=>Math.max(low,Math.min(high,x));
const finite=(x:unknown,fallback:number)=>typeof x==='number'&&Number.isFinite(x)?clamp(x,0,1):fallback;
export function sanitizeGenreVisualV352(value:unknown):GenreVisualSettingsV352 {
 const s=value&&typeof value==='object'&&!Array.isArray(value)?value as Partial<GenreVisualSettingsV352>:{};
 return {enabled:s.enabled!==false,mode:s.mode==='off'||s.mode==='manual'?s.mode:'auto',
  manualGenre:isId(s.manualGenre)?s.manualGenre:'hiphop',intensity:finite(s.intensity,.78),
  automaticTheme:s.automaticTheme!==false,overrideTheme:s.overrideTheme===true,
  genreColors:s.genreColors!==false,fusionEnabled:s.fusionEnabled!==false,coordinateCamera:s.coordinateCamera!==false,
  coordinateLighting:s.coordinateLighting!==false,coordinatePhotos:s.coordinatePhotos!==false,
  coordinateEffects:s.coordinateEffects!==false};
}
export function readGenreVisualV352():GenreVisualSettingsV352 {
 if(typeof window==='undefined')return {...DEFAULT_GENRE_VISUAL_V352};
 try {const raw=window.localStorage.getItem(GENRE_VISUAL_KEY_V352);return raw===null?{...DEFAULT_GENRE_VISUAL_V352}:sanitizeGenreVisualV352(JSON.parse(raw));}
 catch{return {...DEFAULT_GENRE_VISUAL_V352};}
}
export function saveGenreVisualV352(settings:GenreVisualSettingsV352):GenreVisualSettingsV352 {
 const safe=sanitizeGenreVisualV352(settings);
 if(typeof window!=='undefined'){
  try{window.localStorage.setItem(GENRE_VISUAL_KEY_V352,JSON.stringify(safe));}catch{}
  window.dispatchEvent(new Event(GENRE_VISUAL_EVENT_V352));
 }
 return safe;
}
/** Use the existing detected genre; do not guess a style from a low BPM alone. */
export function resolveGenreVisualV352(value:unknown):GenreVisualIdV352|null {
 if(typeof value!=='string')return null;
 const g=value.toLowerCase().trim().replace(/[_-]/g,' ');
 if(!g)return null;
 if(/hardtekk|hard tekk|tekk|tekno/.test(g))return 'hardtekk';
 if(/hardstyle|rawstyle|rawphoric|euphoric hard|hardcore dance/.test(g))return 'hardstyle';
 if(/deutschrap|german rap|hip.?hop|hiphop|rap|trap|drill|boom bap/.test(g))return 'hiphop';
 if(/ambient|downtempo|chillout|drone/.test(g))return 'ambient';
 if(/rock|metal|punk|grunge/.test(g))return 'rock';
 if(/techno|house|electronic|electro|edm|trance/.test(g))return 'techno';
 if(/pop|dancepop|synthpop|k.?pop/.test(g))return 'pop';
 return isId(g)?g:null;
}
/** V469 live resolver preserves specific genres returned by Last.fm or manually selected. */
export function resolveGenreVisualV469(value:unknown):GenreVisualIdV352|null {
 if(typeof value!=='string')return null;
 const key=value.toLowerCase().trim().replace(/[_\s-]+/g,'');
 if(isId(key))return key;
 const specific:Record<string,GenreVisualIdV352>={
  germanrap:'deutschrap',germanhiphop:'deutschrap',rawhardstyle:'rawstyle',
  hardtek:'hardtekk',hardtekno:'hardtekk',hardtechno:'hardtechno',industrialtechno:'hardtechno',
  drumandbass:'dnb',drumnbass:'dnb',jungle:'dnb',gabber:'hardcore',
  goatrance:'psytrance',retrowave:'synthwave',soul:'rnb',rhythmandblues:'rnb',
  heavymetal:'metal',
 };
 return specific[key]??resolveGenreVisualV352(value);
}
export function genrePhaseV352(section?:string|null):GenreVisualCueV352['phase'] {
 const s=(section??'').toLowerCase();
 if(/build|rise|pre.?chorus/.test(s))return 'build';
 if(/drop|hook|chorus|refrain|peak|climax/.test(s))return 'peak';
 if(/verse|strophe/.test(s))return 'verse';
 return 'calm';
}
const neutral=(theme:StageEnvironmentId):GenreVisualCueV352=>({
 active:false,genre:null,label:'Bestehende Regie',description:'Keine Genre-Eingriffe',theme,palette:null,
 lightGain:1,beamGain:1,fxGain:1,cameraMotion:1,photoMotion:1,photoOpacity:1,
 focus:'balanced',phase:'calm',reason:'Keine Genre-Regie aktiv – bisherige Bühne unverändert',
});
/** All multipliers are bounded; paused/reduced-motion cues never introduce additional movement. */
export function decideGenreVisualV352(input:GenreVisualInputV352,raw:GenreVisualSettingsV352):GenreVisualCueV352 {
 const s=sanitizeGenreVisualV352(raw);
 if(!s.enabled||s.mode==='off')return neutral(input.currentTheme);
 const genre=s.mode==='manual'?s.manualGenre:resolveGenreVisualV469(input.genre);
 if(!genre)return neutral(input.currentTheme);
 const candidate=input.fusion;
 const fusion=s.mode==='auto'&&s.fusionEnabled!==false&&candidate?.primary===genre&&candidate.secondary!==genre&&
  Number.isFinite(candidate.secondaryWeight)&&candidate.secondaryWeight>=.15&&candidate.secondaryWeight<=.45?candidate:null;
 const main=GENRE_VISUAL_PROFILES_V352[genre];
 const secondary=fusion?GENRE_VISUAL_PROFILES_V352[fusion.secondary]:null;
 const w=fusion?.secondaryWeight??0;
 const mix=(a:number,b:number)=>a*(1-w)+b*w;
 const mixHex=(a:string,b:string)=>'#'+[1,3,5].map(i=>Math.round(mix(parseInt(a.slice(i,i+2),16),parseInt(b.slice(i,i+2),16))).toString(16).padStart(2,'0')).join('');
 const p=secondary?{
   ...main,label:`${main.label} + ${secondary.label}`,description:`${main.description} / ${secondary.description}`,
   palette:{primary:mixHex(main.palette.primary,secondary.palette.primary),secondary:mixHex(main.palette.secondary,secondary.palette.secondary),glow:mixHex(main.palette.glow,secondary.palette.glow)},
   light:mix(main.light,secondary.light),beam:mix(main.beam,secondary.beam),fx:mix(main.fx,secondary.fx),
   camera:mix(main.camera,secondary.camera),photo:mix(main.photo,secondary.photo),
 }:main;
 const phase=genrePhaseV352(input.section);
 const lyric=!!input.lyricsActive;
 const beat=finite(input.beatAccent,0);
 const intensity=s.intensity;
 const peak=phase==='peak'?1:phase==='build'?.54:phase==='verse'?.21:0;
 const energy=input.playing?clamp(.28+peak*.60+beat*.12,0,1):0;
 const calm=input.reducedMotion||!input.playing;
 const blend=(base:number)=>clamp(1+(base-1)*intensity*(.45+.55*energy),.35,1.3);
 const lyricsLight=lyric? .88:1;
 const lyricsFx=lyric? .8:1;
 const camera=calm?0:clamp(blend(p.camera)*(lyric?.8:1),.28,1.24);
 const photoMotion=calm?0:clamp(blend(p.photo)*(lyric?.75:1),0,1.24);
 const focus:GenreVisualCueV352['focus']=lyric&&phase==='verse'?'lyrics':phase==='peak'?'avatars':!lyric&&(phase==='calm'||phase==='verse')?'photos':'balanced';
 const automaticTheme=s.automaticTheme&&(s.overrideTheme||input.currentTheme==='classic');
 return {active:true,genre,label:p.label,description:p.description,
  theme:automaticTheme?p.theme:input.currentTheme,palette:s.genreColors?p.palette:null,
  lightGain:s.coordinateLighting?clamp(blend(p.light)*lyricsLight,.5,1.25):1,
  beamGain:s.coordinateLighting?clamp(blend(p.beam)*lyricsLight,.4,1.28):1,
  fxGain:s.coordinateEffects?clamp(blend(p.fx)*lyricsFx,.4,1.28):1,
  cameraMotion:s.coordinateCamera?camera:1,
  photoMotion:s.coordinatePhotos?photoMotion:1,
  photoOpacity:s.coordinatePhotos&&lyric? 1-.11*intensity:1,focus,phase,
  reason:`${p.label}: ${phase==='peak'?'Hook/Drop mit Avatar-Fokus':phase==='build'?'Aufbau der Lichtspannung':phase==='verse'?'ruhige, lesbare Verse':'ruhiger Bühnenaufbau'}${lyric?' · Lyrics geschützt':''}`,
 };
}
/** Apply relative genre gains while preserving the hard V351 lyrics/safety limits.
 * Paused and reduced-motion photos always remain still even when V351 is disabled. */
export function mergeGenreCompositionV352(stage:SmartStageCueV351,genre:GenreVisualCueV352):SmartStageCueV351 {
 if(!genre.active)return stage;
 return {...stage,
  lightGain:stage.protectLyrics?Math.min(stage.lightGain,clamp(stage.lightGain*genre.lightGain,0,1.25)):clamp(stage.lightGain*genre.lightGain,0,1.25),
  beamGain:stage.protectLyrics?Math.min(stage.beamGain,clamp(stage.beamGain*genre.beamGain,0,1.28)):clamp(stage.beamGain*genre.beamGain,0,1.28),
  fxGain:stage.protectLyrics?Math.min(stage.fxGain,clamp(stage.fxGain*genre.fxGain,0,1.28)):clamp(stage.fxGain*genre.fxGain,0,1.28),
  photoOpacity:Math.min(stage.photoOpacity,genre.photoOpacity),
  photoMotionCap:Math.min(stage.photoMotionCap,genre.photoMotion===0?0:stage.photoMotionCap*genre.photoMotion),
  // Genre camera movement is handled by automatic camera director, not authored keyframes.
 };
}
/** Photo policy runs after V350/V351; this also works if V351 is switched off. */
export function coordinateGenrePhotosV352<T extends {visiblePhotos:number;photoOpacity:number;photoMotion:number}>(photo:T,genre?:GenreVisualCueV352):T {
 if(!genre?.active)return photo;
 return {...photo,
  photoOpacity:Math.min(photo.photoOpacity,genre.photoOpacity),
  photoMotion:Math.min(photo.photoMotion,genre.photoMotion===0?0:photo.photoMotion*genre.photoMotion),
 };
}
