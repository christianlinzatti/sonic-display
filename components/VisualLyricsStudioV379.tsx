"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { DEFAULT_LYRICS_LAYOUT_V381, normalizeSpatialLayoutV381, parseLayoutPresetsV381,
  type LyricsSpatialLayoutV381, type NamedSpatialLayoutV381 } from "@/components/visualizer/lyricsSpatialEditorV381";
import type { SpatialSafetyV381 } from "@/components/visualizer/SpatialLyricsHandlesV381";
import type { StudioCastV380, StudioCameraModeV380, StudioShotV380 } from "@/components/visualizer/realLyricsPreviewV380";
const RealLyricsStagePreviewV380=dynamic(()=>import("@/components/visualizer/RealLyricsStagePreviewV380").then(m=>m.RealLyricsStagePreviewV380),{ssr:false,loading:()=> <div className="v380-loading">3D-Modelle und Bühne werden geladen …</div>});
import type { CSSProperties } from "react";
import { useUiPreferences } from "@/context/UiPreferencesContext";
import { useMusic } from "@/context/MusicContext";
import { KineticLyrics } from "@/components/KineticLyrics";
import type { UiPreferences } from "@/types/music";
import { activeStudioLineV379, DEMO_DURATION_V379, DEMO_LYRICS_V379,
  resolveStudioCompositionV379, STUDIO_PRESETS_V379, type LyricsStudioPresetV379,
  type LyricsStudioSectionV379 } from "@/components/visualizer/visualLyricsStudioV379";

const fontOptions: {value:NonNullable<UiPreferences["lyricsFontFamilyV379"]>;label:string}[] = [
  {value:"system",label:"Modern"},{value:"bold",label:"Prägnant / Rap"},
  {value:"rounded",label:"Rund / Pop"},{value:"serif",label:"Editorial"},{value:"mono",label:"Monospace"}
];
const asClock = (ms:number) => `${Math.floor(Math.max(0,ms)/60000)}:${String(Math.floor(Math.max(0,ms)%60000/1000)).padStart(2,"0")}`;
const timingNames = { word:"Echte Wortzeitstempel",line:"Nur Zeilenzeitstempel",plain:"Ohne Synchronisierung",missing:"Keine Lyrics" };

/** Controls update the shared preferences used by the real stage; preview never seeks or pauses Spotify. */
export function VisualLyricsStudioV379() {
  const {preferences,updatePreferences} = useUiPreferences();
  const music=useMusic();
  const [source,setSource]=useState<"demo"|"track">("demo");
  const [tab,setTab]=useState<"type"|"motion"|"camera"|"layout">("type");
  const [viewport,setViewport]=useState<"wide"|"display">("wide");
  const [section,setSection]=useState<LyricsStudioSectionV379>("verse");
  const [position,setPosition]=useState(4300);
  const [previewPlaying,setPreviewPlaying]=useState(false);
  const [real3d,setReal3d]=useState(false);
  const [cast,setCast]=useState<StudioCastV380>(1);
  const [leadIndex,setLeadIndex]=useState(0);
  const [cameraMode,setCameraMode]=useState<StudioCameraModeV380>("directed");
  const [shotOverride,setShotOverride]=useState<"auto"|StudioShotV380>("auto");
  const [edit3d,setEdit3d]=useState(false);
  const [autoPlaceRequest,setAutoPlaceRequest]=useState(0);
  const [safety,setSafety]=useState<SpatialSafetyV381|null>(null);
  const [layoutName,setLayoutName]=useState("Mein Lyrics-Layout");
  const [savedLayouts,setSavedLayouts]=useState<NamedSpatialLayoutV381[]>([]);
  const [layoutsLoaded,setLayoutsLoaded]=useState(false);
  const [selectedLayout,setSelectedLayout]=useState("");
  useEffect(()=>{try{setSavedLayouts(parseLayoutPresetsV381(localStorage.getItem("sonic-display-lyrics-layouts-v381")));}catch{}setLayoutsLoaded(true);},[]);
  useEffect(()=>{if(layoutsLoaded)try{localStorage.setItem("sonic-display-lyrics-layouts-v381",JSON.stringify(savedLayouts));}catch{}},[layoutsLoaded,savedLayouts]);
  const layout=normalizeSpatialLayoutV381(preferences.lyricsSpatialLayoutV381);
  const applyLayout=(next:LyricsSpatialLayoutV381)=>updatePreferences({lyricsSpatialLayoutV381:normalizeSpatialLayoutV381(next)});
  const saveLayout=()=>{
    const name=layoutName.trim().slice(0,60);
    if(!name)return;
    const id=`local-${Date.now().toString(36)}-${Math.random().toString(36).slice(2,8)}`;
    setSavedLayouts(previous=>[...previous.slice(-29),{id,name,layout}]);setSelectedLayout(id);
  };
  const loadLayout=(id:string)=>{setSelectedLayout(id);const choice=savedLayouts.find(entry=>entry.id===id);if(choice)applyLayout(choice.layout);};
  const onSafetyChange=(next:SpatialSafetyV381)=>setSafety(previous=>
    previous&&JSON.stringify(previous)===JSON.stringify(next)?previous:next);
  const [now,setNow]=useState(()=>Date.now());
  const realAvailable=Boolean(music.track&&music.lyrics?.lines.length);
  useEffect(()=>{
    if (!previewPlaying || source!=="demo") return;
    const timer=window.setInterval(()=>setPosition(old=>(old+100)%DEMO_DURATION_V379),100);
    return ()=>window.clearInterval(timer);
  },[previewPlaying,source]);
  useEffect(()=>{
    if (source!=="track"||!music.isPlaying) return;
    const timer=window.setInterval(()=>setNow(Date.now()),200);
    return ()=>window.clearInterval(timer);
  },[source,music.isPlaying]);
  const live=source==="track"&&realAvailable;
  const lyrics=live?music.lyrics:DEMO_LYRICS_V379;
  const length=live?Math.max(1,music.track?.durationMs??1):DEMO_DURATION_V379;
  const currentMs=live?Math.max(0,Math.min(length,music.progressMs+(music.isPlaying?Math.max(0,now-music.fetchedAt):0))):position;
  const effectiveMs=Math.max(0,currentMs+(preferences.lyricsOffsetMs??0));
  const active=useMemo(()=>activeStudioLineV379(lyrics??null,effectiveMs),[lyrics,effectiveMs]);
  const immersive=preferences.lyricsImmersiveEnabled??false;
  const composition=resolveStudioCompositionV379({lyrics:lyrics??null,progressMs:effectiveMs,preferences,
    section,playing:live?music.isPlaying:true,immersive:immersive||real3d});
  const update=<K extends keyof UiPreferences>(key:K,value:UiPreferences[K])=>updatePreferences({[key]:value} as Partial<UiPreferences>);
  const size=(name:string,key:keyof UiPreferences,value:number,min:number,max:number,step=5)=>
    <label className="v379-field">{name} <output>{value}{key==="lyricsOffsetMs"?" ms":" %"}</output>
      <input type="range" min={min} max={max} step={step} value={value} onChange={e=>update(key,Number(e.target.value) as never)} />
    </label>;
  return <section className="v379-studio" aria-label="V379 Visual Lyrics Studio">
    <header className="v379-heading"><div><h3>V381 · Visual 3D Lyrics Studio</h3>
      <p>Schrift, 3D-Position, Live-Kamera und gespeicherte Lyrics-Layouts an einem Ort.</p></div>
      <span className="v379-live-dot">Live-Einstellungen</span></header>
    <div className="v379-presets" aria-label="Lyrics-Stilvorlagen">
      <strong>Schnellvorlagen</strong>
      {(["deutschrap","festival","cinematic"] as LyricsStudioPresetV379[]).map(p=><button key={p} type="button" onClick={()=>updatePreferences(STUDIO_PRESETS_V379[p])}>{p==="deutschrap"?"Deutschrap":p==="festival"?"Festival / Hardstyle":"Kino"}</button>)}
    </div>
    <div className="v379-layout">
      <div className="v379-preview-column">
        <div className="v379-toolbar">
          <label>Quelle <select value={live?"track":"demo"} onChange={e=>{setSource(e.target.value as "demo"|"track");setPreviewPlaying(false);}}>
            <option value="demo">Demo mit Wort-Timing</option>{realAvailable&&<option value="track">Aktueller Spotify-Titel</option>}
          </select></label>
          <label>Format <select value={viewport} onChange={e=>setViewport(e.target.value as "wide"|"display")}><option value="wide">16:9</option><option value="display">10-Zoll-Display</option></select></label>
          <button type="button" aria-pressed={real3d} onClick={()=>setReal3d(v=>!v)}>{real3d?"▣ 3D-Vorschau aktiv":"◫ Echte 3D-Bühne öffnen"}</button>
        </div>
        {real3d&&<div className="v380-toolbar" aria-label="V380 3D-Vorschau Steuerung">
          <label>Tänzer <select value={cast} onChange={e=>{setCast(Number(e.target.value) as StudioCastV380);setLeadIndex(0);}}><option value={1}>1 Avatar</option><option value={2}>2 Avatare</option><option value={4}>4 Avatare</option></select></label>
          <label>Visueller Lead <select value={leadIndex} onChange={e=>setLeadIndex(Number(e.target.value))}>{Array.from({length:cast},(_,i)=><option value={i} key={i}>Tänzer {i+1}</option>)}</select></label>
          <label>Kamera <select value={cameraMode} onChange={e=>setCameraMode(e.target.value as StudioCameraModeV380)}><option value="directed">Geführte Kamera</option><option value="orbit">Freie 3D-Kamera</option></select></label>
          {cameraMode==="directed"&&<label>Bildausschnitt <select value={shotOverride} onChange={e=>setShotOverride(e.target.value as "auto"|StudioShotV380)}><option value="auto">V378 Kameraplan</option><option value="lead">Lead-Nahaufnahme</option><option value="duet">Zweierbild</option><option value="group">Ganze Gruppe</option><option value="lyrics">Lyrics-Fokus</option><option value="balanced">Ausgewogen</option></select></label>}
        </div>}
        {real3d&&<div className="v381-toolbar" aria-label="V381 3D-Lyrics Editor">
          <button type="button" aria-pressed={edit3d} onClick={()=>{setEdit3d(v=>!v);setPreviewPlaying(false);}}>{edit3d?"✓ Bearbeiten aktiv":"✥ Lyrics auf 3D-Bühne bearbeiten"}</button>
          {edit3d&&<><button type="button" onClick={()=>setAutoPlaceRequest(v=>v+1)}>Gesichter freihalten</button>
          <button type="button" onClick={()=>applyLayout({...DEFAULT_LYRICS_LAYOUT_V381})}>Position zurücksetzen</button>
          <span className="v381-editor-help">Türkis ziehen = verschieben · gelben Griff ziehen = skalieren · Maus & Touch</span></>}
        </div>}
        {real3d&&<div className={`v380-view v379-stage-${viewport} ${edit3d?"v381-editing":""}`}>
          <RealLyricsStagePreviewV380 lyrics={lyrics??null} progressMs={currentMs} lyricsTimeMs={effectiveMs} playing={live?music.isPlaying:previewPlaying} activeIndex={active}
            preferences={preferences} genre={live?(music.genre??""):section==="drop"?"hardstyle":"deutschrap"} shot={shotOverride==="auto"?composition.shot:shotOverride} section={section} cast={cast} leadIndex={leadIndex} cameraMode={cameraMode}
            editMode={edit3d} autoPlaceRequest={autoPlaceRequest} onLayoutChange={applyLayout} onSafetyChange={onSafetyChange}/>
          {edit3d&&safety&&<div className="v381-face-zones" aria-hidden="true">{safety.faces.map((rect,index)=><div key={index}
            className={`v381-face-zone ${safety.conflicts.includes(index)?"v381-conflict":""}`} style={{left:`${rect.left*100}%`,top:`${rect.top*100}%`,width:`${(rect.right-rect.left)*100}%`,height:`${(rect.bottom-rect.top)*100}%`}}/>)}
            <div className="v381-zone-status">{safety.conflicts.length?`Achtung: ${safety.conflicts.length} geschätzte Gesichtszonen überlappt`:`${safety.faces.length} Gesichtszonen frei`}</div>
          </div>}
        </div>}
        {!real3d&&<div className={`v379-stage v379-stage-${viewport} ${immersive?"v379-immersive":"v379-overlay"} v379-side-${preferences.lyricsImmersiveSide??"right"} v379-shot-${composition.shot}`} style={{"--v379-tilt":`${(preferences.lyricsImmersiveDepth??45)*(preferences.lyricsImmersiveSide==="left"?.12:-.12)}deg`} as CSSProperties}>
          <div className="v379-stage-lights" aria-hidden="true"><i/><i/><i/></div>
          <div className="v379-performers" aria-hidden="true"><span/><span/><span/></div>
          <div className="v379-safezone" aria-hidden="true" />
          <div className={`v379-captions ${(preferences.avatarLyricsContrastV378??true)?"v379-captions-contrast":""}`}>
            <KineticLyrics lyrics={lyrics??null} progressMs={effectiveMs} activeIndex={active} playing={live?music.isPlaying:previewPlaying} genre={!live&&section==="drop"?"hardstyle":!live?"deutschrap":""}/>
          </div>
          <span className="v379-shot-label">{!immersive?"2D-Karaoke":composition.shot==="none"?"3D-Layout":`Kamera: ${composition.shot}`} · Layout-Vorschau</span>
        </div>}
        <div className="v379-timeline">
          <div className="v379-timeline-meta"><strong>{live?(music.track?.title??"Spotify") :"Karaoke-Demo"}</strong><span>{asClock(currentMs)} / {asClock(length)}</span></div>
          {!live&&<button type="button" onClick={()=>setPreviewPlaying(s=>!s)} aria-label={previewPlaying?"Demo pausieren":"Demo abspielen"}>{previewPlaying?"❚❚ Pause":"▶ Abspielen"}</button>}
          <input type="range" min={0} max={length} step={100} value={currentMs} disabled={live} aria-label={live?"Spotify-Position (nur Anzeige)":"Demo-Zeitpunkt"} onChange={e=>setPosition(Number(e.target.value))}/>
          {live&&<small>Spotify nur beobachten – kein Seek und keine Änderung an der Wiedergabe. 3D-Szenenzeit folgt der angezeigten Songposition.</small>}
        </div>
        <div className="v379-diagnostics" role="status">
          <span><strong>Timing:</strong> {timingNames[composition.timing]}</span>
          <span><strong>Kamera:</strong> {composition.shot==="none"?"Bisherige Regie":composition.shot}</span>
          <span><strong>Textzone:</strong> {composition.safeZone==="bottom"?"2D unten":composition.safeZone==="left"?"Links":"Rechts"}</span>
          {real3d&&<span><strong>3D:</strong> {cast} Tänzer · {cameraMode==="orbit"?"freie Kamera":"Regieplan"} · echte WebGL-Szene</span>}
          {edit3d&&<span><strong>V381:</strong> x {layout.x.toFixed(2)} · y {layout.y.toFixed(2)} · z {layout.z.toFixed(2)} · Zoom {Math.round(layout.scale*100)} %</span>}
        </div>
      </div>
      <div className="v379-controls">
        <div className="v379-tabs" role="tablist" aria-label="Lyrics Studio Einstellungen">
          <button role="tab" aria-selected={tab==="type"} type="button" onClick={()=>setTab("type")}>Schrift &amp; Layout</button>
          <button role="tab" aria-selected={tab==="motion"} type="button" onClick={()=>setTab("motion")}>Karaoke</button>
          <button role="tab" aria-selected={tab==="camera"} type="button" onClick={()=>setTab("camera")}>Kamera &amp; 3D</button>
          <button role="tab" aria-selected={tab==="layout"} type="button" onClick={()=>{setTab("layout");setReal3d(true);}}>3D-Layout V381</button>
        </div>
        {tab==="layout"&&<div className="v379-fields v381-fields" role="tabpanel">
          <strong>Räumliches Lyrics-Layout</strong>
          <small>Griffe auf der 3D-Bühne funktionieren mit Maus und Touch. Die Werte gelten auch für die reguläre 3D-Bühne und werden in deinen Anzeigeeinstellungen gespeichert.</small>
          <label className="setting-check"><input type="checkbox" checked={edit3d} onChange={e=>{setReal3d(true);setEdit3d(e.target.checked);setPreviewPlaying(false);}}/> Direkt auf der 3D-Bühne bearbeiten</label>
          {([ ["Horizontal","x",-2,2,.05],["Vertikal","y",-1.4,1.4,.05],["Tiefe","z",-1.5,1.5,.05],["Skalierung","scale",.55,2,.05] ] as const).map(([label,key,min,max,step])=>
            <label key={key}>{label} <output>{layout[key].toFixed(2)}</output>
              <input type="range" min={min} max={max} step={step} value={layout[key]}
                onChange={e=>applyLayout({...layout,[key]:Number(e.target.value)})}/>
            </label>)}
          <label className="setting-check"><input type="checkbox" checked={layout.faceGuard} onChange={e=>applyLayout({...layout,faceGuard:e.target.checked})}/> Gesichts-Schutzzonen beim Ziehen berücksichtigen</label>
          <label>Sicherheitsabstand <output>{Math.round(layout.safeMargin*100)} %</output>
            <input type="range" min={0} max={.4} step={.02} value={layout.safeMargin} onChange={e=>applyLayout({...layout,safeMargin:Number(e.target.value)})}/></label>
          <button type="button" onClick={()=>{setReal3d(true);setAutoPlaceRequest(value=>value+1);}}>Automatisch freien Platz suchen</button>
          <button type="button" onClick={()=>applyLayout({...DEFAULT_LYRICS_LAYOUT_V381})}>Standardlayout wiederherstellen</button>
          <hr/><strong>Eigene Layouts speichern</strong>
          <label>Layout-Name <input type="text" maxLength={60} value={layoutName} onChange={e=>setLayoutName(e.target.value)} placeholder="z. B. Deutschrap links"/></label>
          <button type="button" onClick={saveLayout} disabled={!layoutName.trim()}>Aktuelles Layout speichern</button>
          <label>Gespeicherte Layouts <select value={selectedLayout} onChange={e=>loadLayout(e.target.value)}><option value="">Layout auswählen</option>
            {savedLayouts.map(item=><option key={item.id} value={item.id}>{item.name}</option>)}
          </select></label>
          {selectedLayout&&<button type="button" onClick={()=>{setSavedLayouts(old=>old.filter(p=>p.id!==selectedLayout));setSelectedLayout("");}}>Ausgewähltes Layout löschen</button>}
          <small>Gesichtspositionen sind angenäherte Kopfbereiche der platzierten Tänzer, keine Auswertung echter GLB-Gesichtsknochen. Die Anzeige prüft die aktive Kameraperspektive. Layoutvorlagen liegen ausschließlich im Browser.</small>
        </div>}
        {tab==="type"&&<div className="v379-fields" role="tabpanel">
          <label>Schriftbild <select value={preferences.lyricsFontFamilyV379??"system"} onChange={e=>update("lyricsFontFamilyV379",e.target.value as UiPreferences["lyricsFontFamilyV379"])}>{fontOptions.map(x=><option key={x.value} value={x.value}>{x.label}</option>)}</select></label>
          <label>Darstellungsstil <select value={preferences.lyricsStyle??"kinetic"} onChange={e=>update("lyricsStyle",e.target.value as UiPreferences["lyricsStyle"])}><option value="kinetic">Kinetic</option><option value="cinematic">Cinematic</option><option value="neon">Neon</option><option value="classic">Klassisch</option></select></label>
          {size("Schriftgröße","lyricsFontSize",preferences.lyricsFontSize??100,60,180)}
          <label>Textposition <select value={preferences.lyricsPosition??"center"} onChange={e=>update("lyricsPosition",e.target.value as UiPreferences["lyricsPosition"])}><option value="top">Oben</option><option value="center">Mitte</option><option value="bottom">Unten</option></select></label>
          {size("Leuchteffekt","lyricsGlow",preferences.lyricsGlow??65,0,100)}
          <div className="v379-colors"><label>Farbe 1 <input type="color" value={preferences.lyricsGradientFrom??"#79f7ff"} onChange={e=>update("lyricsGradientFrom",e.target.value)}/></label><label>Farbe 2 <input type="color" value={preferences.lyricsGradientTo??"#d789ff"} onChange={e=>update("lyricsGradientTo",e.target.value)}/></label></div>
          <small>Schriftfamilien gelten für die 2D-Karaoke-Darstellung. 3D-Troika-Text behält seine eigene Schrift.</small>
        </div>}
        {tab==="motion"&&<div className="v379-fields" role="tabpanel">
          <label className="setting-check"><input type="checkbox" checked={preferences.lyricsFocusMode??true} onChange={e=>update("lyricsFocusMode",e.target.checked)}/> Aktive Zeile hervorheben</label>
          <label className="setting-check"><input type="checkbox" checked={preferences.lyricsWordHighlight??true} onChange={e=>update("lyricsWordHighlight",e.target.checked)}/> Karaoke-Wortfortschritt</label>
          <label>V382 · Animationstil<select value={preferences.lyricsKineticPresetV382??"auto"} onChange={e=>update("lyricsKineticPresetV382",e.target.value as UiPreferences["lyricsKineticPresetV382"])}><option value="off">Klassisch</option><option value="auto">Automatisch</option><option value="rap">Rap-Flow</option><option value="festival">Festival / Hardtekk</option><option value="cinematic">Cinematic</option></select></label>
          {size("V382 · Wortimpuls","lyricsKineticStrengthV382",preferences.lyricsKineticStrengthV382??65,0,100)}
          <label className="setting-check"><input type="checkbox" checked={preferences.lyricsKineticDropsV382??true} onChange={e=>update("lyricsKineticDropsV382",e.target.checked)}/> Gemessene Drop-Akzente</label>
          {size("Animationsintensität","lyricsAnimationIntensity",preferences.lyricsAnimationIntensity??65,0,100)}
          {size("Geschwindigkeit","lyricsAnimationSpeed",preferences.lyricsAnimationSpeed??100,25,200)}
          <label className="setting-check"><input type="checkbox" checked={preferences.lyricsBeatReactive??true} onChange={e=>update("lyricsBeatReactive",e.target.checked)}/> Audio-reaktive Akzente</label>
          {size("Audio-Reaktivität","lyricsReactiveIntensity",preferences.lyricsReactiveIntensity??60,0,100)}
          {size("Lyrics-Versatz","lyricsOffsetMs",preferences.lyricsOffsetMs??0,-5000,5000,100)}
          <button type="button" onClick={()=>update("lyricsOffsetMs",0)}>Lyrics-Versatz auf 0 ms</button>
          <small>Demo-Wörter haben Zeitstempel. Echtes Wort-Timing wird nur angezeigt, wenn der Lyrics-Anbieter es liefert. Audio-Akzente benötigen die aktivierte Mikrofonanalyse.</small>
        </div>}
        {tab==="camera"&&<div className="v379-fields" role="tabpanel">
          <label className="setting-check"><input type="checkbox" checked={immersive} onChange={e=>update("lyricsImmersiveEnabled",e.target.checked)}/> Immersive Lyrics neben der Bühne</label>
          <label>Lyrics-Seite <select value={preferences.lyricsImmersiveSide??"right"} onChange={e=>update("lyricsImmersiveSide",e.target.value as UiPreferences["lyricsImmersiveSide"])}><option value="left">Links</option><option value="right">Rechts</option></select></label>
          {size("3D-Tiefe","lyricsImmersiveDepth",preferences.lyricsImmersiveDepth??45,0,100)}
          <label>Kamerakomposition <select value={preferences.avatarLyricsCameraModeV378??"off"} onChange={e=>update("avatarLyricsCameraModeV378",e.target.value as UiPreferences["avatarLyricsCameraModeV378"])}><option value="off">Aus</option><option value="readable">Texte schützen</option><option value="cinematic">Filmischer Lyrics-Fokus</option></select></label>
          {size("Kamerastärke","avatarLyricsCameraStrengthV378",preferences.avatarLyricsCameraStrengthV378??70,0,100)}
          <label className="setting-check"><input type="checkbox" checked={preferences.avatarLyricsContrastV378??true} onChange={e=>update("avatarLyricsContrastV378",e.target.checked)}/> Kontrastfläche hinter Lyrics</label>
          <label>Demo-Songabschnitt <select value={section} onChange={e=>setSection(e.target.value as LyricsStudioSectionV379)}><option value="verse">Verse</option><option value="hook">Hook</option><option value="drop">Drop</option></select></label>
          <small>V380: „Echte 3D-Bühne öffnen“ zeigt installierte GLB-Avatare, importierte Clips, dieselbe Troika-3D-Lyrics-Komponente und echte Bühnenlichter. Die reguläre Hauptbühnen-Regie inklusive kompletter Tanz-/IK-Steuerung läuft dort nicht ein zweites Mal. Alternativ bleibt die sparsame CSS-Vorschau verfügbar. Spotify wird nicht gesteuert.</small>
        </div>}
      </div>
    </div>
  </section>;
}
