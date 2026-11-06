/** V1024 – AI Dance Choreography 4.0.
 * Deterministic musical-phrase choreography on already-calculated additive
 * upper-body channels. The existing music clock supplies BPM/section; this
 * does NOT infer beats, invent dance clips, edit authored rigs, or drive IK.
 * A separate state per avatar prevents cross-avatar or cross-track leakage.
 */

const KEYS = ['headNod','shoulderRoll','chestPulse','armSwing','spineSway',
  'torsoTwist','followThrough','leftArmAccent','rightArmAccent'] as const;
type Key=typeof KEYS[number];
type MotionV1024=Partial<Record<Key,number>>;
export type DanceMotifV1024='groove'|'counter'|'flow'|'shoulders'|'accent'|'release';
export type DanceSectionV1024='verse'|'hook'|'drop'|'build'|'quiet';
export type DanceCharacterV1024='rap'|'hardtekk'|'hardstyle'|'rock'|'other';
export type DanceSettingsV1024={enabled:boolean;strength:number;phraseBeats:8|16;transitionMs:number};
export const DEFAULT_DANCE_V1024:Readonly<DanceSettingsV1024>=Object.freeze({
  enabled:true,strength:55,phraseBeats:16,transitionMs:220,
});
const finite=(n:unknown):n is number=>typeof n==='number'&&Number.isFinite(n);
const clamp=(n:number,a:number,b:number)=>Math.max(a,Math.min(b,n));
export function normalizeDanceV1024(raw:Partial<DanceSettingsV1024>|null|undefined):DanceSettingsV1024{
 return {enabled:typeof raw?.enabled==='boolean'?raw.enabled:true,
  strength:finite(raw?.strength)?Math.round(clamp(raw.strength,0,100)):55,
  phraseBeats:raw?.phraseBeats===8?8:16,
  transitionMs:finite(raw?.transitionMs)?Math.round(clamp(raw.transitionMs,80,650)):220};
}
export function danceCharacterV1024(genre?:string|null):DanceCharacterV1024{
 const g=genre??'';
 if(/hardtekk|tekk|viennatek/i.test(g))return 'hardtekk';
 if(/hardstyle|rawstyle|hardcore/i.test(g))return 'hardstyle';
 if(/deutschrap|hip.?hop|\brap\b|trap|drill/i.test(g))return 'rap';
 if(/deutschrock|ndh|industrial|metal|rock/i.test(g))return 'rock';
 return 'other';
}
export function danceSectionV1024(section?:string|null):DanceSectionV1024|null{
 if(!section)return null;
 if(/drop|climax|peak/i.test(section))return 'drop';
 if(/hook|chorus|refrain/i.test(section))return 'hook';
 if(/build|pre.?chorus|riser/i.test(section))return 'build';
 if(/intro|outro|break|bridge|quiet|pause/i.test(section))return 'quiet';
 if(/verse|strophe/i.test(section))return 'verse';
 return null;
}
const POOL:Record<DanceSectionV1024,readonly DanceMotifV1024[]>={
 verse:['groove','counter','flow','shoulders','release'],
 hook:['accent','groove','shoulders','flow'],
 drop:['accent','shoulders','counter','groove'],
 build:['flow','counter','shoulders','accent'],
 quiet:['release','flow','groove'],
};
// Only pre-existing expressive channels, never hips, feet, root, jaw or lips.
const GAINS:Record<DanceMotifV1024,readonly number[]>={
 groove:   [1.07,1.025,1.02,1.045,1.025,1.02,1.025,1.015,1.015],
 counter:  [.98,1.06,1.015,1.015,1.04,1.075,1.045,1.065,.96],
 flow:     [.98,1.02,.98,1.055,1.075,1.025,1.07,1.03,1.03],
 shoulders:[1.015,1.095,1.035,.98,1.02,1.01,1.04,1.025,1.025],
 accent:   [1.08,1.03,1.09,1.08,.985,1.02,1.035,1.07,1.07],
 release:  [.955,.965,.965,.95,.985,.985,.955,.96,.96],
};
const unit=()=>Object.fromEntries(KEYS.map(k=>[k,1])) as Record<Key,number>;
const hash=(s:string)=>{let n=2166136261;for(const char of s)n=Math.imul(n^char.charCodeAt(0),16777619)>>>0;return n;};
export type DanceStateV1024={trackId:string;modelId:string;lastSeconds:number;lastBpm:number;
 section:DanceSectionV1024|null;phrase:number;motif:DanceMotifV1024|null;
 recent:DanceMotifV1024[];gains:Record<Key,number>};
export function createDanceStateV1024():DanceStateV1024{
 return {trackId:'',modelId:'',lastSeconds:-1,lastBpm:0,section:null,phrase:-1,
  motif:null,recent:[],gains:unit()};
}
export type DanceInputV1024={trackId?:string|null;modelId?:string|null;
 seconds:number;delta:number;bpm?:number|null;section?:string|null;genre?:string|null;
 playing:boolean;reducedMotion:boolean;manualPriority:boolean;quality:'low'|'balanced'|'high';
 footIKEnabled:boolean;contactKnown:boolean;plantedLeft:boolean;plantedRight:boolean;
 slot:number;count:number;qualityGain?:number|null;settings?:Partial<DanceSettingsV1024>|null};
export type DanceResultV1024<T extends MotionV1024>={state:DanceStateV1024;motion:T;
 active:boolean;motif:DanceMotifV1024|null;phrase:number;section:DanceSectionV1024|null;
 contactScale:number;ensembleRole:'solo'|'lead'|'counter'};
/** Soft crossfades and a two-motif history prevent adjacent phrase repetition.
 * Group performers share the same motif/time; only the existing arm gains
 * alternate safely. Contact state can only REDUCE upper-body movement.
 */
export function stepDanceChoreographyV1024<T extends MotionV1024>(state:DanceStateV1024,
 base:T,input:DanceInputV1024):DanceResultV1024<T>{
 const bypass=():DanceResultV1024<T>=>({state:createDanceStateV1024(),motion:base,
  active:false,motif:null,phrase:-1,section:null,contactScale:0,ensembleRole:'solo'});
 const settings=normalizeDanceV1024(input.settings),section=danceSectionV1024(input.section);
 if(!settings.enabled||settings.strength===0||!input.playing||input.reducedMotion||input.manualPriority||
  input.quality==='low'||!input.footIKEnabled||!input.contactKnown||!section||
  !input.trackId?.trim()||input.trackId.length>160||!input.modelId?.trim()||
  !finite(input.seconds)||input.seconds<0||!finite(input.delta)||input.delta<=0||input.delta>.16||
  !finite(input.bpm)||input.bpm<55||input.bpm>260||
  !Number.isInteger(input.count)||input.count<1||input.count>4||
  !Number.isInteger(input.slot)||input.slot<0||input.slot>=input.count||
  !finite(input.qualityGain??1)||(input.qualityGain??1)<0||(input.qualityGain??1)>1||
  KEYS.some(k=>base[k]!==undefined&&!finite(base[k])))return bypass();
 const beatMs=60000/input.bpm,phraseMs=beatMs*settings.phraseBeats;
 const phrase=Math.floor((input.seconds*1000+1e-6)/phraseMs);
 const reset=state.trackId!==input.trackId||state.modelId!==input.modelId||
  state.lastSeconds<0||input.seconds<state.lastSeconds-.12||
  input.seconds-state.lastSeconds>2||Math.abs(state.lastBpm-input.bpm)>6;
 const st=reset?createDanceStateV1024():state;
 let motif=st.motif,recent=st.recent;
 if(st.phrase!==phrase||st.section!==section||!motif){
  const pool=POOL[section],available=pool.filter(m=>!recent.includes(m));
  const candidates=available.length?available:pool;
  motif=candidates[hash(`${input.trackId}|${section}|${phrase}`)%candidates.length];
  recent=[...recent.slice(-1),motif];
 }
 const both=input.plantedLeft&&input.plantedRight;
 const one=input.plantedLeft||input.plantedRight;
 const contactScale=both?.30:one?.65:1;
 const sectionScale=section==='quiet'?.34:section==='verse'?.72:section==='build'?.82:1;
 const character=danceCharacterV1024(input.genre);
 const genreScale=character==='rap'?.78:character==='hardtekk'?.92:character==='hardstyle'?.9:character==='rock'?.83:.66;
 const level=clamp(settings.strength/100*sectionScale*genreScale*contactScale*
  (input.quality==='balanced'?.67:1)*(input.qualityGain??1),0,1);
 const ensembleRole=input.count===1?'solo':input.slot===0?'lead':'counter';
 const alpha=1-Math.exp(-input.delta/(settings.transitionMs/1000));
 const gains=unit(),motion={...base} as T;
 KEYS.forEach((k,index)=>{
  const original=base[k];
  const accent=(k==='leftArmAccent'||k==='rightArmAccent')&&input.count>1&&input.slot>0?
    ((input.slot%2===1)===(k==='rightArmAccent')?.62:.90):1;
  const target=clamp(1+(GAINS[motif!][index]-1)*level*accent,.92,1.10);
  const previous=st.gains[k];
  let gain=clamp(previous+(target-previous)*alpha,.92,1.10);
  // A newly planted support must not retain a stale energetic arm pose.
  if(both)gain=clamp(gain,.97,1.025);
  gains[k]=gain;
  if(original!==undefined)(motion as MotionV1024)[k]=original*gain;
 });
 return {state:{trackId:input.trackId,modelId:input.modelId,lastSeconds:input.seconds,
  lastBpm:input.bpm,section,phrase,motif:motif!,recent,gains},motion,active:true,
  motif:motif!,phrase,section,contactScale,ensembleRole};
}
