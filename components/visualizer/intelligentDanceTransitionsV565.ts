/** V565 – conservative section-aware crossfade refinement for *automatic* GLB dance clips.
 * Never selects clips/singers, changes choreography timestamps or touches mixer/IK state.
 * Music section is a hint only; measured onset must be provided explicitly.
 */
export type DanceSectionV565 = 'verse'|'hook'|'chorus'|'bridge'|'intro'|'outro'|'drop'|'unknown';
export type IntelligentTransitionV565 = Readonly<{
  enabled:boolean;fadeSeconds:number;kind:'original'|'verse'|'hook'|'onset'|'contact';
  usedMeasuredOnset:boolean;footGuard:boolean;
}>;
const clamp=(n:number,min:number,max:number)=>Math.max(min,Math.min(max,Number.isFinite(n)?n:min));
export function planIntelligentDanceTransitionV565(input:{
  baselineSeconds:number;section?:string|null;playing:boolean;reducedMotion:boolean;
  automatic:boolean;quality?:'low'|'balanced'|'high'|string;
  plantedLeft?:boolean;plantedRight?:boolean;
  kickOnset?:number;snareOnset?:number;matchScore?:number|null;
  outgoingSeconds?:number;outgoingDuration?:number;incomingDuration?:number;
}):IntelligentTransitionV565{
  const base=clamp(input.baselineSeconds,.08,1.5);
  const original: IntelligentTransitionV565={enabled:false,fadeSeconds:base,kind:'original',usedMeasuredOnset:false,footGuard:false};
  if(!input.automatic||!input.playing||input.reducedMotion||input.quality==='low'||
     !Number.isFinite(input.incomingDuration)||Number(input.incomingDuration)<=0||
     !Number.isFinite(input.outgoingDuration)||Number(input.outgoingDuration)<=0||
     !Number.isFinite(input.outgoingSeconds)||Number(input.outgoingSeconds)<0||
     Math.min(Number(input.incomingDuration),Number(input.outgoingDuration))<.22)return original;
  const planted=!!input.plantedLeft||!!input.plantedRight;
  const onset=Math.max(clamp(input.kickOnset??0,0,1),clamp(input.snareOnset??0,0,1));
  // Honor actual beat detector onsets; never synthesize beat positions from BPM.
  const measured=onset>=.28;
  const hook=/^(hook|chorus|refrain)$/i.test(input.section?.trim()??'');
  const verse=/^(verse|strophe|rap)$/i.test(input.section?.trim()??'');
  const multiplier=planted?1.15:measured?.92:hook?1.16:verse?1.07:1;
  // Poor matching needs more overlap, not an abrupt cut. Matching remains V537-owned.
  const score=typeof input.matchScore==='number'&&Number.isFinite(input.matchScore)?input.matchScore:null;
  const poseFactor=score!==null&&score>.7?1.12:1;
  const adjusted=clamp(base*multiplier*poseFactor,.10,1.15);
  // For tiny actions, the fade must not span an entire imported clip.
  const clipLimit=.45*Math.min(input.outgoingDuration!,input.incomingDuration!);
  const fade=clamp(Math.min(adjusted,clipLimit),.08,1.15);
  return {enabled:true,fadeSeconds:fade,kind:planted?'contact':measured?'onset':hook?'hook':verse?'verse':'original',
    usedMeasuredOnset:measured,footGuard:planted};
}
/** Fixed-duration A/B preview; simulated switches, *real* imported clip curves.
 * A deterministic clock avoids auxiliary schedulers and React state writes per frame.
 */
export function planEmbeddedMotionPreviewV565(seconds:number,clipCount:number,enabled:boolean,playing:boolean,reducedMotion:boolean){
  const valid=enabled&&playing&&!reducedMotion&&Number.isFinite(seconds)&&clipCount>=2;
  const segment=valid?Math.floor(Math.max(0,seconds)/3.5):0;
  return {active:valid,index:segment%2,segment,transitionSeconds:enabled?.58:.08} as const;
}
