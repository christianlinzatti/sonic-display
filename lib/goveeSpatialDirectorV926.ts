/** V926 – Smart Spatial Light Director.
 * Browser-local positions for whole Govee fixtures, not physical coordinates,
 * GPS, independent RGBIC pixels, or extra network traffic.
 * A single deterministic order drives existing V922/V923/V925 fixture waves.
 * The optional slow spatial crest is applied BEFORE V915 group dimming/V911 easing.
 */
import type {GoveeColorV909,GoveeLookV909} from '@/lib/goveeLanV909';
import type {GoveeRoleV911} from '@/lib/goveeConcertDirectorV911';

export const GOVEE_SPATIAL_KEY_V926='sonic-display:govee-spatial-director-v926';
export const GOVEE_SPATIAL_EVENT_V926='sonic-display:govee-spatial-director-changed-v926';
export const GOVEE_SPATIAL_DIRECTIONS_V926=['left-right','right-left','stage-audience','audience-stage','clockwise','counterclockwise'] as const;
export type GoveeSpatialDirectionV926=typeof GOVEE_SPATIAL_DIRECTIONS_V926[number];
export type GoveeSpatialPointV926={x:number;y:number};
export type GoveeSpatialSettingsV926={schema:'govee-spatial-director-v926';enabled:boolean;
 direction:GoveeSpatialDirectionV926;positions:Record<string,GoveeSpatialPointV926>;
 strength:number;colorMixPercent:number;maxBoostPoints:number;periodMs:number};
export const DEFAULT_GOVEE_SPATIAL_V926:GoveeSpatialSettingsV926={
 schema:'govee-spatial-director-v926',enabled:false,direction:'left-right',positions:{},
 strength:55,colorMixPercent:14,maxBoostPoints:5,periodMs:7800,
};
export type GoveeSpatialDecisionV926={active:boolean;level:number;rank:number;count:number;
 phase:number;color:GoveeColorV909;reason:string};
const clamp=(v:number,min:number,max:number)=>Math.min(max,Math.max(min,Number.isFinite(v)?v:min));
const numeric=(v:unknown,fallback:number,min:number,max:number)=>typeof v==='number'&&Number.isFinite(v)?Math.round(clamp(v,min,max)):fallback;
const privateIp=(ip:string)=>{const parts=ip.split('.');if(parts.length!==4||parts.some(p=>!/^\d{1,3}$/.test(p)||+p>255))return false;
 const a=+parts[0],b=+parts[1];return a===10||(a===172&&b>=16&&b<=31)||(a===192&&b===168);};
const rgb=(r:number,g:number,b:number):GoveeColorV909=>({r,g,b});
const roleFactors:Record<GoveeRoleV911,number>={wall:1,rhythm:.96,neon:.92,ambient:.55};

export function normalizeGoveeSpatialV926(raw:unknown):GoveeSpatialSettingsV926{
 const o=raw&&typeof raw==='object'&&!Array.isArray(raw)?raw as Partial<GoveeSpatialSettingsV926>:{};
 const positions:Record<string,GoveeSpatialPointV926>={};
 if(o.positions&&typeof o.positions==='object'&&!Array.isArray(o.positions)){
  for(const [ip,p] of Object.entries(o.positions).slice(0,32)){
   if(!privateIp(ip)||!p||typeof p!=='object'||Array.isArray(p))continue;
   const point=p as Partial<GoveeSpatialPointV926>;
   if(typeof point.x!=='number'||!Number.isFinite(point.x)||typeof point.y!=='number'||!Number.isFinite(point.y))continue;
   positions[ip]={x:Math.round(clamp(point.x,0,1)*1000)/1000,y:Math.round(clamp(point.y,0,1)*1000)/1000};
  }
 }
 return {schema:'govee-spatial-director-v926',enabled:o.enabled===true,
  direction:GOVEE_SPATIAL_DIRECTIONS_V926.includes(o.direction as GoveeSpatialDirectionV926)?o.direction as GoveeSpatialDirectionV926:'left-right',
  positions,strength:numeric(o.strength,55,0,100),colorMixPercent:numeric(o.colorMixPercent,14,0,30),
  maxBoostPoints:numeric(o.maxBoostPoints,5,0,8),periodMs:numeric(o.periodMs,7800,3500,16000)};
}
export function loadGoveeSpatialV926():GoveeSpatialSettingsV926{
 if(typeof window==='undefined')return normalizeGoveeSpatialV926(null);
 try{return normalizeGoveeSpatialV926(JSON.parse(localStorage.getItem(GOVEE_SPATIAL_KEY_V926)||'null'));}
 catch{return normalizeGoveeSpatialV926(null);}
}
export function saveGoveeSpatialV926(value:GoveeSpatialSettingsV926):void{
 if(typeof window==='undefined')return;
 localStorage.setItem(GOVEE_SPATIAL_KEY_V926,JSON.stringify(normalizeGoveeSpatialV926(value)));
 window.dispatchEvent(new Event(GOVEE_SPATIAL_EVENT_V926));
}
/** The default layout is a 2x2 room (stage along the top edge); explicit
 * positions are *never* guessed from hardware model names or physical IPs.
 */
export function defaultGoveeSpatialPointV926(index:number,count:number):GoveeSpatialPointV926{
 const n=Math.max(1,Math.min(32,Math.floor(count)||1));
 const columns=Math.ceil(Math.sqrt(n));const rows=Math.ceil(n/columns);
 const i=Math.max(0,Math.min(n-1,Math.floor(index)||0));
 return {x:Math.round((.15+.7*(columns===1?.5:(i%columns)/(columns-1)))*1000)/1000,
  y:Math.round((.15+.7*(rows===1?.5:Math.floor(i/columns)/(rows-1)))*1000)/1000};
}
export function getGoveeSpatialPointV926(ip:string,ips:readonly string[],settings:GoveeSpatialSettingsV926):GoveeSpatialPointV926{
 const index=ips.indexOf(ip);
 return settings.positions[ip]??defaultGoveeSpatialPointV926(Math.max(0,index),ips.length);
}
function orderingScore(p:GoveeSpatialPointV926,d:GoveeSpatialDirectionV926):number{
 if(d==='left-right')return p.x;
 if(d==='right-left')return -p.x;
 if(d==='stage-audience')return p.y;
 if(d==='audience-stage')return -p.y;
 const clockwise=(Math.atan2(p.x-.5,.5-p.y)+Math.PI*2)%(Math.PI*2);
 return d==='clockwise'?clockwise:(Math.PI*2-clockwise)%(Math.PI*2);
}
/** Order is pure, stable and uses positions rather than selectedIps order.
 * Duplicate positions resolve deterministically to the original selection order.
 */
export function resolveGoveeSpatialOrderV926(ips:readonly string[],settings:GoveeSpatialSettingsV926):string[]{
 const unique=[...new Set(ips.filter(ip=>typeof ip==='string'&&privateIp(ip)))].slice(0,32);
 const s=normalizeGoveeSpatialV926(settings);
 return unique.map((ip,index)=>({ip,index,score:orderingScore(getGoveeSpatialPointV926(ip,unique,s),s.direction)}))
  .sort((a,b)=>a.score-b.score||a.index-b.index).map(v=>v.ip);
}
/** Disabled or incomplete spatial layout must retain legacy selection indices. */
export function spatialIndexV926(ips:readonly string[],ip:string,settings:GoveeSpatialSettingsV926):number{
 if(!settings.enabled)return ips.indexOf(ip);
 return resolveGoveeSpatialOrderV926(ips,settings).indexOf(ip);
}
export function spatialPaletteV926(genre:unknown):GoveeColorV909{
 const g=typeof genre==='string'?genre.toLowerCase():'';
 if(/hardtekk|hardtek|uptempo/.test(g))return rgb(26,224,230);
 if(/hardstyle|rawstyle|hardcore/.test(g))return rgb(98,70,242);
 if(/deutschrock|metal|industrial|ndh|rock/.test(g))return rgb(230,93,33);
 if(/deutschrap|rap|hip.?hop|trap|drill/.test(g))return rgb(154,55,205);
 return rgb(70,115,209);
}
const inactive=(reason:string):GoveeSpatialDecisionV926=>({active:false,level:0,rank:-1,count:0,phase:0,color:rgb(0,0,0),reason});
/** Slow, bounded moving crest; NOT a beat/kick or a fabricated drop.
 * progressMs must belong to currently playing track, enforced by caller.
 * Use sourceIp for V915 unison groups so they share a spatial cue.
 */
export function planGoveeSpatialV926(ips:readonly string[],sourceIp:string,progressMs:number,genre:unknown,
 settings:GoveeSpatialSettingsV926):GoveeSpatialDecisionV926{
 const s=normalizeGoveeSpatialV926(settings);
 if(!s.enabled||s.strength===0||(s.colorMixPercent===0&&s.maxBoostPoints===0))return inactive('V926 deaktiviert');
 if(!Number.isFinite(progressMs)||progressMs<0||ips.length<1||ips.length>32)return inactive('Ungültige Songzeit oder Leuchtenzahl');
 const order=resolveGoveeSpatialOrderV926(ips,s);
 const rank=order.indexOf(sourceIp);
 if(rank<0)return inactive('Leuchte nicht für die Show ausgewählt');
 const point=getGoveeSpatialPointV926(sourceIp,ips,s);
 const clockwise=(Math.atan2(point.x-.5,.5-point.y)+Math.PI*2)%(Math.PI*2);
 const fraction=s.direction==='left-right'?point.x:s.direction==='right-left'?1-point.x:
  s.direction==='stage-audience'?point.y:s.direction==='audience-stage'?1-point.y:
  s.direction==='clockwise'?clockwise/(Math.PI*2):((Math.PI*2-clockwise)%(Math.PI*2))/(Math.PI*2);
 const phase=progressMs/s.periodMs-fraction;
 // Slow sinusoidal bloom without negative flashes, blackout, strobe, LAN delay loops.
 const level=(1+Math.cos(2*Math.PI*phase))*.5;
 return {active:true,level,rank,count:order.length,phase:phase-Math.floor(phase),color:spatialPaletteV926(genre),reason:'Raumwelle aus Songzeit'};
}
export function applyGoveeSpatialV926(base:GoveeLookV909,decision:GoveeSpatialDecisionV926,
 role:GoveeRoleV911,settings:GoveeSpatialSettingsV926,masterBrightness:number):GoveeLookV909{
 const s=normalizeGoveeSpatialV926(settings);
 if(!decision.active||!s.enabled||s.strength===0)return base;
 if(!base.color||![base.brightness,base.color.r,base.color.g,base.color.b].every(Number.isFinite))return base;
 const influence=clamp(decision.level,0,1)*s.strength/100*roleFactors[role];
 const mix=clamp(influence*s.colorMixPercent/100,0,.3);
 const blend=(a:number,b:number)=>Math.round(clamp(a+(b-a)*mix,0,255));
 const color=mix>0?{r:blend(base.color.r,decision.color.r),g:blend(base.color.g,decision.color.g),b:blend(base.color.b,decision.color.b)}:base.color;
 const original=clamp(base.brightness,1,100);
 const cap=Math.max(original,Math.min(100,clamp(masterBrightness,1,100)+s.maxBoostPoints));
 const brightness=Math.round(clamp(original+Math.round(influence*s.maxBoostPoints),original,cap));
 return brightness===base.brightness&&mix===0?base:{color,brightness};
}
/** Visual preview only: selected IPs are labels, not network destinations. */
export function previewGoveeSpatialV926(ips:readonly string[],settings:GoveeSpatialSettingsV926,
 progressMs:number,genre:string,masterBrightness=70){
 const s={...normalizeGoveeSpatialV926(settings),enabled:true};
 const order=resolveGoveeSpatialOrderV926(ips,s);
 const roles:GoveeRoleV911[]=['wall','rhythm','neon','ambient'];
 return ips.map((ip,i)=>{
  const role=roles[i%roles.length];
  const decision=planGoveeSpatialV926(ips,ip,progressMs,genre,s);
  const look=applyGoveeSpatialV926({color:rgb(78,54,139),brightness:50},decision,role,s,masterBrightness);
  return {ip,role,position:getGoveeSpatialPointV926(ip,ips,s),rank:order.indexOf(ip),decision,look};
 });
}
