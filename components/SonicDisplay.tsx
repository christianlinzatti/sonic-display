"use client";
import { PwaSetupV364 } from "@/components/PwaSetupV364";

import { useTouchKiosk } from "@/components/TouchKioskControls";
import { useMusicAwareTheme } from "@/components/MusicAwareThemes";
import { useSmartAmbient } from "@/components/SmartAmbientMode";

import {useEffect,useMemo,useState} from "react";
import dynamic from "next/dynamic";
import { SmartLazySettings } from "@/components/SmartLazySettings";
import { recordLoadMetric } from "@/services/loading/loadingMetrics";
import { recordRuntimeCheckpoint } from "@/services/monitoring/runtimePerformanceV285";
// Keep nonessential UI out of the eager route bundle. The hooks remain eager so
// kiosk/ambient state is stable even while their views are fetched on demand.
const GeniusSongInsightsV447 = dynamic(() => import("@/components/GeniusSongInsightsV447").then(m => m.GeniusSongInsightsV447), { ssr: false });
const KineticLyrics = dynamic(() => import("@/components/KineticLyrics").then(m => m.KineticLyrics), { ssr: false });
const AmbientStandby = dynamic(() => import("@/components/SmartAmbientMode").then(m => m.AmbientStandby), { ssr: false });
const TouchKioskControls = dynamic(() => import("@/components/TouchKioskControls").then(m => m.TouchKioskControls), { ssr: false });
const AutoApplyPerformanceProfile = dynamic(() => import("@/components/visualizer/PerformanceProfiles").then(m => m.AutoApplyPerformanceProfile), { ssr: false });

import {useMusic} from "@/context/MusicContext";
import { ArtistFollowV359 } from "@/components/ArtistFollowV359";
const ArtistDiscoveryV360 = dynamic(() => import("@/components/ArtistDiscoveryV360").then(m => m.ArtistDiscoveryV360), {ssr:false});
const MusicDiscoveryV361 = dynamic(() => import("@/components/MusicDiscoveryV361").then(m => m.MusicDiscoveryV361), {ssr:false});
const ReleaseRadarV362 = dynamic(() => import("@/components/ReleaseRadarV362").then(m => m.ReleaseRadarV362), {ssr:false});
const ReleaseNotificationsV363 = dynamic(() => import("@/components/ReleaseNotificationsV363").then(m => m.ReleaseNotificationsV363), {ssr:false});
import { useLongSessionMonitoring } from "@/hooks/useLongSessionMonitoring";
const AudioVisualizer = dynamic(() => { const start = window.performance.now(); return import("@/components/visualizer/AudioVisualizer").then(module => { recordLoadMetric("Audio-Visualizer: Modul", window.performance.now() - start); return module.AudioVisualizer; }); }, { ssr: false });
const VisualizerStage = dynamic(() => { const start = window.performance.now(); return import("@/components/visualizer/VisualizerStage").then(module => { recordLoadMetric("3D-Bühne: Modul", window.performance.now() - start); return module.VisualizerStage; }); }, { ssr: false });

import {useUiPreferences} from "@/context/UiPreferencesContext";
import {planVisualBalanceV451} from "@/services/show/visualBalanceV451";
import {planUltimateAutomaticShowV456} from "@/services/show/ultimateAutomaticShowV456";
import {buildSmartRapShowV446,sampleSmartRapShowV446} from "@/components/visualizer/smartAutomaticRapShowV446";
function time(ms:number){const s=Math.floor(Math.max(0,ms)/1000);return `${Math.floor(s/60)}:${String(s%60).padStart(2,"0")}`;}
export function SonicDisplay(){useEffect(() => { recordRuntimeCheckpoint("Sonic Display gemountet"); }, []);const kiosk=useTouchKiosk();const {preferences}=useUiPreferences();const {connected,loading,error,track,progressMs,isPlaying,fetchedAt,lyrics,disconnect,genre}=useMusic();useLongSessionMonitoring(connected && isPlaying);useEffect(() => { if (connected) recordRuntimeCheckpoint("Spotify verbunden"); }, [connected]);useEffect(() => { if (track) recordRuntimeCheckpoint("Erster Track verfügbar"); }, [track]);const theme=useMusicAwareTheme(genre,track?.albumCoverUrl);const ambient=useSmartAmbient(isPlaying,connected,Boolean(track),kiosk.enabled);
const experienceClass = kiosk.enabled && kiosk.experience2 ? "sonic-experience-v275" : "";
const displayView = ambient.suggestedView ?? kiosk.view;
const standbyOverlay = ambient.standby ? <AmbientStandby title={track?.title} artist={track?.artist} albumCoverUrl={track?.albumCoverUrl} palette={theme.enabled ? theme.palette : undefined} /> : null;
const [now,setNow]=useState(Date.now());useEffect(()=>{if(!isPlaying)return;const id=window.setInterval(()=>{if(!document.hidden)setNow(Date.now());},250);return()=>window.clearInterval(id);},[isPlaying]);const progress=useMemo(()=>isPlaying?Math.min(progressMs+Math.max(0,now-fetchedAt),track?.durationMs??progressMs):progressMs,[isPlaying,now,progressMs,fetchedAt,track?.durationMs]);const lyricsProgress = Math.max(0, progress + (preferences.lyricsOffsetMs ?? 0));const active=(()=>{let index=-1;for(let i=0;i<(lyrics?.lines.length??0);i++){if(lyricsProgress>=(lyrics?.lines[i].startMs??Infinity))index=i;else break;}return index;})();
const visualBalanceV451=planVisualBalanceV451({enabled:preferences.smartVisualBalanceEnabledV451??true,playing:isPlaying,progressMs:lyricsProgress,lyricsVisible:preferences.lyricsVisible??true,immersiveLyrics:preferences.lyricsImmersiveEnabled??false,lyrics,activeIndex:active});
// V456: the same deterministic director policy feeds passive Genius cards and the 3D stage.
// Song section is a VISUAL approximation, never singer identification.
const showEligibleV456=(preferences.rapSmartShowEnabledV446??true)&&
  (preferences.rapAutoPerformanceEnabledV437??true)&&preferences.visualizerMode==="avatar"&&
  (!genre||/(?:rap|hip[\s-]?hop|trap|drill|grime|boom[\s-]?bap)/i.test(genre));
const castCountV456=Math.max(1,Math.min(preferences.rapMultiArtistMaxV442??4,track?.artists?.length??1));
const rootShowPlanV456=useMemo(()=>buildSmartRapShowV446({
  trackId:track?.id??"",count:castCountV456,lyrics,bpm:105,
  durationMs:track?.durationMs??0,enabled:showEligibleV456&&lyrics?.synced===true,
}),[track?.id,castCountV456,lyrics,track?.durationMs,showEligibleV456]);
const manualDanceV456=preferences.avatarMotionMode==="choreography"||!!preferences.avatarTimelineEnabled||
  !!preferences.avatarBlendEnabled||!!preferences.smartDanceOverride||
  (preferences.avatarDancePreset??"auto")!=="auto";
const vocalAuthoredV456=preferences.avatarManualVocalEnabledV385===true||
  (preferences.vocalTimeEnabledV496===true&&Boolean(track?.id&&
    (preferences.vocalTimeSegmentsV496??{})[track.id]?.length))||
  (preferences.rapDuetEnabledV416===true&&Boolean(track?.id&&
    (preferences.rapDuetAssignmentsV416??{})[track.id]?.length));
const rootShowCueV456=sampleSmartRapShowV446(rootShowPlanV456,lyricsProgress,{
  enabled:showEligibleV456,playing:isPlaying,reducedMotion:preferences.reducedMotion,
  manualProtected:manualDanceV456||vocalAuthoredV456,
});
const unifiedShowV456=planUltimateAutomaticShowV456({
  enabled:showEligibleV456,playing:isPlaying,reducedMotion:preferences.reducedMotion,
  automaticDance:!manualDanceV456,manualVocal:vocalAuthoredV456,
  cue:rootShowCueV456,balance:visualBalanceV451,count:castCountV456,
});if(loading&&!connected)return <main style={theme.enabled ? theme.vars : undefined} className={`screen ${theme.enabled ? "sonic-themed" : ""} ${kiosk.enabled ? `touch-kiosk touch-kiosk-${kiosk.view} ${kiosk.visible ? "touch-kiosk-awake" : ""}` : ""} ${experienceClass} ${kiosk.enabled && kiosk.displayProfile !== "off" ? "touch-v388" : ""}`}><p>SONIC DISPLAY · Loading</p></main>;if(!connected)return <main style={theme.enabled ? theme.vars : undefined} className={`screen ${theme.enabled ? "sonic-themed" : ""} ${kiosk.enabled ? `touch-kiosk touch-kiosk-${kiosk.view} ${kiosk.visible ? "touch-kiosk-awake" : ""}` : ""} ${experienceClass} ${kiosk.enabled && kiosk.displayProfile !== "off" ? "touch-v388" : ""}`}><AutoApplyPerformanceProfile/><TouchKioskControls kiosk={kiosk} ambient={ambient} theme={theme} trackId={track?.id??""}/><SmartLazySettings/><section className="connect"><h1>SONIC DISPLAY</h1><p>Verbinde Spotify, um Titel, Albumcover und Lyrics anzuzeigen.</p>{error&&<p>{error}</p>}<a className="button" href="/api/spotify/login">CONNECT SPOTIFY</a></section></main>;if(!track)return <main style={theme.enabled ? theme.vars : undefined} className={`screen ${theme.enabled ? "sonic-themed" : ""} ${kiosk.enabled ? `touch-kiosk touch-kiosk-${kiosk.view} ${kiosk.visible ? "touch-kiosk-awake" : ""}` : ""} ${experienceClass} ${kiosk.enabled && kiosk.displayProfile !== "off" ? "touch-v388" : ""}`}><AutoApplyPerformanceProfile/><TouchKioskControls kiosk={kiosk} ambient={ambient} theme={theme} trackId=""/><SmartLazySettings/><ArtistDiscoveryV360 currentArtists={undefined}/><MusicDiscoveryV361/><ReleaseRadarV362/><ReleaseNotificationsV363/><PwaSetupV364/><button className="disconnect" onClick={()=>void disconnect()}>Disconnect</button><AudioVisualizer/><VisualizerStage stagePalette={theme.enabled ? theme.palette : undefined}/>{standbyOverlay}<section className="connect"><h1>Nothing playing</h1><p>Starte einen Titel auf Spotify.</p></section></main>;return <main style={theme.enabled ? theme.vars : undefined} className={`screen ${theme.enabled ? "sonic-themed" : ""} ${kiosk.enabled ? `touch-kiosk touch-kiosk-${kiosk.view} ${kiosk.visible ? "touch-kiosk-awake" : ""}` : ""} ${experienceClass} ${kiosk.enabled && kiosk.displayProfile !== "off" ? "touch-v388" : ""}`}>{error&&connected?<div className="connection-warning" role="status">Verbindung gestört – letzter bekannter Titel bleibt sichtbar. Erneuter Versuch läuft automatisch.</div>:null}<AutoApplyPerformanceProfile/><TouchKioskControls kiosk={kiosk} ambient={ambient} theme={theme} trackId=""/><SmartLazySettings/><ArtistDiscoveryV360 currentArtists={undefined}/><MusicDiscoveryV361/><ReleaseRadarV362/><ReleaseNotificationsV363/><PwaSetupV364/><button className="disconnect" onClick={()=>void disconnect()}>Disconnect</button><AudioVisualizer/><VisualizerStage stagePalette={theme.enabled ? theme.palette : undefined} lyrics={lyrics} progressMs={lyricsProgress} activeIndex={active} playing={isPlaying} visualBalanceV451={visualBalanceV451}/>{standbyOverlay}<div className="layout"><section className="track"><div className="experience-v275-label" aria-label="Musikwiedergabestatus"><span className={`experience-v275-dot ${isPlaying ? "is-playing" : ""}`} /> {isPlaying ? "NOW PLAYING" : "PAUSED"}</div><div className="cover">{track.albumCoverUrl?<img src={track.albumCoverUrl} alt={`Albumcover ${track.album}`}/>:"♫"}</div><p className="artist">{track.artist}</p><ArtistFollowV359 key={track.id} artists={track.artistDetails}/><h1>{track.title}</h1><p className="album">{track.album}</p><div className="progress" role="progressbar" aria-label="Fortschritt des aktuellen Titels" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(track.durationMs ? 100*progress/track.durationMs : 0)}><span style={{width:`${track.durationMs?100*progress/track.durationMs:0}%`}}/></div><p className="album">{time(progress)} / {time(track.durationMs)} · {isPlaying?"PLAYING":"PAUSED"}</p><a className="album" href={track.spotifyUrl} target="_blank" rel="noreferrer">Open in Spotify</a>{(preferences.geniusSongInsightsEnabledV447??true) && <GeniusSongInsightsV447 track={track} lyrics={lyrics} progressMs={lyricsProgress} activeIndex={active} playing={isPlaying} cinematicEnabled={preferences.geniusCinematicEnabledV448??true} discoveryEnabled={preferences.geniusDiscoveryEnabledV449??true} connectionSpotlightEnabled={preferences.geniusSpotlightEnabledV450??true} reducedMotion={preferences.reducedMotion} visualBalanceV451={unifiedShowV456.balance} smartBalanceEnabledV451={preferences.smartVisualBalanceEnabledV451??true}/>}</section>{(kiosk.enabled ? displayView !== "stage" : preferences.lyricsVisible && !preferences.lyricsImmersiveEnabled) && <KineticLyrics lyrics={lyrics} progressMs={lyricsProgress} activeIndex={active} playing={isPlaying} genre={genre??""}/>}</div></main>;}
