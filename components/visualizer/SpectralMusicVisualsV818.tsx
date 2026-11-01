'use client';
import {useMemo,useRef} from 'react';
import {useFrame} from '@react-three/fiber';
import {Color,Object3D} from 'three';
import type {InstancedMesh,MeshBasicMaterial} from 'three';
import {SPECTRAL_CAPS_V818,spectralPlacementV818} from './spectralMusicPlannerV818';
import type {SpectralMusicCueV818} from './spectralMusicPlannerV818';

/** Three bounded GPU-instanced meshes; never occlude the central performer/lyric lane.
 * The parent supplies authenticated audio/section cues – no fake frequency spectrum.
 */
export function SpectralMusicVisualsV818({cueRef}:{cueRef:{current:SpectralMusicCueV818}}){
 const waves=useRef<InstancedMesh>(null),rings=useRef<InstancedMesh>(null),prisms=useRef<InstancedMesh>(null);
 const waveMat=useRef<MeshBasicMaterial>(null),ringMat=useRef<MeshBasicMaterial>(null),prismMat=useRef<MeshBasicMaterial>(null);
 const obj=useMemo(()=>new Object3D(),[]);
 const primary=useMemo(()=>new Color(),[]),secondary=useMemo(()=>new Color(),[]);
 const cadence=useRef(1);
 useFrame((_,delta)=>{
  const c=cueRef.current;
  if(!waves.current||!rings.current||!prisms.current)return;
  waves.current.count=c.active?Math.min(SPECTRAL_CAPS_V818.waves,Math.max(0,c.waves)):0;
  rings.current.count=c.active?Math.min(SPECTRAL_CAPS_V818.rings,Math.max(0,c.rings)):0;
  prisms.current.count=c.active?Math.min(SPECTRAL_CAPS_V818.prisms,Math.max(0,c.prisms)):0;
  waves.current.visible=waves.current.count>0;
  rings.current.visible=rings.current.count>0;
  prisms.current.visible=prisms.current.count>0;
  if(!c.active){cadence.current=1;return;}
  primary.set(c.primary);secondary.set(c.secondary);
  if(waveMat.current){waveMat.current.opacity=c.waveOpacity;waveMat.current.color.copy(primary);}
  if(ringMat.current){ringMat.current.opacity=c.ringOpacity;ringMat.current.color.copy(secondary);}
  if(prismMat.current){prismMat.current.opacity=c.prismOpacity;prismMat.current.color.copy(primary);}
  cadence.current+=Math.min(.1,Math.max(0,delta));
  if(cadence.current<.05)return; // Max 20 instance-buffer updates/second
  cadence.current=0;
  // Bass waves move along the side-floor, not through the stage center.
  for(let i=0;i<waves.current.count;i++){
   const p=spectralPlacementV818(i);
   const travel=((c.phase*.64+p.offset)%1+1)%1;
   const diameter=.34+travel*(.68+.35*c.bass);
   obj.position.set(p.x,-1.72+.10*Math.sin(c.phase*1.6+p.offset*6.28),-2.6-p.row*.035);
   obj.rotation.set(-Math.PI/2,0,0);
   obj.scale.set(diameter,diameter,.7);
   obj.updateMatrix();waves.current.setMatrixAt(i,obj.matrix);
  }
  if(waves.current.count)waves.current.instanceMatrix.needsUpdate=true;
  // Vertical frequency rings span the back wings; high/mid content modulates radius.
  for(let i=0;i<rings.current.count;i++){
   const p=spectralPlacementV818(i);
   const mod=.5+.5*Math.sin(c.phase*(1.4+c.highs)+p.offset*6.283);
   const radius=.26+mod*(.3+.45*(i%3===0?c.highs:c.mids));
   obj.position.set(p.x,.55+(p.row%5)*.39,-3.0);
   obj.rotation.set(0,0,0);
   obj.scale.set(radius,radius,1);
   obj.updateMatrix();rings.current.setMatrixAt(i,obj.matrix);
  }
  if(rings.current.count)rings.current.instanceMatrix.needsUpdate=true;
  // Geometric audio bars: actual bass/mids/highs drive separate bars.
  for(let i=0;i<prisms.current.count;i++){
   const p=spectralPlacementV818(i);
   const band=i%3===0?c.bass:i%3===1?c.mids:c.highs;
   const variation=.7+.3*Math.sin(c.phase*(.8+band)+p.offset*6.283);
   const height=.16+2.3*band*variation;
   obj.position.set(p.x,-1.65+height*.5,-3.36-(p.row%3)*.12);
   obj.rotation.set(0,0,0);
   obj.scale.set(.09,height,.09);
   obj.updateMatrix();prisms.current.setMatrixAt(i,obj.matrix);
   prisms.current.setColorAt(i,i%3===2?secondary:primary);
  }
  if(prisms.current.count){prisms.current.instanceMatrix.needsUpdate=true;
   if(prisms.current.instanceColor)prisms.current.instanceColor.needsUpdate=true;}
 });
 return <group name="v818-spectral-music-visuals" frustumCulled={false}>
  <instancedMesh ref={waves} args={[undefined,undefined,SPECTRAL_CAPS_V818.waves]} visible={false} frustumCulled={false} castShadow={false} receiveShadow={false}>
   <torusGeometry args={[.7,.026,4,32]}/><meshBasicMaterial ref={waveMat} color="#37f4ff" transparent opacity={0} depthWrite={false} depthTest toneMapped={false}/>
  </instancedMesh>
  <instancedMesh ref={rings} args={[undefined,undefined,SPECTRAL_CAPS_V818.rings]} visible={false} frustumCulled={false} castShadow={false} receiveShadow={false}>
   <torusGeometry args={[.7,.03,4,28]}/><meshBasicMaterial ref={ringMat} color="#ff64dc" transparent opacity={0} depthWrite={false} depthTest toneMapped={false}/>
  </instancedMesh>
  <instancedMesh ref={prisms} args={[undefined,undefined,SPECTRAL_CAPS_V818.prisms]} visible={false} frustumCulled={false} castShadow={false} receiveShadow={false}>
   <boxGeometry args={[1,1,1]}/><meshBasicMaterial ref={prismMat} color="#49c9fc" transparent opacity={0} depthWrite={false} depthTest toneMapped={false}/>
  </instancedMesh>
 </group>;
}
