/** V210: deterministic style-aware motion selection, only installed GLB clips. */
import type {InstalledCharacterMotion} from "./characterMotionLibrary";
import type {MusicGenre} from "../../config/musicGenres";
import type {TimelinePhase} from "./musicStructureTimeline";
export type DanceGenre = MusicGenre | "hip-hop" | "other";
export type GenreDanceSettings = {version:1;enabled:boolean;strength:number;override:"auto"|DanceGenre};
export const GENRE_DANCE_EVENT="sonic:genre-specific-dance-changed";
const KEY="sonic.genre-dance.v210";
export const DEFAULT_GENRE_DANCE:GenreDanceSettings={version:1,enabled:false,strength:.75,override:"auto"};
export const DANCE_GENRES:readonly DanceGenre[] = ["hardstyle","hardtekk","techno","hiphop","rock","ambient","pop","deutschrap","trap","drill","boombap","hardtechno","schranz","rawstyle","hardcore","uptempo","house","trance","psytrance","dnb","dubstep","synthwave","reggaeton","metal","rnb","jazz","classical","poprock","indierock","alternativerock","punkrock","indiepop","electropop","dancepop","hip-hop","other"];
const clamp=(n:number,min:number,max:number)=>Number.isFinite(n)?Math.min(max,Math.max(min,n)):min;
/** Historical aliases still behave as in V210; named subgenres get their own motion bias. */
export function normalizeGenre(raw:string|null|undefined):DanceGenre {
 const x=(raw??"").toLowerCase().replace(/[\s_-]/g,"");
 if(/poprock/.test(x))return "poprock";
 if(/indierock/.test(x))return "indierock";
 if(/alternativerock|altrock/.test(x))return "alternativerock";
 if(/punkrock|poppunk/.test(x))return "punkrock";
 if(/indiepop|dreampop/.test(x))return "indiepop";
 if(/electropop|synthpop/.test(x))return "electropop";
 if(/dancepop|clubpop/.test(x))return "dancepop";
 if(/hardtekk|hardtek|tekk/.test(x))return "hardtekk";
 if(/rawstyle|rawphoric/.test(x))return "rawstyle";
 if(/uptempo|frenchcore/.test(x))return "uptempo";
 if(/hardcore|gabber/.test(x))return "hardcore";
 if(/hardtechno|industrialtechno/.test(x))return "hardtechno";
 if(/schranz/.test(x))return "schranz";
 if(/hardstyle|jumpstyle/.test(x))return "hardstyle";
 if(/deutschrap|germanrap|deutschhiphop/.test(x))return "deutschrap";
 if(/boombap/.test(x))return "boombap";
 if(/drill/.test(x)&&!/traprap/.test(x))return "drill";
 if(/traprap/.test(x))return "hip-hop";
 if(/trap/.test(x))return "trap";
 if(/hiphop|rap/.test(x))return "hip-hop";
 if(/psytrance|goatrance/.test(x))return "psytrance";
 if(/trance/.test(x))return "trance";
 if(/drumandbass|drumnbass|dnb|jungle/.test(x))return "dnb";
 if(/dubstep|brostep|riddim/.test(x))return "dubstep";
 if(/synthwave|retrowave/.test(x))return "synthwave";
 if(x==="house"||/^(techhouse|deephouse|progressivehouse)$/.test(x))return "house";
 if(/techno|house|electro/.test(x))return "techno";
 if(/reggaeton|dembow/.test(x))return "reggaeton";
 if(/rnb|soul/.test(x))return "rnb";
 if(/jazz|swing/.test(x))return "jazz";
 if(/classical|klassik|orchestral/.test(x))return "classical";
 if(/ambient|chill|downtempo/.test(x))return "ambient";
 if(/poprock/.test(x))return "poprock";
 if(/indierock/.test(x))return "indierock";
 if(/alternativerock|altrock/.test(x))return "alternativerock";
 if(/punkrock|poppunk/.test(x))return "punkrock";
 if(/indiepop|dreampop/.test(x))return "indiepop";
 if(/electropop|synthpop/.test(x))return "electropop";
 if(/dancepop|clubpop/.test(x))return "dancepop";
 if(/metal/.test(x))return "metal";
 if(/rock/.test(x))return "rock";
 if(/pop/.test(x))return "pop";
 return "other";
}
export function sanitizeGenreDanceSettings(raw:unknown):GenreDanceSettings {
 const s=raw&&typeof raw==="object"?raw as Record<string,unknown>:{};
 const genres=["auto",...DANCE_GENRES];
 return {version:1,enabled:s.enabled===true,strength:clamp(Number(s.strength??.75),0,1),override:genres.includes(String(s.override))?s.override as GenreDanceSettings["override"]:"auto"};
}
export function readGenreDanceSettings():GenreDanceSettings {
 if(typeof window==="undefined")return {...DEFAULT_GENRE_DANCE};
 try{return sanitizeGenreDanceSettings(JSON.parse(localStorage.getItem(KEY)||"null"));}catch{return {...DEFAULT_GENRE_DANCE};}
}
export function writeGenreDanceSettings(value:GenreDanceSettings):GenreDanceSettings {
 const clean=sanitizeGenreDanceSettings(value);
 if(typeof window!=="undefined"){localStorage.setItem(KEY,JSON.stringify(clean));window.dispatchEvent(new Event(GENRE_DANCE_EVENT));}
 return clean;
}
const TOKENS:Record<DanceGenre,RegExp>={
 hardtekk:/tekk|kick|stomp|footwork|gabber|bounce|hardtek/,
 hardstyle:/jump|hardstyle|hardcore|kick|power|stomp/,
 techno:/shuffle|groove|flow|step|techno|wave/,
 deutschrap:/rap|trap|nod|head|bounce|swagger|groove|hiphop/,
 "hip-hop":/hiphop|rap|trap|nod|bounce|groove|swagger/,
 pop:/pop|dance|groove|step|sway/,
 ambient:/ambient|idle|slow|sway|soft|float|relax/,
 rock:/rock|headbang|stomp|jump|power/,
 other:/dance|groove|step/,
 trap:/rap|trap|bounce|808|swagger|nod/,
 drill:/drill|trap|step|nod|groove|stomp/,
 boombap:/boom|bap|rap|nod|groove|hiphop/,
 hardtechno:/hard|techno|shuffle|rave|stomp|kick/,
 schranz:/schranz|industrial|stomp|techno|rave|kick/,
 rawstyle:/raw|hardstyle|jump|stomp|power|kick/,
 hardcore:/gabber|hakken|hardcore|stomp|kick|footwork/,
 uptempo:/uptempo|hakken|gabber|kick|stomp|tekk|jump/,
 house:/house|shuffle|groove|flow|step/,
 trance:/trance|flow|sway|step|wave|shuffle/,
 psytrance:/psy|trance|flow|step|shuffle|bounce/,
 dnb:/dnb|drum|bass|break|step|bounce|footwork/,
 dubstep:/dubstep|bass|wobble|robot|stomp|hit/,
 synthwave:/synth|wave|sway|groove|flow/,
 reggaeton:/reggaeton|latin|hip|salsa|groove|step/,
 metal:/metal|headbang|stomp|head|power|rock/,
 rnb:/rnb|soul|sway|groove|nod|flow/,
 jazz:/jazz|swing|soft|sway|flow|step/,
 classical:/classical|idle|slow|sway|soft|flow/,
 hiphop:/hiphop|rap|trap|nod|bounce|groove|swagger/,
 poprock:/pop|rock|guitar|power|sway|step/,
 indierock:/indie|rock|sway|groove|guitar|step/,
 alternativerock:/alternative|rock|stomp|power|jump/,
 punkrock:/punk|rock|jump|stomp|power|fast/,
 indiepop:/indie|pop|sway|flow|groove/,
 electropop:/electro|synth|pop|dance|wave|groove/,
 dancepop:/dance|pop|groove|bounce|step/,
};
/** A relative preference, NOT an eligibility rule. BPM and avatar filters remain strict. */
/** A motion tagged with a broader parent genre remains a useful fallback. */
const motionFamily=(g:DanceGenre):string=>{
 if(["deutschrap","trap","drill","boombap","hip-hop","rnb"].includes(g))return "hiphop";
 if(["hardtechno","schranz","house","trance","psytrance","dnb","dubstep","synthwave"].includes(g))return "techno";
 if(["rawstyle","hardcore"].includes(g))return "hardstyle";
 if(g==="uptempo")return "hardtekk";
 if(["metal","poprock","indierock","alternativerock","punkrock"].includes(g))return "rock";
 if(["indiepop","electropop","dancepop"].includes(g))return "pop";
 if(["jazz","classical"].includes(g))return "ambient";
 if(g==="reggaeton")return "pop";
 return g;
};
export function scoreGenreMotion(m:InstalledCharacterMotion,genre:string,phase:TimelinePhase|"any",energy:number,bpm?:number,strength=1):number {
 const style=normalizeGenre(genre);const name=m.name.toLowerCase();const rawTag=normalizeGenre(m.genre);
 const tags=m.genre?rawTag===style?2:rawTag==="other"?0:motionFamily(rawTag)===motionFamily(style)?.8:-1:0;
 const matched=TOKENS[style].test(name)?2:0;
 const attack=/kick|jump|stomp|power|hard|gabber/.test(name);
 const smooth=/shuffle|flow|sway|groove|nod|idle|wave/.test(name);
 const e=clamp(energy,0,1);
 const dynamics=attack?(e-.5)*2:smooth?(.5-e)*1.3:0;
 const phaseBonus=phase==="drop"&&attack?1.2:phase==="break"&&smooth?1.2:phase==="build"&&/rise|build|shuffle|step/.test(name)?0.9:0;
 const tempo=Number.isFinite(bpm)&&bpm!>=50&&bpm!<=240&&(bpm!<m.bpmMin||bpm!>m.bpmMax)?-6:0;
 return (tags+matched+dynamics+phaseBonus+tempo)*clamp(strength,0,1);
}
export function rankGenreDanceMotions(motions:InstalledCharacterMotion[],avatarId:string,genre:string,phase:TimelinePhase|"any",bpm:number|undefined,energy:number,strength=1):InstalledCharacterMotion[] {
 return motions.filter(m=>m.avatarId===avatarId&&(bpm===undefined||!Number.isFinite(bpm)||(bpm>=m.bpmMin&&bpm<=m.bpmMax))&&(phase==="any"||m.section==="any"||m.section===phase))
 .sort((a,b)=>scoreGenreMotion(b,genre,phase,energy,bpm,strength)-scoreGenreMotion(a,genre,phase,energy,bpm,strength)||a.id.localeCompare(b.id));
}
