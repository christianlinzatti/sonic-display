import type {Lyrics} from '../types/playbackCore';
import {showCueV1130,lyricDensityV1130,lyricSectionV1130,type ShowCueV1130} from './showIntelligenceV1130';
export const FOOTWORK_CLIPS_V1131=['Dance_SideGlide','Dance_DiagonalStep','Dance_HeelToe','Dance_PivotStep'] as const;
export type InteractionV1131='rest'|'solo'|'duel'|'answer'|'unison';
export type StoryInputV1131={progressMs:number;durationMs?:number;bpm?:number|null;genre?:string|null;
 section?:string|null;energy?:number|null;lyrics?:Lyrics|null;lyricDensity?:number;count?:number};
export type StoryCueV1131=ShowCueV1130 & {chorusVisit:number;chapter:string;interaction:InteractionV1131;
 leader:number;partner:number;cameraScale:number;cameraSide:number;lightGain:number;lyricGain:number;};
const normalize=(s:string)=>s.toLocaleLowerCase().replace(/[^\p{L}\p{N}]/gu,'');
/** Repeated lyric blocks supply structure, not measured beats or audio-section predictions. */
export function chorusVisitsV1131(lyrics:Lyrics|null|undefined,progressMs:number):number{
 if(!lyrics?.synced||!Number.isFinite(progressMs))return 0;
 const counts=new Map<string,number>();
 for(const line of lyrics.lines){const key=normalize(line.text);if(key.length>8)counts.set(key,(counts.get(key)??0)+1);}
 let visits=0,last=-Infinity;
 for(const line of lyrics.lines){
  if(line.startMs>progressMs)break;
  if((counts.get(normalize(line.text))??0)<2)continue;
  if(line.startMs-last>12000)visits++;
  last=line.startMs;
 }
 return visits;
}
/** A single deterministic score shared by dance, body language, camera, light and lyrics. */
export function concertStoryV1131(input:StoryInputV1131):StoryCueV1131{
 const progressMs=Number.isFinite(input.progressMs)?Math.max(0,input.progressMs):0;
 const duration=input.durationMs&&Number.isFinite(input.durationMs)?Math.max(1,input.durationMs):0;
 const inferred=lyricSectionV1130(input.lyrics,progressMs);
 const section=input.section&&input.section!=='verse'?input.section:inferred??input.section;
 const density=input.lyricDensity??lyricDensityV1130(input.lyrics,progressMs);
 const cue=showCueV1130({...input,section,progressMs,lyricDensity:density});
 const visits=chorusVisitsV1131(input.lyrics,progressMs);
 const count=Math.max(1,Math.min(4,Math.round(input.count??1)||1));
 let leader=cue.phrase%count;
 const late=duration>0&&progressMs/duration>=.90&&cue.act!=='breathe'&&cue.act!=='build';
 const act=late?'finale':cue.act;
 const escalation=act==='lift'?Math.min(3,Math.max(1,visits)):act==='finale'?4:0;
 const interaction:InteractionV1131=act==='breathe'?'rest':act==='finale'||act==='impact'||(act==='lift'&&escalation>=3)?'unison':
 count<2?'solo':act==='build'?'answer':act==='lift'?'answer':density>.7?'solo':cue.phrase%2?'duel':'answer';
 if(interaction==='answer')leader=0;
 const partner=(leader+1)%count;
 const mode=interaction==='unison'?'unison':interaction==='rest'?'individual':interaction==='answer'?'canon':'spotlight';
 const chapter=act==='finale'?'Das große Finale':act==='lift'?`Refrain ${Math.max(1,visits)} · ${escalation===1?'Auftakt':escalation===2?'Steigerung':'Alle zusammen'}`:
 act==='breathe'?'Raum zum Atemholen':act==='build'?'Spannung & Antwort':act==='impact'?'Gemeinsamer Höhepunkt':interaction==='duel'?'Tanzduell':'Ruf & Antwort';
 const intensity=Math.min(.95,cue.intensity+(act==='lift'?escalation*.045:act==='finale'?.16:0));
 return {...cue,act,mode,label:act==='finale'?'Finale':cue.label,chapter,chorusVisit:visits,interaction,leader,partner,intensity,
 cameraScale:interaction==='unison'?1.04+escalation*.015:interaction==='duel'?1.025:act==='breathe'?1.02:1,
 cameraSide:count>1&&interaction!=='unison'?Math.sin((leader+1)*1.7)*.09:0,
 lightGain:act==='breathe'?.68:Math.min(1.35,.8+intensity*.5),
 lyricGain:act==='lift'||act==='finale'?1+Math.min(3,escalation)*.018:1};
}
export function crewInteractionV1131(cue:StoryCueV1131,slot:number,count:number){
 const safeCount=Math.max(1,Math.min(4,Math.round(count)||1));
 const lead=slot===cue.leader,partner=slot===cue.partner;
 const role=cue.interaction==='rest'?'rest':cue.interaction==='unison'?'together':lead?'lead':cue.interaction==='duel'&&partner?'partner':'echo';
 const target=lead?cue.partner:cue.leader;
 const direction=target>slot?1:target<slot?-1:0;
 return {role,yaw:safeCount>1&&cue.interaction!=='unison'&&cue.interaction!=='rest'?direction*(lead?.045:.09):0,
 armAccent:role==='lead'||role==='partner'?.055:role==='echo'?.025:0,
 beatOffset:cue.interaction==='answer'&&!lead?-((slot-cue.leader+safeCount)%safeCount)*2:cue.interaction==='duel'&&partner?-2:0};
}
export function storyFootworkV1131(cue:StoryCueV1131,slot:number):string|null{
 if(cue.act==='breathe'||cue.lyricDensity>.8&&cue.act==='story')return null;
 const index=(cue.phrase+(cue.interaction==='unison'||cue.interaction==='answer'?0:slot)+Math.max(0,cue.chorusVisit-1))%FOOTWORK_CLIPS_V1131.length;
 return FOOTWORK_CLIPS_V1131[index];
}
/** Compose before the existing camera smoothing; never touch protected/manual shots. */
export function composeStoryCameraV1131<T extends {x:number;y:number;z:number;fov:number}>(base:T,cue:StoryCueV1131|null,guard:{playing:boolean;reducedMotion:boolean;protectedShot:boolean}):T{
 if(!cue||!guard.playing||guard.reducedMotion||guard.protectedShot)return base;
 return {...base,x:base.x+cue.cameraSide,z:base.z*cue.cameraScale,fov:Math.max(28,Math.min(65,base.fov+(cue.cameraScale-1)*12))};
}
