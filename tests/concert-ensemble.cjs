const assert=require('node:assert/strict'),load=require('./helpers/load-stage-typescript.cjs');
const {ensembleBeat,ensembleLightLook,publishEnsembleLight,getEnsembleLight}=load('lib/concertEnsemble.ts');
const {songWardrobe}=load('lib/songWardrobe.ts'),{ensembleLyrics}=load('lib/ensembleLyrics.ts');
const {crewConversation}=load('lib/crewConversation.ts'),{crewStageTarget,stepCrewStage}=load('lib/crewStagecraft.ts');
const {normalizeCrewSettings}=load('components/visualizer/sonicCrewDirector.ts'),{lyrics}=require('./fixtures/concertMocksV1130.cjs');
for(const b of [0,.1,.3,.64])assert(ensembleBeat(b,'partner').listen&&ensembleBeat(b,'partner').accent===0);
assert(ensembleBeat(1.2,'partner').accent>.9);assert(ensembleBeat(3.9,'lead').attention<.1);
const plan={active:true,ensemble:true,offset:0,persona:{flow:.5,phase:0},interaction:{role:'partner',yaw:.1},story:{scenery:true,reading:false,lyricFocus:false}};
assert.equal(crewConversation(plan,.3).answer,0);assert(crewConversation(plan,1.2).answer>.01);
assert.equal(crewConversation({...plan,story:{...plan.story,lyricFocus:true}},1.2).gaze,0);
assert(crewConversation({...plan,ensemble:false},.3).answer>0);
for(let count=2;count<=4;count++)for(let slot=0;slot<count;slot++){
 const base={x:(slot-(count-1)/2)*1.3,z:0},target=crewStageTarget(base,slot,count,0,1,false,undefined,true);
 assert(Math.abs(target.x-base.x)<=.19&&Math.abs(target.z)<=.5);
 assert.deepEqual(stepCrewStage(base,target,[],.05,false,1),base);
 assert.deepEqual(stepCrewStage(base,target,[base],.05,true,1),base);
}
for(const key of ['ensemble','ensembleLyrics','songOutfits','goveeEnsemble'])assert.equal(normalizeCrewSettings({[key]:false})[key],false);
const appearances=new Set();for(const genre of ['rock','classical','rap','latin','house']){
 const looks=[0,1,2].map(slot=>songWardrobe('track-a',genre,slot));assert.equal(new Set(looks.map(l=>l.color)).size,3);
 assert.deepEqual(looks[0],songWardrobe('track-a',genre,0));appearances.add(looks[0].name);
}assert.equal(appearances.size,5);
const fx=new Set();for(let i=0;i<30;i++)fx.add(ensembleLyrics(lyrics,25000,'song'+i,true,true,false).effect);
assert(fx.size===4);assert.equal(ensembleLyrics(lyrics,25000,'song',false,true,false).effect,'off');
assert.equal(ensembleLyrics(lyrics,25000,'song',true,false,false).effect,'still');assert.equal(ensembleLyrics(lyrics,25000,'song',true,true,true).effect,'still');
assert.equal(ensembleLyrics(null,25000,'song',true,true,false).effect,'off');
const rap={synced:true,lines:[{startMs:0,endMs:1000,text:'eins zwei drei vier fünf sechs sieben acht neun zehn'}]};
assert.equal(ensembleLyrics(rap,500,'song',true,true,false).effect,'reading');
const cue={source:'track:a',position:20000,capturedAt:1000,playing:true,protected:false,interaction:'solo',color:'#44aaff'};
const look={brightness:60,color:{r:100,g:60,b:180}},input={trackId:'a',position:20500,now:1500,enabled:true,manual:false,role:'ambient',reduced:false};
const solo=ensembleLightLook(look,cue,input),reading=ensembleLightLook(look,{...cue,protected:true},input),peak=ensembleLightLook(look,{...cue,interaction:'unison'},input);
assert(reading.brightness<solo.brightness&&solo.brightness<peak.brightness&&peak.brightness<=look.brightness);
assert.notDeepEqual(solo.color,look.color);assert.equal(look.brightness,60);
for(const patch of [{enabled:false},{manual:true},{reduced:true},{trackId:'b'},{position:80000},{now:5000},{now:NaN}])assert.equal(ensembleLightLook(look,cue,{...input,...patch}),look);
assert.equal(ensembleLightLook(look,{...cue,playing:false},input),look);
publishEnsembleLight({sourceKey:'track:a',positionMs:20,reading:false,lyricFocus:true,interaction:'solo',palette:'#44aaff'},true,true,1000);assert(getEnsembleLight().protected);
publishEnsembleLight({},false,false);assert.equal(getEnsembleLight(),null);
console.log('PASS ensemble: delayed replies, gaze release, bounded staging, five fabric families, four lyric motifs, rap/pause guards, Govee identity/freshness/manual/caps');
