#!/usr/bin/env node
'use strict';

// V865.12: Run versioned npm smoke/release chains without deeply nested npm processes.
// Unlike a shortened smoke suite, this expands every npm-run edge (including repeats)
// in its original order. Each leaf is executed in a fresh shallow npm process.
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const root = path.resolve(__dirname, '..');
const simpleName = /^[A-Za-z0-9_.:+-]+$/;
const nestedRun = /^npm run ([A-Za-z0-9_.:+-]+)$/;

function expandScript(scripts, name, ancestors = []) {
  if (!simpleName.test(name)) throw Error(`Ungültiger npm-Skriptname: ${name}`);
  if (ancestors.includes(name)) {
    throw Error(`Zyklische npm-Skriptkette: ${[...ancestors, name].join(' -> ')}`);
  }
  const command = scripts[name];
  if (typeof command !== 'string' || !command.trim()) {
    throw Error(`Fehlendes oder leeres npm-Skript: ${name}`);
  }
  const steps = command.split(/\s*&&\s*/).map(step => step.trim());
  const nested = steps.map(step => nestedRun.exec(step));
  // Flatten only pure npm-run chains. Other scripts remain actual, unmodified npm leaves.
  if (nested.every(Boolean)) {
    return nested.flatMap(match => expandScript(scripts, match[1], [...ancestors, name]));
  }
  return [name];
}

function cleanPathEnv(environment, platform = process.platform) {
  const env = { ...environment };
  // Windows environment variable names are case-insensitive; the canonical key
  // is Path. The explicit platform argument allows regression testing win32 on CI.
  const delimiter = platform === 'win32' ? ';' : ':';
  const keys = Object.keys(env).filter(k => k.toLowerCase() === 'path');
  if (!keys.length) return env;
  const value = keys.map(k => String(env[k] || '')).join(delimiter);
  const seen = new Set();
  const entries = value.split(delimiter).filter(segment => {
    const normalized = segment.trim().replace(/[\\/]+$/, '').toLowerCase();
    if (!normalized || seen.has(normalized)) return false;
    seen.add(normalized);
    return true;
  });
  for (const key of keys) delete env[key];
  env[platform === 'win32' ? 'Path' : 'PATH'] = entries.join(delimiter);
  return env;
}

function npmLeaf(name, env) {
  // Script names are validated before reaching the shell: no interpolation or user code.
  const cmd = process.platform === 'win32' ? 'cmd.exe' : 'npm';
  const args = process.platform === 'win32'
    ? ['/d', '/c', `npm run ${name}`]
    : ['run', name];
  const result = spawnSync(cmd, args, { cwd: root, stdio: 'inherit', env });
  if (result.error) throw result.error;
  if (result.signal) throw Error(`${name}: Prozess beendet durch ${result.signal}`);
  return result.status === null ? 1 : result.status;
}

function main(argv) {
  const usage = 'Aufruf: node scripts/run-npm-chain-flat-v86512.cjs <npm-skript> [--plan] [--build]';
  const allowed = new Set(['--plan', '--build']);
  const flags = argv.filter(x => x.startsWith('--'));
  if (flags.some(x => !allowed.has(x))) throw Error(usage);
  const positions = argv.filter(x => !x.startsWith('--'));
  if (positions.length !== 1) throw Error(usage);
  const target = positions[0];
  if (flags.includes('--build') && target !== 'prebuild') throw Error('--build setzt das Ziel prebuild voraus');
  const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
  const steps = expandScript(pkg.scripts, target);
  if (flags.includes('--plan')) {
    console.log(`V865.12: ${target} -> ${steps.length} unveränderte npm-Skriptausführungen in Originalreihenfolge`);
    steps.forEach((step, index) => console.log(`${String(index + 1).padStart(4, ' ')}  npm run ${step}`));
    return 0;
  }
  const env = cleanPathEnv(process.env);
  console.log(`V865.12: ${steps.length} npm-Schritte aus ${target}, ohne rekursive npm-Aufrufe.`);
  for (let i = 0; i < steps.length; i++) {
    console.log(`\n[V865.12 ${i + 1}/${steps.length}] npm run ${steps[i]}`);
    const code = npmLeaf(steps[i], env);
    if (code !== 0) {
      console.error(`V865.12 ABBRUCH: npm run ${steps[i]} meldet Exitcode ${code}. Weitere Checks nicht übersprungen, sondern korrekt gestoppt.`);
      return code;
    }
  }
  if (flags.includes('--build')) {
    // Run the actual Next.js CLI. The complete prebuild chain was executed above;
    // invoking "npm run build" here would unnecessarily re-run that chain.
    const nextCLI = path.join(root, 'node_modules', 'next', 'dist', 'bin', 'next');
    if (!fs.existsSync(nextCLI)) throw Error('Next.js-CLI fehlt: zuerst npm ci ausführen.');
    console.log('\nV865.12: Prebuild vollständig bestanden; starte unverändertes next build.');
    const result = spawnSync(process.execPath, [nextCLI, 'build'], {
      cwd: root, stdio: 'inherit', env
    });
    if (result.error) throw result.error;
    return result.status === null ? 1 : result.status;
  }
  console.log(`\nV865.12 PASS: Alle ${steps.length} npm-Schritte aus ${target} erfolgreich.`);
  return 0;
}

if (require.main === module) {
  try { process.exitCode = main(process.argv.slice(2)); }
  catch (error) { console.error('V865.12:', error.message); process.exitCode = 1; }
}
module.exports = { expandScript, cleanPathEnv, main };
