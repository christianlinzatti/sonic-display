import type { StageSection } from "./stageDirectorV287";
import type { CameraPose } from "./stageCameraPoseHelpersV289";

export const SMART_CAMERA_COMPOSER_KEY = "sonic-smart-camera-composer-v298";
export const SMART_CAMERA_COMPOSER_EVENT = "sonic-smart-camera-composer-v298-change";
export type ComposerSettings = { enabled: boolean; intensity: number; energyAware: boolean };
export const DEFAULT_COMPOSER_SETTINGS: ComposerSettings = {enabled:false,intensity:55,energyAware:true};
export function readSmartCameraComposer(): ComposerSettings {
  if(typeof window === "undefined") return {...DEFAULT_COMPOSER_SETTINGS};
  try { const saved=JSON.parse(window.localStorage.getItem(SMART_CAMERA_COMPOSER_KEY)??"null");
    return {enabled:saved?.enabled===true,intensity:Number.isFinite(saved?.intensity)?Math.max(0,Math.min(100,saved.intensity)):55,energyAware:saved?.energyAware!==false};
  } catch {return {...DEFAULT_COMPOSER_SETTINGS};}
}
export function writeSmartCameraComposer(settings: ComposerSettings): void {
  if(typeof window === "undefined") return;
  try {window.localStorage.setItem(SMART_CAMERA_COMPOSER_KEY,JSON.stringify(settings));}catch{/* private mode */}
  window.dispatchEvent(new Event(SMART_CAMERA_COMPOSER_EVENT));
}
const clamp=(value:number,min:number,max:number)=>Math.min(max,Math.max(min,value));
/** A restrained musical layer on top of the existing automatic or authored camera pose.
 * It never overrides keyframe authorship; rather it gently modulates framing and tempo.
 * Tracking is applied AFTER this function, guaranteeing motion safety takes precedence.
 */
export function composeCameraPose(base:CameraPose,section:StageSection,progressMs:number,intensity:number,duo:boolean,settings:ComposerSettings):CameraPose {
  if(!settings.enabled) return base;
  const amount=clamp(settings.intensity,0,100)/100;
  const energy=clamp(Number.isFinite(intensity)?intensity:0,0,100)/100;
  const gain=amount*(settings.energyAware?(.35+.65*energy):.7);
  const t=Math.max(0,Number.isFinite(progressMs)?progressMs:0)/1000;
  const sway=Math.sin(t*(section==="drop"?1.15:.38))*gain;
  const safe={...base};
  const tx=base.targetX??0, tz=base.targetZ??0;
  const vx=base.x-tx,vy=base.y-base.targetY,vz=base.z-tz;
  const length=Math.max(.001,Math.hypot(vx,vy,vz));
  let distanceOffset=0,sideSway=0;
  switch(section){
    case "break": distanceOffset=1.0*gain; safe.fov+=2.5*gain; break;
    case "build": distanceOffset=-.4*gain; safe.y+=.12*gain; break;
    case "hook": sideSway=.35*sway; distanceOffset=-.2*gain; break;
    case "drop": sideSway=.3*sway; distanceOffset=-.65*gain; safe.fov-=2.2*gain; break;
    default: sideSway=.1*sway;
  }
  const scale=clamp((length+distanceOffset)/length,.55,2);
  safe.x=tx+vx*scale+sideSway*(vz/length);
  safe.y=base.targetY+vy*scale+(safe.y-base.y);
  safe.z=tz+vz*scale-sideSway*(vx/length);
  safe.x=clamp(safe.x,-20,20);
  safe.y=clamp(safe.y,-12,12);
  safe.z=clamp(safe.z,-20,20);
  safe.fov=clamp(safe.fov,20,80);
  return safe;
}
