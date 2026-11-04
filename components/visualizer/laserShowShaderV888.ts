/** V888: in-place extension of the existing V811 *single* laser shader.
 * Power zero leaves the inherited pixel math exactly as it was. No flashes.
 */
import {LASER_MATRIX_FRAGMENT_V811} from './laserMatrixShaderV811';
const uniform='uniform float uOpacity;';
const anchor='float alpha=clamp((style+ribbon*.45)*wings*vertical*uOpacity,0.0,.14);';
if(!LASER_MATRIX_FRAGMENT_V811.includes(uniform)||!LASER_MATRIX_FRAGMENT_V811.includes(anchor)){
 throw new Error('V888: source laser shader changed; refusing incomplete extension');
}
export const LASER_SHOW_FRAGMENT_V888=LASER_MATRIX_FRAGMENT_V811
 .replace(uniform,`uniform float uLaser88Power;uniform float uLaser88Mode;
 uniform float uLaser88Phase;uniform float uLaser88Motion;uniform float uLaser88Spread;
 ${uniform}`)
 .replace(anchor,`// Four smooth, bounded stage-backdrop motifs – confined by inherited wings.
  if(uLaser88Power>0.001){
   vec2 p=uv-vec2(.5,.46);
   float t88=uLaser88Phase*clamp(uLaser88Motion,0.0,.72);
   float fan88=0.0;
   for(int k=0;k<4;k++){
    float a88=(float(k)-1.5)*.22*clamp(uLaser88Spread,1.0,1.4)
       +sin(t88*.35+float(k)*.9)*.13;
    fan88+=max(line((uv.x-.07)-(.33+a88)*(uv.y-.07),.012),
               line((.93-uv.x)-(.33-a88)*(uv.y-.07),.012));
   }
   float radius88=max(abs(p.x)*1.7,abs(p.y)*1.30);
   float tunnel88=line(fract(radius88*5.0-t88*.17)-.5,.070);
   float crossing88=0.0;
   for(int k=0;k<3;k++){
    float a88=float(k)*.20-.20+sin(t88*.32+float(k))* .07;
    crossing88+=max(line(p.x-p.y*(1.2+a88),.014),
                    line(p.x+p.y*(1.2+a88),.014));
   }
   float prism88=line(fract((abs(p.x)*1.5+abs(p.y)*1.9)*5.0-t88*.13)-.5,.075);
   float creative88=uLaser88Mode<1.5?fan88:uLaser88Mode<2.5?tunnel88:
     uLaser88Mode<3.5?crossing88:prism88;
   style=mix(style,clamp(creative88,0.0,1.5)*uLaserOn,clamp(uLaser88Power,0.0,.90));
  }
  ${anchor}`);
