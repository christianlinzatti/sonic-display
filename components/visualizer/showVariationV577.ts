/** V577/579: bounded, deterministic concert visual variety, without timers/RNG.
 * Only automatic V568 output: never modifies manual channels, song timing or lyrics.
 */
import type {SmartConcertDirectionV568} from './smartConcertShowDirectorV568';
import type {ConcertDynamicsV502} from './smartConcertDynamicsV502';
export function varyConcertDirectorV577(base:SmartConcertDirectionV568,input:{progressMs:number;
 manualDance:boolean;manualCamera:boolean;manualLighting:boolean;playing:boolean;reducedMotion:boolean}):ConcertDynamicsV502{
 if(!base.active||!input.playing||input.reducedMotion||!Number.isFinite(input.progressMs)||input.progressMs<0)return base.dynamics;
 // Fixed two-bar-like windows, phase only changes on slow boundaries: avoid frame-wise jitter.
 const variation=Math.floor(input.progressMs/18000)%3;
 const factor=variation===0?0:variation===1?1:-1;
 if(factor===0)return base.dynamics;
 const scale=base.lyricsProtected?.3:1;
 const bound=(value:number)=>Math.max(.88,Math.min(1.12,value));
 return {...base.dynamics,
   dance:input.manualDance?base.dynamics.dance:bound(base.dynamics.dance*(1+factor*.003*scale)),
   camera:input.manualCamera?base.dynamics.camera:bound(base.dynamics.camera*(1-factor*.004*scale)),
   lighting:input.manualLighting?base.dynamics.lighting:bound(base.dynamics.lighting*(1+factor*.007*scale))};
}
