import type {ConcertDetailSettingsV555,ConcertDetailsCueV555} from './concertDetailEffectsV555';
import type {PerformerLightingPlanV557} from './performerLightingV557';
import type {AvatarPortraitPlanV558} from './avatarPortraitLightingV558';

export type CinematicAvatarLightingPlanV566 = Readonly<{
  enabled:boolean; keyLift:number; fillLift:number; colorMix:number;
  faceBalance:number; mode:'off'|'portrait'|'duet'|'hook';
}>;
const OFF:CinematicAvatarLightingPlanV566=Object.freeze({
  enabled:false,keyLift:0,fillLift:0,colorMix:0,faceBalance:0,mode:'off',
});
const clamp01=(v:number)=>Number.isFinite(v)?Math.max(0,Math.min(1,v)):0;

/** Camera-aligned portrait fill on EXISTING key/fill R3F lights only.
 * Camera alignment/distance are measured from the actual Three camera to the verified,
 * visible performer root, NOT guessed singer roles, face direction or lyrics text.
 * This intentionally does not claim eye tracking, phoneme tracking or occlusion analysis.
 */
export function planCinematicAvatarLightingV566(input:{
  performer:PerformerLightingPlanV557;portrait:AvatarPortraitPlanV558;
  cue?:ConcertDetailsCueV555|null;settings?:Partial<ConcertDetailSettingsV555>;
  cameraDistance:number;cameraAlignment:number;rootVisible:boolean;
  playing:boolean;reactive:boolean;reducedMotion:boolean;
  tier:'low'|'balanced'|'high';authored:boolean;blackout:boolean;
  lyricsProtected?:boolean;
}):CinematicAvatarLightingPlanV566 {
  const {settings,performer,portrait,cue,tier}=input;
  if(!settings||settings.enabled===false||settings.avatarLight===false||settings.portraitLight===false||
     settings.cinematicFaceLightV566===false||performer.focusSlot===null||!portrait.enabled||!cue||
     !input.rootVisible||!input.playing||!input.reactive||input.reducedMotion||tier==='low'||
     input.authored||input.blackout||!Number.isFinite(input.cameraDistance)||
     !Number.isFinite(input.cameraAlignment)||input.cameraDistance<.8||input.cameraDistance>10||
     input.cameraAlignment<.7)return OFF;
  const strength=clamp01((settings.cinematicFaceStrengthV566??50)/100)*
    clamp01((settings.avatarLightStrength??55)/100)*clamp01((settings.strength??45)/100);
  if(strength<=0)return OFF;
  // A 3D camera is not a facial pose solver: camera field of view and distance
  // only provide a modest approximate shot-composition signal.
  const framing=clamp01((10-input.cameraDistance)/7.3);
  const aligned=clamp01((input.cameraAlignment-.7)/.25);
  const dense=clamp01(cue.density)>.7;
  const duo=performer.partnerSlot!==null;
  const hook=!!performer.hook;
  const mode=duo?'duet':hook?'hook':'portrait';
  const detailGuard=input.lyricsProtected?.65:1;
  const cadence=dense?.65:1;
  const amount=clamp01(strength*framing*aligned*detailGuard*cadence*(tier==='high'?1:.75)*2.7);
  if(amount<=.001)return OFF;
  return {
    enabled:true,
    keyLift:Math.min(.14,amount*.13),
    fillLift:Math.min(.115,amount*(duo?.11:.085)),
    colorMix:Math.min(.12,amount*.11),
    // Keep the existing key/fill at the upper chest/face, not inside the mesh.
    faceBalance:Math.min(.94,Math.max(portrait.faceBodyBalance,portrait.faceBodyBalance+amount*.13)),
    mode,
  };
}
