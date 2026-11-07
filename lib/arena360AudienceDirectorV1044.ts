/** V1044 · Audience Light Orchestra. Pure, local, bounded and explicitly enabled.
 * Reuses the V1032 instanced phone crowd: no lights, geometry, timers or network.
 * Show labels are authored templates, NOT detected track sections or beat events.
 */
import type {ArenaShowCueV1040,ArenaShowSceneV1040} from './arena360ShowDesignerV1040';
export type ArenaAudienceCueV1044={
 active:boolean;reason:'disabled'|'paused'|'motion'|'manual'|'performance'|'clock'|'planned';
 scene:ArenaShowSceneV1040|null;gain:number;color:readonly [number,number,number];
};
const OFF:ArenaAudienceCueV1044=Object.freeze({active:false,reason:'disabled',scene:null,gain:0,color:[1,1,1] as const});
const clamp=(v:unknown,fallback:number,min:number,max:number)=>
 typeof v==='number'&&Number.isFinite(v)?Math.max(min,Math.min(max,v)):fallback;
const PALETTE:Record<'rap'|'hard'|'rock'|'pop',readonly [number,number,number]>={
 rap:[.57,.46,1],hard:[.25,.93,1],rock:[1,.55,.26],pop:[1,.48,.8],
};
/** Manual phone pulse/chase, disabled audience, pause and reduced motion keep priority. */
export function planArenaAudienceV1044(input:{enabled:boolean;show?:ArenaShowCueV1040|null;
 stageIsArena:boolean;playing:boolean;reducedMotion:boolean;phoneEnabled:boolean;
 phoneMode?:string;performanceTier?:'low'|'balanced'|'high';trackId?:string|null;
 progressMs?:number|null;strength?:number;genre?:string|null;
}):ArenaAudienceCueV1044{
 if(!input.enabled||!input.stageIsArena||!input.phoneEnabled||!input.show?.active||!input.show.scene)return OFF;
 if(!input.playing)return {...OFF,reason:'paused'};
 if(input.reducedMotion)return {...OFF,reason:'motion'};
 if(input.phoneMode&&input.phoneMode!=='wave')return {...OFF,reason:'manual'};
 if(input.performanceTier==='low')return {...OFF,reason:'performance'};
 if(!input.trackId||typeof input.progressMs!=='number'||!Number.isFinite(input.progressMs)||input.progressMs<0)
  return {...OFF,reason:'clock'};
 const {scene,intensity,fade}=input.show;
 if(!Number.isFinite(intensity)||!Number.isFinite(fade)||fade<=0||fade>1||intensity<=0)return OFF;
 const strength=clamp(input.strength,50,0,75)/100;
 const gain=clamp(strength*clamp(intensity,0,0,100)/100*fade,0,0,.75);
 if(gain===0)return OFF;
 const genre=String(input.genre??'').toLowerCase();
 const key=genre.includes('hard')||genre.includes('tekk')?'hard':
  genre.includes('rock')||genre.includes('metal')?'rock':
  genre.includes('rap')||genre.includes('hip')?'rap':'pop';
 return {active:true,reason:'planned',scene,gain,color:PALETTE[key]};
}
/** Smooth scene-dependent choreography. No strobe and no increase over normal phone maximum.
 * Sampled during the *existing* audience tick, using its already-running animation clock.
 */
export function sampleArenaAudienceV1044(cue:ArenaAudienceCueV1044|null|undefined,
 angle:number,seconds:number,baseLight:number):number{
 const base=clamp(baseLight,0,0,1);
 if(!cue?.active||!Number.isFinite(angle)||!Number.isFinite(seconds))return base;
 const gain=clamp(cue.gain,0,0,.75);
 const a=(value:number)=>.5+.5*Math.cos(value);
 let response:number;
 switch(cue.scene){
  case 'intro': response=.35+.45*a(seconds*.55+angle);break;
  case 'verse': response=.18+.72*a(angle*1.5-seconds*.65);break;
  case 'build': response=.25+.72*a(angle*2-seconds*1.6);break;
  case 'hook': response=.58+.34*a(seconds*1.3);break;
  case 'interlude': response=.14+.57*a(angle*7+seconds*.36);break;
  case 'finale': response=.48+.48*a(angle*3-seconds*1.25);break;
  default: return base;
 }
 // No high-frequency flicker: cosine phase is bounded and continuous.
 const value=base*(1-gain)+response*gain;
 return clamp(value,base,0,1);
}
