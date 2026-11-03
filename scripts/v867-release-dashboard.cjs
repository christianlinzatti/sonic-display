#!/usr/bin/env node
'use strict';
/** V867: offline, fail-closed release dashboard. No credentials, external calls or React dependencies. */
const fs = require('node:fs');
const path = require('node:path');
const ROOT = path.resolve(__dirname, '..');
const REQUIRED = ['check:release', 'typecheck', 'next-build'];
const REQUIRED_OS = ['ubuntu-24.04', 'windows-latest'];
const LABELS = { 'check:release': 'Regressions / Release', typecheck: 'Vollstaendiger TypeScript-Check', 'next-build': 'Next.js Produktionsbuild' };
const HINTS = {
  REACT_TYPES: 'Unvollstaendige React-Testdeklarationen pruefen: npm run check:test-types; danach npm run typecheck.',
  WINDOWS_EOL: 'Zeilenumbrueche in Quelltextvergleichen normalisieren; npm run test:v86513:windows-eol ausfuehren.',
  WINDOWS_PROCESS: 'Windows-Pfad-/CMD-Grenzen pruefen; npm run test:smoke:v665:flat und npm run check:release:flat verwenden.',
  MODULE_CASE: 'Nur nach Gross-/Kleinschreibung oder .ts/.tsx kollidierende Dateien korrigieren: npm run test:module-case.',
  TYPESCRIPT: 'Ersten TypeScript-Fehler korrigieren, danach npm run typecheck erneut ausfuehren.',
  ASSERTION: 'Fehlgeschlagenen Regressionstest separat ausfuehren; Quelltext-/Plattform-Abhaengigkeiten pruefen.',
  DEPENDENCIES: 'Abhaengigkeiten mit npm ci installieren; package-lock.json und Node 22 pruefen.',
  NEXT_BUILD: 'Next.js-Buildausgabe pruefen; npm run typecheck und npm run build:flat lokal ausfuehren.',
  TIMEOUT: 'Timeout oder abgebrochenen Prozess untersuchen; CI-Laufzeit und Ressourcen pruefen.',
  UNKNOWN: 'Ersten fehlgeschlagenen Schritt und dessen Konsolenprotokoll im CI-Lauf untersuchen.'
};
function escapeHtml(input) { return String(input ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
function redact(input) {
  return String(input ?? '')
    .replace(/\x1b\[[0-9;]*m/g, '')
    .replace(/(Authorization:\s*Bearer\s+)[^\s]+/ig, '$1[REDACTED]')
    .replace(/(\b(?:token|password|secret|client_secret|api[_-]?key)\s*[=:]\s*)[^\s,;]+/ig, '$1[REDACTED]')
    .replace(/\b(?:gh[pousr]_[A-Za-z0-9_]{15,}|github_pat_[A-Za-z0-9_]{15,})\b/g, '[REDACTED]')
    .replace(/https?:\/\/[^\s]*[?&](?:token|key|secret)=[^\s&#]+/ig, '[REDACTED_URL]');
}
function classifyFailure(log, stage) {
  const s = String(log || '');
  if (/Module ['"]+react['"]+ has no exported member|Property ['"](?:mesh|group|instancedMesh)['"] does not exist on type ['"]JSX\.IntrinsicElements|not assignable to parameter of type ['"]?(?:Group|Mesh|SpotLight)/i.test(s)) return 'REACT_TYPES';
  if (/V351 must guard the final V848|CRLF|windows.eol|line.ending|\r\n/.test(s)) return 'WINDOWS_EOL';
  if (/ENAMETOOLONG|E2BIG|filename or extension is too long|command line is too long|not recognized as an internal or external command|CreateProcess.*206/i.test(s)) return 'WINDOWS_PROCESS';
  if (/TS1149|TS1261|case collision|differs from already included file name only in casing/i.test(s)) return 'MODULE_CASE';
  if (/TS\d{4}[:\s]/.test(s)) return 'TYPESCRIPT';
  if (/AssertionError|ERR_ASSERTION|\bFAIL\b.*regression/i.test(s)) return 'ASSERTION';
  if (/ETIMEDOUT|ERR_CHILD_PROCESS_STDIO_MAXBUFFER|signal SIGTERM|process timed out/i.test(s)) return 'TIMEOUT';
  if (/npm (?:ERR!|error)|Cannot find module|node_modules.*missing|npm ci erforderlich|could not resolve dependency/i.test(s) || stage === 'dependencies') return 'DEPENDENCIES';
  if (stage === 'next-build') return 'NEXT_BUILD';
  return 'UNKNOWN';
}
function safeRead(file) {
  try { return JSON.parse(fs.readFileSync(file,'utf8')); } catch { return null; }
}
function pickEvidence(log, max = 12) {
  const lines = redact(log).split(/\r?\n/).map(x => x.trim()).filter(Boolean);
  const flagged = lines.filter(s => /error TS\d+|AssertionError|ERR_ASSERTION|\bError:|npm ERR!|not recognized|Failed to compile|V351 must guard/i.test(s));
  return (flagged.length ? flagged : lines.slice(-8)).slice(-max).map(x => x.slice(0, 280));
}
function buildPlatformReport({gate, readiness, log = '', platform = process.platform, exitCode = null, now = new Date()}) {
  const stages = REQUIRED.map(name => {
    const stage = gate?.stages?.find(s => s.name === name);
    return {name, title: LABELS[name], status: stage?.status === 'passed' ? 'passed' : stage?.status === 'failed' ? 'failed' : 'not-run',
      durationMs: Number.isFinite(stage?.durationMs) ? stage.durationMs : null, exitCode: Number.isInteger(stage?.exitCode) ? stage.exitCode : null};
  });
  const blockers = Array.isArray(readiness?.checks) ? readiness.checks.filter(x => x.status !== 'passed').map(x => ({name:String(x.name||''),detail:String(x.detail||'')})) : [];
  const failed = stages.find(x => x.status === 'failed');
  const gatePassed = gate?.status === 'technical-gates-passed' && readiness?.readyForBuild === true && stages.every(s => s.status === 'passed') && (exitCode === null || exitCode === 0);
  const firstBlock = failed?.name || (blockers.length ? 'dependencies' : (stages.find(x => x.status === 'not-run')?.name || 'unknown'));
  const category = gatePassed ? null : classifyFailure(log, firstBlock);
  return {schemaVersion:1,version:'V867',generatedAt:now.toISOString(),platform:String(platform),projectVersion:gate?.projectVersion||readiness?.projectVersion||null,
    status:gatePassed?'technical-gates-passed':'blocked',technicalGatesPassed:gatePassed,productionReleased:false,readyForBuild:readiness?.readyForBuild===true,
    stages,blockers,diagnosis:gatePassed?null:{stage:firstBlock,category,advice:HINTS[category],evidence:pickEvidence(log)},
    pendingManualAcceptance:['9 reale Concert-Runs (Rap / Hardtekk / Rock, je 1/2/4 echte GLB-Avatare)','Manuelle Lyrics-, Lip-Sync- und Kamera-Abnahme','Browser-, GPU- und Hardware-Abnahme']};
}
function aggregateReports(platformReports, now = new Date()) {
  const perPlatform = REQUIRED_OS.map(os => {
    const candidate = platformReports.find(r => r && r.platform === os && r.schemaVersion === 1);
    return candidate && Array.isArray(candidate.stages) && Array.isArray(candidate.blockers) && (!candidate.diagnosis || (Array.isArray(candidate.diagnosis.evidence) && typeof candidate.diagnosis.category==='string' && typeof candidate.diagnosis.advice==='string'))
      ? { ...candidate, platform:os, technicalGatesPassed:candidate.technicalGatesPassed===true && candidate.readyForBuild===true && candidate.status==='technical-gates-passed' && REQUIRED.every(name=>candidate.stages?.some(s=>s.name===name&&s.status==='passed')),
      productionReleased:false} : buildPlatformReport({platform:os,now});
  });
  const versions = perPlatform.map(r=>r.projectVersion);
  const matchingVersions = versions.every(v=>typeof v==='string'&&v.length>0&&v===versions[0]);
  const green = matchingVersions && perPlatform.every(r=>r.technicalGatesPassed);
  return {schemaVersion:1,version:'V867',generatedAt:now.toISOString(),status:green?'technical-gates-passed':'blocked',
    technicalGatesPassed:green,productionReleased:false,platforms:perPlatform,matchingVersions};
}
function renderDashboard(report) {
  const rows = (report.platforms || [report]).map(p => {
    const stageCells = p.stages.map(s => `<td class="${s.status}">${escapeHtml(s.status)}${s.durationMs===null?'':`<small>${(s.durationMs/1000).toFixed(1)} s</small>`}</td>`).join('');
    const cause = p.diagnosis ? `<strong>${escapeHtml(p.diagnosis.category)}</strong><p>${escapeHtml(p.diagnosis.advice)}</p>${p.blockers.length?`<p>Blocker: ${escapeHtml(p.blockers.map(x=>x.name+': '+x.detail).join('; '))}</p>`:''}${p.diagnosis.evidence.length?`<details><summary>Fehlerauszug (gekürzt)</summary><pre>${escapeHtml(p.diagnosis.evidence.join('\n'))}</pre></details>`:''}` : 'Keine technischen Gate-Fehler';
    return `<tr><th scope="row">${escapeHtml(p.platform)}</th>${stageCells}<td>${escapeHtml(p.technicalGatesPassed?'Technische Checks bestanden':'Blockiert')}</td></tr><tr class="details"><td colspan="${p.stages.length+2}">${cause}</td></tr>`;
  }).join('\n');
  return `<!doctype html><html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Sonic Display V867 – Release-Dashboard</title><style>
:root{color-scheme:dark;--bg:#0b1424;--panel:#152438;--fg:#f2f6ff;--muted:#b7c8dd;--line:#34465d;--good:#75d4a4;--bad:#ffaaa0}body{margin:0;background:var(--bg);color:var(--fg);font:16px/1.55 system-ui,sans-serif}main{max-width:1060px;margin:auto;padding:28px 20px 55px}h1{font-size:clamp(1.6rem,4vw,2.6rem);margin:0}.eyebrow,small,.muted{color:var(--muted)}.lead{font-size:1.1rem}section{background:var(--panel);border:1px solid var(--line);border-radius:14px;padding:18px 22px;margin-top:22px}table{border-collapse:collapse;width:100%;min-width:680px}th,td{padding:13px;border-bottom:1px solid var(--line);text-align:left;vertical-align:top}thead{color:var(--muted)}.scroll{overflow-x:auto}.passed{color:var(--good)}.failed,.not-run{color:var(--bad)}td small{display:block}tr.details td{font-size:.93rem;color:var(--muted)}pre{white-space:pre-wrap;overflow-wrap:anywhere;background:#071322;padding:12px;border-radius:8px}p{margin:.6em 0}summary{cursor:pointer;color:var(--fg)}.status{font-size:1.4rem;font-weight:700;color:${report.technicalGatesPassed?'var(--good)':'var(--bad)'}}a{color:#9dd8ff}</style></head><body><main>
<div class="eyebrow">SONIC DISPLAY / V867</div><h1>Release-Dashboard</h1><p class="muted">Erstellt: ${escapeHtml(report.generatedAt)} · Projekt ${escapeHtml(report.projectVersion||report.platforms?.[0]?.projectVersion||'unbekannt')}</p>
<section><div class="status">${escapeHtml(report.technicalGatesPassed?'Technische Gates bestanden':'Technische Freigabe blockiert / nicht nachgewiesen')}</div><p class="lead">Produktionsfreigabe: <strong>NEIN</strong>. Auch bestandene Tests ersetzen keine reale Konzert-, Browser- oder GPU-Abnahme.</p></section>
<section><h2>Prüfungen je Plattform</h2><div class="scroll"><table><thead><tr><th>Betriebssystem</th>${REQUIRED.map(n=>`<th>${escapeHtml(LABELS[n])}</th>`).join('')}<th>Ergebnis</th></tr></thead><tbody>${rows}</tbody></table></div></section>
<section><h2>Offene manuelle Abnahmen</h2><ul><li>9 reale Konzerte: Deutschrap, Hardtekk, Rock mit je 1/2/4 echten GLB-Avataren</li><li>Lyrics, Lip-Sync, Kamera und Show-Abnahme</li><li>Browser-, GPU- und Hardwaretest</li></ul><p class="muted">Statische Offline-Datei. Keine Verbindung zu GitHub oder Spotify; keine eingebetteten Zugangsdaten.</p></section></main></body></html>`;
}
function writeReport(report, root = ROOT, prefix = 'v867-release-dashboard') {
  fs.mkdirSync(root,{recursive:true});
  const json = path.join(root,`${prefix}.json`), html=path.join(root,`${prefix}.html`);
  fs.writeFileSync(json,JSON.stringify(report,null,2)+'\n');
  fs.writeFileSync(html,renderDashboard(report));
  return {json,html};
}
function loadPlatformReports(dir) {
  const reports = [];
  if(!fs.existsSync(dir)) return reports;
  function visit(current,depth){if(depth>4)return;for(const e of fs.readdirSync(current,{withFileTypes:true})){const full=path.join(current,e.name);if(e.isDirectory())visit(full,depth+1);else if(e.isFile()&&e.name==='v867-release-dashboard.json'){const report=safeRead(full);if(report?.platform)reports.push(report);}}}
  visit(dir,0);return reports;
}
function main(args) {
  const osFlag=args.indexOf('--platform'); const platform=osFlag<0?process.platform:args[osFlag+1];
  if(osFlag>=0&&(!platform||platform.startsWith('--'))) throw Error('--platform benoetigt einen Plattformnamen');
  if(args.includes('--aggregate')){
    const inputFlag=args.indexOf('--input');const input=inputFlag>=0?args[inputFlag+1]:path.join(ROOT,'v867-artifacts');
    if(!input||input.startsWith('--'))throw Error('--input benoetigt ein Verzeichnis');
    const result=aggregateReports(loadPlatformReports(input));writeReport(result,ROOT,'v867-release-matrix');
    console.log('V867: Matrix-Dashboard:',result.status,'Windows + Linux');return 0;
  }
  if(args.some((x,i)=>x.startsWith('--')&&!['--from-report','--platform'].includes(x)))throw Error('Nur --from-report, --platform, --aggregate und --input erlaubt');
  const gate=safeRead(path.join(ROOT,'v831-production-gate-result.json'));
  const readiness=gate?.readiness||safeRead(path.join(ROOT,'v831-build-readiness-result.json'));
  const report=buildPlatformReport({gate,readiness,platform});writeReport(report);
  console.log('V867: Release-Dashboard:',report.status,'fuer',report.platform,'(kein Produktionsrelease)');return 0;
}
if(require.main===module){try{process.exitCode=main(process.argv.slice(2));}catch(e){console.error('V867 Dashboard:',e.message);process.exitCode=1;}}
module.exports={REQUIRED,REQUIRED_OS,HINTS,escapeHtml,redact,classifyFailure,pickEvidence,buildPlatformReport,aggregateReports,renderDashboard,writeReport,loadPlatformReports,main};
