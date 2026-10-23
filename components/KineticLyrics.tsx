"use client";
import type { CSSProperties } from "react";
import { useMemo } from "react";
import { useAudioAnalysis } from "@/context/AudioAnalysisContext";
import { useUiPreferences } from "@/context/UiPreferencesContext";
import type { Lyrics } from "@/types/music";
import { planBeautifulLyricsV455 } from "@/components/visualizer/beautifulLyricsV455";
import { planCinematicLyricsV461 } from "@/components/visualizer/cinematicLyricsV461";
import { planBeautifulLyricsV477, lyricPlaybackFractionV477 } from "@/components/visualizer/beautifulLyricsV477";
import {resolveKineticStyleV382,resolveKineticWordV382,kineticDropCueV382} from "@/components/visualizer/kineticLyricsV382";

type Props = { lyrics: Lyrics | null; progressMs: number; activeIndex: number; playing: boolean; genre?: string; immersive?: boolean; avatarCountV477?: number };

/** Text animation driven by the existing playback clock; does not create timers or audio listeners. */
export function KineticLyrics({ lyrics, progressMs, activeIndex, playing, genre = "", immersive = false, avatarCountV477 = 1 }: Props) {
  const { preferences } = useUiPreferences();
  const { metrics, active: microphoneActive } = useAudioAnalysis();
  const style = preferences.lyricsStyle ?? "kinetic";
  const kineticStyleV382=resolveKineticStyleV382(preferences.lyricsKineticPresetV382??"auto",style,genre);
  const kineticStrengthV382=preferences.lyricsKineticStrengthV382??65;
  const kineticDropV382=kineticDropCueV382({attack:metrics.attack,bass:metrics.bass,volume:metrics.volume,
    playing,enabled:!!(preferences.lyricsKineticDropsV382??true)&&!!preferences.lyricsBeatReactive&&microphoneActive&&!preferences.reducedMotion});
  const kinetic = style === "kinetic";
  const cinematic = style === "cinematic";
  const neon = style === "neon";
  const reduced = preferences.reducedMotion;
  const intensity = reduced ? 0 : Math.max(0, Math.min(1, (preferences.lyricsAnimationIntensity ?? 65) / 100));
  const beat = (kinetic || cinematic || neon) && playing && preferences.lyricsBeatReactive && !reduced
    ? Math.max(0, Math.min(1, metrics.beatStrength || 0)) * intensity : 0;
  // A low-amplitude continuous envelope is preferable to a per-beat boolean toggle:
  // CSS transitions smooth updates, and the accent threshold prevents constant flashing.
  const reactive = (kinetic || cinematic || neon) && playing && preferences.lyricsBeatReactive && !reduced && microphoneActive;
  const reactiveAmount = reactive ? intensity * Math.max(0, Math.min(1, (preferences.lyricsReactiveIntensity ?? 60) / 100)) : 0;
  const kick = reactive && (preferences.lyricsKickReactive ?? true)
    ? Math.max(0, Math.min(1, metrics.kickAccentIntensity ?? metrics.kick ?? 0)) * reactiveAmount : 0;
  const bass = reactive && (preferences.lyricsBassReactive ?? true)
    ? Math.max(0, Math.min(1, metrics.bass ?? 0)) * reactiveAmount : 0;
  // Not a Spotify section classifier: a conservative high-energy transient heuristic.
  const drop = reactive && (preferences.lyricsDropReactive ?? true) && metrics.attack > .7 && metrics.bass > .56 && metrics.volume > .55
    ? Math.min(1, metrics.attack * metrics.bass) * reactiveAmount : 0;
  const lines = lyrics?.lines ?? [];
  const fontSize = Math.max(60, Math.min(180, preferences.lyricsFontSize ?? 100)) / 100;
  const fontFamilies: Record<string, string> = {
    system:'system-ui, -apple-system, "Segoe UI", sans-serif',
    bold:'"Arial Black", "Segoe UI", sans-serif',
    rounded:'"Trebuchet MS", "Arial Rounded MT Bold", sans-serif',
    serif:'Georgia, "Times New Roman", serif',
    mono:'ui-monospace, "Cascadia Code", Consolas, monospace'
  };
  const family = fontFamilies[preferences.lyricsFontFamilyV379 ?? "system"] ?? fontFamilies.system;
  const glow = Math.max(0, Math.min(100, preferences.lyricsGlow ?? 65)) / 100;
  const speed = Math.max(25, Math.min(200, preferences.lyricsAnimationSpeed ?? 100)) / 100;
  const colorOk = (value: string) => /^#[0-9a-fA-F]{6}$/.test(value);
  const gradientFrom = colorOk(preferences.lyricsGradientFrom ?? "") ? preferences.lyricsGradientFrom : "#79f7ff";
  const gradientTo = colorOk(preferences.lyricsGradientTo ?? "") ? preferences.lyricsGradientTo : "#d789ff";
  // Show only a moving window so the active line remains legible with long tracks.
  const focus = preferences.lyricsFocusMode ?? true;
  const activeForPlanV461 = lines[activeIndex];
  const activePlanV461 = activeForPlanV461 ? planCinematicLyricsV461({
    line: activeForPlanV461, nextLineStart: lines[activeIndex+1]?.startMs,
    synchronized: lyrics?.synced === true, playing, reducedMotion: reduced,
    layout: immersive ? "immersive" : "standard", userScale: fontSize,
  }) : null;
  const activePlanV477 = activeForPlanV461 ? planBeautifulLyricsV477({
    line: activeForPlanV461, nextLineStart: lines[activeIndex + 1]?.startMs,
    synchronized: lyrics?.synced === true, playing, reducedMotion: reduced,
    layout: immersive ? "immersive" : "standard", avatarCount: avatarCountV477, userScale: fontSize,
  }) : null;
  const windowSize = immersive && (activePlanV461?.visibleLineCount === 1 || activePlanV477?.visibleLineCount === 1) ? 1 : focus ? 3 : cinematic ? 3 : neon ? 3 : 5;
  const first = Math.max(0, Math.min(Math.max(0, lines.length - windowSize), activeIndex - (windowSize === 1 ? 0 : focus || cinematic || neon ? 1 : 2)));
  const visible = useMemo(() => lines.slice(first, first + windowSize), [lines, first, windowSize]);
  const synchronized = lyrics?.synced === true;
  const activeLine = activeIndex >= 0 ? lines[activeIndex] : null;
  const nextActiveStart = lines[activeIndex+1]?.startMs;
  const activeLineEnd = activeLine ? Math.min(
    activeLine.endMs != null && activeLine.endMs > activeLine.startMs ? activeLine.endMs : Infinity,
    nextActiveStart != null && nextActiveStart > activeLine.startMs ? nextActiveStart : Infinity,
    activeLine.startMs+12000
  ) : 0;
  const lineProgress = synchronized && activeLine && activeLineEnd>activeLine.startMs
    ? Math.max(0,Math.min(1,(progressMs-activeLine.startMs)/(activeLineEnd-activeLine.startMs))) : 0;
  const hasTrueWordTiming = activePlanV477?.timingMode === "verified-word";
  const wordsEnabled = (kinetic || cinematic || neon) && (preferences.lyricsWordHighlight ?? true) && synchronized;

  if (!lines.length) return <section className="lyrics"><p className="empty">Keine Lyrics für diesen Titel gefunden.</p></section>;
  return <section className={`lyrics v461-cinematic-lyrics v477-beautiful-lyrics ${immersive ? "v461-stage-lyrics" : ""} ${focus ? "lyrics-focus-v367" : ""} lyrics-studio-position-${preferences.lyricsPosition ?? "center"} ${kinetic ? "lyrics-kinetic" : cinematic ? "lyrics-cinematic" : neon ? "lyrics-neon" : "lyrics-classic"} ${kineticStyleV382?"v382-kinetic-active v382-preset-"+kineticStyleV382:""}`} aria-label="Songtext" style={{ "--studio-font-family": family, "--studio-font-scale": fontSize, "--studio-glow": glow, "--studio-speed": 1 / speed, "--studio-color-from": gradientFrom, "--studio-color-to": gradientTo, "--reactive-kick": kick, "--reactive-bass": bass, "--reactive-drop": drop } as CSSProperties}>
    <p className="lyrics-source">{lyrics?.provider}{synchronized ? " · zeilensynchronisiert" : " · ohne Zeitmarken"}{wordsEnabled ? hasTrueWordTiming ? " · echte Wort-Zeitstempel" : " · Zeilenfortschritt (keine Wort-Zeitstempel)" : ""}</p>
    {focus && <div className="lyrics-v367-eyebrow" aria-hidden="true"><span className="lyrics-v367-led"/> LIVE LYRICS <span className="lyrics-v367-divider"/> {synchronized ? hasTrueWordTiming ? "WORD SYNC" : "LINE SYNC" : "PLAIN TEXT"}</div>}
    <div className="lyrics-window" style={{ "--lyrics-intensity": intensity, "--lyrics-beat": beat } as CSSProperties}>
      {visible.map((line, index) => {
        const lineIndex = first + index;
        const active = lineIndex === activeIndex;
        const near = Math.abs(lineIndex - activeIndex) === 1;
        const nextStart = lines[lineIndex + 1]?.startMs;
        const lineEnd = line.endMs && line.endMs > line.startMs ? line.endMs : nextStart && nextStart > line.startMs ? nextStart : line.startMs + 3200;
        const duration = Math.max(500, lineEnd - line.startMs);
        const v455 = planBeautifulLyricsV455({line,nextLineStart:nextStart,synchronized,playing,reducedMotion:reduced,userScale:fontSize});
        const v461 = planCinematicLyricsV461({line,nextLineStart:nextStart,synchronized,playing,
          reducedMotion:reduced,layout:immersive?"immersive":"standard",userScale:fontSize});
        const ratio = synchronized ? lyricPlaybackFractionV477(progressMs, line.startMs, line.startMs + duration) : 0;
        const v477 = planBeautifulLyricsV477({line,nextLineStart:nextStart,synchronized,playing,
          reducedMotion:reduced,layout:immersive?"immersive":"standard",avatarCount:avatarCountV477,userScale:fontSize});
        const wordTimed = v477.timingMode === "verified-word";
        const words = wordTimed ? line.words!.map(word => word.text) : [];
        const elapsedWords = active && wordsEnabled ? ratio * words.length : 0;
        return <p key={`${line.startMs}-${lineIndex}`} className={`lyric v455-lyric-line v461-lyric-line v455-${v455.density} v461-${v461.density} v477-${v477.density} ${active ? "active" : near ? "near" : ""} ${lineIndex < activeIndex ? "past-v367" : "upcoming-v367"}`} style={{ "--v455-font-scale": v455.fontScale*v461.fontScale*v477.fontScale, "--v477-line-height":v477.lineHeight, "--v477-motion-scale":v477.motionScale, "--v477-backdrop-opacity":v477.backdropOpacity, "--v477-context-opacity":v477.focusOpacity, "--v477-line-progress":`${(ratio*100).toFixed(1)}%`, "--v455-motion-scale": v455.motionScale, "--v455-word-spacing": `${v455.wordSpacingEm}em`, "--v461-motion-scale":v461.motionScale, "--v461-stagger-ms":`${v477.entranceDelayMs}ms` } as CSSProperties} aria-current={active ? "true" : undefined}>
          {wordsEnabled && wordTimed ? words.map((word, wi) => {
            const timedWord = wordTimed ? line.words![wi] : null;
            const wordEnd = timedWord ? (timedWord.endMs && timedWord.endMs > timedWord.startMs
              ? timedWord.endMs : line.words![wi + 1]?.startMs ?? lineEnd) : 0;
            const amount = active ? (timedWord
              ? lyricPlaybackFractionV477(progressMs, timedWord.startMs, wordEnd)
              : Math.max(0, Math.min(1, elapsedWords - wi))) : lineIndex < activeIndex ? 1 : 0;
            const wordLabel = wordTimed && wi < words.length-1 && !/\s$/.test(word) &&
              !/^[,.;:!?…)]/.test(words[wi+1].trimStart()) && !/[([{]$/.test(word)
              ? word + " " : word;
            const cueV382=kineticStyleV382&&active
              ? resolveKineticWordV382({line,nextLineStart:nextStart,index:wi,progressMs,synced:synchronized,playing,reducedMotion:reduced,
                preset:kineticStyleV382,strength:kineticStrengthV382,drop:kineticDropV382}) : null;
            const shownAmountV382=cueV382?cueV382.fill:amount;
            return <span key={wi} className={`kinetic-word ${active ? "kinetic-word-active" : ""} ${active && amount > 0 && amount < 1 ? "v367-speaking" : ""}`} style={{ "--word-fill": `${(shownAmountV382 * 100).toFixed(1)}%`, "--word-order": wi,
              "--v382-word-scale":1+((cueV382?.scale??1)-1)*v455.motionScale*v461.motionScale,"--v382-word-lift":`${-(cueV382?.lift??0)*v455.motionScale*v461.motionScale}px`,
              "--v382-word-glow":(cueV382?.glow??0)*v455.motionScale*v461.motionScale } as CSSProperties}>{wordLabel}</span>;
          }) : <span className={wordsEnabled && v477.timingMode === "line-progress" ? "kinetic-whole-line v477-line-progress-text" : "kinetic-whole-line"}>{line.text || "♪"}</span>}
        </p>;
      })}
    </div>
    {focus && synchronized && activeLine && <div className="lyrics-v368-progress" role="progressbar" aria-label="Fortschritt der aktuellen Songtextzeile" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(lineProgress*100)}>
      <span style={{width:`${(lineProgress*100).toFixed(1)}%`}} />
    </div>}
  </section>;
}
