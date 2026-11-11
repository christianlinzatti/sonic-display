const assert=require('node:assert/strict'),load=require('./helpers/load-stage-typescript.cjs');
const {SpectralMusicAnalyzer,mergeMusicAnalysis,waveformRms,musicAnalysisLabel}=load('hooks/spectralMusicAnalyzer.ts'),{BeatTempoTracker}=load('hooks/beatTempoTracker.ts');
const bands=(kick=0,snare=0,hiHat=0)=>({bass:kick,mids:snare,highs:hiHat,kick,snare,hiHat});
for(const hz of [30,60,120]){
 const analyzer=new SpectralMusicAnalyzer(),tempo=new BeatTempoTracker();let beats=0,last;
 for(let now=0;now<=12000;now+=1000/hz){const kick=now%500<65?.7:.06;last=analyzer.process(bands(kick),kick>.1?.15:.012,now);if(last.beat){beats++;tempo.addOnset(now);}}
 assert(beats>=20&&beats<=25,`120 BPM onset count at ${hz}Hz: ${beats}`);assert(Math.abs(tempo.current(12000).bpm-120)<=3);
}
for(const amplitude of [.15,.5,.9]){const a=new SpectralMusicAnalyzer();let hits=0;for(let n=0;n<600;n++)hits+=a.process(bands(amplitude),.1,n*1000/60).beat?1:0;assert.equal(hits,0,'Steady bass is not a repeated beat');}
const a=new SpectralMusicAnalyzer();let frame;for(let n=0;n<60;n++)frame=a.process(bands(.4),.0002,n*16.67);assert.equal(frame.activity,'quiet');assert.equal(frame.beat,false,'Spectral noise without RMS signal stays quiet');
frame=a.process(bands(.8),.2,2000);assert(frame.reset);assert.equal(frame.beat,false,'A resumed capture establishes a new baseline');
let resetCount=0;for(let n=1;n<80;n++)if(a.process(bands(),0,2000+n*16.67).reset)resetCount++;assert.equal(resetCount,1,'One sustained quiet reset, not one worker reset per frame');
const percussion=new SpectralMusicAnalyzer();for(let n=0;n<30;n++)percussion.process(bands(.1,.1),.1,n*16.67);const snare=percussion.process(bands(.1,.8),.15,500);assert(snare.snareOnset>.5);assert.equal(snare.beat,false,'A snare does not masquerade as a bass tempo onset');
const quiet=mergeMusicAnalysis({...snare,activity:'quiet',bpm:null,kick:0,snare:0,hiHat:0},{bpm:150,bpmConfidence:1,phaseLocked:true,beat:true,beatStrength:1,kickAnticipation:1});assert.equal(quiet.bpm,null);assert.equal(quiet.phaseLocked,false);assert.equal(quiet.beat,false);
const tracker=new BeatTempoTracker();for(let n=0;n<30;n++)tracker.addOnset(n*500);assert.equal(tracker.current(14500).bpm,120);for(let n=1;n<=14;n++)tracker.addOnset(14500+n*400);assert(Math.abs(tracker.current(20100).bpm-150)<=2,'A consistent 120→150 BPM change relocks to the new tempo');
const invalid=new SpectralMusicAnalyzer();for(const value of [NaN,Infinity,-1]){const result=invalid.process(bands(value),value,1000);assert.equal(result.beat,false);for(const item of Object.values(result))if(typeof item==='number')assert(Number.isFinite(item));}

assert(waveformRms(new Float32Array(2048).fill(.2))<1e-6,'Constant DC offset is not loudness');
const wave=Float32Array.from({length:2048},(_,i)=>.2+.5*Math.sin(i/2048*Math.PI*32));assert(Math.abs(waveformRms(wave)-.5/Math.sqrt(2))<.0001);
assert.match(musicAnalysisLabel(false,false,quiet),/keine Audioanalyse/);assert.match(musicAnalysisLabel(true,true,quiet),/Leise Passage/);
const {planConcertScenery}=load('lib/concertStageShow.ts'),{concertScoreV1134}=load('lib/concertScoreV1134.ts');
const base=concertScoreV1134({trackId:'returns',progressMs:26000,section:'hook',genre:'house',count:3,scenery:true,showPlans:true});
const stage=visit=>planConcertScenery({cue:{...base,act:'lift',chorusVisit:visit,reading:false,lyricFocus:false},enabled:true,playing:true,reducedMotion:false,manual:false,tier:'high',pressure:0});
assert.notEqual(stage(1).pattern,stage(2).pattern);assert(stage(2).brightness>stage(1).brightness);assert.equal(stage(3).pattern,stage(1).pattern,'Third refrain recalls the visual theme');

for(const rate of [.8,1,1.15]){
 const analyzer=new SpectralMusicAnalyzer(),tempo=new BeatTempoTracker();
 for(let wall=0;wall<16000;wall+=1000/60){const audio=wall*rate,kick=audio%500<65?.7:.06,frame=analyzer.process(bands(kick),kick>.1?.15:.012,wall);if(frame.beat)tempo.addOnset(audio);}
 assert(Math.abs(tempo.current(15900*rate).bpm-120)<=3,'Capture clock preserves tempo when UI and audio time run at different rates');
}
console.log('PASS music analysis: actual spectral changes/RMS gate, 30/60/120 Hz pulse clocks, sustained bass/noise rejection, separate snare, quiet worker guard, capture gap reset, 120→150 tempo reacquisition and finite outputs');
