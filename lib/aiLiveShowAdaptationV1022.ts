/** V1022 – AI Live Show Adaptation.
 * Explainable, read-only adaptation proposals from two independent sources:
 * V604/V763 verified song acts and V896 measured audio / V826 renderer windows.
 * Never dispatches camera, avatar, FX, Govee or network commands. In the
 * absence of reliable measurement it keeps the authored V1021 baseline.
 */
import {planGenreConcertV1021,type GenreConcertInputV1021,
 type GenreLookV1021,type GenreProfileV1021} from './genreIntelligenceV1021';

export type LiveAdaptationStatusV1022='unavailable'|'baseline'|'adapted'|'performance-limited';
export type LivePerformanceBudgetV1022='unmeasured'|'healthy'|'strained'|'critical';
export type LiveAdaptationReasonV1022='verified-story'|'measured-audio'|'renderer-pressure'|
 'paused'|'disabled'|'manual'|'seek'|'blackout'|'missing-evidence'|
 'incomplete-timeline'|'invalid-acts'|'no-current-act';
export interface RendererWindowV1022 {
 available:boolean;playing:boolean;verified:boolean;sampleCount:number;
 fps:number;targetFps:30|60;slowFrameShare:number;
 /** These are measured renderer-frame data, not CPU or GPU timings. */
}
export type LiveShowAdaptationInputV1022=GenreConcertInputV1021 & {
 renderer?:RendererWindowV1022|null;
};
export interface LiveShowAdaptationV1022 {
 status:LiveAdaptationStatusV1022;reason:LiveAdaptationReasonV1022;
 genre:GenreProfileV1021;actOrdinal:number|null;phase:string|null;
 source:'verified-v604'|'unavailable';
 audioEvidence:'measured-v896'|'unavailable';
 rendererEvidence:'measured-v826'|'unavailable';
 performanceBudget:LivePerformanceBudgetV1022;
 /** Proposed look and 0..1 planned intensity, never a physical command. */
 look:GenreLookV1021|null;baselineIntensity:number|null;
 suggestedIntensity:number|null;intensityDelta:number;
 fxDensity:'minimal'|'low'|'balanced'|'expressive'|'none';
 explanations:readonly string[];
}
const finite=(v:unknown):v is number=>typeof v==='number'&&Number.isFinite(v);
const clamp=(v:number,low:number,high:number)=>Math.min(high,Math.max(low,v));
/** A renderer snapshot cannot be treated as valid merely because FPS is nonzero. */
function budgetFromRendererV1022(q?:RendererWindowV1022|null):LivePerformanceBudgetV1022 {
 if(!q?.available||!q.playing||!q.verified||!Number.isInteger(q.sampleCount)||q.sampleCount<12||
  !finite(q.fps)||q.fps<=0||q.fps>240||
  (q.targetFps!==30&&q.targetFps!==60)||!finite(q.slowFrameShare)||
  q.slowFrameShare<0||q.slowFrameShare>1)return 'unmeasured';
 const ratio=q.fps/q.targetFps;
 if(ratio<.55||q.slowFrameShare>.62)return 'critical';
 if(ratio<.80||q.slowFrameShare>.32)return 'strained';
 return 'healthy';
}
/** The energy snapshot must belong to the same track/time as the verified act.
 * This is an additional gate beyond readEnergyV896's own 1200ms cache freshness.
 */
function audioDeltaV1022(input:LiveShowAdaptationInputV1022):number|null {
 const a=input.audio;
 if(!a||a.source!=='live-normalized-audio'||
  a.trackId!==input.trackId||a.durationMs!==input.durationMs||
  !finite(input.positionMs)||!finite(a.positionMs)||
  Math.abs(input.positionMs-a.positionMs)>600||!Number.isInteger(a.samples)||a.samples<3||
  !finite(a.smoothed)||a.smoothed<0||a.smoothed>1||
  !finite(a.baseline)||a.baseline<0||a.baseline>1||
  !finite(a.trend)||a.trend< -1||a.trend>1||
  !finite(a.bass)||a.bass<0||a.bass>1)return null;
 // Relative level + trend, conservatively quantized to avoid noisy style flips.
 const raw=(a.smoothed-a.baseline)*.28+a.trend*.055;
 return Math.round(clamp(raw,-.12,.10)*100)/100;
}
/** Every call is pure and bounded. An adaptation is a UI suggestion ONLY. */
export function adaptLiveShowV1022(input:LiveShowAdaptationInputV1022):LiveShowAdaptationV1022 {
 const plan=planGenreConcertV1021(input);
 const initial:LiveShowAdaptationV1022={status:'unavailable',reason:plan.reason,
  genre:plan.profile,actOrdinal:null,phase:null,source:'unavailable',
  audioEvidence:'unavailable',rendererEvidence:'unavailable',
  performanceBudget:'unmeasured',look:null,baselineIntensity:null,
  suggestedIntensity:null,intensityDelta:0,fxDensity:'none',explanations:[]};
 if(plan.status!=='verified'||!plan.current)return initial;
 const current=plan.current;
 const budget=budgetFromRendererV1022(input.renderer);
 const delta=audioDeltaV1022(input);
 const audioEvidence=delta===null?'unavailable':'measured-v896';
 const rendererEvidence=budget==='unmeasured'?'unavailable':'measured-v826';
 let intensity=current.plannedIntensity;
 const notes:string[]=['Songphase aus bestätigter Timeline; Genre bleibt eine Stil-Angabe.'];
 if(delta!==null){intensity+=delta;notes.push('Aktuelle gemessene Audioenergie passt die Intensitätsvorschau begrenzt an.');}
 else notes.push('Keine passende frische Audiomessung: genreabhängiger Basislook bleibt erhalten.');
 const look:GenreLookV1021={...current.look};
 let density:LiveShowAdaptationV1022['fxDensity']='balanced';
 if(budget==='critical'){
  intensity=Math.min(intensity,.42);density='minimal';
  look.camera='steady';look.stage='minimal';look.avatars='hold';look.lights='soft';
  notes.push('Kritische gemessene Framebelastung: nur reduzierte, ruhige Vorschau.');
 }else if(budget==='strained'){
  intensity=Math.min(intensity,.64);density='low';
  look.camera='steady';look.avatars='hold';
  notes.push('Erhöhte gemessene Framebelastung: Bewegung und FX-Dichte reduzieren.');
 }else if(budget==='healthy'){
  density=delta!==null&&intensity>.65?'expressive':'balanced';
  notes.push('Gültiges Rendererfenster ohne auffällige Framebelastung.');
 }else notes.push('Keine ausreichende Renderer-Messung; Performance-Zustand unbekannt.');
 if(input.lyricsProtected){
  look.camera='steady';look.stage='minimal';look.lights='soft';look.lyrics='foreground';
  intensity=Math.min(intensity,.55);density='low';
  notes.push('Lesbare Lyrics haben Vorrang vor Kamera- und Lichteffekten.');
 }
 if(input.reducedMotion){
  look.camera='steady';look.stage='minimal';look.avatars='hold';look.lights='soft';
  intensity=Math.min(intensity,.45);density='minimal';
  notes.push('Bewegungsreduktion hat Vorrang.');
 }
 intensity=Math.round(clamp(intensity,0,1)*1000)/1000;
 const status:LiveAdaptationStatusV1022=budget==='critical'||budget==='strained'?
  'performance-limited':delta===null?'baseline':'adapted';
 return {...initial,status,reason:status==='performance-limited'?'renderer-pressure':
   delta===null?'verified-story':'measured-audio',genre:plan.profile,
  actOrdinal:current.ordinal,phase:current.phase,source:'verified-v604',
  audioEvidence,rendererEvidence,performanceBudget:budget,look,
  baselineIntensity:current.plannedIntensity,suggestedIntensity:intensity,
  intensityDelta:Number((intensity-current.plannedIntensity).toFixed(3)),
  fxDensity:density,explanations:notes};
}
