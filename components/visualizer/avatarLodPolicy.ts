/** V123: conservative mesh LOD selection. Named LOD groups are optional.
 * A base mesh without a variant must remain visible at every quality tier.
 */
export type AvatarLodTier = "high" | "balanced" | "low";
export type AvatarLodLevel = 0 | 1 | 2;
export function avatarLodLevel(tier: AvatarLodTier): AvatarLodLevel {
  return tier === "high" ? 0 : tier === "balanced" ? 1 : 2;
}
/** Explicit suffixes avoid accidentally hiding avatar nodes named "LOD" in other contexts. */
export function parseAvatarLodName(name: string): { family: string; level: AvatarLodLevel } | null {
  const match = /^(.*)[_.-]LOD([012])$/i.exec(name);
  if (!match || !match[1]) return null;
  return { family: match[1].toLowerCase(), level: Number(match[2]) as AvatarLodLevel };
}
export function pickAvailableLod(available: readonly AvatarLodLevel[], tier: AvatarLodTier): AvatarLodLevel | null {
  if (!available.length) return null;
  const target = avatarLodLevel(tier);
  return [...available].sort((a, b) => Math.abs(a-target)-Math.abs(b-target) || a-b)[0];
}
