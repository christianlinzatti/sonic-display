'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { stageReferenceAvatar, REFERENCE_AVATAR_NAME } = require('../scripts/playwright-production.cjs');
const root = fs.mkdtempSync(path.join(os.tmpdir(), 'sonic-avatar-fixture-'));
try {
  const source = path.join(root, 'public/benchmark/v777-reference-performer.glb');
  const target = path.join(root, 'public/avatars', REFERENCE_AVATAR_NAME);
  fs.mkdirSync(path.dirname(source), { recursive: true });
  const asset = fs.readFileSync(path.join(__dirname, '../public/benchmark/v777-reference-performer.glb'));
  assert.equal(asset.toString('ascii', 0, 4), 'glTF');
  const model = JSON.parse(asset.toString('utf8', 20, 20 + asset.readUInt32LE(12)));
  assert.ok(model.meshes.length > 0 && model.skins.length > 0 && model.animations.length > 0);
  fs.writeFileSync(source, asset);
  const cleanup = stageReferenceAvatar(root);
  assert.ok(fs.readFileSync(target).equals(asset));
  assert.throws(() => stageReferenceAvatar(root), /EEXIST/);
  cleanup(); assert.equal(fs.existsSync(target), false);
  const preserve = stageReferenceAvatar(root);
  fs.writeFileSync(target, 'changed by user');
  assert.throws(preserve, /preserving file/);
  assert.equal(fs.readFileSync(target, 'utf8'), 'changed by user');
  console.log('PASS V1006: actual rigged animated GLB, exclusive staging, cleanup and preservation of changed user files');
} finally { fs.rmSync(root, { recursive: true, force: true }); }
require('./v1005-playwright-production-regression.cjs');
