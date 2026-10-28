/** V635 – concert-stage editorial layer; keeps the V622 verified act as authority.
 * The output only configures a single existing-stage background plane; it cannot
 * detect sections, allocate GLB stages, modify authored lighting, or add clocks.
 */
import type {StageTransformationContextV622,StageTransformationV622} from './dynamicStageTransformationV622';

export type DynamicConcertStagesInputV635=StageTransformationContextV622 & {
  foundation:StageTransformationV622;energy:number;kick:number;
  groupCount:number;visualsEnabled:boolean;
};
export type DynamicConcertStagesCueV635={active:boolean;act:number;pattern:0|1|2|3;
  opacity:number;speed:number;phase:number;ambientTint:number;floorTint:number;fogTrim:number;};
export const NEUTRAL_CONCERT_STAGES_V635:Readonly<DynamicConcertStagesCueV635>=Object.freeze({
  active:false,act:-1,pattern:0,opacity:0,speed:0,phase:0,ambientTint:0,floorTint:0,fogTrim:0,
});
const finite=(x:unknown):x is number=>typeof x==='number'&&Number.isFinite(x);
const clamp=(x:number,a:number,b:number)=>Math.max(a,Math.min(b,x));
const smooth=(x:number)=>{const y=clamp(x,0,1);return y*y*(3-2*y);};
const round=(x:number)=>Math.round(x*100000)/100000;

export function planDynamicConcertStagesV635(input:DynamicConcertStagesInputV635):DynamicConcertStagesCueV635{
  const plan=input.narrative?.plan,cue=input.narrative?.cue,foundation=input.foundation;
  if(!input.visualsEnabled||!input.playing||!input.reactive||input.reducedMotion||input.tier==='low'||
    input.authored||input.blackout||!foundation?.active||!plan||!cue?.active||
    plan.source!=='verified-v600'||cue.source!=='verified-v600'||
    !input.trackId||plan.trackId!==input.trackId||!finite(input.positionMs)||
    !finite(input.durationMs)||input.durationMs!==plan.durationMs||
    input.positionMs<0||input.positionMs>=plan.durationMs||!Number.isInteger(cue.act)||
    cue.act<0||cue.act>=plan.acts.length||foundation.act!==cue.act||
    !finite(cue.transition)||cue.transition<=0||cue.transition>1||
    !finite(input.energy)||!finite(input.kick)||input.energy<0||input.energy>1||
    input.kick<0||input.kick>1||!Number.isInteger(input.groupCount)||
    input.groupCount<1||input.groupCount>4)return {...NEUTRAL_CONCERT_STAGES_V635};
  const act=plan.acts[cue.act];
  if(act.index!==cue.act||act.section!==input.section||act.chapter!==cue.chapter||
    act.motif!==cue.motif||act.repetition!==cue.repetition||
    !finite(act.startMs)||!finite(act.endMs)||act.endMs<=act.startMs||
    input.positionMs<act.startMs||input.positionMs>=act.endMs)return {...NEUTRAL_CONCERT_STAGES_V635};
  // Fade all LED pattern changes *through zero* at exact section boundaries.
  // An absent or non-contiguous neighboring act is never predicted.
  const length=act.endMs-act.startMs;
  const edge=Math.min(1650,length*.25);
  const enter=smooth((input.positionMs-act.startMs)/Math.max(1,edge));
  const leave=smooth((act.endMs-input.positionMs)/Math.max(1,edge));
  const boundary=Math.min(enter,leave)*cue.transition;
  const protectedText=input.lyricsProtected?.46:1;
  const face=input.vocalFocus?.68:1;
  const cast=input.groupCount>=4?.65:input.groupCount===3?.77:1;
  const tier=input.tier==='balanced'?.58:1;
  const guard=protectedText*face*cast*tier*boundary;
  const section=act.section;
  // Pattern encoding: quiet stripes / chorus grid / rising diagonals / restrained drops.
  const pattern:0|1|2|3=section==='verse'||section==='break'?0:
    section==='build'?2:section==='drop'?3:(act.repetition%2===0?1:0);
  const artisticBase=section==='break'?.22:section==='verse'?.34:section==='build'?.55:
    section==='drop'?.88:section==='hook'?.71:.28;
  const energy=clamp(input.energy,0,1);
  const musicalLift=section==='drop'&&input.kick>.58?.05*input.kick:0;
  const opacity=round(clamp((.038+artisticBase*.135+energy*.018+musicalLift)*guard,0,.19));
  const ambientTint=round(clamp((.014+artisticBase*.029)*guard,0,.043));
  const floorTint=round(clamp((.018+artisticBase*.041)*guard,0,.060));
  // Fog trim only *reduces* existing V308 fog; never removes an authored blackout.
  const fogTrim=round(clamp((section==='break'?0:.15*artisticBase)*guard,0,.14));
  const speed=round((section==='build'?.11:section==='drop'?.18:section==='hook'?.075:.025)*
    (input.tier==='balanced'?.60:1)*(input.lyricsProtected?.55:1));
  // Use confirmed playback time. Pauses and invalid evidence return a neutral cue.
  return {active:true,act:cue.act,pattern,opacity,speed,phase:round(input.positionMs/1000),
    ambientTint,floorTint,fogTrim};
}

/** Single fixed two-triangle plane, no textures/points/extra lights. */
export const LED_WALL_VERTEX_V635=`varying vec2 vUv; void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`;
export const LED_WALL_FRAGMENT_V635=`uniform vec3 uPrimary;uniform vec3 uSecondary;
uniform float uOpacity;uniform float uPattern;uniform float uPhase;uniform float uSpeed;
varying vec2 vUv;
void main(){
  vec2 c=fract(vUv*vec2(29.0,15.0))-0.5;
  float dotMask=1.0-smoothstep(0.24,0.46,length(c));
  float stripe=0.50+0.50*sin(vUv.x*25.0+uPhase*uSpeed);
  float grid=0.42+0.26*cos(vUv.y*17.0+uPhase*uSpeed);
  float diagonal=0.48+0.40*sin((vUv.x+vUv.y)*19.0-uPhase*uSpeed);
  float radial=0.45+0.30*cos(length(vUv-vec2(0.5))*23.0-uPhase*uSpeed);
  float signal=uPattern<0.5?stripe:uPattern<1.5?grid:uPattern<2.5?diagonal:radial;
  float vignette=smoothstep(0.0,0.18,vUv.y)*(1.0-smoothstep(0.84,1.0,vUv.y));
  vignette*=smoothstep(0.0,0.10,vUv.x)*(1.0-smoothstep(0.90,1.0,vUv.x));
  vec3 col=mix(uPrimary,uSecondary,clamp(vUv.x*0.72+signal*0.12,0.0,1.0));
  gl_FragColor=vec4(col,clamp(uOpacity*dotMask*(0.25+signal*0.55)*vignette,0.0,0.15));
}`;
