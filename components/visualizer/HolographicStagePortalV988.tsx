'use client';
import {AdditiveBlending,DoubleSide} from 'three';
import type {HolographicPortalV988} from '@/lib/holographicStagePortalV988';

/** Lightweight virtual portal inside the existing concert canvas.
 * The rings and rails are placed behind the LED wall and performers, outside
 * the lyrics plane; all materials are unlit, transparent and non-shadowing.
 */
export function HolographicStagePortalV988({portal}:{portal:HolographicPortalV988}){
 if(!portal.active)return null;
 return <group name="HolographicStagePortalV988" position={[0,0,0]}>
  {portal.rings.map((ring,index)=><mesh key={`portal-ring-${index}`}
   position={[0,1.55,ring.z]} rotation={[0,0,ring.rotation]}>
   <torusGeometry args={[ring.radius,ring.width,4,48,ring.arc]}/>
   <meshBasicMaterial color={index%2===0?portal.colorA:portal.colorB}
    transparent opacity={ring.opacity} depthWrite={false}
    side={DoubleSide} blending={AdditiveBlending}/>
  </mesh>)}
  {portal.rays.map((ray,index)=><mesh key={`portal-rail-${index}`}
   position={[ray.x,ray.y,-6.15]} rotation={[Math.PI/2,0,0]}>
   <cylinderGeometry args={[.012,.012,ray.length,4]}/>
   <meshBasicMaterial color={index%2===0?portal.colorA:portal.colorB}
    transparent opacity={ray.opacity} depthWrite={false}
    blending={AdditiveBlending}/>
  </mesh>)}
 </group>;
}
