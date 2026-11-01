/** V751 – read-only concert dashboard projection.
 * Distinguishes configured features, currently requested automatic output and
 * proof from the separate opt-in V466 WebGL probe. No fake FPS/occlusion data.
 * This module is pure and never stores song metadata or creates timers.
 */
import type {ConcertQualityPlanV750} from './integratedConcertQualityV750';

export type ConcertSystemV751='quality'|'dance'|'ensemble'|'vocal'|'camera'|'lyrics'|'lighting';
export type ConcertPlanStateV751='disabled'|'idle'|'ready'|'planned'|'manual'|'unknown';
export interface ConcertSystemStatusV751 {
  id:ConcertSystemV751;label:string;configured:boolean|null;enabled:boolean;
  state:ConcertPlanStateV751;reason:string;factor:number|null;
}
export interface ConcertDashboardInputV751 {
  now:number;playing:boolean;avatarStage:boolean;section:string|null;count:number;
  quality:ConcertQualityPlanV750;
  qualityEnabled:boolean;danceEnabled:boolean;ensembleEnabled:boolean;
  vocalEnabled:boolean;cameraEnabled:boolean;lyricsEnabled:boolean;lightingEnabled:boolean;
  lyricsVisible:boolean;lyricsSynced:boolean;verifiedVocal:boolean;
  manualDance:boolean;manualCamera:boolean;manualLighting:boolean;
  reducedMotion:boolean;
}
export interface ConcertDashboardSnapshotV751 {
  at:number;playing:boolean;avatarStage:boolean;section:string;count:number;
  mode:string;reason:string;pressure:number;rows:readonly ConcertSystemStatusV751[];
  /** Attenuation of V750 automatic effects; NOT measured frame performance. */
  factors:Readonly<{dance:number;vocal:number;camera:number;lighting:number;lyricsAccent:number}>;
}
const safe=(value:number,lo:number,hi:number,fallback:number)=>
  Number.isFinite(value)?Math.max(lo,Math.min(hi,value)):fallback;
export const EMPTY_CONCERT_DASHBOARD_V751:Readonly<ConcertDashboardSnapshotV751>={
  at:0,playing:false,avatarStage:false,section:'unbekannt',count:0,
  mode:'off',reason:'off',pressure:0,rows:[],
  factors:{dance:1,vocal:1,camera:1,lighting:1,lyricsAccent:1},
};
export function buildConcertDashboardV751(i:ConcertDashboardInputV751):ConcertDashboardSnapshotV751{
  const playing=i.playing&&i.avatarStage&&!i.reducedMotion;
  const q=i.quality;
  const factors={dance:safe(q.dance,0,1,1),vocal:safe(q.vocal,0,1,1),
    camera:safe(q.camera,0,1,1),lighting:safe(q.lighting,0,1,1),
    lyricsAccent:safe(q.lyricsAccent,0,1,1)};
  const rows:ConcertSystemStatusV751[]=[];
  function add(id:ConcertSystemV751,label:string,enabled:boolean,allowed:boolean,reason:string,
    factor:number|null=null,manual=false):void{
    const state:ConcertPlanStateV751=!enabled?'disabled':manual&&playing?'manual':
      !playing?'idle':!allowed?'ready':'planned';
    rows.push({id,label,configured:true,enabled,state,
      reason:!enabled?'In den Einstellungen deaktiviert':!playing?
        (i.reducedMotion?'Reduzierte Bewegung oder keine aktive 3D-Bühne':'Keine aktive 3D-Wiedergabe'):
        manual?'Manueller Ablauf hat Vorrang':reason,factor});
  }
  add('quality','Integrierte Qualitätsregie',i.qualityEnabled,
    q.active,'V750: Schutzbudget berechnet (keine FPS-/GPU-Messung)',null);
  add('dance','Tanz & Bewegungsakzente',i.danceEnabled,
    !i.manualDance,'V742–V744: Automatik möglich · V750: '+Math.round(factors.dance*100)+' % Zusatzbewegung',factors.dance,i.manualDance);
  add('ensemble','Ensemble / Gruppenrollen',i.ensembleEnabled,
    i.count>=2,'V745: '+safe(i.count,0,4,0)+' Performer eingeplant',null);
  add('vocal','Vocal Performance',i.vocalEnabled,
    i.verifiedVocal,'V746: bestätigte Sängerzuordnung · '+Math.round(factors.vocal*100)+' % Gestikbudget',factors.vocal);
  add('camera','Cinematic Camera',i.cameraEnabled,
    !i.manualCamera,'V747: Kameraautomatik · '+Math.round(factors.camera*100)+' % Zusatzstärke',factors.camera,i.manualCamera);
  add('lyrics','Lyrics Performance',i.lyricsEnabled,
    i.lyricsVisible&&i.lyricsSynced,'V748: '+(i.lyricsSynced?'synchronisierte':'nicht synchronisierte')+' Lyrics'+
      (i.lyricsVisible?' eingeblendet':' aktuell nicht eingeblendet'),factors.lyricsAccent);
  add('lighting','Concert Lighting',i.lightingEnabled,
    !i.manualLighting,'V749: Lichtautomatik · '+Math.round(factors.lighting*100)+' % Zusatzstärke',factors.lighting,i.manualLighting);
  // A planning signal is NOT proof of pixels, active rigs, successful Spotify
  // fetches, phoneme accuracy, current light intensity or applied camera output.
  return {at:safe(i.now,0,Number.MAX_SAFE_INTEGER,0),playing:i.playing,
    avatarStage:i.avatarStage,section:(i.section??'unbekannt').slice(0,32),
    count:safe(Math.trunc(i.count),0,4,0),mode:q.mode,reason:q.reason,
    pressure:safe(q.pressure,0,1,0),rows,factors};
}
export function isConcertDashboardFreshV751(snapshot:ConcertDashboardSnapshotV751,now:number):boolean{
 return snapshot.at>0&&Number.isFinite(now)&&now>=snapshot.at&&now-snapshot.at<=5000;
}
export function concertDashboardSignatureV751(s:ConcertDashboardSnapshotV751):string{
 return JSON.stringify([s.playing,s.avatarStage,s.section,s.count,s.mode,s.reason,s.pressure,s.rows]);
}
