/** V738 Hip Motion Studio: shared live-stage and preview runtime.
 * Pure temporal blend of V735 bounded rig poses. No GLB writes or secondary IK.
 */
import {normalizeHipDanceV735,resolveHipDanceModeV735,sampleHipDanceV735,
 type HipDanceChannelsV735,type HipDanceInputV735,type HipDanceModeV735} from './hipDanceV735';

export type HipRhythmV738='half'|'normal'|'double';
export type HipStudioSettingsV738={
 transitionSeconds:number; swayStrength:number;circleStrength:number;bounceStrength:number;
 rhythm:HipRhythmV738;
};
export const DEFAULT_HIP_STUDIO_V738:Readonly<HipStudioSettingsV738>={
 transitionSeconds:.4,swayStrength:100,circleStrength:100,bounceStrength:100,rhythm:'normal'
};
const keys=['hipPitch','hipRoll','hipLateral','hipVertical','spineCounter','kneeCounter','ankleCounter'] as const;
const zero=():HipDanceChannelsV735=>({hipPitch:0,hipRoll:0,hipLateral:0,hipVertical:0,
 spineCounter:0,kneeCounter:0,ankleCounter:0});
const finite=(n:unknown):n is number=>typeof n==='number'&&Number.isFinite(n);
const bound=(n:number,low:number,high:number)=>Math.max(low,Math.min(high,n));
export function normalizeHipStudioV738(raw:Partial<HipStudioSettingsV738>|null|undefined):HipStudioSettingsV738{
 const n=(key:'swayStrength'|'circleStrength'|'bounceStrength')=>finite(raw?.[key])?Math.round(bound(raw![key]!,0,150)):100;
 return {transitionSeconds:finite(raw?.transitionSeconds)?Math.round(bound(raw.transitionSeconds,.1,1.5)*100)/100:.4,
   swayStrength:n('swayStrength'),circleStrength:n('circleStrength'),bounceStrength:n('bounceStrength'),
   rhythm:raw?.rhythm==='half'||raw?.rhythm==='double'?raw.rhythm:'normal'};
}
export type HipStudioStateV738={mode:HipDanceModeV735|null;from:HipDanceChannelsV735;
 pose:HipDanceChannelsV735;blendElapsed:number;lastSeconds:number|null;trackId:string|null};
export const createHipStudioStateV738=():HipStudioStateV738=>({mode:null,from:zero(),pose:zero(),
 blendElapsed:0,lastSeconds:null,trackId:null});
export function resetHipStudioV738(s:HipStudioStateV738):void{
 s.mode=null;s.from=zero();s.pose=zero();s.blendElapsed=0;s.lastSeconds=null;s.trackId=null;
}
export type HipStudioInputV738=HipDanceInputV735&{
 delta:number;trackId?:string|null;studio?:Partial<HipStudioSettingsV738>|null;
};
export type HipStudioOutputV738={pose:HipDanceChannelsV735;mode:HipDanceModeV735;
 blend:number;effectiveStrength:number};
/** The incoming song clock is the phase source. A mode change crossfades from
 * the LAST visible pose, so rapid switches do not introduce C0 jumps.
 * Manual overrides, paused/reduced motion, lost clock, and seeks hard-reset.
 */
export function sampleHipStudioV738(s:HipStudioStateV738,input:HipStudioInputV738):HipStudioOutputV738{
 const studio=normalizeHipStudioV738(input.studio);
 const settings=normalizeHipDanceV735(input.settings);
 const inactive=!input.playing||input.reducedMotion||input.manualPriority||settings.mode==='off'||
  settings.strength===0||!finite(input.seconds)||input.seconds<0;
 if(inactive){resetHipStudioV738(s);return {pose:zero(),mode:'off',blend:1,effectiveStrength:0};}
 const changedTrack=s.trackId!==null&&(input.trackId??'')!==s.trackId;
 const jumped=s.lastSeconds!==null&&(input.seconds<s.lastSeconds-.18||input.seconds-s.lastSeconds>2.5);
 if(changedTrack||jumped)resetHipStudioV738(s);
 s.trackId=input.trackId??'';s.lastSeconds=input.seconds;
 const mode=resolveHipDanceModeV735({...input,settings});
 const strengthMultiplier=mode==='Hip_Sway'?studio.swayStrength:mode==='Hip_Circle'?studio.circleStrength:studio.bounceStrength;
 const effectiveStrength=bound(settings.strength*strengthMultiplier/100,0,100);
 const tempoRatio=studio.rhythm==='half'?.5:studio.rhythm==='double'?2:1;
 // Multiply the safely bounded song time for beat subdivisions; the V735
 // sampler caps its phase and never directly moves the stage root.
 const pose=sampleHipDanceV735({...input,settings:{...settings,mode,strength:effectiveStrength},
  seconds:(input.seconds%86400)*tempoRatio});
 if(s.mode!==mode){s.from={...s.pose};s.mode=mode;s.blendElapsed=0;}
 s.blendElapsed=Math.min(studio.transitionSeconds,s.blendElapsed+bound(finite(input.delta)?input.delta:0,0,.1));
 const progress=bound(s.blendElapsed/studio.transitionSeconds,0,1);
 const blend=progress*progress*(3-2*progress); // C1 ease-in/out
 const mixed=zero();
 for(const key of keys)mixed[key]=(s.from[key]??0)*(1-blend)+(pose[key]??0)*blend;
 // Preserve hard support constraints even halfway through a blend. Old frames
 // may have been sampled without IK or during a free/swing leg phase.
 if(!input.footIKEnabled||!input.contactKnown){mixed.hipLateral=0;mixed.hipVertical=0;}
 if(input.plantedLeft||input.plantedRight)mixed.ankleCounter=0;
 s.pose=mixed;
 return {pose:{...mixed},mode,blend,effectiveStrength:effectiveStrength/100};
}
