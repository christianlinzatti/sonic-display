/** V909: browser-local settings and gentle genre-aware Govee lighting cues. */
import type {AudioFeatures} from '@/types/audio';
export const GOVEE_CONFIG_KEY_V909='sonic-display:govee-lan-v909';
export const GOVEE_CONFIG_EVENT_V909='sonic-display:govee-lan-config-changed';
export type GoveeRoleSelectionV911='auto'|'wall'|'rhythm'|'neon'|'ambient';
export type GoveeConfigV909={endpoint:string;token:string;enabled:boolean;autoSync:boolean;selectedIps:string[];masterBrightness:number;sensitivity:number;directorEnabledV911:boolean;directorStrengthV911:number;deviceRolesV911:Record<string,GoveeRoleSelectionV911>;showEnabledV912:boolean;selectedShowIdV912:string};
export type GoveeDeviceV909={ip:string;sku:string;name:string;device:string;manual?:boolean;lastSeen?:number|null;online?:boolean;status?:{on:boolean|null;brightness:number|null;color:{r:number;g:number;b:number}|null}};
export type GoveeColorV909={r:number;g:number;b:number};
export type GoveeLookV909={color:GoveeColorV909;brightness:number};
export const DEFAULT_GOVEE_CONFIG_V909:GoveeConfigV909={endpoint:'http://127.0.0.1:8765',token:'',enabled:false,autoSync:false,selectedIps:[],masterBrightness:65,sensitivity:55,directorEnabledV911:false,directorStrengthV911:65,deviceRolesV911:{},showEnabledV912:false,selectedShowIdV912:''};
const privateIp=(value:string)=>{
 const parts=value.split('.');if(parts.length!==4||parts.some(p=>!/^\d{1,3}$/.test(p)||Number(p)>255))return false;
 const [a,b]=parts.map(Number);return a===10||(a===172&&b>=16&&b<=31)||(a===192&&b===168);
};
export const isGoveeLanIpV909=privateIp;
export function validBridgeUrlV909(input:string):string{
 const url=new URL(input);
 if(url.username||url.password||url.search||url.hash||url.pathname!=='/'&&url.pathname!=='')throw Error('Bridge-Adresse ohne Pfad, Benutzer oder Parameter angeben.');
 const loopback=['localhost','127.0.0.1'].includes(url.hostname);
 if(!(url.protocol==='https:'||(loopback&&url.protocol==='http:')))throw Error('Nur localhost (HTTP) oder eine HTTPS-Bridge ist erlaubt.');
 return url.origin;
}
const clamp=(v:number,min:number,max:number)=>Math.max(min,Math.min(max,Number.isFinite(v)?v:min));
export function normalizeGoveeConfigV909(raw:unknown):GoveeConfigV909{
 const obj=raw&&typeof raw==='object'&&!Array.isArray(raw)?raw as Partial<GoveeConfigV909>:{};
 let endpoint=DEFAULT_GOVEE_CONFIG_V909.endpoint;
 try{if(typeof obj.endpoint==='string')endpoint=validBridgeUrlV909(obj.endpoint);}catch{/* fallback */}
 return {endpoint,token:typeof obj.token==='string'?obj.token.slice(0,200):'',enabled:obj.enabled===true,autoSync:obj.autoSync===true,
  selectedIps:Array.isArray(obj.selectedIps)?[...new Set(obj.selectedIps.filter((ip):ip is string=>typeof ip==='string'&&privateIp(ip)))].slice(0,32):[],
  masterBrightness:Math.round(clamp(Number(obj.masterBrightness??65),1,100)),sensitivity:Math.round(clamp(Number(obj.sensitivity??55),0,100)),
  directorEnabledV911:obj.directorEnabledV911===true,showEnabledV912:obj.showEnabledV912===true,selectedShowIdV912:typeof obj.selectedShowIdV912==='string'&&/^[a-zA-Z0-9_-]{4,72}$/.test(obj.selectedShowIdV912)?obj.selectedShowIdV912:'',directorStrengthV911:Math.round(clamp(Number(obj.directorStrengthV911??65),0,100)),
  deviceRolesV911:Object.fromEntries(Object.entries(obj.deviceRolesV911&&typeof obj.deviceRolesV911==='object'&&!Array.isArray(obj.deviceRolesV911)?obj.deviceRolesV911:{})
   .filter(([ip,role])=>privateIp(ip)&&['auto','wall','rhythm','neon','ambient'].includes(String(role))).slice(0,32)) as Record<string,GoveeRoleSelectionV911>};
}
export function loadGoveeConfigV909():GoveeConfigV909{
 if(typeof window==='undefined')return {...DEFAULT_GOVEE_CONFIG_V909};
 try{return normalizeGoveeConfigV909(JSON.parse(localStorage.getItem(GOVEE_CONFIG_KEY_V909)||'null'));}catch{return {...DEFAULT_GOVEE_CONFIG_V909};}
}
export function saveGoveeConfigV909(config:GoveeConfigV909){
 localStorage.setItem(GOVEE_CONFIG_KEY_V909,JSON.stringify(normalizeGoveeConfigV909(config)));
 window.dispatchEvent(new Event(GOVEE_CONFIG_EVENT_V909));
}
export async function goveeBridgeRequestV909<T>(config:GoveeConfigV909,path:string,method:'GET'|'POST'='GET',body?:object):Promise<T>{
 const endpoint=validBridgeUrlV909(config.endpoint);
 if(!config.token.trim())throw Error('Bitte zuerst den Bridge-Token eintragen.');
 const controller=new AbortController();const timeout=setTimeout(()=>controller.abort(),2400);
 try{
  // Chromium's Local Network Access: explicitly identify localhost as a loopback target.
  // Permissions remain browser-controlled; no unsafe Chromium flag is required.
  const isLoopback=['localhost','127.0.0.1'].includes(new URL(endpoint).hostname);
  const request:RequestInit&{targetAddressSpace?:'loopback'}={method,headers:{Authorization:'Bearer '+config.token.trim(),...(body?{'Content-Type':'application/json'}:{})},
   body:body?JSON.stringify(body):undefined,signal:controller.signal,cache:'no-store',
   ...(isLoopback?{targetAddressSpace:'loopback' as const}:{})};
  const response=await fetch(endpoint+path,request);
  const data:unknown=await response.json();
  if(!response.ok){const message=(data&&typeof data==='object'&&'error' in data&&typeof data.error==='string')?data.error:`HTTP ${response.status}`;throw Error(message);}
  return data as T;
 }catch(error){
  if(controller.signal.aborted)throw Error('Govee Bridge antwortet nicht (Timeout).');
  if(error instanceof TypeError)throw Error('Bridge nicht erreichbar. Auf dem Raspberry Pi den Dienst prüfen und im Chromium die Berechtigung „Lokales Netzwerk/Loopback“ für die Vercel-Seite zulassen.');
  throw error;
 }finally{clearTimeout(timeout);}
}
function mix(a:GoveeColorV909,b:GoveeColorV909,t:number):GoveeColorV909{
 return {r:Math.round(a.r+(b.r-a.r)*t),g:Math.round(a.g+(b.g-a.g)*t),b:Math.round(a.b+(b.b-a.b)*t)};
}
/** Smooth 450+ ms changes, no strobe. Synthetic audio pulses are intentionally subtle. */
export function planGoveeLookV909(args:{genre:string;progressMs:number;durationMs:number;metrics:Pick<AudioFeatures,'bass'|'beatStrength'|'energyEnvelope'|'volume'>;microphoneActive:boolean;config:GoveeConfigV909;}):GoveeLookV909{
 const g=args.genre.toLowerCase();
 let a={r:100,g:22,b:110},b={r:25,g:38,b:120};
 if(/hardtekk|hardtek|hardstyle|rawstyle|hardcore|techno/.test(g)){a={r:10,g:130,b:255};b={r:205,g:15,b:190};}
 else if(/deutschrock|rock|metal|industrial|ndh/.test(g)){a={r:245,g:85,b:12};b={r:155,g:12,b:30};}
 else if(/rap|hip.hop|trap|drill|grime/.test(g)){a={r:135,g:10,b:25};b={r:73,g:15,b:132};}
 const section=Math.floor(clamp(args.progressMs,0,Math.max(1,args.durationMs))/Math.max(12000,args.durationMs/7));
 const cycle=Math.floor(args.progressMs/4500)%2;
 const color=mix(cycle===0?a:b,cycle===0?b:a,0.12+0.20*(0.5+0.5*Math.sin(args.progressMs/3000)));
 const env=clamp(args.metrics.energyEnvelope||args.metrics.volume,0,1);
 const beat=clamp(args.metrics.bass*0.7+args.metrics.beatStrength*0.3,0,1);
 const sensitivity=clamp(args.config.sensitivity/100,0,1);
 const baseline=args.config.masterBrightness;
 // Cap movement; no rapid flashing, floor at 20% when sync is active.
 const pulse=(args.microphoneActive?beat:beat*0.40)*sensitivity;
 const brightness=Math.round(clamp(baseline*(0.70+0.25*env+0.25*pulse)+(section%3===2?4:0),20,Math.min(100,baseline+12)));
 return {color,brightness};
}
