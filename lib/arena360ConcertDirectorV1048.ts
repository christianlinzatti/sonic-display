/** V1048 · Next Generation Concert Director.
 * A deterministic, track-specific re-arranger for opt-in 360° show templates.
 * It does NOT perform generative AI, call a service, infer musical sections or
 * create camera/animation/light hardware controllers. Existing manual and safety
 * authority always wins. All changes are suggestions to pre-existing systems.
 */
import type {ArenaShowPlanV1040,ArenaShowCueV1040,ArenaShowSceneV1040,
 ArenaShowCameraV1040,ArenaShowDanceV1040,ArenaShowDeckV1040,
 ArenaShowFloatV1040,ArenaShowLaserV1040} from './arena360ShowDesignerV1040';

export type ConcertMotifV1048='cinematic'|'orbit'|'pulse'|'anthem';
export type ConcertDirectorCueV1048={
 active:boolean;motif:ConcertMotifV1048|null;segmentIndex:number;
 show:ArenaShowCueV1040;varying:boolean;
};
const clamp=(n:unknown, fallback:number, lo:number, hi:number):number=>
 typeof n==='number'&&Number.isFinite(n)?Math.max(lo,Math.min(hi,n)):fallback;
/** FNV-1a: same song/plan produces the same show, with no random per-frame jitter. */
export function concertSongSeedV1048(trackId:string,plan:ArenaShowPlanV1040):number{
 let hash=2166136261;
 const key=`${trackId.slice(0,256)}|${plan.genre}|${plan.prompt.slice(0,400)}|${plan.title.slice(0,75)}`;
 for(let i=0;i<key.length;i++)hash=Math.imul(hash^key.charCodeAt(i),16777619)>>>0;
 return hash;
}
const MOTIFS:readonly ConcertMotifV1048[]=['cinematic','orbit','pulse','anthem'];
// Seven visibly distinct cues with no adjacent repetition, independently rotated per song.
const ORDER:readonly number[]=[0,2,1,3,0,3,1];
export function concertSongMotifV1048(trackId:string,plan:ArenaShowPlanV1040,index:number):ConcertMotifV1048{
 const offset=concertSongSeedV1048(trackId,plan)%MOTIFS.length;
 return MOTIFS[(ORDER[Math.max(0,Math.min(6,Math.floor(index)))]+offset)%MOTIFS.length];
}
// The default template patterns. A manually changed segment field is never overwritten.
const DEFAULTS:Record<ArenaShowSceneV1040,readonly [ArenaShowDeckV1040,ArenaShowFloatV1040,ArenaShowLaserV1040,ArenaShowCameraV1040,ArenaShowDanceV1040]>={
 intro:['halo','wave','halo','wide','calm'],verse:['halo','wave','halo','lead','groove'],
 build:['spiral','rise','spiral','orbit','groove'],hook:['fan','orbit','tunnel','group','group'],
 interlude:['halo','wave','halo','wide','calm'],finale:['fan','rise','tunnel','group','peak'],
};
const LOOKS:Record<ConcertMotifV1048,readonly [ArenaShowDeckV1040,ArenaShowFloatV1040,ArenaShowLaserV1040,ArenaShowCameraV1040,ArenaShowDanceV1040]>={
 cinematic:['halo','wave','halo','wide','calm'],
 orbit:['spiral','orbit','spiral','orbit','groove'],
 pulse:['fan','rise','tunnel','lead','groove'],
 anthem:['fan','orbit','tunnel','group','group'],
};
/** V1048 never increases authored intensity; it gently varies existing effects.
 * All clients (stage, avatars, camera, Govee overlay) call the same pure function.
 */
export function directArenaShowV1048(input:{
 enabled:boolean;stageIsArena:boolean;playing:boolean;reducedMotion:boolean;
 reactive?:boolean;show:ArenaShowCueV1040;plan?:ArenaShowPlanV1040|null;
 trackId?:string|null;progressMs?:number|null;durationMs?:number|null;
 strength?:number|null;performanceTier?:'low'|'balanced'|'high'|null;
}):ConcertDirectorCueV1048{
 const off:ConcertDirectorCueV1048={active:false,motif:null,segmentIndex:-1,show:input.show,varying:false};
 const plan=input.plan,show=input.show;
 if(!input.enabled||!input.stageIsArena||!input.playing||input.reducedMotion||input.reactive===false||
  input.performanceTier==='low'||!show?.active||show.segmentIndex<0||!plan||
  plan.version!==1040||!Array.isArray(plan.segments)||plan.segments.length!==7||
  !input.trackId||!Number.isFinite(input.progressMs)||!Number.isFinite(input.durationMs)||
  (input.progressMs??-1)<0||(input.durationMs??0)<30000||
  (input.progressMs??0)>(input.durationMs??0))return off;
 const segment=plan.segments[show.segmentIndex];
 if(!segment||segment.scene!==show.scene||!Number.isFinite(show.intensity)||
  !Number.isFinite(show.fade)||show.fade<0||show.fade>1)return off;
 const strength=clamp(input.strength,50,0,70)/100;
 if(strength<=0||show.intensity<=0)return off;
 const motif=concertSongMotifV1048(input.trackId,plan,show.segmentIndex);
 const defaults=DEFAULTS[segment.scene],look=LOOKS[motif];
 // Maintain musical dramaturgy: an intro stays calm; a finale remains a peak.
 // V1041 still has exclusive authority over actual cast, clips and formations.
 const visual=segment.scene==='finale'?
  ([defaults[0],look[1],defaults[2],defaults[3],defaults[4]] as const):
  segment.scene==='intro'||segment.scene==='interlude'?
  ([look[0],look[1],look[2],defaults[3],defaults[4]] as const):
  segment.scene==='hook'?([look[0],look[1],look[2],look[3],defaults[4]] as const):
  segment.scene==='build'?([look[0],look[1],look[2],look[3],defaults[4]] as const):
  ([look[0],look[1],look[2],look[3],motif==='anthem'?'group':defaults[4]] as const);
 // A four-second scene entry envelope keeps changes restrained across transitions.
 const segmentMs=segment.start*(input.durationMs??0);
 const entry=Math.min(1,Math.max(0,((input.progressMs??0)-segmentMs)/4000));
 const phase=(input.progressMs??0)/12500;
 const pulse=.5+.5*Math.cos(phase*2*Math.PI);
 // Lower tiers get only half the variation. Even at 70%, no boosts over the template.
 const gain=strength*(input.performanceTier==='balanced'?.5:1)*entry;
 const attenuation=1-gain*(.10+.10*pulse);
 const intensity=Math.min(show.intensity,Math.max(0,Math.round(show.intensity*attenuation)));
 const old=[show.deck,show.floating,show.lasers,show.camera,show.dance] as const;
 const result={...show,intensity,
  deck:old[0]===defaults[0]?visual[0]:show.deck,
  floating:old[1]===defaults[1]?visual[1]:show.floating,
  lasers:old[2]===defaults[2]?visual[2]:show.lasers,
  camera:old[3]===defaults[3]?visual[3]:show.camera,
  dance:old[4]===defaults[4]?visual[4]:show.dance};
 return {active:true,motif,segmentIndex:show.segmentIndex,show:result,varying:true};
}
