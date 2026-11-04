/** V882 compiler-only testing declarations, NEVER included by production tsconfig. */
declare module '@react-three/fiber' {
 export function useFrame(callback:()=>void):void;
}
declare module 'three' {
 export class Color {constructor(color?:string)}
 export const DoubleSide:number;
 export const DynamicDrawUsage:number;
 export class Object3D {
  position:{set(x:number,y:number,z:number):void};
  rotation:{set(x:number,y:number,z:number):void};
  scale:{set(x:number,y:number,z:number):void};
  matrix:object;updateMatrix():void;
 }
 export interface Mesh {visible:boolean;scale:{setScalar(n:number):void}}
 export interface MeshBasicMaterial {opacity:number}
 export interface InstancedMesh {visible:boolean;instanceMatrix:{setUsage(n:number):void;needsUpdate:boolean};
  instanceColor?:{needsUpdate:boolean};setColorAt(i:number,c:Color):void;
  setMatrixAt(i:number,m:object):void;}
}
