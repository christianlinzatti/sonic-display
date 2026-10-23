/** V465 Visual Show Quality: stable, strictly visual decluttering of automatic artist labels.
 * A singer is NEVER inferred from Spotify credits, lyrics or camera focus.
 * No changes to lyrics, saved assignments, 3D bones, camera or light keyframes.
 */
import type {ArtistBubblePlanV441} from '../../components/visualizer/artistNameBubblesV441';
import type {FeatureDirectionV460} from '../../components/visualizer/intelligentFeaturePerformanceV460';
export type VisualQualityModeV465='off'|'stage-first'|'lyrics-first';
export interface VisualShowQualityV465 {
  active:boolean;mode:VisualQualityModeV465;
  reason:'paused'|'no-lyrics'|'few-artists'|'manual-priority'|'user-always'|'lyrics-crowded'|'no-labels';
  /** Number of V441 labels retained, NOT the number of singers. */
  visibleLabels:number;
  bubbles:ArtistBubblePlanV441;
}
export interface VisualQualityInputV465 {
  playing:boolean;
  activeLyrics:boolean;
  immersiveLyrics:boolean;
  count:number;
  bubbles:ArtistBubblePlanV441;
  feature:FeatureDirectionV460;
}
/** When four dancers share a synchronized lyric surface, show at most the two
 * most relevant automatic STAGE labels. Explicit 'always' and manually authored
 * stage casting win. This is a legibility preference, not vocal attribution.
 * Deterministic, stateless, seek-safe with at most four small labels.
 */
export function planVisualShowQualityV465(input:VisualQualityInputV465):VisualShowQualityV465 {
  const plan=input.bubbles;
  const visibleLabels=plan.bubbles.filter(b=>b.visible).length;
  const original=(reason:VisualShowQualityV465['reason'],mode:VisualQualityModeV465='stage-first'):
    VisualShowQualityV465=>({active:false,mode,reason,visibleLabels,bubbles:plan});
  if(!input.playing)return original('paused','off');
  if(!plan.enabled||visibleLabels===0)return original('no-labels');
  if(plan.source==='manual-stage')return original('manual-priority');
  if(plan.mode==='always')return original('user-always');
  if(!input.activeLyrics||!input.immersiveLyrics)return original('no-lyrics');
  const count=Number.isFinite(input.count)?Math.floor(input.count):0;
  if(count<=2||visibleLabels<=2)return original('few-artists','lyrics-first');
  // Never hide the featured pair of visual slots during a V460 duet reply.
  const reply=input.feature.active&&input.feature.moment==='reply';
  const preferred=new Set<number>();
  if(reply){preferred.add(input.feature.lead);preferred.add(input.feature.partner);}
  else if(plan.activeSlot!==null)preferred.add(plan.activeSlot);
  const candidates=plan.bubbles.filter(b=>b.visible).sort((a,b)=>{
    const score=(item:typeof a)=> (preferred.has(item.slot)?10:0)+(item.emphasized?2:0);
    return score(b)-score(a)||a.slot-b.slot;
  });
  const selected=new Set(candidates.slice(0,2).map(b=>b.slot));
  const bubbles={...plan,bubbles:plan.bubbles.map(b=>!b.visible||selected.has(b.slot)?b:{...b,visible:false})};
  return {active:true,mode:'lyrics-first',reason:'lyrics-crowded',visibleLabels:selected.size,bubbles};
}
