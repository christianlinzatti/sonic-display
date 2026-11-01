declare module "three" {
 export interface Vector3 { distanceTo(other:Vector3):number; }
 export interface Object3D { position:Vector3; }
}
