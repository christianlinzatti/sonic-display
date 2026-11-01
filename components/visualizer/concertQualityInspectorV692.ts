/** V692 – read-only evidence-oriented concert quality inspection.
 * A projected head is NOT a dancing-quality metric. Stage cues are NOT camera
 * pixels or measured lighting. Never issue an automatic production approval.
 */
import type {V641Audit,V641Observation} from './fullConcertQualityAuditV641';

export type V692Domain='dance'|'camera'|'lyrics'|'lighting'|'performance';
export type V692Status='review'|'observed'|'manual'|'insufficient';
export type V692Evidence='browser-measurement'|'geometric-projection'|'director-metadata'|'none';
export interface V692Check{
 id:V692Domain; title:string; status:V692Status; evidence:V692Evidence;
 detail:string; action:string; atMs:number|null;
}
export interface V692Inspection{
 format:'sonic-v692-concert-quality-inspector'; mode:'live'|'full-song';
 trackId:string|null; sampleCount:number; coveragePercent:number|null;
 checks:V692Check[]; requiresHumanReview:true; automaticallyApproved:false;
}
const missing=(id:V692Domain,title:string,detail:string,action:string,status:V692Status='insufficient'):V692Check=>
 ({id,title,status,evidence:'none',detail,action,atMs:null});
const nonnegative=(v:number|null)=>v!==null&&Number.isFinite(v)&&v>=0;
const minIssues=(count:number)=>Math.max(2,Math.ceil(count*.05));
const order:readonly V692Domain[]=['dance','camera','lyrics','lighting','performance'];
const base=(mode:V692Inspection['mode'],trackId:string|null,samples:number,coverage:number|null,checks:V692Check[]):V692Inspection=>({
 format:'sonic-v692-concert-quality-inspector',mode,trackId,sampleCount:samples,coveragePercent:coverage,
 checks:order.map(id=>checks.find(c=>c.id===id)!),requiresHumanReview:true,automaticallyApproved:false,
});
const missingAll=(mode:V692Inspection['mode'],trackId:string|null,detail:string)=>base(mode,trackId,0,mode==='full-song'?0:null,[
 missing('dance','Tanz & Performer',detail,'Tanzbewegungen, Fußkontakt und Gesichtsausdruck im echten GLB-Bild prüfen.'),
 missing('camera','Kameraführung',detail,'Kamerafahrten im Songverlauf visuell beurteilen.'),
 missing('lyrics','Lyrics',detail,'Text während schneller Strophen und Hooks ablesen.'),
 missing('lighting','Licht & Bühne','Keine Pixel-, Helligkeits- oder Kontrastmessung vorhanden.','Moving Heads, Gobo, LED und Nebel mit realem Bühnenbild manuell prüfen.','manual'),
 missing('performance','Performance',detail,'Live-WebGL-Diagnose aktivieren und den Song abspielen.'),
]);
const firstIssue=(samples:readonly V641Observation[],predicate:(o:V641Observation)=>boolean)=>
 samples.find(predicate)?.progressMs??null;
const measured=(samples:readonly V641Observation[],selector:(o:V641Observation)=>number|null)=>samples.filter(o=>nonnegative(selector(o)));
/** Consume only the local user-started V641 capture; never manufacture scores or evidence. */
export function inspectFullConcertQualityV692(report:V641Audit,samples:readonly V641Observation[]):V692Inspection{
 if(report.status==='no-evidence'||report.samples===0||!samples.length||!report.trackId||
    report.samples!==samples.length||samples.some(s=>s.trackId!==report.trackId))
  return missingAll('full-song',null,'Keine zusammenhängende, gültige Song-Aufzeichnung vorhanden.');
 const total=samples.length;
 const avatar=samples.filter(s=>s.avatarCount>0);
 const unframed=avatar.filter(s=>s.headsInFrame<s.avatarCount);
 const dance:V692Check=avatar.length<6?
  missing('dance','Tanz & Performer','Zu wenige Avatar-Projektionsdaten für eine Bildausschnitt-Prüfung.','Vollsong mit geladenen GLB-Avataren aufnehmen.'):
  {id:'dance',title:'Tanz & Performer',status:unframed.length>=minIssues(avatar.length)?'review':'observed',evidence:'geometric-projection',
   detail:unframed.length>=minIssues(avatar.length)?`${unframed.length}/${avatar.length} Stichproben mit Kopfposition außerhalb des Kamerabildes. Kein Beleg für schlechten Tanz.`:
      `${avatar.length} geometrische Avatar-Stichproben, keine auffällige wiederholte Kopfprojektion außerhalb des Bilds. Bewegungsqualität und Foot-IK sind nicht gemessen.`,
   action:unframed.length>=minIssues(avatar.length)?'Kamera und Ensembleformation an der markierten Zeit prüfen; manuelle Einstellungen beibehalten.':'Tanzfluss, Bodenkontakt, Lippenbewegungen und Körperhaltung mit echten GLB-Modellen visuell prüfen.',
   atMs:unframed.length>=minIssues(avatar.length)?unframed[0].progressMs:null};
 const shotSignals=samples.filter(s=>s.shot!==''&&s.shot!=='unknown');
 const chapterSignals=samples.filter(s=>s.chapter!==''&&s.chapter!=='unclassified');
 let camera:V692Check;
 if(report.coveragePercent<60||total<30||shotSignals.length<10){
  camera=missing('camera','Kameraführung','Keine ausreichende Songabdeckung oder verwertbare Regie-Metadaten für die Schnittfolgen-Prüfung.','Vom Songanfang bis -ende aufnehmen und Kamerawechsel sichten.');
 }else{
  const long=report.findings.find(f=>f.id==='long-shot');
  const limited=report.durationMs>=90_000&&report.cameraTransitions<2;
  camera={id:'camera',title:'Kameraführung',status:long||limited?'review':'observed',evidence:'director-metadata',
   detail:long?'Regie-Metadaten zeigen eine lange unveränderte Kameraeinstellung; die sichtbare Kamerabewegung ist unbekannt.':
     limited?`Nur ${report.cameraTransitions} Wechsel im Regie-Shot-Typ über den beobachteten Song; ruhige Kamera kann beabsichtigt sein.`:
     `${report.cameraTransitions} Regie-Shot-Wechsel und ${chapterSignals.length} Abschnitts-Stichproben. Keine optische Bildbewertung.`,
   action:long||limited?'Die betreffenden Stellen ansehen und nur bei wirklichem Bedarf die manuelle Kamera-Timeline verfeinern.':'Schnittübergänge, Performer-Framing und Verse/Hook-Abwechslung im Browser prüfen.',
   atMs:long?long.timeMs:limited?shotSignals[0].progressMs:null};
 }
 const withLyrics=samples.filter(s=>s.lyrics!=='unavailable');
 const lyricIssues=withLyrics.filter(s=>s.lyrics==='issue'||s.lyrics==='watch');
 const lyrics:V692Check=withLyrics.length<6?
   missing('lyrics','Lyrics','Keine ausreichenden Messungen des Lyrics-Rechtecks. Fehlende Lyrics gelten nicht als fehlerfrei.','Immersive Lyrics aktivieren und bei laufender Bühne erneut aufzeichnen.'):
   {id:'lyrics',title:'Lyrics',status:lyricIssues.length>=minIssues(withLyrics.length)?'review':'observed',evidence:'geometric-projection',
    detail:lyricIssues.length>=minIssues(withLyrics.length)?`${lyricIssues.length}/${withLyrics.length} Messungen mit möglicher geometrischer Überlappung oder Clipping.`:
     `${withLyrics.length} Lyrics-Geometrieproben ohne wiederholte Warnungen; Textkontrast und Lesbarkeit sind damit nicht bewiesen.`,
    action:lyricIssues.length>=minIssues(withLyrics.length)?'Textposition, Kontrast und Kopf-Abstand an der Zeitmarke visuell prüfen; wortgenaues Timing nicht verändern.':'Schnelle Deutschrap-Zeilen, Wortakzente und 3D-Texte auf dem Zielbildschirm ablesen.',
    atMs:lyricIssues.length>=minIssues(withLyrics.length)?lyricIssues[0].progressMs:null};
 const lighting=missing('lighting','Licht & Bühne',
   `Lichtwirkung nicht gemessen${report.distinctChapters>0?`; ${report.distinctChapters} Regie-Kapitel erfasst, aber keine Helligkeitswerte`:''}.`,
   'Strophe, Hook, Drop und Finale im Browser vergleichen: Gesichter/Lyrics lesbar, Gobos und Nebel nicht zu dominant.','manual');
 const fps=measured(samples,s=>s.fps);
 const p95=measured(samples,s=>s.p95FrameMs);
 const low=fps.filter(s=>s.fps!==null&&s.fps<30);
 const slow=p95.filter(s=>s.p95FrameMs!==null&&s.p95FrameMs>45);
 const problem=low.length>=minIssues(fps.length)||slow.length>=minIssues(p95.length);
 const performance:V692Check=fps.length<6||p95.length<6?
  missing('performance','Performance',`Unvollständige Browser-Messwerte: ${fps.length} FPS- und ${p95.length} P95-Proben.`,
   'Performance-Diagnose aktivieren und Framezeit/FPS mit 1, 2 und 4 GLB-Avataren erfassen.'):
  {id:'performance',title:'Performance',status:problem?'review':'observed',evidence:'browser-measurement',
   detail:`${low.length}/${fps.length} FPS-Messungen unter 30 und ${slow.length}/${p95.length} P95-Framezeiten über 45 ms. Median FPS ${report.medianFps?.toFixed(1)??'—'}, P95 ${report.medianP95Ms?.toFixed(1)??'—'} ms.`,
   action:problem?'Problemstelle mit 1/2/4 GLB-Avataren nachmessen; zuerst Shader/LED/Gobo und Draw Calls vergleichen.':'Längeren Song vollständig abspielen; kein Nachweis von GPU-Auslastung oder Raspberry-Pi-Tauglichkeit.',
   atMs:problem?firstIssue(samples,s=>(s.fps!==null&&s.fps<30)||(s.p95FrameMs!==null&&s.p95FrameMs>45)):null};
 return base('full-song',report.trackId,total,report.coveragePercent,[dance,camera,lyrics,lighting,performance]);
}
export interface V692LiveInput{
 at:number;now:number;fps:number|null;p95FrameMs:number|null;
 assessment:{activeAvatarCount:number;headsInFrame:number;headVisibility:'ok'|'watch'|'issue'|'unavailable';lyrics:'ok'|'watch'|'issue'|'unavailable'}|null;
}
/** V466 current snapshot: transient clues, not a song-level verdict. */
export function inspectLiveConcertQualityV692(live:V692LiveInput):V692Inspection{
 if(!Number.isFinite(live.at)||!Number.isFinite(live.now)||live.at<=0||live.now-live.at>3500||live.now<live.at||!live.assessment)
  return missingAll('live',null,'Keine frische Live-Messung.');
 const a=live.assessment;
 const dance=a.activeAvatarCount===0?missing('dance','Tanz & Performer','Keine sichtbaren GLB-Avatare in der Probe.','Avatar-Modus aktivieren und Modelle laden.'):
  {id:'dance' as const,title:'Tanz & Performer',status:a.headVisibility==='issue'||a.headVisibility==='watch'?'review' as const:'observed' as const,
   evidence:'geometric-projection' as const,detail:`${a.headsInFrame}/${a.activeAvatarCount} projizierte Avatar-Kopfpositionen im Bild. Keine Bewegungs- oder Fußkontaktmessung.`,
   action:'Kamera/Formation und natürlichen Tanz im echten Bild prüfen.',atMs:null};
 const camera=missing('camera','Kameraführung','Ein einzelner Live-Messpunkt liefert keine verlässliche Schnittfolge.','Vollsong-Aufzeichnung für die Kamerawechsel starten.');
 const lyrics=a.lyrics==='unavailable'?missing('lyrics','Lyrics','Kein überprüfbares Lyrics-Rechteck in der aktuellen Szene.','Immersive Lyrics einschalten und beim Abspielen prüfen.'):
  {id:'lyrics' as const,title:'Lyrics',status:a.lyrics==='watch'||a.lyrics==='issue'?'review' as const:'observed' as const,
   evidence:'geometric-projection' as const,detail:a.lyrics==='ok'?'Lyrics-Rechteck ohne geometrische Warnung in dieser Probe; keine optische Lesbarkeitsmessung.':'Mögliche Text-/Kopf-Überlappung oder Clipping in der aktuellen Probe.',
   action:'Worttiming, Textkontrast und Position visuell kontrollieren.',atMs:null};
 const lighting=missing('lighting','Licht & Bühne','Aus Browser-Projektionsdaten ist keine reale Lichtwirkung messbar.','Beleuchtung, Gobos, LED und Nebel bei verschiedenen Songabschnitten visuell kontrollieren.','manual');
 const validFps=nonnegative(live.fps)&&live.fps !== null&&live.fps>0;const validP95=nonnegative(live.p95FrameMs);
 const performance=!validFps||!validP95?
  missing('performance','Performance','FPS oder P95-Framezeit fehlen in der aktuellen Messung.','Framezeitmessung aktivieren.'):
  {id:'performance' as const,title:'Performance',status:live.fps!==null&&live.fps<30||live.p95FrameMs!==null&&live.p95FrameMs>45?'review' as const:'observed' as const,
   evidence:'browser-measurement' as const,detail:`Momentan ${live.fps!.toFixed(1)} FPS und P95 ${live.p95FrameMs!.toFixed(1)} ms. Momentaufnahme, kein Langzeitnachweis.`,
   action:'Für belastbare Ergebnisse eine komplette Wiedergabe aufzeichnen und 1/2/4 Avatare vergleichen.',atMs:null};
 return base('live',null,1,null,[dance,camera,lyrics,lighting,performance]);
}
