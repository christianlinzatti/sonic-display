"use client";
import { useState } from "react";
import { KineticLyrics } from "@/components/KineticLyrics";
import type { Lyrics } from "@/types/music";

const demo: Lyrics = { provider: "lrclib", synced: true, plainText: null, lines: [
  { startMs: 0, endMs: 2400, text: "Feel the music tonight" },
  { startMs: 2400, endMs: 5200, text: "We are dancing in the light" },
  { startMs: 5200, endMs: 8100, text: "Every beat is coming alive" },
  { startMs: 8100, endMs: 10800, text: "Let the rhythm take control" },
  { startMs: 10800, endMs: 13500, text: "This is our moment to shine" },
] };
export function LyricsStudioPreview() {
  const [position, setPosition] = useState(3900);
  const activeIndex = demo.lines.reduce((found, line, index) => position >= line.startMs ? index : found, -1);
  return <div className="lyrics-studio-preview" aria-label="Live-Vorschau der Lyrics">
    <KineticLyrics lyrics={demo} progressMs={position} activeIndex={activeIndex} playing={true} />
    <label>Vorschau-Zeitpunkt<input type="range" min="0" max="13400" step="100" value={position} onChange={event => setPosition(Number(event.target.value))}/></label>
  </div>;
}
