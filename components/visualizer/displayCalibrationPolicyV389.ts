/** V389: Pure analysis and persistence format for *measured* WebGL stage samples. */
import type {DisplayProfileV388} from "./displayPerformancePolicyV388";
export type CalibrationProfileV389 = DisplayProfileV388;
export const CALIBRATION_KEY_V389 = "sonic-display:v389:device-calibrations";
export const CALIBRATION_WARMUP_V389 = 2;
export const CALIBRATION_MEASURED_V389 = 10;
export type CalibrationReadingV389 = Readonly<{
 fps:number;p95FrameMs:number;slowPercent:number;drawCalls:number;triangles:number;activeAvatars:number;updatedAt:number;
}>;
export type CalibrationResultV389 = Readonly<{
 id:string;at:number;profile:CalibrationProfileV389;device:string;trackId:string;avatars:1|2|4;
 fps:number;p95FrameMs:number;slowPercent:number;drawCalls:number;count:number;minFps:number;
}>;
export const DISPLAY_PROFILES_V389:readonly CalibrationProfileV389[]=["off","eco","auto","sharp"];
const clamp=(v:number,a:number,b:number)=>Math.min(b,Math.max(a,v));
const avg=(values:readonly number[])=>values.reduce((a,b)=>a+b,0)/Math.max(values.length,1);
const round=(x:number)=>Math.round(x*10)/10;
/** This is a gate, not an FPS simulator. No readings are invented. */
export function validReadingV389(reading:CalibrationReadingV389,expected:1|2|4,after:number,now:number):boolean{
 return reading.updatedAt>after && reading.updatedAt<=now+1000 && now-reading.updatedAt<3000 &&
 reading.activeAvatars===expected && reading.triangles>0 && reading.drawCalls>0 &&
 Number.isFinite(reading.fps)&&reading.fps>0&&reading.fps<=250 &&
 Number.isFinite(reading.p95FrameMs)&&reading.p95FrameMs>0&&reading.p95FrameMs<1000 &&
 Number.isFinite(reading.slowPercent)&&reading.slowPercent>=0&&reading.slowPercent<=100;
}
export function summarizeCalibrationV389(values:readonly CalibrationReadingV389[],input:{id:string;at:number;profile:CalibrationProfileV389;device:string;trackId:string;avatars:1|2|4}):CalibrationResultV389|null{
 if(values.length<CALIBRATION_MEASURED_V389 || !DISPLAY_PROFILES_V389.includes(input.profile) || ![1,2,4].includes(input.avatars))return null;
 const batch=values.slice(0,CALIBRATION_MEASURED_V389);
 if(batch.some(v=>v.activeAvatars!==input.avatars||v.triangles<=0||v.drawCalls<=0||!Number.isFinite(v.fps)||v.fps<=0||!Number.isFinite(v.p95FrameMs)||v.p95FrameMs<=0))return null;
 return {...input, count:batch.length,fps:round(avg(batch.map(v=>v.fps))),p95FrameMs:round(avg(batch.map(v=>v.p95FrameMs))),slowPercent:round(avg(batch.map(v=>v.slowPercent))),drawCalls:Math.round(avg(batch.map(v=>v.drawCalls))),minFps:round(Math.min(...batch.map(v=>v.fps)))};
}
export function deviceSignatureV389(width:number,height:number,pixelRatio:number):string{
 const sane=(n:number)=>Number.isFinite(n)?Math.max(1,Math.min(10000,Math.round(n))):1;
 return `${sane(width)}x${sane(height)}@${Math.round(clamp(Number.isFinite(pixelRatio)?pixelRatio:1,.5,4)*100)/100}`;
}
/** Require apples-to-apples comparisons: same display, number of avatars AND same track. */
export function comparableResultsV389(results:readonly CalibrationResultV389[],device:string,avatars:1|2|4,trackId:string):CalibrationResultV389[]{
 return results.filter(r=>r.device===device&&r.avatars===avatars&&r.trackId===trackId).sort((a,b)=>b.at-a.at);
}
export type CalibrationRecommendationV389 = {profile:CalibrationProfileV389;fps:number;p95FrameMs:number;reason:string;confidence:"measured"|"limited"};
export function recommendDisplayV389(results:readonly CalibrationResultV389[]):CalibrationRecommendationV389|null{
 // Latest per profile only, results already scoped by same device, avatar count and track.
 const latest=new Map<CalibrationProfileV389,CalibrationResultV389>();
 for(const r of [...results].sort((a,b)=>b.at-a.at))if(!latest.has(r.profile)&&r.count>=CALIBRATION_MEASURED_V389&&Number.isFinite(r.fps)&&Number.isFinite(r.p95FrameMs))latest.set(r.profile,r);
 const all=[...latest.values()];if(!all.length)return null;
 const good=all.filter(r=>r.fps>=52&&r.p95FrameMs<=27&&r.slowPercent<=16&&r.minFps>=32);
 const order:CalibrationProfileV389[]=["sharp","off","auto","eco"];
 let chosen:CalibrationResultV389;
 if(good.length){chosen=[...good].sort((a,b)=>order.indexOf(a.profile)-order.indexOf(b.profile))[0];}
 else {
   // Prefer actual measured smoothness, not a guessed GPU class.
   chosen=[...all].sort((a,b)=>{
    const score=(r:CalibrationResultV389)=>r.fps-r.p95FrameMs*.35-r.slowPercent*.15;
    return score(b)-score(a);
   })[0];
 }
 return {profile:chosen.profile,fps:chosen.fps,p95FrameMs:chosen.p95FrameMs,
  reason:good.length?"Erfüllt im gemessenen Abschnitt die Zielwerte von mindestens 52 FPS und höchstens 27 ms P95.":"Kein getestetes Profil erfüllt alle Zielwerte; dies ist das relativ flüssigste gemessene Profil.",
  confidence:latest.size>=2?"measured":"limited"};
}
export function parseCalibrationResultsV389(input:unknown):CalibrationResultV389[]{
 if(!Array.isArray(input))return [];
 return input.slice(-80).filter((r):r is CalibrationResultV389=>{
  if(!r||typeof r!=="object")return false;
  const x=r as Partial<CalibrationResultV389>;
  return typeof x.id==="string"&&x.id.length<=80 && typeof x.device==="string"&&x.device.length<=80 && typeof x.trackId==="string"&&x.trackId.length<=200 &&
   DISPLAY_PROFILES_V389.includes(x.profile as CalibrationProfileV389) && [1,2,4].includes(x.avatars as number) && x.count===CALIBRATION_MEASURED_V389 &&
   Number.isFinite(x.at)&&Number.isFinite(x.fps)&&Number.isFinite(x.minFps)&&Number.isFinite(x.p95FrameMs)&&Number.isFinite(x.slowPercent)&&Number.isFinite(x.drawCalls) &&
   (x.fps as number)>0&&(x.p95FrameMs as number)>0 && (x.slowPercent as number)>=0&&(x.slowPercent as number)<=100;
 });
}
