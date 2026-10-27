'use strict';
/** V603: multi-segment full-song quality EVIDENCE, not automated artistic acceptance.
 * Only actual V592 captured reports. Never derives section labels or missing frames.
 */
const crypto=require('node:crypto');
const {valid,scoreWarnings}=require('./v594-concert-quality-comparison.cjs');
const finite=x=>typeof x==='number'&&Number.isFinite(x);
const round=(x)=>Math.round(x*1000)/1000;
const hash=s=>crypto.createHash('sha256').update(s).digest('hex').slice(0,16);
const denied=reason=>({format:'sonic-v603-full-concert-review',status:'blocked',reason,approved:false,humanReviewRequired:true});
const normalizedCue=shot=>{
 const e=shot.sceneEvidence;
 if(!e||typeof e!=='object')return null;
 // Capture only the actual labels already present on the displayed stage. Not an audio classifier.
 const pick=k=>typeof e[k]==='string'&&e[k].trim()?e[k].trim().slice(0,80).toLowerCase():null;
 const evidence={moment:pick('moment'),act:pick('act'),shot:pick('shot'),mode:pick('mode'),focus:pick('focus'),genre:pick('genre')};
 return Object.values(evidence).some(Boolean)?evidence:null;
};
const section=(cue)=>{
 if(!cue)return null;
 const v=[cue.moment,cue.act,cue.mode].filter(Boolean);
 for(const [name,expr] of [['intro',/^(intro|opening)$/],['verse',/^(verse|rap|strophe|solo)$/],
  ['pre-hook',/^(pre[- ]?hook|pre[- ]?chorus|build|build[- ]?up)$/],['hook',/^(hook|chorus|refrain)$/],
  ['drop',/^(drop|climax)$/],['bridge',/^(bridge|breakdown)$/],['outro',/^(outro|finale|closing)$/]]){
  if(v.some(x=>expr.test(x)))return name;
 }
 return null;
};
function mergeIntervals(intervals){
 const merged=[];
 for(const [start,end] of [...intervals].sort((a,b)=>a[0]-b[0])){
  if(!merged.length||start>merged.at(-1)[1])merged.push([start,end]);
  else merged.at(-1)[1]=Math.max(merged.at(-1)[1],end);
 }
 return merged;
}
function fullConcertReview(reports){
 if(!Array.isArray(reports)||!reports.length||reports.length>16)return denied('Provide 1..16 distinct measured V592 segments.');
 if(!reports.every(valid))return denied('At least one report is not a genuine, measured, valid V592 live-stage capture.');
 const first=reports[0];
 if(typeof first.sourceTrack!=='string'||!first.sourceTrack.trim())return denied('Missing verified Spotify track identifier.');
 if(reports.some(r=>r.sourceTrack!==first.sourceTrack))return denied('Segments have different Spotify tracks.');
 if(reports.some(r=>r.screen.width!==first.screen.width||r.screen.height!==first.screen.height||r.modelCount!==first.modelCount||
  r.mode!==first.mode||r.browser?.userAgent!==first.browser?.userAgent||r.browser?.webglVersion!==first.browser?.webglVersion))
  return denied('Segments need identical viewport, GLB count, browser/WebGL and capture mode.');
 const durations=reports.map(r=>r.trackDurationMs).filter(x=>Number.isInteger(x)&&x>=1000);
 if(durations.length&&new Set(durations).size!==1)return denied('Conflicting measured Spotify track durations.');
 // An older V592 run has no duration. The actual track duration from another compatible run
 // can be used but the legacy run is disclosed; without any duration no full-track claim.
 const durationMs=durations.length?durations[0]:null;
 const captures=[],intervals=[],issues=[],slowRuns=[];
 for(let run=0;run<reports.length;run++){
  const r=reports[run],shots=r.screenshots;
  if(durationMs&&shots.some(s=>s.progressMs>durationMs+500))return denied('Capture position beyond Spotify track duration.');
  // Genuine song progression was already checked by V592. Re-check elapsed time to rule out
  // fast seeking, and only use a run as continuous coverage if this can be corroborated.
  const span=shots.at(-1).progressMs-shots[0].progressMs;
  const elapsed=r.frameTiming.elapsedMs;
  const timeMatched=finite(elapsed)&&elapsed>=1000&&span>=1000&&Math.abs(span-elapsed)<=Math.max(4500,elapsed*.25);
  if(!timeMatched)issues.push({kind:'unverified-continuity',run:run+1,
   message:'No evidence that the span represents continuous playback without seeking; screenshot points only.'});
  else intervals.push([shots[0].progressMs,shots.at(-1).progressMs]);
  if(r.frameTiming.averageFps<25||r.frameTiming.p95FrameMs>45)slowRuns.push(run+1);
  for(let index=0;index<shots.length;index++){
   const shot=shots[index],warn=scoreWarnings(shot),cue=normalizedCue(shot);
   captures.push({run:run+1,index:index+1,progressMs:shot.progressMs,file:shot.file,
    section:section(cue),cue,actors:shot.actors,drawCalls:finite(shot.drawCalls)?shot.drawCalls:null,
    triangles:finite(shot.triangles)?shot.triangles:null,lyricsMode:shot.lyricsMode||null,
    warnings:warn,recordedWarnings:shot.warnings.slice(0,15).map(x=>String(x).slice(0,180))});
  }
 }
 captures.sort((a,b)=>a.progressMs-b.progressMs||a.run-b.run||a.index-b.index);
 const uniquePositions=captures.filter((s,i)=>i===0||s.progressMs!==captures[i-1].progressMs);
 const merged=mergeIntervals(intervals);
 const coveredMs=merged.reduce((sum,[a,b])=>sum+b-a,0);
 const gaps=[];
 if(durationMs){let previous=0;
  for(const [start,end] of merged){if(start>previous)gaps.push({startMs:previous,endMs:start,durationMs:start-previous});previous=end;}
  if(previous<durationMs)gaps.push({startMs:previous,endMs:durationMs,durationMs:durationMs-previous});
 }else if(merged.length){for(let i=1;i<merged.length;i++)if(merged[i][0]>merged[i-1][1])gaps.push({startMs:merged[i-1][1],endMs:merged[i][0],durationMs:merged[i][0]-merged[i-1][1]});}
 const sections=['intro','verse','pre-hook','hook','drop','bridge','outro'].map(name=>({name,
  frames:captures.filter(c=>c.section===name).length}));
 const unclassified=captures.filter(x=>!x.section).length;
 const counts={};for(const kind of Object.keys(captures[0].warnings))counts[kind]=captures.filter(c=>c.warnings[kind]).length;
 const repeated=Object.entries(counts).filter(([,n])=>n>=2).map(([name,count])=>({name,observedFrames:count,
  progressMs:captures.filter(c=>c.warnings[name]).map(x=>x.progressMs).slice(0,24),
  assessment:'repeated-heuristic-observation-needs-human-review'}));
 // Repeated camera cues may be intentional motif, so display as editorial REVIEW only.
 const cameraSequences=[];let last=null;
 for(const c of uniquePositions){const cue=c.cue?.shot||null;if(!cue)continue;
  if(last&&last.shot===cue){last.count++;last.endMs=c.progressMs;}
  else cameraSequences.push(last={shot:cue,count:1,startMs:c.progressMs,endMs:c.progressMs});}
 const cameraRepeats=cameraSequences.filter(x=>x.count>=3);
 const windowCount=merged.length;
 const fraction=durationMs?round(coveredMs/durationMs):null;
 const nearWhole=durationMs!==null&&fraction>=.92&&gaps.every(x=>x.durationMs<=12000)&&merged.length>0&&
  captures.length>=12&&sections.filter(x=>x.frames>0).length>=3;
 const evidenceMatrix=[
  {area:'Songverlauf',observed:durationMs!==null&&merged.length>0,note:'Nur zusammenhängende V592-Messfenster und ungemessene Lücken, keine Songstruktur-Erkennung.'},
  {area:'Kamera und Bildausschnitt',observed:captures.some(c=>c.cue?.shot),note:'Stage-Shot-Labels und projizierte GLB-Grenzen; reale Kameraposen bzw. künstlerische Qualität nicht bestätigt.'},
  {area:'GLB-Tänzer und Formation',observed:captures.some(c=>c.actors>0),note:'Tatsächliche GLB-Projektionen und grobe Überlappungen; Fußkontakt/Tanzqualität nicht durch Bildmetrik bestätigt.'},
  {area:'Lyrics',observed:captures.some(c=>c.lyricsMode),note:'DOM-/WebGL-Modus und Sync-Warnungen; Wortgenauigkeit/Lip-Sync erfordern menschliche Videoprüfung.'},
  {area:'Licht und Stage FX',observed:false,note:'V592 enthält keine separaten Effektparameter oder GPU-Gewichte; Screenshots allein belegen keine korrekte FX-Regie.'},
  {area:'Browser-Performance',observed:reports.every(r=>r.frameTiming.status==='measured'),note:'Browser-rAF, keine echte GPU-Zeit, Stromaufnahme oder Raspberry-Pi-Temperatur.'},
 ];
 const warningNotes=[];
 if(!durationMs)warningNotes.push('Trackdauer fehlt: nur Messfenster, kein Anteil am Gesamtsong berechenbar.');
 if(!intervals.length)warningNotes.push('Keine nachweislich kontinuierlichen Messfenster vorhanden.');
 if(gaps.length)warningNotes.push(`Nicht aufgenommene Bereiche: ${gaps.length}.`);
 if(unclassified)warningNotes.push(`${unclassified} Aufnahmen ohne bestätigten Songabschnitt.`);
 if(cameraRepeats.length)warningNotes.push(`${cameraRepeats.length} wiederholt gleiche Kamera-Cue-Reihenfolge(n); kreative Absicht manuell prüfen.`);
 if(slowRuns.length)warningNotes.push(`Langsame Browser-Messläufe: ${slowRuns.join(', ')}.`);
 return {format:'sonic-v603-full-concert-review',status:nearWhole?'broad-coverage-needs-human-review':'partial-evidence-needs-human-review',
  source:'one-or-more-real-v592-spotify-stage-captures',approved:false,humanReviewRequired:true,
  trackHash:hash(first.sourceTrack),runCount:reports.length,screen:first.screen,modelCount:first.modelCount,
  trackDurationMs:durationMs,legacyDurationMissing:durations.length<reports.length,
  coverage:{status:nearWhole?'broad-observed-windows-not-visual-approval':'incomplete-or-insufficient-continuity',
   continuousWindows:windowCount,measuredWindowMs:coveredMs,ratio:fraction,
   intervals:merged.map(([startMs,endMs])=>({startMs,endMs})),gaps,
   note:'Intervals reflect time-progress corroborated by browser elapsed time, not a continuous video recording. No coverage over gaps.'},
  counts:{captures:captures.length,uniqueSongPositions:uniquePositions.length,unclassified},
  sections,repeatedWarnings:repeated,cameraRepeats,warningCounts:counts,slowRuns,issues,warningNotes,evidenceMatrix,captures,
  browserMetrics:reports.map((r,i)=>({run:i+1,rafPerSecond:r.frameTiming.averageFps,p95FrameMs:r.frameTiming.p95FrameMs,p99FrameMs:r.frameTiming.p99FrameMs,frames:r.frameTiming.frames})),
  manualReview:['Opening und Finale in Echtzeit mit vollständiger Playback-Aufnahme prüfen.',
   'Hooks, Drops, Übergänge und Kameraperspektiven über den Song vergleichen – wiederkehrende Motive können beabsichtigt sein.',
   'Echte GLB-Füße, Gewicht, Blickkontakt, Rollen und Sängerübergaben optisch/synchron abhören.',
   'Wort-Sync, Rap-Lip-Sync und 10-Zoll-Lesbarkeit in der laufenden Bühne kontrollieren.',
   'LED, Gobo, Nebel, Spotlights und die Pi-Langzeitperformance am Zielgerät überprüfen.'],
  limitations:['Keine automatische künstlerische Freigabe, unabhängig von der erfassten Songlänge.',
   'V592-Standbilder/rAF sind weder Full-Motion-Video noch GPU- oder Hardware-Messungen.',
   'Songabschnitte stammen ausschließlich aus vorhandenen UI-Cues, nicht aus echter Audio-/Phonem-Erkennung.',
   'Manuelle Kamera-, Lyrics-, GLB-, Sänger- und Lichtregeln werden durch diesen reinen Bericht niemals verändert.']};
}
module.exports={fullConcertReview,mergeIntervals,section,normalizedCue};
