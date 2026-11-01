/** V786: conservative theoretical 2/4-avatar geometry arithmetic (NOT a GPU estimate). */
export type AvatarComplexityStaticV786={scene:{triangles:number;estimatedMeshDrawCalls:number;usedSkinJoints:number};resources:{estimatedRgba8MipBytes:number;unknownTextureEstimates:number}};
export type AvatarGeometryLoadV786={avatars:2|4;theoreticalTriangles:number;unbatchedPrimitiveDrawUpper:number;
  perAvatarSkinJoints:number;sharedTextureScenarioBytes:number|null;limitations:readonly string[]};
const valid=(x:number)=>Number.isSafeInteger(x)&&x>=0;
export function summarizeAvatarGeometryV786(profile:AvatarComplexityStaticV786,avatars:2|4):AvatarGeometryLoadV786{
  if(avatars!==2&&avatars!==4)throw Error('Avataranzahl nur 2 oder 4');
  const {triangles,estimatedMeshDrawCalls,usedSkinJoints}=profile.scene;
  const {estimatedRgba8MipBytes,unknownTextureEstimates}=profile.resources;
  if(![triangles,estimatedMeshDrawCalls,usedSkinJoints,estimatedRgba8MipBytes,unknownTextureEstimates].every(valid))throw Error('Ungueltige GLB-Statistik');
  if(!Number.isSafeInteger(triangles*avatars)||!Number.isSafeInteger(estimatedMeshDrawCalls*avatars))throw Error('GLB-Geometrie zu gross');
  return {avatars,theoreticalTriangles:triangles*avatars,unbatchedPrimitiveDrawUpper:estimatedMeshDrawCalls*avatars,
    perAvatarSkinJoints:usedSkinJoints,sharedTextureScenarioBytes:unknownTextureEstimates===0?estimatedRgba8MipBytes:null,
    limitations:['Kein Renderbenchmark: keine FPS-/P95-Vorhersage','Draw Calls ohne Instancing, Materialspezifika und Postprocessing',
      'GPU-Texturen koennen zwischen identischen GLB-Avataren geteilt werden; Speicherwert daher nicht multiplizieren']};
}
