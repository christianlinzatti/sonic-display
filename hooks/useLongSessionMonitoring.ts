"use client";
import { useEffect } from "react";
import { getRenderMetricsSnapshot } from "@/components/visualizer/renderDiagnostics";
import { pauseSession, recordSessionSample, startSession } from "@/services/monitoring/longSessionMetrics";
/** Samples published WebGL diagnostics, never schedules an additional animation loop. */
export function useLongSessionMonitoring(playing: boolean) {
  useEffect(() => {
    if (!playing) { pauseSession(); return; }
    startSession();
    const sample = () => {
      if (document.visibilityState === "hidden") return;
      const now = Date.now();
      const render = getRenderMetricsSnapshot();
      const fresh = render.updatedAt > 0 && now - render.updatedAt < 10000;
      const memory = (performance as Performance & {memory?: {usedJSHeapSize?:number}}).memory;
      const heap = memory?.usedJSHeapSize;
      recordSessionSample({ at:now, fps:fresh ? render.fps : null, p95FrameMs:fresh ? (render.p95FrameMs ?? null) : null,
        slowPercent:fresh ? render.slowPercent : null, heapMiB:typeof heap === "number" ? heap/1048576 : null,
        drawCalls:fresh ? render.drawCalls : null, avatars:null });
    };
    const id = window.setInterval(sample, 5000);
    return () => {window.clearInterval(id); pauseSession();};
  }, [playing]);
}
