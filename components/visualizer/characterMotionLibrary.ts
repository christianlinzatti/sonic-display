import {suggestMotionCategoryV535,validMotionCategoryV535,validMotionFingerprintV535,type MotionCategoryV535} from "./motionLibraryIntelligenceV535";
import {readGenreDanceSettings,rankGenreDanceMotions} from "./genreSpecificDanceIntelligence";
export type InstalledCharacterMotion = { id: string; avatarId: string; name: string; url: string; genre: string; bpmMin: number; bpmMax: number; section: "any" | "build" | "drop" | "verse" | "hook"; addedAt: number; category?: MotionCategoryV535; favorite?: boolean; fingerprint?: string };
export type CharacterMotionStore = { version: 1; motions: InstalledCharacterMotion[]; automatic: boolean };
export const CHARACTER_MOTION_CHANGE_EVENT = "sonic:character-motions-changed";
const STORAGE_KEY = "sonic.character.motion.library.v190";
const EMPTY: CharacterMotionStore = {version:1,motions:[],automatic:false};
const GENRES = new Set(["", "hardtekk", "hardstyle", "techno", "deutschrap", "hip-hop", "rock", "ambient", "pop", "other"]);
function goodUrl(value:unknown): value is string { return typeof value === "string" && value.length > 0 && value.length < 2048 && (/^https:\/\//.test(value) || /^\/((?!\/)[^?#]*)/.test(value)); }
export function sanitizeCharacterMotionStore(input: unknown): CharacterMotionStore {
  if (!input || typeof input !== "object") return {...EMPTY};
  const data = input as Record<string,unknown>;
  const motions: InstalledCharacterMotion[] = [];
  if (Array.isArray(data.motions)) for (const raw of data.motions.slice(-500)) {
    if (!raw || typeof raw !== "object") continue;
    const m = raw as Record<string,unknown>;
    if (typeof m.id !== "string" || !/^[\w-]{1,100}$/.test(m.id) || typeof m.avatarId !== "string" || m.avatarId.length > 160 || typeof m.name !== "string" || !m.name.trim() || m.name.length > 100 || !goodUrl(m.url)) continue;
    const section = ["any","build","drop","verse","hook"].includes(String(m.section)) ? m.section as InstalledCharacterMotion["section"] : "any";
    const genre = GENRES.has(String(m.genre)) ? String(m.genre) : "";
    const bpmMin = Number.isFinite(m.bpmMin) ? Math.max(0,Math.min(300,Number(m.bpmMin))) : 0;
    const bpmMax = Number.isFinite(m.bpmMax) ? Math.max(bpmMin,Math.min(300,Number(m.bpmMax))) : 300;
    const next = {id:m.id,avatarId:m.avatarId,name:m.name.trim(),url:m.url,genre,bpmMin,bpmMax,section,addedAt:Number.isFinite(m.addedAt)?Number(m.addedAt):0,category:validMotionCategoryV535(m.category)?m.category:suggestMotionCategoryV535(String(m.name)),favorite:m.favorite===true,...(validMotionFingerprintV535(m.fingerprint)?{fingerprint:m.fingerprint}:{})};
    const prev = motions.findIndex(x=>x.id===next.id);if(prev>=0)motions.splice(prev,1);motions.push(next);
  }
  return {version:1,motions:motions.slice(-250),automatic:data.automatic===true};
}
export function loadCharacterMotionStore(): CharacterMotionStore {
  if (typeof window === "undefined") return {...EMPTY};
  try { return sanitizeCharacterMotionStore(JSON.parse(localStorage.getItem(STORAGE_KEY)||"null")); } catch { return {...EMPTY}; }
}
export function saveCharacterMotionStore(input: CharacterMotionStore): CharacterMotionStore {
  const safe=sanitizeCharacterMotionStore(input);
  if (typeof window !== "undefined") {localStorage.setItem(STORAGE_KEY,JSON.stringify(safe));window.dispatchEvent(new Event(CHARACTER_MOTION_CHANGE_EVENT));}
  return safe;
}
export function addCharacterMotion(avatarId:string,name:string,url:string,metadata?:{fingerprint?:string;category?:MotionCategoryV535}) {
  const store=loadCharacterMotionStore();
  if(store.motions.some(m=>m.avatarId===avatarId&&(m.url===url||(validMotionFingerprintV535(metadata?.fingerprint)&&m.fingerprint===metadata.fingerprint))))return store;
  return saveCharacterMotionStore({...store,motions:[...store.motions,{id:crypto.randomUUID(),avatarId,name,url,genre:"",bpmMin:0,bpmMax:300,section:"any",addedAt:Date.now(),category:metadata?.category??suggestMotionCategoryV535(name),...(validMotionFingerprintV535(metadata?.fingerprint)?{fingerprint:metadata.fingerprint}:{})}]});
}
export function chooseCharacterMotion(store:CharacterMotionStore,avatarId:string,genre:string,bpm:number|undefined,section:string, fallback:string|undefined):string|undefined {
  if(!store.automatic)return fallback;
  const genreSettings=readGenreDanceSettings();
  if(genreSettings.enabled){
    const style=genreSettings.override==="auto"?genre:genreSettings.override;
    const matches=rankGenreDanceMotions(store.motions,avatarId,style,section==="break"?"break":section==="drop"?"drop":section==="build"?"build":"verse",bpm,section==="drop"?1:section==="break"?.2:.55,genreSettings.strength);
    if(matches.length)return matches[0].url;
  }
  const eligible=store.motions.filter(m=>m.avatarId===avatarId&&(!m.genre||m.genre===genre.toLowerCase())&&(!Number.isFinite(bpm)||(bpm!>=m.bpmMin&&bpm!<=m.bpmMax))&&(m.section==="any"||m.section===section||(section==="hook"&&m.section==="verse")));
  if(!eligible.length)return fallback;
  return eligible.slice().sort((a,b)=>Number(Boolean(b.genre))-Number(Boolean(a.genre))||Number(b.section!=="any")-Number(a.section!=="any")||b.addedAt-a.addedAt)[0].url;
}
