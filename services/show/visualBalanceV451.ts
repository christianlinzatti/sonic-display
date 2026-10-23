/** V451: deterministic, side-effect-free visual attention budget for passive song metadata.
 * Never changes a singer assignment, stage/camera cue or the lyric text itself.
 * Nothing is inferred from Genius about vocalist identity or sample timing.
 */
export type VisualAttentionV451 = "quiet"|"lyrics"|"balanced"|"insights";
export type VisualBalanceV451 = {
  attention:VisualAttentionV451;
  allowAutomaticInsight:boolean;
  allowCinematic:boolean;
  allowConnectionSpotlight:boolean;
  /** Explains the behavior for diagnostics and regression tests. */
  reason:"disabled"|"paused"|"active-lyrics"|"lyric-boundary"|"short-break"|"long-break"|"no-synced-lyrics"|"lyrics-hidden"|"group-show";
};
export type VisualBalanceInputV451={
  enabled:boolean;playing:boolean;progressMs:number;
  lyricsVisible:boolean;immersiveLyrics:boolean;
  lyrics:{synced:boolean;lines:ReadonlyArray<{startMs:number;endMs?:number|null;text:string}>}|null;
  activeIndex:number;
};
const BLOCKED=(attention:VisualAttentionV451,reason:VisualBalanceV451["reason"]):VisualBalanceV451=>({
  attention,reason,allowAutomaticInsight:false,allowCinematic:false,allowConnectionSpotlight:false,
});
const ALLOWED=(attention:VisualAttentionV451,reason:VisualBalanceV451["reason"]):VisualBalanceV451=>({
  attention,reason,allowAutomaticInsight:true,allowCinematic:attention==="insights",allowConnectionSpotlight:true,
});
/** Prefer lyrics when a timed line is actually being read, especially in immersive mode.
 * A verified >= 2.8s between lines allows brief, passive information; a small break
 * allows a compact connection but not an image-heavy cinematic card.
 * Clock- and track-seek-safe: no timers, previous frames, or random states.
 */
export function planVisualBalanceV451(input:VisualBalanceInputV451):VisualBalanceV451{
  if(!input.enabled)return ALLOWED("insights","disabled"); // legacy behavior is preserved by caller
  if(!input.playing||!Number.isFinite(input.progressMs)||input.progressMs<0)return BLOCKED("quiet","paused");
  if(!input.lyricsVisible)return ALLOWED("insights","lyrics-hidden");
  if(!input.lyrics?.synced||!input.lyrics.lines.length)return ALLOWED("insights","no-synced-lyrics");
  const lines=input.lyrics.lines;
  const t=input.progressMs;
  // Recompute the current line from its actual timestamps: activeIndex may briefly lag a seek.
  let index=-1;
  for(let i=0;i<lines.length;i++){
    if(!Number.isFinite(lines[i].startMs))continue;
    if(lines[i].startMs<=t)index=i;else break;
  }
  if(index>=0){
    const line=lines[index];
    const next=lines[index+1];
    const nextStart=next?.startMs??Infinity;
    const end=line.endMs!=null&&Number.isFinite(line.endMs)&&line.endMs>line.startMs
      ? Math.min(line.endMs,nextStart):Math.min(nextStart,line.startMs+4500);
    // Guard readable lines, even if the supplied activeIndex is stale or negative.
    if(t<=end+350 && line.text.trim())return BLOCKED("lyrics","active-lyrics");
    const gap=Number.isFinite(nextStart)?Math.max(0,nextStart-t):Infinity;
    if(gap<900)return BLOCKED("lyrics","lyric-boundary");
    if(gap<2800)return BLOCKED("balanced","short-break");
    // When immersive lyrics are on-screen, prefer the actual stage during short breaks.
    if(input.immersiveLyrics && gap<4000)return BLOCKED("balanced","short-break");
    return ALLOWED(gap<4000?"balanced":"insights",gap<4000?"short-break":"long-break");
  }
  const first=lines.find(line=>Number.isFinite(line.startMs));
  const intro=first?.startMs??Infinity;
  if(intro-t<900)return BLOCKED("lyrics","lyric-boundary");
  if(intro-t<2800)return BLOCKED("balanced","short-break");
  return ALLOWED("insights","long-break");
}

/** Exactly one unattended info card. Manual Genius discovery disclosure stays accessible. */
export function chooseAutomaticInsightV451(input:{
  enabled:boolean;balance:VisualBalanceV451;hasRegularCard:boolean;hasConnectionCard:boolean;
}):"regular"|"connection"|"none"{
  if(!input.enabled)return input.hasRegularCard?"regular":input.hasConnectionCard?"connection":"none";
  if(!input.balance.allowAutomaticInsight)return "none";
  if(input.hasConnectionCard)return "connection";
  return input.hasRegularCard?"regular":"none";
}
