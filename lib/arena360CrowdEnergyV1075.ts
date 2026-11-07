/** V1075 · Crowd Energy Engine
 * Opt-in, purely optical response for the EXISTING instanced audience renderer.
 * Authoring templates are not evidence of real applause or a detected drop.
 * Existing audio features only modulate bounded, slow movements and light.
 */
import type {ArenaShowCueV1040,ArenaShowSceneV1040} from './arena360ShowDesignerV1040';

export type CrowdEnergyMoodV1075='arrival'|'groove'|'rise'|'peak'|'breath'|'encore';
export interface CrowdEnergyCueV1075 {
 active:boolean;reason:'disabled'|'paused'|'motion'|'performance'|'manual'|'show'|'clock'|'planned';
 mood:CrowdEnergyMoodV1075;gain:number;motion:number;light:number;phase:number;
}
export interface CrowdEnergySampleV1075 {sway:number;rise:number;arms:number;head:number;light:number;}
export const OFF_CROWD_ENERGY_V1075:CrowdEnergyCueV1075=Object.freeze({
 active:false,reason:'disabled',mood:'arrival',gain:0,motion:0,light:0,phase:0,
});
export const ZERO_CROWD_ENERGY_V1075:CrowdEnergySampleV1075=Object.freeze({sway:0,rise:0,arms:0,head:0,light:0});
const bound=(v:unknown,lo:number,hi:number,fallback=0):number=>
 typeof v==='number'&&Number.isFinite(v)?Math.min(hi,Math.max(lo,v)):fallback;
const MOODS:Record<ArenaShowSceneV1040,CrowdEnergyMoodV1075>={
 intro:'arrival',verse:'groove',build:'rise',hook:'peak',interlude:'breath',finale:'encore',
};
const ENERGY:Record<CrowdEnergyMoodV1075,number>={
 arrival:.17,groove:.35,rise:.62,peak:.87,breath:.09,encore:.94,
};
/** A valid show cue and a live song clock are mandatory. No track identification via lyrics. */
export function planCrowdEnergyV1075(input:{
 enabled:boolean;stageIsArena:boolean;audienceEnabled:boolean;
 showDesignerEnabled:boolean;showDirectorEnabled:boolean;
 playing:boolean;reducedMotion:boolean;reactive?:boolean;
 performanceTier?:'low'|'balanced'|'high'|null;
 phoneMode?:string;show?:ArenaShowCueV1040|null;
 trackId?:string|null;progressMs?:number|null;durationMs?:number|null;
 strength?:number;observedSection?:string|null;
}):CrowdEnergyCueV1075 {
 const off=OFF_CROWD_ENERGY_V1075;
 if(!input.enabled||!input.stageIsArena||!input.audienceEnabled||
    !input.showDesignerEnabled||!input.showDirectorEnabled||input.reactive===false)return off;
 if(!input.playing)return {...off,reason:'paused'};
 if(input.reducedMotion)return {...off,reason:'motion'};
 if(input.performanceTier==='low')return {...off,reason:'performance'};
 if(input.phoneMode&&input.phoneMode!=='wave')return {...off,reason:'manual'};
 const show=input.show;
 if(!show?.active||!show.scene||!(show.scene in MOODS)||!Number.isInteger(show.segmentIndex)||
    show.segmentIndex<0||show.segmentIndex>6||typeof show.intensity!=='number'||
    !Number.isFinite(show.intensity)||show.intensity<=0||show.intensity>100||
    typeof show.fade!=='number'||!Number.isFinite(show.fade)||show.fade<=0||show.fade>1)
    return {...off,reason:'show'};
 if(typeof input.trackId!=='string'||!input.trackId.trim()||
    typeof input.progressMs!=='number'||!Number.isFinite(input.progressMs)||input.progressMs<0||
    typeof input.durationMs!=='number'||!Number.isFinite(input.durationMs)||input.durationMs<30000||
    input.progressMs>input.durationMs)return {...off,reason:'clock'};
 if(typeof input.strength!=='number'||!Number.isFinite(input.strength)||
    input.strength<=0||input.strength>80)return off;
 const mood=MOODS[show.scene];
 // A trustworthy reported hook can raise the amplitude slightly, never trigger audio.
 const verifiedHook=input.observedSection==='hook'&&mood==='peak';
 const gain=bound(input.strength/100*(show.intensity/100)*show.fade*
   (input.performanceTier==='balanced'?.7:1)*(verifiedHook?1.04:1),0,.75);
 if(gain<.001)return off;
 let hash=2166136261;
 for(let i=0;i<Math.min(input.trackId.length,120);i++)
   hash=Math.imul(hash^input.trackId.charCodeAt(i),16777619);
 const phase=((hash>>>0)%4096)/4096*Math.PI*2;
 const motion=bound(gain*ENERGY[mood],0,.65);
 return {active:true,reason:'planned',mood,gain,motion,
   light:bound(gain*(mood==='breath'?.22:mood==='arrival'?.33:.78),0,.62),phase};
}
/** Soft travelling audience wave. Beat and bass vary amplitude only; they cannot
 * manufacture applause, chants, a new drop, a lamp or a show section.
 * Output cannot exceed existing crowd motion and phone-light budgets. */
export function sampleCrowdEnergyV1075(cue:CrowdEnergyCueV1075|null|undefined,
 angle:number,seconds:number,beatStrength=0,bass=0):CrowdEnergySampleV1075 {
 if(!cue?.active||!Number.isFinite(angle)||!Number.isFinite(seconds)||seconds<0)
   return ZERO_CROWD_ENERGY_V1075;
 const beat=bound(beatStrength,0,1),low=bound(bass,0,1),t=seconds;
 const wave=.5+.5*Math.cos(angle*2.3-t*(cue.mood==='rise'?2.05:1.12)+cue.phase);
 const breathe=.5+.5*Math.sin(t*.61+angle*.6+cue.phase);
 const boost=.75+.15*beat+.10*low; // always <=1
 const volume=cue.motion*boost;
 return {sway:bound(volume*.025*(2*wave-1),-.016,.016),
  rise:bound(volume*.10*wave,0,.065),
  arms:bound(volume*(.24+.52*wave),0,.47),
  head:bound(volume*.09*(2*breathe-1),-.053,.053),
  // A normalized multiplier, never increases the underlying manual phone light.
  light:bound(.64+cue.light*(.20+.16*wave),0,1)};
}
