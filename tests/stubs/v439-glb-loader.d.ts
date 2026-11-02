/** Test-only Three.js contracts used by the V439 scan and V769 disposal paths.
 * Not imported by the production TypeScript project.
 */
declare module 'three' {
  export interface Object3D { traverse(callback:(node:Object3D)=>void):void; }
  export interface Material { dispose():void; uniforms?:Record<string,{value?:unknown}>; }
  export interface Texture { isTexture:boolean; dispose():void; }
  export interface WebGLRenderTarget { dispose():void; }
}
declare module 'three/examples/jsm/loaders/GLTFLoader.js' {
  import type { Object3D } from 'three';
  export interface GLTF {
    scene:Object3D;
    scenes:Object3D[];
    animations:Array<{
      name:string;duration:number;tracks:Array<{
        name:string;times:ArrayLike<number>;values:ArrayLike<number>;getValueSize:()=>number;
      }>;
    }>;
  }
  export class GLTFLoader {
    parseAsync(data:ArrayBuffer, path:string):Promise<GLTF>;
    loadAsync(url:string):Promise<GLTF>;
  }
}
