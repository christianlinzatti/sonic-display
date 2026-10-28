/** V600 – complete-song concert arc from *existing* music-analysis evidence.
 * Builds an immutable, bounded plan once per track and samples it by playback time.
 * Never infers a singer, a lyric word, a hook or a drop from music credits.
 * Applied only on already-active V568/V577 automatic intensity channels.
 */
import type {TrackAnalysisV318,SongSectionV318} from '../../services/musicAnalysis/trackAnalysisV318';
import type {ConcertDynamicsV502,ConcertGenreV502} from './smartConcertDynamicsV502';
import type {GroupStudioV326,GroupFormationV326} from './multiAvatarStageDirectorV326';
import {layoutV326} from './multiAvatarStageDirectorV326';

export type ConcertShotV600='establish'|'lead'|'side'|'ensemble';
export type ConcertActV600={startMs:number;endMs:number;section:SongSectionV318;index:number;shot:ConcertShotV600;formation:GroupFormationV326};
export type ConcertArcV600={trackId:string;durationMs:number;genre:ConcertGenreV502;source:'authored'|'playback-only';acts:readonly ConcertActV600[]};
export type ConcertArcCueV600={active:boolean;source:'authored'|'playback-only'|'off';section:SongSectionV318|null;
  act:number;shot:ConcertShotV600|'off';formation:GroupFormationV326|null;moment:'opening'|'develop'|'peak'|'release'|'off';
  /** This is NOT a real camera shot command; it is an intensity-only emphasis. */
  dynamics:ConcertDynamicsV502};
const clamp=(n:number,a:number,b:number)=>Math.max(a,Math.min(b,n));
const round=(n:number)=>Math.round(n*10000)/10000;
const valid=(n:unknown):n is number=>typeof n==='number'&&Number.isFinite(n);
const titles=['establish','lead','side','ensemble'] as const;
const formationFor=(shot:ConcertShotV600,section:SongSectionV318):GroupFormationV326=>
  section==='break'?'line':section==='hook'||section==='drop'?'wide':shot==='lead'?'stagger':shot==='side'?'arc':shot==='ensemble'?'wide':'line';
function selectShot(genre:ConcertGenreV502,section:SongSectionV318,index:number,previous:ConcertShotV600|null):ConcertShotV600{
  const start=section==='break'?0:section==='verse'?1:section==='hook'?3:section==='build'?2:3;
  const bias=genre==='hardtekk'?2:genre==='hardstyle'?1:genre==='rock'?3:genre==='pop'?1:0;
  let shot:ConcertShotV600=titles[(start+index+bias)%titles.length];
  if(shot===previous)shot=titles[(titles.indexOf(shot)+1)%titles.length];
  return shot;
}
/** Labelled, high-confidence sections only. Unknown periods are not fabricated into acts. */
export function planUltimateConcertV600(input:{trackId:string;durationMs:number;genre:ConcertGenreV502;
 analysis:TrackAnalysisV318|null|undefined}):ConcertArcV600{
  const durationMs=valid(input.durationMs)&&input.durationMs>0&&input.durationMs<=7200000?Math.round(input.durationMs):0;
  const base:ConcertArcV600={trackId:input.trackId,durationMs,genre:input.genre,source:'playback-only',acts:[]};
  if(!input.trackId.trim()||!durationMs||!['deutschrap','hardstyle','hardtekk','rock','pop'].includes(input.genre))return base;
  const analysis=input.analysis;
  if(!analysis||analysis.trackId!==input.trackId||analysis.schema!=='sonic-track-analysis-v318'||!Array.isArray(analysis.sections))return base;
  const labeled=analysis.sections.slice(0,160).filter(s=>valid(s.startMs)&&s.startMs>=0&&s.startMs<durationMs&&
    valid(s.durationMs)&&s.durationMs>=0&&valid(s.confidence)&&s.confidence>=.65&&
    ['verse','hook','build','drop','break'].includes(s.label??'')).sort((a,b)=>a.startMs-b.startMs);
  // Sections must be sorted, non-overlapping and sufficiently long for a stage change.
  const acts:ConcertActV600[]=[];
  for(const section of labeled){
    const start=Math.round(section.startMs);
    const end=Math.min(durationMs,Math.round(section.startMs+section.durationMs));
    if(end-start<2600||acts.some(a=>start<a.endMs))continue;
    const previous=acts.length?acts[acts.length-1].shot:null;
    const shot=selectShot(input.genre,section.label!,acts.length,previous);
    acts.push({startMs:start,endMs:end,section:section.label!,index:acts.length,shot,formation:formationFor(shot,section.label!)});
  }
  return acts.length?{...base,source:'authored',acts}:base;
}
/** Binary search; sections are immutable and sorted. Returns null for unlabelled gaps. */
export function actAtV600(plan:ConcertArcV600,ms:number):ConcertActV600|null{
  if(!valid(ms)||ms<0||ms>=plan.durationMs||!plan.acts.length)return null;
  let left=0,right=plan.acts.length;
  while(left<right){const mid=(left+right)>>1;if(plan.acts[mid].startMs<=ms)left=mid+1;else right=mid;}
  const act=plan.acts[left-1];return act&&ms<act.endMs?act:null;
}
const smooth=(x:number)=>{const v=clamp(x,0,1);return v*v*(3-2*v);};
/** One stable 4-beat narrative per known act: intro -> development -> climax -> release.
 * For unlabeled material use ONLY a conservative overall-duration envelope.
 */
export function sampleUltimateConcertV600(plan:ConcertArcV600,input:{trackId:string;progressMs:number;playing:boolean;
 reducedMotion:boolean;tier:'low'|'balanced'|'high';enabled:boolean;manualDance:boolean;manualCamera:boolean;
 manualLighting:boolean;lyricsProtected:boolean;base:ConcertDynamicsV502}):ConcertArcCueV600{
  const {base,progressMs}=input;
  const off:ConcertArcCueV600={active:false,source:'off',section:null,act:-1,shot:'off',formation:null,moment:'off',dynamics:base};
  if(!input.enabled||!base.active||!input.playing||input.reducedMotion||input.tier==='low'||
    !valid(progressMs)||progressMs<0||progressMs>=plan.durationMs||!plan.trackId||
    input.trackId!==plan.trackId||plan.genre!==base.genre||!['labeled','estimated'].includes(base.evidence))return off;
  const candidate=actAtV600(plan,progressMs);
  // The runtime V318 timeline must independently confirm this very same label;
  // a stale import may not inject a named hook/drop into a different live scene.
  const act=candidate&&base.evidence==='labeled'&&candidate.section===base.section?candidate:null;
  // If some parts of the imported song are unlabelled, never apply a named scene.
  const intervalStart=act?.startMs??0;
  const intervalEnd=act?.endMs??plan.durationMs;
  const phase=clamp((progressMs-intervalStart)/Math.max(1,intervalEnd-intervalStart),0,1);
  const moment=phase<.15?'opening':phase<.64?'develop':phase<.86?'peak':'release';
  const contour=moment==='opening'?smooth(phase/.15)*.52:moment==='develop'?.67:moment==='peak'?1:.38+(1-smooth((phase-.86)/.14))*.62;
  // A section-free fallback is only a very light generic phrase envelope,
  // never an invented hook/drop or a fabricated camera cut.
  const source=act?'authored':'playback-only';
  const confidence=act?1:.25;
  const tierGain=input.tier==='balanced'?.65:1;
  const genreGain=plan.genre==='hardtekk'?1.03:plan.genre==='hardstyle'?1.08:1;
  const power=contour*confidence*tierGain*genreGain*(input.lyricsProtected?.35:1);
  const section=act?.section??null;
  const focus=section==='drop'||section==='hook'?.9:section==='build'?.62:section==='break'?-.45:.36;
  const shot=act?.shot??'off';
  const shotBias=shot==='ensemble'?.85:shot==='lead'?.70:shot==='side'?.55:.4;
  const roundBound=(v:number)=>round(clamp(v,.88,1.12));
  const dynamics:ConcertDynamicsV502={...base,
    dance:input.manualDance?base.dance:roundBound(base.dance*(1+power*focus*.026)),
    camera:input.manualCamera?base.camera:roundBound(base.camera*(1+power*(shotBias-.43)*.035)),
    lighting:input.manualLighting?base.lighting:roundBound(base.lighting*(1+power*focus*.035)),
    // No changes to lyric progress, karaoke word, line layout or glow value.
  };
  return {active:true,source,section,act:act?.index??-1,shot,formation:act?.formation??null,moment,dynamics};
}
/** Reuse only V442/V446 automatically generated group cues. Re-position at their
 * EXISTING timestamps using the validated V326 spacing layout and transition.
 * Never modifies saved/manual groups, cast/roles, lyrics, motion clips or foot IK.
 */
export function refineAutomaticConcertGroupV600(group:GroupStudioV326|null,plan:ConcertArcV600):GroupStudioV326|null{
  if(!group||!group.enabled||group.trackId!==plan.trackId||plan.source!=='authored'||
    !group.songSync||![3,4].includes(group.count)||group.cues.length<2||group.cues.length>64||
    !group.cues.every(c=>/^(auto-v442-|v446-)/.test(c.id)))return group;
  let changed=false;
  const cues=group.cues.map(cue=>{
    const act=actAtV600(plan,cue.at*1000);
    if(!act||cue.drop||cue.focus<0||act.formation===cue.formation)return cue;
    // Respect V446's group/hook directives and protect low performer spacing.
    if(act.section==='hook'||act.section==='drop')return cue;
    changed=true;
    return {...cue,formation:act.formation,positions:layoutV326(act.formation,group.count)};
  });
  return changed?{...group,cues}:group;
}
