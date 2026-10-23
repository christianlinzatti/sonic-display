declare module "three" {
  export class Object3D { name:string; rotation:{x:number;y:number;z:number}; traverse(callback:(node:Object3D)=>void):void; }
  export class Group extends Object3D {}
}
