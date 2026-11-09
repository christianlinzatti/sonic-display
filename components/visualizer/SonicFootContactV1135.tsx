'use client';
import {useMemo,useRef} from 'react';
import {useFrame} from '@react-three/fiber';
import {Vector3,type Object3D,type Group,type Mesh,type ShaderMaterial} from 'three';
import {footContactV1135} from '@/lib/stagePresenceV1135';
const VERTEX='varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}';
const FRAGMENT='varying vec2 vUv;uniform float uOpacity;void main(){float radius=length((vUv-0.5)*2.0);float soft=1.0-smoothstep(0.05,1.0,radius);gl_FragColor=vec4(0.015,0.02,0.035,soft*soft*uOpacity);}';
/** Two cheap analytic contact patches; no shadow map, texture or additional render pass. */
export function SonicFootContactV1135({model,floorY,scale=1,worldFloor}:{model:Object3D;floorY:number;scale?:number;worldFloor?:number}){
 const root=useRef<Group>(null),meshes=useRef<Array<Mesh|null>>([null,null]);
 const floorPoint=useMemo(()=>new Vector3(),[]);
 const feet=useMemo(()=>['LeftFoot','RightFoot'].map(name=>({node:model.getObjectByName(name),point:new Vector3()})),[model]);
 useFrame(()=>{
  const parent=root.current?.parent;if(!parent)return;
  const floor=worldFloor===undefined?floorY:parent.worldToLocal(floorPoint.set(0,worldFloor,0)).y;
  feet.forEach((foot,i)=>{
   const mesh=meshes.current[i];if(!mesh||!foot.node)return;
   foot.node.getWorldPosition(foot.point);parent.worldToLocal(foot.point);
   const contact=footContactV1135(foot.point.y,floor,scale);
   mesh.position.set(foot.point.x,floor+.006,foot.point.z+.055*scale);
   mesh.scale.set(contact.width,contact.width*1.15,1);
   (mesh.material as ShaderMaterial).uniforms.uOpacity.value=contact.opacity;
   mesh.visible=contact.opacity>.002;
   mesh.userData.contactHeight=Math.max(0,foot.point.y-floor-.12*scale);
   mesh.userData.contactOpacity=contact.opacity;
  });
 });
 return <group ref={root} name="sonic-foot-contact-v1135">{feet.map((_,i)=><mesh key={i} name={`sonic-contact-${i}`} ref={mesh=>{meshes.current[i]=mesh;}} rotation={[-Math.PI/2,0,0]} renderOrder={2}>
  <planeGeometry args={[1,1]}/><shaderMaterial vertexShader={VERTEX} fragmentShader={FRAGMENT} uniforms={{uOpacity:{value:.25}}} transparent depthWrite={false} polygonOffset polygonOffsetFactor={-1}/>
 </mesh>)}</group>;
}
