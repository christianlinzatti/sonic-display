import { sanitizeTimeline, type MotionTimeline, type TimelineSegment } from "./motionTimelineEngine";

export type ChoreographyIssue = { code: string; severity: "warning" | "info"; segmentId?: string; message: string; suggestion: string };
export type ChoreographyReport = { score: number; issues: ChoreographyIssue[]; segmentCount: number; analyzedDuration: number };
export type OptimizeOptions = { minimumFade?: number; snap?: boolean; bpm?: number };
const finite = (v: number) => Number.isFinite(v);
const round = (v: number) => Math.round(v * 1000) / 1000;

/** Pure, deterministic static timeline analysis. No access to GLB rig or sampled IK data. */
export function analyzeChoreography(timeline: MotionTimeline): ChoreographyReport {
 const t = sanitizeTimeline(timeline);
 const issues: ChoreographyIssue[] = [];
 const segments = t.segments.filter(s => s.duration > 0).sort((a,b) => a.start - b.start);
 const bpm = t.bpm ?? 120;
 const beat = 60 / bpm;
 if (!segments.length) issues.push({ code: "empty", severity: "info", message: "Keine Clips vorhanden.", suggestion: "Füge mindestens einen Tanzclip hinzu." });
 for (const s of segments) {
  if (s.fadeIn < 0.1 || s.fadeOut < 0.1) issues.push({ code: "hard-cut", severity: "warning", segmentId: s.id, message: `${s.clip}: sehr kurzer Übergang`, suggestion: "Fade-in und Fade-out auf mindestens 0,2 s erhöhen." });
  if (s.fadeIn + s.fadeOut > s.duration * 1.5) issues.push({ code: "overfade", severity: "info", segmentId: s.id, message: `${s.clip}: Überblendungen dominieren den Clip`, suggestion: "Fade-Dauer im Verhältnis zur Clip-Länge reduzieren." });
  if (s.speed > 1.65 || s.speed < 0.55) issues.push({ code: "speed", severity: "info", segmentId: s.id, message: `${s.clip}: starke Geschwindigkeitsanpassung`, suggestion: "Playback-Speed näher an 1,0 wählen." });
  if (s.keys.some(k => k.value < 0.1 || k.value > 0.98)) issues.push({ code: "extreme-key", severity: "info", segmentId: s.id, message: `${s.clip}: extreme Keyframe-Gewichte`, suggestion: "Keyframe-Gewichte prüfen und gegebenenfalls glätten." });
  if (t.snap && Math.abs(s.start / beat - Math.round(s.start / beat)) > 0.08) issues.push({ code: "off-beat", severity: "info", segmentId: s.id, message: `${s.clip}: Start liegt neben dem Beat-Raster`, suggestion: "Start auf den nächsten Beat quantisieren." });
 }
 for (let i=1;i<segments.length;i++) {
  const a=segments[i-1], b=segments[i];
  if ((a.track??0) !== (b.track??0)) continue;
  const gap=b.start-(a.start+a.duration);
  if (gap > .4) issues.push({code:"gap",severity:"warning",segmentId:b.id,message:`${gap.toFixed(2)} s Lücke vor ${b.clip}`,suggestion:"Clipstart oder Cliplänge anpassen."});
  if (gap < -Math.min(a.duration,b.duration)*.7) issues.push({code:"overlap",severity:"warning",segmentId:b.id,message:`Starke Überlappung vor ${b.clip}`,suggestion:"Clipüberlappung reduzieren."});
 }
 return { score:Math.max(0,100-issues.reduce((n,i)=>n+(i.severity==="warning"?12:4),0)),issues,segmentCount:segments.length,analyzedDuration:round(segments.reduce((m,s)=>Math.max(m,s.start+s.duration),0)) };
}

/** Non-destructive proposal; leaves the input untouched and never changes clip names or tracks. */
export function proposeChoreographyOptimization(timeline: MotionTimeline, options: OptimizeOptions = {}): MotionTimeline {
 const t = sanitizeTimeline(timeline);
 const bpm = finite(Number(options.bpm)) && Number(options.bpm) >= 40 && Number(options.bpm) <= 240 ? Number(options.bpm) : (t.bpm ?? 120);
 const beat=60/bpm;
 const minFade=Math.max(.1,Math.min(.6,finite(Number(options.minimumFade)) ? Number(options.minimumFade) : .2));
 const segments=t.segments.map(s => {
  const maxFade=s.duration*.45;
  const targetFade=Math.min(minFade,maxFade);
  const start=options.snap === true ? Math.max(0,Math.round(s.start/beat)*beat) : s.start;
  return {...s,start:round(start),fadeIn:round(Math.min(Math.max(s.fadeIn,targetFade),maxFade)),fadeOut:round(Math.min(Math.max(s.fadeOut,targetFade),maxFade))};
 });
 return {...t,segments};
}
