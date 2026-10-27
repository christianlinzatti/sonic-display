'use strict';
/** V594 local two-run comparison; escaped, static HTML with provenance and human-review guard. */
const {escapeHtml}=require('./v590-visual-report.cjs');
const h=x=>escapeHtml(String(x??''));
const n=x=>Number.isFinite(x)?Number(x).toFixed(2):'—';
function renderV594Comparison(report,images){
 if(!['comparable-needs-human-review','limited-needs-human-review'].includes(report?.status)||report.autoApplied!==false||!report.humanReviewRequired)
  throw Error('Only measured and human-review gated comparisons can be displayed');
 const row=(label,v)=>`<tr><th>${h(label)}</th><td>${h(v)}</td></tr>`;
 const metrics=report.metrics.map(m=>`<tr><th>${h(m.name)}</th><td>${n(m.before)} ${h(m.unit)}</td><td>${n(m.after)} ${h(m.unit)}</td><td>${n(m.delta)}</td><td>${h(m.assessment)}</td></tr>`).join('');
 const flags=report.warningCounts.map(x=>`<tr><th>${h(x.name)}</th><td>${h(x.before)}</td><td>${h(x.after)}</td><td>${h(x.assessment)}</td></tr>`).join('');
 const paired=images.map(p=>`<article><h3>Songstelle ${n(p.beforeProgressMs/1000)} s · Abstand ${n(p.deltaMs)} ms</h3><div class="pair"><figure>${p.beforeUrl?`<img src="${h(p.beforeUrl)}" alt="Vorher GLB-Liveszene">`:'<p>Originalbild fehlt</p>'}<figcaption>Vorher</figcaption></figure><figure>${p.afterUrl?`<img src="${h(p.afterUrl)}" alt="Nachher GLB-Liveszene">`:'<p>Vergleichsbild fehlt</p>'}<figcaption>Nachher</figcaption></figure></div>
  <p>Pixelprüfung: ${h(p.pixelStatus)}${Number.isFinite(p.changedPixelFraction)?` · ${n(100*p.changedPixelFraction)} % geänderte Pixel`:''}. Kein Qualitätsurteil.</p></article>`).join('');
 return `<!doctype html><html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Sonic V594 · Concert Quality Comparison</title>
 <style>body{margin:22px auto;padding:0 18px;max-width:1240px;background:#091324;color:#eff6ff;font:15px/1.55 system-ui}h1{font-size:28px}h2{font-size:20px}p,li{color:#cbd7ea}article,section{padding:16px;margin:18px 0;border:1px solid #43536b;border-radius:12px;background:#14233c}table{width:100%;border-collapse:collapse;display:block;overflow-x:auto}td,th{padding:10px 12px;border-bottom:1px solid #37465f;text-align:left;white-space:nowrap}figure{margin:0;min-width:0}figcaption{padding:4px}img{display:block;width:100%;height:auto}.pair{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}@media(max-width:720px){.pair{grid-template-columns:1fr}}</style></head><body>
 <h1>Sonic Display V594 · Vorher / Nachher</h1><p><strong>Messbericht mit manueller Sichtprüfung – keine automatische Freigabe.</strong> Status: ${h(report.status)}.</p>
 <section><h2>Vergleichbarkeit</h2><table>${row('Gleicher Track','ja (ID nur im lokalen Quellbericht)')}${row('Gleiche Auflösung',report.prerequisites.sameScreen)}${row('Gleiche Browser-/WebGL-Konfiguration',report.prerequisites.sameBrowser)}${row('Gleiche GLB-Anzahl',report.prerequisites.sameCount)}${row('Gleicher Browsermodus',report.prerequisites.sameMode)}${row('Überlappung',`${n(report.prerequisites.overlapMs)} ms`)}${row('Zeitlich gepaarte Bilder',report.prerequisites.alignedCaptureCount)}</table>
 ${report.limitations.length?`<ul>${report.limitations.map(x=>`<li>${h(x)}</li>`).join('')}</ul>`:''}</section>
 <section><h2>Browser-Messwerte</h2><table><thead><tr><th>Messgröße</th><th>Vorher</th><th>Nachher</th><th>Differenz</th><th>Einordnung</th></tr></thead><tbody>${metrics}</tbody></table>
 <p>FPS/rAF ist nicht identisch mit GPU-Zeit. Ein besserer Messwert beweist noch nicht, dass eine konkrete Show-Einstellung die Ursache ist.</p></section>
 <section><h2>Heuristische Bildwarnungen</h2><table><thead><tr><th>Hinweis</th><th>Vorher</th><th>Nachher</th><th>Einordnung</th></tr></thead><tbody>${flags}</tbody></table>
 <p>Unterschiedliche Aufnahmezahlen verhindern einen direkten Vergleich der absoluten Warnungszahlen.</p></section>
 <section><h2>Ausgerichtete Bildpaare</h2><p>Aufnahmen wurden nur für denselben Track und nahe Songpositionen gepaart. Änderungen einzelner Pixel sind weder automatisch gut noch schlecht.</p>${paired||'<p>Keine zuverlässig gepaarten Aufnahmen.</p>'}</section>
 <p>V594 nimmt keine Änderungen an Avataren, Kamera, Lyrics, Spotify oder Stage FX vor. Für eine echte Abnahme bitte Original- und Folgeaufnahmen samt Bewegungsqualität manuell vergleichen.</p></body></html>`;
}
function renderV594History(history){
 if(history?.format!=='sonic-v594-comparison-history'||!Array.isArray(history.entries))throw Error('Invalid V594 history');
 const entries=history.entries.slice().reverse().map(x=>{const safe=typeof x.report==='string'&&!x.report.startsWith('/')&&/^[a-zA-Z0-9_.%/-]+\.html$/.test(x.report);
 return `<tr><td>${safe?`<a href="${h(x.report)}">${h(x.key)}</a>`:h(x.key)}</td><td>${h(x.status)}</td><td>${n(x.baselineFps)}</td><td>${n(x.candidateFps)}</td><td>${h(x.capturedAtBefore)}</td><td>${h(x.capturedAtAfter)}</td></tr>`;}).join('');
 return `<!doctype html><html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Sonic V594 · Vergleichshistorie</title><style>body{max-width:1100px;margin:26px auto;padding:0 16px;background:#091324;color:#ecf4ff;font:15px/1.55 system-ui}table{width:100%;border-collapse:collapse;display:block;overflow:auto}td,th{padding:10px;border-bottom:1px solid #44546a;text-align:left;white-space:nowrap}a{color:#93c5fd}p{color:#cbd5e1}</style></head><body><h1>V594 · Konzert-Optimierungsverlauf</h1><p>Nur lokal aufgezeichnete Vergleiche. Die Werte sind Browser-rAF, keine garantierten FPS-Gewinne oder manuelle visuelle Freigabe. Nicht vergleichbare Durchläufe bleiben markiert.</p><table><thead><tr><th>Bericht</th><th>Status</th><th>FPS vorher</th><th>FPS nachher</th><th>Vorher aufgenommen</th><th>Nachher aufgenommen</th></tr></thead><tbody>${entries}</tbody></table><p>Die originale Live-Show, Spotify, Kameraeinstellungen, Lyrics und GLB-Animationen bleiben unverändert.</p></body></html>`;
}
module.exports={renderV594Comparison,renderV594History};
