import type {Lyrics} from "@/types/music";

/** Timestamp-driven hints, not inferred vocals or phoneme/audio onset detection. */
export type RapLyricsCueV413={active:boolean;source:"none"|"line"|"word";lineIndex:number;wordIndex:number;accent:number;lineStart:boolean;wordStart:boolean};
const inactive:RapLyricsCueV413={active:false,source:"none",lineIndex:-1,wordIndex:-1,accent:0,lineStart:false,wordStart:false};
const unit=(n:number)=>Number.isFinite(n)?Math.min(1,Math.max(0,n)):0;
/** Returns a bounded, reproducible dance accent for verified timestamp windows. */
export function sampleRapLyricsCueV413(lyrics:Lyrics|null|undefined,progressMs:number,playing:boolean,reducedMotion:boolean,offsetMs=0):RapLyricsCueV413{
  if(!playing||reducedMotion||!lyrics?.synced||!Array.isArray(lyrics.lines)||!Number.isFinite(progressMs)||!Number.isFinite(offsetMs))return inactive;
  const t=progressMs+Math.max(-2000,Math.min(2000,offsetMs));
  if(t<0)return inactive;
  const lines=lyrics.lines;
  let index=-1;
  for(let i=0;i<lines.length;i++){
    if(!Number.isFinite(lines[i].startMs))continue;
    if(lines[i].startMs<=t)index=i;else break;
  }
  if(index<0)return inactive;
  const line=lines[index];
  const end=Math.min(line.endMs!=null&&Number.isFinite(line.endMs)&&line.endMs>line.startMs?line.endMs:Infinity,
    lines[index+1]?.startMs??Infinity,line.startMs+15000);
  if(t>=end||!line.text?.trim())return inactive;
  const startOfLine=t-line.startMs;
  const lineAccent=.18*unit(1-startOfLine/370);
  const words=(line.words??[]).filter(w=>w.text?.trim()&&Number.isFinite(w.startMs)&&w.startMs>=line.startMs&&w.startMs<end).sort((a,b)=>a.startMs-b.startMs);
  let wi=-1;
  for(let i=0;i<words.length;i++){if(words[i].startMs<=t)wi=i;else break;}
  if(wi<0)return {active:true,source:"line",lineIndex:index,wordIndex:-1,accent:lineAccent,lineStart:startOfLine<130,wordStart:false};
  const word=words[wi];
  const wordEnd=Math.min(word.endMs!=null&&Number.isFinite(word.endMs)&&word.endMs>word.startMs?word.endMs:Infinity,words[wi+1]?.startMs??Infinity,end,word.startMs+1600);
  if(t>=wordEnd)return {active:true,source:"line",lineIndex:index,wordIndex:-1,accent:lineAccent,lineStart:startOfLine<130,wordStart:false};
  const since=t-word.startMs;
  const wordAccent=.38*unit(1-since/175);
  return {active:true,source:"word",lineIndex:index,wordIndex:wi,accent:Math.min(.45,Math.max(lineAccent,wordAccent)),lineStart:startOfLine<130,wordStart:since<110};
}
/** Keep authored rap gain as baseline; lyric envelopes only add restrained emphasis. */
export function lyricsRapGainV413(baseline:number,cue:RapLyricsCueV413):number{
  const base=Number.isFinite(baseline)?Math.max(0,Math.min(150,baseline)):100;
  return Math.min(150,base*(1+Math.max(0,Math.min(.45,cue.accent))));
}
