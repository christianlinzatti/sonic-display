"use client";
import { useEffect, useMemo, useState } from "react";
import type { BeatEvent } from "@/types/audio";

interface BeatGridVisualizerProps {
  events: BeatEvent[];
  bpm: number | null;
  active: boolean;
}

const WINDOW_MS = 10_000;

export function BeatGridVisualizer({ events, bpm, active }: BeatGridVisualizerProps) {
  const [now, setNow] = useState(() => performance.now());

  useEffect(() => {
    if (!active) return;
    let frame = 0;
    const tick = () => {
      setNow(performance.now());
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [active]);

  const recent = useMemo(
    () => events.filter(event => now - event.at >= 0 && now - event.at <= WINDOW_MS),
    [events, now],
  );

  const interval = bpm && bpm > 0 ? 60_000 / bpm : null;
  const anchor = recent.at(-1)?.at ?? null;

  const gridLines = useMemo(() => {
    if (!interval || !anchor) return [];
    const lines: number[] = [];
    let t = anchor;
    while (t >= now - WINDOW_MS) {
      lines.push(t);
      t -= interval;
    }
    t = anchor + interval;
    while (t <= now) {
      lines.push(t);
      t += interval;
    }
    return lines;
  }, [anchor, interval, now]);

  const nearestErrorMs = useMemo(() => {
    if (!interval || recent.length < 2) return null;
    const errors = recent.slice(0, -1).map(event => {
      const previous = recent
        .filter(other => other.at < event.at)
        .at(-1);
      if (!previous) return null;
      const actual = event.at - previous.at;
      return Math.abs(actual - interval);
    }).filter((value): value is number => value !== null);
    if (!errors.length) return null;
    return Math.round(errors.reduce((sum, value) => sum + value, 0) / errors.length);
  }, [interval, recent]);

  return (
    <section className="beat-grid" aria-label="BPM and beat grid">
      <div className="beat-grid-heading">
        <strong>Beat grid</strong>
        <span>{bpm ? `${bpm} BPM` : "Waiting for BPM"}</span>
      </div>
      <div className="beat-grid-track">
        {gridLines.map((time, index) => {
          const age = now - time;
          const left = 100 - (age / WINDOW_MS) * 100;
          const major = Math.abs((time - (anchor ?? time)) / (interval || 1)) % 4 < 0.01;
          return <i key={`${time}-${index}`} className={major ? "major" : ""} style={{ left: `${left}%` }} />;
        })}
        {recent.map((event, index) => {
          const left = 100 - ((now - event.at) / WINDOW_MS) * 100;
          return <b key={`${event.at}-${index}`} title={`Detected beat ${event.strength.toFixed(2)}`} style={{ left: `${left}%`, opacity: 0.45 + event.strength * 0.55, height: `${12 + event.strength * 46}px` }} />;
        })}
      </div>
      <div className="beat-grid-axis"><span>10s ago</span><span>now</span></div>
      <div className="beat-grid-stats">
        <span>Detected: <b>{recent.length}</b></span>
        <span>Grid: <b>{interval ? `${Math.round(interval)} ms` : "—"}</b></span>
        <span>Avg. timing error: <b>{nearestErrorMs === null ? "—" : `${nearestErrorMs} ms`}</b></span>
      </div>
      <p className="settings-note">Green lines are detected beats; the grid is extrapolated from the current BPM estimate. Timing error is an approximate comparison, not a musical beat-tracking confidence score.</p>
    </section>
  );
}
