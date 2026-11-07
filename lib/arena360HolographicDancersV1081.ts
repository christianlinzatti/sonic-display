/** V1081 · Holographic Dancers 2.0.
 * Deterministic optical-only choreography for the EXISTING V1039 portal silhouettes.
 * No extra cast members, imported GLBs, music analysis, network calls or hardware output.
 * Authored chapters select a dance style; only measured beats add brief accents.
 */
import type {ArenaShowCueV1040,ArenaShowSceneV1040} from './arena360ShowDesignerV1040';
import type {HologramCueV1068} from './arena360HolographicConcertV1068';
import {resolveHologramGenreV1039} from './arena360HolographyV1039';

export type DancerStyleV1081='arrival'|'groove'|'build'|'duet'|'breath'|'encore';
export type DancerCueV1081={
 active:boolean;reason:'disabled'|'paused'|'motion'|'quality'|'manual'|'clock'|'director'|'planned';
 style:DancerStyleV1081;power:number;tempo:number;progressSeconds:number;accent:number;slots:number;
};
export type DancerPoseV1081={sideStep:number;bob:number;tilt:number;yaw:number;
 leftArm:number;rightArm:number;scale:number;glow:number};
export const REST_DANCER_V1081:Readonly<DancerPoseV1081>=Object.freeze({
 sideStep:0,bob:0,tilt:0,yaw:0,leftArm:0,rightArm:0,scale:1,glow:0,
});
const looks:Record<ArenaShowSceneV1040,DancerStyleV1081>={
 intro:'arrival',verse:'groove',build:'build',hook:'duet',interlude:'breath',finale:'encore',
};
const clamp=(n:unknown,lo:number,hi:number,fallback=lo)=>
 typeof n==='number'&&Number.isFinite(n)?Math.max(lo,Math.min(hi,n)):fallback;
const off=(reason:DancerCueV1081['reason']='disabled'):DancerCueV1081=>({
 active:false,reason,style:'breath',power:0,tempo:0,progressSeconds:0,accent:0,slots:0,
});
export function planHolographicDancersV1081(input:{
 enabled:boolean;stageIsArena:boolean;hologramsEnabled:boolean;showDesignerEnabled:boolean;
 showDirectorEnabled:boolean;playing:boolean;reducedMotion:boolean;reactive:boolean;
 manualPattern:boolean;performanceTier?:'low'|'balanced'|'high'|null;
 progressMs?:number|null;durationMs?:number|null;strength?:number|null;genre?:string|null;
 energy?:number|null;beat?:boolean;beatStrength?:number|null;
 show?:ArenaShowCueV1040|null;baseHolograms?:HologramCueV1068|null;
}):DancerCueV1081{
 if(!input.enabled||!input.stageIsArena||!input.hologramsEnabled||!input.showDesignerEnabled||
    !input.showDirectorEnabled||!input.reactive)return off();
 if(!input.playing)return off('paused');
 if(input.reducedMotion)return off('motion');
 if(input.performanceTier==='low')return off('quality');
 if(input.manualPattern)return off('manual');
 const duration=input.durationMs,ms=input.progressMs;
 if(!Number.isFinite(ms)||!Number.isFinite(duration)|| (duration??0)<30000||
    (duration??0)>1800000||(ms??-1)<0||(ms??0)>(duration??0))return off('clock');
 const show=input.show,base=input.baseHolograms;
 if(!show?.active||typeof show.scene!=='string'||!(show.scene in looks)||!base?.active||
    !Number.isFinite(base.power)||base.power<=0||base.power>1||
    !Number.isFinite(show.fade)||show.fade<=0||show.fade>1)return off('director');
 const strength=clamp(input.strength,0,80,0);
 if(strength<=0)return off();
 const tierGain=input.performanceTier==='balanced'?.62:1;
 const power=clamp(base.power*strength/80*.85*tierGain,0,.75,0);
 if(power<=0)return off();
 const genre=resolveHologramGenreV1039(input.genre);
 const tempo=genre==='hard'?1.65:genre==='rap'?.95:genre==='rock'?1.22:1.08;
 // A planned chapter never produces a beat. The accent is tied to an observed beat.
 const accent=input.beat===true&&clamp(input.beatStrength,0,1,0)>=.75?
   clamp(input.energy,0,1,0)*clamp(input.beatStrength,0,1,0)*.18:0;
 return {active:true,reason:'planned',style:looks[show.scene as ArenaShowSceneV1040],
  power,tempo,progressSeconds:ms!/1000,accent,slots:input.performanceTier==='balanced'?6:9};
}
/** Mutate a reused output object: no per-frame pose allocations or random choreography.
 * All movement stays attached to the fixed portal ring, outside the turning cast deck.
 */
export function sampleHolographicDancerV1081(
 index:number,count:number,cue:DancerCueV1081,out:DancerPoseV1081):void{
 if(!cue.active||!Number.isFinite(cue.progressSeconds)||!Number.isFinite(cue.power)||
  cue.power<=0||cue.power>.75||!Number.isFinite(cue.tempo)||cue.tempo<=0||
  !Number.isInteger(index)||!Number.isInteger(count)||count<1||count>9||index<0||index>=count){
   Object.assign(out,REST_DANCER_V1081);return;
 }
 const pair=index%2===0?1:-1;
 const p=cue.power,t=cue.progressSeconds*cue.tempo;
 const phase=t*(cue.style==='breath'?.55:cue.style==='encore'?1.22:1.05)+index*.32;
 const wave=Math.sin(phase),counter=Math.cos(phase*.75+pair*.6);
 const hook=cue.style==='duet'||cue.style==='encore';
 const still=cue.style==='breath'? .28:cue.style==='arrival'?.42:1;
 const dynamic=cue.style==='build'?1.15:hook?1.07:1;
 const a=p*still*dynamic;
 const mirrored=cue.style==='duet'||cue.style==='encore'?pair:1;
 out.sideStep=clamp(wave*.115*a*mirrored,-.12,.12,0);
 out.bob=clamp((Math.abs(counter)*.072+cue.accent*.10)*a,0,.09,0);
 out.tilt=clamp(wave*.17*a*mirrored,-.15,.15,0);
 out.yaw=clamp(counter*.30*a*pair,-.25,.25,0);
 // Two illuminated arm segments overlay the original opaque silhouette.
 // Mirrored hook choreography, upward arms at finale, relaxed arms at breaks.
 const armFlow=hook?.72:cue.style==='build'?.55:cue.style==='breath'?.08:.32;
 out.leftArm=clamp((-armFlow+wave*.48)*a*mirrored,-1.05,1.05,0);
 out.rightArm=clamp((armFlow+counter*.48)*a*mirrored,-1.05,1.05,0);
 out.scale=clamp(1+Math.sin(phase*.5)*.035*a, .97,1.035,1);
 out.glow=clamp((.11+cue.accent*.45)*p,0,.20,0);
}
