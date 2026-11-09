import {performerDynamicsV1135,jointSpringV1135} from '../../lib/performerDynamicsV1135';
import {Quaternion,Vector3,type Object3D} from 'three';
import type {CrewPlan} from './sonicCrewDirector';
// Float glTF quaternions need normalized orientation comparison, not raw dot products.
const sameRotationV1131=(a:Quaternion,b:Quaternion)=>{const length=a.length()*b.length();return length>0&&1-Math.min(1,Math.abs(a.dot(b))/length)<1e-10;};
const clamp=(v:number,limit:number)=>Math.max(-limit,Math.min(limit,v));
/** Own bounded upper-body accents only, restoring just the values this layer still owns. */
export function prepareCrewReaction(root:Object3D){
 const names=['Head','Chest','LeftArm','RightArm','FaceLedBar0','FaceLedBar1','FaceLedBar2','FaceLedBar3','FaceLedBar4'];
 return names.flatMap(name=>{const node=root.getObjectByName(name);return node?[{node,baseQ:new Quaternion(),appliedQ:new Quaternion(),baseScale:new Vector3(),appliedScale:new Vector3(),owned:false,channels:{x:0,y:0,z:0,led:0},velocity:{x:0,y:0,z:0}}]:[];});
}
export function applyCrewReaction(nodes:ReturnType<typeof prepareCrewReaction>,plan:CrewPlan,beat:number,energy:number,delta=1/60){
 const dt=Number.isFinite(delta)?Math.max(0,Math.min(.1,delta)):0;
 const blend=1-Math.exp(-dt*9),safeBeat=Number.isFinite(beat)?beat:0;
 const e=Number.isFinite(energy)?Math.min(1,Math.max(0,energy)):.35;
 const dynamics=performerDynamicsV1135(plan,safeBeat);
 for(const item of nodes){
  const {node,channels}=item;
  if(item.owned){if(sameRotationV1131(node.quaternion,item.appliedQ))node.quaternion.copy(item.baseQ);if(node.scale.distanceTo(item.appliedScale)<1e-5)node.scale.copy(item.baseScale);}
  item.owned=false;
  if(!plan.active||plan.reaction==='none'){channels.x=channels.y=channels.z=channels.led=0;item.velocity.x=item.velocity.y=item.velocity.z=0;continue;}
  item.baseQ.copy(node.quaternion);item.baseScale.copy(node.scale);
  const p=plan.persona,expression=plan.expressionGain??1;
  const intensity=plan.story?.intensity??1,phase=p?.phase??0;
  const wave=Math.sin((safeBeat+plan.offset)*Math.PI/2+phase),pulse=.5-.5*Math.cos(safeBeat*Math.PI*2);
  let x=0,y=0,z=0,led=0;
  if(node.name==='Head'){
   y=plan.interaction?.yaw??0;
   if(plan.reaction==='nod')x=.025*(.3+e)*Math.sin(safeBeat*Math.PI*2);
   if(plan.reaction==='welcome')y+=.035*Math.sin(safeBeat*Math.PI/4);
   if(plan.reaction==='led')z=.018*Math.sin(safeBeat*Math.PI);
   if(p){x=x*p.head+dynamics.settle*.55-dynamics.prepare*.4;z+=p.flow*.012*Math.sin(safeBeat*Math.PI/4+phase);}
  }else if(node.name==='Chest'){
   y=(plan.interaction?.yaw??0)*.55;
   if(p){z=.022*p.shoulders*wave;x=.012*p.flow*Math.sin(safeBeat*Math.PI/4+phase)+dynamics.breath+dynamics.prepare-dynamics.settle;}
  }else if(node.name==='LeftArm'||node.name==='RightArm'){
   x=(plan.interaction?.armAccent??0)*Math.sin((safeBeat+plan.offset)*Math.PI/2)*(p?.arms??1);
   if(p){z=(node.name==='LeftArm'?-1:1)*.018*p.flow*wave;x+=dynamics.settle*.7-dynamics.prepare*.5;}
  }else if(node.name.startsWith('FaceLedBar')&&plan.reaction==='led')led=.12*e*pulse;
  const gain=p?expression*(.4+.6*intensity):1;
  if(p){
   const sx=jointSpringV1135(channels.x,item.velocity.x,clamp(x*gain,.09),dt,dynamics.frequency);
   const sy=jointSpringV1135(channels.y,item.velocity.y,clamp(y*gain,.14),dt,dynamics.frequency*.85);
   const sz=jointSpringV1135(channels.z,item.velocity.z,clamp(z*gain,.06),dt,dynamics.frequency*.9);
   channels.x=clamp(sx.value,.09);channels.y=clamp(sy.value,.14);channels.z=clamp(sz.value,.06);
   item.velocity.x=sx.velocity;item.velocity.y=sy.velocity;item.velocity.z=sz.velocity;
  }else{
   channels.x+=(clamp(x*gain,.09)-channels.x)*blend;
   channels.y+=(clamp(y*gain,.14)-channels.y)*blend;
   channels.z+=(clamp(z*gain,.06)-channels.z)*blend;
  }
  channels.led+=(led-channels.led)*blend;
  node.rotateX(channels.x);node.rotateY(channels.y);node.rotateZ(channels.z);node.scale.y*=1+channels.led;
  item.appliedQ.copy(node.quaternion);item.appliedScale.copy(node.scale);item.owned=true;
 }
}
