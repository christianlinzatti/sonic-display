'use strict';
const {spawnSync}=require('node:child_process');
const path=require('node:path');
const run=spawnSync(process.platform==='win32'?'python':'python3',['-m','unittest','discover','-s','tests','-p','test_release_recovery.py'],{cwd:path.resolve(__dirname,'..'),stdio:'inherit'});
if(run.status!==0||run.error)process.exitCode=1;
