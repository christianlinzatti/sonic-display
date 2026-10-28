/** V625 – Rock & Pop Live Performance.
 * Bounded, deterministic accents on the EXISTING V610 dance, camera and lighting
 * channels. Only verified V600/V604 song acts can activate the director.
 * There is no instrument detection, BPM fabrication, vocal role detection or GPU work.
 */
import type {GenreConcertInputV610,GenreConcertCueV610,GenreConcertV610} from './genreConcertExperienceV610';
export type RockPopAccentV625={
 active:boolean;genre:'rock'|'pop'|null;phase:'verse'|'hook'|'build'|'drop'|'break'|'none';
 repetition:number;rise:number;impact:number;
 dance:number;cameraDrift:number;cameraFov:number;cameraRate:number;
 key:number;fill:number;beam:number;spot:number;sweep:number;haze:number;
};
const clamp=(v:number,min:number,max:number)=>Math.max(min,Math.min(max,v));
const round=(v:number)=>Math.round(v*100000)/100000;
export const NEUTRAL_ROCK_POP_V625:Readonly<RockPopAccentV625>=Object.freeze({
 active:false,genre:null,phase:'none',repetition:0,rise:0,impact:0,
 dance:1,cameraDrift:1,cameraFov:0,cameraRate:1,key:1,fill:1,beam:1,spot:1,sweep:1,haze:1,
});
/** Independently cross-check current live section, track, authored act metadata,
 * playback progress and imported source. A loud passage isn't itself a drop.
 */
export function planRockPopPerformanceV625(input:GenreConcertInputV610,genre:GenreConcertV610|null):RockPopAccentV625{
 const plan=input.narrative?.plan,cue=input.narrative?.cue;
 if((genre!=='rock'&&genre!=='pop')||!plan||!cue||
   plan.source!=='verified-v600'||cue.source!=='verified-v600'||!cue.active||
   plan.genre!==genre||!input.playing||input.reducedMotion||input.tier==='low'||
   !input.trackId||input.trackId!==plan.trackId||
   !Number.isFinite(input.durationMs)||input.durationMs<=0||plan.durationMs!==input.durationMs||
   !Number.isFinite(input.positionMs)||input.positionMs<0||input.positionMs>=input.durationMs||
   !Number.isFinite(input.energy)||input.energy<0||input.energy>1||
   !Number.isFinite(input.kick)||input.kick<0||input.kick>1||
   !Number.isFinite(cue.transition)||cue.transition<0||cue.transition>1||
   !Number.isInteger(cue.act)||cue.act<0||cue.act>=plan.acts.length)return {...NEUTRAL_ROCK_POP_V625};
 const act=plan.acts[cue.act];
 if(!act||act.index!==cue.act||act.section!==input.section||
   act.chapter!==cue.chapter||act.motif!==cue.motif||act.repetition!==cue.repetition||
   !Number.isFinite(act.startMs)||!Number.isFinite(act.endMs)||act.endMs<=act.startMs||
   input.positionMs<act.startMs||input.positionMs>=act.endMs)return {...NEUTRAL_ROCK_POP_V625};
 const phase=act.section;
 if(!['verse','hook','build','drop','break'].includes(phase))return {...NEUTRAL_ROCK_POP_V625};
 const rock=genre==='rock';
 const rise=phase==='build'?clamp((input.positionMs-act.startMs)/(act.endMs-act.startMs),0,1):0;
 // A confirmed labelled drop still needs measured energy and a transient.
 const verifiedDrop=phase==='drop'&&input.energy>=.35&&input.kick>=.26;
 const impact=verifiedDrop?input.energy*input.kick:0;
 const weight=cue.transition*(input.tier==='high'?1:.58)*(input.lyricsProtected?.3:1);
 let dance=0,drift=0,fov=0,rate=0,key=0,fill=0,beam=0,spot=0,sweep=0,haze=0;
 if(phase==='verse'){
   // Rock: grounded stage presence. Pop: controlled front-facing solo framing.
   dance=rock?.006:-.012;drift=rock?.009:-.012;fov=rock?.07:-.15;
   rate=rock?.008:-.016;key=.018;fill=rock?.009:.022;
   beam=rock?-.018:-.038;spot=rock?.013:.019;
   sweep=rock?-.022:-.038;haze=-.02;
 }else if(phase==='hook'){
   // Repeated hooks alternate ensemble-wide versus portrait/spotlight payoff.
   const wide=act.repetition%2===0;
   if(rock){
     dance=wide?.038:.024;drift=wide?.031:.006;fov=wide?.32:-.14;
     rate=wide?.029:.012;key=.011;fill=.012;
     beam=wide?.048:.017;spot=wide?.013:.043;sweep=wide?.033:.008;haze=-.018;
   }else{
     dance=wide?.028:.019;drift=wide?.015:-.011;fov=wide?.21:-.20;
     rate=wide?.019:-.006;key=.019;fill=.025;
     beam=wide?.022:.006;spot=wide?.025:.048;sweep=wide?.016:.004;haze=-.03;
   }
 }else if(phase==='build'){
   // Rise follows verified act progress; no speculative upcoming-drop prediction.
   dance=(rock?.022:.017)*rise;drift=(rock?.021:.009)*rise;
   fov=(rock?.19:.13)*rise;rate=(rock?.018:.011)*rise;
   key=.009*rise;fill=.009*rise;beam=(rock?.031:.018)*rise;
   spot=.025*rise;sweep=(rock?.024:.012)*rise;haze=-.01;
 }else if(phase==='drop'&&verifiedDrop){
   // Live-style peak, not festival-strobe imitation. Kick is real measured data.
   dance=(rock?.041:.028)*impact;drift=(rock?.032:.018)*impact;
   fov=(rock?.32:.23)*impact;rate=(rock?.031:.018)*impact;
   key=.012*impact;fill=.012*impact;beam=(rock?.059:.025)*impact;
   spot=(rock?.026:.052)*impact;sweep=(rock?.04:.018)*impact;haze=-.015*impact;
 }else if(phase==='break'){
   dance=-.052;drift=-.018;fov=rock?.11:.07;rate=-.025;
   beam=-.049;spot=-.027;sweep=-.058;haze=-.065;
 }
 // Unconfirmed 'drop' gets no extra accent, even if its label is authored.
 const gain=(value:number)=>round(1+value*weight);
 return {active:true,genre,phase,repetition:act.repetition,rise:round(rise),impact:round(impact*weight),
   dance:input.manualDance?1:gain(dance),
   cameraDrift:input.manualCamera?1:gain(drift),cameraFov:input.manualCamera?0:round(fov*weight),
   cameraRate:input.manualCamera?1:gain(rate),
   key:input.manualLighting?1:gain(key),fill:input.manualLighting?1:gain(fill),
   beam:input.manualLighting?1:gain(beam),spot:input.manualLighting?1:gain(spot),
   sweep:input.manualLighting?1:gain(sweep),haze:input.manualLighting?1:gain(haze)};
}
/** Composes only compatible confirmed genres; does not create light sources or
 * change lane ownership. Final V351 camera guard and renderer limits still apply.
 */
export function composeRockPopPerformanceV625(base:GenreConcertCueV610,cue:RockPopAccentV625):GenreConcertCueV610{
 if(!base.active||!cue.active||base.genre!==cue.genre||base.section!==cue.phase)return base;
 const mult=(k:'dance'|'cameraDrift'|'cameraRate'|'key'|'fill'|'beam'|'spot'|'sweep'|'haze',lo:number,hi:number)=>
   round(clamp(base[k]*cue[k],lo,hi));
 return {...base,dance:mult('dance',.88,1.14),cameraDrift:mult('cameraDrift',.96,1.10),
   cameraRate:mult('cameraRate',.94,1.14),cameraFov:round(clamp(base.cameraFov+cue.cameraFov,-.4,.8)),
   key:mult('key',.98,1.04),fill:mult('fill',.98,1.04),
   beam:mult('beam',.88,1.12),spot:mult('spot',.92,1.10),
   sweep:mult('sweep',.84,1.12),haze:mult('haze',.85,1)};
}
