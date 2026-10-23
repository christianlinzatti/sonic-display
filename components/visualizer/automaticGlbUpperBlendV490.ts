/** V490: conservative, opt-in-by-automatic-low-pose upper-body GLB layering.
 * Keeps hips, legs, root, head, neck, morph and translation channels under
 * the original animation/foot IK/vocal controllers. No mutation of GLB clips. */
export type GestureClipV490={name:string;duration:number;tracks:readonly {name:string}[]};
export type UpperBlendInputV490={
  playing:boolean;reducedMotion:boolean;manualPriority:boolean;activeLowPose:boolean;
  quality:string;energy:number;genre:string|null|undefined;section:string|null|undefined;
  plantedLeft:boolean;plantedRight:boolean;
};
const clamp=(n:number,a:number,b:number)=>Math.min(b,Math.max(a,n));
/** Filter ONLY local rotation tracks on safe arm/chest bones.
 * Do not touch feet or the head needed for vocals/lip sync. */
export function safeUpperGestureTrackV490(path:string):boolean{
  if(typeof path!=='string'||!/\.(quaternion|rotation)$/i.test(path))return false;
  const raw=(path.split('.')[0].split(/[\/|]/).pop()||'').toLowerCase().replace(/[^a-z0-9]/g,'')
    .replace(/^(mixamorig|armature|bip001|bip01|valvebiped)/,'');
  if(/(root|hips|pelvis|leg|thigh|calf|shin|foot|ankle|toe|neck|head|jaw|eye|face|finger|thumb|index|middle|ring|pinky|wrist|hand|morph|blendshape)/.test(raw))return false;
  return /(?:shoulder|clavicle|collar|upperarm|lowerarm|forearm|arm|spine|chest)/.test(raw);
}
const candidateLabel=(name:string)=>/(?:gesture|rap|point|wave|talk|cheer|freestyle|arm|upper|dance|hip.?hop)/i.test(name)
  && !/(?:squat|kneel|crouch|hock|idle|rest|walk|run|low.?pose|v490)/i.test(name);
/** Only layer existing matching clips with at least one arm and another safe joint.
 * Stable tie-break: genre-relevant gestures, more usable joints, original order. */
export function chooseUpperGestureClipV490<T extends GestureClipV490>(clips:readonly T[],genre:string|null|undefined):T|null{
  let best:T|null=null,score=-Infinity;
  const rap=/rap|hip.?hop|trap|drill/i.test(genre||'');
  for(const clip of clips){
    if(!candidateLabel(clip.name)||!Number.isFinite(clip.duration)||clip.duration<.25)continue;
    const selected=clip.tracks.map(t=>t.name).filter(safeUpperGestureTrackV490);
    const arm=selected.filter(n=>{const last=n.split('.')[0].split(/[\\/|]/).pop()||'';return /(?:arm|shoulder|clavicle|collar)/i.test(last);}).length;
    if(selected.length<2||arm<1)continue;
    const value=(/gesture|point|wave|arm/i.test(clip.name)?4:0)+
      (rap&&/rap|hip.?hop|trap|drill/i.test(clip.name)?4:!rap&&/rap|hip.?hop|trap|drill/i.test(clip.name)?-2:0)+
      (!rap&&/dance|freestyle/i.test(clip.name)?2:0)+Math.min(selected.length,7)*.1;
    if(value>score){score=value;best=clip;}
  }
  return best;
}
/** Conservative layer strength. Never writes to a skeleton or mixer. */
export function planUpperBlendV490(input:UpperBlendInputV490):number{
  if(!input.playing||input.reducedMotion||input.manualPriority||!input.activeLowPose||input.quality==='low')return 0;
  const energy=Number.isFinite(input.energy)?clamp(input.energy,0,1):0;
  const rap=/rap|hip.?hop|trap|drill/i.test(input.genre||'');
  const hard=/hardstyle|hardtekk|hardcore/i.test(input.genre||'');
  const accent=input.section==='drop'?.08:input.section==='hook'?.035:0;
  const target=clamp((rap?.14:hard?.17:.11)+energy*.12+accent,.08,.32);
  const support=input.plantedLeft&&input.plantedRight?.80:input.plantedLeft||input.plantedRight?.90:1;
  const quality=input.quality==='balanced'?.82:1;
  return Math.min(.32,target*support*quality);
}
