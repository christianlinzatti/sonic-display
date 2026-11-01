/** V835 settings and once-per-measurement status; no rendering or additional timers. */
import {DEFAULT_DISPLAY_STUDIO_V835,DISPLAY_STUDIO_STORAGE_V835,normalizeDisplayStudioV835,
 type DisplayStudioSettingsV835,type DisplayStudioPlanV835} from './displayStudioV835';
let current:DisplayStudioSettingsV835=DEFAULT_DISPLAY_STUDIO_V835;
let status:DisplayStudioPlanV835|null=null;
const settingsListeners=new Set<()=>void>();
const statusListeners=new Set<()=>void>();
export const getDisplayStudioSettingsV835=()=>current;
export const getDisplayStudioServerSettingsV835=()=>DEFAULT_DISPLAY_STUDIO_V835;
export const subscribeDisplayStudioV835=(listener:()=>void)=>{settingsListeners.add(listener);return ()=>{settingsListeners.delete(listener);};};
export const getDisplayStudioStatusV835=()=>status;
export const subscribeDisplayStudioStatusV835=(listener:()=>void)=>{statusListeners.add(listener);return ()=>{statusListeners.delete(listener);};};
export function publishDisplayStudioStatusV835(next:DisplayStudioPlanV835){
 if(status&&status.dpr===next.dpr&&status.level===next.level&&status.estimatedPixels===next.estimatedPixels&&status.reason===next.reason)return;
 status=next;for(const fn of statusListeners)fn();
}
export function setDisplayStudioSettingsV835(next:unknown){
 const normalized=normalizeDisplayStudioV835(next);
 if(normalized.profile===current.profile&&normalized.targetFps===current.targetFps&&normalized.adaptive===current.adaptive)return;
 current=normalized;
 if(typeof window!=='undefined')try{window.localStorage.setItem(DISPLAY_STUDIO_STORAGE_V835,JSON.stringify(current));}catch{/* storage unavailable */}
 for(const fn of settingsListeners)fn();
}
export function loadDisplayStudioSettingsV835(){
 if(typeof window==='undefined')return;
 try{const raw=window.localStorage.getItem(DISPLAY_STUDIO_STORAGE_V835);if(raw)setDisplayStudioSettingsV835(JSON.parse(raw));}catch{/* invalid or blocked storage – preserve defaults */}
}
