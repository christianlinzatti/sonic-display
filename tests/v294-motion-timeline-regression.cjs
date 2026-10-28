const assert = require('node:assert/strict');
const fs = require('node:fs');const path=require('node:path');
const read = p => fs.readFileSync(path.join(__dirname,'..',p),'utf8');
const preview=read('components/visualizer/CameraLivePreviewV291.tsx');
const editor=read('components/visualizer/CameraPresetStudioV290.tsx');
require('./helpers/project-version-v651.cjs').assertProjectVersionAtLeast(294);
for (const term of ['mixer.setTime(next)', 'seek?.revision', 'onMotionProgress', 'selectedClip.duration','lastProgress']) assert.ok(preview.includes(term),term);
for (const term of ['camera-motion-scrub-v294','Pose einfrieren','−1 Frame','+1 Frame','seekTo','setMotionPlaying(false)','Perspektive speichern']) assert.ok(editor.includes(term),term);
console.log('V294 motion timeline regression OK');
