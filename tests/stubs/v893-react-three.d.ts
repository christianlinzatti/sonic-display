/** V893: isolated UI compiler shims only. Not included in production tsconfig. */
declare module 'react' {
 export function useLayoutEffect(effect:()=>void|(()=>void),deps?:readonly unknown[]):void;
 // Isolated test-only support for the V894 R3F architecture primitives.
 // Production obtains these JSX elements from @react-three/fiber.
 namespace JSX {
  interface IntrinsicElements {
   instancedMesh: any;
   boxGeometry: any;
   meshBasicMaterial: any;
  }
 }
}
declare module '@react-three/fiber' {
 export function useFrame(callback:(state:unknown,delta:number)=>void):void;
}
declare module 'three' {
 export interface Color {set(color:string):this;copy(other:Color):this;lerp(other:Color,ratio:number):this;}
 export interface InstancedMesh {computeBoundingSphere():void;}
 export interface MeshBasicMaterial {color:Color;}
}
