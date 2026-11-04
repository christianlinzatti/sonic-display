/** V923 – opt-in, pure whole-lamp neon movements in the existing V909 LAN cadence.
 * Long color fades follow playback progress; bass mode requires fresh *measured*
 * microphone impulses. No RGBIC segments, independent network loop or power commands.
 */
import type {GoveeLookV909,GoveeColorV909} from '@/lib/goveeLanV909';
import type {GoveeRoleV911} from '@/lib/goveeConcertDirectorV911';
import type {GoveeBassEnvelopeV917} from '@/lib/goveeBassReactiveV917';

export const GOVEE_NEON_KEY_V923='sonic-display:govee-neon-pulse-v923';
export const GOVEE_NEON_EVENT_V923='sonic-display:govee-neon-pulse-changed-v923';
export type GoveeNeonModeV923='flow'|'breathe'|'bass';
export type GoveeNeonPaletteV923='genre'|'violet-cyan'|'pink-blue'|'amber-red';
export type GoveeNeonScopeV923='neon'|'all';
export type GoveeNeonSettingsV923={enabled:boolean;mode:GoveeNeonModeV923;palette:GoveeNeonPaletteV923;
 scope:GoveeNeonScopeV923;intensity:number;colorMixPercent:number;periodMs:number;staggerMs:number;maxBoostPoints:number};
export const DEFAULT_GOVEE_NEON_V923:GoveeNeonSettingsV923={enabled:false,mode:'flow',palette:'genre',
 scope:'neon',intensity:60,colorMixPercent:22,periodMs:8500,staggerMs:380,maxBoostPoints:6};
const clamp=(v:number,min:number,max:number)=>Math.max(min,Math.min(max,Number.isFinite(v)?v:min));
const safeNumber=(v:unknown,fallback:number,min:number,max:number,step=1)=>typeof v==='number'&&Number.isFinite(v)
 ?clamp(Math.round(clamp(v,min,max)/step)*step,min,max):fallback;
const modes:readonly GoveeNeonModeV923[]=['flow','breathe','bass'];
const palettes:readonly GoveeNeonPaletteV923[]=['genre','violet-cyan','pink-blue','amber-red'];
const scopes:readonly GoveeNeonScopeV923[]=['neon','all'];
export function normalizeGoveeNeonV923(raw:unknown):GoveeNeonSettingsV923{
 const v=raw&&typeof raw==='object'&&!Array.isArray(raw)?raw as Partial<GoveeNeonSettingsV923>:{};
 return {enabled:v.enabled===true,mode:modes.includes(v.mode as GoveeNeonModeV923)?v.mode!:'flow',
  palette:palettes.includes(v.palette as GoveeNeonPaletteV923)?v.palette!:'genre',
  scope:scopes.includes(v.scope as GoveeNeonScopeV923)?v.scope!:'neon',
  intensity:safeNumber(v.intensity,60,0,100,5),colorMixPercent:safeNumber(v.colorMixPercent,22,0,35),
  periodMs:safeNumber(v.periodMs,8500,4000,18000,100),staggerMs:safeNumber(v.staggerMs,380,0,1200,20),
  maxBoostPoints:safeNumber(v.maxBoostPoints,6,0,8)};
}
export function loadGoveeNeonV923():GoveeNeonSettingsV923{
 if(typeof window==='undefined')return {...DEFAULT_GOVEE_NEON_V923};
 try{return normalizeGoveeNeonV923(JSON.parse(localStorage.getItem(GOVEE_NEON_KEY_V923)||'null'));}
 catch{return {...DEFAULT_GOVEE_NEON_V923};}
}
export function saveGoveeNeonV923(raw:GoveeNeonSettingsV923):void{
 if(typeof window==='undefined')return;
 localStorage.setItem(GOVEE_NEON_KEY_V923,JSON.stringify(normalizeGoveeNeonV923(raw)));
 window.dispatchEvent(new Event(GOVEE_NEON_EVENT_V923));
}
const color=(r:number,g:number,b:number):GoveeColorV909=>({r,g,b});
const neonPalettes:Readonly<Record<Exclude<GoveeNeonPaletteV923,'genre'>,
 readonly [GoveeColorV909,GoveeColorV909]>>={
 'violet-cyan':[color(135,29,225),color(9,209,235)],
 'pink-blue':[color(246,39,145),color(36,100,238)],
 'amber-red':[color(255,119,28),color(207,32,70)],
};
export function resolveGoveeNeonPaletteV923(palette:GoveeNeonPaletteV923,genre:unknown):readonly [GoveeColorV909,GoveeColorV909]{
 if(palette!=='genre')return neonPalettes[palette]??neonPalettes['violet-cyan'];
 const g=typeof genre==='string'?genre.trim().toLowerCase():'';
 if(/hardtekk|uptempo|hardtek/.test(g))return [color(23,232,231),color(177,28,239)];
 if(/hardstyle|rawstyle|hardcore/.test(g))return [color(42,120,244),color(164,48,239)];
 if(/deutschrock|rock|metal|industrial|ndh/.test(g))return neonPalettes['amber-red'];
 if(/deutschrap|rap|trap|drill|hiphop|hip.hop/.test(g))return [color(168,46,207),color(51,103,225)];
 return neonPalettes['violet-cyan'];
}
const lerpColor=(a:GoveeColorV909,b:GoveeColorV909,t:number):GoveeColorV909=>({
 r:Math.round(a.r+(b.r-a.r)*t),g:Math.round(a.g+(b.g-a.g)*t),b:Math.round(a.b+(b.b-a.b)*t)});
export type GoveeNeonDecisionV923={active:boolean;level:number;color:GoveeColorV909;reason:string};
const inactive=(reason:string):GoveeNeonDecisionV923=>({active:false,level:0,color:color(0,0,0),reason});
/** Time is the track-local music position, never Date.now(), so pause/track reset
 * do not create fake movement. Bass mode uses the V917 onset detector only.
 */
export function planGoveeNeonV923(x:{progressMs:number;genre:unknown;role:GoveeRoleV911;
 deviceIndex:number;deviceCount:number;microphoneFresh:boolean;now:number;envelope:GoveeBassEnvelopeV917},
 settings:GoveeNeonSettingsV923):GoveeNeonDecisionV923{
 const s=normalizeGoveeNeonV923(settings);
 if(!s.enabled||s.intensity===0||(s.colorMixPercent===0&&s.maxBoostPoints===0))return inactive('V923 deaktiviert');
 if(!Number.isFinite(x.progressMs)||x.progressMs<0||!Number.isInteger(x.deviceIndex)||x.deviceIndex<0||
   !Number.isInteger(x.deviceCount)||x.deviceCount<1||x.deviceIndex>=x.deviceCount)return inactive('Ungültige Musik- oder Geräteposition');
 if(s.scope==='neon'&&x.role!=='neon')return inactive('Nur Neon-Rolle ausgewählt');
 const angle=2*Math.PI*(x.progressMs-x.deviceIndex*s.staggerMs)/s.periodMs;
 const wave=.5+.5*Math.sin(angle);
 let level=s.mode==='breathe' ? .2+.8*wave : wave;
 if(s.mode==='bass'){
  const age=x.now-x.envelope.lastKickAt;
  if(!x.microphoneFresh||x.envelope.hits<=0||!Number.isFinite(age)||age<0||age>1400||!Number.isFinite(x.envelope.pulse))
   return inactive('Kein aktueller bestätigter Mikrofon-Bassimpuls');
  level=clamp(x.envelope.pulse,0,1)*Math.pow(1-age/1400,.65);
  if(level<=0)return inactive('Bassimpuls abgeklungen');
 }
 const pair=resolveGoveeNeonPaletteV923(s.palette,x.genre);
 // Flow: colors shift independently across physical *whole lamps* in a user-defined order.
 const tint=lerpColor(pair[0],pair[1],s.mode==='bass'?.5+.5*Math.cos(angle):wave);
 return {active:true,level:clamp(level,0,1),color:tint,reason:s.mode==='bass'?'Gemessener Bassimpuls':'Sanfter zeitbasierter Neonverlauf'};
}
/** Works on the ungrouped V921/V922 look. V915 group dimming MUST happen
 * afterwards; the app's existing V911 per-tick smoothing limits every RGB step.
 */
export function applyGoveeNeonV923(base:GoveeLookV909,decision:GoveeNeonDecisionV923,
 settings:GoveeNeonSettingsV923,masterBrightness:number):GoveeLookV909{
 const s=normalizeGoveeNeonV923(settings);
 if(!s.enabled||!decision.active||s.intensity===0)return base;
 const level=clamp(decision.level,0,1),intensity=s.intensity/100;
 const mix=clamp(s.colorMixPercent/100*level*intensity,0,.35);
 const safeColor={r:clamp(base.color.r,0,255),g:clamp(base.color.g,0,255),b:clamp(base.color.b,0,255)};
 const nextColor=mix>0?lerpColor(safeColor,decision.color,mix):base.color;
 const original=clamp(base.brightness,1,100);
 const boost=Math.round(level*intensity*s.maxBoostPoints);
 const ceiling=Math.max(original,Math.min(100,clamp(masterBrightness,1,100)+12));
 const brightness=Math.min(ceiling,original+boost);
 if(mix===0&&brightness===base.brightness)return base;
 return {color:nextColor,brightness};
}
/** Preview is pure, synthetic and does not read storage, mutate a show or touch LAN. */
export function previewGoveeNeonV923(settings:GoveeNeonSettingsV923,genre:string,elapsedMs:number,
 count=4,masterBrightness=75){
 const s={...normalizeGoveeNeonV923(settings),enabled:true};
 const roles:GoveeRoleV911[]=['wall','rhythm','neon','ambient'];
 const samples=Math.min(12,Math.max(0,Math.round(count)));
 return Array.from({length:samples},(_,deviceIndex)=>{
  const role=roles[deviceIndex]??'ambient';
  const envelope:GoveeBassEnvelopeV917={lastAt:5000,lastKickAt:5000,lastLevel:.9,floor:.2,pulse:.9,hits:1};
  const progressMs=Math.max(0,elapsedMs);
  const decision=planGoveeNeonV923({progressMs,genre,role,deviceIndex,deviceCount:samples,
   microphoneFresh:true,now:5000+progressMs,envelope},s);
  const look=applyGoveeNeonV923({color:color(96,38,160),brightness:48},decision,s,masterBrightness);
  return {deviceIndex,role,decision,look};
 });
}
