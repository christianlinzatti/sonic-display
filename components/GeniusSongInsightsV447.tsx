"use client";
import {useEffect,useMemo,useState} from "react";
import type {Lyrics,Track} from "@/types/music";
import {selectGeniusInsightV447,type GeniusSongInsightsV447} from "@/services/genius/songInsightsV447";
import {planCinematicInsightV448} from "@/services/genius/cinematicInsightsV448";
import {GeniusMusicDiscoveryV449} from "@/components/GeniusMusicDiscoveryV449";
import {GeniusMusicConnectionsV450} from "@/components/GeniusMusicConnectionsV450";
import {planMusicConnectionSpotlightV450} from "@/services/genius/musicConnectionsSpotlightV450";
import {chooseAutomaticInsightV451,type VisualBalanceV451} from "@/services/show/visualBalanceV451";

type Props={track:Track;lyrics:Lyrics|null;progressMs:number;activeIndex:number;playing:boolean;cinematicEnabled?:boolean;discoveryEnabled?:boolean;connectionSpotlightEnabled?:boolean;reducedMotion?:boolean;visualBalanceV451?:VisualBalanceV451;smartBalanceEnabledV451?:boolean};
export function GeniusSongInsightsV447({track,lyrics,progressMs,activeIndex,playing,cinematicEnabled=true,discoveryEnabled=true,connectionSpotlightEnabled=true,reducedMotion=false,visualBalanceV451,smartBalanceEnabledV451=true}:Props){
  const [result,setResult]=useState<{id:string;data:GeniusSongInsightsV447|null}|null>(null);
  useEffect(()=>{
    const controller=new AbortController();
    const id=track.id;
    // No frontend token or cross-origin request; canceled on track switch.
    const qs=new URLSearchParams({title:track.title,artist:track.artists[0]||track.artist});
    fetch(`/api/genius/insights?${qs}`,{signal:controller.signal,credentials:"same-origin"})
      .then(response=>response.ok?response.json():null)
      .then((body:unknown)=>{
        if(controller.signal.aborted)return;
        const record=body && typeof body==="object" ? body as {data?:GeniusSongInsightsV447|null} : null;
        setResult({id,data:record?.data??null});
      }).catch(()=>{if(!controller.signal.aborted)setResult({id,data:null});});
    return()=>controller.abort();
  },[track.id,track.title,track.artist,track.artists[0]]);
  const data=result!==null&&result.id===track.id?result.data:null;
  const candidateCard=useMemo(()=>selectGeniusInsightV447(data,progressMs,lyrics,activeIndex,playing),[data,progressMs,lyrics,activeIndex,playing]);
  // The same deterministic cue is used for card arbitration, so V447 and V450 cannot
  // pop up together. While no automatic card is authorized, V449 remains accessible.
  const hasConnectionCandidate=!!(connectionSpotlightEnabled&&data?.discoveries?.length&&
    planMusicConnectionSpotlightV450(data.discoveries,data.songTitle,progressMs,playing));
  const choice=visualBalanceV451&&smartBalanceEnabledV451 ? chooseAutomaticInsightV451({enabled:true,balance:visualBalanceV451,
    hasRegularCard:!!candidateCard,hasConnectionCard:hasConnectionCandidate}):"legacy";
  const card=choice==="regular"||choice==="legacy" ? candidateCard : null;
  const scene=useMemo(()=>cinematicEnabled&&(!visualBalanceV451||visualBalanceV451.allowCinematic||!smartBalanceEnabledV451)?planCinematicInsightV448(data,progressMs,lyrics,activeIndex,playing,Boolean(track.albumCoverUrl)):null,
    [cinematicEnabled,data,progressMs,lyrics,activeIndex,playing,track.albumCoverUrl,visualBalanceV451,smartBalanceEnabledV451]);
  const discovery=discoveryEnabled&&data?.discoveries?.length ? <GeniusMusicDiscoveryV449 items={data.discoveries} trackId={track.id} progressMs={progressMs} playing={playing} reducedMotion={reducedMotion}/> : null;
  const connectionSpotlight=(choice==="connection"||choice==="legacy")&&connectionSpotlightEnabled&&data?.discoveries?.length
    ? <GeniusMusicConnectionsV450 items={data.discoveries} trackId={track.id} sourceTitle={data.songTitle}
        albumCoverUrl={track.albumCoverUrl} progressMs={progressMs} playing={playing} reducedMotion={reducedMotion}/>
    : null;
  if(!card&&!discovery&&!connectionSpotlight)return null;
  if(!card||!cinematicEnabled||!scene) return <>{card&&<aside className="genius-insights-v447" aria-label="Genius Song Insights" key={card.id}>
    <div className="genius-insights-v447-eyebrow">GENIUS · SONG INSIGHTS</div>
    <strong>{card.title}</strong>
    <p>{card.text}</p>
    <a href={card.url} target="_blank" rel="noopener noreferrer" aria-label={`${card.title} auf Genius öffnen`}>Auf Genius ansehen ↗</a>
  </aside>}{connectionSpotlight}{discovery}</>;
  const imageUrl=scene.imageKind==="artist"?data?.artistImageUrl:scene.imageKind==="album"?track.albumCoverUrl:null;
  const sceneClass=`genius-insights-v447 genius-cinematic-v448 genius-cinematic-v448-${scene.mode}`;
  return <><aside className={sceneClass} aria-label="Genius Song Insights" data-v448-cinematic="true" data-reduced-motion={reducedMotion?"true":"false"} key={`${track.id}-${scene.id}`}>
    <div className="genius-insights-v447-eyebrow">GENIUS · SONG INSIGHTS</div>
    {scene.mode==="artist-photo" && imageUrl ? <div className="genius-v448-photo-scene">
      <img src={imageUrl} alt={scene.imageKind==="artist"?`Künstlerfoto ${data?.artist||track.artist}`:`Albumcover ${track.album}`} loading="lazy" referrerPolicy="no-referrer" />
      <div className="genius-v448-photo-copy"><span>{scene.imageKind==="artist"?"ARTIST SPOTLIGHT":"ALBUM SPOTLIGHT"}</span><strong>{scene.imageKind==="artist"?(data?.artist||track.artist):track.album}</strong></div>
    </div> : scene.mode==="sample-timeline" ? <div className="genius-v448-timeline">
      <strong>Musikalische Verbindungen</strong>
      <div className="genius-v448-current-song" title={data?.songTitle}>{data?.songTitle} · {data?.artist}</div>
      <div className="genius-v448-relation-list">{scene.relationships.map(rel=><div className="genius-v448-relation" key={rel.id}>
        <span className="genius-v448-relation-label">{rel.title}</span>
        <a href={rel.url} rel="noopener noreferrer" target="_blank">{rel.text} ↗</a>
      </div>)}</div>
      <a className="genius-v448-source" href={data?.url} target="_blank" rel="noopener noreferrer">Song auf Genius ansehen ↗</a>
    </div> : scene.mode==="credits" ? <div className="genius-v448-credits">
      <strong>{card.title}</strong>
      <div className="genius-v448-credit-list">{scene.credits.map((credit,index)=><span className="genius-v448-credit" key={`${credit}-${index}`}>{credit}</span>)}</div>
      <a className="genius-v448-source" href={card.url} target="_blank" rel="noopener noreferrer">Credits auf Genius ansehen ↗</a>
    </div> : <div className="genius-v448-story">
      <strong>{card.title}</strong>
      <p>{card.text}</p>
      <a className="genius-v448-source" href={card.url} target="_blank" rel="noopener noreferrer">Auf Genius ansehen ↗</a>
    </div>}
  </aside>{connectionSpotlight}{discovery}</>;
}
