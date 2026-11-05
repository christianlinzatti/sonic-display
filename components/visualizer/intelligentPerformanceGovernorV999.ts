/** V999 – a reduction-only concert decoration governor.
 * Reuses the existing once-per-second R3F FPS/P95 sample, not a GPU timer.
 * Never writes playback, avatar, lips, dance, lyrics, camera or Govee state.
 */
export type ConcertBudgetLevelV999=0|1|2|3;
export type ConcertBudgetV999=Readonly<{
 level:ConcertBudgetLevelV999;pressureSeconds:number;recoverySeconds:number;
 cooldownSeconds:number;validSamples:number;
}>;
export type ConcertBudgetWindowV999=Readonly<{
 fps:number;p95FrameMs:number;slowRatio:number;elapsed:number;
 drawCalls:number;triangles:number;avatarCount:number;
 playing:boolean;visible:boolean;transitioning:boolean;auto:boolean;targetFps:30|45|60;
}>;
export type ConcertBudgetFactorsV999=Readonly<{
 depth:number;crowd:number;led:number;bass:number;
}>;
export const initialConcertBudgetV999=():ConcertBudgetV999=>({level:0,pressureSeconds:0,recoverySeconds:0,cooldownSeconds:0,validSamples:0});
const clamp=(n:number,lo:number,hi:number)=>Math.max(lo,Math.min(hi,n));
const numeric=(n:number)=>Number.isFinite(n);
const nextLevel=(level:ConcertBudgetLevelV999,dir:1|-1):ConcertBudgetLevelV999=>clamp(level+dir,0,3) as ConcertBudgetLevelV999;
export const concertBudgetFactorsV999=(level:ConcertBudgetLevelV999):ConcertBudgetFactorsV999=>
 level===3?{depth:0,crowd:0,led:.22,bass:0}:
 level===2?{depth:.25,crowd:.25,led:.55,bass:.42}:
 level===1?{depth:.60,crowd:.65,led:.82,bass:.75}:
 {depth:1,crowd:1,led:1,bass:1};
/** Worsening is faster than recovery, changes are at most one level, and both
 * have cooldowns. An inactive/paused/hidden tab has a neutral effective output.
 * Invalid telemetry is ignored rather than mistaken for a low FPS measurement.
 */
export function advanceConcertBudgetV999(previous:ConcertBudgetV999,w:ConcertBudgetWindowV999):ConcertBudgetV999 {
 if(!w.auto||!w.playing||!w.visible||w.transitioning)return initialConcertBudgetV999();
 if(![w.fps,w.p95FrameMs,w.slowRatio,w.elapsed,w.drawCalls,w.triangles,w.avatarCount].every(numeric)||
   w.fps<=0||w.fps>240||w.p95FrameMs<=0||w.p95FrameMs>250||w.slowRatio<0||w.slowRatio>1||
   w.elapsed<.5||w.elapsed>2.5||w.drawCalls<0||w.triangles<0||w.avatarCount<0||w.avatarCount>64||
   ![30,45,60].includes(w.targetFps))return previous;
 const target=w.targetFps;
 const budgetMs=1000/target;
 const severe=w.fps<target*.68||w.p95FrameMs>budgetMs*1.9||w.slowRatio>.44;
 const stressed=severe||w.fps<target*.86||w.p95FrameMs>budgetMs*1.5||w.slowRatio>.26;
 const recovered=w.fps>=target*.96&&w.p95FrameMs<=budgetMs*1.22&&w.slowRatio<=.11;
 const cooldownSeconds=Math.max(0,previous.cooldownSeconds-w.elapsed);
 const pressureSeconds=stressed?clamp(previous.pressureSeconds+w.elapsed,0,20):0;
 const recoverySeconds=recovered?clamp(previous.recoverySeconds+w.elapsed,0,40):0;
 const validSamples=Math.min(previous.validSamples+1,1000000);
 if(cooldownSeconds===0&&pressureSeconds>=(severe?2.5:4)&&previous.level<3)
  return {level:nextLevel(previous.level,1),pressureSeconds:0,recoverySeconds:0,cooldownSeconds:severe?4:6,validSamples};
 if(cooldownSeconds===0&&recoverySeconds>=18&&previous.level>0)
  return {level:nextLevel(previous.level,-1),pressureSeconds:0,recoverySeconds:0,cooldownSeconds:12,validSamples};
 return {level:previous.level,pressureSeconds, recoverySeconds,cooldownSeconds,validSamples};
}
/** Mutate only *optional, pre-authorised* V989 layers, preserving all user cues. */
export function limitDepthV999<T extends {active:boolean;layers:readonly {opacity:number}[]}>(cue:T,gain:number):T {
 if(!cue.active||gain>=1)return cue;
 if(gain<=0)return {...cue,active:false,layers:[]} as T;
 const n=Math.max(1,Math.ceil(cue.layers.length*gain));
 return {...cue,layers:cue.layers.slice(0,n).map(layer=>({...layer,opacity:layer.opacity*gain}))} as T;
}
/** The inherited crowd stays authorised or disabled; reduction never reenables it. */
export function limitCrowdV999<T extends {crowdActiveV996:boolean;crowdSticksV996:number;crowdGlowV996:number;crowdWaveV996:number;crowdReactionV996:number}>(cue:T,gain:number):T {
 if(!cue.crowdActiveV996||gain>=1)return cue;
 const g=clamp(gain,0,1);
 return {...cue,crowdActiveV996:g>0,crowdSticksV996:Math.floor(cue.crowdSticksV996*g),
  crowdGlowV996:cue.crowdGlowV996*g,crowdWaveV996:cue.crowdWaveV996*g,crowdReactionV996:cue.crowdReactionV996*g} as T;
}
