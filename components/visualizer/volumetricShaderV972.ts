/** V972: fixed-cost, procedural atmospheric stage shaders. No raymarch loop. */
export const VOLUMETRIC_VERTEX_V972=`varying vec2 vUv;
void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`;
export const VOLUMETRIC_FRAGMENT_V972=`precision mediump float;
uniform vec3 uColor;
uniform float uOpacity;
uniform float uPhase;
uniform float uKind;
varying vec2 vUv;
void main(){
 vec2 uv=vUv;
 float horiz=abs(uv.x-.5)*2.0;
 float vertical=smoothstep(.01,.22,uv.y)*(1.0-smoothstep(.84,1.0,uv.y));
 float softEdge=smoothstep(0.0,.13,uv.x)*(1.0-smoothstep(.87,1.0,uv.x));
 float slowRipple=sin(uv.x*7.1+uPhase*.45+sin(uv.y*5.0)*.8);
 float grain=.74+.18*sin(uv.y*13.0-uPhase*.45)+.08*slowRipple;
 float width=mix(.95,.06,uv.y);
 float beam=(1.0-smoothstep(width*.26,width,horiz))*vertical;
 float bank=.5+.28*sin(uv.x*8.0+uPhase*.40)+.22*cos(uv.y*7.0-uPhase*.28);
 float background=softEdge*vertical*smoothstep(.14,.85,bank);
 float floorHaze=softEdge*(1.0-smoothstep(.22,.94,uv.y))*smoothstep(.1,.9,bank);
 float shape=uKind<.5?beam*grain:(uKind<1.5?background:floorHaze);
 float alpha=clamp(shape*uOpacity,0.0,.09);
 if(alpha<.0003)discard;
 gl_FragColor=vec4(uColor,alpha);
}`;
