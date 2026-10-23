'use client';
import {useEffect,useState} from 'react';
import {DEFAULT_GENRE_VISUAL_V352,GENRE_VISUAL_EVENT_V352,GENRE_VISUAL_PROFILES_V352,
 readGenreVisualV352,saveGenreVisualV352,decideGenreVisualV352,
 type GenreVisualIdV352,type GenreVisualModeV352,type GenreVisualSettingsV352} from '@/services/stageContent/genreVisualDirectorV352';
import type {StageEnvironmentId} from './stages';
const genres=Object.keys(GENRE_VISUAL_PROFILES_V352) as GenreVisualIdV352[];
export function GenreVisualDirectorSettingsV352(){
 const [settings,setSettings]=useState(readGenreVisualV352);
 const [genre,setGenre]=useState<GenreVisualIdV352>('hardtekk');
 const [section,setSection]=useState('drop');
 const [secondary,setSecondary]=useState<GenreVisualIdV352|null>('rock');
 const [lyrics,setLyrics]=useState(true);
 const [playing,setPlaying]=useState(true);
 const [reduced,setReduced]=useState(false);
 const [theme,setTheme]=useState<StageEnvironmentId>('classic');
 useEffect(()=>{const refresh=()=>setSettings(readGenreVisualV352());window.addEventListener(GENRE_VISUAL_EVENT_V352,refresh);return()=>window.removeEventListener(GENRE_VISUAL_EVENT_V352,refresh);},[]);
 const update=(patch:Partial<GenreVisualSettingsV352>)=>saveGenreVisualV352({...settings,...patch});
 const cue=decideGenreVisualV352({genre,fusion:secondary&&secondary!==genre?{primary:genre,secondary,secondaryWeight:.35}:null,section,playing,reducedMotion:reduced,beatAccent:.8,lyricsActive:lyrics,screenCount:3,avatarCount:2,currentTheme:theme},settings);
 return <fieldset className="sonic-genre-visual-v352"><legend>V352 – Genre Visual Director</legend>
  <p>Ein gemeinsamer visueller Stil für Bühne, Avatare, Lyrics, Fotos, Kamera und Licht – ohne neue Rendering-Passes. Vorhandene Kamera-Presets und Licht-Timelines bleiben erhalten.</p>
  <label className="sonic-smart-stage-check-v351"><input type="checkbox" checked={settings.enabled} onChange={e=>update({enabled:e.target.checked})}/> Genre Visual Director aktivieren</label>
  <div className="sonic-smart-stage-grid-v351">
   <label>Regie-Modus <select value={settings.mode} onChange={e=>update({mode:e.target.value as GenreVisualModeV352})}>
    <option value="auto">Automatisch (erkanntes Genre)</option><option value="manual">Genre manuell festlegen</option><option value="off">Aus – vorhandene Bühne beibehalten</option>
   </select></label>
   {settings.mode==='manual'&&<label>Festes Genre <select value={settings.manualGenre} onChange={e=>update({manualGenre:e.target.value as GenreVisualIdV352})}>{genres.map(id=><option key={id} value={id}>{GENRE_VISUAL_PROFILES_V352[id].label}</option>)}</select></label>}
   <label>Inszenierungsstärke <strong>{Math.round(settings.intensity*100)} %</strong><input type="range" min="0" max="100" step="5" value={Math.round(settings.intensity*100)} onChange={e=>update({intensity:Number(e.target.value)/100})}/></label>
  </div>
  <div className="sonic-genre-visual-toggles-v352">
   {([
    ['automaticTheme','Bühnenstil automatisch wählen (Standardbühne)'],
    ['overrideTheme','Auch bewusst gewählte Bühnen-Presets überschreiben'],
    ['genreColors','Genre-Farben für vorhandene Lichter'],
    ['fusionEnabled','Genre-Fusion automatisch mischen (z. B. Pop + Rock)'],
    ['coordinateLighting','Licht und Beams anpassen'],
    ['coordinateCamera','Automatische Kamerabewegung anpassen'],
    ['coordinateEffects','Vorhandene DanceFX genreabhängig dosieren'],
    ['coordinatePhotos','Fotobewegung und -deckung anpassen'],
   ] as const).map(([key,label])=><label key={key}><input type="checkbox" checked={settings[key]} onChange={e=>update({[key]:e.target.checked})}/> {label}</label>)}
  </div>
  <div className="sonic-genre-visual-preview-v352">
   <h4>Genre-Regie-Simulator</h4>
   <div className="sonic-smart-stage-grid-v351">
    <label>Erkanntes Genre (Vorschau) <select value={genre} onChange={e=>setGenre(e.target.value as GenreVisualIdV352)}>{genres.map(id=><option value={id} key={id}>{GENRE_VISUAL_PROFILES_V352[id].label}</option>)}</select></label>
    <label>Zweites Genre (Fusion-Vorschau) <select value={secondary??''} onChange={e=>setSecondary(e.target.value?e.target.value as GenreVisualIdV352:null)}><option value="">Keine Fusion</option>{genres.filter(id=>id!==genre).map(id=><option key={id} value={id}>{GENRE_VISUAL_PROFILES_V352[id].label}</option>)}</select></label>
    <label>Songabschnitt <select value={section} onChange={e=>setSection(e.target.value)}><option value="intro">Intro</option><option value="verse">Verse</option><option value="build">Build-up</option><option value="chorus">Hook</option><option value="drop">Drop</option><option value="outro">Outro</option></select></label>
    <label>Ausgangsbühne <select value={theme} onChange={e=>setTheme(e.target.value as StageEnvironmentId)}><option value="classic">Classic (Automatik erlaubt)</option><option value="festival">Festival (Preset)</option><option value="cyberpunk">Cyberpunk (Preset)</option><option value="white">White Studio (Preset)</option></select></label>
    <label><input type="checkbox" checked={lyrics} onChange={e=>setLyrics(e.target.checked)}/> Lyrics sichtbar</label>
    <label><input type="checkbox" checked={playing} onChange={e=>setPlaying(e.target.checked)}/> Wiedergabe läuft</label>
    <label><input type="checkbox" checked={reduced} onChange={e=>setReduced(e.target.checked)}/> Weniger Bewegung</label>
   </div>
   <div className="sonic-genre-visual-card-v352" style={{background:cue.palette?`linear-gradient(118deg, ${cue.palette.primary}44, #111827 48%, ${cue.palette.secondary}66)`:'linear-gradient(118deg,#273344,#101624)'}}>
    <span className="sonic-genre-visual-swatches-v352">{cue.palette&&[cue.palette.primary,cue.palette.secondary,cue.palette.glow].map((color,i)=><i key={i} style={{background:color}} title={color}/>)}</span>
    <strong>{cue.active?cue.label:'Keine Genre-Übersteuerung'}</strong>
    <span>{cue.active?cue.description:'Die bisherigen Bühnen-Einstellungen bleiben unverändert.'}</span>
    <span>Stage: {cue.theme} · Fokus: {cue.focus}</span>
   </div>
   <p aria-live="polite">{cue.reason}</p>
   <p className="sonic-genre-visual-metrics-v352">Licht {Math.round(cue.lightGain*100)} % · Beams {Math.round(cue.beamGain*100)} % · FX {Math.round(cue.fxGain*100)} % · Kamera {Math.round(cue.cameraMotion*100)} % · Fotobewegung {Math.round(cue.photoMotion*100)} %</p>
   <small>Diese Vorschau simuliert Cues, ohne die aktuelle Wiedergabe, Bühnen-Presets oder GLB-Motions zu verändern.</small>
  </div>
  <button type="button" onClick={()=>update(DEFAULT_GENRE_VISUAL_V352)}>V352-Standard wiederherstellen</button>
 </fieldset>;
}
