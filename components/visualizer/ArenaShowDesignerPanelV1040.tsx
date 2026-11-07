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
  <fieldset className="arena-v1049-live-concert" aria-label="V1049 Live Concert Intelligence">
   <legend>V1049 · Live Concert Intelligence Engine</legend>
   <label className="setting-check"><input type="checkbox"
    checked={Boolean(preferences.arenaLiveConcertEnabledV1049)&&Boolean(plan)} disabled={!plan}
    onChange={e=>updatePreferences({arenaLiveConcertEnabledV1049:e.target.checked})}/>
    Konzertlicht an tatsächlich gemessene Musikenergie anpassen</label>
   <label>Live-Dynamik: {preferences.arenaLiveConcertStrengthV1049??50}%
    <input type="range" min="0" max="70" step="5"
     disabled={!plan||!preferences.arenaLiveConcertEnabledV1049}
     value={preferences.arenaLiveConcertStrengthV1049??50}
     onChange={e=>updatePreferences({arenaLiveConcertStrengthV1049:Number(e.target.value)})}/>
   </label>
   <small>Benötigt einen aktivierten, funktionierenden Mikrofoneingang. Erkannte
    Energieanstiege, Abklingen und verlässlich bestätigte Beats beeinflussen die
    vorhandenen Bühnen- und optionalen Govee-Akzente. Ohne frisches Live-Signal bleibt
    der Showplan unverändert. Die Funktion erhöht niemals die eingestellte
    Helligkeit, erfindet keine Drops und startet keine zusätzlichen Gerätebefehle.
    Manuelle Kamera- und Choreografieentscheidungen behalten Vorrang.</small>
  </fieldset>
  <fieldset className="arena-v1051-crowd" aria-label="V1051 Immersive Concert Crowd Experience">
   <legend>V1051 · Immersive Concert Crowd Experience</legend>
   <label className="setting-check"><input type="checkbox"
    checked={Boolean(preferences.arenaCrowdExperienceEnabledV1051)&&Boolean(plan)} disabled={!plan}
    onChange={e=>updatePreferences({arenaCrowdExperienceEnabledV1051:e.target.checked})}/>
    Virtuelles Publikum mit La-Ola-Wellen, Jubelgesten und Mitsinglicht aktivieren
   </label>
   <label>Publikums-Dynamik: {preferences.arenaCrowdExperienceStrengthV1051??55}%
    <input type="range" min="0" max="80" step="5" disabled={!plan||!preferences.arenaCrowdExperienceEnabledV1051}
     value={preferences.arenaCrowdExperienceStrengthV1051??55}
     onChange={e=>updatePreferences({arenaCrowdExperienceStrengthV1051:Number(e.target.value)})}/>
   </label>
   <small>Rein virtuelle, lokale und kontinuierliche Animation der vorhandenen 360°-Zuschauer.
    Die sieben geplanten Showabschnitte steuern La-Ola, sanfte Mitsingwellen,
    ruhige Pausen und Finaljubel. Das ist keine Erkennung realen Publikumsjubels.
    Bestehende manuelle Handylicht-Modi bleiben unverändert; keine Soundeffekte,
    Govee-Befehle oder Stroboskopimpulse. Bei Pause, reduzierter Bewegung und
    niedriger Grafikqualität deaktiviert.</small>
  </fieldset>
  <fieldset className="arena-v1052-ultimate-concert" aria-label="V1052 Ultimate Live Concert Experience">
   <legend>V1052 · Ultimate Live Concert Experience</legend>
   <label className="setting-check"><input type="checkbox"
    checked={Boolean(preferences.arenaUltimateConcertEnabledV1052)&&Boolean(plan)} disabled={!plan}
    onChange={e=>updatePreferences({arenaUltimateConcertEnabledV1052:e.target.checked})}/>
    Die 360°-Bühne, Publikumslichter, Kamera und Avatar-Choreografie gemeinsam inszenieren
   </label>
   <label>Regie-Zusammenarbeit: {preferences.arenaUltimateConcertStrengthV1052??60}%
    <input type="range" min="0" max="80" step="5"
     disabled={!plan||!preferences.arenaUltimateConcertEnabledV1052}
     value={preferences.arenaUltimateConcertStrengthV1052??60}
     onChange={e=>updatePreferences({arenaUltimateConcertStrengthV1052:Number(e.target.value)})}/>
   </label>
   <small>Gemeinsamer, songabhängiger Spannungsverlauf: wechselnder Fokus auf Bühne,
    Zuschauer, Kamera und Tänzer; ruhiges Zwischenspiel, volle Hook und sanfter
    Schluss. V1052 koordiniert nur bereits einzeln aktivierte Effekte (für zusätzliche
    Kameraregie V1043 und Avatar-Choreografie V1041 aktivieren). Keine neuen 3D-Objekte,
    kein extra Mikrofon, keine Govee-Gerätebefehle und keine künstlich erkannten Drops.
    Manuelle Schnitte, Lyrics, Tanzclips, Pause, reduzierte Bewegung und
    Leistungsgrenzen behalten Vorrang.</small>
  </fieldset>
  <fieldset className="arena-v1050-storytelling" aria-label="V1050 Adaptive Concert Storytelling">
   <legend>V1050 · Adaptive Concert Storytelling</legend>
   <label className="setting-check"><input type="checkbox"
    checked={Boolean(preferences.arenaStorytellingEnabledV1050)&&Boolean(plan)} disabled={!plan}
    onChange={e=>updatePreferences({arenaStorytellingEnabledV1050:e.target.checked})}/>
    Dramaturgischen Spannungsbogen mit Ruhephasen und großem Finale aktivieren
   </label>
   <label>Storytelling-Intensität: {preferences.arenaStorytellingStrengthV1050??55}%
    <input type="range" min="0" max="80" step="5"
     disabled={!plan||!preferences.arenaStorytellingEnabledV1050}
     value={preferences.arenaStorytellingStrengthV1050??55}
     onChange={e=>updatePreferences({arenaStorytellingStrengthV1050:Number(e.target.value)})}/>
   </label>
   <small>Die lokale Showregie nutzt die sieben bestehenden Szenen als geplante
    Dramaturgie: Intro, Aufbau, Höhepunkte, Interlude als Atempause,
    erneuter Anstieg, Finale und Ausklang. Keine Behauptung über tatsächlich
    erkannte Songteile. Sie verändert nur bereits freigegebene Effektstärken;
    automatische Kameravorschläge bleiben hinter manueller, Lyrics- und
    Avatarregie zurück. Govee erfordert weiterhin eigene LAN-Freigabe und
    verifizierte Musikphasen; keine zusätzlichen Befehle oder Stroboblitze.
    Bei Pause, reduzierter Bewegung oder niedrigem Grafikprofil wird die
    Zusatzregie ausgeschaltet.</small>
  </fieldset>
  <fieldset className="arena-v1069-epic-drop" aria-label="V1069 Epic Drop Experience">
   <legend>V1069 · Epic Drop Experience</legend>
   <label className="setting-check"><input type="checkbox"
    checked={Boolean(preferences.arenaEpicDropEnabledV1069)&&Boolean(plan)} disabled={!plan}
    onChange={e=>updatePreferences({arenaEpicDropEnabledV1069:e.target.checked})}/>
    Bass-Schockwelle, Papierkonfetti und LED-Farbakzente bei bestätigten Drops koordinieren
   </label>
   <label>Drop-Choreografie: {preferences.arenaEpicDropStrengthV1069??55}%
    <input type="range" min="0" max="80" step="5"
     disabled={!plan||!preferences.arenaEpicDropEnabledV1069}
     value={preferences.arenaEpicDropStrengthV1069??55}
     onChange={e=>updatePreferences({arenaEpicDropStrengthV1069:Number(e.target.value)})}/>
   </label>
   <small>Nur echte vom Musiksystem gemeldete Drop-Abschnitte UND starke, verifizierte
    Beat-Flanken lösen Effekte aus. Eine geplante Hook oder ein Finale genügen niemals.
    Verwendet ausschließlich die vorhandenen V1046-Bassringe/Konfetti, die V1059-LED-Wand
    und die V1035-virtuelle Pyrotechnik. Max. 72 Konfettiteile pro Drop, begrenzte
    Ringtransparenz, 2,8 s Drop-Cooldown; keine neuen Meshes, Hardware-Befehle,
    Stroboskop- oder Vollbildblitze. LED-Akzente nur im automatischen Muster.
    Für Schockwelle und Konfetti müssen V1046 Cinematic Finale und die Drop-Lichter
    aktiviert sein; LED-Akzente benötigen die V1059-Wand. Manuell ausgeschaltete
    Systeme bleiben aus. Bei Pause oder niedrigem GPU-Profil aus.</small>
  </fieldset>
  <fieldset className="arena-v1068-holographic-concert" aria-label="V1068 Holographic Concert FX 3.0">
   <legend>V1068 · Holographic Concert FX 3.0</legend>
   <label className="setting-check"><input type="checkbox"
    checked={Boolean(preferences.arenaHolographicConcertEnabledV1068)&&Boolean(plan)} disabled={!plan}
    onChange={e=>updatePreferences({arenaHolographicConcertEnabledV1068:e.target.checked})}/>
    Hologramm-Portale und virtuelle Künstler-Silhouetten passend zur Show inszenieren
   </label>
   <label>Hologramm-Choreografie: {preferences.arenaHolographicConcertStrengthV1068??55}%
    <input type="range" min="0" max="80" step="5" disabled={!plan||!preferences.arenaHolographicConcertEnabledV1068}
     value={preferences.arenaHolographicConcertStrengthV1068??55}
     onChange={e=>updatePreferences({arenaHolographicConcertStrengthV1068:Number(e.target.value)})}/>
   </label>
   <small>Weltfeste Portal-Projektionen: sechs holografische Looks, Echo-Silhouetten und
    optionales Timing mit V1066/V1067. Nur automatisch gesteuerte Portale und gültiger
    Showplan; manuelle Halo-/Spiral-/Tunnel-Muster bleiben vorrangig. Die Projektionen
    sind keine zusätzlichen Künstler, haben keine Sängerrollen und steuern keine Geräte.
    Bei niedriger Grafikqualität, Pause oder Reduced Motion deaktiviert.</small>
  </fieldset>
  <fieldset className="arena-v1067-floating-platforms" aria-label="V1067 Floating Platform Experience 2.0">
   <legend>V1067 · Floating Platform Experience 2.0</legend>
   <label className="setting-check"><input type="checkbox"
    checked={Boolean(preferences.arenaFloatingExperienceEnabledV1067)&&Boolean(plan)} disabled={!plan}
    onChange={e=>updatePreferences({arenaFloatingExperienceEnabledV1067:e.target.checked})}/>
    Schwebende Bühnen-Satelliten mit synchronisierten Wellen, Höhenfahrten und Finale
   </label>
   <label>Schwebe-Choreografie: {preferences.arenaFloatingExperienceStrengthV1067??55}%
    <input type="range" min="0" max="80" step="5" disabled={!plan||!preferences.arenaFloatingExperienceEnabledV1067}
     value={preferences.arenaFloatingExperienceStrengthV1067??55}
     onChange={e=>updatePreferences({arenaFloatingExperienceStrengthV1067:Number(e.target.value)})}/>
   </label>
   <small>Verwendet die maximal sechs vorhandenen V1038-Satelliten und auf Wunsch
    die Bühnenformationen von V1066. Nur Showplan und automatischer Schwebe-Modus:
    selbst gewählte Orbit-/Wellen-/Höhen-Modi haben Vorrang. Die Avatar-Bodenplattform
    bleibt unbeweglich. Zusätzliche Höhenfahrt max. 18 cm, seitlich max. 3,5 cm;
    keine neuen Meshes, kein Netzwerk und keine Govee-Befehle. Bei Pause werden
    Positionen gehalten; Reduced Motion und niedrige GPU-Qualität parken die Zusatzbewegung.</small>
  </fieldset>
  <fieldset className="arena-v1066-transforming-stage" aria-label="V1066 Transforming Stage 3.0">
   <legend>V1066 · Transforming Stage 3.0</legend>
   <label className="setting-check"><input type="checkbox"
    checked={Boolean(preferences.arenaTransformingStageEnabledV1066)&&Boolean(plan)} disabled={!plan}
    onChange={e=>updatePreferences({arenaTransformingStageEnabledV1066:e.target.checked})}/>
    Bewegliche Bühnen-Petalen mit Iris-, Kronen-, Wellen- und Finale-Formationen inszenieren
   </label>
   <label>Transformationsstärke: {preferences.arenaTransformingStageStrengthV1066??55}%
    <input type="range" min="0" max="80" step="5"
     disabled={!plan||!preferences.arenaTransformingStageEnabledV1066}
     value={preferences.arenaTransformingStageStrengthV1066??55}
     onChange={e=>updatePreferences({arenaTransformingStageStrengthV1066:Number(e.target.value)})}/>
   </label>
   <small>Nur vorhandene äußere Bühnensegmente (V1037): kein beweglicher Avatar-Boden,
    keine zusätzlichen 3D-Meshes oder Gerätesteuerung. Automatischer Bühnenmodus
    und aktiver Showplan sind erforderlich. Manuelle Fächer-/Spiral-/Ring-Wahl,
    pausierte Wiedergabe, reduzierte Bewegung und niedrige Grafikqualität bleiben
    vorrangig. Die maximale zusätzliche Auslenkung liegt bei 6,5 cm.</small>
  </fieldset>
  <fieldset className="arena-v1065-performance-director" aria-label="V1065 AI Performance Director">
   <legend>V1065 · AI Performance Director</legend>
   <label className="setting-check"><input type="checkbox"
    checked={Boolean(preferences.arenaPerformanceDirectorEnabledV1065)&&Boolean(plan)} disabled={!plan}
    onChange={e=>updatePreferences({arenaPerformanceDirectorEnabledV1065:e.target.checked})}/>
    Rap, Avatar-Tanz, Ensemble und Kameravorschläge gemeinsam inszenieren
   </label>
   <label>Koordination: {preferences.arenaPerformanceDirectorStrengthV1065??55}%
    <input type="range" min="0" max="80" step="5"
     disabled={!plan||!preferences.arenaPerformanceDirectorEnabledV1065}
     value={preferences.arenaPerformanceDirectorStrengthV1065??55}
     onChange={e=>updatePreferences({arenaPerformanceDirectorStrengthV1065:Number(e.target.value)})}/>
   </label>
   <small>Lokale, regelbasierte Koordination über den bestehenden Showplan. V1065
    priorisiert nur bereits eingeschaltete Effekte und kann sie höchstens abdunkeln;
    es erkennt keine Sänger oder Wörter neu. Manuelle Rap-, Choreografie- und Kamera-
    Einstellungen bleiben vorrangig. Keine zusätzlichen Kamera-, Audio- oder Govee-Loops.
    Bei Pausen, Reduced Motion oder niedriger GPU-Qualität bleibt alles unverändert.</small>
  </fieldset>
  <fieldset className="arena-v1064-stage-movement" aria-label="V1064 Intelligent Stage Movement">
   <legend>V1064 · Intelligent Stage Movement</legend>
   <label className="setting-check"><input type="checkbox"
    checked={Boolean(preferences.arenaStageMovementEnabledV1064)&&Boolean(plan)} disabled={!plan}
    onChange={e=>updatePreferences({arenaStageMovementEnabledV1064:e.target.checked})}/>
    Sichere Bühnenwege und Vorder-/Hintergrundwechsel für 2–4 Avatare aktivieren
   </label>
   <label>Wegbewegung: {preferences.arenaStageMovementStrengthV1064??55}%
    <input type="range" min="0" max="80" step="5" disabled={!plan||!preferences.arenaStageMovementEnabledV1064}
     value={preferences.arenaStageMovementStrengthV1064??55}
     onChange={e=>updatePreferences({arenaStageMovementStrengthV1064:Number(e.target.value)})}/>
   </label>
   <small>Nur automatische Gruppen auf der 360°-Bühne: kurze, langsame Wegpunkte innerhalb
    der zugewiesenen Bühnenzone, ohne echte Spur-/Platztausche. Der vorhandene
    Fußkontakt-, Kollisions- und Bühnenrand-Schutz kann jede Bewegung stoppen.
    Manuelle Positionen, Sängerrollen und niedrige Grafikprofile bleiben vorrangig.
    Keine neuen Uhren, Govee-Befehle oder automatischen GLB-Schrittclips.</small>
  </fieldset>
  <fieldset className="arena-v1063-ensemble" aria-label="V1063 Ensemble Choreography 4.0">
   <legend>V1063 · Ensemble Choreography 4.0</legend>
   <label className="setting-check"><input type="checkbox"
    checked={Boolean(preferences.arenaEnsembleEnabledV1063)&&Boolean(plan)} disabled={!plan}
    onChange={e=>updatePreferences({arenaEnsembleEnabledV1063:e.target.checked})}/>
    Sanfte Gruppenformationen und wechselnden Blickfokus für 2–4 Avatare aktivieren
   </label>
   <label>Ensemble-Stärke: {preferences.arenaEnsembleStrengthV1063??55}%
    <input type="range" min="0" max="80" step="5"
     disabled={!plan||!preferences.arenaEnsembleEnabledV1063}
     value={preferences.arenaEnsembleStrengthV1063??55}
     onChange={e=>updatePreferences({arenaEnsembleStrengthV1063:Number(e.target.value)})}/>
   </label>
   <small>Nur automatische Arena-Formationen: leichte seitliche Staffelung,
    dezente Bogen-/Fächer-Looks und optische Partner-Fokuswechsel ohne
    Platztausch. Manuelle Aufstellungen, Sängerrollen, Fußkontakt-,
    Kollisions- und Low-GPU-Schutz behalten Vorrang.</small>
  </fieldset>
  <fieldset className="arena-v1062-rap-performance" aria-label="V1062 Advanced Rap Performance">
   <legend>V1062 · Advanced Rap Performance 7.0</legend>
   <label className="setting-check"><input type="checkbox"
    checked={Boolean(preferences.arenaRapPerformanceEnabledV1062)&&Boolean(plan)} disabled={!plan}
    onChange={e=>updatePreferences({arenaRapPerformanceEnabledV1062:e.target.checked})}/>
    Rap-Gesten, Wortakzente und dezente Gesichtsmimik verbessern
   </label>
   <label>Performance-Stärke: {preferences.arenaRapPerformanceStrengthV1062??55}%
    <input type="range" min="0" max="80" step="5"
     disabled={!plan||!preferences.arenaRapPerformanceEnabledV1062}
     value={preferences.arenaRapPerformanceStrengthV1062??55}
     onChange={e=>updatePreferences({arenaRapPerformanceStrengthV1062:Number(e.target.value)})}/>
   </label>
   <small>Nur bei verifizierten, zeitlich synchronisierten Rap-Wörtern und eindeutigem
    Sänger-Slot. Geringe Ergänzungen an bestehenden Gesten, Lippen-Reaktionszeiten
    und Augenbrauen/Wangen; die bestehenden Mundformen, manuellen Viseme,
    geschlossenen Lippen und Fußkontakte bleiben unangetastet.
    Bei Pause, Low-GPU, Reduced Motion, manueller Choreografie oder fehlender
    Wort-/Sänger-Zuordnung aus. Keine neuen Animationen oder KI-Cloud-Abfragen.</small>
  </fieldset>
  <fieldset className="arena-v1061-natural-motion" aria-label="V1061 Natural Avatar Motion 3.0">
   <legend>V1061 · Natural Avatar Motion 3.0</legend>
   <label className="setting-check"><input type="checkbox"
    checked={Boolean(preferences.arenaNaturalMotionEnabledV1061)&&Boolean(plan)} disabled={!plan}
    onChange={e=>updatePreferences({arenaNaturalMotionEnabledV1061:e.target.checked})}/>
    Natürliche Schulter-, Oberkörper- und vorsichtige Hüftbewegungen
   </label>
   <label>Bewegungsstärke: {preferences.arenaNaturalMotionStrengthV1061??55}%
    <input type="range" min="0" max="80" step="5"
      disabled={!plan||!preferences.arenaNaturalMotionEnabledV1061}
      value={preferences.arenaNaturalMotionStrengthV1061??55}
      onChange={e=>updatePreferences({arenaNaturalMotionStrengthV1061:Number(e.target.value)})}/>
   </label>
   <small>Nur additive, sehr kleine Bewegungen zum vorhandenen Songtempo;
    keine neue Animation, kein Beat-Tracking und keine neue IK. Bei manuell
    gewählten Choreografien, Pause, Reduced Motion und niedriger Qualität aus.
    Die Hüftbewegung wird bei zwei stehenden Füßen oder unbekanntem Kontakt
    nicht hinzugefügt. GLB-Avatare verwenden vorhandene Rig-Kanäle;
    prozedurale Avatare nur den sichtbaren Oberkörper.</small>
  </fieldset>
  <fieldset className="arena-v1060-lighting-choreographer" aria-label="V1060 AI Lighting Choreographer">
   <legend>V1060 · AI Lighting Choreographer</legend>
   <label className="setting-check"><input type="checkbox"
    checked={Boolean(preferences.arenaLightingChoreographerEnabledV1060)&&Boolean(plan)} disabled={!plan}
    onChange={e=>updatePreferences({arenaLightingChoreographerEnabledV1060:e.target.checked})}/>
    Verfolger-Spots, Laser, LED-Wand und Nebel dramaturgisch aufeinander abstimmen
   </label>
   <label>Koordination: {preferences.arenaLightingChoreographerStrengthV1060??55}%
    <input type="range" min="0" max="80" step="5"
     disabled={!plan||!preferences.arenaLightingChoreographerEnabledV1060}
     value={preferences.arenaLightingChoreographerStrengthV1060??55}
     onChange={e=>updatePreferences({arenaLightingChoreographerStrengthV1060:Number(e.target.value)})}/>
   </label>
   <small>Lokale, regelbasierte Show-Koordination – kein Cloud-KI-Aufruf. Die vier
    bereits separat aktivierten V1056–V1059-Effekte erhalten wechselnde Priorität:
    in der Strophe Sängerfokus, im Aufbau Laser, in der Hook LED-Panorama,
    im Zwischenspiel Lichtatmosphäre. Nur Abdunklung innerhalb bisheriger
    Sicherheitsgrenzen; manuell deaktivierte Effekte und manuell gewählte
    Muster bleiben unverändert. Mindestens einen Effekt V1056–V1059
    separat aktivieren. Keine neuen Leuchten, Govee-Befehle, Blitze oder
    erfundenen Beats. Bei Pause, reduzierter Bewegung, niedrigem Grafikprofil
    oder ungültigem Showplan bleibt der zusätzliche Choreograf inaktiv.</small>
  </fieldset>
  <fieldset className="arena-v1059-led-wall" aria-label="V1059 Advanced LED Wall 4.0">
   <legend>V1059 · Advanced LED Wall 4.0</legend>
   <label className="setting-check"><input type="checkbox"
    checked={Boolean(preferences.arenaLedWallEnabledV1059)&&Boolean(plan)} disabled={!plan}
    onChange={e=>updatePreferences({arenaLedWallEnabledV1059:e.target.checked})}/>
    360°-LED-Panorama mit Equalizer, Geometrie und Showkapitel-Looks aktivieren
   </label>
   <label>LED-Intensität: {preferences.arenaLedWallStrengthV1059??55}%
    <input type="range" min="0" max="80" step="5"
     disabled={!plan||!preferences.arenaLedWallEnabledV1059}
     value={preferences.arenaLedWallStrengthV1059??55}
     onChange={e=>updatePreferences({arenaLedWallStrengthV1059:Number(e.target.value)})}/>
   </label>
   <label>LED-Look
    <select disabled={!plan||!preferences.arenaLedWallEnabledV1059}
     value={preferences.arenaLedWallPatternV1059??'auto'}
     onChange={e=>updatePreferences({arenaLedWallPatternV1059:e.target.value as import('@/lib/arena360LedWallV1059').LedWallPatternV1059})}>
     <option value="auto">Automatisch – je Showkapitel</option>
     <option value="equalizer">Equalizer – echte Audioenergie</option>
     <option value="geometry">Geometrie</option>
     <option value="orbit">Orbit-Wellen</option>
     <option value="pulse">Sanfte Pulse</option>
    </select>
   </label>
   <small>Nur virtuelle, offene LED-Pixel rund um den Arenaboden; ein Instanced-Draw-Call,
    maximal 256 Pixel, begrenzte Helligkeit. Die Equalizerhöhe reagiert auf vorhandene
    Bass-/Mitten-/Höhenwerte, nicht auf behauptete Tonspuren oder erfundene Drops.
    Manuelle LED-Look-Auswahl hat Vorrang vor dem Showplan. Auf niedriger GPU-Qualität,
    bei Pause, reduzierter Bewegung oder ungültigem Showplan bleibt der Effekt aus.
    Keine neuen Hardware-, Govee- oder Audio-Befehle.</small>
  </fieldset>
  <fieldset className="arena-v1058-volumetric-light" aria-label="V1058 Volumetric Light Experience">
   <legend>V1058 · Volumetric Light Experience</legend>
   <label className="setting-check"><input type="checkbox"
    checked={Boolean(preferences.arenaVolumetricLightingEnabledV1058)&&Boolean(plan)} disabled={!plan}
    onChange={e=>updatePreferences({arenaVolumetricLightingEnabledV1058:e.target.checked})}/>
    Sanfte Lichtkegel und Bühnennebel mit dem Konzert-Showplan synchronisieren
   </label>
   <label>Volumetrische Lichtwirkung: {preferences.arenaVolumetricLightingStrengthV1058??55}%
    <input type="range" min="0" max="80" step="5"
     disabled={!plan||!preferences.arenaVolumetricLightingEnabledV1058}
     value={preferences.arenaVolumetricLightingStrengthV1058??55}
     onChange={e=>updatePreferences({arenaVolumetricLightingStrengthV1058:Number(e.target.value)})}/>
   </label>
   <small>V1058 erzeugt eine ressourcenschonende Annäherung an volumetrische Lichtkegel:
    ein sanftes Transparenzprofil in den zwei vorhandenen Bühnen-Spots und
    dezente Farb-/Nebelakzente in den bestehenden Nebel-Batches. Keine echten
    Raymarch-Volumetrics, neuen Leuchten, zusätzliche Nebelpartikel, Mikrofone,
    API-Aufrufe oder Govee-Befehle. Bei Pause, Reduced Motion, niedriger GPU-Qualität,
    ungültigem Showplan oder abgeschalteten Effekten greift ausschließlich der bisherige Look.</small>
  </fieldset>
  <fieldset className="arena-v1057-intelligent-laser" aria-label="V1057 Intelligent Laser Director">
   <legend>V1057 · Intelligent Laser Director</legend>
   <label className="setting-check"><input type="checkbox"
    checked={Boolean(preferences.arenaIntelligentLaserEnabledV1057)&&Boolean(plan)} disabled={!plan}
    onChange={e=>updatePreferences({arenaIntelligentLaserEnabledV1057:e.target.checked})}/>
    Laserfächer, Spiralen und Tunnel mit der geplanten Showdramaturgie synchronisieren
   </label>
   <label>Laserregie-Intensität: {preferences.arenaIntelligentLaserStrengthV1057??55}%
    <input type="range" min="0" max="80" step="5"
     disabled={!plan||!preferences.arenaIntelligentLaserEnabledV1057}
     value={preferences.arenaIntelligentLaserStrengthV1057??55}
     onChange={e=>updatePreferences({arenaIntelligentLaserStrengthV1057:Number(e.target.value)})}/>
   </label>
   <small>V1057 steuert ausschließlich die bereits vorhandenen virtuellen V1036-Laserfächer
    und V1039-Lasertunnel. Farben und langsame Schwenks folgen sieben geplanten
    Showkapiteln; manuell gewählte Lasermuster behalten Vorrang. Die Planung ist
    keine Echtzeit-Erkennung von Drops oder Gesangsrollen. Keine zusätzlichen
    GPU-Objekte, physischen Laser, Blitze oder Govee-Kommandos. Bei Pause,
    reduzierter Bewegung oder niedriger Grafikqualität bleibt V1057 inaktiv.</small>
  </fieldset>
  <fieldset className="arena-v1056-cinematic-lighting" aria-label="V1056 Cinematic Concert Lighting 2.0">
   <legend>V1056 · Cinematic Concert Lighting 2.0</legend>
   <label className="setting-check"><input type="checkbox"
    checked={Boolean(preferences.arenaCinematicLightingEnabledV1056)&&Boolean(plan)} disabled={!plan}
    onChange={e=>updatePreferences({arenaCinematicLightingEnabledV1056:e.target.checked})}/>
    Verfolger-Spots und sanfte Lichtwechsel passend zur geplanten Konzertshow
   </label>
   <label>Lichtregie-Intensität: {preferences.arenaCinematicLightingStrengthV1056??55}%
    <input type="range" min="0" max="80" step="5"
     disabled={!plan||!preferences.arenaCinematicLightingEnabledV1056}
     value={preferences.arenaCinematicLightingStrengthV1056??55}
     onChange={e=>updatePreferences({arenaCinematicLightingStrengthV1056:Number(e.target.value)})}/>
   </label>
   <small>V1056 nutzt nur die zwei vorhandenen V1032-Verfolger-Spots: Eine tatsächlich
    gerenderte Sängerposition auf der rotierenden Bühne bestimmt den Fokus, bei
    fehlendem Avatar gelten die bisherigen Bühnenziele. Songabhängige, weiche
    Lichtfarben und Gruppenszenen ergänzen den siebenaktigen Showplan – keine
    Erkennung erfundener Beats und keine zusätzlichen Govee-Befehle. Lichtstärke,
    Grafikbudget und deaktivierte Leuchten behalten Vorrang. Bei Pause, reduzierter
    Bewegung oder niedrigem Grafikprofil ist die Zusatzregie aus.</small>
  </fieldset>
  <fieldset className="arena-v1055-stage-interaction" aria-label="V1055 Dynamic Concert Stage & Avatar Interaction">
   <legend>V1055 · Dynamic Concert Stage & Avatar Interaction</legend>
   <label className="setting-check"><input type="checkbox"
    checked={Boolean(preferences.arenaStageInteractionEnabledV1055)&&Boolean(plan)} disabled={!plan}
    onChange={e=>updatePreferences({arenaStageInteractionEnabledV1055:e.target.checked})}/>
    Die automatische Duo-Choreografie im Verlauf des Songs auf der Rundbühne inszenieren
   </label>
   <label>Bewegungs- und Regieintensität: {preferences.arenaStageInteractionStrengthV1055??55}%
    <input type="range" min="0" max="80" step="5"
     disabled={!plan||!preferences.arenaStageInteractionEnabledV1055}
     value={preferences.arenaStageInteractionStrengthV1055??55}
     onChange={e=>updatePreferences({arenaStageInteractionStrengthV1055:Number(e.target.value)})}/>
   </label>
   <small>Erfordert den aktiven Showplan (V1040) und die automatische Duo-Choreografie (V1041).
    Das Duo nutzt nacheinander geschützte Positionen auf der mittleren Drehbühne. Die
    schwebenden Satellitenplattformen bleiben reine Dekoration und werden nicht betreten.
    Bestehende optionale Kamerafahrten (V1043/V1047/V1053), Publikumsreaktionen (V1051)
    und Plattformbewegungen (V1038) erhalten abgestimmte, nur abschwächende Akzente.
    Nur prozedurale Duos ohne aktive Fußsperre dürfen ihre Gruppenposition versetzen.
    Importierte GLB-/FBX-Animationen, Fußkontakte, manuelle Formationen, Timeline,
    Kollisionsschutz und individuelle Kameravorgaben behalten Vorrang.
    Keine zweite Kamera, künstlichen Beats oder neuen Govee-Befehle. Bei Pause,
    reduzierter Bewegung und niedriger Grafikqualität automatisch deaktiviert.</small>
  </fieldset>
  <fieldset className="arena-v1054-avatar-performance" aria-label="V1054 Advanced Avatar Performance Intelligence">
   <legend>V1054 · Advanced Avatar Performance Intelligence</legend>
   <label className="setting-check"><input type="checkbox"
    checked={Boolean(preferences.arenaAvatarPerformanceEnabledV1054)&&Boolean(plan)}
    disabled={!plan}
    onChange={e=>updatePreferences({arenaAvatarPerformanceEnabledV1054:e.target.checked})}/>
    Ausdrucksstarke Duo-Akzente und weichere Rap-/Gesangsgesten aktivieren
   </label>
   <label>Gesten-Dynamik: {preferences.arenaAvatarPerformanceStrengthV1054??55}%
    <input type="range" min="0" max="80" step="5"
     disabled={!plan||!preferences.arenaAvatarPerformanceEnabledV1054}
     value={preferences.arenaAvatarPerformanceStrengthV1054??55}
     onChange={e=>updatePreferences({arenaAvatarPerformanceStrengthV1054:Number(e.target.value)})}/>
   </label>
   <small>Erfordert die aktive V1041-Choreografie und eine automatisch gesteuerte
    Zwei-Avatar-Formation. V1054 fügt nur begrenzte Bewegungsakzente hinzu und
    blendet Phrasenanfänge weich ein. Bei echten synchronisierten Wortzeiten
    wird ein dezenter Rap- oder Gesangsgesten-Akzent vorgeschlagen – ohne
    einen Sänger zu identifizieren. Ohne Wortzeiten entstehen nur
    genretypische visuelle Muster. Einzel-Avatare und manuell konfigurierte
    Gruppen bleiben unverändert. Bereits importierte GLB-Clips,
    Rollensteuerung, Fuß-IK, Kollisionen und gespeicherte Formationen behalten
    Vorrang. Keine neuen Animationsmixer, Timer, Mikrofon- oder Govee-Befehle.
    Bei Pause, Reduced Motion und niedriger Grafikstufe deaktiviert.</small>
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
  <fieldset className="arena-v1053-cinematic-camera" aria-label="V1053 Intelligent Concert Camera Experience 2.0">
   <legend>V1053 · Intelligent Concert Camera Experience 2.0</legend>
   <label className="setting-check"><input type="checkbox"
    checked={Boolean(preferences.arenaCinematicCameraEnabledV1053)&&Boolean(plan)}
    disabled={!plan}
    onChange={e=>updatePreferences({arenaCinematicCameraEnabledV1053:e.target.checked})}/>
    Filmische 360°-Kamerafahrten und Lyrics-nahe Lead-Close-ups hinzufügen
   </label>
   <label>Kamera-Dynamik: {preferences.arenaCinematicCameraStrengthV1053??50}%
    <input type="range" min="0" max="80" step="5"
     disabled={!plan||!preferences.arenaCinematicCameraEnabledV1053}
     value={preferences.arenaCinematicCameraStrengthV1053??50}
     onChange={e=>updatePreferences({arenaCinematicCameraStrengthV1053:Number(e.target.value)})}/>
   </label>
   <small>Benötigt den aktiven Showplan sowie V1043 Kamera-Automatik. Ruhige
    Orbit-, Totale- und Höhenfahrten nutzen die bestehende Kamera. Lyrics-Close-ups
    werden nur aus vorhandenen synchronisierten Wort-Zeitstempeln vorgeschlagen.
    V1053 erkennt nicht selbst, welcher Avatar singt: Der vorhandene Kamera- und
    Sängerregisseur bestimmt weiterhin das Motiv. Manuelle Schnitte, gespeicherte
    Presets, Duo-, Rap-, Lyrics- und Sänger-Einstellungen sowie Pause, Reduced Motion
    und Performance-Grenzen haben Vorrang. Keine harten Schnitte oder zweite Kamera.</small>
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
    updatePreferences({arenaShowDesignerEnabledV1040:false,arenaShowPlanV1040:undefined,goveeShowSyncEnabledV1042:false,arenaAudienceDirectorEnabledV1044:false,arenaAtmosphereDirectorEnabledV1045:false,arenaFinaleEnabledV1046:false,arenaImmersiveEnabledV1047:false,arenaConcertDirectorEnabledV1048:false,arenaLiveConcertEnabledV1049:false,arenaStorytellingEnabledV1050:false,arenaCrowdExperienceEnabledV1051:false,arenaUltimateConcertEnabledV1052:false,arenaCinematicCameraEnabledV1053:false,arenaAvatarPerformanceEnabledV1054:false,arenaStageInteractionEnabledV1055:false,arenaCinematicLightingEnabledV1056:false,arenaIntelligentLaserEnabledV1057:false,arenaVolumetricLightingEnabledV1058:false,arenaLedWallEnabledV1059:false,arenaLightingChoreographerEnabledV1060:false,arenaNaturalMotionEnabledV1061:false,arenaRapPerformanceEnabledV1062:false,arenaEnsembleEnabledV1063:false,arenaStageMovementEnabledV1064:false,arenaPerformanceDirectorEnabledV1065:false,arenaTransformingStageEnabledV1066:false,arenaFloatingExperienceEnabledV1067:false});
    setStatus('Showplan entfernt; vorherige Bühnen-Einstellungen gelten wieder.');
   }}>Showplan entfernen</button>
  </>}
  <small>Die geplanten Szenen werden relativ zur tatsächlichen Wiedergabedauer abgespielt (bei unbekannter Dauer bleibt der Plan aus). Kameravorschläge bleiben Vorschau. Tanzformationen werden nur mit der separaten V1041-Freigabe übernommen; aktive manuelle Timeline-, Kamera- und Choreografie-Regie wird nicht überschrieben. Nur opt-in-aktivierte 360°-Bühnen-, Schwebe- und Lasereffekte werden gesteuert. Echte Drops/Beats bleiben Voraussetzung für Pyro-Effekte. Manuell gewählte Muster und deaktivierte Effekte behalten Vorrang; bei Pause oder reduzierter Bewegung wird der Plan nicht angetrieben.</small>
 </section>;
}
