require('./helpers/project-version-v651.cjs').assertProjectVersionAtLeast(259);
const assert=require('node:assert/strict');const fs=require('node:fs');const path=require('node:path');
const root=path.join(__dirname,'..');const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const code=read('components/visualizer/avatarAutoSelection.ts');const panel=read('components/AvatarFrameProfilerPanel.tsx');
assert.match(code,/samples>=80/);assert.match(code,/availableIds/);assert.match(code,/ids.length===count/);
assert.match(panel,/onClick={applySelection}/);assert.match(panel,/autoAvatarByGenre:false/);
assert.match(panel,/secondaryAvatarModelId:selection.ids\[1\]/);assert.match(panel,/disabled={!selection.ready}/);
assert.match(JSON.parse(read('package.json')).version,/^0\.1\.0-v\d+$/);console.log('PASS V259 selection regression');
