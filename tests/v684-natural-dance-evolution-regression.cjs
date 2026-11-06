'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {load}=require('./helpers/ts-loader-v404.cjs');
const {refineNaturalDanceRigV684:rig,refineGroupFootworkV684:group,danceCharacterV684:character}=load('components/visualizer/naturalDanceEvolutionV684');
let checks=0;
const test=(name,fn)=>{try{fn();checks++;}catch(e){e.message=`V684 ${name}: ${e.message}`;throw e;}};
const source={headNod:.08,headTurn:.05,spineSway:.14,hipSway:.12,shoulderRoll:.1,followThrough:.14,
 headLag:.06,chestPulse:.1,armSwing:.22,legGroove:.15,footStep:.11,weightShift:.08,beatImpulse:.13,
 expressionJaw:.6,expressionBrow:.3,expressionEyeNarrow:.2,expressionHeadTilt:.1,
 leftArmAccent:.012,rightArmAccent:-.008,torsoTwist:.02};
const base={trackId:'track-A',seconds:14,playing:true,reducedMotion:false,manualPriority:false,
 quality:'high',genre:'deutschrap',section:'verse',slot:0,footContactKnown:true,plantedLeft:false,plantedRight:false};
const foot={active:true,slots:Array.from({length:4},(_,i)=>({offsetX:i*.01,offsetZ:-i*.01,
 liftLeft:.18,liftRight:.24,rootSpeed:.62,weightShift:.012}))};
const supports=Array.from({length:4},()=>({tracked:true,leftPlanted:false,rightPlanted:false}));
const grp={...base,support:supports,automaticGroup:true};
const same=(a,b)=>assert.strictEqual(a,b);
const finiteMotion=(m)=>{for(const v of Object.values(m))if(typeof v==='number')assert(Number.isFinite(v));};
const sameProtectedFields=(m)=>{
 for(const k of ['headNod','headTurn','spineSway','chestPulse','legGroove','footStep','beatImpulse',
 'expressionJaw','expressionBrow','expressionEyeNarrow','expressionHeadTilt','torsoTwist'])assert.equal(m[k],source[k],k);
};
test('genre deutschrap',()=>assert.equal(character('Deutschrap'),'rap-flow'));
test('genre hip hop trap drill',()=>['hip-hop','trap','drill'].forEach(x=>assert.equal(character(x),'rap-flow')));
test('genre hardtekk',()=>assert.equal(character('Hardtekk'),'hard-dance'));
test('genre hardstyle rawstyle',()=>['hardstyle','rawstyle','hardcore'].forEach(x=>assert.equal(character(x),'hard-dance')));
test('genre rock pop neutral',()=>['rock','pop',undefined,''].forEach(x=>assert.equal(character(x),'other')));
test('enabled automatic motion changes accents',()=>assert.notDeepEqual(rig(source,base),source));
test('retains all untouched keys',()=>sameProtectedFields(rig(source,base)));
test('does not mutate input motion',()=>{const copy={...source};rig(source,base);assert.deepEqual(source,copy);});
test('same time deterministic',()=>assert.deepEqual(rig(source,base),rig(source,{...base})));
test('song-clock variation exists',()=>assert.notDeepEqual(rig(source,base),rig(source,{...base,seconds:19})));
test('performer variation exists',()=>assert.notDeepEqual(rig(source,base),rig(source,{...base,slot:1})));
test('hard dance differs from rap',()=>assert.notDeepEqual(rig(source,base),rig(source,{...base,genre:'hardtekk'})));
test('other genre still bounded',()=>finiteMotion(rig(source,{...base,genre:'pop'})));
test('hook and break distinct',()=>assert.notDeepEqual(rig(source,{...base,section:'hook'}),rig(source,{...base,section:'break'})));
test('stoppage returns exact input object',()=>same(rig(source,{...base,playing:false}),source));
test('reduced motion returns exact input object',()=>same(rig(source,{...base,reducedMotion:true}),source));
test('manual override returns exact input object',()=>same(rig(source,{...base,manualPriority:true}),source));
test('low quality returns exact input object',()=>same(rig(source,{...base,quality:'low'}),source));
test('missing contact returns exact input object',()=>same(rig(source,{...base,footContactKnown:false}),source));
test('no track returns exact input object',()=>same(rig(source,{...base,trackId:null}),source));
test('blank track returns exact input object',()=>same(rig(source,{...base,trackId:'   '}),source));
test('invalid seconds (negative, NaN, infinity)',()=>[-2,NaN,Infinity].forEach(seconds=>same(rig(source,{...base,seconds}),source)));
test('slot outside supported range',()=>[-1,4,1.5,NaN].forEach(slot=>same(rig(source,{...base,slot}),source)));
test('invalid source data fail closed',()=>same(rig({...source,footStep:Infinity},base).footStep,Infinity));
test('source stillness stays still',()=>{const quiet={...source,armSwing:0,followThrough:0,hipSway:0,weightShift:0,shoulderRoll:0,headLag:0,leftArmAccent:0,rightArmAccent:0};
 const m=rig(quiet,base);for(const k of ['armSwing','followThrough','hipSway','weightShift','shoulderRoll','headLag','leftArmAccent','rightArmAccent'])assert.equal(m[k],0,k);});
test('arms never receive over 45 milliradian new asymmetry',()=>{
 const noAcc={...source,leftArmAccent:0,rightArmAccent:0};for(let t=0;t<90;t+=.53){const m=rig(noAcc,{...base,seconds:t});assert(Math.abs(m.leftArmAccent)<=.04500001);assert(Math.abs(m.rightArmAccent)<=.04500001);}
});
test('double stance suppresses weight shift immediately',()=>{const m=rig(source,{...base,plantedLeft:true,plantedRight:true});assert(Math.abs(m.weightShift)<Math.abs(rig(source,base).weightShift));});
test('one planted stance suppresses weight shift',()=>assert(Math.abs(rig(source,{...base,plantedLeft:true}).weightShift)<Math.abs(rig(source,base).weightShift)));
test('both feet always preserve original footStep/legGroove',()=>sameProtectedFields(rig(source,{...base,plantedLeft:true,plantedRight:true})));
test('finite over 2000 frames',()=>{for(let i=0;i<2000;i++)finiteMotion(rig(source,{...base,seconds:i/60,slot:i%4}));});
test('bounded arm output 2000 frames',()=>{for(let i=0;i<2000;i++){const m=rig(source,{...base,seconds:i/60,slot:i%4});assert(Math.abs(m.leftArmAccent)<=.09&&Math.abs(m.rightArmAccent)<=.09);assert(Math.abs(m.armSwing)<=Math.abs(source.armSwing));}});
test('group active changes some footwork values',()=>assert.notDeepEqual(group(foot,grp),foot));
test('group no input mutation',()=>{const c=structuredClone(foot);group(foot,grp);assert.deepEqual(foot,c);});
test('group preserved root translation and speed',()=>{const m=group(foot,grp);m.slots.forEach((s,i)=>{assert.equal(s.offsetX,foot.slots[i].offsetX);assert.equal(s.offsetZ,foot.slots[i].offsetZ);assert.equal(s.rootSpeed,foot.slots[i].rootSpeed);});});
test('group never amplifies foot lift',()=>{for(let t=0;t<60;t+=.41){const m=group(foot,{...grp,seconds:t});m.slots.forEach((s,i)=>{assert(s.liftLeft<=foot.slots[i].liftLeft&&s.liftRight<=foot.slots[i].liftRight);});}});
test('group contact known left locks left foot',()=>{const m=group(foot,{...grp,support:supports.map(s=>({...s,leftPlanted:true}))});m.slots.forEach(s=>assert.equal(s.liftLeft,0));});
test('group contact known right locks right foot',()=>{const m=group(foot,{...grp,support:supports.map(s=>({...s,rightPlanted:true}))});m.slots.forEach(s=>assert.equal(s.liftRight,0));});
test('group unknown contacts never invent plant',()=>{const m=group(foot,{...grp,support:supports.map(s=>({...s,tracked:false,leftPlanted:true,rightPlanted:true}))});assert(m.slots.every(s=>s.liftLeft>0&&s.liftRight>0));});
test('group both planted reduces sway',()=>{const m=group(foot,{...grp,support:supports.map(s=>({...s,leftPlanted:true,rightPlanted:true}))});assert(m.slots.every((s,i)=>Math.abs(s.weightShift)<Math.abs(foot.slots[i].weightShift)));});
test('group manual/reduced/disabled/low/no track fail closed',()=>{for(const changes of [{manualPriority:true},{reducedMotion:true},{playing:false},{quality:'low'},{automaticGroup:false},{trackId:''}])same(group(foot,{...grp,...changes}),foot);});
test('group inactive stays original',()=>same(group({...foot,active:false},grp).active,false));
test('group invalid lengths protect input',()=>same(group({...foot,slots:foot.slots.slice(0,2)},grp).slots.length,2));
test('group invalid support length protect input',()=>same(group(foot,{...grp,support:supports.slice(0,2)}),foot));
test('group nonfinite source protects input',()=>{const bad={...foot,slots:foot.slots.map((s,i)=>i? s:{...s,liftRight:Infinity})};same(group(bad,grp),bad);});
test('group finite across 2000 song frames',()=>{for(let i=0;i<2000;i++)for(const s of group(foot,{...grp,seconds:i/30}).slots)for(const n of Object.values(s))assert(Number.isFinite(n));});
test('group genre variation distinct',()=>assert.notDeepEqual(group(foot,grp),group(foot,{...grp,genre:'hardtekk'})));
test('group deterministic after seek',()=>assert.deepEqual(group(foot,grp),group(foot,{...grp,trackId:'B',seconds:14})));
test('GLB rig integration before debug overlay and existing IK',()=>{const s=fs.readFileSync('components/visualizer/GltfDancerAvatarV492.tsx','utf8');assert(s.includes('stepDanceVarietyV759(varietyStateV759.current,choreographyV993.motion'));assert(s.includes('refineNaturalDanceRigV684(varietyV759.motion'));assert(s.indexOf('stepDanceVarietyV759(varietyStateV759.current')<s.indexOf('refineNaturalDanceRigV684(varietyV759.motion'));assert(s.includes('refineAdvancedRapRigV685(evolvedMotionV684'));assert(s.includes('filterMotionDebugLayers(advancedRapV685'));assert(s.indexOf('refineNaturalDanceRigV684(varietyV759.motion')<s.indexOf('updateFootGrounding({delta'));});
test('group integration before existing grounding / collision',()=>{const s=fs.readFileSync('components/visualizer/GroupDancersV326SceneV492.tsx','utf8');assert(s.includes('refineGroupFootworkV684(stabilizedBodyV524.footwork'));assert(s.indexOf('refineGroupFootworkV684(stabilizedBodyV524.footwork')<s.indexOf('buildGroundContactReportV487('));});
test('no new frame hooks, random, browser APIs or network in pure module',()=>{const s=fs.readFileSync('components/visualizer/naturalDanceEvolutionV684.ts','utf8');assert(!/useFrame\(|Math\.random\(|Date\.now\(|fetch\(|localStorage|requestAnimationFrame|setInterval|setTimeout|window\./.test(s));});
test('package scripts expose fast + isolated type checks',()=>{const p=require('../package.json');assert(Number(p.version.match(/-v(\d+)/)?.[1]||0)>=684);assert(p.scripts['test:quick'].includes('npm run test:v684 && '));assert(p.scripts['check:release'].includes('npm run test:v684:types'));});
test('documentation and architecture mention V684 safeguards',()=>{assert(fs.readFileSync('docs/versions/V684-NATURAL-DANCE-EVOLUTION.md','utf8').includes('Fußposition'));assert(Number(fs.readFileSync('ARCHITECTURE.md','utf8').match(/\*\*Dokumentationsstand:\*\* V(\d+)/)?.[1]||0)>=684);});
test('V684 group stays after V524 and before V494 and preserves original roots',()=>{const s=fs.readFileSync('components/visualizer/GroupDancersV326SceneV492.tsx','utf8');assert(s.indexOf('stepNaturalFullBodyV524(')<s.indexOf('refineGroupFootworkV684(stabilizedBodyV524.footwork'));assert(s.indexOf('refineGroupFootworkV684(stabilizedBodyV524.footwork')<s.indexOf('stepGlbGroundingV494('));assert(s.includes('groundDecisionsV494[i].offsetX'));assert(s.includes('groundDecisionsV494[i].offsetZ'));});
console.log(`PASS V684 Natural Dance Evolution: ${checks} checks, 4,000 sampled frames`);
