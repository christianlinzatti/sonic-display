'use client';
import {useEffect,useSyncExternalStore} from 'react';
import {readConcertStageSyncV882,subscribeConcertStageSyncV882} from './concertStageSyncV882';
import {planImmersiveV1000,type ImmersiveStyleV1000} from './immersiveConcertDirectorV1000';
import {useImmersiveSettingsV1000,setImmersiveSettingsV1000,restoreImmersiveSettingsV1000} from './immersiveConcertStoreV1000';
/** Quality dashboard: shows authorized stage intent, not proof of visible output. */
export function ImmersiveConcertPanelV1000(){
 const settings=useImmersiveSettingsV1000();
 const stage=useSyncExternalStore(subscribeConcertStageSyncV882,readConcertStageSyncV882,readConcertStageSyncV882);
 useEffect(()=>{restoreImmersiveSettingsV1000();},[]);
 const cue=planImmersiveV1000({trackId:stage.trackId,stageTrackId:stage.trackId,
  durationMs:stage.durationMs,sceneStartMs:stage.sceneStartMs,section:stage.section,
  verified:stage.sceneSource==='verified',playing:stage.playing,autoEnabled:stage.enabled&&stage.sync.stage,
  reducedMotion:stage.reducedMotion,manual:stage.manual!==null,blackout:false,seekBlocked:false,
  lyricsProtected:false,vocalFocus:false,momentKind:stage.momentKind,settings});
 return <section className="v751-measurements" aria-label="V1000 Sonic Display Immersive 1.0" data-v1000-immersive>
  <h3>V1000 · Sonic Display Immersive 1.0</h3>
  <p>Eine gemeinsame, songgebundene Dramaturgie für die bereits vorhandenen LED-, Bass- und Publikumsakzente. Bestehende Kamera-, Avatar-, Lyrics-, Govee- und Licht-Timelines bleiben eigenständig und vorrangig.</p>
  <label><input type="checkbox" checked={settings.enabled} onChange={e=>setImmersiveSettingsV1000({...settings,enabled:e.target.checked})}/>{' '}Immersive Konzertkoordination aktivieren</label>
  <label> Regiestil{' '}<select aria-label="Immersive Regiestil V1000" value={settings.style} onChange={e=>setImmersiveSettingsV1000({...settings,style:e.target.value as ImmersiveStyleV1000})}>
   <option value="cinematic">Filmisch</option><option value="festival">Festival</option><option value="vocal">Vocal-Fokus</option>
  </select></label>
  <label> Stärke {settings.intensity} %{' '}<input aria-label="Immersive Stärke V1000" type="range" min={0} max={100} step={5} value={settings.intensity} onChange={e=>setImmersiveSettingsV1000({...settings,intensity:Number(e.target.value)})}/></label>
  <label><input type="checkbox" checked={settings.protectLyrics} onChange={e=>setImmersiveSettingsV1000({...settings,protectLyrics:e.target.checked})}/>{' '}Zusätzlichen Lyrics-Schutz anwenden</label>
  <p role="status">{cue.active?`Bestätigte Szene: ${cue.section} · ${cue.focus}`:
    !settings.enabled?'Deaktiviert – vorhandene Show unverändert':
    cue.reason==='unverified'?'Wartet auf bestätigte Song-Szene':
    'Momentan keine automatische Anpassung'}</p>
  <small>Geplante dekorative Reduktion: LED {Math.round(cue.gains.led*100)} %, Bass {Math.round(cue.gains.bass*100)} %, Publikum {Math.round(cue.gains.crowd*100)} %. Keine Verstärkung über 100 %. Tatsächliche Ausgabe kann zusätzlich durch manuelle Regie, Blackouts und V999 begrenzt sein.</small>
  <p><small>Keine eigene KI-Abfrage, kein erfundener Beat, keine neuen Render-Loops, keine Hardware-Kommandos. Deine V998-KI-Vorschläge werden nur nach Freigabe in den vorhandenen Reglern übernommen.</small></p>
 </section>;
}
