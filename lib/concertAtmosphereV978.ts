/** V978 – Smart Concert Atmosphere 2.0.
 * Deterministic, opt-in stage-only atmosphere for verified V318 song sections.
 * No IO, listeners, extra frame loop, camera, Govee/Alexa, pyro or strobe control.
 */
import type {ConcertGenreV947,ConcertPhaseV958,ConcertSceneV958,ConcertSettingsV958} from './ultimateConcertRoadmapV958';
export type AtmosphereModeV978='subtle'|'balanced'|'immersive';
export type AtmosphereMoodV978='urban'|'rave'|'arena'|'neutral'|'off';
export type AtmosphereCueV978=Readonly<{
 active:boolean;mood:AtmosphereMoodV978;
 fogOpacity:number;beamOpacity:number;crowdOpacity:number;
 drift:number;beamTilt:number;crowdWave:number;spread:number;
 colorA:string;colorB:string;
}>;
export type AtmosphereInputV978=Readonly<{
 scene:ConcertSceneV958|null;settings:ConcertSettingsV958;
 trackId:string;analysisTrackId:string;sectionLabel:string;sectionConfidence:number;
 positionMs:number;durationMs:number;sectionStartMs:number;sectionDurationMs:number;
 playing:boolean;authoredStage:boolean;savedShowActive?:boolean;
 lowPerformance:boolean;reducedMotion:boolean;lyricsVisible:boolean;
 energy:number;bass:number;immersiveActive:boolean;volumetricActive:boolean;
}>;
const OFF:AtmosphereCueV978=Object.freeze({active:false,mood:'off',fogOpacity:0,
 beamOpacity:0,crowdOpacity:0,drift:0,beamTilt:0,crowdWave:0,spread:1,
 colorA:'#000000',colorB:'#000000'});
const PHASES:readonly ConcertPhaseV958[]=['verse','hook','build','drop','break','outro'];
const MODES:readonly AtmosphereModeV978[]=['subtle','balanced','immersive'];
const GENRE:Record<ConcertGenreV947,{mood:AtmosphereMoodV978;fog:number;beam:number;crowd:number;pace:number}>= {
 deutschrap:{mood:'urban',fog:1,beam:.42,crowd:.28,pace:.70},
 hardtekk:{mood:'rave',fog:.46,beam:1,crowd:.92,pace:1.32},
 hardstyle:{mood:'rave',fog:.52,beam:.92,crowd:.84,pace:1.14},
 deutschrock:{mood:'arena',fog:.55,beam:.86,crowd:1,pace:.82},
 other:{mood:'neutral',fog:.58,beam:.58,crowd:.48,pace:.72},
};
const PHASE_GAIN:Record<ConcertPhaseV958,readonly [number,number,number]>={
 verse:[.88,.39,.27],hook:[.65,.90,.85],build:[.72,.72,.63],
 drop:[.47,1,.95],break:[1,.18,.15],outro:[.68,.48,.56],
};
const clamp=(n:number,lo=0,hi=1)=>Math.max(lo,Math.min(hi,n));
const finite=(...values:number[])=>values.every(Number.isFinite);
const smooth=(n:number)=>{const x=clamp(n);return x*x*(3-2*x);};
const validColor=(v:string)=>/^#[0-9a-f]{6}$/i.test(v);
/** Opacity is capped for existing V966/V972 layers, lyrics and photosensitivity.
 * Intervals are slow and smooth, never flashes; no future-section prediction.
 */
export function planConcertAtmosphereV978(i:AtmosphereInputV978):AtmosphereCueV978{
 const {scene:s,settings:t}=i;
 if(!s||!t.enabled||!t.virtualFx||!t.atmosphereV978||!i.playing||
  !s.verified||s.timelineOverride||i.authoredStage||i.savedShowActive||
  i.lowPerformance||i.reducedMotion||t.compactFxV960||t.voiceFxV968==='off'||
  !i.trackId||i.trackId!==i.analysisTrackId||
  !PHASES.includes(s.phase)||s.phase!==i.sectionLabel||
  !finite(i.sectionConfidence,i.positionMs,i.durationMs,i.sectionStartMs,i.sectionDurationMs,
   i.energy,i.bass,t.atmosphereStrengthV978,s.intensity)||
  i.sectionConfidence<.75||i.sectionConfidence>1||
  i.durationMs<10000||i.durationMs>1800000||i.sectionStartMs<0||
  i.sectionDurationMs<1600||i.sectionStartMs+i.sectionDurationMs>i.durationMs+1000||
  i.positionMs<i.sectionStartMs||i.positionMs>=Math.min(i.durationMs,i.sectionStartMs+i.sectionDurationMs)||
  t.atmosphereStrengthV978<=0||t.atmosphereStrengthV978>100||
  !MODES.includes(t.atmosphereModeV978)||s.intensity<0||s.intensity>1||
  !Array.isArray(s.palette)||s.palette.length!==2||!s.palette.every(validColor)||
  !Object.hasOwn(GENRE,s.genre))return OFF;
 const style=GENRE[s.genre];const [fog,beam,crowd]=PHASE_GAIN[s.phase];
 const elapsed=i.positionMs-i.sectionStartMs;
 const remaining=i.sectionStartMs+i.sectionDurationMs-i.positionMs;
 const fade=smooth(Math.min(elapsed,remaining)/Math.min(1400,i.sectionDurationMs*.24));
 const mode=t.atmosphereModeV978==='subtle'?.5:t.atmosphereModeV978==='immersive'?1:.75;
 const energy=.75+.25*clamp(i.energy*.65+i.bass*.35);
 const gain=t.atmosphereStrengthV978/100*mode*fade*energy*(.62+.38*s.intensity);
 if(gain<=.000001)return OFF;
 const lyric=i.lyricsVisible?.48:1;
 const layered=i.immersiveActive?.72:1;
 const fogLayer=i.volumetricActive?.65:1;
 // The three lightweight geometric layers share V958's verified palette.
 const fogOpacity=t.atmosphereFogV978?clamp(.070*style.fog*fog*gain*lyric*layered*fogLayer,0,.052):0;
 const beamOpacity=t.atmosphereBeamsV978?clamp(.065*style.beam*beam*gain*lyric*layered,0,.047):0;
 const crowdOpacity=t.atmosphereCrowdV978?clamp(.085*style.crowd*crowd*gain*lyric*layered,0,.064):0;
 if(Math.max(fogOpacity,beamOpacity,crowdOpacity)<.000001)return OFF;
 const tSec=i.positionMs/1000;
 const drift=Math.sin(tSec*.26*style.pace)*.14;
 const beamTilt=Math.sin(tSec*.39*style.pace)*.06;
 const crowdWave=.5+.5*Math.sin(tSec*.85*style.pace);
 return {active:true,mood:style.mood,fogOpacity,beamOpacity,crowdOpacity,
  drift,beamTilt,crowdWave,spread:s.phase==='break'?1.08:s.phase==='drop'?.94:1,
  colorA:s.palette[0],colorB:s.palette[1]};
}
