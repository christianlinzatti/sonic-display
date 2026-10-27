declare module 'three' {
 export class Object3D { name:string; traverse(callback:(node:Object3D)=>void):void }
 export class Material { name:string; type:string; transparent:boolean; opacity:number; dispose():void }
 export class MeshStandardMaterial extends Material { roughness:number;metalness:number;metalnessMap?:unknown;emissive?:{getHex():number};clone():MeshStandardMaterial }
}
