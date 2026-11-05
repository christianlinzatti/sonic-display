#!/usr/bin/env node
'use strict';
// V880 Hotfix 3: restore the missing Last.fm Personal Insights navigation link.
// This is a surgical, repeatable edit; other user changes are preserved.
const fs = require('node:fs');
const path = require('node:path');

const root = __dirname;
const pkgPath = path.join(root, 'package.json');
const file = path.join(root, 'components', 'LastFmHistoryPanelV706.tsx');
const oldAnchor = '<a href="#lastfm-artist-dashboard-v721">Artist Dashboard ↓</a>';
const newAnchor = '<a href="#lastfm-personal-insights-v722">Personal Insights ↓</a>';
const marker = 'href="#lastfm-personal-insights-v722"';

function main() {
  if (!fs.existsSync(pkgPath) || !fs.existsSync(file)) {
    throw new Error('Bitte das Skript im Root des vollständigen Sonic-Display-V880-Projekts ablegen und starten.');
  }
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  if (pkg.version !== '0.1.0-v880') {
    throw new Error(`V880 erwartet (gefunden: ${pkg.version ?? 'unbekannt'}). Keine Datei geändert.`);
  }
  const original = fs.readFileSync(file, 'utf8');
  if (original.includes(marker)) {
    console.log('V880 Hotfix 3 ist bereits installiert; keine Änderung erforderlich.');
    return;
  }
  if (!original.includes('id="lastfm-personal-insights-v722"')) {
    // The dashboard is a separately imported component; check its anchored section.
    const dashboardPath = path.join(root, 'components', 'LastFmPersonalInsightsDashboardV722.tsx');
    const dashboard = fs.existsSync(dashboardPath) ? fs.readFileSync(dashboardPath, 'utf8') : '';
    if (!dashboard.includes('id="lastfm-personal-insights-v722"')) {
      throw new Error('Personal-Insights-Ziel fehlt; bitte Projektversion prüfen. Keine Datei geändert.');
    }
  }
  const occurrences = original.split(oldAnchor).length - 1;
  if (occurrences !== 1) {
    throw new Error(`Erwarteter Artist-Dashboard-Link nicht eindeutig (${occurrences} Treffer). Keine Datei geändert.`);
  }
  const patched = original.replace(oldAnchor, `${newAnchor}${oldAnchor}`);
  const backupDir = path.join(root, 'backups', 'v880-hotfix3');
  fs.mkdirSync(backupDir, {recursive:true});
  const backupPath = path.join(backupDir, 'LastFmHistoryPanelV706.tsx.bak');
  if (!fs.existsSync(backupPath)) {
    fs.writeFileSync(backupPath, original, {flag:'wx'});
  }
  fs.writeFileSync(file, patched);
  console.log('V880 Hotfix 3 installiert: Personal-Insights-Link wiederhergestellt.');
  console.log('Backup:', path.relative(root, backupPath));
}
try {main();} catch (error) {
  console.error('Hotfix 3 konnte nicht installiert werden:', error.message);
  process.exitCode = 1;
}
