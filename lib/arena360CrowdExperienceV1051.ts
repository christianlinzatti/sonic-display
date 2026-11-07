/** V1051 · Immersive Concert Crowd Experience.
 * Local, deterministic choreography for the already instanced V1032 audience.
 * Authored show chapters are visual cues, NOT detected singing, applause or drops.
 * No audio generation, network access, per-frame allocation or new scene owners.
 */
import type {ArenaShowCueV1040,ArenaShowSceneV1040} from './arena360ShowDesignerV1040';
export type CrowdMoodV1051='calm'|'ripple'|'anticipation'|'singalong'|'rest'|'ovation';
export interface CrowdCueV1051{
 active:boolean;reason:'disabled'|'paused'|'motion'|'performance'|'clock'|'show'|'planned';
 mood:CrowdMoodV1051;gain:number;phase:number;direction:1|-1;progress:number;
}
export interface CrowdSampleV1051{rise:number;arms:number;light:number;}
const bounded=(v:unknown,min:number,max:number,fallback:number):number=>
 typeof v==='number'&&Number.isFinite(v)?Math.max(min,Math.min(max,v)):fallback;
const smooth=(v:number)=>{const t=bounded(v,0,1,0);return t*t*(3-2*t);};
const INACTIVE:CrowdCueV1051=Object.freeze({active:false,reason:'disabled',mood:'calm',gain:0,phase:0,direction:1,progress:0});
const MOODS:Record<ArenaShowSceneV1040,CrowdMoodV1051>={
 intro:'calm',verse:'ripple',build:'anticipation',hook:'singalong',interlude:'rest',finale:'ovation',
};
/** Explicit opt-in and the existing accessibility, autoplay and performance gates win. */
export function planCrowdExperienceV1051(input:{
 enabled:boolean;stageIsArena:boolean;playing:boolean;reducedMotion:boolean;reactive?:boolean;
 audienceEnabled:boolean;show?:ArenaShowCueV1040|null;trackId?:string|null;
 progressMs?:number|null;durationMs?:number|null;strength?:number;
 performanceTier?:'low'|'balanced'|'high'|null;
}):CrowdCueV1051{
 if(!input.enabled||!input.stageIsArena||!input.audienceEnabled||input.reactive===false)return INACTIVE;
 if(!input.playing)return {...INACTIVE,reason:'paused'};
 if(input.reducedMotion)return {...INACTIVE,reason:'motion'};
 if(input.performanceTier==='low')return {...INACTIVE,reason:'performance'};
 const show=input.show;
 if(!show?.active||!show.scene||!Number.isInteger(show.segmentIndex)||show.segmentIndex<0||
  !Number.isFinite(show.fade)||show.fade<=0||show.fade>1||
  !Number.isFinite(show.intensity)||show.intensity<=0||show.intensity>100)return {...INACTIVE,reason:'show'};
 if(typeof input.trackId!=='string'||!input.trackId.trim()||
  !Number.isFinite(input.progressMs)||!Number.isFinite(input.durationMs)||
  (input.durationMs??0)<=0||(input.progressMs??-1)<0||
  (input.progressMs??0)>(input.durationMs??0))return {...INACTIVE,reason:'clock'};
 const strength=bounded(input.strength,0,80,55)/100;
 const tier=input.performanceTier==='balanced'?.7:1;
 const gain=bounded(strength*show.intensity/100*show.fade*tier,0,.8,0);
 if(gain<=0)return INACTIVE;
 // Stable variation by song; no random repeats between renders or timers.
 let hash=2166136261;
 for(let i=0;i<Math.min(input.trackId.length,120);i++){
  hash=Math.imul(hash^input.trackId.charCodeAt(i),16777619);
 }
 const phase=((hash>>>0)%4096)/4096*Math.PI*2;
 const direction:1|-1=(hash&1)?1:-1;
 return {active:true,reason:'planned',mood:MOODS[show.scene],gain,phase,direction,
  progress:(input.progressMs??0)/(input.durationMs??1)};
}
/** Bounded, continuous motion and phone-light sampling, using the existing crowd tick.
 * arms/rise are normalized pose accents; light is a factor in [0,1]. Never strobe.
 */
export function sampleCrowdExperienceV1051(cue:CrowdCueV1051|null|undefined,
 angle:number,timeSeconds:number):CrowdSampleV1051{
 if(!cue?.active||!Number.isFinite(angle)||!Number.isFinite(timeSeconds))return {rise:0,arms:0,light:.5};
 const t=timeSeconds,phase=cue.phase,travel=cue.direction*angle;
 const slow=(v:number)=>.5+.5*Math.cos(v);
 let rise=0,arms=0,light=.5;
 switch(cue.mood){
  case 'calm':
   rise=.08+.12*slow(travel-t*.35+phase);arms=.10;light=.24+.18*slow(travel-t*.4+phase);break;
  case 'ripple':{
   const wave=slow(travel*2.5-t*1.55+phase);
   rise=.12+.68*wave;arms=.15+.68*wave;light=.27+.58*wave;break;
  }
  case 'anticipation':{
   const wave=slow(travel*2-t*1.9+phase);
   rise=.3+.55*wave;arms=.32+.65*wave;light=.38+.55*wave;break;
  }
  case 'singalong':{
   const wave=slow(t*.8+phase)+slow(travel*1.2-t*.65+phase);
   rise=.25+.25*wave;arms=.46+.23*wave;light=.53+.22*wave;break;
  }
  case 'rest':
   rise=.04+.12*slow(travel-t*.28+phase);arms=.07;light=.17+.16*slow(travel*3+t*.28+phase);break;
  case 'ovation':{
   const wave=slow(travel*3-t*1.2+phase);
   const ending=1-.5*smooth((cue.progress-.975)/.025);
   rise=(.36+.54*wave)*ending;arms=(.55+.44*wave)*ending;
   light=(.58+.40*wave)*ending;break;
  }
 }
 const gain=bounded(cue.gain,0,.8,0);
 return {rise:bounded(rise*gain,0,.8,0),arms:bounded(arms*gain,0,.8,0),
  light:bounded(.5+(light-.5)*gain,0,1,.5)};
}
