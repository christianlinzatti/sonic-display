/**
 * V796 – Deutschrap Performance Director.
 * A deterministic, additive phrasing pass over the EXISTING V437 lyric-timed
 * performance and optional V790 verified concert arc. It does not recognize
 * artists, adlibs, vocals, phonemes or beats and does not change authored motion.
 * The existing avatar controller owns all bone updates and lip synchronization.
 */
// Structural evidence contracts keep the pure planner independently typecheckable.
// Real V437/V790 values are passed unchanged by VisualizerStage.
type RapPerformancePlanEvidenceV796={available:boolean;trackId:string;authored:boolean;
 lines:readonly {lineIndex:number;startMs:number;endMs:number;scene:string}[]};
type RapPerformanceCueEvidenceV796={active:boolean;lineIndex:number;scene:string;
 energy:number;gesturePulse:number};
type VerifiedShowEvidenceV796={active:boolean;reason:string;moment:string|null;
 blend:number;emphasis:number};

export type RapPhraseV796='off'|'verse-flow'|'hook-lift'|'response'|'duet';
export type RapGestureV796='grounded'|'address'|'emphasis'|'open';
export type RapPerformanceCueV796=Readonly<{
 active:boolean;trackId:string;lineIndex:number;
 phrase:RapPhraseV796;gesture:RapGestureV796;
 source:'off'|'timed-lyrics'|'authored-assignment';
 danceGain:number;aggressionDelta:number;variationDelta:number;
 gestureDelta:number;faceDelta:number;
}>;
export const RAP_PERFORMANCE_OFF_V796:RapPerformanceCueV796=Object.freeze({
 active:false,trackId:'',lineIndex:-1,phrase:'off',gesture:'grounded',source:'off',
 danceGain:1,aggressionDelta:0,variationDelta:0,gestureDelta:0,faceDelta:0,
});
const finite=(value:unknown):value is number=>typeof value==='number'&&Number.isFinite(value);
const clamp=(v:number,min:number,max:number)=>Math.max(min,Math.min(max,v));
const rounded=(v:number)=>Math.round(v*100000)/100000;
function isRap(genre:string|null|undefined):boolean{
 return /deutschrap|hip[\s-]?hop|trap|drill|grime|boom[\s-]?bap|(^|[^a-z])rap([^a-z]|$)/i.test(genre??'');
}
/** Hash only the song identifier and current REAL lyric line, never Date.now(). */
function phraseVariant(trackId:string,index:number):number{
 let hash=2166136261;
 for(let i=0;i<trackId.length;i++)hash=Math.imul(hash^trackId.charCodeAt(i),16777619);
 return (Math.imul(hash^index,16777619)>>>0)%4;
}
export function sampleDeutschrapPerformanceV796(input:{
 trackId:string;positionMs:number;genre:string|null|undefined;playing:boolean;enabled:boolean;
 reducedMotion:boolean;tier:'low'|'balanced'|'high';lyricsProtected:boolean;
 manualDance:boolean;manualVocal:boolean;linePlan:RapPerformancePlanEvidenceV796;
 lineCue:RapPerformanceCueEvidenceV796;show:VerifiedShowEvidenceV796;
}):RapPerformanceCueV796{
 const {trackId,linePlan,lineCue,show}=input;
 if(!input.enabled||!input.playing||input.reducedMotion||input.tier==='low'||
    !isRap(input.genre)||!trackId||trackId.length>250||
    !linePlan?.available||linePlan.trackId!==trackId||
    !finite(input.positionMs)||input.positionMs<0||
    !lineCue?.active||!Number.isInteger(lineCue.lineIndex)||lineCue.lineIndex<0||
    !finite(lineCue.energy)||lineCue.energy<=0||lineCue.energy>1||
    !finite(lineCue.gesturePulse)||lineCue.gesturePulse<0||lineCue.gesturePulse>.45||
    !Array.isArray(linePlan.lines)||!linePlan.lines.length)
   return RAP_PERFORMANCE_OFF_V796;
 // One binary search of the already-sorted V437 intervals; reject stale cues
 // after song changes, seeks, and lyric gaps. Never scan all lines per frame.
 let lo=0,hi=linePlan.lines.length;
 while(lo<hi){const mid=(lo+hi)>>1;
   if(linePlan.lines[mid].startMs<=input.positionMs)lo=mid+1;else hi=mid;}
 const line=linePlan.lines[lo-1];
 if(!line||input.positionMs>=line.endMs||line.lineIndex!==lineCue.lineIndex||
   line.scene!==lineCue.scene)return RAP_PERFORMANCE_OFF_V796;
 if(input.manualDance&&input.manualVocal)return RAP_PERFORMANCE_OFF_V796;
 const authored=linePlan.authored===true;
 const hook=lineCue.scene==='hook';
 const exchange=authored&&(lineCue.scene==='reply'||lineCue.scene==='duet');
 const phrase:RapPhraseV796=exchange?(lineCue.scene==='duet'?'duet':'response'):
   hook?'hook-lift':'verse-flow';
 const variant=phraseVariant(trackId,lineCue.lineIndex);
 const gesture:RapGestureV796=(['grounded','address','emphasis','open'] as const)[variant];
 // The V790 extra lift requires CONFIRMED, matching show evidence. A lyric
 // repetition alone is NOT a verified main-peak or a singer assignment.
 const verified=show?.active===true&&show.reason==='verified-show'&&
   finite(show.blend)&&show.blend>0&&show.blend<=1&&
   finite(show.emphasis)&&show.emphasis>=-.7&&show.emphasis<=1;
 const peak=verified&&show.moment==='payoff'&&show.emphasis>0?
   clamp(show.blend*show.emphasis,0,.8):0;
 const quiet=verified&&show.moment==='breath'?.5:1;
 const safe=clamp(lineCue.energy*quiet*(input.tier==='balanced'?.6:1),0,1);
 const variety=[.78,1,1.11,.9][variant];
 const voicePulse=clamp(lineCue.gesturePulse,0,.45);
 // No automatic strength increase for manual lanes. Avoid competing with
 // protected lyrics: cap both the visual movement and facial accents.
 const lyricGain=input.lyricsProtected?.48:1;
 const dance=input.manualDance?0:safe*variety*lyricGain;
 const voice=input.manualVocal?0:safe*(input.lyricsProtected?.68:1);
 const danceGain=input.manualDance?1:rounded(1+clamp(dance*(hook?.032:exchange?.020:.017)+peak*.010,0,.050));
 const aggressionDelta=rounded(clamp(dance*(hook?.024:exchange?.011:.009),0,.025));
 const variationDelta=rounded(clamp(dance*([.012,.023,.036,.032][variant]),0,.038));
 const gestureDelta=input.manualVocal?0:rounded(clamp(voice*(hook?3.8:exchange?4.1:2.7)*([.58,1.08,1.2,.95][variant])+voicePulse*2.3,0,5.5));
 const faceDelta=rounded(clamp(voice*(exchange?2.4:hook?2.2:1.5)*(gesture==='emphasis'?1.1:1),0,2.6));
 if(dance===0&&voice===0)return RAP_PERFORMANCE_OFF_V796;
 return {active:true,trackId,lineIndex:lineCue.lineIndex,phrase,gesture,
   source:exchange?'authored-assignment':'timed-lyrics',danceGain,aggressionDelta,
   variationDelta,gestureDelta,faceDelta};
}
/** Apply only additive, clamped strengths; preserve exact lip-sync/mouth signal. */
export function applyDeutschrapPerformanceV796<T extends {
 intensity:number;aggression:number;variation:number;face:number;gesture:number;
 style:'smooth'|'balanced'|'sharp';rapLip:boolean;
}>(base:T,cue:RapPerformanceCueV796):T{
 if(!cue.active)return base;
 if(![base.intensity,base.aggression,base.variation,base.face,base.gesture,
   cue.danceGain,cue.aggressionDelta,cue.variationDelta,cue.faceDelta,cue.gestureDelta].every(finite))return base;
 return {...base,
  intensity:rounded(clamp(base.intensity*clamp(cue.danceGain,1,1.05),0,2)),
  aggression:rounded(clamp(base.aggression+clamp(cue.aggressionDelta,0,.025),0,1)),
  variation:rounded(clamp(base.variation+clamp(cue.variationDelta,0,.038),0,1)),
  face:rounded(clamp(base.face+clamp(cue.faceDelta,0,2.6),0,100)),
  gesture:rounded(clamp(base.gesture+clamp(cue.gestureDelta,0,5.5),0,100)),
  // Deliberately untouched: style, rapLip, lip-sync modes, motion URLs, bones.
 } as T;
}
