/** V479 – Raspberry Pi concert workload policy.
 * Explicit device-profile opt-in, using observed *frame* times rather than
 * fabricated GPU/thermal measurements. No transport, lyrics or vocal changes.
 */
import type {PiHints,PiProfile} from '../../components/visualizer/piDeviceProfile';

export type PiConcertLevelV479='full'|'balanced'|'eco';
export type PiConcertBudgetV479=Readonly<{
  enabled:boolean;level:PiConcertLevelV479;profile:PiProfile;
  poorWindows:number;goodWindows:number;lastSampleAt:number;lastChangeAt:number;
  reason:string;
}>;
export type PiConcertSampleV479=Readonly<{
  at:number;fps:number;p95FrameMs:number;avatarCount:number;
  playing:boolean;visible:boolean;
}>;
export const PI_CONCERT_POOR_WINDOWS_V479=5;
export const PI_CONCERT_GOOD_WINDOWS_V479=18;
export const PI_CONCERT_COOLDOWN_MS_V479=30000;

export function initialPiConcertBudgetV479(profile:PiProfile,hints:PiHints):PiConcertBudgetV479 {
  const enabled=profile==='pi-low'||profile==='pi-balanced'||(profile==='auto'&&hints.likelyPi);
  const level:PiConcertLevelV479=!enabled?'full':profile==='pi-low'?'eco':'balanced';
  return {enabled,level,profile,poorWindows:0,goodWindows:0,lastSampleAt:0,lastChangeAt:0,
    reason:!enabled?'Pi concert optimization off':profile==='pi-low'?'Pi Low selected':'Pi concert profile selected'};
}
export function advancePiConcertBudgetV479(previous:PiConcertBudgetV479,sample:PiConcertSampleV479):PiConcertBudgetV479 {
  if(!previous.enabled)return previous;
  // A chosen Pi-Low preset is an explicit stable user override.
  if(previous.profile==='pi-low')return previous;
  const valid=sample.playing&&sample.visible&&Number.isFinite(sample.at)&&sample.at>0&&
    Number.isFinite(sample.fps)&&sample.fps>0&&sample.fps<=240&&
    Number.isFinite(sample.p95FrameMs)&&sample.p95FrameMs>0&&sample.p95FrameMs<=250&&
    Number.isFinite(sample.avatarCount)&&sample.avatarCount>=1&&sample.avatarCount<=4;
  if(!valid)return previous.poorWindows||previous.goodWindows?
    {...previous,poorWindows:0,goodWindows:0}:previous;
  // Ignore duplicates, out-of-order samples and missing/old windows. Re-arm
  // after a gap rather than treating a resumed tab as continuous pressure.
  if(sample.at<=previous.lastSampleAt)return previous;
  if(previous.lastSampleAt>0&&sample.at-previous.lastSampleAt>5000)return {
    ...previous,poorWindows:0,goodWindows:0,lastSampleAt:sample.at};
  const crowd=sample.avatarCount>=3;
  const poor=sample.fps<(crowd?30:27)||sample.p95FrameMs>(crowd?42:47);
  const good=sample.fps>41&&sample.p95FrameMs<27;
  const poorWindows=poor?previous.poorWindows+1:0;
  const goodWindows=good?previous.goodWindows+1:0;
  const sinceChange=previous.lastChangeAt===0?Infinity:sample.at-previous.lastChangeAt;
  if(poorWindows>=PI_CONCERT_POOR_WINDOWS_V479&&previous.level!=='eco'&&sinceChange>=PI_CONCERT_COOLDOWN_MS_V479){
    return {...previous,level:'eco',poorWindows:0,goodWindows:0,lastSampleAt:sample.at,lastChangeAt:sample.at,
      reason:'Sustained low FPS or high P95 with multiple avatars'};
  }
  if(goodWindows>=PI_CONCERT_GOOD_WINDOWS_V479&&previous.level==='eco'&&sinceChange>=PI_CONCERT_COOLDOWN_MS_V479){
    return {...previous,level:'balanced',poorWindows:0,goodWindows:0,lastSampleAt:sample.at,lastChangeAt:sample.at,
      reason:'Sustained stable frame times; restoring optional effects'};
  }
  return {...previous,poorWindows:Math.min(poorWindows,PI_CONCERT_POOR_WINDOWS_V479),
    goodWindows:Math.min(goodWindows,PI_CONCERT_GOOD_WINDOWS_V479),lastSampleAt:sample.at};
}
/** Only optional, automatically selected visual effects are budgeted.
 * Explicit on/off controls for FX, postprocessing and shaders always win.
 */
export function resolvePiConcertEffectsV479(budget:PiConcertBudgetV479,input:{
  avatarCount:number;manualFx:boolean;manualPostProcess:boolean;manualShader:boolean;
}):Readonly<{automaticFx:boolean;automaticPostProcess:boolean;automaticShader:boolean}> {
  const constrained=budget.enabled&&(budget.level==='eco'||(budget.level==='balanced'&&input.avatarCount>=3));
  return {automaticFx:input.manualFx||!(budget.enabled&&budget.level==='eco'),
    automaticPostProcess:input.manualPostProcess||!constrained,
    automaticShader:input.manualShader||!(budget.enabled&&budget.level==='eco')};
}
