const assert=require('node:assert/strict'),load=require('./helpers/load-stage-typescript.cjs');
const {planShowProduction,SHOW_PRODUCTIONS}=load('lib/showProduction.ts');
const {rememberShow,normalizeShowHistory}=load('lib/showExperience.ts');
const {concertScoreV1134,composeScoreCameraV1134,newScoreCameraV1134}=load('lib/concertScoreV1134.ts');
const {normalizeCrewSettings,stepCrew,newCrewState}=load('components/visualizer/sonicCrewDirector.ts');
const {restoreConcertCrew}=load('lib/concertSession.ts');
const {lyrics}=require('./fixtures/concertMocksV1130.cjs');
const base={trackId:'production-track',genre:'house',lyrics,act:'story',phrase:3,chorusVisit:0,reading:false,lyricFocus:false};
const ids=new Set();let history=[];
for(let i=0;i<32;i++){
 const track='set-'+i,p=planShowProduction({...base,trackId:track,history});ids.add(p.id);
 history=rememberShow(history,track,{production:p.id,take:p.take});assert(history.length<=24);
 assert.equal(planShowProduction({...base,trackId:track,history,genre:'rock'}).id,p.id,'Actual performed take remains pinned despite later metadata');
 const next=planShowProduction({...base,trackId:track,history,take:1});assert.notEqual(next.id,p.id,'A requested new automatic take chooses another concept');
}
assert(ids.size>=3,'A playlist must visibly use multiple concepts');
assert.equal(normalizeCrewSettings({showPlans:true,showStyle:'invalid',showTake:Infinity}).showTake,undefined);
assert.equal(normalizeCrewSettings({showStyle:'neon',showTake:10000}).showTake,999);
assert.deepEqual(normalizeShowHistory([{track:'bad',motifs:[],shots:[],production:'evil'}]),[]);
const row=rememberShow([],base.trackId,{production:'neon',take:3,motif:'Dance_RobotGroove'});assert.equal(row[0].production,'neon');assert.equal(rememberShow(row,base.trackId,{shot:1})[0].take,3);
for(const genre of ['ambient','classical'])for(let i=0;i<12;i++)assert(['cinema','groove'].includes(planShowProduction({...base,genre,trackId:'soft-'+i,history}).id));
const actual=[],manifest=require('../public/avatars/sonic/manifest.json');
for(const profile of SHOW_PRODUCTIONS){
 const cue=concertScoreV1134({trackId:base.trackId,genre:'house',lyrics,durationMs:100000,progressMs:17000,energy:.65,count:3,showPlans:true,showStyle:profile.id});
 assert.equal(cue.production.id,profile.id);assert(cue.memory);
 for(const asset of manifest){
  const result=stepCrew(newCrewState(),{settings:{enabled:true,reactions:true,mode:'adaptive',showPlans:true,showStyle:profile.id},modelId:'sonic-'+asset.file.replace('.glb',''),clips:asset.clips.map(c=>({name:c.name,duration:c.seconds})),trackId:base.trackId,genre:'house',lyrics,durationMs:100000,progressMs:17000,energy:.65,count:3,slot:0,playing:true,reducedMotion:false,manualPriority:false});
  assert.equal(result.plan.clip,cue.memory.clip,asset.file+' actually performs the concept motif');
 }
 actual.push([cue.palette,cue.showTakeSeed,cue.production.crewGain,cue.memory.theme]);
 const late=concertScoreV1134({trackId:base.trackId,genre:'house',lyrics,durationMs:100000,progressMs:99000,energy:.65,count:3,showPlans:true,showStyle:profile.id});assert.equal(late.memory.theme,cue.memory.theme);assert.equal(late.production.scene,'reprise');
 const reading=planShowProduction({...base,choice:profile.id,reading:true});assert.equal(reading.scene,'reading');assert.equal(reading.cameraGain,1);assert.equal(reading.lightGain,1);assert.equal(reading.crewGain,1);
 const key=planShowProduction({...base,choice:profile.id,lyricFocus:true});assert.equal(key.scene,'reading');
}
assert.equal(new Set(actual.map(a=>a[3])).size,4,'Concepts must change the real song motif, not only colors and seeds');assert.equal(new Set(actual.map(a=>a[0])).size,4);assert.equal(new Set(actual.map(a=>a[1])).size,4);assert(new Set(actual.map(a=>a[2])).size>2);
const take0=concertScoreV1134({trackId:'take',genre:'house',lyrics,progressMs:17000,durationMs:100000,showPlans:true,showStyle:'groove'}),take1=concertScoreV1134({trackId:'take',genre:'house',lyrics,progressMs:17000,durationMs:100000,showPlans:true,showStyle:'groove',showTake:1});assert.notEqual(take0.showTakeSeed,take1.showTakeSeed);
const legacy=concertScoreV1134({progressMs:33000});assert.equal(legacy.production,undefined);
const camera={x:0,y:1,z:8,fov:40};assert.strictEqual(composeScoreCameraV1134(camera,take0,newScoreCameraV1134(),{playing:true,reducedMotion:false,protectedShot:true},camera),camera);
assert.equal(restoreConcertCrew({enabled:true,reactions:true,mode:'adaptive',showPlans:false},{enabled:false,mode:'individual'}).showPlans,false);
console.log('PASS show productions: four scored concepts, playlist anti-repeat, pinned takes, real motif seeds, genre protection, restrained lyrics, protected cameras and backward compatibility');
