/** V611 – one evidence-bound full-song finishing pass shared by dance, camera and
 * the two existing lighting rigs. It augments V604/V610, never creates sections,
 * performers, camera cuts, lights, shaders, animation clips or a new playback clock.
 */
import type {NarrativePlanV604,NarrativeCueV604} from './fullSongConcertDramaturgyV604';
import type {GenreConcertCueV610} from './genreConcertExperienceV610';

export type ConcertStoryMomentV611='portrait'|'build'|'ensemble'|'spotlight'|'respite'|'drop'|'finale'|'off';
export type ConcertContinuityV611={
 active:boolean;act:number;moment:ConcertStoryMomentV611;repetition:number;
 dance:number;cameraDrift:number;cameraRate:number;cameraFov:number;
 key:number;fill:number;beam:number;spot:number;haze:number;sweep:number;
};
export type ConcertContinuityInputV611={
 narrative?:{plan:NarrativePlanV604;cue:NarrativeCueV604}|null;
 genreCue:GenreConcertCueV610;genre?:string|null;trackId:string;durationMs:number;positionMs:number;
 section:string;energy:number;kick:number;playing:boolean;reducedMotion:boolean;
 tier:'low'|'balanced'|'high';lyricsProtected:boolean;
 manualDance:boolean;manualCamera:boolean;manualLighting:boolean;
};
const neutral:ConcertContinuityV611={active:false,act:-1,moment:'off',repetition:0,
 dance:1,cameraDrift:1,cameraRate:1,cameraFov:0,
 key:1,fill:1,beam:1,spot:1,haze:1,sweep:1};
const clamp=(n:number,min:number,max:number)=>Math.min(max,Math.max(min,n));
const round=(n:number)=>Math.round(n*100000)/100000;
const finite=(n:number)=>Number.isFinite(n);

/** Sample without loops or runtime allocations beyond the returned value. Same
 * verified V604 act and V610 genre drive all three automatic lanes. A quiet or
 * unconfirmed drop cannot gain extra energy; a finale requires V604 evidence.
 * Additional signed gains fade to zero at every genuine section boundary.
 */
export function planContinuousConcertV611(input:ConcertContinuityInputV611):ConcertContinuityV611{
 const plan=input.narrative?.plan,cue=input.narrative?.cue,genre=input.genreCue;
 if(!plan||!cue||!cue.active||cue.source!=='verified-v600'||
   plan.source!=='verified-v600'||!genre.active||genre.reason!=='verified-genre-act'||
   !input.playing||input.reducedMotion||input.tier==='low'||
   !input.trackId||plan.trackId!==input.trackId||plan.durationMs!==input.durationMs||
   !finite(input.durationMs)||input.durationMs<=0||!finite(input.positionMs)||
   input.positionMs<0||input.positionMs>=input.durationMs||
   !finite(input.energy)||!finite(input.kick)||input.energy<0||input.energy>1||
   input.kick<0||input.kick>1||!finite(cue.transition)||cue.transition<0||cue.transition>1||
   !Number.isInteger(cue.act)||cue.act<0||cue.act>=plan.acts.length||
   !genre.genre||plan.genre!==genre.genre||genre.section!==input.section)return neutral;
 const act=plan.acts[cue.act];
 if(!act||act.index!==cue.act||act.section!==input.section||
   cue.chapter!==act.chapter||cue.motif!==act.motif||cue.repetition!==act.repetition||
   !finite(act.startMs)||!finite(act.endMs)||act.endMs<=act.startMs||
   input.positionMs<act.startMs||input.positionMs>=act.endMs)return neutral;
 const supportedDrop=act.section!=='drop'||(input.energy>=.34&&input.kick>=.17);
 const verifiedFinale=plan.endingSupported&&plan.acts.length>=4&&act.chapter==='ending-arc'&&
   cue.act===plan.acts.length-1&&act.endMs>=plan.durationMs-1500&&
   act.startMs>=plan.durationMs*.75;
 // A genuine, documented final arc may crescendo. No heuristic final-hook
 // inference, and no spotlight/finale without authored sections.
 const moment:ConcertStoryMomentV611=verifiedFinale?'finale':
   act.section==='verse'?'portrait':act.section==='build'?'build':
   act.section==='break'?'respite':act.section==='drop'?'drop':
   act.repetition%2===0?'ensemble':'spotlight';
 const phase=(input.positionMs-act.startMs)/(act.endMs-act.startMs);
 const progress=input.positionMs/plan.durationMs;
 const motion=clamp(cue.transition,0,1);
 // Small deterministic phrase variation, with boundary fading inherited from
 // the independently verified V604 sample. No BPM or word timestamps inferred.
 const phrase=0.82+0.18*Math.sin(Math.PI*phase);
 const power=motion*phrase*(input.tier==='balanced'?.58:1)*(input.lyricsProtected?.34:1);
 const arcLift=.72+.28*progress;
 const z=power*arcLift;
 let dance=0,drift=0,rate=0,fov=0,key=0,fill=0,beam=0,spot=0,haze=0,sweep=0;
 if(moment==='portrait'){
   dance=-.013;drift=-.011;rate=-.025;fov=-.13;key=.009;fill=.011;
   beam=-.025;spot=.008;haze=-.022;sweep=-.028;
 }else if(moment==='build'){
   const energy=clamp(input.energy,0,1);
   dance=.013*energy;drift=.008;rate=.012;fov=.12*energy;
   key=.006;fill=.003;beam=.023*energy;spot=.012*energy;haze=-.012;sweep=.016*energy;
 }else if(moment==='respite'){
   dance=-.036;drift=-.018;rate=-.045;fov=.10;
   key=-.006;fill=.003;beam=-.06;spot=-.035;haze=-.04;sweep=-.055;
 }else if(moment==='ensemble'){
   dance=.027;drift=.017;rate=.016;fov=.27;key=.005;
   beam=.035;spot=-.006;haze=-.018;sweep=.02;
 }else if(moment==='spotlight'){
   dance=.014;drift=-.014;rate=-.013;fov=-.21;key=.01;fill=.01;
   beam=.005;spot=.04;haze=-.025;sweep=-.012;
 }else if(moment==='drop'&&supportedDrop){
   const drive=input.energy*input.kick;
   dance=.052*drive;drift=.027*drive;rate=.028*drive;fov=.39*drive;
   key=.007*drive;beam=.048*drive;spot=.022*drive;haze=-.008;sweep=.043*drive;
 }else if(moment==='finale'){
   dance=.03;drift=.012;rate=.013;fov=.30;key=.014;fill=.012;
   beam=.041;spot=.026;haze=-.012;sweep=.026;
 }
 // V610 does not brighten a labelled drop without an independent audible kick.
 if(act.section==='drop'&&!supportedDrop){
   dance=0;drift=0;rate=0;fov=0;key=0;fill=0;beam=0;spot=0;haze=0;sweep=0;
 }
 // Preserve legibility: calm decoration before lowering the existing face floor.
 if(input.lyricsProtected){beam=Math.min(0,beam);haze=Math.min(0,haze);sweep=Math.min(0,sweep);}
 const gain=(v:number,lo:number,hi:number)=>round(clamp(1+v*z,lo,hi));
 return {active:true,act:cue.act,moment,repetition:act.repetition,
   dance:input.manualDance?1:gain(dance,.95,1.055),
   cameraDrift:input.manualCamera?1:gain(drift,.97,1.04),
   cameraRate:input.manualCamera?1:gain(rate,.94,1.04),
   cameraFov:input.manualCamera?0:round(clamp(fov*z,-.24,.34)),
   key:input.manualLighting?1:gain(key,.99,1.025),
   fill:input.manualLighting?1:gain(fill,.99,1.02),
   beam:input.manualLighting?1:gain(beam,.93,1.05),
   spot:input.manualLighting?1:gain(spot,.96,1.05),
   haze:input.manualLighting?1:gain(haze,.95,1),
   sweep:input.manualLighting?1:gain(sweep,.94,1.05)};
}
