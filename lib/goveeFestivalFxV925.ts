/** V925 – Festival Lighting FX Studio.
 * Pure four-fixture, whole-lamp color/brightness dramaturgy. No RGBIC segments,
 * hardware strobe, LAN polling, storage of credentials or independent send loop.
 * The active CURRENT imported V318 section must match the confirmed V919 cue.
 * The final V915 group dimmer and V911 per-command smoothing remain authoritative.
 */
import type {TrackAnalysisV318,SongSectionV318} from '@/services/musicAnalysis/trackAnalysisV318';
import type {GoveeLookV909,GoveeColorV909} from '@/lib/goveeLanV909';
import type {GoveeSectionDecisionV919} from '@/lib/goveeSectionDirectorV919';
import type {GoveeRoleV911} from '@/lib/goveeConcertDirectorV911';

export const GOVEE_FESTIVAL_KEY_V925='sonic-display:govee-festival-fx-v925';
export const GOVEE_FESTIVAL_EVENT_V925='sonic-display:govee-festival-fx-changed-v925';
export const GOVEE_FESTIVAL_PATTERNS_V925=['auto','arena','mirror','colorfront','finale'] as const;
export type GoveeFestivalPatternV925=typeof GOVEE_FESTIVAL_PATTERNS_V925[number];
export type GoveeFestivalSettingsV925={enabled:boolean;pattern:GoveeFestivalPatternV925;
 strength:number;colorMixPercent:number;maxBoostPoints:number;periodMs:number;
 spreadMs:number;minConfidence:number};
export const DEFAULT_GOVEE_FESTIVAL_V925:GoveeFestivalSettingsV925={
 enabled:false,pattern:'auto',strength:60,colorMixPercent:22,maxBoostPoints:7,
 periodMs:6500,spreadMs:560,minConfidence:70,
};
export type GoveeFestivalDecisionV925={active:boolean;pattern:Exclude<GoveeFestivalPatternV925,'auto'>|'off';
 level:number;color:GoveeColorV909;phase:SongSectionV318|'ambient';sectionIndex:number;reason:string};
const clamp=(n:number,min:number,max:number)=>Math.min(max,Math.max(min,Number.isFinite(n)?n:min));
const safe=(n:unknown,fallback:number,min:number,max:number)=>typeof n==='number'&&Number.isFinite(n)?Math.round(clamp(n,min,max)):fallback;
const smooth=(n:number)=>{const v=clamp(n,0,1);return v*v*(3-2*v);};
const lerp=(a:number,b:number,t:number)=>Math.round(a+(b-a)*clamp(t,0,1));
const rgb=(r:number,g:number,b:number):GoveeColorV909=>({r,g,b});
const mixRgb=(a:GoveeColorV909,b:GoveeColorV909,t:number):GoveeColorV909=>({
 r:lerp(a.r,b.r,t),g:lerp(a.g,b.g,t),b:lerp(a.b,b.b,t),
});
const roles:Readonly<Record<GoveeRoleV911,number>>={wall:1,rhythm:.95,neon:.84,ambient:.58};
const validSection=(v:unknown):v is SongSectionV318=>v==='verse'||v==='hook'||v==='build'||v==='drop'||v==='break';

export function normalizeGoveeFestivalV925(raw:unknown):GoveeFestivalSettingsV925{
 const o=raw&&typeof raw==='object'&&!Array.isArray(raw)?raw as Partial<GoveeFestivalSettingsV925>:{};
 return {enabled:o.enabled===true,
  pattern:GOVEE_FESTIVAL_PATTERNS_V925.includes(o.pattern as GoveeFestivalPatternV925)?o.pattern as GoveeFestivalPatternV925:'auto',
  strength:safe(o.strength,60,0,100),colorMixPercent:safe(o.colorMixPercent,22,0,35),
  maxBoostPoints:safe(o.maxBoostPoints,7,0,10),periodMs:safe(o.periodMs,6500,2500,12000),
  spreadMs:safe(o.spreadMs,560,150,1600),minConfidence:safe(o.minConfidence,70,50,95)};
}
export function loadGoveeFestivalV925():GoveeFestivalSettingsV925{
 if(typeof window==='undefined')return {...DEFAULT_GOVEE_FESTIVAL_V925};
 try{return normalizeGoveeFestivalV925(JSON.parse(localStorage.getItem(GOVEE_FESTIVAL_KEY_V925)||'null'));}
 catch{return {...DEFAULT_GOVEE_FESTIVAL_V925};}
}
export function saveGoveeFestivalV925(value:GoveeFestivalSettingsV925):void{
 if(typeof window==='undefined')return;
 localStorage.setItem(GOVEE_FESTIVAL_KEY_V925,JSON.stringify(normalizeGoveeFestivalV925(value)));
 window.dispatchEvent(new Event(GOVEE_FESTIVAL_EVENT_V925));
}
/** Palettes are suggestions blended with the saved V912/V914 cue, never a preset rewrite. */
export function festivalPaletteV925(genre:unknown):readonly [GoveeColorV909,GoveeColorV909]{
 const text=typeof genre==='string'?genre.toLowerCase().trim():'';
 if(/hardtekk|hardtek|uptempo/.test(text))return [rgb(28,228,224),rgb(199,37,230)];
 if(/hardstyle|rawstyle|hardcore/.test(text))return [rgb(37,112,243),rgb(183,56,246)];
 if(/deutschrock|metal|industrial|ndh|rock/.test(text))return [rgb(235,113,32),rgb(206,39,60)];
 if(/deutschrap|trap|drill|hip.?hop|rap/.test(text))return [rgb(145,36,190),rgb(49,89,222)];
 return [rgb(72,116,215),rgb(155,68,181)];
}
const inactive=(reason:string):GoveeFestivalDecisionV925=>({active:false,pattern:'off',level:0,
 color:rgb(0,0,0),phase:'ambient',sectionIndex:-1,reason});
/** Automatically rotate the choreography by confirmed phase and occurrence index.
 * 'finale' is intentionally restricted to a CONFIRMED drop, even if manually selected.
 */
function choosePattern(phase:SongSectionV318,variationIndex:number,elapsed:number,setting:GoveeFestivalPatternV925):Exclude<GoveeFestivalPatternV925,'auto'>|'off'{
 if(phase==='break'||phase==='verse')return 'off';
 if(setting!=='auto')return setting==='finale'&&phase!=='drop'?'off':setting;
 if(phase==='build')return 'mirror';
 if(phase==='hook')return variationIndex%2===0?'arena':'colorfront';
 return elapsed<4000?'finale':'colorfront';
}
/** Wave position is purely track-local. Device indices identify WHOLE lamps,
 * and the V915 unison source index can be supplied for grouped fixtures.
 */
export function planGoveeFestivalV925(
 analysis:TrackAnalysisV318|null|undefined,trackId:string,progressMs:number,
 confirmed:GoveeSectionDecisionV919|null|undefined,genre:unknown,deviceIndex:number,
 deviceCount:number,settings:GoveeFestivalSettingsV925):GoveeFestivalDecisionV925{
 const s=normalizeGoveeFestivalV925(settings);
 if(!s.enabled||s.strength===0||(s.colorMixPercent===0&&s.maxBoostPoints===0))return inactive('V925 deaktiviert');
 if(!analysis||!trackId||analysis.trackId!==trackId||!Number.isFinite(progressMs)||progressMs<0||
    !Number.isFinite(analysis.durationMs)||progressMs>=analysis.durationMs||!Array.isArray(analysis.sections))return inactive('Keine aktuelle importierte Track-Analyse');
 if(!Number.isInteger(deviceIndex)||deviceIndex<0||!Number.isInteger(deviceCount)||deviceCount<1||deviceIndex>=deviceCount||deviceCount>32)return inactive('Ungültige Gerätereihenfolge');
 if(!confirmed?.active||!validSection(confirmed.phase)||!Number.isFinite(confirmed.confidence))return inactive('Keine bestätigte V919-Songphase');
 let index=-1;
 for(let i=0;i<analysis.sections.length;i++){
  const item=analysis.sections[i];
  if(!item||!Number.isFinite(item.startMs)||!Number.isFinite(item.durationMs)||item.durationMs<=0)return inactive('Ungültiger Songabschnitt');
  if(item.startMs>progressMs)break;
  if(progressMs<item.startMs+item.durationMs)index=i;
 }
 const section=analysis.sections[index];
 if(!section||!validSection(section.label)||section.label!==confirmed.phase||
  !Number.isFinite(section.confidence)||section.confidence<s.minConfidence/100||
  section.confidence!==confirmed.confidence)return inactive('Songphase nicht ausreichend sicher oder abweichend');
 const elapsed=progressMs-section.startMs;
 // Alternate consecutive confirmed hooks even when the intervening structure
 // has an even number of sections (verse/hook/verse/hook would otherwise repeat).
 const hookOrdinal=analysis.sections.slice(0,index).filter(item=>item.label==='hook'&&
  Number.isFinite(item.confidence)&&item.confidence>=s.minConfidence/100).length;
 const variationIndex=section.label==='hook'?hookOrdinal:index;
 const pattern=choosePattern(section.label,variationIndex,elapsed,s.pattern);
 if(pattern==='off')return inactive('Ruhige Songphase oder kein bestätigter Drop');
 const position=deviceCount===1?0:deviceIndex/(deviceCount-1);
 const sweepPosition=variationIndex%2===0?position:1-position;
 const wave=(t:number)=>.5+.5*Math.sin(t*2*Math.PI);
 let level=0,gradient=0;
 const period=s.periodMs;
 switch(pattern){
  case 'arena':{
   // Long stadium sweep with a smooth crest progressing lamp by lamp.
   level=wave((elapsed-sweepPosition*s.spreadMs*(deviceCount-1))/period-.25);
   gradient=wave(elapsed/period-position*.5);
   break;
  }
  case 'mirror':{
   // Both outer fixtures answer the centre pair without quick on/off toggling.
   const dist=Math.abs(position-.5)*2;
   level=wave((elapsed-dist*s.spreadMs*(deviceCount-1))/period-.25);
   gradient=dist;
   break;
  }
  case 'colorfront':{
   // Moving whole-lamp color front: not independently addressable RGBIC pixels.
   const travel=(elapsed%period)/period;
   level=.25+.75*Math.exp(-Math.pow((sweepPosition-travel)*2.25,2));
   gradient=clamp(.2+.8*wave((elapsed-sweepPosition*s.spreadMs*deviceCount)/period),0,1);
   break;
  }
  case 'finale':{
   // One soft, bounded crest per VERIFIED drop onset. Never a strobe/blackout.
   const positionDelay=Math.min(2400,sweepPosition*s.spreadMs*Math.max(0,deviceCount-1));
   const age=elapsed-positionDelay;
   const attack=smooth(age/900),release=1-smooth((age-1700)/2300);
   level=age<0?0:clamp(attack*release,0,1);
   gradient=.4+.5*sweepPosition;
   break;
  }
 }
 if(level<=.0001)return inactive('Wellenfront noch nicht angekommen');
 const pair=festivalPaletteV925(genre);
 const color=mixRgb(pair[0],pair[1],gradient);
 return {active:true,pattern,level:clamp(level,0,1),color,phase:section.label,sectionIndex:index,
  reason:`Bestätigte ${section.label}-Phase · ${pattern}`};
}
/** Called BEFORE V915 group dimming. The existing V911 easing/smoothing
 * limits consecutive RGB steps and the existing bridge rate stays unchanged.
 */
export function applyGoveeFestivalV925(base:GoveeLookV909,decision:GoveeFestivalDecisionV925,
 role:GoveeRoleV911,settings:GoveeFestivalSettingsV925,masterBrightness:number):GoveeLookV909{
 const s=normalizeGoveeFestivalV925(settings);
 if(!s.enabled||!decision.active||s.strength===0)return base;
 const level=clamp(decision.level,0,1)*s.strength/100*roles[role];
 if(!Number.isFinite(base.brightness)||!base.color||
  ![base.color.r,base.color.g,base.color.b].every(Number.isFinite))return base;
 const mix=clamp(level*s.colorMixPercent/100,0,.35);
 const color=mix>0?mixRgb(base.color,decision.color,mix):base.color;
 const original=clamp(base.brightness,1,100);
 const upper=Math.max(original,Math.min(100,clamp(masterBrightness,1,100)+s.maxBoostPoints));
 const brightness=Math.round(clamp(original+Math.round(level*s.maxBoostPoints),original,upper));
 if(brightness===base.brightness&&mix===0)return base;
 return {color,brightness};
}
/** Safe, clearly synthetic fixture preview. No storage, microphone, WAN/LAN or
 * actual song section data is consumed here. */
export function previewGoveeFestivalV925(settings:GoveeFestivalSettingsV925,genre:string,
 phase:SongSectionV318,elapsedMs:number,masterBrightness=75){
 const active={...normalizeGoveeFestivalV925(settings),enabled:true};
 const index=phase==='hook'?1:phase==='build'?2:phase==='drop'?3:0;
 const labels:SongSectionV318[]=['verse','hook','build','drop','break'];
 const sections=labels.map((label,i)=>({label,startMs:i*12000,durationMs:12000,confidence:.99}));
 const analysis:TrackAnalysisV318={schema:'sonic-track-analysis-v318',trackId:'v925-preview-only',source:'synthetic-preview',
  durationMs:60000,tempo:null,timeSignature:4,beats:[],bars:[],sections,importedAt:0};
 const positions=4,roles:GoveeRoleV911[]=['wall','rhythm','neon','ambient'];
 return Array.from({length:positions},(_,i)=>{
  const time=index*12000+clamp(elapsedMs,0,11999);
  const confirmed:GoveeSectionDecisionV919={active:true,phase:labels[index],intensity:0,verifiedDropAhead:false,confidence:.99,reason:'Synthetische Vorschau'};
  const decision=planGoveeFestivalV925(analysis,analysis.trackId,time,confirmed,genre,i,positions,active);
  const look=applyGoveeFestivalV925({color:rgb(72,50,125),brightness:55},decision,roles[i],active,masterBrightness);
  return {name:['H6063','H610B','H61A2','H6051'][i],role:roles[i],index:i,decision,look};
 });
}
