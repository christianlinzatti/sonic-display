/** V647 – genre-led architectural motifs in the EXISTING V635 LED plane.
 * No new stage assets, timers, meshes, lights, or unverified music-structure claims.
 */
import type {StageTransformationContextV622} from './dynamicStageTransformationV622';
import type {DynamicConcertStagesCueV635} from './dynamicConcertStagesV635';

export type ConcertEnvironmentNameV647='concrete-warehouse'|'festival-truss'|
  'rave-tunnel'|'amplifier-wall'|'prism-studio'|'neon-vault';
export type ConcertEnvironmentCueV647={active:boolean;act:number;name:ConcertEnvironmentNameV647|null;
  style:0|1|2|3|4|5;variation:0|1|2;architecture:number;depth:number;motion:number;};
export type ConcertEnvironmentInputV647=StageTransformationContextV622 & {
  base:DynamicConcertStagesCueV635;visualsEnabled:boolean;groupCount:number;
};
export const NEUTRAL_CONCERT_ENVIRONMENT_V647:Readonly<ConcertEnvironmentCueV647>=Object.freeze({
  active:false,act:-1,name:null,style:0,variation:0,architecture:0,depth:0,motion:0,
});
const finite=(v:unknown):v is number=>typeof v==='number'&&Number.isFinite(v);
const cap=(v:number,a:number,b:number)=>Math.max(a,Math.min(b,v));
const round=(v:number)=>Math.round(v*100000)/100000;
const byGenre:Record<string,{name:ConcertEnvironmentNameV647;style:0|1|2|3|4|5}>={
  deutschrap:{name:'concrete-warehouse',style:0},
  hardstyle:{name:'festival-truss',style:1},
  hardtekk:{name:'rave-tunnel',style:2},
  rock:{name:'amplifier-wall',style:3},
  pop:{name:'prism-studio',style:4},
  electronic:{name:'neon-vault',style:5},
};
/** Closed-form, seek-stable, song-scoped director; V635's verified stage is authoritative. */
export function planCinematicStageEnvironmentV647(input:ConcertEnvironmentInputV647):ConcertEnvironmentCueV647{
  const plan=input.narrative?.plan,cue=input.narrative?.cue,b=input.base;
  const selected=typeof input.genre==='string'?byGenre[input.genre.trim().toLowerCase()]:undefined;
  if(!selected||!input.visualsEnabled||!input.playing||!input.reactive||input.reducedMotion||
    input.tier==='low'||input.authored||input.blackout||!plan||!cue?.active||
    plan.source!=='verified-v600'||cue.source!=='verified-v600'||
    !input.trackId||plan.trackId!==input.trackId||input.durationMs!==plan.durationMs||
    !finite(input.positionMs)||!finite(input.durationMs)||input.positionMs<0||
    input.positionMs>=input.durationMs||!b?.active||!Number.isInteger(b.act)||
    b.act!==cue.act||!Number.isInteger(cue.act)||cue.act<0||cue.act>=plan.acts.length||
    !Number.isInteger(input.groupCount)||input.groupCount<1||input.groupCount>4||
    !finite(b.opacity)||b.opacity<0||b.opacity>.19||!finite(b.speed)||b.speed<0||b.speed>.18||
    !finite(b.phase)||!finite(cue.transition)||cue.transition<=0||cue.transition>1)
    return {...NEUTRAL_CONCERT_ENVIRONMENT_V647};
  const act=plan.acts[cue.act];
  if(!act||act.index!==cue.act||act.section!==input.section||
    act.chapter!==cue.chapter||act.motif!==cue.motif||act.repetition!==cue.repetition||
    !Number.isInteger(act.repetition)||act.repetition<0||act.repetition>1024||
    !finite(act.startMs)||!finite(act.endMs)||act.endMs<=act.startMs||
    input.positionMs<act.startMs||input.positionMs>=act.endMs||
    Math.abs(b.phase-input.positionMs/1000)>.000011)
    return {...NEUTRAL_CONCERT_ENVIRONMENT_V647};
  // The same verified section/boundary gain as V635 gates ALL environment motifs.
  // No motion or brightness in unverified / inactive / blackout / edited passages.
  const envelope=cap(b.opacity/.19,0,1);
  const sectionGain=act.section==='break'?.24:act.section==='verse'?.42:
    act.section==='build'?.68:act.section==='drop'?.96:act.section==='hook'?.79:.36;
  const lyricGuard=input.lyricsProtected?.44:1;
  const portraitGuard=input.vocalFocus?.65:1;
  const groupGuard=input.groupCount===4?.74:input.groupCount===3?.84:1;
  const deviceGuard=input.tier==='balanced'?.54:1;
  const accent=envelope*lyricGuard*portraitGuard*groupGuard*deviceGuard;
  const variation=(act.repetition+Math.floor(act.index/3))%3 as 0|1|2;
  return {active:true,act:cue.act,name:selected.name,style:selected.style,variation,
    architecture:round(cap((.34+sectionGain*.40)*accent,0,.72)),
    depth:round(cap((.19+sectionGain*.47)*accent,0,.64)),
    // The existing V635 playback phase advances this motion. No independent clock.
    motion:round(cap((act.section==='drop'?.24:act.section==='build'?.17:.065)*accent,0,.24))};
}

/** Only replaces the shader of the EXISTING V635 two-triangle back-wall plane.
 * Style is a uniform; no new mesh, texture, postprocessing or offscreen pass.
 * Rounded bands and vignettes deliberately leave the centre dim for singers.
 */
export const LED_WALL_FRAGMENT_V647=`uniform vec3 uPrimary;uniform vec3 uSecondary;
uniform float uOpacity;uniform float uPattern;uniform float uPhase;uniform float uSpeed;
uniform float uSceneStyle;uniform float uVariation;uniform float uArchitecture;
uniform float uDepth;uniform float uMotion;
varying vec2 vUv;
float band(float x,float w){return 1.0-smoothstep(w,w+0.018,abs(x));}
void main(){
  vec2 c=fract(vUv*vec2(29.0,15.0))-0.5;
  float dotMask=1.0-smoothstep(0.24,0.46,length(c));
  float t=uPhase*uSpeed;
  float stripe=0.50+0.50*sin(vUv.x*25.0+t);
  float grid=0.42+0.26*cos(vUv.y*17.0+t);
  float diagonal=0.48+0.40*sin((vUv.x+vUv.y)*19.0-t);
  float radial=0.45+0.30*cos(length(vUv-vec2(0.5))*23.0-t);
  float signal=uPattern<0.5?stripe:uPattern<1.5?grid:uPattern<2.5?diagonal:radial;
  // Floor-to-ceiling architecture stays at the stage perimeter, never the singer's face.
  vec2 p=(vUv-vec2(.5))*2.0;
  float rim=max(smoothstep(.22,.9,abs(p.x)),smoothstep(.34,.96,abs(p.y)));
  float architectural=0.0;
  float shift=uVariation*.16+uMotion*sin(t*.38)*.12;
  if(uSceneStyle<.5){
    // Deutschrap: concrete warehouse pillars and low industrial horizontals.
    architectural=.56*band(fract((vUv.x+shift)*5.0)-.5,.07)+
      .35*band(fract(vUv.y*4.0)-.5,.035);
  } else if(uSceneStyle<1.5){
    // Hardstyle: festival-truss diagonals and stage roof.
    architectural=.54*band(fract((vUv.x+vUv.y*.49+shift)*6.0)-.5,.048)+
      .49*band(fract((vUv.x-vUv.y*.49)*6.0)-.5,.045);
  } else if(uSceneStyle<2.5){
    // Hardtekk: vanishing-box tunnel with restrained apparent depth.
    float frame=max(abs(p.x),abs(p.y)*.9);
    architectural=.82*band(fract(frame*4.5-shift)-.5,.10);
  } else if(uSceneStyle<3.5){
    // Rock: amplifier-cabinet blocks and speaker rings.
    vec2 cell=fract(vUv*vec2(6.0,3.0))-.5;
    architectural=.7*band(max(abs(cell.x),abs(cell.y))-.40,.036)+
      .37*band(length(cell)-.24,.048);
  } else if(uSceneStyle<4.5){
    // Pop: prismatic stage facets.
    architectural=.52*band(fract((vUv.x+vUv.y*.58+shift)*5.0)-.5,.05)+
      .40*band(fract((vUv.x-vUv.y*.58-shift)*5.0)-.5,.04);
  } else {
    // Electronic/fallback: rectangular neon vault outlines.
    architectural=.72*band(fract(max(abs(p.x),abs(p.y)) *5.0-shift)-.5,.065);
  }
  float vignette=smoothstep(0.0,0.18,vUv.y)*(1.0-smoothstep(0.84,1.0,vUv.y));
  vignette*=smoothstep(0.0,0.10,vUv.x)*(1.0-smoothstep(0.90,1.0,vUv.x));
  float art=clamp(architectural,0.0,1.0)*rim;
  float backdrop=mix(dotMask*(.25+signal*.55),
    dotMask*(.20+signal*.27)+art*(.43+uDepth*.34),clamp(uArchitecture,0.0,.72));
  vec3 col=mix(uPrimary,uSecondary,clamp(vUv.x*.72+signal*.12+art*uDepth*.08,0.0,1.0));
  gl_FragColor=vec4(col,clamp(uOpacity*backdrop*vignette,0.0,.15));
}`;
