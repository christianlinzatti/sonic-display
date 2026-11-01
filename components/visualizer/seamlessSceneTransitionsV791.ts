/** V791 — seamless, scene-level handoffs within the VERIFIED V790 storyboard.
 * Pure, playback-position based rate planner; modifies ONLY existing camera and
 * lighting interpolation. No camera cuts, brightness spikes, clock, scene objects,
 * lyric timestamps, or persistence. V609 remains the act-level fallback.
 */
import type {ShowPlanV790,ShowCueV790,ShowSceneV790} from './cinematicShowDirectorV790';

export type SceneTransitionKindV791='intra-act'|'act-change'|'off';
export type SceneTransitionCueV791={
  active:boolean;sceneIndex:number;kind:SceneTransitionKindV791;
  edge:'entry'|'exit'|'off';proximity:number;
  cameraRate:number;lightingRate:number;
};
export type SceneTransitionInputV791={
  trackId:string;durationMs:number;positionMs:number;playing:boolean;enabled:boolean;
  reducedMotion:boolean;tier:'low'|'balanced'|'high';lyricsProtected:boolean;
  manualCamera:boolean;manualLighting:boolean;show:ShowCueV790;
};
const OFF:Readonly<SceneTransitionCueV791>=Object.freeze({
  active:false,sceneIndex:-1,kind:'off',edge:'off',proximity:0,cameraRate:1,lightingRate:1,
});
const finite=(x:unknown):x is number=>typeof x==='number'&&Number.isFinite(x);
const clamp=(x:number,a:number,b:number)=>Math.max(a,Math.min(b,x));
const smooth=(x:number)=>{const t=clamp(x,0,1);return t*t*(3-2*t);};
const round=(x:number)=>Math.round(x*100000)/100000;

/** Only adjacent, explicitly verified V790 scene intervals can form a seam.
 * A gap (or a track/seek/cue mismatch) falls back to V609 unchanged.
 */
export function sampleSeamlessSceneTransitionV791(plan:ShowPlanV790,input:SceneTransitionInputV791):SceneTransitionCueV791{
  const cue=input.show;
  if(!input.enabled||!input.playing||input.reducedMotion||input.tier==='low'||
    !cue?.active||cue.reason!=='verified-show'||plan.source!=='verified-storyboard'||
    !input.trackId||input.trackId!==plan.trackId||input.durationMs!==plan.durationMs||
    !finite(input.positionMs)||input.positionMs<0||input.positionMs>=plan.durationMs||
    !Number.isInteger(cue.sceneIndex)||cue.sceneIndex<0||cue.sceneIndex>=plan.scenes.length||
    (input.manualCamera&&input.manualLighting))return OFF;
  const scene=plan.scenes[cue.sceneIndex];
  if(!scene||scene.index!==cue.sceneIndex||scene.actIndex!==cue.actIndex||
    scene.intent!==cue.intent||scene.moment!==cue.moment||
    !finite(scene.startMs)||!finite(scene.endMs)||
    input.positionMs<scene.startMs||input.positionMs>=scene.endMs||
    scene.endMs-scene.startMs<1200)return OFF;

  let closest:{other:ShowSceneV790;edge:'entry'|'exit';distance:number;windowMs:number}|null=null;
  const consider=(other:ShowSceneV790|undefined,edge:'entry'|'exit',distance:number)=>{
    if(!other||other.index!==scene.index+(edge==='entry'?-1:1)||
      !finite(other.startMs)||!finite(other.endMs)||other.endMs-other.startMs<1200||
      (edge==='entry'?other.endMs!==scene.startMs:other.startMs!==scene.endMs)||
      other.intent===scene.intent&&other.actIndex===scene.actIndex)return;
    const windowMs=Math.min(2200,(scene.endMs-scene.startMs)*.23,
      (other.endMs-other.startMs)*.23);
    if(windowMs<276||distance>=windowMs)return;
    if(!closest||distance<closest.distance)closest={other,edge,distance,windowMs};
  };
  consider(plan.scenes[cue.sceneIndex-1],'entry',input.positionMs-scene.startMs);
  consider(plan.scenes[cue.sceneIndex+1],'exit',scene.endMs-input.positionMs);
  if(!closest)return OFF;
  // TS narrowing from a closure can be fragile under strict isolated compilation.
  const seam=closest as {other:ShowSceneV790;edge:'entry'|'exit';distance:number;windowMs:number};
  const proximity=1-smooth(seam.distance/seam.windowMs);
  const tierGain=input.tier==='balanced'?.65:1;
  const weight=proximity*tierGain;
  const actChange=seam.other.actIndex!==scene.actIndex;
  // Explicitly softer for portrait/dialogue, slightly faster for energetic
  // hook/drop handoffs. Never change lighting power, only how it eases.
  const cameraFloor=actChange?.65:scene.intent==='portrait'||scene.intent==='dialogue'?.60:.69;
  const lightFloor=actChange?.66:scene.moment==='breath'?.72:.63;
  const lightingGuard=input.lyricsProtected?.45:1;
  return {active:true,sceneIndex:scene.index,kind:actChange?'act-change':'intra-act',
    edge:seam.edge,proximity:round(proximity),
    cameraRate:input.manualCamera?1:round(1-(1-cameraFloor)*weight),
    lightingRate:input.manualLighting?1:round(1-(1-lightFloor)*weight*lightingGuard)};
}
