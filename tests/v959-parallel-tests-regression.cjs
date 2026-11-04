'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { parallelism, runParallelTests } = require('../lib/v959ParallelTests.cjs');
let passed = 0;
async function test(title, fn) { await fn(); passed++; console.log(`PASS V959 parallel ${title}`); }
(async () => {
  await test('concurrency is bounded and invalid values receive a safe default', async () => {
    assert.equal(parallelism('99'), 4);
    assert.equal(parallelism('2'), 2);
    assert.equal(parallelism('0'), 3);
    assert.equal(parallelism('NaN'), 3);
  });
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'sonic-parallel-v959-'));
  try {
    const make = (name, content) => {
      fs.writeFileSync(path.join(root, name), content);
      return { label: name, file: name };
    };
    const events = path.join(root, 'events.log');
    const tasks = ['one', 'two', 'three'].map(id => make(`${id}.cjs`,
      `const fs=require('fs');fs.appendFileSync(${JSON.stringify(events)},'start:${id}\\n');` +
      `setTimeout(()=>{fs.appendFileSync(${JSON.stringify(events)},'end:${id}\\n');console.log('${id}');process.exit(0);},450);`));
    await test('concurrent workers actually overlap without relying on wall-clock performance', async () => {
      const sequential = await runParallelTests({ root, tasks, maxWorkers: 1 });
      assert.equal(sequential.passed, true);
      assert.equal(sequential.concurrency, 1);
      fs.writeFileSync(events, '');
      const concurrent = await runParallelTests({ root, tasks, maxWorkers: 3 });
      assert.equal(concurrent.passed, true);
      assert.equal(concurrent.concurrency, 3);
      const eventsInOrder = fs.readFileSync(events, 'utf8').trim().split('\n');
      let active = 0, peak = 0;
      for (const event of eventsInOrder) { active += event.startsWith('start:') ? 1 : -1; peak = Math.max(peak, active); }
      assert.ok(peak >= 2, `expected overlapping worker lifetimes, peak=${peak}`);
      assert.equal(active, 0);
      assert.deepEqual(concurrent.tests.map(x => x.label), tasks.map(x => x.label));
    });
    await test('worker failure is propagated despite successful sibling', async () => {
      const failure = make('fail.cjs', "console.error('EXPECTED_FAILURE');process.exit(7);");
      const result = await runParallelTests({ root, tasks: [tasks[0], failure], maxWorkers: 2 });
      assert.equal(result.passed, false);
      assert.equal(result.tests[1].exitCode, 7);
      assert.ok(fs.readFileSync(path.join(root, result.tests[1].logFile), 'utf8').includes('EXPECTED_FAILURE'));
    });
    await test('missing test script fails closed', async () => {
      const result = await runParallelTests({ root, tasks: [{ label: 'missing', file: 'absent.cjs' }], maxWorkers: 2 });
      assert.equal(result.passed, false);
      assert.notEqual(result.tests[0].exitCode, 0);
    });
    await test('timeout is reported as failure without skipping other tests', async () => {
      const stall = make('stall.cjs', 'setTimeout(()=>process.exit(0),5000);');
      const result = await runParallelTests({ root, tasks: [stall, tasks[0]], maxWorkers: 2, timeoutMs: 900 });
      assert.equal(result.passed, false);
      assert.equal(result.tests[0].timeout, true);
      assert.equal(result.tests[1].ok, true);
    });
    await test('every test has an individual readable log', async () => {
      const result = await runParallelTests({ root, tasks, maxWorkers: 2 });
      assert.ok(result.tests.every(t => fs.existsSync(path.join(root, t.logFile))));
      assert.ok(result.tests.every(t => t.ok));
    });
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
  console.log(`V959 bounded parallel test runner: ${passed} checks passed`);
})().catch(error => { console.error(error); process.exitCode = 1; });
