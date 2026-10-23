"use client";

import type { CSSProperties } from "react";
import { getStageEnvironmentDefinition, type StageEnvironmentId } from "@/components/visualizer/stages";

type Props = {
  theme: StageEnvironmentId;
  reactive: boolean;
  lightStrength: number;
  reducedMotion?: boolean;
};

export function StageThemeLivePreview({ theme, reactive, lightStrength, reducedMotion = false }: Props) {
  const stage = getStageEnvironmentDefinition(theme);
  const style = {
    "--stage-preview-strength": `${Math.max(20, Math.min(100, lightStrength))}%`,
  } as CSSProperties;

  return (
    <section
      className={`stage-live-preview ${reducedMotion ? "reduced-motion" : ""} ${reactive ? "reactive" : "static"}`}
      style={style}
      aria-label={`Live-Vorschau für ${stage.label}`}
    >
      <div className="stage-live-preview-head">
        <div>
          <strong>{stage.label}</strong>
          <p>{stage.description}</p>
        </div>
        <span className="stage-live-preview-badge">{stage.mood}</span>
      </div>

      <div className={`stage-live-preview-canvas theme-${theme}`}>
        <span className="stage-live-preview-backdrop" />
        <span className="stage-live-preview-fog fog-a" />
        <span className="stage-live-preview-fog fog-b" />
        <span className="stage-live-preview-fog fog-c" />

        <span className="stage-live-preview-beam beam-left" />
        <span className="stage-live-preview-beam beam-center" />
        <span className="stage-live-preview-beam beam-right" />

        <span className="stage-live-preview-floor" />
        <span className="stage-live-preview-platform" />
        <span className="stage-live-preview-ring ring-a" />
        <span className="stage-live-preview-ring ring-b" />

        {(theme === "classic" || theme === "neon" || theme === "festival" || theme === "rock" || theme === "cyberpunk") && (
          <>
            <span className="stage-live-preview-tower left" />
            <span className="stage-live-preview-tower right" />
          </>
        )}

        {(theme === "festival" || theme === "rock") && <span className="stage-live-preview-truss" />}
        {theme === "festival" && (
          <>
            <span className="stage-live-preview-laser laser-left" />
            <span className="stage-live-preview-laser laser-right" />
          </>
        )}
        {theme === "cyberpunk" && (
          <>
            <span className="stage-live-preview-neon neon-horizontal" />
            <span className="stage-live-preview-neon neon-left" />
            <span className="stage-live-preview-neon neon-right" />
          </>
        )}
        {theme === "vaporwave" && (
          <>
            <span className="stage-live-preview-sun" />
            <span className="stage-live-preview-grid" />
            <span className="stage-live-preview-palm palm-left" />
            <span className="stage-live-preview-palm palm-right" />
          </>
        )}
        {theme === "galaxy" && <span className="stage-live-preview-stars" />}
        {theme === "white" && (
          <>
            <span className="stage-live-preview-softbox softbox-left" />
            <span className="stage-live-preview-softbox softbox-right" />
            <span className="stage-live-preview-wall" />
          </>
        )}
        {theme === "rock" && (
          <>
            <span className="stage-live-preview-speaker speaker-left" />
            <span className="stage-live-preview-speaker speaker-right" />
            <span className="stage-live-preview-flare flare-left" />
            <span className="stage-live-preview-flare flare-center" />
            <span className="stage-live-preview-flare flare-right" />
          </>
        )}

        <div className="stage-live-preview-copy">
          <span className="eyebrow">Live Preview</span>
          <strong>{reactive ? "Musikreaktive Szene aktiv" : "Statische Szene"}</strong>
          <small>
            Bewegende Scheinwerfer, leichte Nebelstimmung und stilabhängige Bühnenelemente direkt in den Settings.
          </small>
        </div>
      </div>

      <small className="settings-note">
        Diese Vorschau ist absichtlich leichtgewichtig umgesetzt. Sie simuliert Bühne, bewegte Scheinwerfer und Nebel ohne zusätzliches WebGL-Canvas in den Settings.
      </small>
    </section>
  );
}
