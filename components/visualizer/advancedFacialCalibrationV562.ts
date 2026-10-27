import type {FacialPoseV369} from './facialPerformanceV369';
import type {FacialChannelV370} from './facialRigStudioV370';

/** Avatar-local, opt-in post-processing. None of these parameters infer spoken phonemes. */
export type MouthCalibrationV562 = Readonly<{
  enabled:boolean;
  jawCeiling:number; // 0.45 – 1.00
  lipSeal:number; // 0.5 – 1.00
  vowelSeparation:number; // 0 – 1
}>;
export type MouthCalibrationPresetV562='neutral'|'deutschrap'|'singing';
export const MOUTH_CALIBRATION_PRESETS_V562:Record<MouthCalibrationPresetV562,MouthCalibrationV562>={
  neutral:{enabled:true,jawCeiling:1,lipSeal:.70,vowelSeparation:.35},
  deutschrap:{enabled:true,jawCeiling:.78,lipSeal:.95,vowelSeparation:.65},
  singing:{enabled:true,jawCeiling:.90,lipSeal:.84,vowelSeparation:.45},
};
const bounded=(v:unknown,min:number,max:number,fallback:number)=>typeof v==='number'&&Number.isFinite(v)?Math.max(min,Math.min(max,v)):fallback;
export function normalizeMouthCalibrationV562(value:Partial<MouthCalibrationV562>|null|undefined):MouthCalibrationV562 {
  return {enabled:value?.enabled===true,
    jawCeiling:bounded(value?.jawCeiling,.45,1,1),
    lipSeal:bounded(value?.lipSeal,.5,1,.85),
    vowelSeparation:bounded(value?.vowelSeparation,0,1,.5)};
}
/** Keep non-mouth facial expression and the source object unmodified. Disable = bit-for-bit old behavior. */
export function calibrateMouthPoseV562<T extends Partial<Record<FacialChannelV370,number>>>(pose:T,raw?:Partial<MouthCalibrationV562>|null):T {
  const settings=normalizeMouthCalibrationV562(raw);
  if(!settings.enabled)return pose;
  const jaw=bounded(pose.jaw,0,1,0),wide=bounded(pose.wide,0,1,0),round=bounded(pose.round,0,1,0),closed=bounded(pose.lipsClosed,0,1,0);
  // Separate mutually competing vowels without suppressing the sole active vowel.
  const conflict=Math.min(wide,round)*settings.vowelSeparation;
  const primaryWide=wide>=round;
  const separatedWide=primaryWide?wide:Math.max(0,wide-conflict);
  const separatedRound=primaryWide?Math.max(0,round-conflict):round;
  // Bilabials must close the jaw as the lips seal; no forced closure on silent frames.
  const seal=closed*settings.lipSeal;
  const result={...pose,
    jaw:Math.min(settings.jawCeiling,jaw*(1-seal*.86)),
    wide:separatedWide*(1-seal*.48),
    round:separatedRound*(1-seal*.48),
    lipsClosed:closed,
  };
  return result as T;
}
/** Render-side information only: explicit rig mappings take precedence over name guesses. */
export function mouthCalibrationCoverageV562(channels:readonly string[],jawBone:boolean,disabledJaw=false) {
  const available=new Set(channels);
  const details=['jaw','wide','round','lipsClosed'].map(channel=>({channel,available:available.has(channel)||(channel==='jaw'&&jawBone&&!disabledJaw)}));
  const count=details.filter(item=>item.available).length;
  return {details,count,complete:count===4,warning:count===0?'Kein steuerbarer Mundkanal vorhanden.':count<4?'Einige Mundformen fehlen am gewählten GLB. Nur vorhandene Kanäle können kalibriert werden.':null};
}
