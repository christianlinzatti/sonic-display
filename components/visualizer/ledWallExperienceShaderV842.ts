/** V842: builds on the V821 shader string; no extra mesh, draw call or texture.
 * Screen-space perspective is an illusion, not volumetric stage geometry.
 */
import {LED_WALL_FRAGMENT_V821} from './ledWallExperienceShaderV821';
export const LED_WALL_FRAGMENT_V842=LED_WALL_FRAGMENT_V821
 .replace('uniform float uLed21Power;', `uniform float uLed42Power;uniform float uLed42Mode;
 uniform float uLed42Depth;uniform float uLed42Geometry;
 uniform float uLed42Tunnel;uniform float uLed42Phase;
 uniform float uLed42Flow;uniform float uLed42LightLink;
 uniform float uLed21Power;`)
 .replace('backdrop+=led21*clamp(uLed21Power,0.0,.38)*rim*.92;', `// V842: apparent-depth geometry on the SAME LED surface. Never full-screen.
  // Perspective compression and concentric frames evoke a moving LED tunnel.
  float depth42=max(abs(p.x),abs(p.y)*.86);
  float t42=log2(1.0+depth42*(3.5+uLed42Depth*2.0))*2.5-uLed42Phase*(.09+uLed42Flow*.32);
  float frame42=1.0-smoothstep(.045,.16,abs(fract(t42)-.5));
  float tunnel42=frame42*smoothstep(.24,.95,depth42)*uLed42Tunnel;
  float diamond42=max(abs(p.x+p.y),abs(p.x-p.y));
  float facet42=1.0-smoothstep(.035,.13,abs(fract(diamond42*3.1+uLed42Phase*.07)-.5));
  float polygon42=facet42*(.45+.55*abs(cos(angle*4.0+uLed42Phase*.09)))*uLed42Geometry;
  float motif42=uLed42Mode<1.5?polygon42:tunnel42;
  // Coordinated with confirmed V841 light cue; not an unverified beat flash.
  float linked42=.88+.12*uLed42LightLink;
  float led42=clamp(motif42*clamp(uLed42Power,0.0,.14)*linked42,0.0,.14)*rim;
  backdrop+=led21*clamp(uLed21Power,0.0,.38)*rim*.92+led42*.7;`)
 .replace('float ledAlpha=led21*clamp(uLed21Power,0.0,.38)*rim*vignette*.32;',
          'float ledAlpha=(led21*clamp(uLed21Power,0.0,.38)+led42)*rim*vignette*.32;');
