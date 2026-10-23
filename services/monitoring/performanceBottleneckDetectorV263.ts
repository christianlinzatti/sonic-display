import type {AnalysisSample} from "./performanceSessionAnalyzerV262";

/** Diagnostic hypotheses, not hardware utilization measurements. Require multiple observations. */
export type BottleneckKind = "avatar-cpu" | "render-pressure" | "memory-growth" | "unclassified";
export type BottleneckFinding = Readonly<{kind:BottleneckKind; confidence:"moderate"|"low"; title:string; evidence:string; recommendation:string}>;
const finite=(n:number|null):n is number=>n!==null&&Number.isFinite(n);
const avg=(a:readonly number[])=>a.reduce((x,y)=>x+y,0)/a.length;
const values=(series:readonly AnalysisSample[], field:keyof AnalysisSample)=>series.map(s=>s[field]).filter((n):n is number=>typeof n==="number" && Number.isFinite(n));
export function detectBottlenecks(samples:readonly AnalysisSample[]):BottleneckFinding[]{
 const recent=samples.slice(-12);
 if(recent.length<6)return [];
 const fps=values(recent,"fps"), frames=values(recent,"p95FrameMs");
 if(fps.length<6 || frames.length<6)return [];
 const slow=avg(fps)<40 || avg(frames)>32;
 const cpu=values(recent,"avatarCallbackMeanMs");
 const calls=values(recent,"drawCalls");
 const result:BottleneckFinding[]=[];
 if(slow && cpu.length>=6 && avg(cpu)>=7){
  result.push({kind:"avatar-cpu",confidence:"moderate",title:"Möglicher Avatar-CPU-Engpass",evidence:`Avatar-Callbacks Ø ${avg(cpu).toFixed(2)} ms bei ${avg(fps).toFixed(1)} FPS.`,recommendation:"Multi-Avatar Director aktivieren, Animationen vergleichen und die Zahl gleichzeitig animierter Charaktere testen."});
 }
 if(slow && calls.length>=6 && avg(calls)>=150){
  result.push({kind:"render-pressure",confidence:"moderate",title:"Möglicher Rendering-Engpass",evidence:`Draw Calls Ø ${Math.round(avg(calls))}, Frame-P95 Ø ${avg(frames).toFixed(1)} ms.`,recommendation:"Rendering-Benchmark für High/Balanced/Low ausführen, DPR oder Effekte reduzieren und LOD prüfen."});
 }
 // Browser heap is optional. Only infer sustained growth over >= 60 seconds;
 // a rising JS heap alone does not prove a leak or total device memory pressure.
 const heap=samples.slice(-24).filter(s=>finite(s.heapMiB));
 if(heap.length>=6 && heap[heap.length-1].at-heap[0].at>=60000){
  const first=heap.slice(0,3).map(s=>s.heapMiB as number);
  const last=heap.slice(-3).map(s=>s.heapMiB as number);
  const growth=avg(last)-avg(first);
  const rises=heap.slice(1).filter((s,i)=>(s.heapMiB as number)>(heap[i].heapMiB as number)).length;
  if(growth>=40 && rises>=Math.ceil((heap.length-1)*0.65))result.push({kind:"memory-growth",confidence:"low",title:"Anhaltendes JavaScript-Heap-Wachstum",evidence:`Heap +${growth.toFixed(1)} MiB (erste/letzte drei Messwerte).`,recommendation:"Session länger beobachten, Asset-Wechsel und Cache prüfen; Heap-Wachstum allein belegt kein Speicherleck."});
 }
 if(slow && result.length===0)result.push({kind:"unclassified",confidence:"low",title:"Engpass nicht eindeutig zuordenbar",evidence:`FPS Ø ${avg(fps).toFixed(1)}, Frame-P95 Ø ${avg(frames).toFixed(1)} ms.`,recommendation:"Bei identischer Szene Qualitätseinstellungen vergleichen; Browser-, Geräte- und thermische Last prüfen."});
 return result;
}
