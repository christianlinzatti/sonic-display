require('./helpers/project-version-v651.cjs').assertProjectVersionAtLeast(248);
require('./helpers/threeAvatarSourcesV492.cjs').install();
const fs=require('fs'); const assert=require('assert');
const read=p=>fs.readFileSync(require('path').join(__dirname,'..',p),'utf8');
const home=read('components/SonicDisplay.tsx');
const settings=read('components/SettingsPanel.tsx');
for(const name of ['VisualizerStage','AudioVisualizer']) {
  assert.match(home,new RegExp('const '+name+' = dynamic\\('),name+' must be lazy');
  assert.doesNotMatch(home,new RegExp('import \\{'+name+'\\} from'),name+' must not be eager');
}
for(const name of ['AvatarEditor','AvatarPreview3D','RetargetingStudio','DanceDebugger','PerformanceBenchmark','RenderDiagnosticsPanel','AudioDebugPanel','AvatarAssetOptimizationStudio','MotionTimelineStudio']) {
  assert.match(settings,new RegExp('const '+name+' = dynamic\\('),name+' must be lazy');
}
assert.match(home,/SmartLazySettings/);
assert.match(read('components/visualizer/ThreeAvatar.tsx'),/audio\.bpm \?\? undefined/);
assert.doesNotMatch(read('components/visualizer/ThreeAvatar.tsx'), /root\.current\.rotation\.y \+= \(\(motion\.bodySway \+ natural\.hipSway/);
assert.match(read('hooks/useMicrophoneAnalysis.ts'), /typeof accent\.accent === \"number\"/);
assert.match(require('../package.json').version,/^0\.1\.0-v\d+$/);
console.log('V247 lazy-loading and build stability regression passed');
