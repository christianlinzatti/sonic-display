import {scoreExperiment,type ExperimentConfig,type PerformanceExperiment} from './performanceExperimentsV266';
export const PROFILE_KEY='sonic:v267:device-performance-profiles';
export type DevicePerformanceProfile=Readonly<{id:string;label:string;fingerprint:string;config:ExperimentConfig;score:number;fps:number;createdAt:number;sourceExperimentId:string}>;
const modes=['auto','high','balanced','low'];
export function validProfile(value:unknown):value is DevicePerformanceProfile{
 if(!value||typeof value!=='object')return false;
 const p=value as Partial<DevicePerformanceProfile>;
 return typeof p.id==='string'&&p.id.length>0&&p.id.length<=100&&typeof p.label==='string'&&p.label.trim().length>0&&p.label.length<=80&&typeof p.fingerprint==='string'&&p.fingerprint.length>0&&p.fingerprint.length<=300&&!!p.config&&modes.includes(p.config.mode)&&typeof p.config.director==='boolean'&&typeof p.score==='number'&&Number.isFinite(p.score)&&typeof p.fps==='number'&&Number.isFinite(p.fps)&&p.fps>0&&typeof p.createdAt==='number'&&Number.isFinite(p.createdAt)&&p.createdAt>0&&typeof p.sourceExperimentId==='string';
}
export function decodeProfiles(json:string|null):DevicePerformanceProfile[]{
 if(!json)return [];
 try{const raw:unknown=JSON.parse(json);return Array.isArray(raw)?raw.filter(validProfile).slice(-30):[];}catch{return []}
}
export function storeProfile(existing:readonly DevicePerformanceProfile[],item:DevicePerformanceProfile):DevicePerformanceProfile[]{return [...existing.filter(p=>p.id!==item.id),item].slice(-30);}
export function profileFromExperiment(e:PerformanceExperiment,fingerprint:string,label:string,createdAt:number):DevicePerformanceProfile|null{
 const score=scoreExperiment(e),fps=e.impact.metrics.fps.after;
 if(!fingerprint||fingerprint.length>300||!label.trim()||score===null||fps===null||!Number.isFinite(createdAt))return null;
 const profile={id:`${e.id}:${createdAt}`,label:label.trim().slice(0,80),fingerprint,config:{...e.after},score,fps,createdAt,sourceExperimentId:e.id};
 return validProfile(profile)?profile:null;
}
export function recommendProfile(profiles:readonly DevicePerformanceProfile[],fingerprint:string):DevicePerformanceProfile|null{
 const matches=profiles.filter(p=>validProfile(p)&&p.fingerprint===fingerprint);
 matches.sort((a,b)=>b.score-a.score||b.createdAt-a.createdAt);
 return matches[0]??null;
}
