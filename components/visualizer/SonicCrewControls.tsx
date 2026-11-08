'use client';
import {useCallback,useEffect,useRef,useState} from 'react';
import dynamic from 'next/dynamic';
import {useUiPreferences} from '@/context/UiPreferencesContext';
import type {UiPreferences} from '@/types/music';
import {CREW_IDS,type CrewMode,type CrewSettings} from './sonicCrewDirector';
import {useCrewSettings,writeCrewSettings} from './useSonicCrew';
import {readGroupV326,writeGroupV326,layoutV326,type GroupStudioV326} from './multiAvatarStageDirectorV326';
import type {CrewReading,CrewScenario} from './SonicCrewRehearsal';
const Rehearsal=dynamic(()=>import('./SonicCrewRehearsal'),{ssr:false,loading:()=><p>3D-Vorschau wird geladen…</p>});
const labels=['Neon Pulse','Festival Nova','Chrome Beat'];
export function SonicCrewControls(){
 const settings=useCrewSettings(),{preferences,updatePreferences}=useUiPreferences();
 const [show,setShow]=useState(false),[playing,setPlaying]=useState(false),[position,setPosition]=useState(0);
 const [scenario,setScenario]=useState<CrewScenario>({section:'verse',genre:'house',energy:.55,bpm:120});
 const [readings,setReadings]=useState<CrewReading[]>([]),[saved,setSaved]=useState<{group:GroupStudioV326;preferences:Pick<UiPreferences,'avatarModelId'|'secondaryAvatarModelId'|'visualizerMode'>;crew:CrewSettings}|null>(null);
 const clock=useRef(0);
 useEffect(()=>{if(!settings.enabled||preferences.reducedMotion)setPlaying(false);},[settings.enabled,preferences.reducedMotion]);
 const onReading=useCallback((reading:CrewReading)=>{setReadings(old=>{const previous=old.find(r=>r.slot===reading.slot);return previous?.clip===reading.clip&&previous.leader===reading.leader&&Math.abs(previous.time-reading.time)<.01?old:[...old.filter(r=>r.slot!==reading.slot),reading].sort((a,b)=>a.slot-b.slot);});setPosition(clock.current);if(clock.current>=120)setPlaying(false);},[]);
 const setup=()=>{
  setSaved({group:readGroupV326(),preferences:{avatarModelId:preferences.avatarModelId,secondaryAvatarModelId:preferences.secondaryAvatarModelId,visualizerMode:preferences.visualizerMode},crew:settings});
  writeGroupV326({...readGroupV326(),enabled:true,count:3,songSync:false,trackId:'',minSpacing:1.2,modelIds:[...CREW_IDS,''],cues:[{id:'sonic-crew-row',at:0,formation:'wide',focus:-1,drop:false,transition:.8,positions:layoutV326('wide',3)}]});
  updatePreferences({avatarModelId:CREW_IDS[0],secondaryAvatarModelId:CREW_IDS[1],visualizerMode:'avatar'});
  writeCrewSettings({...settings,enabled:true,mode:'unison'});
 };
 const undo=()=>{if(!saved)return;writeGroupV326(saved.group);updatePreferences(saved.preferences);writeCrewSettings(saved.crew);setSaved(null);};
 return <fieldset aria-label="Sonic Stage Crew – Musik und gemeinsame Show"><legend>Sonic Stage Crew · Musik &amp; gemeinsame Show</legend>
  <p>Die drei eingebauten Figuren wählen passende Clips anhand der vorhandenen Songposition, Abschnitts- und Energiedaten. Ohne Tempoangabe wird 120 BPM verwendet. Dies ergänzt die bestehende Analyse; es ist keine neue Musikerkennung.</p>
  <label><input type="checkbox" checked={settings.enabled} onChange={e=>writeCrewSettings({...settings,enabled:e.target.checked})}/> Musiksteuerung für Sonic Stage Crew</label>
  <label><input type="checkbox" checked={settings.reactions} onChange={e=>writeCrewSettings({...settings,reactions:e.target.checked})}/> Eigene Reaktionen der drei Figuren</label>
  <label>Gemeinsame Choreografie <select value={settings.mode} onChange={e=>writeCrewSettings({...settings,mode:e.target.value as CrewMode})}>
   <option value="individual">Individuell</option><option value="unison">Gemeinsamer Tanz</option><option value="canon">Kanon · 2 Beats Versatz</option><option value="spotlight">Wechselnde Solos</option>
  </select></label>
  <p>Neon Pulse nickt zum Beat; Nova blickt zum Publikum und begrüßt im individuellen Intro; Chrome Beat setzt dezente LED-Akzente. Manuelle Clips, externe Bewegungen, gespeicherte Choreografien und Bewegungsreduktion haben Vorrang.</p>
  <div className="avatar-editor-actions"><button type="button" onClick={setup} disabled={!!saved}>Trio auf der Bühne einrichten</button><button type="button" onClick={undo} disabled={!saved}>Trio-Einrichtung zurücknehmen</button></div>
  {saved&&<p role="status">Trio eingerichtet. Die bisherigen Modelle und Gruppenpositionen lassen sich in diesem Fenster wiederherstellen. Vorhandene manuelle Motion-Steuerungen bleiben vorrangig.</p>}
  <button type="button" aria-expanded={show} onClick={()=>{setShow(v=>!v);setPlaying(false);}}>{show?'Show-Simulation schließen':'Show-Simulation öffnen'}</button>
  {show&&<section aria-label="Show-Simulation"><p><strong>Simulation ohne Musikverbindung.</strong> Abschnitt, Energie und Tempo werden hier von dir vorgegeben. Die Vorschau spielt echte GLBs mit derselben Clip- und Phasenplanung wie die Live-Bühne.</p>
   <label>Simulierter Abschnitt <select value={scenario.section} onChange={e=>setScenario({...scenario,section:e.target.value})}><option value="intro">Intro / Ruhe</option><option value="verse">Strophe</option><option value="hook">Refrain</option><option value="drop">Drop</option></select></label>
   <label>Simuliertes Genre <select value={scenario.genre} onChange={e=>setScenario({...scenario,genre:e.target.value})}><option value="house">House</option><option value="techno">Techno</option><option value="hip-hop">Hip-Hop</option><option value="disco">Disco</option></select></label>
   <label>Simuliertes Tempo <input type="number" min={55} max={210} value={scenario.bpm} onChange={e=>setScenario({...scenario,bpm:Math.max(55,Math.min(210,Number(e.target.value)||120))})}/></label>
   <label>Simulierte Energie <input type="range" min={0} max={1} step={.05} value={scenario.energy} onChange={e=>setScenario({...scenario,energy:Number(e.target.value)})}/></label>
   <label>Simulierte Position <input type="range" min={0} max={120} step={1} value={position} onChange={e=>{clock.current=Number(e.target.value);setPosition(clock.current);}}/></label>
   <button type="button" disabled={preferences.reducedMotion||!settings.enabled} aria-pressed={playing} onClick={()=>{if(!playing&&clock.current>=120){clock.current=0;setPosition(0);}setPlaying(v=>!v);}}>{playing?'Show-Simulation pausieren':'Show-Simulation starten'}</button>
   <Rehearsal clock={clock} playing={playing&&!preferences.reducedMotion} settings={settings} scenario={scenario} onReading={onReading}/>
   <ul aria-label="Wiedergegebene Show-Clips">{readings.map(r=><li key={r.slot}>{labels[r.slot]} · {r.clip} · {r.time.toFixed(2)} s{settings.mode==='spotlight'&&r.leader&&r.clip!=='Pausiert'?' · Solo':''}</li>)}</ul>
  </section>}
 </fieldset>;
}
