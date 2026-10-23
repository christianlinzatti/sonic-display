import {Vector3,type Object3D} from "three";
/** Samples a known face target without assuming that GLB/VRM rigs share proportions. */
export function sampleVocalFaceYV369(root:Object3D|null):number|null {
  if(!root)return null;
  root.updateWorldMatrix(true,true);
  let found:number|null=null;
  const position=new Vector3();
  root.traverse(object=>{
    if(found!==null||!object.visible)return;
    if(object.name==="SonicV369Face"||/^(?:mixamorig[:_]?|cc_base_)?head(?:[._-]?\d+)?$/i.test(object.name)){
      object.getWorldPosition(position);
      if(Number.isFinite(position.y)&&Math.abs(position.y)<15)found=position.y;
    }
  });
  return found;
}
