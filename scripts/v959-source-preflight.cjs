#!/usr/bin/env node
'use strict';
// Runs before npm ci: catches lockfile drift and Windows/Linux path collisions.
const path = require('node:path');
const { inspect } = require('../lib/v959BuildReadiness.cjs');
const fs = require('node:fs');
const root = path.resolve(__dirname, '..');
// A previous successful artifact must never survive a failed npm ci step.
for (const report of ['v959-build-proof.json', 'v959-build-summary.md', 'v931-production-gate.json']) {
  const output = path.join(root, 'reports', report);
  if (fs.existsSync(output)) fs.unlinkSync(output);
}
const report = inspect(root, { requireDependencies: false });
const {inspectReleaseV1013}=require('./v1013-release-readiness.cjs');
const release=inspectReleaseV1013(root);
for(const check of release.checks)console.log(`${check.ok?'PASS':'FAIL'} V1013 ${check.id}${check.ok?'':': '+check.reason}`);
for (const c of report.checks) console.log(`${c.passed ? 'PASS' : 'FAIL'} V959 ${c.id}: ${c.detail}`);
const {inspectReleaseV1014}=require('./v1014-release-readiness.cjs');
const v1014=inspectReleaseV1014(root);
for(const check of v1014.checks)console.log(`${check.ok?'PASS':'FAIL'} V1014 ${check.name}`);
const {inspectReleaseV1016}=require('./v1016-release-readiness.cjs');
const v1016=inspectReleaseV1016(root);
for(const check of v1016.checks)console.log(`${check.ok?'PASS':'FAIL'} V1016 ${check.name}`);
const {inspectReleaseV1015}=require('./v1015-release-readiness.cjs');
const v1015=inspectReleaseV1015(root);
for(const check of v1015.checks)console.log(`${check.ok?'PASS':'FAIL'} V1015 ${check.name}`);
if (!report.passed || !release.passed || !v1014.passed || !v1015.passed || !v1016.passed) process.exitCode = 1;

const {inspectReleaseV1017}=require('./v1017-release-readiness.cjs');
const v1017=inspectReleaseV1017(root);
for(const c of v1017.checks)console.log(`${c.ok?'PASS':'FAIL'} V1017 ${c.name}`);
if(!v1017.passed)process.exitCode=1;

const {inspectReleaseV1018}=require('./v1018-release-readiness.cjs');
const v1018=inspectReleaseV1018(root);
for(const c of v1018.checks)console.log(`${c.ok?'PASS':'FAIL'} V1018 ${c.name}`);
if(!v1018.passed)process.exitCode=1;

const {inspectReleaseV1019}=require('./v1019-release-readiness.cjs');
const v1019=inspectReleaseV1019(root);
for(const c of v1019.checks)console.log(`${c.ok?'PASS':'FAIL'} V1019 ${c.name}`);
if(!v1019.passed)process.exitCode=1;

const {inspectReleaseV1021}=require('./v1021-release-readiness.cjs');
const v1021=inspectReleaseV1021(root);
for(const check of v1021.checks)console.log(`${check.ok?'PASS':'FAIL'} V1021 ${check.name}`);
if(!v1021.passed)process.exitCode=1;

const {inspectReleaseV1020}=require('./v1020-release-readiness.cjs');
const v1020=inspectReleaseV1020(root);
for(const check of v1020.checks)console.log(`${check.ok?'PASS':'FAIL'} V1020 ${check.name}`);
if(!v1020.passed)process.exitCode=1;

const {inspectReleaseV1022}=require('./v1022-release-readiness.cjs');
const v1022=inspectReleaseV1022(root);
for(const c of v1022.checks)console.log(`${c.ok?'PASS':'FAIL'} V1022 ${c.name}`);
if(!v1022.passed)process.exitCode=1;

const {inspectReleaseV1023}=require('./v1023-release-readiness.cjs');
const v1023=inspectReleaseV1023(root);
for(const c of v1023.checks)console.log(`${c.ok?'PASS':'FAIL'} V1023 ${c.name}`);
if(!v1023.passed)process.exitCode=1;

const {inspectReleaseV1024}=require('./v1024-release-readiness.cjs');
const v1024=inspectReleaseV1024(root);
for(const c of v1024.checks)console.log(`${c.ok?'PASS':'FAIL'} V1024 ${c.name}`);
if(!v1024.passed)process.exitCode=1;

const {inspectReleaseV1025}=require('./v1025-release-readiness.cjs');
const v1025=inspectReleaseV1025(root);
for(const c of v1025.checks)console.log(`${c.ok?'PASS':'FAIL'} V1025 ${c.name}`);
if(!v1025.passed)process.exitCode=1;

const {inspectReleaseV1027}=require('./v1027-release-readiness.cjs');
const v1027=inspectReleaseV1027(root);
for(const c of v1027.checks)console.log(`${c.ok?'PASS':'FAIL'} V1027 ${c.name}`);
if(!v1027.passed)process.exitCode=1;

const {inspectReleaseV1026}=require('./v1026-release-readiness.cjs');
const v1026=inspectReleaseV1026(root);
for(const c of v1026.checks)console.log(`${c.ok?'PASS':'FAIL'} V1026 ${c.name}`);
if(!v1026.passed)process.exitCode=1;

const {inspectReleaseV1028}=require('./v1028-release-readiness.cjs');
const v1028=inspectReleaseV1028(root);
for(const c of v1028.checks)console.log(`${c.ok?'PASS':'FAIL'} V1028 ${c.name}`);
if(!v1028.passed)process.exitCode=1;
