/** V801 — read-only whole-song quality inspector.
 * Converts ONLY the V790 verified storyboard and V800 structural audit into
 * inspectable time ranges. Planning evidence never masquerades as visual/GLB,
 * audio, lip-sync, GPU or subjective concert-quality measurements.
 * No clock, network, persistence, side effects or synthesized song intervals.
 */
import type {ShowPlanV790,ShowSceneV790} from './cinematicShowDirectorV790';
import type {ConcertExperiencePlanV800} from './concertExperienceMilestoneV800';

export type ConcertInspectorLaneV801='timeline'|'camera'|'dance'|'lyrics'|'lighting'|'stage';
export type ConcertInspectorSeverityV801='attention'|'information';
export type ConcertInspectorStatusV801='planned'|'attention'|'unverified'|'manual';
export type ConcertInspectorFindingV801={id:string;lane:ConcertInspectorLaneV801;
  severity:ConcertInspectorSeverityV801;sceneIndex:number|null;
  startMs:number;endMs:number;code:string;message:string;recommendation:string};
export type ConcertInspectorSceneV801={index:number;actIndex:number;startMs:number;
  endMs:number;section:string;intent:ShowSceneV790['intent'];moment:ShowSceneV790['moment'];
  role:ShowSceneV790['role'];statuses:Record<Exclude<ConcertInspectorLaneV801,'timeline'>,
  ConcertInspectorStatusV801>;findingIds:readonly string[]};
export type ConcertInspectorEvidenceV801={trackId:string;durationMs:number;
  avatarStage:boolean;performers:number;lyricsAvailable:boolean;lyricsSynced:boolean;
  manualDance:boolean;manualCamera:boolean;manualLighting:boolean;reducedMotion:boolean};
export type ConcertInspectionV801={source:'verified-plan'|'unavailable';trackId:string;
  durationMs:number;coverage:number;sceneCount:number;structureScore:number|null;
  findings:readonly ConcertInspectorFindingV801[];
  scenes:readonly ConcertInspectorSceneV801[];
  summary:{attention:number;information:number;unverifiedLanes:number};
  note:string};
const valid=(n:unknown):n is number=>typeof n==='number'&&Number.isFinite(n);
const clamp=(n:number,a:number,b:number)=>Math.max(a,Math.min(b,n));
const empty=(id:string,durationMs:number):ConcertInspectionV801=>({
  source:'unavailable',trackId:id,durationMs,coverage:0,sceneCount:0,structureScore:null,
  findings:[],scenes:[],summary:{attention:0,information:0,unverifiedLanes:0},
  note:'Keine für diesen Song verifizierte V790-Szenenplanung vorhanden. Keine Bewertung möglich.',
});

export function inspectConcertExperienceV801(show:ShowPlanV790,
  audit:ConcertExperiencePlanV800,e:ConcertInspectorEvidenceV801):ConcertInspectionV801{
  const off=empty(e.trackId,e.durationMs);
  if(show.source!=='verified-storyboard'||audit.source!=='verified-show'||
    !e.trackId||show.trackId!==e.trackId||audit.trackId!==e.trackId||
    !valid(e.durationMs)||e.durationMs<=0||show.durationMs!==e.durationMs||
    audit.durationMs!==e.durationMs||audit.sceneCount!==show.scenes.length||
    audit.scenes.length!==show.scenes.length||!valid(audit.coverage)||
    audit.coverage<0||audit.coverage>1||!Number.isInteger(e.performers)||e.performers<0)return off;
  const findings:ConcertInspectorFindingV801[]=[];
  const add=(lane:ConcertInspectorLaneV801,code:string,severity:ConcertInspectorSeverityV801,
    startMs:number,endMs:number,sceneIndex:number|null,message:string,recommendation:string)=>{
    const id=`${code}-${sceneIndex??'global'}-${Math.round(startMs)}`;
    findings.push({id,lane,code,severity,startMs,endMs,sceneIndex,message,recommendation});
  };
  const scenes:ConcertInspectorSceneV801[]=[];
  let prevEnd=0,prevIntent='',run=0,distinct=new Set<string>(),breaths=0,supports=0;
  for(let i=0;i<show.scenes.length;i++){
    const s=show.scenes[i],a=audit.scenes[i];
    // Defensive: an old/stale V800 audit must never yield a misleading report.
    if(!s||!a||a.index!==i||s.index!==i||a.startMs!==s.startMs||a.endMs!==s.endMs||
      a.actIndex!==s.actIndex||!valid(s.startMs)||!valid(s.endMs)||
      s.startMs<prevEnd||s.endMs>e.durationMs||s.endMs<=s.startMs)return off;
    if(s.startMs>prevEnd){
      add('timeline','coverage-gap','attention',prevEnd,s.startMs,i,
        `Nicht abgedeckter Bereich zwischen den bestätigten Szenen (${Math.round(s.startMs-prevEnd)} ms).`,
        'Song-Timeline und Szenenintervalle prüfen; keine künstliche Szene ergänzen.');
    }
    run=prevIntent===s.intent?run+1:1;
    if(run===3){
      add('camera','repeated-camera','attention',show.scenes[i-2].startMs,s.endMs,i,
        `Mindestens drei aufeinanderfolgende Szenen mit Kamera-Intent „${s.intent}“.`,
        'Eine alternative Einstellung im Storyboard planen, ohne den Sängerfokus zu verlieren.');
    }
    if(s.moment==='breath')breaths++;
    if(s.role==='support-peak'&&s.moment==='payoff')supports++;
    distinct.add(s.intent);
    const statuses:ConcertInspectorSceneV801['statuses']={
      camera:e.manualCamera?'manual':run>=3?'attention':'planned',
      dance:e.manualDance?'manual':'unverified',
      lyrics:e.lyricsAvailable&&e.lyricsSynced?'planned':'unverified',
      lighting:e.manualLighting?'manual':'unverified',
      stage:e.avatarStage?'planned':'unverified',
    };
    scenes.push({index:i,actIndex:s.actIndex,startMs:s.startMs,endMs:s.endMs,
      section:s.section,intent:s.intent,moment:s.moment,role:s.role,
      statuses,findingIds:[]});
    prevEnd=s.endMs;prevIntent=s.intent;
  }
  if(prevEnd<e.durationMs){
    add('timeline','coverage-gap-end','attention',prevEnd,e.durationMs,null,
      'Der bestätigte Szenenplan endet vor dem Songende.',
      'Letzten Szenenbereich in der importierten Timeline prüfen.');
  }
  if(distinct.size<3){
    add('camera','low-shot-variety','attention',0,e.durationMs,null,
      `Der Szenenplan enthält nur ${distinct.size} unterschiedliche Kamera-Intents.`,
      'Mehrere Perspektiven über Verse, Hooks und Breaks planen.');
  }
  if(breaths===0){
    add('lighting','missing-breath','attention',0,e.durationMs,null,
      'Keine ausgewiesene Ruhe-/Atempause im bestätigten Szenenplan.',
      'Falls musikalisch passend, einen ruhigeren Break im Storyboard markieren.');
  }
  if(supports===0){
    add('stage','missing-secondary-peak','information',0,e.durationMs,null,
      'Neben dem Haupthöhepunkt ist kein bestätigter Nebenhöhepunkt markiert.',
      'Hooks auf echte, unterschiedliche Akzentstellen prüfen; keine künstlichen Peaks erzeugen.');
  }
  if(!e.lyricsAvailable){
    add('lyrics','no-lyrics','information',0,e.durationMs,null,
      'Zum aktuellen Song sind keine Lyrics-Zeilen vorhanden.',
      'Lyrics-Provider und Berechtigungen prüfen. Ohne Lyrics ist die Lesbarkeit nicht messbar.');
  }else if(!e.lyricsSynced){
    add('lyrics','unsynced-lyrics','attention',0,e.durationMs,null,
      'Lyrics sind vorhanden, aber ohne bestätigte Zeitmarken.',
      'Synchronisierten Lyrics-Provider oder manuelle Zeitmarken verwenden.');
  }
  if(e.performers===0&&e.avatarStage){
    add('dance','no-performers','information',0,e.durationMs,null,
      'Aktuell sind keine Performer für die Bühne gemeldet.',
      'Avatar-Auswahl und Ladezustand prüfen. Der Songplan allein belegt keine Tanzqualität.');
  }
  if(e.reducedMotion){
    add('stage','reduced-motion','information',0,e.durationMs,null,
      'Reduzierte Bewegung ist aktiviert; zusätzliche Bewegungsregie darf ausbleiben.',
      'Als Bedienungseinstellung respektieren; nicht als Showfehler werten.');
  }
  // Structural index only: do not penalize unknown dance, lighting or rendered
  // lyric visibility as if their actual visual quality had been measured.
  const attention=findings.filter(f=>f.severity==='attention').length;
  const information=findings.length-attention;
  const score=Math.round(clamp(100-
    (1-audit.coverage)*45-
    (distinct.size<3?12:0)-
    (breaths===0?8:0)-
    findings.filter(f=>f.code==='repeated-camera').length*7-
    findings.filter(f=>f.code.startsWith('coverage-gap')).length*5,
    0,100));
  const indexed=scenes.map(s=>({...s,findingIds:findings.filter(f=>
    f.sceneIndex===s.index||(f.sceneIndex===null&&f.startMs<s.endMs&&f.endMs>s.startMs))
    .map(f=>f.id)}));
  return {source:'verified-plan',trackId:e.trackId,durationMs:e.durationMs,
    coverage:audit.coverage,sceneCount:indexed.length,structureScore:score,
    findings,scenes:indexed,
    summary:{attention,information,unverifiedLanes:Object.values(indexed[0]?.statuses??{})
      .filter(s=>s==='unverified').length},
    note:'Planbasierte Strukturdiagnose, keine visuelle Abnahme. Kamera, GLB-Tanz, Lippen, Lichtkontrast und Lyrics-Überdeckung können nur in der laufenden 3D-Ansicht beurteilt werden.'};
}
