import {dialogueMotifs} from './crewDialogue';
import type {MotifTaste} from './showTaste';
export type SongShowMemory={phase:'seed'|'refrain'|'recall'|'response'|'unite';clip:string;theme:string;contrast:string;gain:number;finaleProgress:number};
/** A complete song motif is reconstructed from identity, not a hidden playback session. */
export function songShowMemory(input:{trackId:string;genre?:string|null;taste?:MotifTaste;positionMs:number;durationMs?:number;
 act:string;chorusVisit:number;reading:boolean;anticipation:boolean}):SongShowMemory|null{
 if(input.reading||input.anticipation||!Number.isFinite(input.positionMs))return null;
 let phase:SongShowMemory['phase']|null=null,progress=0;
 if(input.act==='story'&&input.chorusVisit===0&&input.positionMs>=16000&&input.positionMs<24000)phase='seed';
 else if(input.act==='lift'&&input.chorusVisit>0&&(Math.floor(input.positionMs/8000)+input.chorusVisit)%2===0)phase='refrain';
 else if(input.act==='finale'&&Number.isFinite(input.durationMs)&&input.durationMs!>0){
  progress=Math.max(0,Math.min(1,(input.positionMs/input.durationMs!-.9)/.1));
  phase=progress<1/3?'recall':progress<2/3?'response':'unite';
 }
 if(!phase)return null;
 const pair=dialogueMotifs(input.trackId,input.genre,0,input.taste);
 const clip=phase==='response'||phase==='refrain'&&input.chorusVisit%2===0?pair.contrast:pair.call;
 return {phase,clip,theme:pair.call,contrast:pair.contrast,gain:phase==='seed'?1:phase==='refrain'?1+Math.min(3,input.chorusVisit)*.04:1.12,finaleProgress:progress};
}
