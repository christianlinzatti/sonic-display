/** V814 – no new Three Fog or spot lights: procedural layers supplement V308's owned atmosphere. */
import type {ConcertFxCueV810,ConcertFxSettingsV810,ConcertFxGenreV810} from './concertFxStudioV810';
export type ConcertAtmosphereCueV814={active:boolean;floorOpacity:number;shaftsOpacity:number;phase:number;color:string;};
const off:ConcertAtmosphereCueV814={active:false,floorOpacity:0,shaftsOpacity:0,phase:0,color:'#ffffff'};
const cap=(n:number)=>Math.min(1,Math.max(0,n));
const mood:Record<ConcertFxGenreV810,number>={rap:.73,hardtekk:.56,hardstyle:.60,rock:1,pop:.62,neutral:.48};
export function planAtmosphericConcertFxV814(input:{fx:ConcertFxCueV810;settings:ConcertFxSettingsV810;
 lyricsProtected:boolean;vocalFocus:boolean;groupCount:number;tier:'low'|'balanced'|'high';hazeBudget:number;}) : ConcertAtmosphereCueV814 {
 const {fx,settings:s}=input;
 if(!fx.active||!s.atmosphericFx||input.tier==='low'||!Number.isFinite(input.hazeBudget)||
 input.groupCount<1||input.groupCount>4)return off;
 const genreStrength=mood[fx.genre];
 const section=fx.section==='break'?.20:fx.section==='verse'?.62:fx.section==='intro'?.52:1;
 const budget=cap(input.hazeBudget)*(input.tier==='balanced'?.6:1);
 const quality=s.quality==='performance'?.28:s.quality==='balanced'?.62:1;
 const protect=(input.lyricsProtected&&s.protectLyrics?.55:1)*(input.vocalFocus?.70:1);
 const cast=input.groupCount>=3?.75:1;
 const gain=cap(s.intensity/100)*budget*quality*genreStrength*section*protect*cast;
 const floor=s.floorHaze?Math.min(.17,.17*gain):0;
 const shafts=s.lightShafts&&s.quality!=='performance'?Math.min(.09,.09*gain):0;
 return {active:floor>.002||shafts>.002,floorOpacity:floor,shaftsOpacity:shafts,
  phase:fx.phase,color:fx.primary};
}
