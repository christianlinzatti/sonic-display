/** V1061 – Natural Avatar Motion 3.0.
 * Deterministic, additive upper-body & rotational pelvis accents only.
 * No new clock, clip, foot targets, bone traversal, device I/O or root motion.
 */
// Structural typing avoids loading the Three.js rig in the dependency-free planner.
export type MotionChannelsV1061={hipSway:number;shoulderRoll:number;spineSway:number;chestPulse:number};
export type NaturalMotionInputV1061={
 enabled:boolean;strength:number;playing:boolean;reducedMotion:boolean;manualPriority:boolean;
 quality:'low'|'balanced'|'high'|string;trackId?:string|null;
 seconds:number;bpm?:number|null;energy?:number|null;beat?:number|null;snare?:number|null;
 genre?:string|null;section?:string|null;slot:number;
 footIKEnabled:boolean;contactKnown:boolean;plantedLeft:boolean;plantedRight:boolean;
};
export type NaturalMotionCueV1061={active:boolean;reason:string;hip:number;shoulder:number;spine:number;chest:number};
const finite=(v:unknown):v is number=>typeof v==='number'&&Number.isFinite(v);
const clamp=(v:number,min:number,max:number)=>Math.max(min,Math.min(max,v));
export const IDLE_MOTION_V1061:NaturalMotionCueV1061=Object.freeze({active:false,reason:'inactive',hip:0,shoulder:0,spine:0,chest:0});
export function planNaturalMotionV1061(p:NaturalMotionInputV1061):NaturalMotionCueV1061{
 const reject=(reason:string):NaturalMotionCueV1061=>({...IDLE_MOTION_V1061,reason});
 if(!p.enabled||!finite(p.strength)||p.strength<=0)return reject('disabled');
 if(!p.playing)return reject('paused');
 if(p.reducedMotion||p.quality==='low')return reject('motion-budget');
 if(p.manualPriority)return reject('manual');
 if(!p.trackId?.trim()||!finite(p.seconds)||p.seconds<0||!finite(p.bpm)||p.bpm<45||p.bpm>240)return reject('evidence');
 if(!finite(p.slot)||p.slot<0||p.slot>8||!finite(p.energy)||!finite(p.beat)||!finite(p.snare))return reject('evidence');
 const strength=clamp(p.strength/100,0,1),energy=clamp(p.energy,0,1),beat=clamp(p.beat,0,1),snare=clamp(p.snare,0,1);
 const lowKey=/hardtekk|hardstyle|hardcore|rawstyle/i.test(p.genre??'');
 const rap=/deutschrap|hip.?hop|trap|drill|\brap\b/i.test(p.genre??'');
 const rock=/rock|metal|punk/i.test(p.genre??'');
 const rate=lowKey?1.7:rap?.68:rock?.91:1.05;
 // Song-time modulation uses observed tempo only; this is not a claimed beat grid.
 const phase=p.seconds*p.bpm/60*2*Math.PI;
 const lane=clamp(Math.trunc(p.slot),0,8)*.31;
 const wave=Math.sin(phase*rate*.25+lane),counter=Math.sin(phase*rate*.25+lane+1.8);
 const amplitude=strength*(.28+.52*energy+.14*beat+.06*snare);
 const sectionGain=/hook|drop|finale|chorus/i.test(p.section??'')?1.1:/intro|outro|interlude/i.test(p.section??'')?.70:1;
 const motion=amplitude*sectionGain;
 // With both feet planted or missing IK evidence, pelvis motion is zero;
 // with one foot planted, only a tiny rotational accent remains.
 const hipGain=!p.footIKEnabled||!p.contactKnown||p.plantedLeft&&p.plantedRight?0:
  p.plantedLeft||p.plantedRight?.20:.65;
 const hip=clamp(wave*.055*motion*hipGain,-.036,.036);
 const shoulder=clamp((counter*.07+snare*.012)*motion,-.075,.075);
 const spine=clamp((-wave*.037+counter*.012)*motion,-.045,.045);
 const chest=clamp((Math.sin(phase*rate*.125+lane)*.025+beat*.008)*motion,-.035,.035);
 return {active:true,reason:'music',hip,shoulder,spine,chest};
}
export function overlayNaturalMotionV1061<T extends MotionChannelsV1061>(base:T,cue:NaturalMotionCueV1061):T{
 if(!cue.active)return base;
 return {...base,
  hipSway:clamp(base.hipSway+cue.hip,-.65,.65),
  shoulderRoll:clamp(base.shoulderRoll+cue.shoulder,-.65,.65),
  spineSway:clamp(base.spineSway+cue.spine,-.65,.65),
  chestPulse:clamp(base.chestPulse+cue.chest,-.65,.65)};
}
