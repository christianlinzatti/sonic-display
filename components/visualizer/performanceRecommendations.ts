/** V222: read-only recommendations from observed metrics, without causal attribution. */
export type PerformanceObservation = {fps:number;slowPercent:number;frameMs:number};
export function summarizePerformance(samples:readonly PerformanceObservation[]) {
  if (!samples.length) return null;
  const mean=(key:keyof PerformanceObservation)=>samples.reduce((sum,value)=>sum+value[key],0)/samples.length;
  return {count:samples.length,avgFps:mean("fps"),avgSlowPercent:mean("slowPercent"),avgFrameMs:mean("frameMs"),minFps:Math.min(...samples.map(s=>s.fps)),maxFps:Math.max(...samples.map(s=>s.fps))};
}
export function recommendPerformance(samples:readonly PerformanceObservation[]):string[] {
  const summary=summarizePerformance(samples);
  if (!summary || samples.length<5) return ["Mindestens fünf aktive Messintervalle sammeln, bevor Empfehlungen angezeigt werden."];
  const suggestions:string[]=[];
  if(summary.avgFps<30 || summary.avgSlowPercent>25) suggestions.push("Hohe Frame-Last: zuerst Auflösung/DPR und Bühneneffekte reduzieren; danach mit gleicher Szene erneut vergleichen.");
  else if(summary.avgFps<50 || summary.avgSlowPercent>10) suggestions.push("Schwankende Bildrate: Grafikprofil Balanced testen und im gleichen Songabschnitt vergleichen.");
  if (summary.maxFps-summary.minFps>25) suggestions.push("Starke FPS-Schwankung: Anzahl sichtbarer Avatare und Beleuchtung getrennt testen, um den Engpass einzugrenzen.");
  if(!suggestions.length) suggestions.push("Bildrate derzeit unauffällig. Bei Änderungen immer dieselbe Szene als Vergleich verwenden.");
  return suggestions;
}
