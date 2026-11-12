'use client';
import {forwardRef,useImperativeHandle,useMemo,useRef} from 'react';
import {AdditiveBlending,Color,Vector4,type Mesh,type ShaderMaterial} from 'three';
import type {AtmospherePlan} from '@/lib/concertAtmosphere';
const vertex=`varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`;
const background=`
varying vec2 vUv;uniform vec3 uPrimary,uSecondary;uniform vec4 uWeights,uHero;uniform float uTime,uAmount,uSpread;
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
void main(){
 vec2 p=(vUv-.5)*vec2(1.8,1.);float edge=1.-smoothstep(.3,1.3,length(p));
 vec3 tint=mix(uPrimary,uSecondary,smoothstep(-.7,.7,p.x));
 vec3 color=vec3(.003,.005,.012)+tint*.01*edge;
 if(uAmount>.001){
  float ribbon=exp(-abs(p.y-.12-sin(p.x*5.+uTime*.11)*.13)*22.);
  ribbon+=.55*exp(-abs(p.y+.1-sin(p.x*3.-uTime*.09)*.18)*30.);
  vec2 fan=p-vec2(0.,-.53);float angle=atan(fan.x,max(.06,fan.y));
  float prism=pow(.5+.5*cos(angle*(18.-uSpread*5.)+sin(uTime*.12)*1.4),18.)*smoothstep(.08,.7,fan.y);
  vec2 cell=p*vec2(32.,20.);vec2 id=floor(cell);vec2 point=fract(cell)-.5;
  float star=step(.88,hash(id))*exp(-dot(point,point)*110.);
  star*=.65+.35*sin(uTime*.19+hash(id)*6.283);
  float halo=exp(-abs(length(p*vec2(.8,1.))-(.28+uSpread*.18+sin(uTime*.1)*.025))*65.);
  float field=dot(vec4(ribbon,prism,star,halo),uWeights);
  // Song-phrase accents reuse this draw: luminous portals, comet trails and orbit fans.
  if(uHero.x+uHero.y+uHero.z>.001){
   float radius=length((p-vec2(0.,-.12))*vec2(.82,1.));
   float cell=abs(fract(radius*4.-uTime*.045)-.5);
   float portal=exp(-cell*cell*650.)*smoothstep(.16,.35,radius);
   float meteors=0.;
   if(uHero.y>.001){for(int i=0;i<4;i++){
    float f=fract(uTime*.035+float(i)*.237);
    vec2 head=vec2(mix(-1.1,1.1,f),.45-f*.65+float(i)*.035);
    vec2 d=p-head;float across=d.y-d.x*.18;
    meteors+=exp(-across*across*1200.)*exp(-abs(d.x)*18.)*step(d.x,0.)*sin(f*3.14159);
   }}
   float spokes=pow(.5+.5*cos(atan(p.y+.45,p.x)*9.-uTime*.09),30.);
   float orbit=exp(-abs(radius-(.34+.07*sin(uTime*.1)))*48.)+spokes*smoothstep(.2,.75,radius)*.18;
   field+=dot(vec3(portal,meteors,orbit),uHero.xyz)*(.8+uHero.w*.2);
  }

  // Keep the centre behind faces subdued; wide edges carry the spectacle.
  float portrait=.25+.75*smoothstep(.15,.65,abs(p.x));
  color+=tint*field*uAmount*edge*portrait;
 }
 gl_FragColor=vec4(color,1.);
 #include <colorspace_fragment>
}`;
const floorShader=`
varying vec2 vUv;uniform vec3 uPrimary,uSecondary;uniform vec4 uWeights,uHero;uniform float uTime,uAmount,uSpread;
void main(){
 vec2 p=(vUv-.5)*vec2(9.,7.);float radius=length(p);float mask=1.-smoothstep(2.2,3.15,radius);
 float lane=pow(.5+.5*cos(p.x*7.+sin(p.y*.8+uTime*.12)),14.);
 float diamond=exp(-abs(abs(p.x)+abs(p.y*.65)-1.5-uSpread*.4)*35.);
 float grid=pow(.5+.5*cos(p.x*4.),22.)*pow(.5+.5*cos(p.y*4.-uTime*.18),22.);
 float ring=exp(-abs(radius-1.-uSpread*.5-sin(uTime*.12)*.06)*40.);
 float field=dot(vec4(lane,diamond,grid,ring),uWeights);
 float heroGain=uHero.x+uHero.y+uHero.z;
 if(heroGain>.001){float echo=abs(fract(radius*.8-uTime*.055)-.5);field+=exp(-echo*echo*600.)*heroGain*.6;}

 vec3 tint=mix(uPrimary,uSecondary,smoothstep(-2.,2.,p.x));
 float sheen=exp(-abs(p.y+.3)*1.7)*pow(.5+.5*cos(p.x*3.2),6.)*.14;
 gl_FragColor=vec4(tint,(field+sheen)*mask*uAmount);
 #include <colorspace_fragment>
}`;
export type ConcertAtmosphereHandle={update:(plan:AtmospherePlan,primary:string,secondary:string,time:number,blend:number)=>void;read:()=>{backdrop:boolean;floor:boolean;time:number;mix:number[];amount:number;hero:string;heroAmount:number}};
/** Two bounded shader draws behind/on the stage; shares its parent's timing and guards. */
export const ConcertAtmosphere=forwardRef<ConcertAtmosphereHandle>(function ConcertAtmosphere(_,ref){
 const back=useRef<Mesh>(null),floor=useRef<Mesh>(null),backMaterial=useRef<ShaderMaterial>(null),floorMaterial=useRef<ShaderMaterial>(null);
 const hero=useRef('off');
 const targetHero=useMemo(()=>new Vector4(),[]);
 const target=useMemo(()=>new Vector4(),[]),tint=useMemo(()=>new Color(),[]);
 const uniforms=useMemo(()=>({uPrimary:{value:new Color('#65e6ff')},uSecondary:{value:new Color('#b59aff')},uTime:{value:0},uAmount:{value:0},uSpread:{value:.25},uWeights:{value:new Vector4(1,0,0,0)},uHero:{value:new Vector4(0,0,0,0)}}),[]);
 const floorUniforms=useMemo(()=>({uPrimary:{value:new Color('#65e6ff')},uSecondary:{value:new Color('#b59aff')},uTime:{value:0},uAmount:{value:0},uSpread:{value:.25},uWeights:{value:new Vector4(1,0,0,0)},uHero:{value:new Vector4(0,0,0,0)}}),[]);
 useImperativeHandle(ref,()=>({update(plan,primary,secondary,time,blend){
  hero.current=plan.hero;targetHero.set(0,0,0,plan.heroPulse);
  const heroIndex=['portal','meteors','orbit'].indexOf(plan.hero);if(heroIndex>=0)targetHero.setComponent(heroIndex,plan.heroGain);
  if(back.current)back.current.visible=plan.active;if(floor.current)floor.current.visible=plan.floor;
  for(const [material,onFloor] of [[backMaterial.current,false],[floorMaterial.current,true]] as const){
   if(!material)continue;const u=material.uniforms;
   u.uPrimary.value.lerp(tint.set(primary),blend);u.uSecondary.value.lerp(tint.set(secondary),blend);
   target.fromArray(plan.weights);u.uWeights.value.lerp(target,blend);
   u.uAmount.value+=((onFloor?plan.floorGain:plan.amount)-u.uAmount.value)*blend;
   u.uHero.value.lerp(targetHero,blend);
   u.uSpread.value+=(plan.spread-u.uSpread.value)*blend;u.uTime.value=plan.still?0:time;
   // Protection takes effect immediately; no tail of moving light under text.
   if(!plan.moving){u.uHero.value.set(0,0,0,0);u.uAmount.value=onFloor?0:plan.amount;}
  }
 },read(){return {backdrop:back.current?.visible===true,floor:floor.current?.visible===true,time:backMaterial.current?.uniforms.uTime.value??0,mix:backMaterial.current?.uniforms.uWeights.value.toArray()??[],amount:backMaterial.current?.uniforms.uAmount.value??0,hero:hero.current,heroAmount:backMaterial.current?Math.max(backMaterial.current.uniforms.uHero.value.x,backMaterial.current.uniforms.uHero.value.y,backMaterial.current.uniforms.uHero.value.z):0};}}),[target,tint,targetHero]);
 return <group name="concert-atmosphere">
  <mesh ref={back} name="concert-atmosphere-room" position={[0,.1,-3.7]} visible={false}><planeGeometry args={[22,13]}/><shaderMaterial ref={backMaterial} uniforms={uniforms} vertexShader={vertex} fragmentShader={background} toneMapped={false}/></mesh>
  <mesh ref={floor} name="concert-atmosphere-floor" position={[0,-1.936,-.4]} rotation={[-Math.PI/2,0,0]} visible={false} renderOrder={1}><planeGeometry args={[9,7]}/><shaderMaterial ref={floorMaterial} uniforms={floorUniforms} vertexShader={vertex} fragmentShader={floorShader} transparent blending={AdditiveBlending} depthWrite={false} toneMapped={false}/></mesh>
 </group>;
});
