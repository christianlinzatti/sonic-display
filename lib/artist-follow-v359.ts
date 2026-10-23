/** Spotify February 2026 API: follow / unfollow are generic library operations. */
export const FOLLOW_READ_SCOPE = "user-follow-read";
export const FOLLOW_WRITE_SCOPE = "user-follow-modify";
const ID = /^[A-Za-z0-9]{10,32}$/;

export function validArtistId(value: unknown): value is string {
  return typeof value === "string" && ID.test(value);
}
export function parseArtistIds(value: string | null): string[] | null {
  if (!value) return null;
  const ids = value.split(",");
  if (ids.length < 1 || ids.length > 10 || ids.some(id => !validArtistId(id))) return null;
  return Array.from(new Set(ids));
}
export function hasFollowScope(scopes: string | undefined, scope: string): boolean {
  return typeof scopes === "string" && scopes.split(/\s+/).includes(scope);
}
export function artistLink(id: string): string | null {
  return validArtistId(id) ? `https://open.spotify.com/artist/${id}` : null;
}
export function artistUri(id: string): string | null {
  return validArtistId(id) ? `spotify:artist:${id}` : null;
}
/** Query parameter, not a JSON request body. Spotify supports at most 40 URIs. */
export function libraryUrisQuery(ids: string[]): string | null {
  if (!ids.length || ids.length > 40 || ids.some(id => !validArtistId(id))) return null;
  return `uris=${encodeURIComponent(ids.map(id => artistUri(id)!).join(","))}`;
}
export function normalizeContainsResponse(response: unknown, ids: string[]): Record<string, boolean> | null {
  if (!Array.isArray(response) || response.length !== ids.length || response.some(v => typeof v !== "boolean")) return null;
  return Object.fromEntries(ids.map((id, i) => [id, response[i] as boolean]));
}
