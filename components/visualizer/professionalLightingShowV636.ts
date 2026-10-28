/** V636 Professional Lighting Show: a bounded lighting score for the existing
 * V308 spots/shafts and V555 floor-gobo, never an additional lamp or clock.
 * All cues must match the verified V600/V604 song timeline AND live playback.
 */
import type {AdvancedStageLightingInputV621} from './advancedStageLightingV621';
import type {StageFxCueV601} from './advancedConcertStageFxV601';

export type ProfessionalLightingInputV636=AdvancedStageLightingInputV621 & {enabled:boolean};
export type ProfessionalLightingCueV636={
  active:boolean;act:number;motif:'none'|'portrait'|'ensemble'|'rise'|'impact'|'respite';
  beam:number;spot:number;haze:number;sweep:number;
  aimOffset:number;goboGain:number;goboVariant:0|1|2;goboMix:number;goboSpeed:number;
};
export const NEUTRAL_PRO_LIGHTING_V636:Readonly<ProfessionalLightingCueV636>=Object.freeze({
  active:false,act:-1,motif:'none',beam:1,spot:1,haze:1,sweep:1,
  aimOffset:0,goboGain:1,goboVariant:0,goboMix:0,goboSpeed:1,
});
const finite=(x:unknown):x is number=>typeof x==='number'&&Number.isFinite(x);
const clamp=(x:number,lo:number,hi:number)=>Math.max(lo,Math.min(hi,x));
const smooth=(x:number)=>{const t=clamp(x,0,1);return t*t*(3-2*t);};
const round=(x:number)=>Math.round(x*100000)/100000;
export function planProfessionalLightingV636(i:ProfessionalLightingInputV636):ProfessionalLightingCueV636{
  const p=i.narrative?.plan,c=i.narrative?.cue;
  if(!i.enabled||!i.playing||!i.reactive||i.reducedMotion||i.authored||i.blackout||i.tier==='low'||
    !p||!c||!c.active||p.source!=='verified-v600'||c.source!=='verified-v600'||
    !i.trackId||p.trackId!==i.trackId||!finite(i.positionMs)||!finite(i.durationMs)||
    i.durationMs<=0||p.durationMs!==i.durationMs||i.positionMs<0||i.positionMs>=i.durationMs||
    !finite(i.energy)||i.energy<0||i.energy>1||!finite(i.kick)||i.kick<0||i.kick>1||
    !Number.isInteger(i.groupCount)||i.groupCount<1||i.groupCount>4||
    !Number.isInteger(c.act)||c.act<0||c.act>=p.acts.length||
    !finite(c.transition)||c.transition<=0||c.transition>1)return {...NEUTRAL_PRO_LIGHTING_V636};
  const a=p.acts[c.act];
  if(a.index!==c.act||a.section!==i.section||a.chapter!==c.chapter||
    a.motif!==c.motif||a.repetition!==c.repetition||!Number.isInteger(a.repetition)||a.repetition<0||
    !finite(a.startMs)||!finite(a.endMs)||a.endMs<=a.startMs||
    i.positionMs<a.startMs||i.positionMs>=a.endMs)return {...NEUTRAL_PRO_LIGHTING_V636};
  const edge=Math.min(1300,(a.endMs-a.startMs)*.25);
  const envelope=smooth((i.positionMs-a.startMs)/Math.max(1,edge))*
    smooth((a.endMs-i.positionMs)/Math.max(1,edge))*c.transition*(i.tier==='balanced'?.56:1);
  const face=i.vocalFocus;
  const text=i.lyricsProtected;
  const hard=/hardstyle|hardtekk|hardtek|rawstyle/i.test(i.genre??'');
  const hook=a.section==='hook';
  const build=a.section==='build';
  const drop=a.section==='drop'&&i.energy>=.32&&i.kick>=.28;
  const quiet=a.section==='break';
  const verse=a.section==='verse';
  const motif:ProfessionalLightingCueV636['motif']=quiet?'respite':verse?'portrait':
    build?'rise':drop?'impact':hook?'ensemble':a.section==='drop'?'respite':'none';
  const prog=clamp((i.positionMs-a.startMs)/(a.endMs-a.startMs),0,1);
  const energy=clamp(i.energy,0,1);
  const accent=hook?energy*(i.groupCount>=2?1:.7):
    build?energy*prog:drop?energy*i.kick:0;
  const decoration=text?.24:face?.52:1;
  const level=envelope*decoration;
  // The original per-source limits in V308/V462/V542/V621/V601 remain authoritative.
  // V636 alone never creates an effect: all outputs are multipliers on existing work.
  const beam=clamp(1+level*(quiet?-.095:verse?-.065:
    hook?.038*accent:build?.045*accent:drop?(hard?.07:.045)*accent:-.03),.90,1.065);
  const spot=clamp(text?Math.min(1,1+envelope*(quiet?-.06:verse?.025:hook?.04*accent:
    build?.04*accent:drop?.065*accent:0)):1+envelope*(quiet?-.06:verse?.025:hook?.04*accent:
    build?.04*accent:drop?.065*accent:0),.92,1.065);
  const haze=clamp(1-envelope*(text?.16:face?.12:quiet?.12:verse?.10:.06),.84,1);
  const sweep=clamp(1+level*(quiet?-.18:verse?-.14:hook?.035*accent:
    build?.04*accent:drop?.055*accent:0),.83,1.055);
  const goboGain=clamp(text?Math.min(.95,1+level*(quiet?-.24:verse?-.15:hook?.075*accent:
    build?.065*accent:drop?.09*accent:0)):1+level*(quiet?-.24:verse?-.15:hook?.075*accent:
    build?.065*accent:drop?.09*accent:0),.77,1.08);
  // Existing floor-gobo patterns: lines, grids and rings. Repeat hooks rotate
  // motifs without rerolling / guessing a new musical section.
  const goboVariant:0|1|2=quiet||verse?0:build?1:drop?2:hook?(a.repetition%3) as 0|1|2:0;
  const goboMix=clamp(level*(quiet?.25:verse?.16:.35),0,.35);
  const drift=quiet||verse?.42:build?.6:hook?.67:drop?.82:.5;
  // Subtle paired sweeps are anchored to Spotify playback, never a second timer.
  // Caller applies only to non-vocal spot targets.
  const aimOffset=round(!text&&!face&&(hook||build||drop)?Math.sin(i.positionMs/1000*(hard?.42:.28))*.11*level:0);
  return {active:true,act:c.act,motif,beam:round(beam),spot:round(spot),
    haze:round(haze),sweep:round(sweep),aimOffset,
    goboGain:round(goboGain),goboVariant,goboMix:round(goboMix),goboSpeed:round(drift)};
}
/** Rebalance already authorized V556/V601/V602/V621 effects. Zero stays zero;
 * the existing gobo/LED/projection additive allocation cannot increase. */
export function composeProfessionalStageFxV636(base:StageFxCueV601,cue:ProfessionalLightingCueV636):StageFxCueV601{
  if(!cue.active||base.mode==='off'||base.mode==='ambient')return base;
  const budget=Math.max(0,base.gobo+base.pixelWall+base.projection);
  const intended=Math.min(.35,Math.max(0,base.gobo*cue.goboGain));
  const allowable=Math.max(0,budget-base.projection);
  const gobo=Math.min(intended,allowable);
  const pixelWall=Math.min(base.pixelWall,Math.max(0,allowable-gobo));
  return {...base,gobo:round(gobo),pixelWall:round(pixelWall),
    spotlight:Math.min(base.spotlight,.25,round(base.spotlight*cue.spot)),
    sweep:round(Math.min(base.sweep,clamp(base.sweep*cue.sweep,0,1))),
    speed:round(clamp(base.speed*cue.goboSpeed,0,1))};
}
