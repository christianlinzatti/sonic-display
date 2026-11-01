/** V698: manually authored, bounded screenshot annotations. Never a certification of GLB or PNG evidence. */
import {V697_SCENARIOS,type V697CapturePreview,type V697Moment} from './concertAcceptanceDashboardV697';
export const V698_STORAGE_KEY='sonic.v698.visual-review.v1';
export const V698_MAX_BYTES=250_000;
export const V698_MAX_ITEMS=80;
export const V698_CATEGORIES=['dance','lip-sync','lyrics','camera','lighting','performance'] as const;
export const V698_SEVERITIES=['hinweis','mittel','hoch'] as const;
export const V698_STAGES=['offen','in-arbeit','manuell-geprueft'] as const;
export type V698Category=typeof V698_CATEGORIES[number];
export type V698Severity=typeof V698_SEVERITIES[number];
export type V698Stage=typeof V698_STAGES[number];
export type V698ShotRef={scenarioId:string;file:string;timeSec:number;trackId:string;mode:string;width:number;height:number;capturedAt:string;act:string;cameraShot:string};
export type V698Annotation={id:string;createdAt:number;release:'V698';before:V698ShotRef;after:V698ShotRef;
 category:V698Category;severity:V698Severity;stage:V698Stage;observation:string;nextStep:string;historyEntryId:string|null;
 evidenceVerified:false;automaticallyApproved:false};
export type V698Archive={format:'sonic-v698-visual-review';schema:1;annotations:V698Annotation[]};
const object=(v:unknown):v is Record<string,unknown>=>!!v&&typeof v==='object'&&!Array.isArray(v);
const keys=(v:Record<string,unknown>,set:string[])=>Object.keys(v).every(k=>set.includes(k));
const string=(v:unknown,max:number):v is string=>typeof v==='string'&&v.length<=max;
const finite=(v:unknown,min:number,max:number):v is number=>typeof v==='number'&&Number.isFinite(v)&&v>=min&&v<=max;
const scenario=(id:unknown)=>V697_SCENARIOS.some(s=>s.id===id);
const validRef=(v:unknown):v is V698ShotRef=>object(v)&&keys(v,['scenarioId','file','timeSec','trackId','mode','width','height','capturedAt','act','cameraShot'])&&
 scenario(v.scenarioId)&&typeof v.file==='string'&&/^live-\d{2}\.png$/.test(v.file)&&finite(v.timeSec,0,86400)&&
 string(v.trackId,200)&&v.trackId.trim().length>=2&&['existing-local-chromium','headed-local-chromium','headless-local-chromium'].includes(String(v.mode))&&
 finite(v.width,640,3840)&&finite(v.height,480,2160)&&string(v.capturedAt,50)&&Number.isFinite(Date.parse(v.capturedAt))&&
 string(v.act,50)&&string(v.cameraShot,50);
export const comparableV698=(a:V698ShotRef,b:V698ShotRef)=>
 a.trackId===b.trackId&&a.mode===b.mode&&a.width===b.width&&a.height===b.height&&
 !(a.scenarioId===b.scenarioId&&a.file===b.file&&a.capturedAt===b.capturedAt);
export function shotRefV698(capture:V697CapturePreview,moment:V697Moment):V698ShotRef|null{
 if(!V697_SCENARIOS.some(s=>s.id===capture.scenarioId&&s.actors===capture.actors)||capture.verified!==false||
  !capture.moments.some(m=>m.file===moment.file&&m.timeSec===moment.timeSec))return null;
 const ref:V698ShotRef={scenarioId:capture.scenarioId,file:moment.file,timeSec:moment.timeSec,trackId:capture.trackId,
 mode:capture.mode,width:capture.width,height:capture.height,capturedAt:capture.date,act:moment.act,cameraShot:moment.shot};
 return validRef(ref)?ref:null;
}
const validAnnotation=(v:unknown):v is V698Annotation=>object(v)&&keys(v,['id','createdAt','release','before','after','category','severity','stage','observation','nextStep','historyEntryId','evidenceVerified','automaticallyApproved'])&&
 string(v.id,80)&&/^\d{13}-\d{1,3}$/.test(v.id)&&finite(v.createdAt,1,Number.MAX_SAFE_INTEGER)&&v.release==='V698'&&
 validRef(v.before)&&validRef(v.after)&&comparableV698(v.before,v.after)&&V698_CATEGORIES.includes(v.category as V698Category)&&
 V698_SEVERITIES.includes(v.severity as V698Severity)&&V698_STAGES.includes(v.stage as V698Stage)&&
 string(v.observation,1000)&&v.observation.trim().length>=12&&string(v.nextStep,1000)&&v.nextStep.trim().length>=12&&
 (v.historyEntryId===null||(string(v.historyEntryId,125)&&/^\d+-\d+-\d+$/.test(v.historyEntryId)))&&
 v.evidenceVerified===false&&v.automaticallyApproved===false;
export const emptyV698Archive=():V698Archive=>({format:'sonic-v698-visual-review',schema:1,annotations:[]});
export function decodeV698Archive(raw:string):V698Archive|null{
 if(typeof raw!=='string'||raw.length>V698_MAX_BYTES)return null;
 try{const v:unknown=JSON.parse(raw);if(!object(v)||!keys(v,['format','schema','annotations'])||v.format!=='sonic-v698-visual-review'||v.schema!==1||
  !Array.isArray(v.annotations)||v.annotations.length>V698_MAX_ITEMS||!v.annotations.every(validAnnotation)||
  new Set(v.annotations.map((a:V698Annotation)=>a.id)).size!==v.annotations.length)return null;
  return {format:'sonic-v698-visual-review',schema:1,annotations:v.annotations};
 }catch{return null;}
}
export function encodeV698Archive(v:V698Archive):string|null{
 const raw=JSON.stringify(v);return decodeV698Archive(raw)?raw:null;
}
export type V698Draft={before:V698ShotRef;after:V698ShotRef;category:V698Category;severity:V698Severity;
 observation:string;nextStep:string;historyEntryId:string|null};
export function addV698Annotation(archive:V698Archive,draft:V698Draft,now:number):V698Archive|null{
 if(!Number.isSafeInteger(now)||now<1||!comparableV698(draft.before,draft.after))return null;
 const candidate:V698Annotation={...draft,id:`${now}-${archive.annotations.length+1}`,createdAt:now,release:'V698',stage:'offen',
 evidenceVerified:false,automaticallyApproved:false};
 if(!validAnnotation(candidate))return null;
 const annotations=[candidate,...archive.annotations].slice(0,V698_MAX_ITEMS);
 const next={...archive,annotations};return encodeV698Archive(next)?next:null;
}
export function updateV698Stage(archive:V698Archive,id:string,stage:V698Stage):V698Archive{
 if(!V698_STAGES.includes(stage))return archive;
 return {...archive,annotations:archive.annotations.map(a=>a.id===id?{...a,stage}:a)};
}
export const deleteV698Annotation=(archive:V698Archive,id:string):V698Archive=>
 ({...archive,annotations:archive.annotations.filter(a=>a.id!==id)});
/** Link only by exact ID + track to a preexisting V694 entry. Does not alter V694 history. */
export const matchesV694Entry=(a:V698Annotation,entry:{id:string;trackId:string})=>
 a.historyEntryId===entry.id&&a.before.trackId===entry.trackId;
