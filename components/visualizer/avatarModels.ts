/** Register locally hosted GLB/GLTF models here. Optional previews live under public/. */
export type AvatarModel = { id: string; label: string; url: string | null; preview?: string; description: string };
export const avatarModels: AvatarModel[] = [
  { id: "procedural", label: "Procedural", url: null, preview: "/avatars/procedural-preview.svg", description: "Built-in animated character" },
  { id: "custom", label: "Custom GLTF", url: process.env.NEXT_PUBLIC_AVATAR_MODEL_URL || null, preview: "/avatars/custom-preview.svg", description: "Model configured with NEXT_PUBLIC_AVATAR_MODEL_URL" },
  { id: "neon", label: "Neon avatar", url: process.env.NEXT_PUBLIC_AVATAR_NEON_URL || null, preview: "/avatars/neon-preview.svg", description: "Optional second model" },
  { id: "festival", label: "Festival avatar", url: process.env.NEXT_PUBLIC_AVATAR_FESTIVAL_URL || null, preview: "/avatars/festival-preview.svg", description: "Optional third model" },
];
export function getAvatarModel(id: string) { return avatarModels.find(model => model.id === id && (id === "procedural" || model.url)) ?? avatarModels[0]; }
