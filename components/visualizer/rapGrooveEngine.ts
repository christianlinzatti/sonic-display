import type { AudioFeatures } from "@/types/audio";

/** No voice isolation is claimed: the detector uses percussion energy and beat phase only. */
export type RapGrooveMode = "auto" | "boom-bap" | "trap" | "halftime" | "doubletime";
export type RapGrooveSettings = {enabled:boolean;mode:RapGrooveMode;head:number;shoulders:number;bounce:number;snare:number;hips?:number;steps?:number;weight?:number};
export type RapGroovePose = {headNod:number;shoulder:number;bounce:number;chest:number;arm:number;hipSway:number;legGroove:number;footStep:number;weightShift:number; mode:Exclude<RapGrooveMode,"auto">};
export const DEFAULT_RAP_GROOVE:RapGrooveSettings={enabled:true,mode:"auto",head:.75,shoulders:.5,bounce:.42,snare:.7,hips:.52,steps:.48,weight:.6};
const clamp=(v:number)=>Math.max(0,Math.min(1,Number.isFinite(v)?v:0));
export function isRapGenre(genre?:string|null){return /deutschrap|german.?rap|hip.?hop|trap|rap|boom.?bap/.test((genre??"").toLowerCase());}
export function rapGroovePose(audio:AudioFeatures,time:number,settings:RapGrooveSettings,genre?:string|null,playing=true,reducedMotion=false):RapGroovePose {
 const bpm=audio.bpm&&audio.bpm>=45&&audio.bpm<=240?audio.bpm:90;
 const mode=settings.mode==="auto"?(bpm>=135?"halftime":bpm<=83?"boom-bap":"trap"):settings.mode;
 const zero:RapGroovePose={headNod:0,shoulder:0,bounce:0,chest:0,arm:0,hipSway:0,legGroove:0,footStep:0,weightShift:0,mode};
 if(!settings.enabled||!isRapGenre(genre)||!playing||reducedMotion)return zero;
 const beatPeriod=60/bpm;
 const beatPosition=time/beatPeriod;
 const phase=audio.beatPhase!=null&&Number.isFinite(audio.beatPhase)?clamp(audio.beatPhase):((beatPosition%1)+1)%1;
 const pulse=Math.exp(-Math.pow(Math.min(phase,1-phase)/.19,2));
 // In halftime, accent only every second detected beat. Physical snare separation is not guaranteed.
 const halftime=(mode==="halftime"||mode==="trap");
 const backbeat=halftime?(Math.floor(beatPosition)%2===1?1:.22):(Math.floor(beatPosition)%4===1||Math.floor(beatPosition)%4===3?1:.32);
 const snare=clamp(audio.snare*.66+audio.mids*.22+audio.hiHat*.12)*backbeat;
 const kick=clamp(audio.kick*.75+audio.bass*.25);
 const confidence=audio.phaseConfidence??0;
 const accent=clamp(audio.beatStrength)*(.35+.65*(confidence>.5?pulse:1));
 const intensity=.25+.75*clamp(audio.energyEnvelope);
 const swing=Math.sin(time*Math.PI*2/(beatPeriod*(halftime?2:1)));
 // Alternating grounded steps: low amplitude, non-IK-disruptive local rotations.
 const stepPhase=time*Math.PI/(beatPeriod*(halftime?2:1));
 const alternating=Math.sin(stepPhase);
 const groove=clamp(.25+.5*kick+.25*accent)*intensity;
 const hipAmount=clamp(settings.hips??.52);
 const stepAmount=clamp(settings.steps??.48);
 const weightAmount=clamp(settings.weight??.6);
 return {mode,
  headNod:clamp(settings.head)*intensity*(.10*swing+.22*accent+.14*kick),
  shoulder:clamp(settings.shoulders)*intensity*(.11*Math.sin(time*2.2)+.14*snare*clamp(settings.snare)),
  bounce:clamp(settings.bounce)*intensity*(.09*kick+.065*accent+.035*Math.max(0,swing)),
  chest:clamp(settings.snare)*intensity*(.13*snare+.07*accent),
  arm:clamp(settings.shoulders)*intensity*(.09*snare+.05*swing),
  hipSway:hipAmount*(.065*alternating+.03*snare)*intensity,
  legGroove:stepAmount*(.055*Math.max(0,alternating)+.04*kick)*intensity,
  footStep:stepAmount*.12*alternating*groove,
  weightShift:weightAmount*.20*alternating*groove};
}
