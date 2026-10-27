'use strict';
const {escapeHtml}=require('./v590-visual-report.cjs');
const h=x=>escapeHtml(String(x??''));
const n=x=>Number.isFinite(x)?Number(x).toFixed(2):'—';
function safeImageRef(value){return typeof value==='string'&&/^\.\.?\/[a-zA-Z0-9_./%\-]+\.png$/.test(value)&&!value.includes('..//')?value:null;}
function renderV595Report(result,pairs){
 if(result?.format!=='sonic-v595-live-visual-regression'||result.status!=='review-required'||result.approved!==false||result.reviewRequired!==true)
  throw Error('Only human-review-gated real V595 reports are supported');
 const status=(g)=>`${g.observations} Zeitpunkte · ${g.flagged} mit Hinweisen · ${g.status}`;
 const section=result.groups.map(g=>`<tr><th>${h(g.kind)}</th><td>${h(status(g))}</td></tr>`).join('');
 const items=pairs.map(({checkpoint:c,baselineUrl, candidateUrl})=>`<article><h3>${h(c.kind||'Ohne bestätigten Szenen-Cue')} · ${n(c.progressMs/1000)} s</h3><p>${h(c.source)} · Versatz ${n(c.offsetMs)} ms</p>
  <div class="pair"><figure>${safeImageRef(baselineUrl)?`<img loading="lazy" alt="Baseline-Konzertaufnahme" src="${h(baselineUrl)}">`:'<p>Baseline-Bild fehlt</p>'}<figcaption>Basis</figcaption></figure><figure>${safeImageRef(candidateUrl)?`<img loading="lazy" alt="Folgeaufnahme" src="${h(candidateUrl)}">`:'<p>Folge-Bild fehlt</p>'}<figcaption>Kandidat</figcaption></figure></div>
  <p>Bewegungsmaskierter Pixelvergleich: ${h(c.pixelEvidence.status)}${Number.isFinite(c.pixelEvidence.changedFraction)?` · ${n(100*c.pixelEvidence.changedFraction)} % der unmaskierten Pixel`:''}</p>
  ${c.issues.length?`<ul>${c.issues.map(issue=>`<li>${h(issue.id)}: ${h(issue.note)}</li>`).join('')}</ul>`:'<p>Keine neue heuristische Warnung an dieser Songstelle. Keine automatische Bildfreigabe.</p>'}</article>`).join('');
 return `<!doctype html><html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>V595 Live Visual Regression</title><style>body{max-width:1250px;margin:20px auto;padding:0 16px;background:#0c1525;color:#e9f4ff;font:15px/1.55 system-ui}h1{font-size:26px}h2{font-size:20px}p,li{color:#cbd5e1}section,article{padding:16px;margin:18px 0;background:#16233b;border:1px solid #45516d;border-radius:12px}table{border-collapse:collapse}td,th{padding:9px 14px;border-bottom:1px solid #52607b;text-align:left}figure{margin:0;min-width:0}img{width:100%;display:block}.pair{display:grid;grid-template-columns:1fr 1fr;gap:12px}@media(max-width:700px){.pair{grid-template-columns:1fr}}</style></head><body>
 <h1>Sonic V595 – Live Visual Regression</h1><p><strong>Manuelle Abnahme erforderlich.</strong> Keine automatische Freigabe. Normaler Tanz, Lip-Sync, Lichtwechsel und bewegte Lyrics dürfen Unterschiede erzeugen.</p>
 <section><h2>Szenenabdeckung</h2><table>${section}</table><p>${h(result.unclassified)} nicht klassifizierte Aufnahmen · Fehlende Szenen gelten niemals als bestanden.</p></section>
 <section><h2>Wiederkehrende Auffälligkeiten</h2>${result.repeatedWarnings.length?`<ul>${result.repeatedWarnings.map(w=>`<li>${h(w.id)}: ${h(w.observedFrames)} Messzeitpunkte (Sichtprüfung)</li>`).join('')}</ul>`:'<p>Keine wiederholten heuristischen Änderungen; die visuelle Abnahme bleibt trotzdem offen.</p>'}</section>
 <section><h2>Browser-Framezeiten</h2><p>Basis ${n(result.baselineFps)} rAF/s · Kandidat ${n(result.candidateFps)} rAF/s. Keine belegte GPU- oder Raspberry-Pi-Messung.</p></section>
 <h2>Zeitlich ausgerichtete Screenshots</h2>${items}
 <p>${result.limitations.map(h).join(' ')}</p></body></html>`;
}
module.exports={renderV595Report,safeImageRef};
