// One shallow floor decal: no textures, shadows, render targets or runtime allocations.
export const GOBO_VERTEX_V762=`varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`;
export const GOBO_FRAGMENT_V762=`uniform vec3 uColor;uniform float uOpacity;uniform float uPhase;uniform float uPattern;uniform float uScale;
varying vec2 vUv;
void main(){
 vec2 uv=(vUv-.5)*2.*clamp(uScale,.75,1.55);float r=length(uv);float a=atan(uv.y,uv.x);float p=0.;
 if(uPattern<.5){p=pow(.5+.5*cos(a*6.+uPhase*.30),3.);}
 else if(uPattern<1.5){p=pow(.5+.5*cos(uv.x*16.+uPhase*.55),4.);}
 else if(uPattern<2.5){p=pow(.5+.5*cos(a*12.-uPhase*.55),6.);}
 else if(uPattern<3.5){p=pow(.5+.5*cos((uv.x+uv.y)*11.+uPhase*.25),4.);}
 else if(uPattern<4.5){float lattice=cos(uv.x*12.+uPhase*.4)*cos(uv.y*12.-uPhase*.3);p=pow(.5+.5*lattice,3.);}
 else{float bands=sin(uv.y*14.-uPhase*.6+sin(uv.x*4.)*1.7);p=pow(.5+.5*bands,4.);}
 float fade=(1.-smoothstep(.45,1.,r))*smoothstep(.02,.20,r);
 gl_FragColor=vec4(uColor,clamp(uOpacity*p*fade,0.,.15));
}`;
