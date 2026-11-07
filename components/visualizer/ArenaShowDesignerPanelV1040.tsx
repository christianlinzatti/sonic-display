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
    updatePreferences({arenaShowDesignerEnabledV1040:false,arenaShowPlanV1040:undefined,goveeShowSyncEnabledV1042:false});
    setStatus('Showplan entfernt; vorherige Bühnen-Einstellungen gelten wieder.');
   }}>Showplan entfernen</button>
  </>}
  <small>Die geplanten Szenen werden relativ zur tatsächlichen Wiedergabedauer abgespielt (bei unbekannter Dauer bleibt der Plan aus). Kameravorschläge bleiben Vorschau. Tanzformationen werden nur mit der separaten V1041-Freigabe übernommen; aktive manuelle Timeline-, Kamera- und Choreografie-Regie wird nicht überschrieben. Nur opt-in-aktivierte 360°-Bühnen-, Schwebe- und Lasereffekte werden gesteuert. Echte Drops/Beats bleiben Voraussetzung für Pyro-Effekte. Manuell gewählte Muster und deaktivierte Effekte behalten Vorrang; bei Pause oder reduzierter Bewegung wird der Plan nicht angetrieben.</small>
 </section>;
}
