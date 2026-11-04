/** V893: isolated UI compiler shims only. Not included in production tsconfig. */
declare module 'react' {
 export function useLayoutEffect(effect:()=>void|(()=>void),deps?:readonly unknown[]):void;
}
declare module '@react-three/fiber' {
 export function useFrame(callback:(state:unknown,delta:number)=>void):void;
}
declare module 'three' {
 export interface Color {set(color:string):this;copy(other:Color):this;lerp(other:Color,ratio:number):this;}
 export interface InstancedMesh {computeBoundingSphere():void;}
 export interface MeshBasicMaterial {color:Color;}
}
