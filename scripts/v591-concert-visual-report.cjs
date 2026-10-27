'use strict';
const {escapeHtml}=require('./v590-visual-report.cjs');
const n=x=>typeof x==='number'&&Number.isFinite(x)?x.toFixed(2):'—';
/** Human review only. No screenshots or FPS may be fabricated. */
function renderV591Report(report){
 if(report?.status!=='measured-needs-human-review'||!Array.isArray(report.screenshots)||report.screenshots.length<2)
  throw Error('Real multiple-GLB concert captures required');
 const rows=report.screenshots.map((shot,i)=>`<article><h2>${escapeHtml(shot.cue.id)} · ${escapeHtml(shot.cue.camera)} · ${escapeHtml(shot.cue.fx)}</h2>
  <a href="${escapeHtml(shot.file)}"><img src="${escapeHtml(shot.file)}" alt="V591 real concert screenshot ${i+1}"></a>
  <p>${escapeHtml(shot.cue.line)} · ${n(shot.cue.at)}s · Performer ${shot.cue.focus+1} · gemessene Avatare ${shot.composition.actorsMeasured}/${report.source.models.length}</p>
  <p>Bildausschnitt: ${escapeHtml(shot.composition.status)} · möglicherweise angeschnitten ${shot.composition.clipped} · mögliche Lyrics-Überschneidung ${shot.composition.lyricIntersections}</p>
  <p>Draw Calls: ${shot.drawCalls} · Dreiecke: ${shot.triangles}</p></article>`).join('\n');
 const diffs=(report.transitions||[]).map(d=>`<li>${escapeHtml(d.from)} → ${escapeHtml(d.to)}: geänderte Pixel ${n(d.changedPixelFraction*100)}% (keine Qualitätswertung)</li>`).join('');
 const warnings=report.warnings.map(w=>`<li>${escapeHtml(w)}</li>`).join('');
 return `<!doctype html><html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
 <title>Sonic V591 · Concert Quality Review</title><style>body{background:#091424;color:#f4f8ff;font:15px/1.5 system-ui,sans-serif;max-width:1250px;margin:auto;padding:20px}
 p,li{color:#bfcfe5}h1{font-size:26px}h2{font-size:17px}.board{display:grid;grid-template-columns:repeat(auto-fit,minmax(350px,1fr));gap:18px}
 article{padding:12px;border:1px solid #3a536a;border-radius:8px;background:#111e32}img{display:block;width:100%;aspect-ratio:16/9;object-fit:contain}
 code{color:#88c8de}section{margin-top:20px;border-top:1px solid #42586e;padding-top:12px}</style></head><body>
 <h1>Sonic V591 · Multi-GLB-Konzert-Prüfung</h1><p><strong>Kein automatisches Qualitätsurteil.</strong> Echte Browser-Screenshots einer unabhängigen Konzert-Review-Szene mit GLB-Tänzern, Text-Overlay, Licht- und Kamera-Cues. Nicht die Spotify-Produktionsshow.</p>
 <p>Modus: ${escapeHtml(report.mode)} · Quellen: ${report.source.models.map(escapeHtml).join(', ')} · Lyrics: ${report.source.script?escapeHtml(report.source.script):'DEMO (keine echten Lyrics)'}</p>
 <p>Browser-rAF ${n(report.frameTiming.averageFps)} pro Sekunde · p95 ${n(report.frameTiming.p95FrameMs)} ms · p99 ${n(report.frameTiming.p99FrameMs)} ms · Cuewechsel während Messung: ${report.frameTiming.cueChanges??0} · Context Loss: ${report.frameTiming.contextLosses}</p>
 <div class="board">${rows}</div><section><h2>Unterschiede zwischen Szenen</h2><ul>${diffs}</ul></section>
 <section><h2>Prüfhinweise</h2><ul>${warnings}</ul></section><section><h2>Manuelle Freigabe erforderlich</h2>
 <p>Bitte echte GLB-Anatomie, Footwork, Lippenbewegung, korrekte Textposition, Fokus im Bild, Beleuchtung, Duettübergänge und Langzeitstabilität beurteilen. rAF misst nicht GPU-/Thermik-Werte. Ausschnitt-Grenzen und Pixeländerungen sind ausschließlich Heuristiken.</p></section>
 </body></html>`;
}
module.exports={renderV591Report};
