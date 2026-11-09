import type {Lyrics} from '../types/playbackCore';
import {concertStoryV1131,type StoryInputV1131,type StoryCueV1131} from './concertStoryV1131';
import {lyricSpotlightV1133} from './lyricSpotlightV1133';
import {normalizeLyricTimingV1134} from './lyricTimingV1134';
export type ConcertScoreV1134=StoryCueV1131 & {
 staging:'opening'|'verse'|'anticipation'|'chorus'|'reading'|'breath'|'finale';
 reading:boolean;accent:number;beamGain:number;motionGain:number;exchange:number;scoreKey:string;
};
const cache=new WeakMap<Lyrics,Lyrics|null>();
function safeLyrics(lyrics:Lyrics|null|undefined){if(!lyrics)return null;if(!cache.has(lyrics))cache.set(lyrics,normalizeLyricTimingV1134(lyrics));return cache.get(lyrics)!;}
/** Shared, seekable score. Lyric repetition is a structural hint, not audio/semantic AI analysis. */
export function concertScoreV1134(input:StoryInputV1131):ConcertScoreV1134{
 const lyrics=safeLyrics(input.lyrics),pos=Number.isFinite(input.progressMs)?Math.max(0,input.progressMs):0;
 const cue=concertStoryV1131({...input,progressMs:pos,lyrics});
 const spotlight=lyricSpotlightV1133(lyrics,pos);
 const count=Math.max(1,Math.min(4,Math.round(input.count??1)||1));
 // Wall-song-time blocks keep role changes deterministic across BPM updates and seeks.
 const phrase=Math.floor(pos/8000),exchange=Math.floor(pos/16000);
 const normalized=(s:string)=>s.toLocaleLowerCase().replace(/[^\p{L}\p{N}]/gu,'');
 const repeated=new Map<string,number>();
 for(const l of lyrics?.synced?lyrics.lines:[]){const key=normalized(l.text);if(key.length>8)repeated.set(key,(repeated.get(key)??0)+1);}
 const nextHook=lyrics?.synced?lyrics.lines.find(l=>l.startMs>pos&&(repeated.get(normalized(l.text))??0)>1):undefined;
 const anticipation=cue.act!=='lift'&&cue.act!=='impact'&&cue.act!=='finale'&&!!nextHook&&nextHook.startMs-pos<=3000;
 const opening=pos<6000&&cue.act==='story';
 const reading=spotlight.mode==='rap';
 const staging:ConcertScoreV1134['staging']=reading?'reading':cue.act==='finale'?'finale':cue.act==='lift'?'chorus':anticipation?'anticipation':opening?'opening':cue.act==='breathe'?'breath':'verse';
 const act=reading?'story':anticipation?'build':opening?'breathe':cue.act;
 const interaction=reading?'solo':act==='breathe'?'rest':act==='impact'||act==='finale'||act==='lift'&&cue.chorusVisit>=3?'unison':
 count<2?'solo':act==='build'||act==='lift'?'answer':exchange%3===2?'solo':phrase%2?'duel':'answer';
 const leader=act==='lift'?Math.max(0,cue.chorusVisit-1)%count:exchange%count;
 const partner=count>1?(leader+1+Math.floor(exchange/count)%(count-1))%count:leader;
 const mode=interaction==='unison'?'unison':interaction==='rest'?'individual':interaction==='answer'?'canon':'spotlight';
 const line=spotlight.lineIndex>=0?lyrics!.lines[spotlight.lineIndex]:null;
 const hookStart=act==='lift'?lyrics?.lines.find(l=>l.startMs<=pos&&pos<=(l.endMs??l.startMs+4000)&&(repeated.get(normalized(l.text))??0)>1)?.startMs:undefined;
 // A short eased accent at a phrase/chorus entry; no repeated strobe and no invented word sync.
 const entry=hookStart??(Math.floor(pos/16000)*16000);
 const age=pos-entry;
 const envelope=age>=0&&age<1200?Math.sin(Math.PI*age/1200)**2:0;
 const keyActive=spotlight.mode==='anthem'&&spotlight.currentWord>=0&&spotlight.currentWord===spotlight.keyWord;
 const accent=reading||act==='breathe'||anticipation?0:Math.min(1,envelope*(act==='lift'||act==='finale'?.8:.28)+(keyActive?.18:0));
 const chapter=reading?'Text im Fokus · ruhige Begleitung':anticipation?'Vor dem Refrain · Spannung sammeln':opening?'Die Crew betritt die Bühne':cue.chapter;
 return {...cue,phrase,act,mode,leader,partner,interaction,chapter,staging,reading,accent,exchange,
 scoreKey:reading?`reading-${Math.floor((line?.startMs??pos)/16000)}`:`${staging}-${exchange}`,
 reason:reading?'Schnelle Lyrics: ruhige Kamera und zurückhaltende Crew':anticipation?'Refrain-Vorschau aus vorhandenen Lyrics':cue.reason,
 intensity:reading?.36:anticipation?.46:opening?.2:cue.intensity,
 cameraSide:reading||interaction==='unison'?0:count>1?(leader-(count-1)/2)*.10:0,
 cameraScale:staging==='chorus'||staging==='finale'?1.07:reading?1:interaction==='duel'?1.035:1,
 motionGain:reading?.12:anticipation?.35:act==='breathe'?.25:1,
 lightGain:reading?.68:anticipation?.72:cue.lightGain*(1+accent*.10),
 beamGain:reading?.38:anticipation?.55:act==='breathe'?.55:1+accent*.22,
 lyricGain:reading?1:cue.lyricGain};
}
export type ScoreCameraV1134={x:number;y:number;z:number;fov:number};
export type ScoreCameraStateV1134={key:string;anchor:ScoreCameraV1134|null};
export const newScoreCameraV1134=():ScoreCameraStateV1134=>({key:'',anchor:null});
/** Last automatic composition, before existing smoothing. Explicit camera ownership always wins. */
export function composeScoreCameraV1134<T extends ScoreCameraV1134>(base:T,cue:ConcertScoreV1134|null,state:ScoreCameraStateV1134,
 guard:{playing:boolean;reducedMotion:boolean;protectedShot:boolean},current:ScoreCameraV1134):T{
 if(!cue||guard.protectedShot||guard.reducedMotion){state.key='';state.anchor=null;return base;}
 if(cue.reading||!guard.playing){
  const key=guard.playing?'reading':'pause';
  if(state.key!==key||!state.anchor){state.key=key;state.anchor={...current};}
  return {...base,...state.anchor};
 }
 state.key='';state.anchor=null;
 return {...base,x:base.x+cue.cameraSide,y:base.y,z:base.z*cue.cameraScale,fov:Math.max(28,Math.min(65,base.fov+(cue.cameraScale-1)*14))};
}
