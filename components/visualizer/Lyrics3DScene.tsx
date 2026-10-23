"use client";
import type {SmartStageCueV351} from "@/services/stageContent/smartStageCompositionV351";
import { Text } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { memo, useMemo, useRef } from "react";
import { useAdaptivePerformance } from "./adaptivePerformance";
import type { Group } from "three";
import { planCinematicLyricsV461 } from "./cinematicLyricsV461";
import { planBeautifulLyricsV477, lyricPlaybackFractionV477 } from "./beautifulLyricsV477";
import { normalizeSpatialLayoutV381 } from "./lyricsSpatialEditorV381";
import {resolveKineticStyleV382,resolveKineticWordV382,kineticDropCueV382,blendKineticColorV382} from "./kineticLyricsV382";
import type { AudioFeatures } from "@/types/audio";
import type { VisualizerProps } from "./registry";

type Scene = NonNullable<VisualizerProps["lyricsScene"]>;
const clamp = (v: number, min = 0, max = 1) => Math.max(min, Math.min(max, v));
const safeColor = (v: string, fallback: string) => /^#[0-9a-fA-F]{6}$/.test(v) ? v : fallback;

/** Lay out separate 3D words without relying on DOM layout. Widths are approximate;
 * each row is centered independently and never exceeds the target maximum width. */
function layoutWords(tokens: string[], fontSize: number, maxWidth = 1.95) {
  const rows: { text: string; x: number; y: number }[][] = [[]];
  let width = 0;
  for (const token of tokens) {
    const word = token.trim();
    if (!word) continue;
    const estimatedWidth = Math.max(fontSize * .36, [...word].length * fontSize * .53);
    const gap = fontSize * .33;
    if (rows[rows.length - 1].length && width + gap + estimatedWidth > maxWidth) {
      rows.push([]);
      width = 0;
    }
    const row = rows[rows.length - 1];
    row.push({ text: word, x: width + (row.length ? gap : 0) + estimatedWidth / 2, y: 0 });
    width += (row.length > 1 ? gap : 0) + estimatedWidth;
  }
  return rows.flatMap((row, rowIndex) => {
    const rightEdge = row.length ? row[row.length - 1].x + Math.max(fontSize * .36, [...row[row.length - 1].text].length * fontSize * .53) / 2 : 0;
    return row.map(item => ({ ...item, x: item.x - rightEdge / 2, y: ((rows.length - 1) / 2 - rowIndex) * fontSize * 1.34 }));
  });
}

/** Reuse Troika text components when other parts of the scene update. */
const WordText = memo(function WordText({ text, size, color, opacity, outline, outlineColor, maxWidth }: {
  text: string; size: number; color: string; opacity: number; outline: number; outlineColor: string; maxWidth?: number;
}) {
  return <Text fontSize={size} maxWidth={maxWidth} anchorX="center" anchorY="middle" color={color}
    fillOpacity={opacity} outlineWidth={outline} outlineColor={outlineColor}
    renderOrder={10} material-depthTest={false}>{text}</Text>;
});

/** Real GPU text meshes sharing the avatar scene. Quality follows existing adaptive controller. */
export function Lyrics3DScene({ scene, audio, reducedMotion, composition }: { scene: Scene; audio: AudioFeatures; reducedMotion: boolean; composition?:SmartStageCueV351 }) {
  const root = useRef<Group>(null);
  const { tier } = useAdaptivePerformance();
  const lines = scene.lyrics.lines;
  const index = Math.max(0, scene.activeIndex);
  const activeCaptionV461 = lines[index] ? planCinematicLyricsV461({
    line:lines[index],nextLineStart:lines[index+1]?.startMs,
    synchronized:scene.lyrics.synced,playing:scene.playing,reducedMotion,
    layout:"stage-3d",userScale:scene.fontScale/100,
  }) : null;
  const activeCaptionV477 = lines[index] ? planBeautifulLyricsV477({
    line: lines[index], nextLineStart:lines[index+1]?.startMs,
    synchronized:scene.lyrics.synced,playing:scene.playing,reducedMotion,
    layout:"stage-3d",avatarCount:scene.avatarCountV477??1,userScale:scene.fontScale/100,
  }) : null;
  const visible = useMemo(() => (tier === "low" || activeCaptionV477?.visibleLineCount === 1 || activeCaptionV461?.visibleLineCount === 1
    ? [index] : [index - 1, index, index + 1])
    .filter(i => i >= 0 && i < lines.length), [index, lines.length, tier, activeCaptionV461?.visibleLineCount, activeCaptionV477?.visibleLineCount]);
  const from = safeColor(scene.colorFrom, "#79f7ff");
  const to = safeColor(scene.colorTo, "#d789ff");
  const right = scene.side === "right";
  const depth = clamp(scene.depth / 100);
  const intensity = clamp(scene.intensity / 100);
  const cinemaV378=scene.cinematicModeV378!==undefined && scene.cinematicModeV378!=="off";
  const plateStrengthV378=cinemaV378&&scene.cinematicContrastV378!==false?clamp((scene.cinematicStrengthV378??70)/100):0;
  const kineticStyleV382=resolveKineticStyleV382(scene.kineticPresetV382??"auto", "kinetic",scene.genreV382??"");
  const dropV382=kineticDropCueV382({attack:audio.attack,bass:audio.bass,volume:audio.volume,
    playing:scene.playing,enabled:!!(scene.kineticDropsV382??true)&&!reducedMotion});
  const baseSize = .135 * clamp(scene.fontScale / 100, .6, 1.8);
  useFrame(({ clock }, dt) => {
    if (!root.current) return;
    const beat = scene.playing && !reducedMotion ? clamp(audio.beatStrength ?? 0) : 0;
    const bass = scene.playing && !reducedMotion ? clamp(audio.bass ?? 0) : 0;
    const motionFactor = tier === "high" ? 1 : tier === "balanced" ? .55 : 0;
    const targetY = (reducedMotion ? 0 : Math.sin(clock.elapsedTime * .75) * .035 * intensity * motionFactor) + beat * .018 * intensity * motionFactor;
    root.current.position.y += (targetY - root.current.position.y) * Math.min(1, dt * 6);
    root.current.rotation.y += (((right ? -.13 : .13) * depth + (reducedMotion ? 0 : bass * .045 * intensity * motionFactor)) - root.current.rotation.y) * Math.min(1, dt * 5);
  });
  const spatial=normalizeSpatialLayoutV381(scene.spatialLayoutV381);
  return <group position={[spatial.x,spatial.y,spatial.z]} scale={spatial.scale}><group ref={root} position={[0, 0, 0]}>
    {/* V367: stage-space translucent caption plate for legibility over lighting/fog. */}
    <mesh position={[(right ? 1 : -1) * (1.22 + depth * .20) + (composition?.lyricsOffsetX ?? 0), 0, -.96 - depth * .65]} renderOrder={8}>
      <planeGeometry args={[2.7, tier === "low" ? .53 : 1.16]} />
      <meshBasicMaterial color="#091022" transparent opacity={clamp(Math.max(activeCaptionV477?.backdropOpacity??.72,.64+plateStrengthV378*.25))} depthWrite={false} depthTest={false} />
    </mesh>
    {visible.map(i => {
      const line = lines[i];
      const current = i === scene.activeIndex;
      const end = line.endMs && line.endMs > line.startMs ? line.endMs : lines[i + 1]?.startMs ?? line.startMs + 3400;
      const ratio = scene.lyrics.synced ? clamp((scene.progressMs - line.startMs) / Math.max(200, end - line.startMs)) : 0;
      // Word-timed records take precedence; otherwise spread the line duration across words.
      const tokens = line.words?.length ? line.words.map(w => w.text) : line.text.match(/\S+/g) ?? [line.text || "♪"];
      const y = (scene.activeIndex - i) * .36;
      const x = (right ? 1 : -1) * (1.22 + depth * .20) + (composition?.lyricsOffsetX ?? 0);
      const z = -.15 - depth * .65 - (current ? 0 : .10);
      const visualV461 = planCinematicLyricsV461({line,nextLineStart:lines[i+1]?.startMs,
        synchronized:scene.lyrics.synced,playing:scene.playing,reducedMotion,
        layout:"stage-3d",userScale:scene.fontScale/100});
      const visualV477 = planBeautifulLyricsV477({line,nextLineStart:lines[i+1]?.startMs,
        synchronized:scene.lyrics.synced,playing:scene.playing,reducedMotion,
        layout:"stage-3d",avatarCount:scene.avatarCountV477??1,userScale:scene.fontScale/100});
      const size = baseSize * (current ? 1.18 : .88) * visualV461.fontScale * visualV477.fontScale;
      // A full line costs one GPU text mesh. Limit glyph/mesh pressure on slower devices
      // without truncating lyrics. High quality keeps per-word karaoke on normal lines.
      const wordLimit = tier === "high" ? 28 : tier === "balanced" ? 14 : 0;
      const useWordMeshes = current && visualV461.allowWordMeshes && visualV477.allowWordMeshes && tokens.length <= wordLimit;
      const positions = useWordMeshes ? layoutWords(tokens, size, visualV477.max3DWidth) : [];
      const shouldHighlight = scene.wordHighlight && visualV477.timingMode === "verified-word" && current;
      return <group key={`${i}-${line.startMs}`} position={[x, y, z]}>
        {!useWordMeshes && <WordText text={line.text || "♪"} size={size} color={current ? from : "#8b93ad"}
          opacity={current ? 1 : visualV477.focusOpacity} maxWidth={visualV477.max3DWidth} outline={tier === "low" ? 0 : current ? .002+plateStrengthV378*.002 : 0} outlineColor={to} />}
        {positions.map((token, wi) => {
          const timed = line.words?.[wi];
          const next = line.words?.[wi + 1];
          const wordEnd = timed ? (timed.endMs && timed.endMs > timed.startMs ? timed.endMs : next?.startMs ?? end) : 0;
          const progress = !shouldHighlight ? 0 : timed
            ? lyricPlaybackFractionV477(scene.progressMs, timed.startMs, wordEnd)
            : 0;
          const cueV382 = kineticStyleV382 && shouldHighlight
            ? resolveKineticWordV382({line,nextLineStart:lines[i+1]?.startMs,index:wi,progressMs:scene.progressMs,
              synced:scene.lyrics.synced,playing:scene.playing,reducedMotion,preset:kineticStyleV382,
              strength:scene.kineticStrengthV382??65,drop:dropV382}) : null;
          const wordProgress=cueV382?cueV382.fill:progress;
          const lit = shouldHighlight && wordProgress > 0;
          const scale=cueV382&&tier==="high" ? 1+(cueV382.scale-1)*visualV461.motionScale
            : current && lit && !reducedMotion && tier === "high" && !kineticStyleV382 ? 1 + progress * .075 * intensity : 1;
          const color=cueV382?blendKineticColorV382(from,to,wordProgress):(lit ? to : current ? from : "#8b93ad");
          return <group key={`${wi}-${token.text}`} position={[token.x, token.y, 0]} scale={scale}>
            <WordText text={token.text} size={size} color={color}
              opacity={current ? 1 : visualV477.focusOpacity} outline={tier === "low" ? 0 : current ? .003 + plateStrengthV378*.002 + clamp(scene.glow / 100) * (lit ? .012 : .004) * (tier === "balanced" ? .5 : 1) + (cueV382?.glow??0)*.008 : 0}
              outlineColor={lit ? from : to} />
          </group>;
        })}
      </group>;
    })}
  </group></group>;
}
