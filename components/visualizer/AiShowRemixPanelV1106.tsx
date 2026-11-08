'use client';
/** V1106 · Deliberate opt-in, preview, explicit apply and conflict-safe undo. */
import {useEffect,useRef,useState} from 'react';
import {useUiPreferences} from '@/context/UiPreferencesContext';
import {useAudioAnalysis} from '@/context/AudioAnalysisContext';
import {useMusic} from '@/context/MusicContext';
import {DEFAULT_CREATIVE_BRIEF_V1107,curateCreativeRemixV1107,auditCreativeRemixV1107,
 type CreativeStyleV1107} from '@/lib/aiCreativeProducerV1107';
import {createMusicEmotionSessionV1108,collectMusicEmotionSampleV1108,readMusicEmotionV1108,
 suggestCreativeDirectionV1108,type MusicEmotionReadingV1108,type MusicMoodHintV1108} from '@/lib/aiMusicEmotionV1108';
import {composeConcertStoryV1109,STORY_ARC_LABELS_V1109,
 type ConcertStoryArcV1109,type ConcertStoryPacingV1109,type ConcertStoryResultV1109} from '@/lib/aiConcertStoryV1109';
import {generateArenaShowPlanV1040,normalizeArenaShowPlanV1040,
 type ArenaShowPlanV1040} from '@/lib/arena360ShowDesignerV1040';
import {applyAiShowRemixV1106,localAiShowRemixV1106,normalizeAiShowRemixV1106,
 type AiShowRemixV1106,type RemixGenreV1106} from '@/lib/arena360AiShowRemixV1106';
const NAMES:Record<string,string>={intro:'Intro',verse:'Strophe',build:'Build-up',hook:'Hook',
 interlude:'Atempause',finale:'Finale'};
export function AiShowRemixPanelV1106({plan,prompt,genre,title,durationMs}:{
 plan:ArenaShowPlanV1040|null;prompt:string;genre:string;title:string;durationMs:number;
}){
 const {preferences,updatePreferences}=useUiPreferences();
 const audio=useAudioAnalysis();
 const music=useMusic();
 const [director,setDirector]=useState<CreativeStyleV1107>('cinematic');
 const [contrast,setContrast]=useState(50);
 const [surprise,setSurprise]=useState(35);
 const [mood,setMood]=useState<MusicMoodHintV1108>('none');
 const [moodExplanation,setMoodExplanation]=useState('Noch keine Messung ausgewählt.');
 const [sampling,setSampling]=useState(false);
 const [sampleCount,setSampleCount]=useState(0);
 const [reading,setReading]=useState<MusicEmotionReadingV1108|null>(null);
 const emotionSession=useRef(createMusicEmotionSessionV1108());
 const currentTrack=music.track?.id??'';
 const [storyArc,setStoryArc]=useState<ConcertStoryArcV1109>('crescendo');
 const [storyPacing,setStoryPacing]=useState<ConcertStoryPacingV1109>('balanced');
 const [storyEnabled,setStoryEnabled]=useState(false);
 const [storyPreview,setStoryPreview]=useState<ConcertStoryResultV1109|null>(null);
 const [idea,setIdea]=useState('Düsteres Intro, starke Hook, schwebende Bühnen und ein überraschendes Finale');
 const [cap,setCap]=useState(70);
 const [preview,setPreview]=useState<AiShowRemixV1106|null>(null);
 const [source,setSource]=useState<'ai'|'local'|null>(null);
 const [status,setStatus]=useState('');
 const [busy,setBusy]=useState(false);
 const [baseSignature,setBaseSignature]=useState('');
 const [canUndo,setCanUndo]=useState(false);
 const controller=useRef<AbortController|null>(null);
 const requestId=useRef(0);
 const undo=useRef<{before:ArenaShowPlanV1040|null;after:string}|null>(null);
 const base=plan??generateArenaShowPlanV1040({prompt,genre,durationMs,title});
 const signature=JSON.stringify(base);
 const style:RemixGenreV1106=base.genre;
 const creativeBrief=()=>({style:director,contrast,surprise,mood});
 const storyOptions=()=>({arc:storyArc,pacing:storyPacing,intensityCap:cap});
 const storyFor=(remix:AiShowRemixV1106)=>composeConcertStoryV1109(base,remix,storyOptions());
 const canSample=audio.active&&music.isPlaying&&!preferences.reducedMotion&&!!currentTrack;
 // Tracking is strictly session-only: stop and forget measurements on a song
 // change, playback interruption, microphone loss or reduced-motion preference.
 useEffect(()=>{
  emotionSession.current=createMusicEmotionSessionV1108();
  setReading(null);setSampleCount(0);setSampling(false);
 },[currentTrack]);
 useEffect(()=>{
  // Completed readings are also invalidated if the microphone or playback stops.
  if(!canSample){
   emotionSession.current=createMusicEmotionSessionV1108();
   setSampleCount(0);setReading(null);setSampling(false);
  }
 },[canSample]);
 useEffect(()=>{
  if(!sampling)return;
  if(!canSample){
   emotionSession.current=createMusicEmotionSessionV1108();
   setSampleCount(0);setReading(null);setSampling(false);
   return;
  }
  const old=emotionSession.current;
  const next=collectMusicEmotionSampleV1108(old,audio.metrics,{
   microphoneActive:audio.active,playing:music.isPlaying,reducedMotion:preferences.reducedMotion
  },Date.now(),currentTrack);
  if(next!==old){
   emotionSession.current=next;
   setSampleCount(next.samples.length);
   setReading(readMusicEmotionV1108(next));
  }
 },[sampling,canSample,currentTrack,audio.active,audio.metrics,music.isPlaying,preferences.reducedMotion]);
 const startEmotionMeasurement=()=>{
  if(!canSample)return;
  emotionSession.current=createMusicEmotionSessionV1108();
  setReading(null);setSampleCount(0);setSampling(true);
  setMoodExplanation('Messung läuft ausschließlich lokal. Noch kein Vorschlag übernommen.');
 };
 const adoptEmotionSuggestion=()=>{
  if(sampling||!canSample)return;
  const recommended=suggestCreativeDirectionV1108(reading);
  if(!recommended)return;
  setDirector(recommended.style);setContrast(recommended.contrast);
  setSurprise(recommended.surprise);setMood(recommended.mood);
  invalidate();
  setMoodExplanation(`Messwertbasierter Regievorschlag übernommen (${Math.round(reading!.confidence*100)}% Messsicherheit). Erstelle nun ausdrücklich eine Vorschau; keine Bühne oder Lampe wurde geschaltet.`);
  setReading(null);setSampleCount(0);emotionSession.current=createMusicEmotionSessionV1108();
 };
 const discardEmotionMeasurement=()=>{
  emotionSession.current=createMusicEmotionSessionV1108();
  setSampling(false);setReading(null);setSampleCount(0);
  setMoodExplanation('Lokale Messwerte verworfen. Es wurde nichts gespeichert oder übertragen.');
 };
 const invalidate=()=>{controller.current?.abort();requestId.current++;setBusy(false);setPreview(null);setStoryPreview(null);setSource(null);setStatus('');};
 useEffect(()=>{controller.current?.abort();requestId.current++;setPreview(null);setStoryPreview(null);setSource(null);setBusy(false);
  return ()=>{controller.current?.abort();requestId.current++;};
 },[signature]);
 const local=(storyOnly=false)=>{
  invalidate();
  const curated=curateCreativeRemixV1107(localAiShowRemixV1106(idea,style,cap),creativeBrief(),cap);
  if(!curated){setStatus('Regieentwurf ungültig – keine Änderungen übernommen.');return;}
  const story=storyOnly||storyEnabled?storyFor(curated):null;
  if((storyOnly||storyEnabled)&&!story){setStatus('Storybogen konnte nicht sicher geplant werden. Der Showplan bleibt unverändert.');return;}
  setStoryPreview(story);setPreview(story?.remix??curated);setBaseSignature(signature);setSource('local');
  setStatus(story?'V1109 lokaler Storybogen als Vorschau bereit. Keine KI-Anfrage, kein Gerät geschaltet und noch nichts übernommen.':
   'Lokaler Remix: keine Netzwerk- oder KI-Anfrage. Noch nichts übernommen.');
 };
 const remote=async()=>{
  if(idea.trim().length<4||idea.length>400){setStatus('Bitte 4 bis 400 Zeichen eingeben.');return;}
  invalidate();
  const id=requestId.current;
  const current=new AbortController();controller.current=current;
  setBusy(true);setStatus('KI erstellt einen Vorschlag. Die Live-Show bleibt unverändert.');
  try{
   const response=await fetch('/api/ai/show-remix',{method:'POST',cache:'no-store',signal:current.signal,
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({prompt:idea,genre:style,intensityCap:cap,brief:creativeBrief()})});
   const data:unknown=await response.json();
   if(requestId.current!==id)return;
   const parsed:{remix?:unknown;error?:string}=data&&typeof data==='object'
    ? data as {remix?:unknown;error?:string}:{};
   if(!response.ok)throw Error(typeof parsed.error==='string'?parsed.error:'KI-Anfrage fehlgeschlagen.');
   const proposal=normalizeAiShowRemixV1106(parsed.remix);
   if(!proposal||proposal.acts.some(a=>a.intensity>cap))throw Error('KI-Vorschlag konnte nicht sicher validiert werden.');
   const story=storyEnabled?storyFor(proposal):null;
   if(storyEnabled&&!story)throw Error('Storybogen konnte nicht sicher geplant werden.');
   setStoryPreview(story);setPreview(story?.remix??proposal);setSource('ai');setBaseSignature(signature);
   setStatus('KI-Vorschlag bereit. Prüfe alle sieben Szenen und übernimm ihn ausdrücklich.');
  }catch(error){
   if(requestId.current===id&&!current.signal.aborted)
    setStatus((error instanceof Error?error.message:'KI vorübergehend nicht erreichbar.')+' Du kannst den lokalen Remix verwenden.');
  }finally{if(requestId.current===id)setBusy(false);}
 };
 const apply=()=>{
  if(!preview)return;
  if(signature!==baseSignature){setStatus('Der Showplan wurde inzwischen geändert. Bitte einen neuen Remix erstellen.');setPreview(null);return;}
  const result=applyAiShowRemixV1106(base,preview,cap);
  if(!result){setStatus('Remix ungültig – bestehender Showplan bleibt erhalten.');return;}
  undo.current={before:plan,after:JSON.stringify(result)};
  setCanUndo(true);
  updatePreferences({arenaShowPlanV1040:result});
  setPreview(null);setStoryPreview(null);
  setStatus('Remix gespeichert. Die 360°-Showplan-Aktivierung bleibt unverändert – keine Geräte wurden gesteuert.');
 };
 const revert=()=>{
  if(!undo.current)return;
  const saved=normalizeArenaShowPlanV1040(preferences.arenaShowPlanV1040);
  if(JSON.stringify(saved)!==undo.current.after){
   setStatus('Der Showplan wurde nach dem Remix geändert; Rückgängig würde manuelle Änderungen überschreiben.');
   setCanUndo(false);undo.current=null;return;
  }
  updatePreferences({arenaShowPlanV1040:undo.current.before??undefined});
  undo.current=null;setCanUndo(false);setStatus('Vorheriger Showplan wiederhergestellt.');
 };
 return <fieldset className="arena-v1106-ai-remix" aria-label="V1106 KI Show Remix">
  <legend>V1106 · KI Creative Producer – Show Remix</legend>
  <p>Aus einer Idee werden sieben abwechslungsreiche, zusammenhängende 360°-Konzertphasen.
   Die Vorschläge verändern erst nach deinem Klick den vorhandenen Showplan;
   individuelle Zeitgrenzen bleiben erhalten.</p>
  <label>Was soll die Konzertshow besonders machen?
   <textarea rows={3} maxLength={400} value={idea} disabled={busy}
    onChange={e=>{setIdea(e.target.value);invalidate();}}
    placeholder="z. B. Hardtekk: ruhiger Start, explosive Hook, Laser-Tunnel, episches Finale"/>
  </label>
  <fieldset aria-label="V1107 KI Regiefeinschliff" className="arena-v1107-creative-directions">
   <legend>V1107 · KI Creative Producer 2.0</legend>
   <label>Regiestil
    <select value={director} disabled={busy} onChange={e=>{setDirector(e.target.value as CreativeStyleV1107);invalidate();}}>
     <option value="cinematic">Filmisch und dramaturgisch</option>
     <option value="festival">Große Festivalshow</option>
     <option value="intimate">Intim und emotional</option>
     <option value="surprise">Überraschende Perspektiven</option>
    </select>
   </label>
   <label>Kontraste zwischen Ruhe und Höhepunkten: {contrast}%
    <input type="range" min="0" max="80" step="5" value={contrast} disabled={busy}
     onChange={e=>{setContrast(Number(e.target.value));invalidate();}}/>
   </label>
   <label>Kreative Überraschungen: {surprise}%
    <input type="range" min="0" max="70" step="5" value={surprise} disabled={busy}
     onChange={e=>{setSurprise(Number(e.target.value));invalidate();}}/>
   </label>
   <label>Musikalischer Stimmungshinweis (optional)
    <select value={mood} disabled={busy} onChange={e=>{setMood(e.target.value as MusicMoodHintV1108);invalidate();}}>
     <option value="none">Ohne Stimmungshinweis</option>
     <option value="calm">Ruhig / zurückhaltend</option>
     <option value="atmospheric">Atmosphärisch</option>
     <option value="focused">Fokussiert</option>
     <option value="euphoric">Euphorisch</option>
     <option value="intense">Intensiv</option>
    </select>
   </label>
   <fieldset aria-label="V1108 Music Emotion Intelligence" className="arena-v1108-emotion-intelligence">
    <legend>V1108 · Musik-Energie &amp; Dramaturgie</legend>
    <p>Auf Wunsch misst die App über mehrere Sekunden lokale Energie, Frequenzen und Beat-Impulse.
     Daraus schätzt sie einen Spannungsverlauf und macht einen unverbindlichen Regievorschlag.</p>
    <button type="button" disabled={busy||sampling||!canSample} onClick={startEmotionMeasurement}>
     Lokale Musikanalyse starten
    </button>
    {sampling&&<button type="button" onClick={()=>setSampling(false)}>
      Analyse beenden und Vorschlag prüfen
    </button>}
    {(reading||sampling)&&<p role="status" aria-live="polite">
      {reading?<>Messdauer: {(reading.durationMs/1000).toFixed(1)} s · {reading.sampleCount} Messpunkte ·
       Energie: {Math.round(reading.energy*100)}% · Impulsklarheit: {Math.round(reading.beatClarity*100)}% ·
       Verlauf: {reading.trend==='rising'?'steigend':reading.trend==='falling'?'abfallend':'gleichmäßig'} ·
       Messsicherheit: {Math.round(reading.confidence*100)}%.
       {reading.ready?' Vorschlag bereit.':' Für die Übernahme ist ein klareres, längeres Signal nötig.'}
      </>:<>Messung läuft: {sampleCount} lokale Messpunkte. Mindestens 4,5 Sekunden erforderlich.</>}
    </p>}
    {reading&&<p role="note" aria-label="V1108 Musikstimmung Vorschau">
      Geschätzte Musikenergie: {reading.mood} · maximale gemessene Energie: {Math.round(reading.peakEnergy*100)}%.
      Keine echte Emotionserkennung oder zuverlässige Hook-/Drop-Erkennung.
    </p>}
    <button type="button" disabled={busy||sampling||!canSample||!suggestCreativeDirectionV1108(reading)}
     onClick={adoptEmotionSuggestion}>Regievorschlag bewusst übernehmen</button>
    {(sampling||reading)&&<button type="button" onClick={discardEmotionMeasurement}>Messung verwerfen</button>}
    <small role="note">{moodExplanation} Die Analyse ist nur bei laufendem Song, aktivem Mikrofon
     und ohne Bewegungsreduktion möglich. Keine Audioaufzeichnung, keine automatische KI-Anfrage,
     keine Audioübertragung, keine Speicherung. Es werden nur flüchtige Messwerte im Arbeitsspeicher
     verwendet. Die Stimmung ist eine unverbindliche Energie-Heuristik.</small>
   </fieldset>
  </fieldset>
  <fieldset aria-label="V1109 AI Concert Story Engine" className="arena-v1109-concert-story">
   <legend>V1109 · AI Concert Story Engine</legend>
   <p>Plane einen Spannungsbogen über den ganzen Song: Ruhe, Aufbau, Höhepunkte, Atempause und Finale.
    Die sieben Zeitabschnitte bleiben unverändert. Das ist eine dramaturgische Planung,
    keine Erkennung von Strophen, Hooks oder Drops im echten Audio.</p>
   <label>Erzählbogen
    <select value={storyArc} disabled={busy} onChange={e=>{setStoryArc(e.target.value as ConcertStoryArcV1109);invalidate();}}>
     {Object.entries(STORY_ARC_LABELS_V1109).map(([value,name])=><option key={value} value={value}>{name}</option>)}
    </select>
   </label>
   <label>Spannungsverteilung
    <select value={storyPacing} disabled={busy} onChange={e=>{setStoryPacing(e.target.value as ConcertStoryPacingV1109);invalidate();}}>
     <option value="balanced">Ausgewogener Verlauf</option>
     <option value="slow-burn">Langsamer Spannungsaufbau</option>
     <option value="early-energy">Früher erster Höhepunkt</option>
    </select>
   </label>
   <label>
    <input type="checkbox" checked={storyEnabled} disabled={busy}
     onChange={e=>{setStoryEnabled(e.target.checked);invalidate();}}/>
    Storybogen auch auf neue Offline-/OpenAI-Remixe anwenden
   </label>
   <button type="button" disabled={busy} onClick={()=>local(true)}>Storybogen lokal entwerfen</button>
   <small>Der Story-Entwurf verwendet nur den aktuellen Songtitel, das gewählte Genre und deine
    Show-Einstellungen. Keine Audioaufzeichnung, keine automatischen OpenAI- oder Govee-Anfragen.
    Auch bei bewusst aktivierter Storyfunktion wird die bestehende Show erst nach deiner Bestätigung gespeichert.</small>
  </fieldset>
  <label>Maximale virtuelle Showintensität: {cap}%
   <input type="range" min="30" max="85" step="5" value={cap} disabled={busy}
    onChange={e=>{setCap(Number(e.target.value));invalidate();}}/>
  </label>
  <div style={{display:'flex',flexWrap:'wrap',gap:8}}>
   <button type="button" onClick={()=>void remote()} disabled={busy||idea.trim().length<4}>
    {busy?'KI entwirft…':'Mit OpenAI kreativ gestalten'}
   </button>
   <button type="button" onClick={()=>local(false)} disabled={busy}>Offline-Remix ausprobieren</button>
   {canUndo&&<button type="button" onClick={revert}>Letzten Remix rückgängig machen</button>}
  </div>
  <small>OpenAI wird nur auf Knopfdruck angefragt (mit konfiguriertem OPENAI_API_KEY und Spotify-Anmeldung).
   Übertragen werden ausschließlich dein kurzer Gestaltungswunsch, Genre, Regiestil, Kontraste, Intensitätslimit und ggf. ein bewusst ausgewählter Stimmungshinweis –
   niemals Lyrics, Audiodaten, Tokens oder Govee-Geräteinformationen. Offline bleibt alles lokal.</small>
  {status&&<p role="status" aria-live="polite">{status}</p>}
  {preview&&<section aria-label="V1106 Show Remix Vorschau">
   {auditCreativeRemixV1107(preview)&&<p role="note" aria-label="V1107 Regie-Qualitätsvorschau">
     Regie-Check: {auditCreativeRemixV1107(preview)?.uniqueCameras} Kameraperspektiven,
     {auditCreativeRemixV1107(preview)?.uniqueStages} Bühnenvarianten,
     Dynamikspanne {auditCreativeRemixV1107(preview)?.contrastRange} Punkte.
     Die Szenenwechsel bleiben auf maximal 45 Intensitätspunkte begrenzt.
   </p>}
   {storyPreview&&<section aria-label="V1109 Storybogen Vorschau">
    <h3>Storybogen: {STORY_ARC_LABELS_V1109[storyPreview.arc]}</h3>
    <p role="note" aria-label="V1109 Story-Qualitätscheck">
     {storyPreview.quality.quietMoments} bewusste Ruhephasen · {storyPreview.quality.cameraVariety} Kameraperspektiven ·
     {storyPreview.quality.stageVariety} Bühnenvarianten · Spannungsumfang {storyPreview.quality.dramaticRange} Punkte ·
     {storyPreview.quality.safeTransitions?'sanfte Übergänge':'Übergänge prüfen'}.
    </p>
    <ol aria-label="V1109 sieben Storyphasen">
     {storyPreview.beats.map(beat=><li key={beat.index}>
      <strong>{beat.title}</strong> · {Math.round(beat.start*100)}–{Math.round(beat.end*100)}% des Songs ·
      {beat.intensity}% Showintensität. {beat.description}
     </li>)}
    </ol>
   </section>}
   <h3>{preview.title} <small>({source==='ai'?'OpenAI':'Lokaler Entwurf'})</small></h3>
   <p>{preview.explanation}</p>
   <ol style={{paddingLeft:22}}>
    {preview.acts.map((act,index)=><li key={index} style={{marginBottom:10}}>
     <strong>{index+1}. {NAMES[act.scene]} · {Math.min(cap,act.intensity)}%</strong>
     <div style={{height:7,width:'100%',maxWidth:350,background:'rgba(120,130,150,.22)',borderRadius:5}}>
      <div style={{height:'100%',width:`${Math.min(cap,act.intensity)}%`,background:'#7fe9f3',borderRadius:5}}/>
     </div>
     <small>Kamera: {act.camera} · Bühne: {act.deck}/{act.floating} · Laserlook: {act.lasers} · Tanz: {act.dance}</small>
     <p style={{margin:'3px 0 0'}}>{act.note}</p>
    </li>)}
   </ol>
   {preferences.reducedMotion&&<p>Bewegungsreduktion ist aktiv: Die Live-Bühne ignoriert bewegte Showplan-Cues weiterhin.</p>}
   <button type="button" onClick={apply}>Diese sieben Szenen in meinen Showplan übernehmen</button>
   <button type="button" onClick={invalidate}>Vorschlag verwerfen</button>
   <small>Dies ist eine entworfene Timeline, keine Erkennung echter Hooks oder Drops.
    Keine automatische Aktivierung von Pyrotechnik, Strobo, Govee oder anderen Geräten.</small>
  </section>}
 </fieldset>;
}
