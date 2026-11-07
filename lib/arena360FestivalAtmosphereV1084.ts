/** V1084 · Festival Atmosphere FX.
 * Pure deterministic show planning, measured-beat edges and bounded 3-D samples.
 * Physical fog/CO2/pyro devices are NEVER controlled. All effects are virtual.
 */
import type {ArenaShowCueV1040,ArenaShowSceneV1040} from './arena360ShowDesignerV1040';
export type FestivalModeV1084='auto'|'festival'|'calm'|'bubbles'|'confetti'|'streamers'|'co2';
export type FestivalKindV1084='bubble'|'confetti'|'streamer'|'co2';
export type FestivalCueV1084={
 active:boolean;reason:'disabled'|'paused'|'motion'|'quality'|'clock'|'show'|'planned';
 scene:ArenaShowSceneV1040|null;mode:FestivalModeV1084; chapter:number;
 strength:number;bubbles:number;confetti:number;streamers:number;fogBoost:number;
 co2Ready:boolean;
};
export type FestivalAudioV1084={beat?:boolean;beatStrength?:number;energyEnvelope?:number;bass?:number};
export type FestivalBurstStateV1084={beatHeld:boolean;cooldown:number;co2:number;confetti:number;streamers:number;
 burstCount:number;lastProgressMs:number};
export type FestivalParticleV1084={x:number;y:number;z:number;rotation:number;scaleX:number;scaleY:number;scaleZ:number;alpha:number};
export const INITIAL_FESTIVAL_BURST_V1084:Readonly<FestivalBurstStateV1084>=Object.freeze({
 beatHeld:false,cooldown:0,co2:0,confetti:0,streamers:0,burstCount:0,lastProgressMs:-1,
});
const finite=(n:unknown,lo:number,hi:number,fallback=lo)=>typeof n==='number'&&Number.isFinite(n)?Math.min(hi,Math.max(lo,n)):fallback;
const clamp01=(n:unknown)=>finite(n,0,1);
const frac=(n:number)=>n-Math.floor(n);
const off=(reason:FestivalCueV1084['reason']):FestivalCueV1084=>({active:false,reason,scene:null,mode:'auto',chapter:-1,
 strength:0,bubbles:0,confetti:0,streamers:0,fogBoost:0,co2Ready:false});
const LEVELS:Record<ArenaShowSceneV1040,{b:number;c:number;s:number;f:number}>={
 intro:{b:.38,c:0,s:0,f:.30},verse:{b:.65,c:.06,s:0,f:.38},
 build:{b:.20,c:.18,s:.10,f:.50},hook:{b:.38,c:.85,s:.32,f:.35},
 interlude:{b:.90,c:0,s:0,f:.48},finale:{b:.34,c:.94,s:.95,f:.48},
};
const MODES:ReadonlyArray<FestivalModeV1084>=['auto','festival','calm','bubbles','confetti','streamers','co2'];
/** No guessed song structure: scenes are from the *authored* show timeline.
 * Physical audio evidence remains a separate prerequisite for CO2 beats.
 */
export function planFestivalAtmosphereV1084(o:{enabled:boolean;stageIsArena:boolean;playing:boolean;
 reducedMotion:boolean;reactive:boolean;performanceTier?:'low'|'balanced'|'high'|null;
 showDesignerEnabled:boolean;showDirectorEnabled:boolean;show?:ArenaShowCueV1040|null;
 progressMs?:number|null;durationMs?:number|null;strength?:number|null;mode?:FestivalModeV1084|null;
 observedSection?:string|null;genre?:string|null;fogEnabled?:boolean;}):FestivalCueV1084{
 if(!o.enabled||!o.stageIsArena||!o.reactive||!o.showDesignerEnabled||!o.showDirectorEnabled)return off('disabled');
 if(!o.playing)return off('paused');
 if(o.reducedMotion)return off('motion');
 if(o.performanceTier==='low')return off('quality');
 if(!Number.isFinite(o.progressMs)||!Number.isFinite(o.durationMs)||o.progressMs!<0||
  o.durationMs!<30000||o.durationMs!>1800000||o.progressMs!>o.durationMs!)return off('clock');
 const show=o.show;
 if(!show?.active||!show.scene||!Object.prototype.hasOwnProperty.call(LEVELS,show.scene)||
  !Number.isInteger(show.segmentIndex)||show.segmentIndex<0||!Number.isFinite(show.intensity)||
  show.intensity<=0||show.intensity>100||!Number.isFinite(show.fade)||show.fade<=0||show.fade>1)return off('show');
 if(o.strength!=null&&!Number.isFinite(o.strength))return off('disabled');
 const weight=finite(o.strength??55,0,80)/80*Math.min(1,show.intensity/65);
 if(weight===0)return off('disabled');
 const mode:FestivalModeV1084=MODES.includes(o.mode??'auto')?o.mode??'auto':'auto';
 const levels=LEVELS[show.scene];
 let b=levels.b,c=levels.c,s=levels.s,f=levels.f;
 if(mode==='festival'){b=Math.max(b,.48);c=Math.max(c,.48);s=Math.max(s,.35);}
 if(mode==='calm'){b=.65;c=.03;s=0;f=.65;}
 if(mode==='bubbles'){b=.95;c=0;s=0;}
 if(mode==='confetti'){b=0;c=.95;s=0;}
 if(mode==='streamers'){b=0;c=0;s=.95;}
 if(mode==='co2'){b=0;c=0;s=0;f=.10;}
 const genre=String(o.genre??'').toLowerCase();
 if(genre==='hard'){c=Math.min(1,c*1.16);s=Math.min(1,s*1.2);}
 if(genre==='rock'){s=Math.min(1,s*1.18);}
 if(genre==='pop'){b=Math.min(1,b*1.15);}
 if(genre==='rap'){f=Math.min(.65,f*1.10);}
 const perf=o.performanceTier==='balanced'?.62:1;
 const gain=weight*perf*show.fade;
 return {active:true,reason:'planned',scene:show.scene,mode,chapter:show.segmentIndex,strength:gain,
  bubbles:clamp01(b*gain),confetti:clamp01(c*gain),streamers:clamp01(s*gain),
  fogBoost:o.fogEnabled?finite(f*gain,0,.30):0,
  // Planned hook/finale alone MUST NOT authorize CO2 jets.
  co2Ready:o.observedSection==='drop'};
}
/** Beat-edge burst: only actual measured beats can trigger virtual jets.
 * A seek resets cooldown and envelopes; no stale burst carries to another song.
 */
export function stepFestivalBurstsV1084(prev:FestivalBurstStateV1084,deltaSeconds:number,
 cue:FestivalCueV1084,audio:FestivalAudioV1084,progressMs:number):FestivalBurstStateV1084{
 if(!cue.active||!Number.isFinite(progressMs)||progressMs<0)return {...INITIAL_FESTIVAL_BURST_V1084};
 const elapsed=finite(deltaSeconds,0,.1),beat=audio.beat===true;
 const seek=prev.lastProgressMs>=0&&(progressMs+250<prev.lastProgressMs||progressMs-prev.lastProgressMs>12000);
 const state=seek?INITIAL_FESTIVAL_BURST_V1084:prev;
 const strong=beat&&clamp01(audio.beatStrength)>=.76&&clamp01(audio.energyEnvelope)>=.60&&clamp01(audio.bass)>=.52;
 const edge=strong&&!state.beatHeld&&state.cooldown<=0;
 const jet=!seek&&edge&&cue.co2Ready&&cue.strength>.01;
 const confetti=!seek&&edge&&cue.confetti>.01;
 const streamers=!seek&&edge&&cue.streamers>.15;
 return {beatHeld:beat,cooldown:jet||confetti||streamers?6:Math.max(0,state.cooldown-elapsed),
  co2:jet?1:Math.max(0,state.co2-elapsed*1.12),
  confetti:confetti?1:Math.max(0,state.confetti-elapsed*.42),
  streamers:streamers?1:Math.max(0,state.streamers-elapsed*.38),
  burstCount:state.burstCount+(jet||confetti||streamers?1:0),lastProgressMs:progressMs};
}
/** Spatial positions remain within the outside-stage ring at all times.
 * No Math.random, clocks, resources or device APIs. Scale=0 hides inactive samples.
 */
export function sampleFestivalParticleV1084(kind:FestivalKindV1084,index:number,count:number,
 progressMs:number,cue:FestivalCueV1084,burst:FestivalBurstStateV1084):FestivalParticleV1084{
 const hidden:FestivalParticleV1084={x:0,y:-2,z:0,rotation:0,scaleX:0,scaleY:0,scaleZ:0,alpha:0};
 if(!cue.active||!Number.isFinite(progressMs)||progressMs<0||!Number.isInteger(index)||index<0||
  !Number.isInteger(count)||count<1||count>128||index>=count)return hidden;
 const t=Math.min(progressMs,1800000)/1000;
 const angle=Math.PI*2*frac((index+.25)*.61803398875);
 const ring=3.12+.70*frac(index*.3739);
 const phase=frac(index*.754877666);
 const x=Math.cos(angle)*ring,z=Math.sin(angle)*ring;
 let power=0,y=0,rotation=0,sx=0,sy=0,sz=0;
 switch(kind){
  case 'bubble':{
   power=cue.bubbles;
   const rise=frac(phase+t*(.055+.018*frac(index*.41)));
   y=-1.55+3.4*rise;
   rotation=angle+t*.12;
   sx=sy=sz=.055+.035*frac(index*.417);
   break;
  }
  case 'confetti':{
   power=cue.confetti*(.17+.83*burst.confetti);
   const fall=frac(phase+t*(.11+.022*frac(index*.31)));
   y=2.10-3.55*fall;
   rotation=t*(.9+frac(index*.241))+angle;
   sx=.045;sy=.085;sz=.005;
   break;
  }
  case 'streamer':{
   power=cue.streamers*(.15+.85*burst.streamers);
   const fall=frac(phase+t*(.08+.017*frac(index*.53)));
   y=2.08-3.40*fall;
   rotation=t*.85+angle*2;
   sx=.028;sy=.24+.28*frac(index*.385);sz=.005;
   break;
  }
  case 'co2':{
   power=cue.co2Ready?cue.strength*burst.co2:0;
   const lift=frac((index%4)/5 + (1-burst.co2)*.65);
   y=-1.62+2.35*lift;
   rotation=angle;
   sx=sz=.12+.13*lift;sy=.22+.27*lift;
   break;
  }
 }
 if(power<=.004)return hidden;
 // No sample can enter the performer center or exceed the arena's ceiling.
 return {x:finite(x,-3.9,3.9),y:finite(y,-1.8,2.2),z:finite(z,-3.9,3.9),rotation:finite(rotation,-1e6,1e6),
  scaleX:sx*finite(power,0,1),scaleY:sy*finite(power,0,1),scaleZ:sz*finite(power,0,1),alpha:finite(power,0,1)};
}
