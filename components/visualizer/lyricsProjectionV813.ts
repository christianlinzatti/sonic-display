/** V813 – conservative, seek-stable, timestamped HOOK / word-accent projection.
 * Visual copy ONLY: never replaces the readable Lyrics3DScene.
 * No LRC/plain text, fabricated timings or invented rhyme annotations. */
import type {Lyrics,LyricLine,LyricWord} from '@/types/music';
import type {ConcertFxCueV810,ConcertFxSettingsV810} from './concertFxStudioV810';
export type LyricsProjectionCueV813={active:boolean;text:string;opacity:number;
  surface:'wall'|'floor';accent:'hook'|'word'|'rhyme'|'none';source:'line'|'word'|'none'};
const clamp=(n:number,min=0,max=1)=>Math.max(min,Math.min(max,n));
const finite=(n:unknown):n is number=>typeof n==='number'&&Number.isFinite(n);
const clean=(s:string)=>s.normalize('NFKC').replace(/[\u0000-\u001f\u007f<>]/g,'').trim();
const wordsOf=(s:string)=>clean(s).split(/\s+/).map(w=>w.replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu,'')).filter(Boolean);
const suffix=(s:string)=>wordsOf(s).slice(-1)[0]?.toLocaleLowerCase().replace(/[^\p{L}]/gu,'').slice(-3)??'';
function wordIsTimed(w:LyricWord,l:LyricLine,nextStart:number,t:number){
 return finite(w.startMs)&&finite(w.endMs)&&w.endMs>w.startMs&&w.startMs>=l.startMs&&
 w.endMs<=Math.min(nextStart,finite(l.endMs)?l.endMs:nextStart)&&w.startMs<=t&&t<w.endMs;
}
const OFF:LyricsProjectionCueV813=Object.freeze({active:false,text:'',opacity:0,surface:'wall',accent:'none',source:'none'});
export function planLyricsProjectionV813(input:{fx:ConcertFxCueV810;settings:ConcertFxSettingsV810;
 lyrics:Lyrics|null|undefined;progressMs:number;lyricsVisible:boolean;verifiedSong:boolean;groupCount:number;}) : LyricsProjectionCueV813 {
 const {fx,settings:s,lyrics,progressMs:t}=input;
 if(!fx.active||!s.lyricsProjection||!input.lyricsVisible||!input.verifiedSong||!lyrics?.synced||
 !finite(t)||!Array.isArray(lyrics.lines)||input.groupCount>4||input.groupCount<1)return OFF;
 if(fx.section!=='hook'&&fx.section!=='finale'&&!(s.rhymeAccents&&fx.section==='verse'))return OFF;
 const lines=lyrics.lines;
 // Find an actual timestamped line. Gaps do not inherit the previous lyric.
 // Synced-lyrics providers deliver lines in time order; avoid scanning every
 // line on each WebGL frame. Missing/invalid timestamps are rejected below.
 let lo=0,hi=lines.length-1,ix=-1;
 while(lo<=hi){const mid=(lo+hi)>>1;
   if(!finite(lines[mid]?.startMs))return OFF;
   if(lines[mid].startMs<=t){ix=mid;lo=mid+1;}else hi=mid-1;
 }
 if(ix<0||!finite(lines[ix].startMs))return OFF;
 const line=lines[ix];const lineEnd=Math.min(finite(line.endMs)?line.endMs:line.startMs+5500,
 finite(lines[ix+1]?.startMs)?lines[ix+1].startMs:Infinity);
 if(!finite(lineEnd)||lineEnd<=t||lineEnd<=line.startMs||!clean(line.text))return OFF;
 const isHook=fx.section==='hook'||fx.section==='finale';
 let current:LyricWord|undefined;
 for(const w of line.words??[]){if(wordIsTimed(w,line,lineEnd,t)){current=w;break;}}
 // A line-level fallback is permitted only when no word-level timing was provided.
 if(!current&&(line.words?.length||!isHook))return OFF;
 const lineWords=wordsOf(line.text);
 const txt=clean(current?.text??lineWords.slice(-2).join(' ')).slice(0,30);
 if(!txt)return OFF;
 // Rhyme LIKE terminal syllable only when both lines have real word timings. No claim of phonetic proof.
 const previous=lines[ix-1];
 const last=line.words?.[line.words.length-1];
 const prevLast=previous?.words?.[previous.words.length-1];
 const rhyme=!!s.rhymeAccents&&!!last&&!!prevLast&&current===last&&
 finite(last.startMs)&&finite(last.endMs)&&last.endMs>last.startMs&&
 finite(prevLast.startMs)&&finite(prevLast.endMs)&&prevLast.endMs>prevLast.startMs&&
 suffix(last.text).length===3&&suffix(last.text)===suffix(prevLast.text)&&
 suffix(last.text)!==suffix(lineWords[0]??'');
 const elapsed=t-(current?.startMs??line.startMs);
 const duration=(current?.endMs??lineEnd)-(current?.startMs??line.startMs);
 const edge=clamp(elapsed/220)*clamp((duration-elapsed)/260);
 const base=Math.min(.21,(s.intensity/100)*.26*(s.quality==='performance'?.42:s.quality==='balanced'?.7:1));
 const protective=s.protectLyrics?.68:1;
 const opacity=clamp(base*edge*protective*(rhyme?1:isHook?.85:.55)*(input.groupCount>=3?.65:1),0,.21);
 if(opacity<.003)return OFF;
 return {active:true,text:txt.toLocaleUpperCase(),opacity,surface:s.projectionSurface,
  accent:rhyme?'rhyme':current?'word':'hook',source:current?'word':'line'};
}
