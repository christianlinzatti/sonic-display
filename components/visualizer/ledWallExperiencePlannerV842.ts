/** V842 – bounded LED Wall Experience 3.0; complements the existing V821 cue.
 * No generated audio evidence, no independent clock, no new geometry or GPU passes.
 * A manually selected V821 look or authored V823 LED cue always wins.
 */
import {normalizeConcertFxV810} from './concertFxStudioV810';
import type {ConcertFxCueV810,ConcertFxSettingsV810} from './concertFxStudioV810';
import type {LedWallExperienceCueV821} from './ledWallExperiencePlannerV821';
import type {ProfessionalLightCueV841} from './professionalLightingExperienceV841';
export type LedWallReasonV842='active'|'disabled'|'protected'|'unverified';
export type LedWallModeV842=0|1|2; // off / architectural polygons / perspective tunnel
export interface LedWallInputV842 {
 fx:ConcertFxCueV810;wall:LedWallExperienceCueV821;
 settings?:Partial<ConcertFxSettingsV810>|null;light?:ProfessionalLightCueV841|null;
 section:ConcertFxCueV810['section'];playing:boolean;reducedMotion:boolean;
 tier:'low'|'balanced'|'high';budget:number;timelineGain:number;
 manualLed:boolean;manualLighting:boolean;blackout:boolean;
 lyricsProtected:boolean;vocalFocus:boolean;groupCount:number;
}
export interface LedWallCueV842 {
 active:boolean;reason:LedWallReasonV842;mode:LedWallModeV842;
 power:number;depth:number;geometry:number;tunnel:number;
 phase:number;flow:number;lightLink:number;
}
export const LED_WALL_OFF_V842:Readonly<LedWallCueV842>=Object.freeze({
 active:false,reason:'disabled',mode:0,power:0,depth:0,geometry:0,
 tunnel:0,phase:0,flow:0,lightLink:0,
});
const finite=(x:unknown):x is number=>typeof x==='number'&&Number.isFinite(x);
const clamp=(n:number,a=0,b=1)=>Math.min(b,Math.max(a,n));
const round=(n:number)=>Math.round(n*1000000)/1000000;
export function planLedWallExperienceV842(i:LedWallInputV842):LedWallCueV842 {
 const off=(reason:LedWallReasonV842):LedWallCueV842=>({...LED_WALL_OFF_V842,reason});
 const s=normalizeConcertFxV810(i.settings),fx=i.fx,w=i.wall;
 if(!s.enabled||!s.ledWall||!s.ledExperienceV821||!s.ledExperienceV842||
   s.ledDepthStrengthV842===0||s.intensity<=0||s.ledIntensityV821===0) return off('disabled');
 if(!i.playing||i.reducedMotion||i.tier==='low'||i.blackout||i.manualLed||i.manualLighting||
   s.ledLookV821!=='auto')return off('protected');
 if(!fx.active||fx.reason!=='music'||i.section!==fx.section||
   !w?.active||w.look===0||!finite(w.power)||w.power<=0||w.power>.38||
   !finite(fx.phase)||fx.phase<0||!finite(fx.bass)||fx.bass<0||fx.bass>1||
   !finite(fx.mids)||fx.mids<0||fx.mids>1||
   !finite(i.budget)||i.budget<=0||i.budget>1||
   !finite(i.timelineGain)||i.timelineGain<=0||i.timelineGain>1||
   !Number.isInteger(i.groupCount)||i.groupCount<1||i.groupCount>4||
   !['intro','verse','hook','build','drop','break','finale'].includes(i.section)||
   !finite(s.ledDepthStrengthV842)||s.ledDepthStrengthV842<0||s.ledDepthStrengthV842>100||
   !['auto','geometry','tunnel'].includes(s.ledDepthStyleV842))return off('unverified');
 // User choice of style stays within the V821 allowed pattern switches.
 let mode:LedWallModeV842=s.ledDepthStyleV842==='geometry'?1:s.ledDepthStyleV842==='tunnel'?2:
   i.section==='drop'||i.section==='finale'||i.section==='build'?2:1;
 if(mode===1&&!s.ledGeometryV821)mode=s.ledDropVisualsV821?2:0;
 if(mode===2&&!s.ledDropVisualsV821)mode=s.ledGeometryV821?1:0;
 if(!mode)return off('disabled');
 const section=i.section==='drop'||i.section==='finale'?1:i.section==='hook'?.72:
   i.section==='build'?.58:i.section==='verse'?.28:i.section==='intro'?.30:.16;
 const protect=(i.lyricsProtected&&s.protectLyrics?.32:1)*(i.vocalFocus?.55:1)*
   (i.groupCount===4?.64:i.groupCount===3?.75:1);
 const lightLink=s.ledLightSyncV842&&i.light?.active===true&&i.light.reason==='verified-v793'&&
    finite(i.light.goboOpacity)?clamp(i.light.goboOpacity/.105):0;
 const energy=clamp(fx.bass*.65+fx.mids*.35);
 const power=clamp(w.power*(s.ledDepthStrengthV842/100)*i.budget*i.timelineGain*
     section*protect*(.65+.35*energy)*.34,0,.14);
 if(power<.00001)return off('disabled');
 return {active:true,reason:'active',mode,
   power:round(power),depth:round(clamp(.22+.56*energy,0,.8)),
   geometry:round(mode===1?clamp(.36+.54*fx.mids,0,1):.16),
   tunnel:round(mode===2?clamp(.38+.58*fx.bass,0,1):.10),
   phase:round(fx.phase),flow:round(clamp(i.section==='drop'?.48:i.section==='build'?.32:.16,0,.5)),
   lightLink:round(lightLink)};
}
