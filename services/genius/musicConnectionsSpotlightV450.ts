import type {GeniusDiscoveryV449} from "./musicDiscoveryV449";

/** V450 uses only existing, verified Genius edges/credits; not voice identification or similarity. */
export type MusicConnectionSpotlightV450 = {
  id:string;
  kind:GeniusDiscoveryV449["kind"];
  heading:string;
  relation:string;
  sourceTitle:string;
  targetTitle:string;
  targetArtist:string|null;
  geniusUrl:string;
  spotifyQuery:string;
};
const START_MS = 25_000;
const INTERVAL_MS = 56_000;
const VISIBLE_MS = 10_000;
/** Stable timeline cues even after seeking: avoids re-render churn or random animations. */
export function planMusicConnectionSpotlightV450(
  items: readonly GeniusDiscoveryV449[] | null | undefined,
  sourceTitle:string,
  progressMs:number,
  playing:boolean,
): MusicConnectionSpotlightV450|null {
  if(!playing || !items?.length || !Number.isFinite(progressMs) || progressMs < START_MS) return null;
  const elapsed=progressMs-START_MS;
  if(elapsed % INTERVAL_MS >= VISIBLE_MS)return null;
  const slot=Math.floor(elapsed/INTERVAL_MS);
  // Alternate verified links and credits naturally, without inventing other songs or a singer ID.
  const candidates=items.filter(item=>
    Boolean(item.title && item.reason && item.spotifyQuery && item.geniusUrl)
    && /^https:\/\/(?:[a-z0-9-]+\.)*genius\.com(?:\/|$)/i.test(item.geniusUrl)
    && item.spotifyQuery.length<=70
  ).slice(0,11);
  if(!candidates.length)return null;
  const item=candidates[slot%candidates.length];
  const heading=item.kind==="related-song"?"MUSIKVERBINDUNG":item.kind==="producer"?"PRODUCER SPOTLIGHT":"FEATURE SPOTLIGHT";
  return {
    id:`v450-${slot}-${item.id}`, kind:item.kind, heading, relation:item.reason,
    sourceTitle:sourceTitle.trim().slice(0,105)||"Aktueller Song",
    targetTitle:item.title, targetArtist:item.artist??null,
    geniusUrl:item.geniusUrl, spotifyQuery:item.spotifyQuery,
  };
}
