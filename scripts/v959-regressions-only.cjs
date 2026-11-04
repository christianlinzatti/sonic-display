#!/usr/bin/env node
'use strict';
/** Run the same bounded regression pool as V931, without attempting TypeScript/Next. */
const fs = require('node:fs');
const path = require('node:path');
const { parallelism, runParallelTests } = require('../lib/v959ParallelTests.cjs');
const { regressions } = require('./v931-production-gate.cjs');
const root=path.resolve(__dirname,'..');
const reportFile=path.join(root,'reports','v959-regression-only.json');
const report={schema:'v959-regression-only-v1',passed:false,startedAt:new Date().toISOString(),tests:[]};
function save(){fs.mkdirSync(path.dirname(reportFile),{recursive:true});fs.writeFileSync(reportFile,JSON.stringify(report,null,2)+'\n');}
save();
const maxWorkers=parallelism(process.env.SONIC_TEST_CONCURRENCY || 3);
console.log(`V959 regressions-only: ${regressions.length} tests, ${maxWorkers} parallel workers`);
runParallelTests({root,maxWorkers,tasks:regressions.map(([label,file])=>({label,file})),onResult: result=>{
  console.log(`${result.ok?'PASS':'FAIL'} ${result.label} (${result.elapsedMs}ms)`);
}}).then(result=>{
 report.tests=result.tests;
 report.passed=result.passed;
 report.finishedAt=new Date().toISOString();
 report.concurrency=result.concurrency;
 save();
 if(!result.passed){
   process.exitCode=1;
   for(const failed of result.tests.filter(t=>!t.ok)){
     console.error(`FAILED ${failed.label} (${failed.exitCode??failed.errorCode})`);
     console.error(fs.readFileSync(path.join(root,failed.logFile),'utf8').slice(-6000));
   }
 }
 console.log(`${result.passed?'PASS':'FAIL'} V959: ${result.tests.filter(t=>t.ok).length}/${result.tests.length} regression suites`);
}).catch(error=>{console.error(error);process.exitCode=1;});
