'use client';
import {useUiPreferences} from '@/context/UiPreferencesContext';
import {CREW_IDS} from './visualizer/sonicCrewDirector';
import {getAvatarModel} from './visualizer/avatarModels';
import {useCrewSettings,writeCrewSettings} from './visualizer/useSonicCrew';
import {sceneryStrength} from '@/lib/concertStageShow';
import {SETTINGS_SHORTCUTS,type SettingsShortcut} from '@/lib/settingsNavigation';
export function SettingsOverview({onNavigate}:{onNavigate:(shortcut:SettingsShortcut)=>void}){
 const {preferences,updatePreferences}=useUiPreferences(),crew=useCrewSettings();
 return <div className="settings-overview">
  <p className="settings-note">Änderungen wirken sofort und werden auf diesem Gerät gespeichert. Für detaillierte Studios wähle einen Bereich oder einen Direktlink.</p>
  <div className="settings-quick-grid">
   <fieldset><legend>Show & Bühne</legend>
    <label className="setting-check"><input type="checkbox" checked={crew.enabled&&crew.mode==='adaptive'} onChange={e=>writeCrewSettings({...crew,enabled:e.target.checked,mode:e.target.checked?'adaptive':crew.mode})}/> Automatische Konzertregie</label>
    <label className="setting-check"><input type="checkbox" checked={crew.scenery===true} onChange={e=>writeCrewSettings({...crew,scenery:e.target.checked})}/> Bühnenbilder & Effekte</label>
    <label>Show-Effektstärke · {sceneryStrength(crew.sceneryStrength)} %<input aria-label="Show-Effektstärke" type="range" min="0" max="100" step="5" disabled={!crew.scenery} value={sceneryStrength(crew.sceneryStrength)} onChange={e=>writeCrewSettings({...crew,sceneryStrength:Number(e.target.value)})}/></label>
   </fieldset>
   <fieldset><legend>Lyrics & Lesbarkeit</legend>
    <label className="setting-check"><input type="checkbox" checked={preferences.lyricsVisible} onChange={e=>updatePreferences({lyricsVisible:e.target.checked})}/> Songtext anzeigen</label>
    <label className="setting-check"><input type="checkbox" checked={preferences.reducedMotion} onChange={e=>updatePreferences({reducedMotion:e.target.checked})}/> Ruhige Darstellung</label>
    <button type="button" onClick={()=>onNavigate(SETTINGS_SHORTCUTS[0])}>Schrift & Lyrics-Effekte öffnen</button>
   </fieldset>
   <fieldset><legend>Crew & Outfits</legend>
    <label>Avatar der Einzelansicht<select aria-label="Avatar der Einzelansicht" value={CREW_IDS.some(id=>id===preferences.avatarModelId)?preferences.avatarModelId:''} onChange={e=>updatePreferences({avatarModelId:e.target.value})}><option value="" disabled>Anderes Modell aus der Bibliothek</option>{CREW_IDS.map(id=><option key={id} value={id}>{getAvatarModel(id).label}</option>)}</select></label>
    <label className="setting-check"><input type="checkbox" checked={crew.songOutfits!==false} onChange={e=>writeCrewSettings({...crew,songOutfits:e.target.checked})}/> Songabhängige Outfit-Looks</label>
    <button type="button" onClick={()=>onNavigate(SETTINGS_SHORTCUTS[1])}>Modelle, Crew & Importe öffnen</button>
   </fieldset>
   <fieldset><legend>Verbindungen</legend><p>Musik, Lyrics und Raumlicht richtest du in den jeweiligen Bereichen ein.</p>{SETTINGS_SHORTCUTS.filter(s=>['services','lights','voice'].includes(s.id)).map(s=><button type="button" key={s.id} onClick={()=>onNavigate(s)}>{s.label}</button>)}</fieldset>
  </div>
 </div>;
}
