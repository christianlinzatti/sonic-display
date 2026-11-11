'use client';
import {SHOW_PRODUCTIONS,productionTake,type ProductionId} from '@/lib/showProduction';
import {voteShowTaste,TASTE_MOTIFS} from '@/lib/showTaste';
import {useCallback,useEffect,useRef,useState} from 'react';
import dynamic from 'next/dynamic';
import {useUiPreferences} from '@/context/UiPreferencesContext';
import type {UiPreferences} from '@/types/music';
import {CREW_IDS,type CrewMode,type CrewSettings} from './sonicCrewDirector';
import {useCrewSettings,writeCrewSettings} from './useSonicCrew';
import {readGroupV326,writeGroupV326,layoutV326,type GroupStudioV326} from './multiAvatarStageDirectorV326';
import type {CrewReading,CrewScenario} from './SonicCrewRehearsal';
const Rehearsal=dynamic(()=>import('./SonicCrewRehearsal'),{ssr:false,loading:()=><p>3D-Vorschau wird geladen…</p>});
import {getAvatarModel} from './avatarModels';
import {useMusic} from '@/context/MusicContext';
import {CONCERT_COORDINATION_EVENT_V1154,CONCERT_COORDINATION_KEY_V1154,loadConcertCoordinationV1154,saveConcertCoordinationV1154} from '@/lib/aiConcertCoordinationV1154';
const roleLabels:Record<string,string>={lead:'Solo',partner:'Duett',echo:'Antwort',together:'Gemeinsam',rest:'Ruhe'};
const originalCast=[...CREW_IDS.slice(0,3)];
export function SonicCrewControls(){
 const music=useMusic();
 const settings=useCrewSettings(),{preferences,updatePreferences}=useUiPreferences();
 const [show,setShow]=useState(false),[playing,setPlaying]=useState(false),[position,setPosition]=useState(0);
 const [scenario,setScenario]=useState<CrewScenario>({section:'verse',genre:'house',energy:.55,bpm:120});
 const [readings,setReadings]=useState<CrewReading[]>([]),[saved,setSaved]=useState<{group:GroupStudioV326;preferences:Pick<UiPreferences,'avatarModelId'|'secondaryAvatarModelId'|'visualizerMode'>;crew:CrewSettings}|null>(null);
 const [tasteNotice,setTasteNotice]=useState('');
 const [coordination,setCoordination]=useState(loadConcertCoordinationV1154);
 useEffect(()=>{
  const refresh=()=>setCoordination(loadConcertCoordinationV1154());
  const storage=(e:StorageEvent)=>{if(e.key===CONCERT_COORDINATION_KEY_V1154||e.key===null)refresh();};
  window.addEventListener(CONCERT_COORDINATION_EVENT_V1154,refresh);window.addEventListener('storage',storage);
  return()=>{window.removeEventListener(CONCERT_COORDINATION_EVENT_V1154,refresh);window.removeEventListener('storage',storage);};
 },[]);
 const vote=(clip:string,direction:1|-1)=>{writeCrewSettings({...settings,taste:voteShowTaste(settings.taste,clip,direction)});setTasteNotice(direction===1?'Dieses Motiv wird häufiger berücksichtigt.':'Dieses Motiv wird seltener berücksichtigt.');};
 const [cast,setCast]=useState<string[]>(originalCast);
 const maxSeconds=Math.max(120,Math.min(3600,Math.ceil((music.track?.durationMs??0)/1000)));
 const labels=cast.map(id=>getAvatarModel(id).label);
 const clock=useRef(0);
 useEffect(()=>{if(!settings.enabled||preferences.reducedMotion)setPlaying(false);},[settings.enabled,preferences.reducedMotion]);
 const onReading=useCallback((reading:CrewReading)=>{setReadings(old=>{const previous=old.find(r=>r.slot===reading.slot);return previous?.clip===reading.clip&&previous.leader===reading.leader&&previous.role===reading.role&&previous.chapter===reading.chapter&&previous.persona===reading.persona&&previous.sequence===reading.sequence&&previous.bodyStyle===reading.bodyStyle&&previous.evaluatedClip===reading.evaluatedClip&&Math.abs((previous.contact??0)-(reading.contact??0))<.002&&Math.abs(previous.time-reading.time)<.01?old:[...old.filter(r=>r.slot!==reading.slot),reading].sort((a,b)=>a.slot-b.slot);});setPosition(clock.current);if(clock.current>=maxSeconds)setPlaying(false);},[maxSeconds]);
 const setup=()=>{
  setSaved({group:readGroupV326(),preferences:{avatarModelId:preferences.avatarModelId,secondaryAvatarModelId:preferences.secondaryAvatarModelId,visualizerMode:preferences.visualizerMode},crew:settings});
  writeGroupV326({...readGroupV326(),enabled:true,count:3,songSync:false,trackId:'',minSpacing:1.2,modelIds:[cast[0],cast[1],cast[2],''],cues:[{id:'sonic-crew-row',at:0,formation:'wide',focus:-1,drop:false,transition:.8,positions:layoutV326('wide',3)}]});
  updatePreferences({avatarModelId:cast[0],secondaryAvatarModelId:cast[1],visualizerMode:'avatar'});
  writeCrewSettings({...settings,enabled:true,mode:settings.mode==='adaptive'?'adaptive':'unison'});
 };
 const undo=()=>{if(!saved)return;writeGroupV326(saved.group);updatePreferences(saved.preferences);writeCrewSettings(saved.crew);setSaved(null);};
 return <fieldset aria-label="Sonic Stage Crew – Musik und gemeinsame Show"><legend>Sonic Stage Crew · Musik &amp; gemeinsame Show</legend>
  <p>Die adaptive Regie verteilt Soli, Tanzduelle und Antworten über den Song. Vor Refrains sammelt die Crew Spannung; schnelle Lyrics bekommen eine ruhige Begleitung. Elf eingebaute Figuren wählen abwechslungsreiche Genre-Clips anhand der vorhandenen Songposition, Abschnitts- und Energiedaten. Ohne Tempoangabe wird 120 BPM verwendet. Dies ergänzt die bestehende Analyse; es ist keine neue Musikerkennung.</p>
  <fieldset aria-label="V1154 KI-Konzertregie 3.0">
   <legend>V1154 · KI-Konzertregie 3.0</legend>
   <label className="setting-check"><input type="checkbox" checked={coordination.enabled}
    onChange={e=>saveConcertCoordinationV1154({...coordination,enabled:e.target.checked})}/>
    Sanfte Crew- und Govee-Koordination aktivieren</label>
   <label>Stärke ({coordination.strength} %)
    <input type="range" min="0" max="100" step="5" value={coordination.strength}
     onChange={e=>saveConcertCoordinationV1154({...coordination,strength:Number(e.target.value)})}/>
   </label>
   <p className="settings-note">Standardmäßig aus. Der Avatar-Ausdruck wird bei ruhigen oder textreichen Passagen zurückhaltender. Deutschrap, Hardtekk/Hardstyle und Deutschrock erhalten unterschiedlich abgestimmte, weich einblendende Ausdrucks- und Lichtkurven. Govee-Helligkeit wird nur bei bestätigten Songabschnitten im bestehenden freigegebenen Musik-Sync gedämpft; keine zusätzlichen Lampenbefehle, neuen Bewegungsclips oder künstlichen Beats. Manuelle Choreografien, eigene Lichtshows und reduzierte Bewegung haben Vorrang.</p>
  </fieldset>
  <fieldset aria-label="AI-Show-Inszenierung"><legend>Abwechslungsreiche Konzertshows</legend>
   <label><input type="checkbox" checked={settings.showPlans===true} onChange={e=>writeCrewSettings({...settings,showPlans:e.target.checked})}/> AI-Show-Planung aktivieren</label>
   <label>Show-Konzept <select aria-label="Show-Konzept" disabled={!settings.showPlans} value={settings.showStyle??'auto'} onChange={e=>writeCrewSettings({...settings,showStyle:e.target.value==='auto'?undefined:e.target.value as ProductionId})}><option value="auto">AI-Auswahl mit Abwechslung</option>{SHOW_PRODUCTIONS.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select></label>
   <button type="button" disabled={!settings.showPlans} onClick={()=>{writeCrewSettings({...settings,showTake:(productionTake(settings.showTake)+1)%1000});setTasteNotice('Neue Show-Version vorbereitet. Sichere Übergänge und Lyrics behalten Vorrang.');}}>Neue Show-Version</button>
   <p>Die lokale Regie bewertet Genre, Lyrics-Struktur und frühere Shows. Ein Konzept verbindet Tanzmotive, Kamera, Licht und Textakzente über den Song. Mit „Neue Show-Version“ kannst du eine andere Inszenierung ausprobieren.</p>
  </fieldset>
  <label><input type="checkbox" checked={settings.poseAware===true} onChange={e=>writeCrewSettings({...settings,poseAware:e.target.checked})}/> Körperhaltung bei freien Tanzwechseln berücksichtigen</label>
  <p>Song-Gedächtnis: Ein Motiv aus der Strophe kehrt in Refrains wieder. Das Finale verbindet Motiv, Antwort und gemeinsamen Abschluss. Deine Motiv-Vorlieben bleiben lokal auf diesem Gerät.</p>
  <button type="button" disabled={!Object.keys(settings.taste??{}).length} onClick={()=>{writeCrewSettings({...settings,taste:undefined});setTasteNotice('Motiv-Vorlieben zurückgesetzt.');}}>Vorlieben zurücksetzen</button>
  <p role="status" aria-live="polite">{tasteNotice}</p>
  <label><input type="checkbox" checked={settings.remember!==false} onChange={e=>writeCrewSettings({...settings,remember:e.target.checked})}/> Abwechslung über mehrere Songs merken</label>
  <button type="button" disabled={!settings.history?.length} onClick={()=>{writeCrewSettings({...settings,history:undefined});setTasteNotice('Show-Verlauf gelöscht. Deine Motiv-Vorlieben bleiben erhalten.');}}>Show-Verlauf löschen</button>
  <p>Lokaler Show-Verlauf: {settings.history?.length??0} von höchstens 24 Songs. Gespeichert werden Song-Kennung, Tanzmotive, Kameravarianten und verwendete Show-Konzepte. Aktuelle Songmotive bleiben bei Zeitsprüngen zusammenhängend.</p>
  <p>Tanzdialoge: Eine Figur stellt ein Motiv vor, die zweite übernimmt es als Antwort. Danach findet die Crew im gemeinsamen Motiv zusammen. Schnelle Lyrics und ruhige Songteile bekommen weiterhin Platz.</p>
  <p>Kreative Regie: Nach dem persönlichen Auftakt entwickelt die Crew neue Ganzkörper-Motive aus Genre, Energie und Bewegungskontrasten. Spätere Refrains schicken die Antwortwelle auch in die Gegenrichtung. Gemeinsame Höhepunkte bleiben synchron.</p>
  <p>Encore: Ember Rock, Luna Flow, Sol Groove und Velvet Jazz bringen vier neue Looks und je sechs zusätzliche Genre-Tänze. Die lokale Musikregie wechselt Moves an musikalischen Übergängen; ruhige Songteile bekommen bewusst weniger Bewegung.</p>
  <div className="avatar-editor-actions">{cast.map((id,slot)=><label key={slot}>Figur {slot+1}<select value={id} onChange={e=>{setCast(old=>old.map((x,i)=>i===slot?e.target.value:x));setReadings([]);}}>{CREW_IDS.map(model=><option key={model} value={model}>{getAvatarModel(model).label}</option>)}</select></label>)}</div>
  <label><input type="checkbox" checked={settings.enabled} onChange={e=>writeCrewSettings({...settings,enabled:e.target.checked})}/> Musiksteuerung für Sonic Stage Crew</label>
  <label><input type="checkbox" checked={settings.reactions} onChange={e=>writeCrewSettings({...settings,reactions:e.target.checked})}/> Eigene Reaktionen der Figuren</label>
  <button type="button" onClick={()=>writeCrewSettings({...settings,enabled:true,mode:'adaptive'})}>Intelligente Show aktivieren</button>
  <p>Gemeinsame Song-Dramaturgie: Refrains steigern sich, die Crew antwortet einander und wechselt zwischen Solos, Tanzduellen und gemeinsamen Höhepunkten. Alle elf Figuren haben vier neue Schrittfolgen: Side Glide, Diagonal Step, Heel-Toe und Pivot Step.</p>
  <p>Headliner: Atlas Prism, Aurora Synth, Rio Carnival und Quantum Bass mit je 32 Animationen. Die intelligente Regie bewertet Energie, Genre und die letzten drei Moves. Dichte Lyrics erhalten Solo-Fokus; Drops gemeinsame Power-Momente. Wiederkehrende Lyrics werden als Refrain-Hinweis genutzt.</p>
  <label>Charakterausdruck <select aria-label="Charakterausdruck" value={settings.expression??'balanced'} onChange={e=>writeCrewSettings({...settings,expression:e.target.value})}>
   <option value="subtle">Dezent</option><option value="balanced">Ausgewogen</option><option value="bold">Bühnenstark</option>
  </select></label>
  <p>Natürlichere Bühnenpräsenz: weiche Kopf- und Schulterreaktionen, vorbereitete Akzente und sichtbarer Bodenkontakt. In der automatischen Show stehen die Sonic-Figuren auf dem Bühnenboden; angehobene Füße erhalten weichere Kontaktschatten.</p>
  <p>Neu: Ganzkörper-Stile mit Kniearbeit, Gewichtsverlagerung und Drehungen. Roboter, fließende Tänzer und Frontleute verwenden unterschiedliche Körperabläufe. Die neuen Clips sind prozedural erstellt; es sind keine Motion-Capture-Aufnahmen.</p>
  <p>Jede Figur hat einen eigenen Ausdruck. Genreabhängige Folgen verbinden Groove, Schritte, Akzente und Signaturen. Die Figuren wechseln sanft zwischen gemeinsamem Tanz und Antwortbewegungen.</p>
  <label>Gemeinsame Choreografie <select value={settings.mode} onChange={e=>writeCrewSettings({...settings,mode:e.target.value as CrewMode})}>
   <option value="adaptive">Intelligente Show · Kontrast & Bewegungs-Gedächtnis</option><option value="individual">Individuell</option><option value="unison">Gemeinsamer Tanz</option><option value="canon">Kanon · 2 Beats Versatz</option><option value="spotlight">Wechselnde Solos</option><option value="story">V1114 Auto-Choreografie · Abschnitte wechseln</option>
  </select></label>
  <p>V1114 Automatik: Intro/Break = ruhig · Verse = wechselnde Solos · Hook = Kanon · Drop = Unisono. Nur bereits geladene GLB-Clips werden verwendet; bei fehlenden Clips erfolgt ein sicherer Fallback. Die Szenen stammen aus vorhandenen Abschnittssignalen, nicht aus einer erfundenen Drop-Vorhersage.</p>
  <p>Neon Pulse nickt zum Beat; Nova blickt zum Publikum und begrüßt im individuellen Intro; Chrome Beat setzt dezente LED-Akzente. Manuelle Clips, externe Bewegungen, gespeicherte Choreografien und Bewegungsreduktion haben Vorrang.</p>
  <div className="avatar-editor-actions"><button type="button" onClick={setup} disabled={!!saved}>Trio auf der Bühne einrichten</button><button type="button" onClick={undo} disabled={!saved}>Trio-Einrichtung zurücknehmen</button></div>
  {saved&&<p role="status">Trio eingerichtet. Die bisherigen Modelle und Gruppenpositionen lassen sich in diesem Fenster wiederherstellen. Vorhandene manuelle Motion-Steuerungen bleiben vorrangig.</p>}
  <button type="button" aria-expanded={show} onClick={()=>{setShow(v=>!v);setPlaying(false);}}>{show?'Show-Simulation schließen':'Show-Simulation öffnen'}</button>
  {show&&<section aria-label="Show-Simulation"><p><strong>Simulation ohne Musikverbindung.</strong> Positionssprünge zeigen direkt die Zielpose, auch während einer Pause. Abschnitt, Energie und Tempo werden hier von dir vorgegeben. Die Vorschau spielt echte GLBs mit derselben Clip- und Phasenplanung wie die Live-Bühne.</p>
   <button type="button" disabled={!music.track} onClick={()=>{const current=Math.min(maxSeconds,Math.max(0,(music.progressMs+(music.isPlaying?Math.max(0,Date.now()-music.fetchedAt):0))/1000));clock.current=current;setPosition(current);setScenario(old=>({...old,section:'auto',genre:music.genre??old.genre}));}}>Aktuelle Songposition übernehmen</button>
   <label>Simulierter Abschnitt <select value={scenario.section} onChange={e=>setScenario({...scenario,section:e.target.value})}><option value="auto">Aus vorhandenen Lyrics ableiten</option><option value="intro">Intro / Ruhe</option><option value="verse">Strophe</option><option value="hook">Refrain</option><option value="drop">Drop</option></select></label>
   <label>Simuliertes Genre <select value={scenario.genre} onChange={e=>setScenario({...scenario,genre:e.target.value})}><option value="house">House</option><option value="techno">Techno</option><option value="hip-hop">Hip-Hop</option><option value="disco">Disco / Pop</option><option value="hardstyle">Hardstyle</option><option value="rock">Rock / Metal</option><option value="latin">Latin</option><option value="afrobeat">Afrobeat</option><option value="jazz">Jazz / Swing</option><option value="classical">Klassik / Walzer</option><option value="ambient">Ambient / Chill</option><option value="global">Andere Genres</option></select></label>
   <label>Simuliertes Tempo <input type="number" min={55} max={210} value={scenario.bpm} onChange={e=>setScenario({...scenario,bpm:Math.max(55,Math.min(210,Number(e.target.value)||120))})}/></label>
   <label>Simulierte Energie <input type="range" min={0} max={1} step={.05} value={scenario.energy} onChange={e=>setScenario({...scenario,energy:Number(e.target.value)})}/></label>
   <label>Simulierte Position <input type="range" min={0} max={maxSeconds} step={1} value={position} onChange={e=>{clock.current=Number(e.target.value);setPosition(clock.current);}}/></label>
   <button type="button" disabled={preferences.reducedMotion||!settings.enabled} aria-pressed={playing} onClick={()=>{if(!playing&&clock.current>=maxSeconds){clock.current=0;setPosition(0);}setPlaying(v=>!v);}}>{playing?'Show-Simulation pausieren':'Show-Simulation starten'}</button>
   <Rehearsal modelIds={cast} clock={clock} playing={playing&&!preferences.reducedMotion} settings={settings} scenario={{...scenario,lyrics:music.lyrics,durationMs:music.track?.durationMs,trackId:music.track?.id}} onReading={onReading}/>
   <p aria-label="Gemessene Bewegungsqualität">{readings.some(r=>(r.quality?.samples??0)>0)?`Pose-Proben: ${readings.reduce((n,r)=>n+(r.quality?.samples??0),0)} · Standkontakt: ${readings.reduce((n,r)=>n+(r.quality?.plantedSeconds??0),0).toFixed(1)} s · mögliches Fußrutschen: ${readings.reduce((n,r)=>n+(r.quality?.slideSeconds??0),0).toFixed(1)} s · abrupte Hüftwechsel: ${readings.reduce((n,r)=>n+(r.quality?.abruptMoves??0),0)}`:'Noch keine laufende Bewegungsmessung. Zeitsprünge und Pausen werden ausgeschlossen.'}</p>
   <ul aria-label="Wiedergegebene Show-Clips">{readings.map(r=><li key={r.slot} data-answer-style={r.answerStyle} data-quality-samples={r.quality?.samples??0} data-evaluated-clip={r.evaluatedClip} data-clip-time={r.time.toFixed(4)} data-sole-gap={r.contact?.toFixed(4)}>{labels[r.slot]} · {r.clip} · {r.time.toFixed(2)} s{r.role?` · ${roleLabels[r.role]??r.role}`:''}{r.chapter?` · ${r.chapter}`:''}{r.persona?` · ${r.persona}`:''}{r.bodyStyle?` · ${r.bodyStyle}`:''}{r.sequence?` · ${r.sequence}`:''}{settings.mode==='spotlight'&&r.leader&&r.clip!=='Pausiert'?' · Solo':''}{r.evaluatedClip&&TASTE_MOTIFS.includes(r.evaluatedClip as typeof TASTE_MOTIFS[number])&&<span> <button type="button" aria-label={`Mehr davon: ${labels[r.slot]}`} onClick={()=>vote(r.evaluatedClip!,1)}>Mehr davon</button> <button type="button" aria-label={`Weniger davon: ${labels[r.slot]}`} onClick={()=>vote(r.evaluatedClip!,-1)}>Weniger davon</button> <output aria-label={`Motiv-Vorliebe: ${labels[r.slot]}`}>{settings.taste?.[r.evaluatedClip as keyof NonNullable<typeof settings.taste>]??0}</output></span>}</li>)}</ul>
  </section>}
 </fieldset>;
}
