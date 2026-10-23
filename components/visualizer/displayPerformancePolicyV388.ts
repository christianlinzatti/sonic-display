/** V388: opt-in display resolution policy; never changes audio, animation time or saved global graphics settings. */
export type DisplayProfileV388 = "off" | "auto" | "eco" | "sharp";
export type DisplayDeviceV388 = {
  width: number; height: number; pixelRatio: number; cores?: number;
  memoryGb?: number; saveData?: boolean; avatarCount?: number;
};
export type DisplayBudgetV388 = { enabled:boolean; dprCap:number; previewDprCap:number; reason:string; compact:boolean };
const cap=(v:number,lo:number,hi:number)=>Math.max(lo,Math.min(hi,v));
/** Screen size is only a layout hint; it does not prove that a device is ten inches. */
export function resolveDisplayBudgetV388(profile:DisplayProfileV388,kioskEnabled:boolean,device:DisplayDeviceV388):DisplayBudgetV388 {
  const width=Number.isFinite(device.width)?Math.max(0,device.width):0;
  const height=Number.isFinite(device.height)?Math.max(0,device.height):0;
  const compact=(Math.min(width,height)<=800 && Math.max(width,height)<=1500);
  const ratio=cap(Number.isFinite(device.pixelRatio)?device.pixelRatio:1, .5, 3);
  if(!kioskEnabled||profile==="off") return {enabled:false,dprCap:ratio,previewDprCap:1.3,reason:"Standarddarstellung unverändert",compact};
  const constrained=(device.memoryGb!==undefined&&device.memoryGb<=4)||(device.cores!==undefined&&device.cores<=4)||Boolean(device.saveData);
  const crowd=(device.avatarCount??1)>=3;
  const low=constrained||crowd;
  let dprCap=profile==="eco"?.75:profile==="sharp"?1.45:low?.90:compact?1.05:1.2;
  if(profile==="sharp"&&low)dprCap=1.15;
  const baseDprCap=Math.min(ratio,dprCap);
  const pixelBudgetV403=resolveDisplayPixelsV403(profile,device,baseDprCap,true);
  return {enabled:true,dprCap:pixelBudgetV403.dprCap,previewDprCap:profile==="eco"?.75:low?.85:profile==="sharp"?1.15:1,
    reason:pixelBudgetV403.limited?"V403 Pixelbudget: Display-Auflösung und Bühnenlast":profile==="eco"?"Energiesparen":profile==="sharp"?"Scharfe Darstellung mit Hardware-Schutz":low?"Automatisch: mehrere Avatare oder begrenzte Hardware":"Automatisch: ausgewogene Touch-Auflösung",compact};
}
export function limitDisplayDprV388(base:number,budget:DisplayBudgetV388):number {
 return budget.enabled?Math.min(base,budget.dprCap):base;
}

/** V403: canvas pixel budget for opt-in V388 display profiles.
 * This is an upper bound on the CSS viewport budget, not an FPS or GPU benchmark.
 * It never raises DPR, does not alter audio timing, and never runs outside kiosk profiles.
 */
export type DisplayPixelsV403={maxPixels:number;requestedPixels:number;estimatedPixels:number;dprCap:number;limited:boolean};
const finite=(value:number,fallback:number)=>Number.isFinite(value)?value:fallback;
export function resolveDisplayPixelsV403(profile:DisplayProfileV388,device:DisplayDeviceV388,
  proposedDpr:number,kioskEnabled:boolean):DisplayPixelsV403 {
  const width=Math.max(0,finite(device.width,0));
  const height=Math.max(0,finite(device.height,0));
  const pixels=width*height;
  const input=Math.max(.5,Math.min(3,finite(proposedDpr,1)));
  const crowd=Math.max(1,Math.floor(finite(device.avatarCount??1,1)))>=3;
  const weak=(device.memoryGb!==undefined&&device.memoryGb<=4)||
    (device.cores!==undefined&&device.cores<=4)||Boolean(device.saveData);
  // A 4K viewport at DPR 1.0 is >8M pixels. Restrict fill-rate before it
  // becomes a long-run hotspot on a small, thermally constrained display.
  const maxPixels=profile==="eco"?1200000:
    profile==="sharp"?(crowd||weak?2400000:4100000):
    crowd||weak?1900000:3500000;
  if(!kioskEnabled||profile==="off"||pixels<=0){
    return {maxPixels,requestedPixels:pixels*input*input,estimatedPixels:pixels*input*input,dprCap:input,limited:false};
  }
  // WebGL is not useful below DPR 0.5; never upscale a pre-existing quality cap.
  const budgetCap=Math.max(.5,Math.sqrt(maxPixels/pixels));
  const dprCap=Math.max(.5,Math.min(input,budgetCap));
  return {maxPixels,requestedPixels:pixels*input*input,estimatedPixels:pixels*dprCap*dprCap,
    dprCap,limited:dprCap+0.00001<input};
}
