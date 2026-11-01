/** V736 isolated type test only: NOT included by the production tsconfig.
 * Production builds must compile against the actual installed @types/three.
 */
declare module 'three' {
  export class Vector3 {
    constructor(x?: number,y?: number,z?: number);
    distanceTo(other: Vector3): number;
  }
  export class Object3D {
    name: string;
    rotation: { x:number; y:number; z:number };
    position: { x:number; y:number; z:number };
    traverse(cb: (node:Object3D)=>void): void;
    getWorldPosition(target:Vector3):Vector3;
  }
  export class Group extends Object3D {}
}
