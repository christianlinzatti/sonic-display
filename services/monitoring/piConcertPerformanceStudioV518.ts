/** V518 – pure, bounded comparison of *observed* main-canvas render windows.
 * No fabricated FPS, no synthetic GPU or process-memory measurements.
 */
export type PiStudioFeaturesV518 = Readonly<{
  lyrics:boolean;lipSync:boolean;reactiveLighting:boolean;
}>;
export type PiStudioReadingV518 = Readonly<{
  at:number;fps:number;p95FrameMs:number;slowPercent:number;drawCalls:number;triangles:number;
  /** V522: optional observed per-window P99 and WebGL resource counts. */
  p99FrameMs?:number;geometries?:number;textures?:number;
  /** Observed drawing-buffer resolution of the running main WebGL canvas. */
  renderWidthPx?:number;renderHeightPx?:number;
  avatarCount:number;tier:'low'|'balanced'|'high';dpr:number;
  piProfile:string;piLevel:string;features:PiStudioFeaturesV518;heapMb:number|null;
}>;
export type PiStudioCaptureV518=Readonly<{
  at:number;startAt:number;endAt:number;count:number;configuration:string;
  avatarCount:number;tier:PiStudioReadingV518['tier'];dpr:number;
  piProfile:string;piLevel:string;features:PiStudioFeaturesV518;
  avgFps:number;minFps:number;worstWindowP95Ms:number;avgSlowPercent:number;
  avgDrawCalls:number;avgTriangles:number;peakHeapMb:number|null;
}>;
export type CaptureResultV518=Readonly<{
  status:'ready'|'stale'|'mixed'|'insufficient';capture:PiStudioCaptureV518|null;
  count:number;reason:string;
}>;
const valid=(n:number,lo:number,hi:number)=>Number.isFinite(n)&&n>=lo&&n<=hi;
export const PI_STUDIO_HISTORY_LIMIT_V518=120;
export const PI_STUDIO_MIN_WINDOWS_V518=6;
export const PI_STUDIO_MAX_WINDOWS_V518=20;
export function studioConfigurationV518(r:PiStudioReadingV518):string{
  const {features:f}=r;
  const size=r.renderWidthPx!==undefined&&r.renderHeightPx!==undefined?`|${r.renderWidthPx}x${r.renderHeightPx}`:'';
  return `${r.avatarCount}|${r.tier}|${r.dpr.toFixed(2)}|${r.piProfile}|${r.piLevel}|${+f.lyrics}${+f.lipSync}${+f.reactiveLighting}${size}`;
}
export function validStudioReadingV518(r:PiStudioReadingV518):boolean{
  return valid(r.at,1,Number.MAX_SAFE_INTEGER)&&valid(r.avatarCount,2,4)&&
    valid(r.fps,1,240)&&valid(r.p95FrameMs,0.01,250)&&
    valid(r.slowPercent,0,100)&&valid(r.drawCalls,0,1_000_000)&&
    (r.p99FrameMs===undefined||valid(r.p99FrameMs,r.p95FrameMs,250))&&
    (r.geometries===undefined||valid(r.geometries,0,1_000_000))&&
    (r.textures===undefined||valid(r.textures,0,1_000_000))&&
    valid(r.triangles,0,1_000_000_000)&&valid(r.dpr,.25,4)&&
    (r.renderWidthPx===undefined||Number.isInteger(r.renderWidthPx)&&valid(r.renderWidthPx,1,16384))&&
    (r.renderHeightPx===undefined||Number.isInteger(r.renderHeightPx)&&valid(r.renderHeightPx,1,16384))&&
    ((r.renderWidthPx===undefined)===(r.renderHeightPx===undefined))&&
    (r.heapMb===null||valid(r.heapMb,0,1_000_000))&&
    ['high','balanced','low'].includes(r.tier)&&
    r.piProfile.length>0&&r.piLevel.length>0&&
    typeof r.features.lyrics==='boolean'&&typeof r.features.lipSync==='boolean'&&
    typeof r.features.reactiveLighting==='boolean';
}
export function appendPiStudioReadingV518(previous:readonly PiStudioReadingV518[],incoming:PiStudioReadingV518):readonly PiStudioReadingV518[]{
  if(!validStudioReadingV518(incoming)||
     (previous.length>0&&incoming.at<=previous[previous.length-1].at))return previous;
  return [...previous,incoming].slice(-PI_STUDIO_HISTORY_LIMIT_V518);
}
export function capturePiStudioV518(readings:readonly PiStudioReadingV518[],now:number):CaptureResultV518{
  const latest=readings[readings.length-1];
  if(!latest||!validStudioReadingV518(latest))return {status:'insufficient',capture:null,count:0,reason:'Noch keine gültige 3D-Messung mit 2–4 Avataren.'};
  if(!valid(now,1,Number.MAX_SAFE_INTEGER)||now-latest.at>3500||now<latest.at-1500)
    return {status:'stale',capture:null,count:0,reason:'3D-Messungen sind nicht mehr aktuell.'};
  const config=studioConfigurationV518(latest);
  const stable:PiStudioReadingV518[]=[latest];
  for(let i=readings.length-2;i>=0&&stable.length<PI_STUDIO_MAX_WINDOWS_V518;i--){
    const s=readings[i],newer=stable[stable.length-1];
    if(!validStudioReadingV518(s)||studioConfigurationV518(s)!==config||
       newer.at-s.at<650||newer.at-s.at>2800)break;
    stable.push(s);
  }
  if(stable.length<PI_STUDIO_MIN_WINDOWS_V518)return {
    status:stable.length>1?'mixed':'insufficient',capture:null,count:stable.length,
    reason:`Mindestens ${PI_STUDIO_MIN_WINDOWS_V518} zusammenhängende Messfenster mit unveränderter Avatarzahl, Qualität, Pi-Profil, Lyrics, Lip-Sync und Licht nötig (${stable.length}/${PI_STUDIO_MIN_WINDOWS_V518}).`};
  const mean=(fn:(r:PiStudioReadingV518)=>number)=>stable.reduce((sum,r)=>sum+fn(r),0)/stable.length;
  const peak=stable.reduce<number|null>((highest,r)=>r.heapMb===null?highest:Math.max(highest??0,r.heapMb),null);
  return {status:'ready',count:stable.length,reason:'Zusammenhängende echte Render-Messfenster.',capture:{
    at:now,startAt:stable[stable.length-1].at,endAt:latest.at,count:stable.length,
    configuration:config,avatarCount:latest.avatarCount,tier:latest.tier,dpr:latest.dpr,
    piProfile:latest.piProfile,piLevel:latest.piLevel,features:latest.features,
    avgFps:mean(r=>r.fps),minFps:Math.min(...stable.map(r=>r.fps)),
    worstWindowP95Ms:Math.max(...stable.map(r=>r.p95FrameMs)),
    avgSlowPercent:mean(r=>r.slowPercent),avgDrawCalls:mean(r=>r.drawCalls),
    avgTriangles:mean(r=>r.triangles),peakHeapMb:peak}};
}
export type PiStudioComparisonV518=Readonly<{
  comparable:boolean;reasons:readonly string[];fpsDifference:number;p95DifferenceMs:number;
  description:string;
}>;
export function comparePiStudioV518(a:PiStudioCaptureV518,b:PiStudioCaptureV518):PiStudioComparisonV518{
  const reasons:string[]=[];
  if(a.tier!==b.tier||Math.abs(a.dpr-b.dpr)>.02)reasons.push('Grafikqualität / DPR unterschiedlich');
  if(a.piProfile!==b.piProfile||a.piLevel!==b.piLevel)reasons.push('Pi-Profil / Effektbudget unterschiedlich');
  for(const field of ['lyrics','lipSync','reactiveLighting'] as const)
    if(a.features[field]!==b.features[field])reasons.push(`${field} unterschiedlich`);
  if(a.avatarCount===b.avatarCount)reasons.push('Gleiche Avatarzahl – nur unterschiedliche Showabschnitte verglichen');
  return {comparable:reasons.length===0,reasons,fpsDifference:b.avgFps-a.avgFps,
    p95DifferenceMs:b.worstWindowP95Ms-a.worstWindowP95Ms,
    description:reasons.length?'Rahmenbedingungen unterscheiden sich – kein isolierter Avatarvergleich.':
      'Gleiche erfasste Rendering-Einstellungen. Song, Szene, Laufzeit und Temperatur können sich dennoch unterscheiden; keine Kausalitätsaussage.'};
}
export function piStudioAdviceV518(c:PiStudioCaptureV518):string{
  if(c.worstWindowP95Ms>40||c.avgSlowPercent>20||c.avgFps<27)
    return 'Hohe Frame-Last: zuerst Pi-Eco/Balanced testen oder einen Avatar reduzieren; anschließend unter gleichem Showabschnitt erneut messen.';
  if(c.worstWindowP95Ms>32||c.avgFps<40)
    return 'Teilweise begrenzte Flüssigkeit: reaktive Licht-/Lyrics-Optionen einzeln vergleichen; nichts wird automatisch umgestellt.';
  return 'Keine deutliche Belastung in diesem Messfenster. Längere Konzerte und thermisches Verhalten separat beobachten.';
}
