"use client";
import {backgroundJsonV1009 as fetch} from '@/lib/backgroundJsonV1009';
import {useCallback,useEffect,useMemo,useState} from "react";
import {useMusic} from "@/context/MusicContext";
import {useAudioAnalysis} from "@/context/AudioAnalysisContext";
import {useUiPreferences} from "@/context/UiPreferencesContext";
import {loadCharacterMotionStore,CHARACTER_MOTION_CHANGE_EVENT} from "@/components/visualizer/characterMotionLibrary";
import {GENRE_DANCE_SETTINGS_EVENT_V666,refreshGenreDanceSettingsV666} from "@/components/visualizer/genreDancePerformanceV666";
import {getLiveVocalEnvelopeV661} from "@/components/visualizer/vocalAnalysisStudioV661";
import {DiagnosticAssistantV668} from "@/components/DiagnosticAssistantV668";
import {ConnectedServicesMonitorV725} from "@/components/ConnectedServicesMonitorV725";
import {ConcertQualityDashboardV751} from "@/components/visualizer/ConcertQualityDashboardV751";
import {PerformanceMemoryDashboardV770} from "@/components/visualizer/PerformanceMemoryDashboardV770";
import type {ConfigurationSnapshotV667,ServiceConfigurationV667} from "@/services/system/configurationStatusV667";

type RuntimeRow={id:string;label:string;configured:boolean|null;enabled:boolean|null;health:"ok"|"warning"|"error"|"unknown";detail:string;group:"live"|"local"|"external"};
const boolLabel=(value:boolean|null)=>value===null?"Unbekannt":value?"Ja":"Nein";
const healthLabel=(health:RuntimeRow["health"])=>({ok:"Funktioniert",warning:"Eingeschränkt",error:"Fehler",unknown:"Nicht geprüft"})[health];
function makeExternalRow(item:ServiceConfigurationV667,activeLyricsProvider:string|null):RuntimeRow{
  // A successful lyric lookup confirms only the provider that returned the current track.
  const matches=({lrclib:"lrclib","lyrics-ovh":"lyrics.ovh",genius:"genius","spotify-lyrics":"spotify"} as Record<string,string>)[item.id];
  const selected=Boolean(matches&&activeLyricsProvider===matches);
  return {id:item.id,label:item.label,configured:item.configured,enabled:item.enabled,
    health:selected?"ok":"unknown",group:"external",
    detail:selected?"Hat Lyrics für den aktuellen Song geliefert":item.note};
}
export function ServiceStatusDashboardV667({onNavigate}:{onNavigate:(tab:"audio"|"avatar"|"display"|"diagnostics")=>void}){
  const music=useMusic();
  const audio=useAudioAnalysis();
  const {preferences}=useUiPreferences();
  const [server,setServer]=useState<ConfigurationSnapshotV667|null>(null);
  const [lastChecked,setLastChecked]=useState<number|null>(null);
  const [loading,setLoading]=useState(false);
  const [serverError,setServerError]=useState(false);
  const [local,setLocal]=useState(()=>({automatic:true,motions:0,genreSettings:{enabled:true,style:"auto" as string},vocalSlots:0}));
  const refreshLocal=useCallback(()=>{
    const store=loadCharacterMotionStore();
    const settings=refreshGenreDanceSettingsV666();
    setLocal({automatic:store.automatic,motions:store.motions.length,genreSettings:{enabled:settings.enabled,style:settings.style},vocalSlots:getLiveVocalEnvelopeV661()?.slots.length??0});
  },[]);
  const refreshServer=useCallback(async()=>{
    setLoading(true);
    try{
      const response=await fetch("/api/system/status",{cache:"no-store"});
      if(!response.ok)throw Error("Status-Endpunkt nicht erreichbar");
      const result:ConfigurationSnapshotV667=await response.json();
      if(result.version!==667||!Array.isArray(result.services))throw Error("Ungültige Statusantwort");
      setServer(result);setServerError(false);setLastChecked(Date.now());
    }catch{setServerError(true);setServer(null);setLastChecked(null);}
    finally{setLoading(false);}
  },[]);
  useEffect(()=>{
    refreshLocal();void refreshServer();
    const tick=window.setInterval(()=>{refreshLocal();void refreshServer();},60_000);
    window.addEventListener(CHARACTER_MOTION_CHANGE_EVENT,refreshLocal);
    window.addEventListener(GENRE_DANCE_SETTINGS_EVENT_V666,refreshLocal);
    window.addEventListener("storage",refreshLocal);
    return()=>{window.clearInterval(tick);window.removeEventListener(CHARACTER_MOTION_CHANGE_EVENT,refreshLocal);
      window.removeEventListener(GENRE_DANCE_SETTINGS_EVENT_V666,refreshLocal);window.removeEventListener("storage",refreshLocal);};
  },[refreshLocal,refreshServer]);

  const activeLyricsProvider=music.track&&music.lyrics?music.lyrics.provider:null;
  const rows=useMemo<RuntimeRow[]>(()=>{
    const playing=Boolean(music.track&&music.isPlaying);
    const freshness=music.fetchedAt>0&&Date.now()-music.fetchedAt<30_000;
    const spotifyHealth=music.error?"error":music.connected&&freshness?"ok":"unknown";
    const spotifyConfigured=server?.services.find(s=>s.id==="spotify")?.configured??null;
    const genreLabel=music.genre?String(music.genre):"Nicht erkannt";
    const profileReady=local.genreSettings.enabled&&local.genreSettings.style!=="auto";
    const knownGenre=Boolean(music.genre);
    const runtime:RuntimeRow[]=[
      {id:"spotify-live",label:"Spotify-Verbindung",configured:spotifyConfigured,enabled:spotifyConfigured,
       health:spotifyHealth,group:"live",detail:music.error??(music.connected?(music.track?`${music.track.artist} – ${music.track.title}`:"Verbunden; kein Song läuft"):"Keine aktive Verbindung bestätigt")},
      {id:"lyrics-live",label:"Lyrics des aktuellen Songs",configured:true,enabled:preferences.lyricsVisible,group:"live",
       health:!music.track?"unknown":music.lyrics?"ok":"unknown",
       detail:music.lyrics?`Quelle: ${music.lyrics.provider} · ${music.lyrics.synced?"zeitlich synchronisiert":"nicht synchronisiert"}`:
       music.track?"Für diesen Song derzeit keine Lyrics bestätigt":"Kein Song ausgewählt"},
      {id:"mic",label:"Mikrofonanalyse",configured:audio.error?false:audio.active?true:null,enabled:audio.enabled,
       health:audio.error?"error":audio.enabled?(audio.active?"ok":"warning"):"unknown",group:"live",
       detail:audio.error??(audio.enabled?(audio.active?"Audioanalyse aktiv":"Mikrofon derzeit nicht aktiv"):"Ausgeschaltet")},
      {id:"vocal-stem",label:"Vocal-Stem-Analyse",configured:local.vocalSlots>0,enabled:local.vocalSlots>0,
       health:local.vocalSlots>0?"ok":"unknown",group:"live",
       detail:local.vocalSlots>0?`${local.vocalSlots} Vocal-Slots für aktuellen Song bereitgestellt`:"Keine geladenen Vocal-Features für den aktuellen Song"},
      {id:"genre",label:"Genre-Erkennung",configured:true,enabled:true,health:knownGenre?"ok":music.genreStatus==="error"?"warning":"unknown",group:"local",
       detail:`Genre: ${genreLabel} · Quelle: ${music.genreSource??"unbekannt"}`},
      {id:"genre-auto",label:"Genre-Tanzautomatik",configured:true,enabled:local.genreSettings.enabled,
       health:!local.genreSettings.enabled?"unknown":(knownGenre||profileReady)?"ok":"warning",group:"local",
       detail:local.genreSettings.style==="auto"?(knownGenre?`Automatisch: ${genreLabel}`:"Automatisch; Genre unbekannt"):`Fest gewählt: ${local.genreSettings.style}`},
      {id:"motion",label:"Motion-Bibliothek",configured:local.motions>0,enabled:local.automatic,
       health:local.automatic&&local.motions>0?"ok":local.automatic?"warning":"unknown",group:"local",
       detail:`${local.motions} installierte Motion-Einträge · ${local.automatic?"automatische Auswahl":"manuelle Auswahl"}`},
      {id:"director",label:"Konzertregie",configured:true,enabled:preferences.smartConcertDirectorEnabledV568===true,
       health:"unknown",group:"local",detail:"Regie-Option; tatsächliche Bühnenausgabe hier nicht gemessen"},
      {id:"lipsync",label:"Avatar Lip-Sync",configured:true,enabled:preferences.avatarLipSyncEnabled??null,
       health:"unknown",group:"local",detail:"Einstellungsstatus; Gesichtsrig und laufende Animation nicht geprüft"},
      {id:"playback",label:"Song-Wiedergabe",configured:music.connected,enabled:music.isPlaying,
       health:playing&&freshness?"ok":"unknown",group:"live",
       detail:playing?`Wiedergabe aktiv · ${genreLabel}`:"Keine laufende Wiedergabe bestätigt"},
    ];
    return [...runtime,...(server?.services??[]).filter(s=>s.id!=="spotify").map(s=>makeExternalRow(s,activeLyricsProvider))];
  },[music.connected,music.isPlaying,music.track,music.lyrics,music.error,music.fetchedAt,music.genre,music.genreStatus,music.genreSource,
    audio.enabled,audio.active,audio.error,preferences.lyricsVisible,preferences.smartConcertDirectorEnabledV568,preferences.avatarLipSyncEnabled,
    local,server,activeLyricsProvider]);
  const groups:ReadonlyArray<{id:RuntimeRow["group"];name:string}>=[
    {id:"live",name:"Live-Status"},{id:"local",name:"Lokale Automatik & Bühne"},{id:"external",name:"Dienste & Schnittstellen"}];
  const issues=rows.filter(row=>row.health==="error"||row.health==="warning").length;
  return <div className="v667-dashboard" data-v667-dashboard>
    <ConcertQualityDashboardV751/>
    <PerformanceMemoryDashboardV770/>
    <ConnectedServicesMonitorV725 snapshot={server} serverError={serverError} refreshing={loading} onRefresh={()=>{refreshLocal();void refreshServer();}} spotify={{connected:music.connected,error:music.error,fetchedAt:music.fetchedAt}} lyrics={{hasTrack:Boolean(music.track),provider:activeLyricsProvider,enabled:preferences.lyricsVisible}}/>
    <div className="v667-summary"><div><h3>System- & Service-Dashboard</h3>
      <p>Konfiguration, Aktivierung und bestätigte Funktion werden getrennt angezeigt. Kein Anbieter wird automatisch angepingt.</p>
      <small aria-live="polite">{serverError?"Serverstatus momentan nicht abrufbar":lastChecked?`Serverkonfiguration geprüft: ${new Date(lastChecked).toLocaleTimeString("de-AT")}`:"Serverkonfiguration noch nicht geprüft"} · {issues} Warnungen/Fehler</small></div>
      <button type="button" disabled={loading} onClick={()=>{refreshLocal();void refreshServer();}}>{loading?"Prüfe …":"↻ Aktualisieren"}</button>
    </div>
    <DiagnosticAssistantV668 rows={rows} serverError={serverError} serverLoaded={server!==null} onNavigate={onNavigate} onRefresh={()=>{refreshLocal();void refreshServer();}}/>
    <p className="v667-hint">„Funktioniert“ bedeutet nur, dass ein passendes, aktuelles Laufzeit-Signal vorliegt. „Nicht geprüft“ ist keine Fehlermeldung. Externe APIs werden nicht ohne Auftrag getestet.</p>
    {groups.map(group=><section key={group.id} aria-label={group.name} className="v667-group">
      <h4>{group.name}</h4><div className="v667-items">
        {rows.filter(row=>row.group===group.id).map(row=><article key={row.id} className="v667-item">
          <strong>{row.label}</strong>
          <div className="v667-statuses">
            <span>Konfiguriert: <b>{boolLabel(row.configured)}</b></span>
            <span>Aktiv: <b>{boolLabel(row.enabled)}</b></span>
            <span className={`v667-state v667-${row.health}`}>Status: <b>{healthLabel(row.health)}</b></span>
          </div>
          <small>{row.detail}</small>
        </article>)}
        {group.id==="external"&&!server&&<p className="v667-empty">{serverError?"Serverkonfiguration nicht erreichbar – erneutes Laden möglich":"Serverkonfiguration wird geladen …"}</p>}
      </div>
    </section>)}
    <div className="v667-links">
      <button type="button" onClick={()=>onNavigate("audio")}>Mikrofon & Beat einstellen</button>
      <button type="button" onClick={()=>onNavigate("avatar")}>Avatare & Tanz einstellen</button>
      <button type="button" onClick={()=>onNavigate("diagnostics")}>Performance-Diagnose</button>
      <button type="button" onClick={()=>onNavigate("display")}>Anzeige & Lyrics</button>
    </div>
    <p className="v667-hint">Die Anzeige aktualisiert sich bei geöffnetem Dashboard ungefähr jede Minute und bei relevanten lokalen Änderungen. GPU-VRAM, Provider-Latenzen, letzter Backup-Zeitpunkt und tatsächliche Stem-Trennung benötigen separate Telemetrie; sie werden hier nicht vorgetäuscht.</p>
  </div>;
}
