/** V993 – AI Choreography Director: deterministic, evidence-gated virtual dance accents.
 * Existing GLB clips, manual choreography, V665 grounding, V492 IK, lip-sync and
 * ensemble placement remain authoritative. No LLM request is made during playback.
 * This director only scales already-existing additive upper-body rig channels.
 */
import type {AvatarRigMotion} from './avatarRigController';
import type {DirectorPlanV895} from './aiConcertDirectorV895';
import type {EnergyStateV896} from './musicalEnergyIntelligenceV896';
import {resolveGenreDanceStyleV666,type ResolvedDanceStyleV666} from './genreDancePerformanceV666';

export type ChoreographyStyleV993='auto'|ResolvedDanceStyleV666;
export interface ChoreographySettingsV993 {
 enabled:boolean;style:ChoreographyStyleV993;intensity:number;
 ensembleSync:boolean;smoothTransitions:boolean;energyAccents:boolean;
 protectLyrics:boolean;protectFootwork:boolean;
}
export const CHOREOGRAPHY_KEY_V993='sonic-ai-choreography-director-v993';
export const DEFAULT_CHOREOGRAPHY_V993:Readonly<ChoreographySettingsV993>={
 enabled:false,style:'auto',intensity:55,ensembleSync:true,smoothTransitions:true,
 energyAccents:true,protectLyrics:true,protectFootwork:true,
};
const STYLES:readonly ChoreographyStyleV993[]=['auto','deutschrap','hardtekk','hardstyle','rock','pop'];
const finite=(v:unknown):v is number=>typeof v==='number'&&Number.isFinite(v);
const clamp=(v:number,a:number,b:number)=>Math.max(a,Math.min(b,v));
const fade=(v:number)=>{const t=clamp(v,0,1);return t*t*(3-2*t);};
const CHANNELS=['headNod','shoulderRoll','chestPulse','armSwing','spineSway',
 'leftArmAccent','rightArmAccent','torsoTwist','followThrough'] as const;
type Channel=typeof CHANNELS[number];
type Gains=Partial<Record<Channel,number>>;
/** Per-genre upper-body vocabulary; never leg/foot/jaw/root/pelvis. */
const GAINS:Record<ResolvedDanceStyleV666,Gains>={
 deutschrap:{headNod:1.085,shoulderRoll:1.12,armSwing:1.075,torsoTwist:1.06,leftArmAccent:1.07,rightArmAccent:1.07},
 hardtekk:{headNod:1.045,shoulderRoll:1.08,chestPulse:1.12,armSwing:1.095,followThrough:1.06},
 hardstyle:{headNod:1.07,shoulderRoll:1.07,chestPulse:1.115,armSwing:1.055,followThrough:1.05},
 rock:{headNod:1.115,shoulderRoll:1.09,armSwing:1.085,torsoTwist:1.045},
 pop:{shoulderRoll:1.06,spineSway:1.07,armSwing:1.09,followThrough:1.085,leftArmAccent:1.065,rightArmAccent:1.065},
};
export function normalizeChoreographyV993(raw:unknown):ChoreographySettingsV993 {
 const obj=raw&&typeof raw==='object'&&!Array.isArray(raw)?raw as Partial<ChoreographySettingsV993>:{};
 const flag=(k:keyof ChoreographySettingsV993)=>typeof obj[k]==='boolean'?obj[k] as boolean:DEFAULT_CHOREOGRAPHY_V993[k] as boolean;
 return {enabled:obj.enabled===true,style:STYLES.includes(obj.style as ChoreographyStyleV993)?obj.style as ChoreographyStyleV993:'auto',
  intensity:finite(obj.intensity)?Math.round(clamp(obj.intensity,0,100)):55,
  ensembleSync:flag('ensembleSync'),smoothTransitions:flag('smoothTransitions'),
  energyAccents:flag('energyAccents'),protectLyrics:flag('protectLyrics'),protectFootwork:flag('protectFootwork')};
}
export interface ChoreographyInputV993 {
 settings:ChoreographySettingsV993;plan?:DirectorPlanV895|null;
 trackId:string;durationMs:number;positionMs:number;genre?:string|null;
 playing:boolean;autoEnabled:boolean;directorEnabled:boolean;danceEnabled:boolean;
 tier:'low'|'balanced'|'high';reducedMotion:boolean;manualPriority?:boolean;
 manualFx?:boolean;seekBlocked?:boolean;blackout?:boolean;lyricsVisible?:boolean;
 footContactKnown?:boolean;plantedLeft?:boolean;plantedRight?:boolean;collisionRisk?:boolean;
 slot:number;count:number;energy?:EnergyStateV896|null;
}
export type ChoreographyResultV993<T extends AvatarRigMotion>={
 active:boolean;motion:T;reason:'active'|'disabled'|'protected'|'unverified'|'unknown-genre';
 style:ResolvedDanceStyleV666|null;sceneIndex:number;section:string;
 gain:number;energyUsed:boolean;
};
/** Only apply small, continuous multipliers to existing additive channels.
 * A track-bound V604 scene is necessary. Live audio augments amplitude only
 * when the V896 source and sample clock agree; never infer BPM/drops.
 */
export function sampleChoreographyV993<T extends AvatarRigMotion>(base:T,i:ChoreographyInputV993):ChoreographyResultV993<T> {
 const off=(reason:ChoreographyResultV993<T>['reason']):ChoreographyResultV993<T>=>({active:false,motion:base,reason,style:null,sceneIndex:-1,section:'',gain:0,energyUsed:false});
 const s=normalizeChoreographyV993(i.settings),p=i.plan;
 if(!s.enabled||s.intensity===0)return off('disabled');
 if(!i.playing||!i.autoEnabled||!i.directorEnabled||!i.danceEnabled||i.tier==='low'||i.reducedMotion||
  i.manualPriority||i.manualFx||i.seekBlocked||i.blackout||(s.protectLyrics&&i.lyricsVisible)||
  (s.protectFootwork&&i.collisionRisk)||!Number.isInteger(i.slot)||!Number.isInteger(i.count)||
  i.count<1||i.count>4||i.slot<0||i.slot>=i.count)return off('protected');
 if(!p||p.source!=='verified-v604'||!i.trackId||i.trackId.length>160||p.trackId!==i.trackId||
  !finite(i.durationMs)||i.durationMs<10000||i.durationMs>1800000||p.durationMs!==i.durationMs||
  !finite(i.positionMs)||i.positionMs<0||i.positionMs>=i.durationMs||!Array.isArray(p.scenes))return off('unverified');
 const scene=p.scenes.find(sc=>!!sc&&finite(sc.startMs)&&finite(sc.endMs)&&sc.startMs>=0&&
  sc.endMs<=i.durationMs&&sc.endMs>sc.startMs&&i.positionMs>=sc.startMs&&i.positionMs<sc.endMs);
 if(!scene||!Number.isInteger(scene.index)||typeof scene.section!=='string')return off('unverified');
 const style=s.style==='auto'?resolveGenreDanceStyleV666(i.genre):s.style;
 if(!style)return off('unknown-genre');
 // Avoid changing shapes near scene cuts; no prediction without verified time.
 const envelope=s.smoothTransitions?fade((i.positionMs-scene.startMs)/1600)*fade((scene.endMs-i.positionMs)/1100):1;
 const section=scene.section.toLowerCase();
 const sectionGain=section==='intro'||section==='outro'||section==='break'?.42:
  section==='verse'?.74:section==='build'?.8:section==='hook'?.97:section==='drop'||section==='finale'?1:.68;
 const x=i.energy;
 const energyUsed=!!s.energyAccents&&!!x&&x.source==='live-normalized-audio'&&
  x.trackId===i.trackId&&x.durationMs===i.durationMs&&Number.isInteger(x.samples)&&x.samples>=3&&
  finite(x.positionMs)&&Math.abs(x.positionMs-i.positionMs)<=600&&
  finite(x.smoothed)&&x.smoothed>=0&&x.smoothed<=1&&
  finite(x.pulse)&&x.pulse>=0&&x.pulse<=1;
 const measured=energyUsed?clamp(.87+x!.smoothed*.18+x!.pulse*.13,.87,1.18):1;
 // Synchronous ensemble uses the same cue for every slot, not random timing.
 // Optional alternating arm accents never change the formation or foot placement.
 const ensembleScale=s.ensembleSync||i.count===1?1:i.slot%2===0?.96:.90;
 const gain=clamp(s.intensity/100*envelope*sectionGain*measured*ensembleScale*(i.tier==='balanced'?.75:1),0,1);
 if(gain<=.0001)return off('protected');
 // Never pass malformed rig values to Three.js. No unsupported clip is synthesized.
 if(CHANNELS.some(k=>base[k]!==undefined&&!finite(base[k])))return off('protected');
 const motion={...base} as T;
 const gains=GAINS[style];
 for(const key of CHANNELS){
  const source=base[key],factor=gains[key];
  if(source===undefined||factor===undefined)continue;
  const accent=(!s.ensembleSync&&i.count>1&&(key==='leftArmAccent'||key==='rightArmAccent'))?
   ((i.slot%2===0)===(key==='leftArmAccent')?1:.55):1;
  (motion as AvatarRigMotion)[key]=source*clamp(1+(factor-1)*gain*accent,1,1.13);
 }
 return {active:true,motion,reason:'active',style,sceneIndex:scene.index,section:scene.section,gain,energyUsed};
}
export function previewChoreographyV993(plan:DirectorPlanV895|null|undefined,settings:ChoreographySettingsV993,genre?:string|null){
 if(!plan||plan.source!=='verified-v604'||!plan.trackId||!finite(plan.durationMs)||
  plan.durationMs<10000||plan.durationMs>1800000||!Array.isArray(plan.scenes))return [];
 const s=normalizeChoreographyV993(settings),style=s.style==='auto'?resolveGenreDanceStyleV666(genre):s.style;
 if(!style)return [];
 const labels:Record<ResolvedDanceStyleV666,string>={deutschrap:'Rap-Groove & Schulterakzente',hardtekk:'Tekk-Pulse & Arm-Drive',hardstyle:'Hardstyle-Pulse',rock:'Rock-Headnod & Arme',pop:'Pop-Flow & Armschwung'};
 return plan.scenes.filter(sc=>!!sc&&Number.isInteger(sc.index)&&finite(sc.startMs)&&finite(sc.endMs)&&
  sc.startMs>=0&&sc.endMs>sc.startMs&&sc.endMs<=plan.durationMs).slice(0,12).map(sc=>({
   sceneIndex:sc.index,startMs:sc.startMs,endMs:sc.endMs,section:sc.section,
   label:labels[style],intensity:sc.section==='break'||sc.section==='outro'?'ruhig':
    sc.section==='hook'||sc.section==='drop'||sc.section==='finale'?'hoch':'mittel'}));
}
