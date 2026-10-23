"use client";
import {rotatingGeniusDiscoveryV449,musicDiscoverySearchQueryV449,MUSIC_DISCOVERY_SEARCH_EVENT_V449,type GeniusDiscoveryV449} from "@/services/genius/musicDiscoveryV449";

type Props={items:GeniusDiscoveryV449[];trackId:string;progressMs:number;playing:boolean;reducedMotion:boolean};
/** Compact, optional disclosure below Genius insights, never an overlay over lyrics or GLB avatars. */
export function GeniusMusicDiscoveryV449({items,trackId,progressMs,playing,reducedMotion}:Props){
  if(!items.length)return null;
  const cue=rotatingGeniusDiscoveryV449(items,progressMs,playing);
  const openSpotifySearch=(item:GeniusDiscoveryV449)=>{
    const query=musicDiscoverySearchQueryV449(item.spotifyQuery);
    if(!query)return;
    window.dispatchEvent(new CustomEvent(MUSIC_DISCOVERY_SEARCH_EVENT_V449,{detail:{query}}));
  };
  return <details className="genius-discovery-v449" data-reduced-motion={reducedMotion?"true":"false"} key={trackId}>
    <summary><span className="genius-discovery-v449-icon" aria-hidden="true">✦</span> Musikverbindungen entdecken
      {cue&&<span className="genius-discovery-v449-teaser">{cue.kind==="related-song"?"Song":cue.kind==="producer"?"Produzent":"Feature"}: {cue.title}</span>}
    </summary>
    <div className="genius-discovery-v449-body">
      <p className="genius-discovery-v449-note">Direkte Genius-Verbindungen und Song-Credits – keine automatisch errechneten Hör-Empfehlungen. Die Spotify-Suche prüft erst, ob ein passender Titel verfügbar ist.</p>
      <ul className="genius-discovery-v449-list">
        {items.map(item=><li key={item.id}>
          <span className="genius-discovery-v449-reason">{item.reason}</span>
          <strong>{item.title}</strong>
          {item.artist&&<span className="genius-discovery-v449-artist">{item.artist}</span>}
          <span className="genius-discovery-v449-actions">
            <a href={item.geniusUrl} rel="noopener noreferrer" target="_blank">Genius ↗</a>
            <button type="button" onClick={()=>openSpotifySearch(item)} aria-label={`${item.title} bei Spotify suchen`}>Auf Spotify suchen ↗</button>
          </span>
        </li>)}
      </ul>
    </div>
  </details>;
}
