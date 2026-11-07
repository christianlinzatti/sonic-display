/** V1079 – Live Artist Interaction.
 * Accent the already-rendered performer/crowd cue ONLY inside evidenced gaps
 * between current synced lyric lines. A line gap is not proof of instrumental
 * audio or silent vocals: do not invent singing, applause, partner roles or beats.
 * This planner creates no animation, scene graph objects, sounds or device I/O.
 */
import type {Lyrics} from '../types/playbackCore';
import type {ArenaShowCueV1040} from './arena360ShowDesignerV1040';
import type {AvatarAudienceCueV1074} from './arena360AvatarAudienceInteractionV1074';

export type LiveArtistIntentV1079='partner'|'audience'|'quiet';
export type LiveArtistInputV1079={
 enabled:boolean;playing:boolean;stageIsArena:boolean;audienceEnabled:boolean;
 showDesignerEnabled:boolean;reducedMotion:boolean;reactive?:boolean;
 manualPriority?:boolean;performanceTier?:'low'|'balanced'|'high'|null;
 show?:ArenaShowCueV1040|null;baseline:AvatarAudienceCueV1074;
 trackId?:string|null;durationMs?:number|null;progressMs?:number|null;
 lyricsProgressMs?:number|null;lyrics?:Lyrics|null;
 strength?:number;performerCount?:number;
};
const valid=(n:unknown):n is number=>typeof n==='number'&&Number.isFinite(n);
const clamp=(n:number,l:number,h:number)=>Math.max(l,Math.min(h,n));
const smooth=(v:number)=>{const x=clamp(v,0,1);return x*x*(3-2*x)};

/** No clock, lyric or clip state is mutated; invalid evidence preserves base. */
export function planLiveArtistInteractionV1079(p:LiveArtistInputV1079):AvatarAudienceCueV1074{
 const base=p.baseline;
 if(!p.enabled||!p.playing||!p.stageIsArena||!p.audienceEnabled||
    !p.showDesignerEnabled||p.reducedMotion||p.reactive===false||
    p.manualPriority||p.performanceTier==='low')return base;
 if(!valid(p.strength)||p.strength<=0||p.strength>80||
    typeof p.trackId!=='string'||!p.trackId.trim()||p.trackId.length>160||
    !valid(p.durationMs)||p.durationMs<30000||p.durationMs>1800000||
    !valid(p.progressMs)||p.progressMs<0||p.progressMs>p.durationMs||
    !valid(p.lyricsProgressMs)||Math.abs(p.lyricsProgressMs-p.progressMs)>400||
    !Number.isInteger(p.performerCount)||p.performerCount!<1||p.performerCount!>4)return base;
 const show=p.show;
 if(!show?.active||!Number.isInteger(show.segmentIndex)||show.segmentIndex<0||show.segmentIndex>6||
    !valid(show.intensity)||show.intensity<=0||show.intensity>100||
    !valid(show.fade)||show.fade<=0||show.fade>1)return base;
 const lines=p.lyrics?.lines;
 if(p.lyrics?.synced!==true||!Array.isArray(lines)||lines.length<2||lines.length>512)return base;
 // V1079 only knows the supplied timed lyric gaps. Never call a planned
 // interlude an instrumental or assume a vocalist has stopped singing.
 let found=-1,from=0,to=0;
 for(let i=0;i<lines.length-1;i++){
  const prev=lines[i],next=lines[i+1];
  if(!prev||!next||!prev.text?.trim()||!next.text?.trim()||
     !valid(prev.startMs)||!valid(prev.endMs)||!valid(next.startMs)||
     prev.startMs<0||prev.endMs<=prev.startMs||next.startMs<=prev.endMs||
     next.startMs>p.durationMs)continue;
  const span=next.startMs-prev.endMs;
  if(span<1800||span>16000)continue;
  // Sparse word data must not contradict the end of the preceding line.
  if(prev.words?.length&&prev.words.some(w=>!valid(w.startMs)||w.startMs<prev.startMs||
      (w.endMs!=null&&(!valid(w.endMs)||w.endMs>prev.endMs!||w.endMs<w.startMs))))continue;
  if(p.progressMs>=prev.endMs+420&&p.progressMs<=next.startMs-420){
    found=i;from=prev.endMs;to=next.startMs;break;
  }
 }
 if(found<0)return base;
 const envelope=smooth((p.progressMs-from-400)/650)*smooth((to-400-p.progressMs)/650);
 const tier=p.performanceTier==='balanced'?.7:1;
 const gain=clamp((p.strength/100)*(show.intensity/100)*show.fade*tier*envelope,0,.60);
 if(gain<.002)return base;
 const intent:LiveArtistIntentV1079=p.performerCount!>1&&found%3===0?'partner':
    found%3===2?'quiet':'audience';
 const gesture=intent==='partner'?'answer':intent==='audience'?'invite':'listen';
 // Quiet partner acknowledgement vs an invitation to the existing crowd.
 const audienceReply=clamp(gain*(intent==='audience'?.64:intent==='partner'?.16:.07),0,.38);
 let hash=2166136261;
 for(let i=0;i<p.trackId.length;i++)hash=Math.imul(hash^p.trackId.charCodeAt(i),16777619);
 const phase=((hash>>>0)%1024)/1024*Math.PI*2+(found%4)*.42;
 return {active:true,reason:'planned',gesture,gain,phase,audienceReply,
   interactionIntentV1079:intent};
}
