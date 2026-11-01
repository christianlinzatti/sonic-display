/** V835 – display-performance policy; pure and independent of browser APIs.
 * Optional upper-bound layer for the existing V253/V355/V388/V602 DPR controller.
 * Device hints are NOT hardware verification, and frame pacing is NOT GPU timing.
 */
export type DisplayStudioProfileV835 = 'off' | 'auto' | 'mini-pc' | 'pi-balanced' | 'pi-eco';
export type DisplayStudioTargetV835 = 30 | 45 | 60;
export type DisplayStudioSettingsV835 = {profile:DisplayStudioProfileV835; targetFps:DisplayStudioTargetV835; adaptive:boolean};
export type DisplayStudioDeviceV835 = {width:number;height:number;pixelRatio:number;cores?:number;memoryGb?:number;saveData?:boolean;avatarCount?:number};
export type DisplayStudioLevelV835 = 'normal'|'reduced'|'minimum';
export type DisplayStudioStateV835 = {level:DisplayStudioLevelV835; pressureSeconds:number; healthySeconds:number; cooldownSeconds:number};
export type DisplayStudioWindowV835 = {fps:number;p95Ms:number;elapsed:number;playing:boolean;visible:boolean;transitioning:boolean};
export const DISPLAY_STUDIO_STORAGE_V835='sonic-display:v835:display-studio';
export const DEFAULT_DISPLAY_STUDIO_V835:DisplayStudioSettingsV835={profile:'off',targetFps:60,adaptive:true};
const finite=(x:unknown):x is number=>typeof x==='number'&&Number.isFinite(x);
const clamp=(x:number,lo:number,hi:number)=>Math.max(lo,Math.min(hi,x));
export function normalizeDisplayStudioV835(value:unknown):DisplayStudioSettingsV835 {
 const x=value&&typeof value==='object'?value as Record<string,unknown>:{};
 const profile:DisplayStudioProfileV835 = x.profile==='auto'||x.profile==='mini-pc'||x.profile==='pi-balanced'||x.profile==='pi-eco'?x.profile:'off';
 return {profile,targetFps:x.targetFps===30||x.targetFps===45||x.targetFps===60?x.targetFps:60,
   adaptive:typeof x.adaptive==='boolean'?x.adaptive:true};
}
export const initialDisplayStudioStateV835=():DisplayStudioStateV835=>({level:'normal',pressureSeconds:0,healthySeconds:0,cooldownSeconds:0});
export function stepDisplayStudioV835(prev:DisplayStudioStateV835,input:DisplayStudioWindowV835,settings:DisplayStudioSettingsV835):DisplayStudioStateV835 {
 if(settings.profile==='off'||!settings.adaptive) return initialDisplayStudioStateV835();
 if(!input.playing||!input.visible||input.transitioning||![input.fps,input.p95Ms,input.elapsed].every(finite)||
  input.fps<=0||input.fps>240||input.p95Ms<=0||input.p95Ms>250||input.elapsed<.5||input.elapsed>2.5)return prev;
 const cooldownSeconds=Math.max(0,prev.cooldownSeconds-input.elapsed);
 const pressure=input.fps<settings.targetFps*.82||input.p95Ms>1000/(settings.targetFps*.73);
 const healthy=input.fps>=settings.targetFps*.97&&input.p95Ms<=1000/(settings.targetFps*.85);
 const pressureSeconds=pressure?Math.min(30,prev.pressureSeconds+input.elapsed):0;
 const healthySeconds=healthy?Math.min(30,prev.healthySeconds+input.elapsed):0;
 if(cooldownSeconds===0&&pressureSeconds>=3&&prev.level!=='minimum')return {level:prev.level==='normal'?'reduced':'minimum',pressureSeconds:0,healthySeconds:0,cooldownSeconds:5};
 if(cooldownSeconds===0&&healthySeconds>=14&&prev.level!=='normal')return {level:prev.level==='minimum'?'reduced':'normal',pressureSeconds:0,healthySeconds:0,cooldownSeconds:8};
 return {level:prev.level,pressureSeconds,healthySeconds,cooldownSeconds};
}
export type DisplayStudioPlanV835={dpr:number;maxDpr:number;pixelCap:number;estimatedPixels:number;limited:boolean;compact:boolean;profile:DisplayStudioProfileV835;level:DisplayStudioLevelV835;reason:string};
/** Never increase the DPR requested by another controller; use logical viewport as an estimate.
 * If browser canvas CSS dimensions differ, actual GL drawing-buffer dimensions are definitive.
 */
export function planDisplayStudioV835(requestedDpr:number, settings:DisplayStudioSettingsV835,
 device:DisplayStudioDeviceV835,state:DisplayStudioStateV835):DisplayStudioPlanV835 {
 const width=finite(device.width)&&device.width>0?clamp(device.width,1,16384):0;
 const height=finite(device.height)&&device.height>0?clamp(device.height,1,16384):0;
 const compact=width>0&&height>0&&Math.min(width,height)<=820&&Math.max(width,height)<=1440;
 const input=finite(requestedDpr)?clamp(requestedDpr,.1,3):1;
 const native=finite(device.pixelRatio)&&device.pixelRatio>0?clamp(device.pixelRatio,.5,4):1;
 if(settings.profile==='off')return {dpr:input,maxDpr:input,pixelCap:0,estimatedPixels:width*height*input*input,limited:false,compact,profile:settings.profile,level:'normal',reason:'Deaktiviert – vorhandene DPR-Regelung unverändert'};
 const weak=(finite(device.memoryGb)&&device.memoryGb<=4)||(finite(device.cores)&&device.cores<=4)||device.saveData===true;
 const crowded=finite(device.avatarCount)&&device.avatarCount>=3;
 // Auto never asserts a machine is a Pi, even if the browser reports ARM.
 const profile=settings.profile==='auto'?(weak||crowded?'pi-balanced':'mini-pc'):settings.profile;
 const maxDpr=profile==='pi-eco'?.8:profile==='pi-balanced'?1.0:1.35;
 const pixelCap=profile==='pi-eco'?850000:profile==='pi-balanced'?1550000:3100000;
 const pressureCap=state.level==='minimum'?.70:state.level==='reduced'?.86:1;
 const pixels=width*height;
 const pixelDpr=pixels>0?Math.sqrt(pixelCap/pixels):maxDpr;
 const dpr=Math.max(.1,Math.min(input,native,maxDpr*pressureCap,pixelDpr));
 return {dpr,maxDpr,pixelCap,estimatedPixels:pixels*dpr*dpr,limited:dpr+.0001<input,compact,profile:settings.profile,
  level:state.level,reason:state.level!=='normal'?`V835: ${state.level} – gemessene Framezeit`:
   dpr+.0001<input?`V835: ${profile} – DPR/Pixelbudget`:'V835: vorhandene Qualität beibehalten'};
}
