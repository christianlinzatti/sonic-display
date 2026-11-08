import type { AvatarModel } from "@/components/visualizer/avatarModels";

export const defaultAvatarModels: AvatarModel[] = [
  { id: "procedural", label: "Procedural", url: null, preview: "/avatars/procedural-preview.svg", description: "Built-in animated character" },
  {
    id: "sonic-neon-pulse", label: "Neon Pulse", url: "/avatars/sonic/neon-pulse.glb",
    preview: "/avatars/sonic/neon-pulse.png", category: "Sonic Stage Crew",
    description: "Cyber-Performer mit Cyan-Visor · 10 Tänze, Ruhe & Winken",
    genre: ["Techno", "House", "Electronic"], tags: ["GLB", "12 Animationen", "Neon", "Neon Circuit", "Laser Step", "Fingeranimation", "Visor-Ausdrücke"], defaultDancePreset: "techno",
  },
  {
    id: "sonic-festival-nova", label: "Festival Nova", url: "/avatars/sonic/festival-nova.glb",
    preview: "/avatars/sonic/festival-nova.png", category: "Sonic Stage Crew",
    description: "Festival-Tänzerin mit pinker Showjacke · 10 Tänze, Ruhe & Winken",
    genre: ["Pop", "Disco", "Hip-Hop"], tags: ["GLB", "12 Animationen", "Festival", "Festival Flow", "Disco Star", "Fingeranimation", "Blinzeln & Lächeln"], defaultDancePreset: "freestyle",
  },
  {
    id: "sonic-chrome-beat", label: "Chrome Beat", url: "/avatars/sonic/chrome-beat.glb",
    preview: "/avatars/sonic/chrome-beat.png", category: "Sonic Stage Crew",
    description: "Chrom-Roboter mit LED-Gesicht · 10 Tänze, Ruhe & Winken",
    genre: ["Electro", "Techno", "Robot"], tags: ["GLB", "12 Animationen", "Roboter", "Pop Lock", "Clockwork", "Fingeranimation", "LED-Ausdrücke"], defaultDancePreset: "robot",
  },
  { id: "custom", label: "Custom GLTF", url: process.env.NEXT_PUBLIC_AVATAR_MODEL_URL || null, preview: "/avatars/custom-preview.svg", description: "Model configured with NEXT_PUBLIC_AVATAR_MODEL_URL" },
  { id: "neon", label: "Neon avatar", url: process.env.NEXT_PUBLIC_AVATAR_NEON_URL || null, preview: "/avatars/neon-preview.svg", description: "Optional second model" },
  { id: "festival", label: "Festival avatar", url: process.env.NEXT_PUBLIC_AVATAR_FESTIVAL_URL || null, preview: "/avatars/festival-preview.svg", description: "Optional third model" },
];
