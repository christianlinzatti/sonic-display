/** V644: user-authored, time-aligned *viseme* cues. NOT phoneme recognition.
 * No access to Spotify audio/lyrics and no inference from the V643 RMS features.
 * Memory-only, explicit opt-in, per-song and per-avatar. Source files remain local.
 */
export type VisemeV644='sil'|'PP'|'FF'|'TH'|'AA'|'E'|'IH'|'OH'|'OU';
export interface VisemeMarkV644 {slot:0|1|2|3;startMs:number;endMs:number;viseme:VisemeV644;}
export interface VisemeDocumentV644 {
 format:'sonic-v644-manual-visemes';version:1;source:'user-aligned';trackId:string;durationMs:number;
 marks:VisemeMarkV644[];
}
export type MouthV644={jaw:number;wide:number;round:number;lipsClosed:number};
export const VISEMES_V644:readonly VisemeV644[]=['sil','PP','FF','TH','AA','E','IH','OH','OU'];
const SHAPES:Record<VisemeV644,MouthV644>={
 sil:{jaw:0,wide:0,round:0,lipsClosed:0},
 PP:{jaw:0,wide:0,round:0,lipsClosed:1},
 FF:{jaw:.10,wide:.35,round:0,lipsClosed:.12},
 TH:{jaw:.22,wide:.28,round:0,lipsClosed:0},
 AA:{jaw:.92,wide:.25,round:0,lipsClosed:0},
 E:{jaw:.38,wide:.90,round:0,lipsClosed:0},
 IH:{jaw:.32,wide:.75,round:0,lipsClosed:0},
 OH:{jaw:.54,wide:0,round:.85,lipsClosed:0},
 OU:{jaw:.25,wide:0,round:1,lipsClosed:0},
};
const isInt=(v:unknown,min:number,max:number)=>typeof v==='number'&&Number.isInteger(v)&&v>=min&&v<=max;
const validTrack=(v:unknown)=>typeof v==='string'&&v.length>0&&v.length<=250;
const clamp=(n:number)=>Math.max(0,Math.min(1,n));
const mix=(a:number,b:number,f:number)=>a+(b-a)*clamp(f);
const lerpShape=(a:MouthV644,b:MouthV644,f:number):MouthV644=>({jaw:mix(a.jaw,b.jaw,f),wide:mix(a.wide,b.wide,f),round:mix(a.round,b.round,f),lipsClosed:mix(a.lipsClosed,b.lipsClosed,f)});
const smooth=(x:number)=>{const t=clamp(x);return t*t*(3-2*t);};
/** Reject malformed/untrusted imports instead of sorting away overlapping or invalid cues.
 * Each slot may have adjacent events; half-open intervals prevent double activation.
 */
export function normalizeVisemeDocumentV644(raw:unknown,trackId:string,durationMs:number):VisemeDocumentV644|null{
 if(!raw||typeof raw!=='object'||!validTrack(trackId)||!isInt(durationMs,2000,720000))return null;
 const d=raw as Partial<VisemeDocumentV644>;
 if(d.format!=='sonic-v644-manual-visemes'||d.version!==1||d.source!=='user-aligned'||d.trackId!==trackId||
  !isInt(d.durationMs,2000,720000)||Math.abs(d.durationMs!-durationMs)>3500||
  !Array.isArray(d.marks)||d.marks.length>4000)return null;
 const last=[0,0,0,0];
 const marks:VisemeMarkV644[]=[];
 for(const m of d.marks){
  if(!m||typeof m!=='object'||!isInt(m.slot,0,3)||!isInt(m.startMs,0,d.durationMs!)||
   !isInt(m.endMs,1,d.durationMs!)||m.endMs<=m.startMs||m.endMs-m.startMs<30||
   !VISEMES_V644.includes(m.viseme)||m.startMs<last[m.slot]||
   Object.keys(m).some(k=>!['slot','startMs','endMs','viseme'].includes(k)))return null;
  last[m.slot]=m.endMs;
  marks.push({slot:m.slot,startMs:m.startMs,endMs:m.endMs,viseme:m.viseme});
 }
 if(Object.keys(d).some(k=>!['format','version','source','trackId','durationMs','marks'].includes(k)))return null;
 return {format:'sonic-v644-manual-visemes',version:1,source:'user-aligned',trackId,durationMs:d.durationMs!,marks};
}
export function createVisemeDocumentV644(trackId:string,durationMs:number,marks:readonly VisemeMarkV644[]):VisemeDocumentV644|null{
 const sorted=[...marks].sort((a,b)=>a.startMs-b.startMs||a.slot-b.slot);
 return normalizeVisemeDocumentV644({format:'sonic-v644-manual-visemes',version:1,source:'user-aligned',trackId,durationMs,marks:sorted},trackId,durationMs);
}
/** The author chooses both the viseme and exact timing. Only ~40ms of neighboring
 * coarticulation, never moving the actual event timestamps or inferring sounds.
 */
function sampleSortedMarksV644(marks:readonly VisemeMarkV644[],timeMs:number):MouthV644|null{
 let lo=0,hi=marks.length-1,idx=-1;
 while(lo<=hi){const mid=(lo+hi)>>1;if(marks[mid].startMs<=timeMs){idx=mid;lo=mid+1;}else hi=mid-1;}
 if(idx<0)return null;
 const m=marks[idx];if(timeMs>=m.endMs)return null;
 const prev=marks[idx-1],next=marks[idx+1];
 const shape=SHAPES[m.viseme];let out={...shape};
 if(prev&&prev.endMs===m.startMs&&timeMs<m.startMs+40){
  out=lerpShape(SHAPES[prev.viseme],shape,smooth((timeMs-m.startMs)/40));
 }else if(next&&next.startMs===m.endMs&&timeMs>m.endMs-40){
  out=lerpShape(shape,SHAPES[next.viseme],smooth((timeMs-(m.endMs-40))/40));
 }
 out.jaw=Math.min(out.jaw,1-out.lipsClosed);
 return out;
}
export function sampleVisemeV644(doc:VisemeDocumentV644|null|undefined,trackId:string,slot:number,timeMs:number,playing:boolean):MouthV644|null{
 if(!playing||!doc||doc.trackId!==trackId||!isInt(slot,0,3)||!Number.isFinite(timeMs)||timeMs<0||timeMs>=doc.durationMs)return null;
 return sampleSortedMarksV644(doc.marks.filter(m=>m.slot===slot),timeMs);
}

/** Single memory-only opt-in store shared by Settings UI and the already mounted GLB rig.
 * No subscriptions or audio/render loops; the rig reads once in its existing useFrame.
 */
let active:{document:VisemeDocumentV644;enabled:boolean;bySlot:VisemeMarkV644[][]}|null=null;
export function setLiveVisemeV644(raw:unknown,trackId:string,durationMs:number,enabled:boolean):boolean{
 const doc=normalizeVisemeDocumentV644(raw,trackId,durationMs);
 if(!doc)return false;
 active={document:doc,enabled:enabled===true,bySlot:[0,1,2,3].map(slot=>doc.marks.filter(m=>m.slot===slot))};return true;
}
export function clearLiveVisemeV644(){active=null;}
/** Called by the always-mounted SonicDisplay settings shell on a real song change.
 * Closing the settings dialog must NOT switch off an already activated live cue.
 */
export function clearVisemeOnTrackChangeV644(trackId:string){
 if(active&&active.document.trackId!==trackId)active=null;
}
export function getLiveVisemeV644(){return active?{document:active.document,enabled:active.enabled}:null;}
export function sampleLiveVisemeV644(trackId:string,slot:number,timeMs:number,playing:boolean):MouthV644|null{
 if(!active?.enabled)return null;
 if(!playing||active.document.trackId!==trackId||!isInt(slot,0,3)||!Number.isFinite(timeMs)||timeMs<0||timeMs>=active.document.durationMs)return null;
 return sampleSortedMarksV644(active.bySlot[slot],timeMs);
}
