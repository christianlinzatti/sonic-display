import type { AvatarModel } from "@/components/visualizer/avatarModels";

export const defaultAvatarModels: AvatarModel[] = [
  { id: "procedural", label: "Procedural", url: null, preview: "/avatars/procedural-preview.svg", description: "Built-in animated character" },
  { id: "custom", label: "Custom GLTF", url: process.env.NEXT_PUBLIC_AVATAR_MODEL_URL || null, preview: "/avatars/custom-preview.svg", description: "Model configured with NEXT_PUBLIC_AVATAR_MODEL_URL" },
  { id: "neon", label: "Neon avatar", url: process.env.NEXT_PUBLIC_AVATAR_NEON_URL || null, preview: "/avatars/neon-preview.svg", description: "Optional second model" },
  { id: "festival", label: "Festival avatar", url: process.env.NEXT_PUBLIC_AVATAR_FESTIVAL_URL || null, preview: "/avatars/festival-preview.svg", description: "Optional third model" },
];
