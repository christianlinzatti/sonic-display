"use client";
import {planMusicConnectionSpotlightV450} from "@/services/genius/musicConnectionsSpotlightV450";
import {musicDiscoverySearchQueryV449,MUSIC_DISCOVERY_SEARCH_EVENT_V449,type GeniusDiscoveryV449} from "@/services/genius/musicDiscoveryV449";

type Props={items:GeniusDiscoveryV449[];trackId:string;sourceTitle:string;albumCoverUrl:string|null;progressMs:number;playing:boolean;reducedMotion:boolean};
/** A short in-flow card: no fixed overlay, no changes to the camera, avatar, or lyrics layers. */
export function GeniusMusicConnectionsV450({items,trackId,sourceTitle,albumCoverUrl,progressMs,playing,reducedMotion}:Props){
  const cue=planMusicConnectionSpotlightV450(items,sourceTitle,progressMs,playing);
  if(!cue)return null;
  const search=()=>{
    const query=musicDiscoverySearchQueryV449(cue.spotifyQuery);
    if(query)window.dispatchEvent(new CustomEvent(MUSIC_DISCOVERY_SEARCH_EVENT_V449,{detail:{query}}));
  };
  return <aside className={`genius-music-spotlight-v450 genius-music-spotlight-v450-${cue.kind}`} key={`${trackId}-${cue.id}`}
    data-reduced-motion={reducedMotion?"true":"false"} aria-label="Genius Musikverbindung" aria-live="off">
    <div className="genius-music-spotlight-v450-eyebrow"><span aria-hidden="true">✦</span> {cue.heading}<span className="genius-music-spotlight-v450-source">GENIUS</span></div>
    <div className="genius-music-spotlight-v450-nodes">
      <div className="genius-music-spotlight-v450-current">
        {albumCoverUrl?<img src={albumCoverUrl} alt="" loading="lazy"/>:<span className="genius-music-spotlight-v450-note" aria-hidden="true">♫</span>}
        <span title={cue.sourceTitle}>Aktueller Song<strong>{cue.sourceTitle}</strong></span>
      </div>
      <div className="genius-music-spotlight-v450-relation"><span aria-hidden="true">↳</span><span>{cue.relation}</span></div>
      <div className="genius-music-spotlight-v450-target"><strong title={cue.targetTitle}>{cue.targetTitle}</strong>{cue.targetArtist&&<small>{cue.targetArtist}</small>}</div>
    </div>
    <div className="genius-music-spotlight-v450-actions"><a href={cue.geniusUrl} target="_blank" rel="noopener noreferrer">Auf Genius ansehen ↗</a><button type="button" onClick={search}>Bei Spotify suchen ↗</button></div>
  </aside>;
}
