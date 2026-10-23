import {buildGeniusMusicDiscoveryV449,type GeniusDiscoveryV449} from "./musicDiscoveryV449";
/** V447: conservative, side-effect-free Genius song-metadata handling.
 * The Genius API is not a source of timed lyrics or verified vocal assignments.
 */
export type GeniusInsightKindV447 = "story" | "credit" | "sample" | "annotation" | "release" | "feature";
export type GeniusInsightV447 = {
  id: string;
  kind: GeniusInsightKindV447;
  title: string;
  text: string;
  url: string;
  /** Untimed Genius referent fragment: only align when a separate synced lyric matches. */
  lyricFragment?: string;
};
export type GeniusSongInsightsV447 = {
  songId: number;
  songTitle: string;
  artist: string;
  url: string;
  insights: GeniusInsightV447[];
  /** Optional primary artist portrait from the Genius-hosted image CDN only. */
  artistImageUrl?: string;
  /** V449: Genius-backed song, producer and feature links. */
  discoveries?: GeniusDiscoveryV449[];
};

type Dict = Record<string, unknown>;
const object = (v: unknown): Dict => v && typeof v === "object" && !Array.isArray(v) ? v as Dict : {};
const str = (v: unknown): string => typeof v === "string" ? v.trim() : "";
const arr = (v: unknown): unknown[] => Array.isArray(v) ? v : [];
const finiteNumber = (v: unknown): number | null => typeof v === "number" && Number.isSafeInteger(v) && v > 0 ? v : null;
export function normalizedSongTextV447(v: string): string {
  return v.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
    .replace(/\((?:feat\.?|ft\.?|with|prod\.?)[^)]*\)/gi, " ")
    .replace(/\[(?:feat\.?|ft\.?|with|prod\.?)[^\]]*\]/gi, " ")
    .replace(/[^a-z0-9]+/g, " ").replace(/\s+/g, " ").trim();
}
function safeGeniusUrlV447(value: unknown): string | null {
  const raw = str(value);
  if (!raw) return null;
  try {
    const parsed = new URL(raw);
    return parsed.protocol === "https:" && (parsed.hostname === "genius.com" || parsed.hostname.endsWith(".genius.com"))
      ? parsed.toString() : null;
  } catch { return null; }
}
/** Remote image URLs are accepted only from Genius' image CDN, never from arbitrary API text. */
export function safeGeniusArtistImageV448(value:unknown):string|null {
  const raw = str(value);
  if(!raw) return null;
  try {
    const parsed = new URL(raw);
    return parsed.protocol==="https:" && parsed.hostname==="images.genius.com"
      && !parsed.username && !parsed.password && (parsed.pathname.endsWith(".jpg") || parsed.pathname.endsWith(".jpeg") || parsed.pathname.endsWith(".png") || parsed.pathname.endsWith(".webp"))
      ? parsed.toString() : null;
  } catch { return null; }
}
function excerptV447(value: unknown, limit: number): string {
  const s = str(value).replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  if (!s) return "";
  if (s.length <= limit) return s;
  const cut = s.slice(0, limit - 1);
  const at = cut.lastIndexOf(" ");
  return (at > 55 ? cut.slice(0, at) : cut) + "…";
}
function namesV447(v: unknown): string[] {
  const unique = new Set<string>();
  for (const a of arr(v)) {
    const name = excerptV447(object(a).name, 65);
    if (name) unique.add(name);
    if (unique.size >= 4) break;
  }
  return [...unique];
}
function likenessV447(a: string, b: string): number {
  const left = normalizedSongTextV447(a), right = normalizedSongTextV447(b);
  if (!left || !right) return 0;
  if (left === right) return 1;
  const l = new Set(left.split(" ")), r = new Set(right.split(" "));
  const shared = [...l].filter(x => r.has(x)).length;
  return shared / Math.max(l.size, r.size);
}
export function geniusMatchScoreV447(item: unknown, title: string, artists: string[]): number {
  const song = object(item);
  const candidateTitle = str(song.title);
  const titleScore = likenessV447(candidateTitle, title);
  if (titleScore < 0.76) return 0;
  const candidateArtists = [str(object(song.primary_artist).name), ...namesV447(song.featured_artists)];
  const artistScore = Math.max(0, ...artists.map(a => Math.max(0, ...candidateArtists.map(b => likenessV447(a, b)))));
  // Unrelated song with same title must not be shown.
  return artistScore >= 0.7 ? titleScore * 0.7 + artistScore * 0.3 : 0;
}
export function selectGeniusSongV447(hits: unknown, title: string, artists: string[]): number | null {
  let score = 0, id: number | null = null;
  for (const result of arr(hits).slice(0, 15)) {
    const song = object(object(result).result);
    const n = geniusMatchScoreV447(song, title, artists);
    const candidate = finiteNumber(song.id);
    if (candidate && n > score && n >= 0.78) { score = n; id = candidate; }
  }
  return id;
}
const relationLabels: Record<string,string> = {
  samples: "Enthält ein Sample von", "sampled_in": "Wurde gesampelt in",
  interpolates: "Verwendet eine Interpolation von", "interpolated_by": "Wurde interpoliert in",
  "cover_of": "Coverversion von", "covered_by": "Wurde gecovert von",
  "remix_of": "Remix von", "remixed_by": "Wurde remixt von",
};
export function parseGeniusSongV447(raw: unknown, referents: unknown = null): GeniusSongInsightsV447 | null {
  const song = object(raw), id = finiteNumber(song.id);
  const url = safeGeniusUrlV447(song.url);
  if (!id || !url || !str(song.title)) return null;
  const insights: GeniusInsightV447[] = [];
  const add = (kind: GeniusInsightKindV447, title: string, text: string, link = url, fragment?: string) => {
    if (!text || insights.length >= 12) return;
    insights.push({ id: `${kind}-${insights.length}`, kind, title, text, url: link, ...(fragment ? { lyricFragment: fragment } : {}) });
  };
  const description = excerptV447(object(song.description).plain, 170);
  if (description && description.length >= 35 && !/^\?+$/.test(description)) add("story", "Hintergrund zum Song", description);
  const producers = namesV447(song.producer_artists);
  if (producers.length) add("credit", "Produktion", producers.join(" · "));
  const writers = namesV447(song.writer_artists).filter(x => !producers.includes(x));
  if (writers.length) add("credit", "Songwriting", writers.join(" · "));
  const features = namesV447(song.featured_artists);
  if (features.length) add("feature", "Weitere Künstler", features.join(" · "));
  const release = excerptV447(song.release_date_for_display, 55);
  if (release) add("release", "Veröffentlichung", release);
  for (const rel of arr(song.song_relationships)) {
    const r = object(rel), label = relationLabels[str(r.relationship_type)];
    if (!label) continue;
    const related = arr(r.songs).map(object).find(x => str(x.title) && safeGeniusUrlV447(x.url));
    if (!related) continue;
    const relatedArtist = str(object(related.primary_artist).name);
    add("sample", label, excerptV447(`${str(related.title)}${relatedArtist ? ` – ${relatedArtist}` : ""}`, 120), safeGeniusUrlV447(related.url) ?? url);
    if (insights.filter(x => x.kind === "sample").length >= 2) break;
  }
  // Optional referents have no timestamps. Keep only a very short excerpt and link to Genius.
  for (const ref of arr(referents).slice(0, 30)) {
    const r = object(ref), fragment = excerptV447(r.fragment, 130);
    const annotation = object(arr(r.annotations)[0]);
    const body = excerptV447(object(annotation.body).plain, 125);
    const link = safeGeniusUrlV447(annotation.url) ?? safeGeniusUrlV447(r.url);
    if (!link || fragment.length < 18 || body.length < 35) continue;
    add("annotation", "Genius erklärt die Zeile", body, link, fragment);
    if (insights.filter(x => x.kind === "annotation").length >= 3) break;
  }
  const portrait = safeGeniusArtistImageV448(object(song.primary_artist).image_url);
  return { songId: id, songTitle: excerptV447(song.title, 130), artist: excerptV447(object(song.primary_artist).name, 80), url, insights, ...(portrait ? {artistImageUrl:portrait} : {}), discoveries:buildGeniusMusicDiscoveryV449(song) };
}
function matchedAnnotationV447(fragment: string, line: string): boolean {
  const f = normalizedSongTextV447(fragment), l = normalizedSongTextV447(line);
  if (f.length < 15 || l.length < 15) return false;
  if (f.includes(l) && l.length >= 22 || l.includes(f) && f.length >= 22) return true;
  return likenessV447(f, l) > 0.79;
}
/** Only generic cards rotate; an annotation is eligible ONLY on a matching synced lyric line. */
export function selectGeniusInsightV447(
  data: GeniusSongInsightsV447 | null, progressMs: number,
  lyrics: {synced:boolean;lines:{text:string}[]} | null, activeLine: number, playing: boolean,
): GeniusInsightV447 | null {
  if (!data || !playing || !Number.isFinite(progressMs) || progressMs < 12000) return null;
  const verse = lyrics?.synced && activeLine >= 0 ? lyrics.lines[activeLine]?.text ?? "" : "";
  if (verse) {
    const annotation = data.insights.find(x => x.kind === "annotation" && x.lyricFragment && matchedAnnotationV447(x.lyricFragment, verse));
    if (annotation) return annotation;
  }
  // Eleven seconds of information followed by 17 seconds clear stage/lyrics space.
  const cycle = Math.floor((progressMs - 12000) / 28000);
  const within = (progressMs - 12000) % 28000;
  if (within >= 11000) return null;
  const generic = data.insights.filter(x => x.kind !== "annotation");
  return generic.length ? generic[cycle % generic.length] : null;
}
