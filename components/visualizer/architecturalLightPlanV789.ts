/** V789: deterministic, single-batch architectural light installation.
 * All geometry is behind the cast. The score uses only existing confirmed
 * sections/scene intents and current playback; it never infers a vocalist.
 */
// Keep the pure geometry/score helper dependency-free for isolated typechecks.
// These are the canonical stage, section and V761 intent literals.
export type StageIdV789='classic'|'neon'|'festival'|'minimal'|'cyberpunk'|'vaporwave'|'galaxy'|'white'|'rock';
export type SectionV789='verse'|'hook'|'drop'|'build'|'break';
export type IntentV789='portrait'|'dialogue'|'ensemble'|'wide'|'rise'|'pulse'|'breath';

export interface ArchitectureBarV789 {
  x:number;y:number;z:number;angle:number;length:number;width:number;accent:boolean;
}
export type ArchitectureDesignV789 = 'halo'|'arena'|'proscenium'|'quiet';
export const ARCHITECTURE_MAX_BARS_V789=64;
export const architectureDesignV789=(stage:StageIdV789):ArchitectureDesignV789=>
  stage==='galaxy'?'halo':stage==='rock'?'arena':
  stage==='minimal'||stage==='white'?'quiet':'proscenium';

/** Static scene construction. Max 60 small bars, 1 instanced draw call. */
export function createArchitectureBarsV789(stage:StageIdV789):readonly ArchitectureBarV789[]{
  const bars:ArchitectureBarV789[]=[];
  const add=(x:number,y:number,z:number,angle:number,length:number,width:number,accent:boolean)=>{
    bars.push({x,y,z,angle,length,width,accent});
  };
  const design=architectureDesignV789(stage);
  if(design==='halo'){
    // A broken celestial halo; sparse dark gaps are intentional, not a solid circle.
    for(let i=0;i<48;i++){
      if(i%12===0)continue;
      const a=2*Math.PI*i/48;
      add(Math.cos(a)*2.54,.3+Math.sin(a)*2.54,-3.52,a,.25,.058,i%4===0);
    }
    for(const side of [-1,1])for(let i=0;i<6;i++)
      add(side*(3.15+i%2*.14),-1.34+i*.56,-3.24,side*.10,.26,.042,i%3===0);
  }else if(design==='arena'){
    // Stadium truss silhouette: chunky amber side ladders and offset roof lights.
    for(const side of [-1,1])for(let i=0;i<13;i++){
      add(side*(3.25+(i%3)*.09),-1.55+i*.33,-3.45,side*.13,.23,.08,i%3===0);
    }
    for(let i=0;i<22;i++)add(-3.06+i*.29,2.75+(i%3===0?.07:0),-3.55,
      Math.PI/2,.205,.085,i%4===0);
  }else{
    // Raised art-deco LED portal and side wings; never crosses the cast's face area.
    const quiet=design==='quiet';
    for(const side of [-1,1])for(let i=0;i<(quiet?9:15);i++){
      const y=-1.40+i*(quiet?.47:.29);
      add(side*(quiet?3.48:3.27)+side*.10*Math.sin(i*.7),y,-3.47,
        side*(quiet?.06:.12),quiet?.16:.23,quiet?.036:.065,i%4===0);
    }
    for(let i=0;i<(quiet?14:22);i++){
      const steps=quiet?14:22;
      add(-3.04+i*6.08/(steps-1),quiet?2.89:2.75,-3.51,
        Math.PI/2,quiet?.16:.20,quiet?.032:.06,i%4===0);
    }
    if(!quiet)for(const side of [-1,1])for(let i=0;i<4;i++)
      add(side*(2.92-i*.16),2.45-i*.26,-3.48,-side*.58,.31,.055,i===0);
  }
  return bars;
}
const clamp=(n:number,min=0,max=1)=>Math.min(max,Math.max(min,Number.isFinite(n)?n:min));
export interface ArchitectureCueInputV789 {
  playing:boolean;reactive:boolean;reducedMotion:boolean;
  section:SectionV789;intent?:IntentV789|null;
  energy:number;kick:number;playbackMs:number;lyricsProtected:boolean;
  blackout:boolean;manualLighting:boolean;lowTier:boolean;
  muted?:boolean;
}
export interface ArchitectureCueV789 {visible:boolean;opacity:number;scale:number;chase:number;}
export function planArchitectureCueV789(input:ArchitectureCueInputV789):ArchitectureCueV789{
  const off:ArchitectureCueV789={visible:false,opacity:0,scale:1,chase:0};
  if(input.blackout||input.lowTier||input.muted)return off;
  const playing=input.playing&&input.reactive;
  const energy=playing?clamp(input.energy):0;
  const kick=playing?clamp(input.kick):0;
  const intensity=input.section==='drop'?1:input.section==='hook'?.83:
    input.section==='build'?.67:input.section==='break'?.28:.48;
  const intent=playing&&!input.manualLighting&&!input.reducedMotion&&input.intent?
    (input.intent==='pulse'?1.14:input.intent==='rise'?1.1:input.intent==='breath'?.74:1):1;
  // Calm during lyrics; never produce flash/strobe or obscure the lead performer.
  const guard=input.lyricsProtected?.70:1;
  const base=playing?.20+.15*intensity*energy+.055*kick:.14;
  const opacity=clamp(base*intent*guard*(input.manualLighting?.50:1),0,.39);
  const scale=input.reducedMotion||input.manualLighting||!playing?1:1+.018*intensity*energy+.009*kick;
  const chase=input.reducedMotion||input.manualLighting||!playing||!Number.isFinite(input.playbackMs)?0:
    Math.sin(Math.max(0,input.playbackMs)/1400)*.5+.5;
  return {visible:opacity>.005,opacity,scale,chase};
}
