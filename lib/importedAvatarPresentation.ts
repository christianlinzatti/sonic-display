import {Box3,Vector3,type Object3D} from 'three';
import {importedAvatarModels} from '../config/avatarModels.imported';

const importedUrls=new Set(importedAvatarModels.map(model=>model.url));
export function isImportedAvatarUrl(url:string){return importedUrls.has(url.split(/[?#]/,1)[0]);}

/** Normalize only owned clones of the bundled imports; keep source files and cached scenes intact. */
export function fitImportedAvatar<T extends Object3D>(model:T,url:string):T{
 if(!isImportedAvatarUrl(url))return model;
 model.updateMatrixWorld(true);
 const bounds=new Box3().setFromObject(model,true),size=bounds.getSize(new Vector3());
 if(bounds.isEmpty()||![size.x,size.y,size.z].every(Number.isFinite)||size.y<=1e-6)return model;
 const center=bounds.getCenter(new Vector3()),factor=2/size.y;
 model.scale.multiplyScalar(factor);
 model.position.multiplyScalar(factor).addScaledVector(center,-factor);
 model.updateMatrixWorld(true);
 return model;
}
