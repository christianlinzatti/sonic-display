/** V803: pure, evidence-bound selection for a single frozen WebGL A/B review.
 * The pose is a *preview approximation* of V790 intent, not the live V289/V747
 * camera pipeline or a measurement of actual visual quality.
 */
import type {ShowPlanV790,ShowSceneV790} from './cinematicShowDirectorV790';
import type {ImprovementPreviewV802} from './concertImprovementAssistantV802';
export type PreviewCameraPoseV803={x:number;y:number;z:number;targetY:number;fov:number;targetX?:number;targetZ?:number};
export type ComparisonViewV803={source:'verified-preview';trackId:string;sceneIndex:number;
  progressMs:number;startMs:number;endMs:number;section:string;
  before:ShowSceneV790['intent'];after:ShowSceneV790['intent'];
  beforePose:PreviewCameraPoseV803;afterPose:PreviewCameraPoseV803};
const finite=(v:unknown):v is number=>typeof v==='number'&&Number.isFinite(v);
const offset=(intent:ShowSceneV790['intent']):PreviewCameraPoseV803=>{
  // Stable approximation in the same 3D units used by the isolated review stage.
  // Distance/FOV pairs are tuned to keep a 2.2 m GLB inside both half-views.
  const poses:Record<ShowSceneV790['intent'],PreviewCameraPoseV803>={
    portrait:{x:.12,y:1.7,z:3.5,targetY:1.45,fov:34},
    dialogue:{x:1.05,y:1.72,z:4.25,targetY:1.2,targetX:0,fov:43},
    ensemble:{x:0,y:1.85,z:6.65,targetY:1.15,fov:49},
    wide:{x:0,y:2.18,z:7.2,targetY:1.15,fov:52},
    rise:{x:-.7,y:3.55,z:5.55,targetY:1.15,fov:47},
    pulse:{x:.7,y:1.65,z:4.65,targetY:1.3,fov:40},
    breath:{x:0,y:2,z:6.5,targetY:1.05,fov:50},
  };
  return {...poses[intent]};
};
export function resolveConcertComparisonV803(plan:ShowPlanV790|null|undefined,
  draft:ImprovementPreviewV802|null|undefined,sceneIndex:number,
  progressMs?:number):ComparisonViewV803|null{
  if(!plan||plan.source!=='verified-storyboard'||!plan.trackId||
    !finite(plan.durationMs)||plan.durationMs<=0||!draft||draft.source!=='verified-draft'||
    draft.before.source!=='verified-plan'||draft.after.source!=='verified-plan'||
    !draft.changes.length||draft.before.trackId!==plan.trackId||
    draft.after.trackId!==plan.trackId||draft.before.durationMs!==plan.durationMs||
    draft.after.durationMs!==plan.durationMs||!Number.isInteger(sceneIndex)||
    sceneIndex<0||sceneIndex>=plan.scenes.length)return null;
  const scene=plan.scenes[sceneIndex],change=draft.changes.find(c=>c.sceneIndex===sceneIndex);
  if(!change||draft.changes.filter(c=>c.sceneIndex===sceneIndex).length!==1||
    scene.index!==sceneIndex||scene.intent!==change.before||scene.startMs!==change.startMs||
    scene.endMs!==change.endMs||scene.endMs>plan.durationMs||
    !finite(scene.startMs)||!finite(scene.endMs)||scene.startMs<0||
    scene.endMs-scene.startMs<2400||change.after===change.before||
    !['portrait','dialogue','ensemble','wide','rise','pulse','breath'].includes(change.after)||
    draft.before.scenes[sceneIndex]?.intent!==change.before||
    draft.after.scenes[sceneIndex]?.intent!==change.after)return null;
  const middle=(scene.startMs+scene.endMs)/2;
  const position=progressMs===undefined?middle:progressMs;
  if(!finite(position)||position<scene.startMs||position>=scene.endMs)return null;
  const t=Math.round(Math.max(scene.startMs+600,Math.min(scene.endMs-600,position)));
  return {source:'verified-preview',trackId:plan.trackId,sceneIndex,progressMs:t,
    startMs:scene.startMs,endMs:scene.endMs,section:scene.section,
    before:change.before,after:change.after,
    beforePose:offset(change.before),afterPose:offset(change.after)};
}
/** Review never writes to the manual timeline. This explicitly remains outside
 * the live renderer and does not claim its camera pose matches a live override. */
