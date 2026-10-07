/** Add locally hosted GLB/GLTF models here. Keep model files under public/models/. */
export const avatarModels = [
  { id: "procedural", label: "Procedural avatar", url: null },
  ...(process.env.NEXT_PUBLIC_AVATAR_MODEL_URL
    ? [{ id: "custom", label: "Custom GLTF avatar", url: process.env.NEXT_PUBLIC_AVATAR_MODEL_URL }]
    : []),
] as const;
