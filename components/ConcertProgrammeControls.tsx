'use client';
import {useEffect,useState} from 'react';
import {useMusic} from '@/context/MusicContext';
import {useUiPreferences} from '@/context/UiPreferencesContext';
import {useCrewSettings,writeCrewSettings} from './visualizer/useSonicCrew';
import {BeatCalibrationAssistant} from './visualizer/BeatCalibrationAssistant';
import {parseProgramme,programmeStyle} from '@/lib/concertProgramme';
import {recordingState,startConcertRecording,stopConcertRecording} from './concertRecording';
export function ConcertProgrammeControls(){
 const music=useMusic(),crew=useCrewSettings(),{preferences,updatePreferences}=useUiPreferences();
 const [text,setText]=useState(()=>{try{return localStorage.getItem('sonic-programme')??'';}catch{return '';}}),[message,setMessage]=useState(''),[recording,setRecording]=useState(recordingState),[selection,setSelection]=useState(0);
 let variants:{name:string;crew:unknown;position?:number}[]=[];try{const rows=JSON.parse(localStorage.getItem('sonic-saved-shows')??'[]');if(Array.isArray(rows))variants=rows.filter(r=>r&&typeof r.name==='string'&&r.crew).slice(0,8);}catch{}
 useEffect(()=>{const refresh=()=>setRecording(recordingState());window.addEventListener('sonic:recording',refresh);return()=>window.removeEventListener('sonic:recording',refresh);},[]);
 function saveProgramme(){const rows=parseProgramme(text);try{localStorage.setItem('sonic-programme',text);window.dispatchEvent(new Event('sonic:programme'));setMessage(`${rows.length} Songs gespeichert`);}catch{setMessage('Speichern nicht möglich');}}
 function snapshot(){try{const rows=JSON.parse(localStorage.getItem('sonic-saved-shows')??'[]');const item={name:music.track?.title??'Show',crew,track:music.track?.id,position:music.progressMs};localStorage.setItem('sonic-saved-shows',JSON.stringify([item,...(Array.isArray(rows)?rows:[])].slice(0,8)));setMessage('Showvariante gespeichert');}catch{setMessage('Speichern nicht möglich');}}
 function restore(){try{const item=JSON.parse(localStorage.getItem('sonic-saved-shows')??'[]')[selection];if(!item?.crew)return;writeCrewSettings(item.crew);setMessage('Letzte Regievariante geladen. Für einen Vergleich denselben Song ab derselben Stelle spielen.');}catch{setMessage('Keine gültige Variante');}}
 return <fieldset><legend>Konzertprogramm & Aufnahme</legend>
 <label>Setlist: Song-ID | Titel | cinema, groove, neon oder festival<textarea aria-label="Konzertprogramm" value={text} onChange={e=>setText(e.target.value)} rows={3}/></label>
 <button type="button" onClick={saveProgramme}>Programm speichern</button>
 <button type="button" disabled={!music.track} onClick={()=>{const rows=parseProgramme(text);if(!music.track)return;const next=[...rows.filter(r=>r.track!==music.track!.id),{track:music.track.id,title:music.track.title,style:programmeStyle(rows.length,rows.length+2)}];setText(next.map(r=>`${r.track} | ${r.title} | ${r.style}`).join('\n'));}}>Aktuellen Song ergänzen</button>
 <button type="button" onClick={()=>setText(parseProgramme(text).map((r,i,rows)=>`${r.track} | ${r.title} | ${programmeStyle(i,rows.length)}`).join("\n"))}>Spannungsbogen planen</button>
 <p>Die Regie folgt gespeicherten Song-IDs. Die Spotify-Wiedergabe steuerst du weiterhin selbst.</p>
 <label>Gespeicherte Variante<select aria-label="Gespeicherte Showvariante" value={selection} onChange={e=>setSelection(Number(e.target.value))}>{variants.map((v,i)=><option key={i} value={i}>{v.name} · {Math.round((v.position??0)/1000)} s</option>)}</select></label>
 <button type="button" onClick={snapshot}>Showvariante speichern</button><button type="button" onClick={restore}>Gewählte Variante laden</button>
 <BeatCalibrationAssistant/>
 <label>Anzeigeverzögerung in ms<input aria-label="Anzeigeverzögerung" type="range" min="0" max="500" step="10" value={Math.max(0,preferences.beatSyncOffsetMs)} onChange={e=>updatePreferences({beatSyncMode:'manual',beatSyncOffsetMs:Number(e.target.value)})}/></label>
 <button type="button" onClick={()=>{if(recording.running)stopConcertRecording();else void startConcertRecording().catch(e=>setMessage(e.message));}}>{recording.running?'Aufnahme stoppen':'Showvideo aufnehmen'}</button>
 {recording.url&&<a href={recording.url} download="Sonic-Konzert.webm">Video herunterladen</a>}
 <p>Video ohne Ton: Im Browser den Konzert-Tab auswählen. Escape schließt die Steuerung während der Aufnahme. Maximal zehn Minuten; die Browser-Freigabe beendet die Aufnahme ebenfalls.</p>
 <output>{message}</output></fieldset>;
}
/** Mounted independently of the drawer, so song changes are observed while controls are closed. */
export function ConcertProgrammeDirector({active}:{active:boolean}){
 const {track}=useMusic();const [programme,setProgramme]=useState('');
 useEffect(()=>{const refresh=()=>{try{setProgramme(localStorage.getItem('sonic-programme')??'');}catch{}};refresh();window.addEventListener('sonic:programme',refresh);window.addEventListener('storage',refresh);return()=>{window.removeEventListener('sonic:programme',refresh);window.removeEventListener('storage',refresh);};},[]);
 useEffect(()=>{if(!active||!track)return;const row=parseProgramme(programme).find(r=>r.track===track.id);if(!row)return;try{const raw=JSON.parse(localStorage.getItem('sonic-stage-crew-v4')??'{}');if(raw.showStyle!==row.style)writeCrewSettings({...raw,showStyle:row.style});}catch{}},[active,track?.id,programme]);
 useEffect(()=>{if(!active)stopConcertRecording();return()=>stopConcertRecording();},[active]);return null;
}
