import {planDancePhrase,type DancePhrase} from '../../lib/concertDancePhrases';
import {sceneryStrength} from '../../lib/concertStageShow';
import {isProductionId,productionTake,type ProductionId} from '../../lib/showProduction';
import {choosePoseAwareCrew} from '../../lib/poseAwareCrew';
import type {MotionKeyframeClipV630} from './naturalDancePerformanceV630';
import {normalizeShowHistory,type ShowHistory} from '../../lib/showExperience';
import type {MusicalEvidence} from '../../lib/musicalEvidence';
import {normalizeShowTaste,type MotifTaste} from '../../lib/showTaste';
import {concertScoreV1134,type ConcertScoreV1134} from '../../lib/concertScoreV1134';
import {fullBodyClipV1133,bodyStyleV1133} from '../../lib/fullBodyPerformanceV1133';
import {performerPersonaV1132,performanceSequenceV1132,expressionGainV1132,approachCrewOffsetV1132,type ExpressionV1132,type PersonaV1132} from '../../lib/performerPersonalityV1132';
import {crewInteractionV1131,storyFootworkV1131} from '../../lib/concertStoryV1131';
import type {Lyrics} from '../../types/playbackCore';
import {HEADLINERS_V1130,showCueV1130,intelligentClipV1130} from '../../lib/showIntelligenceV1130';
import {ENCORE_AVATARS_V1129,genreClipsV1129,variedClipV1129} from '../../lib/musicPerformanceV1129';
/** All bundled performers. Pure clock/clip planning; no scene or audio ownership. */
export const CREW_IDS = ['sonic-neon-pulse','sonic-festival-nova','sonic-chrome-beat',...ENCORE_AVATARS_V1129.map(a=>a.id),...HEADLINERS_V1130.map(a=>a.id)] as const;
export type CrewMode = 'individual'|'unison'|'canon'|'spotlight'|'story'|'adaptive';
export type CrewSettings = { enabled:boolean; reactions:boolean; mode:CrewMode;scenery?:boolean;ensemble?:boolean;ensembleLyrics?:boolean;songOutfits?:boolean;goveeEnsemble?:boolean;immersiveFx?:boolean;musicalDance?:boolean;sceneryLyrics?:boolean;sceneryStrength?:number;showPlans?:boolean;showStyle?:ProductionId;showTake?:number;poseAware?:boolean;stagecraft?:boolean;history?:ShowHistory;remember?:boolean;taste?:MotifTaste;expression?:ExpressionV1132 };
export const CREW_DEFAULT: CrewSettings = Object.freeze({enabled:true,reactions:true,mode:'individual'});
export type CrewInput = {
 stance?:{left:boolean;right:boolean};audioEvidence?:MusicalEvidence;modelId:string; clips:readonly {name:string;duration:number;tracks?:MotionKeyframeClipV630['tracks']}[]; trackId?:string|null;
 progressMs?:number|null; bpm?:number|null; energy?:number|null; section?:string|null;
 genre?:string|null; slot:number; count:number; playing:boolean; reducedMotion:boolean;
 manualPriority:boolean; settings:CrewSettings;lyricDensity?:number;durationMs?:number;lyrics?:Lyrics|null;
};
export type CrewState = {danceKey?:string;memoryPhase?:string;key:string;position:number;beat:number;bpm:number;clip:string|null;switched:number;phrase:number;clipPhrase?:number;leader?:number;part?:CrewPlan['part'];recent?:string[];ensembleMode?:CrewMode;clockOffset?:number;offsetTarget?:number};
export const newCrewState = ():CrewState => ({key:'',position:0,beat:0,bpm:120,clip:null,switched:-Infinity,phrase:-1});
export type CrewPlan = {ensemble?:boolean;dance?:DancePhrase|null;slot?:number;active:boolean;clip:string|null;part:'quiet'|'verse'|'hook'|'drop';beat:number;bpm:number;
 offset:number;offsetTarget?:number;leader:number;reaction:'nod'|'welcome'|'led'|'none';reason:string;bodyStyle?:string;persona?:PersonaV1132;expressionGain?:number;sequence?:{label:string;step:number};story?:ConcertScoreV1134;interaction?:ReturnType<typeof crewInteractionV1131>};
export const normalizeCrewSettings = (v:unknown):CrewSettings => {
 const x=v && typeof v==='object'?v as Partial<CrewSettings>:{};
 const expression=x.expression==='subtle'||x.expression==='balanced'||x.expression==='bold'?x.expression:undefined;
 const taste=normalizeShowTaste(x.taste),history=normalizeShowHistory(x.history);
 return {...Object.fromEntries((['ensemble','ensembleLyrics','songOutfits','goveeEnsemble'] as const).filter(k=>typeof x[k]==='boolean').map(k=>[k,x[k]])),...(typeof x.immersiveFx==='boolean'?{immersiveFx:x.immersiveFx}:{}),...(typeof x.musicalDance==='boolean'?{musicalDance:x.musicalDance}:{}),...(typeof x.scenery==='boolean'?{scenery:x.scenery}:{}),...(typeof x.sceneryLyrics==='boolean'?{sceneryLyrics:x.sceneryLyrics}:{}),...(typeof x.sceneryStrength==='number'&&Number.isFinite(x.sceneryStrength)?{sceneryStrength:sceneryStrength(x.sceneryStrength)}:{}),...(typeof x.showPlans==='boolean'?{showPlans:x.showPlans}:{}),...(isProductionId(x.showStyle)?{showStyle:x.showStyle}:{}),...(productionTake(x.showTake)?{showTake:productionTake(x.showTake)}:{}),...(x.poseAware===true?{poseAware:true}:{}),...(x.stagecraft===true?{stagecraft:true}:{}),...(x.remember===false?{remember:false}:{}),...(history.length?{history}:{}),...(Object.keys(taste).length?{taste}:{}),...(expression?{expression}:{}),enabled:typeof x.enabled==='boolean'?x.enabled:true,reactions:typeof x.reactions==='boolean'?x.reactions:true,
 mode:x.mode==='unison'||x.mode==='canon'||x.mode==='spotlight'||x.mode==='story'||x.mode==='adaptive'?x.mode:'individual'};
};
const clamp=(x:number,a:number,b:number)=>Math.min(b,Math.max(a,x));
const finite=(x:unknown):x is number=>typeof x==='number'&&Number.isFinite(x);
export function crewPart(section?:string|null,energy?:number|null):CrewPlan['part'] {
 const s=(section??'').toLowerCase();
 if(/intro|outro|break|quiet|interlude|ambient/.test(s))return 'quiet';
 if(/drop|peak|climax|finale/.test(s))return 'drop';
 if(/hook|chorus|refrain/.test(s))return 'hook';
 if(/verse|build|bridge/.test(s))return 'verse';
 if(finite(energy)&&energy<.22)return 'quiet';
 return 'verse';
}
export function stepCrew(previous:CrewState,input:CrewInput):{state:CrewState;plan:CrewPlan} {
 let part=crewPart(input.section,input.energy);
 const off=(reason:string)=>({state:newCrewState(),plan:{active:false,clip:null,part,beat:0,bpm:120,offset:0,leader:0,reaction:'none',reason} as CrewPlan});
 if(!CREW_IDS.some(id=>id===input.modelId))return off('other-model');
 if(!input.settings.enabled)return off('disabled');
 if(input.manualPriority)return off('manual');
 if(!input.playing||input.reducedMotion){const stopped=off(input.reducedMotion?'reduced-motion':'paused');return {...stopped,state:input.reducedMotion?stopped.state:previous};}
 if(!input.trackId?.trim()||!finite(input.progressMs)||input.progressMs<0)return off('no-song-clock');
 const pos=input.progressMs,knownBpm=finite(input.bpm)&&input.bpm>=55&&input.bpm<=210;
 const requestedBpm=knownBpm?input.bpm!:120;
 const key=`${input.trackId}|${input.modelId}|${input.settings.mode}|${input.count}|${input.slot}`;
 const reset=previous.key!==key||pos<previous.position-500||pos>previous.position+5000;
 const dt=reset?0:Math.max(0,(pos-previous.position)/1000);
 // A smoothed tempo estimate integrates elapsed song time; tempo updates do not teleport poses.
 const bpm=reset?requestedBpm:previous.bpm+(requestedBpm-previous.bpm)*(1-Math.exp(-dt/3));
 const beat=reset?pos*bpm/60000:previous.beat+dt*(previous.bpm+bpm)/120;
 let phrase=Math.floor((beat+1e-7)/16);const count=clamp(Math.round(input.count)||1,1,4),slot=clamp(Math.round(input.slot)||0,0,count-1);
 const legacyLeader=phrase%count,modelIndex=CREW_IDS.indexOf(input.modelId as typeof CREW_IDS[number]);
 const model=modelIndex<3?modelIndex:[...ENCORE_AVATARS_V1129,...HEADLINERS_V1130][modelIndex-3].variant;
 const signatures=[['Dance_NeonCircuit','Dance_LaserStep'],['Dance_FestivalFlow','Dance_DiscoStar'],['Dance_PopLock','Dance_Clockwork']];
 // V1114: a single user-enabled mode switches the ACTUAL embedded GLB
 // choreography by the observed song section. This does not detect the
 // section itself. Manual clip/timeline/reduced-motion rules still win.
 const adaptiveCue=concertScoreV1134({...input,scenery:input.settings.scenery,showPlans:input.settings.showPlans,showStyle:input.settings.showStyle,showTake:input.settings.showTake,taste:input.settings.taste,history:input.settings.remember===false?undefined:input.settings.history,bpm,progressMs:pos});
 if(input.settings.mode==='adaptive')part=adaptiveCue.act==='breathe'?'quiet':adaptiveCue.act==='lift'?'hook':adaptiveCue.act==='impact'||adaptiveCue.act==='finale'?'drop':'verse';
 if(input.settings.mode==='adaptive')phrase=adaptiveCue.phrase;
 const effectiveMode:CrewMode=input.settings.mode==='adaptive'?adaptiveCue.mode:input.settings.mode==='story'
   ?part==='quiet'?'individual':part==='verse'?'spotlight':part==='hook'?'canon':'unison'
   :input.settings.mode;
 const leader=input.settings.mode==='adaptive'?adaptiveCue.leader:legacyLeader;
 const ensemble=count>1&&effectiveMode!=='individual';
 let choices:string[];
 const greet=input.settings.reactions && pos<3000 && part==='quiet' && model===1 && !ensemble;
 if(greet)choices=['Gesture_Wave','Idle_Breathe'];
 else if(part==='quiet')choices=['Idle_Breathe','Dance_Groove'];
 else if(ensemble && effectiveMode==='canon')choices=['Dance_House','Dance_Groove'];
 else if(ensemble && effectiveMode==='spotlight' && slot===leader)choices=[signatures[model][phrase%2],'Dance_Groove'];
 else if(ensemble && (effectiveMode!=='spotlight'||slot!==leader))
   choices=part==='drop'?['Dance_FestivalBounce','Dance_Techno']:part==='hook'?['Dance_House','Dance_Groove']:['Dance_Groove','Dance_House'];
 else if(part==='hook')choices=[signatures[model][phrase%2],'Dance_Disco','Dance_Groove'];
 else if(part==='drop')choices=model===0?['Dance_Shuffle','Dance_Techno']:model===1?['Dance_FestivalBounce','Dance_Disco']:['Dance_Robot','Dance_Techno'];
 else if(/rap|hip.?hop|trap|rnb/i.test(input.genre??''))choices=['Dance_HipHop','Dance_Groove'];
 else if(/house|disco|funk|pop/i.test(input.genre??''))choices=['Dance_House','Dance_Disco','Dance_Groove'];
 else choices=model===0?['Dance_Techno','Dance_Groove']:model===2?['Dance_Robot','Dance_Groove']:['Dance_Groove','Dance_House'];
 const available=new Set(input.clips.filter(c=>finite(c.duration)&&c.duration>.1).map(c=>c.name));
 // V1129: rotate real genre clips at phrase boundaries, excluding the last dance.
 // Shared modes use the same seed/slot so the ensemble keeps a common clip.
 const sharedMode=ensemble&&(effectiveMode==='unison'||effectiveMode==='canon');
 const genrePool=genreClipsV1129(input.genre).filter(name=>!sharedMode||!/^Dance_(RockDrive|LatinSway|JazzSwing|LiquidWave|AfroPulse|Waltz)$/.test(name));
 const rotating=part!=='quiet'&&!greet&&!(ensemble&&(effectiveMode==='canon'||(effectiveMode==='spotlight'&&slot===leader)));
 const pool=rotating?(phrase===0&&(modelIndex<3||ensemble)?[...choices,...genrePool]:[...genrePool,...choices]):choices;
 const rankedCandidate=input.settings.mode==='adaptive'?intelligentClipV1130({clips:[...available],genre:input.genre,cue:adaptiveCue,
   recent:reset?[]:previous.recent??[],trackId:input.trackId,slot,shared:ensemble&&(effectiveMode==='unison'||effectiveMode==='canon'),
   signature:signatures[model][phrase%2]}):variedClipV1129(pool,available,rotating?phrase:0,input.trackId,
   ensemble&&effectiveMode!=='spotlight'?0:slot,reset||(ensemble&&effectiveMode!=='spotlight')?null:previous.clip);
 const step=storyFootworkV1131(adaptiveCue,slot);
 const featureStep=adaptiveCue.act==='lift'||adaptiveCue.act==='finale'||adaptiveCue.phrase%3===1||adaptiveCue.interaction==='duel';
 const baseCandidate=input.settings.mode==='adaptive'&&featureStep&&step&&available.has(step)?step:rankedCandidate;
 const sequence=performanceSequenceV1132({genre:input.genre,trackId:input.trackId,modelId:input.modelId,cue:adaptiveCue,available,
 recent:reset?[]:previous.recent??[],slot,count,fallback:baseCandidate});
 const bodyCandidate=input.settings.mode==='adaptive'?fullBodyClipV1133({history:input.settings.remember===false?undefined:input.settings.history,taste:input.settings.taste,slot,trackId:input.trackId,recent:reset?[]:previous.recent??[],modelId:input.modelId,genre:input.genre,cue:adaptiveCue,count,available,fallback:sequence.clip}):baseCandidate;
 const supporting=input.settings.mode==='adaptive'&&(adaptiveCue.reading||adaptiveCue.act==='build')&&slot!==leader;
 const ordinaryCandidate=supporting?(available.has('Dance_Groove')?'Dance_Groove':bodyCandidate):bodyCandidate;
 const dance=input.settings.mode==='adaptive'&&input.settings.scenery===true&&input.settings.musicalDance!==false?planDancePhrase({cue:adaptiveCue,beat,slot,count,clip:ordinaryCandidate,available,evidence:input.audioEvidence}):null;
 const candidate=dance?.clip??ordinaryCandidate;
 if(!candidate)return off('missing-clips');
 const old=reset?newCrewState():previous;
 // Switch on a bar and hold >=8 seconds. Quiet sections may settle after one bar; greetings may finish after their own clip.
 const barBoundary=Math.floor((beat+1e-7)/4)!==Math.floor((old.beat+1e-7)/4);
 const hold=old.clip==='Gesture_Wave'?3000:part==='quiet'?2000:dance?Math.max(2500,8*60000/bpm):8000;
 const roleChanged=barBoundary&&ensemble&&effectiveMode==='spotlight'&&!!old.key&&old.phrase!==phrase&&(slot===leader||slot===(old.leader??old.phrase%count));
 const danceKey=dance?`${dance.block}:${dance.step}`:undefined;
 const phraseChanged=phrase!==(old.clipPhrase??old.phrase)||!!dance&&danceKey!==old.danceKey;
 const regroup=input.settings.mode==='adaptive'&&old.ensembleMode!==effectiveMode&&barBoundary;
 const finaleHandoff=adaptiveCue.act==='finale'&&!!adaptiveCue.memory&&old.memoryPhase!==adaptiveCue.memory.phase&&barBoundary;
 const keep=!!old.clip&&available.has(old.clip)&&!roleChanged&&!regroup&&!finaleHandoff&&(!barBoundary||pos-old.switched<hold-.001||(!phraseChanged&&old.part===part&&part!=='quiet'));
 const flexible=input.settings.poseAware&&input.settings.mode==='adaptive'&&!keep&&!!old.clip&&!adaptiveCue.memory&&!adaptiveCue.reading&&adaptiveCue.act==='story'&&adaptiveCue.interaction!=='unison'&&adaptiveCue.interaction!=='answer'&&(!adaptiveCue.dialogue||slot!==adaptiveCue.leader&&slot!==adaptiveCue.partner);
 const clip=keep?old.clip!:flexible?choosePoseAwareCrew({clips:input.clips,outgoing:old.clip!,candidate,bpm,outTime:((old.beat+(old.clockOffset??0))/2)%(input.clips.find(c=>c.name===old.clip)?.duration??1),time:duration=>((beat+(old.clockOffset??0))/2)%duration,genre:input.genre,left:input.stance?.left??false,right:input.stance?.right??false}):candidate;
 const desiredOffset=input.settings.mode==='adaptive'?crewInteractionV1131(adaptiveCue,slot,count).beatOffset:ensemble&&effectiveMode==='canon'?-slot*2:0;
 const clockOffset=input.settings.mode==='adaptive'&&!reset&&clip===old.clip?approachCrewOffsetV1132(old.clockOffset??desiredOffset,old.offsetTarget??desiredOffset,dt,bpm):desiredOffset;
 const state={danceKey:keep?old.danceKey:danceKey,memoryPhase:keep?old.memoryPhase:adaptiveCue.memory?.phase,clockOffset,offsetTarget:desiredOffset,key,position:pos,beat,bpm,clip,switched:clip!==old.clip?pos:old.switched,phrase,clipPhrase:keep?(old.clipPhrase??old.phrase):phrase,leader,part,ensembleMode:keep?old.ensembleMode:effectiveMode,recent:clip!==old.clip?[clip,...(old.recent??[])].slice(0,3):old.recent};
 return {state,plan:{ensemble:input.settings.ensemble,dance,slot,active:true,clip,part,beat,bpm,offset:clockOffset,offsetTarget:input.settings.mode==='adaptive'?desiredOffset:undefined,leader,
 bodyStyle:bodyStyleV1133(clip),persona:input.settings.mode==='adaptive'?performerPersonaV1132(input.modelId):undefined,expressionGain:expressionGainV1132(input.settings.expression)*(adaptiveCue.memory?.gain??1)*(adaptiveCue.production?.crewGain??1)*(adaptiveCue.music.quiet?.25:1+adaptiveCue.music.pulse*.08)*(adaptiveCue.reading?(slot===leader?.65:.30):supporting?.55:1),sequence:input.settings.mode==='adaptive'?{label:sequence.label,step:sequence.step}:undefined,
 story:input.settings.mode==='adaptive'?adaptiveCue:undefined,interaction:input.settings.mode==='adaptive'?crewInteractionV1131(adaptiveCue,slot,count):undefined,
 reaction:input.settings.reactions?(['nod','welcome','led'] as const)[model]:'none',reason:knownBpm?'music':'tempo-fallback'}};
}
/** Original clips are authored at 120 BPM. A 12s signature retains all 24 beats. */
export function crewClipTime(plan:CrewPlan,duration:number,progressDeltaMs=0):number {
 if(!plan.active||!finite(duration)||duration<=0)return 0;
 const elapsed=clamp(progressDeltaMs,0,1000);
 const offset=plan.offsetTarget===undefined?plan.offset:approachCrewOffsetV1132(plan.offset,plan.offsetTarget,elapsed/1000,plan.bpm);
 const seconds=(plan.beat+offset+elapsed*plan.bpm/60000)/2;
 return ((seconds%duration)+duration)%duration;
}
