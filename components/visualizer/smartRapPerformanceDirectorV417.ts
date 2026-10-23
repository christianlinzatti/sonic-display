import type {Lyrics} from "@/types/music";
import {normalizeRapDuetAssignmentsV416,type RapDuetAssignmentV416,type RapDuetStyleV416} from "./rapDuetStudioV416";

/** V417 generates *stage suggestions*, not automatic speaker or chorus detection from audio. */
export type RapSceneSuggestionV417={
  id:string;assignment:RapDuetAssignmentV416;confidence:number;
  signal:"repeated-lines"|"question-response"|"verse-phrase";
  reason:string;
};
const limit=(n:number,min:number,max:number)=>Number.isFinite(n)?Math.max(min,Math.min(max,n)):min;
const clean=(text:string)=>text.normalize("NFKC").toLocaleLowerCase("de")
  .replace(/[^\p{L}\p{N}\s]/gu," ").replace(/\s+/g," ").trim();
const valid=(l:Lyrics["lines"][number])=>
  !!l&&typeof l.text==="string"&&Number.isFinite(l.startMs)&&l.startMs>=0&&
  !!l.text.trim()&&clean(l.text).length>=3;
const overlaps=(a:Pick<RapDuetAssignmentV416,"fromLine"|"toLine">,
  b:Pick<RapDuetAssignmentV416,"fromLine"|"toLine">)=>a.fromLine<=b.toLine&&b.fromLine<=a.toLine;
const idFor=(a:RapDuetAssignmentV416)=>`v417-${a.fromLine}-${a.toLine}-${a.style}`;

export function suggestRapScenesV417({lyrics,count,existing=[]}: {
  lyrics?:Lyrics|null;count:number;existing?:readonly RapDuetAssignmentV416[];
}):RapSceneSuggestionV417[]{
  if(!lyrics?.synced||!Array.isArray(lyrics.lines)||lyrics.lines.length<1||lyrics.lines.length>3000||
    !Number.isInteger(count)||count<2||count>4)return [];
  const lines=lyrics.lines;
  // Guard against stale/malformed lyrics; the current track must own this data in the caller.
  if(lines.some((line,i)=>!line||!Number.isFinite(line.startMs)||line.startMs<0||
    (i>0&&(!lines[i-1]||line.startMs<lines[i-1].startMs))))return [];
  const previous=normalizeRapDuetAssignmentsV416(existing,lines.length)
    .filter(a=>a.leadSlot<count&&(a.style!=="reply"&&a.style!=="duet"||a.partnerSlot<count));
  const occupied=new Set<number>();
  for(const item of previous)for(let i=item.fromLine;i<=item.toLine;i++)occupied.add(i);
  const out:RapSceneSuggestionV417[]=[];
  const added=new Set<number>();
  const push=(assignment:RapDuetAssignmentV416,signal:RapSceneSuggestionV417["signal"],
    confidence:number,reason:string)=>{
    if(out.length>=40||assignment.toLine>=lines.length)return false;
    for(let i=assignment.fromLine;i<=assignment.toLine;i++)
      if(occupied.has(i)||added.has(i)||!valid(lines[i]))return false;
    for(let i=assignment.fromLine;i<=assignment.toLine;i++)added.add(i);
    out.push({id:idFor(assignment),assignment,signal,confidence,reason});return true;
  };
  // Two or more *consecutive* lines repeated at distant positions are a useful hook hint.
  // A single repeated word/line is never sufficient evidence for a hook.
  const groups=new Map<string,number[]>();
  for(let i=0;i+1<lines.length;i++){
    if(!valid(lines[i])||!valid(lines[i+1]))continue;
    const a=clean(lines[i].text),b=clean(lines[i+1].text);
    if(a.length<9||b.length<9||a.split(" ").length<2||b.split(" ").length<2)continue;
    if(lines[i+1].startMs-lines[i].startMs>10000)continue;
    const key=a+"\u0000"+b;
    const positions=groups.get(key)??[];positions.push(i);groups.set(key,positions);
  }
  for(const [key,positions] of groups){
    if(!key||positions.length<2)continue;
    if(!positions.some((x,j)=>positions.some((y,k)=>j!==k&&Math.abs(x-y)>=4)))continue;
    for(const at of positions){
      const a:RapDuetAssignmentV416={fromLine:at,toLine:at+1,style:"hook",leadSlot:0,
        partnerSlot:1,strength:75};
      push(a,"repeated-lines",.81,"Zwei aufeinanderfolgende Textzeilen wiederholen sich an einer anderen Songstelle.");
    }
  }
  // Mid-line question -> a proposed visual handoff in the *same line*. Not a speaker label.
  for(let i=0;i<lines.length;i++){
    const line=lines[i];if(!valid(line)||occupied.has(i)||added.has(i))continue;
    const middleQuestion=line.text.match(/\?.{5,}/u);
    const next=lines[i+1];
    if(!middleQuestion||!next||!valid(next)||
      (line.endMs??next.startMs)-line.startMs<1500)continue;
    push({fromLine:i,toLine:i,style:"reply",leadSlot:0,partnerSlot:1,strength:60},
      "question-response",.58,"Fragezeichen innerhalb der Zeile: mögliche visuelle Übergabe, keine erkannte zweite Stimme.");
  }
  // Group the remaining time-adjacent lyric lines into bounded verse phrases.
  let phrase=0;
  for(let i=0;i<lines.length&&out.length<40;){
    if(added.has(i)||occupied.has(i)||!valid(lines[i])){i++;continue;}
    let end=i;
    while(end+1<lines.length&&end-i<3&&!added.has(end+1)&&!occupied.has(end+1)&&
      valid(lines[end+1])&&lines[end+1].startMs-lines[end].startMs<=6000&&
      lines[end+1].startMs-lines[i].startMs<=14000)end++;
    const lead=phrase%count;
    push({fromLine:i,toLine:end,style:"solo",leadSlot:lead,partnerSlot:(lead+1)%count,
      strength:55},"verse-phrase",.5,"Zeitlich zusammenhängende Lyrics-Zeilen: vorgeschlagener visueller Solo-Part.");
    phrase++;i=end+1;
  }
  return out.sort((a,b)=>a.assignment.fromLine-b.assignment.fromLine).slice(0,40);
}

/** Explicit acceptance only. Protects ALL saved ranges and respects the V416 150-scene cap. */
export function acceptRapScenesV417(existing:readonly RapDuetAssignmentV416[],
  proposed:readonly RapSceneSuggestionV417[],lineCount:number,count:number):RapDuetAssignmentV416[]{
  const saved=normalizeRapDuetAssignmentsV416(existing,lineCount);
  if(!Number.isInteger(count)||count<2||count>4)return saved;
  const result=[...saved];
  for(const suggestion of proposed.slice(0,40)){
    if(result.length>=150)break;
    const items=normalizeRapDuetAssignmentsV416([suggestion.assignment],lineCount);
    if(items.length!==1)continue;
    const item=items[0];
    if(item.leadSlot>=count||item.partnerSlot>=count||result.some(x=>overlaps(x,item)))continue;
    result.push(item);
  }
  return result;
}

export function editRapSuggestionV417(source:RapSceneSuggestionV417,override:Partial<
  Pick<RapDuetAssignmentV416,"style"|"leadSlot"|"partnerSlot"|"strength">>,count:number):RapSceneSuggestionV417{
  if(!Number.isInteger(count)||count<2||count>4)return source;
  const style:RapDuetStyleV416=["solo","reply","duet","hook"].includes(String(override.style))
    ?override.style as RapDuetStyleV416:source.assignment.style;
  const candidate={...source.assignment,...override,style};
  if(!Number.isInteger(candidate.leadSlot)||candidate.leadSlot<0||candidate.leadSlot>=count||
     !Number.isInteger(candidate.partnerSlot)||candidate.partnerSlot<0||candidate.partnerSlot>=count||
     ((style==="duet"||style==="reply")&&candidate.partnerSlot===candidate.leadSlot))return source;
  const strength=limit(candidate.strength,0,100);
  return {...source,assignment:{...candidate,strength}};
}
