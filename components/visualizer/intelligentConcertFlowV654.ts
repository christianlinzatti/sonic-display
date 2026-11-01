/** V654 – a single evidence-bound flow envelope for existing concert lanes.
 * Pure, deterministic, bounded: no new beat/section detection, timers, renderers,
 * singers, shot positions, choreography clips or photo URLs. Manual lanes win. */
import type {NarrativePlanV604,NarrativeCueV604,NarrativeMotifV604} from './fullSongConcertDramaturgyV604';
import type {ConcertDynamicsV502,ConcertTierV502} from './smartConcertDynamicsV502';
import type {LyricsPhotoDecisionV350} from '../../services/stageContent/lyricsPhotoChoreographyV350';

export type ConcertFlowPhaseV654='settle'|'hold'|'release'|'off';
export type ConcertFlowCueV654={
  active:boolean;act:number;section:string;motif:NarrativeMotifV604|null;
  phase:ConcertFlowPhaseV654;strength:number;cameraRate:number;
  lightMultiplier:number;danceMultiplier:number;photoLimit:number;
  photoMotionMultiplier:number;photoTransitionMs:number;reason:string;
};
export type ConcertFlowInputV654={
  narrative:{plan:NarrativePlanV604;cue:NarrativeCueV604}|null;
  trackId:string;positionMs:number;playing:boolean;enabled:boolean;
  reducedMotion:boolean;tier:ConcertTierV502;lyricsProtected:boolean;
  manualCamera:boolean;manualLighting:boolean;manualDance:boolean;
};
const clamp=(v:number,a:number,b:number)=>Math.max(a,Math.min(b,v));
const smooth=(v:number)=>{const x=clamp(v,0,1);return x*x*(3-2*x);};
const round=(v:number)=>Math.round(v*10000)/10000;
const off:ConcertFlowCueV654={active:false,act:-1,section:'unknown',motif:null,
  phase:'off',strength:0,cameraRate:1,lightMultiplier:1,danceMultiplier:1,
  photoLimit:8,photoMotionMultiplier:1,photoTransitionMs:0,reason:'Originalregie ohne verifizierte Songabschnitte'};

/** Every decision references the SAME V600/V604 act confirmed by live V318.
 * Ramps return to baseline at both boundaries; repeated hooks alternate via
 * the already-validated V604 motif rather than introducing random camera cuts. */
export function planIntelligentConcertFlowV654(input:ConcertFlowInputV654):ConcertFlowCueV654{
  const plan=input.narrative?.plan,cue=input.narrative?.cue;
  if(!input.enabled||!input.playing||input.reducedMotion||input.tier==='low'||
    !plan||plan.source!=='verified-v600'||!cue?.active||cue.source!=='verified-v600'||
    !input.trackId||plan.trackId!==input.trackId||!Number.isFinite(input.positionMs)||
    input.positionMs<0||input.positionMs>=plan.durationMs||!Number.isInteger(cue.act)||
    cue.act<0||cue.act>=plan.acts.length||!Number.isFinite(cue.transition)||
    cue.transition<0||cue.transition>1)return off;
  const act=plan.acts[cue.act];
  if(act.index!==cue.act||cue.chapter!==act.chapter||cue.motif!==act.motif||
    input.positionMs<act.startMs||input.positionMs>=act.endMs||act.endMs<=act.startMs)return off;
  const duration=act.endMs-act.startMs;
  const edge=Math.min(2400,duration*.22);
  const since=input.positionMs-act.startMs,until=act.endMs-input.positionMs;
  const entry=smooth(since/Math.max(1,edge)),exit=smooth(until/Math.max(1,edge));
  // The same envelope is shared by camera, light, dance and photo lanes.
  const strength=round(Math.min(entry,exit)*cue.transition*(input.tier==='balanced'?.72:1));
  const phase:ConcertFlowPhaseV654=since<edge?'settle':until<edge?'release':'hold';
  const energetic=act.section==='hook'||act.section==='drop';
  const breath=act.section==='break'||act.chapter==='respite';
  const group=act.motif==='wide'||act.motif==='ensemble'||act.motif==='crescendo';
  const novelty=act.repetition%2===0?1:.86;
  const protection=input.lyricsProtected?.28:1;
  // Slower settling in verses, more momentum in payoff, no forced shot.
  const cameraEase=breath?.29:energetic?(group?.16:.21):.30;
  const cameraRate=input.manualCamera?1:round(1-cameraEase*strength);
  const lightingBias=breath?-.032:energetic?(group?.037:.028):.006;
  const danceBias=breath?-.019:energetic?.025:.009;
  const lightMultiplier=input.manualLighting?1:round(clamp(1+lightingBias*strength*protection*novelty,.94,1.06));
  const danceMultiplier=input.manualDance?1:round(clamp(1+danceBias*strength*protection*novelty,.96,1.04));
  // Never increase the existing photo count; keep lyrics foreground even on drops.
  const photoLimit=input.lyricsProtected?1:breath?2:energetic?(group?3:2):1;
  const photoMotionMultiplier=round(clamp((breath?.45:energetic?.76:.54)+(1-strength)*.12,0,1));
  const photoTransitionMs=Math.round((breath?1200:energetic?850:1100)*(1-(input.tier==='balanced'?.10:0)));
  return {active:true,act:act.index,section:act.section,motif:act.motif,phase,strength,
    cameraRate,lightMultiplier,danceMultiplier,photoLimit,photoMotionMultiplier,
    photoTransitionMs,reason:`${act.chapter} / ${act.motif} – ${phase}`};
}

/** Operate only on existing automatic V502/V604 multipliers. Lyrics are untouched. */
export function coordinateConcertDynamicsV654(base:ConcertDynamicsV502,
  cue:ConcertFlowCueV654):ConcertDynamicsV502{
  if(!cue.active||!base.active||base.section!==cue.section)return base;
  return {...base,
    dance:round(clamp(base.dance*cue.danceMultiplier,.88,1.12)),
    lighting:round(clamp(base.lighting*cue.lightMultiplier,.88,1.12))};
}

/** Preserve V350 manual overrides and existing photo visibility/opacity caps. */
export function coordinateConcertPhotosV654(base:LyricsPhotoDecisionV350,
  cue:ConcertFlowCueV654|null|undefined,options:{manual:boolean;lyricsActive:boolean}):LyricsPhotoDecisionV350{
  if(!cue?.active||options.manual||!base.active)return base;
  return {...base,visiblePhotos:Math.min(base.visiblePhotos,options.lyricsActive?1:cue.photoLimit),
    photoMotion:Math.min(base.photoMotion,base.photoMotion*cue.photoMotionMultiplier),
    transitionMs:Math.max(base.transitionMs,cue.photoTransitionMs)};
}
