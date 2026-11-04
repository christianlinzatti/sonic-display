/** V887 – optional rolling fog banks on the EXISTING V814 shader meshes.
 * All new uniforms zero when the V887 creative layer is inactive: V814 stays intact.
 */
import {ATMOSPHERE_FRAGMENT_V814} from './atmosphereShaderV814';
export const ATMOSPHERE_FRAGMENT_V887=ATMOSPHERE_FRAGMENT_V814
 .replace('uniform vec3 uColor;', `uniform float uFogDriftV887;
uniform float uFogSoftV887;
uniform float uFogWarpV887;
uniform vec3 uColor;`)
 .replace('float t=uPhase*.11;',`float t=(uPhase+uFogDriftV887)*.11;`)
 .replace('float shape=uKind<.5?banks*floorFade:fan*wings*shaftFade;',`float shape=uKind<.5?banks*floorFade:fan*wings*shaftFade;
 // Extra 3D stage character, not volumetric marching or an additional mesh.
 if(uFogWarpV887>.001){
  float ribbon=sin(uv.x*12.0+uv.y*5.0-t*1.5)*.5+.5;
  float roll=smoothstep(.2,.88,ribbon)*floorFade;
  shape=mix(shape,uKind<.5?roll:fan*wings*shaftFade,uFogWarpV887*.32);
 }`)
 .replace('float a=clamp(shape*uOpacity,0.0,.17);',`float softened=mix(shape,smoothstep(.07,.75,shape),uFogSoftV887);
 float a=clamp(softened*uOpacity,0.0,.17);`);
