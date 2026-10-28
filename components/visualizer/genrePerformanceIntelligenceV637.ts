/** V637 – Genre Performance Intelligence.
 * Shared, evidence-bound performance balance for the EXISTING automatic V610
 * dance / camera / light consumers.  This does not detect musicians, dancers,
 * phonemes, beats, drops, singers or genre from audio. No GLB/GPU allocation.
 */
import type {GenreConcertCueV610,GenreConcertInputV610,GenreConcertV610} from './genreConcertExperienceV610';
export type GenreIntentV637='rap-portrait'|'rap-dialogue'|'rap-ensemble'|'festival-rise'|'festival-drop'|'festival-pulse'|
  'rock-grounded'|'rock-ensemble'|'pop-portrait'|'pop-ensemble'|'respite'|'none';
export type GenreAccentV637={active:boolean;genre:GenreConcertV610|null;section:string;intent:GenreIntentV637;
  repetition:number;strength:number;dance:number;cameraDrift:number;cameraFov:number;cameraRate:number;
  key:number;fill:number;beam:number;spot:number;haze:number;sweep:number};
const round=(v:number)=>Math.round(v*100000)/100000;
const clamp=(v:number,min:number,max:number)=>Math.max(min,Math.min(max,v));
const smooth=(v:number)=>{const x=clamp(v,0,1);return x*x*(3-2*x);};
const neutral:Readonly<GenreAccentV637>=Object.freeze({active:false,genre:null,section:'none',intent:'none',repetition:0,strength:0,
 dance:1,cameraDrift:1,cameraFov:0,cameraRate:1,key:1,fill:1,beam:1,spot:1,haze:1,sweep:1});
export const NEUTRAL_GENRE_INTELLIGENCE_V637=neutral;
/** This independently checks the V600/V604 source, live timeline and cue.
 * A mere genre string or predicted section is never sufficient evidence. */
export function planGenrePerformanceV637(i:GenreConcertInputV610,g:GenreConcertV610|null):GenreAccentV637{
 const p=i.narrative?.plan,c=i.narrative?.cue;
 if(!g||!p||!c||!c.active||p.source!=='verified-v600'||c.source!=='verified-v600'||
   p.genre!==g||!i.playing||i.reducedMotion||i.tier==='low'||!i.trackId||p.trackId!==i.trackId||
   !Number.isFinite(i.durationMs)||i.durationMs<=0||p.durationMs!==i.durationMs||
   !Number.isFinite(i.positionMs)||i.positionMs<0||i.positionMs>=i.durationMs||
   !Number.isFinite(i.energy)||i.energy<0||i.energy>1||!Number.isFinite(i.kick)||i.kick<0||i.kick>1||
   !Number.isFinite(c.transition)||c.transition<0||c.transition>1||
   !Number.isInteger(c.act)||c.act<0||c.act>=p.acts.length)return {...neutral};
 const a=p.acts[c.act];
 if(!a||a.index!==c.act||a.section!==i.section||a.chapter!==c.chapter||a.motif!==c.motif||
   a.repetition!==c.repetition||!Number.isInteger(a.repetition)||a.repetition<0||
   !Number.isFinite(a.startMs)||!Number.isFinite(a.endMs)||a.endMs<=a.startMs||
   i.positionMs<a.startMs||i.positionMs>=a.endMs)return {...neutral};
 // A confirmed label is insufficient for a drop accent without a measured transient.
 const drop=a.section==='drop';
 const audibleDrop=drop&&i.energy>=.38&&i.kick>=.3;
 const duration=a.endMs-a.startMs;
 const edge=Math.min(850,duration*.2);
 const fade=smooth((i.positionMs-a.startMs)/Math.max(1,edge))*smooth((a.endMs-i.positionMs)/Math.max(1,edge));
 const weight=fade*c.transition*(i.tier==='high'?1:.55)*(i.lyricsProtected?.26:1);
 const buildProgress=clamp((i.positionMs-a.startMs)/duration,0,1);
 const chorusWide=a.section==='hook'&&a.repetition%2===0;
 let intent:GenreIntentV637='none';
 let dance=0,drift=0,fov=0,rate=0,key=0,fill=0,beam=0,spot=0,haze=0,sweep=0;
 if(a.section==='break'){
   intent='respite';dance=-.014;drift=-.009;rate=-.01;beam=-.022;spot=-.01;haze=-.02;sweep=-.025;
 }else if(drop&&!audibleDrop){
   // Absolutely NO added energy in an unsupported drop (including calming changes).
 }else if(g==='deutschrap'){
   if(a.section==='verse'){
     intent=a.repetition%2===1?'rap-dialogue':'rap-portrait';
     dance=-.012;drift=-.007;fov=-.045;rate=-.008;key=.005;fill=.007;
     beam=-.021;spot=.006;haze=-.019;sweep=-.023;
   }else if(a.section==='hook'){
     intent=chorusWide?'rap-ensemble':'rap-portrait';dance=chorusWide?.012:.003;
     drift=chorusWide?.009:-.006;fov=chorusWide?.10:-.062;rate=chorusWide?.01:-.005;
     key=.004;fill=.005;beam=chorusWide?.014:-.006;spot=chorusWide?.002:.019;sweep=chorusWide?.012:-.006;haze=-.01;
   }else if(a.section==='build'){
     intent='rap-dialogue';dance=.003*buildProgress;drift=.004*buildProgress;
     fov=.045*buildProgress;beam=.009*buildProgress;sweep=.008*buildProgress;
   }else if(audibleDrop){intent='rap-ensemble';dance=.008*i.kick;fov=.05*i.kick;beam=.012*i.kick;}
 }else if(g==='hardstyle'||g==='hardtekk'){
   const tekk=g==='hardtekk';
   if(audibleDrop){
     intent='festival-drop';const impact=i.kick*i.energy;
     dance=(tekk?.037:.026)*impact;drift=(tekk?.015:.012)*impact;
     fov=(tekk?.12:.16)*impact;rate=(tekk?.019:.012)*impact;
     beam=(tekk?.019:.027)*impact;spot=.009*impact;sweep=(tekk?.031:.018)*impact;
   }else if(a.section==='build'){
     intent='festival-rise';dance=(tekk?.014:.009)*buildProgress;
     drift=.006*buildProgress;fov=.07*buildProgress;rate=.008*buildProgress;
     beam=.015*buildProgress;spot=.008*buildProgress;sweep=(tekk?.019:.011)*buildProgress;
   }else if(a.section==='hook'){
     intent='festival-pulse';dance=tekk?.020:.012;drift=chorusWide?.012:.002;
     fov=chorusWide?.13:-.055;rate=tekk?.014:.008;
     beam=chorusWide?.022:.006;spot=chorusWide?.004:.018;
     sweep=tekk?.022:.014;
   }else if(a.section==='verse'){
     intent='respite';dance=-.008;drift=-.006;rate=-.008;beam=-.016;sweep=-.019;haze=-.012;
   }
 }else if(g==='rock'){
   if(a.section==='verse'){
     intent='rock-grounded';dance=.002;drift=.006;fov=.025;rate=.002;
     key=.003;beam=-.008;spot=.006;sweep=-.008;
   }else if(a.section==='hook'){
     intent='rock-ensemble';dance=chorusWide?.017:.011;drift=chorusWide?.012:.003;
     fov=chorusWide?.13:-.04;rate=.009;beam=chorusWide?.024:.008;
     spot=chorusWide?.006:.019;sweep=chorusWide?.021:.007;
   }else if(a.section==='build'){
     intent='rock-ensemble';dance=.012*buildProgress;fov=.065*buildProgress;
     beam=.017*buildProgress;sweep=.012*buildProgress;
   }else if(audibleDrop){
     intent='rock-ensemble';dance=.014*i.kick;fov=.1*i.kick;beam=.018*i.kick;
   }
 }else if(g==='pop'){
   if(a.section==='verse'){
     intent='pop-portrait';dance=-.007;drift=-.008;fov=-.055;
     key=.005;fill=.008;beam=-.017;spot=.013;sweep=-.016;haze=-.015;
   }else if(a.section==='hook'){
     intent=chorusWide?'pop-ensemble':'pop-portrait';dance=chorusWide?.012:.003;
     drift=chorusWide?.007:-.009;fov=chorusWide?.075:-.072;
     key=.006;fill=.011;beam=chorusWide?.012:-.003;
     spot=chorusWide?.011:.023;sweep=chorusWide?.009:-.004;
   }else if(a.section==='build'){
     intent='pop-portrait';dance=.004*buildProgress;fov=.026*buildProgress;
     spot=.01*buildProgress;fill=.006*buildProgress;
   }else if(audibleDrop){
     intent='pop-ensemble';dance=.01*i.kick;fov=.075*i.kick;beam=.012*i.kick;spot=.012*i.kick;
   }
 }
 const gain=(delta:number)=>round(1+delta*weight);
 return {active:true,genre:g,section:a.section,intent,repetition:a.repetition,strength:round(weight),
   dance:i.manualDance?1:gain(dance),cameraDrift:i.manualCamera?1:gain(drift),
   cameraFov:i.manualCamera?0:round(fov*weight),cameraRate:i.manualCamera?1:gain(rate),
   key:i.manualLighting?1:gain(key),fill:i.manualLighting?1:gain(fill),
   beam:i.manualLighting?1:gain(beam),spot:i.manualLighting?1:gain(spot),
   haze:i.manualLighting?1:gain(haze),sweep:i.manualLighting?1:gain(sweep)};
}
/** Only modifies an already authorised cue. No old disabled/manual lane may be
 * brought back to life; existing per-renderer budgets remain authoritative. */
export function composeGenrePerformanceV637(base:GenreConcertCueV610,cue:GenreAccentV637):GenreConcertCueV610{
 if(!base.active||!cue.active||base.genre!==cue.genre||base.section!==cue.section)return base;
 const mult=(k:'dance'|'cameraDrift'|'cameraRate'|'key'|'fill'|'beam'|'spot'|'haze'|'sweep',lo:number,hi:number)=>
   round(clamp(base[k]*cue[k],lo,hi));
 return {...base,dance:mult('dance',.88,1.14),cameraDrift:mult('cameraDrift',.96,1.1),
   cameraRate:mult('cameraRate',.94,1.14),cameraFov:round(clamp(base.cameraFov+cue.cameraFov,-.4,.8)),
   key:mult('key',.98,1.04),fill:mult('fill',.98,1.04),
   beam:mult('beam',.88,1.12),spot:mult('spot',.92,1.10),
   haze:mult('haze',.85,1),sweep:mult('sweep',.84,1.12)};
}
