const assert=require('node:assert/strict');const fs=require('node:fs');const path=require('node:path');
const root=path.join(__dirname,'..');const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const code=read('components/visualizer/avatarAutoSelection.ts');const panel=read('components/AvatarFrameProfilerPanel.tsx');
assert.match(code,/samples>=80/);assert.match(code,/availableIds/);assert.match(code,/ids.length===count/);
assert.match(panel,/onClick={applySelection}/);assert.match(panel,/autoAvatarByGenre:false/);
assert.match(panel,/secondaryAvatarModelId:selection.ids\[1\]/);assert.match(panel,/disabled={!selection.ready}/);
assert.match(JSON.parse(read('package.json')).version,/^0\.1\.0-v(259|260|261|262|324|325|326|327|328|329|330|331|332|333|334|335|336|337|338|339|340|341|342|343|344|345|346|347|348|349|350|351|352)$/);console.log('PASS V259 selection regression');
