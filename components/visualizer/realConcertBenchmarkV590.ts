/** V590: conservative local-only GLB benchmark protocol. Pure helpers for the browser and CLI. */
export type V590Bounds = {minX:number;maxX:number;minY:number;maxY:number}|null;
export type V590Framing = {status:'within-frame'|'clipped'|'too-small'|'unmeasured'; margin:number|null;areaFraction:number|null;warning:string|null};
export function safeLocalGlbV590(value:string):boolean {
 if(typeof value!=='string'||!value.startsWith('/')||value.startsWith('//')||value.includes('\\')||value.includes('?')||value.includes('#'))return false;
 try {
  const decoded=decodeURIComponent(value);
  if(!decoded.startsWith('/')||decoded.startsWith('//')||decoded.includes('\\')||decoded.split('/').some(p=>p==='..'||p==='.')||!decoded.toLowerCase().endsWith('.glb'))return false;
  return !/[\u0000-\u001f]/.test(decoded);
 }catch{return false;}
}
export function assessFramingV590(bounds:V590Bounds):V590Framing {
 if(!bounds||![bounds.minX,bounds.maxX,bounds.minY,bounds.maxY].every(Number.isFinite)||bounds.maxX<=bounds.minX||bounds.maxY<=bounds.minY)
  return {status:'unmeasured',margin:null,areaFraction:null,warning:'Keine auswertbare projizierte GLB-Geometrie.'};
 const margin=Math.min(bounds.minX+1,1-bounds.maxX,bounds.minY+1,1-bounds.maxY)/2;
 const areaFraction=(bounds.maxX-bounds.minX)*(bounds.maxY-bounds.minY)/4;
 if(margin<.035)return {status:'clipped',margin,areaFraction,warning:'GLB zu nahe am Bildrand oder außerhalb des Bildes; Aufnahme prüfen.'};
 if(areaFraction<.025)return {status:'too-small',margin,areaFraction,warning:'GLB ist im aktuellen Bildausschnitt sehr klein.'};
 return {status:'within-frame',margin,areaFraction,warning:null};
}
export function classifyPixelDiffV590(ratio:number|null):'changed'|'nearly-identical'|'unmeasured'{
 if(ratio===null||!Number.isFinite(ratio)||ratio<0||ratio>1)return 'unmeasured';
 return ratio<.004?'nearly-identical':'changed';
}
export const V590_VISUAL_LIMITATION='Pixeländerungen beweisen weder natürlichen Tanz noch gute Lip-Sync-Qualität. Sichtabnahme bleibt erforderlich.';
