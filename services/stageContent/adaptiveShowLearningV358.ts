/** V358 – privacy-first, bounded feedback for automatic V356/V357 shows.
 * Uses actual, fresh renderer metrics + the explicitly heuristic V357 plan score.
 * Only aggregate genre/section/content/shot/formation statistics are stored; NO track IDs,
 * lyrics, artist names or images. Pure functions are deterministic and side-effect-free.
 */
import type {CameraShotV354,DanceFormationV354,ShowTimelineCueV354} from './showTimelineV354';
import type {AutoShowSectionV356,PlannedMomentV356} from './autonomousShowV356';
import type {ShowQualityResultV357} from './showQualityV357';
export const SHOW_LEARNING_STORAGE_V358='sonic-show-learning-v358';
export const SHOW_LEARNING_SETTINGS_V358='sonic-show-learning-settings-v358';
export const SHOW_LEARNING_EVENT_V358='sonic:show-learning-v358';
export type LearningModeV358='off'|'conservative'|'balanced';
export type ShowLearningSettingsV358={enabled:boolean;mode:LearningModeV358;minSamples:number;maxInfluence:number};
export const DEFAULT_SHOW_LEARNING_V358:ShowLearningSettingsV358={enabled:false,mode:'conservative',minSamples:4,maxInfluence:25};
export type ShowLearningEntryV358={key:string;shot:CameraShotV354;formation:DanceFormationV354;
 observations:number;rewardSum:number;fpsSum:number;planScoreSum:number;lastSeen:number};
export type ShowLearningHistoryV358={version:1;entries:ShowLearningEntryV358[]};
export const EMPTY_SHOW_LEARNING_V358:ShowLearningHistoryV358={version:1,entries:[]};
export type ShowLearningContextV358={genre?:string|null;section?:string|null;lyricsActive:boolean;
 mediaCount:number;avatarCount:number;playing:boolean;reducedMotion:boolean;manualOverride:boolean};
export type ShowLearningObservationV358={context:ShowLearningContextV358;shot:CameraShotV354;
 formation:DanceFormationV354;fps:number;p95FrameMs:number;metricAt:number;observedAt:number;
 planScore:number;playedMs:number;phraseMs:number;automatic:boolean};
export type LearnedShowResultV358={active:boolean;reason:string;cue:ShowTimelineCueV354;
 moments:PlannedMomentV356[];changes:string[];matchedSamples:number};
const shots:readonly CameraShotV354[]=['wide','medium','close','orbit'];
const formations:readonly DanceFormationV354[]=['solo','duet','mirror','sync'];
const sections:readonly AutoShowSectionV356[]=['verse','hook','drop','build','break'];
const clamp=(v:unknown,def:number,min:number,max:number)=>typeof v==='number'&&Number.isFinite(v)?Math.max(min,Math.min(max,v)):def;
export function sanitizeShowLearningV358(raw:unknown):ShowLearningSettingsV358{
 const s=raw&&typeof raw==='object'&&!Array.isArray(raw)?raw as Partial<ShowLearningSettingsV358>:{};
 return {enabled:s.enabled===true,mode:s.mode==='balanced'||s.mode==='off'?s.mode:'conservative',
  minSamples:Math.round(clamp(s.minSamples,4,3,12)),maxInfluence:Math.round(clamp(s.maxInfluence,25,5,40))};
}
function normalizeGenre(raw?:string|null):string{
 const g=String(raw??'').toLowerCase();
 if(/hardtekk|hardtek|tekk/.test(g))return 'hardtekk';
 if(/hardstyle/.test(g))return 'hardstyle';
 if(/deutschrap|hip.?hop|rap|trap/.test(g))return 'rap';
 if(/techno/.test(g))return 'techno';
 if(/ambient|chill/.test(g))return 'ambient';
 if(/rock|metal/.test(g))return 'rock';
 if(/pop/.test(g))return 'pop';
 return 'other';
}
export function contextKeyV358(c:ShowLearningContextV358):string{
 const section=sections.includes(c.section as AutoShowSectionV356)?c.section:'verse';
 const content=c.lyricsActive?'lyrics':c.mediaCount>=2?'manyphotos':c.mediaCount>0?'photo':'stage';
 const crowd=c.avatarCount>1?'group':'solo';
 return `${normalizeGenre(c.genre)}|${section}|${content}|${crowd}`;
}
export function sanitizeShowLearningHistoryV358(raw:unknown):ShowLearningHistoryV358{
 const v=raw&&typeof raw==='object'&&!Array.isArray(raw)?raw as {version?:unknown;entries?:unknown}:{};
 if(v.version!==1||!Array.isArray(v.entries))return {version:1,entries:[]};
 const dedupe=new Map<string,ShowLearningEntryV358>();
 for(const r of v.entries.slice(0,256)){
  if(!r||typeof r!=='object'||Array.isArray(r))continue;
  const e=r as Partial<ShowLearningEntryV358>;
  if(typeof e.key!=='string'||! /^(hardtekk|hardstyle|rap|techno|ambient|rock|pop|other)\|(verse|hook|drop|build|break)\|(lyrics|manyphotos|photo|stage)\|(solo|group)$/.test(e.key))continue;
  if(!shots.includes(e.shot as CameraShotV354)||!formations.includes(e.formation as DanceFormationV354))continue;
  const n=Math.round(clamp(e.observations,0,0,120));if(n<1)continue;
  const record:ShowLearningEntryV358={key:e.key,shot:e.shot!,formation:e.formation!,observations:n,
   rewardSum:clamp(e.rewardSum,0,0,n*100),fpsSum:clamp(e.fpsSum,0,0,n*120),
   planScoreSum:clamp(e.planScoreSum,0,0,n*100),lastSeen:Math.round(clamp(e.lastSeen,0,0,4102444800000))};
  const key=`${record.key}|${record.shot}|${record.formation}`;
  if(!dedupe.has(key))dedupe.set(key,record);
 }
 return {version:1,entries:[...dedupe.values()].sort((a,b)=>b.lastSeen-a.lastSeen).slice(0,64)};
}
export function readShowLearningSettingsV358():ShowLearningSettingsV358{
 if(typeof window==='undefined')return {...DEFAULT_SHOW_LEARNING_V358};
 try{return sanitizeShowLearningV358(JSON.parse(window.localStorage.getItem(SHOW_LEARNING_SETTINGS_V358)||'null'));}
 catch{return {...DEFAULT_SHOW_LEARNING_V358};}
}
export function readShowLearningHistoryV358():ShowLearningHistoryV358{
 if(typeof window==='undefined')return {version:1,entries:[]};
 try{return sanitizeShowLearningHistoryV358(JSON.parse(window.localStorage.getItem(SHOW_LEARNING_STORAGE_V358)||'null'));}
 catch{return {version:1,entries:[]};}
}
const broadcast=()=>{if(typeof window!=='undefined')window.dispatchEvent(new Event(SHOW_LEARNING_EVENT_V358));};
export function saveShowLearningSettingsV358(raw:unknown):ShowLearningSettingsV358{
 const s=sanitizeShowLearningV358(raw);
 try{if(typeof window!=='undefined')window.localStorage.setItem(SHOW_LEARNING_SETTINGS_V358,JSON.stringify(s));}catch{/* storage unavailable */}
 broadcast();return s;
}
export function clearShowLearningV358():void{
 try{if(typeof window!=='undefined')window.localStorage.removeItem(SHOW_LEARNING_STORAGE_V358);}catch{/* storage unavailable */}
 broadcast();
}
export function storeShowLearningHistoryV358(history:ShowLearningHistoryV358,settings:ShowLearningSettingsV358):boolean{
 if(!sanitizeShowLearningV358(settings).enabled||typeof window==='undefined')return false;
 try{window.localStorage.setItem(SHOW_LEARNING_STORAGE_V358,JSON.stringify(sanitizeShowLearningHistoryV358(history)));broadcast();return true;}
 catch{return false;}
}
/** Requires a completed phrase and fresh, finite measured FPS & P95 (never synthetic data).
 * Score is an *explicitly heuristic* preference proxy, not a perceived-quality measurement.
 */
export function recordShowLearningV358(history:ShowLearningHistoryV358,o:ShowLearningObservationV358,
 settings:ShowLearningSettingsV358):ShowLearningHistoryV358{
 const s=sanitizeShowLearningV358(settings);
 if(!s.enabled||s.mode==='off'||!o.automatic||!o.context.playing||o.context.reducedMotion||o.context.manualOverride)return history;
 if(!Number.isFinite(o.phraseMs)||o.phraseMs<1000||!Number.isFinite(o.playedMs)||o.playedMs<o.phraseMs*.65)return history;
 if(!Number.isFinite(o.observedAt)||o.observedAt<=0||!Number.isFinite(o.metricAt)||o.metricAt<=0||
  o.observedAt<o.metricAt||o.observedAt-o.metricAt>4000)return history;
 if(!Number.isFinite(o.fps)||o.fps<5||o.fps>240||!Number.isFinite(o.p95FrameMs)||o.p95FrameMs<=0||o.p95FrameMs>1000)return history;
 if(!shots.includes(o.shot)||!formations.includes(o.formation)||!Number.isFinite(o.planScore))return history;
 const clean=sanitizeShowLearningHistoryV358(history);
 const key=contextKeyV358(o.context),id=`${key}|${o.shot}|${o.formation}`;
 // FPS is a real browser observation. V357 quality is explicitly a planning heuristic.
 const fpsScore=clamp(Math.min(o.fps,1000/o.p95FrameMs)/60*100,0,0,100);
 const planScore=clamp(o.planScore,50,0,100);
 const reward=Number((.55*planScore+.45*fpsScore).toFixed(3));
 const existing=clean.entries.find(e=>`${e.key}|${e.shot}|${e.formation}`===id);
 const n=Math.min(120,(existing?.observations??0)+1);
 const decay=existing&&existing.observations>=120?119/120:1;
 const next:ShowLearningEntryV358={key,shot:o.shot,formation:o.formation,observations:n,
  rewardSum:Number(((existing?.rewardSum??0)*decay+reward).toFixed(3)),
  fpsSum:Number(((existing?.fpsSum??0)*decay+o.fps).toFixed(3)),
  planScoreSum:Number(((existing?.planScoreSum??0)*decay+planScore).toFixed(3)),
  lastSeen:Math.round(o.observedAt)};
 return sanitizeShowLearningHistoryV358({version:1,entries:[next,...clean.entries.filter(e=>`${e.key}|${e.shot}|${e.formation}`!==id)]});
}
/** Only re-ranks *eligible* V357 automatic shots/formations; never raises light/FX,
 * never changes timeline, manual camera/animation, lyric safety or stability caps.
 * Tied within a few points -> keep the baseline to avoid oscillation/feedback loops.
 */
export function refineLearnedShowV358(base:ShowQualityResultV357,context:ShowLearningContextV358,
 settings:ShowLearningSettingsV358=DEFAULT_SHOW_LEARNING_V358,
 history:ShowLearningHistoryV358=EMPTY_SHOW_LEARNING_V358):LearnedShowResultV358{
 const s=sanitizeShowLearningV358(settings);
 const inactive=(reason:string):LearnedShowResultV358=>({active:false,reason,cue:base.cue,moments:base.moments,changes:[],matchedSamples:0});
 if(!s.enabled||s.mode==='off')return inactive('Lernen ist ausgeschaltet');
 if(!base.active||!base.cue.active||!context.playing||context.manualOverride||context.reducedMotion)return inactive('Manuelle Show, Pause oder reduzierte Bewegung');
 const key=contextKeyV358(context);
 const entries=sanitizeShowLearningHistoryV358(history).entries.filter(e=>e.key===key&&e.observations>=s.minSamples);
 if(!entries.length)return inactive('Noch zu wenige passende Live-Beobachtungen');
 const lanes=base.cue.activeLanes,cameraOn=lanes.includes('camera'),formationOn=lanes.includes('dance');
 const allowedShots:readonly CameraShotV354[]=context.lyricsActive?['wide','medium']:
  context.section==='break'?['wide','medium']:['wide','medium','close','orbit'];
 const allowedFormations:readonly DanceFormationV354[]=context.avatarCount<2?['solo']:['solo','duet','mirror','sync'];
 const candidates=entries.filter(e=>allowedShots.includes(e.shot)&&allowedFormations.includes(e.formation));
 if(!candidates.length)return inactive('Keine sichere Szenen-Kombination verfügbar');
 // Conservative, bounded influence: stronger historical evidence still cannot dominate the director.
 const rank=(e:ShowLearningEntryV358)=>e.rewardSum/e.observations;
 const sorted=[...candidates].sort((a,b)=>rank(b)-rank(a)||b.observations-a.observations||a.shot.localeCompare(b.shot));
 const champion=sorted[0],confidence=Math.min(1,champion.observations/(s.minSamples*2));
 const lead=s.mode==='conservative'?5:3;
 const cadence=Math.max(3,Math.ceil(100/s.maxInfluence));
 const moments=base.moments.map((m,i)=>{
  if(!cameraOn&&!formationOn||m.index%cadence!==0)return m;
  const original=candidates.find(e=>e.shot===m.shot&&e.formation===m.formation);
  const baseline=original?rank(original):65;
  const advantage=rank(champion)-baseline;
  if(advantage<lead||confidence<.5||advantage*confidence<s.maxInfluence*.12)return m;
  // At most the user-selected fraction of absolute phrase indices; seeking is deterministic.
  const shot=cameraOn?champion.shot:m.shot;
  const formation=formationOn?champion.formation:m.formation;
  // No identical adjacent camera: the V357 variation guarantee takes precedence.
  if(i>0&&cameraOn&&shot===base.moments[i-1].shot)return m;
  return {...m,shot,formation};
 });
 const changed=moments.some((m,i)=>m.shot!==base.moments[i].shot||m.formation!==base.moments[i].formation);
 if(!changed)return inactive('Lernhistorie passt bereits zum bestehenden Regieplan');
 const first=moments[0];
 const cue={...base.cue,cameraShot:cameraOn?first.shot:base.cue.cameraShot,
  danceFormation:formationOn?first.formation:base.cue.danceFormation};
 return {active:true,reason:'Begrenzte lokale Präferenz aus Live-Messwerten',cue,moments,
  changes:['Bewährte Kamera-/Formationskombination vorsichtig bevorzugt'],matchedSamples:champion.observations};
}
