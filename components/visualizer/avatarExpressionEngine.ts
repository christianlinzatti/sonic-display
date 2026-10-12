import type { AudioFeatures } from "../../types/audio";

export type AvatarExpression = "neutral" | "cool" | "euphoric" | "aggressive" | "relaxed";

export type AvatarExpressionState = {
  expression: AvatarExpression;
  energy: number;
  smile: number;
  brow: number;
  eyeNarrow: number;
  jaw: number;
  headTilt: number;
};

function genreKey(genre?: string | null) { return genre?.toLowerCase() ?? "default"; }

export function getAvatarExpressionState(
  audio: AudioFeatures,
  genre: string | null | undefined,
  isPlaying: boolean,
  reducedMotion: boolean,
  intensity = 1,
  elapsedSeconds = 0,
): AvatarExpressionState {
  const energy = Math.max(0, Math.min(1, (audio.volume * 0.55 + audio.bass * 0.35 + audio.mids * 0.1) * intensity));
  if (!isPlaying || reducedMotion) return { expression: "neutral", energy: 0, smile: 0, brow: 0, eyeNarrow: 0, jaw: 0, headTilt: 0 };

  const key = genreKey(genre);
  let expression: AvatarExpression = energy > 0.72 ? "euphoric" : energy < 0.28 ? "relaxed" : "cool";
  if (/hardcore|hardstyle|metal/.test(key)) expression = energy > 0.45 ? "aggressive" : "cool";
  else if (/ambient|chill|classical/.test(key)) expression = "relaxed";
  else if (/rock|punk/.test(key) && energy > 0.5) expression = "aggressive";

  const pulse = 0.5 + 0.5 * Math.sin(elapsedSeconds * 1.7);
  const beat = Math.max(audio.kick ?? 0, audio.beatStrength ?? 0);
  const expressionFactor = Math.min(1, energy + beat * 0.35);
  const smile = expression === "euphoric" ? 0.25 + expressionFactor * 0.35 : expression === "relaxed" ? 0.12 : expression === "cool" ? 0.06 : 0.01;
  const brow = expression === "aggressive" ? 0.18 + expressionFactor * 0.22 : expression === "euphoric" ? 0.08 : -0.02;
  const eyeNarrow = expression === "aggressive" ? 0.3 + expressionFactor * 0.35 : expression === "cool" ? 0.08 : 0;
  const jaw = expression === "aggressive" ? beat * 0.16 : expression === "euphoric" ? beat * 0.08 : 0;
  const headTilt = (pulse - 0.5) * 0.035 * (0.4 + energy);
  return { expression, energy, smile, brow, eyeNarrow, jaw, headTilt };
}
