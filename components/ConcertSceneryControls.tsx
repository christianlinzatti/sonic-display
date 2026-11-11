'use client';
import {ConcertProgrammeControls} from './ConcertProgrammeControls';
import {ConcertAnalysisStatus} from './ConcertAnalysisStatus';
import {useCrewSettings,writeCrewSettings} from './visualizer/useSonicCrew';
import {sceneryStrength} from '@/lib/concertStageShow';
export function ConcertSceneryControls(){
 const settings=useCrewSettings();
 return <section className="concert-scenery-controls" aria-label="Konzert-Bühnenbild">
  <header className="concert-controls-heading"><h2>Deine Konzertshow</h2><p>Die wichtigsten Regler direkt im Zugriff. Programm und Timing bei Bedarf öffnen.</p></header>
  <div className="concert-control-grid">
   <fieldset><legend>Bühne & Effekte</legend>
  <label><input type="checkbox" checked={settings.scenery===true} onChange={e=>writeCrewSettings({...settings,scenery:e.target.checked})}/> Konzert-Bühnenbilder und Effekte</label>
  <label>Effektstärke · {sceneryStrength(settings.sceneryStrength)} %<input aria-label="Effektstärke" type="range" min="0" max="100" step="5" value={sceneryStrength(settings.sceneryStrength)} disabled={!settings.scenery} onChange={e=>writeCrewSettings({...settings,sceneryStrength:Number(e.target.value)})}/></label>
  <label><input type="checkbox" checked={settings.immersiveFx!==false} disabled={!settings.scenery} onChange={e=>writeCrewSettings({...settings,immersiveFx:e.target.checked})}/> Raum- und Bodeneffekte</label>
   </fieldset>
   <fieldset><legend>Crew & Outfits</legend>
  <label><input type="checkbox" checked={settings.musicalDance!==false} disabled={!settings.scenery} onChange={e=>writeCrewSettings({...settings,musicalDance:e.target.checked})}/> Musikalische Tanzfolgen und Crew-Wellen</label>
  <label><input type="checkbox" checked={settings.ensemble!==false} disabled={!settings.scenery} onChange={e=>writeCrewSettings({...settings,ensemble:e.target.checked})}/> Ensemble: Blickwechsel und Antwortpausen</label>
  <label><input type="checkbox" checked={settings.songOutfits!==false} disabled={!settings.scenery} onChange={e=>writeCrewSettings({...settings,songOutfits:e.target.checked})}/> Songabhängige Outfit-Farben und Stofflooks</label>
   </fieldset>
   <fieldset><legend>Lyrics</legend>
  <label><input type="checkbox" checked={settings.sceneryLyrics!==false} disabled={!settings.scenery} onChange={e=>writeCrewSettings({...settings,sceneryLyrics:e.target.checked})}/> Refrain zusätzlich auf LED-Wand zeigen</label>
  <label><input type="checkbox" checked={settings.ensembleLyrics!==false} disabled={!settings.scenery} onChange={e=>writeCrewSettings({...settings,ensembleLyrics:e.target.checked})}/> Abwechslungsreiche Lyrics-Lichtbilder</label>
   </fieldset>
   <fieldset><legend>Govee-Raumlicht</legend>
  <label><input type="checkbox" checked={settings.goveeEnsemble!==false} disabled={!settings.scenery} onChange={e=>writeCrewSettings({...settings,goveeEnsemble:e.target.checked})}/> Govee folgt Ensemble und Lyrics</label>
    <small>Benötigt eingerichtete LAN-Bridge, ausgewählte Lampen und aktiven Musik-Sync mit Konzertdirektor.</small>
   </fieldset>
  </div>
  <ConcertAnalysisStatus/>
  <ConcertProgrammeControls/>
  <details className="settings-disclosure"><summary>Wie die Show-Regler zusammenarbeiten</summary><p>Schnelle Lyrics bekommen Ruhe. Eigene Lichtshows haben Vorrang. Outfit-Looks verändern vorhandene Kleidermaterialien; eigene Farbe und „Aus“ bleiben vorrangig. Govee nutzt den bestehenden Sendetakt und schaltet Lampen nicht automatisch ein oder aus.</p></details>
 </section>;
}
