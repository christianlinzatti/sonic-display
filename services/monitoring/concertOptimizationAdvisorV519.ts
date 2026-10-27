/** V519 — read-only, evidence-labelled optimization decisions from V518 observed captures.
 * Never predicts FPS gain or writes a settings/animation value. */
import type {PiStudioCaptureV518} from './piConcertPerformanceStudioV518';

export type ConcertTargetV519 = 30|45|60;
export type OptimizationSeverityV519 = 'ok'|'observe'|'constrained';
export type OptimizationActionV519 = Readonly<{
  id:string;priority:number;title:string;test:string;reason:string;guard:string;
}>;
export type OptimizationPlanV519 = Readonly<{
  valid:boolean;severity:OptimizationSeverityV519;reason:string;target:ConcertTargetV519;
  actions:readonly OptimizationActionV519[];observed:Readonly<{
    avgFps:number;minFps:number;worstWindowP95Ms:number;slowPercent:number;drawCalls:number;triangles:number;
  }> | null;
}>;
export type OptimizationComparisonV519 = Readonly<{
  status:'single-change'|'confounded'|'repeat'|'invalid';
  changes:readonly string[];fpsDelta:number|null;p95DeltaMs:number|null;
  description:string;positiveObservation:boolean;
}>;
const finite=(n:number,min:number,max:number)=>Number.isFinite(n)&&n>=min&&n<=max;
export function validOptimizationCaptureV519(c:PiStudioCaptureV518|null|undefined):c is PiStudioCaptureV518{
  if(!c||!c.features)return false;
  return finite(c.at,1,Number.MAX_SAFE_INTEGER)&&finite(c.startAt,1,Number.MAX_SAFE_INTEGER)&&
    finite(c.endAt,c.startAt,c.at)&&Number.isInteger(c.count)&&c.count>=6&&c.count<=20&&
    Number.isInteger(c.avatarCount)&&c.avatarCount>=2&&c.avatarCount<=4&&
    (['low','balanced','high'] as string[]).includes(c.tier)&&finite(c.dpr,.25,4)&&
    typeof c.piProfile==='string'&&!!c.piProfile&&typeof c.piLevel==='string'&&!!c.piLevel&&
    typeof c.features.lyrics==='boolean'&&typeof c.features.lipSync==='boolean'&&
    typeof c.features.reactiveLighting==='boolean'&&finite(c.avgFps,1,240)&&
    finite(c.minFps,1,c.avgFps)&&finite(c.worstWindowP95Ms,.01,250)&&
    finite(c.avgSlowPercent,0,100)&&finite(c.avgDrawCalls,0,1_000_000)&&
    finite(c.avgTriangles,0,1_000_000_000)&&
    (c.peakHeapMb===null||finite(c.peakHeapMb,0,1_000_000));
}
export function planConcertOptimizationV519(c:PiStudioCaptureV518|null|undefined,target:ConcertTargetV519):OptimizationPlanV519{
  const requested:ConcertTargetV519=([30,45,60] as number[]).includes(target)?target:30;
  if(!validOptimizationCaptureV519(c))return {valid:false,severity:'observe',target:requested,
    reason:'Erst sechs zusammenhängende echte Bühnen-Messfenster aufnehmen. Keine Empfehlung ohne valide Messung.',actions:[],observed:null};
  const budget=1000/requested;
  // Window P95 is a *worst of individual 1 s window P95s*, not pooled frame P95.
  const constrained=c.avgFps<requested*.8||c.worstWindowP95Ms>budget*1.75||c.avgSlowPercent>20;
  const observe=!constrained&&(c.avgFps<requested||c.worstWindowP95Ms>budget*1.35||c.avgSlowPercent>8||c.minFps<requested*.7);
  const severity:OptimizationSeverityV519=constrained?'constrained':observe?'observe':'ok';
  const actions:OptimizationActionV519[]=[];
  const add=(id:string,priority:number,title:string,test:string,reason:string,guard:string)=>actions.push({id,priority,title,test,reason,guard});
  if(severity!=='ok'){
    if(c.tier==='high'||c.tier==='balanced') add('quality',10,'Renderqualität einzeln vergleichen',
      'Mit derselben Passage Balanced statt High oder Low statt Balanced messen; DPR verändert sich gekoppelt.',
      `Gemessen: DPR ${c.dpr.toFixed(2)} und ${c.tier}-Profil; FPS Ø ${c.avgFps.toFixed(1)} bei Ziel ${requested}.`,
      'Manuelle Qualitätswahl respektieren; keine automatische Umstellung.');
    if(c.piLevel.toLowerCase()!=='eco'&&c.piProfile.toLowerCase().includes('pi')) add('pi-budget',20,'Pi-Effektbudget vergleichen',
      'Einzeln Eco statt aktuellem Effektbudget testen; alle anderen Schalter unverändert lassen.',
      `Pi-Profil ${c.piProfile}/${c.piLevel}; gemessenes schlechtestes Fenster-P95 ${c.worstWindowP95Ms.toFixed(1)} ms.`,
      'Nur visuelle Extras testen; Lyrics, Lip-Sync, Fuß-IK und Motion-Clips geschützt.');
    if(c.features.reactiveLighting) add('lighting',30,'Reaktives Bühnenlicht A/B testen',
      'Reaktives Licht kurz ausschalten, dieselbe Passage messen und danach wieder nach Wunsch aktivieren.',
      `Reaktives Licht war an; langsame Frames im Mittel ${c.avgSlowPercent.toFixed(1)} %.`,
      'Statisches Licht wird davon nicht zwangsläufig deaktiviert; kein automatisches Abschalten.');
    if(c.avatarCount>=3) add('avatars',40,'Gruppengröße isoliert testen',
      `Dieselbe Passage mit ${c.avatarCount-1} statt ${c.avatarCount} Avataren aufnehmen.`,
      `${c.avatarCount} Avatare, Ø ${c.avgDrawCalls.toFixed(0)} Draw Calls und Ø ${c.avgTriangles.toFixed(0)} Dreiecke gemessen.`,
      'Die Originalshow und gespeicherte Besetzung nicht dauerhaft verändern.');
    if(c.features.lyrics) add('lyrics',50,'Lyrics-Rendering nur bei Bedarf isolieren',
      'Als letzten optionalen Test dieselbe Passage mit vereinfachter Lyrics-Anzeige vergleichen.',
      'Lyrics waren während der Messung aktiv; ein Renderaufwand wurde nicht separat gemessen.',
      'Lesbarkeit und Karaoke-Synchronisierung haben Vorrang; keine erfundene Beschleunigung.');
    if(actions.length===0)add('scene',60,'Zweiten Showabschnitt messen',
      'Mit denselben Einstellungen denselben Abschnitt erneut messen und Unterschiede dokumentieren.',
      `FPS Ø ${c.avgFps.toFixed(1)}, schlechtestes Fenster-P95 ${c.worstWindowP95Ms.toFixed(1)} ms.`,
      'Keine unkontrollierte Änderung von Lip-Sync, Fußkontakt oder Choreografie.');
  } else add('long-run',90,'Längere Show unter Last beobachten',
    'Mit vier Avataren mehrere Songs abspielen und dieselbe Passage später erneut aufnehmen.',
    `Messfenster erfüllten das ${requested}-FPS-Ziel ohne starke Auffälligkeit; dies beweist keine Langzeitstabilität.`,
    'Temperatur, GPU und Raspberry-Pi-RAM sind im Browser nicht direkt gemessen.');
  actions.sort((a,b)=>a.priority-b.priority);
  return {valid:true,target:requested,severity,actions,observed:{avgFps:c.avgFps,minFps:c.minFps,
    worstWindowP95Ms:c.worstWindowP95Ms,slowPercent:c.avgSlowPercent,drawCalls:c.avgDrawCalls,triangles:c.avgTriangles},
    reason:severity==='constrained'?'Deutliche Engpass-Indikatoren in beobachteten Browser-Renderfenstern.':
      severity==='observe'?'Leichte oder zeitweise Engpass-Indikatoren: gezielt gegenmessen.':
      'Keine auffällige Belastung in diesem kurzen Messpunkt; Langzeittest sinnvoll.'};
}
export function compareOptimizationCapturesV519(a:PiStudioCaptureV518|null|undefined,b:PiStudioCaptureV518|null|undefined):OptimizationComparisonV519{
  const invalid:OptimizationComparisonV519={status:'invalid',changes:[],fpsDelta:null,p95DeltaMs:null,
    description:'Für den Vergleich zwei gültige, unterschiedliche Aufnahmen wählen.',positiveObservation:false};
  if(!validOptimizationCaptureV519(a)||!validOptimizationCaptureV519(b)||a===b||
     (a.at===b.at&&a.configuration===b.configuration))return invalid;
  const changes:string[]=[];
  if(a.avatarCount!==b.avatarCount)changes.push('Avataranzahl');
  if(a.tier!==b.tier)changes.push('Grafikprofil');
  if(Math.abs(a.dpr-b.dpr)>.02)changes.push('DPR');
  if(a.piProfile!==b.piProfile)changes.push('Pi-Profil');
  if(a.piLevel!==b.piLevel)changes.push('Pi-Effektbudget');
  if(a.features.lyrics!==b.features.lyrics)changes.push('Lyrics');
  if(a.features.lipSync!==b.features.lipSync)changes.push('Lip-Sync');
  if(a.features.reactiveLighting!==b.features.reactiveLighting)changes.push('Reaktives Licht');
  const delta=b.avgFps-a.avgFps,p95=b.worstWindowP95Ms-a.worstWindowP95Ms;
  if(changes.length===0)return {status:'repeat',changes,fpsDelta:delta,p95DeltaMs:p95,positiveObservation:false,
    description:'Wiederholungsmessung mit gleichen erfassten Einstellungen. Schwankungen quantifizieren; keine Änderung isoliert.'};
  if(changes.length>1)return {status:'confounded',changes,fpsDelta:delta,p95DeltaMs:p95,positiveObservation:false,
    description:'Mehr als eine Einstellung verändert: nur beobachtete Differenz; Effekte nicht getrennt interpretierbar.'};
  // Even a single changed setting does not establish causal improvement; unobserved song/scene/temperature may differ.
  return {status:'single-change',changes,fpsDelta:delta,p95DeltaMs:p95,positiveObservation:delta>0&&p95<0,
    description:'Eine erfasste Einstellung unterschiedlich. Gleicher Songabschnitt, gleiche Dauer, Gerätetemperatur und Hintergrundlast müssen separat kontrolliert werden; keine Kausalitätsaussage.'};
}
