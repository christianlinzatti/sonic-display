'use strict';
/** Human review sheet for two REAL screenshots, generated only after measured capture. */
const escapeHtml=text=>String(text??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const fixed=value=>typeof value==='number'&&Number.isFinite(value)?value.toFixed(2):'—';
function renderVisualReportV590(report){
 if(report?.status!=='measured-needs-human-review'||!Array.isArray(report.screenshots)||!report.screenshots.length)
  throw Error('Cannot produce visual report without actual GLB screenshots.');
 const compare=(report.comparisons||[]).map(row=>{
  const orig=report.screenshots.find(s=>s.file===row.original),next=report.screenshots.find(s=>s.file===row.following);
  if(!orig||!next)throw Error('Screenshot pair is incomplete');
  const image=(shot,label)=>`<div><h3>${escapeHtml(label)} · ${escapeHtml(shot.clipName)} · ${fixed(shot.seconds)} s</h3>
   <a href="${escapeHtml(shot.file)}"><img src="${escapeHtml(shot.file)}" alt="${escapeHtml(label)} GLB bei ${fixed(shot.seconds)} Sekunden"></a>
   <p>Bildausschnitt: <strong>${escapeHtml(shot.framing.status)}</strong> · Meshes im Bild (heuristisch): ${fixed(100*shot.coverage.nonBackgroundFraction)} % · ${shot.drawCalls??'—'} Draw Calls</p></div>`;
  return `<section class="pair"><h2>GLB-Bildvergleich bei ${fixed(row.seconds)} s</h2><div class="twocol">${image(orig,'Original')}${image(next,'Folgeclip')}</div>
   <p>Deutlich geänderte Pixel: <strong>${fixed(100*row.changedPixelFraction)} %</strong> · mittlerer maximaler RGB-Kanaldelta: ${fixed(row.averageMaxChannelDelta)} (Schwelle ${row.threshold})</p></section>`;
 }).join('\n');
 const warnings=(report.warnings||[]).map(msg=>`<li>${escapeHtml(msg)}</li>`).join('');
 const stats=report.frameTiming||{};
 return `<!doctype html><html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
 <title>Sonic Display V590 – reale GLB-Aufnahmen</title><style>
 body{background:#0a1424;color:#f0f4ff;font:15px/1.5 system-ui,sans-serif;margin:0 auto;padding:24px;max-width:1280px}
 header{border-bottom:1px solid #455875;margin-bottom:18px}p,li{color:#cbd8f1}strong{color:#fff}
 .twocol{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:18px}
 img{width:100%;aspect-ratio:16/9;object-fit:contain;border:1px solid #556886;border-radius:6px}
 .pair{border-bottom:1px solid #44546c;padding:20px 0}h1{font-size:24px}h2{font-size:18px}h3{font-size:15px}
 code{color:#91dce5}aside{border-left:2px solid #93a6d6;padding:1px 14px;margin-top:22px}
 </style></head><body><header><h1>Sonic Display V590 – echter GLB-Bildvergleich</h1>
 <p><strong>Keine automatische visuelle Freigabe:</strong> Dies sind technische Aufnahmen einer unabhängigen WebGL-Vorschau, keine komplette Spotify-Konzertshow.</p>
 <p>Modell: <code>${escapeHtml(report.source.model)}</code> · Browsermodus: ${escapeHtml(report.mode)} · ${report.screenshots.length} echte Aufnahmen.</p></header>
 <h2>Browser-Framezeiten</h2><p>rAF: ${fixed(stats.averageFps)} pro Sekunde · p95 ${fixed(stats.p95FrameMs)} ms · p99 ${fixed(stats.p99FrameMs)} ms · ${stats.frames??'—'} Frames · WebGL-Kontextverluste ${stats.contextLosses??'—'}</p>
 ${compare||'<p>Keine vollständigen Vergleichspaare.</p>'}
 ${warnings?`<aside><h2>Prüfhinweise</h2><ul>${warnings}</ul></aside>`:''}
 <aside><h2>Manuelle Sichtabnahme</h2><p>Bitte tatsächlich Fußkontakt, Übergänge, Gelenke, Kamera/Bildausschnitt und längere Songabschnitte überprüfen. Verschiedene Pixel sind kein Qualitätsnachweis; gemessene rAF-Zeiten sind keine GPU-Framezeiten. Aufnahmen und vollständige numerische Ergebnisse sind in <code>report.json</code> dokumentiert.</p></aside></body></html>`;
}
module.exports={renderVisualReportV590,escapeHtml};
