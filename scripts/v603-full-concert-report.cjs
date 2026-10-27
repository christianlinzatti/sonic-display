'use strict';
/** Static, fully escaped review page. Images are locally copied validated PNG names only. */
const {escapeHtml:h}=require('./v590-visual-report.cjs');
const shown=(x)=>Number.isFinite(x)?x.toLocaleString('de-DE'):'unbekannt';
const clock=(x)=>Number.isFinite(x)?`${(x/1000).toFixed(1)} s`:'unbekannt';
function renderV603Report(result,images=[]){
 if(result?.format!=='sonic-v603-full-concert-review'||result.status==='blocked'||result.approved!==false||result.humanReviewRequired!==true)throw Error('Only measured, manual-review V603 reports allowed');
 const goodName=x=>typeof x==='string'&&/^images\/run-(?:[1-9]|1[0-6])-live-\d{2}\.png$/.test(x);
 const indexed=new Map(images.map(x=>[`${x.run}:${x.index}`,x]));
 const sections=result.sections.map(x=>`<tr><th>${h(x.name)}</th><td>${shown(x.frames)} Aufnahme(n)</td><td>${x.frames?'Belegt durch Stage-Cue, keine Künstlerfreigabe':'Nicht belegt'}</td></tr>`).join('');
 const warnings=result.repeatedWarnings.map(x=>`<li>${h(x.name)}: ${shown(x.observedFrames)} Aufnahmen – Sichtprüfung</li>`).join('');
 const gaps=result.coverage.gaps.map(x=>`<li>${clock(x.startMs)} – ${clock(x.endMs)} (${clock(x.durationMs)})</li>`).join('');
 const points=result.captures.map(c=>{const img=indexed.get(`${c.run}:${c.index}`),ref=img?.name;
  return `<article><h3>${clock(c.progressMs)} · Run ${shown(c.run)} / Bild ${shown(c.index)}</h3><p>Abschnitt: ${h(c.section||'nicht klassifiziert')} · Kamera-Cue: ${h(c.cue?.shot||'nicht belegt')} · GLB: ${shown(c.actors)} · Draw Calls: ${shown(c.drawCalls)}</p>
   ${goodName(ref)?`<img loading="lazy" alt="Echte Konzertaufnahme Run ${c.run} Bild ${c.index}" src="${ref}">`:'<p>Original-PNG fehlt oder ist ungültig; kein visueller Beleg.</p>'}
   ${Object.values(c.warnings).some(Boolean)?`<p>Heuristische Hinweise: ${h(Object.entries(c.warnings).filter(([,v])=>v).map(([k])=>k).join(', '))}</p>`:''}</article>`;}).join('');
 const metrics=result.browserMetrics.map(x=>`<tr><td>${x.run}</td><td>${shown(x.rafPerSecond)}</td><td>${shown(x.p95FrameMs)} ms</td><td>${shown(x.p99FrameMs)} ms</td></tr>`).join('');
 const matrix=result.evidenceMatrix.map(x=>`<tr><th>${h(x.area)}</th><td>${x.observed?'Messhinweise vorhanden':'Nicht belegt'}</td><td>${h(x.note)}</td></tr>`).join('');
 return `<!doctype html><html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Sonic Display V603 – Gesamtshow-Prüfung</title><style>
 body{background:#0b1425;color:#edf5ff;font:15px/1.55 system-ui;margin:0 auto;padding:20px;max-width:1300px}h1{font-size:26px}h2{font-size:20px}h3{font-size:16px}
 p,li,td{color:#d2dcee}section,article{border:1px solid #45546e;border-radius:12px;background:#18253d;padding:16px;margin:16px 0}
 table{border-collapse:collapse;width:100%}th,td{text-align:left;padding:9px;border-bottom:1px solid #4c5b75;vertical-align:top}img{display:block;width:100%;height:auto;border-radius:6px}
 .grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(290px,1fr));gap:14px}.grid article{margin:0;min-width:0}strong{color:white}</style></head><body>
 <h1>V603 – Gesamte Konzertshow</h1><p><strong>Manuelle Abnahme unbedingt erforderlich.</strong> Keine automatische visuelle Freigabe, kein behaupteter Raspberry-Pi-Leistungsgewinn.</p>
 <section><h2>Songabdeckung</h2><p>${shown(result.runCount)} echte Messläufe, ${shown(result.counts.captures)} Standbilder · Gesamtdauer: ${clock(result.trackDurationMs)} · belegte zusammenhängende Abschnitte: ${clock(result.coverage.measuredWindowMs)} · ${result.coverage.ratio===null?'Anteil unbekannt':`${(100*result.coverage.ratio).toFixed(1)} %`}</p>
 <p>Track-Prüfhash: ${h(result.trackHash)} · Bericht: ${h(result.status)} · ${h(result.coverage.note)}</p>
 <h3>Ungemessene Zeiträume</h3>${gaps?`<ul>${gaps}</ul>`:'<p>Keine Lücken berechenbar; fehlende Trackdauer ist keine Vollabdeckung.</p>'}</section>
 <section><h2>Regie-Abschnitte</h2><table>${sections}</table><p>${shown(result.counts.unclassified)} Bilder ohne belegten Abschnitt. Abschnittslabels sind UI-Hinweise, keine Audio-Erkennung.</p></section>
 <section><h2>Gesamtqualität – was die Daten tatsächlich belegen</h2><table>${matrix}</table></section>
 <section><h2>Wiederkehrende Bildhinweise</h2>${warnings?`<ul>${warnings}</ul>`:'<p>Keine mindestens zweimal erkannten Hinweise – keine automatische Freigabe.</p>'}
 ${result.cameraRepeats.length?`<h3>Wiederkehrende Kamera-Cues</h3><ul>${result.cameraRepeats.map(x=>`<li>${h(x.shot)}: ${shown(x.count)} aufeinanderfolgende Sichtpunkte (${clock(x.startMs)} – ${clock(x.endMs)}). Kann ein gewolltes Motiv sein.</li>`).join('')}</ul>`:''}
 ${result.warningNotes.length?`<ul>${result.warningNotes.map(w=>`<li>${h(w)}</li>`).join('')}</ul>`:''}</section>
 <section><h2>Browser-rAF (keine Pi-/GPU-Messung)</h2><table><tr><th>Lauf</th><th>rAF/s</th><th>p95</th><th>p99</th></tr>${metrics}</table></section>
 <section><h2>Manuelle Konzert-Abnahme</h2><ol>${result.manualReview.map(x=>`<li>${h(x)}</li>`).join('')}</ol></section>
 <h2>Echte Bildaufnahmen entlang der Songzeit</h2><div class="grid">${points}</div>
 <section><h2>Grenzen</h2><ul>${result.limitations.map(x=>`<li>${h(x)}</li>`).join('')}</ul></section>
 </body></html>`;
}
module.exports={renderV603Report};
