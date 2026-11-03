'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs');
const {load}=require('./helpers/ts-loader-v404.cjs');
const {planIntelligentConcertTransitionV849:plan,applyConcertTransitionGainV849:dim}=load('components/visualizer/intelligentConcertTransitionsV849');
const {DEFAULT_CONCERT_FX_V810:d,normalizeConcertFxV810:normalize}=load('components/visualizer/concertFxStudioV810');
let count=0;const check=(label,fn)=>{try{fn();count++}catch(e){e.message=`V849 ${label}: ${e.message}`;throw e;}};
const settings=normalize({transitionStrengthV849:100,transitionModeV849:'festival'});
const seam={active:true,kind:'act-change',edge:'exit',sceneIndex:2,proximity:.92,cameraRate:.75,lightingRate:.81};
const base={seam,settings,trackId:'verified-song',progressMs:43210,playing:true,reactive:true,reducedMotion:false,
  manualCamera:false,manualLighting:false,lyricsProtected:false,vocalFocus:false,castCount:2,
  tier:'high',section:'drop',budget:1};
const x=plan(base);
check('active on verified seam',()=>assert.equal(x.active,true));
check('exact reason',()=>assert.equal(x.reason,'verified-seam'));
check('music verification is prior V791 seam',()=>assert(x.seam.active&&x.seam.kind==='act-change'));
check('preserves scene identity',()=>assert.equal(x.sceneIndex,2));
check('preserves edge identity',()=>assert.equal(x.edge,'exit'));
check('preserves proximity',()=>assert.equal(x.proximity,.92));
check('camera no acceleration',()=>assert(x.cameraRate<=seam.cameraRate&&x.cameraRate>.4));
check('lighting no acceleration',()=>assert(x.lightingRate<=seam.lightingRate&&x.lightingRate>.4));
for(const k of ['ledGain','laserGain','festivalGain','overlayGain']){
 check(`${k} only dims`,()=>assert(x[k]<=1&&x[k]>.4));
 check(`${k} not unbounded`,()=>assert(Number.isFinite(x[k])));
}
check('camera and lighting share exact new seam',()=>assert(x.seam.cameraRate===x.cameraRate&&x.seam.lightingRate===x.lightingRate));
check('same inputs same outputs',()=>assert.deepEqual(plan(base),plan(base)));
check('does not modify original scene seam',()=>assert.deepEqual(seam,{active:true,kind:'act-change',edge:'exit',sceneIndex:2,proximity:.92,cameraRate:.75,lightingRate:.81}));
check('no mutation of source settings',()=>{const before=JSON.stringify(settings);plan(base);assert.equal(JSON.stringify(settings),before)});
for(const [label,patch] of Object.entries({
 'master off':{settings:{...settings,intelligentTransitionsV849:false}},
 'global FX off':{settings:{...settings,enabled:false}},
 'user strength off':{settings:{...settings,transitionStrengthV849:0}},
 'no playback':{playing:false},'no reactive':{reactive:false},
 'reduced motion':{reducedMotion:true},'low tier':{tier:'low'},
 'no seam':{seam:null},'inactive seam':{seam:{...seam,active:false}},
 'off kind':{seam:{...seam,kind:'off'}},'off edge':{seam:{...seam,edge:'off'}},
 'no track ID':{trackId:''},'long track ID':{trackId:'a'.repeat(181)},
 'negative time':{progressMs:-1},'nonfinite time':{progressMs:Infinity},
 'negative scene':{seam:{...seam,sceneIndex:-1}},'large scene':{seam:{...seam,sceneIndex:10001}},
 'negative proximity':{seam:{...seam,proximity:-.1}},'zero proximity':{seam:{...seam,proximity:0}},
 'beyond proximity':{seam:{...seam,proximity:1.1}},'nan proximity':{seam:{...seam,proximity:NaN}},
 'camera zero':{seam:{...seam,cameraRate:0}},'camera >1':{seam:{...seam,cameraRate:1.1}},
 'lighting zero':{seam:{...seam,lightingRate:0}},'lighting >1':{seam:{...seam,lightingRate:1.1}},
 'no cast':{castCount:0},'more than 4 cast':{castCount:5},'fractional cast':{castCount:2.5},
 'invalid section':{section:'fake'},'zero budget':{budget:0},'budget overflow':{budget:1.1},
 'nan budget':{budget:NaN},'authored camera and lighting':{manualCamera:true,manualLighting:true}
}))check(`fails closed ${label}`,()=>{const r=plan({...base,...patch});assert.equal(r.active,false);assert.strictEqual(r.seam,patch.seam===undefined?seam:patch.seam);});
for(const [label,patch] of Object.entries({
 'smooth':{settings:{...settings,transitionModeV849:'smooth'}},
 'cinematic':{settings:{...settings,transitionModeV849:'cinematic'}},
 'festival':{settings:{...settings,transitionModeV849:'festival'}},
 'hook':{section:'hook'},'build':{section:'build'},'verse':{section:'verse'},
 'break':{section:'break'},'intro':{section:'intro'},'finale':{section:'finale'},
 'lyrics protect':{lyricsProtected:true},'vocal protect':{vocalFocus:true},
 'ensemble protect':{castCount:4},'balanced tier':{tier:'balanced'},
 'small budget':{budget:.4},'entry':{seam:{...seam,edge:'entry'}},
 'intra-act':{seam:{...seam,kind:'intra-act'}}
}))check(`verified variation ${label}`,()=>{const r=plan({...base,...patch});assert(r.active);assert(r.ledGain<=1);assert(r.laserGain<=1);});
check('manual camera stays exact original speed',()=>{const r=plan({...base,manualCamera:true});assert(r.active);assert.equal(r.cameraRate,1);assert.equal(r.seam.cameraRate,1);});
check('manual lights keep original RGB/FX controls',()=>{const r=plan({...base,manualLighting:true});assert(r.active);assert.equal(r.lightingRate,1);assert.equal(r.ledGain,1);assert.equal(r.laserGain,1);assert.equal(r.festivalGain,1);});
check('strength monotonic',()=>assert(plan({...base,settings:{...settings,transitionStrengthV849:40}}).ledGain>=x.ledGain));
check('proximity monotonic',()=>assert(plan({...base,seam:{...seam,proximity:.3}}).ledGain>=x.ledGain));
check('lyrics diminish effect',()=>assert(plan({...base,lyricsProtected:true}).laserGain>=x.laserGain));
check('vocal diminish effect',()=>assert(plan({...base,vocalFocus:true}).festivalGain>=x.festivalGain));
check('group diminish effect',()=>assert(plan({...base,castCount:4}).overlayGain>=x.overlayGain));
check('balanced tier diminish effect',()=>assert(plan({...base,tier:'balanced'}).ledGain>=x.ledGain));
check('festival style more expressive than smooth',()=>assert(x.festivalGain<plan({...base,settings:{...settings,transitionModeV849:'smooth'}}).festivalGain));
check('never destroys zero FX',()=>assert.equal(dim(0,.5),0));
check('reduces active FX',()=>assert.equal(dim(.6,.5),.3));
check('rejects missing FX inputs',()=>assert.equal(dim(NaN,.5),0));
check('rejects unbounded FX input',()=>assert.equal(dim(.5,2),0));
check('normalization default on',()=>assert.equal(d.intelligentTransitionsV849,true));
check('normalization defaults strength',()=>assert.equal(d.transitionStrengthV849,65));
check('normalization defaults style',()=>assert.equal(d.transitionModeV849,'smooth'));
check('normalization explicit off',()=>assert.equal(normalize({intelligentTransitionsV849:false}).intelligentTransitionsV849,false));
check('normalization strength cap',()=>assert.equal(normalize({transitionStrengthV849:150}).transitionStrengthV849,100));
check('normalization strength floor',()=>assert.equal(normalize({transitionStrengthV849:-50}).transitionStrengthV849,0));
check('normalization bad strength',()=>assert.equal(normalize({transitionStrengthV849:NaN}).transitionStrengthV849,65));
check('normalization cinematic style',()=>assert.equal(normalize({transitionModeV849:'cinematic'}).transitionModeV849,'cinematic'));
check('normalization festival style',()=>assert.equal(normalize({transitionModeV849:'festival'}).transitionModeV849,'festival'));
check('normalization bad style',()=>assert.equal(normalize({transitionModeV849:'bad'}).transitionModeV849,'smooth'));
const three=fs.readFileSync('components/visualizer/ThreeAvatar.tsx','utf8');
const stage=fs.readFileSync('components/visualizer/DynamicStage.tsx','utf8');
const camera=fs.readFileSync('components/visualizer/StageCameraDirectorV289.tsx','utf8');
const ui=fs.readFileSync('components/visualizer/ConcertFxStudioPanelV810.tsx','utf8');
check('one shared scene coordinator',()=>assert.equal((three.match(/const coordinatedTransitionV849=planIntelligentConcertTransitionV849\(/g)||[]).length,1));
check('camera accepts coordinator scene',()=>assert(three.includes('transitionV791={coordinatedTransitionV849.seam??undefined} choreographyV792=')));
check('stage accepts same coordinator scene',()=>assert(three.includes('transitionV791={coordinatedTransitionV849.seam??undefined} transitionV849={coordinatedTransitionV849}')));
check('old camera smooth V791 authority retained',()=>assert(camera.includes('transitionV791.cameraRate')));
check('stage light V791 retained',()=>assert(stage.includes('transitionV791.lightingRate')));
check('LED 821 keeps V849 scene gain and authored LED priority',()=>{
 const line=stage.split(/\r?\n/).find(s=>s.includes('led.uniforms.uLed21Power.value='));
 assert(line,'V821 LED power assignment missing');
 assert(line.includes('wallV821.power*ledGainV823*'),'V821 LED power must use V823 gain');
 assert(line.includes('(authoredFxV823.led.boost>.001||authoredFxV823.led.mute>.001?1:ledBlendV849)'),
   'Authored LED settings must bypass V849 scene dimming');
});
check('LED 842 depth uses same scene gain',()=>assert(stage.includes('u.uLed42Power.value=wallDepthV842.power*')));
check('laser scene gain only on V823 automatic lanes',()=>assert(stage.includes('laserBlendV849)')));
check('festival scene gain only reduces existing instances',()=>assert(stage.includes('special.co2Count*festivalBlendV849')));
check('metallic rain reduced at seam',()=>assert(stage.includes('finale.rainCount*festivalBlendV849')));
check('full-stage flash remains independent and opt-in',()=>assert(stage.includes('planFullStageFlashV8441(')));
check('V819 transition opacity eased',()=>assert(stage.includes('c.opacity*transitionGainV823*overlayBlendV849')));
check('V849 does not create a new render loop',()=>{const src=fs.readFileSync('components/visualizer/intelligentConcertTransitionsV849.ts','utf8');assert(!src.includes('useFrame(')&&!src.includes('Math.random(')&&!src.includes('setInterval('));});
check('UI opt-in and intensity configured',()=>assert(ui.includes('intelligentTransitionsV849:e.target.checked')&&ui.includes('transitionStrengthV849:+e.target.value')));
check('UI transition mode configured',()=>assert(ui.includes("transitionModeV849:e.target.value as ConcertFxSettingsV810['transitionModeV849']")));
check('package/lock versions equal',()=>assert.equal(require('../package.json').version,require('../package-lock.json').version));
check('production gates prepend V849',()=>{const p=require('../package.json');for(const k of ['check:fast','check:release','build:preflight'])assert(p.scripts[k].includes('npm run test:v850 && npm run test:v850:types && npm run test:v849 && npm run test:v849:types && npm run test:v848'));});
console.log(`PASS V849: ${count} intelligent-transition test groups`);
