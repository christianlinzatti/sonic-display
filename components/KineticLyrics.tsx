"use client";
import type { CSSProperties } from "react";
import {planConcertLyricsHarmonyV606,lyricHarmonyWordAccentV606} from "./visualizer/concertLyricsPerformerHarmonyV606";
import type {NarrativeCueV604} from "./visualizer/fullSongConcertDramaturgyV604";
import {planLyricReadabilityV578} from "./visualizer/beautifulLyricsV578";
import { planBeautifulLyricsExperienceV598, planBeautifulLyricsWordV598, type BeautifulLyricsSectionV598 } from "./visualizer/beautifulLyricsExperienceV598";
import {planConcertDetailsV555,splitRhymeEndV555} from './visualizer/concertDetailEffectsV555';
import { useMemo } from "react";
import { useAudioAnalysis } from "@/context/AudioAnalysisContext";
import { useUiPreferences } from "@/context/UiPreferencesContext";
import type { Lyrics } from "@/types/music";
import { planBeautifulLyricsV455 } from "@/components/visualizer/beautifulLyricsV455";
import { planCinematicLyricsExperienceV501, lyricWordAccentV501 } from "@/components/visualizer/cinematicLyricsExperienceV501";
import { planCinematicLyricsExperienceV525 } from "@/components/visualizer/cinematicLyricsExperienceV525";
import { planCinematicLyricsV541, planCinematicWordV541 } from "@/components/visualizer/cinematicLyricsExperienceV541";
import { planCinematicLyricsV549, planCinematicWordV549 } from "@/components/visualizer/cinematicLyricsExperienceV549";
import {concertLyricDirectionV528,type ConcertSceneV528} from "@/components/visualizer/cinematicConcertCoordinationV528";
import {coordinateConcertLyricsV526} from "@/components/visualizer/unifiedConcertPerformanceV526";
import { planCinematicLyricsV461 } from "@/components/visualizer/cinematicLyricsV461";
import { planBeautifulLyricsV477, lyricPlaybackFractionV477 } from "@/components/visualizer/beautifulLyricsV477";
import {resolveKineticStyleV382,resolveKineticWordV382,kineticDropCueV382} from "@/components/visualizer/kineticLyricsV382";

type Props = { lyrics: Lyrics | null; progressMs: number; activeIndex: number; playing: boolean; genre?: string; immersive?: boolean; avatarCountV477?: number; concertLyricAccentV502?: number; cinematicSceneV528?: ConcertSceneV528; sectionCueV598?: BeautifulLyricsSectionV598; fullSongCueV604?: NarrativeCueV604 };

/** Text animation driven by the existing playback clock; does not create timers or audio listeners. */
export function KineticLyrics({ lyrics, progressMs, activeIndex, playing, genre = "", immersive = false, avatarCountV477 = 1, concertLyricAccentV502 = 0, cinematicSceneV528, sectionCueV598, fullSongCueV604 }: Props) {
  const { preferences } = useUiPreferences();
  const lyricsDirectionV528=concertLyricDirectionV528(cinematicSceneV528,playing,preferences.reducedMotion);
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
  const activePlanV501 = activeForPlanV461 ? planCinematicLyricsExperienceV501({
    line: activeForPlanV461, nextLineStart:lines[activeIndex+1]?.startMs, progressMs,
    synchronized:lyrics?.synced === true, playing, reducedMotion:reduced,
    layout:immersive ? "immersive" : "standard", avatarCount:avatarCountV477, userScale:fontSize,
  }) : null;
  const activePlanV525 = activeForPlanV461 && activePlanV501 ? planCinematicLyricsExperienceV525({
    line:activeForPlanV461,nextLineStart:lines[activeIndex+1]?.startMs,base:activePlanV501,
    synchronized:lyrics?.synced === true,playing,reducedMotion:reduced,
    layout:immersive?"immersive":"standard",avatarCount:avatarCountV477,genre,
  }) : null;
  const windowSize = immersive && (activePlanV461?.visibleLineCount === 1 || activePlanV477?.visibleLineCount === 1) ? 1 : focus ? 3 : cinematic ? 3 : neon ? 3 : 5;
  const first = Math.max(0, Math.min(Math.max(0, lines.length - windowSize), activeIndex - (windowSize === 1 ? 0 : focus || cinematic || neon ? 1 : 2)));
  const visible = useMemo(() => lines.slice(first, first + windowSize), [lines, first, windowSize]);
  const synchronized = lyrics?.synced === true;
  const activeLine = activeIndex >= 0 ? lines[activeIndex] : null;
  const readabilityV578=planLyricReadabilityV578({line:activeLine,immersive,reducedMotion:reduced,playing,avatarCount:avatarCountV477});
  const activePlanV598=planBeautifulLyricsExperienceV598({
    line:activeLine,nextLineStart:lines[activeIndex+1]?.startMs,progressMs,
    synchronized,playing,reducedMotion:reduced,immersive,avatarCount:avatarCountV477,
    sectionCue:sectionCueV598,intensity,
  });
  const harmonyV606=planConcertLyricsHarmonyV606({line:activeLine,
    nextLineStart:lines[activeIndex+1]?.startMs,progressMs,playing,synchronized,
    reducedMotion:reduced,immersive,cast:avatarCountV477,trackId:cinematicSceneV528?.trackId,
    scene:cinematicSceneV528,cue:fullSongCueV604,
    hookSection:sectionCueV598==='hook',wordHighlight:preferences.lyricsWordHighlight??true});
  const nextActiveStart = lines[activeIndex+1]?.startMs;
  const activeLineEnd = activeLine ? Math.min(
    activeLine.endMs != null && activeLine.endMs > activeLine.startMs ? activeLine.endMs : Infinity,
    nextActiveStart != null && nextActiveStart > activeLine.startMs ? nextActiveStart : Infinity,
    activeLine.startMs+12000
  ) : 0;
  const lineProgress = synchronized && activeLine && activeLineEnd>activeLine.startMs
    ? Math.max(0,Math.min(1,(progressMs-activeLine.startMs)/(activeLineEnd-activeLine.startMs))) : 0;
  const hasTrueWordTiming = activePlanV477?.timingMode === "verified-word";
  const activePlanV541 = activeForPlanV461 ? planCinematicLyricsV541({line:activeForPlanV461,
    nextLineStart:lines[activeIndex+1]?.startMs,synchronized,playing,reducedMotion:reduced,
    layout:immersive?"immersive":"standard",avatarCount:avatarCountV477,tier:"high"}) : null;
  const activePlanV549 = activeForPlanV461 && activePlanV541 ? planCinematicLyricsV549({
    base:activePlanV541,line:activeForPlanV461,progressMs,playing,reducedMotion:reduced,
    avatarCount:avatarCountV477,tier:"high",scene:cinematicSceneV528}) : null;
  const detailV555=planConcertDetailsV555({lyrics,activeIndex,progressMs,playing,reducedMotion:reduced,
    scene:cinematicSceneV528,settings:{enabled:preferences.concertDetailEnabledV555??true,
      adlibEcho:preferences.concertAdlibEchoV555??true,rhymeAccent:preferences.concertRhymeAccentV555??true,
      strength:preferences.concertDetailStrengthV555??45}});
  const wordsEnabled = (kinetic || cinematic || neon) && (preferences.lyricsWordHighlight ?? true) && synchronized;

  if (!lines.length) return <section className="lyrics"><p className="empty">Keine Lyrics für diesen Titel gefunden.</p></section>;
  return <section className={`lyrics v461-cinematic-lyrics v477-beautiful-lyrics v501-cinematic-lyrics v502-concert-lyrics v525-cinematic-lyrics v525-${activePlanV525?.textClass??"standard"} v541-cinematic-lyrics v549-cinematic-lyrics v578-lyrics-readable v578-${readabilityV578.mode} v598-beautiful-lyrics v598-${activePlanV598.mode} v598-${activePlanV598.density} v606-harmony v606-${harmonyV606.mode} v501-cast-${activePlanV501?.cast??1} ${immersive ? "v461-stage-lyrics" : ""} ${focus ? "lyrics-focus-v367" : ""} lyrics-studio-position-${preferences.lyricsPosition ?? "center"} ${kinetic ? "lyrics-kinetic" : cinematic ? "lyrics-cinematic" : neon ? "lyrics-neon" : "lyrics-classic"} ${kineticStyleV382?"v382-kinetic-active v382-preset-"+kineticStyleV382:""}`} aria-label="Songtext" style={{ "--v606-width-ch":Math.min(activePlanV598.widthCh,harmonyV606.widthCh),"--v606-plate-boost":harmonyV606.plateBoost,"--v606-hook-accent":harmonyV606.hookAccent,"--v598-width-ch":activePlanV598.widthCh,"--v598-plate":activePlanV598.plateOpacity,
    "--v598-line-height":activePlanV598.lineHeight,"--v598-contrast":activePlanV598.contrast,
    "--v598-hook-accent":activePlanV598.hookAccent,"--v578-width-ch": readabilityV578.maxWidthCh, "--v578-plate": readabilityV578.plateOpacity, "--v578-glow-gain": readabilityV578.glowGain, "--studio-font-family": family, "--studio-font-scale": fontSize, "--studio-glow": glow, "--v502-concert-accent": !reduced && playing ? Math.max(0,Math.min(.12,concertLyricAccentV502)) : 0, "--studio-speed": 1 / speed, "--studio-color-from": gradientFrom, "--studio-color-to": gradientTo, "--reactive-kick": kick, "--reactive-bass": bass, "--reactive-drop": drop } as CSSProperties}>
    <p className="lyrics-source">{lyrics?.provider}{synchronized ? " · zeilensynchronisiert" : " · ohne Zeitmarken"}{wordsEnabled ? hasTrueWordTiming ? " · echte Wort-Zeitstempel" : " · Zeilenfortschritt (keine Wort-Zeitstempel)" : ""}</p>
    {activePlanV549?.singerLabel && <div className="v549-vocal-caption" aria-label="Manuell bestätigte Sängerzuordnung">
      {activePlanV549.singerCue === "handoff" ? "Vocal-Wechsel · " : "Vocal-Regie · "}{activePlanV549.singerLabel}
    </div>}
    {focus && <div className="lyrics-v367-eyebrow" aria-hidden="true"><span className="lyrics-v367-led"/> LIVE LYRICS <span className="lyrics-v367-divider"/> {synchronized ? hasTrueWordTiming ? "WORD SYNC" : "LINE SYNC" : "PLAIN TEXT"}</div>}
    {detailV555.adlib&&detailV555.adlibOpacity>0&&<div className="v555-adlib-echo" aria-hidden="true"
      style={{opacity:detailV555.adlibOpacity}}><span>{detailV555.adlib}</span><span>{detailV555.adlib}</span></div>}
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
        const rhymeEndV555=active&&detailV555.rhymeColor
          ?splitRhymeEndV555(line.text,detailV555.rhymeWord):null;
        const ratio = synchronized ? lyricPlaybackFractionV477(progressMs, line.startMs, line.startMs + duration) : 0;
        const v477 = planBeautifulLyricsV477({line,nextLineStart:nextStart,synchronized,playing,
          reducedMotion:reduced,layout:immersive?"immersive":"standard",avatarCount:avatarCountV477,userScale:fontSize});
        const v501 = planCinematicLyricsExperienceV501({line,nextLineStart:nextStart,progressMs,
          synchronized,playing,reducedMotion:reduced,layout:immersive?"immersive":"standard",
          avatarCount:avatarCountV477,userScale:fontSize});
        const v525 = planCinematicLyricsExperienceV525({line,nextLineStart:nextStart,base:v501,
          synchronized,playing,reducedMotion:reduced,layout:immersive?"immersive":"standard",
          avatarCount:avatarCountV477,genre});
        const v541=planCinematicLyricsV541({line,nextLineStart:nextStart,synchronized,playing,
          reducedMotion:reduced,layout:immersive?"immersive":"standard",avatarCount:avatarCountV477,tier:"high"});
        const v549=planCinematicLyricsV549({base:v541,line,progressMs,playing,
          reducedMotion:reduced,avatarCount:avatarCountV477,tier:"high",
          scene:active?cinematicSceneV528:undefined});
        const v526=coordinateConcertLyricsV526(v525,{
          lyrics,effectiveTimeMs:progressMs,genre,playing,reducedMotion:reduced,active,
        });
        const v598=active ? activePlanV598 : planBeautifulLyricsExperienceV598({
          line,nextLineStart:nextStart,progressMs,synchronized,playing,reducedMotion:reduced,
          immersive,avatarCount:avatarCountV477,intensity,sectionCue:'unknown',
        });
        const wordTimed = v477.timingMode === "verified-word";
        const words = wordTimed ? line.words!.map(word => word.text) : [];
        const elapsedWords = active && wordsEnabled ? ratio * words.length : 0;
        return <p key={`${line.startMs}-${lineIndex}`} className={`lyric v455-lyric-line v461-lyric-line v455-${v455.density} v461-${v461.density} v477-${v477.density} v501-${v501.density} ${active ? "v501-active-line v525-active-line v541-active-line v549-active-line" : ""} v541-${v541.density} v549-${v549.singerCue} ${active ? "v598-active-line v606-active-line" : ""} ${active ? "active" : near ? "near" : ""} ${lineIndex < activeIndex ? "past-v367" : "upcoming-v367"}`} style={{ "--v455-font-scale": v455.fontScale*v461.fontScale*v477.fontScale*v501.fontScale*v525.readingBoost*v541.readingScale*v549.readingScale*(active?lyricsDirectionV528.readingBoost:1), "--v477-line-height":v477.lineHeight, "--v477-motion-scale":v477.motionScale, "--v477-backdrop-opacity":v477.backdropOpacity, "--v477-context-opacity":v477.focusOpacity, "--v477-line-progress":`${(ratio*100).toFixed(1)}%`, "--v501-reveal":active?v501.reveal:1,
          "--v501-glow":active?v501.glow:0,
          "--v501-offset":active?`${v501.lineOffsetPx.toFixed(2)}px`:"0px",
          "--v501-plate":Math.min(1,v525.plateOpacity+lyricsDirectionV528.plateBoost),
          "--v501-word-motion":v501.wordMotion*v526.wordMotionGain*lyricsDirectionV528.motionGain*v549.wordMotionGain*(active?harmonyV606.motionGain:1),
          "--v541-contrast":v541.lineContrast,"--v541-plate":Math.max(v525.plateOpacity,v549.plateOpacity),
          "--v549-handoff":v549.handoffEmphasis,"--v549-glow":v549.wordGlowGain,
          "--v455-motion-scale": v455.motionScale, "--v455-word-spacing": `${v455.wordSpacingEm}em`, "--v461-motion-scale":v461.motionScale, "--v461-stagger-ms":`${v477.entranceDelayMs}ms` } as CSSProperties} aria-current={active ? "true" : undefined}>
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
            const wordAccentV501 = active && timedWord ? lyricWordAccentV501({
              progressMs,startMs:timedWord.startMs,endMs:wordEnd,verifiedWordTiming:wordTimed,
              playing,reducedMotion:reduced,
            }) * v501.wordMotion*v526.wordMotionGain*lyricsDirectionV528.motionGain : 0;
            const wordV541=active ? planCinematicWordV541({line,nextLineStart:nextStart,wordIndex:wi,
              progressMs,playing,reducedMotion:reduced,plan:v541}) : null;
            const wordV549=active ? planCinematicWordV549({line,nextLineStart:nextStart,wordIndex:wi,
              progressMs,playing,reducedMotion:reduced,base:v541,visual:v549}) : null;
            const wordV598=active && wordTimed ? planBeautifulLyricsWordV598({
              line,nextLineStart:nextStart,wordIndex:wi,progressMs,playing,reducedMotion:reduced,plan:v598,
            }) : null;
            const shownAmountV382=wordV549?.fill??wordV541?.fill??(cueV382?cueV382.fill:amount);
            const rhymeV555=active&&detailV555.rhymeColor&&
              word.trim().replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu,'').toLocaleLowerCase('de')===detailV555.rhymeWord;
            return <span key={wi} className={`kinetic-word ${rhymeV555 ? "v555-rhyme" : ""} ${active ? "kinetic-word-active" : ""} ${active && amount > 0 && amount < 1 ? "v367-speaking" : ""}`} style={{ ...(rhymeV555 ? {"--v555-rhyme-color":detailV555.rhymeColor} : {}), "--v501-word-accent":wordAccentV501,"--v541-word-focus":wordV541?.focus??0,
              "--v541-word-glow":wordV549?.glow??wordV541?.glow??0,
              "--v549-word-motion":wordV549?.motion??0,"--v598-word-accent":wordV598?.accent??0,"--v606-word-accent":active?lyricHarmonyWordAccentV606(line,wi,progressMs,harmonyV606):0,"--word-fill": `${(shownAmountV382 * 100).toFixed(1)}%`, "--word-order": wi,
              "--v382-word-scale":1+((cueV382?.scale??1)-1)*v455.motionScale*v461.motionScale*v526.wordMotionGain*lyricsDirectionV528.motionGain*v549.wordMotionGain,"--v382-word-lift":`${-(cueV382?.lift??0)*v455.motionScale*v461.motionScale*v526.wordMotionGain*lyricsDirectionV528.motionGain*v541.wordMotionGain}px`,
              "--v382-word-glow":(cueV382?.glow??0)*v455.motionScale*v461.motionScale*v526.wordMotionGain*lyricsDirectionV528.motionGain*v541.wordMotionGain } as CSSProperties}>{wordLabel}</span>;
          }) : <span className={wordsEnabled && v477.timingMode === "line-progress" ? "kinetic-whole-line v477-line-progress-text" : "kinetic-whole-line"}>
            {rhymeEndV555 ? <>{rhymeEndV555.before}<span className="v555-rhyme"
              style={{"--v555-rhyme-color":detailV555.rhymeColor} as CSSProperties}>{rhymeEndV555.match}</span>{rhymeEndV555.after}</>
              : line.text || "♪"}
          </span>}
        </p>;
      })}
    </div>
    {focus && synchronized && activeLine && <div className="lyrics-v368-progress" role="progressbar" aria-label="Fortschritt der aktuellen Songtextzeile" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(lineProgress*100)}>
      <span style={{width:`${(lineProgress*100).toFixed(1)}%`}} />
    </div>}
  </section>;
}
