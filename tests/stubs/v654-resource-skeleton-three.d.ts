// Minimal isolated contract. Real application types come from installed three/@types/three.
declare module 'three' {
 export interface Object3D { traverse(callback:(object:Object3D)=>void):void; }
 export interface Skeleton {dispose():void;}
 export interface SkinnedMesh extends Object3D {isSkinnedMesh:boolean;skeleton:Skeleton;}
}
