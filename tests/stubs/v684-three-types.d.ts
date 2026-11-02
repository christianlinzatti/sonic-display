/** Narrow Three.js types for V684/V685 isolated checks; never included in production. */
declare module 'three' {
 export class Vector3 { x:number; y:number; z:number; constructor(x?:number,y?:number,z?:number); distanceTo(other:Vector3):number; }
 export class Object3D { name:string; rotation:{x:number;y:number;z:number}; position:{x:number;y:number;z:number}; traverse(cb:(node:Object3D)=>void):void; getWorldPosition(target:Vector3):Vector3; }
 export class Group extends Object3D {}
}
