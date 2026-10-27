/** V521 – explicit concert preset previews, never a policy or fabricated benchmark.
 * Only the render quality is automatically testable through the V520 opt-in/rollback flow.
 * Recommended cast and lighting preferences remain explanations, not settings writes.
 */
import type {PiStudioCaptureV518} from './piConcertPerformanceStudioV518';
import {validOptimizationCaptureV519,compareOptimizationCapturesV519} from './concertOptimizationAdvisorV519';
import type {V520Proposal,V520Mode} from './concertAutoTuningV520';
export type ConcertPresetIdV521='cinematic'|'ensemble'|'reserve';
export type ConcertPresetV521=Readonly<{
 id:ConcertPresetIdV521;name:string;purpose:string;quality:'high'|'balanced'|'low';
 suggestedAvatars:2|4;reactiveLighting:'recommended'|'optional';
 priority:string;protects:readonly string[];
}>;
export const CONCERT_PRESETS_V521:readonly ConcertPresetV521[]=Object.freeze([
 {id:'cinematic',name:'Bildqualität',purpose:'Details und Licht für das Konzertbild priorisieren.',quality:'high',suggestedAvatars:2,
  reactiveLighting:'recommended',priority:'Visuelle Details vor hoher Avatarzahl',protects:['Lyrics','Lip-Sync','Motions']},
 {id:'ensemble',name:'Vier-Avatar-Balance',purpose:'Vier Tänzer mit synchronisierten Lyrics und Tanzshow testen.',quality:'balanced',suggestedAvatars:4,
  reactiveLighting:'recommended',priority:'Ensemble mit moderater Grafikauflösung',protects:['Lyrics','Lip-Sync','Gruppenregie']},
 {id:'reserve',name:'Leistungsreserve',purpose:'Spielraum für lange Shows mit vier Tänzern schaffen.',quality:'low',suggestedAvatars:4,
  reactiveLighting:'optional',priority:'Flüssigkeit statt maximaler Pixelzahl',protects:['Lyrics','Lip-Sync','Fuß-IK']},
]);
export function getConcertPresetV521(id:string):ConcertPresetV521{
 return CONCERT_PRESETS_V521.find(p=>p.id===id)??CONCERT_PRESETS_V521[1];
}
export type ConcertPresetPreviewV521=Readonly<{
 preset:ConcertPresetV521;qualityChange:string;canStartV520:boolean;reason:string;
 captured:PiStudioCaptureV518|null;measured:boolean;
}>;
export function matchingPresetCaptureV521(preset:ConcertPresetV521,captures:readonly PiStudioCaptureV518[]):PiStudioCaptureV518|null{
 // A snapshot is labeled measured only if its ACTUAL capture matches both preset descriptors.
 for(let i=captures.length-1;i>=0;i--){const c=captures[i];
  if(validOptimizationCaptureV519(c)&&c.tier===preset.quality&&
     c.avatarCount===preset.suggestedAvatars&&c.features.lyrics&&c.features.lipSync&&
     (preset.reactiveLighting!=='recommended'||c.features.reactiveLighting))return c;
 }
 return null;
}
export function previewConcertPresetV521(id:ConcertPresetIdV521,
 quality:{mode:V520Mode;tier:'high'|'balanced'|'low'},
 proposal:V520Proposal,captures:readonly PiStudioCaptureV518[]):ConcertPresetPreviewV521{
 const preset=getConcertPresetV521(id),captured=matchingPresetCaptureV521(preset,captures);
 const qualityChange=quality.mode===preset.quality?`Grafikmodus bereits ${preset.quality}`:
  `${quality.mode} → ${preset.quality} (DPR kann gekoppelt wechseln)`;
 // Never bypass the V520 adviser/age/same-configuration/manual mode/pi controller guard.
 const canStartV520=proposal.allowed&&proposal.targetMode===preset.quality;
 const reason=canStartV520?
  `V520-Rücknahmetest freigegeben: nur ${qualityChange}. Avatarzahl und Licht werden nicht geändert.`:
  quality.mode===preset.quality?'Keine Änderung nötig. Einen echten Messpunkt mit diesem Profil aufnehmen.':
  `Für dieses Profil ist gerade kein geschützter V520-Einzelschritt verfügbar. ${proposal.reason} Weitere Änderungen nur über bestehende Einstellungen.`;
 return {preset,qualityChange,canStartV520,reason,captured,measured:captured!==null};
}
export type PresetEvidenceComparisonV521=Readonly<{
 status:'unavailable'|'observed';fpsDelta:number|null;p95DeltaMs:number|null;
 changes:readonly string[];description:string;
}>;
export function compareConcertPresetEvidenceV521(a:ConcertPresetV521,b:ConcertPresetV521,
 captures:readonly PiStudioCaptureV518[]):PresetEvidenceComparisonV521{
 const left=matchingPresetCaptureV521(a,captures),right=matchingPresetCaptureV521(b,captures);
 if(!left||!right||left.at===right.at)return {status:'unavailable',fpsDelta:null,p95DeltaMs:null,changes:[],
  description:'Beide Profile benötigen getrennte, tatsächlich gemessene Aufnahmen. Keine FPS-Vorhersage.'};
 const compared=compareOptimizationCapturesV519(left,right);
 return {status:'observed',fpsDelta:compared.fpsDelta,p95DeltaMs:compared.p95DeltaMs,
  changes:compared.changes,description:'Nur gemessene Unterschiede, nicht kausal zuordenbar. Avatarzahl, Grafikstufe, DPR und Licht können gemeinsam variieren.'};
}
