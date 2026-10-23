"use client";
import {GalleryPreviewEditorV343} from "./GalleryPreviewEditorV343";
import {CinematicGallerySettingsV342} from "./CinematicGallerySettingsV342";
import {ImageSelectionSettingsV340} from "./ImageSelectionSettingsV340";
import {MusicGallerySettingsV341} from "./MusicGallerySettingsV341";
import {GallerySettingsV338} from "./GallerySettingsV338";
import {ConcertDisplaySettingsV337} from "./ConcertDisplaySettingsV337";
import {ConcertDisplayV337} from "./ConcertDisplayV337";
import {StageContentSchedulerSettingsV334} from "./StageContentSchedulerSettingsV334";
import {useEffect,useState} from "react";
import {useVisualizer} from "@/context/VisualizerContext";
import {
  STAGE_CONTENT_EVENT_V330,readStageContentV330,saveStageContentV330,validStageEndpointV330,
  DEFAULT_STAGE_CONTENT_V330,type StageContentSettingsV330,type StageContentSourceV330,
} from "@/services/stageContent/stageContentV330";
import {useStageContentV330} from "@/services/stageContent/useStageContentV330";
import {StageScreenLayoutEditorV333} from "./StageScreenLayoutEditorV333";
import {STAGE_CONTENT_PROVIDERS_V330} from "@/services/stageContent/providersV330";

export function StageContentPluginSettingsV330(){
  const {track}=useVisualizer();
  const [settings,setSettings]=useState(readStageContentV330);
  const [draft,setDraft]=useState(settings.endpoints);
  const [message,setMessage]=useState("");
  const preview=useStageContentV330(track);
  useEffect(()=>{
    const reload=()=>{const loaded=readStageContentV330();setSettings(loaded);setDraft(loaded.endpoints);};
    reload();window.addEventListener(STAGE_CONTENT_EVENT_V330,reload);
    return()=>window.removeEventListener(STAGE_CONTENT_EVENT_V330,reload);
  },[]);
  const update=(patch:Partial<StageContentSettingsV330>)=>{saveStageContentV330({...settings,...patch});};
  const saveEndpoints=()=>{
    for(const name of ["text","photos","concerts"] as const){
      if(draft[name].trim()&&!validStageEndpointV330(draft[name])){setMessage(`Ungültiger Pfad für ${name}. Nur /api/... ist erlaubt.`);return;}
    }
    update({endpoints:{...draft}});setMessage("API-Pfade gespeichert.");
  };
  const labels:Record<StageContentSourceV330,string>={canvas:"Spotify Canvas – animiertes Video",cover:"Albumcover – Bild/Fallback",text:"Künstlertext / Beschreibung über API",photos:"Künstlerfotos über API",concerts:"Nächste Konzerttermine über API"};
  return <fieldset className="stage-content-config-v330"><legend>V330 – Stage Content Plugins · Canvas, Farben &amp; APIs</legend>
    <p>Frei kombinierbare Quellen für eine Leinwand auf der 3D-Bühne. Die Module sind einzeln aktivierbar und wechseln automatisch. Bei fehlenden Quellen bleibt die vorherige Avatar-Bühne unverändert.</p>
    <label className="setting-check"><input type="checkbox" checked={settings.enabled} onChange={e=>update({enabled:e.target.checked})}/> **Content-Leinwand aktivieren**</label>
    <div className="stage-content-v330-providers"><strong>Installierte Content-Module</strong>{STAGE_CONTENT_PROVIDERS_V330.map(provider=><label key={provider.id} className="setting-check"><input type="checkbox" checked={settings.sources[provider.id]} onChange={e=>update({sources:{...settings.sources,[provider.id]:e.target.checked}})}/>{labels[provider.id]}</label>)}</div>
    <label>Leinwandposition
      <select value={settings.position} onChange={e=>update({position:e.target.value as StageContentSettingsV330["position"]})}>
        <option value="behind">Hinter den Avataren</option><option value="left">Links seitlich</option><option value="right">Rechts seitlich</option>
      </select>
    </label>
    <label>Größe ({Math.round(settings.screenScale*100)} %)<input type="range" min="0.5" max="2" step="0.1" value={settings.screenScale} onChange={e=>update({screenScale:Number(e.target.value)})}/></label>
    <label>Höhe ({settings.screenHeight.toFixed(1)})<input type="range" min="-0.4" max="2.8" step="0.1" value={settings.screenHeight} onChange={e=>update({screenHeight:Number(e.target.value)})}/></label>
    <label>Wechselintervall ({settings.rotationSeconds} Sekunden)<input type="range" min="5" max="120" step="1" value={settings.rotationSeconds} onChange={e=>update({rotationSeconds:Number(e.target.value)})}/></label>
    <label className="setting-check"><input type="checkbox" checked={settings.accentFromCover} onChange={e=>update({accentFromCover:e.target.checked})}/> **Bühnenlichter mit automatisch berechneten Coverfarben einfärben**</label>
    <fieldset><legend>V335 – Künstlerinfos und Konzerte: API-Module</legend>
      <p>Die vorkonfigurierten V335-Adapter können durch andere /api-Routen ersetzt werden. Die URL muss eine eigene Next.js-Route auf diesem Server sein. Erlaubte Platzhalter: <code>{"{artist}"}</code>, <code>{"{trackId}"}</code>, <code>{"{title}"}</code>. Die Werte werden URL-kodiert übergeben.</p>
      {(["text","photos","concerts"] as const).map(name=><label key={name}>{name==="text"?"Text-API":name==="photos"?"Künstlerfoto-API":"Konzert-API"}
        <input type="text" value={draft[name]} placeholder={`/api/stage-content/${name}?artist={artist}`} onChange={e=>{setDraft(prev=>({...prev,[name]:e.target.value}));setMessage("");}}/>
      </label>)}
      <button type="button" onClick={saveEndpoints}>API-Pfade speichern</button>{message&&<small role="status">{message}</small>}
      <small>API-Schlüssel gehören ausschließlich in serverseitige Next.js-Routen und Umgebungsvariablen, niemals hierher. Es werden keine externen URLs direkt vom Browser als API-Endpunkt abgefragt. JSON-Beispiele stehen in V330-STAGE-CONTENT-PLUGINS.md.</small>
    </fieldset>
    {settings.enabled&&<div className="stage-content-v330-live-preview">
      <strong>Aktueller Titel – Leinwand-Vorschau</strong>
      {preview.item?<div className="sonic-content-screen-v330" style={{width:"min(100%,480px)",height:270,marginTop:8}}>
        {preview.item.kind==="video"?<video key={preview.item.url} src={preview.item.url} muted loop autoPlay playsInline poster={track?.albumCoverUrl??undefined} style={{width:"100%",height:"100%",objectFit:"cover"}}/>:null}
        {preview.item.kind==="image"?<img src={preview.item.url} alt={preview.item.title}/>:null}
        {preview.item.kind==="text"?<div className="sonic-content-screen-v330-text"><h3>{preview.item.title}</h3><p>{preview.item.text}</p></div>:null}
        {preview.item.kind==="events"?<ConcertDisplayV337 events={preview.item.events??[]} title={preview.item.title}/>:null}
      </div>:<p>Für den aktuellen Titel sind noch keine aktiven Inhalte verfügbar.</p>}
      <small>Verfügbare Quellen: {preview.slides.map(x=>x.source).join(", ")||"keine"}. Spotify Canvas kann wegen der inoffiziellen Schnittstelle oder aus Lizenzgründen fehlen.</small>
    </div>}
    <StageScreenLayoutEditorV333/>
    <StageContentSchedulerSettingsV334/>
    <ConcertDisplaySettingsV337/>
    <GallerySettingsV338/>
    <MusicGallerySettingsV341/>
    <CinematicGallerySettingsV342/>
    <GalleryPreviewEditorV343/>
    <ImageSelectionSettingsV340/>
    <button type="button" onClick={()=>{saveStageContentV330({...DEFAULT_STAGE_CONTENT_V330});setMessage("Standardwerte wiederhergestellt.");}}>Content-Plugins zurücksetzen</button>
    <small>V335: Künstlerbiografie via Wikipedia, Fotos via Spotify und Termine via Ticketmaster (TICKETMASTER_API_KEY erforderlich). Die drei Endpunkte sind vorkonfiguriert; Quellen müssen aktiviert werden. Canvas benötigt Spotify-Sitzung und eine erreichbare Video-URL; andernfalls erscheint das Albumcover. Farbextraktion benötigt CORS-Zugriff auf das Bild.</small>
  </fieldset>;
}
