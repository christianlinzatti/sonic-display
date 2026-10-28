/**
 * V618 – Full-Body Performance Coordination.
 *
 * Refines ONLY V582's verified word-bound upper-body overlay using V617's
 * existing facial head cue and the PREVIOUS frame's actual V492 IK contacts.
 * No additional singer/beat/word detection, no new timing clock, root/hip/leg
 * movement, or animation clips. Authored animation and GLB mixer keep ownership.
 */
import type {NaturalDanceFaceCueV582} from './naturalDanceFacialCoordinationV582';
import type {VocalFacialRealismV617} from './advancedVocalFacialRealismV617';

export type FootSupportV618=Readonly<{
  known:boolean;leftPlanted:boolean;rightPlanted:boolean;
  leftConfidence:number;rightConfidence:number;
}>;
export type FullBodyPerformanceCueV618=Readonly<{
  active:boolean;source:'verified-word-and-ik'|'none';
  body:NaturalDanceFaceCueV582;
  leftArmPitch:number;rightArmPitch:number;
}>;
const clamp=(n:number,lo:number,hi:number)=>Math.max(lo,Math.min(hi,n));
const off=(body:NaturalDanceFaceCueV582):FullBodyPerformanceCueV618=>({
  active:false,source:'none',body,leftArmPitch:0,rightArmPitch:0,
});

/** The contact sample is read from the EXISTING IK state; unknown is not planted. */
export function coordinateFullBodyPerformanceV618(input:{
  body:NaturalDanceFaceCueV582;
  face:Pick<VocalFacialRealismV617<unknown>,
    'active'|'source'|'wordStartMs'|'headPitch'|'headYaw'>;
  verifiedWordStartMs:number;
  foot:FootSupportV618;
  playing:boolean;enabled:boolean;authoredMotion:boolean;reducedMotion:boolean;
  tier:'low'|'balanced'|'high';bodyStrength:number;energy:number;
}):FullBodyPerformanceCueV618{
  const {body,face,foot}=input;
  const none=off(body);
  if(!body.active||body.source!=='verified-v581-word'||!face.active||
     face.source!=='verified-timed-word'||!Number.isFinite(input.verifiedWordStartMs)||
     input.verifiedWordStartMs<0||face.wordStartMs!==input.verifiedWordStartMs||
     !input.playing||!input.enabled||input.authoredMotion||input.reducedMotion||
     input.tier==='low'||!foot.known||(!foot.leftPlanted&&!foot.rightPlanted)||
     !Number.isFinite(foot.leftConfidence)||!Number.isFinite(foot.rightConfidence)||
     foot.leftConfidence<0||foot.leftConfidence>1||
     foot.rightConfidence<0||foot.rightConfidence>1||
     !Number.isFinite(face.headPitch)||!Number.isFinite(face.headYaw)||
     Math.abs(face.headPitch)>.00401||Math.abs(face.headYaw)>.00201||
     !Number.isFinite(input.bodyStrength)||input.bodyStrength<=0||
     !Number.isFinite(input.energy)||input.energy<0||input.energy>1||
     !Number.isFinite(body.chestPitch)||!Number.isFinite(body.chestRoll)||
     !Number.isFinite(body.leftShoulderRoll)||!Number.isFinite(body.rightShoulderRoll)||
     Math.abs(body.chestPitch)>.00901||Math.abs(body.chestRoll)>.00501||
     Math.abs(body.leftShoulderRoll)>.00701||Math.abs(body.rightShoulderRoll)>.00701)return none;
  // An unconfirmed IK contact is never used as a standing-foot anchor.
  const left=foot.leftPlanted&&foot.leftConfidence>=.45;
  const right=foot.rightPlanted&&foot.rightConfidence>=.45;
  if(!left&&!right)return none;
  const stance=left&&right?1:.52; // single-leg pivot: markedly less torso/arm movement
  const headDrive=Math.min(1,Math.hypot(face.headPitch/.004,face.headYaw/.002));
  const gain=headDrive*stance*clamp(input.bodyStrength/100,0,1)*
    (.65+.35*input.energy)*(input.tier==='balanced'?.58:1);
  if(gain<.00001)return none;
  // Make an already verified head lean read as a small, supported chest follow.
  // Clamped totals remain below 0.012/0.007 rad – nowhere near a new dance pose.
  const pitchSign=Math.sign(face.headPitch);
  const yawSign=Math.sign(face.headYaw);
  const chestPitch=clamp(body.chestPitch+pitchSign*.0022*gain,-.012,.012);
  const chestRoll=clamp(body.chestRoll-yawSign*.0016*gain,-.007,.007);
  // Opposing clavicles counter-balance the same verified yaw, not a guessed gaze.
  const shoulderShift=yawSign*.0014*gain;
  const supportedBody:NaturalDanceFaceCueV582={...body,chestPitch,chestRoll,
    leftShoulderRoll:clamp(body.leftShoulderRoll-shoulderShift,-.009,.009),
    rightShoulderRoll:clamp(body.rightShoulderRoll+shoulderShift,-.009,.009),
  };
  // Micro arm-pitch follows the real supported side: never writes hips, foot IK
  // or finger/hand-authored motion. One planted foot favors the opposite arm.
  const armDrive=Math.abs(face.headPitch)/.004*.0035*gain;
  const leftArmPitch=clamp(armDrive*(right&&!left?1:left&&!right?.30:.7),0,.0035);
  const rightArmPitch=clamp(armDrive*(left&&!right?1:right&&!left?.30:.7),0,.0035);
  return {active:true,source:'verified-word-and-ik',body:supportedBody,
    leftArmPitch,rightArmPitch};
}
