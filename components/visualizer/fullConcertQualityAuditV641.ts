/** V641: read-only audit of user-started, *observed* V466 quality samples.
 * No fictional song sections, guessed singer identity, audio, lyrics text or automatic fixes.
 * Coverage is based on advancing song progress and monotonic wall time, not sample count.
 */
export type V641Level='ok'|'watch'|'issue'|'unavailable';
export interface V641Observation{
 trackId:string; durationMs:number; progressMs:number; observedAt:number;
 avatarCount:number; headsInFrame:number; verifiedGlbActors:number|null;
 fps:number|null; p95FrameMs:number|null; drawCalls:number|null; triangles:number|null;
 lyrics:V641Level; headVisibility:V641Level;
 chapter:string; shot:string; motif:string; focus:string;
}
export interface V641Finding{
 id:string; severity:'review'|'information'; detail:string; timeMs:number;
}
export interface V641Audit{
 format:'sonic-v641-live-song-audit'; source:'v466-qa-measurements-and-stage-cues';
 status:'no-evidence'|'partial-coverage'|'broad-coverage-needs-human-review';
 trackId:string|null; durationMs:number; samples:number; coveredMs:number; coveragePercent:number;
 observedAvatarCounts:number[]; verifiedGlbCounts:number[]; minFps:number|null; medianFps:number|null; medianP95Ms:number|null;
 fpsBelow30:number; headsOutsideFrame:number; lyricWarnings:number;
 distinctChapters:number; cameraTransitions:number; motifTransitions:number; focusTransitions:number;
 findings:V641Finding[]; humanReviewRequired:true; automaticallyApproved:false;
 limitations:string[];
}
const safeNumber=(value:number|null,min:number,max:number):value is number=>value!==null&&Number.isFinite(value)&&value>=min&&value<=max;
const safeLabel=(v:string)=>typeof v==='string'&&v.length<=80&&/^[\w.:/-]*$/.test(v);
const levels:readonly V641Level[]=['ok','watch','issue','unavailable'];
export const V641_SAMPLE_LIMIT=1200;
export function validV641Observation(s:V641Observation):boolean{
 return !!s&&typeof s.trackId==='string'&&s.trackId.length>0&&s.trackId.length<=180&&
 safeNumber(s.durationMs,30000,1_200_000)&&safeNumber(s.progressMs,0,s.durationMs+1500)&&
 safeNumber(s.observedAt,1,1e15)&&Number.isInteger(s.avatarCount)&&s.avatarCount>=0&&s.avatarCount<=4&&
 Number.isInteger(s.headsInFrame)&&s.headsInFrame>=0&&s.headsInFrame<=s.avatarCount&&
 (s.verifiedGlbActors===null||(Number.isInteger(s.verifiedGlbActors)&&s.verifiedGlbActors>=0&&s.verifiedGlbActors<=4))&&
 (s.fps===null||safeNumber(s.fps,1,240))&&
 (s.p95FrameMs===null||safeNumber(s.p95FrameMs,1,2000))&&
 (s.drawCalls===null||safeNumber(s.drawCalls,0,100000))&&
 (s.triangles===null||safeNumber(s.triangles,0,20_000_000))&&
 levels.includes(s.lyrics)&&levels.includes(s.headVisibility)&&
 [s.chapter,s.shot,s.motif,s.focus].every(safeLabel);
}
const median=(input:number[])=>{if(!input.length)return null;const sorted=input.slice().sort((a,b)=>a-b);const mid=Math.floor(sorted.length/2);return sorted.length%2?sorted[mid]:(sorted[mid-1]+sorted[mid])/2;};
const noEvidence=(trackId:string|null=null):V641Audit=>({format:'sonic-v641-live-song-audit',source:'v466-qa-measurements-and-stage-cues',status:'no-evidence',trackId,durationMs:0,samples:0,coveredMs:0,coveragePercent:0,observedAvatarCounts:[],verifiedGlbCounts:[],minFps:null,medianFps:null,medianP95Ms:null,fpsBelow30:0,headsOutsideFrame:0,lyricWarnings:0,distinctChapters:0,cameraTransitions:0,motifTransitions:0,focusTransitions:0,findings:[],humanReviewRequired:true,automaticallyApproved:false,limitations:[
 'Keine vollständige optische Begutachtung: Projektionen zeigen weder Gesichtssichtbarkeit noch Lip-Sync, Bewegungsgüte oder Lyrics-Lesbarkeit.',
 'FPS/Framezeiten und Draw Calls sind Browsermesswerte, keine direkte GPU-Zeitmessung.',
 'Kapitel, Kamera und Fokus stammen aus Regie-Metadaten, nicht aus Pixel-/Stimmanalyse.',
 'Die Anwendung vergibt niemals automatisch eine Produktionsfreigabe oder Raspberry-Pi-Eignung.'
]});
/** Samples must originate in a single explicit local capture. Reject injected/out-of-order/wrong-track rows. */
export function auditFullConcertV641(input:readonly V641Observation[]):V641Audit{
 if(!Array.isArray(input)||!input.length)return noEvidence();
 const first=input[0];
 if(!validV641Observation(first))return noEvidence();
 const report=noEvidence(first.trackId);report.durationMs=first.durationMs;
 const observations:V641Observation[]=[];
 let previous:V641Observation|null=null;
 for(const s of input.slice(0,V641_SAMPLE_LIMIT)){
  if(!validV641Observation(s)||s.trackId!==first.trackId||Math.abs(s.durationMs-first.durationMs)>1500||
   (previous!==null&&(s.observedAt<=previous.observedAt||s.progressMs<previous.progressMs-250)))break;
  observations.push(s);previous=s;
 }
 report.samples=observations.length;
 if(!observations.length)return noEvidence();
 let previousValid:V641Observation|null=null;
 let covered=0;const issues:V641Finding[]=[];const add=(id:string,detail:string,timeMs:number,severity:V641Finding['severity']='review')=>{
  if(issues.filter(x=>x.id===id).length<4&&issues.length<32)issues.push({id,severity,detail,timeMs:Math.round(timeMs)});
 };
 const fps:number[]=[],p95:number[]=[];
 const chapters=new Set<string>(),avatars=new Set<number>(),verifiedGlbs=new Set<number>();
 let priorShot='',priorMotif='',priorFocus='';let shotStart:number|null=null,motifStart:number|null=null;
 for(const s of observations){
  avatars.add(s.avatarCount);if(s.verifiedGlbActors!==null)verifiedGlbs.add(s.verifiedGlbActors);
  if(s.chapter&&s.chapter!=='unclassified')chapters.add(s.chapter);
  if(s.fps!==null){fps.push(s.fps);if(s.fps<30)report.fpsBelow30++;}
  if(s.p95FrameMs!==null)p95.push(s.p95FrameMs);
  if(s.avatarCount>0&&s.headsInFrame<s.avatarCount)report.headsOutsideFrame++;
  if(s.lyrics==='watch'||s.lyrics==='issue')report.lyricWarnings++;
  if(previousValid){
   const dt=s.observedAt-previousValid.observedAt,dp=s.progressMs-previousValid.progressMs;
   // Count only time witnessed advancing at near realtime: seeks, long gaps and pauses do not count.
   if(dt>=250&&dt<=4000&&dp>=250&&dp<=4000&&dp/dt>=.45&&dp/dt<=1.8)covered+=dp;
  }
  if(s.shot&&s.shot!=='unknown'){
   if(priorShot&&s.shot!==priorShot){
    if(shotStart!==null&&s.progressMs-shotStart>=45000)add('long-shot','Kamerametadatum lange unverändert; manuell prüfen (kein Beleg für statisches Bild).',shotStart,'information');
    report.cameraTransitions++;shotStart=s.progressMs;
   }else if(!priorShot)shotStart=s.progressMs;
   priorShot=s.shot;
  }
  if(s.motif&&s.motif!=='none'&&s.motif!=='unknown'){
   if(priorMotif&&s.motif!==priorMotif){
    if(motifStart!==null&&s.progressMs-motifStart>=60000)add('long-motif','Gleiches Dramaturgie-Motiv über 60 Sekunden: Vielfalt visuell prüfen.',motifStart,'information');
    report.motifTransitions++;motifStart=s.progressMs;
   }else if(!priorMotif)motifStart=s.progressMs;
   priorMotif=s.motif;
  }
  if(s.focus&&s.focus!=='none'){
   if(priorFocus&&s.focus!==priorFocus)report.focusTransitions++;
   priorFocus=s.focus;
  }
  previousValid=s;
 }
 report.coveredMs=Math.min(report.durationMs,Math.round(covered));report.coveragePercent=Math.round(report.coveredMs/report.durationMs*1000)/10;
 report.observedAvatarCounts=Array.from(avatars).sort((a,b)=>a-b);
 report.verifiedGlbCounts=Array.from(verifiedGlbs).sort((a,b)=>a-b);
 report.minFps=fps.length?Math.min(...fps):null;report.medianFps=median(fps);report.medianP95Ms=median(p95);
 report.distinctChapters=chapters.size;
 const startsNearBeginning=observations[0].progressMs<=Math.max(3000,report.durationMs*.05);
 const reachesEnd=observations[observations.length-1].progressMs>=report.durationMs*.95;
 if(!startsNearBeginning)add('song-start-missing','Aufzeichnung beginnt nicht nahe am Songanfang; vollständigen Track erneut prüfen.',0);
 if(!reachesEnd)add('song-end-missing','Songende nicht beobachtet; Aufzeichnung länger fortsetzen.',report.durationMs);
 if(report.coveragePercent<80)add('coverage','Weniger als 80 % des Songs mit tatsächlich fortlaufenden Browsermessungen erfasst.',0);
 if(report.observedAvatarCounts.every(n=>n===0))add('no-avatars','Keine Avatar-Projektionsdaten erfasst.',0);
 if(report.verifiedGlbCounts.every(n=>n===0))add('no-glb-proof','Keine bestätigten GLB-Meshes erfasst: V592 auf Loopback mit ?benchmarkV592=1 aktivieren.',0,'information');
 if(report.fpsBelow30>0)add('low-fps',`${report.fpsBelow30} Messfenster mit FPS unter 30; Rendering/CPU/GPU lokal untersuchen.`,observations.find(s=>s.fps!==null&&s.fps<30)?.progressMs??0);
 if(report.headsOutsideFrame>0)add('avatar-framing',`${report.headsOutsideFrame} Stichproben mit nicht im Bild projizierten Avatar-Köpfen; Aufnahme prüfen.`,observations.find(s=>s.avatarCount>0&&s.headsInFrame<s.avatarCount)?.progressMs??0);
 if(report.lyricWarnings>0)add('lyrics-overlap',`${report.lyricWarnings} geometrische Lyrics-Hinweise; keine Aussage über tatsächliche Schriftlesbarkeit.`,observations.find(s=>s.lyrics==='watch'||s.lyrics==='issue')?.progressMs??0);
 if(!fps.length)add('fps-missing','Keine verwertbaren FPS-Messwerte vorhanden.',0);
 if(!p95.length)add('p95-missing','Keine P95-Framezeiten vorhanden.',0);
 report.findings=issues;
 report.status=report.samples<30||report.coveragePercent<80||!startsNearBeginning||!reachesEnd||!fps.length?'partial-coverage':'broad-coverage-needs-human-review';
 return report;
}
