import type {AvatarModel} from "./avatarModels";

/** V409 only shows configured, trusted-library entries, never arbitrary user-entered preview URLs. */
export function isPreviewModelUrlV409(url:unknown):url is string {
  if(typeof url!=="string" || url.length>2048 || /[\u0000-\u001f\s]/.test(url))return false;
  if(/^\/avatars\/(?!\/)[^?#]+\.(glb|gltf)(?:[?#][^\s]*)?$/i.test(url))return true;
  if(/^https:\/\/[^\s]+$/i.test(url)) {
    try {const parsed=new URL(url);return !!parsed.hostname&&/\.(glb|gltf)$/i.test(parsed.pathname)&&!parsed.username&&!parsed.password;}catch{return false;}
  }
  return false;
}

export function previewModelsV409(models:ReadonlyArray<AvatarModel>):AvatarModel[] {
  const seen=new Set<string>();
  return models.filter(model=>{
    if(!model || typeof model.id!=="string" || seen.has(model.id))return false;
    if(model.id!=="procedural"&&!isPreviewModelUrlV409(model.url))return false;
    seen.add(model.id);return true;
  });
}

/** Keep editor selection separate from the avatar used by the live show. */
export function selectedPreviewModelV409(models:ReadonlyArray<AvatarModel>,id:string,liveId:string):AvatarModel|null {
  const available=previewModelsV409(models);
  return available.find(model=>model.id===id)??available.find(model=>model.id===liveId)??available.find(model=>model.id==="procedural")??available[0]??null;
}
