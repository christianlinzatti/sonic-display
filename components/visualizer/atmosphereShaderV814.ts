/** V814 – two bounded low-alpha decorative planes; no volumetric raymarching. */
export const ATMOSPHERE_VERTEX_V814=`varying vec2 vUv;
void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`;
export const ATMOSPHERE_FRAGMENT_V814=`precision mediump float;
uniform vec3 uColor;uniform float uOpacity;uniform float uPhase;uniform float uKind;
varying vec2 vUv;
void main(){
 vec2 uv=vUv;float t=uPhase*.11;
 float fog1=sin(uv.x*9.0+sin(uv.y*4.0+t)*1.9+t);
 float fog2=cos(uv.x*15.0-uv.y*3.7+t*.73);
 float banks=smoothstep(-.68,.82,fog1*.65+fog2*.35);
 float floorFade=smoothstep(.01,.31,uv.y)*(1.0-smoothstep(.72,.99,uv.y));
 // Side shafts instead of a bright central spotlight in front of the vocalist.
 float wings=smoothstep(.19,.39,abs(uv.x-.5));
 float fan=pow(max(0.0,cos((uv.x-.5)*19.0+uv.y*3.0+sin(t)*.45)),12.0);
 float shaftFade=smoothstep(.08,.45,uv.y)*(1.0-smoothstep(.82,.98,uv.y));
 float shape=uKind<.5?banks*floorFade:fan*wings*shaftFade;
 float a=clamp(shape*uOpacity,0.0,.17);
 gl_FragColor=vec4(uColor,a);
}`;
