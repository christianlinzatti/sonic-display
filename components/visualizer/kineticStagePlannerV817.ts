/** V817 – moving LED columns. No independent show clock: V810 verified acts only. */
import type {ConcertFxCueV810,ConcertFxSettingsV810} from './concertFxStudioV810';
export const KINETIC_COLUMNS_V817=12;
export interface KineticStageCueV817 {
 active:boolean;columns:number;lift:number;spread:number;opacity:number;
 phase:number;primary:string;secondary:string;
}
export const KINETIC_OFF_V817:Readonly<KineticStageCueV817>={
 active:false,columns:0,lift:0,spread:0,opacity:0,phase:0,primary:'#ffffff',secondary:'#ffffff',
};
const clamp=(n:number)=>Math.max(0,Math.min(1,n));
export function planKineticStageV817(input:{
 fx:ConcertFxCueV810;settings:ConcertFxSettingsV810;tier:'low'|'balanced'|'high';
 lyricsProtected:boolean;vocalFocus:boolean;groupCount:number;
 energy:number;kick:number;architectureBudget:number;
}):KineticStageCueV817 {
 const {fx,settings:s}=input;
 if(!fx.active||fx.reason!=='music'||!s.enabled||!s.kineticStage||input.tier==='low'||
 !Number.isInteger(input.groupCount)||input.groupCount<1||input.groupCount>4||
 !Number.isFinite(fx.phase)||fx.phase<0||
 ![s.intensity,s.kineticIntensity,input.energy,input.kick,input.architectureBudget].every(Number.isFinite)||
 s.intensity<=0||s.kineticIntensity<=0||input.architectureBudget<=0)return KINETIC_OFF_V817;
 const section=fx.section==='drop'?1:fx.section==='finale'?.85:fx.section==='hook'?.73:
  fx.section==='build'?.65:fx.section==='verse'?.22:fx.section==='intro'?.12:0;
 if(!section)return KINETIC_OFF_V817;
 const quality=s.quality==='performance'?.38:s.quality==='balanced'?.65:1;
 const budget=clamp(input.architectureBudget)*(input.tier==='balanced'?.75:1)*quality;
 const protection=(s.protectLyrics&&input.lyricsProtected?.74:1)*(input.vocalFocus?.72:1);
 const musical=clamp(input.energy*.6+input.kick*.4);
 const base=clamp(s.intensity/100)*clamp(s.kineticIntensity/100)*budget*protection*section;
 const opacity=base*(.38+.62*musical)*.42;
 if(opacity<.008)return KINETIC_OFF_V817;
 return {active:true,columns:Math.min(KINETIC_COLUMNS_V817,Math.max(2,Math.floor(KINETIC_COLUMNS_V817*budget))),
  lift:Math.min(1.35,section*musical*base*1.6),spread:Math.min(.55,section*musical*base*.65),
  opacity:Math.min(.45,opacity),phase:fx.phase,primary:fx.primary,secondary:fx.secondary};
}
