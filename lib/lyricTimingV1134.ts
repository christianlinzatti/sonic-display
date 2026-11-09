import type {Lyrics,LyricLine,LyricWord} from '../types/playbackCore';
const finite=(n:unknown):n is number=>typeof n==='number'&&Number.isFinite(n);
/** Validate provider data once at the boundary. Never manufacture word-level timing. */
export function normalizeLyricTimingV1134(value:unknown,durationMs?:number):Lyrics|null{
 if(!value||typeof value!=='object')return null;
 const raw=value as Partial<Lyrics>;
 const rows=Array.isArray(raw.lines)?raw.lines:[];
 const text=typeof raw.plainText==='string'?raw.plainText:rows.map(l=>typeof l?.text==='string'?l.text:'').filter(Boolean).join('\n');
 const provider=raw.provider==='spotify'||raw.provider==='genius'||raw.provider==='lyrics.ovh'?raw.provider:'lrclib';
 const limit=finite(durationMs)&&durationMs>0?durationMs:86400000;
 const valid=rows.filter(l=>typeof l?.text==='string'&&l.text.trim()&&finite(l.startMs)&&l.startMs>=0&&l.startMs<limit)
 .slice().sort((a,b)=>a.startMs-b.startMs).filter((l,i,all)=>i===0||l.startMs!==all[i-1].startMs);
 const lines:LyricLine[]=valid.map((l,i)=>{
  const next=valid[i+1]?.startMs??limit;
  const endMs=Math.min(next,finite(l.endMs)&&l.endMs>l.startMs?l.endMs:l.startMs+4000);
  const words=l.words;
  const safeWords=Array.isArray(words)&&words.length>0&&words.every((w,j)=>typeof w?.text==='string'&&finite(w.startMs)&&w.startMs>=l.startMs&&w.startMs<endMs&&
   (!j||w.startMs>words[j-1].startMs)&&(w.endMs==null||finite(w.endMs)&&w.endMs>w.startMs&&w.endMs<=endMs)&&
   (!j||!finite(words[j-1].endMs)||words[j-1].endMs!<=w.startMs))&&
   words.map(w=>w.text).join(' ').replace(/\s/g,'')===l.text.replace(/\s/g,'');
  return {startMs:l.startMs,endMs,text:l.text,...(safeWords?{words:words!.map(w=>({text:w.text,startMs:w.startMs,endMs:finite(w.endMs)?w.endMs:null} as LyricWord))}:{})};
 });
 if(raw.synced===true&&lines.length)return {provider,synced:true,lines,plainText:text||null};
 if(!text.trim())return null;
 return {provider,synced:false,plainText:text,lines:text.split('\n').filter(t=>t.trim()).map(text=>({text,startMs:0,endMs:null}))};
}
