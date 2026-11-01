/** V689 – Professional Lighting Director.
 * One deterministic score for the EXISTING V308 moving heads/shafts and V555
 * floor Gobo/LED/fog. Verified V604/V600 acts & playback only. No extra lamps,
 * independent beat clock, strobes, GPU passes, singer inference or config mutation.
 */
import {planProfessionalLightingV636,type ProfessionalLightingInputV636} from './professionalLightingShowV636';
import type {StageFxCueV601} from './advancedConcertStageFxV601';
export type LightingLookV689='neutral'|'portrait'|'rise'|'ensemble'|'impact'|'respite';
export type LightingScoreV689={
 active:boolean;look:LightingLookV689;act:number;
 beam:number;spot:number;sweep:number;haze:number;
 gobo:number;wall:number;floorFog:number;aimOffset:number;
 goboVariant:0|1|2;goboMix:number;ledMotif:0|1|2;ledMix:number;beatPulse:number;
};
export const NEUTRAL_LIGHTING_V689:Readonly<LightingScoreV689>=Object.freeze({
 active:false,look:'neutral',act:-1,beam:1,spot:1,sweep:1,haze:1,
 gobo:1,wall:1,floorFog:1,aimOffset:0,goboVariant:0,goboMix:0,
 ledMotif:0,ledMix:0,beatPulse:0,
});
const clamp=(n:number,min:number,max:number)=>Math.max(min,Math.min(max,n));
const smooth=(n:number)=>{const t=clamp(n,0,1);return t*t*(3-2*t);};
const round=(n:number)=>Math.round(n*100000)/100000;
/** Both renderers use the same song evidence, section index and playback clock.
 * Every multiplier is <=1: existing source budgets remain upper bounds.
 */
export function planProfessionalLightingDirectorV689(input:ProfessionalLightingInputV636):LightingScoreV689{
 const verified=planProfessionalLightingV636(input);
 if(!verified.active||verified.motif==='none')return {...NEUTRAL_LIGHTING_V689};
 const act=input.narrative!.plan.acts[verified.act];
 const edge=Math.min(1300,(act.endMs-act.startMs)*.25);
 const fade=smooth((input.positionMs-act.startMs)/Math.max(1,edge))*
   smooth((act.endMs-input.positionMs)/Math.max(1,edge))*
   input.narrative!.cue.transition*(input.tier==='balanced'?.62:1);
 const position=clamp((input.positionMs-act.startMs)/(act.endMs-act.startMs),0,1);
 const look:LightingLookV689=verified.motif;
 const intensity=clamp(input.energy,0,1);
 const impact=look==='impact'?clamp(input.kick*intensity,0,1):0;
 const isDance=/hardstyle|hardtekk|hardtek|rawstyle/i.test(input.genre??'');
 // During lyrics or sung facial closeups, avoid choreography-wide sweeps.
 const protectedScene=input.lyricsProtected||input.vocalFocus;
 const decoration=protectedScene?.40:1;
 const level=fade*decoration;
 const calm=look==='respite';
 const verse=look==='portrait';
 const build=look==='rise';
 const hook=look==='ensemble';
 const drop=look==='impact';
 const lift=build?position:1;
 const beam=clamp(1-level*(calm?.20:verse?.12:build?.07*(1-lift):hook?.025:drop?.025*(1-impact):.05),.80,1);
 const spot=clamp(1-level*(calm?.17:verse?.05:build?.055*(1-lift):hook?.025:drop?.02*(1-impact):.05),.82,1);
 const sweep=clamp(1-level*(calm?.31:verse?.24:build?.10*(1-lift):hook?.03:drop?.04*(1-impact):.08),.68,1);
 const haze=clamp(1-level*(protectedScene?.20:calm?.14:verse?.15:build?.11:.09),.78,1);
 const gobo=clamp(1-level*(calm?.46:verse?.32:build?.17*(1-lift):hook?.08:drop?.08*(1-impact):.18),.50,1);
 const wall=clamp(1-level*(calm?.47:verse?.28:build?.20*(1-lift):hook?.075:drop?.06*(1-impact):.15),.50,1);
 const floorFog=clamp(1-level*(protectedScene?.35:calm?.23:verse?.18:.11),.58,1);
 const goboVariant:0|1|2=calm||verse?0:build?1:drop?2:hook?((act.repetition+1)%3) as 0|1|2:0;
 const ledMotif:0|1|2=calm||verse?0:build?1:drop?2:hook?(act.repetition%3) as 0|1|2:0;
 // No rhythmic flashes: at most a very subtle alpha/pattern accent, bounded
 // by each material's existing level and smoothly interpolated at transitions.
 const beatPulse=round(level*(drop?Math.min(.15,.12*impact):hook?Math.min(.08,.05*intensity):0));
 const aimOffset=protectedScene?0:round(Math.sin(input.positionMs/1000*(isDance?.37:.24))*
   fade*(hook?.045:build?.03:drop?.05:0));
 return {active:true,look,act:verified.act,
   beam:round(beam),spot:round(spot),sweep:round(sweep),haze:round(haze),
   gobo:round(gobo),wall:round(wall),floorFog:round(floorFog),aimOffset,
   goboVariant,goboMix:round(level*(calm?.12:verse?.13:.31)),
   ledMotif,ledMix:round(level*(calm?.14:verse?.13:build?.26:.36)),beatPulse};
}
/** Modify only the already active decorative layers; do not allocate wattage
 * from a disabled LED/Gobo or exceed any existing spotlight/fog/budget.
 */
export function composeProfessionalStageFxV689(base:StageFxCueV601,score:LightingScoreV689):StageFxCueV601{
 if(!score.active||base.mode==='off'||base.mode==='ambient')return base;
 return {...base,
  gobo:round(base.gobo*score.gobo),pixelWall:round(base.pixelWall*score.wall),
  floorFog:round(base.floorFog*score.floorFog),
  spotlight:round(base.spotlight*score.spot),
  sweep:round(base.sweep*score.sweep),
 };
}
