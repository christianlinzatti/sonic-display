import type {AudioFeatures} from '../types/audio';
const bound=(v:number)=>Number.isFinite(v)?Math.max(0,Math.min(1,v)):0;
export type SpectralBands={bass:number;mids:number;highs:number;kick:number;snare:number;hiHat:number};
/** Frame-time-aware onset envelopes. Band changes are evidence, sustained energy is not a beat. */
export class SpectralMusicAnalyzer {
 private last:number|null=null;private previous=[0,0,0];private floors=[.005,.005,.005];
 private accents=[0,0,0];private lastBeat=-Infinity;private warmUntil=0;private quietAt:number|null=null;private quietReset=false;
 private envelope=0;private noise=.001;private levels={bass:0,mids:0,highs:0,volume:0};
 process(bands:SpectralBands,rms:number,now:number,sensitivity=1,cooldownMs=180){
  const finite=Object.values(bands).every(Number.isFinite)&&Number.isFinite(rms)&&Number.isFinite(now);
  const rawDt=this.last===null?0:(now-this.last)/1000,discontinuity=this.last===null||rawDt<=0||rawDt>.25||!finite;
  const dt=discontinuity?1/60:rawDt;this.last=Number.isFinite(now)?now:null;
  const values=[bound(bands.kick),bound(bands.snare),bound(bands.hiHat)];
  const level=finite?bound(rms):0;
  if(level<this.noise*3)this.noise+=(level-this.noise)*(1-Math.exp(-dt/2));
  this.noise=Math.max(.0003,Math.min(.004,this.noise));
  const audible=finite&&level>=Math.max(.0025,this.noise*3);
  if(discontinuity){this.previous=values;this.accents=[0,0,0];this.floors=[.005,.005,.005];this.lastBeat=-Infinity;this.warmUntil=now+150;this.envelope=0;this.quietAt=null;this.quietReset=false;}
  if(!audible){if(this.quietAt===null)this.quietAt=now;}else{this.quietAt=null;this.quietReset=false;}
  const silenceReset=this.quietAt!==null&&now-this.quietAt>=650&&!this.quietReset;
  if(silenceReset)this.quietReset=true;
  const delta=values.map((v,i)=>Math.max(0,v-this.previous[i]));
  let beat=false,beatStrength=0;
  for(let i=0;i<3;i++){
   const flux=Math.max(0,delta[i]-(i===1?delta[0]*.35:0));
   const threshold=.012+this.floors[i]*2;
   const hit=audible&&now>=this.warmUntil&&flux>threshold;
   const strength=hit?bound((flux-threshold)/.14*Math.max(.25,Math.min(3,Number.isFinite(sensitivity)?sensitivity:1))):0;
   this.accents[i]=Math.max(this.accents[i]*Math.exp(-dt/.12),strength);
   this.floors[i]+=(Math.min(flux,.08)-this.floors[i])*(1-Math.exp(-dt/1.5));
   if(i===0&&strength>.12&&now-this.lastBeat>=Math.max(100,Number.isFinite(cooldownMs)?cooldownMs:180)){beat=true;beatStrength=strength;this.lastBeat=now;}
  }
  this.previous=values;
  const volume=audible?bound(level*3.5):0,previous=this.envelope;
  this.envelope+=(volume-this.envelope)*(1-Math.exp(-dt/(volume>this.envelope?.055:.22)));
  for(const key of ['bass','mids','highs','volume'] as const){const target=audible?(key==='volume'?volume:bound(bands[key])):0;this.levels[key]+=(target-this.levels[key])*(1-Math.exp(-dt/.08));}
  const active=audible||(this.quietAt!==null&&now-this.quietAt<650&&this.envelope>.003);
  if(!active)this.accents=[0,0,0];
  return {...this.levels,beat,beatStrength,rms:level,activity:active?'music' as const:'quiet' as const,
   bassOnset:this.accents[0],snareOnset:this.accents[1],highOnset:this.accents[2],
   energyEnvelope:active?bound(this.envelope):0,attack:Math.max(...this.accents),decay:bound((previous-this.envelope)/Math.max(.001,dt)),reset:discontinuity||silenceReset};
 }
}
/** Quiet capture must never inherit a worker's previously locked/predicted beat. */
export function mergeMusicAnalysis(local:AudioFeatures,advanced:Partial<AudioFeatures>):AudioFeatures{
 if(local.activity==='quiet')return {...local,bpm:null,bpmConfidence:0,beatPhase:null,phaseConfidence:0,phaseLocked:false,beat:false,beatStrength:0,kickAnticipation:0,kickAccent:'none',kickAccentIntensity:0,kickPattern:'unknown',kickPatternConfidence:0,kickPatternAccent:0,learnedRhythm:'unknown',rhythmConfidence:0,rhythmPhrasePosition:0,rhythmPhraseAccent:0,rhythmRepetitions:0,timeToNextKickMs:null};
 return {...local,...advanced,beat:local.beat||advanced.beat===true,beatStrength:Math.max(local.beatStrength,advanced.beatStrength??0)};
}
export function musicAnalysisLabel(active:boolean,enabled:boolean,metrics:AudioFeatures){
 if(!active)return enabled?'Mikrofon wartet auf ein Signal':'Songtakt · keine Audioanalyse aktiv';
 if(metrics.activity==='quiet')return 'Leise Passage · gemessene Impulse pausieren';
 if(!metrics.phaseLocked||(metrics.bpmConfidence??0)<.7||!Number.isFinite(metrics.bpm)||!metrics.bpm)return 'Mikrofon aktiv · Tempo wird ermittelt';
 return `Mikrofon · ${Math.round(metrics.bpm)} BPM · stabiler Takt`;
}
/** DC offset is not musical loudness. Reuses the analyser's existing waveform buffer. */
export function waveformRms(samples:Float32Array){
 if(!samples.length)return 0;
 let sum=0,square=0;for(const sample of samples){if(!Number.isFinite(sample))return 0;sum+=sample;square+=sample*sample;}
 return bound(Math.sqrt(Math.max(0,square/samples.length-(sum/samples.length)**2)));
}
