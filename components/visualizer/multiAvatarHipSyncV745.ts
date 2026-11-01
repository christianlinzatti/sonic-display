/** V745 Multi-Avatar Dance Sync: deterministic ensemble timing and role dynamics.
 * Alters V744 procedural hip gains/phase only; GLB actions, bones and IK belong
 * to existing controllers. Every dancer uses the same song clock & phrase plan.
 */
import type {SmartHipOutputV744} from './smartHipChoreographyV744';
import type {HipStudioSettingsV738} from './hipMotionStudioV738';

export type EnsembleHipModeV745='auto'|'sync'|'stagger'|'call-response';
export type EnsembleHipRoleV745='lead'|'background';
export type EnsembleHipSettingsV745={enabled:boolean;mode:EnsembleHipModeV745;
  strength:number;leadSlot:number;delayBeats:1|2|4};
export const DEFAULT_ENSEMBLE_HIP_V745:Readonly<EnsembleHipSettingsV745>={
  enabled:true,mode:'auto',strength:75,leadSlot:0,delayBeats:1};
const finite=(n:unknown):n is number=>typeof n==='number'&&Number.isFinite(n);
const clamp=(n:number,lo:number,hi:number)=>Math.max(lo,Math.min(hi,n));
const smoothstep=(t:number)=>{const x=clamp(t,0,1);return x*x*(3-2*x);};
export function normalizeEnsembleHipV745(raw:Partial<EnsembleHipSettingsV745>|null|undefined):EnsembleHipSettingsV745{
 return {enabled:raw?.enabled===undefined?true:raw.enabled===true,
   mode:raw?.mode==='sync'||raw?.mode==='stagger'||raw?.mode==='call-response'?raw.mode:'auto',
   strength:finite(raw?.strength)?Math.round(clamp(raw.strength,0,100)):75,
   leadSlot:finite(raw?.leadSlot)?Math.round(clamp(raw.leadSlot,0,3)):0,
   delayBeats:raw?.delayBeats===2||raw?.delayBeats===4?raw.delayBeats:1};
}
export type EnsembleHipStateV745={trackId:string|null;lastSeconds:number|null;
  gain:number;delaySeconds:number};
export const createEnsembleHipStateV745=():EnsembleHipStateV745=>({trackId:null,lastSeconds:null,gain:1,delaySeconds:0});
export function resetEnsembleHipV745(s:EnsembleHipStateV745):void{
 s.trackId=null;s.lastSeconds=null;s.gain=1;s.delaySeconds=0;
}
export type EnsembleHipInputV745={settings?:Partial<EnsembleHipSettingsV745>|null;
  plan:SmartHipOutputV744;slot:number;count:number;trackId?:string|null;
  seconds:number;bpm?:number|null;playing:boolean;reducedMotion:boolean;
  manualPriority?:boolean;delta?:number};
export type EnsembleHipOutputV745={active:boolean;role:EnsembleHipRoleV745;
  mode:Exclude<EnsembleHipModeV745,'auto'>|null;hip:SmartHipOutputV744['hip'];
  studio:HipStudioSettingsV738;seconds:number;gain:number;offsetSeconds:number};
/** C1-smoothed handoffs at half-phrase for call/response, full-unison at hooks/drops.
 * A time-offset is applied only to the procedural sample clock. Inactive
 * branches return the V744 input *exactly*, never overriding manual motions.
 */
export function directEnsembleHipV745(s:EnsembleHipStateV745,input:EnsembleHipInputV745):EnsembleHipOutputV745{
 const cfg=normalizeEnsembleHipV745(input.settings);
 const seconds=finite(input.seconds)?input.seconds:0;
 const count=finite(input.count)?Math.round(clamp(input.count,1,4)):1;
 const slot=finite(input.slot)?Math.round(clamp(input.slot,0,count-1)):0;
 const lead=Math.min(cfg.leadSlot,count-1);
 const role:EnsembleHipRoleV745=slot===lead?'lead':'background';
 const base=():EnsembleHipOutputV745=>({active:false,role,mode:null,hip:input.plan.hip,
   studio:input.plan.studio,seconds,gain:1,offsetSeconds:0});
 if(!cfg.enabled||cfg.strength===0||count<2||!input.plan.active||
   input.plan.hip.strength<=0||!input.playing||input.reducedMotion||
   input.manualPriority||!finite(input.seconds)||input.seconds<0){
   resetEnsembleHipV745(s);return base();
 }
 const section=input.plan.section;
 const mode=cfg.mode==='auto'?section==='build'?'stagger':section==='verse'?'call-response':'sync':cfg.mode;
 const track=input.trackId??'';
 if(s.trackId!==null&&(s.trackId!==track||s.lastSeconds!==null&&
   (seconds<s.lastSeconds-.18||seconds-s.lastSeconds>2.5)))resetEnsembleHipV745(s);
 s.trackId=track;s.lastSeconds=seconds;
 const bpm=finite(input.bpm)&&input.bpm>0?clamp(input.bpm,65,190):120;
 const beats=((seconds%86400)*bpm/60);
 const phraseBeats=8; // V744 8/16 phrase can change; the ensemble cue uses eight-beat bars.
 const phrasePos=(beats%phraseBeats);
 const isUnison=section==='hook'||section==='drop';
 // Follow order stays stable even if the configured lead is not slot zero.
 const followerIndex=slot<lead?slot+1:slot;
 let targetDelay=0;
 if(mode==='stagger'&&!isUnison&&role==='background')
   targetDelay=Math.min(6,followerIndex*cfg.delayBeats)*60/bpm;
 let targetGain=role==='lead'?1:.78;
 if(mode==='call-response'&&!isUnison){
   // Two four-beat turns with soft half-beat crossfades.
   const handoff=smoothstep((phrasePos-3.5)/1);
   const returnLead=smoothstep((phrasePos-7.5)/.5);
   const supportTurn=handoff*(1-returnLead);
   targetGain=role==='lead'?1-.48*supportTurn:.47+.50*supportTurn;
 }else if(mode==='stagger'&&!isUnison&&role==='background'){
   // A short entrance after the delayed downbeat (not a re-triggered clip).
   const entrance=smoothstep((beats-targetDelay*bpm/60)/.65);
   targetGain=.36+.53*entrance;
 }
 if(isUnison)targetGain=role==='lead'?1.08:1.02;
 // Preserve exact zero gain when the user explicitly disables a V738 clip.
 const weight=cfg.strength/100;
 targetGain=clamp(1+(targetGain-1)*weight,.25,1.15);
 // Time-based exponential smoothing keeps gain and phase stable at differing FPS.
 const dt=finite(input.delta)?clamp(input.delta,0,.1):1/60;
 const a=1-Math.exp(-dt*7);
 s.gain=clamp(s.gain+(targetGain-s.gain)*a,.25,1.15);
 s.delaySeconds=clamp(s.delaySeconds+(targetDelay-s.delaySeconds)*a,0,6*60/65);
 const studio={...input.plan.studio};
 for(const key of ['swayStrength','circleStrength','bounceStrength'] as const)
   studio[key]=Math.round(clamp(studio[key]*s.gain,0,150));
 return {active:true,role,mode,hip:input.plan.hip,studio,
   seconds:Math.max(0,seconds-s.delaySeconds),gain:s.gain,offsetSeconds:s.delaySeconds};
}
