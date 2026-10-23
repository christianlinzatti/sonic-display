import type {FacialProfileV370,FacialChannelV370,FacialTargetV370} from './facialRigStudioV370';

/** Geometry *motion magnitude*, never an anatomical/phonetic correctness score. */
export type FacialMotionMeasureV424 = {id:string;normalizedRms:number|null;sampledVertices:number};
export type FacialCalibrationSuggestionV424 = {channel:FacialChannelV370;gain:number;currentGain:number;relativeMotion:number;targets:number;reason:string};
export type FacialCalibrationPlanV424 = {
  suggestions:FacialCalibrationSuggestionV424[];
  missing:FacialChannelV370[];
  warnings:string[];
};
const clamp=(x:number,min:number,max:number)=>Math.min(max,Math.max(min,x));
const channels:FacialChannelV370[]=['jaw','wide','round','lipsClosed'];
/**
 * Sample displacement of position morphs relative to the mesh's approximate size.
 * Works with both glTF relative morph targets and absolute morph positions.
 * Bounded sampling; does not move the avatar or mutate geometry.
 */
export function measureFacialMotionV424(target:Pick<FacialTargetV370,'id'|'mesh'|'index'>):FacialMotionMeasureV424 {
  const result:FacialMotionMeasureV424={id:target.id,normalizedRms:null,sampledVertices:0};
  const geometry=target.mesh.geometry;
  if(!geometry)return result;
  const base=geometry.getAttribute('position');
  const morph=geometry.morphAttributes.position?.[target.index];
  if(!base||!morph||base.count!==morph.count||base.count<3)return result;
  const count=base.count;
  const step=Math.max(1,Math.ceil(count/1024));
  let minX=Infinity,minY=Infinity,minZ=Infinity,maxX=-Infinity,maxY=-Infinity,maxZ=-Infinity;
  let sum=0,used=0;
  for(let i=0;i<count;i+=step){
    const bx=base.getX(i),by=base.getY(i),bz=base.getZ(i);
    const x=morph.getX(i),y=morph.getY(i),z=morph.getZ(i);
    if(![bx,by,bz,x,y,z].every(Number.isFinite))continue;
    minX=Math.min(minX,bx);minY=Math.min(minY,by);minZ=Math.min(minZ,bz);
    maxX=Math.max(maxX,bx);maxY=Math.max(maxY,by);maxZ=Math.max(maxZ,bz);
    const dx=geometry.morphTargetsRelative?x:x-bx;
    const dy=geometry.morphTargetsRelative?y:y-by;
    const dz=geometry.morphTargetsRelative?z:z-bz;
    sum+=dx*dx+dy*dy+dz*dz;
    used++;
  }
  if(!used)return result;
  const diagonal=Math.hypot(maxX-minX,maxY-minY,maxZ-minZ);
  if(!Number.isFinite(diagonal)||diagonal<1e-7)return result;
  result.sampledVertices=used;
  result.normalizedRms=clamp(Math.sqrt(sum/used)/diagonal,0,1);
  return result;
}
/**
 * Geometry gives only a scale estimate. Never infer a missing morph channel from
 * geometry, nor replace explicit mappings or user gains.
 */
export function planFacialCalibrationV424(
  targets:readonly {id:string;suggestion:FacialChannelV370|null;confidence:string;normalizedRms:number|null}[],
  profile:FacialProfileV370={},
  allowExisting=false,
):FacialCalibrationPlanV424 {
  const suggestions:FacialCalibrationSuggestionV424[]=[];
  const missing:FacialChannelV370[]=[];
  const warnings:string[]=[];
  const ids=new Set(targets.map(t=>t.id));
  for(const channel of channels){
    const mapping=profile.mapping?.[channel];
    if(mapping==='none')continue;
    if(mapping&& !ids.has(mapping)){
      warnings.push(`${channel}: gespeicherte Morph-Zuordnung fehlt; keine automatische Änderung.`);
      continue;
    }
    if(!allowExisting&&profile.gains?.[channel]!==undefined)continue; // preserve user calibration
    const selected=targets.filter(t=>mapping?t.id===mapping:t.suggestion===channel&&t.confidence==='high');
    if(!selected.length){missing.push(channel);continue;}
    const measured=selected.map(t=>t.normalizedRms).filter((v):v is number=>typeof v==='number'&&Number.isFinite(v)&&v>0.00001);
    if(!measured.length){missing.push(channel);continue;}
    // The sum of matching morphs (e.g. left + right) shares one channel gain.
    // Conservative caps prevent over-driven facial targets; no automated extreme settings.
    const relativeMotion=measured.reduce((a,b)=>a+b,0);
    const desired=channel==='lipsClosed'?0.014:channel==='jaw'?0.025:0.018;
    const gain=Math.round(clamp(Math.sqrt(desired/relativeMotion),0.70,1.30)*20)/20;
    suggestions.push({channel,gain,currentGain:profile.gains?.[channel]??1,relativeMotion,targets:measured.length,
      reason:`${measured.length} Morph(s), mittlere Verformung ${(relativeMotion*100).toFixed(2)} % der Mesh-Diagonale; Richtwert, keine anatomische Messung.`});
  }
  if(!targets.some(t=>t.normalizedRms!==null))warnings.push('Keine auswertbaren Positions-Morphs: nur die vorhandene manuelle Kalibrierung verwenden.');
  return {suggestions,missing,warnings};
}
export function applyFacialCalibrationV424(profile:FacialProfileV370,plan:FacialCalibrationPlanV424,selected:readonly FacialChannelV370[],allowExisting=false):FacialProfileV370 {
  const chosen=new Set(selected);
  const gains={...profile.gains};
  for(const suggestion of plan.suggestions){
    if(!chosen.has(suggestion.channel)||(!allowExisting&&gains[suggestion.channel]!==undefined)||profile.mapping?.[suggestion.channel]==='none')continue;
    gains[suggestion.channel]=suggestion.gain;
  }
  return {...profile,gains};
}
