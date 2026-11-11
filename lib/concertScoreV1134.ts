import {planShowProduction,type ProductionPlan} from './showProduction';
import {musicalDirection} from './musicalEvidence';
import {chooseShowShot} from './showExperience';
import {songShowMemory,type SongShowMemory} from './songShowMemory';
import {crewDialogue,type CrewDialogue} from './crewDialogue';
import {concertInstrumentalGap,nextConcertRefrain,concertRefrainVisit,concertLyricSection} from './concertLyricTimeline';
import {showJumpV1136,sampledJumpV1136,validPlaybackSampleV1136,type ShowClockV1136,type PlaybackSampleV1136} from './showContinuityV1136';
import type {Lyrics} from '../types/playbackCore';
import {concertStoryV1131,type StoryInputV1131,type StoryCueV1131} from './concertStoryV1131';
import {lyricSpotlightV1133} from './lyricSpotlightV1133';
import {normalizeLyricTimingV1134} from './lyricTimingV1134';
export type ConcertScoreV1134=StoryCueV1131 & {
 staging:'opening'|'verse'|'anticipation'|'chorus'|'reading'|'breath'|'finale'|'instrumental';
 production?:ProductionPlan;concert?:boolean;music:ReturnType<typeof musicalDirection>;shot:number;memory?:SongShowMemory;lyricFocus:boolean;phraseEnvelope:number;dialogue?:CrewDialogue;anticipationProgress:number;positionMs:number;sourceKey:string;playback?:PlaybackSampleV1136;reading:boolean;accent:number;beamGain:number;motionGain:number;exchange:number;scoreKey:string;
};
const cache=new WeakMap<Lyrics,Lyrics|null>();
function safeLyrics(lyrics:Lyrics|null|undefined){if(!lyrics)return null;if(!cache.has(lyrics))cache.set(lyrics,normalizeLyricTimingV1134(lyrics));return cache.get(lyrics)!;}
/** Shared, seekable score. Lyric repetition is a structural hint, not audio/semantic AI analysis. */
export function concertScoreV1134(input:StoryInputV1131):ConcertScoreV1134{
 const lyrics=safeLyrics(input.lyrics),pos=Number.isFinite(input.progressMs)?Math.max(0,input.progressMs):0;
 const music=musicalDirection(input.audioEvidence),shot=chooseShowShot(input.history,input.trackId??'sonic-show');
 const cue=concertStoryV1131({...input,progressMs:pos,lyrics});
 const spotlight=lyricSpotlightV1133(lyrics,pos);
 const count=Math.max(1,Math.min(4,Math.round(input.count??1)||1));
 // Wall-song-time blocks keep role changes deterministic across BPM updates and seeks.
 const phrase=Math.floor(pos/8000),exchange=Math.floor(pos/16000);
 const nextHook=nextConcertRefrain(lyrics,pos);
 const anticipation=spotlight.mode!=='rap'&&cue.act!=='lift'&&cue.act!=='impact'&&cue.act!=='finale'&&nextHook!==null&&nextHook-pos<=3000;
 const anticipationProgress=anticipation?(1-Math.cos(Math.PI*(1-(nextHook!-pos)/3000)))/2:0;
 const opening=pos<6000&&cue.act==='story';
 const gap=concertInstrumentalGap(lyrics,pos);
 const instrumental=!anticipation&&!!gap&&pos>=gap.start+1000&&pos<gap.end-2000&&cue.energy>=.4&&(!input.section||input.section==='verse')&&cue.act==='breathe';
 const gapEnvelope=instrumental?Math.sin(Math.PI*(pos-gap!.start)/(gap!.end-gap!.start))**2:0;
 const phraseEnvelope=Math.sin(Math.PI*(pos%8000)/8000)**2;
 const duration=Number.isFinite(input.durationMs)&&input.durationMs!>0?input.durationMs!:0;
 const lastEnd=lyrics?.synced?lyrics.lines.at(-1)?.endMs:undefined;
 const closingTail=cue.act==='breathe'&&cue.energy>=.4&&(!input.section||input.section==='verse')&&duration>0&&
  typeof lastEnd==='number'&&Number.isFinite(lastEnd)&&lastEnd>0&&lastEnd<=duration&&duration-lastEnd<=3000&&pos>=lastEnd&&pos<=duration;
 const reading=spotlight.mode==='rap';
 const staging:ConcertScoreV1134['staging']=reading?'reading':closingTail?'finale':instrumental?'instrumental':cue.act==='finale'?'finale':cue.act==='lift'?'chorus':anticipation?'anticipation':opening?'opening':cue.act==='breathe'?'breath':'verse';
 const act=closingTail?'finale':reading||instrumental?'story':anticipation?'build':opening?'breathe':cue.act;
 const keyActive=spotlight.mode==='anthem'&&spotlight.currentWord>=0&&spotlight.currentWord===spotlight.keyWord,lyricFocus=reading||keyActive;
 const production=input.showPlans===true?planShowProduction({trackId:input.trackId??'sonic-show',genre:input.genre,lyrics,taste:input.taste,history:input.history,choice:input.showStyle,take:input.showTake,act,phrase,chorusVisit:cue.chorusVisit,reading,lyricFocus}):undefined;
 const showTakeSeed=production?`${input.trackId??'sonic-show'}:${production.id}:${production.take}`:undefined;
 const memory=songShowMemory({trackId:input.trackId??'sonic-show',genre:input.genre,taste:input.taste,history:input.history,seedKey:showTakeSeed,preferredMotif:production?.motif,positionMs:pos,durationMs:input.durationMs,
  act,chorusVisit:cue.chorusVisit,reading,anticipation});
 const dialogue=!reading&&act==='story'&&staging==='verse'&&cue.lyricDensity<=.55?crewDialogue(phrase,count):null;
 let interaction:StoryCueV1131['interaction']=reading?'solo':act==='breathe'?'rest':act==='impact'||act==='finale'||act==='lift'&&cue.chorusVisit>=3?'unison':
 count<2?'solo':act==='build'||act==='lift'?'answer':exchange%3===2?'solo':phrase%2?'duel':'answer';
 let leader=anticipation?Math.max(0,concertRefrainVisit(lyrics,nextHook!)-1)%count:
 act==='lift'?Math.max(0,cue.chorusVisit-1)%count:exchange%count;
 let partner=count>1?(leader+1+Math.floor(exchange/count)%(count-1))%count:leader;
 if(dialogue){
  interaction=dialogue.phase==='reunion'?'unison':'duel';
  leader=dialogue.phase==='reply'?dialogue.responder:dialogue.caller;
  partner=dialogue.phase==='reply'?dialogue.caller:dialogue.responder;
 }
 const mode=interaction==='unison'?'unison':interaction==='rest'?'individual':interaction==='answer'?'canon':'spotlight';
 const line=spotlight.lineIndex>=0?lyrics!.lines[spotlight.lineIndex]:null;
 const hookStart=act==='lift'&&line&&concertLyricSection(lyrics,pos)==='hook'?line.startMs:undefined;
 // A short eased accent at a phrase/chorus entry; no repeated strobe and no invented word sync.
 const entry=hookStart??(Math.floor(pos/16000)*16000);
 const age=pos-entry;
 const envelope=age>=0&&age<1200?Math.sin(Math.PI*age/1200)**2:0;
 const accent=reading||act==='breathe'||anticipation?0:Math.min(1,envelope*(act==='lift'||act==='finale'?.8:.28)+(keyActive?.18:0));
 const chapter=memory?.phase==='seed'?'Das Song-Motiv entsteht':memory&&act==='finale'?`Das große Finale · ${memory.phase==='recall'?'Das Motiv kehrt zurück':memory.phase==='response'?'Die Antwort der Crew':'Alle zusammen'}`:instrumental?'Instrumental · Bühne im Fokus':dialogue?`Tanzdialog · ${dialogue.phase==='call'?'Motiv vorstellen':dialogue.phase==='reply'?'Antwort übernehmen':'Wieder zusammen'}`:reading?'Text im Fokus · ruhige Begleitung':anticipation?'Vor dem Refrain · Spannung sammeln':opening?'Die Crew betritt die Bühne':cue.chapter;
 return {...cue,...(production?{production,showTakeSeed,showMotif:production.motif,palette:production.color}:{}),concert:input.concert,music,shot,...(memory?{memory}:{}),lyricFocus,phraseEnvelope,...(dialogue?{dialogue}:{}),anticipationProgress,positionMs:pos,playback:input.playback,sourceKey:input.trackId?`track:${input.trackId}`:`lyrics:${input.durationMs??0}:${lyrics?.plainText??lyrics?.lines[0]?.text??''}`,phrase,act,mode,leader,partner,interaction,chapter,staging,reading,accent,exchange,
 scoreKey:reading?`reading-${Math.floor((line?.startMs??pos)/16000)}`:`${staging}-${exchange}`,
 reason:dialogue?'Ein Motiv wandert zwischen den Figuren und kehrt gemeinsam zurück':reading?'Schnelle Lyrics: ruhige Kamera und zurückhaltende Crew':anticipation?'Refrain-Vorschau aus vorhandenen Lyrics':cue.reason,
 intensity:reading?.36:anticipation?.32+anticipationProgress*.18:opening?.2:closingTail?.8:cue.intensity,
 cameraSide:lyricFocus||anticipation||interaction==='unison'?0:count>1?(leader-(count-1)/2)*.10*phraseEnvelope:0,
 cameraScale:reading?1:instrumental?1.03+gapEnvelope*.04:staging==='finale'?1.10+(memory?.finaleProgress??1)*.03:staging==='chorus'?1.05+Math.min(3,Math.max(1,cue.chorusVisit))*.02:dialogue?.phase==='reunion'?1.035:anticipation?1.01+anticipationProgress*.03:interaction==='duel'?1.035:act==='breathe'?1.02:1,
 motionGain:music.quiet?.12:reading?.12:anticipation?.22+anticipationProgress*.18:act==='breathe'?.25:1,
 lightGain:music.quiet?.60:reading?.68:closingTail?1.14:instrumental?.95+gapEnvelope*.15:anticipation?.60+anticipationProgress*.20:cue.lightGain*(production?.lightGain??1)*(input.concert&&!lyricFocus?1.06:1)*(1+accent*.10)*(lyricFocus?1:1+music.pulse*.10)*(dialogue?.phase==='reunion'?1.04:1),
 beamGain:reading?.38:lyricFocus?.75:instrumental?.9+gapEnvelope*.2:anticipation?.35+anticipationProgress*.30:act==='breathe'?.55:(1+accent*.22)*(production?.beamGain??1)*(dialogue?.phase==='reunion'?1.03:1),
 lyricGain:reading?1:cue.lyricGain};
}
export type ScoreCameraV1134={x:number;y:number;z:number;fov:number};
export type ScoreCameraStateV1134={key:string;anchor:ScoreCameraV1134|null;clock?:ShowClockV1136|null;clockAtMs?:number;clockPlaying?:boolean;playback?:PlaybackSampleV1136|null};
export const newScoreCameraV1134=():ScoreCameraStateV1134=>({key:'',anchor:null});
/** Last automatic composition, before existing smoothing. Explicit camera ownership always wins. */
export function composeScoreCameraV1134<T extends ScoreCameraV1134>(base:T,cue:ConcertScoreV1134|null,state:ScoreCameraStateV1134,
 guard:{playing:boolean;reducedMotion:boolean;protectedShot:boolean;nowMs?:number;viewportAspect?:number},current:ScoreCameraV1134):T{
 if(!cue||guard.protectedShot||guard.reducedMotion){state.key='';state.anchor=null;state.clock=null;state.clockAtMs=undefined;state.clockPlaying=undefined;state.playback=null;return base;}
 const nextClock={source:cue.sourceKey,positionMs:cue.positionMs};
 const now=Number.isFinite(guard.nowMs)?guard.nowMs!:undefined;
 const elapsed=guard.playing&&state.clockPlaying!==false&&now!==undefined&&state.clockAtMs!==undefined?Math.max(0,now-state.clockAtMs):0;
 const sourceChanged=!!state.clock&&state.clock.source!==nextClock.source;
 const playback=cue.playback;
 let jumped=sourceChanged;
 if(validPlaybackSampleV1136(playback)){
  jumped=jumped||sampledJumpV1136(state.playback,playback);
  if(sourceChanged||!state.playback||playback.fetchedAt>=state.playback.fetchedAt)state.playback={...playback};
 }else if(state.clock)jumped=jumped||showJumpV1136(state.clock,nextClock,elapsed);
 const reacquire=jumped&&!!state.anchor;
 if(Number.isFinite(cue.positionMs)){
  if(!state.clock||state.clock.positionMs!==nextClock.positionMs||state.clock.source!==nextClock.source||state.clockPlaying!==guard.playing)state.clockAtMs=now;
  state.clock=nextClock;state.clockPlaying=guard.playing;
 }
 if(jumped){state.key='';state.anchor=null;}
 if(cue.reading||cue.lyricFocus||!guard.playing){
  const key=guard.playing?'reading':'pause';
  if(state.key!==key||!state.anchor){state.key=key;state.anchor={...(reacquire?base:current)};}
  return {...base,...state.anchor};
 }
 state.key='';state.anchor=null;
 const shotSide=cue.interaction==='unison'||cue.act==='breathe'||cue.act==='build'?0:([0,.045,-.045,0][cue.shot]??0)*cue.phraseEnvelope;
 const concertGain=cue.concert&&Number.isFinite(guard.viewportAspect)&&guard.viewportAspect!>=1.15?.78:1;
 const sceneSide=cue.production?.scene==='dialogue'?cue.cameraSide*.2:0;
 return {...base,x:base.x+cue.cameraSide+shotSide+sceneSide,y:base.y,z:base.z*concertGain*cue.cameraScale*(cue.production?.cameraGain??1)*(cue.shot===3?1+cue.phraseEnvelope*.008:1),fov:Math.max(28,Math.min(65,base.fov+(cue.cameraScale-1)*14))};
}
