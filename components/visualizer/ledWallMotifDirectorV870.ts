/** V870 – deterministic, camera/lyrics-aware motifs on the existing V842 LED mesh.
 * No extra render pass, clock, strobe, inferred drops or manual-lane override.
 */
import {normalizeConcertFxV810} from './concertFxStudioV810';
import type {ConcertFxCueV810,ConcertFxSettingsV810} from './concertFxStudioV810';
import type {LedWallExperienceCueV821} from './ledWallExperiencePlannerV821';
import type {LedWallCueV842} from './ledWallExperiencePlannerV842';
export type LedMotifModeV870=0|1|2|3; // off / EQ columns / prism facets / bounded bass rings
export type LedMotifReasonV870='active'|'disabled'|'protected'|'unverified';
export interface LedMotifCueV870 {
 active:boolean;reason:LedMotifReasonV870;mode:LedMotifModeV870;
 power:number;phase:number;bass:number;mids:number;camera:number;
}
export interface LedMotifInputV870 {
 fx:ConcertFxCueV810;wall:LedWallExperienceCueV821;depth:LedWallCueV842;
 settings?:Partial<ConcertFxSettingsV810>|null;
 section:ConcertFxCueV810['section'];playing:boolean;reducedMotion:boolean;
 tier:'low'|'balanced'|'high';budget:number;timelineGain:number;
 manualLed:boolean;manualLighting:boolean;blackout:boolean;
 lyricsProtected:boolean;lyricsVisible:boolean;vocalFocus:boolean;
 cameraCloseup:boolean;manualCamera:boolean;groupCount:number;
}
export const LED_MOTIF_OFF_V870:Readonly<LedMotifCueV870>=Object.freeze({
 active:false,reason:'disabled',mode:0,power:0,phase:0,bass:0,mids:0,camera:0,
});
const finite=(n:unknown):n is number=>typeof n==='number'&&Number.isFinite(n);
const clamp=(n:number,a=0,b=1)=>Math.min(b,Math.max(a,n));
const round=(n:number)=>Math.round(n*1000000)/1000000;
export function planLedWallMotifsV870(i:LedMotifInputV870):LedMotifCueV870 {
 const off=(reason:LedMotifReasonV870):LedMotifCueV870=>({...LED_MOTIF_OFF_V870,reason});
 const s=normalizeConcertFxV810(i.settings);
 if(!s.enabled||!s.ledWall||!s.ledExperienceV821||!s.ledExperienceV842||
  !s.ledMotifsV870||s.ledMotifStrengthV870===0||s.intensity===0)return off('disabled');
 if(!i.playing||i.reducedMotion||i.tier==='low'||i.blackout||i.manualLed||i.manualLighting||
  s.ledLookV821!=='auto'||s.ledDepthStyleV842!=='auto')return off('protected');
 const fx=i.fx,wall=i.wall,depth=i.depth;
 if(!fx?.active||fx.reason!=='music'||fx.section!==i.section||!wall?.active||
  !depth?.active||depth.reason!=='active'||!finite(wall.power)||wall.power<=0||wall.power>.38||
  !finite(depth.power)||depth.power<=0||depth.power>.14||!finite(fx.phase)||fx.phase<0||
  !finite(fx.bass)||fx.bass<0||fx.bass>1||!finite(fx.mids)||fx.mids<0||fx.mids>1||
  !finite(i.budget)||i.budget<=0||i.budget>1||
  !finite(i.timelineGain)||i.timelineGain<=0||i.timelineGain>1||
  !Number.isInteger(i.groupCount)||i.groupCount<1||i.groupCount>4||
  !['intro','verse','hook','build','drop','break','finale'].includes(i.section))return off('unverified');
 const explicit:{[K in Exclude<ConcertFxSettingsV810['ledMotifStyleV870'],'auto'>]:LedMotifModeV870}={
  equalizer:1,prism:2,shockwave:3};
 const bySection:Record<ConcertFxCueV810['section'],LedMotifModeV870>={
  intro:1,verse:1,hook:2,build:2,drop:3,break:1,finale:3};
 let mode:LedMotifModeV870=s.ledMotifStyleV870==='auto'?bySection[i.section]:explicit[s.ledMotifStyleV870];
 // No new visual may bypass the pattern restrictions established by V821.
 if(mode===1&&!s.ledEqualizerV821)mode=0;
 if(mode===2&&!s.ledGeometryV821)mode=0;
 if(mode===3&&!s.ledDropVisualsV821)mode=0;
 // A manually chosen 'shockwave' is not evidence that a drop happened.
 if(mode===3&&!['drop','finale'].includes(i.section))mode=0;
 if(!mode)return off('disabled');
 const sectionGain=i.section==='verse'?.48:i.section==='break'?.24:i.section==='intro'?.32:
  i.section==='hook'?.81:i.section==='build'?.62:1;
 const camera= s.ledCameraProtectionV870&&(i.cameraCloseup||i.manualCamera)?.46:1;
 const guard=(s.protectLyrics&&(i.lyricsProtected||i.lyricsVisible)?.40:1)*
  (i.vocalFocus?.65:1)*(i.groupCount>=4?.62:i.groupCount===3?.76:1)*camera;
 const tier=i.tier==='balanced'?.55:1;
 const energy=clamp(fx.bass*.55+fx.mids*.45);
 const power=clamp(Math.min(wall.power,depth.power*2.1)*
  (s.ledMotifStrengthV870/100)*tier*sectionGain*guard*i.budget*i.timelineGain*
  (.45+.55*energy)*.28,0,.09);
 if(power<.00001)return off('disabled');
 return {active:true,reason:'active',mode,power:round(power),phase:round(fx.phase),
  bass:round(fx.bass),mids:round(fx.mids),camera:round(camera)};
}
