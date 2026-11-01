/** V821 – deterministic, bounded LED Wall Experience 2.0 cue.
 * All scene identity, timing, blackouts and device guards come from V810.
 * Audio data is read only if the parent cue is verified; no fake drops or beats.
 */
import {normalizeConcertFxV810} from './concertFxStudioV810';
import type {ConcertFxCueV810,ConcertFxSettingsV810} from './concertFxStudioV810';
export type LedWallLookV821=0|1|2|3|4; // off, equalizer, geometry, waves, tunnel
export interface LedWallExperienceInputV821 {
 fx:ConcertFxCueV810;settings?:Partial<ConcertFxSettingsV810>|null;
 tier:'low'|'balanced'|'high';budget:number;
 lyricsProtected:boolean;vocalFocus:boolean;groupCount:number;
}
export interface LedWallExperienceCueV821 {
 active:boolean;look:LedWallLookV821;power:number;tempo:number;
 bass:number;mids:number;highs:number;dropAccent:number;phase:number;
 quality:number;variation:number;
}
export const LED_WALL_OFF_V821:Readonly<LedWallExperienceCueV821>={
 active:false,look:0,power:0,tempo:0,bass:0,mids:0,highs:0,dropAccent:0,phase:0,
 quality:0,variation:0,
};
const clamp=(v:number,min=0,max=1)=>Math.min(max,Math.max(min,v));
const finite=(v:unknown):v is number=>typeof v==='number'&&Number.isFinite(v);
const round=(v:number)=>Math.round(v*1000000)/1000000;
export function planLedWallExperienceV821(i:LedWallExperienceInputV821):LedWallExperienceCueV821 {
 const s=normalizeConcertFxV810(i.settings),fx=i.fx;
 if(!s.enabled||!s.ledWall||!s.ledExperienceV821||s.intensity<=0||s.ledIntensityV821<=0||
  fx.reason!=='music'||!fx.active||fx.ledGain<=0||i.tier==='low'||
  !Number.isInteger(i.groupCount)||i.groupCount<1||i.groupCount>4||!finite(i.budget)||i.budget<=0||
  ![fx.ledGain,fx.bass,fx.mids,fx.highs,fx.phase].every(finite))return {...LED_WALL_OFF_V821};
 const lookBySection:Record<ConcertFxCueV810['section'],LedWallLookV821>={
  intro:3,verse:1,hook:2,build:3,drop:4,break:3,finale:4};
 const explicit:Record<Exclude<ConcertFxSettingsV810['ledLookV821'],'auto'>,LedWallLookV821>={
  equalizer:1,geometry:2,waves:3,tunnel:4};
 let look:LedWallLookV821=s.ledLookV821==='auto'?lookBySection[fx.section]:explicit[s.ledLookV821];
 // When a pattern is disabled, choose the other enabled look or fade out.
 if(look===1&&!s.ledEqualizerV821)look=s.ledGeometryV821?2:0;
 if(look===2&&!s.ledGeometryV821)look=s.ledEqualizerV821?1:0;
 if(look===4&&!s.ledDropVisualsV821)look=s.ledGeometryV821?2:s.ledEqualizerV821?1:3;
 if(look===3&&!s.ledGeometryV821&&!s.ledEqualizerV821)look=0;
 if(look===0)return {...LED_WALL_OFF_V821};
 const group=i.groupCount>=4?.56:i.groupCount===3?.75:1;
 const guard=(s.protectLyrics&&i.lyricsProtected?.44:1)*(i.vocalFocus?.68:1)*group;
 const quality=s.quality==='performance'?.48:s.quality==='balanced'?.75:1;
 const device=i.tier==='balanced'?.6:1;
 const energy=clamp(fx.bass*.47+fx.mids*.32+fx.highs*.21);
 const section=fx.section==='verse'?.48:fx.section==='break'?.26:fx.section==='intro'?.43:
   fx.section==='hook'?.85:fx.section==='build'?.68:1;
 // Uses the parent's already-faded music LED gain, not another independent animation clock.
 const power=clamp(fx.ledGain*(s.ledIntensityV821/100)*quality*device*guard*section*
   clamp(i.budget)*(.50+.50*energy),0,.38);
 if(power<.0001)return {...LED_WALL_OFF_V821};
 const accented=(fx.section==='drop'||fx.section==='finale')&&s.ledDropVisualsV821;
 const dropAccent=accented?clamp(fx.bass*.67+fx.highs*.18+fx.mids*.15)*.8:0;
 const variation=fx.genre==='hardtekk'?3:fx.genre==='hardstyle'?2:fx.genre==='rap'?1:
   fx.genre==='rock'?4:fx.genre==='pop'?5:0;
 return {active:true,look,power:round(power),tempo:round(.1+.3*energy),
 bass:clamp(fx.bass),mids:clamp(fx.mids),highs:clamp(fx.highs),
 dropAccent:round(dropAccent),phase:fx.phase,quality,variation};
}
