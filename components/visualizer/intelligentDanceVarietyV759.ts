/** V759 – phrase-based, repetition-aware variety of EXISTING additive motion.
 * Never creates clips, changes mixer actions, root/pelvis/feet, lip-sync or IK.
 * Invalid song transport, manual clips and reduced motion bypass immediately.
 */
import type {AvatarRigMotion} from './avatarRigController';

export type DanceVarietySettingsV759={enabled:boolean;strength:number;variety:number;phraseBeats:4|8|16;transition:number};
export const DEFAULT_DANCE_VARIETY_V759:DanceVarietySettingsV759={enabled:true,strength:65,variety:75,phraseBeats:8,transition:65};
const finite=(n:unknown):n is number=>typeof n==='number'&&Number.isFinite(n);
const clamp=(n:number,min:number,max:number)=>Math.max(min,Math.min(max,n));
export function normalizeDanceVarietyV759(v:unknown):DanceVarietySettingsV759{
 const s=v&&typeof v==='object'&&!Array.isArray(v)?v as Partial<DanceVarietySettingsV759>:{};
 const pct=(n:unknown,f:number)=>finite(n)?Math.round(clamp(n,0,100)):f;
 return {enabled:typeof s.enabled==='boolean'?s.enabled:true,strength:pct(s.strength,65),variety:pct(s.variety,75),
  phraseBeats:s.phraseBeats===4||s.phraseBeats===8||s.phraseBeats===16?s.phraseBeats:8,transition:pct(s.transition,65)};
}
export type DanceMotifV759='groove'|'counter'|'shoulders'|'flow'|'punch'|'sway';
export type DanceSectionV759='verse'|'hook'|'drop'|'quiet';
export function classifyDanceSectionV759(value:string|null|undefined):DanceSectionV759{
 const s=(value??'').toLowerCase();
 if(/intro|outro|break|bridge|quiet|pause|interlude/.test(s))return 'quiet';
 if(/drop|climax|peak/.test(s))return 'drop';
 if(/hook|chorus|refrain/.test(s))return 'hook';
 return 'verse';
}
// Only existing expressive channels; not even hipSway (V758 owns planted support).
const CHANNELS=['headNod','shoulderRoll','chestPulse','armSwing','spineSway','followThrough','torsoTwist','counterArm','leftArmAccent','rightArmAccent'] as const;
type Channel=typeof CHANNELS[number];
type Weights=Record<Channel,number>;
const MOTIFS:Record<DanceMotifV759,readonly number[]>={
 groove:[1.09,1.03,1.08,1.03,1.02,1.02,1.00,1.01,1.02,1.02],
 counter:[.97,1.06,1.00,1.04,1.10,1.09,1.13,1.10,.97,1.06],
 shoulders:[.99,1.15,1.04,.98,1.02,1.03,1.02,1.02,1.06,1.00],
 flow:[.95,1.03,.97,1.08,1.10,1.12,1.07,1.03,1.04,1.04],
 punch:[1.12,1.05,1.12,1.07,.96,.95,1.08,1.05,1.10,1.10],
 sway:[.97,.98,.98,1.10,1.13,1.12,.99,1.08,1.05,1.03],
};
const POOLS:Record<DanceSectionV759,readonly DanceMotifV759[]>={
 verse:['groove','counter','shoulders','flow','sway'],hook:['punch','groove','flow','shoulders'],
 drop:['punch','shoulders','counter','groove'],quiet:['flow','sway','counter']};
export type DanceVarietyStateV759={trackId:string;modelId:string;slot:number;lastSeconds:number;phrase:number;section:DanceSectionV759|null;motif:DanceMotifV759|null;recent:DanceMotifV759[];gains:Weights};
const unity=():Weights=>Object.fromEntries(CHANNELS.map(c=>[c,1])) as Weights;
export const createDanceVarietyStateV759=():DanceVarietyStateV759=>({trackId:'',modelId:'',slot:0,lastSeconds:-1,phrase:-1,section:null,motif:null,recent:[],gains:unity()});
const hash=(s:string)=>{let n=2166136261;for(let i=0;i<s.length;i++)n=Math.imul(n^s.charCodeAt(i),16777619)>>>0;return n;};
export type DanceVarietyInputV759={settings?:Partial<DanceVarietySettingsV759>|null;trackId?:string|null;modelId?:string|null;
 seconds:number;delta:number;bpm?:number|null;section?:string|null;genre?:string|null;slot?:number|null;
 playing:boolean;reducedMotion:boolean;manualPriority:boolean;quality?:string;qualityGain?:number|null};
export function stepDanceVarietyV759<T extends AvatarRigMotion>(state:DanceVarietyStateV759,base:T,input:DanceVarietyInputV759):{state:DanceVarietyStateV759;motion:T;active:boolean;motif:DanceMotifV759|null;phrase:number}{
 const bypass=()=>({state:createDanceVarietyStateV759(),motion:base,active:false,motif:null,phrase:-1});
 const p=input,s=normalizeDanceVarietyV759(p.settings);
 if(!s.enabled||!s.strength||!s.variety||!p.playing||p.reducedMotion||p.manualPriority||p.quality==='low'||
  !p.trackId?.trim()||!p.modelId?.trim()||!finite(p.seconds)||p.seconds<0||!finite(p.delta)||p.delta<=0||p.delta>.15||
  !finite(p.bpm)||p.bpm<50||p.bpm>260||!finite(p.slot??0)||!Number.isInteger(p.slot??0)|| (p.slot??0)<0||(p.slot??0)>3||
  !finite(p.qualityGain??1)||(p.qualityGain??1)<=0||(p.qualityGain??1)>1||
  !CHANNELS.every(k=>base[k]===undefined||finite(base[k])))return bypass();
 const slot=p.slot??0,section=classifyDanceSectionV759(p.section);
 const span=s.phraseBeats*60/p.bpm;
 const phrase=Math.floor(p.seconds/span);
 const changed=state.trackId!==p.trackId||state.modelId!==p.modelId||state.slot!==slot||state.lastSeconds<0||
   p.seconds<state.lastSeconds-.08||p.seconds-state.lastSeconds>1.5;
 const st=changed?createDanceVarietyStateV759():state;
 let recent=st.recent,motif=st.motif;
 if(st.phrase!==phrase||st.section!==section||!motif){
  const pool=POOLS[section];
  // Stable per-track/slot candidate order, with short history preventing adjacent repeats.
  const offset=hash(`${p.trackId}|${p.modelId}|${section}|${phrase}|${slot}`)%pool.length;
  const options=pool.filter(k=>!recent.includes(k));
  motif=(options.length?options:pool)[offset%(options.length||pool.length)];
  recent=[...recent.slice(-1),motif];
 }
 const level=clamp(s.strength/100,0,1)*clamp(s.variety/100,0,1)*(p.qualityGain??1)*
   (section==='quiet'?.35:section==='verse'?.78:section==='hook'?.95:1);
 const target=MOTIFS[motif!];
 const speed=.12+(s.transition/100)*1.05;
 const smoothing=1-Math.exp(-p.delta/speed);
 const gains=unity();
 const motion={...base} as T;
 CHANNELS.forEach((key,i)=>{
  const desired=clamp(1+(target[i]-1)*level,.85,1.15);
  const gain=changed?1+(desired-1)*smoothing:clamp(st.gains[key]+(desired-st.gains[key])*smoothing,.85,1.15);
  gains[key]=gain;
  if(base[key]!==undefined)(motion as Record<Channel,number|undefined>)[key]=base[key]!*gain;
 });
 const next:DanceVarietyStateV759={trackId:p.trackId,modelId:p.modelId,slot,lastSeconds:p.seconds,phrase,section,motif:motif!,recent,gains};
 return {state:next,motion,active:true,motif:motif!,phrase};
}
