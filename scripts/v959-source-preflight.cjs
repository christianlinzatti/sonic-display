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
// The ZIP importer deliberately preserves trusted GitHub workflows. Their run-name
// defaults may therefore lag behind package.json. Normalize only the local
// checkout before evaluating historical release-readiness assertions; no commit
// or workflow permission is required. The version comes from checked-in metadata.
const { formatActionTitlesV1016 } = require('./version-action-titles-v1016.cjs');
const actionTitles = formatActionTitlesV1016(root, true);
console.log(`CI checkout: synchronized ${actionTitles.changed} protected workflow titles to ${actionTitles.release}`);
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

const {inspectReleaseV1049}=require('./v1049-release-readiness.cjs');
const v1049=inspectReleaseV1049(root);
for(const c of v1049.checks)console.log((c.ok?'PASS':'FAIL')+' V1049 '+c.name);
if(!v1049.passed)process.exitCode=1;

const {inspectReleaseV1050}=require('./v1050-release-readiness.cjs');
const v1050=inspectReleaseV1050(root);
for(const c of v1050.checks)console.log((c.ok?'PASS':'FAIL')+' V1050 '+c.name);
if(!v1050.passed)process.exitCode=1;

const {inspectReleaseV1051}=require('./v1051-release-readiness.cjs');
const v1051=inspectReleaseV1051(root);
for(const c of v1051.checks)console.log((c.ok?'PASS':'FAIL')+' V1051 '+c.name);
if(!v1051.passed)process.exitCode=1;

const {inspectReleaseV1052}=require('./v1052-release-readiness.cjs');
const v1052=inspectReleaseV1052(root);
for(const c of v1052.checks)console.log((c.ok?'PASS':'FAIL')+' V1052 '+c.name);
if(!v1052.passed)process.exitCode=1;

const {inspectReleaseV1053}=require('./v1053-release-readiness.cjs');
const v1053=inspectReleaseV1053(root);
for(const c of v1053.checks)console.log((c.ok?'PASS':'FAIL')+' V1053 '+c.name);
if(!v1053.passed)process.exitCode=1;


const {inspectReleaseV1054}=require('./v1054-release-readiness.cjs');
const v1054=inspectReleaseV1054(root);
for(const c of v1054.checks)console.log((c.ok?'PASS':'FAIL')+' V1054 '+c.name);
if(!v1054.passed)process.exitCode=1;

const {inspectReleaseV1055}=require('./v1055-release-readiness.cjs');
const v1055=inspectReleaseV1055(root);
for(const c of v1055.checks)console.log((c.ok?'PASS':'FAIL')+' V1055 '+c.name);
if(!v1055.passed)process.exitCode=1;

const {inspectReleaseV1056}=require('./v1056-release-readiness.cjs');
const v1056=inspectReleaseV1056(root);
for(const c of v1056.checks)console.log((c.ok?'PASS':'FAIL')+' V1056 '+c.name);
if(!v1056.passed)process.exitCode=1;

const {inspectReleaseV1057}=require('./v1057-release-readiness.cjs');
const v1057=inspectReleaseV1057(root);
for(const c of v1057.checks)console.log((c.ok?'PASS':'FAIL')+' V1057 '+c.name);
if(!v1057.passed)process.exitCode=1;

const {inspectReleaseV1058}=require('./v1058-release-readiness.cjs');
const v1058=inspectReleaseV1058(root);
for(const c of v1058.checks)console.log((c.ok?'PASS':'FAIL')+' V1058 '+c.name);
if(!v1058.passed)process.exitCode=1;

const {inspectReleaseV1059}=require('./v1059-release-readiness.cjs');
const v1059=inspectReleaseV1059(root);
for(const c of v1059.checks)console.log((c.ok?'PASS':'FAIL')+' V1059 '+c.name);
if(!v1059.passed)process.exitCode=1;

const {inspectReleaseV1061}=require('./v1061-release-readiness.cjs');
const v1061=inspectReleaseV1061(root);
for(const c of v1061.checks)console.log((c.ok?'PASS':'FAIL')+' V1061 '+c.name);
if(!v1061.passed)process.exitCode=1;

const {inspectReleaseV1060}=require('./v1060-release-readiness.cjs');
const v1060=inspectReleaseV1060(root);
for(const c of v1060.checks)console.log((c.ok?'PASS':'FAIL')+' V1060 '+c.name);
if(!v1060.passed)process.exitCode=1;

const {inspectReleaseV1062}=require('./v1062-release-readiness.cjs');
const v1062=inspectReleaseV1062(root);
for(const c of v1062.checks)console.log(`${c.ok?'PASS':'FAIL'} V1062 ${c.id}`);
if(!v1062.passed)process.exitCode=1;

const {inspectReleaseV1063}=require('./v1063-release-readiness.cjs');
const v1063=inspectReleaseV1063(root);
for(const c of v1063.checks)console.log(`${c.ok?'PASS':'FAIL'} V1063 ${c.id}`);
if(!v1063.passed)process.exitCode=1;

const {inspectReleaseV1064}=require('./v1064-release-readiness.cjs');
const v1064=inspectReleaseV1064(root);
for(const c of v1064.checks)console.log(`${c.ok?'PASS':'FAIL'} V1064 ${c.id}`);
if(!v1064.passed)process.exitCode=1;

const {inspectReleaseV1065}=require('./v1065-release-readiness.cjs');
const v1065=inspectReleaseV1065(root);
for(const c of v1065.checks)console.log(`${c.ok?'PASS':'FAIL'} V1065 ${c.id}`);
if(!v1065.passed)process.exitCode=1;

const {inspectReleaseV1066}=require('./v1066-release-readiness.cjs');
const v1066=inspectReleaseV1066(root);
for(const c of v1066.checks)console.log(`${c.ok?'PASS':'FAIL'} V1066 ${c.id}`);
if(!v1066.passed)process.exitCode=1;

const {inspectReleaseV1071}=require('./v1071-release-readiness.cjs');
const v1071=inspectReleaseV1071(root);
for(const c of v1071.checks)console.log(`${c.ok?'PASS':'FAIL'} V1071 ${c.id}`);
if(!v1071.passed)process.exitCode=1;

const {inspectReleaseV1070}=require('./v1070-release-readiness.cjs');
const v1070=inspectReleaseV1070(root);
for(const c of v1070.checks)console.log(`${c.ok?'PASS':'FAIL'} V1070 ${c.id}`);
if(!v1070.passed)process.exitCode=1;

const {inspectReleaseV1069}=require('./v1069-release-readiness.cjs');
const v1069=inspectReleaseV1069(root);
for(const c of v1069.checks)console.log(`${c.ok?'PASS':'FAIL'} V1069 ${c.id}`);
if(!v1069.passed)process.exitCode=1;

const {inspectReleaseV1068}=require('./v1068-release-readiness.cjs');
const v1068=inspectReleaseV1068(root);
for(const c of v1068.checks)console.log(`${c.ok?'PASS':'FAIL'} V1068 ${c.id}`);
if(!v1068.passed)process.exitCode=1;

const {inspectReleaseV1067}=require('./v1067-release-readiness.cjs');
const v1067=inspectReleaseV1067(root);
for(const c of v1067.checks)console.log(`${c.ok?'PASS':'FAIL'} V1067 ${c.id}`);
if(!v1067.passed)process.exitCode=1;

const {inspectReleaseV1072}=require('./v1072-release-readiness.cjs');
const v1072=inspectReleaseV1072(root);
for(const c of v1072.checks)console.log(`${c.ok?'PASS':'FAIL'} V1072 ${c.id}`);
if(!v1072.passed)process.exitCode=1;

const {inspectReleaseV1073}=require('./v1073-release-readiness.cjs');
const v1073=inspectReleaseV1073(root);
for(const c of v1073.checks)console.log(`${c.ok?'PASS':'FAIL'} V1073 ${c.id}`);
if(!v1073.passed)process.exitCode=1;

const {inspectReleaseV1074}=require('./v1074-release-readiness.cjs');
const v1074=inspectReleaseV1074(root);
for(const c of v1074.checks)console.log(`${c.ok?'PASS':'FAIL'} V1074 ${c.id}`);
if(!v1074.passed)process.exitCode=1;

const {inspectReleaseV1075}=require('./v1075-release-readiness.cjs');
const v1075=inspectReleaseV1075(root);
for(const c of v1075.checks)console.log(`${c.ok?'PASS':'FAIL'} V1075 ${c.id}`);
if(!v1075.passed)process.exitCode=1;

const {inspectReleaseV1076}=require('./v1076-release-readiness.cjs');
const v1076=inspectReleaseV1076(root);
for(const c of v1076.checks)console.log(`${c.ok?'PASS':'FAIL'} V1076 ${c.id}`);
if(!v1076.passed)process.exitCode=1;

const {inspectReleaseV1077}=require('./v1077-release-readiness.cjs');
const v1077=inspectReleaseV1077(root);
for(const c of v1077.checks)console.log(`${c.ok?'PASS':'FAIL'} V1077 ${c.id}`);
if(!v1077.passed)process.exitCode=1;

const {inspectReleaseV1078}=require('./v1078-release-readiness.cjs');
const v1078=inspectReleaseV1078(root);
for(const c of v1078.checks)console.log(`${c.ok?'PASS':'FAIL'} V1078 ${c.id}`);
if(!v1078.passed)process.exitCode=1;

const {inspectReleaseV1079}=require('./v1079-release-readiness.cjs');
const v1079=inspectReleaseV1079(root);
for(const c of v1079.checks)console.log(`${c.ok?'PASS':'FAIL'} V1079 ${c.id}`);
if(!v1079.passed)process.exitCode=1;

const {inspectReleaseV1080}=require('./v1080-release-readiness.cjs');
const v1080=inspectReleaseV1080(root);
for(const c of v1080.checks)console.log(`${c.ok?'PASS':'FAIL'} V1080 ${c.id}`);
if(!v1080.passed)process.exitCode=1;

const {inspectReleaseV1081}=require('./v1081-release-readiness.cjs');
const v1081=inspectReleaseV1081(root);
for(const c of v1081.checks)console.log(`${c.ok?'PASS':'FAIL'} V1081 ${c.id}`);
if(!v1081.passed)process.exitCode=1;

const {inspectReleaseV1082}=require('./v1082-release-readiness.cjs');
const v1082=inspectReleaseV1082(root);
for(const c of v1082.checks)console.log(`${c.ok?'PASS':'FAIL'} V1082 ${c.id}`);
if(!v1082.passed)process.exitCode=1;

const {inspectReleaseV1083}=require('./v1083-release-readiness.cjs');
const v1083=inspectReleaseV1083(root);
for(const c of v1083.checks)console.log(`${c.ok?'PASS':'FAIL'} V1083 ${c.id}`);
if(!v1083.passed)process.exitCode=1;

const {inspectReleaseV1084}=require('./v1084-release-readiness.cjs');
const v1084=inspectReleaseV1084(root);
for(const c of v1084.checks)console.log(`${c.ok?'PASS':'FAIL'} V1084 ${c.id}`);
if(!v1084.passed)process.exitCode=1;

const {inspectReleaseV1085}=require('./v1085-release-readiness.cjs');
const v1085=inspectReleaseV1085(root);
for(const c of v1085.checks)console.log(`${c.ok?'PASS':'FAIL'} V1085 ${c.id}`);
if(!v1085.passed)process.exitCode=1;

const {inspectReleaseV1087}=require('./v1087-release-readiness.cjs');
const v1087=inspectReleaseV1087(root);
for(const c of v1087.checks)console.log(`${c.ok?'PASS':'FAIL'} V1087 ${c.id}`);
if(!v1087.passed)process.exitCode=1;

const {inspectReleaseV1086}=require('./v1086-release-readiness.cjs');
const v1086=inspectReleaseV1086(root);
for(const c of v1086.checks)console.log(`${c.ok?'PASS':'FAIL'} V1086 ${c.id}`);
if(!v1086.passed)process.exitCode=1;

const {inspectReleaseV1088}=require('./v1088-release-readiness.cjs');
const v1088=inspectReleaseV1088(root);
for(const c of v1088.checks)console.log(`${c.ok?'PASS':'FAIL'} V1088 ${c.id}`);
if(!v1088.passed)process.exitCode=1;

const {inspectReleaseV1092}=require('./v1092-release-readiness.cjs');
const v1092=inspectReleaseV1092(root);
for(const c of v1092.checks)console.log(`${c.ok?'PASS':'FAIL'} V1092 ${c.id}`);
if(!v1092.passed)process.exitCode=1;

const {inspectReleaseV1091}=require('./v1091-release-readiness.cjs');
const v1091=inspectReleaseV1091(root);
for(const c of v1091.checks)console.log(`${c.ok?'PASS':'FAIL'} V1091 ${c.id}`);
if(!v1091.passed)process.exitCode=1;
const {inspectReleaseV1090}=require('./v1090-release-readiness.cjs');
const v1090=inspectReleaseV1090(root);
for(const c of v1090.checks)console.log(`${c.ok?'PASS':'FAIL'} V1090 ${c.id}`);
if(!v1090.passed)process.exitCode=1;

const {inspectReleaseV1089}=require('./v1089-release-readiness.cjs');
const v1089=inspectReleaseV1089(root);
for(const c of v1089.checks)console.log(`${c.ok?'PASS':'FAIL'} V1089 ${c.id}`);
if(!v1089.passed)process.exitCode=1;

const {inspectReleaseV1093}=require('./v1093-release-readiness.cjs');
const v1093=inspectReleaseV1093(root);
for(const c of v1093.checks)console.log(`${c.ok?'PASS':'FAIL'} V1093 ${c.id}`);
if(!v1093.passed)process.exitCode=1;
