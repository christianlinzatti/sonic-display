declare module "three" {
  export interface Object3D {
    getWorldPosition(target:Vector3):Vector3;
    updateWorldMatrix(updateParents:boolean,updateChildren:boolean):void;
  }
  export class Vector3 {x:number;y:number;z:number;constructor(x?:number,y?:number,z?:number);}
  export class Box3 {
    setFromObject(object:Object3D):this;
    getSize(target:Vector3):Vector3;
    isEmpty():boolean;
  }
}
