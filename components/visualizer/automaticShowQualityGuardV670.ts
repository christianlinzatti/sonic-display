/** V670 – Automatic Concert Quality Guard.
 * Protects existing automatic V502/V654/V669 gain lanes. No camera pose, actual
 * shot-cut or rendered-pixel inspection is available here; diagnostics describe
 * gain pressure only, never claim to have measured lyric occlusion or strobing.
 * Pure and stateless: no timer, network call, loop, configuration write or actor.
 */
import type {ConcertDynamicsV502,ConcertTierV502} from './smartConcertDynamicsV502';
import type {NarrativePlanV604,NarrativeCueV604} from './fullSongConcertDramaturgyV604';
import type {ConcertFlowCueV654} from './intelligentConcertFlowV654';

export type ShowQualityFlagV670='camera-pressure'|'lighting-pressure'|'repeated-act'|'lyrics-priority';
export interface ShowQualityInputV670 {
  trackId:string;durationMs:number;progressMs:number;playing:boolean;
  enabled:boolean;reducedMotion:boolean;tier:ConcertTierV502;
  lyricsProtected:boolean;manualCamera:boolean;manualLighting:boolean;manualDance:boolean;
  base:ConcertDynamicsV502;
  narrative:{plan:NarrativePlanV604;cue:NarrativeCueV604}|null;
  flow:ConcertFlowCueV654;
}
export interface ShowQualityCueV670 {
  active:boolean;verified:boolean;cameraLimit:number;lightingLimit:number;danceLimit:number;
  repeatedAct:boolean;flags:ShowQualityFlagV670[];reason:string;
}
const limit=(x:number,lo:number,hi:number)=>Number.isFinite(x)?Math.min(hi,Math.max(lo,x)):lo;
const round=(x:number)=>Math.round(x*10000)/10000;
const OFF:ShowQualityCueV670={active:false,verified:false,cameraLimit:1.12,
  lightingLimit:1.12,danceLimit:1.12,repeatedAct:false,flags:[],reason:'Keine automatische Qualitätskorrektur'};
/** Only verified V600/V604 matching acts may be flagged as repeated. */
export function planShowQualityGuardV670(input:ShowQualityInputV670):ShowQualityCueV670 {
  const {base,flow}=input;
  if(!input.enabled||!input.playing||input.reducedMotion||input.tier==='low'||
     !input.trackId||!base.active||!Number.isFinite(input.durationMs)||input.durationMs<=0||
     !Number.isFinite(input.progressMs)||input.progressMs<0||input.progressMs>=input.durationMs)return OFF;
  const plan=input.narrative?.plan,cue=input.narrative?.cue;
  const act=plan?.acts?.[cue?.act??-1];
  const verified=Boolean(plan&&cue&&act&&plan.source==='verified-v600'&&
    cue.active&&cue.source==='verified-v600'&&plan.trackId===input.trackId&&
    plan.durationMs===input.durationMs&&act.index===cue.act&&
    cue.chapter===act.chapter&&cue.motif===act.motif&&
    input.progressMs>=act.startMs&&input.progressMs<act.endMs&&
    Number.isFinite(cue.transition)&&cue.transition>=0&&cue.transition<=1);
  const repeatedAct=verified&&act!.repetition>0;
  // The existing V654 envelope already settles the transitions; do not add cuts.
  // Repetition reduces ONLY excess gain, without selecting a new motif/camera.
  const lyrics=input.lyricsProtected;
  const balanced=input.tier==='balanced';
  const cameraLimit=input.manualCamera?1.12:lyrics?1.012:balanced?1.035:1.055;
  const lightingLimit=input.manualLighting?1.12:lyrics?1.018:balanced?1.045:1.065;
  const danceLimit=input.manualDance?1.12:repeatedAct?1.065:1.095;
  const flags:ShowQualityFlagV670[]=[];
  if(!input.manualCamera&&Number.isFinite(base.camera)&&base.camera>cameraLimit) flags.push('camera-pressure');
  if(!input.manualLighting&&Number.isFinite(base.lighting)&&base.lighting>lightingLimit) flags.push('lighting-pressure');
  if(repeatedAct&&flow.active&&flow.act===act!.index)flags.push('repeated-act');
  if(lyrics)flags.push('lyrics-priority');
  return {active:true,verified,cameraLimit,lightingLimit,danceLimit,repeatedAct,
    flags,reason:flags.length?flags.join(', '):'Automatische Regie innerhalb der Qualitätsgrenzen'};
}
/** Does not change hand-authored camera, lighting or dance lanes. Never edits lyrics. */
export function applyShowQualityGuardV670(base:ConcertDynamicsV502,cue:ShowQualityCueV670,
  manual:{camera:boolean;lighting:boolean;dance:boolean}):ConcertDynamicsV502 {
  if(!cue.active||!base.active)return base;
  const cap=(v:number,hi:number)=>Number.isFinite(v)?(v>hi?round(hi):v):hi;
  const camera=manual.camera?base.camera:cap(base.camera,cue.cameraLimit);
  const lighting=manual.lighting?base.lighting:cap(base.lighting,cue.lightingLimit);
  const dance=manual.dance?base.dance:cap(base.dance,cue.danceLimit);
  if(camera===base.camera&&lighting===base.lighting&&dance===base.dance)return base;
  return {...base,camera,lighting,dance};
}
