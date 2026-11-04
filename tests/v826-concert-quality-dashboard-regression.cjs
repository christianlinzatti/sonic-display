'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {load}=require('./helpers/ts-loader-v404.cjs');
const {normalizeConcertFxV810}=load('components/visualizer/concertFxStudioV810');
const {
 createConcertQualityMonitorV826,resetConcertQualityMonitorV826,sampleConcertQualityV826,
 accumulateConcertFrameV826,completeConcertQualityV826,
 qualityCountsV826,qualityDiagnosticsV826,EMPTY_QUALITY_SNAPSHOT_V826,getConcertQualityV826,
 publishConcertQualityV826,clearConcertQualityV826,subscribeConcertQualityV826,
 CONCERT_QUALITY_LANES_V826
}=load('components/visualizer/concertQualityTelemetryV826');
let groups=0;const check=(label,fn)=>{try{fn();groups++}catch(e){e.message=label+': '+e.message;throw e;}};
const gains=Object.fromEntries(CONCERT_QUALITY_LANES_V826.map(l=>[l,1]));
const input=(o={})=>({playing:true,verified:true,targetFps:60,pressure:0,fxCapacity:12,fxCost:11,
 fxActive:true,gains,counts:{crowd:42,sparks:25,shards:14,confetti:6,energyRings:3,
 foamBubbles:56,foamMist:25,kineticColumns:8,spectralWaves:4,spectralRings:6,spectralPrisms:16},
 rendererCalls:60,rendererTriangles:20000,rendererGeometries:160,rendererTextures:80,performanceTier:'high',...o});
const run=(delta,frames,o={})=>{
 let s=null;const m=createConcertQualityMonitorV826();
 for(let i=0;i<frames;i++)s=sampleConcertQualityV826(m,delta,input(o))??s;
 return s;
};
check('default opt-in live diagnostic on',()=>assert.equal(normalizeConcertFxV810().qualityDashboardV826,true));
check('can disable performance dashboard',()=>assert.equal(normalizeConcertFxV810({qualityDashboardV826:false}).qualityDashboardV826,false));
check('invalid persisted value falls back safely',()=>assert.equal(normalizeConcertFxV810({qualityDashboardV826:'false'}).qualityDashboardV826,true));
check('older V825 settings survive upgrade',()=>{const s=normalizeConcertFxV810({foamCannon:false,perfModeV825:'fps',ledLookV821:'tunnel'});assert.equal(s.foamCannon,false);assert.equal(s.perfModeV825,'fps');assert.equal(s.ledLookV821,'tunnel');});
check('empty snapshot marks unavailable',()=>{assert.equal(EMPTY_QUALITY_SNAPSHOT_V826.available,false);assert.equal(EMPTY_QUALITY_SNAPSHOT_V826.status,'unavailable')});
check('monitor starts with empty window',()=>{let m=createConcertQualityMonitorV826();assert.equal(m.frames,0);assert.equal(m.windowSeconds,0);assert.equal(m.timeCount,0)});
check('does not publish every frame',()=>{let m=createConcertQualityMonitorV826();for(let i=0;i<20;i++)assert.equal(sampleConcertQualityV826(m,1/60,input()),null)});
check('publishes after >=0.5 seconds',()=>{assert(run(1/60,32)?.available)});
check('normal 60fps detects ~60fps',()=>{let s=run(1/60,60);assert(s.fps>=59&&s.fps<=61);assert.equal(s.status,'healthy')});
check('normal frame time ~16.7ms',()=>{let s=run(1/60,32);assert(s.frameMs>=16.6&&s.frameMs<=16.8)});
check('sample count reports actual window count',()=>{let s=run(1/60,32);assert(s.sampleCount>=30&&s.sampleCount<=32)});
check('window 30fps target supported',()=>{let s=run(1/30,30,{targetFps:30});assert.equal(s.status,'healthy')});
check('30fps on 60 target warns',()=>{let s=run(1/30,31);assert(s.status==='warning'||s.status==='critical')});
check('12fps on 60 target critical',()=>{let s=run(1/12,10);assert.equal(s.status,'critical')});
check('90 percent spikes yield poor p95',()=>{let m=createConcertQualityMonitorV826(),s=null;for(let i=0;i<28;i++)s=sampleConcertQualityV826(m,i%2?1/35:1/60,input())??s;assert(s.p95FrameMs>=28)});
check('slow frame share correctly 0 at 60fps',()=>assert.equal(run(1/60,32).slowFrameShare,0));
check('slow frame share 1 for sustained 25fps',()=>assert.equal(run(1/25,20).slowFrameShare,1));
check('invalid NaN ignored',()=>{let m=createConcertQualityMonitorV826();assert.equal(sampleConcertQualityV826(m,NaN,input()),null);assert.equal(m.frames,0)});
check('invalid negative ignored',()=>{let m=createConcertQualityMonitorV826();assert.equal(sampleConcertQualityV826(m,-.5,input()),null);assert.equal(m.frames,0)});
check('browser wake-up spike resets data window',()=>{let m=createConcertQualityMonitorV826();sampleConcertQualityV826(m,.04,input());sampleConcertQualityV826(m,3,input());assert.equal(m.frames,0)});
check('paused footage not categorized as GPU alarm',()=>assert.equal(run(1/12,8,{playing:false}).status,'paused'));
check('paused recommendation explains difference',()=>assert(run(1/60,34,{playing:false}).recommendations[0].includes('pausiert')));
check('verified song gate is displayed',()=>assert(run(1/60,33,{verified:false}).recommendations.some(x=>x.includes('verifizierte'))));
check('counts preserve renderer proposed instances',()=>{let s=run(1/60,33);assert.equal(s.counts.foamBubbles,56);assert.equal(s.counts.sparks,25)});
check('sanitizes invalid negative counts',()=>{let c=qualityCountsV826({sparks:-7,foamMist:NaN,crowd:Infinity});assert.equal(c.sparks,0);assert.equal(c.foamMist,0);assert.equal(c.crowd,0)});
check('huge count clamps safely',()=>assert.equal(qualityCountsV826({sparks:1e12}).sparks,100000));
check('counts rounded down to integers',()=>assert.equal(qualityCountsV826({foamBubbles:8.9}).foamBubbles,8));
check('telemetry gains copy does not mutate source',()=>{let g={...gains};let s=run(1/60,32,{gains:g});g.foam=.1;assert.equal(s.gains.foam,1)});
check('gain values bounded',()=>assert.equal(run(1/60,32,{gains:{...gains,foam:2,laser:-2}}).gains.foam,1));
check('invalid renderer counters sanitized',()=>assert.equal(run(1/60,32,{rendererCalls:NaN}).rendererCalls,0));
check('invalid pressure clamps',()=>assert.equal(run(1/60,32,{pressure:Infinity}).pressure,0));
check('critical recommends load reduction',()=>assert(run(1/12,8).recommendations.some(x=>x.includes('Bildrate'))));
check('throttling recommends budget reduction',()=>assert(run(1/60,32,{pressure:.8}).recommendations.some(x=>x.includes('V825'))));
check('preserves window sample bounds',()=>{let m=createConcertQualityMonitorV826();for(let i=0;i<80;i++)sampleConcertQualityV826(m,1/120,input());assert(m.timeCount<=90)});
check('monitor reset removes previous samples',()=>{let m=createConcertQualityMonitorV826();sampleConcertQualityV826(m,1/50,input());resetConcertQualityMonitorV826(m);assert.equal(m.timeCount,0);assert.equal(m.frames,0)});
check('subscribe receives snapshots and reset',()=>{clearConcertQualityV826();let events=0;const stop=subscribeConcertQualityV826(()=>events++);let s=run(1/60,31);publishConcertQualityV826(s);assert.equal(getConcertQualityV826(),s);clearConcertQualityV826();assert.equal(events,2);stop();});
check('unsubscribe stops notifications',()=>{let events=0;let stop=subscribeConcertQualityV826(()=>events++);stop();clearConcertQualityV826();assert.equal(events,0)});
check('10 distinct effect lanes',()=>assert.equal(new Set(CONCERT_QUALITY_LANES_V826).size,10));
const read=f=>fs.readFileSync(path.resolve(__dirname,'../',f),'utf8');
const stage=read('components/visualizer/DynamicStage.tsx'),ui=read('components/visualizer/ConcertQualityDashboardV826.tsx');
const panel=read('components/visualizer/ConcertFxStudioPanelV810.tsx');
const settings=read('components/SettingsPanel.tsx'),core=read('components/visualizer/concertQualityTelemetryV826.ts');
check('R3F frames drive monitor',()=>assert(stage.includes('accumulateConcertFrameV826(qualityMonitorV826.current,delta')));
check('only actual post-budget counts sampled',()=>{assert(stage.indexOf('completeConcertQualityV826(')>stage.indexOf('bubbles:Math.floor(c.bubbles*g)'));assert(stage.includes('sparks:c.active?c.sparks:0'))});
check('FPS source is actual R3F delta',()=>assert(stage.includes('qualityMonitorV826.current,delta')));
check('metadata allocated only on publish frame',()=>{assert(stage.indexOf('if(accumulateConcertFrameV826(')<stage.indexOf('const info=state.gl.info'));assert(stage.includes('completeConcertQualityV826(qualityMonitorV826.current,'))});
check('split accumulator and snapshot match',()=>{const m=createConcertQualityMonitorV826();let snap;for(let k=0;k<40;k++)if(accumulateConcertFrameV826(m,1/60,60))snap=completeConcertQualityV826(m,input());assert(snap?.fps>=59)});
check('renderer info read from existing GL context',()=>assert(stage.includes('const info=state.gl.info')));
check('no expensive recursive stage traversal',()=>assert(!core.includes('traverse(')));
check('no new GPU assets allocated',()=>{for(let t of ['new InstancedMesh','new WebGLRenderer','new ShaderMaterial','new GPUQuery','requestAnimationFrame','setInterval'])assert(!core.includes(t),t)});
check('unsubscribe uses React useSyncExternalStore',()=>assert(ui.includes('useSyncExternalStore(')));
check('no direct React state per frame',()=>assert(!stage.includes('setConcertQuality')));
check('settings controls persisted opt-out',()=>assert(panel.includes('patch({qualityDashboardV826:e.target.checked})')));
check('diagnostics tab contains live dashboard',()=>assert(settings.includes('<ConcertQualityDashboardV826 enabled=')));
check('FPS, P95 and draw calls are displayed',()=>{for(let s of ['FPS','p95FrameMs','rendererCalls','foamBubbles'])assert(ui.includes(s),s)});
check('UI honestly labels estimated effect cost',()=>assert(ui.includes('Schaetzungen')||ui.includes('Kostenprognose')));
check('no network or storage writes',()=>{for(let s of ['fetch(','localStorage','sessionStorage','XMLHttpRequest','WebSocket','sendBeacon'])assert(!core.includes(s),s)});
check('clear on stage unmount',()=>assert(/useEffect\(\(\)=>\(\)=>\{[^}]*clearConcertQualityV826\(\)[^}]*\},\[\]\)/.test(stage)));
check('performance feature toggle avoids measurement',()=>assert(stage.includes('qualityDashboardV826!==false')));
check('no dashboards rendered within R3F group',()=>assert(!stage.includes('<ConcertQualityDashboardV826')));
console.log('PASS V826 Concert Quality Dashboard:',groups,'test groups');
