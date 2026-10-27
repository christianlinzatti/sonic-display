'use strict';
/** HTML for genuine V592 screenshots and advisory. No scripts, no mutating UI controls. */
const {escapeHtml}=require('./v590-visual-report.cjs');
const {renderV592Report}=require('./v592-live-stage-report.cjs');
const e=v=>escapeHtml(String(v??''));
function renderV593Report(report,advice){
 if(advice?.status!=='advice-needs-human-review'||advice.autoApplied!==false||report?.status!=='measured-needs-human-review')
  throw Error('No V593 visual report without genuine real-stage measurements');
 const base=renderV592Report(report);
 const recs=advice.recommendations.map(r=>`<article><h3>${e(r.area)} · ${e(r.priority)} · ${e(r.id)}</h3><p>${e(r.reason)}</p>
  <p><strong>Empfehlung:</strong> ${e(r.action)}</p><p><strong>Belege:</strong> ${e(r.evidence.screenshotIndices.join(', '))} von ${e(r.evidence.totalFrames)} aufgenommenen Bildern.</p>
  <p><strong>Schutzregel:</strong> ${e(r.safeguards)}</p><p><small>Nur Empfehlung · nicht angewendet · Sichtprüfung erforderlich.</small></p></article>`).join('');
 const section=`<section id="v593-advice"><h2>V593 · Messbasierte Verbesserungs-Vorschläge</h2>
  <p>Nur wiederholt beobachtete heuristische Auffälligkeiten; keine automatische Änderung an Kamera, Lyrics, GLB-Clips oder gespeicherten Einstellungen. Einträge müssen manuell geprüft werden. Keine automatische visuelle Freigabe.</p>
  <p>GLB-Aufnahmen: ${e(advice.sourceScreenshotCount)} · Nicht messbare Lyrics-Rechtecke: ${e(advice.unmeasurableLyricFrames)}</p>
  ${recs||'<p>Keine ausreichend wiederholten Warnsignale. Das ist <strong>keine</strong> visuelle Qualitätsfreigabe.</p>'}
  <p>Diese Ansicht heißt <code>report-v593.html</code>. Die maschinenlesbaren Vorschläge stehen in <code>advice-v593.json</code>. Nach einer Einstellungskorrektur denselben Live-Benchmark erneut ausführen; FPS-Gewinn oder künstlerische Verbesserung nicht voraussetzen.</p></section>`;
 return base.replace('</body></html>',`${section}</body></html>`)
  .replace('<title>Sonic V592', '<title>Sonic V593 · V592')
  .replace('<h1>Sonic V592', '<h1>Sonic V593 / V592');
}
module.exports={renderV593Report};
