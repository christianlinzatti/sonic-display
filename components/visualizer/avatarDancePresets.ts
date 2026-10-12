export type AvatarDancePresetId = "auto" | "hardstyle" | "techno" | "rock-metal" | "robot" | "ambient" | "freestyle";

export type AvatarDancePreset = {
  id: AvatarDancePresetId;
  label: string;
  description: string;
  genreKeys: string[];
  multipliers: {
    kick: number;
    head: number;
    sway: number;
    bounce: number;
    arms: number;
    chest: number;
  };
};

export const avatarDancePresets: AvatarDancePreset[] = [
  { id: "auto", label: "Auto by genre", description: "Chooses a dance style from the detected genre", genreKeys: [], multipliers: { kick: 1, head: 1, sway: 1, bounce: 1, arms: 1, chest: 1 } },
  { id: "hardstyle", label: "Hardstyle / Hardcore", description: "Aggressive kicks, head movement and strong upper-body hits", genreKeys: ["hardstyle", "hardcore", "hardtekk"], multipliers: { kick: 1.25, head: 1.35, sway: 1.05, bounce: 1.2, arms: 1.15, chest: 1.2 } },
  { id: "techno", label: "Techno Groove", description: "Steady pulse, controlled sway and less headbanging", genreKeys: ["techno", "house", "trance"], multipliers: { kick: 0.9, head: 0.55, sway: 1.35, bounce: 1.05, arms: 0.9, chest: 0.95 } },
  { id: "rock-metal", label: "Rock / Metal", description: "Headbanging with powerful chest and arm movement", genreKeys: ["rock", "metal", "punk"], multipliers: { kick: 1.05, head: 1.5, sway: 0.9, bounce: 1.15, arms: 1.25, chest: 1.2 } },
  { id: "robot", label: "Robot / Mechanical", description: "Sharp, punchy and deliberately mechanical movement", genreKeys: ["robot"], multipliers: { kick: 1.35, head: 0.8, sway: 0.55, bounce: 1.35, arms: 1.45, chest: 1.5 } },
  { id: "ambient", label: "Ambient / Smooth", description: "Slow, soft movement with minimal beat reaction", genreKeys: ["ambient", "chillout", "classical"], multipliers: { kick: 0.25, head: 0.2, sway: 0.7, bounce: 0.45, arms: 0.35, chest: 0.4 } },
  { id: "freestyle", label: "Freestyle", description: "Balanced dynamic movement for mixed music", genreKeys: [], multipliers: { kick: 1, head: 1, sway: 1.1, bounce: 1, arms: 1, chest: 1 } },
];

export function getAvatarDancePreset(id: AvatarDancePresetId = "auto", genre?: string | null) {
  if (id !== "auto") return avatarDancePresets.find(p => p.id === id) ?? avatarDancePresets[0];
  const key = genre?.toLowerCase() ?? "";
  return avatarDancePresets.find(p => p.genreKeys.includes(key)) ?? avatarDancePresets.find(p => p.id === "freestyle")!;
}
