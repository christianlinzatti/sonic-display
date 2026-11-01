/** V841: music-evidence-bound, allocation-free additions to EXISTING stage lights/shaders.
 * Does not claim physical moving heads, actual laser hardware, GPU timing or new lights.
 * Autoregulation must never bypass manual cues, blackouts, lyric focus or frame budgets.
 */
import type {LightChoreographyCueV793} from './advancedLightChoreographerV793';
export type ProfessionalLightStyleV841='cinematic'|'balanced'|'festival';
export interface ProfessionalLightSettingsV841 {
  professionalLightingV841:boolean;
  lightingStrengthV841:number;
  lightingStyleV841:ProfessionalLightStyleV841;
}
export interface ProfessionalLightInputV841 {
  settings:ProfessionalLightSettingsV841;
  choreography:LightChoreographyCueV793;
  section:string;positionMs:number;durationMs:number;sceneBlend:number;
  enabledFx:boolean;playing:boolean;reducedMotion:boolean;tier:'low'|'balanced'|'high';
  manualLighting:boolean;blackout:boolean;lyricsProtected:boolean;vocalFocus:boolean;
  lasersEnabled:boolean;gobosAvailable:boolean;
  energy:number;kick:number;laserBudget:number;goboBudget:number;
}
export type ProfessionalLightReasonV841='verified-v793'|'disabled'|'unverified'|'protected';
export interface ProfessionalLightCueV841 {
  active:boolean;reason:ProfessionalLightReasonV841;section:string;
  goboPattern:0|1|2|3|4|5;goboOpacity:number;goboPhase:number;goboScale:number;
  laserSpread:number;laserMotion:number;sweepScale:number;angleAdd:number;
}
export const PROFESSIONAL_LIGHT_OFF_V841:Readonly<ProfessionalLightCueV841>=Object.freeze({
  active:false,reason:'disabled',section:'off',goboPattern:0,goboOpacity:0,
  goboPhase:0,goboScale:1,laserSpread:1,laserMotion:0,sweepScale:1,angleAdd:0,
});
const finite=(n:unknown):n is number=>typeof n==='number'&&Number.isFinite(n);
const clamp=(n:number,a=0,b=1)=>Math.max(a,Math.min(b,n));
const round=(n:number)=>Math.round(n*10000)/10000;
const validSections=new Set(['verse','hook','build','drop','break']);
export function planProfessionalLightingV841(i:ProfessionalLightInputV841):ProfessionalLightCueV841 {
  const off=(reason:ProfessionalLightReasonV841):ProfessionalLightCueV841=>({...PROFESSIONAL_LIGHT_OFF_V841,reason});
  const s=i.settings;
  if(!s.professionalLightingV841||s.lightingStrengthV841===0||!i.enabledFx)return off('disabled');
  if(!i.playing||i.reducedMotion||i.tier==='low'||i.manualLighting||i.blackout)return off('protected');
  if(!i.choreography?.active||!validSections.has(i.section)||
    !finite(i.positionMs)||!finite(i.durationMs)||i.durationMs<=0||i.positionMs<0||i.positionMs>=i.durationMs||
    !finite(i.sceneBlend)||i.sceneBlend<=0||i.sceneBlend>1||
    !finite(i.energy)||i.energy<0||i.energy>1||!finite(i.kick)||i.kick<0||i.kick>1||
    !finite(i.laserBudget)||i.laserBudget<0||i.laserBudget>1||!finite(i.goboBudget)||i.goboBudget<0||i.goboBudget>1||
    !finite(s.lightingStrengthV841)||s.lightingStrengthV841<0||s.lightingStrengthV841>100||
    !['cinematic','balanced','festival'].includes(s.lightingStyleV841)||
    !Number.isInteger(i.choreography.sceneIndex)||i.choreography.sceneIndex<0||
    !finite(i.choreography.sweep)||Math.abs(i.choreography.sweep)>.52||
    !finite(i.choreography.depth)||i.choreography.depth<0||i.choreography.depth>.7||
    !finite(i.choreography.beamGain)||i.choreography.beamGain<1||i.choreography.beamGain>1.055
  )return off('unverified');
  const k=i.section;
  const energy=clamp(i.energy),kick=clamp(i.kick);
  const sectionScale=k==='drop'?1:k==='hook'?.72:k==='build'?.54:k==='verse'?.26:.10;
  const styleScale=s.lightingStyleV841==='festival'?1:s.lightingStyleV841==='cinematic'?.64:.82;
  const focusScale=i.lyricsProtected?.20:i.vocalFocus?.36:1;
  const budgetScale=i.tier==='balanced'?.55:1;
  const power=clamp(s.lightingStrengthV841/100*i.sceneBlend*sectionScale*styleScale*focusScale*budgetScale);
  const phase=i.positionMs/1000;
  // Continuous optical movement, not a fabricated beat or hardware strobe.
  const speed=k==='build'?.42:k==='drop'?.8:k==='hook'?.62:.26;
  const scene=i.choreography.sceneIndex;
  const goboPattern=(k==='verse'?1:k==='hook'?4:k==='build'?5:k==='drop'?(scene%2?2:4):0) as 0|1|2|3|4|5;
  const goboOpacity=i.gobosAvailable?round(clamp((.045+.035*energy+.022*kick)*power*i.goboBudget,0,.105)):0;
  const laserPower=i.lasersEnabled?power*i.laserBudget:0;
  return {active:true,reason:'verified-v793',section:k,goboPattern,
    goboOpacity,goboPhase:round(phase*speed+scene*.47),
    goboScale:round(1+power*(k==='drop'?.44:k==='build'?.24:.14)),
    laserSpread:round(1+laserPower*(k==='drop'?.63:k==='hook'?.4:k==='build'?.23:.08)),
    laserMotion:round(clamp(laserPower*(.17+.27*energy),0,.32)),
    sweepScale:round(clamp(1-(i.vocalFocus?.28:0)+power*(k==='drop'?.12:.04),.70,1.12)),
    angleAdd:round(clamp(power*(k==='drop'?.021:k==='hook'?.014:.008),0,.021)),
  };
}
