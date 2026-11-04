#!/usr/bin/env node
'use strict';
// Run V959's own parallel tests if present; otherwise test current repository.
const fs = require('node:fs');
const path = require('node:path');
const {spawn} = require('node:child_process');
const root = path.resolve(__dirname, '..');
const scripts = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8')).scripts;
const concurrency = Number(process.env.SONIC_TEST_CONCURRENCY || 3);
if (!Number.isInteger(concurrency) || concurrency < 1 || concurrency > 4)
  throw new Error('SONIC_TEST_CONCURRENCY must be between 1 and 4');
const names = scripts['test:v959:parallel']
  ? ['test:v959:parallel']
  : Array.from({length: 12}, (_, i) => 'test:v' + (880 - i));
const output = path.join(root, 'reports', 'v959-ci-regression-logs');
fs.mkdirSync(output, {recursive: true});
const tasks = names.map(name => {
  const match = /^node\s+([^\s]+\.cjs)$/.exec((scripts[name] || '').trim());
  if (!match) throw new Error('Missing or unsupported direct Node test script: ' + name);
  const file = path.resolve(root, match[1]);
  if (!file.startsWith(root + path.sep) || !fs.existsSync(file))
    throw new Error('Missing/invalid test file: ' + name);
  return {name, file};
});
let index = 0;
const results = [];
function run(task) {
  return new Promise(resolve => {
    const started = Date.now();
    const logFile = path.join(output, task.name.replace(/[^a-zA-Z0-9.-]/g, '_') + '.log');
    const stream = fs.createWriteStream(logFile);
    const processHandle = spawn(process.execPath, [task.file], {
      cwd: root, env: process.env, stdio: ['ignore','pipe','pipe'], windowsHide: true
    });
    processHandle.stdout.pipe(stream, {end:false});
    processHandle.stderr.pipe(stream, {end:false});
    let timedOut = false;
    const timer = setTimeout(() => {timedOut = true; processHandle.kill();}, 180000);
    processHandle.once('error', error => stream.write('START ERROR: ' + error.message + '\n'));
    processHandle.once('close', (exitCode, signal) => {
      clearTimeout(timer);
      stream.end();
      resolve({name:task.name, passed:!timedOut && exitCode===0, exitCode,
        signal, timedOut, elapsedMs:Date.now()-started,
        log:path.relative(root, logFile)});
    });
  });
}
async function worker() {
  while (index < tasks.length) {
    const result = await run(tasks[index++]);
    results.push(result);
    console.log((result.passed?'PASS ':'FAIL ')+result.name+' ('+result.elapsedMs+' ms)');
  }
}
(async () => {
  await Promise.all(Array.from({length:Math.min(concurrency, tasks.length)}, worker));
  results.sort((a,b)=>names.indexOf(a.name)-names.indexOf(b.name));
  const passed = results.filter(x=>x.passed).length;
  const report = {release:scripts['test:v959:parallel']?'v959':'baseline (V959 not uploaded)',
    concurrency, passed, total:results.length, results};
  fs.writeFileSync(path.join(root,'reports','v959-ci-parallel-summary.json'),
    JSON.stringify(report,null,2)+'\n');
  console.log('Parallel regressions: '+passed+'/'+results.length+' passed');
  if (passed!==results.length) process.exitCode=1;
})().catch(error=>{console.error(error);process.exitCode=1;});
