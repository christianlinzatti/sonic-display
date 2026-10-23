/** V484 – expressive but bounded whole-body cues for automatic multi-avatar low poses.
 * Additive existing PartnerGestureCue only: no new skeleton clips, GPU objects,
 * camera movement, singer inference, beat tracker or external service.
 */
import type {LowPosePlanV481} from './intelligentLowPoseV481';
import type {PartnerGestureCue} from './partnerGestureEngine';

export interface ExpressiveLowInputV484 {
  plan:LowPosePlanV481; count:number;focus:number;
  seconds:number;cueSeconds:number;genre?:string|null;section?:string|null;
  beat:number;kick:number;snare:number;energy:number;
  playing:boolean;reducedMotion:boolean;manualPriority:boolean;
  automaticGroup:boolean;lyricsForeground:boolean;tier:'high'|'balanced'|'low';
}
export interface ExpressiveLowOutputV484 { active:boolean; mode:'rap'|'hard'|'group'|'neutral'; accents:PartnerGestureCue[] }
const clamp=(v:number,lo:number,hi:number)=>Number.isFinite(v)?Math.max(lo,Math.min(hi,v)):lo;
const smooth=(v:number)=>{const x=clamp(v,0,1);return x*x*(3-2*x);};
const neutral=():PartnerGestureCue=>({leftLift:0,rightLift:0,shoulder:0,lean:0,intensity:0});
/** Deterministic at any song position: play/pause/seek does not keep a hidden
 * time-dependent gesture history. Section labels and beats are suggestions, not
 * proof of a lyric punchline or a particular rapper's voice.
 */
export function planExpressiveLowPoseV484(input:ExpressiveLowInputV484):ExpressiveLowOutputV484 {
  const count=input.count;
  const accents=Array.from({length:Number.isInteger(count)?Math.max(0,Math.min(4,count)):0},neutral);
  const off=():ExpressiveLowOutputV484=>({active:false,mode:'neutral',accents});
  if(!input.playing||input.reducedMotion||input.manualPriority||!input.automaticGroup||input.lyricsForeground||
    (count!==3&&count!==4)||input.plan.source!=='automatic-stage'||!input.plan.active||
    input.plan.slots.length!==count||![input.seconds,input.cueSeconds,input.beat,input.kick,input.snare,input.energy].every(Number.isFinite)||
    input.seconds<0||input.cueSeconds<0||input.seconds<input.cueSeconds-.2)return off();
  const rap=/rap|hip.?hop|trap|drill|deutsch/i.test(input.genre??'');
  const hard=/hardstyle|hardtekk|hardcore|gabber|techno/i.test(input.genre??'');
  const hook=/(?:hook|chorus|drop|finale)/i.test(input.section??'');
  const lowered=input.plan.slots.filter(s=>s.depth>.015).length;
  if(lowered===0)return off();
  const quality=input.tier==='low'?.34:input.tier==='balanced'?.7:1;
  const entry=smooth((input.seconds-input.cueSeconds)/.36);
  const beat=clamp(input.beat,0,1),kick=clamp(input.kick,0,1),snare=clamp(input.snare,0,1),energy=clamp(input.energy,0,1);
  const accent=rap?Math.max(beat*.75,snare):hard?Math.max(kick,beat*.8):Math.max(beat*.75,kick*.8);
  const evidence=smooth((accent-.24)/.6)*(.45+.55*energy)*entry*quality;
  const group=lowered===count&&(hook||hard)&&accent>=.48;
  const mode:ExpressiveLowOutputV484['mode']=group?'group':rap?'rap':hard?'hard':'neutral';
  let active=false;
  for(let i=0;i<count;i++){
    const s=input.plan.slots[i];
    const depth=smooth(clamp(s.depth,0,.58)/.5);
    const loweredHere=s.depth>.015;
    const isLead=i===input.focus;
    // While two dancers crouch, a standing lead gets only a subtle nod-like
    // shoulder cue; the main singer's existing manual vocal mix is untouched.
    if(!loweredHere&&!isLead)continue;
    const stage=loweredHere?depth:(lowered>0?.18:0);
    const base=evidence*stage;
    if(base<.0005)continue;
    // Opposing sides counterbalance a crouch; no constant symmetrical pumping.
    // Rap favors one arm per slot, hardcore a compact two-arm drop response.
    const mirror=i%2===0?1:-1;
    const rapL=mirror>0?.104:.036,rapR=mirror>0?.036:.104;
    const hit=(group?.098:hard?.082:rap?.065:.041)*base;
    const response=(s.mode==='kneel'?.56:s.mode==='rap-lean'?.65:1);
    const lowSupport=loweredHere?.024*depth:0;
    const leftLift=clamp((lowSupport+(rap?rapL*base:hit*(mirror>0?1:.72)))*response,0,.17);
    const rightLift=clamp((lowSupport+(rap?rapR*base:hit*(mirror<0?1:.72)))*response,0,.17);
    const shoulder=clamp((hard?.043:rap?.031:.026)*base*response,0,.05);
    const lean=clamp(((group?-.015:rap?-.022:hard?-.018:-.012)*base+(loweredHere?-.008*depth:0))*response,-.032,.008);
    const intensity=clamp((.13+.19*base)*base*response,0,.29);
    Object.assign(accents[i],{leftLift,rightLift,shoulder,lean,intensity});
    active=true;
  }
  return {active,mode,accents};
}
