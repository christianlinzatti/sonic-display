/** Upgrades the existing V812/V647 LED shader in place: NO extra plane or draw call. */
import {LED_WALL_FRAGMENT_V812} from './reactiveLedWallV812';
export const LED_WALL_FRAGMENT_V821=LED_WALL_FRAGMENT_V812
 .replace('uniform float uFxPower;', `uniform float uLed21Power;uniform float uLed21Look;
 uniform float uLed21Bass;uniform float uLed21Mids;uniform float uLed21Highs;
 uniform float uLed21Drop;uniform float uLed21Phase;uniform float uLed21Tempo;
 uniform float uLed21Variation;
 uniform float uBeat22Kick;uniform float uBeat22Snare;uniform float uBeat22Peak;
 uniform float uFxPower;`)
 .replace('backdrop+=fx*clamp(uFxPower,0.0,.6)*rim*.48;', `backdrop+=fx*clamp(uFxPower,0.0,.6)*rim*.48;
  // V821 LED Wall Experience: verse EQ, hook geometry, build wave, drop tunnels.
  // Every mode stays in the V647 perimeter vignette; the central singer stays dim.
  float beatPhase=uLed21Phase*(.65+uLed21Tempo);
  vec2 tile=fract(vUv*vec2(28.0,14.0))-vec2(.5);
  float pixel=1.0-smoothstep(.34,.48,length(tile));
  float bandId=floor(vUv.x*24.0);
  float channel=mod(bandId,3.0);
  float freq=channel<.5?uLed21Bass:channel<1.5?uLed21Mids:uLed21Highs;
  float eqThreshold=.11+freq*.68*(.8+.2*sin(bandId*2.31+beatPhase));
  float equalizer=step(vUv.y,eqThreshold)*step(.11,fract(vUv.x*24.0))*
      step(fract(vUv.x*24.0),.83)*pixel;
  float angle=atan(p.y,p.x);
  float radius=length(p);
  float polygons=1.0-smoothstep(.018,.06,abs(fract((radius+sin(angle*6.0+beatPhase*.18)*.045)*5.2-
      beatPhase*.12)-.5));
  float geometry=polygons*(.35+.65*uLed21Mids);
  float sineWave=1.0-smoothstep(.018,.080,abs(vUv.y-(.47+sin(vUv.x*16.0-
      beatPhase)*(.07+.14*uLed21Bass))));
  float wave=max(sineWave*.9,geometry*.32);
  vec2 tunnelP=abs(p);
  float depth=max(tunnelP.x,tunnelP.y);
  float tunnel=1.0-smoothstep(.025,.085,abs(fract(depth*5.5-beatPhase*.14)-.5));
  float spokes=pow(max(0.0,cos(angle*(6.0+floor(uLed21Variation*.5))*1.0)),8.0);
  float dropPattern=max(tunnel*.82,spokes*.50)*(.40+.60*uLed21Bass);
  float chosen=uLed21Look<1.5?equalizer:uLed21Look<2.5?geometry:
      uLed21Look<3.5?wave:dropPattern;
  // Audio reactivity is continuous and never a full-screen strobe or flash.
  float accent=dropPattern*uLed21Drop*.35;
  // V822: independent measured onset proxies, no strobe or fullscreen flash.
  // Confine transient detail to the back-wall perimeter vignette.
  float kickArc=(1.0-smoothstep(.035,.11,abs(length(p)-.68)))*uBeat22Kick;
  float snareBars=(1.0-smoothstep(.035,.075,abs(fract(vUv.x*12.0)-.5)))*uBeat22Snare;
  float peakRim=(1.0-smoothstep(.065,.18,abs(max(abs(p.x),abs(p.y))-.78)))*uBeat22Peak;
  float beat22=clamp((kickArc*.30+snareBars*.19+peakRim*.28)*rim,0.0,.30);
  float led21=clamp(chosen+accent+beat22,0.0,1.0);
  backdrop+=led21*clamp(uLed21Power,0.0,.38)*rim*.92;`)
 .replace('gl_FragColor=vec4(col,clamp(uOpacity*backdrop*vignette,0.0,.15));', `// Stronger visibility only at the edge; the alpha limit stays at 0.15.
  vec3 wallColor=mix(col,uSecondary,led21*.23);
  float ledAlpha=led21*clamp(uLed21Power,0.0,.38)*rim*vignette*.32;
  gl_FragColor=vec4(wallColor,clamp(uOpacity*backdrop*vignette+ledAlpha,0.0,.15));`);
