/** V812 extends the ORIGINAL V647 single backwall shader. No replacement mesh. */
import {LED_WALL_FRAGMENT_V647} from './cinematicStageEnvironmentsV647';
export const LED_WALL_FRAGMENT_V812=LED_WALL_FRAGMENT_V647
 .replace('uniform float uSceneStyle;',`uniform float uFxPower;uniform float uFxStyle;
 uniform float uAudioBass;uniform float uAudioMids;uniform float uAudioHighs;
 uniform float uSceneStyle;`)
 .replace('vec3 col=mix(uPrimary,uSecondary,',`
  // Frequency bars, bass rings, and segmented pixel/geometry modes share the existing wall.
  float bins=fract(vUv.x*18.0);
  float spectrum=vUv.x<.33?uAudioBass:vUv.x<.67?uAudioMids:uAudioHighs;
  float bars=step(vUv.y,.13+clamp(spectrum,0.0,1.0)*.62)*step(.20,bins)*step(bins,.81);
  float rings=1.0-smoothstep(.016,.045,abs(fract(length(vUv-vec2(.5))*(6.0+uAudioBass*2.0)-uPhase*.16)-.5));
  float waves=1.0-smoothstep(.02,.09,abs(vUv.y-(.50+sin(vUv.x*17.0-uPhase*.55)*(.04+uAudioBass*.13))));
  float glitch=step(.84,fract(vUv.y*23.0+uPhase*.13))*step(.80,fract(vUv.x*17.0+uPhase*.19));
  float fx=uFxStyle<1.5?waves:uFxStyle<2.5?rings:uFxStyle<3.5?max(bars,glitch*.4):max(rings*.55,bars*.65);
  // Remains within V647 perimeter/portrait-safe backdrop and its .15 opacity cap.
  backdrop+=fx*clamp(uFxPower,0.0,.6)*rim*.48;
  vec3 col=mix(uPrimary,uSecondary,`);
