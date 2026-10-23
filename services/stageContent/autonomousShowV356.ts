/** V356 – deterministic, bounded, music-aligned *provisional* show planner.
 * No ML inference and no claim that upcoming verses/drops have been detected.
 * This module has no render loop, network access, or audio clocks of its own.
 */
import type {ShowTimelineCueV354,ShowTimelineV354,CameraShotV354,DanceFormationV354} from './showTimelineV354';
export const AUTONOMOUS_SHOW_KEY_V356='sonic-autonomous-show-v356';
export const AUTONOMOUS_SHOW_EVENT_V356='sonic:autonomous-show-v356';
export type AutoShowSettingsV356={enabled:boolean;intensity:number;phraseBars:2|4|8;lookahead:number;
 camera:boolean;formations:boolean;lighting:boolean;effects:boolean;motions:boolean};
export const DEFAULT_AUTO_SHOW_V356:AutoShowSettingsV356={enabled:true,intensity:65,phraseBars:4,lookahead:4,
 camera:true,formations:true,lighting:true,effects:true,motions:true};
const clamp=(v:unknown,def:number,lo:number,hi:number)=>typeof v==='number'&&Number.isFinite(v)?Math.max(lo,Math.min(hi,v)):def;
export function sanitizeAutoShowV356(raw:unknown):AutoShowSettingsV356{
 const s=raw&&typeof raw==='object'&&!Array.isArray(raw)?raw as Partial<AutoShowSettingsV356>:{};
 return {enabled:s.enabled!==false,intensity:Math.round(clamp(s.intensity,65,0,100)),phraseBars:s.phraseBars===2||s.phraseBars===8?s.phraseBars:4,
 lookahead:Math.round(clamp(s.lookahead,4,1,8)),camera:s.camera!==false,formations:s.formations!==false,
 lighting:s.lighting!==false,effects:s.effects!==false,motions:s.motions!==false};
}
export function readAutoShowV356():AutoShowSettingsV356{
 if(typeof window==='undefined')return {...DEFAULT_AUTO_SHOW_V356};
 try{return sanitizeAutoShowV356(JSON.parse(window.localStorage.getItem(AUTONOMOUS_SHOW_KEY_V356)||'null'));}catch{return {...DEFAULT_AUTO_SHOW_V356};}
}
export function saveAutoShowV356(raw:AutoShowSettingsV356):AutoShowSettingsV356{
 const clean=sanitizeAutoShowV356(raw);
 if(typeof window!=='undefined'){
  try{window.localStorage.setItem(AUTONOMOUS_SHOW_KEY_V356,JSON.stringify(clean));}catch{/* non-persistent session */}
  window.dispatchEvent(new Event(AUTONOMOUS_SHOW_EVENT_V356));
 }
 return clean;
}
export type AutoShowSectionV356='verse'|'hook'|'drop'|'build'|'break';
export type AutoShowInputV356={trackId?:string|null;progressMs?:number;durationMs?:number;bpm?:number|null;
 genre?:string|null;section?:string|null;playing:boolean;reducedMotion:boolean;lyricsActive:boolean;
 avatarCount:number;automaticShowEnabled:boolean;authoredTimeline?:Pick<ShowTimelineV354,'enabled'|'trackId'>};
export type PlannedMomentV356={index:number;startMs:number;endMs:number;section:AutoShowSectionV356;
 shot:CameraShotV354;formation:DanceFormationV354;lightGain:number;fxGain:number;provisional:true};
export type AutoShowResultV356={active:boolean;reason:string;phraseMs:number;index:number;
 moments:PlannedMomentV356[];cue:ShowTimelineCueV354};
const sections:AutoShowSectionV356[]=['verse','hook','build','drop','break'];
const shots:CameraShotV354[]=['wide','medium','close','orbit'];
const unit=(v:number)=>Math.max(0,Math.min(1,v));
const neutral=(timeMs:number):ShowTimelineCueV354=>({active:false,timeMs,activeLanes:[],lightGain:1,fxGain:1,photoOpacity:1,lyricsFocus:false});
const hash=(s:string)=>{let h=2166136261;for(let i=0;i<s.length;i++)h=Math.imul(h^s.charCodeAt(i),16777619);return h>>>0;};
function sectionOf(raw?:string|null):AutoShowSectionV356{return sections.includes(raw as AutoShowSectionV356)?raw as AutoShowSectionV356:'verse';}
/** Rotation guarantees no adjacent repeats when >=2 suitable variants exist. */
function picks<T>(pool:readonly T[],seed:number,index:number):T{
 return pool[(seed%pool.length + index%pool.length)%pool.length];
}
/** Plans N phrase windows at a fixed grid; future section annotations are deliberately provisional. */
export function planAutonomousShowV356(input:AutoShowInputV356,raw:AutoShowSettingsV356=DEFAULT_AUTO_SHOW_V356):AutoShowResultV356{
 const settings=sanitizeAutoShowV356(raw);
 const validClock=typeof input.progressMs==='number'&&Number.isFinite(input.progressMs)&&input.progressMs>=0;
 const timeMs=validClock?input.progressMs!:0;
 const empty=(reason:string):AutoShowResultV356=>({active:false,reason,phraseMs:0,index:-1,moments:[],cue:neutral(timeMs)});
 if(!settings.enabled)return empty('deaktiviert');
 if(!input.automaticShowEnabled)return empty('Automatische V306-Show nicht aktiv');
 if(!input.playing)return empty('pausiert');
 if(!input.trackId||!validClock)return empty('keine verlässliche Songposition');
 if(typeof input.durationMs==='number'&&Number.isFinite(input.durationMs)&&input.durationMs>0&&timeMs>=input.durationMs)return empty('Songende');
 if(input.authoredTimeline?.enabled&&(!input.authoredTimeline.trackId||input.authoredTimeline.trackId===input.trackId))return empty('Manuelle V354-Timeline hat Vorrang');
 const bpm=clamp(input.bpm,120,50,220);
 // Snap to integer BPM so minor analyzer jitter does not continually move phrase boundaries.
 const phraseMs=Math.round(60000/Math.round(bpm)*4*settings.phraseBars);
 const index=Math.floor(timeMs/phraseMs);
 const section=sectionOf(input.section);
 const intensity=unit(settings.intensity/100);
 const heavy=/hardtek|hardsty|hardcore|rave|techno|metal/i.test(input.genre??'');
 const seed=hash(input.trackId+'|'+(heavy?'rave':'other'));
 const choices:CameraShotV354[]=input.lyricsActive?['wide','medium']:section==='break'?['medium','wide','close']:section==='drop'?['wide','orbit','medium']:shots;
 const formations:DanceFormationV354[]=input.avatarCount<2?['solo']:section==='break'?['solo','duet','mirror']:section==='drop'?['sync','mirror','duet']:['solo','duet','mirror','sync'];
 const moments:PlannedMomentV356[]=[];
 for(let p=index;p<index+settings.lookahead;p++){
  const startMs=p*phraseMs;
  if(typeof input.durationMs==='number'&&input.durationMs>0&&startMs>=input.durationMs)break;
  const phase=((p+seed)%4);
  const lightBase=({verse:.04,hook:.18,build:.12,drop:.27,break:-.20} as const)[section];
  const fxBase=({verse:.06,hook:.20,build:.12,drop:.32,break:-.26} as const)[section];
  // Subtle within-section dynamics, bounded by V351 safety and V355 quality caps downstream.
  const lightGain=Number(Math.max(.6,Math.min(1.55,1+lightBase*intensity+phase*.015)).toFixed(3));
  const fxGain=Number(Math.max(.4,Math.min(1.55,1+fxBase*intensity+phase*.018)).toFixed(3));
  moments.push({index:p,startMs,endMs:Math.min(startMs+phraseMs,input.durationMs&&input.durationMs>0?input.durationMs:Infinity),
    section,shot:picks(choices,seed,p),formation:picks(formations,seed>>>5,p),lightGain,fxGain,provisional:true});
 }
 const now=moments[0];if(!now)return empty('keine Showfenster');
 const lanes:ShowTimelineCueV354['activeLanes']=[];
 if(settings.formations&&input.avatarCount>1&&!input.reducedMotion)lanes.push('dance');
 if(settings.camera&&!input.reducedMotion)lanes.push('camera');
 if(settings.lighting&&!input.reducedMotion)lanes.push('lighting');
 if(settings.effects&&!input.reducedMotion)lanes.push('effects');
 const cue:ShowTimelineCueV354={active:lanes.length>0,timeMs,activeLanes:lanes,
  cameraShot:lanes.includes('camera')?now.shot:undefined,
  danceFormation:lanes.includes('dance')?now.formation:undefined,
  lightGain:lanes.includes('lighting')?(input.lyricsActive?Math.min(1.05,now.lightGain):now.lightGain):1,
  fxGain:lanes.includes('effects')?(input.lyricsActive?Math.min(.85,now.fxGain):now.fxGain):1,
  photoOpacity:1,lyricsFocus:false};
 return {active:cue.active,reason:'Vorläufiger Taktplan (kein erkannter zukünftiger Songabschnitt)',phraseMs,index,moments,cue};
}

/** Eligible GLB clips only; never auto-select arbitrary idle, rest or non-dance animations.
 * Selection is deterministic per song and phrase, and falls back to the original director.
 * The caller protects manual library clips, V328/329 overrides, motion timelines and blends.
 */
export function selectAutonomousMotionV356(names:readonly string[],fallback:string|undefined,trackId:string|undefined,
 phraseIndex:number,avatarSlot:number):string|undefined{
 if(!trackId||!Number.isInteger(phraseIndex)||phraseIndex<0)return fallback;
 const dance=names.filter(name=>/dance|groove|step|kick|tekk|hardstyle|hip.?hop|freestyle|motion|choreograph/i.test(name)
  &&!/idle|rest|sleep|death|t[ -]?pose|bind/i.test(name));
 if(dance.length<2)return fallback;
 const unique=[...new Set(dance)].sort((a,b)=>a.localeCompare(b));
 return picks(unique,hash(trackId+'|'+avatarSlot),phraseIndex);
}
