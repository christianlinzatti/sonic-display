'use client';

import {useEffect,useMemo,useRef,useState} from 'react';
import {useUiPreferences} from '@/context/UiPreferencesContext';
import {useLiveMoodV678} from '@/components/LiveMoodProviderV678';
import {MOOD_LABELS_V678} from '@/lib/live-mood-v678';
import {useMusic} from '@/context/MusicContext';
import {LOOK_LIBRARY_UPDATED_V677,AUTO_LOOK_STATUS_V677} from '@/components/SmartConcertLookControllerV677';
import {trustedAutoGenreV677,selectAutoConcertLookV677,matchLabelV677,genreLabelV677} from '@/lib/smart-concert-look-v677';
import {GENRES,MUSIC_GENRES,type MusicGenre} from '@/config/musicGenres';
import type {RecentTrackV672} from '@/lib/recently-played-v672';
import type {HistoryGenreMapV674} from '@/lib/recently-played-discovery-v674';
import {buildListeningProfileV675} from '@/lib/listening-profile-v675';
import {
 LOOK_STORAGE_KEY_V676,LOOK_STAGES_V676,LOOK_DANCES_V676,MAX_LOOKS_V676,
 emptyLookLibraryV676,parseLookLibraryV676,upsertConcertLookV676,removeConcertLookV676,
 mergeConcertLooksV676,selectConcertLooksV676,captureConcertLookV676,canUndoConcertLookV676,
 validateLookPatchV676,type LookGenreV676,type LookPatchV676,type LookLibraryV676,type ConcertLookV676,
} from '@/lib/concert-look-designer-v676';

type Props={tracks:ReadonlyArray<RecentTrackV672>;known:HistoryGenreMapV674};
const DEFAULT_DRAFT:LookPatchV676={stageTheme:'classic',stageReactive:true,stageLightStrength:60,avatarDancePreset:'auto',danceFxEnabled:false,danceFxStrength:60};
const genreLabel=(genre:LookGenreV676)=>genre==='all'?'Für alle Genres':MUSIC_GENRES[genre].label;
/** Saved looks are only applied by explicit user action – no automatic song / camera override. */
export function ConcertLookDesignerV676({tracks,known}:Props){
 const {preferences,updatePreferences}=useUiPreferences();
 const liveMoodV678=useLiveMoodV678();
 const {track,genre:playingGenre,genreSource,genreConfidence,genreStatus,genreTrackId}=useMusic();
 const [library,setLibrary]=useState<LookLibraryV676>(emptyLookLibraryV676);
 const [ready,setReady]=useState(false);
 const [storageError,setStorageError]=useState(false);
 const [name,setName]=useState('');
 const [genre,setGenre]=useState<LookGenreV676>('all');
 const [filter,setFilter]=useState<LookGenreV676|'any'>('any');
 const [patch,setPatch]=useState<LookPatchV676>(DEFAULT_DRAFT);
 const [editing,setEditing]=useState<string|null>(null);
 const [pendingDelete,setPendingDelete]=useState<string|null>(null);
 const [lastApplied,setLastApplied]=useState<{before:LookPatchV676;after:LookPatchV676}|null>(null);
 const [message,setMessage]=useState('');
 const fileRef=useRef<HTMLInputElement>(null);
 const profile=useMemo(()=>buildListeningProfileV675(tracks,known),[tracks,known]);
 const filtered=useMemo(()=>selectConcertLooksV676(library,filter),[library,filter]);
 const trustedGenre=trustedAutoGenreV677({trackId:track?.id??'',detectedForTrackId:genreTrackId,genre:playingGenre,source:genreSource,confidence:genreConfidence,status:genreStatus});
 const automaticChoice=useMemo(()=>selectAutoConcertLookV677(library,trustedGenre,track?.id??''),[library,trustedGenre,track?.id]);
 useEffect(()=>{const onStatus=(event:Event)=>{const detail=(event as CustomEvent<string>).detail;if(typeof detail==='string')setMessage(detail);};window.addEventListener(AUTO_LOOK_STATUS_V677,onStatus);return()=>window.removeEventListener(AUTO_LOOK_STATUS_V677,onStatus);},[]);
 useEffect(()=>{
  try{
   const raw=localStorage.getItem(LOOK_STORAGE_KEY_V676);
   if(raw!==null){const value=parseLookLibraryV676(raw);
    if(value)setLibrary(value);else {setStorageError(true);setMessage('Gespeicherte Looks sind beschädigt. Bitte zuerst eine Sicherung prüfen; vorhandene Daten werden nicht überschrieben.');}
   }
  }catch{setStorageError(true);setMessage('Die gespeicherten Looks konnten nicht gelesen werden.');}
  setReady(true);
 },[]);
 const persist=(next:LookLibraryV676)=>{
  if(!ready||storageError){setMessage('Speichern gesperrt: gespeicherte Looks konnten nicht sicher geladen werden.');return false;}
  try{localStorage.setItem(LOOK_STORAGE_KEY_V676,JSON.stringify(next));setLibrary(next);window.dispatchEvent(new Event(LOOK_LIBRARY_UPDATED_V677));return true;}
  catch{setMessage('Der Browser konnte die Looks nicht speichern (Speicherplatz oder Berechtigung).');return false;}
 };
 const change=<K extends keyof LookPatchV676>(key:K,value:LookPatchV676[K])=>{
  setPatch(current=>({...current,[key]:value}));setPendingDelete(null);
 };
 const reset=()=>{setEditing(null);setName('');setGenre('all');setPatch(DEFAULT_DRAFT);setPendingDelete(null);};
 const fromCurrent=()=>{setPatch(captureConcertLookV676(preferences));setMessage('Aktuelle Bühnen-, Licht-, Tanz- und FX-Regler in den Editor übernommen. Noch nicht gespeichert.');};
 const fromRecommendation=(index:number)=>{
  const recommendation=profile.recommendations[index];if(!recommendation)return;
  const songGenre=profile.families.find(f=>f.family===recommendation.key)?.genre||'all';
  setEditing(null);setName(`Mein ${recommendation.familyLabel} Look`);setGenre(songGenre);
  setPatch({...recommendation.stage,...recommendation.fx});
  setMessage('Show-Empfehlung in den Editor übernommen. Erst Speichern legt einen Look an; erst Anwenden ändert die Bühne.');
 };
 const save=()=>{
  const draft=validateLookPatchV676(patch);
  if(!draft){setMessage('Ungültige Show-Einstellungen. Bitte Werte prüfen.');return;}
  const id=editing||`look-${Date.now().toString(36)}-${Math.random().toString(36).slice(2,9)}`;
  const next=upsertConcertLookV676(library,{id,name,genre,patch:draft});
  if(!next){setMessage('Look nicht gespeichert: Name (2–42 Zeichen) oder Genre doppelt, ungültige Werte oder Bibliothek voll.');return;}
  if(persist(next)){setMessage(`„${name.trim()}“ lokal gespeichert. Auf der Bühne noch nicht angewendet.`);setEditing(id);}
 };
 const edit=(look:ConcertLookV676)=>{setEditing(look.id);setName(look.name);setGenre(look.genre);setPatch({...look.patch});setPendingDelete(null);setMessage(`„${look.name}“ wird bearbeitet. Änderungen erst speichern.`);};
 const duplicate=(look:ConcertLookV676)=>{setEditing(null);setName(`${look.name} Kopie`.slice(0,42));setGenre(look.genre);setPatch({...look.patch});setPendingDelete(null);setMessage('Kopie als neuer Entwurf geöffnet. Zum Anlegen speichern.');};
 const erase=(id:string)=>{
  if(pendingDelete!==id){setPendingDelete(id);setMessage('Zum endgültigen Löschen dieselbe Taste ein zweites Mal drücken.');return;}
  const item=library.looks.find(l=>l.id===id);if(!item)return;
  if(persist(removeConcertLookV676(library,id))){if(editing===id)reset();setPendingDelete(null);setMessage(`„${item.name}“ gelöscht.`);}
 };
 const apply=(look:ConcertLookV676)=>{
  const before=captureConcertLookV676(preferences),after={...look.patch};
  updatePreferences({...after,smartLookAutoV677:false});setLastApplied({before,after});
  setMessage(`„${look.name}“ manuell angewendet. Die Auto-Look-Auswahl wurde pausiert; Lyrics, Kamera und Sängerzuordnung bleiben unangetastet.`);
 };
 const undo=()=>{
  if(!lastApplied)return;
  if(!canUndoConcertLookV676(preferences,lastApplied.after)){
   setLastApplied(null);setMessage('Die Bühnenwerte haben sich inzwischen geändert. Rückgängig wurde zum Schutz deiner Änderungen nicht ausgeführt.');return;
  }
  updatePreferences(lastApplied.before);setLastApplied(null);setMessage('Vorherige Look-Werte wiederhergestellt.');
 };
 const download=()=>{
  try{
   const url=URL.createObjectURL(new Blob([JSON.stringify(library,null,2)],{type:'application/json'}));
   const anchor=document.createElement('a');anchor.href=url;anchor.download='sonic-display-v676-konzert-looks.json';document.body.appendChild(anchor);anchor.click();anchor.remove();
   window.setTimeout(()=>URL.revokeObjectURL(url),1000);setMessage('Export der eigenen Konzert-Looks gestartet.');
  }catch{setMessage('Der JSON-Export ist in diesem Browser nicht verfügbar.');}
 };
 const importFile=async(file:File|undefined)=>{
  if(!file)return;
  try{
   if(file.size>60000)throw new Error('Die Datei ist zu groß (maximal 60 KB).');
   const incoming=parseLookLibraryV676(await file.text());
   if(!incoming)throw new Error('Ungültiges Konzert-Look-Format oder fehlerhafte Einstellungen.');
   const result=mergeConcertLooksV676(library,incoming);
   if(!result.added){setMessage(`Keine Looks hinzugefügt (${result.skipped} übersprungen).`);return;}
   if(persist(result.library))setMessage(`${result.added} Looks importiert, ${result.skipped} übersprungen. Bereits vorhandene Looks bleiben unverändert.`);
  }catch(error){setMessage(error instanceof Error?error.message:'Import fehlgeschlagen.');}
  finally{if(fileRef.current)fileRef.current.value='';}
 };
 const stageLabel=LOOK_STAGES_V676.find(s=>s.id===patch.stageTheme)?.label||patch.stageTheme;
 const recommendations=profile.recommendations;
 return <section className="concert-designer-v676" aria-label="Persönlicher Konzert-Designer">
  <header className="recent-gallery-head-v674"><div><span className="recent-discovery-kicker-v674">CREATE / SAVE / PLAY</span><h3>Mein Konzert-Designer<span>.</span></h3><p>Entwirf einen Look für Bühne, Licht, Tanz und FX. Du entscheidest, wann er aktiv wird.</p></div><span className="recent-discovery-caveat-v674">{library.looks.length}/{MAX_LOOKS_V676} Looks gespeichert</span></header>
  <section className="smart-look-auto-v677" aria-label="Automatische Konzert-Look-Auswahl">
   <div className="smart-look-auto-heading-v677"><div><span className="recent-discovery-kicker-v674">SMART LOOK / V677</span><h4>Automatische Look-Auswahl</h4><p>Wählt zu Beginn eines neu gestarteten Songs einen passenden gespeicherten Look. Ohne erkanntes Genre bleibt die Bühne unverändert.</p></div>
    <label className="smart-look-switch-v677"><input type="checkbox" checked={preferences.smartLookAutoV677===true} disabled={!ready||storageError||!library.looks.length} onChange={e=>{updatePreferences({smartLookAutoV677:e.target.checked});setMessage(e.target.checked?'Auto-Look aktiviert. Geeignete Songgenres werden ab jetzt beim Abspielen zugeordnet.':'Auto-Look deaktiviert; aktuelle Bühne bleibt wie sie ist.');}}/><span>{preferences.smartLookAutoV677===true?'Automatik EIN':'Automatik AUS'}</span></label></div>
   <div className="smart-look-auto-info-v677">
    <span><b>Aktueller Song:</b> {track?.title||'Keiner'}</span>
    <span><b>Erkanntes Genre:</b> {trustedGenre?genreLabelV677(trustedGenre):'Noch nicht sicher bestimmt'}</span>
    <span><b>Look-Vorschlag:</b> {automaticChoice?`${automaticChoice.look.name} · ${matchLabelV677(automaticChoice.match)} · ${automaticChoice.mood}`:'Kein passender Look verfügbar'}</span>
   </div>
   <p className="smart-look-auto-note-v677">Genaues Genre hat Vorrang vor verwandten und universellen Looks. Bei mehreren passenden Looks wechselt die Auswahl songabhängig. Der Stimmungsbegriff beschreibt den Genre-Stil, keine gemessene Audio-Emotion. Verspätete Genre-Erkennung unterbricht keine laufende Verse-/Hook-Inszenierung. Manuelle Bühnenänderungen schalten die Automatik aus.</p>
  </section>
  <section className="live-mood-panel-v678" aria-label="Live-Stimmungsanalyse">
   <div className="live-mood-head-v678"><div><span className="recent-discovery-kicker-v674">LIVE MOOD / V678</span><h4>Musikalische Atmosphäre</h4><p>Leichte Akzente für Licht und Tanz anhand echter Mikrofonmesswerte. Kein Eingriff in Kamera, Lyrics, Sängerrollen oder Show-Timeline.</p></div>
    <label className="smart-look-switch-v677"><input type="checkbox" checked={preferences.liveMoodEnabledV678===true} onChange={e=>updatePreferences({liveMoodEnabledV678:e.target.checked})}/><span>{preferences.liveMoodEnabledV678===true?'Live Mood EIN':'Live Mood AUS'}</span></label>
   </div>
   <div className="live-mood-status-v678" role="status" aria-live="polite">
    <strong>{!preferences.liveMoodEnabledV678?'Ausgeschaltet':!liveMoodV678.measuring?'Keine Live-Mikrofonanalyse':!liveMoodV678.mood?(liveMoodV678.sampleCount>=12?'Kein ausreichendes Audiosignal':'Klang wird ausgewertet …'):MOOD_LABELS_V678[liveMoodV678.mood].label}</strong>
    <span>{liveMoodV678.mood&&liveMoodV678.measuring?MOOD_LABELS_V678[liveMoodV678.mood].description:'Benötigt eine aktive Mikrofonfreigabe, einen laufenden Song und ausreichend Audiosignal.'}</span>
   </div>
   <div className="live-mood-settings-v678">
    <label>Stärke der Bühnenakzente <b>{preferences.liveMoodStrengthV678??45}%</b><input type="range" min="0" max="100" step="5" value={preferences.liveMoodStrengthV678??45} onChange={e=>updatePreferences({liveMoodStrengthV678:Number(e.target.value)})}/></label>
    <label className="concert-designer-check-v676"><input type="checkbox" checked={preferences.liveMoodDanceV678!==false} onChange={e=>updatePreferences({liveMoodDanceV678:e.target.checked})}/> Tanz leicht anpassen (nur ohne manuelle Choreografie)</label>
   </div>
   <p className="smart-look-auto-note-v677">Wichtig: „Atmosphärisch“ und „Druckvoll“ beschreiben gemessene Klangmerkmale, keine zuverlässig erkannten Gefühle wie Traurigkeit oder Aggression. Ohne Mikrofon werden keine Spotify-Taktsimulationen als Messung ausgegeben. Der Look-Designer und deine Bühnen-Presets behalten Vorrang; die Anpassungen werden nicht dauerhaft in die Einstellungen geschrieben.</p>
  </section>
  <div className="concert-designer-layout-v676">
   <div className="concert-designer-editor-v676">
    <div className="concert-designer-preview-v676" data-stage={patch.stageTheme} aria-label={`Symbolische Vorschau: ${stageLabel}`}>
     <div className="concert-designer-preview-spot-v676" style={{opacity:.25+patch.stageLightStrength/140}} aria-hidden="true"/>
     <div className="concert-designer-preview-beams-v676" aria-hidden="true"><i/><i/><i/></div>
     <div className="concert-designer-preview-floor-v676" aria-hidden="true"/>
     <strong>{stageLabel}</strong><small>{patch.stageLightStrength}% Licht · {patch.stageReactive?'beat-reaktiv':'statisch'} · {patch.danceFxEnabled?'DanceFX an':'DanceFX aus'}</small>
    </div>
    <p className="concert-designer-explainer-v676">Stilisierte Look-Vorschau, keine Live-3D-Renderprobe. Alle Änderungen bleiben bis „Auf Bühne anwenden“ im Editor.</p>
    <div className="concert-designer-fields-v676">
     <label>Look-Name<input type="text" maxLength={42} value={name} onChange={e=>setName(e.target.value)} placeholder="z. B. Mein Deutschrap Club"/></label>
     <label>Für welches Genre?<select value={genre} onChange={e=>setGenre(e.target.value as LookGenreV676)}><option value="all">Alle Genres</option>{GENRES.map(g=><option key={g.id} value={g.id}>{g.label}</option>)}</select></label>
     <label>Bühnenwelt<select value={patch.stageTheme} onChange={e=>change('stageTheme',e.target.value as LookPatchV676['stageTheme'])}>{LOOK_STAGES_V676.map(stage=><option key={stage.id} value={stage.id}>{stage.label}</option>)}</select></label>
     <label>Tanzstil<select value={patch.avatarDancePreset} onChange={e=>change('avatarDancePreset',e.target.value as LookPatchV676['avatarDancePreset'])}>{LOOK_DANCES_V676.map(dance=><option key={dance.id} value={dance.id}>{dance.label}</option>)}</select></label>
     <label className="concert-designer-range-v676">Lichtstärke <strong>{patch.stageLightStrength}%</strong><input type="range" min="0" max="100" step="1" value={patch.stageLightStrength} onChange={e=>change('stageLightStrength',Number(e.target.value))}/></label>
     <label className="concert-designer-check-v676"><input type="checkbox" checked={patch.stageReactive} onChange={e=>change('stageReactive',e.target.checked)}/> Musikreaktives Bühnenlicht</label>
     <label className="concert-designer-check-v676"><input type="checkbox" checked={patch.danceFxEnabled} onChange={e=>change('danceFxEnabled',e.target.checked)}/> DanceFX aktivieren</label>
     <label className="concert-designer-range-v676">DanceFX-Stärke <strong>{patch.danceFxStrength}%</strong><input type="range" min="0" max="100" step="1" disabled={!patch.danceFxEnabled} value={patch.danceFxStrength} onChange={e=>change('danceFxStrength',Number(e.target.value))}/></label>
    </div>
    <div className="concert-designer-actions-v676"><button type="button" onClick={fromCurrent}>Aktuelle Show übernehmen</button><button type="button" className="concert-designer-primary-v676" disabled={!ready||storageError} onClick={save}>{editing?'Änderungen speichern':'Neuen Look speichern'}</button><button type="button" onClick={reset}>Neuer Entwurf</button></div>
   </div>
   <div className="concert-designer-library-v676">
    <div className="concert-designer-library-head-v676"><div><h4>Deine Look-Bibliothek</h4><p>Gezielt für Musikrichtungen auswählen und manuell starten.</p></div><label>Genre-Filter<select value={filter} onChange={e=>setFilter(e.target.value as typeof filter)}><option value="any">Alle zeigen</option><option value="all">Universal</option>{GENRES.map(g=><option key={g.id} value={g.id}>{g.label}</option>)}</select></label></div>
    <div className="concert-designer-cards-v676">{filtered.map(look=><article className="concert-designer-card-v676" key={look.id}>
     <div className="concert-designer-card-top-v676"><strong>{look.name}</strong><span>{genreLabel(look.genre)}</span></div>
     <p>{LOOK_STAGES_V676.find(s=>s.id===look.patch.stageTheme)?.label} · {LOOK_DANCES_V676.find(d=>d.id===look.patch.avatarDancePreset)?.label} · {look.patch.stageLightStrength}% Licht</p>
     <div className="concert-designer-card-actions-v676"><button type="button" onClick={()=>apply(look)}>Auf Bühne anwenden</button><button type="button" onClick={()=>edit(look)}>Bearbeiten</button><button type="button" onClick={()=>duplicate(look)}>Kopie erstellen</button><button type="button" className="concert-designer-delete-v676" aria-label={`${look.name} löschen`} onClick={()=>erase(look.id)}>{pendingDelete===look.id?'Löschen bestätigen':'Löschen'}</button></div>
    </article>)}{filtered.length===0&&<div className="recent-empty-v672">Noch keine Looks für diese Auswahl. Erstelle deinen ersten Konzert-Look links im Editor.</div>}</div>
    {recommendations.length>0&&<div className="concert-designer-suggestions-v676"><h4>Inspiration aus deinem Musikprofil</h4><p>Vorschläge aus den aktuell geladenen und erkannten Genres, keine automatische Aktivierung.</p><div>{recommendations.map((r,i)=><button type="button" key={r.key} onClick={()=>fromRecommendation(i)}>✦ {r.familyLabel} · als Entwurf</button>)}</div></div>}
    <div className="concert-designer-transfer-v676"><button type="button" disabled={!ready||storageError} onClick={download}>Looks als JSON exportieren</button><label>JSON importieren<input type="file" ref={fileRef} accept=".json,application/json" disabled={!ready||storageError} onChange={e=>{void importFile(e.target.files?.[0]);}}/></label></div>
    <p className="concert-designer-explainer-v676">Speicherung nur in diesem Browser; die Gesamtsicherung enthält diese Looks ebenfalls. Keine Spotify-Hörhistorie wird gespeichert. Nicht mit den umfassenderen Konzert-Presets der Touch-Steuerzentrale verwechselt.</p>
   </div>
  </div>
  {lastApplied&&<button type="button" className="recent-profile-undo-v675" onClick={undo}>Letzten Look rückgängig machen</button>}
  {message&&<p className="concert-designer-status-v676" role="status" aria-live="polite">{message}</p>}
  <footer className="recent-profile-foot-v675">Ein Look verändert nur Bühne, Licht, Tanz und DanceFX – nie Song-Dramaturgie, Lyrics, Kamera, Vocal-Rollen oder Avatar-Dateien.</footer>
 </section>;
}
