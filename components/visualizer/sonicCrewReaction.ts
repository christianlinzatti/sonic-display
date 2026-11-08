import {Quaternion,Vector3,type Object3D} from 'three';
import type {CrewPlan} from './sonicCrewDirector';
/** Own only tiny upper-body/LED accents. Restore our previous values only when the mixer has not replaced them. */
export function prepareCrewReaction(root:Object3D){
 const names=['Head','FaceLedBar0','FaceLedBar1','FaceLedBar2','FaceLedBar3','FaceLedBar4'];
 return names.flatMap(name=>{const node=root.getObjectByName(name);return node?[{node,baseQ:new Quaternion(),appliedQ:new Quaternion(),baseScale:new Vector3(),appliedScale:new Vector3(),owned:false}]:[];});
}
export function applyCrewReaction(nodes:ReturnType<typeof prepareCrewReaction>,plan:CrewPlan,beat:number,energy:number){
 for(const item of nodes){
  const {node}=item;
  if(item.owned){if(node.quaternion.angleTo(item.appliedQ)<1e-5)node.quaternion.copy(item.baseQ);if(node.scale.distanceTo(item.appliedScale)<1e-5)node.scale.copy(item.baseScale);}
  item.owned=false;
  if(!plan.active||plan.reaction==='none')continue;
  item.baseQ.copy(node.quaternion);item.baseScale.copy(node.scale);
  const e=Number.isFinite(energy)?Math.min(1,Math.max(0,energy)):.35;
  const pulse=.5-.5*Math.cos(beat*Math.PI*2);
  if(node.name==='Head'){
   if(plan.reaction==='nod')node.rotateX(.025*(.3+e)*Math.sin(beat*Math.PI*2));
   if(plan.reaction==='welcome')node.rotateY(.035*Math.sin(beat*Math.PI/4));
   if(plan.reaction==='led')node.rotateZ(.018*Math.sin(beat*Math.PI));
  }else if(plan.reaction==='led')node.scale.y*=1+.12*e*pulse;
  item.appliedQ.copy(node.quaternion);item.appliedScale.copy(node.scale);item.owned=true;
 }
}
