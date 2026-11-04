'use strict';
/** V959: bounded, independent Node.js regression workers. No shells / npm chaining. */
const fs = require('node:fs');
const path = require('node:path');
const { spawn } = require('node:child_process');

function parallelism(value, fallback = 3) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed >= 1 ? Math.min(parsed, 4) : fallback;
}
function safeName(label, index) {
  return `${String(index + 1).padStart(2, '0')}-${label.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 65)}.log`;
}
function runOne(root, task, index, timeoutMs, logDir, env) {
  return new Promise(resolve => {
    const started = Date.now();
    const logFile = path.join(logDir, safeName(task.label, index));
    const fd = fs.openSync(logFile, 'w');
    const record = chunk => {
      try { fs.writeSync(fd, chunk); } catch (_) { /* log errors never hide a failed test */ }
    };
    let child, finished = false, timedOut = false, spawnError = null;
    const complete = (code, signal) => {
      if (finished) return;
      finished = true;
      clearTimeout(timer);
      try { fs.closeSync(fd); } catch (_) { /* report still fails if process failed */ }
      const ok = code === 0 && !spawnError && !timedOut;
      resolve({ label: task.label, ok, exitCode: code, signal: signal || null,
        elapsedMs: Date.now() - started, timeout: timedOut,
        ...(spawnError ? { errorCode: spawnError.code || 'SPAWN_ERROR' } : {}),
        logFile: path.relative(root, logFile).replace(/\\/g, '/') });
    };
    // Guard assigned before asynchronous child events can arrive.
    let timer;
    try {
      const program = path.resolve(root, task.file);
      child = spawn(process.execPath, [program, ...(task.args || [])], {
        cwd: root, env: { ...process.env, ...env }, shell: false,
        windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'],
      });
      child.stdout.on('data', record);
      child.stderr.on('data', record);
      child.on('error', err => { spawnError = err; record(Buffer.from(`\nSPAWN_ERROR: ${err.message}\n`)); });
      child.on('close', (code, signal) => complete(code, signal));
      timer = setTimeout(() => {
        timedOut = true;
        record(Buffer.from(`\nTIMEOUT after ${timeoutMs}ms\n`));
        try { child.kill(); } catch (_) { /* close event reports the failure */ }
      }, timeoutMs);
    } catch (error) {
      spawnError = error;
      record(Buffer.from(`\nRUNNER_ERROR: ${error.message}\n`));
      complete(null, null);
    }
  });
}
async function runParallelTests({ root, tasks, maxWorkers = 3, timeoutMs = 25 * 60 * 1000,
  logDir = path.join(root, 'reports', 'v959-regression-logs'), env = {}, onResult = () => {} }) {
  if (!Array.isArray(tasks) || tasks.some(t => !t.label || !t.file)) throw new TypeError('Invalid test task');
  fs.mkdirSync(logDir, { recursive: true });
  // Only logs for this invocation may appear in an uploaded CI artifact.
  for (const file of fs.readdirSync(logDir)) {
    if (file.endsWith('.log')) fs.unlinkSync(path.join(logDir, file));
  }
  const results = Array(tasks.length);
  const count = Math.min(tasks.length, parallelism(maxWorkers));
  let next = 0;
  await Promise.all(Array.from({ length: count }, async () => {
    while (next < tasks.length) {
      const index = next++;
      const result = await runOne(root, tasks[index], index, timeoutMs, logDir, env);
      results[index] = result;
      onResult(result);
    }
  }));
  return { passed: results.every(r => r.ok), concurrency: count, tests: results };
}
module.exports = { parallelism, runParallelTests };
