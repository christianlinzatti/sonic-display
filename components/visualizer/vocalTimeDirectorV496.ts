/** Structural counterpart of V416 cue; avoid coupling the independent time planner to Lyrics. */
type RapDuetCueV416={active:boolean;style:"solo"|"reply"|"duet"|"hook"|null;lineIndex:number;
 leadSlot:number;partnerSlot:number|null;singingSlots:number[];handoffFrom:number|null;
 phase:number;emphasis:number;startMs:number;endMs:number;source:"none"|"line-timed"|"word-timed";count:number};

/** Explicit editorial voice/performer cues; not vocal diarization or a claim about the recording. */
export type VocalTimeStyleV496="solo"|"duet"|"hook";
export type VocalTimeRoleV547="verse"|"feature"|"hook"|"adlib";
export type VocalTimeSegmentV496={startMs:number;endMs:number;leadSlot:number;partnerSlot:number;style:VocalTimeStyleV496;strength:number;
  /** V547 explicit visual direction, not inferred from track credits or lyrics. */
  roleV547?:VocalTimeRoleV547;singerSlotsV547?:number[]};
export type VocalTimeLibraryV496=Record<string,VocalTimeSegmentV496[]>;
const MAX_MS=4*60*60*1000;
const limit=(value:number,min:number,max:number)=>Math.max(min,Math.min(max,value));
const neutral=(count:number):RapDuetCueV416=>({active:false,style:null,lineIndex:-1,leadSlot:0,
 partnerSlot:null,singingSlots:[],handoffFrom:null,phase:1,emphasis:0,startMs:0,endMs:0,source:"none",count});
/** JSON boundary: strict integer millisecond intervals; preserve edit order (last matching entry wins). */
export function normalizeVocalTimeSegmentsV496(raw:unknown,durationMs=MAX_MS):VocalTimeSegmentV496[]{
 if(!Array.isArray(raw))return [];
 const max=Number.isFinite(durationMs)&&durationMs>0?Math.min(MAX_MS,Math.floor(durationMs)):MAX_MS;
 return raw.slice(0,120).flatMap((item):VocalTimeSegmentV496[]=>{
  if(!item||typeof item!=="object"||Array.isArray(item))return [];
  const x=item as Record<string,unknown>;
  if(!Number.isSafeInteger(x.startMs)||!Number.isSafeInteger(x.endMs)||
     !Number.isInteger(x.leadSlot)||!Number.isInteger(x.partnerSlot)||
     typeof x.strength!=="number"||!Number.isFinite(x.strength)||
     (x.style!=="solo"&&x.style!=="duet"&&x.style!=="hook"))return [];
  const start=x.startMs as number,end=x.endMs as number,lead=x.leadSlot as number,partner=x.partnerSlot as number;
  if(start<0||end<=start||end>max||lead<0||lead>3||partner<0||partner>3||
    (x.style==="duet"&&lead===partner))return [];
  const roleV547=x.roleV547;
  if(roleV547!==undefined&&roleV547!=="verse"&&roleV547!=="feature"&&
     roleV547!=="hook"&&roleV547!=="adlib")return [];
  let singerSlotsV547:number[]|undefined;
  if(x.singerSlotsV547!==undefined){
   if(!Array.isArray(x.singerSlotsV547)||x.singerSlotsV547.length<1||x.singerSlotsV547.length>4||
      x.singerSlotsV547.some(v=>!Number.isInteger(v)||v<0||v>3)||
      new Set(x.singerSlotsV547).size!==x.singerSlotsV547.length||
      !x.singerSlotsV547.includes(lead))return [];
   singerSlotsV547=[...x.singerSlotsV547].sort((a,b)=>a-b);
  }
  if(roleV547==="hook"&&x.style!=="hook")return [];
  if(singerSlotsV547&&x.style==="solo"&&singerSlotsV547.length!==1)return [];
  if(singerSlotsV547&&x.style==="duet"&&
     (singerSlotsV547.length!==2||!singerSlotsV547.includes(partner)))return [];
  if(roleV547==="adlib"&&x.style!=="solo")return [];
  const entry:VocalTimeSegmentV496={startMs:start,endMs:end,leadSlot:lead,partnerSlot:partner,
   style:x.style,strength:Math.round(limit(x.strength,0,100))};
  if(roleV547!==undefined)entry.roleV547=roleV547;
  if(singerSlotsV547!==undefined)entry.singerSlotsV547=singerSlotsV547;
  return [entry];
 });
}
export function normalizeVocalTimeLibraryV496(raw:unknown):VocalTimeLibraryV496{
 if(!raw||typeof raw!=="object"||Array.isArray(raw))return {};
 const out:VocalTimeLibraryV496=Object.create(null) as VocalTimeLibraryV496;
 for(const [trackId,entries] of Object.entries(raw).slice(0,180)){
  if(!trackId||trackId.length>180||["__proto__","prototype","constructor"].includes(trackId))continue;
  const segments=normalizeVocalTimeSegmentsV496(entries);
  if(segments.length)out[trackId]=segments;
 }
 return out;
}
/** Exact timestamp-based lip and stage focus; no inferred voice identity or lyric dependency. */
export function resolveVocalTimeCueV496(input:{
 trackId:string;progressMs:number;playing:boolean;count:number;enabled:boolean;
 segments:readonly VocalTimeSegmentV496[]|undefined;manualPriority?:boolean;reducedMotion?:boolean;
}):RapDuetCueV416{
 const count=Number.isFinite(input.count)?Math.trunc(limit(input.count,1,4)):1;
 const off=neutral(count),now=input.progressMs;
 if(!input.enabled||!input.playing||input.manualPriority||!input.trackId||
   count<2||!Number.isFinite(now)||now<0||now>MAX_MS||!input.segments?.length)return off;
 const items=normalizeVocalTimeSegmentsV496(input.segments);
 let selected:VocalTimeSegmentV496|undefined;
 const adlibs:VocalTimeSegmentV496[]=[];
 for(const item of items){
  if(item.startMs>now||now>=item.endMs||item.leadSlot>=count||
    (item.style==="duet"&&item.partnerSlot>=count))continue;
  // A backing adlib adds the marked singer; it must never steal the lead of a base verse.
  if(item.roleV547==="adlib")adlibs.push(item);
  else selected=item; // Last authored overlapping base segment wins, as in V496.
 }
 // An isolated adlib is a solo, but while a verse is present it is only an overlay.
 if(!selected)selected=adlibs[adlibs.length-1];
 if(!selected)return off;
 const elapsed=now-selected.startMs;
 const previous=items.filter(item=>item!==selected&&item.endMs<=selected.startMs&&
   selected.startMs-item.endMs<=900&&item.leadSlot<count&&item.roleV547!=="adlib")
   .sort((a,b)=>b.endMs-a.endMs)[0];
 const handoffFrom=previous&&previous.leadSlot!==selected.leadSlot&&elapsed<650&&!input.reducedMotion?
   previous.leadSlot:null;
 const baseSlots=selected.singerSlotsV547?.filter(i=>i<count)??
   (selected.style==="hook"?Array.from({length:count},(_,i)=>i):
   selected.style==="duet"?[selected.leadSlot,selected.partnerSlot]:[selected.leadSlot]);
 // Overlay adlibs only during their authored interval, excluding invalid/missing avatar slots.
 // They do not alter the selected lead, camera handoff or base segment precedence.
 const singerSlots=[...new Set([...baseSlots,...adlibs.filter(a=>a!==selected).map(a=>a.leadSlot)])];
 const attack=Math.min(1,elapsed/160),release=Math.min(1,(selected.endMs-now)/160);
 return {active:true,style:selected.style,lineIndex:-1,leadSlot:selected.leadSlot,
  partnerSlot:selected.style==="duet"?selected.partnerSlot:null,
  singingSlots:singerSlots,handoffFrom,phase:handoffFrom===null?1:limit(elapsed/650,0,1),
  emphasis:(input.reducedMotion?0:1)*(selected.strength/100)*Math.max(0,attack)*Math.max(0,release),
  startMs:selected.startMs,endMs:selected.endMs,source:"none",count};
}
