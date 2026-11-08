/** V1110 · Local drop-readiness hints and conservative, user-approved show cues.
 * These signals do NOT reveal future audio. A build is a POSSIBILITY, not a
 * timestamped drop prediction. No network, raw audio, timers, devices or storage.
 */
import type {EmotionSampleV1108,MusicEmotionSessionV1108,MusicEmotionReadingV1108} from './aiMusicEmotionV1108';
import {normalizeAiShowRemixV1106,type AiShowRemixV1106} from './arena360AiShowRemixV1106';
import type {ConcertStoryResultV1109} from './aiConcertStoryV1109';

export type DropPhaseV1110='steady'|'building'|'impact-observed'|'cooldown';
export type DropCueV1110='prepare'|'accent';
export type DropReadingV1110={phase:DropPhaseV1110;confidence:number;strength:number;
 energyRise:number;beatClarity:number;durationMs:number;sampleCount:number;
 cue:DropCueV1110|null;message:string;source:'local-microphone'};
const energy=(s:EmotionSampleV1108)=>.46*s.energyEnvelope+.24*s.volume+.2*s.bass+.1*s.beatStrength;
const mean=(v:readonly number[])=>v.reduce((a,b)=>a+b,0)/Math.max(1,v.length);
const bounded=(v:number)=>Math.min(1,Math.max(0,v));
const round=(v:number)=>Math.round(v*100)/100;
const valid=(n:unknown)=>typeof n==='number'&&Number.isFinite(n)&&n>=0&&n<=1;
const MEASURED=['volume','bass','mids','highs','energyEnvelope','beatStrength','attack'] as const;

/** Observe a recent rising envelope or an ALREADY HEARD impact.
 * Need at least ~5s and several windows. Never infer a future drop timestamp.
 */
export function readDropReadinessV1110(session:MusicEmotionSessionV1108|null,
 reading:MusicEmotionReadingV1108|null):DropReadingV1110|null{
 if(!session||!reading||!reading.ready||reading.source!=='local-microphone'||
  !valid(reading.confidence)||reading.confidence<.52||!valid(reading.beatClarity)||
  !Array.isArray(session.samples)||session.samples.length<18||session.samples.length>81||
  !Number.isFinite(session.lastAtMs)||session.lastAtMs<0||!session.trackKey)return null;
 const samples=session.samples;
 if(samples.some(s=>!Number.isFinite(s.atMs)||s.atMs<0||MEASURED.some(k=>!valid(s[k]))))return null;
 if(samples.some((s,i)=>i>0&&(s.atMs<=samples[i-1].atMs||s.atMs-samples[i-1].atMs>4000)))return null;
 if(samples.at(-1)!.atMs!==session.lastAtMs)return null;
 const durationMs=samples.at(-1)!.atMs-samples[0].atMs;
 if(durationMs<5000||durationMs>20000)return null;
 const count=Math.max(4,Math.min(9,Math.floor(samples.length/4)));
 const previous=samples.slice(-2*count,-count),recent=samples.slice(-count);
 if(previous.length!==count)return null;
 const early=mean(previous.map(energy)),late=mean(recent.map(energy));
 const rise=late-early;
 const beat=mean(recent.map(s=>s.beatStrength));
 const attack=mean(recent.map(s=>s.attack));
 const bass=mean(recent.map(s=>s.bass));
 const strength=bounded(late*.48+beat*.30+bass*.22);
 // An onset at a high energy level is something heard, NOT a forecast.
 const suddenRise=rise>.20&&attack>.53&&beat>.50&&late>.53;
 const building=rise>.085&&beat>.30&&late>.34&&attack>.20;
 const cooldown=rise<-.14;
 const phase:DropPhaseV1110=suddenRise?'impact-observed':building?'building':cooldown?'cooldown':'steady';
 const confidence=round(Math.min(.82,Math.max(.30,reading.confidence*.49+
   Math.min(1,Math.abs(rise)/.25)*.24+beat*.16+Math.min(1,durationMs/12000)*.11)));
 const cue:DropCueV1110|null=confidence>=.56&&phase==='building'?'prepare':
  confidence>=.6&&phase==='impact-observed'?'accent':null;
 const message=phase==='building'?'Lokaler Aufbau-Hinweis: Ein Höhepunkt KÖNNTE folgen, Zeitpunkt unbekannt.':
  phase==='impact-observed'?'Ein kräftiger Energieanstieg wurde bereits gemessen. Keine Vorhersage.':
  phase==='cooldown'?'Energie nimmt ab; keinen Drop vorwegnehmen.':
  'Kein ausreichend klarer Hinweis auf einen bevorstehenden Höhepunkt.';
 return {phase,confidence,strength:round(strength),energyRise:round(rise),beatClarity:round(beat),
  durationMs,sampleCount:samples.length,cue,message,source:'local-microphone'};
}

/** Preview-only 360° choreography: never edits scene boundaries or activates
 * stage playback. The V1106 validator and user-defined intensity cap apply.
 */
export function directDropRemixV1110(raw:unknown,cue:DropCueV1110,cap:number):AiShowRemixV1106|null{
 const remix=normalizeAiShowRemixV1106(raw);
 if(!remix||(cue!=='prepare'&&cue!=='accent')||!Number.isInteger(cap)||cap<30||cap>85||
  remix.acts.some(a=>a.intensity>cap))return null;
 const acts=remix.acts.map((act,i)=>{
  if(i===2)return {...act,camera:'orbit' as const,deck:'spiral' as const,
   floating:'orbit' as const,lasers:'spiral' as const,dance:'groove' as const,
   intensity:Math.min(cap,act.intensity+(cue==='prepare'?4:2)),
   note:(act.note+' V1110: Aufbau vorbereiten, keine Drop-Zeit behaupten.').slice(0,145)};
  if(i===3)return {...act,camera:'group' as const,deck:'fan' as const,
   lasers:'tunnel' as const,dance:'group' as const,
   intensity:Math.min(cap,act.intensity+(cue==='accent'?6:3)),
   note:(act.note+' V1110: geplanten Höhepunkt filmisch akzentuieren.').slice(0,145)};
  if(i===4)return {...act,camera:'wide' as const,lasers:'halo' as const,
   dance:'calm' as const,intensity:Math.min(act.intensity,Math.round(cap*.48)),
   note:(act.note+' V1110: bewusste Atempause.').slice(0,145)};
  return {...act};
 });
 // Symmetric smoothing. Do not create abrupt jumps or exceed the user cap.
 for(let i=1;i<acts.length;i++)acts[i].intensity=Math.min(acts[i].intensity,acts[i-1].intensity+45);
 for(let i=acts.length-2;i>=0;i--)acts[i].intensity=Math.min(acts[i].intensity,acts[i+1].intensity+45);
 return normalizeAiShowRemixV1106({...remix,acts,
  explanation:('V1110: vom Benutzer bestätigte Drop-Dramaturgie (keine Audio-Zeitmarke). '+remix.explanation).slice(0,300)});
}
/** Keep story-beat previews consistent with actual validated remix cues. */
export function syncDropStoryV1110(story:ConcertStoryResultV1109|null,
 remix:AiShowRemixV1106|null):ConcertStoryResultV1109|null{
 if(!story)return null;
 if(!remix||story.beats.length!==remix.acts.length||story.remix.acts.length!==remix.acts.length)return null;
 const beats=story.beats.map((beat,i)=>({...beat,intensity:remix.acts[i].intensity,
  camera:remix.acts[i].camera,dance:remix.acts[i].dance}));
 const levels=remix.acts.map(a=>a.intensity);
 const quality={...story.quality,quietMoments:levels.filter((v,i)=>(i===0||i===4)&&v<=55).length,
  cameraVariety:new Set(remix.acts.map(a=>a.camera)).size,
  stageVariety:new Set(remix.acts.map(a=>a.deck+'-'+a.floating)).size,
  dramaticRange:Math.max(...levels)-Math.min(...levels),
  finaleIsClimax:levels[6]>=Math.max(...levels),
  safeTransitions:levels.every((v,i)=>i===0||Math.abs(v-levels[i-1])<=45)};
 if(!quality.safeTransitions)return null;
 return {...story,remix,beats,quality};
}
