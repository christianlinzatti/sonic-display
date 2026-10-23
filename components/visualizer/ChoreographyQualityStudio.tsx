"use client";
import { useMemo, useState } from "react";
import { useUiPreferences } from "@/context/UiPreferencesContext";
import { sanitizeTimeline } from "./motionTimelineEngine";
import { analyzeChoreography, proposeChoreographyOptimization } from "./choreographyQualityOptimizer";

export function ChoreographyQualityStudio() {
 const { preferences, updatePreferences } = useUiPreferences();
 const timeline = sanitizeTimeline(preferences.avatarTimeline);
 const [proposal, setProposal] = useState<ReturnType<typeof proposeChoreographyOptimization> | null>(null);
 const report = useMemo(() => analyzeChoreography(timeline), [preferences.avatarTimeline]);
 const preview = proposal ? analyzeChoreography(proposal) : null;
 const generate = () => setProposal(proposeChoreographyOptimization(timeline, { minimumFade: .22, snap: false }));
 const apply = () => { if (!proposal) return; updatePreferences({avatarTimeline:proposal}); setProposal(null); };
 return <fieldset><legend>V160 – Automatic Choreography Quality Optimizer</legend>
 <p>Statische Qualitätsanalyse der Timeline: Übergänge, Lücken, Überschneidungen, Geschwindigkeit und Keyframes. Die Auswertung ist unabhängig von echten IK-Laufzeitmessungen und verändert keine Tanzclips.</p>
 <p role="status"><strong>Timeline-Qualität: {report.score}/100</strong> · {report.segmentCount} Clips · {report.analyzedDuration.toFixed(1)} s · {report.issues.length} Hinweise</p>
 <div style={{maxHeight:240,overflowY:"auto"}}>{report.issues.length ? <ul>{report.issues.map((issue,i) => <li key={`${issue.code}-${issue.segmentId??"all"}-${i}`}><strong>{issue.severity === "warning" ? "Warnung" : "Hinweis"}:</strong> {issue.message}. {issue.suggestion}</li>)}</ul> : <p>Keine statischen Timeline-Probleme gefunden.</p>}</div>
 <button type="button" disabled={!timeline.segments.length} onClick={generate}>Optimierungsvorschlag berechnen</button>{" "}
 <button type="button" disabled={!proposal} onClick={apply}>Vorschlag übernehmen</button>{" "}
 <button type="button" disabled={!proposal} onClick={() => setProposal(null)}>Verwerfen</button>
 {preview && <p>Vorschau: {preview.score}/100 statt {report.score}/100. Nur Fade-Zeiten werden vorsichtig korrigiert; die Übernahme erfolgt erst nach Klick.</p>}
 <small>V160 ist bewusst nicht destruktiv: Keine automatischen Änderungen am laufenden Avatar, keine gespeicherten Einstellungen ohne Bestätigung und keine Behauptung über reale Fußkontakte oder GLB-Animationen.</small>
 </fieldset>;
}
