declare module "three/examples/jsm/loaders/GLTFLoader.js" {
  export class GLTFLoader {
    parseAsync(data:ArrayBuffer, path:string):Promise<{animations:Array<{
      name:string;duration:number;tracks:Array<{name:string;times:ArrayLike<number>;values:ArrayLike<number>;getValueSize:()=>number}>;
    }>}>;
  }
}
