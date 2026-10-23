import type { Lyrics, LyricLine } from "@/types/music";
import { resolveCoordinatedVocalV372, type VocalDirectorOptionsV372 } from "./vocalPerformanceDirectorV372";
import {resolveVocalPerformanceQualityV374,type VocalQualityOptionsV374} from "./vocalPerformanceQualityV374";

/** Diagnostics of TIMESTAMP COMPLETENESS, not audio transcription quality or lip-sync accuracy. */
export type VocalTimingQualityV373 = "word" | "line" | "none";
export type VocalTimingSummaryV373 = {
  quality: VocalTimingQualityV373;
  source: Lyrics["provider"] | null;
  synced: boolean;
  timedLines: number;
  wordTimedLines: number;
  timedWords: number;
  invalidWords: number;
  wordCoveragePercent: number;
};
export type VocalTimingMarkV373 = {
  key: string;
  label: string;
  startMs: number;
  endMs: number;
  kind: "word" | "line";
};
const finite = (n: number) => Number.isFinite(n);
const safeMs = (n: number) => finite(n) ? Math.max(0, n) : 0;
const validWord = (w: {text: string; startMs: number; endMs: number | null}, line: LyricLine) =>
  typeof w.text === "string" && !!w.text.trim() && finite(w.startMs) && w.startMs >= line.startMs &&
  (w.endMs == null || (finite(w.endMs) && w.endMs > w.startMs));
const isVocalText = (text: string) => /[a-zäöüß]/i.test(text) &&
  !/^\s*(?:\[[^\]]*\]|\((?:instrumental|musik|music|pause|intro|outro|solo)[^)]*\))\s*$/i.test(text);

export function summarizeVocalTimingV373(lyrics: Lyrics | null): VocalTimingSummaryV373 {
  const base = {quality:"none" as VocalTimingQualityV373,source:lyrics?.provider??null,synced:!!lyrics?.synced,
    timedLines:0,wordTimedLines:0,timedWords:0,invalidWords:0,wordCoveragePercent:0};
  if (!lyrics?.synced) return base;
  let timedLines=0,wordTimedLines=0,timedWords=0,invalidWords=0;
  for (const line of lyrics.lines) {
    if (!finite(line.startMs) || line.startMs<0 || !isVocalText(line.text)) continue;
    timedLines++;
    const words=line.words??[];
    const valid=words.filter(w=>validWord(w,line));
    timedWords+=valid.length;invalidWords+=words.length-valid.length;
    if(valid.length) wordTimedLines++;
  }
  return {...base,timedLines,wordTimedLines,timedWords,invalidWords,
    quality:wordTimedLines>0?"word":timedLines>0?"line":"none",
    wordCoveragePercent:timedLines?Math.round(100*wordTimedLines/timedLines):0};
}

/** Small, ordered window for accessible timing scrubbing. No made-up word timings. */
export function getVocalTimingMarksV373(lyrics:Lyrics|null, centerMs:number, radiusMs=1600):VocalTimingMarkV373[] {
  if (!lyrics?.synced) return [];
  const start=Math.max(0,safeMs(centerMs)-Math.max(100,safeMs(radiusMs)));
  const stop=safeMs(centerMs)+Math.max(100,safeMs(radiusMs));
  const marks:VocalTimingMarkV373[]=[];
  for(let i=0;i<lyrics.lines.length;i++) {
    const line=lyrics.lines[i];
    if(!finite(line.startMs)||line.startMs<0||!isVocalText(line.text))continue;
    const words=(line.words??[]).filter(w=>validWord(w,line)).slice().sort((a,b)=>a.startMs-b.startMs);
    const nextLine=lyrics.lines[i+1]?.startMs??Infinity;
    if (words.length) {
      words.forEach((w,j)=>{
        const end=Math.min(w.endMs??Infinity,words[j+1]?.startMs??Infinity,line.endMs??Infinity,nextLine,w.startMs+2100);
        if(w.startMs<stop && end>start && end>w.startMs)marks.push({key:`${i}-${j}`,label:w.text.trim(),startMs:w.startMs,endMs:end,kind:"word"});
      });
    } else {
      const end=Math.min(line.endMs??Infinity,nextLine,line.startMs+8500);
      if(line.startMs<stop && end>start && end>line.startMs)
        marks.push({key:`${i}-line`,label:line.text.trim(),startMs:line.startMs,endMs:end,kind:"line"});
    }
  }
  return marks.sort((a,b)=>a.startMs-b.startMs).slice(0,24);
}

export function inspectVocalTimingV373(lyrics:Lyrics|null, timeMs:number, playing:boolean, options:VocalDirectorOptionsV372={}, qualityOptionsV374?:VocalQualityOptionsV374) {
  const cue=qualityOptionsV374?resolveVocalPerformanceQualityV374(lyrics,timeMs,playing,{...options,...qualityOptionsV374}):resolveCoordinatedVocalV372(lyrics,timeMs,playing,options);
  const status: "word" | "line" | "paused" | "unsynced" | "silent" =
    !playing?"paused":!lyrics?.synced?"unsynced":cue.confidence==="word"?"word":cue.confidence==="line"?"line":"silent";
  return { ...cue, status, marks:getVocalTimingMarksV373(lyrics,cue.effectiveTimeMs) };
}

/** Clearly identified demonstration; never passed off as current track timing. */
export const VOCAL_TIMING_DEMO_V373:Lyrics = {
  provider:"lrclib",synced:true,plainText:null,lines:[
    {startMs:700,endMs:3000,text:"Bam, mein Beat kommt jetzt!",words:[
      {text:"Bam,",startMs:700,endMs:1090},{text:"mein",startMs:1120,endMs:1470},
      {text:"Beat",startMs:1510,endMs:1910},{text:"kommt",startMs:1960,endMs:2310},
      {text:"jetzt!",startMs:2360,endMs:2940}]},
    {startMs:3300,endMs:4600,text:"[Instrumental]"},
    {startMs:4800,endMs:7400,text:"Lass den Augenblick noch weiter klingen",words:[
      {text:"Lass",startMs:4800,endMs:5250},{text:"den",startMs:5280,endMs:5550},
      {text:"Augenblick",startMs:5600,endMs:6350},{text:"klingen",startMs:6400,endMs:7360}]},
    {startMs:7650,endMs:9500,text:"Diese Zeile hat nur Zeitmarken"},
  ],
};
