/** V697: browser-only, opt-in editor for V696's MANUAL review.json contract.
 * Capture previews are untrusted local files, never validated V592/GLB evidence.
 * This module uses no browser/React runtime, no network or live show mutations.
 */
export const V697_STORAGE_KEY='sonic.v697.acceptance.manual-review.v1';
export const V697_REVIEW_MAX_BYTES=160_000;
export type V697Status='pending'|'pass'|'fail';
export type V697Check={id:string;status:V697Status;note:string;songTimeSec:number|null};
export type V697ScenarioReview={id:string;genreConfirmed:boolean;notes:string;checks:V697Check[]};
export type V697Review={format:'sonic-v696-manual-review';schema:1;reviewer:string;device:string;browser:string;scenarios:V697ScenarioReview[]};
export type V697Scenario={id:string;genre:'Deutschrap'|'Hardstyle/Hardtekk';actors:1|2|4};
export const V697_SCENARIOS:readonly V697Scenario[]=[
 {id:'rap-solo',genre:'Deutschrap',actors:1},{id:'rap-duet',genre:'Deutschrap',actors:2},{id:'rap-quartet',genre:'Deutschrap',actors:4},
 {id:'tekk-solo',genre:'Hardstyle/Hardtekk',actors:1},{id:'tekk-duet',genre:'Hardstyle/Hardtekk',actors:2},{id:'tekk-quartet',genre:'Hardstyle/Hardtekk',actors:4},
];
const COMMON=['glb-and-rig','foot-contact','motion-transitions','lyrics-contrast','lyrics-head-separation','camera-framing','camera-variety','moving-heads-gobo-fog','performance-smoothness','long-song-dramaturgy'];
export const V697_CHECK_LABELS:Readonly<Record<string,string>>={
 'glb-and-rig':'GLB-Modell und Rig korrekt', 'foot-contact':'Fußkontakt und Bodenkontakt', 'motion-transitions':'Natürliche Bewegungsübergänge',
 'lyrics-contrast':'Lyrics-Kontrast und Wortlesbarkeit', 'lyrics-head-separation':'Kein Konflikt zwischen Lyrics und Köpfen',
 'camera-framing':'Alle Performer im Bild', 'camera-variety':'Abwechslungsreiche Kameraführung',
 'moving-heads-gobo-fog':'Licht, Gobos, Nebel und Gesichtsausleuchtung', 'performance-smoothness':'Flüssige Wiedergabe / FPS / Ruckler',
 'long-song-dramaturgy':'Spannungsbogen über ganzen Song', 'vocal-lip-sync':'Sichtbare echte Lippen-Synchronität',
 'verse-hook-flow':'Rap-Flow, Verse und Hook', 'kick-drop-choreography':'Kick-/Drop-Choreografie und Footwork',
 'energy-build-drop':'Musikalische Energie über Build und Drop', 'ensemble-spacing':'Gruppenabstände / Kollisionen',
 'performer-handoffs':'Übergaben und Interaktionen', 'four-performer-legibility':'Alle vier Performer bleiben erkennbar',
};
export const criteriaV697=(s:V697Scenario)=>[...COMMON,...(s.genre==='Deutschrap'?['vocal-lip-sync','verse-hook-flow']:['kick-drop-choreography','energy-build-drop']),
 ...(s.actors>1?['ensemble-spacing','performer-handoffs']:[]),...(s.actors===4?['four-performer-legibility']:[])];
export const emptyReviewV697=():V697Review=>({format:'sonic-v696-manual-review',schema:1,reviewer:'',device:'',browser:'',
 scenarios:V697_SCENARIOS.map(s=>({id:s.id,genreConfirmed:false,notes:'',checks:criteriaV697(s).map(id=>({id,status:'pending',note:'',songTimeSec:null}))}))});
const object=(v:unknown):v is Record<string,unknown>=>v!==null&&typeof v==='object'&&!Array.isArray(v);
const bounded=(v:unknown,max:number):v is string=>typeof v==='string'&&v.length<=max;
export const validTimeV697=(v:unknown):v is number|null=>v===null||(typeof v==='number'&&Number.isFinite(v)&&v>=0&&v<=86400);
export const validCheckV697=(c:V697Check)=>['pending','pass','fail'].includes(c.status)&&c.note.length<=800&&validTimeV697(c.songTimeSec)&&(c.status==='pending'||(c.note.trim().length>=12&&c.songTimeSec!==null));
/** Validate and rebuild canonical ordering. No unknown fields are persisted or exported. */
export function decodeReviewV697(value:unknown):V697Review|null{
 try{
  if(!object(value)||value.format!=='sonic-v696-manual-review'||value.schema!==1||
    !bounded(value.reviewer,80)||!bounded(value.device,120)||!bounded(value.browser,120)||
    !Array.isArray(value.scenarios)||value.scenarios.length!==6)return null;
  const scenarios:V697ScenarioReview[]=[];
  for(const scenario of V697_SCENARIOS){
   const entries=value.scenarios.filter((s:unknown)=>object(s)&&s.id===scenario.id);
   if(entries.length!==1||!object(entries[0]))return null;
   const entry=entries[0];
   if(typeof entry.genreConfirmed!=='boolean'||!bounded(entry.notes,1000)||!Array.isArray(entry.checks))return null;
   const ids=criteriaV697(scenario);if(entry.checks.length!==ids.length)return null;
   const checks:V697Check[]=[];
   for(const id of ids){const matches=entry.checks.filter((c:unknown)=>object(c)&&c.id===id);
    if(matches.length!==1||!object(matches[0]))return null;
    const c=matches[0];
    if(!['pending','pass','fail'].includes(String(c.status))||!bounded(c.note,800)||!validTimeV697(c.songTimeSec))return null;
    checks.push({id,status:c.status as V697Status,note:c.note,songTimeSec:c.songTimeSec});
   }
   scenarios.push({id:scenario.id,genreConfirmed:entry.genreConfirmed,notes:entry.notes,checks});
  }
  const normalized:V697Review={format:'sonic-v696-manual-review',schema:1,reviewer:value.reviewer,device:value.device,browser:value.browser,scenarios};
  return JSON.stringify(normalized).length<=V697_REVIEW_MAX_BYTES?normalized:null;
 }catch{return null;}
}
export function updateCheckV697(review:V697Review,scenarioId:string,checkId:string,patch:Partial<Pick<V697Check,'status'|'note'|'songTimeSec'>>):V697Review{
 return {...review,scenarios:review.scenarios.map(s=>s.id===scenarioId?{...s,checks:s.checks.map(c=>c.id===checkId?{...c,...patch}:c)}:s)};
}
export function reviewProgressV697(review:V697Review){
 const checks=review.scenarios.flatMap(s=>s.checks),invalid=checks.filter(c=>!validCheckV697(c));
 const failed=checks.filter(c=>c.status==='fail').length,finished=checks.filter(c=>c.status!=='pending').length;
 const complete=finished===checks.length&&review.scenarios.every(s=>s.genreConfirmed)&&
   review.reviewer.trim().length>=2&&review.device.trim().length>=3&&review.browser.trim().length>=3;
 return {total:checks.length,finished,pending:checks.length-finished,failed,invalid:invalid.length,
  readyToExport:invalid.length===0,complete, // Human checklist only: never implies live evidence or production sign-off.
  status:invalid.length?'ungültige Einträge':failed?'Mängel dokumentiert':complete?'Manuelle Prüfliste vollständig – Live-Nachweise fehlen hier':'Manuelle Prüfliste offen'};
}
export type V697Moment={file:string;timeSec:number;act:string;moment:string;shot:string};
export type V697CapturePreview={scenarioId:string;trackId:string;date:string;mode:string;actors:number;fps:number;p95Ms:number;
 width:number;height:number;moments:V697Moment[];verified:false};
const finite=(v:unknown,min:number,max:number):v is number=>typeof v==='number'&&Number.isFinite(v)&&v>=min&&v<=max;
/** Display only. Real evidence must be revalidated against PNG bytes by the V696 CLI. */
export function previewCaptureV697(raw:unknown,scenarioId:string):V697CapturePreview|null{
 const s=V697_SCENARIOS.find(x=>x.id===scenarioId);if(!s||!object(raw))return null;
 if(raw.format!=='sonic-v592-live-concert-review'||raw.status!=='measured-needs-human-review'||
    raw.source!=='actual-spotify-visualizer-stage'||!['existing-local-chromium','headed-local-chromium','headless-local-chromium'].includes(String(raw.mode))||
    raw.modelCount!==s.actors||raw.minGlb!==s.actors||!bounded(raw.sourceTrack,200)||raw.sourceTrack.trim().length<2||
    !bounded(raw.capturedAt,50)||!Number.isFinite(Date.parse(raw.capturedAt))||
    !object(raw.screen)||!finite(raw.screen.width,640,3840)||!finite(raw.screen.height,480,2160)||
    !object(raw.frameTiming)||raw.frameTiming.status!=='measured'||!finite(raw.frameTiming.averageFps,1,500)||
    !finite(raw.frameTiming.p95FrameMs,1,3000)||raw.frameTiming.contextLosses!==0||
    !Array.isArray(raw.screenshots)||raw.screenshots.length<3||raw.screenshots.length>8)return null;
 const moments:V697Moment[]=[];
 for(const shot of raw.screenshots){if(!object(shot)||!bounded(shot.file,40)||!/^live-\d{2}\.png$/.test(shot.file)||
    shot.actors!==s.actors||!finite(shot.progressMs,0,86400000)||!Array.isArray(shot.actorBounds)||shot.actorBounds.length!==s.actors)return null;
  const evidence=object(shot.sceneEvidence)?shot.sceneEvidence:{};
  moments.push({file:shot.file,timeSec:Math.round(shot.progressMs/100)/10,act:bounded(evidence.act,50)?evidence.act:'',
   moment:bounded(evidence.moment,50)?evidence.moment:'',shot:bounded(evidence.shot,50)?evidence.shot:''});
 }
 if(new Set(moments.map(m=>m.file)).size!==moments.length||moments.some((m,i)=>i>0&&m.timeSec<=moments[i-1].timeSec))return null;
 return {scenarioId,trackId:raw.sourceTrack,date:raw.capturedAt,mode:raw.mode as string,actors:s.actors,
  fps:raw.frameTiming.averageFps,p95Ms:raw.frameTiming.p95FrameMs,width:raw.screen.width,height:raw.screen.height,moments,verified:false};
}
/** Preview-only comparison; never certifies authentic or equivalent captures. */
export function comparablePreviewsV697(items:V697CapturePreview[],genre:V697Scenario['genre']){
 const set=V697_SCENARIOS.filter(s=>s.genre===genre).map(s=>items.find(v=>v.scenarioId===s.id));
 return set.every((v):v is V697CapturePreview=>!!v)&&new Set(set.map(v=>v?.trackId)).size===1&&
   new Set(set.map(v=>`${v?.width}x${v?.height}`)).size===1&&new Set(set.map(v=>v?.mode)).size===1;
}
