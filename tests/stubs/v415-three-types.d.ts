/** Isolated test-only approximation of Three.js. Not part of production tsconfig. */
declare module "three" {
  export class Vector3 {
    constructor(x?: number, y?: number, z?: number);
    x: number; y: number; z: number;
    distanceTo(other: Vector3): number;
  }
  export class Object3D {
    name: string;
    rotation: { x: number; y: number; z: number };
    position: { x: number; y: number; z: number };
    traverse(callback: (node: Object3D) => void): void;
    getWorldPosition(target: Vector3): Vector3;
  }
  export class Group extends Object3D {}
}
