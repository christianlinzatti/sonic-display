/** V811 – a single bounded, additive stage-backdrop plane. No real laser, no strobe,
 * no moving Three.js lights and no shader/geometry allocations per animation frame. */
export const LASER_MATRIX_VERTEX_V811=`varying vec2 vUv; void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`;
export const LASER_MATRIX_FRAGMENT_V811=`
 precision mediump float;
 uniform vec3 uPrimary;uniform vec3 uSecondary;
 uniform float uOpacity;uniform float uLaserOn;uniform float uRibbons;uniform float uPhase;uniform float uMode;uniform float uFanSpread;uniform float uFanMotion;
 varying vec2 vUv;
 float line(float x,float w){return 1.0-smoothstep(0.0,w,abs(x));}
 void main(){
   vec2 uv=vUv; float t=uPhase;
   // The graphics stay on the wings: the central vocalist remains silhouetted.
   float wings=smoothstep(.13,.38,abs(uv.x-.5));
   float vertical=smoothstep(.08,.30,uv.y)*(1.0-smoothstep(.80,.99,uv.y));
   float fans=0.0;
   for(int j=0;j<4;j++){
     float a=(float(j)-1.5)*.27*clamp(uFanSpread,1.,1.65)+sin(t*.23+float(j)*1.7)*(.10+uFanMotion*.12);
     float beamLeft=line((uv.x-.04)-(.30+a)*(uv.y-.10),.012);
     float beamRight=line((.96-uv.x)-(.30-a)*(uv.y-.10),.012);
     fans+=max(beamLeft,beamRight);
   }
   float tunnel=line(fract(max(abs(uv.x-.5)*1.65,abs(uv.y-.5)*1.35)*4.0-t*.10)-.5,.07);
   float ribbon=line(sin(uv.y*6.283+uv.x*7.0-t*.55)*.16+uv.x-.5,.034)*uRibbons;
   float style=(uMode>2.5?mix(fans,tunnel,.25):uMode>1.5?mix(fans,ribbon,.25):fans*.66)*uLaserOn;
   float alpha=clamp((style+ribbon*.45)*wings*vertical*uOpacity,0.0,.14);
   vec3 rgb=mix(uPrimary,uSecondary,uv.x*.75+.12);
   gl_FragColor=vec4(rgb,alpha);
 }`;
