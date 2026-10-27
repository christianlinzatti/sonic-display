"use client";

import { useRef, useState, type CSSProperties } from "react";
import { STAGE_ENVIRONMENTS, type StageEnvironmentId } from "@/components/visualizer/stages";
import dynamic from "next/dynamic";
import type {ConcertDetailSettingsV555} from "./concertDetailEffectsV555";

// The heavy R3F / Three.js preview code is never needed for the initial card grid.
const StageThemeCardScene = dynamic(
  () => import("@/components/visualizer/StageThemeCardScene").then(m => m.StageThemeCardScene),
  { ssr: false, loading: () => null },
);
const StagePreviewModal = dynamic(
  () => import("@/components/visualizer/StagePreviewModal").then(m => m.StagePreviewModal),
  { ssr: false, loading: () => null },
);

export function StageThemePreviewGrid({
  value,
  onChange,
  reactive = true,
  lightStrength = 60,
  reducedMotion = false,
  concertDetailsV555,
}: {
  value: StageEnvironmentId;
  onChange: (theme: StageEnvironmentId) => void;
  reactive?: boolean;
  lightStrength?: number;
  reducedMotion?: boolean;
  concertDetailsV555?:ConcertDetailSettingsV555;
}) {
  const [hoveredStage, setHoveredStage] = useState<StageEnvironmentId | null>(null);
  const [activatedStage, setActivatedStage] = useState<StageEnvironmentId | null>(null);
  const [modalStage, setModalStage] = useState<StageEnvironmentId | null>(null);
  const launchRef = useRef<HTMLButtonElement | null>(null);
  const openPreview = (stageId: StageEnvironmentId, trigger: HTMLButtonElement) => {
    launchRef.current = trigger;
    setModalStage(stageId);
  };
  const closePreview = () => {
    setModalStage(null);
    launchRef.current?.focus();
  };
  const style = {
    "--stage-card-light-strength": `${Math.max(20, Math.min(100, lightStrength))}%`,
  } as CSSProperties;

  return <>
  <div className="stage-theme-grid" role="list" aria-label="Bühnenvorschau">
    {STAGE_ENVIRONMENTS.map(stage => {
      const active = stage.id === value;
      // No WebGL until the user hovers, focuses or clicks a stage card.
      // Render at most one 3D canvas; the full-screen modal owns its own canvas.
      const previewStage = hoveredStage ?? activatedStage;
      const interactivePreview = modalStage === null && previewStage === stage.id;
      return <div className="stage-theme-tile" role="listitem" key={stage.id}>
      <button
        type="button"
        className={`stage-theme-card ${active ? "active" : ""} ${reactive ? "reactive" : "static"} ${reducedMotion ? "reduced-motion" : ""} ${interactivePreview ? "preview-open" : ""}`}
        onClick={() => { setActivatedStage(stage.id); onChange(stage.id); }}
        onMouseEnter={() => setHoveredStage(stage.id)}
        onMouseLeave={() => setHoveredStage(current => current === stage.id ? null : current)}
        onFocus={() => setHoveredStage(stage.id)}
        onBlur={() => setHoveredStage(current => current === stage.id ? null : current)}
        aria-pressed={active}
        aria-label={`${stage.label} auswählen`}
        style={style}
      >
        <div className={`stage-theme-preview stage-theme-preview-${stage.id}`} aria-hidden="true">
          <span className="stage-theme-backlight" />
          <span className="stage-theme-mini-fog fog-a" />
          <span className="stage-theme-mini-fog fog-b" />
          <span className="stage-theme-mini-beam left" />
          <span className="stage-theme-mini-beam center" />
          <span className="stage-theme-mini-beam right" />
          <span className="stage-theme-floor" />
          <span className="stage-theme-ring stage-theme-ring-a" />
          <span className="stage-theme-ring stage-theme-ring-b" />
          <span className="stage-theme-glow stage-theme-glow-a" />
          <span className="stage-theme-glow stage-theme-glow-b" />
          <span className="stage-theme-beat-orb" />
          <span className="stage-theme-beat-line" />
          {(stage.id === "classic" || stage.id === "neon" || stage.id === "festival" || stage.id === "rock" || stage.id === "cyberpunk") && <>
            <span className="stage-theme-pillar left" />
            <span className="stage-theme-pillar right" />
          </>}
          {stage.id === "festival" && <>
            <span className="stage-theme-laser left" />
            <span className="stage-theme-laser right" />
          </>}
          {stage.id === "cyberpunk" && <>
            <span className="stage-theme-neon-horizontal" />
            <span className="stage-theme-neon-vertical left" />
            <span className="stage-theme-neon-vertical right" />
          </>}
          {stage.id === "vaporwave" && <>
            <span className="stage-theme-sun" />
            <span className="stage-theme-grid-lines" />
            <span className="stage-theme-palm left" />
            <span className="stage-theme-palm right" />
          </>}
          {stage.id === "galaxy" && <span className="stage-theme-stars" />}
          {stage.id === "white" && <>
            <span className="stage-theme-softbox left" />
            <span className="stage-theme-softbox right" />
            <span className="stage-theme-backdrop" />
          </>}
          {stage.id === "rock" && <>
            <span className="stage-theme-truss" />
            <span className="stage-theme-speaker left" />
            <span className="stage-theme-speaker right" />
            <span className="stage-theme-flare left" />
            <span className="stage-theme-flare center" />
            <span className="stage-theme-flare right" />
          </>}
          {interactivePreview && (
            <StageThemeCardScene
              stageId={stage.id}
              reactive={reactive}
              lightStrength={lightStrength}
              reducedMotion={reducedMotion}
              active={active}
            />
          )}
          <span className="stage-theme-live-chip">{interactivePreview ? "3D Hover Preview" : "Beat Preview"}</span>
        </div>
        <span className="stage-theme-card-copy">
          <strong>{stage.label}</strong>
          <small>{stage.description}</small>
          <span className="stage-theme-card-meta">{stage.mood}</span>
        </span>
      </button>
      <button
        type="button"
        className="stage-theme-preview-open"
        aria-label={`${stage.label} in großer 3D-Vorschau ansehen`}
        onClick={event => openPreview(stage.id, event.currentTarget)}
      >
        <span aria-hidden="true">⛶</span> Große 3D-Vorschau öffnen
      </button>
      </div>;
    })}
  </div>
  {modalStage !== null && <StagePreviewModal
    stageId={modalStage}
    selectedStageId={value}
    onSelect={onChange}
    onClose={closePreview}
    reactive={reactive}
    lightStrength={lightStrength}
    reducedMotion={reducedMotion}
    concertDetailsV555={concertDetailsV555}
  />}
  </>;
}
