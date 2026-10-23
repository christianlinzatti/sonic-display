/** V456 Ultimate Automatic Show Director.
 * A small, deterministic shared score for stage motion, ensemble gestures, camera,
 * lighting and *passive* song information. No background task, voice recognition,
 * network request, persistent edits or additional animation clock.
 */
import type {SmartShowCueV446} from '../../components/visualizer/smartAutomaticRapShowV446';
import type {MotionSceneV438} from '../../components/visualizer/automaticMotionIntelligenceV438';
import type {VisualBalanceV451} from './visualBalanceV451';

export type ShowMomentV456='idle'|'solo'|'crew'|'interlude';
export interface UltimateShowDirectionV456 {
  active:boolean;
  moment:ShowMomentV456;
  eventId:string;
  leadSlot:number;
  count:number;
  scene:MotionSceneV438;
  /** A visual focus, NEVER an identification of the actual vocalist. */
  cameraCue:SmartShowCueV446|null;
  lightMultiplier:number;
  interactionMultiplier:number;
  balance:VisualBalanceV451;
}
const clamp=(v:number,lo:number,hi:number)=>Number.isFinite(v)?Math.max(lo,Math.min(hi,v)):lo;

/** Pure arbitration. Authored vocal/camera/dance control always wins. */
export function planUltimateAutomaticShowV456(input:{
  enabled:boolean;playing:boolean;reducedMotion:boolean;automaticDance:boolean;
  manualCamera?:boolean;manualVocal?:boolean;
  cue?:SmartShowCueV446|null;balance:VisualBalanceV451;
  count:number;energy?:number;
}):UltimateShowDirectionV456{
  const count=Math.trunc(clamp(input.count,1,4));
  const cue=input.cue;
  const active=input.enabled&&input.playing&&!input.reducedMotion&&input.automaticDance&&
    !input.manualVocal&&!!cue?.active&&!!cue.eventId;
  const base:UltimateShowDirectionV456={
    active:false,moment:'idle',eventId:'v456:inactive',leadSlot:0,count,
    scene:'verse',cameraCue:null,lightMultiplier:1,interactionMultiplier:1,balance:input.balance,
  };
  if(!active||!cue)return base;
  const group=cue.group||cue.section==='hook';
  const interlude=!group&&(cue.section==='intro'||cue.section==='outro');
  const moment:ShowMomentV456=group?'crew':interlude?'interlude':'solo';
  // The V451 lyrics budget still decides if an information card is legible.
  // Protect an active group hook even when there is a gap in the lyric source.
  const balance=group&&input.balance.allowAutomaticInsight&&input.balance.attention!=='lyrics'
    ? {...input.balance,attention:'balanced' as const,reason:'group-show' as const,
        allowAutomaticInsight:false,allowCinematic:false,allowConnectionSpotlight:false}
    : input.balance;
  const energy=clamp(input.energy??.5,0,1);
  const lightMultiplier=moment==='crew'?1.05+.10*energy:moment==='interlude'?.94:1+.035*energy;
  return {
    active:true,moment,eventId:`v456:${cue.eventId}:${moment}`,
    leadSlot:Math.trunc(clamp(cue.focus,0,count-1)),count,
    scene:cue.motionScene,
    cameraCue:input.manualCamera?null:cue,
    lightMultiplier:clamp(lightMultiplier,.9,1.15),
    interactionMultiplier:moment==='crew'?1.10:moment==='interlude'?.92:1,
    balance,
  };
}

/** The same scene/performer convention drives every automatic GLB motion slot. */
export function motionForUltimateShowV456(direction:UltimateShowDirectionV456,
  slot:number,fallback:MotionSceneV438):MotionSceneV438{
  if(!direction.active)return fallback;
  if(direction.moment==='crew')return direction.scene;
  if(direction.moment==='interlude')return 'break';
  return slot===direction.leadSlot?direction.scene:'break';
}

/** Bound the live energy going to motion ranking; hooks do not force full energy. */
export function energyForUltimateShowV456(direction:UltimateShowDirectionV456,
  slot:number,liveEnergy:number):number{
  const energy=clamp(liveEnergy,0,1);
  if(!direction.active)return energy;
  if(direction.moment==='crew')return Math.max(energy,.74);
  if(direction.moment==='interlude'||slot!==direction.leadSlot)return Math.min(energy,.26);
  return energy;
}

/** Never creates/activates a previously disabled lighting or camera system. */
export function lightStrengthForUltimateShowV456(direction:UltimateShowDirectionV456,
  userStrength:number,reactive:boolean):number{
  const strength=clamp(userStrength,0,100);
  return reactive&&direction.active?Math.round(clamp(strength*direction.lightMultiplier,0,100)):strength;
}
