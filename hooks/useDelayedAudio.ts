"use client";
import { useEffect, useRef, useState } from "react";
import type { AudioFeatures } from "@/types/audio";
/** Positive delay holds back live microphone motion to compensate for external display/audio latency.
 * Negative offset cannot predict future microphone audio, so it is not applied to live signals.
 */
export function useDelayedAudio(metrics: AudioFeatures, enabled: boolean, delayMs: number) {
  const history = useRef<{ at: number; metrics: AudioFeatures }[]>([]);
  const [output, setOutput] = useState(metrics);
  useEffect(() => {
    if (!enabled || delayMs <= 0) { history.current = []; setOutput(metrics); return; }
    const now = performance.now();
    history.current.push({ at: now, metrics });
    history.current = history.current.filter(item => now - item.at < 1000);
    const candidate = [...history.current].reverse().find(item => item.at <= now - delayMs);
    if (candidate) setOutput(candidate.metrics);
  }, [metrics, enabled, delayMs]);
  return enabled && delayMs > 0 ? output : metrics;
}
