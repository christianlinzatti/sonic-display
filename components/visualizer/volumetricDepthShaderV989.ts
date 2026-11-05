/** V989 fixed-cost alpha gradients: deliberately no ray-marching, noise sampling or lighting. */
export const DEPTH_VERTEX_V989=`varying vec2 vUv;
void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`;
export const DEPTH_FRAGMENT_V989=`precision mediump float;
uniform vec3 uColor;
uniform float uOpacity;
uniform float uPhase;
uniform float uKind;
varying vec2 vUv;
void main(){
 vec2 p=vUv;
 float horizontal=abs(p.x-.5)*2.0;
 float edge=smoothstep(0.0,.16,p.x)*(1.0-smoothstep(.84,1.0,p.x));
 float gentle=.94+.06*sin(p.x*3.0+uPhase*.12);
 float coneWidth=mix(.11,.92,p.y);
 float beam=(1.0-smoothstep(coneWidth*.18,coneWidth,horizontal))*
   smoothstep(.04,.24,p.y)*(1.0-smoothstep(.85,1.0,p.y));
 float fog=edge*(1.0-smoothstep(.30,1.0,p.y))*
   (1.0-smoothstep(.0,.9,horizontal))*(.95+.05*cos(p.y*5.0+uPhase*.1));
 float alpha=clamp((uKind<.5?beam:fog)*gentle*uOpacity,0.0,.025);
 if(alpha<.0002)discard;
 gl_FragColor=vec4(uColor,alpha);
}`;
