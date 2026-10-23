/** V449: only show verifiable Genius song relationships and named credits.
 * Never infer listening similarity, sample dates, Spotify catalogue presence or vocal assignments.
 */
export type GeniusDiscoveryV449 = {
  id: string;
  kind: "related-song" | "producer" | "featured-artist";
  reason: string;
  title: string;
  artist?: string;
  geniusUrl: string;
  /** Spotify SEARCH query only; no guarantee a matching record exists in Spotify. */
  spotifyQuery: string;
};
type RecordValue = Record<string, unknown>;
const obj = (value: unknown): RecordValue => value !== null && typeof value === "object" && !Array.isArray(value) ? value as RecordValue : {};
const list = (value: unknown): unknown[] => Array.isArray(value) ? value : [];
const clean = (value: unknown, length: number): string => typeof value === "string" ? value
  .replace(/<[^>]*>/g, " ").replace(/[\u0000-\u001f\u007f]/g, " ")
  .replace(/\s+/g, " ").trim().slice(0, length) : "";
/** Validate untrusted API links: https only, Genius-owned host and no credentials. */
export function safeDiscoveryGeniusUrlV449(value: unknown): string | null {
  const text = clean(value, 500);
  try {
    const url = new URL(text);
    return url.protocol === "https:" && !url.username && !url.password
      && (url.hostname === "genius.com" || url.hostname.endsWith(".genius.com"))
      ? url.toString() : null;
  } catch { return null; }
}
const labels: Record<string,string> = {
  samples:"Sample-Quelle", sampled_in:"Verwendet deinen Song als Sample",
  interpolates:"Melodie-Interpolation", interpolated_by:"Interpretiert eine Melodie neu",
  cover_of:"Cover-Vorlage", covered_by:"Cover deines Songs",
  remix_of:"Remix-Vorlage", remixed_by:"Remix deines Songs",
};
function normalized(value: string): string { return value.normalize("NFKD").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim(); }
function safeSearch(value: string): string { return clean(value, 70); }
/** Convert the /songs/:id JSON into a small bounded, evidence-based discovery list. */
export function buildGeniusMusicDiscoveryV449(raw: unknown): GeniusDiscoveryV449[] {
  const song = obj(raw), ownUrl = safeDiscoveryGeniusUrlV449(song.url);
  if (!ownUrl) return [];
  const items: GeniusDiscoveryV449[] = [];
  const seen = new Set<string>();
  let tracks = 0;
  for (const relation of list(song.song_relationships)) {
    const relationship = obj(relation);
    const reason = labels[clean(relationship.relationship_type, 40)];
    if (!reason) continue;
    for (const rawRelated of list(relationship.songs)) {
      if (tracks >= 6) break;
      const related = obj(rawRelated), title = clean(related.title, 90);
      const url = safeDiscoveryGeniusUrlV449(related.url);
      if (!title || !url || url === ownUrl) continue;
      const artist = clean(obj(related.primary_artist).name, 70);
      const key = `song:${url.toLowerCase()}`;
      if (seen.has(key)) continue;
      const spotifyQuery = safeSearch(`${title}${artist ? ` ${artist}` : ""}`);
      if (spotifyQuery.length < 2) continue;
      seen.add(key);
      items.push({id:`related-${tracks}`,kind:"related-song",reason,title,...(artist?{artist}:{}),geniusUrl:url,spotifyQuery});
      tracks++;
    }
    if (tracks >= 6) break;
  }
  for (const entry of [
    {field:"producer_artists",kind:"producer" as const,reason:"Produzent dieses Songs",max:3},
    {field:"featured_artists",kind:"featured-artist" as const,reason:"Feature-Künstler dieses Songs",max:2},
  ]) {
    let count = 0;
    for (const value of list(song[entry.field])) {
      if (count >= entry.max) break;
      const artist = obj(value), name = clean(artist.name, 70), key = `artist:${normalized(name)}`;
      if (!name || name.length < 2 || seen.has(key)) continue;
      const url = safeDiscoveryGeniusUrlV449(artist.url) ?? ownUrl;
      const spotifyQuery = safeSearch(name);
      if (spotifyQuery.length < 2) continue;
      seen.add(key);
      items.push({id:`${entry.kind}-${count}`,kind:entry.kind,reason:entry.reason,title:name,geniusUrl:url,spotifyQuery});
      count++;
    }
  }
  return items.slice(0, 11);
}
/** Select a short cue, not a speculative personalized recommendation. */
export function rotatingGeniusDiscoveryV449(items: GeniusDiscoveryV449[] | null | undefined, progressMs:number, playing:boolean): GeniusDiscoveryV449|null {
  if(!playing || !Number.isFinite(progressMs) || progressMs < 12000 || !items?.length) return null;
  return items[Math.floor((progressMs - 12000) / 42000) % items.length] ?? null;
}
export const MUSIC_DISCOVERY_SEARCH_EVENT_V449 = "sonic:music-discovery-search-v449";
/** Shared input validation for the event opening the existing Spotify catalogue search. */
export function musicDiscoverySearchQueryV449(value: unknown): string|null {
  if(typeof value!=="string" || value.length>300)return null;
  const query=safeSearch(value);
  return query.length>=2 ? query : null;
}
