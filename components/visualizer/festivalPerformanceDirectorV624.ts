/** V624 – Hardstyle & Hardtekk Performance Director.
 * A deterministic, bounded direction overlay for the existing V610 dance,
 * camera and stage-lighting lanes. Relies on a VERIFIED V600/V604 act; neither
 * section, kick, singer, choreography clip nor a light is inferred or created.
 * Manual/blackout/reduced-motion protections belong to the existing owners.
 */
import type {GenreConcertInputV610,GenreConcertCueV610,GenreConcertV610} from './genreConcertExperienceV610';
export type FestivalPhaseV624='none'|'verse'|'build'|'hook'|'drop'|'respite';
export type FestivalAccentV624={active:boolean;genre:'hardstyle'|'hardtekk'|null;
  phase:FestivalPhaseV624;repetition:number;intensity:number;rise:number;
  dance:number;cameraDrift:number;cameraFov:number;cameraRate:number;
  beam:number;spot:number;sweep:number;haze:number;key:number;fill:number;};
const clamp=(v:number,min:number,max:number)=>Math.max(min,Math.min(max,v));
const round=(v:number)=>Math.round(v*100000)/100000;
const neutral:Readonly<FestivalAccentV624>=Object.freeze({active:false,genre:null,phase:'none',repetition:0,
 intensity:0,rise:0,dance:1,cameraDrift:1,cameraFov:0,cameraRate:1,beam:1,spot:1,sweep:1,haze:1,key:1,fill:1});
export const NEUTRAL_FESTIVAL_V624=neutral;
/** Requires a genre already resolved by V610, and independently verifies the song/act.
 * A labelled drop alone is NOT enough: real measured kick + energy are required.
 */
export function planFestivalPerformanceV624(input:GenreConcertInputV610,genre:GenreConcertV610|null):FestivalAccentV624{
 const n=input.narrative,plan=n?.plan,cue=n?.cue;
 if(!plan||!cue||!cue.active||plan.source!=='verified-v600'||cue.source!=='verified-v600'||
   (genre!=='hardstyle'&&genre!=='hardtekk')||plan.genre!==genre||!input.playing||input.reducedMotion||input.tier==='low'||
   !input.trackId||input.trackId!==plan.trackId||!Number.isFinite(input.durationMs)||input.durationMs<=0||
   plan.durationMs!==input.durationMs||!Number.isFinite(input.positionMs)||input.positionMs<0||input.positionMs>=input.durationMs||
   !Number.isFinite(input.energy)||input.energy<0||input.energy>1||!Number.isFinite(input.kick)||input.kick<0||input.kick>1||
   !Number.isInteger(cue.act)||cue.act<0||cue.act>=plan.acts.length||
   !Number.isFinite(cue.transition)||cue.transition<0||cue.transition>1)return {...neutral};
 const act=plan.acts[cue.act];
 if(!act||act.index!==cue.act||act.section!==input.section||act.chapter!==cue.chapter||
   act.motif!==cue.motif||act.repetition!==cue.repetition||
   !Number.isFinite(act.startMs)||!Number.isFinite(act.endMs)||act.endMs<=act.startMs||
   input.positionMs<act.startMs||input.positionMs>=act.endMs)return {...neutral};
 const fade=cue.transition*(input.tier==='high'?1:.55)*(input.lyricsProtected?.32:1);
 const phase:FestivalPhaseV624=act.section==='build'?'build':act.section==='drop'?'drop':
   act.section==='hook'?'hook':act.section==='verse'?'verse':'respite';
 const rise=phase==='build'?clamp((input.positionMs-act.startMs)/(act.endMs-act.startMs),0,1):0;
 const verifiedKick=phase==='drop'&&input.energy>=.38&&input.kick>=.32;
 const impact=verifiedKick?input.kick*input.energy:0;
 // V610 is the owner of the envelopes. V624 only supplies small additional
 // accents, not another full-strength show. No strobe, tempo guessing or clock.
 const hardtekk=genre==='hardtekk';
 let dance=0,drift=0,fov=0,rate=0,beam=0,spot=0,sweep=0,haze=0,key=0,fill=0;
 if(phase==='build'){
   dance=(hardtekk?.013:.010)*rise;drift=.008*rise;fov=.07*rise;
   rate=(hardtekk?.012:.008)*rise;beam=.018*rise;spot=.012*rise;sweep=.018*rise;
 }else if(phase==='hook'){
   // Alternate payoff focus across repeated hooks, avoiding identical stages.
   const spotlight=act.repetition%2===1;
   dance=(hardtekk?.017:.012);drift=spotlight?.003:.008;
   fov=spotlight?-.045:.09;rate=hardtekk?.014:.008;
   beam=spotlight?.008:.024;spot=spotlight?.026:.009;
   sweep=spotlight?.008:.017;haze=-.018;
 }else if(phase==='drop'&&verifiedKick){
   dance=(hardtekk?.035:.027)*impact;
   drift=(hardtekk?.021:.014)*impact;fov=.21*impact;rate=(hardtekk?.028:.019)*impact;
   beam=(hardtekk?.031:.039)*impact;spot=.023*impact;
   sweep=(hardtekk?.038:.026)*impact;key=.005*impact;fill=.004*impact;
   haze=-.015*impact;
 }else if(phase==='verse'||phase==='respite'){
   dance=phase==='respite' ? -.025 : -.009;
   drift=-.007;rate=-.008;beam=-.026;spot=-.013;sweep=-.03;haze=-.02;
 }
 // A drop without measured transient provides NO extra movement or lighting.
 // Silence or a sustained loud section must not masquerade as a kick.
 const g=(v:number)=>round(1+v*fade);
 return {active:true,genre,phase,repetition:act.repetition,intensity:round(impact*fade),rise:round(rise),
   dance:input.manualDance?1:g(dance),cameraDrift:input.manualCamera?1:g(drift),
   cameraFov:input.manualCamera?0:round(fov*fade),cameraRate:input.manualCamera?1:g(rate),
   beam:input.manualLighting?1:g(beam),spot:input.manualLighting?1:g(spot),
   sweep:input.manualLighting?1:g(sweep),haze:input.manualLighting?1:g(haze),
   key:input.manualLighting?1:g(key),fill:input.manualLighting?1:g(fill)};
}
/** Composition preserves the existing V610 bounds and the manual/zero-strength
 * lanes. Existing renderer budgets and V351 camera safety still apply AFTER.
 */
export function composeFestivalPerformanceV624(base:GenreConcertCueV610,cue:FestivalAccentV624):GenreConcertCueV610{
 if(!cue.active||!base.active)return base;
 const mult=(name:'dance'|'cameraDrift'|'cameraRate'|'beam'|'spot'|'sweep'|'haze'|'key'|'fill',min:number,max:number)=>round(clamp(base[name]*cue[name],min,max));
 return {...base,
   dance:mult('dance',.88,1.14),cameraDrift:mult('cameraDrift',.96,1.1),
   cameraRate:mult('cameraRate',.94,1.14),cameraFov:round(clamp(base.cameraFov+cue.cameraFov,-.4,.8)),
   beam:mult('beam',.88,1.12),spot:mult('spot',.92,1.10),
   sweep:mult('sweep',.84,1.12),haze:mult('haze',.85,1),
   key:mult('key',.98,1.04),fill:mult('fill',.98,1.04)};
}
