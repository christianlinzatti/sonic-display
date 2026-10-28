'use client';
import {useEffect,useState} from 'react';
import {BENCHMARK_RECIPES_V522,BENCHMARK_RUN_LIMIT_V522,
 beginBenchmarkV522,advanceBenchmarkV522,cancelBenchmarkV522,benchmarkRecipeV522,
 benchmarkResultV522,validateBenchmarksV522,benchmarkVisualReviewV522,
 type BenchmarkSceneV522,type BenchmarkRunV522,type BenchmarkVisualAuditV522} from
 '@/services/monitoring/concertBenchmarkValidationV522';
import type {PiStudioReadingV518} from '@/services/monitoring/piConcertPerformanceStudioV518';
import {planDeviceBaselineV626,latestBaselineProfileV626,exportDeviceReportV626} from '@/services/monitoring/hardwareSizingBenchmarkV626';
import {inspectConcertQualityV627,parseVisualAdviceV627,exportConcertQualityV627,type VisualAdviceImportV627} from '@/services/monitoring/automatedConcertQualityInspectorV627';
import {assessConcertShowReadinessV543, type ConcertVisualReviewsV543} from '@/services/monitoring/concertShowReadinessV543';
import {assessConcertReleaseV553, EMPTY_RELEASE_EVIDENCE_V553, type ConcertReleaseEvidenceV553} from '@/services/monitoring/concertReleaseGateV553';
const decimal=(n:number|null,unit='')=>n===null||!Number.isFinite(n)?'unbekannt':`${n.toFixed(1)}${unit}`;
const EMPTY_AUDIT:BenchmarkVisualAuditV522={lyricsLegible:false,lipSyncPlausible:false,motionNatural:false,lightReadable:false};
/** Optional UI only: the existing V518 one-second main-canvas readings drive everything.
 * Never imports or calls a graphics/settings writer or starts another sampling timer.
 */
export function PiConcertBenchmarkStudioV522({readings}:{readings:readonly PiStudioReadingV518[]}){
 const [scene,setScene]=useState<BenchmarkSceneV522>('deutschrap-feature');
 const [target,setTarget]=useState<30|45|60>(30);
 const [run,setRun]=useState<BenchmarkRunV522|null>(null);
 const [history,setHistory]=useState<readonly BenchmarkRunV522[]>([]);
 const [audit,setAudit]=useState<BenchmarkVisualAuditV522>(EMPTY_AUDIT);
 const [showReviewsV543,setShowReviewsV543]=useState<ConcertVisualReviewsV543>({});
 const [notice,setNotice]=useState('');
 const [operatorNoteV626,setOperatorNoteV626]=useState('');
 const [visualAdviceV627,setVisualAdviceV627]=useState<VisualAdviceImportV627|null>(null);
 const [visualAdviceNoticeV627,setVisualAdviceNoticeV627]=useState('Kein V593-Bildbericht importiert.');
 const [releaseEvidenceV553,setReleaseEvidenceV553]=useState<ConcertReleaseEvidenceV553>(EMPTY_RELEASE_EVIDENCE_V553);
 const updateReleaseV553=(patch:Partial<ConcertReleaseEvidenceV553>)=>setReleaseEvidenceV553(prev=>({...prev,...patch}));
 // New samples invalidate device/thermal attestations, but must not discard a separate local production build log.
 const invalidateDeviceReviewV553=()=>setReleaseEvidenceV553(prev=>({...prev,realDeviceConfirmed:false,touchscreenChecked:false,noFreezesObserved:false,thermalsReviewed:false}));
 const latest=readings[readings.length-1]??null;
 const recipe=benchmarkRecipeV522(scene);
 useEffect(()=>{
  if(!latest)return;
  setRun(previous=>previous?.status==='running'?advanceBenchmarkV522(previous,latest):previous);
 },[readings]);
 useEffect(()=>{
  if(!run||!['complete','invalid','cancelled'].includes(run.status))return;
  setHistory(previous=>previous.some(item=>item.id===run.id)?previous:
   [...previous,run].slice(-BENCHMARK_RUN_LIMIT_V522));
 },[run]);
 const current=run?.status==='complete'?benchmarkResultV522(run):null;
 const completed=history.filter(h=>h.status==='complete'&&h.scene===scene&&h.targetFps===target);
 const currentConfig=completed.at(-1)?.configuration??run?.configuration??'';
 const validation=validateBenchmarksV522(history,scene,target,currentConfig);
 const baselineV626=planDeviceBaselineV626(history,scene,target,latestBaselineProfileV626(history,scene,target));
 const inspectionV627=inspectConcertQualityV627(history,showReviewsV543,target,visualAdviceV627);
 const readinessV543=assessConcertShowReadinessV543(history,showReviewsV543,target);
 const releaseV553=assessConcertReleaseV553(history,showReviewsV543,target,releaseEvidenceV553);
 function start(){
  const now=Date.now();
  const next=beginBenchmarkV522(`${scene}-${now}`,scene,target,latest,now);
  if(!next){setNotice('Aktuelle gültige Hauptbühnenmessung erforderlich. Musik starten und mindestens ein Messfenster abwarten.');return;}
  setAudit(EMPTY_AUDIT);setShowReviewsV543(prev=>({...prev,[scene]:EMPTY_AUDIT}));setVisualAdviceV627(null);setVisualAdviceNoticeV627('Neue Messung: Bildhinweise nur nach erneutem Import zuordnen.');invalidateDeviceReviewV553();setRun(next);setNotice('Durchlauf gestartet. Musik und Bühne durchgehend mit unveränderten Einstellungen spielen lassen.');
 }
 function cancel(){if(run)setRun(cancelBenchmarkV522(run,Date.now()));}
 function exportV626(){
  const payload=exportDeviceReportV626(history,baselineV626,operatorNoteV626);
  const url=URL.createObjectURL(new Blob([JSON.stringify(payload,null,2)],{type:'application/json'}));
  const a=document.createElement('a');a.href=url;a.download='sonic-display-v626-hardware-baseline.json';
  document.body.appendChild(a);a.click();a.remove();URL.revokeObjectURL(url);
 }
 async function importV593V627(file:File|null){
  if(!file)return;
  if(file.size>1024*1024){setVisualAdviceNoticeV627('V593-Datei zu groß (maximal 1 MB).');return;}
  try{
   const parsed=parseVisualAdviceV627(JSON.parse(await file.text()));
   if(!parsed){setVisualAdviceNoticeV627('Kein gültiger V593-Livehinweisbericht. Import verworfen.');return;}
   setVisualAdviceV627(parsed);
   setVisualAdviceNoticeV627(`V593-Hinweisbericht mit ${parsed.sourceScreenshotCount} Bildaufnahmen importiert (Dateiherkunft nicht authentifiziert).`);
  }catch{setVisualAdviceNoticeV627('Datei konnte nicht als gültiges JSON gelesen werden.');}
 }
 function exportV627(){
  const payload=exportConcertQualityV627(inspectionV627,operatorNoteV626);
  const url=URL.createObjectURL(new Blob([JSON.stringify(payload,null,2)],{type:'application/json'}));
  const a=document.createElement('a');a.href=url;a.download='sonic-display-v627-concert-quality-report.json';
  document.body.appendChild(a);a.click();a.remove();URL.revokeObjectURL(url);
 }
 function save(){
  const payload={version:'V553',releaseGate:releaseV553,operatorEvidence:releaseEvidenceV553,concertReadiness:readinessV543,sceneVisualReviews:showReviewsV543,at:Date.now(),source:'Actual once-per-second main WebGL canvas measurements',
   caveats:'Window P95/P99 maxima, not pooled-frame percentiles; no audio/visual correctness test, temperature or GPU timer.',
   recipe:BENCHMARK_RECIPES_V522,runs:history.map(r=>({run:r,result:benchmarkResultV522(r)})),
   subjectiveReview:audit,subjectiveReviewStatement:benchmarkVisualReviewV522(audit)};
  const url=URL.createObjectURL(new Blob([JSON.stringify(payload,null,2)],{type:'application/json'}));
  const a=document.createElement('a');a.href=url;a.download='sonic-display-v553-concert-release-validation.json';
  document.body.appendChild(a);a.click();a.remove();URL.revokeObjectURL(url);
 }
 return <section className="settings-note" aria-label="V522 Concert Benchmark & Quality Validation">
  <h5>V522 – Concert Benchmark &amp; Quality Validation</h5>
  <p>Reproduzierbare Messrezepte auf der <strong>echten laufenden Konzertbühne</strong>. Jede Messung nutzt die bestehende Abtastung ohne zusätzliche Render-Schleife. Die Szenen müssen selbst mit der gleichen Musikpassage, Kameraposition und Beleuchtung abgespielt werden. <strong>Drei Wiederholungen</strong> mit denselben erfassten Einstellungen empfohlen.</p>
  <div className="concert-actions-v480">
   <label>Testszenario <select aria-label="V522 Benchmark-Szenario" value={scene} disabled={run?.status==='running'}
    onChange={e=>{setScene(e.target.value as BenchmarkSceneV522);setAudit(EMPTY_AUDIT);setVisualAdviceV627(null);setVisualAdviceNoticeV627('Neues Szenario: Bildbelege erneut zuordnen.');}}>
    {BENCHMARK_RECIPES_V522.map(r=><option key={r.id} value={r.id}>{r.label}</option>)}
   </select></label>
   <label>FPS-Ziel <select aria-label="V522 FPS-Ziel" value={target} disabled={run?.status==='running'}
    onChange={e=>{setTarget(Number(e.target.value) as 30|45|60);setShowReviewsV543({});setVisualAdviceV627(null);invalidateDeviceReviewV553();}}>
    <option value={30}>30 FPS</option><option value={45}>45 FPS</option><option value={60}>60 FPS</option>
   </select></label>
  </div>
  <p>{recipe.instructions}</p>
  <p>Rezept: <strong>{recipe.warmupSeconds} s Aufwärmen + {recipe.measurementSeconds} s Messphase</strong> · Richtwert {recipe.recommendedAvatars} Tänzer, Grafikmodus {recipe.recommendedQuality}. Die tatsächliche Avatarzahl und Grafikstufe werden automatisch in der Messung protokolliert; die Richtwerte werden nicht erzwungen oder eingestellt.</p>
  <div className="concert-actions-v480">
   <button type="button" onClick={start} disabled={run?.status==='running'||!latest}>Neuen Live-Benchmark starten</button>
   <button type="button" onClick={cancel} disabled={run?.status!=='running'}>Lauf abbrechen</button>
   <button type="button" onClick={save} disabled={!history.length}>V553-Freigabebericht als JSON speichern</button>
   <button type="button" onClick={()=>{setHistory([]);setRun(null);setAudit(EMPTY_AUDIT);setShowReviewsV543({});setVisualAdviceV627(null);setReleaseEvidenceV553(EMPTY_RELEASE_EVIDENCE_V553);setNotice('V522/V543/V553-Messungen und Szenenfreigaben gelöscht.');}}
    disabled={run?.status==='running'||!history.length}>V522-Verlauf löschen</button>
  </div>
  {notice&&<p role="status">{notice}</p>}
  {run&&<div role="status">
   <strong>Letzter Durchlauf: {run.status==='running'?'läuft':run.status==='complete'?'abgeschlossen':run.status==='invalid'?'ungültig':'abgebrochen'}</strong>
   <p>{run.reason} · {run.count} gültige Messfenster · {run.avatarCount} Avatare · {run.tier} · DPR {decimal(run.dpr)} · Pi {run.piProfile}/{run.piLevel}</p>
   {current&&<p>Beobachtet: Ø {decimal(current.avgFps,' FPS')} · Minimum {decimal(current.minFps,' FPS')} · schlechtestes Fenster-P95 {decimal(current.worstWindowP95Ms,' ms')} · schlechtestes Fenster-P99 {decimal(current.worstWindowP99Ms,' ms')} · langsame Frames Ø {decimal(current.avgSlowPercent,' %')} · JS-Heap-Delta {decimal(current.heapDeltaMb,' MB')}.</p>}
   {current&&<p><strong>{current.status==='meets-target'?'Browser-Leistungsziel erreicht':current.status==='limited'?'Begrenzte Datenlage':'Browser-Leistungsziel nicht erreicht'}</strong> – kein Beweis für Lip-Sync, Bildqualität oder echte Pi-Hardwarestabilität.</p>}
  </div>}
  <h5>Wiederholungsvalidierung</h5>
  <p role="status">{validation.repetitions}/3 passende Durchläufe · {validation.reason}</p>
  {validation.meanFps!==null&&<p>Ø FPS {decimal(validation.meanFps)} · FPS-Spanne {decimal(validation.fpsRange)} · schlechtestes P95 {decimal(validation.worstP95Ms,' ms')} · schlechtestes P99 {decimal(validation.worstP99Ms,' ms')} · kumuliertes JS-Heap-Delta {decimal(validation.heapGrowthMb,' MB')}.</p>}
  {history.length>0&&<div className="render-diagnostics-grid">{history.map(item=>{
   const r=benchmarkResultV522(item);
   return <div key={item.id}>
    <strong>{benchmarkRecipeV522(item.scene).label} · {item.status}</strong>
    <p>{item.avatarCount} Avatare · {item.tier} · {item.count} Fenster · {new Date(item.startedAt).toLocaleTimeString()}</p>
    {r?<p>Ø {decimal(r.avgFps,' FPS')} · P95 {decimal(r.worstWindowP95Ms,' ms')} · P99 {decimal(r.worstWindowP99Ms,' ms')} · {r.status}</p>:<p>{item.reason}</p>}
   </div>;
  })}</div>}
  <section className="settings-note" aria-label="V626 Adaptive 3D Concert Performance &amp; Hardware Baseline">
   <h5>V626 – Adaptive 3D Concert Performance &amp; Hardware-Baseline</h5>
   <p><strong>Erst auf deinem Windows-PC messen.</strong> Für das gewählte Song-Szenario und FPS-Ziel
    jeweils <strong>2, 3 und 4</strong> gleichzeitig aktive GLB-Avatare einstellen und mit dem obigen
    Live-Benchmark je drei Wiederholungen durchführen. Lyrics, Lip-Sync, Kamera, Musikabschnitt,
    Fenstergröße, Licht und Qualitätsmodus möglichst identisch halten. Avatare werden nicht automatisch umgestellt.</p>
   <p role="status">{baselineV626.reason}</p>
   <p>Erfasste Hauptcanvas-Auflösung: <strong>{baselineV626.comparable?`${baselineV626.renderWidthPx} × ${baselineV626.renderHeightPx} Pixel`:'noch unbekannt'}</strong>
    {' '}· Qualitätsmodus {baselineV626.quality||'offen'} · DPR {baselineV626.dpr||'offen'}.
    Eine physische Bildschirmgröße von 10 Zoll kann der Browser daraus nicht bestimmen.</p>
   <div className="render-diagnostics-grid">{baselineV626.rows.map(item=><div key={item.avatarCount}>
    <strong>{item.avatarCount} Avatare · {item.repetitions}/3 Wiederholungen</strong>
    <p>{item.status==='meets-target'?'FPS-Ziel in diesen Durchläufen erfüllt':item.status==='below-target'?'FPS-Ziel in mindestens einem Durchlauf verfehlt':item.status==='limited'?'P99-Daten unvollständig':item.status==='incomplete'?'Weitere Messläufe fehlen':'Noch keine passende Messung'}</p>
    <p>Ø FPS {decimal(item.meanFps)} · niedrigstes Fenster-FPS {decimal(item.minFps)} · schlechtestes P95 {decimal(item.worstWindowP95Ms,' ms')} · schlechtestes P99 {decimal(item.worstWindowP99Ms,' ms')}</p>
    <p>Langsame Frames Ø {decimal(item.meanSlowPercent,' %')} · Draw Calls bis Ø {decimal(item.maxDrawCalls)} · Dreiecke bis {item.maxTriangles?.toLocaleString('de-AT')??'unbekannt'}</p>
   </div>)}</div>
   <p><strong>Gemessener Unterschied (2 gegenüber 4 Avataren):</strong> {baselineV626.fpsDrop2To4===null?'weitere vergleichbare Messläufe nötig':`${decimal(baselineV626.fpsDrop2To4,' FPS')} Differenz der Durchschnittswerte`}.
    {' '}Die Differenz beschreibt nur diese gemessene Konfiguration, keine kausale GPU-Kostenrechnung.</p>
   <label style={{display:'block'}}>Testumgebung / gleiche Musikpassage / tatsächlich verwendete Renderauflösung
    <textarea rows={2} value={operatorNoteV626} onChange={e=>setOperatorNoteV626(e.target.value)}
     placeholder="z. B. Windows, Chrome, 1280 × 800, gleicher Deutschrap-Hook, Netzbetrieb, Energieprofil" />
   </label>
   <button type="button" onClick={exportV626} disabled={!baselineV626.comparable}>V626-Messprotokoll als JSON speichern</button>
   <p><strong>Hardwareentscheidung bleibt offen:</strong> Eine flüssige Windows-Messung bestätigt
    <em> nicht</em>, dass ein Raspberry Pi dieselbe FPS erreicht. Für eine Pi-/Mini-PC-Empfehlung
    müssen reale Messungen auf Kandidatengeräten bei identischer Auflösung, Avatarzahl und Songpassage folgen.
    GPU-Auslastung, VRAM, Temperatur, thermisches Throttling und Stromverbrauch werden nicht gemessen.
    JS-Heap ist nicht mit dem gesamten Arbeitsspeicher gleichzusetzen. Testläufe bleiben in dieser Sitzung.</p>
  </section>
  <section className="settings-note" aria-label="V627 Automated Concert Quality Inspector">
   <h5>V627 – Automated Concert Quality Inspector</h5>
   <p>Gemeinsamer, <strong>read-only</strong> Qualitätsbericht für die drei echten V522-Szenen und die manuellen V543-Sichtprüfungen. Die Regie wird nicht automatisch verändert. <strong>Keine lückenlose Ganzsong-Prüfung:</strong> Der Langzeittest erfasst maximal drei Minuten.</p>
   <p role="status"><strong>{inspectionV627.status==='attention-needed'?'Messprobleme oder bildbasierte Warnungen gefunden':inspectionV627.status==='measurements-missing'?'Noch unvollständige Messdaten':inspectionV627.status==='human-review-needed'?'Manuelle Sicht-/Hörprüfung erforderlich':'Browser-Messungen und Bedienerprüfungen lokal abgeschlossen'}</strong>
    {' '}· {inspectionV627.scenesWithThreeMatchingRuns}/3 Leistungsszenen vorläufig bestanden · {inspectionV627.scenesManuallyReviewed}/3 manuell geprüft · {inspectionV627.findings.filter(f=>f.severity==='high').length} priorisierte Warnungen.</p>
   <p>Für Bildbefunde optional den <strong>bereits vorhandenen V593-Hinweisbericht</strong> aus einer echten lokalen V592-Aufnahme laden (nicht das HTML und nicht die PNG-Dateien). Die Datei wird nur lokal im Browser verarbeitet.</p>
   <label style={{display:'block'}}>V593-Bildhinweisbericht (JSON)
    <input aria-label="V627 V593 Qualitätsbericht importieren" type="file" accept=".json,application/json"
     onChange={e=>{const file=e.currentTarget.files?.[0]??null;void importV593V627(file);e.currentTarget.value='';}} />
   </label>
   <p role="status">{visualAdviceNoticeV627}</p>
   {visualAdviceV627&&<button type="button" onClick={()=>{setVisualAdviceV627(null);setVisualAdviceNoticeV627('Importierte Bildhinweise verworfen.');}}>Bildhinweise entfernen</button>}
   <div className="render-diagnostics-grid">{inspectionV627.sceneEvidence.map(s=><div key={s.scene}>
    <strong>{benchmarkRecipeV522(s.scene).label}</strong>
    <p>{s.repetitions}/3 Messungen · {s.averageFps===null?'FPS noch nicht vergleichbar':`${decimal(s.averageFps,' FPS')}`} · P99 {decimal(s.worstP99Ms,' ms')} · {s.humanChecks}/4 manuelle Prüfpunkte</p>
   </div>)}</div>
   {inspectionV627.findings.length>0&&<div className="render-diagnostics-grid">{inspectionV627.findings.map(f=><div key={f.id}>
    <strong>{f.severity==='high'?'Wichtig':f.severity==='medium'?'Prüfen':'Offen'} · {f.area}</strong>
    <p>{f.detail}</p><p><strong>Empfehlung:</strong> {f.recommendation}</p>
    <small>{f.evidence==='measured-browser'?'Echte WebGL-Messung':f.evidence==='imported-image-heuristic'?'Importierte, nicht authentifizierte Bildheuristik':'Manuelle Prüfung fehlt'}</small>
   </div>)}</div>}
   <button type="button" onClick={exportV627}>V627-Qualitätsbericht als JSON exportieren</button>
   <p><strong>Grenzen:</strong> Weder FPS noch V593-Bildgeometrie prüfen echten Lip-Sync, Tanzästhetik, Sängerrollen oder die Qualität eines gesamten Songs. Importierte JSON-Dateien sind nicht authentifiziert; es gibt keine automatische Freigabe. Den V543-Sichtprüfstatus unten nur nach echter Kontrolle setzen.</p>
  </section>
  <h5>V543 – Concert Show Integration &amp; Performance Validation</h5>
  <p>Gesamtprüfung über <strong>Deutschrap-Feature, Hardstyle-Drop und Langzeitshow</strong>. Jede Szene benötigt drei vollständige Messläufe derselben aufgezeichneten Konfiguration. Der Status beschreibt nur die beobachtete Browserleistung – kein automatisches Urteil über Tanz, Lippenbewegung oder Bildqualität.</p>
  <p role="status"><strong>{readinessV543.completedScenes}/3 Szenen mit vorläufig bestandenem Leistungsbenchmark · {readinessV543.reviewedScenes}/3 zusätzlich manuell geprüft.</strong> {readinessV543.note}</p>
  <div className="render-diagnostics-grid">{readinessV543.scenes.map(item=><div key={item.scene}>
   <strong>{item.label}</strong>
   <p>{item.repetitions}/3 Messläufe · {item.status==='provisional'?'vorläufig bestanden':item.status==='needs-review'?'Leistung prüfen':item.status==='mixed'?'Konfigurationen nicht vergleichbar':'Messungen fehlen'} · {item.meanFps===null?'FPS offen':`${item.meanFps.toFixed(1)} FPS`} · {item.worstP99Ms===null?'P99 offen':`schlechtestes Fenster-P99 ${item.worstP99Ms.toFixed(1)} ms`}</p>
   <p>Manuelle Sicht- und Hörprüfung: {item.visualChecked}/4 bestätigt. Die Häkchen dürfen nur nach Wiedergabe <strong>dieser Szene</strong> gesetzt werden.</p>
   {([['lyricsLegible','Lyrics lesbar'],['lipSyncPlausible','Lip-Sync / Vocals plausibel'],
     ['motionNatural','Tanz / Fußkontakt natürlich'],['lightReadable','Kamera / Licht gut lesbar']] as const).map(([field,label])=><label key={field} style={{display:'block'}}>
      <input type="checkbox" checked={!!showReviewsV543[item.scene]?.[field]}
       onChange={e=>setShowReviewsV543(prev=>({...prev,[item.scene]:{...(prev[item.scene]??EMPTY_AUDIT),[field]:e.target.checked}}))}/>{' '}{label}
     </label>)}
  </div>)}</div>
  <p>V543 bestätigt niemals automatisch die echte Raspberry-Pi-Hardware, GPU-Temperatur, thermisches Throttling, Audio-Phoneme oder die visuelle Schönheit der Show. Für die Pi-Freigabe die Messung direkt am Gerät wiederholen.</p>
  <h5>V553 – Concert Experience Release Validation</h5>
  <p>Produktionsfreigabe ist <strong>nicht automatisch</strong>: Drei vergleichbare <strong>echte</strong> WebGL-Benchmarkläufe pro Szene, je vier manuell überprüfte Kriterien, ein extern erfolgreich ausgeführter vollständiger Next.js-Build und eine echte Prüfung am Raspberry Pi sind erforderlich. Geräteidentität, Temperatur und Build-Protokoll können durch diese App nicht verifiziert werden.</p>
  <p role="status"><strong>{releaseV553.status==='human-signoff-ready'?'Für menschliche Freigabeprüfung vorbereitet':'Freigabe blockiert'}</strong> · {releaseV553.blockers.length} offene Nachweise. {releaseV553.note}</p>
  <div className="concert-actions-v480">
   <label>Vollständiger lokaler Build
    <select aria-label="V553 Build-Ergebnis" value={releaseEvidenceV553.buildStatus}
     onChange={e=>updateReleaseV553({buildStatus:e.target.value as ConcertReleaseEvidenceV553['buildStatus']})}>
     <option value="not-run">Nicht ausgeführt / nicht bekannt</option>
     <option value="passed">Vom Bediener erfolgreich geprüft</option>
     <option value="failed">Fehlgeschlagen</option>
    </select>
   </label>
   <label>Prüfgerät
    <select aria-label="V553 Prüfgerät" value={releaseEvidenceV553.device}
     onChange={e=>updateReleaseV553({device:e.target.value as ConcertReleaseEvidenceV553['device'],realDeviceConfirmed:false})}>
     <option value="browser">Anderer Browser / Entwicklungsrechner</option>
     <option value="raspberry-pi">Echter Raspberry Pi (manuell bestätigt)</option>
    </select>
   </label>
  </div>
  <label style={{display:'block'}}>Build-Protokoll / `npm run typecheck` und `npm run build` (nur vom Bediener angegeben)
   <textarea aria-label="V553 Build-Protokoll" value={releaseEvidenceV553.buildEvidence}
    onChange={e=>updateReleaseV553({buildEvidence:e.target.value})} rows={3}
    placeholder="Ausgabe des auf deinem Computer ausgeführten Builds einfügen" />
  </label>
  <label style={{display:'block'}}>Gerät / OS / Browser
   <input aria-label="V553 Raspberry Pi Gerät" value={releaseEvidenceV553.deviceLabel}
    onChange={e=>updateReleaseV553({deviceLabel:e.target.value})} placeholder="z. B. Raspberry Pi 5, Chromium, 10-Zoll-Display" />
  </label>
  {([
   ['realDeviceConfirmed','Alle aktuellen Benchmarkläufe für diese Freigabe wurden auf dem genannten echten Pi durchgeführt'],
   ['touchscreenChecked','Lyrics, Kamera, Sängerwechsel und Touch-Bedienung auf dem 10-Zoll-Display visuell geprüft'],
   ['noFreezesObserved','Langzeitkonzert am Gerät ohne sichtbare Hänger oder Aussetzer geprüft'],
   ['thermalsReviewed','Temperatur und CPU-Throttling am Gerät mit externen Werkzeugen geprüft'],
  ] as const).map(([field,label])=><label key={field} style={{display:'block'}}>
   <input type="checkbox" checked={releaseEvidenceV553[field]} onChange={e=>updateReleaseV553({[field]:e.target.checked})}/>{' '}{label}
  </label>)}
  {releaseV553.blockers.length>0&&<ul>{releaseV553.blockers.map(blocker=><li key={blocker}>{blocker}</li>)}</ul>}
  <p><strong>Nachweisgrundlage:</strong> {releaseV553.measuredRuns.length} protokollierte reale Messläufe im aktuellen Bericht · {releaseV553.readiness.reviewedScenes}/3 Szenen manuell geprüft. Für den Raspberry Pi zählt die Bestätigung nur als Bedieneraussage; Hardwaredaten oder Build-Authentizität werden nicht automatisch nachgewiesen.</p>
  <h5>Manuelle Sichtprüfung</h5>
  <p>Diese Punkte müssen während eines echten Konzerts von dir überprüft werden; die FPS-Proben können weder Sängerrollen noch Lippenformen, Tänze oder Textlesbarkeit visuell beurteilen.</p>
  {([['lyricsLegible','Wort-Lyrics auf dem 10-Zoll-Display gut lesbar'],
    ['lipSyncPlausible','Deutschrap-Lip-Sync und Sängerwechsel passend'],
    ['motionNatural','Tänzerbewegungen, Fußkontakt und Formationen natürlich'],
    ['lightReadable','Kamera und Konzertlicht verdecken weder Gesichter noch Text']] as const).map(([field,label])=><label key={field} style={{display:'block'}}>
     <input type="checkbox" checked={audit[field]} onChange={e=>setAudit(v=>({...v,[field]:e.target.checked}))}/> {label}
    </label>)}
  <p role="status">{benchmarkVisualReviewV522(audit)}</p>
  <p>P95/P99 sind <strong>Maxima der pro Sekunde gemessenen Frame-Perzentile</strong>, nicht Perzentile sämtlicher Frames über den Gesamtlauf. JS-Heap ist nur in unterstützten Browsern messbar und entspricht nicht Raspberry-Pi-RAM. Auch GPU-Zeit, Temperatur, echte Audio-/Video-Synchronität und thermisches Throttling bleiben unbekannt. Testläufe sind sitzungsgebunden; Unterbrechungen und Einstellungenwechsel machen den laufenden Test ungültig.</p>
 </section>;
}
