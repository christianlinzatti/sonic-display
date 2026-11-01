/** V818 – musically authenticated spectral effects for the side-stage.
 * Pure and seek-stable: no invented transients, wall clocks or random sources.
 */
import type {ConcertFxCueV810,ConcertFxSettingsV810} from './concertFxStudioV810';

export const SPECTRAL_CAPS_V818=Object.freeze({waves:12,rings:20,prisms:48});
export interface SpectralMusicCueV818 {
 active:boolean; waves:number;rings:number;prisms:number;
 waveOpacity:number;ringOpacity:number;prismOpacity:number;
 bass:number;mids:number;highs:number;phase:number;primary:string;secondary:string;
}
export const SPECTRAL_OFF_V818:Readonly<SpectralMusicCueV818>={
 active:false,waves:0,rings:0,prisms:0,waveOpacity:0,ringOpacity:0,prismOpacity:0,
 bass:0,mids:0,highs:0,phase:0,primary:'#ffffff',secondary:'#ffffff',
};
const clamp=(n:number)=>Math.max(0,Math.min(1,n));
const count=(cap:number,q:number,budget:number)=>Math.max(0,Math.min(cap,Math.floor(cap*q*budget)));
export function planSpectralMusicV818(input:{
 fx:ConcertFxCueV810;settings:ConcertFxSettingsV810;tier:'low'|'balanced'|'high';
 lyricsProtected:boolean;vocalFocus:boolean;groupCount:number;
 energy:number;bass:number;mids:number;highs:number;spectralBudget:number;
}):SpectralMusicCueV818 {
 const {fx,settings:s}=input;
 if(!fx.active||fx.reason!=='music'||!s.enabled||!s.spectralVisuals||input.tier==='low'||
  !Number.isInteger(input.groupCount)||input.groupCount<1||input.groupCount>4||
  !Number.isFinite(fx.phase)||fx.phase<0||
  ![s.intensity,s.spectralIntensity,input.energy,input.bass,input.mids,input.highs,input.spectralBudget].every(Number.isFinite)||
  s.intensity<=0||s.spectralIntensity<=0||input.spectralBudget<=0)return SPECTRAL_OFF_V818;
 const section=fx.section==='drop'?1:fx.section==='finale'?.90:fx.section==='hook'?.79:
  fx.section==='build'?.69:fx.section==='verse'?.47:fx.section==='intro'?.22:0;
 if(!section)return SPECTRAL_OFF_V818;
 const bass=clamp(input.bass),mids=clamp(input.mids),highs=clamp(input.highs),energy=clamp(input.energy);
 // Do not synthesize a frequency response when music analysis reports silence.
 if(energy<.035||Math.max(bass,mids,highs)<.045)return SPECTRAL_OFF_V818;
 const quality=s.quality==='performance'?.34:s.quality==='balanced'?.64:1;
 const budget=clamp(input.spectralBudget)*(input.tier==='balanced'?.72:1);
 const protectedGain=(s.protectLyrics&&input.lyricsProtected?.44:1)*
   (input.vocalFocus?.58:1)*(input.groupCount>=3?.72:1);
 const genre=fx.genre==='hardtekk'||fx.genre==='hardstyle'?1:
  fx.genre==='rock'?.88:fx.genre==='rap'?.66:fx.genre==='pop'?.8:.70;
 const power=clamp(s.intensity/100)*clamp(s.spectralIntensity/100)*quality*budget*
  protectedGain*genre*section;
 if(power<=.001)return SPECTRAL_OFF_V818;
 const waves=s.spectralBassWaves&&bass>.055?count(SPECTRAL_CAPS_V818.waves,quality,budget):0;
 const rings=s.spectralFrequencyRings&&mids+highs>.075?count(SPECTRAL_CAPS_V818.rings,quality,budget):0;
 const prisms=s.spectralGeometry?count(SPECTRAL_CAPS_V818.prisms,quality,budget):0;
 const waveOpacity=waves?Math.min(.38,power*(.20+.78*bass)*(.25+.75*energy)*.48):0;
 const ringOpacity=rings?Math.min(.40,power*(.25+.44*mids+.31*highs)*(.25+.75*energy)*.48):0;
 const prismOpacity=prisms?Math.min(.54,power*(.22+.40*bass+.22*mids+.16*highs)*(.25+.75*energy)*.64):0;
 const active=waveOpacity>.002||ringOpacity>.002||prismOpacity>.002;
 if(!active)return SPECTRAL_OFF_V818;
 return {active,waves:waveOpacity>.002?waves:0,rings:ringOpacity>.002?rings:0,
  prisms:prismOpacity>.002?prisms:0,waveOpacity,ringOpacity,prismOpacity,
  bass,mids,highs,phase:fx.phase,primary:fx.primary,secondary:fx.secondary};
}
/** Stable pairs at the stage wings, clear of the |x| < 3.2 vocalist corridor, even at max ring radius. */
export function spectralPlacementV818(i:number){
 const side=i%2===0?-1:1;
 const row=Math.floor(i/2);
 return {side,row,x:side*(4.2+(row%12)*.105),offset:((i*41+9)%97)/97};
}
