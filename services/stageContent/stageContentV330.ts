/** V330 — browser-safe configuration and content contracts for the stage display. */
export type StageContentSourceV330 = "canvas" | "cover" | "text" | "photos" | "concerts";
export type StageContentKindV330 = "video" | "image" | "text" | "events";
export interface ConcertEventV330 { date: string; title: string; venue: string; city: string; url?: string; posterUrl?:string; posterUrls?:string[]; status?:string; }
export interface StageContentV330 {
  source: StageContentSourceV330;
  kind: StageContentKindV330;
  title: string;
  url?: string;
  images?: string[];
  imageCredits?: Record<string,string>;
  text?: string;
  events?: ConcertEventV330[];
}
export interface StageContentSettingsV330 {
  enabled: boolean;
  sources: Record<StageContentSourceV330, boolean>;
  rotationSeconds: number;
  screenScale: number;
  screenHeight: number;
  position: "behind" | "left" | "right";
  accentFromCover: boolean;
  /** Relative, same-origin Next.js API endpoints, not arbitrary client-side proxy URLs. */
  endpoints: { text: string; photos: string; concerts: string };
}
export const STAGE_CONTENT_KEY_V330 = "sonic-stage-content-v330";
export const STAGE_CONTENT_EVENT_V330 = "sonic:stage-content-settings-v330";
export const DEFAULT_STAGE_CONTENT_V330: StageContentSettingsV330 = {
  enabled: false,
  sources: { canvas: true, cover: true, text: false, photos: false, concerts: false },
  rotationSeconds: 18, screenScale: 1, screenHeight: 1.1, position: "behind", accentFromCover: false,
  endpoints: { text: "/api/stage-content/bio?artist={artist}", photos: "/api/stage-content/artist?artist={artist}", concerts: "/api/stage-content/concerts?artist={artist}" },
};
const isRecord = (x: unknown): x is Record<string,unknown> => !!x && typeof x === "object" && !Array.isArray(x);
const clamp = (n: unknown, fallback: number, a: number, b: number) => typeof n === "number" && Number.isFinite(n) ? Math.min(b,Math.max(a,n)) : fallback;
/** Restrict client-configured API URLs to local /api routes to avoid credential exposure. */
export function validStageEndpointV330(value: unknown): string {
  if (typeof value !== "string" || value.length > 320) return "";
  const v=value.trim();
  if (!/^\/api\/(?!\/)[a-zA-Z0-9/_?=&{}%.+~-]*$/.test(v) || v.includes("..") || v.includes("\\")) return "";
  return v;
}
export function sanitizeStageSettingsV330(raw: unknown): StageContentSettingsV330 {
  if (!isRecord(raw)) return { ...DEFAULT_STAGE_CONTENT_V330, sources: { ...DEFAULT_STAGE_CONTENT_V330.sources }, endpoints: { ...DEFAULT_STAGE_CONTENT_V330.endpoints } };
  const sources = isRecord(raw.sources) ? raw.sources : {};
  const endpoints = isRecord(raw.endpoints) ? raw.endpoints : {};
  return {
    enabled: raw.enabled === true,
    sources: {
      canvas: sources.canvas !== false,
      cover: sources.cover !== false,
      text: sources.text === true,
      photos: sources.photos === true,
      concerts: sources.concerts === true,
    },
    rotationSeconds: clamp(raw.rotationSeconds, 18, 5, 120),
    screenScale: clamp(raw.screenScale, 1, .5, 2),
    screenHeight: clamp(raw.screenHeight, 1.1, -0.4, 2.8),
    position: raw.position === "left" || raw.position === "right" ? raw.position : "behind",
    accentFromCover: raw.accentFromCover === true,
    endpoints: {
      text: typeof endpoints.text === "string" && endpoints.text.trim() ? validStageEndpointV330(endpoints.text) : DEFAULT_STAGE_CONTENT_V330.endpoints.text,
      photos: validStageEndpointV330(endpoints.photos),
      concerts: typeof endpoints.concerts === "string" && endpoints.concerts.trim() ? validStageEndpointV330(endpoints.concerts) : DEFAULT_STAGE_CONTENT_V330.endpoints.concerts,
    },
  };
}
export function readStageContentV330(): StageContentSettingsV330 {
  if (typeof window === "undefined") return sanitizeStageSettingsV330(null);
  try { return sanitizeStageSettingsV330(JSON.parse(localStorage.getItem(STAGE_CONTENT_KEY_V330) || "null")); } catch { return sanitizeStageSettingsV330(null); }
}
export function saveStageContentV330(settings: StageContentSettingsV330) {
  const safe = sanitizeStageSettingsV330(settings);
  if (typeof window !== "undefined") {
    try { localStorage.setItem(STAGE_CONTENT_KEY_V330, JSON.stringify(safe)); } catch { /* no storage access */ }
    window.dispatchEvent(new Event(STAGE_CONTENT_EVENT_V330));
  }
  return safe;
}
/** Placeholders are URL-encoded; route must reside on this application's origin. */
export function buildStageEndpointV330(template: string, track: { id: string; artist: string; title: string }): string {
  const valid=validStageEndpointV330(template);
  if (!valid) return "";
  return valid.replace(/\{(artist|trackId|title)\}/g, (_,key:string) => encodeURIComponent(key === "artist" ? track.artist : key === "trackId" ? track.id : track.title));
}
/** External media must be HTTPS (HTTP is permitted only for local development). */
export function safeStageMediaV330(input: unknown): string | undefined {
  if (typeof input !== "string" || input.length > 2048) return undefined;
  try {
    const url=new URL(input);
    if (url.protocol === "https:" || url.protocol === "http:" && (url.hostname === "localhost" || url.hostname === "127.0.0.1")) return url.href;
  } catch { /* empty / invalid URL */ }
  return undefined;
}
const limited=(input: unknown, length: number) => typeof input === "string" ? input.slice(0,length).trim() : "";
/** Normalize independent API adapters to a single renderer contract. */
export function normalizeStageResponseV330(source: "text"|"photos"|"concerts", input: unknown): StageContentV330 | null {
  if (!isRecord(input)) return null;
  if (source === "text") {
    const text = limited(input.text ?? input.description ?? input.bio, 1600);
    return text ? { source, kind: "text", title: limited(input.title,90) || "Über den Künstler", text } : null;
  }
  if (source === "photos") {
    const images = Array.isArray(input.images) ? input.images : [];
    const gallery=[...images.map(x=>safeStageMediaV330(isRecord(x)?x.url:x)),safeStageMediaV330(input.imageUrl??input.photoUrl??input.url)].filter((x):x is string=>!!x);
    const unique=[...new Set(gallery)].slice(0,12);
    const credits=isRecord(input.credits)?input.credits:{};
    return unique.length ? {source,kind:"image",title:limited(input.title,90)||"Künstlerfoto",url:unique[0],images:unique,imageCredits:Object.fromEntries(unique.map(url=>[url,limited(credits[url],320)]).filter(([,credit])=>!!credit))} : null;
  }
  const list=Array.isArray(input.events) ? input.events : Array.isArray(input.concerts) ? input.concerts : [];
  const events=list.slice(0,12).filter(isRecord).map(event=>({
    date: limited(event.date ?? event.startDate,32),
    title: limited(event.title ?? event.name,95),
    venue: limited(event.venue,90), city: limited(event.city,70),
    url: safeStageMediaV330(event.url), posterUrl:safeStageMediaV330(event.posterUrl ?? event.imageUrl), posterUrls:[...new Set([...(Array.isArray(event.posterUrls)?event.posterUrls:[]),event.posterUrl,event.imageUrl].map(safeStageMediaV330).filter((x):x is string=>!!x))].slice(0,12), status:limited(event.status,40),
  })).filter(event=>event.date && event.title);
  return events.length ? {source,kind:"events",title:limited(input.title,90)||"Nächste Konzerte",events} : null;
}
export function selectStageSlidesV330(slides: StageContentV330[], index: number): StageContentV330 | null {
  return slides.length ? slides[Math.max(0,Math.floor(index)) % slides.length] : null;
}
