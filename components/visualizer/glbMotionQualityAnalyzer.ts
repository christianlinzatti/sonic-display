/** V207: read-only diagnostic on raw GLB animation tracks. Does not claim physical foot contact. */
export type QualityTrack = { name: string; times: ArrayLike<number>; values: ArrayLike<number>; getValueSize(): number };
export type QualityClip = { name: string; duration: number; tracks: QualityTrack[] };
export type ClipIssue = { code: "invalid-track" | "rotation-jump" | "fast-translation" | "possible-foot-slide" | "long-gap" | "empty"; severity: "warning" | "info"; track: string; message: string; suggestion: string; count: number };
export type ClipQualityReport = { name: string; duration: number; score: number; sampledTracks: number; keyframes: number; issues: ClipIssue[] };
const finite=(n:number)=>Number.isFinite(n);
const foot=/(?:^|[^a-z])(foot|ankle|toe|heel|leftfoot|rightfoot|foot_l|foot_r)(?:[^a-z]|$)/i;
const clamp=(v:number,a:number,b:number)=>Math.max(a,Math.min(b,v));
function quatAngle(a:number[], b:number[]) { const na=Math.hypot(...a),nb=Math.hypot(...b); if(na<1e-6||nb<1e-6)return NaN; const dot=clamp(Math.abs(a.reduce((n,x,i)=>n+x*b[i],0)/(na*nb)),0,1); return 2*Math.acos(dot); }
/** Uses finite adjacent keyframes only, with bounded samples and no GLB mutation. Translation thresholds assume model units are approximately meters. */
export function analyzeGLBMotionClip(clip:QualityClip):ClipQualityReport {
 const issues:ClipIssue[]=[];let keyframes=0, sampledTracks=0;
 const add=(code:ClipIssue["code"],severity:ClipIssue["severity"],track:string,message:string,suggestion:string,count:number)=>issues.push({code,severity,track,message,suggestion,count});
 for (const t of (clip.tracks||[]).slice(0,240)) {
  const size=t.getValueSize(), length=t.times.length;
  if (!Number.isInteger(size)||size<1||size>16||length<1||length*size!==t.values.length) {add("invalid-track","warning",t.name,"Ungültiger Animationskanal","GLB neu exportieren und Kurven prüfen.",1);continue;}
  sampledTracks++;keyframes+=length;
  const rotation=/\.quaternion$/i.test(t.name)&&size===4;
  const position=/\.position$/i.test(t.name)&&size>=3;
  const isFoot=position&&foot.test(t.name.replace(/\.position$/i,""));
  let jumps=0,speeds=0,gaps=0,footMotion=0;
  for(let i=1;i<Math.min(length,4096);i++) {
   const dt=Number(t.times[i])-Number(t.times[i-1]);
   const a=Array.from({length:size},(_,j)=>Number(t.values[(i-1)*size+j]));
   const b=Array.from({length:size},(_,j)=>Number(t.values[i*size+j]));
   if(!finite(dt)||dt<=0||!a.every(finite)||!b.every(finite)){jumps++;continue;}
   if(dt>0.45)gaps++;
   if(rotation){const angle=quatAngle(a,b);if(!finite(angle)||angle>1.25&&dt<0.12)jumps++;}
   if(position){const distance=Math.hypot(b[0]-a[0],b[1]-a[1],b[2]-a[2]);if(distance/dt>5)speeds++;if(isFoot&&distance/dt>1.3&&Math.abs(b[1]-a[1])<0.035&&dt<0.15)footMotion++;}
  }
  if(jumps)add(rotation?"rotation-jump":"invalid-track","warning",t.name,`Auffällige Rotations-/Zeit-Sprünge (${jumps})`,"Keyframe-Interpolation und Quaternionen prüfen.",jumps);
  if(speeds)add("fast-translation","warning",t.name,`Sehr schnelle Positionswechsel (${speeds})`,"Root Motion, Einheitenskalierung und Export überprüfen.",speeds);
  if(footMotion)add("possible-foot-slide","info",t.name,`Mögliche horizontale Fußverschiebung (${footMotion})`,"Fußkontakt visuell im Preview prüfen; kein Beweis für Foot Sliding.",footMotion);
  if(gaps)add("long-gap","info",t.name,`Große Abstände zwischen Keyframes (${gaps})`,"Interpolationskurven im DCC-Tool kontrollieren.",gaps);
 }
 if(!sampledTracks)add("empty","warning","", "Keine analysierbaren Animationskanäle", "Datei auf GLB-Animationen prüfen.",1);
 const score=clamp(100-issues.reduce((sum,i)=>sum+(i.severity==="warning"?12:5)*Math.min(3,i.count),0),0,100);
 return {name:clip.name||"Unbenannter Clip",duration:finite(clip.duration)?clip.duration:0,score,sampledTracks,keyframes,issues};
}
export function analyzeGLBMotionClips(clips:QualityClip[]):ClipQualityReport[]{return (clips||[]).slice(0,32).map(analyzeGLBMotionClip);}
export function aggregateMotionQuality(reports:ClipQualityReport[]){return {score:reports.length?Math.round(reports.reduce((n,r)=>n+r.score,0)/reports.length):0,clips:reports.length,warnings:reports.reduce((n,r)=>n+r.issues.filter(i=>i.severity==="warning").length,0),hints:reports.reduce((n,r)=>n+r.issues.filter(i=>i.severity==="info").length,0)};}
