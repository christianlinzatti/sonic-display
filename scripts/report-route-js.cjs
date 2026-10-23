/** Inspect Next.js output without claiming transfer sizes from uncompressed build artifacts.
 * Usage: npm run build && node scripts/report-route-js.cjs
 */
const fs = require('node:fs');
const path = require('node:path');
const manifestFile = path.join(process.cwd(), '.next/build-manifest.json');
if (!fs.existsSync(manifestFile)) {
  console.error('Keine .next/build-manifest.json gefunden. Bitte zuerst npm run build ausführen.');
  process.exitCode = 1;
} else {
  const manifest = JSON.parse(fs.readFileSync(manifestFile, 'utf8'));
  const jsFiles = (manifest.pages?.['/'] ?? []).filter(f => f.endsWith('.js'));
  const records = jsFiles.map(file => {
    const abs = path.join(process.cwd(), '.next', file);
    return {file, bytes: fs.existsSync(abs) ? fs.statSync(abs).size : null};
  });
  const total = records.reduce((sum, item) => sum + (item.bytes ?? 0), 0);
  console.log('JS-Chunks für / laut Next.js Build-Manifest (uncompressed, keine First-Load-JS-Metrik):');
  for (const file of records) console.log(`${file.bytes === null ? 'nicht vorhanden' : `${(file.bytes / 1024).toFixed(1)} KiB`}  ${file.file}`);
  console.log(`Gesamt: ${(total / 1024).toFixed(1)} KiB über ${records.length} JS-Chunks`);
  console.log('Für den echten First-Load-Vergleich die "First Load JS"-Angabe von next build verwenden.');
}
