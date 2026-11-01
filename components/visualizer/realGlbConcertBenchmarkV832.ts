/** V832 – real-scene, fail-closed 1/2/4 performer benchmark.
 * Measurements originate from V826's live render loop and V830's visible
 * skinned-mesh proof. This does not prove a file originated as a GLB, and
 * neither WebGLRenderer.info nor wall-clock frames are GPU memory/timers.
 * Data is transient, local-only and requires an explicitly started session.
 */
import type {ConcertQualitySnapshotV826} from './concertQualityTelemetryV826';
import type {CastProofV830} from './concertProductionEvidenceV830';

export type RealCastCountV832=1|2|4;
export type RealCastTierV832='low'|'balanced'|'high';
export interface RealGlbResultV832 {
 count:RealCastCountV832;trackId:string;tier:RealCastTierV832;
 pixels:string;fxSignature:string;seconds:number;windows:number;frames:number;
 fps:number;avgFrameMs:number;worstWindowP95Ms:number;slowFrameShare:number;
 avgDrawCalls:number;avgTriangles:number;peakGeometries:number;peakTextures:number;
 minRiggedSlots:number;maxSkinnedMeshes:number;maxSkinnedVertices:number;
 maxFxPressure:number;
}
export interface RealGlbProgressV832 {
 count:RealCastCountV832;seconds:number;targetSeconds:number;
 trackId:string;tier:RealCastTierV832;pixels:string;fxSignature:string;
 lastProgressMs:number;
}
export interface RealGlbBenchmarkStateV832 {
 active:boolean;results:Partial<Record<RealCastCountV832,RealGlbResultV832>>;
 progress:RealGlbProgressV832|null;notice:string;rejections:number;
}
export const CAST_TARGETS_V832=[1,2,4] as const;
const init=():RealGlbBenchmarkStateV832=>({active:false,results:{},progress:null,
 notice:'Noch keine Live-Messung. Benchmark starten.',rejections:0});
export const EMPTY_REAL_GLB_V832:Readonly<RealGlbBenchmarkStateV832>=init();
let current=init();
const listeners=new Set<()=>void>();
const publish=()=>{for(const f of listeners)f();};
export const subscribeRealGlbV832=(f:()=>void)=>{listeners.add(f);return()=>{listeners.delete(f);};};
export const getRealGlbV832=()=>current;
export const getRealGlbServerV832=()=>EMPTY_REAL_GLB_V832;
export const nextRealGlbCountV832=(s:RealGlbBenchmarkStateV832):RealCastCountV832|null=>CAST_TARGETS_V832.find(n=>!s.results[n])??null;
const emptyAccum=()=>({seconds:0,frames:0,frameMs:0,slow:0,worstP95:0,calls:0,triangles:0,
 peakGeometries:0,peakTextures:0,minSlots:Infinity,maxMeshes:0,maxVertices:0,
 maxPressure:0,windows:0});
let totals=emptyAccum();
const resetAccum=()=>{totals=emptyAccum();};
export function startRealGlbV832():void{resetAccum();current={...init(),active:true,notice:'Bitte 1 sichtbaren geriggten Performer bei laufendem Song öffnen.'};publish();}
export function stopRealGlbV832():void{resetAccum();current={...current,active:false,progress:null,notice:'Messung beendet. Bereits abgeschlossene Ergebnisse bleiben erhalten.'};publish();}
export function clearRealGlbV832():void{resetAccum();current=init();publish();}
export interface RealGlbInputV832 {
 snapshot:ConcertQualitySnapshotV826;proof:CastProofV830;
 configuredCount:number;trackId:string;progressMs:number;
 liveShow:boolean;pixelsX:number;pixelsY:number;fxSignature:string;
 targetSeconds?:number;
}
const finite=(x:number)=>Number.isFinite(x)&&x>=0;
const round=(x:number)=>Math.round(x*10)/10;
/** Invalid playback, absent rig, skip or incompatible conditions restart ONLY
 * the current measurement window; no partial result is ever fabricated.
 */
export function recordRealGlbWindowV832(i:RealGlbInputV832):void {
 if(!current.active)return;
 const next=nextRealGlbCountV832(current);
 if(next===null){current={...current,active:false,notice:'Alle drei Besetzungen real vermessen.'};publish();return;}
 const s=i.snapshot;
 const px=Number.isInteger(i.pixelsX)&&Number.isInteger(i.pixelsY)&&i.pixelsX>0&&i.pixelsY>0?
  `${i.pixelsX}x${i.pixelsY}`:'';
 const valid=i.liveShow&&s.available&&s.playing&&s.verified&&s.sampleCount>=6&&
  i.configuredCount===next&&i.proof.expected===next&&i.proof.verified&&
  i.proof.riggedSlots===next&&i.proof.skinnedMeshes>=next&&
  i.proof.vertices>0&&typeof i.trackId==='string'&&!!i.trackId.trim()&&
  typeof i.fxSignature==='string'&&!!i.fxSignature.trim()&&!!px&&
  finite(i.progressMs)&&i.progressMs>=0&&finite(s.frameMs)&&s.frameMs>0&&
  finite(s.fps)&&s.fps>0&&finite(s.p95FrameMs)&&s.p95FrameMs>0&&
  finite(s.slowFrameShare)&&s.slowFrameShare<=1;
 if(!valid){
  if(current.progress){resetAccum();current={...current,progress:null,rejections:current.rejections+1,
   notice:`Messfenster verworfen: ${next} sichtbare geriggte Performer und bestätigter laufender Song erforderlich.`};publish();}
  return;
 }
 const duration=s.frameMs*s.sampleCount/1000;
 if(!Number.isFinite(duration)||duration<.1||duration>2)return;
 const previous=current.progress;
 const incompatible=!!previous&&(previous.count!==next||previous.trackId!==i.trackId||
   previous.tier!==s.performanceTier||previous.pixels!==px||previous.fxSignature!==i.fxSignature||
   i.progressMs<previous.lastProgressMs+100||
   i.progressMs-previous.lastProgressMs>Math.max(1900,duration*1000+1200));
 if(incompatible){
  resetAccum();current={...current,progress:null,rejections:current.rejections+1,
   notice:'Songposition, Besetzung, Renderauflösung, Qualitätsstufe oder Effekte geändert. Messfenster neu gestartet.'};
 }
 const target=Number.isFinite(i.targetSeconds)?Math.max(5,Math.min(90,i.targetSeconds!)):15;
 totals.seconds+=duration;totals.frames+=s.sampleCount;totals.frameMs+=s.frameMs*s.sampleCount;
 totals.slow+=s.slowFrameShare*s.sampleCount;totals.worstP95=Math.max(totals.worstP95,s.p95FrameMs);
 totals.calls+=s.rendererCalls;totals.triangles+=s.rendererTriangles;
 totals.peakGeometries=Math.max(totals.peakGeometries,s.rendererGeometries);
 totals.peakTextures=Math.max(totals.peakTextures,s.rendererTextures);
 totals.minSlots=Math.min(totals.minSlots,i.proof.riggedSlots);
 totals.maxMeshes=Math.max(totals.maxMeshes,i.proof.skinnedMeshes);
 totals.maxVertices=Math.max(totals.maxVertices,i.proof.vertices);
 totals.maxPressure=Math.max(totals.maxPressure,s.pressure);
 totals.windows++;
 const progress:RealGlbProgressV832={count:next,seconds:Math.min(target,totals.seconds),
  targetSeconds:target,trackId:i.trackId,tier:s.performanceTier,pixels:px,
  fxSignature:i.fxSignature,lastProgressMs:i.progressMs};
 if(totals.seconds<target){current={...current,progress,notice:`Echte Szene: ${next} Performer – ${round(totals.seconds)} s gemessen.`};publish();return;}
 const result:RealGlbResultV832={count:next,trackId:i.trackId,tier:s.performanceTier,
  pixels:px,fxSignature:i.fxSignature,seconds:round(totals.seconds),windows:totals.windows,
  frames:totals.frames,fps:round(totals.frames/totals.seconds),avgFrameMs:round(totals.frameMs/totals.frames),
  worstWindowP95Ms:round(totals.worstP95),slowFrameShare:Math.round(totals.slow/totals.frames*1000)/1000,
  avgDrawCalls:Math.round(totals.calls/totals.windows),avgTriangles:Math.round(totals.triangles/totals.windows),
  peakGeometries:totals.peakGeometries,peakTextures:totals.peakTextures,
  minRiggedSlots:totals.minSlots,maxSkinnedMeshes:totals.maxMeshes,
  maxSkinnedVertices:totals.maxVertices,maxFxPressure:round(totals.maxPressure)};
 resetAccum();
 const results={...current.results,[next]:result};
 const following=CAST_TARGETS_V832.find(n=>!results[n]);
 current={...current,results,progress:null,active:following!==undefined,
  notice:following?`${next} Performer abgeschlossen. Bitte ${following} sichtbare geriggte Performer einstellen.`:
  'Alle drei echten Szenen gemessen. Ergebnisse und Vergleich prüfen.'};
 publish();
}
export interface RealGlbComparisonV832 {comparable:boolean;reason:string;fps4to1:number|null;gpuMeasured:false;}
export function compareRealGlbV832(s:RealGlbBenchmarkStateV832):RealGlbComparisonV832 {
 const r=CAST_TARGETS_V832.map(n=>s.results[n]);
 if(r.some(x=>!x))return {comparable:false,reason:'Vergleich unvollständig: 1, 2 und 4 tatsächlich sichtbare geriggte Performer aufnehmen.',fps4to1:null,gpuMeasured:false};
 const reference=r[0]!;
 if(r.some(x=>x!.trackId!==reference.trackId||x!.tier!==reference.tier||
  x!.pixels!==reference.pixels||x!.fxSignature!==reference.fxSignature))return {comparable:false,
  reason:'Nicht vergleichbar: Song, Qualitätsstufe, Auflösung oder Effektkonfiguration unterscheiden sich.',fps4to1:null,gpuMeasured:false};
 return {comparable:true,reason:'Live-Renderloop vergleichbar. Für Hardwareentscheidungen auf jedem Gerät erneut messen; GLB-Quelldatei und GPU-Zeit werden nicht verifiziert.',
  fps4to1:round(r[2]!.fps/reference.fps),gpuMeasured:false};
}
export function exportRealGlbV832(s:RealGlbBenchmarkStateV832){return {
 version:'V832',kind:'real-scene-cast-renderloop',generatedFrom:'observed-live-render-windows',
 disclaimer:'Visible SkinnedMeshes != GLB file provenance. FPS is main-thread/render-loop pacing; WebGLRenderer.info memory counters count resources, not VRAM bytes. No GPU timings or remote measurements.',
 results:s.results,comparison:compareRealGlbV832(s),rejectedWindows:s.rejections,productionReleased:false};}
