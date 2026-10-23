const assert=require('node:assert/strict');
const fs=require('node:fs');const path=require('node:path');
const root=path.join(__dirname,'..');
const read=(p)=>fs.readFileSync(path.join(root,p),'utf8');
const animation=read('config/musicGenres.ts');
const genre=read('components/animation/GenreAvatar.tsx');
const genres=['hardstyle','hardtekk','techno','hiphop','rock','ambient','pop'];
for(const name of genres) assert.ok(animation.includes(name+':'), 'Registry missing '+name);
assert.ok(genre.includes('MUSIC_GENRES[genre]'));
assert.ok(fs.existsSync(path.join(root,'components/visualizer/performanceBenchmarkMetrics.ts')));
assert.ok(!fs.existsSync(path.join(root,'components/visualizer/performanceBenchmark.ts')));
const dashboard=read('components/visualizer/AdaptiveMotionQualityDashboard.tsx');
assert.ok(dashboard.includes('performanceBenchmarkMetrics'));
for(const symbol of ['finishBenchmark','BENCHMARK_MIN_SAMPLES','appendBenchmark','benchmarkDelta']){
 assert.ok(read('components/visualizer/performanceBenchmarkMetrics.ts').includes(symbol),symbol);
}
assert.match(require('../package.json').version,/^0\.1\.0-v(?:24[8-9]|2[5-9]\d|[3-9]\d\d|324|325|326|327|328|329|330|331|332|333|334|335|336|337|338|339|340|341|342|343|344|345|346|347|348|349|350|351|352)$/);
console.log('V244 build stability checks passed');
