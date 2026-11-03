/** V868 – Concert Director 5.0: full-song dramaturgy for VERIFIED V604 acts.
 * Pure, deterministic, seek-stable and fail-closed. No new audio detection,
 * camera cuts, lights, timers, flashes or generated FX: this module only
 * redistributes the gains of the already-authorized V850 automatic FX lanes.
 */
import type {FestivalShowGainsV850} from './smartFestivalShowDirectorV850';
import type {ConcertFxSectionV810} from './concertFxStudioV810';
import type {FxTimelineLaneV823} from './visualFxTimelineV823';

export type SongArcChapterV868='setup'|'development'|'respite'|'anticipation'|'payoff'|'finale';
export type SongArcSectionV868='verse'|'hook'|'build'|'drop'|'break';
export type SongArcActV868={index:number;startMs:number;endMs:number;
 section:SongArcSectionV868;repetition:number;motif:string;};
export type VerifiedSongArcV868={source:'verified-v600'|'unavailable';trackId:string;
 durationMs:number;endingSupported:boolean;acts:readonly SongArcActV868[]};
export type SongArcInputV868={arc?:VerifiedSongArcV868|null;trackId:string;
 index:number;startMs:number;endMs:number;progressMs:number;
 section:ConcertFxSectionV810;lyricsProtected:boolean;vocalFocus:boolean;
 authoredLanes?:readonly FxTimelineLaneV823[]};
export type SongArcCueV868={verified:boolean;chapter:SongArcChapterV868|null;
 phase:number;repetition:number;nextSection:SongArcSectionV868|null;};
const clamp=(n:number)=>Math.max(0,Math.min(1,n));
const smooth=(n:number)=>{const x=clamp(n);return x*x*(3-2*x);};
const round=(n:number)=>Math.round(n*1000000)/1000000;
const validSection=(s:unknown):s is SongArcSectionV868=>
 s==='verse'||s==='hook'||s==='build'||s==='drop'||s==='break';
const off:SongArcCueV868={verified:false,chapter:null,phase:0,repetition:0,nextSection:null};
/** Validate the WHOLE plan, not only the current act, to reject stale cross-track data. */
export function inspectSongArcV868(i:SongArcInputV868):SongArcCueV868{
 const a=i.arc;
 if(!a||a.source!=='verified-v600'||a.trackId!==i.trackId||!i.trackId||
    !Number.isFinite(a.durationMs)||a.durationMs<=0||!Array.isArray(a.acts)||
    a.acts.length<2||a.acts.length>160||typeof a.endingSupported!=='boolean'||
    !Number.isInteger(i.index)||
    i.index<0||i.index>=a.acts.length||
    ![i.startMs,i.endMs,i.progressMs].every(Number.isFinite)||
    i.progressMs<i.startMs||i.progressMs>=i.endMs||i.endMs>a.durationMs)return off;
 let prev=0;
 for(const [n,act] of a.acts.entries()){
  if(!act||act.index!==n||!validSection(act.section)||
    ![act.startMs,act.endMs].every(Number.isFinite)||
    act.startMs<prev||act.startMs<0||act.endMs-act.startMs<2600||
    act.endMs>a.durationMs||!Number.isInteger(act.repetition)||
    act.repetition<0||act.repetition>160||
    !['portrait','dialogue','ensemble','wide','breath','crescendo'].includes(act.motif))return off;
  prev=act.endMs;
 }
 const current=a.acts[i.index];
 if(current.startMs!==i.startMs||current.endMs!==i.endMs||
    current.section!==i.section)return off;
 const next=a.acts[i.index+1];
 const nextSection=next&&next.startMs-current.endMs<=1500?next.section:null;
 const p=clamp((i.progressMs-i.startMs)/(i.endMs-i.startMs));
 // Finales only for explicit V604 ending support; a late hook alone is NOT proof.
 const last=i.index===a.acts.length-1;
 const finale=last&&a.endingSupported&&current.endMs>=a.durationMs-1500&&
    current.startMs>=a.durationMs*.75;
 const chapter:SongArcChapterV868=finale?'finale':current.section==='break'?'respite':
    current.section==='build'&&nextSection==='drop'?'anticipation':
    current.section==='hook'||current.section==='drop'?'payoff':
    i.index<=1?'setup':'development';
 return {verified:true,chapter,phase:round(p),repetition:current.repetition,
  nextSection:nextSection??null};
}
/** Work solely within the previous director's [0,1] ceiling. Keep per-lane
 * authored/muted values untouched and never re-enable an original zero cue.
 * Automatic highlights are *less dimmed* (at most 1), never newly fired.
 */
export function shapeSongArcGainsV868(gains:FestivalShowGainsV850,
 i:SongArcInputV868,cue:SongArcCueV868,strength:number):FestivalShowGainsV850{
 if(!cue.verified||!cue.chapter||!Number.isFinite(strength)||strength<=0)return gains;
 const fade=clamp(strength);
 const copy:FestivalShowGainsV850={...gains};
 const editable=(lane:FxTimelineLaneV823)=>!i.authoredLanes?.includes(lane);
 const dim=(lane:keyof FestivalShowGainsV850,factor:number)=>{
  if((lane==='laser'||lane==='led'||lane==='particles'||lane==='foam'||lane==='transition')&&
     !editable(lane))return;
  copy[lane]=round(clamp(copy[lane]*(1-(1-clamp(factor))*fade)));
 };
 const release=(lane:keyof FestivalShowGainsV850,weight:number)=>{
  if((lane==='laser'||lane==='led'||lane==='particles'||lane==='foam'||lane==='transition')&&
     !editable(lane))return;
  // A zero automatic gain stays zero. Never re-enable a director-blocked effect.
  if(copy[lane]<=0)return;
  // Lyrics/singers always outrank a requested show peak.
  if((i.lyricsProtected||i.vocalFocus)&&lane!=='ambience')return;
  copy[lane]=round(clamp(copy[lane]+(1-copy[lane])*clamp(weight)*fade));
 };
 const p=cue.phase;
 switch(cue.chapter){
  case 'setup':
   dim('festival',.88);dim('particles',.93);dim('laser',.91);
   break;
  case 'development':
   // Repeated verses trade decoration for more readable performer presence.
   if(cue.repetition>0){dim('laser',.88);dim('festival',.92);}
   break;
  case 'respite':
   dim('festival',.75);dim('laser',.78);dim('particles',.86);
   break;
  case 'anticipation': {
   // Hold back the first half of the build, then gradually release existing
   // accent FX into the already-verified next drop. No synthetic drop signal.
   const lift=smooth((p-.40)/.54);
   dim('festival',.76+.24*lift);
   dim('particles',.82+.18*lift);
   release('led',.20*lift);release('laser',.13*lift);
   break;
  }
  case 'payoff': {
   // Rotating existing motifs across repeated hooks, without a new cue.
   const motif=i.arc!.acts[i.index].motif;
   if(motif==='portrait'||motif==='dialogue'){
    dim('laser',.88);dim('festival',.89);
   }else if(motif==='wide'||motif==='ensemble'){
    release('led',.14);release('ambience',.08);
   }
   break;
  }
  case 'finale': {
   // Final act gradually opens the existing scene. Keep lyric glare limits.
   const lift=smooth((p-.18)/.73);
   release('led',.28*lift);release('transition',.16*lift);
   release('festival',.31*lift);release('ambience',.18*lift);
   release('particles',.12*lift);
   break;
  }
 }
 return copy;
}
