import type {ConcertDetailsCueV555,ConcertDetailSettingsV555} from './concertDetailEffectsV555';
import type {ConcertSceneV528} from './cinematicConcertCoordinationV528';

export type PerformerLightingPlanV557={keyGain:number;fillGain:number;focusSlot:number|null;partnerSlot:number|null;hook:boolean};
const neutral=():PerformerLightingPlanV557=>({keyGain:1,fillGain:1,focusSlot:null,partnerSlot:null,hook:false});
const clamp=(v:number)=>Number.isFinite(v)?Math.min(1,Math.max(0,v)):0;
/** Bounded accents for existing R3F key/fill lights; no added lights, shadows or guessed cast.
 * This is deliberately subordinate to authored timelines and blackouts.
 */
export function planPerformerLightingV557(input:{
  cue?:ConcertDetailsCueV555|null;
  settings?:Partial<ConcertDetailSettingsV555>;
  scene?:ConcertSceneV528|null;
  count:number;playing:boolean;reducedMotion:boolean;progressMs?:number;
  tier:'low'|'balanced'|'high';authored:boolean;blackout:boolean;
}):PerformerLightingPlanV557{
  const {settings,scene,count,playing,reducedMotion,tier,authored,blackout}=input;
  if(!settings||!input.cue||settings.enabled===false||settings.avatarLight===false||!playing||authored||blackout||
     reducedMotion||tier==='low'||!Number.isInteger(count)||count<1)return neutral();
  const strength=clamp((settings?.avatarLightStrength??55)/100)*clamp((settings?.strength??45)/100);
  if(strength<=0)return neutral();
  const hook=!!(input.cue?.hook||scene?.active&&scene.focus==='ensemble');
  const dense=clamp(input.cue?.density??0)>.7;
  const lift=hook?(dense?.32:1):.42;
  // A conservative face-lift, never a flash or strobe; reserved contrast for lyrics.
  const keyGain=1+strength*(tier==='high'?.34:.26)*lift;
  const fillGain=1+strength*(tier==='high'?.24:.18)*(hook?.85:.5);
  const valid=!!(scene?.active&&scene.trackId?.trim()&&scene.count===count&&
    Number.isInteger(scene.leadSlot)&&scene.leadSlot>=0&&scene.leadSlot<count&&
    scene.singingSlots?.includes(scene.leadSlot)&&scene.singingSlots.every(s=>Number.isInteger(s)&&s>=0&&s<count));
  // A single visible avatar is a scene object, not a singer assignment.
  const focusSlot=valid?scene!.leadSlot:count===1?0:null;
  const handoff=valid&&scene!.focus==='handoff'&&scene!.handoffFrom!==null&&
    Number.isInteger(scene!.handoffFrom)&&scene!.handoffFrom!>=0&&scene!.handoffFrom!<count&&
    scene!.handoffFrom!==scene!.leadSlot&&Number.isFinite(input.progressMs)&&
    (input.progressMs??Infinity)>=scene!.cueStartMs&&
    (input.progressMs??Infinity)-scene!.cueStartMs<1050;
  const partnerSlot=handoff?scene!.handoffFrom:
    valid&&scene!.focus==='ensemble'?scene!.singingSlots.find(s=>s!==scene!.leadSlot)??null:null;
  return {keyGain,fillGain,focusSlot,partnerSlot,hook};
}
