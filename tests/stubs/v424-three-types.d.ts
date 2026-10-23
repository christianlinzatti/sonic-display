declare module "three" {
 export class Object3D {name:string;rotation:{x:number;y:number;z:number};traverse(fn:(node:Object3D)=>void):void;}
 export class Mesh extends Object3D { geometry: {
  getAttribute(name:string): {count:number;getX(i:number):number;getY(i:number):number;getZ(i:number):number}|undefined;
  morphAttributes:{position?:Array<{count:number;getX(i:number):number;getY(i:number):number;getZ(i:number):number}>};
  morphTargetsRelative:boolean;
 }; morphTargetDictionary?:Record<string,number>; morphTargetInfluences?:number[]; }
}
