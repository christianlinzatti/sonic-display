/** V886 extends the existing V812 -> V821 -> V842 -> V870 shader in place.
 * Zero new materials, textures, passes, meshes or clocks. All effects remain within
 * the original LED surface and inherited perimeter/alpha safeguards. */
import {LED_WALL_FRAGMENT_V842} from './ledWallExperienceShaderV842';
const UNIFORM_ANCHOR='uniform float uLed70Power;';
const COLOR_ANCHOR='backdrop+=led21*clamp(uLed21Power,0.0,.38)*rim*.92+led42*.7+led70*.67;';
const ALPHA_ANCHOR='float ledAlpha=(led21*clamp(uLed21Power,0.0,.38)+led42+led70)*rim*vignette*.32;';
if(!LED_WALL_FRAGMENT_V842.includes(UNIFORM_ANCHOR)||
   !LED_WALL_FRAGMENT_V842.includes(COLOR_ANCHOR)||
   !LED_WALL_FRAGMENT_V842.includes(ALPHA_ANCHOR)){
 throw new Error('V886: LED shader source changed – refusing incomplete injection');
}
export const LED_WALL_FRAGMENT_V886=LED_WALL_FRAGMENT_V842
 .replace(UNIFORM_ANCHOR,`uniform float uLed86Power;uniform float uLed86Mode;
 uniform float uLed86Phase;uniform float uLed86Bass;uniform float uLed86Mids;
 uniform float uLed86Highs;uniform float uLed86Motion;uniform float uLed86Camera;
 ${UNIFORM_ANCHOR}`)
 .replace(COLOR_ANCHOR,`// V886: fresh, continuous looks. Only measured V810 spectral envelopes are used.
  float led86=0.0;
  if(uLed86Power>0.00001){
  float led86Time=uLed86Phase*clamp(uLed86Motion,.0,.55);
  float skylineLane86=floor(vUv.x*36.0);
  float skylineFreq86=mod(skylineLane86,3.0)<.5?uLed86Bass:
    mod(skylineLane86,3.0)<1.5?uLed86Mids:uLed86Highs;
  float skylineHeight86=.10+skylineFreq86*.68*(.76+.24*sin(skylineLane86*1.87+led86Time));
  float skyline86=step(vUv.y,skylineHeight86)*
    step(.16,fract(vUv.x*36.0))*step(fract(vUv.x*36.0),.80);
  // Repeating triangular facets form a slowly rotating kaleidoscope.
  float petals86=abs(cos(angle*6.0+led86Time*.6));
  float kaleido86=(1.0-smoothstep(.025,.13,abs(fract(radius*5.6+
    petals86*1.6-led86Time*.11)-.5)))*(.30+.70*uLed86Mids);
  // Woven chevrons travel diagonally – not a full-wall brightness flash.
  float chevronCoord86=(abs(p.x)*1.8+p.y*1.20)*5.0-led86Time*.33;
  float chevrons86=(1.0-smoothstep(.02,.14,abs(fract(chevronCoord86)-.5)))*
    (.30+.70*uLed86Highs);
  // Spiral turns smoothly around the stage's LED center for confirmed drops.
  float spiral86=fract((radius*5.0+angle*.95-led86Time*.13));
  float vortex86=(1.0-smoothstep(.025,.13,abs(spiral86-.5)))*
    smoothstep(.08,.85,radius)*(.30+.70*uLed86Bass);
  float motif86=uLed86Mode<1.5?skyline86:uLed86Mode<2.5?kaleido86:
    uLed86Mode<3.5?chevrons86:vortex86;
  led86=clamp(motif86*clamp(uLed86Power,0.0,.045)*
    clamp(uLed86Camera,0.0,1.0)*rim,0.0,.045);
  }
  ${COLOR_ANCHOR.slice(0,-1)}+led86*.6;`)
 .replace(ALPHA_ANCHOR,'float ledAlpha=(led21*clamp(uLed21Power,0.0,.38)+led42+led70+led86)*rim*vignette*.32;');
