/** V760 – Advanced Ensemble Director. Visual/group accents only, never singer identities.
 * Runs inside the existing R3F group callback; no extra render loop, mixer, GLB
 * keyframe, foot IK or X-lane modification. Automatic groups with 3–4 actors only. */
import type {GroupPlanV517,GroupRiskV517} from './advancedGroupPerformanceV517';
import type {FormationPlanV495} from './multiAvatarFormationDirectorV495';
import type {PartnerGestureCue} from './partnerGestureEngine';
import type {LookAtCue} from './partnerLookAtEngine';
export type EnsemblePatternV760='off'|'counterpoint'|'arc'|'unison'|'wings';
export interface EnsembleSettingsV760 {enabled:boolean;strength:number;rotateLead:boolean;phraseBars:4|8|16;transitions:number;travel:boolean;}
export const DEFAULT_ENSEMBLE_V760:EnsembleSettingsV760={enabled:false,strength:65,rotateLead:true,phraseBars:8,transitions:65,travel:true};
export const ENSEMBLE_KEY_V760='sonic-advanced-ensemble-v760';
export const ENSEMBLE_EVENT_V760='sonic:advanced-ensemble-change-v760';
const clamp=(v:number,a:number,b:number)=>Number.isFinite(v)?Math.min(b,Math.max(a,v)):a;
const smooth=(v:number)=>{const x=clamp(v,0,1);return x*x*(3-2*x)};
export function normalizeEnsembleV760(raw:unknown):EnsembleSettingsV760{
 const p=raw&&typeof raw==='object'&&!Array.isArray(raw)?raw as Partial<EnsembleSettingsV760>:{};
 return {enabled:p.enabled===true,strength:clamp(p.strength??65,0,100),rotateLead:p.rotateLead!==false,
   phraseBars:p.phraseBars===4||p.phraseBars===16?p.phraseBars:8,
   transitions:clamp(p.transitions??65,0,100),travel:p.travel!==false};
}
export function readEnsembleV760():EnsembleSettingsV760{
 if(typeof window==='undefined')return {...DEFAULT_ENSEMBLE_V760};
 try{return normalizeEnsembleV760(JSON.parse(window.localStorage.getItem(ENSEMBLE_KEY_V760)||'null'));}
 catch{return {...DEFAULT_ENSEMBLE_V760};}
}
export function writeEnsembleV760(raw:unknown):EnsembleSettingsV760{
 const settings=normalizeEnsembleV760(raw);
 if(typeof window!=='undefined'){
  try{window.localStorage.setItem(ENSEMBLE_KEY_V760,JSON.stringify(settings));}catch{/* private mode */}
  window.dispatchEvent(new Event(ENSEMBLE_EVENT_V760));
 }
 return settings;
}
export type EnsembleSlotV760={slot:number;visualRole:'front'|'wing'|'support';gesture:PartnerGestureCue;look:LookAtCue;turnY:number;depthHintZ:number};
export type EnsemblePlanV760={active:boolean;pattern:EnsemblePatternV760;visualLead:number;phrase:number;slots:EnsembleSlotV760[]};
export interface EnsembleInputV760{
 settings:EnsembleSettingsV760;base:GroupPlanV517;formation:FormationPlanV495|null|undefined;
 count:number;trackId:string|null|undefined;seconds:number;bpm:number|null|undefined;
 positions:readonly (readonly number[])[];playing:boolean;reducedMotion:boolean;manualPriority:boolean;
 tier:'low'|'balanced'|'high';footLocked:boolean;risks?:readonly (GroupRiskV517|undefined)[];
 section:string|null|undefined;beat:number;energy:number;
}
const off=():EnsemblePlanV760=>({active:false,pattern:'off',visualLead:-1,phrase:-1,slots:[]});
/** A stable, repeatable scene choice. The visual role is NOT a singer role. */
export function previewEnsembleV760(input:{seconds:number;bpm:number;count:number;lead:number;section?:string|null;settings:EnsembleSettingsV760}):{pattern:EnsemblePatternV760;visualLead:number;phrase:number;blend:number}{
 const {seconds,bpm,count,lead,settings}=input;
 if(!Number.isFinite(seconds)||seconds<0||!Number.isFinite(bpm)||bpm<40||bpm>240||!Number.isInteger(count)||count<3||count>4||!Number.isInteger(lead)||lead<0||lead>=count)return {pattern:'off',visualLead:-1,phrase:-1,blend:0};
 const beats=4*settings.phraseBars,phraseDuration=beats*60/bpm;
 const phrase=Math.floor(seconds/phraseDuration);
 const progress=seconds/phraseDuration-phrase;
 const transition=Math.min(.45,.08+settings.transitions/100*.37);
 const blend=smooth(progress/transition);
 const section=(input.section??'').toLowerCase();
 const pattern:EnsemblePatternV760=section.includes('hook')||section.includes('chorus')?'unison':
 section.includes('drop')?'wings':section.includes('build')||section.includes('bridge')?'arc':
 phrase%3===0?'counterpoint':phrase%3===1?'arc':'wings';
 return {pattern,phrase,visualLead:settings.rotateLead?(lead+phrase)%count:lead,blend};
}
export function planAdvancedEnsembleV760(i:EnsembleInputV760):EnsemblePlanV760{
 const {base,formation,count,positions}=i;
 if(!i.settings.enabled||i.settings.strength<=0||!base?.active||base.source!=='visual-only'||
 !formation?.active||formation.slots.length!==count||base.slots.length!==count||
 !i.trackId?.trim()||!i.playing||i.reducedMotion||i.manualPriority||i.tier==='low'||
 i.footLocked||!Number.isInteger(count)||count<3||count>4||
 !Number.isInteger(base.lead)||base.lead<0||base.lead>=count||formation.lead!==base.lead||
 !Number.isFinite(i.seconds)||i.seconds<0||!Number.isFinite(i.bpm)||i.bpm!<40||i.bpm!>240||
 !Number.isFinite(i.beat)||i.beat<0||i.beat>1||!Number.isFinite(i.energy)||i.energy<0||i.energy>1||
 positions.length!==count||!positions.every(p=>p.length>=3&&p.slice(0,3).every(Number.isFinite))||
 base.slots.some((s,j)=>s.slot!==j))return off();
 const cue=previewEnsembleV760({seconds:i.seconds,bpm:i.bpm as number,count,lead:base.lead,section:i.section??base.scene,settings:i.settings});
 if(cue.pattern==='off')return off();
 const gain=i.settings.strength/100*(i.tier==='balanced'?.55:1)*(.28+.30*i.beat+.42*i.energy)*cue.blend;
 const slots=base.slots.map((s,index):EnsembleSlotV760=>{
  const risk=i.risks?.[index];
  const riskValid=!risk||[risk.risk,risk.gestureScale,risk.accentScale].every(v=>Number.isFinite(v)&&v>=0&&v<=1);
  const clear=riskValid?clamp(1-(risk?.risk??0)*2.2,0,1)*clamp(risk?.gestureScale??1,0,1)*clamp(risk?.accentScale??1,0,1):0;
  const relative=(index-cue.visualLead+count)%count;
  const front=index===cue.visualLead;
  const group=cue.pattern==='unison';
  // Unified hooks stay aligned; counterpoint/wing accents are offset by slot.
  const phase=group?1:cue.pattern==='wings'?(relative%2===0?.85:.40):
    cue.pattern==='arc'?(front?1:.62):front?1:.35;
  const intensity=gain*clear*phase;
  const alternate=(relative+cue.phrase)%2===0;
  const gesture:PartnerGestureCue={leftLift:intensity*(alternate?.017:.006),rightLift:intensity*(alternate?.006:.017),
   shoulder:intensity*(group?.012:.009),lean:intensity*(front?-.003:.003),intensity:intensity*.035};
  const permitted=!!s.look&&Number.isFinite(s.look.yaw)&&s.look.weight>0&&Number.isFinite(s.look.weight)&&Math.abs(s.look.yaw)>1e-5;
  const yaw=permitted?Math.sign(s.look.yaw)*Math.min(.005,intensity*.005):0;
  const look:LookAtCue={yaw,pitch:0,eyeYaw:yaw*.16,weight:permitted?intensity*.012:0};
  const depth=cue.pattern==='unison'?(front?-.018:.012):cue.pattern==='arc'?(front?-.036:.024):
   cue.pattern==='wings'?(front?-.024:relative%2===0?.022:-.012):(front?-.025:.017);
  return {slot:index,visualRole:front?'front':group?'support':'wing',gesture,look,
   turnY:front?0:clamp(yaw*.35,-.002,.002),
   depthHintZ:i.settings.travel&&riskValid&&(risk?.risk??0)<.12?clamp(depth*intensity,-.036,.024):0};
 });
 return {active:true,pattern:cue.pattern,visualLead:cue.visualLead,phrase:cue.phrase,slots};
}
/** V494 stance and V506/V508 proximity must explicitly authorize each mm. */
export function safeEnsembleDepthV760(plan:EnsemblePlanV760,slot:EnsembleSlotV760|undefined,
 ground:{active:boolean;gain:number;support:string;phase:string;driftCm:number}|undefined,
 risk:GroupRiskV517|undefined):number{
 if(!plan.active||!slot||!ground?.active||!Number.isFinite(ground.gain)||ground.gain<=0||
 !Number.isFinite(ground.driftCm)||ground.driftCm<0||ground.driftCm>3||
 ground.support==='both'||ground.phase==='low'||ground.phase==='lowering'||ground.phase==='rising'||
 (risk&&(!Number.isFinite(risk.risk)||risk.risk>=.12||risk.risk<0||!Number.isFinite(risk.accentScale))))return 0;
 return clamp(slot.depthHintZ*clamp(ground.gain,0,1)*(ground.support==='none'?.26:.16),-.01,.007);
}
