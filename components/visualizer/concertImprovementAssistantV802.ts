/** V802 — evidence-bound, non-destructive concert improvement drafts.
 * Camera-intent alternatives are SIMULATIONS of the V790 storyboard, not live
 * camera edits. A separate, explicit V354 export/apply path uses real authored
 * camera clips and rejects conflicting or mismatched manual shows.
 * Never invents lyrics, singers, song sections, motion clips or GPU results.
 */
import type {ShowPlanV790,ShowSceneV790} from './cinematicShowDirectorV790';
import {auditConcertExperienceV800,type ConcertExperiencePlanV800} from './concertExperienceMilestoneV800';
import {inspectConcertExperienceV801,type ConcertInspectionV801,
  type ConcertInspectorEvidenceV801,type ConcertInspectorLaneV801} from './concertExperienceInspectorV801';
import {sanitizeTimelineV354,type ShowTimelineV354,type ShowClipV354,
  type CameraShotV354} from '../../services/stageContent/showTimelineV354';

export type ImprovementKindV802='camera-intent'|'manual-review';
export type ImprovementPriorityV802='high'|'medium'|'info';
export type ConcertImprovementV802={id:string;findingId:string;kind:ImprovementKindV802;
  priority:ImprovementPriorityV802;lane:ConcertInspectorLaneV801;startMs:number;endMs:number;
  sceneIndex:number|null;title:string;reason:string;proposal:string;
  beforeIntent:ShowSceneV790['intent']|null;afterIntent:ShowSceneV790['intent']|null;
  previewDelta:number|null;requiresManualReview:boolean};
export type ImprovementPreviewV802={source:'verified-draft'|'unavailable';
  before:ConcertInspectionV801;after:ConcertInspectionV801;approvedIds:readonly string[];
  changes:readonly {sceneIndex:number;startMs:number;endMs:number;
    before:ShowSceneV790['intent'];after:ShowSceneV790['intent']}[];
  warning:string};
export type ImprovementTimelineResultV802={ok:boolean;reason:string;
  timeline:ShowTimelineV354|null;added:number};
const cameraIntents:readonly ShowSceneV790['intent'][]=['portrait','dialogue','ensemble','wide','rise','pulse','breath'];
const finite=(v:unknown):v is number=>typeof v==='number'&&Number.isFinite(v);
const valid=(plan:ShowPlanV790,audit:ConcertExperiencePlanV800,
  report:ConcertInspectionV801,e:ConcertInspectorEvidenceV801)=>
  plan.source==='verified-storyboard'&&audit.source==='verified-show'&&
  report.source==='verified-plan'&&!!plan.trackId&&plan.trackId===report.trackId&&
  audit.trackId===report.trackId&&e.trackId===report.trackId&&
  finite(e.durationMs)&&e.durationMs>0&&plan.durationMs===e.durationMs&&
  audit.durationMs===e.durationMs&&report.durationMs===e.durationMs&&
  plan.scenes.length===report.scenes.length&&plan.scenes.length===audit.scenes.length&&
  plan.scenes.every((s,i)=>s.index===i&&report.scenes[i]?.index===i&&
    s.startMs===report.scenes[i].startMs&&s.endMs===report.scenes[i].endMs&&
    s.intent===report.scenes[i].intent&&s.actIndex===report.scenes[i].actIndex&&
    cameraIntents.includes(s.intent));
const off=(report:ConcertInspectionV801):ImprovementPreviewV802=>({
  source:'unavailable',before:report,after:report,approvedIds:[],changes:[],
  warning:'Aktuelle, übereinstimmende Song-Timeline erforderlich. Es wurde nichts geändert.',
});
const priority=(code:string):ImprovementPriorityV802=>
  ['coverage-gap','coverage-gap-end','unsynced-lyrics'].includes(code)?'high':
  ['repeated-camera','low-shot-variety','missing-breath'].includes(code)?'medium':'info';
const pickAlternative=(p:ShowPlanV790,index:number,e:ConcertInspectorEvidenceV801)=>{
  const scene=p.scenes[index],previous=p.scenes[index-1],next=p.scenes[index+1];
  if(!scene||e.manualCamera||e.reducedMotion)return null;
  // Never reframe the dramatic highlight or an actual break merely to boost a score.
  if(scene.role==='main-peak'||scene.moment==='breath'||scene.section==='break')return null;
  const options:ShowSceneV790['intent'][]=scene.section==='verse'?
    ['portrait','wide','rise','ensemble']:['wide','ensemble','rise','portrait'];
  for(const intent of options){
    if(intent===scene.intent||intent===previous?.intent||intent===next?.intent)continue;
    if(intent==='ensemble'&&e.performers<2)continue;
    return intent;
  }
  return null;
};
const project=(plan:ShowPlanV790,e:ConcertInspectorEvidenceV801)=>{
  const audit=auditConcertExperienceV800(plan);
  return inspectConcertExperienceV801(plan,audit,e);
};
/** Stable ranked suggestions. Only real, verified camera changes have a score
 * preview; missing data always stays a manual instruction with no fake gain.
 */
export function planConcertImprovementsV802(plan:ShowPlanV790,
  audit:ConcertExperiencePlanV800,report:ConcertInspectionV801,
  e:ConcertInspectorEvidenceV801):readonly ConcertImprovementV802[]{
  if(!valid(plan,audit,report,e))return [];
  const items:ConcertImprovementV802[]=[];
  const usedScenes=new Set<number>();
  for(const finding of report.findings){
    if(finding.code==='repeated-camera'||finding.code==='low-shot-variety'){
      if(e.manualCamera||e.reducedMotion)continue;
      const indices=finding.code==='repeated-camera'&&finding.sceneIndex!==null?
        [finding.sceneIndex]:plan.scenes.map(s=>s.index).filter(i=>i>0&&i<plan.scenes.length-1);
      for(const index of indices){
        if(usedScenes.has(index))continue;
        const afterIntent=pickAlternative(plan,index,e);
        if(!afterIntent)continue;
        const scene=plan.scenes[index];
        const candidate={...plan,scenes:plan.scenes.map((s,i)=>i===index?{...s,intent:afterIntent}:s)};
        const preview=project(candidate,e);
        if(preview.source!=='verified-plan'||preview.structureScore===null||
          report.structureScore===null||preview.structureScore<=report.structureScore)continue;
        items.push({id:`camera-${index}-${scene.intent}-${afterIntent}`,findingId:finding.id,
          kind:'camera-intent',priority:'medium',lane:'camera',sceneIndex:index,
          startMs:scene.startMs,endMs:scene.endMs,
          title:`Kameraperspektive in Szene ${index+1} variieren`,
          reason:finding.message,
          proposal:`Storyboard-Entwurf: ${scene.intent} → ${afterIntent}. `+
            'Eine echte Bildverbesserung ist erst in der 3D-Vorschau messbar.',
          beforeIntent:scene.intent,afterIntent,previewDelta:preview.structureScore-report.structureScore,
          requiresManualReview:true});
        usedScenes.add(index);break;
      }
      if(finding.code==='low-shot-variety'&&items.some(x=>x.findingId===finding.id))continue;
    }
    // No automatic timeline fill, guessed rest/peak, singer assignment, lyrics
    // timestamps, rig repair or lighting judgment is ever offered here.
    items.push({id:`review-${finding.id}`,findingId:finding.id,kind:'manual-review',
      priority:priority(finding.code),lane:finding.lane,sceneIndex:finding.sceneIndex,
      startMs:finding.startMs,endMs:finding.endMs,
      title:finding.code==='coverage-gap'||finding.code==='coverage-gap-end'?
        'Fehlende Szenenabdeckung kontrollieren':
        finding.lane==='lyrics'?'Lyrics-Zeitmarken kontrollieren':
        finding.lane==='lighting'?'Musikalische Ruhephase prüfen':
        finding.lane==='dance'?'Avatar-Besetzung prüfen':
        finding.lane==='stage'?'Bühnenplanung prüfen':'Perspektiven manuell kontrollieren',
      reason:finding.message,proposal:finding.recommendation,
      beforeIntent:null,afterIntent:null,previewDelta:null,requiresManualReview:true});
  }
  const weights:Record<ImprovementPriorityV802,number>={high:0,medium:1,info:2};
  return items.sort((a,b)=>weights[a.priority]-weights[b.priority]||
    (b.previewDelta??0)-(a.previewDelta??0)||a.startMs-b.startMs||a.id.localeCompare(b.id));
}
/** Cumulative before/after, recalculated with the REAL V800 + V801 auditors.
 * Authoritative song length, positions, lyrics and all non-camera cues remain intact.
 */
export function previewConcertImprovementsV802(plan:ShowPlanV790,
  audit:ConcertExperiencePlanV800,report:ConcertInspectionV801,
  e:ConcertInspectorEvidenceV801,requested:readonly string[]):ImprovementPreviewV802{
  if(!valid(plan,audit,report,e)||!Array.isArray(requested)||requested.length>480)return off(report);
  const proposals=planConcertImprovementsV802(plan,audit,report,e);
  const selected=new Set(requested);
  const camera=proposals.filter(p=>p.kind==='camera-intent'&&selected.has(p.id));
  const map=new Map<number,ShowSceneV790['intent']>();
  for(const p of camera){
    if(p.sceneIndex===null||!p.afterIntent||map.has(p.sceneIndex))return off(report);
    map.set(p.sceneIndex,p.afterIntent);
  }
  const amended:ShowPlanV790={...plan,scenes:plan.scenes.map(s=>
    map.has(s.index)?{...s,intent:map.get(s.index)!}:s)};
  const after=project(amended,e);
  if(after.source!=='verified-plan')return off(report);
  return {source:'verified-draft',before:report,after,approvedIds:camera.map(p=>p.id),
    changes:camera.map(p=>({sceneIndex:p.sceneIndex!,startMs:p.startMs,endMs:p.endMs,
      before:p.beforeIntent!,after:p.afterIntent!})),
    warning:'Reine Storyboard-Simulation. Strukturwerte sind KEINE gemessene Kamerawirkung. ' +
      'Live-Einstellungen werden dadurch nicht verändert.'};
}
const shot=(intent:ShowSceneV790['intent']):CameraShotV354=>
  intent==='portrait'?'close':intent==='pulse'?'orbit':
  intent==='wide'||intent==='ensemble'||intent==='rise'?'wide':'medium';
/** Explicit transfer to an EXISTING track-bound, enabled V354 manual show.
 * All-or-nothing. Existing clips, manual slots and performer assignments win.
 * The exported shot is an approximation, not an exact V790 intent translation.
 */
export function prepareImprovementTimelineV802(current:ShowTimelineV354,
  preview:ImprovementPreviewV802):ImprovementTimelineResultV802{
  const error=(reason:string):ImprovementTimelineResultV802=>({ok:false,reason,timeline:null,added:0});
  if(preview.source!=='verified-draft'||!preview.changes.length||
    preview.before.source!=='verified-plan'||preview.after.source!=='verified-plan'||
    preview.before.trackId!==preview.after.trackId||
    preview.before.durationMs!==preview.after.durationMs)return error('Kein gültiger Kamera-Entwurf ausgewählt.');
  if(!current||current.enabled!==true||current.trackId!==preview.before.trackId||
    current.durationMs!==preview.before.durationMs||!current.trackId)
    return error('Zuerst im V763-Timeline-Studio eine aktive, songgebundene V354-Show anlegen. Bestehende Shows werden nicht ersetzt.');
  const clean=sanitizeTimelineV354(current);
  if(JSON.stringify(clean)!==JSON.stringify(current))return error('Die vorhandene Timeline enthält ungültige Daten.');
  if(clean.clips.length+preview.changes.length>400)return error('Maximal 400 Cues in der V354-Timeline.');
  const clips:ShowClipV354[]=[];
  for(const c of preview.changes){
    // Avoid at least the first and last 1.2 seconds of each scene. Cues have
    // a max 5 second window to minimize intrusiveness during live vocal work.
    const start=Math.round(c.startMs+1200);
    const duration=Math.round(Math.min(5000,c.endMs-c.startMs-2400));
    if(!Number.isFinite(start)||!Number.isFinite(duration)||duration<500||
      start+duration>clean.durationMs)return error('Szenenintervall für einen Kamera-Cue zu kurz.');
    if([...clean.clips,...clips].some(existing=>existing.lane==='camera'&&
      start<existing.startMs+existing.durationMs&&existing.startMs<start+duration))
      return error('Bereits vorhandene Kamera-Cues überschneiden die Vorschläge. Nichts wurde verändert.');
    const id=`v802-camera-${c.sceneIndex}`;
    if(clean.clips.some(x=>x.id===id)||clips.some(x=>x.id===id))
      return error('Dieser V802-Vorschlag ist bereits in der Timeline enthalten.');
    clips.push({id,lane:'camera',startMs:start,durationMs:duration,
      value:shot(c.after),label:`V802 Szene ${c.sceneIndex+1} (${c.after})`});
  }
  const timeline=sanitizeTimelineV354({...clean,clips:[...clean.clips,...clips]});
  if(timeline.clips.length!==clean.clips.length+clips.length)return error('Die Timeline hat nicht alle neuen Cues angenommen.');
  return {ok:true,reason:`${clips.length} neue Kamera-Cues als manuelle Entwürfe vorbereitet.`,
    timeline,added:clips.length};
}
