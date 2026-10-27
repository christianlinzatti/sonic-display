/** V608 – Dynamic Concert Lighting & Atmosphere 5.0.
 * A pure, fail-closed, song-wide lighting envelope for the existing V308/V462/V551
 * stage rig. No inferred singers, song sections, new lamps, strobes or render loops.
 * Only the V604 verified V600 act + matching live playback may activate accents.
 */
import type {NarrativePlanV604,NarrativeCueV604} from './fullSongConcertDramaturgyV604';
import type {StageAtmospherePlanV551} from './intelligentStageAtmosphereV551';
import type {LightingMoodV462,LightingSectionV462,LightingTierV462} from './concertLightingDirectorV462';

export type DynamicConcertLightingInputV608={
  narrative?:{plan:NarrativePlanV604;cue:NarrativeCueV604}|null;
  trackId:string;positionMs:number;durationMs:number;
  section:LightingSectionV462;mood:LightingMoodV462;
  energy:number;kick:number;cast?:StageAtmospherePlanV551|null;
  playing:boolean;reactive:boolean;reducedMotion:boolean;
  authored:boolean;blackout:boolean;lyricsProtected:boolean;tier:LightingTierV462;
};
export type DynamicConcertLightingCueV608={
  active:boolean;phase:'base'|'verse'|'build'|'hook'|'drop'|'break'|'handoff'|'duet'|'finale';
  key:number;fill:number;beam:number;spot:number;haze:number;sweep:number;
  fogOffset:number;focusBoost:number;reason:'verified-act'|'protected';
};
const neutral:DynamicConcertLightingCueV608={active:false,phase:'base',key:1,fill:1,beam:1,spot:1,
  haze:1,sweep:1,fogOffset:0,focusBoost:0,reason:'protected'};
const finite=(n:number)=>Number.isFinite(n);
const clamp=(n:number,a:number,b:number)=>Math.max(a,Math.min(b,n));
const round=(n:number)=>Math.round(n*100000)/100000;
export function planDynamicConcertLightingV608(input:DynamicConcertLightingInputV608):DynamicConcertLightingCueV608{
  const narrative=input.narrative,plan=narrative?.plan,cue=narrative?.cue;
  if(!plan||!cue||!cue.active||cue.source!=='verified-v600'||plan.source!=='verified-v600'||
    !input.playing||!input.reactive||input.reducedMotion||input.authored||input.blackout||
    input.tier==='low'||!input.trackId||plan.trackId!==input.trackId||
    !finite(input.positionMs)||!finite(input.durationMs)||plan.durationMs!==input.durationMs||
    !finite(input.energy)||!finite(input.kick)||input.energy<0||input.energy>1||input.kick<0||input.kick>1||
    !finite(cue.transition)||cue.transition<0||cue.transition>1||
    !Number.isInteger(cue.act)||cue.act<0||cue.act>=plan.acts.length)return neutral;
  const act=plan.acts[cue.act];
  if(act.index!==cue.act||act.section!==input.section||act.chapter!==cue.chapter||
    act.motif!==cue.motif||act.repetition!==cue.repetition||
    input.positionMs<act.startMs||input.positionMs>=act.endMs||act.endMs<=act.startMs)return neutral;
  const level=(input.tier==='high'?1:.58)*cue.transition;
  const rap=input.mood==='rap';
  const dance=input.mood==='hardstyle'||input.mood==='hardtekk';
  const lyrics=input.lyricsProtected;
  const cast=input.cast?.active?input.cast:null;
  const handoff=cast?.moment==='handoff'&&cast.leftSingerSlot!==null&&cast.rightSingerSlot!==null;
  const duet=cast?.moment==='ensemble'&&cast.leftSingerSlot!==null&&cast.rightSingerSlot!==null;
  const dropSupported=act.section==='drop'&&dance&&input.kick>.14&&input.energy>.32;
  const isFinale=act.chapter==='ending-arc'&&plan.endingSupported&&
    plan.acts.length>=4&&cue.act===plan.acts.length-1;
  let phase:DynamicConcertLightingCueV608['phase']=act.section;
  let key=0,fill=0,beam=0,spot=0,haze=0,sweep=0,fogOffset=0,focusBoost=0;
  if(act.section==='verse'){
    // Natural vocal portraits: brighter faces, low haze, no sweeping distractions.
    key=rap?.016:.006;fill=.035;beam=-.075;spot=.014;haze=-.095;sweep=-.13;fogOffset=.56;
  }else if(act.section==='break'){
    key=-.032;fill=.016;beam=-.16;spot=-.08;haze=-.15;sweep=-.20;fogOffset=.88;
  }else if(act.section==='build'){
    const lift=clamp(input.energy,0,1);
    key=.012*lift;fill=.012;beam=.035*lift;spot=.05*lift;haze=-.035;sweep=.046*lift;fogOffset=.14;
  }else if(act.section==='hook'){
    // Repeated hooks alternate spotlight-rich and stage-wide moments.
    const spotlightMotif=act.repetition%2===1;
    key=.018;fill=.022;beam=spotlightMotif?.015:.068;
    spot=spotlightMotif?.07:.03;haze=-.04;sweep=spotlightMotif?.01:.054;fogOffset=.22;
  }else if(dropSupported){
    const drive=clamp(input.energy*input.kick,0,1);
    key=.025*drive;fill=.025*drive;beam=.10*drive;spot=.083*drive;
    haze=-.018;sweep=.085*drive;fogOffset=0;
  }else if(act.section==='drop'){
    // No audible kick: don't manufacture a drop accent from the structure label.
    key=0;fill=0;beam=-.015;spot=0;haze=-.035;sweep=-.02;fogOffset=.18;
  }
  if(cast&&(handoff||duet)){
    // V551 validated both slots and already follows their actual world positions.
    phase=handoff?'handoff':'duet';
    const voiceStrength=clamp(cast.focusStrength,0,.7);
    key+=.014*voiceStrength;fill+=.018*voiceStrength;spot+=.07*voiceStrength;
    beam-=.032*voiceStrength;haze-=.055*voiceStrength;sweep-=.07*voiceStrength;
    focusBoost=voiceStrength*.1;
  }
  if(isFinale){
    phase='finale';
    // Final act is verified near track end, never guessed from elapsed play time.
    beam+=.035;spot+=.05;fill+=.01;sweep+=.02;
  }
  if(lyrics){
    // Any visible karaoke wins over concert effects, including a finale.
    key=Math.max(key,.012);fill=Math.max(fill,.012);
    beam=Math.min(beam,-.065);spot=Math.min(spot,.014);haze=Math.min(haze,-.15);
    sweep=Math.min(sweep,-.14);fogOffset=Math.max(fogOffset,.72);focusBoost=Math.min(focusBoost,.035);
  }
  // The existing V462/V542/V551 budgets and global light caps remain authoritative.
  return {active:true,phase,
    key:round(clamp(1+key*level,.96,1.05)),fill:round(clamp(1+fill*level,.97,1.06)),
    beam:round(clamp(1+beam*level,.82,1.12)),spot:round(clamp(1+spot*level,.9,1.12)),
    haze:round(clamp(1+haze*level,.79,1.02)),sweep:round(clamp(1+sweep*level,.78,1.1)),
    fogOffset:round(clamp(fogOffset*level,0,1)),focusBoost:round(clamp(focusBoost*level,0,.07)),
    reason:'verified-act'};
}
