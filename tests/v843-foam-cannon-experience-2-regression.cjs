'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {load}=require('./helpers/ts-loader-v404.cjs');
const {normalizeConcertFxV810:normalize,planConcertFxV810:planFX,DEFAULT_CONCERT_FX_V810:defaults}=load('components/visualizer/concertFxStudioV810');
const {planFoamCannonV817:planFoam,createFoamLayoutV817:layout,FOAM_CAPS_V817:caps}=load('components/visualizer/foamCannonPlannerV817');
const {planFoamExperienceV843:plan,sampleFoamParticleV843:sample,FOAM_EXPERIENCE_OFF_V843:off}=load('components/visualizer/foamExperiencePlannerV843');
const settings=normalize({intensity:100,foamIntensity:100,quality:'ultra',foamRealismV843:90,foamStyleV843:'festival'});
const fxBase={settings,genre:'Hardtekk',section:'drop',progressMs:5000,startMs:0,endMs:10000,
 active:true,verified:true,playing:true,reactive:true,reducedMotion:false,authored:false,blackout:false,
 lyricsProtected:false,vocalFocus:false,groupCount:1,tier:'high',energy:.95,kick:.9,bass:.87,mids:.65,highs:.6,ledBudget:1,laserBudget:1};
const fx=planFX(fxBase),cue=planFoam({fx,settings,tier:'high',lyricsProtected:false,vocalFocus:false,groupCount:1,energy:.95,kick:.9,foamBudget:1});
const base={cue,fx,settings,tier:'high',lyricsProtected:false,vocalFocus:false,groupCount:1};
let passed=0;
function test(name,fn){try{fn();passed++;}catch(e){e.message=`V843 ${name}: ${e.message}`;throw e;}}
const good=plan(base);
test('verified hardtekk foam remains active',()=>assert(good.active&&cue.active));
test('source original limits unchanged',()=>assert(cue.bubbles<=caps.bubbles&&cue.mist<=caps.mist&&cue.opacity<=.62));
test('source objects never mutated',()=>{let s=JSON.stringify(base);plan(base);assert.equal(JSON.stringify(base),s)});
test('deterministic planning',()=>assert.deepEqual(plan(base),good));
test('finite and bounded planner values',()=>{for(const k of ['arc','flutter','settle','burst'])assert(good[k]>=0&&good[k]<=1)});
test('stage passes real verified FX reason',()=>assert.equal(fx.reason,'music'));
for(const [name,patch] of Object.entries({
 'globally disabled':{settings:{...settings,enabled:false}},
 'foam disabled':{settings:{...settings,foamCannon:false}},
 'experience disabled':{settings:{...settings,foamExperienceV843:false}},
 'zero realism':{settings:{...settings,foamRealismV843:0}},
 'invalid realism':{settings:{...settings,foamRealismV843:NaN}},
 'invalid cue phase':{cue:{...cue,phase:NaN}},
 'invalid cue power':{cue:{...cue,power:Infinity}},
 'zero power':{cue:{...cue,power:0}},
 'zero opacity':{cue:{...cue,opacity:0}},
 'two bubbles missing':{cue:{...cue,bubbles:1}},
 'two mist missing':{cue:{...cue,mist:1}},
 'foam muted by timeline':{cue:{...cue,active:false}},
 'low tier':{tier:'low'},
 'no cast':{groupCount:0},'too many cast':{groupCount:5},'fractional cast':{groupCount:1.5},
 'unverified cue':{fx:{...fx,reason:'unverified'}},
 'inactive FX':{fx:{...fx,active:false}},
 'verse':{fx:{...fx,section:'verse'}},
 'intro':{fx:{...fx,section:'intro'}},
 'break':{fx:{...fx,section:'break'}},
})){test(`fail closed – ${name}`,()=>assert.deepEqual(plan({...base,...patch}),off));}
for(const section of ['hook','build','drop','finale'])test(`verified ${section} option`,()=>assert(plan({...base,fx:{...fx,section}}).active));
test('hardtekk drop stronger than hook',()=>assert(good.burst>plan({...base,fx:{...fx,section:'hook'}}).burst));
test('hardtekk drop stronger than rap',()=>assert(good.burst>plan({...base,fx:{...fx,genre:'rap'}}).burst));
test('lyrics protection reduces motion',()=>assert(plan({...base,lyricsProtected:true}).burst<good.burst));
test('vocal protection reduces motion',()=>assert(plan({...base,vocalFocus:true}).burst<good.burst));
test('4 performers less motion',()=>assert(plan({...base,groupCount:4}).burst<good.burst));
test('low cue power less motion',()=>assert(plan({...base,cue:{...cue,power:cue.power*.35}}).burst<good.burst));
test('soft style gentler',()=>assert(plan({...base,settings:{...settings,foamStyleV843:'soft'}}).flutter<good.flutter));
test('natural style supported',()=>assert.equal(plan({...base,settings:{...settings,foamStyleV843:'natural'}}).style,'natural'));
test('unknown style returns natural',()=>assert.equal(plan({...base,settings:{...settings,foamStyleV843:'bogus'}}).style,'natural'));
test('landing is optional',()=>assert.equal(plan({...base,settings:{...settings,foamLandingV843:false}}).settle,0));
test('landing defaults enabled',()=>assert.equal(defaults.foamLandingV843,true));
test('migration preserves default',()=>assert.equal(normalize({foamCannon:true}).foamExperienceV843,true));
test('invalid intensity normalizes',()=>assert.equal(normalize({foamRealismV843:Infinity}).foamRealismV843,65));
test('realism upper cap',()=>assert.equal(normalize({foamRealismV843:900}).foamRealismV843,100));
test('realism lower cap',()=>assert.equal(normalize({foamRealismV843:-5}).foamRealismV843,0));
test('invalid style normalizes',()=>assert.equal(normalize({foamStyleV843:'nonsense'}).foamStyleV843,'natural'));
test('valid styles normalize',()=>{for(const style of ['soft','natural','festival'])assert.equal(normalize({foamStyleV843:style}).foamStyleV843,style)});
test('explicit optout preserved',()=>assert.equal(normalize({foamExperienceV843:false}).foamExperienceV843,false));
test('bounce option optout preserved',()=>assert.equal(normalize({foamLandingV843:false}).foamLandingV843,false));
const pose={x:0,y:0,z:0,scale:0};
test('sample returns same reusable output',()=>assert.strictEqual(sample(layout(1)[0],.4,false,good,pose),pose));
test('sample deterministic',()=>{const p=layout(1)[0];sample(p,.3,false,good,pose);let copy={...pose};sample(p,.3,false,good,pose);assert.deepEqual(pose,copy)});
test('invalid phase collapses safely',()=>{sample(layout(1)[0],NaN,false,good,pose);assert.equal(pose.scale,0)});
test('inactive motion collapses',()=>{sample(layout(1)[0],1,false,off,pose);assert.equal(pose.scale,0)});
test('different seed different pose',()=>{const p=layout(2);sample(p[0],.44,false,good,pose);const a={...pose};sample(p[1],.44,false,good,pose);assert.notDeepEqual(pose,a)});
test('mist smaller than large foam bubbles',()=>{const p=layout(1)[0];sample(p,.27,false,good,pose);const big=pose.scale;sample(p,.27,true,good,pose);assert(pose.scale<big)});
test('stage wing guard for both sides and full cycles',()=>{for(const tiny of [false,true])for(const max of [caps.bubbles,caps.mist])for(const p of layout(max))for(let t=0;t<=10;t++){sample(p,t/10,tiny,good,pose);assert(Number.isFinite(pose.x)&&Number.isFinite(pose.y)&&Number.isFinite(pose.z)&&Number.isFinite(pose.scale));assert(Math.abs(pose.x)-pose.scale>=3.25);assert(pose.y>=-.20);assert(pose.scale>=0&&pose.scale<=.23)}});
test('no per-sample randomness',()=>{const src=fs.readFileSync('components/visualizer/foamExperiencePlannerV843.ts','utf8');assert(!src.includes('Math.random(')&&!src.includes('setInterval('))});
const stage=fs.readFileSync('components/visualizer/DynamicStage.tsx','utf8');
const renderer=fs.readFileSync('components/visualizer/FoamCannonV817.tsx','utf8');
const studio=fs.readFileSync('components/visualizer/ConcertFxStudioPanelV810.tsx','utf8');
test('stage evaluates V843 after legacy V825 actual instance budget',()=>{assert(stage.indexOf('planFoamExperienceV843({')>stage.indexOf('const c=foamCueV817.current,g=fxPerfV825.gains.foam;'))});
test('stage uses existing V817 rendering',()=>assert(stage.includes('<FoamCannonV817 cueRef={foamCueV817}/>')));
test('renderer still only two instanced draw meshes',()=>assert.equal((renderer.match(/<instancedMesh /g)||[]).length,2));
test('renderer has opt-out legacy trajectory',()=>assert(renderer.includes('if(cue.experienceV843?.active)')&&renderer.includes('const size=(tiny?.034:.083)*p.size')));
test('render uses scratch pose not new objects per frame',()=>assert(renderer.includes('sampleFoamParticleV843(p,cue.phase,tiny,cue.experienceV843,pose)')));
test('no additional frame hook',()=>assert.equal((renderer.match(/useFrame\(/g)||[]).length,1));
test('renderer excludes fake physical hardware',()=>assert(!renderer.includes('<spotLight')&&!renderer.includes('Math.random(')));
test('studio contains settings and truthful preview',()=>{for(const x of ['V843 · Foam Cannon Experience 2.0','foamRealismV843','foamLandingV843','foamExperienceV843','foamStyleV843','foamMotionPreviewV843'])assert(studio.includes(x),x)});
test('backup persists concert FX settings',()=>assert(fs.readFileSync('services/settings/unifiedBackup.ts','utf8').includes('sonic-display-ui-preferences-v1')));
test('V817 seed bounds retained',()=>assert.equal(caps.bubbles+caps.mist,288));
test('package/lock version',()=>{const version=require('../package.json').version;assert.equal(require('../package-lock.json').version,version);assert(/^0\.1\.0-v(?:84[3-9]|850)$/.test(version));});
test('gates require V843 both',()=>{let p=require('../package.json');for(const g of ['check:fast','check:release','build:preflight'])assert(p.scripts[g].includes('npm run test:v843 && npm run test:v843:types &&'))});
test('CI pipeline retained',()=>assert(fs.existsSync('.github/workflows/v832-continuous-validation.yml')));
console.log(`PASS V843: ${passed} foam-cannon experience test groups`);
