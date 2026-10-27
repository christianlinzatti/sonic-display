/** V528 editorial scene adapter. Mirrors existing V385 / V416 / V496 role priority. */
import {planConcertSceneV528,inactiveConcertSceneV528,type ConcertSceneV528} from './cinematicConcertCoordinationV528';
import type {Lyrics} from '@/types/music';
import {resolveManualVocalCueV385,type VocalAssignmentV385} from './manualVocalCastingV385';
import {resolveRapDuetCueV416,toVocalCueV416,type RapDuetAssignmentV416} from './rapDuetStudioV416';
import {resolveVocalTimeCueV496,type VocalTimeSegmentV496} from './vocalTimeDirectorV496';
const finite=(value:number)=>Number.isFinite(value);
const clamp=(value:number,min:number,max:number)=>Math.max(min,Math.min(max,value));
/** Mirror V517's assignment precedence from the dancer. No microphone/artist-credit inference. */
export function resolveAuthoredConcertSceneV528(input:{
 trackId?:string|null;lyrics?:Lyrics|null;count:number;progressMs:number;
 playing:boolean;reducedMotion:boolean;tier:'low'|'balanced'|'high';
 manualStage?:boolean;roleOffsetMs?:number;
 manualEnabled?:boolean;manualCameraAllowed?:boolean;manualAssignments?:readonly VocalAssignmentV385[];
 timeEnabled?:boolean;timeCameraAllowed?:boolean;timeSegments?:readonly VocalTimeSegmentV496[];
 duetEnabled?:boolean;duetCameraAllowed?:boolean;duetAssignments?:readonly RapDuetAssignmentV416[];
}):ConcertSceneV528{
 const {trackId,progressMs,count}=input;
 if(!trackId||input.manualStage)return inactiveConcertSceneV528();
 const manual=resolveManualVocalCueV385({lyrics:input.lyrics,progressMs,playing:input.playing,
   enabled:input.manualEnabled===true,assignments:input.manualAssignments,count});
 const timed=resolveVocalTimeCueV496({trackId,progressMs,playing:input.playing,
   reducedMotion:input.reducedMotion,count,enabled:input.timeEnabled===true&&!manual.active,
   segments:input.timeSegments});
 // An editorial offset applies only to V416, just as it does to V517's cue.
 const offset=finite(input.roleOffsetMs??0)?clamp(input.roleOffsetMs??0,-300,300):0;
 const duet=resolveRapDuetCueV416({lyrics:input.lyrics,progressMs:progressMs+offset,
   playing:input.playing,reducedMotion:input.reducedMotion,count,
   enabled:input.duetEnabled===true&&!manual.active&&!timed.active,
   assignments:input.duetAssignments});
 // Respect the user's per-source camera off switches even when singer cues are valid.
 if ((manual.active && input.manualCameraAllowed === false) ||
     (timed.active && input.timeCameraAllowed === false) ||
     (duet.active && input.duetCameraAllowed === false)) return inactiveConcertSceneV528();
 const cue=timed.active?toVocalCueV416(timed):duet.active?toVocalCueV416(duet):manual;
 return planConcertSceneV528({trackId,cueTrackId:trackId,count,progressMs,playing:input.playing,
   reducedMotion:input.reducedMotion,tier:input.tier,cue});
}
