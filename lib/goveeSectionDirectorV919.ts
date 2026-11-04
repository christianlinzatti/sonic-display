/** V919 – verified-section dramaturgy for whole-lamp Govee LAN brightness.
 * Pure calculation only: no UDP, power, strobing, microphone activation or color override.
 * Imported track labels are REQUIRED. Uncertain/absent sections are an identity transform.
 */
import type {TrackAnalysisV318,SongSectionV318} from '@/services/musicAnalysis/trackAnalysisV318';
import {resolveGoveePhaseV911,type GoveePhaseV911,type GoveeRoleV911} from '@/lib/goveeConcertDirectorV911';
import type {GoveeLookV909} from '@/lib/goveeLanV909';

export const GOVEE_SECTION_KEY_V919='sonic-display:govee-verse-hook-drop-v919';
export const GOVEE_SECTION_EVENT_V919='sonic-display:govee-verse-hook-drop-changed-v919';
export type GoveeSectionSettingsV919={enabled:boolean;strength:number;minConfidence:number;preDropWindowMs:number;maxExtraBrightness:number};
export const DEFAULT_GOVEE_SECTION_V919:GoveeSectionSettingsV919={enabled:false,strength:65,minConfidence:70,preDropWindowMs:5000,maxExtraBrightness:10};
export type GoveeSectionDecisionV919={active:boolean;phase:GoveePhaseV911;intensity:number;verifiedDropAhead:boolean;confidence:number;reason:string};
const clamp=(v:number,min:number,max:number)=>Math.min(max,Math.max(min,Number.isFinite(v)?v:min));
const smooth=(value:number)=>{const t=clamp(value,0,1);return t*t*(3-2*t);};
const labels=new Set<string>(['verse','hook','build','drop','break']);
const roleWeight:Record<GoveeRoleV911,number>={wall:.88,rhythm:1,neon:.80,ambient:.48};

/** All options are whitelisted; malformed storage never switches on the feature. */
export function normalizeGoveeSectionV919(input:unknown):GoveeSectionSettingsV919{
 const obj=input&&typeof input==='object'&&!Array.isArray(input)?input as Partial<GoveeSectionSettingsV919>:{};
 const number=(v:unknown,fallback:number,min:number,max:number)=>
  typeof v==='number'&&Number.isFinite(v)?Math.round(clamp(v,min,max)):fallback;
 return {enabled:obj.enabled===true,
  strength:number(obj.strength,65,0,100),minConfidence:number(obj.minConfidence,70,50,95),
  preDropWindowMs:number(obj.preDropWindowMs,5000,2000,8000),
  maxExtraBrightness:number(obj.maxExtraBrightness,10,0,15)};
}
export function loadGoveeSectionV919():GoveeSectionSettingsV919{
 if(typeof window==='undefined')return {...DEFAULT_GOVEE_SECTION_V919};
 try{return normalizeGoveeSectionV919(JSON.parse(localStorage.getItem(GOVEE_SECTION_KEY_V919)||'null'));}
 catch{return {...DEFAULT_GOVEE_SECTION_V919};}
}
export function saveGoveeSectionV919(value:GoveeSectionSettingsV919):void{
 if(typeof window==='undefined')return;
 const safe=normalizeGoveeSectionV919(value);
 localStorage.setItem(GOVEE_SECTION_KEY_V919,JSON.stringify(safe));
 window.dispatchEvent(new Event(GOVEE_SECTION_EVENT_V919));
}
const inactive=(reason:string):GoveeSectionDecisionV919=>({active:false,phase:'ambient',intensity:0,verifiedDropAhead:false,confidence:0,reason});
/** Build-ups are treated as builds, NOT as inferred drops. Pre-drop uplift requires a
 * real adjacent label 'drop' and both source confidences meeting the threshold.
 */
export function planGoveeSectionV919(analysis:TrackAnalysisV318|null|undefined,trackId:string,progressMs:number,
 settings:GoveeSectionSettingsV919):GoveeSectionDecisionV919{
 const opts=normalizeGoveeSectionV919(settings);
 if(!opts.enabled||opts.strength<=0)return inactive('V919 ausgeschaltet');
 if(!analysis||!trackId||analysis.trackId!==trackId||!Number.isFinite(progressMs)||progressMs<0||progressMs>=analysis.durationMs)return inactive('Keine gültige Track-Analyse');
 const cue=resolveGoveePhaseV911(analysis,trackId,progressMs);
 if(!cue.verified||cue.phase==='ambient')return inactive('Keine bestätigte Songphase');
 const sections=analysis.sections;
 // The resolver chooses the latest active marker; mirror its choice and check confidence.
 let index=-1;
 for(let i=0;i<sections.length;i++){
  const s=sections[i];if(s.startMs>progressMs)break;
  if(progressMs<s.startMs+s.durationMs)index=i;
 }
 const current=sections[index];
 const minimum=opts.minConfidence/100;
 if(!current||!current.label||!labels.has(current.label)||current.label!==cue.phase||
    !Number.isFinite(current.confidence)||current.confidence<minimum||current.durationMs<=0)
  return inactive('Songphase nicht sicher genug');
 const elapsed=clamp(progressMs-current.startMs,0,current.durationMs);
 const fraction=elapsed/current.durationMs;
 let intensity=0;let verifiedDropAhead=false;
 switch(current.label as SongSectionV318){
  case 'verse':intensity=-.075;break;
  case 'hook':intensity=.12;break;
  case 'break':intensity=-.20;break;
  case 'drop':{
   // Strong at a verified drop boundary, then settle gently. No flashes.
   const release=smooth(elapsed/6000);
   intensity=.17-.085*release;break;
  }
  case 'build':{
   // Progressive tension only because the build label itself was verified.
   intensity=-.035+.095*smooth(fraction);
   const next=sections[index+1];
   const end=current.startMs+current.durationMs;
   verifiedDropAhead=Boolean(next?.label==='drop'&&Number.isFinite(next.confidence)&&
    next.confidence>=minimum&&next.durationMs>0&&Math.abs(next.startMs-end)<=100);
   if(verifiedDropAhead){
    const remaining=Math.max(0,end-progressMs);
    intensity+=.11*smooth(1-remaining/opts.preDropWindowMs);
   }
   break;
  }
 }
 return {active:true,phase:cue.phase,intensity:clamp(intensity,-.20,.20)*opts.strength/100,
  verifiedDropAhead,confidence:current.confidence,reason:'Verifizierte '+cue.phase+'-Phase'};
}
/** Preserve the previously computed RGB and per-show cue. Only bound brightness
 * changes, with no reduction of an existing brighter cue when positive.
 */
export function applyGoveeSectionV919(base:GoveeLookV909,decision:GoveeSectionDecisionV919,
 role:GoveeRoleV911,settings:GoveeSectionSettingsV919,masterBrightness:number):GoveeLookV909{
 if(!decision.active||!Number.isFinite(base.brightness)||decision.intensity===0)return base;
 const opts=normalizeGoveeSectionV919(settings);
 const delta=decision.intensity*roleWeight[role];
 const original=clamp(base.brightness,1,100);
 const ceiling=Math.max(original,clamp(masterBrightness,1,100)+opts.maxExtraBrightness);
 const adjusted=delta>=0?Math.min(100,ceiling,Math.round(original*(1+delta))):
  Math.max(20,Math.round(original*(1+delta)));
 if(adjusted===base.brightness)return base;
 return {...base,brightness:adjusted};
}
/** Pure conceptual preview; not a fabricated claim about the current track. */
export function previewGoveeSectionV919(settings:GoveeSectionSettingsV919,
 phase:SongSectionV318,role:GoveeRoleV911,brightness=55,masterBrightness=75):{base:number;result:number;uplift:boolean}{
 const simulation:TrackAnalysisV318={schema:'sonic-track-analysis-v318',trackId:'v919-preview-only',source:'local-preview',durationMs:25000,
  tempo:null,timeSignature:4,beats:[],bars:[],sections:[
   {startMs:0,durationMs:15000,label:phase,confidence:1},
   {startMs:15000,durationMs:10000,label:'drop',confidence:1}],importedAt:0};
 const sample=planGoveeSectionV919(simulation,'v919-preview-only',12500,{...settings,enabled:true});
 const look=applyGoveeSectionV919({color:{r:90,g:32,b:145},brightness},sample,role,settings,masterBrightness);
 return {base:brightness,result:look.brightness,uplift:sample.verifiedDropAhead};
}
