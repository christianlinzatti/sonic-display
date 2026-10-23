/** Register locally hosted GLB/GLTF models here. Optional previews live under public/. */
import type { AvatarDancePresetId } from "./avatarDancePresets";
export type AvatarModel = { id: string; label: string; url: string | null; preview?: string; description: string; genre?: string[]; tags?: string[]; category?: string; favorite?: boolean; animationUrl?: string; defaultDancePreset?: AvatarDancePresetId };
import { defaultAvatarModels } from "@/config/avatarModels.default";
export const avatarModels: AvatarModel[] = defaultAvatarModels;

export function getAvatarModel(id: string) {
  if (id.startsWith("local:")) {
    const filename = id.slice("local:".length);
    if (/^[^/\\]+\.(glb|gltf)$/i.test(filename) && filename !== "." && filename !== "..") {
      return { id, label: filename.replace(/\.(glb|gltf)$/i, ""), url: `/avatars/${encodeURIComponent(filename)}`, description: "Lokales Modell" };
    }
  }
 return avatarModels.find(model => model.id === id && (id === "procedural" || model.url)) ?? avatarModels[0]; }
