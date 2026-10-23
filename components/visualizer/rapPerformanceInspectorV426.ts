import type {Lyrics} from "@/types/music";
import {buildRapTimingTimelineV418,type RapTimingOffsetsV418} from "./rapPerformanceQualityV418";
import {anchorRapGestureV414,type RapGestureDocumentV414} from "./rapGestureCuesV414";
import {normalizeRapDuetAssignmentsV416,type RapDuetAssignmentV416} from "./rapDuetStudioV416";
import {rapWordKeyV420,type RapMouthDocumentV420} from "./rapSyllableKeyframesV420";

/** All lanes are estimates or explicitly authored instructions, NOT detected audio or rendered GLB measurements. */
export type InspectorLaneV426="lyrics"|"mouth"|"articulation"|"gesture"|"expression"|"rapper";
export type InspectorEventV426={id:string;lane:InspectorLaneV426;startMs:number;endMs:number;label:string;source:"provider"|"estimate"|"authored"};
export type InspectorProposalV426={
 id:string;kind:"smoothness"|"expression"|"remove-role"|"remove-gesture";
 title:string;reason:string;atMs:number;before:number|null;proposed:number|null;
 roleIndex?:number;gestureLine?:number;gestureWord?:number;gestureStartMs?:number;
};
export type InspectorNoteV426={id:string;atMs:number;title:string;detail:string};
export type InspectorReviewV426={events:InspectorEventV426[];proposals:InspectorProposalV426[];notes:InspectorNoteV426[]};
export type InspectorOptionsV426={lyrics:Lyrics|null|undefined;trackId:string;avatarId:string;
 gestureDocument:RapGestureDocumentV414|null;assignments:readonly RapDuetAssignmentV416[];
 mouthDocument?:RapMouthDocumentV420|null;count:number;startMs:number;endMs:number;
 offsets?:Partial<RapTimingOffsetsV418>;syllablesEnabled:boolean;syllableSmoothness:number;
 expressionEnabled:boolean;expressionStrength:number;reducedMotion:boolean};
const valid=(x:unknown):x is number=>typeof x==="number"&&Number.isFinite(x);
const bounded=(x:number,low:number,high:number)=>valid(x)?Math.max(low,Math.min(high,x)):low;
const inWindow=(ms:number,a:number,b:number)=>valid(ms)&&ms>=a&&ms<b;
/** Inspect the selected song. Keep all work bounded, and never mutate source preferences/storage. */
export function inspectRapPerformanceV426(input:InspectorOptionsV426):InspectorReviewV426{
 const output:InspectorReviewV426={events:[],proposals:[],notes:[]};
 const {lyrics,trackId,avatarId}=input;
 if(!trackId||!lyrics?.synced||!Array.isArray(lyrics.lines))return output;
 const a=bounded(input.startMs,0,3.6e7),b=bounded(input.endMs,a,3.6e7);
 if(b<=a)return output;
 const proposal=(s:InspectorProposalV426)=>{if(inWindow(s.atMs,a,b)&&output.proposals.length<24)output.proposals.push(s);};
 const note=(s:InspectorNoteV426)=>{if(inWindow(s.atMs,a,b)&&output.notes.length<24)output.notes.push(s);};
 const add=(e:InspectorEventV426)=>{
  if(valid(e.startMs)&&valid(e.endMs)&&e.endMs>e.startMs&&e.startMs<b&&e.endMs>a&&output.events.length<650)
   output.events.push(e);
 };
 const roles=normalizeRapDuetAssignmentsV416(input.assignments,lyrics.lines.length);
 const existing=buildRapTimingTimelineV418({lyrics,doc:input.gestureDocument,trackId,avatarId,
  assignments:roles,count:Math.min(4,Math.max(1,Math.trunc(input.count))),offsets:input.offsets,startMs:a,endMs:b});
 for(const item of existing){
  const lane:InspectorLaneV426=item.lane==="roles"?"rapper":item.lane;
  add({id:item.id,lane,startMs:item.startMs,endMs:item.endMs,label:item.label,
   source:item.source==="line"||item.source==="word"?"provider":item.source==="authored"?"authored":"estimate"});
  if(item.lane==="roles"&&input.expressionEnabled&&!input.reducedMotion){
   add({id:`expression:${item.id}`,lane:"expression",startMs:item.startMs,endMs:item.endMs,
    label:`V425-Ausdrucksprofil · ${item.label}`,source:"estimate"});
  }
 }
 const wordEdits=input.mouthDocument?.trackId===trackId?input.mouthDocument.edits:[];
 for(let li=0;li<Math.min(lyrics.lines.length,2500);li++){
  const line=lyrics.lines[li];
  if(!valid(line.startMs)||line.startMs<0)continue;
  if(!line.words?.length){
   if(line.text?.trim())note({id:`line-only:${li}`,atMs:line.startMs,title:"Nur Zeilen-Timing",
    detail:"Keine Wortzeitstempel: präzise Artikulationsprüfung ist hier nicht möglich."});
   continue;
  }
  for(let wi=0;wi<Math.min(line.words.length,180);wi++){
   const word=line.words[wi];
   if(!word?.text?.trim()||!valid(word.startMs)||word.startMs<line.startMs)continue;
   const end=Math.min(valid(word.endMs)&&word.endMs>word.startMs?word.endMs:Infinity,
    valid(line.words[wi+1]?.startMs)?line.words[wi+1].startMs:Infinity,
    valid(line.endMs)?line.endMs:Infinity,word.startMs+2100);
   if(!valid(end)||end<=word.startMs)continue;
   if(input.syllablesEnabled){
    const manual=wordEdits.some(e=>e.startMs===word.startMs&&e.text===rapWordKeyV420(word.text));
    add({id:`articulation:${li}:${wi}`,lane:"articulation",startMs:word.startMs,endMs:end,
     label:`${manual?"V420-Keyframes":"V419-Graphem-Schätzung"}: ${word.text}`,source:manual?"authored":"estimate"});
   }
   // Extremely fast words are potential visual articulation bottlenecks, not errors proven by audio.
   if(end-word.startMs<185&&!wordEdits.some(e=>e.startMs===word.startMs&&e.text===rapWordKeyV420(word.text))){
    if(input.syllablesEnabled&&input.syllableSmoothness<85){
     proposal({id:`smooth:${li}:${wi}`,kind:"smoothness",title:`Kurzes Rap-Wort: ${word.text}`,
      reason:`Nur ${Math.round(end-word.startMs)} ms Wortfenster. Sanftere V419-Übergänge ausprobieren (kein erkannter Fehler).`,
      atMs:word.startMs,before:bounded(input.syllableSmoothness,0,100),proposed:Math.min(100,Math.round(bounded(input.syllableSmoothness,0,100)+10))});
    }else note({id:`fast:${li}:${wi}`,atMs:word.startMs,title:`Kurzes Wort: ${word.text}`,
      detail:"Dichtes Worttiming; V419-Vorschläge sind deaktiviert oder bereits stark geglättet."});
   }
  }
 }
 if(input.gestureDocument?.trackId===trackId&&input.gestureDocument.avatarId===avatarId){
  for(const cue of input.gestureDocument.cues.slice(0,160)){
   const anchor=anchorRapGestureV414(lyrics,cue.lineIndex,cue.wordIndex);
   if(anchor!==null&&Math.abs(anchor-cue.startMs)<=5)continue;
   proposal({id:`stale-gesture:${cue.lineIndex}:${cue.wordIndex}`,kind:"remove-gesture",title:"Veralteter Gestenanker",
    reason:"Gespeicherte Geste passt nicht mehr zu den Lyrics-Zeitstempeln. Nur nach Freigabe entfernen.",
    atMs:bounded(cue.startMs,0,3.6e7),before:null,proposed:null,
    gestureLine:cue.lineIndex,gestureWord:cue.wordIndex,gestureStartMs:cue.startMs});
  }
 }
 for(let i=0;i<roles.length;i++){
  const scene=roles[i],start=lyrics.lines[scene.fromLine]?.startMs;
  if(!valid(start))continue;
  const overlap=roles.slice(i+1).some(other=>other.fromLine<=scene.toLine&&other.toLine>=scene.fromLine);
  if(overlap)proposal({id:`role-overlap:${i}`,kind:"remove-role",title:"Überlappende Rapper-Szenen",
   reason:"Später gespeicherte V416-Szenen haben Vorrang. Die ältere Szene kann bewusst entfernt werden.",
   atMs:start,before:null,proposed:null,roleIndex:i});
  if(input.count>=2&&input.expressionEnabled&&input.expressionStrength>85&&scene.style==="hook"){
   proposal({id:`expression:${i}`,kind:"expression",title:"Starker Hook-Ausdruck",
    reason:"Das V425-Hook-Profil ist hoch eingestellt. Zum visuellen Vergleich vorsichtiger reduzieren.",
    atMs:start,before:bounded(input.expressionStrength,0,100),proposed:Math.max(0,Math.round(bounded(input.expressionStrength,0,100)-15))});
  }
 }
 output.events.sort((x,y)=>x.startMs-y.startMs||x.id.localeCompare(y.id));
 output.proposals.sort((x,y)=>x.atMs-y.atMs||x.id.localeCompare(y.id));
 output.notes.sort((x,y)=>x.atMs-y.atMs||x.id.localeCompare(y.id));
 return output;
}
/** A draft is clamped and applied only when the user explicitly confirms it. */
export function normalizeInspectorDraftV426(s:InspectorProposalV426,value:number):number|null{
 if(s.kind!=="smoothness"&&s.kind!=="expression")return null;
 return Math.round(bounded(value,0,100));
}
