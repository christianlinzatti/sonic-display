/** V990 Living LED Wall: four genre-aware patterns on the existing V635 plane.
 * Only V810-confirmed cue / V821-approved LED and V886 verified envelope may
 * animate it. No AI-estimated timestamps, new clock, Govee, strobe or GPU pass.
 */
import {normalizeConcertFxV810} from './concertFxStudioV810';
import type {ConcertFxSettingsV810} from './concertFxStudioV810';
import {planLedWallCreativeV886} from './ledWallCreativeDirectorV886';
import type {LedCreativeInputV886} from './ledWallCreativeDirectorV886';
export type LivingLedModeV990=0|1|2|3|4; // off / city / pulse grid / arena / prism
export type LivingLedReasonV990='active'|'disabled'|'protected'|'unverified';
export interface LivingLedCueV990 {
 active:boolean;reason:LivingLedReasonV990;mode:LivingLedModeV990;
 power:number;phase:number;motion:number;bass:number;mids:number;highs:number;accent:number;
}
export const LIVING_LED_OFF_V990:Readonly<LivingLedCueV990>=Object.freeze({
 active:false,reason:'disabled',mode:0,power:0,phase:0,motion:0,bass:0,mids:0,highs:0,accent:0,
});
export const LIVING_LED_NAMES_V990:Readonly<Record<LivingLedModeV990,string>>={
 0:'Aus',1:'City Pulse',2:'Neon Matrix',3:'Arena Beams',4:'Prism Flow',
};
const bounded=(v:number,min=0,max=1)=>Math.max(min,Math.min(max,v));
const round=(n:number)=>Math.round(n*1000000)/1000000;
export function planLivingLedWallV990(i:LedCreativeInputV886):LivingLedCueV990 {
 const off=(reason:LivingLedReasonV990):LivingLedCueV990=>({...LIVING_LED_OFF_V990,reason});
 const s=normalizeConcertFxV810(i.settings);
 if(!s.livingLedWallV990||!s.enabled||!s.ledWall||!s.ledExperienceV821||
    !s.ledCreativeV886||s.livingLedStrengthV990===0||s.intensity===0)return off('disabled');
 // A manually authored wall, manually selected V886 creative look, blackout or
 // Pi/low tier should never receive extra automated textures.
 if(s.ledCreativeStyleV886!=='auto'||i.manualLed||i.manualLighting||i.blackout||
    !i.playing||i.reducedMotion||i.tier==='low')return off('protected');
 const creative=planLedWallCreativeV886(i);
 if(!creative.active)return off(creative.reason);
 const fx=i.fx;
 if(!fx||fx.reason!=='music'||!Number.isFinite(fx.phase)||fx.phase<0||fx.phase>1e7||
    !Number.isFinite(fx.bass)||!Number.isFinite(fx.mids)||!Number.isFinite(fx.highs)||
    !['rap','hardtekk','hardstyle','rock','pop','neutral'].includes(fx.genre)||
    !['auto','city','matrix','arena','prism'].includes(s.livingLedStyleV990)||
    !['calm','balanced','energetic'].includes(s.livingLedMotionV990))return off('unverified');
 const auto:Record<ConcertFxSettingsV810['ledCreativeStyleV886'],LivingLedModeV990>={
  auto:1,skyline:1,kaleidoscope:4,chevrons:2,vortex:2,
 };
 const explicit:Record<Exclude<ConcertFxSettingsV810['livingLedStyleV990'],'auto'>,LivingLedModeV990>={
  city:1,matrix:2,arena:3,prism:4,
 };
 const mode:LivingLedModeV990=s.livingLedStyleV990!=='auto'?explicit[s.livingLedStyleV990]:
   fx.genre==='rap'?1:fx.genre==='hardtekk'||fx.genre==='hardstyle'?2:
   fx.genre==='rock'?3:fx.genre==='pop'?4:auto[s.ledCreativeStyleV886];
 // Genre look is visual only, not evidence that an unverified verse is a drop.
 if(mode===1&&!s.ledEqualizerV821||mode!==1&&!s.ledGeometryV821)return off('disabled');
 const sectionGain:Record<typeof fx.section,number>={intro:.26,verse:.43,hook:.75,build:.61,drop:.90,break:.18,finale:.85};
 const motion=s.livingLedMotionV990==='calm'?.10:s.livingLedMotionV990==='energetic'?.35:.20;
 const lyric=s.protectLyrics&&(i.lyricsProtected||i.lyricsVisible)?.35:1;
 const camera=s.livingLedCameraGuardV990&&(i.cameraCloseup||i.manualCamera)?.45:1;
 const musician=i.vocalFocus?.62:i.groupCount===4?.65:1;
 // Power is additive, not a multiplication of the original V821 / V886 gains.
 // Strict total V886 + V990 contribution <= .067, and .15 alpha remains global.
 const power=bounded(creative.power*(s.livingLedStrengthV990/100)*
   sectionGain[fx.section]*lyric*camera*musician*(i.tier==='balanced'?.6:1)*.48,0,.022);
 if(power<.00001)return off('disabled');
 const accent=bounded((fx.bass*.50+fx.mids*.30+fx.highs*.20)*sectionGain[fx.section],0,.9);
 return {active:true,reason:'active',mode,power:round(power),phase:round(fx.phase),
  motion:round(motion),bass:round(fx.bass),mids:round(fx.mids),highs:round(fx.highs),accent:round(accent)};
}
