/** V991: a single static, opt-in stage FLOOR plane, behind performers.
 * No time uniform, fullscreen quad, new lights, textures or flashing transitions.
 * The radius & decay come exclusively from the measured, validated playback cue.
 */
export const BASS_IMPACT_VERTEX_V991=`
 varying vec2 vUv;
 void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}
`;
export const BASS_IMPACT_FRAGMENT_V991=`
 varying vec2 vUv;
 uniform vec3 uColor;
 uniform float uPower;
 uniform float uRadius;
 uniform float uAge;
 uniform float uStyle;
 void main(){
   vec2 p=(vUv-vec2(.5))*2.0;
   float r=length(p);
   float radius=clamp(uRadius,.11,.92);
   float width=.035+.022*clamp(uAge,0.0,1.15);
   float ring=1.0-smoothstep(width*.3,width,abs(r-radius));
   float echo=1.0-smoothstep(width*.6,width*1.8,abs(r-radius*.78));
   float floorGlow=exp(-13.0*r*r)*.20;
   float motif=uStyle<.5?ring*.68+echo*.28+floorGlow:
               uStyle<1.5?ring*.86+echo*.23+floorGlow*.60:
                            ring*.42+floorGlow*.50;
   // Sparse local glints appear inside the ring, never as screen-sized luminance jumps.
   float glint=step(.97,fract(sin(dot(floor(p*vec2(42.0,42.0)),vec2(12.9898,78.233)))*43758.5453));
   glint*=smoothstep(radius*.65,radius*.9,r)*(1.0-smoothstep(radius,radius*1.06,r));
   float alpha=clamp((motif+glint*.12)*clamp(uPower,0.0,.16),0.0,.14);
   if(alpha<.001)discard;
   gl_FragColor=vec4(uColor,alpha);
 }
`;
