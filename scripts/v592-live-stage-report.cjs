'use strict';
const {escapeHtml}=require('./v590-visual-report.cjs');
const num=x=>Number.isFinite(x)?Number(x).toFixed(2):'—';
function renderV592Report(report){
 if(report?.status!=='measured-needs-human-review'||!Array.isArray(report.screenshots)||report.screenshots.length<2)
  throw Error('At least two genuine live VisualizerStage screenshots required');
 const shots=report.screenshots.map((s,i)=>`<article><h2>Live-Szene ${i+1} · ${num(s.progressMs/1000)} s</h2><a href="${escapeHtml(s.file)}"><img src="${escapeHtml(s.file)}" alt="Live-VisualizerStage Aufnahme ${i+1}"></a>
  <p>GLB-Performer: ${s.actors} · Draw Calls: ${s.drawCalls} · Dreiecke: ${s.triangles} · Lyrics: ${s.lyricsMode} · aktiver Textindex: ${s.activeIndex}</p>
  <p>Warnungen: ${escapeHtml(s.warnings.join('; ')||'keine heuristischen Auffälligkeiten')}</p></article>`).join('');
 const changes=report.transitions.map(x=>`<li>${escapeHtml(x.from)} → ${escapeHtml(x.to)}: ${num(x.changedPixelFraction*100)} % geänderte Pixel</li>`).join('');
 const warnings=report.warnings.map(w=>`<li>${escapeHtml(w)}</li>`).join('');
 return `<!doctype html><html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Sonic V592 · Live Concert Review</title>
 <style>body{background:#0a1426;color:#f2f6ff;font:15px/1.55 system-ui;margin:25px auto;padding:0 20px;max-width:1340px}p,li{color:#c2d0e8}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(400px,1fr));gap:16px}article{padding:14px;background:#14223a;border:1px solid #4a5d77;border-radius:10px}img{width:100%;height:auto}h2{font-size:18px}</style></head><body>
 <h1>Sonic V592 · Echte Livebühne</h1><p><strong>Manuelle visuelle Freigabe erforderlich.</strong> Direkt aus der tatsächlichen Spotify-VisualizerStage aufgenommen, nicht aus einer separaten Testszene. Song läuft während der Aufnahme. Keine automatisch bestätigte Bildqualität.</p>
 <p>Browsermodus: ${escapeHtml(report.mode)} · GLB-Minimum: ${report.minGlb} · Musikfortschritt: ${num(report.progressMs)} ms · rAF: ${num(report.frameTiming.averageFps)}/s · p95: ${num(report.frameTiming.p95FrameMs)} ms · p99: ${num(report.frameTiming.p99FrameMs)} ms · Context Losses: ${report.frameTiming.contextLosses}</p>
 <div class="grid">${shots}</div><section><h2>Bildveränderungen</h2><ul>${changes}</ul></section><section><h2>Warnungen</h2><ul>${warnings}</ul></section>
 <p>Farb- und Pixelmetriken ersetzen keine menschliche Sichtprüfung. rAF ist weder echte GPU-Zeit noch Raspberry-Pi-Temperatur. Fehlende GLB-Darsteller, Spotify-Wiedergabe oder synchronisierte Lyrics werden nicht stillschweigend simuliert.</p></body></html>`;
}
module.exports={renderV592Report};
