/** V621 – Advanced Stage Lighting Director.
 * One evidence-bound, stateless lighting score over EXISTING V462/V542/V551/V608
 * and V601 lamps/LED/Gobo/fog. No new shaders, spotlights, clocks or identity inference.
 * A V604 cue must agree with a currently playing, same-track verified V600 act.
 */
import type {NarrativePlanV604,NarrativeCueV604} from './fullSongConcertDramaturgyV604';
import type {LightingSectionV462,LightingTierV462} from './concertLightingDirectorV462';
import type {StageFxCueV601} from './advancedConcertStageFxV601';
export type AdvancedStageLightingInputV621={
  narrative?:{plan:NarrativePlanV604;cue:NarrativeCueV604}|null;
  trackId:string;durationMs:number;positionMs:number;
  section:LightingSectionV462;genre?:string|null;
  energy:number;kick:number;playing:boolean;reactive:boolean;reducedMotion:boolean;
  authored:boolean;blackout:boolean;lyricsProtected:boolean;vocalFocus:boolean;
  groupCount:number;tier:LightingTierV462;
};
export type AdvancedStageLightingPlanV621={
  active:boolean;section:LightingSectionV462|'none';
  key:number;fill:number;beam:number;spot:number;haze:number;sweep:number;
  gobo:number;led:number;floorFog:number;projection:number;
};
const NEUTRAL:Readonly<AdvancedStageLightingPlanV621>=Object.freeze({
  active:false,section:'none',key:1,fill:1,beam:1,spot:1,haze:1,sweep:1,
  gobo:1,led:1,floorFog:1,projection:1,
});
const finite=(n:number)=>Number.isFinite(n);
const clamp=(n:number,a:number,b:number)=>Math.min(b,Math.max(a,n));
const round=(n:number)=>Math.round(n*100000)/100000;
export function planAdvancedStageLightingV621(input:AdvancedStageLightingInputV621):AdvancedStageLightingPlanV621{
  const {narrative:n,section,trackId,positionMs,durationMs}=input;
  if(!n||!input.playing||!input.reactive||input.reducedMotion||input.authored||input.blackout||input.tier==='low'||
    !trackId||!finite(positionMs)||!finite(durationMs)||durationMs<=0||positionMs<0||positionMs>=durationMs||
    !finite(input.energy)||input.energy<0||input.energy>1||!finite(input.kick)||input.kick<0||input.kick>1||
    !finite(input.groupCount)||input.groupCount<1||input.groupCount>4||
    n.plan.source!=='verified-v600'||n.cue.source!=='verified-v600'||!n.cue.active||
    n.plan.trackId!==trackId||n.plan.durationMs!==durationMs||
    !Number.isInteger(n.cue.act)||n.cue.act<0||n.cue.act>=n.plan.acts.length||
    !finite(n.cue.transition)||n.cue.transition<0||n.cue.transition>1)return {...NEUTRAL};
  const a=n.plan.acts[n.cue.act];
  if(a.index!==n.cue.act||a.section!==section||
    a.chapter!==n.cue.chapter||a.motif!==n.cue.motif||a.repetition!==n.cue.repetition||
    !finite(a.startMs)||!finite(a.endMs)||positionMs<a.startMs||positionMs>=a.endMs)return {...NEUTRAL};
  // The existing V604 fade avoids sudden effects at section transitions.
  const fade=clamp(n.cue.transition,0,1)*(input.tier==='balanced'?.6:1);
  const accent=input.energy*fade;
  const vocal=input.vocalFocus;
  const lyrics=input.lyricsProtected;
  const crew=input.groupCount>=2;
  const hard=/hardstyle|hardtekk|hardtek|rawstyle/i.test(input.genre??'');
  const repeat=(a.repetition%2)===1;
  // Deliberate stages: verse face key, hook group spots+LED, build measured rise,
  // drop real kick; every protected word lowers beam/haze/gobo competition.
  let key=1,fill=1,beam=1,spot=1,haze=1,sweep=1,gobo=1,led=1,floorFog=1,projection=1;
  if(section==='verse'){
    key+=.027*fade;fill+=.04*fade;beam-=.09*fade;spot-=.025*fade;
    haze-=.12*fade;sweep-=.21*fade;gobo-=.10*fade;led-=.12*fade;floorFog-=.10*fade;
  }else if(section==='hook'){
    key+=.018*fade;fill+=.028*fade;
    spot+=(crew?.055:.034)*accent*(repeat?1.1:1);
    beam+=(repeat?.022:.045)*accent;
    led+=(repeat?.10:.055)*accent;
    gobo+=(repeat?.025:.065)*accent;
    sweep-=.07*fade;
    haze-=.055*fade;
    projection+=(repeat?.035:.055)*accent;
  }else if(section==='build'){
    const progress=clamp((positionMs-a.startMs)/(a.endMs-a.startMs),0,1);
    const rise=progress*accent;
    beam+=.055*rise;spot+=.045*rise;led+=.045*rise;
    gobo+=.04*rise;sweep+=.045*rise;haze-=.06*fade;
  }else if(section==='drop'){
    const verifiedKick=input.kick>0.28&&input.energy>0.25?input.kick*input.energy*fade:0;
    beam+=(hard?.082:.05)*verifiedKick;
    spot+=(hard?.075:.045)*verifiedKick;
    led+=.088*verifiedKick;gobo+=.05*verifiedKick;
    sweep+=.045*verifiedKick;
    floorFog+=.035*verifiedKick;
  }else if(section==='break'||section==='intro'){
    key-=.025*fade;fill-=.018*fade;beam-=.12*fade;spot-=.06*fade;
    haze-=.07*fade;sweep-=.19*fade;led-=.10*fade;gobo-=.14*fade;
    floorFog-=.05*fade;
  }
  // Favor clear, stable words and visible singing faces over decorative effects.
  if(vocal){key=Math.max(key,1+.016*fade);fill=Math.max(fill,1+.018*fade);
    sweep=Math.min(sweep,1-.14*fade);haze=Math.min(haze,1-.08*fade);}
  if(lyrics){key=Math.max(key,1);fill=Math.max(fill,1+.02*fade);
    beam=Math.min(beam,1-.13*fade);spot=Math.min(spot,1);
    haze=Math.min(haze,1-.27*fade);sweep=Math.min(sweep,1-.35*fade);
    gobo=Math.min(gobo,1-.22*fade);led=Math.min(led,1-.19*fade);
    floorFog=Math.min(floorFog,1-.24*fade);projection=Math.min(projection,1);}
  return {active:true,section,
    key:round(clamp(key,.94,1.07)),fill:round(clamp(fill,.94,1.07)),
    beam:round(clamp(beam,.69,1.085)),spot:round(clamp(spot,.9,1.08)),
    haze:round(clamp(haze,.68,1.04)),sweep:round(clamp(sweep,.63,1.06)),
    gobo:round(clamp(gobo,.73,1.07)),led:round(clamp(led,.78,1.10)),
    floorFog:round(clamp(floorFog,.74,1.04)),projection:round(clamp(projection,.95,1.055))};
}
/** Can only modulate a V601/V602 result; zero/budgeted-off effects stay zero.
 * No independent hook/drop detection or extra GPU resources. */
export function composeStageFxV621(base:StageFxCueV601,plan:AdvancedStageLightingPlanV621):StageFxCueV601{
  if(!plan.active||base.mode==='off'||base.mode==='ambient')return base;
  // Each effect is already authorized and capped by V556/V601/V602.
  // Never inject a missing effect or raise intensity above its preexisting owner cap.
  const cap=(n:number,gain:number,max:number)=>clamp(n*gain,0,Math.min(max,Math.max(0,n)*1.09));
  let gobo=cap(base.gobo,plan.gobo,.35);
  let pixelWall=cap(base.pixelWall,plan.led,.35);
  let projection=cap(base.projection,plan.projection,.35);
  // Preserve the ALREADY allocated shared V556/V601/V602 additive budget.
  // V621 can rebalance between LED, Gobo and projections, not inflate the sum.
  const budget=Math.min(.35,Math.max(0,base.gobo+base.pixelWall+base.projection));
  const total=gobo+pixelWall+projection;
  if(total>budget&&total>0){const factor=budget/total;
    gobo*=factor;pixelWall*=factor;projection*=factor;}
  return {...base,
    gobo:round(gobo),pixelWall:round(pixelWall),
    floorFog:cap(base.floorFog,plan.floorFog,.16),
    projection:round(projection),
    spotlight:cap(base.spotlight,plan.spot,.25),
    sweep:clamp(base.sweep*plan.sweep,0,1),
    speed:clamp(base.speed*(plan.sweep<1?plan.sweep:1),0,1),
  };
}
