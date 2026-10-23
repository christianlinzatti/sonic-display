'use strict';
/** Ensure Windows and Linux resolve source imports the same way, including TS/TSX priority. */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const extensions=new Set(['.ts','.tsx','.js','.jsx','.mts','.cts','.mjs','.cjs']);
const ignored=new Set(['node_modules','.next','.git','dist','build','coverage']);
function scan(base){
 const files=[];
 function walk(dir){for(const entry of fs.readdirSync(dir,{withFileTypes:true})){
  if(entry.isDirectory()){if(!ignored.has(entry.name))walk(path.join(dir,entry.name));}
  else if(entry.isFile()&&extensions.has(path.extname(entry.name)))files.push(path.relative(base,path.join(dir,entry.name)).split(path.sep).join('/'));
 }}walk(base);return files;
}
function check(files){
 const conflicts=[];const byModule=new Map();
 for(const file of files){
  // TS and TSX variants with identical basename are ambiguous on case-insensitive filesystems.
  const key=file.replace(/\.(tsx?|jsx?|mts|cts|mjs|cjs)$/i,'').toLowerCase();
  const existing=byModule.get(key);
  if(existing && existing!==file)conflicts.push(`${existing} <> ${file}`);
  else byModule.set(key,file);
 }
 return conflicts;
}
const files=scan(root);
assert.deepEqual(check(files),[],`Ambiguous module names (case/extension):\n${check(files).join('\n')}`);
// Guard against regressions in this test's ability to catch the exact original defect.
assert.equal(check(['components/visualizer/CinematicCameraTimelineV400.tsx','components/visualizer/cinematicCameraTimelineV400.ts']).length,1);
assert.equal(check(['components/visualizer/CameraPerformanceStudioV398.tsx','components/visualizer/cameraPerformanceStudioV398.ts']).length,1);
const settings=fs.readFileSync(path.join(root,'components/SettingsPanel.tsx'),'utf8');
assert(settings.includes('visualizer/CinematicCameraTimelinePanelV400'));
assert(settings.includes('visualizer/CameraPerformanceStudioPanelV398'));
for(const name of ['CinematicCameraTimelinePanelV400.tsx','CameraPerformanceStudioPanelV398.tsx'])assert(fs.existsSync(path.join(root,'components/visualizer',name)));
console.log(`PASS module casing regression: ${files.length} source files, no case-insensitive TS/TSX module collisions`);
