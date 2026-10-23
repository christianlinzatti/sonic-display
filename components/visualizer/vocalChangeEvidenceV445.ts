/** V445 – conservative microphone/lyrics *mix-change* evidence, NOT singer identification.
 * Live spectrum aggregates cannot separate a mastered vocal from instruments, so candidates
 * are deliberately anonymous, low confidence and never mapped to artist names/rigs.
 * No raw audio is retained, persisted, uploaded or replayed. */
export const VOCAL_CHANGE_EVENT_V445="sonic:v445:vocal-mix-change";
export interface VocalEvidenceAudioV445 {bass:number;mids:number;highs:number;volume:number}
export interface VocalEvidenceLyricsV445 {synced:boolean;lines:readonly {startMs:number;endMs?:number|null;text?:string}[]}
export interface VocalChangeHintV445 {
  kind:'possible-voice-or-mix-change';atMs:number;lineIndex:number;
  confidence:number;source:'microphone-spectrum-and-lyrics';
}
export interface VocalEvidenceStateV445 {
  trackId:string;lineIndex:number;lastSampleMs:number;lastProgressMs:number;
  totals:[number,number,number];samples:number;previous:[number,number,number]|null;
  previousLine:number;lastHintAt:number;hint:VocalChangeHintV445|null;changes:number;
}
export const emptyVocalEvidenceV445=(trackId=''):VocalEvidenceStateV445=>({
  trackId,lineIndex:-1,lastSampleMs:-1,lastProgressMs:-1,totals:[0,0,0],samples:0,
  previous:null,previousLine:-1,lastHintAt:-100000,hint:null,changes:0,
});
const clamp=(x:number,a=0,b=1)=>Number.isFinite(x)?Math.max(a,Math.min(b,x)):a;
function findLine(lyrics:VocalEvidenceLyricsV445,ms:number):number {
  let lo=0,hi=Math.min(lyrics.lines.length,5000)-1,result=-1;
  while(lo<=hi){const mid=(lo+hi)>>>1;const at=lyrics.lines[mid]?.startMs;
    if(typeof at==='number'&&Number.isFinite(at)&&at<=ms){result=mid;lo=mid+1;}else hi=mid-1;}
  const row=lyrics.lines[result];
  if(!row||!row.text?.trim()||ms>=Math.min(row.endMs!=null&&row.endMs>row.startMs?row.endMs:Infinity,
    lyrics.lines[result+1]?.startMs??Infinity,row.startMs+14000))return -1;
  return result;
}
function normalize(v:[number,number,number]):[number,number,number]|null {
  const sum=v[0]+v[1]+v[2];return sum>0?[v[0]/sum,v[1]/sum,v[2]/sum]:null;
}
/** Update at most every 160ms. Spectral deviations describe *mix* changes, never identity. */
export function advanceVocalEvidenceV445(state:VocalEvidenceStateV445,input:{
  trackId:string;progressMs:number;playing:boolean;enabled:boolean;microphoneActive:boolean;
  reducedMotion:boolean;manualPriority:boolean;lyrics?:VocalEvidenceLyricsV445|null;
  audio:VocalEvidenceAudioV445;sensitivity?:number;
}):VocalEvidenceStateV445 {
  const id=(input.trackId??'').slice(0,200),ms=input.progressMs;
  if(!id||!Number.isFinite(ms)||ms<0||state.trackId!==id||ms<state.lastProgressMs-1200)
    state=emptyVocalEvidenceV445(id);
  if(!input.enabled||!input.microphoneActive||!input.playing||input.reducedMotion||input.manualPriority||
     !input.lyrics?.synced||!input.lyrics.lines.length)return {...state,hint:null,lastProgressMs:ms};
  const lyrics=input.lyrics;
  if(ms-state.lastSampleMs<160&&state.lastProgressMs<=ms)return state;
  const line=findLine(lyrics,ms);
  if(line<0)return {...state,lastProgressMs:ms,lastSampleMs:ms,hint:null};
  let next=state;
  if(line!==state.lineIndex){
    const signature=state.samples>=5?normalize(state.totals):null;
    let hint:VocalChangeHintV445|null=null;
    if(signature&&state.previous&&state.previousLine>=0&&line>state.lineIndex&&
       line-state.lineIndex<=3&&ms-state.lastHintAt>=6500){
      const difference=Math.abs(signature[0]-state.previous[0])+
        Math.abs(signature[1]-state.previous[1])+Math.abs(signature[2]-state.previous[2]);
      // A large change in broad-band EQ is only weak evidence of a different voice.
      const threshold=.44-.12*clamp((input.sensitivity??60)/100);
      if(difference>threshold){
        hint={kind:'possible-voice-or-mix-change',atMs:ms,lineIndex:line,
          confidence:clamp(.15+(difference-threshold)*.35,.15,.45),
          source:'microphone-spectrum-and-lyrics'};
      }
    }
    next={...state,lineIndex:line,totals:[0,0,0],samples:0,
      previous:signature??state.previous,previousLine:signature?state.lineIndex:state.previousLine,
      lastSampleMs:ms,lastProgressMs:ms,hint,
      lastHintAt:hint?ms:state.lastHintAt,changes:state.changes+(hint?1:0)};
  }
  // Never accept NaN, unavailable microphone metrics or a near-silent background.
  const a=input.audio;
  const bass=clamp(a.bass),mids=clamp(a.mids),highs=clamp(a.highs),volume=clamp(a.volume);
  if(volume<.075||mids<.065)return {...next,lastProgressMs:ms,lastSampleMs:ms};
  return {...next,totals:[next.totals[0]+bass,next.totals[1]+mids,next.totals[2]+highs],
    samples:Math.min(next.samples+1,1024),lastProgressMs:ms,lastSampleMs:ms};
}
/** A short, anonymous musical-response window; cannot assign a voice or artist. */
export function vocalHintPulseV445(hint:VocalChangeHintV445|null,ms:number):number {
  if(!hint||!Number.isFinite(ms))return 0;
  const elapsed=ms-hint.atMs;
  return elapsed>=0&&elapsed<1250?clamp(1-elapsed/1250)*hint.confidence:0;
}
