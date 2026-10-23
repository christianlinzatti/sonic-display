'use client';
import {useEffect,useState} from 'react';
import {PHRASE_DEFAULT_V329,readPhraseV329,writePhraseV329,type PhraseSettingsV329,type PhraseWeightsV329} from './intelligentMotionPhraseV329';
const weights:[keyof PhraseWeightsV329,string][]=[['feet','Beine und Füße'],['posture','Oberkörper und Haltung'],['direction','Hüfte und Root-Richtung'],['rhythm','Bewegungsrhythmus']];
export function GroupMotionPhraseControlsV329(){
 const [settings,setSettings]=useState<PhraseSettingsV329>(PHRASE_DEFAULT_V329);
 useEffect(()=>{setSettings(readPhraseV329());},[]);
 const put=(patch:Partial<PhraseSettingsV329>)=>setSettings(writePhraseV329({...settings,...patch}));
 return <fieldset className="group-motion-phrase-v329"><legend>Intelligent Motion Phrase Matching · V329</legend>
  <p>Vergleicht die Keyframe-Bewegung bestehender GLB-Animationsclips (Beine, Rumpf, Richtung und Rhythmus). Wählt für drei bis vier Tänzer passende Clips, ohne Animationsdaten umzuschreiben.</p>
  <label className="setting-check"><input type="checkbox" checked={settings.enabled} onChange={e=>put({enabled:e.target.checked})}/> Intelligente Gruppen-Clip-Auswahl live aktivieren</label>
  <div className="ensemble-studio-v325-controls">
   {weights.map(([key,label])=><label key={key}>{label}: {Math.round(settings.weights[key]*100)} % <input type="range" min="0" max="1" step=".05" value={settings.weights[key]} onChange={e=>put({weights:{...settings.weights,[key]:Number(e.target.value)}})}/></label>)}
   <label>Mindest-Übereinstimmung: {Math.round(settings.minConfidence*100)} % <input type="range" min=".2" max=".95" step=".01" value={settings.minConfidence} onChange={e=>put({minConfidence:Number(e.target.value)})}/></label>
   <label>Analysierte Clips je Avatar (max.) <input type="number" min="1" max="64" step="1" value={settings.maxCandidates} onChange={e=>put({maxCandidates:Number(e.target.value)})}/></label>
   <label className="setting-check"><input type="checkbox" checked={settings.alignPhase} onChange={e=>put({alignPhase:e.target.checked})}/> Beste Bewegungsphase zusätzlich mit V328-Beat-Uhr ausrichten</label>
  </div>
  <small>Manuelle Clip-Indizes aus V328, selbst erstellte Timelines, gespeicherte Loop-Presets und Animation-Layer haben Vorrang. Bei fehlenden verwertbaren Keyframes oder niedriger Übereinstimmung bleibt die bisherige Clip-Auswahl erhalten. Die Erkennung ist eine Heuristik aus lokalen Keyframes – keine echte Bodenkontakt- oder Weltkoordinatenanalyse. Die Phasenausrichtung greift nur, wenn V328 ebenfalls aktiviert ist.</small>
  <button type="button" onClick={()=>setSettings(writePhraseV329(PHRASE_DEFAULT_V329))}>V329 zurücksetzen</button>
 </fieldset>;
}
