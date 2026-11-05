#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const {inspectBuild}=require('../scripts/check-next-build-v964.cjs');
const root=fs.mkdtempSync(path.join(os.tmpdir(),'sonic-v964-next-'));
const tmp=path.join(root,'.next');fs.mkdirSync(path.join(tmp,'server'),{recursive:true});
try{
 const write=(name,text)=>fs.writeFileSync(path.join(tmp,name),text);
 assert.equal(inspectBuild(root,0).passed,false,'missing build cannot pass');
 write('BUILD_ID','SonicDisplay_Production_Test_964');
 write('build-manifest.json',JSON.stringify({pages:{'/_app':['app.js']}}));
 write('prerender-manifest.json',JSON.stringify({routes:{'/':{}},dynamicRoutes:{}}));
 write('server/app-paths-manifest.json',JSON.stringify({'/page':'app/page.js','/api/health/route':'app/api/health/route.js'}));
 assert.equal(inspectBuild(root,0).passed,true,'real structure passes');
 assert.equal(inspectBuild(root,Date.now()+60000).passed,false,'stale artifact rejected');
 write('BUILD_ID','');assert.equal(inspectBuild(root,0).passed,false,'empty id rejected');
 write('BUILD_ID','oops');assert.equal(inspectBuild(root,0).passed,false,'short id rejected');
 write('BUILD_ID','SonicDisplay_Production_Test_964');
 write('server/app-paths-manifest.json','bad json');
 assert.equal(inspectBuild(root,0).passed,false,'bad app route manifest rejected');
 write('server/app-paths-manifest.json',JSON.stringify({'/api/ping/route':'app/api/ping/route.js'}));
 assert.equal(inspectBuild(root,0).passed,false,'API-only output not enough');
 console.log('PASS V964 emitted Next.js build artifacts: missing/empty/stale/invalid/real route checks');
}finally{fs.rmSync(root,{recursive:true,force:true});}
