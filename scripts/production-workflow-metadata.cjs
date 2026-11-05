'use strict';
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
function resolveMetadata(pkg, { revision, expectedRelease = '', expectedRevision = '' }) {
  const match = /^v([1-9][0-9]*)$/i.exec(pkg.sonicRoadmapRelease || '');
  if (!match) throw Error('Invalid sonicRoadmapRelease in package.json');
  const release = 'V' + match[1];
  if (pkg.version !== '0.1.0-v' + match[1]) throw Error('Package version and roadmap release differ');
  if (!/^[0-9a-f]{40}$/.test(revision || '')) throw Error('Expected a full checked-out commit SHA');
  if (expectedRelease && expectedRelease !== release) throw Error('Dispatched release differs from checked-out package');
  if (expectedRevision && expectedRevision !== revision) throw Error('Dispatched revision differs from checked-out commit');
  return { release, revision };
}
if (require.main === module) {
  const root = path.resolve(__dirname, '..');
  const metadata = resolveMetadata(JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8')), {
    revision: execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim(),
    expectedRelease: process.env.EXPECTED_RELEASE || '',
    expectedRevision: process.env.EXPECTED_REVISION || '',
  });
  const output = Object.entries(metadata).map(([key, value]) => `${key}=${value}`).join('\n') + '\n';
  if (process.env.GITHUB_OUTPUT) fs.appendFileSync(process.env.GITHUB_OUTPUT, output);
  console.log(output.trim());
}
module.exports = { resolveMetadata };
