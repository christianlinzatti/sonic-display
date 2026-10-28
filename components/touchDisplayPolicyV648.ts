/** V648 – 10-inch touch-screen presentation policy. Presentation-only, never changes Spotify,
 * audio timing, graphics tier, the user's lyric settings, or authored show timelines.
 */
export type TouchReadabilityV648 = 'standard'|'clear'|'large';
export type TouchViewV648 = 'stage'|'split'|'lyrics';
export const TOUCH_READABILITY_ORDER_V648:readonly TouchReadabilityV648[]=['standard','clear','large'];
const finite=(x:unknown):x is number=>typeof x==='number'&&Number.isFinite(x);
export function isTouchReadabilityV648(v:unknown):v is TouchReadabilityV648 {
  return v==='standard'||v==='clear'||v==='large';
}
export function nextTouchReadabilityV648(v:TouchReadabilityV648):TouchReadabilityV648 {
  return v==='standard'?'clear':v==='clear'?'large':'standard';
}
export function resolveTouchViewportV648(input:{enabled:boolean;width:number;height:number;view:TouchViewV648;readability:TouchReadabilityV648}) {
  const {enabled,width,height,view,readability}=input;
  const known=finite(width)&&finite(height)&&width>0&&height>0;
  const landscape=known&&width>height;
  // 10-inch kiosk shapes: 1024x600, 1280x800, 1366x768; do not impose a
  // simulated screen size on desktops or browsers that have not measured yet.
  const compact=Boolean(enabled&&landscape&&height<=820&&width<=1440);
  const portrait=Boolean(enabled&&known&&!landscape);
  const lyricsPriority=Boolean(enabled&&view!=='stage');
  return {compact,portrait,lyricsPriority,readability:enabled?readability:'standard',
    showLyricOverlay:lyricsPriority,layout:enabled?view:'standard'} as const;
}
/** Optional in-scene lyrics remain user-controlled; the kiosk multiplier only enlarges.
 * Keep finite settings and an upper limit to avoid overflowing a 10-inch canvas.
 */
export function resolveImmersiveLyricFontV648(value:number,enabled:boolean,readability:TouchReadabilityV648):number {
  if(!finite(value))return 100;
  const base=Math.max(40,Math.min(240,value));
  if(!enabled)return value;
  const factor=readability==='large'?1.20:readability==='clear'?1.10:1;
  return Math.round(Math.min(240,base*factor)*100)/100;
}
