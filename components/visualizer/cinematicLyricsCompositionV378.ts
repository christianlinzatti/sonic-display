import type {Lyrics} from "@/types/music";
import type {CameraPose} from "./stageCameraPoseHelpersV289";
import type {DuetCameraPlanV377} from "./cinematicDuetCameraV377";
import type {StageSection} from "./stageDirectorV287";

/** Visual framing signals only. No phoneme/speaker identification or fabricated timestamps. */
export type CinematicLyricsModeV378="off"|"readable"|"cinematic";
export type CinematicLyricsShotV378="none"|"balanced"|"face"|"duet"|"group"|"lyrics";
export type CinematicLyricsPlanV378={
  active:boolean; shot:CinematicLyricsShotV378; side:"left"|"right"|null;
  strength:number; lineIndex:number; timed:boolean; reason:"off"|"inactive"|"readability"|"duet"|"hook"|"phrase-end";
};
const clamp=(n:number,low:number,high:number)=>Number.isFinite(n)?Math.max(low,Math.min(high,n)):low;
const inactive=(why:"off"|"inactive"):CinematicLyricsPlanV378=>({active:false,shot:"none",side:null,strength:0,lineIndex:-1,timed:false,reason:why});
/**
 * Camera shots are chosen from existing lyrics timestamps, section and V377 visual roles.
 * An emphasized phrase end is a deterministic editorial cue, never a claim about song meaning.
 */
export function planCinematicLyricsV378({mode="off",strength=70,playing,lyricsVisible=false,side=null,lyrics,progressMs,
  reducedMotion=false,manualPriority=false,section="verse",duet=null}: {
  mode?:CinematicLyricsModeV378;strength?:number;playing:boolean;lyricsVisible?:boolean;
  side?:"left"|"right"|null;lyrics?:Lyrics|null;progressMs:number;
  reducedMotion?:boolean;manualPriority?:boolean;section?:StageSection;duet?:DuetCameraPlanV377|null;
}):CinematicLyricsPlanV378 {
  if(mode==="off")return inactive("off");
  if(!playing||reducedMotion||manualPriority||!lyricsVisible||!side||!lyrics?.synced||
    !Number.isFinite(progressMs)||progressMs<0||!lyrics.lines.length||clamp(strength,0,100)===0)return inactive("inactive");
  const i=lyrics.lines.findIndex((l,j)=>{
    if(!Number.isFinite(l.startMs)||l.startMs<0||progressMs<l.startMs)return false;
    const next=lyrics.lines[j+1];
    const end=l.endMs!==null&&Number.isFinite(l.endMs)&&l.endMs>l.startMs?l.endMs:
      next&&next.startMs>l.startMs?next.startMs:null;
    return end!==null && progressMs<end;
  });
  // No imaginary active line in instrumental passages or beyond last valid line.
  if(i<0)return inactive("inactive");
  const line=lyrics.lines[i];
  const next=lyrics.lines[i+1];
  const end=line.endMs!==null&&Number.isFinite(line.endMs)&&line.endMs>line.startMs?line.endMs:
    next&&next.startMs>line.startMs?next.startMs:line.startMs+3200;
  const wordTimed=Boolean(line.words?.some(w=>Number.isFinite(w.startMs)&&w.startMs>=line.startMs&&w.startMs<end));
  const gain=clamp(strength/100,0,1)*(mode==="readable"?.65:1);
  const base={active:true,side,strength:gain,lineIndex:i,timed:wordTimed} as const;
  if(section==="hook"||section==="drop")return {...base,shot:"group",reason:"hook"};
  if(duet?.active&&duet.shot==="two-shot")return {...base,shot:"duet",reason:"duet"};
  // Restrict editorial lyric emphasis to a phrase-ending line and genuine word markers.
  // Once in a four-line phrase, during the final quarter of that line, avoiding cuts per word.
  const phraseEnding=i%4===3 && wordTimed && (end-line.startMs>=650) && progressMs>=end-(end-line.startMs)*.26;
  if(mode==="cinematic"&&phraseEnding)return {...base,shot:"lyrics",reason:"phrase-end"};
  return {...base,shot:duet?.active&&duet.shot==="lead"?"face":"balanced",reason:"readability"};
}

/** Additive changes after automatic camera/director cues; output stays bounded and is never saved as a preset. */
export function composeCinematicLyricsCameraV378(pose:CameraPose,plan:CinematicLyricsPlanV378):CameraPose {
  if(!plan.active||plan.side===null)return pose;
  const strength=clamp(plan.strength,0,1);
  const dir=plan.side==="right"?1:-1;
  const isTextShot=plan.shot==="lyrics";
  const isWide=plan.shot==="group"||plan.shot==="duet";
  const lateral=dir*(isTextShot?.49:isWide?.21:.37)*strength;
  const zGain=(isTextShot?.65:isWide?.3:.36)*strength;
  const fovMin=isTextShot?45:isWide?43:41;
  const existingX=pose.targetX??0;
  return {...pose,
    targetX:clamp(existingX+lateral,-2.9,2.9),
    x:clamp(pose.x+lateral,-10,10),
    z:clamp(pose.z+zGain,3.5,15),
    fov:clamp(Math.max(pose.fov,fovMin*strength+pose.fov*(1-strength)),28,76),
  };
}
