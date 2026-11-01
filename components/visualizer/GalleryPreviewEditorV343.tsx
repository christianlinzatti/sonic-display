"use client";
import {useEffect,useRef,useState} from "react";
import {PhotoTransitionSettingsV347} from "./PhotoTransitionSettingsV347";
import {PhotoGallery3DSettingsV348} from "./PhotoGallery3DSettingsV348";
import {SmartStageCompositionSettingsV351} from "./SmartStageCompositionSettingsV351";
import {VisualEffectsStudioSettingsV353} from "./VisualEffectsStudioSettingsV353";
import {ShowTimelineEditorV354} from "./ShowTimelineEditorV354";
import {AutonomousShowSettingsV356} from "./AutonomousShowSettingsV356";
import {ShowQualitySettingsV357} from "./ShowQualitySettingsV357";
import {AdaptiveShowLearningSettingsV358} from "./AdaptiveShowLearningSettingsV358";
import {GenreVisualDirectorSettingsV352} from "./GenreVisualDirectorSettingsV352";
import {LyricsPhotoChoreographySettingsV350} from "./LyricsPhotoChoreographySettingsV350";
import {PhotoSelectionSettingsV349} from "./PhotoSelectionSettingsV349";
import {PhotoDirectorSettingsV346} from "./PhotoDirectorSettingsV346";
import {MultiPhotoLayoutEditorV345} from "./MultiPhotoLayoutEditorV345";
import {GalleryLayoutEditorV344} from "./GalleryLayoutEditorV344";
import {StageImageGalleryV338} from "./StageImageGalleryV338";
import {safeStageMediaV330} from "@/services/stageContent/stageContentV330";
import {readGalleryV338,saveGalleryV338,GALLERY_EVENT_V338,type GalleryModeV338} from "@/services/stageContent/galleryV338";
import type {MusicMetadataV651} from "@/services/musicMetadata/normalizeV651";
import type {StagePhotoSceneV652} from "@/services/musicMetadata/curationV652";
import {SmartArtistVisualSettingsV653} from "./SmartArtistVisualSettingsV653";
import {ARTIST_VISUAL_EVENT_V653,readSmartArtistVisualV653,planSmartArtistVisualV653} from "@/services/stageContent/smartArtistVisualDirectorV653";

/** V343 – lightweight live preview reusing the real screen-gallery renderer. */
export function GalleryPreviewEditorV343(){
 const [artist,setArtist]=useState("");
 const [images,setImages]=useState<string[]>([]);
 const [photoScene,setPhotoScene]=useState<StagePhotoSceneV652|"auto">("auto");
 const [previewSection,setPreviewSection]=useState("verse");
 const [previewLyrics,setPreviewLyrics]=useState(true);
 const [artistVisualSettings,setArtistVisualSettings]=useState(readSmartArtistVisualV653);
 const [imageSelections,setImageSelections]=useState<{lyrics:string[];balanced:string[];photos:string[]}|null>(null);
 const [credits,setCredits]=useState<Record<string,string>>({});
 const [manual,setManual]=useState("");
 const [album,setAlbum]=useState("");
 const [trackName,setTrackName]=useState("");
 const [metadata,setMetadata]=useState<MusicMetadataV651|null>(null);
 const [metadataMessage,setMetadataMessage]=useState("");
 const [busy,setBusy]=useState(false);
 const [message,setMessage]=useState("Künstler suchen oder eigene HTTPS-Foto-URLs einfügen.");
 const [gallery,setGallery]=useState(readGalleryV338);
 const [ratio,setRatio]=useState<"wide"|"square"|"portrait">("wide");
 const [paused,setPaused]=useState(false);
 const controller=useRef<AbortController|null>(null);
 const surfaceRef=useRef<HTMLDivElement|null>(null);
 useEffect(()=>{const update=()=>setGallery(readGalleryV338());window.addEventListener(GALLERY_EVENT_V338,update);return()=>{controller.current?.abort();window.removeEventListener(GALLERY_EVENT_V338,update);};},[]);
 useEffect(()=>{const changed=()=>setArtistVisualSettings(readSmartArtistVisualV653());window.addEventListener(ARTIST_VISUAL_EVENT_V653,changed);return()=>window.removeEventListener(ARTIST_VISUAL_EVENT_V653,changed);},[]);
 const loadMetadata=async(term:string,signal:AbortSignal)=>{
   setMetadata(null);setMetadataMessage("Lade Künstler- und Songinformationen …");
   const query=new URLSearchParams({artist:term});
   if(trackName.trim())query.set("track",trackName.trim());
   if(album.trim())query.set("album",album.trim());
   try{
     const res=await fetch(`/api/music-metadata?${query}`,{signal,cache:"no-store"});
     if(!res.ok){if(!signal.aborted)setMetadataMessage(res.status===401?"Spotify-Anmeldung für Metadaten erforderlich.":`Metadaten: HTTP ${res.status}`);return;}
     const body=await res.json() as MusicMetadataV651;
     if(!signal.aborted){setMetadata(body);setMetadataMessage("Metadatenquellen abgefragt.");}
   }catch{if(!signal.aborted)setMetadataMessage("Metadaten derzeit nicht verfügbar.");}
 };
 const load=async()=>{
   const term=artist.trim();if(!term||term.length>140){setMessage("Bitte einen Künstlernamen mit maximal 140 Zeichen eingeben.");return;}
   controller.current?.abort();const abort=new AbortController();controller.current=abort;
   setBusy(true);setMessage("Lade Künstlerfotos …");setImages([]);setImageSelections(null);setCredits({});
   void loadMetadata(term,abort.signal);
   try{
    const response=await fetch(`/api/stage-content/artist?artist=${encodeURIComponent(term)}`,{signal:abort.signal,cache:"no-store"});
    if(!response.ok){setMessage(response.status===401?"Spotify-Anmeldung erforderlich. Alternativ eigene Foto-URLs eingeben.":"Keine Fotos geladen (HTTP "+response.status+").");return;}
    const data:unknown=await response.json();const payload=data&&typeof data==="object"?data as {images?:unknown;imageUrl?:unknown;credits?:unknown;selections?:unknown}:{};
    const urls=Array.isArray(payload.images)?payload.images:typeof payload.imageUrl==="string"?[payload.imageUrl]:[];
    const clean=[...new Set(urls.filter((u):u is string=>typeof u==="string").map(safeStageMediaV330).filter((u):u is string=>!!u))].slice(0,12);
    const rawCredits=payload.credits&&typeof payload.credits==="object"?payload.credits as Record<string,unknown>:{};
    const c:Record<string,string>={};for(const url of clean){if(typeof rawCredits[url]==="string")c[url]=(rawCredits[url] as string).slice(0,500);}
    const selectable=payload.selections&&typeof payload.selections==='object'?payload.selections as Record<string,unknown>:{};
    const selected=(name:StagePhotoSceneV652)=>Array.isArray(selectable[name])?[...new Set((selectable[name] as unknown[]).map(safeStageMediaV330).filter((url):url is string=>!!url&&clean.includes(url)))]:clean;
    setImageSelections({lyrics:selected('lyrics'),balanced:selected('balanced'),photos:selected('photos')});
    setImages(clean);setCredits(c);setMessage(clean.length?`${clean.length} Foto(s) für ${term} geladen.`:"Für diesen Künstler sind keine Fotos verfügbar.");
   }catch(e){if(!abort.signal.aborted)setMessage("Die Bildsuche konnte nicht abgeschlossen werden.");}
   finally{if(!abort.signal.aborted)setBusy(false);}
 };
 const useManual=()=>{
  controller.current?.abort();setBusy(false);
  const urls=[...new Set(manual.split(/[\n,]+/).map(x=>safeStageMediaV330(x.trim())).filter((x):x is string=>!!x))].slice(0,12);
  setImages(urls);setImageSelections(null);setCredits({});setMessage(urls.length?`${urls.length} eigene(s) Foto(s) geladen.`:"Keine gültige HTTPS-Bild-URL gefunden.");
 };
 const changeMode=(mode:GalleryModeV338)=>saveGalleryV338({...gallery,enabled:true,mode});
 const aspect=ratio==="wide"?16/9:ratio==="square"?1:3/4;
 const previewVisual=planSmartArtistVisualV653({section:previewSection,lyricsActive:previewLyrics,playing:!paused,reducedMotion:false,imageCount:images.length},artistVisualSettings);
 const resolvedPhotoScene=photoScene==='auto'?previewVisual.scene:photoScene;
 const previewImages=imageSelections?.[resolvedPhotoScene]?.length?imageSelections[resolvedPhotoScene]:images;
 return <fieldset className="sonic-gallery-preview-editor-v343"><legend>V343 – Visual Gallery Preview Editor</legend>
  <p>Galerie und V342-Kameraeffekte direkt hier ansehen – ohne die 3D-Bühne zu starten. Die Vorschau nutzt dieselbe Bildkomponente und deine gespeicherten Einstellungen.</p>
  <form onSubmit={e=>{e.preventDefault();void load();}} className="sonic-preview-load-v343">
   <label>Künstlername <input value={artist} maxLength={140} onChange={e=>setArtist(e.target.value)} placeholder="z. B. aktueller Spotify-Künstler" /></label>
   <label>Song (optional) <input value={trackName} maxLength={180} onChange={e=>setTrackName(e.target.value)} placeholder="Für Songinformationen" /></label>
   <label>Album (optional) <input value={album} maxLength={180} onChange={e=>setAlbum(e.target.value)} placeholder="Für Albuminformationen" /></label>
   <button type="submit" disabled={busy}>{busy?"Lade …":"Künstlerinfos und Fotos laden"}</button>
  </form>
  <section aria-label="Künstlermetadaten" className="sonic-metadata-panel-v651">
   <h4>Musikdaten · MusicBrainz / TheAudioDB / Last.fm / Flickr</h4>
   {metadata&&<>
     <p><strong>{metadata.artist.name}</strong>{metadata.artist.country?` · ${metadata.artist.country}`:""}{metadata.artist.formed?` · seit ${metadata.artist.formed}`:""}</p>
     {metadata.artist.identityStatus&&<p>MusicBrainz-Abgleich: <strong>{({verified:'Eindeutiger MusicBrainz-Suchtreffer',provisional:'Vorläufig (Last.fm)',conflict:'Widersprüchliche IDs – keine Zuordnung',unresolved:'Nicht eindeutig'} as const)[metadata.artist.identityStatus]}</strong></p>}
     {metadata.artist.genre.length>0&&<p>Genres: {metadata.artist.genre.join(" · ")}</p>}
     {metadata.artist.label&&<p>Label: {metadata.artist.label}</p>}
     {metadata.artist.biography&&<p>{metadata.artist.biography} <small>(Quelle: {metadata.artist.biographySource})</small></p>}
     {metadata.artist.fieldSources&&<small>Feldquellen: {Object.entries(metadata.artist.fieldSources).map(([field,source])=>`${field}: ${source}`).join(' · ')}</small>}
     {metadata.artist.listeners!==null&&<p>Last.fm-Hörer: {metadata.artist.listeners.toLocaleString("de-AT")}</p>}
     {metadata.artist.similar.length>0&&<p>Ähnliche Künstler: {metadata.artist.similar.join(", ")}</p>}
     {metadata.artist.mbid&&<p><a href={`https://musicbrainz.org/artist/${metadata.artist.mbid}`} target="_blank" rel="noopener noreferrer">MusicBrainz-Eintrag</a></p>}
     {metadata.track&&<p>Song: {metadata.track.name}{metadata.track.durationMs?` · ${Math.round(metadata.track.durationMs/1000)} s`:""}{metadata.track.genre.length?` · ${metadata.track.genre.join(", ")}`:""}</p>}
     {metadata.track?.mbid&&<p><a href={`https://musicbrainz.org/recording/${metadata.track.mbid}`} target="_blank" rel="noopener noreferrer">MusicBrainz-Song</a>{metadata.track.isrcs.length?` · ISRC: ${metadata.track.isrcs.join(", ")}`:""}</p>}
     {metadata.album&&<p>Album: {metadata.album.name}{metadata.album.releaseDate?` · ${metadata.album.releaseDate}`:""}{metadata.album.mbid&&<> · <a href={`https://musicbrainz.org/release-group/${metadata.album.mbid}`} target="_blank" rel="noopener noreferrer">MusicBrainz-Album</a></>}</p>}
     <small>Quellen: {Object.entries(metadata.providers).map(([name,status])=>`${name}: ${status}`).join(" · ")}</small>
   </>}
   <p role="status">{metadataMessage}</p>
  </section>
  <details><summary>Eigene Foto-URLs verwenden (optional)</summary>
   <label>HTTPS-Bildadressen, eine pro Zeile <textarea value={manual} rows={3} onChange={e=>setManual(e.target.value)} placeholder="https://…/foto1.jpg" /></label>
   <button type="button" onClick={useManual}>Fotos in Vorschau übernehmen</button>
  </details>
  <div className="sonic-preview-toolbar-v343"><label>Bildauswahl <select value={photoScene} onChange={e=>setPhotoScene(e.target.value as StagePhotoSceneV652|"auto")}><option value="auto">Automatisch (V653)</option><option value="balanced">Ausgewogen</option><option value="lyrics">Lyrics-Fokus</option><option value="photos">Konzertfotos (Hook/Drop)</option></select></label><label>V653-Abschnitt <select value={previewSection} onChange={e=>setPreviewSection(e.target.value)}><option value="intro">Intro</option><option value="verse">Verse</option><option value="hook">Hook</option><option value="drop">Drop</option><option value="break">Break</option><option value="outro">Outro</option></select></label><label><input type="checkbox" checked={previewLyrics} onChange={e=>setPreviewLyrics(e.target.checked)}/> Lyrics aktiv</label><label>Format <select value={ratio} onChange={e=>setRatio(e.target.value as typeof ratio)}><option value="wide">16:9</option><option value="square">1:1</option><option value="portrait">3:4</option></select></label>
   <label>Galerie <select value={gallery.mode} onChange={e=>changeMode(e.target.value as GalleryModeV338)}><option value="slideshow">Diashow</option><option value="collage">Collage</option><option value="single">Einzelbild</option></select></label>
   <button type="button" onClick={()=>setPaused(x=>!x)}>{paused?"Fortsetzen":"Pausieren"}</button>
  </div>
  <div ref={surfaceRef} className="sonic-preview-surface-v343" style={{aspectRatio:String(aspect)}} aria-label="Live-Galerievorschau">
   {previewImages.length?<StageImageGalleryV338 curatedOrder={photoScene==='auto'&&previewVisual.active} images={previewImages} credits={credits} alt={artist||"Vorschaubild"} targetAspectRatio={aspect} playing={!paused} paused={paused} className="sonic-preview-gallery-v343" />:
   <div className="sonic-preview-empty-v343">Keine Fotos geladen. Künstler suchen oder eigene Bilder verwenden.</div>}
  </div>
  <GalleryLayoutEditorV344 ratio={ratio} surfaceRef={surfaceRef}/>
  <MultiPhotoLayoutEditorV345 ratio={ratio} surfaceRef={surfaceRef} imageCount={images.length}/>
  <PhotoDirectorSettingsV346 sampleImages={images.length}/>
  <PhotoTransitionSettingsV347/>
  <PhotoGallery3DSettingsV348 images={previewImages} aspect={aspect}/>
  <PhotoSelectionSettingsV349 images={images} aspect={aspect}/>
  <LyricsPhotoChoreographySettingsV350/>
  <SmartArtistVisualSettingsV653/>
  <SmartStageCompositionSettingsV351/>
  <GenreVisualDirectorSettingsV352/>
  <VisualEffectsStudioSettingsV353/>
  <ShowTimelineEditorV354/>
  <AutonomousShowSettingsV356/>
  <ShowQualitySettingsV357/>
  <AdaptiveShowLearningSettingsV358/>
  <p role="status" aria-live="polite">{message}</p>
  <small>Effekte und Wechselgeschwindigkeit oben unter V338–V342 verändern: die Vorschau übernimmt sie sofort. Ohne Spotify-Sitzung funktioniert die Vorschau mit eigenen Bildern. Externe Bild-URLs werden nicht gespeichert.</small>
 </fieldset>;
}
