/** V1078 – Natural Dance Intelligence 4.0.
 * A deterministic, opt-in additive phrase layer. It refines existing GLB
 * motion channels BEFORE the legacy V1024 phrase director and V839 Foot-IK.
 * Never creates foot targets, moves roots, changes clips or invents steps.
 */
export type NaturalDanceMotifV1078='sway'|'counterstep'|'bounce'|'release';
export type NaturalDanceInputV1078={
 enabled:boolean;strength:number;playing:boolean;reducedMotion:boolean;manualPriority:boolean;
 quality:'low'|'balanced'|'high'|string;qualityGain?:number|null;
 trackId?:string|null;seconds:number;bpm?:number|null;genre?:string|null;section?:string|null;
 energy?:number|null;beat?:number|null;snare?:number|null;
 slot:number;count:number;footIKEnabled:boolean;contactKnown:boolean;
 plantedLeft:boolean;plantedRight:boolean;
};
export type NaturalDanceMotionV1078={
 hipSway?:number;legGroove?:number;footStep?:number;weightShift?:number;
 shoulderRoll?:number;spineSway?:number;chestPulse?:number;
};
export type NaturalDanceCueV1078={active:boolean;reason:string;motif:NaturalDanceMotifV1078|null;
 hip:number;leg:number;step:number;weight:number;shoulder:number;spine:number;chest:number};
const finite=(n:unknown):n is number=>typeof n==='number'&&Number.isFinite(n);
const clamp=(n:number,low:number,high:number)=>Math.min(high,Math.max(low,n));
const rest=(reason:string):NaturalDanceCueV1078=>({active:false,reason,motif:null,
 hip:0,leg:0,step:0,weight:0,shoulder:0,spine:0,chest:0});
const motifs:readonly NaturalDanceMotifV1078[]=['sway','counterstep','bounce','release'];
const smooth=(v:number)=>{const t=clamp(v,0,1);return t*t*(3-2*t)};
/** Phrase-to-phrase ease uses the musical time, not a frame timer. Motif
 * changes crossfade at a boundary to avoid jerks during fast dance sections.
 */
function motifAt(beatCount:number,slot:number,section:string){
 const phrase=beatCount/8,index=Math.floor(phrase);
 const genreOffset=/hook|drop|finale/i.test(section)?2:/break|intro|interlude/i.test(section)?3:0;
 const pick=(i:number)=>motifs[((i+slot%2+genreOffset)%4+4)%4];
 const fraction=phrase-index;
 const blend=smooth((fraction-.88)/.12);
 return {motif:pick(index),next:pick(index+1),blend};
}
export function planNaturalDanceV1078(p:NaturalDanceInputV1078):NaturalDanceCueV1078{
 if(!p.enabled||!finite(p.strength)||p.strength<=0)return rest('disabled');
 if(!p.playing)return rest('paused');
 if(p.reducedMotion||p.quality==='low')return rest('motion-budget');
 if(p.manualPriority)return rest('manual');
 if(!p.footIKEnabled||!p.contactKnown)return rest('no-foot-evidence');
 if(!p.trackId?.trim()||p.trackId.length>160||!finite(p.seconds)||p.seconds<0||
  !finite(p.bpm)||p.bpm<55||p.bpm>240||!finite(p.energy)||!finite(p.beat)||!finite(p.snare)||
  !finite(p.qualityGain??1)||(p.qualityGain??1)<0||(p.qualityGain??1)>1||
  !Number.isInteger(p.slot)||p.slot<0||!Number.isInteger(p.count)||p.count<1||p.count>4||p.slot>=p.count)
  return rest('evidence');
 const section=p.section??'';
 if(!/intro|verse|strophe|hook|chorus|build|bridge|break|interlude|drop|outro|finale/i.test(section))return rest('section');
 const beatCount=p.seconds*p.bpm/60;
 const {motif,next,blend}=motifAt(beatCount,p.slot,section);
 const phase=beatCount*2*Math.PI;
 const wave=Math.sin(phase*.5+p.slot*.27),stepWave=Math.sin(phase+p.slot*.19);
 const upbeat=Math.max(0,Math.sin(phase));
 const energy=clamp(p.energy,0,1),beat=clamp(p.beat,0,1),snare=clamp(p.snare,0,1);
 const genre=/hardtekk|hardstyle|hardcore/i.test(p.genre??'')?1.08:
  /deutschrap|hip.?hop|trap|drill|\brap\b/i.test(p.genre??'')?.82:
  /rock|metal|punk/i.test(p.genre??'')?.91:.75;
 const sectionGain=/intro|outro|break|interlude|bridge/i.test(section)?.55:
  /hook|chorus|drop|finale/i.test(section)?1:.78;
 const intensity=clamp(p.strength/100,0,1)*(p.quality==='balanced'?.7:1)*
  (p.qualityGain??1)*genre*sectionGain*(.24+.46*energy+.22*beat+.08*snare);
 const motifGain=(m:NaturalDanceMotifV1078)=>m==='sway'?1:m==='counterstep'?.85:m==='bounce'?.75:.3;
 const gain=motifGain(motif)*(1-blend)+motifGain(next)*blend;
 const onePlanted=p.plantedLeft!==p.plantedRight,both=p.plantedLeft&&p.plantedRight;
 const hipGain=both?0:onePlanted?.24:1;
 const footGain=both||onePlanted?0:1;
 // Tiny accents on pre-existing rig channels. No new actual step, foot target,
 // translation, position or root pose. V839/IK remains authoritative.
 return {active:true,reason:'music',motif,
  hip:clamp(wave*.032*intensity*gain*hipGain,-.028,.028),
  leg:clamp(stepWave*.038*intensity*gain*footGain,-.036,.036),
  step:clamp(upbeat*.045*intensity*gain*footGain,0,.042),
  weight:clamp(wave*.031*intensity*gain*footGain,-.030,.030),
  shoulder:clamp((-wave*.038+snare*.010)*intensity,-.042,.042),
  spine:clamp((wave*.024-stepWave*.007)*intensity,-.027,.027),
  chest:clamp((beat*.018+Math.sin(phase*.25+p.slot*.2)*.01)*intensity,0,.026)};
}
/** Soft saturation: do not reduce a legacy channel already outside the
 * preferred range, and never amplify it farther away from the bound.
 */
function add(base:number|undefined,delta:number,limit:number):number{
 const current=base??0;
 if(!finite(current)||!finite(delta))return current;
 return delta>=0?current+Math.min(delta,Math.max(0,limit-current)):
  current+Math.max(delta,-Math.max(0,limit+current));
}
export function refineNaturalDanceV1078<T extends NaturalDanceMotionV1078>(
 base:T,input:NaturalDanceInputV1078):{motion:T;cue:NaturalDanceCueV1078}{
 const cue=planNaturalDanceV1078(input);
 if(!cue.active||Object.keys(base).some(k=>typeof (base as Record<string,unknown>)[k]==='number'&&
  !finite((base as Record<string,unknown>)[k])))return {motion:base,cue:rest(!cue.active?cue.reason:'invalid-base')};
 return {motion:{...base,
  hipSway:add(base.hipSway,cue.hip,.65),legGroove:add(base.legGroove,cue.leg,.65),
  footStep:add(base.footStep,cue.step,.65),weightShift:add(base.weightShift,cue.weight,.65),
  shoulderRoll:add(base.shoulderRoll,cue.shoulder,.65),spineSway:add(base.spineSway,cue.spine,.65),
  chestPulse:add(base.chestPulse,cue.chest,.65)} as T,cue};
}
