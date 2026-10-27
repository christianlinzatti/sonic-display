/**
 * V551 – Intelligent Stage Atmosphere 4.0. A pure, conservative enhancement of
 * the already budgeted V462/V542 lights and V308 fog/beam objects.
 * Speaker focus is ONLY drawn from a verified V528 cast; no voice detection.
 */
import type {ConcertLightingPlanV542} from './intelligentConcertLightingV542';
import type {LightingMoodV462,LightingSectionV462,LightingTierV462} from './concertLightingDirectorV462';
import type {ConcertSceneV528} from './cinematicConcertCoordinationV528';

export type StageAtmosphereInputV551={
  base:ConcertLightingPlanV542;
  mood:LightingMoodV462;
  section:LightingSectionV462;
  energy:number;
  kick:number;
  tier:LightingTierV462;
  playing:boolean;
  reactive:boolean;
  reducedMotion:boolean;
  authored:boolean;
  blackout:boolean;
  lyricsProtected:boolean;
  groupCount:number;
  scene?:ConcertSceneV528|null;
};
export type StageAtmospherePlanV551={
  active:boolean;
  moment:'verse'|'handoff'|'ensemble'|'build'|'drop'|'ambient';
  keyGain:number;fillGain:number;beamGain:number;spotGain:number;
  hazeGain:number;sweepGain:number;
  // Relative offsets on the Fog object owned by the existing V308 renderer.
  fogNearOffset:number;fogFarOffset:number;
  leftSingerSlot:number|null;rightSingerSlot:number|null;
  focusStrength:number;
};
const finite=(x:number)=>Number.isFinite(x)?x:0;
const clamp=(x:number,a:number,b:number)=>Math.max(a,Math.min(b,finite(x)));
const neutral:StageAtmospherePlanV551={active:false,moment:'ambient',keyGain:1,fillGain:1,
  beamGain:1,spotGain:1,hazeGain:1,sweepGain:1,fogNearOffset:0,fogFarOffset:0,
  leftSingerSlot:null,rightSingerSlot:null,focusStrength:0};

/** Refuse unverified, stale, malformed, or mismatched singer casts. */
function trustedCast(scene:ConcertSceneV528|null|undefined,count:number):ConcertSceneV528|null {
  if(!scene?.active || !scene.trackId?.trim() || !Number.isInteger(count)||count<1||count>4||
    scene.count!==count || !Number.isFinite(scene.strength)||scene.strength<=0||scene.strength>1 ||
    !Number.isFinite(scene.cueStartMs)||!Number.isFinite(scene.cueEndMs)||scene.cueEndMs<=scene.cueStartMs||
    !Number.isInteger(scene.leadSlot)||scene.leadSlot<0||scene.leadSlot>=count||
    !Array.isArray(scene.singingSlots)||scene.singingSlots.length<1||
    scene.singingSlots.some(s=>!Number.isInteger(s)||s<0||s>=count)||
    new Set(scene.singingSlots).size!==scene.singingSlots.length ||
    !scene.singingSlots.includes(scene.leadSlot)||
    (scene.focus!=='lead'&&scene.focus!=='handoff'&&scene.focus!=='ensemble')||
    (scene.focus==='ensemble'&&scene.singingSlots.length<2)||
    (scene.focus==='handoff'&&(!Number.isInteger(scene.handoffFrom)||scene.handoffFrom===scene.leadSlot||(scene.handoffFrom as number)>=count||(scene.handoffFrom as number)<0)))return null;
  return scene;
}

export function planStageAtmosphereV551(input:StageAtmosphereInputV551):StageAtmospherePlanV551{
  if(!input.base.active||!input.playing||!input.reactive||input.reducedMotion||input.authored||
    input.blackout||input.tier==='low')return neutral;
  const level=input.tier==='high'?1:.56;
  const energy=clamp(input.energy,0,1),kick=clamp(input.kick,0,1);
  const cast=trustedCast(input.scene,input.groupCount);
  const focus=cast?.focus??null;
  const singerStrength=cast?clamp(cast.strength,0,.8)*level:0;
  const handoff=focus==='handoff',ensemble=focus==='ensemble';
  const rap=input.mood==='rap';
  // The song structure is an estimate. A hard-dance drop gets an accent ONLY
  // from measured kick and energy, not from the section label alone.
  const drop=(input.mood==='hardstyle'||input.mood==='hardtekk')&&input.section==='drop'&&kick>.14&&energy>.32;
  const build=(input.mood==='hardstyle'||input.mood==='hardtekk')&&input.section==='build'&&energy>.25;
  const dropStrength=drop?clamp((kick-.14)/.86,0,1)*clamp((energy-.32)/.68,0,1)*level:0;
  const moment:StageAtmospherePlanV551['moment']=handoff?'handoff':ensemble?'ensemble':
    focus==='lead'?'verse':drop?'drop':build?'build':rap?'verse':'ambient';
  let key=1,fill=1,beam=1,spot=1,haze=1,sweep=1,near=0,far=0;
  if(handoff){
    key+=.035*singerStrength;fill+=.06*singerStrength;spot+=.045*singerStrength;
    beam-=.06*singerStrength;sweep-=.27*singerStrength;haze-=.22*singerStrength;
    near+=.95*singerStrength;far+=1.3*singerStrength;
  }else if(ensemble){
    key+=.035*singerStrength;fill+=.07*singerStrength;spot+=.06*singerStrength;
    beam+=.028*singerStrength;sweep-=.18*singerStrength;haze-=.22*singerStrength;
    near+=.9*singerStrength;far+=1.15*singerStrength;
  }else if(rap){
    fill+=.028*level;beam-=.05*level;haze-=.12*level;sweep-=.12*level;
    near+=.65*level;far+=.8*level;
  }else if(drop){
    beam+=.065*dropStrength;spot+=.055*dropStrength;sweep+=.045*dropStrength;
    haze+=.025*dropStrength;near-=.35*dropStrength;far-=.5*dropStrength;
  }else if(build){
    beam+=.025*level*energy;spot+=.025*level*energy;
    sweep+=.022*level*energy;
  }
  // Captions get priority even during drops and ensemble shots. The text clock
  // is not touched; this only attenuates pre-existing stage VFX objects.
  if(input.lyricsProtected){
    fill=Math.max(fill,1+.02*level);
    beam=Math.min(beam,1-.13*level);
    haze=Math.min(haze,1-.22*level);
    sweep=Math.min(sweep,1-.24*level);
    spot=Math.min(spot,1+.04*level);
    near=Math.max(near,.7*level);far=Math.max(far,.95*level);
  }
  // Only actors with verified vocal assignment may steer the existing spots.
  // World coordinates are sampled by V308 at render time, not guessed here.
  const leftSingerSlot=cast?(handoff?cast.handoffFrom:ensemble?cast.singingSlots[0]:cast.leadSlot):null;
  const rightSingerSlot=cast?(handoff?cast.leadSlot:ensemble?cast.singingSlots[cast.singingSlots.length-1]:null):null;
  return {active:true,moment,
    keyGain:clamp(key,.96,1.07),fillGain:clamp(fill,.96,1.07),
    beamGain:clamp(beam,.82,1.09),spotGain:clamp(spot,.94,1.09),
    hazeGain:clamp(haze,.73,1.05),sweepGain:clamp(sweep,.72,1.07),
    fogNearOffset:clamp(near,-.4,1.6),fogFarOffset:clamp(far,-.6,2),
    leftSingerSlot,rightSingerSlot,focusStrength:cast?clamp(.25+singerStrength*.55,0,.7):0};
}
