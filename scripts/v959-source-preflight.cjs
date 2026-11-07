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

const {inspectReleaseV1029}=require('./v1029-release-readiness.cjs');
const {inspectReleaseV1030}=require('./v1030-release-readiness.cjs');
const v1029=inspectReleaseV1029(root);
for(const c of v1029.checks)console.log(`${c.ok?'PASS':'FAIL'} V1029 ${c.name}`);
if(!v1029.passed)process.exitCode=1;
const {inspectReleaseV1039}=require('./v1039-release-readiness.cjs');
const {inspectReleaseV1048}=require('./v1048-release-readiness.cjs');
const v1048=inspectReleaseV1048(root);
for(const c of v1048.checks)console.log((c.ok?'PASS':'FAIL')+' V1048 '+c.name);
if(!v1048.passed)process.exitCode=1;
const {inspectReleaseV1047}=require('./v1047-release-readiness.cjs');
const v1047=inspectReleaseV1047(root);
for(const c of v1047.checks)console.log((c.ok?'PASS':'FAIL')+' V1047 '+c.name);
if(!v1047.passed)process.exitCode=1;
const {inspectReleaseV1046}=require('./v1046-release-readiness.cjs');
const v1046=inspectReleaseV1046(root);
for(const c of v1046.checks)console.log((c.ok?'PASS':'FAIL')+' V1046 '+c.name);
if(!v1046.passed)process.exitCode=1;
const {inspectReleaseV1045}=require('./v1045-release-readiness.cjs');
const v1045=inspectReleaseV1045(root);
for(const c of v1045.checks)console.log((c.ok?'PASS':'FAIL')+' V1045 '+c.name);
if(!v1045.passed)process.exitCode=1;
const {inspectReleaseV1044}=require('./v1044-release-readiness.cjs');
const v1044=inspectReleaseV1044(root);
for(const c of v1044.checks)console.log((c.ok?'PASS':'FAIL')+' V1044 '+c.name);
if(!v1044.passed)process.exitCode=1;
const {inspectReleaseV1043}=require('./v1043-release-readiness.cjs');
const v1043=inspectReleaseV1043(root);
for(const c of v1043.checks)console.log((c.ok?'PASS':'FAIL')+' V1043 '+c.name);
if(!v1043.passed)process.exitCode=1;
const {inspectReleaseV1042}=require('./v1042-release-readiness.cjs');
const v1042=inspectReleaseV1042(root);
for(const c of v1042.checks)console.log(`${c.ok?'PASS':'FAIL'} V1042 ${c.name}`);
if(!v1042.passed)process.exitCode=1;
const {inspectReleaseV1040}=require('./v1040-release-readiness.cjs');
const {inspectReleaseV1041}=require('./v1041-release-readiness.cjs');
const v1041=inspectReleaseV1041(root);
for(const c of v1041.checks)console.log(`${c.ok?'PASS':'FAIL'} V1041 ${c.name}`);
if(!v1041.passed)process.exitCode=1;
const v1040=inspectReleaseV1040(root);
for(const c of v1040.checks)console.log(`${c.ok?'PASS':'FAIL'} V1040 ${c.name}`);
if(!v1040.passed)process.exitCode=1;
const v1039=inspectReleaseV1039(root);
for(const c of v1039.checks)console.log(`${c.ok?'PASS':'FAIL'} V1039 ${c.name}`);
if(!v1039.passed)process.exitCode=1;
const {inspectReleaseV1038}=require('./v1038-release-readiness.cjs');
const v1038=inspectReleaseV1038(root);
for(const c of v1038.checks)console.log(`${c.ok?'PASS':'FAIL'} V1038 ${c.name}`);
if(!v1038.passed)process.exitCode=1;
const {inspectReleaseV1037}=require('./v1037-release-readiness.cjs');
const v1037=inspectReleaseV1037(root);
for(const c of v1037.checks)console.log(`${c.ok?'PASS':'FAIL'} V1037 ${c.name}`);
if(!v1037.passed)process.exitCode=1;
const {inspectReleaseV1036}=require('./v1036-release-readiness.cjs');
const v1036=inspectReleaseV1036(root);
for(const c of v1036.checks)console.log(`${c.ok?'PASS':'FAIL'} V1036 ${c.name}`);
if(!v1036.passed)process.exitCode=1;
const {inspectReleaseV1035}=require('./v1035-release-readiness.cjs');
const v1035=inspectReleaseV1035(root);
for(const c of v1035.checks)console.log(`${c.ok?'PASS':'FAIL'} V1035 ${c.name}`);
if(!v1035.passed)process.exitCode=1;
const {inspectReleaseV1034}=require('./v1034-release-readiness.cjs');
const v1034=inspectReleaseV1034(root);
for(const c of v1034.checks)console.log(`${c.ok?'PASS':'FAIL'} V1034 ${c.name}`);
if(!v1034.passed)process.exitCode=1;
const {inspectReleaseV1033}=require('./v1033-release-readiness.cjs');
const v1033=inspectReleaseV1033(root);
for(const c of v1033.checks)console.log(`${c.ok?'PASS':'FAIL'} V1033 ${c.name}`);
if(!v1033.passed)process.exitCode=1;
const {inspectReleaseV1032}=require('./v1032-release-readiness.cjs');
const v1032=inspectReleaseV1032(root);
for(const c of v1032.checks)console.log(`${c.ok?'PASS':'FAIL'} V1032 ${c.name}`);
if(!v1032.passed)process.exitCode=1;
const {inspectReleaseV1031}=require('./v1031-release-readiness.cjs');
const v1031=inspectReleaseV1031(root);
for(const c of v1031.checks)console.log(`${c.ok?'PASS':'FAIL'} V1031 ${c.name}`);
if(!v1031.passed)process.exitCode=1;
const v1030=inspectReleaseV1030(root);
for(const c of v1030.checks)console.log(`${c.ok?'PASS':'FAIL'} V1030 ${c.name}`);
if(!v1030.passed)process.exitCode=1;
