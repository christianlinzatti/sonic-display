'use client';
/** V1040 · Editable, offline-first concert template. Nothing is sent to an API. */
import {useState} from 'react';
import {useUiPreferences} from '@/context/UiPreferencesContext';
import {editArenaShowSegmentV1040,generateArenaShowPlanV1040,normalizeArenaShowPlanV1040,
 type ArenaShowDeckV1040,type ArenaShowFloatV1040,type ArenaShowLaserV1040,
 type ArenaShowCameraV1040,type ArenaShowDanceV1040} from '@/lib/arena360ShowDesignerV1040';

const NAMES:Record<string,string>={intro:'Intro',verse:'Strophe',build:'Spannungsaufbau',hook:'Hook',interlude:'Zwischenspiel',finale:'Finale'};
const DECKS:{id:ArenaShowDeckV1040;label:string}[]=[{id:'halo',label:'LED-Ring'},{id:'fan',label:'Bühnenfächer'},{id:'spiral',label:'Spirale'}];
const FLOATS:{id:ArenaShowFloatV1040;label:string}[]=[{id:'wave',label:'Wellenplattform'},{id:'orbit',label:'Umrundung'},{id:'rise',label:'Höhenfahrt'}];
const LASERS:{id:ArenaShowLaserV1040;label:string}[]=[{id:'halo',label:'Halo'},{id:'spiral',label:'Spirale'},{id:'tunnel',label:'Tunnel'}];
const CAMERAS:{id:ArenaShowCameraV1040;label:string}[]=[{id:'wide',label:'Totale'},{id:'orbit',label:'360° Orbit'},{id:'lead',label:'Lead-Künstler'},{id:'group',label:'Gruppenbild'}];
const DANCES:{id:ArenaShowDanceV1040;label:string}[]=[{id:'calm',label:'Ruhig'},{id:'groove',label:'Groove'},{id:'group',label:'Gruppe'},{id:'peak',label:'Höhepunkt'}];
const minsec=(ms:number)=>`${Math.floor(ms/60000)}:${String(Math.floor(ms%60000/1000)).padStart(2,'0')}`;
export function ArenaShowDesignerPanelV1040(){
 const {preferences,updatePreferences}=useUiPreferences();
 const plan=normalizeArenaShowPlanV1040(preferences.arenaShowPlanV1040);
 const [prompt,setPrompt]=useState(plan?.prompt||'Dramatische Konzertshow mit großem Finale, schwebenden Plattformen und Hologrammen');
 const [genre,setGenre]=useState(plan?.genre==='hard'?'Hardtekk':plan?.genre==='rock'?'Deutschrock':plan?.genre==='rap'?'Deutschrap':'Pop');
 const [seconds,setSeconds]=useState(Math.round((plan?.durationMs??210000)/1000));
 const [name,setName]=useState(plan?.title||'Meine Konzertshow');
 const [status,setStatus]=useState('');
 const edit=(id:string,patch:Parameters<typeof editArenaShowSegmentV1040>[2])=>{
  if(plan)updatePreferences({arenaShowPlanV1040:editArenaShowSegmentV1040(plan,id,patch)});
 };
 return <section className="arena360-experience-options-v1032" aria-label="V1040 AI Show Designer">
  <strong>V1040 · AI Show Designer – kompletter Konzertablauf</strong>
  <p>Beschreibe eine Showidee. Der lokale, regelbasierte Assistent erstellt daraus eine editierbare Konzert-Timeline. Keine externen KI-Anfragen und kein API-Schlüssel erforderlich.</p>
  <label>Show-Titel
   <input type="text" maxLength={75} value={name} onChange={e=>setName(e.target.value)}/>
  </label>
  <label>Showidee
   <textarea rows={3} maxLength={400} value={prompt} onChange={e=>setPrompt(e.target.value)}
    placeholder="Zum Beispiel: Düsterer Deutschrap, langsames Intro, große Laser-Tunnel, spektakuläres Finale"/>
  </label>
  <label>Musikrichtung
   <select value={genre} onChange={e=>setGenre(e.target.value)}>
    <option value="Deutschrap">Deutschrap</option><option value="Hardtekk">Hardtekk / Hardstyle</option>
    <option value="Deutschrock">Deutschrock / NDH</option><option value="Pop">Pop</option>
   </select>
  </label>
  <label>Vorschau-Songlänge (Sekunden)
   <input type="number" min="30" max="900" step="5" value={seconds} onChange={e=>setSeconds(Number(e.target.value))}/>
  </label>
  <button type="button" onClick={()=>{
   const next=generateArenaShowPlanV1040({prompt,genre,durationMs:seconds*1000,title:name});
   updatePreferences({arenaShowPlanV1040:next});setStatus('Showplan erstellt. Aktiviere ihn ausdrücklich, um die Bühne zu steuern.');
  }}>Showplan erzeugen</button>
  <label className="setting-check"><input type="checkbox"
   checked={Boolean(preferences.arenaShowDesignerEnabledV1040)&&Boolean(plan)} disabled={!plan}
   onChange={e=>updatePreferences({arenaShowDesignerEnabledV1040:e.target.checked})}/>
   Diesen Showplan live auf die 360°-Bühne anwenden</label>
  <fieldset className="arena-v1048-concert-director" aria-label="V1048 Next Generation Concert Director">
   <legend>V1048 · Next Generation Concert Director</legend>
   <label className="setting-check"><input type="checkbox"
    checked={Boolean(preferences.arenaConcertDirectorEnabledV1048)&&Boolean(plan)} disabled={!plan}
    onChange={e=>updatePreferences({arenaConcertDirectorEnabledV1048:e.target.checked})}/>
    Jeden Song mit eigenen, abwechslungsreichen Show-Motiven inszenieren
   </label>
   <label>Regievariation: {preferences.arenaConcertDirectorStrengthV1048??50}%
    <input type="range" min="0" max="70" step="5" disabled={!plan||!preferences.arenaConcertDirectorEnabledV1048}
     value={preferences.arenaConcertDirectorStrengthV1048??50}
     onChange={e=>updatePreferences({arenaConcertDirectorStrengthV1048:Number(e.target.value)})}/>
   </label>
   <small>Lokale songabhängige Arrangements für Bühnenform, Laser/Hologramme,
    Kamera und Avatar-Gruppenbilder. Gleiches Lied = gleicher Ablauf, neue Songs = neue Motive.
    Nur automatisch erzeugte Einstellungen werden variiert; manuell bearbeitete
    Showplan-Szenen, Kamera-/Duo-/Lyrics-Regie und einzelne Effekt-Schalter behalten Vorrang.
    Govee nutzt weiterhin ausschließlich V1042 mit bestätigter Musikphase, Helligkeitsgrenzen
    und gesonderter LAN-Freigabe. Keine KI-Cloud, kein Mikrofon, keine neuen Gerätebefehle,
    keine erfundenen Beats oder Stroboblitze; bei Pause, reduzierter Bewegung oder niedrigem
    Grafikprofil wird die zusätzliche Regie deaktiviert.</small>
  </fieldset>
  <fieldset className="arena-v1041-choreography" aria-label="V1041 intelligente Avatar-Choreografie">
   <legend>V1041 · Intelligent Avatar Choreography Director</legend>
   <label className="setting-check"><input type="checkbox"
    checked={Boolean(preferences.arenaChoreographyEnabledV1041)}
    onChange={e=>updatePreferences({arenaChoreographyEnabledV1041:e.target.checked})}/>
    Geplante Tanzformationen live anwenden (separat aktivieren)
   </label>
   <label>Choreografie-Intensität: {preferences.arenaChoreographyStrengthV1041??60}%
    <input type="range" min="0" max="100" step="5"
     value={preferences.arenaChoreographyStrengthV1041??60}
     onChange={e=>updatePreferences({arenaChoreographyStrengthV1041:Number(e.target.value)})}/>
   </label>
   <label>Formation
    <select value={preferences.arenaChoreographyFormationV1041??'auto'}
     onChange={e=>updatePreferences({arenaChoreographyFormationV1041:e.target.value as 'auto'|'line'|'diagonal'|'wide'})}>
     <option value="auto">Automatisch nach Showplan</option><option value="line">Nebeneinander</option>
     <option value="diagonal">Diagonal</option><option value="wide">Breite Arena-Formation</option>
    </select>
   </label>
   <small>Nur bei aktivem Showplan, laufender Musik und gewählter 360°-Arena. Vorhandene Duo-/Gruppen-Timelines, manuelle Tanzmodi, Sängerrollen und GLB-Animationen bleiben vorrangig. Auf niedriger Grafikstufe ist der zusätzliche Duo-Auftritt deaktiviert.</small>
  </fieldset>
  <fieldset className="arena-v1042-govee" aria-label="V1042 Govee Show-Integration">
   <legend>V1042 · Intelligent Govee Concert Integration</legend>
   <label className="setting-check"><input type="checkbox"
    checked={Boolean(preferences.goveeShowSyncEnabledV1042)&&Boolean(plan)} disabled={!plan}
    onChange={e=>updatePreferences({goveeShowSyncEnabledV1042:e.target.checked})}/>
    Den aktiven Showplan auf maximal vier zugeordnete Govee-LAN-Leuchten anwenden
   </label>
   <label>Govee-Showakzent: {preferences.goveeShowSyncStrengthV1042??45}%
    <input type="range" min="0" max="65" step="5"
     value={preferences.goveeShowSyncStrengthV1042??45}
     onChange={e=>updatePreferences({goveeShowSyncStrengthV1042:Number(e.target.value)})}/>
   </label>
   <small>Nur mit aktivem V1040-Showplan, Govee-LAN-Bridge, automatischer Govee-Steuerung und
    den bereits unter Govee Concert Sync V1027 zugeordneten Zonen (Wand, Rhythmus, Neon, Ambient).
    Kein automatisches Einschalten oder Verbinden. Gespeicherte Govee-Shows, manuelle Eingriffe,
    Wiederverbindungen und Gruppen-Unison behalten Vorrang. Die Showregie bleibt bei Pause,
    verdecktem Tab oder reduzierter Bewegung aus.</small>
  </fieldset>
  <fieldset className="arena-v1044-audience" aria-label="V1044 Audience Light Orchestra">
   <legend>V1044 · Audience Light Orchestra</legend>
   <label className="setting-check"><input type="checkbox"
    checked={Boolean(preferences.arenaAudienceDirectorEnabledV1044)&&Boolean(plan)} disabled={!plan}
    onChange={e=>updatePreferences({arenaAudienceDirectorEnabledV1044:e.target.checked})}/>
    Das virtuelle Publikum mit Show-Mustern aus Handylichtern inszenieren
   </label>
   <label>Publikumslicht-Intensität: {preferences.arenaAudienceDirectorStrengthV1044??50}%
    <input type="range" min="0" max="75" step="5"
     value={preferences.arenaAudienceDirectorStrengthV1044??50}
     onChange={e=>updatePreferences({arenaAudienceDirectorStrengthV1044:Number(e.target.value)})}/>
   </label>
   <small>Intro: langsames Atmen · Strophe: umlaufende Lichtwelle · Aufbau: Doppelwelle ·
    Hook: gemeinsames Leuchten · Break: Sternenlichter · Finale: Lichtkrone. Nutzt ausschließlich
    die vorhandenen instanzierten Handylichter, keine echten Govee-Leuchten. Nur bei aktivem
    Showplan, 360°-Bühne und Wiedergabe. Manuelle Handylichtmodi, Pause, Reduced Motion und
    niedrige Grafikstufe bleiben vorrangig. Kein Stroboskop.</small>
  </fieldset>
  <fieldset className="arena-v1045-atmosphere" aria-label="V1045 Intelligent Concert Atmosphere 2.0">
   <legend>V1045 · Intelligent Concert Atmosphere 2.0</legend>
   <label className="setting-check"><input type="checkbox"
    checked={Boolean(preferences.arenaAtmosphereDirectorEnabledV1045)&&Boolean(plan)} disabled={!plan}
    onChange={e=>updatePreferences({arenaAtmosphereDirectorEnabledV1045:e.target.checked})}/>
    Atmosphärischen Nebel, Laserfarben und LED-Himmel an die Showphasen anpassen
   </label>
   <label>Atmosphäre-Intensität: {preferences.arenaAtmosphereDirectorStrengthV1045??55}%
    <input type="range" min="0" max="75" step="5"
     disabled={!plan||!preferences.arenaAtmosphereDirectorEnabledV1045}
     value={preferences.arenaAtmosphereDirectorStrengthV1045??55}
     onChange={e=>updatePreferences({arenaAtmosphereDirectorStrengthV1045:Number(e.target.value)})}/>
   </label>
   <small>Genreabhängige sanfte Farben; gleitende Übergänge zwischen Intro, Strophe, Aufbau,
    Hook, Break und Finale. Nur virtuelle Effekte der 360°-Arena; aktiviert keine Nebelmaschine,
    echten Laser, Govee-Leuchten oder Pyrotechnik. Deaktivierte Effekte, Pause, Reduced Motion,
    Grafikleistungsgrenzen und die vorhandene manuelle Showregie behalten Vorrang.
    Keine schnellen Blitze.</small>
  </fieldset>
  <fieldset className="arena-v1046-cinematic-finale" aria-label="V1046 Cinematic Concert Finale Engine">
   <legend>V1046 · Cinematic Concert Finale Engine</legend>
   <label className="setting-check"><input type="checkbox"
    checked={Boolean(preferences.arenaFinaleEnabledV1046)&&Boolean(plan)} disabled={!plan}
    onChange={e=>updatePreferences({arenaFinaleEnabledV1046:e.target.checked})}/>
    Dramatisches 360°-Finale mit Konfetti, Beat-Schockwelle, Laser- und Bühnenakzenten
   </label>
   <label>Finale-Intensität: {preferences.arenaFinaleStrengthV1046??60}%
    <input type="range" min="0" max="80" step="5"
     disabled={!plan||!preferences.arenaFinaleEnabledV1046}
     value={preferences.arenaFinaleStrengthV1046??60}
     onChange={e=>updatePreferences({arenaFinaleStrengthV1046:Number(e.target.value)})}/>
   </label>
   <small>Finale dramaturgisch in Sammeln, Steigern, Höhepunkt und Abklingen gegliedert.
    Konfetti ist ausschließlich virtuell. Die Ring-Schockwelle benötigt einen echten starken
    Beat aus der Audioanalyse; keine erfundenen Drops. Die vorhandenen Laser, Bühne,
    Publikums-Handylichter und optional die V1041-Avatar-Choreografie werden nur akzentuiert,
    wenn sie bereits aktiviert sind. Keine echten Geräte, Pyrotechnik oder Stroboblitze.
    Pause, reduzierte Bewegung, manuelle Regie und Leistungsgrenzen haben Vorrang.</small>
  </fieldset>
  <fieldset className="arena-v1047-immersive-arena" aria-label="V1047 Immersive Arena Experience 3.0">
   <legend>V1047 · Immersive Arena Experience 3.0</legend>
   <label className="setting-check"><input type="checkbox"
    checked={Boolean(preferences.arenaImmersiveEnabledV1047)&&Boolean(plan)} disabled={!plan}
    onChange={e=>updatePreferences({arenaImmersiveEnabledV1047:e.target.checked})}/>
    Bewegliche Hologramme über dem Publikum, 360°-Lichttunnel und dezente Kinokamera-Akzente
   </label>
   <label>Immersion: {preferences.arenaImmersiveStrengthV1047??55}%
    <input type="range" min="0" max="75" step="5"
     disabled={!plan||!preferences.arenaImmersiveEnabledV1047}
     value={preferences.arenaImmersiveStrengthV1047??55}
     onChange={e=>updatePreferences({arenaImmersiveStrengthV1047:Number(e.target.value)})}/>
   </label>
   <small>Nur virtuelle 3D-Lichtobjekte. Vorhandene Hologramm- und Laser-Schalter
    gelten weiterhin. Kamera-Akzente nur mit aktivierter V1043-Automatik und ohne
    manuelle, Sänger-, Lyrics- oder Timeline-Kamera. Kein echtes Lasergerät, kein
    Stroboskop, kein Govee-Befehl. Pause, Reduced Motion und Performance-Limits haben Vorrang.</small>
  </fieldset>
  <fieldset className="arena-v1043-show-camera" aria-label="V1043 Show Camera Director">
   <legend>V1043 · Intelligent Show Camera Director</legend>
   <label className="setting-check"><input type="checkbox"
    checked={Boolean(preferences.arenaShowCameraEnabledV1043)&&Boolean(plan)} disabled={!plan}
    onChange={e=>updatePreferences({arenaShowCameraEnabledV1043:e.target.checked})}/>
    Kameraperspektiven des Showplans in der 360°-Arena live anwenden
   </label>
   <label>Kamera-Akzent: {preferences.arenaShowCameraStrengthV1043??45}%
    <input type="range" min="0" max="80" step="5"
     value={preferences.arenaShowCameraStrengthV1043??45}
     onChange={e=>updatePreferences({arenaShowCameraStrengthV1043:Number(e.target.value)})}/>
   </label>
   <small>Die vorhandene Kamera bleibt verantwortlich. Nur bei aktiviertem Showplan und laufendem Titel; manuelle Presets, Lyrics-, Sänger-, Rap-, Duett- und Timeline-Kameras sowie Reduced Motion haben Vorrang. Keine harten Schnitte und keine zusätzlichen Kameras.</small>
  </fieldset>
  {status&&<small role="status">{status}</small>}
  {plan&&<>
   <p><strong>{plan.title}</strong> · {plan.genre} · Vorschau {minsec(plan.durationMs)} · sieben Szenen</p>
   <ol className="arena-v1040-scene-list">
    {plan.segments.map(s=><li key={s.id}>
     <strong>{NAMES[s.scene]} · {minsec(plan.durationMs*s.start)}–{minsec(plan.durationMs*s.end)}</strong>
     <label>Intensität: {s.intensity}%<input type="range" min="0" max="100" step="5"
       value={s.intensity} onChange={e=>edit(s.id,{intensity:Number(e.target.value)})}/></label>
     <label>Bühnenform<select value={s.deck} onChange={e=>edit(s.id,{deck:e.target.value as ArenaShowDeckV1040})}>
      {DECKS.map(v=><option key={v.id} value={v.id}>{v.label}</option>)}
     </select></label>
     <label>Schwebeplattform<select value={s.floating} onChange={e=>edit(s.id,{floating:e.target.value as ArenaShowFloatV1040})}>
      {FLOATS.map(v=><option key={v.id} value={v.id}>{v.label}</option>)}
     </select></label>
     <label>Laser / Hologramme<select value={s.lasers} onChange={e=>edit(s.id,{lasers:e.target.value as ArenaShowLaserV1040})}>
      {LASERS.map(v=><option key={v.id} value={v.id}>{v.label}</option>)}
     </select></label>
     <label>Vorgeschlagene Kamera<select value={s.camera} onChange={e=>edit(s.id,{camera:e.target.value as ArenaShowCameraV1040})}>
      {CAMERAS.map(v=><option key={v.id} value={v.id}>{v.label}</option>)}
     </select></label>
     <label>Vorgeschlagener Tanz<select value={s.dance} onChange={e=>edit(s.id,{dance:e.target.value as ArenaShowDanceV1040})}>
      {DANCES.map(v=><option key={v.id} value={v.id}>{v.label}</option>)}
     </select></label>
    </li>)}
   </ol>
   <button type="button" onClick={()=>{
    updatePreferences({arenaShowDesignerEnabledV1040:false,arenaShowPlanV1040:undefined,goveeShowSyncEnabledV1042:false,arenaAudienceDirectorEnabledV1044:false,arenaAtmosphereDirectorEnabledV1045:false,arenaFinaleEnabledV1046:false,arenaImmersiveEnabledV1047:false,arenaConcertDirectorEnabledV1048:false});
    setStatus('Showplan entfernt; vorherige Bühnen-Einstellungen gelten wieder.');
   }}>Showplan entfernen</button>
  </>}
  <small>Die geplanten Szenen werden relativ zur tatsächlichen Wiedergabedauer abgespielt (bei unbekannter Dauer bleibt der Plan aus). Kameravorschläge bleiben Vorschau. Tanzformationen werden nur mit der separaten V1041-Freigabe übernommen; aktive manuelle Timeline-, Kamera- und Choreografie-Regie wird nicht überschrieben. Nur opt-in-aktivierte 360°-Bühnen-, Schwebe- und Lasereffekte werden gesteuert. Echte Drops/Beats bleiben Voraussetzung für Pyro-Effekte. Manuell gewählte Muster und deaktivierte Effekte behalten Vorrang; bei Pause oder reduzierter Bewegung wird der Plan nicht angetrieben.</small>
 </section>;
}
