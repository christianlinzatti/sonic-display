// Regression for SWC's stricter "use client" / "use server" directive placement.
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const root = fs.mkdtempSync(path.join(os.tmpdir(), 'sonic-directive-v4733-'));
const file = path.join(root, 'client.tsx');
const checker = path.join(__dirname, 'check-source-syntax.cjs');
const check = () => spawnSync(process.execPath, [checker], {
  encoding: 'utf8',
  env: { ...process.env, SONIC_SOURCE_SCAN_ROOT: root },
});
try {
  fs.writeFileSync(file, 'import { x } from "./dep";\n"use client";\nexport const C = () => null;\n');
  let run = check();
  assert.notEqual(run.status, 0, 'client directive after import must fail');
  assert.match(run.stderr, /"use client" directive must appear before/);
  fs.writeFileSync(file, '"use client";\nimport { x } from "./dep";\nexport const C = () => null;\n');
  run = check();
  assert.equal(run.status, 0, run.stderr);
  fs.writeFileSync(file, 'const x=1;\n"use server";\n');
  run = check();
  assert.notEqual(run.status, 0, 'server directive after statement must fail');
  assert.match(run.stderr, /"use server" directive must appear before/);
  fs.writeFileSync(file, '// comments are allowed before directives\n"use client";\nexport const C = () => null;\n');
  run = check();
  assert.equal(run.status, 0, run.stderr);
  console.log('PASS V473.3 client/server directive placement and prebuild detection');
} finally {
  fs.rmSync(root, { recursive: true, force: true });
}
