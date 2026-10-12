import type { AudioFeatures } from "@/types/audio";
import type { PerformanceSection } from "./performanceDirector";

export type AvatarPersonality = "neon-showman" | "festival-hype" | "custom-expressive" | "procedural-playful" | "hardstyle-icon" | "techno-minimal" | "metal-intense" | "ambient-flow";
export type SignatureMove = "power-hit" | "double-kick" | "shoulder-roll" | "side-groove" | "headbang-burst" | "robot-lock" | "flowing-sweep" | "showman-pose";
export interface PersonalityState { phrase: number; lastSignaturePhrase: number; signature: SignatureMove; }
export interface PersonalityMotion { personality: AvatarPersonality; signature: SignatureMove; arm: number; leg: number; hip: number; head: number; pose: number; }
const signatures: Record<AvatarPersonality, SignatureMove[]> = {
  "neon-showman": ["showman-pose", "shoulder-roll", "power-hit", "side-groove"],
  "festival-hype": ["double-kick", "power-hit", "showman-pose", "headbang-burst"],
  "custom-expressive": ["side-groove", "shoulder-roll", "flowing-sweep", "power-hit"],
  "procedural-playful": ["side-groove", "shoulder-roll", "showman-pose"],
  "hardstyle-icon": ["double-kick", "power-hit", "headbang-burst", "showman-pose"],
  "techno-minimal": ["side-groove", "robot-lock", "shoulder-roll"],
  "metal-intense": ["headbang-burst", "power-hit", "double-kick"],
  "ambient-flow": ["flowing-sweep", "shoulder-roll", "side-groove"],
};
export function resolveAvatarPersonality(modelId?: string, genre?: string | null, preset?: string): AvatarPersonality {
  const text = `${modelId ?? "procedural"} ${genre ?? ""} ${preset ?? ""}`.toLowerCase();
  if (/metal|rock/.test(text)) return "metal-intense";
  if (/hardstyle|hardcore|hard.?tekk/.test(text)) return "hardstyle-icon";
  if (/techno|house|trance/.test(text)) return "techno-minimal";
  if (/ambient|chill|classical/.test(text)) return "ambient-flow";
  if (/festival/.test(text)) return "festival-hype";
  if (/neon/.test(text)) return "neon-showman";
  if (/custom/.test(text)) return "custom-expressive";
  return "procedural-playful";
}
export function createPersonalityState(): PersonalityState { return { phrase: -1, lastSignaturePhrase: -99, signature: "side-groove" }; }
const clamp = (v: number, min = -1, max = 1) => Math.max(min, Math.min(max, v));
/** Stable phrase-level signature moves; no per-frame randomness. */
export function updateAvatarPersonality(state: PersonalityState, audio: AudioFeatures, modelId: string | undefined, genre: string | null | undefined, preset: string | undefined, section: PerformanceSection, elapsed: number, isPlaying: boolean, reducedMotion: boolean): PersonalityMotion {
  const personality = resolveAvatarPersonality(modelId, genre, preset);
  const bpm = Math.max(50, Math.min(220, audio.bpm ?? 120));
  const phrase = Math.floor((elapsed * bpm / 60) / 8);
  const choices = signatures[personality];
  if (isPlaying && !reducedMotion && phrase !== state.phrase) {
    state.phrase = phrase;
    if (phrase !== state.lastSignaturePhrase && (section === "drop" || phrase % 2 === 1 || phrase % 3 === 0)) {
      const sectionOffset = section === "drop" ? 1 : section === "break" ? 2 : 0;
      state.signature = choices[Math.abs(phrase * 7 + sectionOffset + personality.length) % choices.length];
      state.lastSignaturePhrase = phrase;
    }
  }
  const phase = elapsed * bpm / 60 * Math.PI * 2;
  const energy = clamp(audio.energyEnvelope * 0.65 + audio.volume * 0.2 + audio.kick * 0.15, 0, 1);
  const active = isPlaying && !reducedMotion ? 1 : 0;
  let arm = 0, leg = 0, hip = 0, head = 0, pose = 0;
  switch (state.signature) {
    case "power-hit": arm = Math.sin(phase) * .12 * energy; leg = Math.max(0, audio.kick) * .12; pose = audio.beat ? .14 * audio.beatStrength : 0; break;
    case "double-kick": leg = Math.sin(phase * .5) * .17 * energy; arm = Math.sin(phase * .5 + 1.2) * .11 * energy; hip = Math.sin(phase * .5) * .08; break;
    case "shoulder-roll": arm = Math.sin(phase * .5 - .8) * .07 * energy; hip = Math.sin(phase * .25) * .09 * energy; break;
    case "side-groove": hip = Math.sin(phase * .5) * .12 * energy; leg = Math.sin(phase * .5 + 1) * .06 * energy; arm = Math.sin(phase * .5 + .7) * .05 * energy; break;
    case "headbang-burst": head = Math.sin(phase) * .16 * energy; arm = Math.sin(phase + 1) * .08 * energy; break;
    case "robot-lock": arm = Math.sign(Math.sin(phase)) * .055 * energy; leg = Math.sign(Math.sin(phase + .5)) * .045 * energy; pose = audio.beat ? .08 * audio.beatStrength : 0; break;
    case "flowing-sweep": arm = Math.sin(phase * .25) * .06 * energy; hip = Math.sin(phase * .25 - .6) * .07 * energy; head = Math.sin(phase * .25 - 1) * .025 * energy; break;
    case "showman-pose": arm = Math.sin(phase * .5) * .09 * energy; pose = audio.beat ? .12 * audio.beatStrength : .015 * energy; hip = Math.sin(phase * .5) * .06 * energy; break;
  }
  if (section === "break") { arm *= .4; leg *= .35; head *= .5; pose *= .25; }
  return { personality, signature: state.signature, arm: arm * active, leg: leg * active, hip: hip * active, head: head * active, pose: pose * active };
}
