'use client';
/** V1095 · Explicit opt-in learning UI; no passive tracking, remote AI or auto-apply. */
import {useEffect,useState} from 'react';
import {useUiPreferences} from '@/context/UiPreferencesContext';
import {normalizeArenaShowPlanV1040,type ArenaShowPlanV1040} from '@/lib/arena360ShowDesignerV1040';
import {EMPTY_LEARNING_V1095,STORAGE_KEY_V1095,normalizeLearningMemoryV1095,
 recordShowFeedbackV1095,suggestLiveShowV1095,learningSummaryV1095,
 type LearningMemoryV1095} from '@/lib/arena360LiveShowLearningV1095';
const LABELS=['Intro','Strophe','Aufbau','Hook','Zwischenspiel','Strophe 2','Finale'];
const describe=(s:ArenaShowPlanV1040['segments'][number])=>
 `${s.deck} / ${s.lasers} / ${s.floating} · ${s.intensity}%`;
export function LiveShowLearningPanelV1095(){
 const {preferences,updatePreferences}=useUiPreferences();
 const plan=normalizeArenaShowPlanV1040(preferences.arenaShowPlanV1040);
 const [memory,setMemory]=useState<LearningMemoryV1095>(EMPTY_LEARNING_V1095);
 const [ready,setReady]=useState(false);
 const [candidate,setCandidate]=useState<ArenaShowPlanV1040|null>(null);
 const [candidateSource,setCandidateSource]=useState('');
 const [learned,setLearned]=useState(false);
 const [notice,setNotice]=useState('');
 useEffect(()=>{
  try{
   const raw=window.localStorage.getItem(STORAGE_KEY_V1095);
   if(raw&&raw.length<=32768)setMemory(normalizeLearningMemoryV1095(JSON.parse(raw)));
  }catch{setNotice('Lokaler Speicher nicht lesbar. Diese Sitzung funktioniert trotzdem.');}
  setReady(true);
 },[]);
 const save=(next:LearningMemoryV1095)=>{
  setMemory(next);
  try{window.localStorage.setItem(STORAGE_KEY_V1095,JSON.stringify(next));}
  catch{setNotice('Lokaler Speicher nicht verfügbar oder voll – Feedback bleibt nur bis zum Neuladen.');}
 };
 const current=plan?JSON.stringify(plan.segments)+plan.durationMs+plan.genre:'';
 const visibleCandidate=candidateSource===current?candidate:null;
 const summary=learningSummaryV1095(memory);
 const feedback=(target:ArenaShowPlanV1040|null,rating:1|-1)=>{
  const next=recordShowFeedbackV1095(memory,target,rating);
  if(!next)return;
  save(next);setNotice(rating===1?'Showstil lokal als Favorit gespeichert.':'Diesen Showstil künftig meiden.');
 };
 return <fieldset className="arena-v1095-show-learning" aria-label="V1095 Live Show Learning">
  <legend>V1095 · Live Show Learning</legend>
  <p>Merke dir lokal, welche <strong>Showstile dir gefallen</strong>. Das Studio schlägt andere Licht-, Laser- und Plattformmuster vor und vermeidet zuletzt vorgeschlagene sowie abgelehnte Kombinationen.</p>
  <p>Gespeichert werden nur Genre, sieben abstrakte Effektmuster und dein ausdrückliches Feedback – keine Titel, Songtexte, Namen oder Hörverläufe. Keine Cloud und keine automatische Bewertung.</p>
  {!ready?<small>Lokale Einstellungen werden eingelesen.</small>:<>
   <p aria-live="polite">Lokal gemerkt: {summary.liked} Favoriten · {summary.avoided} abgelehnte Stile.</p>
   <button type="button" disabled={!plan} onClick={()=>feedback(plan,1)}>Aktuellen Showstil merken <span aria-hidden="true">♥</span></button>
   <button type="button" disabled={!plan} onClick={()=>feedback(plan,-1)}>Weniger von diesem Showstil</button>
   <button type="button" disabled={!plan} onClick={()=>{
    const next=suggestLiveShowV1095(memory,plan);
    if(!next){setNotice('Für diesen Showplan konnte keine sichere neue Variante erzeugt werden.');return;}
    save(next.memory);setCandidate(next.plan);setCandidateSource(current);setLearned(next.learned);
    setNotice('Neue Variante nur als Vorschau erzeugt. Der aktive Showplan bleibt unverändert.');
   }}>Neue Show-Variante vorschlagen</button>
   {visibleCandidate&&<div role="region" aria-label="Vorschlag zur manuellen Prüfung">
    <strong>{learned?'Aus deinen Favoriten abgeleitete Variante':'Neue abwechslungsreiche Variante'}</strong>
    <div>{visibleCandidate.segments.map((s,i)=>
     <p key={s.id}><strong>{LABELS[i]}:</strong> {describe(s)} {plan?.segments[i]&&describe(plan.segments[i])!==describe(s)?'· neu':''}</p>)}</div>
    <button type="button" onClick={()=>{
     updatePreferences({arenaShowPlanV1040:visibleCandidate});setCandidate(null);
     setNotice('Vorschlag ausdrücklich als Showplan übernommen. Die Live-Anwendung bleibt separat schaltbar.');
    }}>Diesen Vorschlag als Showplan übernehmen</button>
    <button type="button" onClick={()=>{feedback(visibleCandidate,-1);setCandidate(null);}}>Vorschlag ablehnen und merken</button>
    <button type="button" onClick={()=>{setCandidate(null);setNotice('Vorschlag verworfen, Showplan unverändert.');}}>Vorschau verwerfen</button>
   </div>}
   <button type="button" onClick={()=>{
    setMemory(EMPTY_LEARNING_V1095);setCandidate(null);
    try{window.localStorage.removeItem(STORAGE_KEY_V1095);setNotice('Alle lokal gelernten Showstile gelöscht.');}
    catch{setNotice('Sitzungsdaten geleert; lokaler Speicher war nicht erreichbar.');}
   }}>Gelernte Showstile löschen</button>
  </>}
  {notice&&<small role="status">{notice}</small>}
  <small>Nur Vorschläge: Vorhandene Timeline-Grenzen, Kamera- und Tanzvorgaben bleiben erhalten. Ohne dein ausdrückliches Übernehmen ändert sich keine Bühne. Keine neuen Beats, Drops, Geräte-, Pyro- oder Netzwerkbefehle.</small>
 </fieldset>;
}
