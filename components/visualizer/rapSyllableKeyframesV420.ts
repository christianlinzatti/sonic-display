import type {Lyrics} from "@/types/music";
import type {RapSyllableCueV419} from "./rapSyllableArticulationV419";
import {rapLipWordAtV415} from "./rapLipPrecisionV415";

/** Authored mouth poses at fractions of REAL word timing; not measured phoneme timestamps. */
export type RapMouthKeyframeV420={at:number;jaw:number;wide:number;round:number};
export type RapMouthWordEditV420={startMs:number;text:string;strength:number;frames:RapMouthKeyframeV420[]};
export type RapMouthDocumentV420={trackId:string;edits:RapMouthWordEditV420[]};
export type RapMouthEditsOptionsV420={rapSyllableEditsEnabledV420?:boolean;rapSyllableTrackIdV420?:string;rapSyllableDocumentV420?:RapMouthDocumentV420|null};
const clamp=(n:number,lo=0,hi=1)=>Number.isFinite(n)?Math.max(lo,Math.min(hi,n)):lo;
export const rapWordKeyV420=(text:string)=>text.trim().toLocaleLowerCase("de-DE").replace(/\s+/gu," ");
const validTime=(n:number)=>Number.isFinite(n)&&n>=0&&n<36000000;
/** Sanitize persisted/browser-editable data before it reaches the animation engine. */
export function normalizeRapMouthEditV420(raw:RapMouthWordEditV420|null|undefined):RapMouthWordEditV420|null{
 if(!raw||typeof raw.text!=="string"||!rapWordKeyV420(raw.text)||!validTime(raw.startMs)||!Array.isArray(raw.frames))return null;
 if(raw.frames.length<1||raw.frames.length>8)return null;
 const frames=raw.frames.map(f=>({at:clamp(f?.at),jaw:clamp(f?.jaw),wide:clamp(f?.wide),round:clamp(f?.round)}));
 if(raw.frames.some(f=>!f||![f.at,f.jaw,f.wide,f.round].every(Number.isFinite)||f.at<0||f.at>1||f.jaw<0||f.jaw>1||f.wide<0||f.wide>1||f.round<0||f.round>1))return null;
 frames.sort((a,b)=>a.at-b.at);
 if(frames.some((f,i)=>i>0&&f.at-frames[i-1].at<.015))return null;
 return {startMs:Math.round(raw.startMs),text:rapWordKeyV420(raw.text),strength:clamp(raw.strength,0,100),frames};
}
export function normalizeRapMouthDocumentV420(trackId:string,doc:RapMouthDocumentV420|null|undefined):RapMouthDocumentV420{
 if(!trackId||doc?.trackId!==trackId||!Array.isArray(doc.edits))return {trackId,edits:[]};
 const edits:RapMouthWordEditV420[]=[];
 for(const raw of doc.edits.slice(0,400)){
  const edit=normalizeRapMouthEditV420(raw);
  if(edit&&!edits.some(x=>x.startMs===edit.startMs&&x.text===edit.text))edits.push(edit);
 }
 return {trackId,edits};
}
export function upsertRapMouthEditV420(doc:RapMouthDocumentV420,raw:RapMouthWordEditV420|null,identity:{startMs:number;text:string}):RapMouthDocumentV420{
 const clean=normalizeRapMouthDocumentV420(doc.trackId,doc);
 const edits=clean.edits.filter(e=>e.startMs!==identity.startMs||e.text!==rapWordKeyV420(identity.text));
 const next=normalizeRapMouthEditV420(raw);
 if(next&&next.startMs===identity.startMs&&next.text===rapWordKeyV420(identity.text))edits.push(next);
 return {...clean,edits:edits.slice(0,400)};
}
export function sampleRapMouthFramesV420(frames:ReadonlyArray<RapMouthKeyframeV420>,phase:number):RapMouthKeyframeV420|null{
 if(!frames.length)return null;
 const t=clamp(phase);
 let a=frames[0],b=frames[frames.length-1];
 if(t<=a.at)return {...a,at:t};
 if(t>=b.at)return {...b,at:t};
 for(let i=0;i<frames.length-1;i++)if(t>=frames[i].at&&t<=frames[i+1].at){a=frames[i];b=frames[i+1];break;}
 const f=clamp((t-a.at)/Math.max(1e-6,b.at-a.at));
 const smooth=f*f*(3-2*f);
 return {at:t,jaw:a.jaw+(b.jaw-a.jaw)*smooth,wide:a.wide+(b.wide-a.wide)*smooth,round:a.round+(b.round-a.round)*smooth};
}
/** V420 affects FACE ONLY. Preserve the V415 bilabial seal and all V419/V374 role/body data. */
export function applyRapMouthKeyframesV420(lyrics:Lyrics|null,cue:RapSyllableCueV419,playing:boolean,options:RapMouthEditsOptionsV420={}):RapSyllableCueV419{
 if(!playing||options.rapSyllableEditsEnabledV420!==true||!cue.rapSyllableV419.active||!lyrics?.synced||
    !options.rapSyllableTrackIdV420||options.rapSyllableTrackIdV420!==options.rapSyllableDocumentV420?.trackId)return cue;
 const ms=cue.rapSyllableV419.mouthTimeMs;
 const word=rapLipWordAtV415(lyrics,ms);
 if(!word||rapWordKeyV420(word.word.text)!==rapWordKeyV420(cue.rapSyllableV419.word??""))return cue;
 const raw=options.rapSyllableDocumentV420.edits?.find(e=>e.startMs===word.start&&e.text===rapWordKeyV420(word.word.text));
 const edit=normalizeRapMouthEditV420(raw);
 if(!edit)return cue;
 const phase=clamp((ms-word.start)/(word.end-word.start));
 const target=sampleRapMouthFramesV420(edit.frames,phase);
 if(!target)return cue;
 const seal=clamp(cue.face.lipsClosed);
 const mix=edit.strength/100*(1-seal*.98);
 const jaw=clamp(cue.face.jaw*(1-mix)+target.jaw*mix,0,1-seal*.985);
 const round=clamp(cue.face.round*(1-mix)+target.round*mix)*(1-seal*.25);
 const wide=clamp(cue.face.wide*(1-mix)+target.wide*mix)*(1-seal*.3)*(1-round*.22);
 return {...cue,face:{...cue.face,jaw,wide:clamp(wide),round:clamp(round)}};
}
