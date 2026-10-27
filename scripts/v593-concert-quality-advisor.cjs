'use strict';
/** V593: evidence-based offline adviser for genuine V592 live-stage observations.
 * Never guesses missing measurements or edits Spotify, user settings or avatar choreography.
 */
const finite=n=>typeof n==='number'&&Number.isFinite(n);
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const ratio=(a,b)=>finite(a)&&finite(b)&&b>0?a/b:null;
const evidence=(shots,predicate)=>shots.flatMap((s,i)=>predicate(s)?[i+1]:[]);
const rectValid=r=>r&&[r.x,r.y,r.width,r.height].every(finite)&&r.width>0&&r.height>0;
const boundsValid=b=>b&&[b.minX,b.maxX,b.minY,b.maxY].every(finite)&&b.maxX>b.minX&&b.maxY>b.minY;
function overlapInfo(shot){
 if(!rectValid(shot?.stageRect)||!rectValid(shot?.lyricRect)||!Array.isArray(shot?.actorBounds))return {state:'not-measurable'};
 const stage=shot.stageRect,lyric=shot.lyricRect;
 // Full-screen overlays need a text bounding box, not their full overlay background.
 if(lyric.width>stage.width*.8&&lyric.height>stage.height*.5)return {state:'inconclusive-overlay'};
 let best=0,measured=0;
 for(const actor of shot.actorBounds){
  const b=actor?.bounds;if(!boundsValid(b))continue;
  const a={x:stage.x+clamp((b.minX+1)/2,0,1)*stage.width,
   y:stage.y+clamp((1-b.maxY)/2,0,1)*stage.height,
   width:clamp((b.maxX-b.minX)/2,0,1)*stage.width,
   height:clamp((b.maxY-b.minY)/2,0,1)*stage.height};
  if(a.width<=0||a.height<=0)continue;
  const intersection=Math.max(0,Math.min(a.x+a.width,lyric.x+lyric.width)-Math.max(a.x,lyric.x))*
   Math.max(0,Math.min(a.y+a.height,lyric.y+lyric.height)-Math.max(a.y,lyric.y));
  best=Math.max(best,intersection/(a.width*a.height));measured++;
 }
 return measured?{state:'measured',fraction:Number(best.toFixed(4))}:{state:'not-measurable'};
}
function formationOverlapInfo(shot){
 const boxes=(Array.isArray(shot?.actorBounds)?shot.actorBounds:[])
  .filter(a=>a?.meshes>0&&boundsValid(a.bounds)).map(a=>a.bounds);
 if(boxes.length<2)return {state:'not-measurable'};
 let maximum=0;
 for(let i=0;i<boxes.length;i++)for(let j=i+1;j<boxes.length;j++){
  const a=boxes[i],b=boxes[j];
  const overlap=Math.max(0,Math.min(a.maxX,b.maxX)-Math.max(a.minX,b.minX))*
   Math.max(0,Math.min(a.maxY,b.maxY)-Math.max(a.minY,b.minY));
  const areaA=(a.maxX-a.minX)*(a.maxY-a.minY),areaB=(b.maxX-b.minX)*(b.maxY-b.minY);
  if(areaA>0&&areaB>0)maximum=Math.max(maximum,overlap/Math.min(areaA,areaB));
 }
 return {state:'measured',fraction:Number(maximum.toFixed(4))};
}
const sanitizeWarning=x=>String(x||'').toLocaleLowerCase('de');
function adviceForLiveReport(report){
 const blocked={format:'sonic-v593-concert-advice',status:'blocked',source:'v592-live-report',
  recommendations:[],humanReviewRequired:true,autoApplied:false,reason:'Only a measured V592 live-stage report with actual captures is accepted.'};
 if(!report||report.format!=='sonic-v592-live-concert-review'||report.status!=='measured-needs-human-review'||
   report.source!=='actual-spotify-visualizer-stage'||!Array.isArray(report.screenshots)||report.screenshots.length<2||
   !report.frameTiming||report.frameTiming.status!=='measured'||!finite(report.progressMs)||report.progressMs<1300||
   !finite(report.modelCount)||report.modelCount<1||!report.sourceTrack)return blocked;
 const shots=report.screenshots;
 if(shots.some(s=>!s||!Number.isFinite(s.progressMs)||!Number.isInteger(s.actors)||s.actors<1||
    !Array.isArray(s.warnings)||typeof s.file!=='string'||!/^live-\d{2}\.png$/.test(s.file)))return blocked;
 const recommendations=[];const total=shots.length;
 const add=(id,area,priority,reason,action,indices,guard,preview)=>{
  if(indices.length<Math.max(2,Math.ceil(total*.5)))return;
  recommendations.push({id,area,priority,confidence:'heuristic-repeated-observation',reason,action,
   evidence:{capturedFrames:indices.length,totalFrames:total,screenshotIndices:indices},
   safeguards:guard,preview:preview||null,status:'suggested-not-applied'});
 };
 const clip=evidence(shots,s=>s.warnings.some(w=>sanitizeWarning(w).includes('angeschnitten'))||
  s.actorBounds?.some(x=>boundsValid(x.bounds)&&
   (x.bounds.minX<-.97||x.bounds.maxX>.97||x.bounds.minY<-.97||x.bounds.maxY>.97)));
 add('camera-clipping','Kamera','high',`Avatar-Projektion möglicherweise angeschnitten (${clip.length}/${total} Aufnahmen).`,
  'In der Kameravorschau etwas weiteren Bühnenausschnitt wählen; Gesicht, Füße und Lyrics danach manuell kontrollieren.',clip,
  'Keine automatische Kamerabewegung; manuelle Kamerakeyframes haben Vorrang.',
  {kind:'camera-distance-what-if',factor:1.08,meaning:'Nur illustrativer Startwert, keine automatische Kamerakorrektur.'});
 const small=evidence(shots,s=>s.warnings.some(w=>sanitizeWarning(w).includes('zu klein'))||
  s.actorBounds?.some(x=>boundsValid(x.bounds)&&
  (x.bounds.maxX-x.bounds.minX<.12||x.bounds.maxY-x.bounds.minY<.24)));
 add('camera-small-avatar','Kamera','medium',`Avatare wirken in der NDC-Projektion möglicherweise zu klein (${small.length}/${total}).`,
  'In der Vorschau eine engere Einstellung mit ausreichendem Platz für die gesamte Formation vergleichen.',small,
  'Nicht zusammen mit camera-clipping ohne Sichtprüfung anwenden.',
  {kind:'camera-distance-what-if',factor:.94,meaning:'Nur Vorschlag; zuerst Bildausschnitt manuell vergleichen.'});
 const collision=evidence(shots,s=>{const o=overlapInfo(s);return o.state==='measured'&&o.fraction>=.08;});
 add('lyrics-overlap','Lyrics','high',`Messbare Lyrics-Rechtecke überdecken Avatar-Projektionen (${collision.length}/${total} Aufnahmen).`,
  'Lyrics in der Vorschau versetzen oder Layout-Abstand vergrößern, danach Zeilenlesbarkeit und Performer-Position kontrollieren.',collision,
  'Nur bei echtem, kleinen DOM-Lyrics-Rechteck; Fullscreen-Overlays gelten als nicht messbar.');
 const formation=evidence(shots,s=>{const o=formationOverlapInfo(s);return o.state==='measured'&&o.fraction>=.45;});
 add('avatar-formation-overlap','Avatar-Aufstellung','medium',`Mehrere GLB-Projektionen überlappen sich stark (${formation.length}/${total} Aufnahmen).`,
  'In der realen Bühnenvorschau seitlichen Avatar-Abstand oder Kameraachse vergleichen; Duettinteraktionen und manuelle Formationen haben Vorrang.',formation,
  'Bounding-Box-Überlappung beweist keine Verdeckung; gemeinsames Tanzen kann absichtlich sein. Keine automatische Avatar-Verschiebung.');
 const unsynced=evidence(shots,s=>s.warnings.some(w=>sanitizeWarning(w).includes('nicht als synchronisiert')));
 add('lyrics-sync-evidence','Lyrics','high',`Der Lyrics-Synchronstatus fehlt oder ist negativ (${unsynced.length}/${total}).`,
  'Lyrics-Provider und vorhandene Zeilen-/Wortzeitstempel prüfen; keine neuen Zeitstempel oder Sprecherrollen erzeugen.',unsynced,
  'Synchronisation erfordert Quellenbeleg und manuelle Playback-Kontrolle.');
 const timing=report.frameTiming;
 if(finite(timing.averageFps)&&finite(timing.p95FrameMs)&&finite(timing.p99FrameMs)&&
   (timing.averageFps<27||timing.p95FrameMs>40)){
  recommendations.push({id:'performance-frame-pacing',area:'Performance',priority:'high',
   confidence:'measured-browser-raf-only',reason:`Browser-rAF Ø ${timing.averageFps.toFixed(1)}/s, p95 ${timing.p95FrameMs.toFixed(1)} ms (Orientierung: 30 FPS / 33,3 ms).`,
   action:'Im Low-/Balanced-Profil die Bühnenbeleuchtung und sekundäre VFX schrittweise reduzieren; danach dieselbe echte Liveszene erneut messen.',
   evidence:{capturedFrames:shots.length,totalFrames:shots.length,screenshotIndices:shots.map((_,i)=>i+1),frameCount:timing.frames||null},
   safeguards:'Browser-rAF ist keine GPU-/Pi-Messung. Nie Foot-IK, Sängerzuordnungen, Lyrics-Sync oder aktive GLB-Clips automatisch verändern.',
   preview:{kind:'manual-vfx-reduction',suggestedStepPercent:15,meaning:'Kein erwarteter FPS-Gewinn behauptet; nur Testschritt.'},status:'suggested-not-applied'});
 }
 const overload=evidence(shots,s=>finite(s.drawCalls)&&s.drawCalls>450&&finite(s.triangles)&&s.triangles>650000);
 add('scene-render-budget','Performance','medium',`Hohe kombinierte Zeichenlast (${overload.length}/${total} Aufnahmen).`,
  'Draw Calls, GLB-LOD und optionale Hintergrundeffekte im bestehenden Performance-Dashboard einzeln vergleichen.',overload,
  'Grenzwerte sind Screen- und GPU-abhängige Heuristiken, kein Beweis für Langsamkeit.');
 const uniform=evidence(shots,s=>finite(s.coverage?.nonBackgroundFraction)&&s.coverage.nonBackgroundFraction<.01);
 add('scene-low-coverage','Bildqualität','medium',`Screenshots sind gemessen am Eckpixel nahezu einfarbig (${uniform.length}/${total}).`,
  'Browser-Screenshots auf schwarze Bühne, fehlende Beleuchtung oder unsichtbare Performer prüfen.',uniform,
  'Die Corner-Pixel-Heuristik kann bei ruhigen dunklen Konzertbildern falsch anschlagen.');
 const inconclusive=shots.filter(s=>overlapInfo(s).state!=='measured').length;
 const priorities={high:0,medium:1,low:2};recommendations.sort((a,b)=>priorities[a.priority]-priorities[b.priority]||a.id.localeCompare(b.id));
 return {format:'sonic-v593-concert-advice',status:'advice-needs-human-review',source:'v592-live-report',
  sourceScreenshotCount:total,sourceTrackEvidence:true,frameTiming:{averageFps:timing.averageFps,p95FrameMs:timing.p95FrameMs,p99FrameMs:timing.p99FrameMs},
  recommendations,unmeasurableLyricFrames:inconclusive,
  humanReviewRequired:true,autoApplied:false,
  limitations:['No inferred singer, lip-sync, GLB clip or track timing.',
   'Geometry and pixel heuristics do not establish artistic quality or readable contrast.',
   'All changes are recommendations only: no changes to running Spotify or saved settings.',
   'rAF alone cannot establish Raspberry Pi GPU/thermal headroom.']};
}
module.exports={adviceForLiveReport,overlapInfo,formationOverlapInfo,rectValid,boundsValid,ratio};
