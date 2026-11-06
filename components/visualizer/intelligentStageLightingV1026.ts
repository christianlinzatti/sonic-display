/** V1026 – Intelligent Stage Lighting 4.0.
 * Evidence-preserving modulation of four EXISTING virtual lights. V604 owns verified
 * music structure; V761 owns the cinematic camera intent; V551/V749 validates vocal
 * slots. This pure planner creates no lights, Govee commands, clocks or allocations
 * besides its small return value. Manual lighting/blackouts always override it.
 */
import type {NarrativePlanV604,NarrativeCueV604} from './fullSongConcertDramaturgyV604';
import type {CinematicCueV761} from './cinematicConcertDirectorV761';
export type LightingMoodV1026='off'|'portrait'|'duet'|'ensemble'|'rising'|'arena'|'breath';
export type StageLightInputV1026={
 narrative?:{plan:NarrativePlanV604;cue:NarrativeCueV604}|null;
 cinematic?:CinematicCueV761|null;
 trackId:string|null|undefined;durationMs:number;positionMs:number;
 playing:boolean;reactive:boolean;reducedMotion:boolean;
 tier:'low'|'balanced'|'high';genre:string|null|undefined;
 manualLighting:boolean;manualFx:boolean;seekBlocked:boolean;blackout:boolean;
 lyricsProtected:boolean;lyricsVisible:boolean;vocalFocus:boolean;
 groupCount:number;focusSlot:number|null;partnerSlot:number|null;
 energy:number;kick:number;
};
export type StageLightCueV1026={
 active:boolean;mood:LightingMoodV1026;reason:'verified'|'protected'|'unverified';
 keyGain:number;fillGain:number;beamGain:number;floorGain:number;
 color:string;colorMix:number;focusSlot:number|null;
};
export const STAGE_LIGHT_OFF_V1026:Readonly<StageLightCueV1026>={
 active:false,mood:'off',reason:'protected',keyGain:1,fillGain:1,beamGain:1,
 floorGain:1,color:'#ffffff',colorMix:0,focusSlot:null,
};
const finite=(v:unknown):v is number=>typeof v==='number'&&Number.isFinite(v);
const clamp=(v:number,min:number,max:number)=>Math.min(max,Math.max(min,v));
const smooth=(v:number)=>{const t=clamp(v,0,1);return t*t*(3-2*t);};
const genreTint=(genre:string|null|undefined):string=>{
 const g=(genre??'').toLowerCase();
 if(/hardtekk|tekk/.test(g))return '#ff568c';
 if(/hardstyle|rawstyle|hardcore/.test(g))return '#86c8ff';
 if(/rap|trap|drill|hip.hop/.test(g))return '#ffc18e';
 if(/deutschrock|rock|metal|ndh|industrial/.test(g))return '#ffc9a0';
 return '#eeeeff';
};
const within=(s:number,e:number,at:number,dur:number)=>finite(s)&&finite(e)&&s>=0&&e<=dur&&
 e-s>=2600&&at>=s&&at<e;
export function planIntelligentStageLightingV1026(i:StageLightInputV1026):StageLightCueV1026{
 const off=(reason:'protected'|'unverified'):StageLightCueV1026=>({...STAGE_LIGHT_OFF_V1026,reason});
 if(!i.playing||!i.reactive||i.reducedMotion||i.tier==='low'||i.manualLighting||i.manualFx||
  i.seekBlocked||i.blackout)return off('protected');
 const n=i.narrative,c=i.cinematic;
 if(!n||n.plan.source!=='verified-v600'||n.cue.source!=='verified-v600'||!n.cue.active||
   !c?.active||c.reason!=='verified-act'||!i.trackId||i.trackId!==n.plan.trackId||
   !finite(i.durationMs)||i.durationMs<10000||i.durationMs>1800000||
   i.durationMs!==n.plan.durationMs||!finite(i.positionMs)||i.positionMs<0||i.positionMs>=i.durationMs||
   !finite(i.energy)||i.energy<0||i.energy>1||!finite(i.kick)||i.kick<0||i.kick>1||
   !Number.isInteger(i.groupCount)||i.groupCount<1||i.groupCount>4||
   !Array.isArray(n.plan.acts)||n.plan.acts.length<1||n.plan.acts.length>160||
   !Number.isInteger(n.cue.act)||n.cue.act<0||n.cue.act>=n.plan.acts.length||
   c.actIndex!==n.cue.act||!finite(c.blend)||c.blend<=0||c.blend>1)
  return off('unverified');
 const act=n.plan.acts[n.cue.act];
 if(!act||act.index!==n.cue.act||!within(act.startMs,act.endMs,i.positionMs,i.durationMs)||
  !['verse','hook','build','drop','break'].includes(act.section))return off('unverified');
 // A camera intent is a verified V761 storyboard, NOT evidence of a singer/drop.
 const validSlot=(s:number|null)=>s!==null&&Number.isInteger(s)&&s>=0&&s<i.groupCount;
 const lead=validSlot(i.focusSlot)?i.focusSlot:null;
 const partner=validSlot(i.partnerSlot)&&i.partnerSlot!==lead?i.partnerSlot:null;
 const hasVocal=lead!==null&&i.vocalFocus;
 const boundary=smooth(Math.min(i.positionMs-act.startMs,act.endMs-i.positionMs)/
  Math.min(2100,(act.endMs-act.startMs)*.28));
 if(boundary<=0)return off('protected');
 const gain=boundary*clamp(c.blend,0,1)*(i.tier==='balanced'?.55:1);
 let mood:LightingMoodV1026='breath';
 if(act.section==='break')mood='breath';
 else if(hasVocal&&partner!==null&&['dialogue','ensemble'].includes(c.intent??''))mood='duet';
 else if(hasVocal&&c.intent==='portrait'&&act.section==='verse')mood='portrait';
 else if(['hook','drop'].includes(act.section)&&['wide','pulse','ensemble'].includes(c.intent??''))mood='arena';
 else if(act.section==='build'&&c.intent==='rise')mood='rising';
 else if(i.groupCount>1&&c.intent==='ensemble')mood='ensemble';
 else if(hasVocal)mood='portrait';
 let key=1,fill=1,beam=1,floor=1;
 const punch=i.kick*i.energy;
 if(mood==='portrait'){
  key+=.038;fill+=.046;beam-=.075;floor-=.05;
 }else if(mood==='duet'){
  key+=.025;fill+=.067;beam-=.055;floor-=.02;
 }else if(mood==='ensemble'){
  key+=.020;fill+=.050;beam+=.025;floor+=.02;
 }else if(mood==='rising'){
  key+=.012;fill+=.025;beam+=.035*i.energy;floor+=.020*i.energy;
 }else if(mood==='arena'){
  key+=.017;fill+=.050;beam+=.075*punch;floor+=.045*punch;
 }else {beam-=.055;floor-=.04;fill+=.012;}
 // Lyrics-readable portrait and no decorative pulsing under visible words.
 const lyrics=i.lyricsProtected||i.lyricsVisible;
 if(lyrics){key=Math.max(1.012,key);fill=Math.max(1.035,fill);
  beam=Math.min(beam,.90);floor=Math.min(floor,.96);}
 const scale=(value:number,min:number,max:number)=>clamp(1+(value-1)*gain,min,max);
 return {active:true,mood,reason:'verified',keyGain:scale(key,.97,1.045),
  fillGain:scale(fill,.97,1.07),beamGain:scale(beam,.88,1.08),
  floorGain:scale(floor,.92,1.055),color:genreTint(i.genre),
  colorMix:lyrics?0:clamp(.045*gain,0,.045),focusSlot:hasVocal?lead:null};
}
