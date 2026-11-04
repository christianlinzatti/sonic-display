/** V920 – deterministic genre-aware brightness dramaturgy, layered AFTER V919.
 * Only explicit current-track song sections; no guessed drops, RGB edits or LAN work.
 * The renderer / V910 Bridge continue to pace all device commands as before.
 */
import type {TrackAnalysisV318,SongSectionV318} from '@/services/musicAnalysis/trackAnalysisV318';
import type {GoveeRoleV911,GoveePhaseV911} from '@/lib/goveeConcertDirectorV911';
import type {GoveeLookV909} from '@/lib/goveeLanV909';
import type {GoveeSectionDecisionV919} from '@/lib/goveeSectionDirectorV919';

export const GOVEE_GENRE_KEY_V920='sonic-display:govee-genre-light-v920';
export const GOVEE_GENRE_EVENT_V920='sonic-display:govee-genre-light-changed-v920';
export type GoveeGenreFamilyV920='deutschrap'|'hardtekk'|'hardstyle'|'deutschrock';
export type GoveeGenreSettingsV920={enabled:boolean;strength:number;maxChangePoints:number;minConfidence:number};
export const DEFAULT_GOVEE_GENRE_V920:GoveeGenreSettingsV920={enabled:false,strength:65,maxChangePoints:10,minConfidence:70};
export type GoveeGenreDecisionV920={active:boolean;genre:GoveeGenreFamilyV920|null;phase:GoveePhaseV911;weight:number;confidence:number;reason:string};
const clamp=(v:number,min:number,max:number)=>Math.max(min,Math.min(max,Number.isFinite(v)?v:min));
const curve=(v:number)=>{const x=clamp(v,0,1);return x*x*(3-2*x);};
const phases=new Set(['verse','hook','build','drop','break']);
const fixtureWeights:Readonly<Record<GoveeRoleV911,number>>={wall:.95,rhythm:1,neon:.85,ambient:.40};
/** Deliberately not a metadata classifier. Unknown and pop/ambient keep V919's look. */
export function resolveGoveeGenreV920(value:unknown):GoveeGenreFamilyV920|null{
 if(typeof value!=='string')return null;
 const genre=value.trim().toLowerCase();
 if(['deutschrap','hiphop','trap','drill','boombap'].includes(genre))return 'deutschrap';
 if(['hardtekk','uptempo'].includes(genre))return 'hardtekk';
 if(['hardstyle','rawstyle','hardcore'].includes(genre))return 'hardstyle';
 if(['rock','metal','poprock','indierock','alternativerock','punkrock','deutschrock'].includes(genre))return 'deutschrock';
 return null;
}
const weights:Readonly<Record<GoveeGenreFamilyV920,Readonly<Record<SongSectionV318,number>>>>={
 deutschrap:{verse:-.32,hook:.62,build:.46,drop:.68,break:-.72},
 hardtekk:{verse:.22,hook:.68,build:.77,drop:.85,break:-.64},
 hardstyle:{verse:-.38,hook:.74,build:.80,drop:1,break:-.88},
 deutschrock:{verse:-.12,hook:.67,build:.62,drop:.78,break:-.60},
};
export function normalizeGoveeGenreV920(value:unknown):GoveeGenreSettingsV920{
 const x=value&&typeof value==='object'&&!Array.isArray(value)?value as Partial<GoveeGenreSettingsV920>:{};
 const num=(v:unknown,fallback:number,min:number,max:number)=>typeof v==='number'&&Number.isFinite(v)?Math.round(clamp(v,min,max)):fallback;
 return {enabled:x.enabled===true,strength:num(x.strength,65,0,100),
  maxChangePoints:num(x.maxChangePoints,10,0,12),minConfidence:num(x.minConfidence,70,50,95)};
}
export function loadGoveeGenreV920():GoveeGenreSettingsV920{
 if(typeof window==='undefined')return {...DEFAULT_GOVEE_GENRE_V920};
 try{return normalizeGoveeGenreV920(JSON.parse(localStorage.getItem(GOVEE_GENRE_KEY_V920)||'null'));}
 catch{return {...DEFAULT_GOVEE_GENRE_V920};}
}
export function saveGoveeGenreV920(value:GoveeGenreSettingsV920):void{
 if(typeof window==='undefined')return;
 const safe=normalizeGoveeGenreV920(value);
 localStorage.setItem(GOVEE_GENRE_KEY_V920,JSON.stringify(safe));
 window.dispatchEvent(new Event(GOVEE_GENRE_EVENT_V920));
}
const inactive=(reason:string):GoveeGenreDecisionV920=>({active:false,genre:null,phase:'ambient',weight:0,confidence:0,reason});
/** Genre cues are valid only if a V919 decision has already validated the current
 * track's section AND this very same active marker passes V920's threshold. */
export function planGoveeGenreV920(analysis:TrackAnalysisV318|null|undefined,trackId:string,
 progressMs:number,genreInput:unknown,section:GoveeSectionDecisionV919|null|undefined,
 settings:GoveeGenreSettingsV920):GoveeGenreDecisionV920{
 const options=normalizeGoveeGenreV920(settings);
 if(!options.enabled||options.strength<=0||options.maxChangePoints<=0)return inactive('V920 ausgeschaltet');
 const genre=resolveGoveeGenreV920(genreInput);
 if(!genre)return inactive('Kein unterstütztes Genre');
 if(!section?.active||!phases.has(section.phase))return inactive('Keine bestätigte V919-Songphase');
 if(!analysis||!trackId||analysis.trackId!==trackId||!Number.isFinite(progressMs)||progressMs<0||
  !Number.isFinite(analysis.durationMs)||progressMs>=analysis.durationMs)return inactive('Ungültiger Track');
 let index=-1;
 for(let i=0;i<analysis.sections.length;i++){
  const current=analysis.sections[i];if(current.startMs>progressMs)break;
  if(progressMs<current.startMs+current.durationMs)index=i;
 }
 const cue=analysis.sections[index];const threshold=options.minConfidence/100;
 if(!cue||cue.label!==section.phase||!phases.has(cue.label)||!Number.isFinite(cue.confidence)||
  cue.confidence<threshold||cue.durationMs<=0||cue.confidence!==section.confidence)
  return inactive('Abschnitt nicht ausreichend bestätigt');
 const fraction=clamp((progressMs-cue.startMs)/cue.durationMs,0,1);
 let weight=weights[genre][cue.label as SongSectionV318];
 // Slowly increase confirmed build-ups; drops retain their peak longer than a blink.
 if(cue.label==='build')weight*=.35+.65*curve(fraction);
 if(cue.label==='drop')weight*=1-.22*curve(fraction);
 if(cue.label==='hook')weight*=.85+.15*curve(Math.min(1,fraction*4));
 return {active:true,genre,phase:section.phase,weight:clamp(weight,-1,1),confidence:cue.confidence,
  reason:`${genre} · bestätigter ${section.phase}-Abschnitt`};
}
/** Keep the V912–V919 RGB, show fades and active group cues. Bounded change only;
 * do not force power on, send updates, or override a manually dimmed group. */
export function applyGoveeGenreV920(base:GoveeLookV909,decision:GoveeGenreDecisionV920,
 role:GoveeRoleV911,settings:GoveeGenreSettingsV920,masterBrightness:number):GoveeLookV909{
 if(!decision.active||!Number.isFinite(base.brightness))return base;
 const options=normalizeGoveeGenreV920(settings);
 if(!options.enabled||options.strength===0||options.maxChangePoints===0)return base;
 const change=decision.weight*fixtureWeights[role]*options.maxChangePoints*options.strength/100;
 const original=clamp(base.brightness,1,100);
 const allowedMax=Math.max(original,clamp(masterBrightness,1,100)+Math.min(10,options.maxChangePoints));
 const adjusted=Math.round(clamp(original+change,20,Math.min(100,allowedMax)));
 return adjusted===base.brightness?base:{...base,brightness:adjusted};
}
/** Static example: synthetic explicitly labeled sections are preview-only. */
export function previewGoveeGenreV920(genre:GoveeGenreFamilyV920,phase:SongSectionV318,
 role:GoveeRoleV911,settings:GoveeGenreSettingsV920,baseBrightness=55,master=75){
 const analysis:TrackAnalysisV318={schema:'sonic-track-analysis-v318',trackId:'v920-preview',source:'preview-only',durationMs:30000,
  beats:[],bars:[],sections:[{label:phase,startMs:0,durationMs:30000,confidence:1}],tempo:null,timeSignature:4,importedAt:0};
 const section:GoveeSectionDecisionV919={active:true,phase,intensity:0,verifiedDropAhead:false,confidence:1,reason:'Vorschau'};
 const decision=planGoveeGenreV920(analysis,'v920-preview',15000,genre,section,{...settings,enabled:true});
 const look=applyGoveeGenreV920({color:{r:110,g:55,b:145},brightness:baseBrightness},decision,role,{...settings,enabled:true},master);
 return {base:baseBrightness,result:look.brightness,weight:decision.weight,active:decision.active};
}
