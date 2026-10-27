/** V569 – reuse one mutable, source-owned LOD state buffer per GLB instance.
 * The frame mixer continues running at its original cadence; only allocating
 * one new clip-state object and Object.entries array per render frame is avoided.
 * No hard cap on the number of embedded or imported animation clips.
 */
import type {PlaybackSnapshot,ClipSnapshot} from './lodPlaybackContinuity';

export interface LodActionV569 {
 time:number; timeScale:number; paused:boolean;
 getEffectiveWeight():number;
 isRunning():boolean;
}

export function createLodPlaybackBufferV569():PlaybackSnapshot {
 return {savedAt:0,timelineElapsed:null,clips:Object.create(null) as Record<string,ClipSnapshot>};
}
/** Updates in place. Only a newly encountered clip allocates a snapshot object.
 * A removed clip is purged, so an old action can never be replayed after LOD change.
 * Consumers must treat returned snapshots as transient, not immutable history.
 */
export function updateLodPlaybackBufferV569(
 buffer:PlaybackSnapshot,
 actions:Readonly<Record<string,LodActionV569|null|undefined>>,
 now:number,
 timelineElapsed:number|null,
):PlaybackSnapshot {
 if(!Number.isFinite(now)||now<0)return buffer;
 buffer.savedAt=now;
 buffer.timelineElapsed=timelineElapsed!==null&&Number.isFinite(timelineElapsed)&&timelineElapsed>=0?timelineElapsed:null;
 for(const name in actions){
  if(!Object.prototype.hasOwnProperty.call(actions,name))continue;
  const action=actions[name];
  if(!action){delete buffer.clips[name];continue;}
  let clip=buffer.clips[name];
  if(!clip)clip=buffer.clips[name]={time:0,weight:0,running:false,paused:false,timeScale:1};
  clip.time=Number.isFinite(action.time)?action.time:0;
  const weight=action.getEffectiveWeight();
  clip.weight=Number.isFinite(weight)?Math.max(0,Math.min(1,weight)):0;
  clip.running=action.isRunning();
  clip.paused=!!action.paused;
  clip.timeScale=Number.isFinite(action.timeScale)?action.timeScale:1;
 }
 for(const name in buffer.clips){
  if(!Object.prototype.hasOwnProperty.call(actions,name)||!actions[name])delete buffer.clips[name];
 }
 return buffer;
}
