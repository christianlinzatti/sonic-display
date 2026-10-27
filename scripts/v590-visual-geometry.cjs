'use strict';
/** Node equivalent of browser V590 clip bounds, checked by cross-runtime unit tests. */
function assessFraming(bounds){
 if(!bounds||![bounds.minX,bounds.maxX,bounds.minY,bounds.maxY].every(Number.isFinite)||bounds.maxX<=bounds.minX||bounds.maxY<=bounds.minY)
  return {status:'unmeasured',margin:null,areaFraction:null,warning:'Keine auswertbare projizierte GLB-Geometrie.'};
 const margin=Math.min(bounds.minX+1,1-bounds.maxX,bounds.minY+1,1-bounds.maxY)/2;
 const areaFraction=(bounds.maxX-bounds.minX)*(bounds.maxY-bounds.minY)/4;
 if(margin<.035)return {status:'clipped',margin,areaFraction,warning:'GLB zu nahe am Bildrand oder außerhalb des Bildes; Aufnahme prüfen.'};
 if(areaFraction<.025)return {status:'too-small',margin,areaFraction,warning:'GLB ist im aktuellen Bildausschnitt sehr klein.'};
 return {status:'within-frame',margin,areaFraction,warning:null};
}
module.exports={assessFraming};
