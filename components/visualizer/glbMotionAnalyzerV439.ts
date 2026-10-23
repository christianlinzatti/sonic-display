/** V439: deterministic measurements from *actual* animation tracks, not GLB filenames.
 * Structural inputs permit pure offline tests; GLTFLoader lives in a lazy client adapter.
 * Approximate animation activity, NOT real-world dance quality, contacts or BPM. */
export type MeasuredSceneV439="verse"|"hook"|"reply"|"duet"|"build"|"drop"|"break";
export type KeyframeTrackV439={name:string;times:ArrayLike<number>;values:ArrayLike<number>;getValueSize:()=>number};
export type AnimationClipV439={name:string;duration:number;tracks:readonly KeyframeTrackV439[]};
export type MotionFeaturesV439={
  arms:number;legs:number;torso:number;speed:number;energy:number;loopability:number;
  confidence:number;duration:number;clipName:string;trackCount:number;recommended:MeasuredSceneV439[];
};
const clamp=(x:number)=>Math.min(1,Math.max(0,x));
const rnd=(x:number)=>Math.round(clamp(x)*1000)/1000;
function group(name:string):"arms"|"legs"|"torso"|null{
  const clean=name.toLowerCase().replace(/[^a-z0-9]/g,"");
  if(/(hand|wrist|finger|thumb|arm|elbow|shoulder|clavicle)/.test(clean))return "arms";
  if(/(thigh|leg|knee|calf|shin|ankle|foot|toe)/.test(clean))return "legs";
  if(/(spine|chest|hips|pelvis|torso|head|neck|waist|abdomen)/.test(clean))return "torso";
  return null;
}
function delta(v:ArrayLike<number>,a:number,b:number,size:number):number{
  if(size===4){
    let dot=0,n1=0,n2=0;
    for(let k=0;k<4;k++){
      const x=v[a+k],y=v[b+k];if(!Number.isFinite(x)||!Number.isFinite(y))return NaN;
      dot+=x*y;n1+=x*x;n2+=y*y;
    }
    if(n1<1e-8||n2<1e-8)return NaN;
    return 2*Math.acos(clamp(Math.abs(dot/Math.sqrt(n1*n2))));
  }
  let sq=0;
  for(let k=0;k<3;k++){
    const x=v[a+k],y=v[b+k];if(!Number.isFinite(x)||!Number.isFinite(y))return NaN;
    sq+=(x-y)**2;
  }
  return Math.sqrt(sq)*3.5;
}
/** Cap tracks/segments to keep maliciously large imports bounded on the main thread. */
export function analyzeAnimationClipV439(clip:AnimationClipV439):MotionFeaturesV439|null{
  if(!clip||!Number.isFinite(clip.duration)||clip.duration<.08||clip.duration>360||!Array.isArray(clip.tracks))return null;
  const totals={arms:0,legs:0,torso:0};
  const counts={arms:0,legs:0,torso:0};
  let loopSum=0,loopCount=0,events=0;
  for(const track of clip.tracks.slice(0,120)){
    if(!track||typeof track.name!=="string"||!/(?:quaternion|position)$/i.test(track.name))continue;
    const key=group(track.name);if(!key||!track.times||!track.values||typeof track.getValueSize!=="function")continue;
    const size=track.getValueSize();if(size!==3&&size!==4)continue;
    const count=Math.min(track.times.length,Math.floor(track.values.length/size));
    if(count<2)continue;
    let sum=0,valid=0;
    const step=Math.max(1,Math.ceil((count-1)/96));
    for(let i=step;i<count;i+=step){
      const before=i-step,dt=track.times[i]-track.times[before];
      if(!Number.isFinite(dt)||dt<1e-4||dt>clip.duration+1)continue;
      const mag=delta(track.values,before*size,i*size,size);
      if(!Number.isFinite(mag))continue;
      sum+=clamp(mag/Math.max(.12,dt)*.30);valid++;
    }
    if(!valid)continue;
    totals[key]+=sum/valid;counts[key]++;events+=valid;
    const gap=delta(track.values,0,(count-1)*size,size);
    if(Number.isFinite(gap)){loopSum+=1-clamp(gap/1.3);loopCount++;}
  }
  const evidence=counts.arms+counts.legs+counts.torso;
  if(!evidence||!events)return null;
  const arms=counts.arms?totals.arms/counts.arms:0;
  const legs=counts.legs?totals.legs/counts.legs:0;
  const torso=counts.torso?totals.torso/counts.torso:0;
  const speed=clamp(.38*arms+.42*legs+.20*torso);
  const energy=clamp(.42*arms+.43*legs+.15*torso);
  const loopability=loopCount?loopSum/loopCount:0;
  const confidence=clamp((Math.min(6,evidence)/6)*.76+(counts.arms>0&&counts.legs>0?.18:0)+(counts.torso>0?.06:0));
  const recommended:MeasuredSceneV439[]=energy>.68?["hook","drop"]:energy<.22?["break","verse"]:
    legs>.43&&arms>.35?["hook","verse","duet"]:arms>legs*1.35?["reply","verse","duet"]:["verse","hook"];
  return {arms:rnd(arms),legs:rnd(legs),torso:rnd(torso),speed:rnd(speed),energy:rnd(energy),
    loopability:rnd(loopability),confidence:rnd(confidence),duration:Math.round(clip.duration*100)/100,
    clipName:clip.name.slice(0,100),trackCount:evidence,recommended};
}
export function analyzeMotionClipsV439(clips:readonly AnimationClipV439[]):MotionFeaturesV439|null{
  // External GLB playback starts with the first clip. Do not mix different clips
  // into an imaginary choreography or claim an entire file represents one dance.
  for(const clip of clips.slice(0,16)){
    const measured=analyzeAnimationClipV439(clip);
    if(measured)return measured;
  }
  return null;
}
