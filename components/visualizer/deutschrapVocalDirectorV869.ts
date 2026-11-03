/**
 * V869 – Advanced Deutschrap Lip-Sync 6.0, a strictly rate/expressive overlay.
 *
 * Timed lyrics are NOT isolated vocals or phoneme timestamps. Only the existing
 * V368 morph-target owner may move the mouth. A V632 backing/adlib assignment
 * is an authored performer interval, NOT evidence for an adlib syllable.
 * V869 creates no mouth targets, bones, frame loop, timers or inferred singers.
 */
import type {DeutschrapFaceOptionsV538} from './deutschrapVocalPerformanceV538';
import type {RapArticulationV837} from './advancedDeutschrapLipSyncV837';
import type {VocalDirectorV632} from './multiArtistVocalDirectorV632';

export type DeutschrapModeV869='none'|'rapid-lead'|'flow-lead'|'duet-response'|'authored-adlib';
export type DeutschrapCueV869=Readonly<{
  active:boolean;mode:DeutschrapModeV869;
  /** This describes the authorization, never an audio or phoneme measurement. */
  evidence:'none'|'verified-word'|'authored-adlib-interval';
  onset:number;release:number;expression:number;
  wordStartMs:number;wordEndMs:number;
}>;
const OFF:DeutschrapCueV869=Object.freeze({active:false,mode:'none',evidence:'none',onset:0,release:0,expression:0,wordStartMs:-1,wordEndMs:-1});
const unit=(x:number)=>Number.isFinite(x)?Math.max(0,Math.min(1,x)):0;
const smooth=(x:number)=>{const n=unit(x);return n*n*(3-2*n);};
const vocalTime=(plan:VocalDirectorV632,time:number,trackId:string,slot:number,count:number)=>
  plan.active&&!!trackId&&plan.trackId===trackId&&plan.count===count&&
  Number.isInteger(count)&&count>=2&&count<=4&&Number.isInteger(slot)&&slot>=0&&slot<count&&
  Number.isSafeInteger(plan.startMs)&&Number.isSafeInteger(plan.endMs)&&
  plan.startMs>=0&&plan.endMs>plan.startMs&&time>=plan.startMs&&time<plan.endMs&&
  Number.isInteger(plan.leadSlot)&&plan.leadSlot>=0&&plan.leadSlot<count&&
  plan.singingSlots.includes(plan.leadSlot)&&plan.singingSlots.includes(slot)&&
  plan.role.length===count&&plan.mouthGains.length===count&&
  plan.singingSlots.every(s=>Number.isInteger(s)&&s>=0&&s<count)&&
  new Set(plan.singingSlots).size===plan.singingSlots.length&&
  Number.isFinite(plan.mouthGains[slot])&&plan.mouthGains[slot]>=0&&plan.mouthGains[slot]<=1;

export function planDeutschrapVocalV869(input:DeutschrapFaceOptionsV538,
  context:{tier:'low'|'balanced'|'high';trackId:string;slot:number;count:number;
    confirmedSinger:boolean;protectedSource:boolean;wordCue:RapArticulationV837;
    vocalScene?:VocalDirectorV632|null;},
):DeutschrapCueV869 {
  const t=input.effectiveTimeMs;
  if(context.tier==='low'||context.protectedSource||!context.confirmedSinger||
    !input.playing||!input.enabled||!input.rap||!input.roleAllowed||
    input.manualSilent||input.manualPriority||input.preserveAudioMouth||input.reducedMotion||
    !Number.isFinite(t)||t<0||!Number.isFinite(input.intensity)||input.intensity<=0||
    !Number.isInteger(context.slot)||context.slot<0||!Number.isInteger(context.count)||
    context.count<1||context.count>4||context.slot>=context.count||
    !context.trackId?.trim())return OFF;
  const scene=context.vocalScene;
  if(context.count>1&&(!scene||!vocalTime(scene,t,context.trackId,context.slot,context.count)))return OFF;
  // A deliberately authored backing voice exists only when V632 explicitly
  // reports an adlib and the current slot is BACKING, not lead or listener.
  if(scene&&context.count>1&&scene.scene==='adlib'&&
    scene.role[context.slot]==='backing'&&context.slot!==scene.leadSlot){
    const gate=smooth((t-scene.startMs)/180)*smooth((scene.endMs-t)/210);
    const strength=unit(input.intensity/100)*(context.tier==='balanced'?.55:1)*gate;
    return strength>.000001?{active:true,mode:'authored-adlib',evidence:'authored-adlib-interval',
      onset:0,release:0,expression:strength*.38,wordStartMs:-1,wordEndMs:-1}:OFF;
  }
  // Two explicitly assigned voices are NOT enough to invent word timing for
  // the duet partner. The V837 verified word must be active for this slot.
  if(context.count>1&&scene?.role[context.slot]!=='lead'&&
    scene?.role[context.slot]!=='duet')return OFF;
  const word=context.wordCue;
  if(!input.verifiedWord||!input.lyrics?.synced||!input.activeWord?.trim()||
    !word.active||word.source!=='verified-timed-word'||
    !Number.isFinite(word.wordStartMs)||!Number.isFinite(word.wordEndMs)||
    word.wordEndMs<=word.wordStartMs||t<word.wordStartMs||t>=word.wordEndMs)return OFF;
  if(context.count>1&&scene?.role[context.slot]==='duet'&&scene.scene!=='duet'&&scene.scene!=='hook')return OFF;
  const rapid=word.wordEndMs-word.wordStartMs<=265&&word.connected;
  const mode:DeutschrapModeV869=context.count>1&&scene?.role[context.slot]==='duet'?'duet-response':rapid?'rapid-lead':'flow-lead';
  const gain=unit(input.intensity/100)*(context.tier==='balanced'?.58:1)*(mode==='duet-response'?.62:1);
  return {active:true,mode,evidence:'verified-word',onset:unit(word.onset)*gain,
    release:unit(word.release)*gain,expression:gain*unit(word.onset+word.release)*.32,
    wordStartMs:word.wordStartMs,wordEndMs:word.wordEndMs};
}

/** Multipliers ONLY. All existing morph values and seal targets stay owned by V368. */
export function deutschrapVocalRateV869(cue:DeutschrapCueV869,channel:string,current:number,target:number):number {
  if(!cue.active||!Number.isFinite(current)||!Number.isFinite(target)||
    current<0||current>1||target<0||target>1||Math.abs(target-current)<.000001)return 1;
  if(!['jaw','wide','round','lipsClosed'].includes(channel))return 1;
  if(cue.mode==='authored-adlib'){
    // Backing-adlib time is a scene interval, not a word. Keep existing V632
    // targets and lip closure unchanged; only soften automatic vowel motion.
    return channel==='lipsClosed'?1:.94;
  }
  const attack=target>current;
  if(channel==='lipsClosed')return 1; // B/P/M seals remain V415/V686/V837-owned.
  const movement=1-.5*smooth((Math.abs(target-current)-.30)/.55);
  if(cue.mode==='rapid-lead'){
    return attack?1+.075*cue.onset*movement:1+.035*cue.release*movement;
  }
  if(cue.mode==='duet-response')return attack?1+.028*cue.onset*movement:1;
  return attack?1+.038*cue.onset*movement:1+.018*cue.release*movement;
}

/** Optional, subtle expression on EXISTING brow/cheek/squint channels only.
 * Never modifies mouth targets, eyes, neck/body pose, animations or any manual cue. */
export function deutschrapVocalExpressionV869(cue:DeutschrapCueV869,channel:string,target:number):number {
  if(!cue.active||!Number.isFinite(target)||target<0||target>1)return target;
  const amount=channel==='brow'?.012:channel==='cheek'?.010:channel==='squint'?.006:0;
  return amount?Math.min(1,target+(1-target)*amount*cue.expression):target;
}
