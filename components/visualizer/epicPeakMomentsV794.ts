/** V794 — Epic Drop & Hook Moments.
 * Evidence-bound, deterministic envelopes on the VERIFIED V790 scene/act clock.
 * This changes existing automatic dance/camera/light gains and the V789 backdrop.
 * No guessed beats, synthetic cuts, strobes, blackout, timers or extra render passes.
 */
import type {ShowPlanV790,ShowCueV790,ShowSceneV790} from './cinematicShowDirectorV790';
import type {ConcertDynamicsV502} from './smartConcertDynamicsV502';

export type EpicPeakPhaseV794='off'|'build'|'suspend'|'impact'|'release';
export type EpicPeakCueV794={
  active:boolean;phase:EpicPeakPhaseV794;sceneIndex:number;actIndex:number;trackId:string;durationMs:number;sceneStartMs:number;sceneEndMs:number;
  intensity:number;architectureGain:number;lightingGain:number;
  dynamics:ConcertDynamicsV502;
};
export type EpicPeakInputV794={
  trackId:string;durationMs:number;positionMs:number;playing:boolean;enabled:boolean;
  reducedMotion:boolean;tier:'low'|'balanced'|'high';strength:number;
  lyricsProtected:boolean;manualDance:boolean;manualCamera:boolean;manualLighting:boolean;
  show:ShowCueV790;base:ConcertDynamicsV502;
};
const finite=(v:unknown):v is number=>typeof v==='number'&&Number.isFinite(v);
const clamp=(x:number,a:number,b:number)=>Math.min(b,Math.max(a,x));
const smooth=(x:number)=>{const t=clamp(x,0,1);return t*t*(3-2*t);};
const round=(x:number)=>Math.round(x*100000)/100000;
const off=(base:ConcertDynamicsV502):EpicPeakCueV794=>({active:false,phase:'off',trackId:'',durationMs:0,sceneStartMs:0,sceneEndMs:0,sceneIndex:-1,
  actIndex:-1,intensity:0,architectureGain:1,lightingGain:1,dynamics:base});
const isPeak=(s:ShowSceneV790)=>s.moment==='payoff'&&
  (s.role==='main-peak'||s.role==='support-peak')&&
  (s.section==='hook'||s.section==='drop');
/** Only a contiguous explicitly-labelled build can lead to a real peak act.
 * A gap, mid-act cut or a repeated verse must never create a pre-drop pause.
 */
function nextPeak(plan:ShowPlanV790,s:ShowSceneV790):ShowSceneV790|null{
  const next=plan.scenes[s.index+1];
  return s.section==='build'&&s.moment==='anticipate'&&next&&isPeak(next)&&
    next.startMs===s.endMs&&next.actIndex===s.actIndex+1?next:null;
}
/** The only main-peak act can receive the full reveal; supporting hooks get
 * intentionally different weights. The envelope has no per-frame memory, so
 * seeks, pauses, song changes and repeated hooks remain fully deterministic.
 */
export function sampleEpicPeakMomentsV794(plan:ShowPlanV790,input:EpicPeakInputV794):EpicPeakCueV794{
  const c=input.show,base=input.base,disabled=off(base);
  if(!input.enabled||!input.playing||input.reducedMotion||input.tier==='low'||
    !c?.active||c.reason!=='verified-show'||plan.source!=='verified-storyboard'||
    !input.trackId||plan.trackId!==input.trackId||plan.durationMs!==input.durationMs||
    !finite(input.durationMs)||input.durationMs<=0||!finite(input.positionMs)||
    input.positionMs<0||input.positionMs>=plan.durationMs||
    !finite(input.strength)||input.strength<=0||!base?.active||
    !Number.isInteger(c.sceneIndex)||c.sceneIndex<0||c.sceneIndex>=plan.scenes.length||
    !finite(c.blend)||c.blend<0||c.blend>1||
    (input.manualDance&&input.manualCamera&&input.manualLighting))return disabled;
  const s=plan.scenes[c.sceneIndex];
  if(!s||s.index!==c.sceneIndex||s.actIndex!==c.actIndex||
    s.moment!==c.moment||s.intent!==c.intent||base.section!==s.section||
    !finite(s.startMs)||!finite(s.endMs)||s.endMs-s.startMs<2400||
    input.positionMs<s.startMs||input.positionMs>=s.endMs)return disabled;
  const first=plan.scenes.find(v=>v.actIndex===s.actIndex);
  if(!first)return disabled;
  const elapsed=input.positionMs-s.startMs;
  let phase:EpicPeakPhaseV794='off',level=0;
  const adjacentPeak=nextPeak(plan,s);
  if(adjacentPeak){
    const remaining=s.endMs-input.positionMs;
    const leadWindow=Math.min(6000,(s.endMs-s.startMs)*.65);
    if(remaining<=leadWindow){
      if(remaining<720){
        // Gentle pre-reveal dim, never a hard blackout; starts/ends continuously.
        phase='suspend';level=Math.sin(Math.PI*clamp((720-remaining)/720,0,1));
      }else{
        phase='build';level=smooth((leadWindow-remaining)/Math.max(1,leadWindow-720));
      }
    }
  } else if(isPeak(s)&&first.index===s.index){
    const peakMain=s.actIndex===plan.peakAct&&s.role==='main-peak';
    const span=Math.min(4300,(s.endMs-s.startMs)*.45);
    if(elapsed<span){
      // No flashing: rise over ~420ms, then ease naturally into a held glow.
      const entry=smooth(elapsed/420);
      const fall=1-smooth((elapsed-1250)/Math.max(1,span-1250));
      level=entry*fall;
      phase=elapsed<1250?'impact':'release';
      level*=peakMain?1:.55;
      // Repeated/supporting sections get quieter, not duplicate main finales.
      if(!peakMain&&s.variation<.9)level*=.84;
    }
  }
  if(phase==='off'||level<=0)return disabled;
  const tier=input.tier==='balanced'?.55:1;
  const lyric=input.lyricsProtected?.34:1;
  const weight=clamp(input.strength,0,100)/100*tier*lyric;
  level=clamp(level*weight*(phase==='suspend'?1:c.blend),0,1);
  if(level<=0)return disabled;
  // Stage architecture is the primary perceptual accent: an existing one-batch
  // fixture layer; protected lyrics and authored light timelines remain untouched.
  const architectureGain=input.manualLighting?1:
    phase==='suspend'?round(1-.24*level):
    phase==='build'?round(1+.055*level):round(1+.16*level);
  const lightingGain=input.manualLighting?1:
    phase==='suspend'?round(1-.105*level):
    phase==='build'?round(1+.026*level):round(1+.085*level);
  const delta=phase==='suspend'?-.085*level:phase==='build'?.035*level:.075*level;
  // V670 quality guard remains FINAL; no alterations to the lyric channel.
  const change=(n:number,k:number,manual:boolean)=>manual?n:round(clamp(n*(1+k*delta),.88,1.12));
  return {active:true,phase,sceneIndex:s.index,actIndex:s.actIndex,
    trackId:input.trackId,durationMs:input.durationMs,
    sceneStartMs:s.startMs,sceneEndMs:s.endMs,
    intensity:round(level),architectureGain,lightingGain,
    dynamics:{...base,
      dance:change(base.dance,.65,input.manualDance),
      camera:change(base.camera,.38,input.manualCamera),
      lighting:change(base.lighting,1,input.manualLighting),
    }};
}
