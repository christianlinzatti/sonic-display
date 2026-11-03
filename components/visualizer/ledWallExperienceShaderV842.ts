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
          'float ledAlpha=(led21*clamp(uLed21Power,0.0,.38)+led42)*rim*vignette*.32;')
 // V870: three additional bounded LED motifs on the SAME V842 shader, not an extra plane.
 .replace('uniform float uLed42Power;', `uniform float uLed70Power;uniform float uLed70Mode;
 uniform float uLed70Phase;uniform float uLed70Bass;uniform float uLed70Mids;
 uniform float uLed70Camera;
 uniform float uLed42Power;`)
 .replace('backdrop+=led21*clamp(uLed21Power,0.0,.38)*rim*.92+led42*.7;', `// V870: bars, concentric prism facets, or gentle radial bass-rings.
  // The measured V810 cue provides the ONLY phase and energy source.
  float lane70=floor(vUv.x*32.0);
  float level70=.10+uLed70Mids*.62*(.78+.22*sin(lane70*1.79+uLed70Phase*.62));
  float eq70=step(vUv.y,level70)*step(.15,fract(vUv.x*32.0))*step(fract(vUv.x*32.0),.81);
  float prismDist70=max(abs(p.x),abs(p.y)*1.12);
  float prism70=(1.0-smoothstep(.025,.11,abs(fract(prismDist70*4.7+
    sin(angle*5.0+uLed70Phase*.15)*.10)-.5)))*(.36+.64*uLed70Mids);
  float ringDist70=length(p);
  float ring70=(1.0-smoothstep(.035,.12,abs(fract(ringDist70*4.5-
    uLed70Phase*.11)-.5)))*(.30+.70*uLed70Bass);
  float motif70=uLed70Mode<1.5?eq70:uLed70Mode<2.5?prism70:ring70;
  float led70=clamp(motif70*clamp(uLed70Power,0.0,.09)*
    clamp(uLed70Camera,0.0,1.0)*rim,0.0,.09);
  // No full-screen flash: the inherited vignette, perimeter and alpha .15 cap remain.
  backdrop+=led21*clamp(uLed21Power,0.0,.38)*rim*.92+led42*.7+led70*.67;`)
 .replace('float ledAlpha=(led21*clamp(uLed21Power,0.0,.38)+led42)*rim*vignette*.32;',
          'float ledAlpha=(led21*clamp(uLed21Power,0.0,.38)+led42+led70)*rim*vignette*.32;');
