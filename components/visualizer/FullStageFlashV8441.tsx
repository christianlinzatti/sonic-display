"use client";
import {useRef} from 'react';
import {useFrame} from '@react-three/fiber';
import {Vector3} from 'three';
import type {Mesh,MeshBasicMaterial} from 'three';
import type {FullStageFlashCueV8441} from './festivalBubblesFlashPlannerV8441';
/** Opt-in, low-opacity camera-aligned plane; it covers ONLY the WebGL stage canvas.
 * Not the surrounding UI, not HTML lyrics, and never enabled for reduced motion.
 */
export function FullStageFlashV8441({cueRef}:{cueRef:{current:FullStageFlashCueV8441}}){
 const mesh=useRef<Mesh>(null),mat=useRef<MeshBasicMaterial>(null);
 const forward=useRef(new Vector3());
 useFrame(({camera,size})=>{
  const cue=cueRef.current,m=mesh.current;
  if(!m)return;
  m.visible=cue.active&&cue.opacity>0;
  if(mat.current)mat.current.opacity=m.visible?Math.min(.16,cue.opacity):0;
  if(!m.visible)return;
  // Near-camera quad, large enough to cover any supported perspective / orthographic view.
  const distance=.45;
  camera.getWorldDirection(forward.current);
  m.position.copy(camera.position).addScaledVector(forward.current,distance);
  m.quaternion.copy(camera.quaternion);
  const perspective=camera as typeof camera & {isPerspectiveCamera?:boolean;fov?:number;zoom?:number};
  const orthographic=camera as typeof camera & {isOrthographicCamera?:boolean;left?:number;right?:number;top?:number;bottom?:number;zoom?:number};
  let h:number;
  if(perspective.isPerspectiveCamera&&Number.isFinite(perspective.fov))
   h=2*distance*Math.tan((perspective.fov??60)*Math.PI/360)/Math.max(.1,perspective.zoom??1);
  else if(orthographic.isOrthographicCamera)
   h=((orthographic.top??1)-(orthographic.bottom??-1))/Math.max(.1,orthographic.zoom??1);
  else h=1.2;
  const w=orthographic.isOrthographicCamera?
   ((orthographic.right??1)-(orthographic.left??-1))/Math.max(.1,orthographic.zoom??1):
   h*Math.max(.1,size.width/Math.max(1,size.height));
  m.scale.set(w*1.05,h*1.05,1);
 });
 return <mesh name="v8441-full-stage-flash" ref={mesh} visible={false} renderOrder={9999} frustumCulled={false}>
  <planeGeometry args={[1,1]}/>
  <meshBasicMaterial ref={mat} color="#fff6e8" transparent opacity={0}
    depthTest={false} depthWrite={false} toneMapped={false}/>
 </mesh>;
}
