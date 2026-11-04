/** V912 – Local-only, opt-in Govee light-show editor and deterministic cue planner.
 * The library holds no bridge tokens and produces whole-lamp RGB/brightness only.
 */
import type {AudioFeatures} from '@/types/audio';
import {isGoveeLanIpV909, type GoveeColorV909,type GoveeConfigV909,type GoveeLookV909} from '@/lib/goveeLanV909';
import {planGoveeConcertLookV911,type GoveePhaseV911,type GoveePhaseCueV911,type GoveeRoleV911} from '@/lib/goveeConcertDirectorV911';
import type {GoveeTransitionCurveV914,GoveeMotionStyleV914} from '@/lib/goveeTransitionsV914';

export const GOVEE_SHOWS_KEY_V912='sonic-display:govee-light-shows-v912';
export const GOVEE_SHOWS_EVENT_V912='sonic-display:govee-shows-changed-v912';
export const GOVEE_PHASES_V912=['ambient','verse','hook','build','drop','break'] as const;
export type GoveeShowCueV912={color:GoveeColorV909;brightness:number;fadeMs:number;curveV914?:GoveeTransitionCurveV914;motionV914?:GoveeMotionStyleV914};
export type GoveeShowV912={schema:'govee-light-show-v912';id:string;name:string;createdAt:number;updatedAt:number;cues:Record<string,Partial<Record<GoveePhaseV911,GoveeShowCueV912>>>};
const number=(x:unknown,def:number,min:number,max:number)=>Number.isFinite(x)?Math.round(Math.min(max,Math.max(min,x as number))):def;
const record=(x:unknown):Record<string,unknown>=>x!==null&&typeof x==='object'&&!Array.isArray(x)?x as Record<string,unknown>:{};
const clamp=(x:number)=>Math.max(0,Math.min(1,Number.isFinite(x)?x:0));
const channels=['r','g','b'] as const;
const allowedCurvesV914=['smooth','linear','sine','ease-in','ease-out','cinematic'] as const;
const allowedMotionsV914=['steady','breath','lift'] as const;
export function normalizeGoveeCueV912(input:unknown):GoveeShowCueV912{
 const item=record(input),col=record(item.color);
 return {color:{r:number(col.r,0,0,255),g:number(col.g,0,0,255),b:number(col.b,0,0,255)},
  brightness:number(item.brightness,50,20,100),fadeMs:number(item.fadeMs,3200,1200,12000),
  curveV914:typeof item.curveV914==='string'&&allowedCurvesV914.some(x=>x===item.curveV914)?item.curveV914 as GoveeTransitionCurveV914:'smooth',
  motionV914:typeof item.motionV914==='string'&&allowedMotionsV914.some(x=>x===item.motionV914)?item.motionV914 as GoveeMotionStyleV914:'steady'};
}
/** Reject malformed import/library entries instead of silently activating unknown data. */
export function normalizeGoveeShowV912(input:unknown):GoveeShowV912|null{
 const obj=record(input);
 if(obj.schema!=='govee-light-show-v912'||typeof obj.id!=='string'||!/^[a-zA-Z0-9_-]{4,72}$/.test(obj.id)||
    typeof obj.name!=='string'||!obj.name.trim())return null;
 const rawCues=record(obj.cues);
 const cues:GoveeShowV912['cues']=Object.create(null) as GoveeShowV912['cues'];
 for(const [ip,phases] of Object.entries(rawCues).slice(0,32)){
  if(!isGoveeLanIpV909(ip))continue;
  const valid=record(phases);
  const row:Partial<Record<GoveePhaseV911,GoveeShowCueV912>>={};
  for(const phase of GOVEE_PHASES_V912){if(Object.hasOwn(valid,phase))row[phase]=normalizeGoveeCueV912(valid[phase]);}
  if(Object.keys(row).length)cues[ip]=row;
 }
 return {schema:'govee-light-show-v912',id:obj.id,name:obj.name.trim().slice(0,48),
  createdAt:number(obj.createdAt,0,0,4102444800000),updatedAt:number(obj.updatedAt,0,0,4102444800000),cues};
}
export function normalizeGoveeShowLibraryV912(raw:unknown):GoveeShowV912[]{
 if(!Array.isArray(raw))return [];
 const seen=new Set<string>();const result:GoveeShowV912[]=[];
 for(const item of raw.slice(0,24)){
  const show=normalizeGoveeShowV912(item);
  if(show&&!seen.has(show.id)){seen.add(show.id);result.push(show);}
  if(result.length>=12)break;
 }
 return result;
}
export function loadGoveeShowsV912():GoveeShowV912[]{
 if(typeof window==='undefined')return [];
 try{return normalizeGoveeShowLibraryV912(JSON.parse(localStorage.getItem(GOVEE_SHOWS_KEY_V912)||'[]'));}catch{return [];}
}
export function saveGoveeShowsV912(items:GoveeShowV912[]):void{
 const safe=normalizeGoveeShowLibraryV912(items);
 if(items.length>12||safe.length!==items.length)throw Error('Maximal 12 gültige Lichtshows können gespeichert werden.');
 localStorage.setItem(GOVEE_SHOWS_KEY_V912,JSON.stringify(safe));
 window.dispatchEvent(new Event(GOVEE_SHOWS_EVENT_V912));
}
export type GoveeLookPlannerV912={genre:string;progressMs:number;phase:GoveePhaseCueV911;role:GoveeRoleV911;
 metrics:Pick<AudioFeatures,'bass'|'beatStrength'|'energyEnvelope'|'volume'>;microphoneActive:boolean;config:GoveeConfigV909};
const blendLooks=(a:GoveeLookV909,b:GoveeLookV909,t:number):GoveeLookV909=>{
 const eased=clamp(t)**2*(3-2*clamp(t));
 return {brightness:Math.round(a.brightness+(b.brightness-a.brightness)*eased),
  color:{r:Math.round(a.color.r+(b.color.r-a.color.r)*eased),
   g:Math.round(a.color.g+(b.color.g-a.color.g)*eased),b:Math.round(a.color.b+(b.color.b-a.color.b)*eased)}};
};
export function getGoveeFadeMsV912(show:GoveeShowV912|undefined,ip:string,phase:GoveePhaseV911):number{
 return show?.cues[ip]?.[phase]?.fadeMs??3200;
}
/** Uses V911 as fallback for missing per-lamp cues. No inferred drops; ambient is explicit. */
export function planGoveeShowLookV912(args:GoveeLookPlannerV912&{show:GoveeShowV912;ip:string}):GoveeLookV909{
 const single=(phase:GoveePhaseV911):GoveeLookV909=>{
  const fallback=planGoveeConcertLookV911({...args,phase:{phase,previous:phase,transition:1,verified:args.phase.verified}});
  const cue=args.show.cues[args.ip]?.[phase];
  if(!cue)return fallback;
  // The global brightness slider is an upper limit even for custom cues.
  return {color:{...cue.color},brightness:Math.max(20,Math.min(cue.brightness,args.config.masterBrightness))};
 };
 return blendLooks(single(args.phase.previous),single(args.phase.phase),args.phase.transition);
}
/** Return a fresh immutable show draft. The source must never be mutated by the editor. */
export function replaceGoveeShowCueV912(show:GoveeShowV912,ip:string,phase:GoveePhaseV911,raw:unknown):GoveeShowV912{
 if(!isGoveeLanIpV909(ip)||!GOVEE_PHASES_V912.includes(phase as typeof GOVEE_PHASES_V912[number]))return show;
 return {...show,cues:{...show.cues,[ip]:{...(show.cues[ip]??{}),[phase]:normalizeGoveeCueV912(raw)}}};
}
export function colorToHexV912(c:GoveeColorV909):string{
 return '#'+channels.map(k=>number(c[k],0,0,255).toString(16).padStart(2,'0')).join('');
}
export function hexToGoveeColorV912(hex:string):GoveeColorV909{
 if(!/^#[0-9a-fA-F]{6}$/.test(hex))throw Error('Ungültiger RGB-Farbwert.');
 const value=parseInt(hex.slice(1),16);return {r:(value>>16)&255,g:(value>>8)&255,b:value&255};
}
