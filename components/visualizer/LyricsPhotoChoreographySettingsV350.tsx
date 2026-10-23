'use client';
import {useEffect,useState} from 'react';
import {DEFAULT_LYRICS_PHOTO_V350,LYRICS_PHOTO_EVENT_V350,decideLyricsPhotoV350,readLyricsPhotoV350,saveLyricsPhotoV350,type LyricsPhotoSettingsV350,type LyricsPhotoCueV350} from '@/services/stageContent/lyricsPhotoChoreographyV350';

/** Preview uses the exact pure decision function used on stage, without a second WebGL context. */
export function LyricsPhotoChoreographySettingsV350(){
 const [settings,setSettings]=useState(readLyricsPhotoV350);
 const [section,setSection]=useState('verse');
 const [lyrics,setLyrics]=useState(true);
 const [beat,setBeat]=useState(.25);
 const [count,setCount]=useState(6);
 useEffect(()=>{const reload=()=>setSettings(readLyricsPhotoV350());window.addEventListener(LYRICS_PHOTO_EVENT_V350,reload);return()=>window.removeEventListener(LYRICS_PHOTO_EVENT_V350,reload);},[]);
 const update=(p:Partial<LyricsPhotoSettingsV350>)=>saveLyricsPhotoV350({...settings,...p});
 const decision=decideLyricsPhotoV350({lyricsActive:lyrics,section,beatAccent:beat,playing:true,imageCount:count,lyricsSide:'left'},settings);
 const range=(key:'lyricPriority'|'chorusImpact'|'motionReduction',label:string)=>
  <label key={key}>{label}: {Math.round(settings[key]*100)} %<input type="range" min={0} max={1} step={.05} value={settings[key]} onChange={e=>update({[key]:Number(e.target.value)})}/></label>;
 return <fieldset className="sonic-lyrics-photo-settings-v350"><legend>V350 – Lyrics &amp; Photo Choreography</legend>
  <p>Koordiniert die <strong>tatsächlich angezeigten Lyrics</strong> mit 2D- und 3D-Fotogalerien. Strophen priorisieren lesbaren Text; Hook und Drop lassen Fotos stärker auftreten. Avatare und die Bühnenkamera bleiben unter ihrer bisherigen Steuerung.</p>
  <label className="setting-check"><input type="checkbox" checked={settings.enabled} onChange={e=>update({enabled:e.target.checked})}/> Lyrics-Foto-Choreografie aktivieren</label>
  <label>Steuerung <select value={settings.mode} onChange={e=>update({mode:e.target.value==='manual'?'manual':'auto'})}><option value="auto">Automatisch nach Songabschnitt und Lyrics</option><option value="manual">Manuelle Bilddramaturgie</option></select></label>
  {settings.mode==='manual'&&<label>Manuelle Szene <select value={settings.manualCue} onChange={e=>update({manualCue:e.target.value as LyricsPhotoCueV350})}><option value="lyrics">Lyrics im Vordergrund</option><option value="balanced">Ausgewogen</option><option value="photos">Fotofokus</option></select></label>}
  <div className="sonic-gallery-layout-controls-v344">
   {range('lyricPriority','Textpriorität')}{range('chorusImpact','Drop-Verstärkung')}{range('motionReduction','Bewegungsdämpfung bei Lyrics')}
   <label>Max. Fotos während Lyrics <input type="number" min="1" max="8" value={settings.versePhotoLimit} onChange={e=>update({versePhotoLimit:Number(e.target.value)})}/></label>
   <label>Max. Fotos bei Hook/Drop <input type="number" min="1" max="8" value={settings.chorusPhotoLimit} onChange={e=>update({chorusPhotoLimit:Number(e.target.value)})}/></label>
   <label>Übergangsdauer (ms) <input type="number" min="0" max="3500" step="50" value={settings.transitionMs} onChange={e=>update({transitionMs:Number(e.target.value)})}/></label>
  </div>
  <div className="sonic-lyrics-photo-preview-v350" aria-label="Vorschau der Lyrics-Foto-Choreografie">
   <strong>Simulation – Songabschnitt und Lyrics</strong>
   <div className="sonic-preview-toolbar-v343">
    <label>Abschnitt <select value={section} onChange={e=>setSection(e.target.value)}><option value="intro">Intro</option><option value="verse">Strophe</option><option value="chorus">Refrain</option><option value="drop">Drop</option><option value="bridge">Bridge</option><option value="outro">Outro</option></select></label>
    <label className="setting-check"><input type="checkbox" checked={lyrics} onChange={e=>setLyrics(e.target.checked)}/> Lyrics sichtbar</label>
    <label>Fotos <input type="number" min="0" max="8" value={count} onChange={e=>setCount(Math.max(0,Math.min(8,Number(e.target.value)||0)))}/></label>
    <label>Beat {Math.round(beat*100)} % <input type="range" min="0" max="1" step=".05" value={beat} onChange={e=>setBeat(Number(e.target.value))}/></label>
   </div>
   <div className="sonic-lyrics-photo-stage-v350" data-cue={decision.cue}>
    <div className="sonic-lyrics-photo-text-v350" style={{opacity:lyrics?1:.3}}>♫ Songtext auf der Bühne</div>
    <div className="sonic-lyrics-photo-tiles-v350">{Array.from({length:count},(_,i)=><span key={i} style={{opacity:i<decision.visiblePhotos?decision.photoOpacity:.12,transition:`opacity ${decision.transitionMs}ms ease`}} aria-label={`Fotokarte ${i+1}`}>{i+1}</span>)}</div>
   </div>
   <p role="status"><strong>{decision.reason}</strong> · Sichtbare Fotos: {decision.visiblePhotos} · Deckkraft: {Math.round(decision.photoOpacity*100)} % · Bewegung: {Math.round(decision.photoMotion*100)} %</p>
   {!settings.enabled&&<small>Die Automatik ist aktuell ausgeschaltet; die Vorschau zeigt den unveränderten Zustand.</small>}
  </div>
  <button type="button" onClick={()=>update(DEFAULT_LYRICS_PHOTO_V350)}>V350-Einstellungen zurücksetzen</button>
  <small>Die Choreografie respektiert V346-Handbetrieb und ändert keine gespeicherten Bildlayouts. Bei ausgeschalteter Funktion bleibt V349 unverändert.</small>
 </fieldset>;
}
