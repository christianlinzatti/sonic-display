/** V886 – LED Wall Creative Director: four NEW looks on the existing V635 mesh.
 * The confirmed V810 musical act is the sole source of section/phase and measured
 * frequencies. No synthesized beats, parallel timers, added meshes or flash cues.
 */
import {normalizeConcertFxV810} from './concertFxStudioV810';
import type {ConcertFxCueV810,ConcertFxSettingsV810} from './concertFxStudioV810';
import type {LedWallExperienceCueV821} from './ledWallExperiencePlannerV821';

export type LedCreativeModeV886=0|1|2|3|4; // off / skyline EQ / kaleidoscope / chevrons / vortex
export type LedCreativeReasonV886='active'|'disabled'|'protected'|'unverified';
export interface LedCreativeCueV886 {
 active:boolean;reason:LedCreativeReasonV886;mode:LedCreativeModeV886;
 power:number;phase:number;bass:number;mids:number;highs:number;
 motion:number;camera:number;
}
export interface LedCreativeInputV886 {
 settings?:Partial<ConcertFxSettingsV810>|null;
 fx:ConcertFxCueV810;wall:LedWallExperienceCueV821;
 section:ConcertFxCueV810['section'];playing:boolean;reducedMotion:boolean;
 tier:'low'|'balanced'|'high';budget:number;timelineGain:number;
 manualLed:boolean;manualLighting:boolean;blackout:boolean;
 lyricsProtected:boolean;lyricsVisible:boolean;vocalFocus:boolean;
 cameraCloseup:boolean;manualCamera:boolean;groupCount:number;
}
export const LED_CREATIVE_OFF_V886:Readonly<LedCreativeCueV886>=Object.freeze({
 active:false,reason:'disabled',mode:0,power:0,phase:0,bass:0,mids:0,highs:0,motion:0,camera:0,
});
const clamp=(v:number,min=0,max=1)=>Math.max(min,Math.min(max,v));
const finite=(n:unknown):n is number=>typeof n==='number'&&Number.isFinite(n);
const round=(n:number)=>Math.round(n*1000000)/1000000;
export const LED_CREATIVE_NAMES_V886:Readonly<Record<LedCreativeModeV886,string>>={
 0:'Aus',1:'Skyline Equalizer',2:'Kaleidoskop',3:'Kinetic Chevrons',4:'Drop Vortex',
};
export function planLedWallCreativeV886(i:LedCreativeInputV886):LedCreativeCueV886 {
 const off=(reason:LedCreativeReasonV886):LedCreativeCueV886=>({...LED_CREATIVE_OFF_V886,reason});
 const s=normalizeConcertFxV810(i.settings);
 if(!s.enabled||!s.ledWall||!s.ledExperienceV821||!s.ledCreativeV886||
    s.ledCreativeStrengthV886<=0||s.intensity<=0||s.ledIntensityV821<=0)return off('disabled');
 if(!i.playing||i.reducedMotion||i.tier==='low'||i.blackout||i.manualLed||i.manualLighting||
    s.ledLookV821!=='auto'||s.ledDepthStyleV842!=='auto')return off('protected');
 const {fx,wall}=i;
 if(!fx?.active||fx.reason!=='music'||fx.section!==i.section||!wall?.active||
    !finite(wall.power)||wall.power<=0||wall.power>.38||
    ![fx.phase,fx.bass,fx.mids,fx.highs].every(finite)||fx.phase<0||fx.phase>10000000||
    fx.bass<0||fx.bass>1||fx.mids<0||fx.mids>1||fx.highs<0||fx.highs>1||
    !finite(i.budget)||i.budget<=0||i.budget>1||
    !finite(i.timelineGain)||i.timelineGain<=0||i.timelineGain>1||
    !Number.isInteger(i.groupCount)||i.groupCount<1||i.groupCount>4||
    !['intro','verse','hook','build','drop','break','finale'].includes(i.section))return off('unverified');
 const bySection:Record<ConcertFxCueV810['section'],LedCreativeModeV886>={
  intro:1,verse:1,hook:2,build:3,drop:4,break:1,finale:4,
 };
 const explicit:Record<Exclude<ConcertFxSettingsV810['ledCreativeStyleV886'],'auto'>,LedCreativeModeV886>={
  skyline:1,kaleidoscope:2,chevrons:3,vortex:4,
 };
 const mode=s.ledCreativeStyleV886==='auto'?bySection[i.section]:explicit[s.ledCreativeStyleV886];
 // Inherited V821 feature switches stay the authority. A manually selected vortex
 // never invents a drop in an ordinary verse, intro or hook.
 if((mode===1&&!s.ledEqualizerV821)||
    ((mode===2||mode===3)&&!s.ledGeometryV821)||
    (mode===4&&(!s.ledDropVisualsV821||!['drop','finale'].includes(i.section))))return off('disabled');
 const gain:Record<ConcertFxCueV810['section'],number>={
  intro:.24,verse:.40,hook:.78,build:.65,drop:1,break:.13,finale:.88,
 };
 const camera=s.ledCreativeCameraGuardV886&&(i.cameraCloseup||i.manualCamera)?.42:1;
 const clarity=(s.protectLyrics&&(i.lyricsProtected||i.lyricsVisible)?.28:1)*
  (i.vocalFocus?.55:1)*(i.groupCount===4?.60:i.groupCount===3?.73:1)*camera;
 const quality=i.tier==='balanced'?.55:1;
 const measured=clamp(fx.bass*.40+fx.mids*.38+fx.highs*.22);
 // Additive budget intentionally much smaller than V821's original LED layer.
 const power=clamp(wall.power*(s.ledCreativeStrengthV886/100)*quality*gain[i.section]*
  clarity*i.budget*i.timelineGain*(.5+.5*measured)*.10,0,.045);
 if(power<.00001)return off('disabled');
 const speed=s.ledCreativeMotionV886==='calm'?.13:s.ledCreativeMotionV886==='dynamic'?.47:.27;
 const genre=fx.genre==='hardtekk'||fx.genre==='hardstyle'?1.17:
    fx.genre==='rap'?.82:fx.genre==='rock'?.95:1;
 return {active:true,reason:'active',mode,power:round(power),phase:round(fx.phase),
  bass:round(fx.bass),mids:round(fx.mids),highs:round(fx.highs),
  motion:round(clamp(speed*genre,.05,.55)),camera:round(camera)};
}
