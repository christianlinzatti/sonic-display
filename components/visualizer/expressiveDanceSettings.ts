import {DEFAULT_EXPRESSIVE_SETTINGS,type ExpressivePersona,type ExpressiveSettings,clampUnit} from "./expressiveDanceCharacters";
export const EXPRESSIVE_EVENT="sonic:expressive-dance-settings-changed";
const STORAGE="sonic.expressive.characters.v205";
const PERSONAS:ExpressivePersona[]=["auto","hard","fluid","playful","subtle"];
function sanitize(source:unknown):ExpressiveSettings {
 const s=(source&&typeof source==="object"?source:{}) as Partial<ExpressiveSettings>;
 const scale=(v:unknown, fallback:number)=>typeof v==="number"&&Number.isFinite(v)?clampUnit(v):fallback;
 return {enabled:s.enabled===true,persona:PERSONAS.includes(s.persona as ExpressivePersona)?s.persona!:"auto",strength:scale(s.strength,DEFAULT_EXPRESSIVE_SETTINGS.strength),headResponse:scale(s.headResponse,DEFAULT_EXPRESSIVE_SETTINGS.headResponse),torsoResponse:scale(s.torsoResponse,DEFAULT_EXPRESSIVE_SETTINGS.torsoResponse)};
}
export function readExpressiveSettings(avatarId:string):ExpressiveSettings {
 if(typeof window==="undefined"||!avatarId)return {...DEFAULT_EXPRESSIVE_SETTINGS};
 try{const all=JSON.parse(window.localStorage.getItem(STORAGE)||"{}");return sanitize(all&&typeof all==="object"?all[avatarId]:undefined);}catch{return {...DEFAULT_EXPRESSIVE_SETTINGS};}
}
export function saveExpressiveSettings(avatarId:string, settings:ExpressiveSettings):ExpressiveSettings {
 const result=sanitize(settings);
 if(typeof window!=="undefined"&&avatarId){try{const raw=JSON.parse(window.localStorage.getItem(STORAGE)||"{}");const all=raw&&typeof raw==="object"&&!Array.isArray(raw)?raw:{};all[avatarId]=result;window.localStorage.setItem(STORAGE,JSON.stringify(all));window.dispatchEvent(new CustomEvent(EXPRESSIVE_EVENT,{detail:{avatarId}}));}catch{ /* private browsing or storage quota */ }}
 return result;
}
