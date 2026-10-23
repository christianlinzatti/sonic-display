/** V467: advisory-only, deterministic interpretation of the opt-in V466 quality probe.
 * Measurements are per-song, transient and bounded. No renderer or user-setting writes.
 * Camera-projected positions cannot prove an actual face is visible or occluded.
 */
import type {QualityLevelV466,ProjectedAvatarV466} from './concertQualityInspectorV466';

export interface ConcertQualityObservationV467 {
  at:number;
  fps:number|null;
  fpsLevel:QualityLevelV466;
  headsInFrame:number;
  activeAvatarCount:number;
  headsNearLyrics:number;
  lyricLevel:QualityLevelV466;
  headLevel:QualityLevelV466;
  estimatedOverlaps:number;
  unloadedAvatars:number;
  qualityTier:string;
}
export type ConcertQualityAdviceSeverityV467='important'|'check'|'info';
export type ConcertQualityAdviceEvidenceV467='fps-measured'|'head-projected'|'head-estimated'|'dom-projected'|'probe-status';
export interface ConcertQualityAdviceV467 {
  id:'low-fps'|'moderate-fps'|'loading'|'out-of-frame'|'lyrics-overlap'|'lyrics-bounds'|'missing-fps';
  severity:ConcertQualityAdviceSeverityV467;
  title:string;
  detail:string;
  suggestion:string;
  evidence:ConcertQualityAdviceEvidenceV467;
}
export interface ConcertQualityRecommendationsV467 {
  status:'waiting'|'ready'|'stale';
  sampleCount:number;
  advice:readonly ConcertQualityAdviceV467[];
}
const finite=(n:number)=>Number.isFinite(n);
const meaningful=(o:ConcertQualityObservationV467)=>finite(o.at)&&o.at>0&&finite(o.activeAvatarCount)&&o.activeAvatarCount>=0;
/** Small, safe snapshot of the existing probe; does not measure the scene again. */
export function observationFromConcertQualityV467(input:{
  at:number; fps:number|null; assessment:{fps:QualityLevelV466;headsInFrame:number;
    activeAvatarCount:number;headsNearLyrics:number;lyrics:QualityLevelV466;
    headVisibility:QualityLevelV466;}|null;
  avatars:readonly ProjectedAvatarV466[]; lyrics:{x:number;y:number;width:number;height:number}|null;
  qualityTier:string;
}):ConcertQualityObservationV467|null {
  const a=input.assessment;
  if(!a||!finite(input.at)||input.at<=0)return null;
  const active=input.avatars.slice(0,4);
  const estimatedOverlaps=input.lyrics?active.filter(v=>v.loaded!==false&&v.inFront&&v.anchor==='estimated'&&
    finite(v.x)&&finite(v.y)&&v.x>=input.lyrics!.x&&v.x<=input.lyrics!.x+input.lyrics!.width&&
    v.y>=input.lyrics!.y&&v.y<=input.lyrics!.y+input.lyrics!.height).length:0;
  return {at:input.at,fps:input.fps!==null&&finite(input.fps)&&input.fps>0?input.fps:null,
    fpsLevel:a.fps,headsInFrame:a.headsInFrame,activeAvatarCount:a.activeAvatarCount,
    headsNearLyrics:a.headsNearLyrics,lyricLevel:a.lyrics,headLevel:a.headVisibility,
    estimatedOverlaps,unloadedAvatars:active.filter(v=>v.loaded===false).length,
    qualityTier:input.qualityTier};
}
const advice=(id:ConcertQualityAdviceV467['id'],severity:ConcertQualityAdviceSeverityV467,
  title:string,detail:string,suggestion:string,evidence:ConcertQualityAdviceEvidenceV467):ConcertQualityAdviceV467=>
  ({id,severity,title,detail,suggestion,evidence});
/** Require three consecutive, recent samples. No timers, inference of missing FPS, or persistent history. */
export function recommendConcertQualityV467(history:readonly ConcertQualityObservationV467[],now:number):ConcertQualityRecommendationsV467 {
  if(!finite(now)||now<0)return {status:'stale',sampleCount:0,advice:[]};
  const observations=history.filter(meaningful).slice(-4);
  const last=observations[observations.length-1];
  if(!last)return {status:'waiting',sampleCount:0,advice:[]};
  if(last.at>now+1500||now-last.at>3500)return {status:'stale',sampleCount:observations.length,advice:[]};
  const recent=observations.slice(-3);
  if(recent.length<3||recent.some((o,i)=>i>0&&(o.at<=recent[i-1].at||o.at-recent[i-1].at>2500)))
    return {status:'waiting',sampleCount:recent.length,advice:[]};
  const always=(predicate:(o:ConcertQualityObservationV467)=>boolean)=>recent.every(predicate);
  const tips:ConcertQualityAdviceV467[]=[];
  if(always(o=>o.fpsLevel==='issue'&&o.fps!==null)){
    const avg=Math.round(recent.reduce((sum,o)=>sum+(o.fps??0),0)/3);
    tips.push(advice('low-fps','important','FPS dauerhaft niedrig',
      `Drei Messungen unter 25 FPS (Ø ${avg} FPS, WebGL-Statistik).`,
      last.qualityTier.toLowerCase().includes('low')?'Bei bereits niedriger Qualitätsstufe: zuerst Zahl und Komplexität der GLB-Modelle sowie zusätzliche Effekte im Live-Test prüfen.':'Die automatische Qualitätsregelung prüfen oder testweise ein sparsameres Grafikprofil auswählen.','fps-measured'));
  }else if(always(o=>o.fpsLevel==='issue'||o.fpsLevel==='watch')){
    tips.push(advice('moderate-fps','check','Bildrate wiederholt reduziert',
      'Drei aufeinanderfolgende FPS-Messungen lagen unter 45.',
      'Mit zwei statt vier Avataren vergleichen und Draw Calls im QA-Panel beobachten. Das allein beweist kein GPU-Limit.','fps-measured'));
  }
  if(always(o=>o.unloadedAvatars>0))tips.push(advice('loading','check','Avatar-Mesh fehlt wiederholt',
    `In drei Proben war mindestens ein Modell noch nicht als Mesh erkennbar.`,
    'Modellimport, Ladefehler und GLB-Pfad kontrollieren. Während des Songwechsels kann das vorübergehend normal sein.','probe-status'));
  if(always(o=>o.activeAvatarCount>0&&o.headsInFrame<o.activeAvatarCount&&o.unloadedAvatars===0))
    tips.push(advice('out-of-frame','check','Avatar-Kopf außerhalb des Bildbereichs',
      'In drei Kameraprojektionen lag mindestens ein Kopfpunkt außerhalb des sichtbaren Bereichs.',
      'Die aktuelle Kameraeinstellung und Gruppenaufstellung prüfen; keine automatische Kameraänderung.','head-projected'));
  if(always(o=>o.headsNearLyrics>0&&o.lyricLevel!=='unavailable')){
    const estimated=recent.some(o=>o.estimatedOverlaps>0);
    tips.push(advice('lyrics-overlap','check','Lyrics liegen nahe an Avatar-Köpfen',
      estimated?'Mehrfacher geometrischer Treffer; mindestens eine Kopfposition ist geschätzt.':'Mehrfacher Treffer zwischen projiziertem Kopfpunkt und echtem Lyrics-Rechteck.',
      'Lyrics-Seite und Kamera im Live-Bild prüfen. Ein geometrischer Treffer ist keine nachgewiesene optische Verdeckung.',
      estimated?'head-estimated':'dom-projected'));
  }
  if(tips.length===0&&always(o=>o.lyricLevel==='watch'&&o.headsNearLyrics===0))
    tips.push(advice('lyrics-bounds','info','Lyrics-Bereich überschreitet die WebGL-Fläche',
      'Die DOM-Rechteckprüfung meldet wiederholt einen Überstand ohne Kopf-Überschneidung.',
      'Bei absichtlich geteilter Ansicht ist das normal. Sonst die Lyrics-Seitenposition prüfen.','dom-projected'));
  if(tips.length===0&&always(o=>o.fpsLevel==='unavailable'))
    tips.push(advice('missing-fps','info','Keine frischen FPS-Messwerte',
      'Der vorhandene Renderzähler liefert noch keine gültigen FPS-Werte.',
      'Bei aktiver 3D-Bühne und sichtbarem Tab erneut prüfen; keine FPS-Zahl wird geschätzt.','probe-status'));
  return {status:'ready',sampleCount:3,advice:tips.slice(0,3)};
}
