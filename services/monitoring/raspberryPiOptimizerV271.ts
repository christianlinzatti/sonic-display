import type {BenchmarkResult,BenchmarkMode} from './adaptivePerformanceBenchmarkV270';
export type PiRecommendation=Readonly<{mode:BenchmarkMode;fps:number;p95FrameMs:number;activeAvatars:number;reason:string;confidence:'measured'|'limited'}>;
// Browser hardware detection is best-effort. The manual Raspberry Pi toggle remains authoritative.
export function looksLikeRaspberryPi(userAgent:string,platform:string):boolean{
 const value=`${userAgent} ${platform}`.toLowerCase();
 return /raspberry|raspbian/.test(value)||(/linux/.test(value)&&/aarch64|armv7l|armv8|armhf/.test(value));
}
export function recommendPiMode(results:readonly BenchmarkResult[]):PiRecommendation|null{
 const reliable=results.filter(r=>r.count>=6&&r.fps!==null&&Number.isFinite(r.fps)&&r.fps>0&&r.p95FrameMs!==null&&Number.isFinite(r.p95FrameMs)&&r.p95FrameMs>0);
 if(!reliable.length)return null;
 const counts=new Set(reliable.map(r=>r.activeAvatars));
 if(counts.size!==1)return null;
 const preferred:[BenchmarkMode,...BenchmarkMode[]]=['high','balanced','low'];
 // Prefer visual quality if smoothness meets the conservative baseline. No synthetic measurements.
 const smooth=(r:BenchmarkResult)=>r.fps!>=45&&r.p95FrameMs!<=30&&(r.slowPercent===null||r.slowPercent<=12);
 const candidate=preferred.map(m=>reliable.find(r=>r.mode===m&&smooth(r))).find(Boolean)
   ??[...reliable].sort((a,b)=>b.fps!-a.fps!||a.p95FrameMs!-b.p95FrameMs!)[0];
 const confidence=reliable.length>=2?'measured':'limited';
 return {mode:candidate.mode,fps:candidate.fps!,p95FrameMs:candidate.p95FrameMs!,activeAvatars:candidate.activeAvatars,confidence,
  reason:smooth(candidate)?'Höchste getestete Grafikqualität mit mindestens 45 FPS, P95 ≤ 30 ms und höchstens 12 % langsamen Frames (falls gemessen).':'Keine Messung erfüllt alle Flüssigkeitsziele; schnellste gültige Messung wird vorgeschlagen.'};
}
