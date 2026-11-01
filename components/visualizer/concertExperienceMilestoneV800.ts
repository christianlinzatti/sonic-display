/** V800 — Concert Experience Milestone.
 * Audits the ENTIRE verified V790 storyboard once per plan and applies a tiny,
 * scene-local continuity correction to EXISTING automatic visual gains only.
 * Reuses V791 handoffs, V792 camera, V794 peaks and V795 stage cues as evidence;
 * does not synthesize song sections, shots, lyrics, vocals, clips or beats.
 * No second clock, scene renderer, GPU objects, new network requests or state.
 */
import type {ShowPlanV790,ShowCueV790,ShowSceneV790} from './cinematicShowDirectorV790';
import type {SceneTransitionCueV791} from './seamlessSceneTransitionsV791';
import type {CameraChoreographyCueV792} from './smartCameraChoreographyV792';
import type {EpicPeakCueV794} from './epicPeakMomentsV794';
import type {StageEvolutionCueV795} from './dynamicStageEvolutionV795';
import type {ConcertDynamicsV502,ConcertTierV502} from './smartConcertDynamicsV502';

export type ConcertExperienceIssueV800='unverified'|'timeline-gap'|'repeated-camera-intent'|
  'weak-section-variety'|'no-breath'|'no-secondary-peak'|'under-covered';
export type ConcertExperienceMomentV800='flow'|'focus-hold'|'highlight'|'accent'|'breath';
export type ConcertExperienceSceneV800={index:number;actIndex:number;
  moment:ConcertExperienceMomentV800;repeatRun:number;startMs:number;endMs:number};
export type ConcertExperiencePlanV800={source:'verified-show'|'unavailable';trackId:string;
  durationMs:number;sceneCount:number;actCount:number;coverage:number;
  uncoveredMs:number;maxRepeatedIntent:number;mainPeakScenes:number;
  supportPeakScenes:number;breathScenes:number;intentKinds:number;
  issues:readonly ConcertExperienceIssueV800[];
  scenes:readonly ConcertExperienceSceneV800[]};
export type ConcertExperienceInputV800={trackId:string;durationMs:number;positionMs:number;
  playing:boolean;enabled:boolean;reducedMotion:boolean;tier:ConcertTierV502;
  lyricsProtected:boolean;manualDance:boolean;manualCamera:boolean;manualLighting:boolean;
  show:ShowCueV790;handoff:SceneTransitionCueV791;camera:CameraChoreographyCueV792;
  peak:EpicPeakCueV794;stage:StageEvolutionCueV795;base:ConcertDynamicsV502};
export type ConcertExperienceCueV800={active:boolean;reason:'verified-scene'|'off';
  sceneIndex:number;moment:ConcertExperienceMomentV800|'off';
  coverage:number;repeatRun:number;dynamics:ConcertDynamicsV502};
const finite=(v:unknown):v is number=>typeof v==='number'&&Number.isFinite(v);
const clamp=(v:number,lo:number,hi:number)=>Math.min(hi,Math.max(lo,v));
const smooth=(v:number)=>{const t=clamp(v,0,1);return t*t*(3-2*t);};
const round=(v:number)=>Math.round(v*100000)/100000;
const unavailable=(p:ShowPlanV790):ConcertExperiencePlanV800=>({source:'unavailable',
  trackId:p.trackId,durationMs:p.durationMs,sceneCount:0,actCount:0,coverage:0,
  uncoveredMs:finite(p.durationMs)&&p.durationMs>0?p.durationMs:0,
  maxRepeatedIntent:0,mainPeakScenes:0,supportPeakScenes:0,breathScenes:0,
  intentKinds:0,issues:['unverified'],scenes:[]});

/** Inspect the entire ACTUAL V790 storyboard; no fabricated scenes for gaps.
 * A warning is a diagnostic (not proof of perceived/visual production quality).
 * The peak is validated independently of scene-level accents.
 */
export function auditConcertExperienceV800(plan:ShowPlanV790):ConcertExperiencePlanV800{
  const off=unavailable(plan);
  if(plan.source!=='verified-storyboard'||!plan.trackId||!finite(plan.durationMs)||
    plan.durationMs<=0||!Array.isArray(plan.scenes)||
    plan.scenes.length<3||plan.scenes.length>480||!Number.isInteger(plan.peakAct)||
    plan.peakAct<0)return off;
  const sceneAudit:ConcertExperienceSceneV800[]=[];
  let lastEnd=0,covered=0,gaps=0,maxRun=0,run=0,main=0,support=0,breath=0;
  const kinds=new Set<string>(),acts=new Set<number>();
  let prev:ShowSceneV790|undefined;
  for(let i=0;i<plan.scenes.length;i++){
    const s=plan.scenes[i];
    if(!s||s.index!==i||!Number.isInteger(s.actIndex)||s.actIndex<0||
      !finite(s.startMs)||!finite(s.endMs)||s.startMs<lastEnd||
      s.endMs-s.startMs<1200||s.endMs>plan.durationMs||
      !finite(s.emphasis)||s.emphasis<-.7||s.emphasis>1||
      !['portrait','dialogue','ensemble','wide','rise','pulse','breath'].includes(s.intent)||
      !['establish','focus','anticipate','payoff','breath','resolve'].includes(s.moment)||
      (prev&&s.actIndex<prev.actIndex))return off;
    if(s.startMs>lastEnd)gaps+=s.startMs-lastEnd;
    covered+=s.endMs-s.startMs;
    run=prev&&prev.intent===s.intent?run+1:1;
    maxRun=Math.max(maxRun,run);kinds.add(s.intent);acts.add(s.actIndex);
    if(s.role==='main-peak'&&s.moment==='payoff')main++;
    if(s.role==='support-peak'&&s.moment==='payoff')support++;
    if(s.moment==='breath')breath++;
    const moment:ConcertExperienceMomentV800=s.role==='main-peak'&&s.moment==='payoff'?'highlight':
      s.moment==='breath'?'breath':s.role==='support-peak'&&s.moment==='payoff'?'accent':
      run>=3?'focus-hold':'flow';
    sceneAudit.push({index:i,actIndex:s.actIndex,moment,repeatRun:run,
      startMs:s.startMs,endMs:s.endMs});
    lastEnd=s.endMs;prev=s;
  }
  if(!sceneAudit.some((s,i)=>plan.scenes[i].actIndex===plan.peakAct&&
    plan.scenes[i].role==='main-peak')||main===0)return off;
  const uncoveredMs=plan.durationMs-covered,coverage=round(clamp(covered/plan.durationMs,0,1));
  const issues:ConcertExperienceIssueV800[]=[];
  if(gaps>0)issues.push('timeline-gap');
  if(maxRun>=3)issues.push('repeated-camera-intent');
  if(kinds.size<3)issues.push('weak-section-variety');
  if(breath===0)issues.push('no-breath');
  if(support===0)issues.push('no-secondary-peak');
  if(coverage<.8)issues.push('under-covered');
  return {...off,source:'verified-show',sceneCount:sceneAudit.length,
    actCount:acts.size,coverage,uncoveredMs,maxRepeatedIntent:maxRun,
    mainPeakScenes:main,supportPeakScenes:support,breathScenes:breath,
    intentKinds:kinds.size,issues,scenes:sceneAudit};
}

/** A bounded continuity envelope, never an additional performance command.
 * ALL active peer cues must agree on the same scene, or this compositor is off.
 * Manual preferences and V670 final quality guard are authoritative.
 */
export function sampleConcertExperienceV800(plan:ConcertExperiencePlanV800,
  input:ConcertExperienceInputV800):ConcertExperienceCueV800{
  const off:ConcertExperienceCueV800={active:false,reason:'off',sceneIndex:-1,
    moment:'off',coverage:plan.coverage,repeatRun:0,dynamics:input.base};
  if(plan.source!=='verified-show'||!input.enabled||!input.playing||
    input.reducedMotion||input.tier==='low'||!input.base.active||
    !input.trackId||input.trackId!==plan.trackId||input.durationMs!==plan.durationMs||
    !finite(input.positionMs)||input.positionMs<0||input.positionMs>=plan.durationMs||
    !input.show?.active||input.show.reason!=='verified-show'||
    !Number.isInteger(input.show.sceneIndex)||!finite(input.show.blend)||
    input.show.blend<=0||input.show.blend>1)return off;
  const scene=plan.scenes[input.show.sceneIndex];
  if(!scene||scene.actIndex!==input.show.actIndex||input.positionMs<scene.startMs||
    input.positionMs>=scene.endMs)return off;
  if((input.handoff?.active&&input.handoff.sceneIndex!==scene.index)||
    (input.camera?.active&&input.camera.sceneIndex!==scene.index)||
    (input.peak?.active&&(input.peak.sceneIndex!==scene.index||
      input.peak.trackId!==plan.trackId||input.peak.durationMs!==plan.durationMs))||
    (input.stage?.active&&(input.stage.sceneIndex!==scene.index||
      input.stage.trackId!==plan.trackId||input.stage.durationMs!==plan.durationMs)))return off;
  // Every scene enters/leaves at its original V790 gain. No abrupt changes
  // on seeks or gaps, and no artificial cue at the exact section boundary.
  const edge=Math.min(2100,(scene.endMs-scene.startMs)*.23);
  const envelope=smooth(Math.min(input.positionMs-scene.startMs,
    scene.endMs-input.positionMs)/Math.max(1,edge));
  const weight=envelope*input.show.blend*(input.tier==='balanced'?.55:1)*
    (input.lyricsProtected?.30:1);
  const bias:Record<ConcertExperienceMomentV800,readonly [number,number,number]>={
    flow:[0,0,0],
    'focus-hold':[0,-.025,-.006], // don't overdrive a long repeating shot sequence
    highlight:[.012,.010,.018], // main peak contrasted against support hooks
    accent:[.003,.002,.004],
    breath:[-.008,-.012,-.018], // deliberate quiet space
  };
  const [d,c,l]=bias[scene.moment];
  // Scale the ORIGINAL gain, never clamp an unrelated baseline into [.88,1.12].
  // At scene edges (weight=0) and in neutral moments return it byte-for-byte.
  const apply=(value:number,delta:number,manual:boolean)=>
    manual||delta===0||weight<=0?value:round(value*(1+clamp(delta*weight,-.03,.03)));
  if(![input.base.dance,input.base.camera,input.base.lighting].every(finite))return off;
  const dynamics:ConcertDynamicsV502={...input.base,
    dance:apply(input.base.dance,d,input.manualDance),
    camera:apply(input.base.camera,c,input.manualCamera),
    lighting:apply(input.base.lighting,l,input.manualLighting),
  };
  return {active:true,reason:'verified-scene',sceneIndex:scene.index,
    moment:scene.moment,coverage:plan.coverage,repeatRun:scene.repeatRun,dynamics};
}
