/** V990 extends the SAME V886 shader; no new mesh/texture/light/material.
 * Subtle spatial bands, moving lines and transitions use confirmed uLed90Phase.
 * No fullscreen luminance steps, beat flashes or unbounded uniforms.
 */
import {LED_WALL_FRAGMENT_V886} from './ledWallCreativeShaderV886';
const uniform='uniform float uLed86Power;';
const color='backdrop+=led21*clamp(uLed21Power,0.0,.38)*rim*.92+led42*.7+led70*.67+led86*.6;';
const alpha='float ledAlpha=(led21*clamp(uLed21Power,0.0,.38)+led42+led70+led86)*rim*vignette*.32;';
if(!LED_WALL_FRAGMENT_V886.includes(uniform)||!LED_WALL_FRAGMENT_V886.includes(color)||
   !LED_WALL_FRAGMENT_V886.includes(alpha))throw new Error('V990 LED shader anchor changed');
export const LED_WALL_FRAGMENT_V990=LED_WALL_FRAGMENT_V886
 .replace(uniform,`uniform float uLed90Power;uniform float uLed90Mode;
  uniform float uLed90Phase;uniform float uLed90Motion;
  uniform float uLed90Bass;uniform float uLed90Mids;
  uniform float uLed90Highs;uniform float uLed90Accent;
  ${uniform}`)
 .replace(color,`// V990 genre patterns – localized line work, no whole-screen flash.
  float led90=0.0;
  if(uLed90Power>0.00001){
    float flow90=uLed90Phase*clamp(uLed90Motion,.0,.35);
    // City Pulse: tall skyline blocks rise gently with confirmed frequency bands.
    float lane90=floor(vUv.x*22.0);
    float cityLevel90=.12+(.18+.45*uLed90Bass)*(.7+.3*sin(lane90*1.9+flow90*.18));
    float city90=step(vUv.y,cityLevel90)*smoothstep(.13,.23,fract(vUv.x*22.0))*
      (1.0-smoothstep(.75,.86,fract(vUv.x*22.0)));
    // Neon Matrix: stable diagonal line grid, slow spatial drift, never strobe.
    float diag90=p.x*7.0+p.y*5.0+flow90*.09;
    float matrix90=(1.0-smoothstep(.015,.095,abs(fract(diag90)-.5)))*
      (1.0-smoothstep(.015,.095,abs(fract(p.x*8.0-p.y*4.0-flow90*.07)-.5)))*2.0;
    // Arena Beams: sweeping fan edges, weighted by the confirmed middle band.
    float fan90=abs(p.x)-(.17+abs(p.y)*(.65+.1*sin(flow90*.23)));
    float arena90=(1.0-smoothstep(.025,.15,abs(fan90)))*(.35+.65*uLed90Mids);
    // Prism Flow: nested polygon rings, subdued during vocals and lyrics.
    float prism90=(1.0-smoothstep(.025,.13,abs(fract((abs(p.x)+abs(p.y))*4.4+
      sin(angle*4.0+flow90*.10)*.14)-.5)))*(.30+.7*uLed90Highs);
    float motif90=uLed90Mode<1.5?city90:uLed90Mode<2.5?matrix90:
      uLed90Mode<3.5?arena90:prism90;
    led90=clamp(motif90*(.65+.35*clamp(uLed90Accent,0.0,.90))*
      clamp(uLed90Power,0.0,.022)*rim,0.0,.022);
  }
  ${color.slice(0,-1)}+led90*.55;`)
 .replace(alpha,'float ledAlpha=(led21*clamp(uLed21Power,0.0,.38)+led42+led70+led86+led90)*rim*vignette*.32;');
