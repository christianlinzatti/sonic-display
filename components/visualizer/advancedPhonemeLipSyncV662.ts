/**
 * V662: coarticulation for explicitly user-timed V644 visemes only.
 * These curves are not phoneme recognition, transcription or speaker diarization.
 * No audio, network, new frame loop, or persistent user data is used.
 */
import {getLiveVisemeV644,type MouthV644,type VisemeDocumentV644,type VisemeMarkV644} from './phonemeLipSyncV644';

export type AdvancedVisemeModeV662='off'|'rap'|'singing';
export interface AdvancedVisemeSampleV662 {
  mouth:MouthV644;
  mode:Exclude<AdvancedVisemeModeV662,'off'>;
  /** Diagnostic only: an adjacent manually marked transition. */
  transitioning:boolean;
}
const silence:MouthV644={jaw:0,wide:0,round:0,lipsClosed:0};
const shapes:Readonly<Record<VisemeMarkV644['viseme'],MouthV644>>={
  sil:silence,
  PP:{jaw:0,wide:0,round:0,lipsClosed:1},
  FF:{jaw:.10,wide:.35,round:0,lipsClosed:.12},
  TH:{jaw:.22,wide:.28,round:0,lipsClosed:0},
  AA:{jaw:.92,wide:.25,round:0,lipsClosed:0},
  E:{jaw:.38,wide:.90,round:0,lipsClosed:0},
  IH:{jaw:.32,wide:.75,round:0,lipsClosed:0},
  OH:{jaw:.54,wide:0,round:.85,lipsClosed:0},
  OU:{jaw:.25,wide:0,round:1,lipsClosed:0},
};
const clamp=(n:number)=>Math.max(0,Math.min(1,n));
const easing=(t:number)=>{const x=clamp(t);return x*x*x*(x*(6*x-15)+10);};
const channels=['jaw','wide','round','lipsClosed'] as const;
/** A PP lips-closed interval is authoritative even during blends. */
function blend(a:MouthV644,b:MouthV644,t:number):MouthV644{
  const w=easing(t);
  const out={...silence};
  for(const key of channels)out[key]=clamp(a[key]+(b[key]-a[key])*w);
  out.jaw=Math.min(out.jaw,1-out.lipsClosed);
  out.wide*=1-out.lipsClosed*.2;
  out.round*=1-out.lipsClosed*.18;
  return out;
}
// A modest duration-aware window ensures short Deutschrap consonants retain
// an unblended center rather than being smeared out by adjacent visemes.
function transitionHalfWidth(a:VisemeMarkV644,b:VisemeMarkV644,mode:Exclude<AdvancedVisemeModeV662,'off'>){
  const cap=mode==='rap'?22:38;
  return Math.max(0,Math.min(cap,(a.endMs-a.startMs)*.23,(b.endMs-b.startMs)*.23));
}
function sampled(marks:readonly VisemeMarkV644[],timeMs:number,mode:Exclude<AdvancedVisemeModeV662,'off'>):AdvancedVisemeSampleV662|null{
  let lo=0,hi=marks.length-1,index=-1;
  while(lo<=hi){const mid=(lo+hi)>>1;if(marks[mid].startMs<=timeMs){index=mid;lo=mid+1;}else hi=mid-1;}
  if(index<0)return null;
  const mark=marks[index];
  if(timeMs>=mark.endMs)return null; // gaps NEVER emit invented articulation
  const prev=marks[index-1],next=marks[index+1];
  let mouth={...shapes[mark.viseme]};
  let transitioning=false;
  if(prev&&prev.endMs===mark.startMs){
    const half=transitionHalfWidth(prev,mark,mode);
    if(half>0&&timeMs<mark.startMs+half){
      mouth=blend(shapes[prev.viseme],shapes[mark.viseme],(timeMs-(mark.startMs-half))/(2*half));
      transitioning=true;
    }
  }
  if(!transitioning&&next&&next.startMs===mark.endMs){
    const half=transitionHalfWidth(mark,next,mode);
    if(half>0&&timeMs>=mark.endMs-half){
      mouth=blend(shapes[mark.viseme],shapes[next.viseme],(timeMs-(mark.endMs-half))/(2*half));
      transitioning=true;
    }
  }
  // Exact closure is most important for labials; bounded outputs even if custom
  // rigs later apply calibrated gains.
  mouth.jaw=Math.min(clamp(mouth.jaw),1-clamp(mouth.lipsClosed));
  return {mouth,mode,transitioning};
}

/** Per-song voluntary profile; never stored in localStorage or transferred. */
let selection:{trackId:string;mode:AdvancedVisemeModeV662}|null=null;
export function setAdvancedVisemeModeV662(trackId:string,mode:AdvancedVisemeModeV662):boolean{
  if(!trackId||trackId.length>250||!(['off','rap','singing'] as const).includes(mode))return false;
  selection=mode==='off'?null:{trackId,mode};
  return true;
}
export function getAdvancedVisemeModeV662(trackId:string):AdvancedVisemeModeV662{
  return selection?.trackId===trackId?selection.mode:'off';
}
export function clearAdvancedVisemeModeV662(){selection=null;cacheDoc=null;bySlot=[[],[],[],[]];}

// The V644 store validates and pre-indexes the cues. Cache by the stable document
// identity to avoid filtering up to 4000 events every animation frame.
let cacheDoc:VisemeDocumentV644|null=null;
let bySlot:VisemeMarkV644[][]=[[],[],[],[]];
function indexed(doc:VisemeDocumentV644){
  if(cacheDoc!==doc){
    bySlot=[[],[],[],[]];
    for(const m of doc.marks)bySlot[m.slot].push(m);
    cacheDoc=doc;
  }
  return bySlot;
}
/** Returns null unless an explicitly opted-in, valid V644 track+slot is playing. */
export function sampleAdvancedVisemeV662(trackId:string,slot:number,timeMs:number,playing:boolean):AdvancedVisemeSampleV662|null{
  const mode=getAdvancedVisemeModeV662(trackId);
  const live=getLiveVisemeV644();
  if(mode==='off'||!playing||!live?.enabled||live.document.trackId!==trackId||
    !Number.isInteger(slot)||slot<0||slot>3||!Number.isFinite(timeMs)||timeMs<0||timeMs>=live.document.durationMs)return null;
  return sampled(indexed(live.document)[slot],timeMs,mode);
}
