/** V587 – Expressive Dance & Footwork 5.0.
 * Pure finishing passes over existing, evidence-backed automatic dance targets.
 * Do not generate contacts, steps, root travel, new beats or animation clips.
 * The V492/V494 IK / grounding pipeline remains the only contact authority.
 */
import type {AdvancedFootworkOutputV486,FootSupportV486,FootworkSlotV486} from './advancedDanceFootworkV486';
import type {AvatarRigMotion} from './avatarRigController';

const clamp=(n:number,lo:number,hi:number)=>Math.max(lo,Math.min(hi,n));
const finite=(n:unknown):n is number=>typeof n==='number'&&Number.isFinite(n);
export type ExpressiveFootworkInputV587={
 seconds:number;cueSeconds:number;bpm?:number|null;genre?:string|null;section?:string|null;
 support:readonly FootSupportV486[];tier:'low'|'balanced'|'high';
};
/** Constrain swing within V524's existing target (never add a step).
 * This stateless pass intentionally uses the song clock; pause, seek and repeat
 * of a timestamp produce identical poses and never inherit stale contacts.
 */
export function refineExpressiveFootworkV587(base:AdvancedFootworkOutputV486,input:ExpressiveFootworkInputV587):AdvancedFootworkOutputV486{
 if(!base.active||input.tier==='low'||!finite(input.seconds)||!finite(input.cueSeconds)||
    input.cueSeconds<0||input.seconds<input.cueSeconds||base.slots.length>input.support.length||
    base.slots.length<3||base.slots.length>4||base.slots.some(s=>
     ![s.offsetX,s.offsetZ,s.liftLeft,s.liftRight,s.rootSpeed,s.weightShift].every(finite)))return base;
 const rap=/deutschrap|hip.?hop|trap|drill|\brap\b/i.test(input.genre??'');
 const hard=/hardstyle|hardtekk|hardcore|rawstyle/i.test(input.genre??'');
 const hook=/hook|chorus|refrain|drop/i.test(input.section??'');
 const dense=/dense|double|fast/i.test(input.section??'');
 // Without a measured BPM use only existing step amplitudes, not a synthetic beat.
 const cadence=finite(input.bpm)&&input.bpm>0?clamp(input.bpm/60,.75,3.5):null;
 const beats=cadence===null?null:(input.seconds-input.cueSeconds)*cadence;
 const softness=rap?.88:hard?.93:.91;
 const sectionGain=hook?1:dense?.86:.93;
 const tierGain=input.tier==='balanced'?.96:1;
 const slots=base.slots.map((s,i):FootworkSlotV486=>{
  const contact=input.support[i];
  const plantedL=contact.tracked&&contact.leftPlanted;
  const plantedR=contact.tracked&&contact.rightPlanted;
  // A slowly changing four-beat envelope (not individual kicks) supplies
  // reproducible variation between performers while avoiding boundary snaps.
  const phrase=beats===null?1:(.965+.035*Math.sin(Math.PI*.5*beats+i*1.7));
  const gain=clamp(softness*sectionGain*tierGain*phrase,.68,1);
  const left=plantedL?0:clamp(s.liftLeft,0,1)*gain;
  const right=plantedR?0:clamp(s.liftRight,0,1)*gain;
  const standGain=plantedL&&plantedR?.32:plantedL||plantedR?.68:.94;
  // Only reduce the earlier V524 center-of-mass sway; no new grounded offset.
  const weightShift=clamp(s.weightShift*standGain,-.014,.014);
  return {offsetX:s.offsetX,offsetZ:s.offsetZ,liftLeft:left,liftRight:right,
   rootSpeed:s.rootSpeed,weightShift};
 });
 return {active:base.active,slots};
}

export type ExpressiveRigInputV587={
 trackId?:string|null;seconds:number;playing:boolean;reducedMotion:boolean;
 manualPriority:boolean;contactKnown:boolean;plantedLeft:boolean;plantedRight:boolean;
 quality:'low'|'balanced'|'high'|string;genre?:string|null;section?:string|null;
};
/** Upper-body dynamics on already-available additive GLB channels only.
 * Existing shoulder/arm clips are never edited: only the automatic rig
 * controller's scalar targets are attenuated, with no separate IK solver.
 */
export function refineExpressiveRigV587<T extends AvatarRigMotion>(motion:T,input:ExpressiveRigInputV587):T{
 if(!input.trackId?.trim()||!finite(input.seconds)||input.seconds<0||!input.playing||
   input.reducedMotion||input.manualPriority||!input.contactKnown||input.quality==='low'||
   !finite(motion.armSwing)||!finite(motion.followThrough)||!finite(motion.hipSway)||
   !finite(motion.footStep)||!finite(motion.legGroove))return motion;
 const planted=Number(input.plantedLeft)+Number(input.plantedRight);
 const rap=/deutschrap|hip.?hop|trap|drill|\brap\b/i.test(input.genre??'');
 const hard=/hardstyle|hardtekk|hardcore|rawstyle/i.test(input.genre??'');
 const hook=/hook|chorus|refrain|drop/i.test(input.section??'');
 const stepEnergy=clamp(Math.abs(motion.footStep)*2+Math.abs(motion.legGroove),0,1);
 const swingGain=clamp((planted===2?.82:planted===1?.91:.96)+(hook?.035:0)+(hard?.025:rap?0:.012)*stepEnergy,.8,1);
 const followGain=clamp((planted===2?.78:.91)+(hook?.035:0)+(hard?.02:0)*stepEnergy,.75,1);
 const hipGain=planted===2?.92:1; // V545 has already constrained foot contact.
 // Never create an arm motion when the source is still; preserve all other keys,
 // notably foot IK, hips/root positioning, singer, facial & lyric channels.
 return {...motion,armSwing:motion.armSwing*swingGain,
   followThrough:motion.followThrough*followGain,
   hipSway:motion.hipSway*hipGain};
}
