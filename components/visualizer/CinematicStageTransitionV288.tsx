"use client";
import type { CSSProperties } from "react";
import type { StageEnvironmentId } from "./stages";
import type { StageSection } from "./stageDirectorV287";

const stageColors: Record<StageEnvironmentId, string> = {
  classic: "#638cd8", neon: "#43edff", festival: "#fc6dc9",
  minimal: "#aebacf", cyberpunk: "#e65bfe", vaporwave: "#ff94b7",
  galaxy: "#7b80ff", white: "#eef6ff", rock: "#f1a05b",
};

/** One lightweight screen-space effect; the existing Three.js scene remains mounted. */
export function CinematicStageTransitionV288({stage, section, durationMs, cameraMotion, dropFlash}: {
  stage: StageEnvironmentId; section: StageSection; durationMs: number;
  cameraMotion: boolean; dropFlash: boolean;
}) {
  const accent = stageColors[stage] ?? stageColors.classic;
  const intense = section === "drop" || section === "hook";
  const style = { "--cinematic-accent-v288": accent, "--cinematic-duration-v288": `${durationMs}ms` } as CSSProperties;
  return <div className={`cinematic-stage-v288${cameraMotion ? " cinematic-camera-v288" : ""}${intense && dropFlash ? " cinematic-drop-v288" : ""}`} style={style} aria-hidden="true">
    <div className="cinematic-stage-v288-wash" />
    <div className="cinematic-stage-v288-beam cinematic-stage-v288-beam-left" />
    <div className="cinematic-stage-v288-beam cinematic-stage-v288-beam-right" />
    <div className="cinematic-stage-v288-glint" />
  </div>;
}
