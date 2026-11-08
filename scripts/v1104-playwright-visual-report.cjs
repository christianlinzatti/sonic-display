#!/usr/bin/env node
'use strict';
/** V1104: offline screenshot gallery from real Playwright JSON attachments. */
const fs = require('node:fs');
const path = require('node:path');
const { createHash } = require('node:crypto');
const DEFAULT_ROOT = path.resolve(__dirname, '..');
const escapeHtml = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const safePart = value => String(value || 'unknown').replace(/[^A-Za-z0-9_-]/g, '-').slice(0, 55) || 'unknown';
function buildVisualReport(root = DEFAULT_ROOT, data) {
  const directory = path.join(root, 'reports/playwright-production');
  const result = data || JSON.parse(fs.readFileSync(path.join(directory, 'results.json'), 'utf8'));
  const out = path.join(directory, 'visual-gallery');
  fs.rmSync(out, { recursive: true, force: true });
  fs.mkdirSync(path.join(out, 'screenshots'), { recursive: true });
  const entries = [], projects = new Set();
  const allowed = path.resolve(directory) + path.sep;
  function readAttachment(att) {
    if (!/^image\/(jpeg|png)$/.test(att.contentType || '')) return null;
    if (typeof att.path === 'string') {
      const resolved = path.resolve(root, att.path);
      // Only screenshots produced in this run's own test-results directory.
      if (!resolved.startsWith(allowed) || !fs.existsSync(resolved)) return null;
      const target = fs.realpathSync(resolved);
      if (!target.startsWith(allowed)) return null;
      return fs.readFileSync(target);
    }
    if (typeof att.body === 'string' && /^[A-Za-z0-9+/]*={0,2}$/.test(att.body)) {
      return Buffer.from(att.body, 'base64');
    }
    return null;
  }
  function walk(suites) {
    for (const suite of suites || []) {
      for (const spec of suite.specs || []) {
        for (const t of spec.tests || []) {
          const project = t.projectName || 'unknown';
          for (const run of t.results || []) {
            for (const att of run.attachments || []) {
              if (!/screenshot|avatar|reference-glb|^v1104-/i.test(att.name || '')) continue;
              const bytes = readAttachment(att);
              if (!bytes || bytes.length < 4) continue;
              const png = att.contentType === 'image/png';
              // Validate file magic before publishing any untrusted attachments as images.
              if (png ? !bytes.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10]))
                      : !(bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255)) continue;
              const basename = `${String(entries.length+1).padStart(3,'0')}-${safePart(project)}-${createHash('sha256').update(bytes).digest('hex').slice(0,12)}.${png?'png':'jpg'}`;
              fs.writeFileSync(path.join(out, 'screenshots', basename), bytes);
              projects.add(project);
              entries.push({ project, test: spec.title || 'Untitled test', status: run.status || 'unknown',
                name: att.name, image: 'screenshots/' + basename, bytes: bytes.length });
            }
          }
        }
      }
      walk(suite.suites);
    }
  }
  walk(result.suites);
  const cards = entries.map(e => `<article><a href="${escapeHtml(e.image)}"><img loading="lazy" src="${escapeHtml(e.image)}" alt="${escapeHtml(e.test)}"></a><div class="details"><strong>${escapeHtml(e.test)}</strong><small>${escapeHtml(e.project)} · ${escapeHtml(e.status)} · ${escapeHtml(e.name)}</small></div></article>`).join('\n');
  const html = `<!doctype html><html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Sonic Display · Playwright Screenshots</title><style>body{font-family:system-ui,-apple-system,sans-serif;background:#0e1421;color:#f4f7fc;margin:0;padding:clamp(18px,4vw,48px)}header{max-width:1000px;margin:auto auto 30px}h1{font-size:clamp(24px,4vw,36px);margin:0 0 10px}p{color:#afc0d3}main{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,320px),1fr));gap:18px;max-width:1600px;margin:auto}article{background:#1b2737;border:1px solid #344459;border-radius:14px;overflow:hidden}img{width:100%;max-height:440px;object-fit:contain;display:block;background:#10151f}.details{padding:14px;display:grid;gap:8px}.details strong{font-size:14px}.details small{font-size:12px;color:#bdd0e4;overflow-wrap:anywhere}a:focus-visible{outline:3px solid #b1d7ff}</style></head><body><header><h1>Sonic Display · Playwright Bildbericht</h1><p>${entries.length} echte Screenshots aus Desktop-/Touch-Tests. Für Details, Fehlermeldungen und Traces den enthaltenen Playwright-HTML-Bericht öffnen. Bilder sind nur Ergebnisse der Tests, keine Screenshots eines echten Konzertabends.</p></header><main>${cards || '<p>Keine Screenshots vorhanden. Kein erfolgreicher visueller Testnachweis.</p>'}</main></body></html>`;
  fs.writeFileSync(path.join(out, 'index.html'), html);
  const manifest = { schema:'sonic-visual-report-v1104', screenshotCount:entries.length,
    projects:[...projects].sort(), screenshots:entries, html:'visual-gallery/index.html' };
  fs.writeFileSync(path.join(out, 'manifest.json'), JSON.stringify(manifest, null, 2)+'\n');
  return manifest;
}
if (require.main === module) {
  try { const result = buildVisualReport(); console.log('V1104 visual gallery: '+result.screenshotCount+' screenshots, '+result.projects.join(', '));
    if (!result.screenshotCount) process.exitCode=1; }
  catch(error){console.error(error);process.exitCode=1;}
}
module.exports = {buildVisualReport, escapeHtml};
