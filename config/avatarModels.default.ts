import type { AvatarModel } from "@/components/visualizer/avatarModels";

import {ENCORE_AVATARS_V1129} from '@/lib/musicPerformanceV1129';

import {HEADLINERS_V1130} from '@/lib/showIntelligenceV1130';

import {importedAvatarModels} from "./avatarModels.imported";

export const defaultAvatarModels: AvatarModel[] = [
  { id: "procedural", label: "Procedural", url: null, preview: "/avatars/procedural-preview.svg", description: "Built-in animated character" },
  {
    id: "sonic-neon-pulse", label: "Neon Pulse", url: "/avatars/sonic/neon-pulse.glb",
    preview: "/avatars/sonic/neon-pulse.png", category: "Sonic Stage Crew",
    description: "Cyber-Performer mit Cyan-Visor · 20 Tänze, Ruhe & Winken",
    genre: ["Techno", "House", "Electronic"], tags: ["GLB", "22 Animationen", "Neon", "Neon Circuit", "Laser Step", "Fingeranimation", "Visor-Ausdrücke"], defaultDancePreset: "techno",
  },
  {
    id: "sonic-festival-nova", label: "Festival Nova", url: "/avatars/sonic/festival-nova.glb",
    preview: "/avatars/sonic/festival-nova.png", category: "Sonic Stage Crew",
    description: "Festival-Tänzerin mit pinker Showjacke · 20 Tänze, Ruhe & Winken",
    genre: ["Pop", "Disco", "Hip-Hop"], tags: ["GLB", "22 Animationen", "Festival", "Festival Flow", "Disco Star", "Fingeranimation", "Blinzeln & Lächeln"], defaultDancePreset: "freestyle",
  },
  {
    id: "sonic-chrome-beat", label: "Chrome Beat", url: "/avatars/sonic/chrome-beat.glb",
    preview: "/avatars/sonic/chrome-beat.png", category: "Sonic Stage Crew",
    description: "Chrom-Roboter mit LED-Gesicht · 20 Tänze, Ruhe & Winken",
    genre: ["Electro", "Techno", "Robot"], tags: ["GLB", "22 Animationen", "Roboter", "Pop Lock", "Clockwork", "Fingeranimation", "LED-Ausdrücke"], defaultDancePreset: "robot",
  },
  ...ENCORE_AVATARS_V1129.map(avatar=>({
    id:avatar.id,label:avatar.label,url:`/avatars/sonic/${avatar.slug}.glb`,
    preview:`/avatars/sonic/${avatar.slug}.png`,category:'Sonic Stage Crew',
    description:'Eigener Bühnenlook · 28 Animationen mit Rock, Latin, Jazz, Liquid, Afro & Walzer',
    genre:[...avatar.genres],tags:['GLB','28 Animationen','Encore','Fingeranimation','Genre-Moves'],
    defaultDancePreset:avatar.preset,
  })),
  ...HEADLINERS_V1130.map(avatar=>({id:avatar.id,label:avatar.label,
    url:`/avatars/sonic/${avatar.slug}.glb`,preview:`/avatars/sonic/${avatar.slug}.png`,category:'Sonic Stage Crew',
    description:'Headliner mit eigenem Bühnenlook · 32 Animationen inklusive Power Hit, Ripple, Turnout & Stomp',
    genre:[...avatar.genres],tags:['GLB','32 Animationen','Headliner','Genre-Moves'],defaultDancePreset:avatar.preset,
  })),
  ...importedAvatarModels,
  { id: "custom", label: "Custom GLTF", url: process.env.NEXT_PUBLIC_AVATAR_MODEL_URL || null, preview: "/avatars/custom-preview.svg", description: "Model configured with NEXT_PUBLIC_AVATAR_MODEL_URL" },
  { id: "neon", label: "Neon avatar", url: process.env.NEXT_PUBLIC_AVATAR_NEON_URL || null, preview: "/avatars/neon-preview.svg", description: "Optional second model" },
  { id: "festival", label: "Festival avatar", url: process.env.NEXT_PUBLIC_AVATAR_FESTIVAL_URL || null, preview: "/avatars/festival-preview.svg", description: "Optional third model" },
];
