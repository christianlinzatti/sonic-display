import type {ConcertDetailSettingsV555,ConcertDetailsCueV555} from './concertDetailEffectsV555';
import type {PerformerLightingPlanV557} from './performerLightingV557';

export type AvatarPortraitPlanV558 = {
  enabled:boolean; keyWarmth:number; fillWarmth:number; faceBodyBalance:number;
  fillSlot:number|null; mode:'off'|'verse'|'hook'|'dense'|'duet';
};
const off:AvatarPortraitPlanV558={enabled:false,keyWarmth:0,fillWarmth:0,faceBodyBalance:0,fillSlot:null,mode:'off'};
const clamp=(v:number)=>Number.isFinite(v)?Math.max(0,Math.min(1,v)):0;
/** No additional lights or skin shader, only temperature and aiming of the existing key/fill.
 * No speaker guesses: both slots originate in V557 validated real cast or one visible solo.
 */
export function planAvatarPortraitLightingV558(input:{
  performer:PerformerLightingPlanV557; cue?:ConcertDetailsCueV555|null;
  settings?:Partial<ConcertDetailSettingsV555>; tier:'low'|'balanced'|'high';
}):AvatarPortraitPlanV558 {
  const {performer,cue,settings,tier}=input;
  if(!settings||settings.enabled===false||settings.avatarLight===false||settings.portraitLight===false||
     tier==='low'||!cue||performer.focusSlot===null)return off;
  const strength=clamp((settings.avatarLightStrength??55)/100)*clamp((settings.strength??45)/100);
  const warmth=clamp((settings.portraitWarmth??52)/100);
  if(strength<=0||warmth<=0)return off;
  // Dense rapid lyrics need calm backgrounds and little extra chromatic emphasis.
  const dense=clamp(cue.density)>.7;
  const duo=performer.partnerSlot!==null;
  const hook=!!performer.hook;
  const mode=duo?'duet':dense?'dense':hook?'hook':'verse';
  const cadence=dense?.48:hook?1:.76;
  const weight=Math.min(.48,strength*(.62+warmth*.65)*cadence*(tier==='high'?1.08:1));
  return {
    enabled:true,
    keyWarmth:weight,
    // For duet: subtle cooler partner fill, not a flashing color or a guessed role.
    fillWarmth:Math.min(.34,weight*(duo?.68:.82)),
    // Position both point lights near the upper torso instead of the head alone.
    faceBodyBalance:Math.min(.9,.35+strength*(hook?.9:.65)),
    fillSlot:duo?performer.partnerSlot:performer.focusSlot,
    mode,
  };
}
