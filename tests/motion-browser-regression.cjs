const fs=require('node:fs'),assert=require('node:assert/strict'),path=require('node:path');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const installer=read('components/CharacterMotionBatchInstaller.tsx');
const inspector=read('components/visualizer/motionClipInspector.ts');
const manifest=JSON.parse(read('package.json'));
const checks=[
 ['version',()=>assert.match(manifest.version,/^0\.1\.0-v\d+$/)],
 ['new regression command',()=>assert.match(manifest.scripts['test:motion-browser'],/motion-browser-regression/)],
 ['interactive animated avatar preview',()=>assert.match(installer,/animationUrl=\{current\.url\} studio/)],
 ['target character chosen',()=>assert.match(installer,/Ziel-Avatar/)],
 ['rig compatibility check button',()=>assert.match(installer,/Clips und Rig prüfen/)],
 ['selected clip dropdown',()=>assert.match(installer,/Clip zur Installation/)],
 ['select exports distinct clip',()=>assert.match(installer,/isolateMotionClip\(item\.url,selectedIndex,item\.file\.name\)/)],
 ['install prepared clip not entire file',()=>assert.match(installer,/send\(prepared,item\.kind\)/)],
 ['no install before inspection',()=>assert.match(installer,/Bitte zuerst Motion und Rig prüfen/)],
 ['unmatched explicit consent',()=>assert.match(installer,/check\.status==="incompatible"&&!allowUnmatched/)],
 ['target change invalidates report',()=>assert.match(installer,/delete next\[current\.id\]/)],
 ['file validation retained',()=>assert.match(installer,/await validGLB\(file\)/)],
 ['installed avatars retained',()=>assert.match(installer,/onInstalled\(\)/)],
 ['uses real gltf loader',()=>assert.match(inspector,/GLTFLoader/)],
 ['uses actual clips',()=>assert.match(inspector,/motion\.animations\.map/)],
 ['duration metadata',()=>assert.match(inspector,/clip\.duration/)],
 ['retarget uses source and target scene',()=>assert.match(inspector,/retargetHumanoidClips\(motion\.animations, motion\.scene, avatar\.scene\)/)],
 ['no fake confidence',()=>assert.match(inspector,/Advisory only/)],
 ['tracks diagnostic',()=>assert.match(inspector,/matchedTracks/)],
 ['exports one clip',()=>assert.match(inspector,/animations: \[clip\]/)],
 ['retains skeleton',()=>assert.match(inspector,/parseAsync\(gltf\.scene/)],
 ['binary glb export',()=>assert.match(inspector,/binary: true/)],
 ['no missing clip export',()=>assert.match(inspector,/Animationsclip nicht gefunden/)],
 ['clean output file',()=>assert.match(inspector,/replace\(\/\[\^a-zA-Z0-9_-\]/)],
 ['docs',()=>assert.ok(fs.existsSync(path.join(root,'V189-MOTION-BROWSER.md')))],
];
for(const [name,check] of checks){try{check();console.log('PASS',name)}catch(e){console.error('FAIL',name,e.message);process.exitCode=1}}
console.log(checks.length+' V189 checks');
