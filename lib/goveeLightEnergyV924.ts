/** V924 – Intelligent Light Energy Director.
 * Deterministic, fail-closed whole-lamp brightness envelope layered over V912–V923.
 * Only the CURRENT imported V318 track with a confirmed V919 section can change
 * the light. Avoid repeated peaks by reducing their additional energy while the
 * prior confirmed high-energy sections occupy the recent time window.
 * Pure calculations: never write RGB, send network requests or toggle lamp power.
 */
import type {TrackAnalysisV318,SongSectionV318} from '@/services/musicAnalysis/trackAnalysisV318';
import type {GoveeLookV909} from '@/lib/goveeLanV909';
import type {GoveeRoleV911} from '@/lib/goveeConcertDirectorV911';
import type {GoveeSectionDecisionV919} from '@/lib/goveeSectionDirectorV919';
import {resolveGoveeGenreV920,type GoveeGenreFamilyV920} from '@/lib/goveeGenreLightV920';

export const GOVEE_ENERGY_KEY_V924='sonic-display:govee-energy-director-v924';
export const GOVEE_ENERGY_EVENT_V924='sonic-display:govee-energy-director-changed-v924';
export const GOVEE_ENERGY_MODES_V924=['balanced','cinematic','festival'] as const;
export type GoveeEnergyModeV924=typeof GOVEE_ENERGY_MODES_V924[number];
export type GoveeEnergySettingsV924={
 enabled:boolean;mode:GoveeEnergyModeV924;strength:number;contrast:number;
 maxChangePoints:number;recoveryWindowMs:number;minConfidence:number;
};
export const DEFAULT_GOVEE_ENERGY_V924:GoveeEnergySettingsV924={
 enabled:false,mode:'balanced',strength:65,contrast:65,maxChangePoints:9,
 recoveryWindowMs:45000,minConfidence:70,
};
export type GoveeEnergyDecisionV924={
 active:boolean;phase:SongSectionV318|'ambient';genre:GoveeGenreFamilyV920|null;
 energy:number;fatigue:number;pressure:number;confidence:number;
 currentSectionIndex:number;reason:string;
};
const clamp=(n:number,min:number,max:number)=>Math.min(max,Math.max(min,Number.isFinite(n)?n:min));
const smooth=(n:number)=>{const t=clamp(n,0,1);return t*t*(3-2*t);};
const isPhase=(phase:unknown):phase is SongSectionV318=>
 phase==='verse'||phase==='hook'||phase==='build'||phase==='drop'||phase==='break';
const roleWeight:Readonly<Record<GoveeRoleV911,number>>={wall:.88,rhythm:1,neon:.80,ambient:.48};
const modeProfiles:Readonly<Record<GoveeEnergyModeV924,Readonly<Record<SongSectionV318,number>>>>={
 balanced:{verse:-.30,hook:.78,build:.40,drop:1,break:-.90},
 cinematic:{verse:-.55,hook:.86,build:.47,drop:.96,break:-1},
 festival:{verse:-.16,hook:.88,build:.67,drop:1,break:-.74},
};
const genreFactors:Readonly<Record<GoveeGenreFamilyV920,number>>={
 deutschrap:1,hardtekk:1.08,hardstyle:1.12,deutschrock:.95,
};
export function normalizeGoveeEnergyV924(raw:unknown):GoveeEnergySettingsV924{
 const x=raw&&typeof raw==='object'&&!Array.isArray(raw)?raw as Partial<GoveeEnergySettingsV924>:{};
 const num=(v:unknown,fallback:number,min:number,max:number)=>
  typeof v==='number'&&Number.isFinite(v)?Math.round(clamp(v,min,max)):fallback;
 return {enabled:x.enabled===true,
  mode:GOVEE_ENERGY_MODES_V924.includes(x.mode as GoveeEnergyModeV924)?x.mode as GoveeEnergyModeV924:'balanced',
  strength:num(x.strength,65,0,100),contrast:num(x.contrast,65,0,100),
  maxChangePoints:num(x.maxChangePoints,9,0,12),
  recoveryWindowMs:num(x.recoveryWindowMs,45000,15000,90000),
  minConfidence:num(x.minConfidence,70,50,95),
 };
}
export function loadGoveeEnergyV924():GoveeEnergySettingsV924{
 if(typeof window==='undefined')return {...DEFAULT_GOVEE_ENERGY_V924};
 try{return normalizeGoveeEnergyV924(JSON.parse(localStorage.getItem(GOVEE_ENERGY_KEY_V924)||'null'));}
 catch{return {...DEFAULT_GOVEE_ENERGY_V924};}
}
export function saveGoveeEnergyV924(value:GoveeEnergySettingsV924):void{
 if(typeof window==='undefined')return;
 const safe=normalizeGoveeEnergyV924(value);
 localStorage.setItem(GOVEE_ENERGY_KEY_V924,JSON.stringify(safe));
 window.dispatchEvent(new Event(GOVEE_ENERGY_EVENT_V924));
}
const inactive=(reason:string):GoveeEnergyDecisionV924=>({active:false,phase:'ambient',genre:null,
 energy:0,fatigue:0,pressure:0,confidence:0,currentSectionIndex:-1,reason});

/** Compute recent confirmed peak occupancy, treating verified quiet sections as
 * recovery. This is deterministic from the song structure – no random pulses,
 * no local device clock, and no inferred missing sections.
 */
function recentPressure(sections:TrackAnalysisV318['sections'],index:number,now:number,windowMs:number,threshold:number){
 const since=now-windowMs;let occupied=0;let recentPeaks=0;
 for(let i=0;i<=index;i++){
  const s=sections[i];
  if(!s||!Number.isFinite(s.startMs)||!Number.isFinite(s.durationMs)||
     s.durationMs<=0||!Number.isFinite(s.confidence)||s.confidence<threshold||
     (s.label!=='hook'&&s.label!=='drop'))continue;
  const start=Math.max(s.startMs,since),end=Math.min(now,s.startMs+s.durationMs);
  if(end>start){occupied+=end-start;if(i!==index)recentPeaks++;}
 }
 return {pressure:clamp(occupied/windowMs,0,1),recentPeaks};
}

/** Requires independently verified V919 section. V920 is optional: the genre
 * is read from the current music metadata only for a gentle scaling factor.
 */
export function planGoveeEnergyV924(analysis:TrackAnalysisV318|null|undefined,
 trackId:string,progressMs:number,genreInput:unknown,section:GoveeSectionDecisionV919|null|undefined,
 settings:GoveeEnergySettingsV924):GoveeEnergyDecisionV924{
 const s=normalizeGoveeEnergyV924(settings);
 if(!s.enabled||s.strength===0||s.maxChangePoints===0)return inactive('V924 deaktiviert');
 if(!analysis||!trackId||analysis.trackId!==trackId||!Number.isFinite(progressMs)||progressMs<0||
    !Number.isFinite(analysis.durationMs)||progressMs>=analysis.durationMs||!Array.isArray(analysis.sections))
  return inactive('Keine aktuelle Track-Analyse');
 if(!section?.active||!isPhase(section.phase))return inactive('Keine bestätigte V919-Songphase');
 let index=-1;
 for(let i=0;i<analysis.sections.length;i++){
  const item=analysis.sections[i];
  if(!item||!Number.isFinite(item.startMs)||!Number.isFinite(item.durationMs))return inactive('Ungültige Abschnittszeit');
  if(item.startMs>progressMs)break;
  if(item.durationMs>0&&progressMs<item.startMs+item.durationMs)index=i;
 }
 const current=analysis.sections[index];const threshold=s.minConfidence/100;
 if(!current||!isPhase(current.label)||current.label!==section.phase||
   !Number.isFinite(current.confidence)||current.confidence<threshold||
   current.confidence!==section.confidence||current.durationMs<=0)
  return inactive('Songphase nicht ausreichend bestätigt');
 const frac=clamp((progressMs-current.startMs)/current.durationMs,0,1);
 const age=progressMs-current.startMs;
 const genre=resolveGoveeGenreV920(genreInput);
 let energy=modeProfiles[s.mode][current.label];
 // Avoid abrupt verse/hook transitions in addition to existing V911 smoothing.
 if(current.label==='build')energy*=.25+.75*smooth(frac);
 else if(current.label==='hook')energy*=.52+.48*smooth(age/4200);
 else if(current.label==='drop')energy*=1-.20*smooth(age/9000);
 else if(current.label==='verse')energy*=.65+.35*smooth(age/3200);
 else energy*=.64+.36*smooth(age/3800);
 const {pressure,recentPeaks}=recentPressure(analysis.sections,index,progressMs,s.recoveryWindowMs,threshold);
 // When hooks and drops repeatedly dominate the last ~45 s, reserve some
 // remaining dynamic range instead of applying the identical boost each time.
 const fatigue=energy>0?clamp(.46*pressure+Math.min(.18,recentPeaks*.06),0,.58):0;
 if(energy>0)energy*=1-fatigue;
 // Preserve a meaningful contrast between quiet and loud sections.
 const contrastScale=.6+.4*s.contrast/100;
 energy*=contrastScale*(genre?genreFactors[genre]:1);
 return {active:true,phase:current.label,genre,energy:clamp(energy,-1,1),
  fatigue,pressure,confidence:current.confidence,currentSectionIndex:index,
  reason:`Bestätigte ${current.label}-Phase · ${recentPeaks} frühere Höhepunkte`};
}
/** Apply ONLY brightness in a bounded range. Keep original RGB and all existing
 * overrides. V915 group dimming is applied AFTER this function by the caller.
 */
export function applyGoveeEnergyV924(base:GoveeLookV909,decision:GoveeEnergyDecisionV924,
 role:GoveeRoleV911,settings:GoveeEnergySettingsV924,masterBrightness:number):GoveeLookV909{
 const s=normalizeGoveeEnergyV924(settings);
 if(!s.enabled||!decision.active||s.strength===0||s.maxChangePoints===0||
    !Number.isFinite(base.brightness)||!Number.isFinite(decision.energy))return base;
 const original=clamp(base.brightness,1,100);
 const delta=decision.energy*roleWeight[role]*s.strength/100*s.maxChangePoints;
 const ceiling=Math.min(100,Math.max(original,clamp(masterBrightness,1,100)+s.maxChangePoints));
 const adjusted=Math.round(clamp(original+delta,20,ceiling));
 return adjusted===base.brightness?base:{...base,brightness:adjusted};
}
/** Explicitly synthetic preview: never reads a song or sends LAN commands. */
export function previewGoveeEnergyV924(settings:GoveeEnergySettingsV924,
 genre:string,role:GoveeRoleV911,masterBrightness=75){
 const labels:SongSectionV318[]=['verse','hook','verse','hook','break','build','drop','hook','break'];
 const sections=labels.map((label,i)=>({label,startMs:i*10000,durationMs:10000,confidence:.98}));
 const demo:TrackAnalysisV318={schema:'sonic-track-analysis-v318',trackId:'v924-preview-only',source:'preview-only',
  durationMs:90000,tempo:null,timeSignature:4,beats:[],bars:[],sections,importedAt:0};
 const active={...normalizeGoveeEnergyV924(settings),enabled:true};
 return labels.map((label,i)=>{
  const progressMs=i*10000+5500;
  const verified:GoveeSectionDecisionV919={active:true,phase:label,intensity:0,verifiedDropAhead:false,confidence:.98,reason:'Nur Vorschau'};
  const decision=planGoveeEnergyV924(demo,demo.trackId,progressMs,genre,verified,active);
  const look=applyGoveeEnergyV924({color:{r:90,g:42,b:175},brightness:55},decision,role,active,masterBrightness);
  return {label,index:i,decision,brightness:look.brightness};
 });
}
