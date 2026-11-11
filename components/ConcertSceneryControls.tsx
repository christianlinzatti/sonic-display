'use client';
import {ConcertAnalysisStatus} from './ConcertAnalysisStatus';
import {useCrewSettings,writeCrewSettings} from './visualizer/useSonicCrew';
import {sceneryStrength} from '@/lib/concertStageShow';
export function ConcertSceneryControls(){
 const settings=useCrewSettings();
 return <fieldset className="concert-scenery-controls" aria-label="Konzert-Bühnenbild"><legend>Bühne &amp; Effekte</legend>
  <label><input type="checkbox" checked={settings.scenery===true} onChange={e=>writeCrewSettings({...settings,scenery:e.target.checked})}/> Konzert-Bühnenbilder und Effekte</label>
  <label><input type="checkbox" checked={settings.sceneryLyrics!==false} disabled={!settings.scenery} onChange={e=>writeCrewSettings({...settings,sceneryLyrics:e.target.checked})}/> Refrain zusätzlich auf LED-Wand zeigen</label>
  <label><input type="checkbox" checked={settings.musicalDance!==false} disabled={!settings.scenery} onChange={e=>writeCrewSettings({...settings,musicalDance:e.target.checked})}/> Musikalische Tanzfolgen und Crew-Wellen</label>
  <label>Effektstärke · {sceneryStrength(settings.sceneryStrength)} %<input aria-label="Effektstärke" type="range" min="0" max="100" step="5" value={sceneryStrength(settings.sceneryStrength)} disabled={!settings.scenery} onChange={e=>writeCrewSettings({...settings,sceneryStrength:Number(e.target.value)})}/></label>
  <label><input type="checkbox" checked={settings.immersiveFx!==false} disabled={!settings.scenery} onChange={e=>writeCrewSettings({...settings,immersiveFx:e.target.checked})}/> Raum- und Bodeneffekte</label>
  <ConcertAnalysisStatus/>
  <p>Die Bühne folgt dem Song. Schnelle Lyrics bekommen Ruhe; die Effektmenge passt sich der Geräteleistung an. Eigene Lichtshows haben Vorrang.</p>
 </fieldset>;
}
