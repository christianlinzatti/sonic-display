/** V553 — release checklist driven by observed V522 runs, not simulated performance.
 * No GPU measurements, hardware detection, production build or visual inspection is
 * carried out by this function. All operator evidence remains explicitly labeled.
 */
import {
  BENCHMARK_RECIPES_V522, benchmarkResultV522,
  type BenchmarkRunV522,
} from './concertBenchmarkValidationV522';
import {
  assessConcertShowReadinessV543,
  type ConcertVisualReviewsV543,
  type ConcertShowReadinessV543,
} from './concertShowReadinessV543';

export type ReleaseBuildStatusV553='not-run'|'passed'|'failed';
export type ReleaseDeviceV553='browser'|'raspberry-pi';
export type ConcertReleaseEvidenceV553=Readonly<{
  buildStatus:ReleaseBuildStatusV553;
  /** User-pasted nonempty build output; never validated as real by this function. */
  buildEvidence:string;
  device:ReleaseDeviceV553;
  /** Freeform user-reported device name; no hardware attestation. */
  deviceLabel:string;
  realDeviceConfirmed:boolean;
  touchscreenChecked:boolean;
  noFreezesObserved:boolean;
  thermalsReviewed:boolean;
}>;
export const EMPTY_RELEASE_EVIDENCE_V553:ConcertReleaseEvidenceV553=Object.freeze({
  buildStatus:'not-run',buildEvidence:'',device:'browser',deviceLabel:'',
  realDeviceConfirmed:false,touchscreenChecked:false,noFreezesObserved:false,
  thermalsReviewed:false,
});
export type ConcertReleaseStatusV553=
 'benchmarks-missing'|'measurements-needs-attention'|'visual-review-missing'|
 'build-unverified'|'device-review-missing'|'human-signoff-ready';
export type ConcertReleaseResultV553=Readonly<{
  version:'V553'; status:ConcertReleaseStatusV553;
  readiness:ConcertShowReadinessV543;
  blockers:readonly string[];
  /** Source run identifiers and their last observation time; not fabricated samples. */
  measuredRuns:readonly {scene:string;id:string;at:number;configuration:string}[];
  operatorBuildAttested:boolean;
  operatorHardwareAttested:boolean;
  note:string;
}>;

/** Only 3 RECENT comparable complete runs of each scene count. A later bad run,
 * an invalid session or a changed FPS target revokes the previously optimistic result
 * (assessConcertShowReadinessV543 is authoritative for this behavior).
 * The selected device and hardware checkboxes are self-reported, not detection.
 */
export function assessConcertReleaseV553(
  runs:readonly BenchmarkRunV522[],
  reviews:ConcertVisualReviewsV543,
  targetFps:30|45|60,
  evidence:ConcertReleaseEvidenceV553,
):ConcertReleaseResultV553 {
  const readiness=assessConcertShowReadinessV543(runs,reviews,targetFps);
  const blockers:string[]=[];
  if(readiness.status==='needs-attention')blockers.push('Eine aktuelle Benchmark-Messung ist ungültig oder verfehlt das Leistungsziel.');
  if(readiness.completedScenes!==BENCHMARK_RECIPES_V522.length)
    blockers.push('Drei vergleichbare reale Live-Messungen pro Szenario fehlen oder sind nicht bestanden.');
  if(readiness.reviewedScenes!==BENCHMARK_RECIPES_V522.length)
    blockers.push('Die manuelle Sicht-/Hörprüfung für Tanz, Lip-Sync, Lyrics, Kamera und Licht fehlt in mindestens einer Szene.');
  const operatorBuildAttested=evidence.buildStatus==='passed'&&
    evidence.buildEvidence.trim().length>=12;
  if(!operatorBuildAttested)blockers.push(evidence.buildStatus==='failed'?
    'Der gemeldete vollständige Produktionsbuild ist fehlgeschlagen.':
    'Erfolgreicher vollständiger Produktionsbuild und Build-Protokoll sind nicht dokumentiert.');
  const operatorHardwareAttested=evidence.device==='raspberry-pi'&&
    evidence.realDeviceConfirmed&&evidence.deviceLabel.trim().length>=3;
  if(!operatorHardwareAttested)blockers.push('Echte Raspberry-Pi-Hardware samt Gerätedaten ist nicht durch den Nutzer bestätigt.');
  if(!evidence.touchscreenChecked)blockers.push('Touchscreen-/10-Zoll-Darstellung ist noch nicht manuell geprüft.');
  if(!evidence.noFreezesObserved)blockers.push('Lange Konzertshow wurde noch nicht auf Hänger geprüft.');
  if(!evidence.thermalsReviewed)blockers.push('Pi-Temperatur/Throttling wurde noch nicht außerhalb der App geprüft.');
  const status:ConcertReleaseStatusV553 =
    readiness.status==='needs-attention'?'measurements-needs-attention':
    readiness.completedScenes<3?'benchmarks-missing':
    readiness.reviewedScenes<3?'visual-review-missing':
    !operatorBuildAttested?'build-unverified':
    !operatorHardwareAttested||!evidence.touchscreenChecked||!evidence.noFreezesObserved||!evidence.thermalsReviewed?
      'device-review-missing':'human-signoff-ready';
  const measuredRuns=BENCHMARK_RECIPES_V522.flatMap(recipe=>{
    const newest=[...runs].reverse().find(r=>r.scene===recipe.id&&r.targetFps===targetFps&&
      r.status==='complete'&&benchmarkResultV522(r)!==null);
    if(!newest)return [];
    return runs.filter(r=>r.scene===recipe.id&&r.targetFps===targetFps&&
      r.configuration===newest.configuration&&r.status==='complete'&&benchmarkResultV522(r)!==null)
      .slice(-3).map(r=>({scene:recipe.id,id:r.id,at:r.endAt??r.lastAt,configuration:r.configuration}));
  });
  const note=status==='human-signoff-ready'?
    'Alle Messkriterien erfüllt und vom Bediener als bestanden markiert. Dies ist eine dokumentierte menschliche Freigabeempfehlung, keine automatische Zertifizierung von Hardware, Build, Bild- oder Audioqualität.':
    'Keine Produktionsfreigabe. Testabdeckung und vom Nutzer dokumentierte Prüfungen getrennt betrachten.';
  return {version:'V553',status,readiness,blockers,measuredRuns,
    operatorBuildAttested,operatorHardwareAttested,note};
}
