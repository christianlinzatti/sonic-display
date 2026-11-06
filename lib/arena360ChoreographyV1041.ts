/** V1041 · Show-driven avatar choreography. Local, deterministic and opt-in.
 * This adapter feeds V206/V142's EXISTING duo formation engine. It does not
 * create a second animation mixer, reposition joints or synthesize vocal roles.
 * Timeline percentages are show templates, not observed beat/section evidence.
 */
import type {ArenaShowCueV1040,ArenaShowDanceV1040} from './arena360ShowDesignerV1040';
export type ArenaChoreoFormationV1041='auto'|'line'|'diagonal'|'wide';
export type ArenaChoreoSceneV1041='solo'|'sync'|'duet'|'mirror';
export type ArenaChoreoCueV1041={
 active:boolean;reason:'disabled'|'paused'|'motion'|'manual'|'performance'|'clock'|'planned';
 scene:ArenaChoreoSceneV1041;formation:'line'|'diagonal'|'wide';
 role:'together';leadGain:number;partnerGain:number;phrase:number;
 partnerDelayBeats:number;dropAccent:false;strength:number;
};
export const OFF_ARENA_CHOREO_V1041:ArenaChoreoCueV1041=Object.freeze({
 active:false,reason:'disabled',scene:'solo',formation:'line',role:'together',
 leadGain:1,partnerGain:1,phrase:0,partnerDelayBeats:0,dropAccent:false,strength:0,
});
const bounded=(value:unknown,fallback:number,min:number,max:number)=>
 typeof value==='number'&&Number.isFinite(value)?Math.max(min,Math.min(max,value)):fallback;
const formationFor=(dance:ArenaShowDanceV1040,phase:number):ArenaChoreoCueV1041['formation']=>
 dance==='peak'||dance==='group'?'wide':dance==='groove'?(phase%2?'diagonal':'line'):'line';
/** Use ONE audio playback position, never a wall-clock timer or invented singer ID.
 * A manual performer configuration, authored timeline or automatic cast always wins.
 * Low renderer tier opts out to avoid creating an unnecessary second avatar.
 */
export function planArenaChoreographyV1041(input:{
 enabled:boolean;show?:ArenaShowCueV1040|null;playing:boolean;reducedMotion:boolean;
 manualPriority:boolean;stageIsArena:boolean;trackId?:string|null;
 progressMs?:number|null;genre?:string|null;strength?:number;
 formation?:ArenaChoreoFormationV1041;performanceTier?:'low'|'balanced'|'high';
}):ArenaChoreoCueV1041{
 if(!input.enabled||!input.stageIsArena||!input.show?.active)return OFF_ARENA_CHOREO_V1041;
 if(!input.playing)return {...OFF_ARENA_CHOREO_V1041,reason:'paused'};
 if(input.reducedMotion)return {...OFF_ARENA_CHOREO_V1041,reason:'motion'};
 if(input.manualPriority)return {...OFF_ARENA_CHOREO_V1041,reason:'manual'};
 if(input.performanceTier==='low')return {...OFF_ARENA_CHOREO_V1041,reason:'performance'};
 if(!input.trackId||typeof input.progressMs!=='number'||!Number.isFinite(input.progressMs)||input.progressMs<0)
  return {...OFF_ARENA_CHOREO_V1041,reason:'clock'};
 const strength=bounded(input.strength,60,0,100)/100;
 if(strength===0)return OFF_ARENA_CHOREO_V1041;
 const cue=input.show;
 // No fake detected phrases: this is a bounded visualization template (8s blocks).
 const phrase=Math.floor(input.progressMs/8000);
 const energetic=cue.dance==='peak'||cue.dance==='group';
 const hard=/hardtekk|hardstyle|hardcore/i.test(input.genre??'');
 const calm=cue.dance==='calm';
 const scene:ArenaChoreoSceneV1041=calm?'solo':energetic?(hard&&phrase%2?'mirror':'sync'):'duet';
 const formation=input.formation&&input.formation!=='auto'?input.formation:formationFor(cue.dance,phrase);
 const envelope=bounded(cue.intensity,0,0,100)/100;
 const gain=Math.min(1,strength*envelope);
 // Reactivity gains are subtle; no pressure to override a loaded GLB dance clip.
 const leadGain=calm?1:1+Math.min(.18,gain*.18);
 const partnerGain=calm?1:1+Math.min(.18,gain*.18)*(cue.dance==='groove'&&phrase%2===0?.7:1);
 return {active:true,reason:'planned',scene,formation,role:'together',
  leadGain,partnerGain,phrase,partnerDelayBeats:energetic?0:0.25,
  dropAccent:false,strength:gain};
}
