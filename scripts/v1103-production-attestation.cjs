#!/usr/bin/env node
'use strict';
const fs=require('node:fs'),path=require('node:path');
const {execFileSync}=require('node:child_process');
const {attestProductionV1103}=require('../lib/releaseAttestationV1103.cjs');
const root=path.resolve(__dirname,'..');
function read(file){try{return JSON.parse(fs.readFileSync(path.join(root,file),'utf8'));}catch{return null}}
function attestCurrentBuildV1103(){
 let revision='';try{revision=execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8',windowsHide:true,stdio:['ignore','pipe','ignore']}).trim()}catch{}
 const result=attestProductionV1103({pkg:read('package.json'),revision,
  proof:read('reports/v965-production-proof.json'),gate:read('reports/v931-production-gate.json'),
  inherited:read('reports/v964-production-proof.json'),browser:read('reports/playwright-production/proof.json'),
  soak:read('reports/playwright-soak/proof.json'),soakResults:read('reports/playwright-soak/results.json')});
 const destination=path.join(root,'reports/v1103-production-proof.json');
 fs.mkdirSync(path.dirname(destination),{recursive:true});
 fs.writeFileSync(destination,JSON.stringify({...result,checkedAt:new Date().toISOString()},null,2)+'\n');
 return result;
}
if(require.main===module){const result=attestCurrentBuildV1103();
 console.log(`V1103 evidence attestation ${result.passed?'PASS':'FAIL'}: ${result.failed.join(', ')||'every mandatory check passed'}`);
 if(!result.passed)process.exitCode=1;
}
module.exports={attestCurrentBuildV1103};
