'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {load}=require('./helpers/ts-loader-v404.cjs');
const {stepNaturalFullBodyV524:step,newNaturalFullBodyStateV524:fresh,classifyDanceStyleV524:genre}=load('components/visualizer/naturalFullBodyDanceV524');
const slot=()=>({offsetX:.08,offsetZ:-.07,liftLeft:.76,liftRight:.1,rootSpeed:.9,weightShift:.012});
const ground=(tracked=false,leftPlanted=false,rightPlanted=false)=>({tracked,leftPlanted,rightPlanted});
const make=(changes={})=>({trackId:'demo',seconds:1,delta:1/60,count:4,footwork:{active:true,slots:Array.from({length:4},slot)},support:Array.from({length:4},()=>ground()),genre:'Deutschrap',playing:true,reducedMotion:false,manualPriority:false,footLocked:false,automaticGroup:true,tier:'high',...changes});
assert.equal(genre('Deutschrap'),'rap-flow');assert.equal(genre('Hip-Hop'),'rap-flow');assert.equal(genre('Hardtekk'),'hard-dance');assert.equal(genre('Hardstyle'),'hard-dance');assert.equal(genre(null),'neutral');
let state=fresh();let input=make();let first=step(state,input);assert(first.active);assert.equal(first.style,'rap-flow');assert.equal(first.footwork.slots.length,4);assert.equal(first.footwork.slots[0].offsetX,.08);assert.equal(first.footwork.slots[0].offsetZ,-.07);
assert(first.footwork.slots[0].liftLeft<.76);assert.deepEqual(step(state,input),first,'pure deterministic');
const original=JSON.stringify(input);step(state,input);assert.equal(JSON.stringify(input),original,'no input mutation');
for(const diff of [{trackId:null},{playing:false},{reducedMotion:true},{manualPriority:true},{footLocked:true},{automaticGroup:false},{tier:'low'},{seconds:NaN},{delta:NaN},{delta:.4},{count:2},{support:[]},{footwork:{active:false,slots:[]}}]){
 const val=make(diff);const result=step(first.state,val);assert(!result.active,JSON.stringify(diff));assert.equal(result.footwork,val.footwork,'bypass returns untouched planner');assert.deepEqual(result.state,fresh(),'state reset');
}
// Contact: newly planted feet STOP immediately; V494 retains authority for actual anchors.
const both=make({seconds:1.02,support:Array.from({length:4},()=>ground(true,true,true)),footwork:{active:true,slots:Array.from({length:4},()=>({...slot(),liftLeft:0,liftRight:0,rootSpeed:.12}))}});
const planted=step(first.state,both);assert(planted.active);for(const s of planted.footwork.slots){assert.equal(s.liftLeft,0);assert.equal(s.liftRight,0);assert(s.rootSpeed<=.12);assert(Math.abs(s.weightShift)<=.012);}
const one=make({seconds:1.02,support:Array.from({length:4},()=>ground(true,true,false))});const half=step(first.state,one);
for(const s of half.footwork.slots){assert.equal(s.liftLeft,0);assert(s.liftRight<=.1);}
const lost=step(first.state,make({trackId:'next',seconds:1.02}));assert.equal(lost.state.trackId,'next');
const seek=step(first.state,make({seconds:.2}));assert(seek.active);assert(seek.footwork.slots[0].liftLeft<=.76);
const gap=step(first.state,make({seconds:3}));assert(gap.active&&gap.footwork.slots[0].liftLeft<=.76);
const malformed=make({footwork:{active:true,slots:Array.from({length:4},()=>({...slot(),offsetX:Infinity}))}});assert.equal(step(first.state,malformed).active,false);
// Exponential filtering must remain close across 30/60fps for a constant goal.
function hold(secondsPerFrame){
 let initial=step(fresh(),make({seconds:1,delta:secondsPerFrame,footwork:{active:true,slots:Array.from({length:4},()=>({...slot(),liftLeft:0,rootSpeed:.95,weightShift:0}))}}));
 let state=initial.state;
 const frames=Math.round(.6/secondsPerFrame);
 for(let i=1;i<=frames;i++){
  const frame=step(state,make({seconds:1+i*secondsPerFrame,delta:secondsPerFrame,
   footwork:{active:true,slots:Array.from({length:4},()=>({...slot(),liftLeft:.7,rootSpeed:.22,weightShift:.01}))}}));
  state=frame.state;
 }
 return state.slots[0];
}
const f30=hold(1/30),f60=hold(1/60);
for(const channel of ['rootSpeed','liftLeft','weightShift'])assert(Math.abs(f30[channel]-f60[channel])<.0002,`frame rate invariant ${channel}`);
const badLift=step(first.state,make({seconds:1.02,footwork:{active:true,slots:Array.from({length:4},()=>({...slot(),liftLeft:-1,liftRight:-1}))}}));
assert(badLift.footwork.slots.every(s=>s.liftLeft>=0&&s.liftRight>=0));

let simulated=0;
for(const style of ['Deutschrap','Hardstyle','Hardtekk','Pop']){
 let state=fresh();
 for(let i=0;i<10000;i++){
  const at=3+i/60;const lift=Math.sin(i*.047)**2;
  const src={active:true,slots:Array.from({length:4},(_,j)=>({offsetX:.08,offsetZ:-.06,liftLeft:lift,liftRight:1-lift,rootSpeed:.2+.7*lift,weightShift:(lift-.5)*.027}))};
  const supports=Array.from({length:4},(_,j)=>ground(true,i%113<8,j%2===0&&i%113<8));
  const frame=make({seconds:at,delta:1/60,genre:style,footwork:src,support:supports});
  const next=step(state,frame);state=next.state;
  assert(next.active);
  for(let j=0;j<4;j++){
   const s=next.footwork.slots[j];const b=src.slots[j];
   assert(Object.values(s).every(Number.isFinite));
   assert(s.liftLeft>=0&&s.liftLeft<=b.liftLeft+1e-10&&s.liftRight>=0&&s.liftRight<=b.liftRight+1e-10);
   if(supports[j].leftPlanted)assert.equal(s.liftLeft,0);
   if(supports[j].rightPlanted)assert.equal(s.liftRight,0);
   if(supports[j].leftPlanted&&supports[j].rightPlanted)assert(s.rootSpeed<=b.rootSpeed);
   assert(s.offsetX===b.offsetX&&s.offsetZ===b.offsetZ,'authored/optional offsets forwarded unchanged');
   assert(s.rootSpeed>=0&&s.rootSpeed<=1&&Math.abs(s.weightShift)<=.014);
  }
  simulated++;
 }
}
const group=fs.readFileSync('components/visualizer/GroupDancersV326SceneV492.tsx','utf8');
const proc=fs.readFileSync('components/visualizer/ProceduralDancerAvatarV492.tsx','utf8');
assert(group.includes('stepNaturalFullBodyV524(naturalBodyStateV524.current')&&group.includes('naturalBodyStateV524.current=stabilizedBodyV524.state'));
assert(group.includes('const naturalFootworkV524=stabilizedBodyV524.footwork')&&group.includes('footwork:naturalFootworkV524.slots[i]')&&group.includes('naturalFootworkV524.slots[i].rootSpeed'));
assert(group.includes('Object.assign(footworkV486.current[i].current,naturalFootworkV524.slots[i])'));
assert(proc.includes('groupFootworkV486?.current.liftLeft')&&proc.includes('planNaturalFullBodyV488({'));
const engine=fs.readFileSync('components/visualizer/naturalFullBodyDanceV524.ts','utf8');
assert(!/\b(requestAnimationFrame|setInterval|setTimeout|fetch|localStorage|Date\.now|Math\.random)\b/.test(engine),'no hidden loop, network or nondeterminism');
const pkg=require('../package.json');assert(Number(pkg.version.match(/-v(\d+)$/)?.[1]||0)>=524);
assert(pkg.scripts['build:preflight'].includes('npm run test:v524 && npm run test:v524:types && npm run test:v523'));
console.log(`PASS V524: ${simulated} genre/stance/seek tests and original-clip/foot-IK safety wiring`);
