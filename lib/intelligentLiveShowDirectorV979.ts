/** V979 – Intelligent Live Show Director 3.0.
 * Coordinates the *existing* V975–V978 virtual scene on the confirmed V318
 * section timeline. Pure, seek-stable, capped; no IO, rendering, lamp or camera
 * controller. Never fabricates sections or changes manually authored cues.
 */
import type {
 ConcertSceneV958, ConcertSettingsV958, ConcertPhaseV958, ConcertFxV955,
} from './ultimateConcertRoadmapV958';
import type {AtmosphereCueV978} from './concertAtmosphereV978';

export type LiveShowStyleV979='adaptive'|'cinematic'|'festival'|'club';
export type LiveShowFocusV979='intro'|'journey'|'build'|'peak'|'breather'|'finale'|'release'|'off';
export type LiveShowInputV979=Readonly<{
 scene:ConcertSceneV958|null;original:ConcertSceneV958|null;
 settings:ConcertSettingsV958;trackId:string;analysisTrackId:string;
 sectionLabel:string;sectionConfidence:number;sectionIndex:number;
 positionMs:number;durationMs:number;sectionStartMs:number;sectionDurationMs:number;
 playing:boolean;authoredStage:boolean;savedShowActive?:boolean;
 lowPerformance:boolean;reducedMotion:boolean;lyricsVisible:boolean;
}>;
export type LiveShowResultV979=Readonly<{
 scene:ConcertSceneV958|null;active:boolean;focus:LiveShowFocusV979;
 influence:number;atmosphereGain:number;crowdGain:number;
 combinedGain:number;reason:string;
}>;
const phases:readonly ConcertPhaseV958[]=['verse','hook','build','drop','break','outro'];
const styles:readonly LiveShowStyleV979[]=['adaptive','cinematic','festival','club'];
const finite=(...values:number[])=>values.every(Number.isFinite);
const clamp=(n:number,lo:number,hi:number)=>Math.min(hi,Math.max(lo,n));
const smooth=(v:number)=>{const x=clamp(v,0,1);return x*x*(3-2*x);};
const inactive=(scene:ConcertSceneV958|null,reason:string):LiveShowResultV979=>({
 scene,active:false,focus:'off',influence:0,atmosphereGain:1,crowdGain:1,
 combinedGain:1,reason,
});
/** Only actual current section metadata decides the chapter, not a projected set list. */
function focusFor(s:ConcertSceneV958,position:number,duration:number):LiveShowFocusV979{
 if(s.phase==='outro')return s.finale&&position/duration>=.86?'finale':'release';
 if(s.phase==='break')return 'breather';
 if(s.phase==='build')return 'build';
 if(s.phase==='drop'||s.phase==='hook')return 'peak';
 if(position/duration<.15)return 'intro';
 return 'journey';
}
const styleGain:Record<LiveShowStyleV979,number>={adaptive:.74,cinematic:.83,festival:1,club:.92};
const focusBoost:Record<LiveShowFocusV979,number>={intro:.022,journey:.030,build:.065,peak:.085,
 breather:.017,finale:.100,release:.019,off:0};
const atmosphereByFocus:Record<LiveShowFocusV979,number>={intro:.58,journey:.7,build:.83,
 peak:.9,breather:.45,finale:.9,release:.52,off:1};
const crowdByFocus:Record<LiveShowFocusV979,number>={intro:.35,journey:.48,build:.67,
 peak:1,breather:.22,finale:.90,release:.37,off:1};
const keepFx=(fx:readonly ConcertFxV955[],focus:LiveShowFocusV979,genre:ConcertSceneV958['genre']):ConcertFxV955[]=>{
 // Preserve selected FX; only suppress accidental high-energy FX in an actual break.
 const safe=focus==='breather'?fx.filter(f=>!['lasers','bass-impact','confetti','streamers'].includes(f)):fx;
 // The existing scene has priority. Only the real V977 accent may overflow budget.
 const cap=focus==='breather'?2:3;
 const ordered=genre==='deutschrap'&&focus==='journey'?safe.filter(f=>f!=='lasers'):safe;
 return [...new Set(ordered)].slice(0,cap);
};
/**
 * Keeps combined V975 + V977 gain within a shared small stage budget. Inactive
 * means byte-for-byte identical scene reference (backwards compatible).
 * Transitions retain their original V976 curve and the V354 camera remains authoritative.
 */
export function coordinateLiveShowV979(i:LiveShowInputV979):LiveShowResultV979{
 const {scene:s,original:o,settings:t}=i;
 if(!s||!o||!t.enabled||!t.virtualFx||!t.liveShowDirectorV979||!i.playing||
  !s.verified||!o.verified||s.timelineOverride||o.timelineOverride||
  i.authoredStage||i.savedShowActive||i.lowPerformance||i.reducedMotion||t.compactFxV960||
  !i.trackId||i.trackId!==i.analysisTrackId||
  !phases.includes(s.phase)||s.phase!==o.phase||s.phase!==i.sectionLabel||
  !styles.includes(t.liveShowStyleV979)||
  !Number.isInteger(i.sectionIndex)||i.sectionIndex<0||i.sectionIndex>159||
  !finite(i.sectionConfidence,i.positionMs,i.durationMs,i.sectionStartMs,i.sectionDurationMs,
   t.liveShowStrengthV979,s.intensity,s.spotlight,s.lightGain,o.intensity)||
  i.sectionConfidence<.75||i.sectionConfidence>1||
  i.durationMs<10000||i.durationMs>1800000||
  i.sectionStartMs<0||i.sectionDurationMs<1600||
  i.sectionStartMs+i.sectionDurationMs>i.durationMs+1000||
  i.positionMs<i.sectionStartMs||i.positionMs>=Math.min(i.durationMs,i.sectionStartMs+i.sectionDurationMs)||
  t.liveShowStrengthV979<=0||t.liveShowStrengthV979>100||
  s.intensity<0||s.intensity>1||o.intensity<0||o.intensity>1||
  s.spotlight<0||s.spotlight>1||s.lightGain<0||s.lightGain>1.3||
  !Array.isArray(s.effects)||s.effects.length>3||
  !Array.isArray(s.palette)||s.palette.length!==2)return inactive(s,'Keine bestätigte automatische Show-Koordination');
 const focus=focusFor(s,i.positionMs,i.durationMs);
 const elapsed=i.positionMs-i.sectionStartMs;
 const remaining=i.sectionStartMs+i.sectionDurationMs-i.positionMs;
 const edge=Math.min(1400,i.sectionDurationMs*.2);
 const envelope=smooth(Math.min(elapsed,remaining)/edge);
 const influence=clamp(t.liveShowStrengthV979/100*styleGain[t.liveShowStyleV979]*envelope*(i.lyricsVisible?.55:1),0,1);
 const maxIntensity=clamp(o.intensity*(1+focusBoost[focus]),.12,.97);
 // Crossfade the excess stacking back toward the shared V958-relative
 // ceiling, not to a guessed next section. At the section edge the existing
 // V976 transition is untouched, avoiding a hard cut.
 const capMix=smooth(influence*1.75);
 const excess=Math.max(0,s.intensity-maxIntensity);
 const intensity=clamp(s.intensity-excess*capMix,0,.97);
 const limitedGain=s.intensity>0?clamp(intensity/s.intensity,0,1):1;
 const spotlight=clamp(s.spotlight*(1-(1-limitedGain)*.20),0,1);
 const lightGain=clamp(s.lightGain*(1-(1-limitedGain)*.15),0,1.1);
 const effects=capMix>.25?keepFx(s.effects,focus,s.genre):s.effects;
 const atmosphereGain=clamp(1-(1-atmosphereByFocus[focus])*influence,.35,1);
 const crowdGain=clamp(1-(1-crowdByFocus[focus])*influence,.25,1);
 return {scene:{...s,intensity,spotlight,lightGain,effects},active:true,focus,influence,
  atmosphereGain,crowdGain,combinedGain:limitedGain,
  reason:`V979 ${focus}: bestätigter ${s.genre}/${s.phase}-Abschnitt, gemeinsames Bühnenbudget`};
}
/** Existing V978 meshes stay the only atmosphere renderer. Limits extra layers
 * without altering RGB palettes, choreography or any physical fixture.
 */
export function coordinateAtmosphereV979(cue:AtmosphereCueV978,plan:LiveShowResultV979):AtmosphereCueV978{
 if(!plan.active||!cue.active)return cue;
 return {...cue,fogOpacity:cue.fogOpacity*plan.atmosphereGain,
  beamOpacity:cue.beamOpacity*plan.atmosphereGain,
  crowdOpacity:cue.crowdOpacity*plan.crowdGain};
}
