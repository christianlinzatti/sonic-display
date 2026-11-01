"use client";
import {useState} from 'react';
import {DEFAULT_ARTIST_VISUAL_V653,readSmartArtistVisualV653,saveSmartArtistVisualV653,planSmartArtistVisualV653,type SmartArtistVisualSettingsV653} from '@/services/stageContent/smartArtistVisualDirectorV653';

/** Optional editor for the pure V653 policy; no API calls or per-frame hooks. */
export function SmartArtistVisualSettingsV653(){
 const [settings,setSettings]=useState(readSmartArtistVisualV653);
 const [section,setSection]=useState('verse');
 const [lyrics,setLyrics]=useState(true);
 const [lipSync,setLipSync]=useState(true);
 const [beat,setBeat]=useState(.7);
 const update=(patch:Partial<SmartArtistVisualSettingsV653>)=>setSettings(saveSmartArtistVisualV653({...settings,...patch}));
 const cue=planSmartArtistVisualV653({section,lyricsActive:lyrics,lipSyncActive:lipSync,playing:true,reducedMotion:false,imageCount:6,beatAccent:beat},settings);
 return <fieldset className="sonic-smart-artist-visual-settings-v653">
  <legend>V653 – Smart Artist Visual Director</legend>
  <p>Inszeniert bereits geladene Künstlerfotos passend zu Verse, Hook, Drop und Instrumentalpassagen. Lyrics und Gesichts-/Lip-Sync bleiben vorrangig.</p>
  <label><input type="checkbox" checked={settings.enabled} onChange={e=>update({enabled:e.target.checked})}/> Automatische Künstlerbild-Regie aktiv</label>
  <label>Lyrics-Schutz ({Math.round(settings.lyricProtection*100)} %)
   <input type="range" min="0" max="100" value={Math.round(settings.lyricProtection*100)} onChange={e=>update({lyricProtection:Number(e.target.value)/100})}/>
  </label>
  <label>Hook-/Drop-Intensität ({Math.round(settings.hookEnergy*100)} %)
   <input type="range" min="0" max="100" value={Math.round(settings.hookEnergy*100)} onChange={e=>update({hookEnergy:Number(e.target.value)/100})}/>
  </label>
  <label>Maximal gleichzeitig sichtbare Fotos ({settings.maximumPhotos})
   <input type="range" min="1" max="8" value={settings.maximumPhotos} onChange={e=>update({maximumPhotos:Number(e.target.value)})}/>
  </label>
  <label>Weiche Bildübergänge ({settings.transitionMs} ms)
   <input type="range" min="0" max="3500" step="50" value={settings.transitionMs} onChange={e=>update({transitionMs:Number(e.target.value)})}/>
  </label>
  <div className="sonic-preview-toolbar-v343">
   <label>Vorschau-Abschnitt <select value={section} onChange={e=>setSection(e.target.value)}><option value="intro">Intro</option><option value="verse">Verse</option><option value="hook">Hook</option><option value="drop">Drop</option><option value="break">Instrumental/Break</option><option value="outro">Outro</option></select></label>
   <label><input type="checkbox" checked={lyrics} onChange={e=>setLyrics(e.target.checked)}/> Lyrics aktiv</label>
   <label><input type="checkbox" checked={lipSync} onChange={e=>setLipSync(e.target.checked)}/> Lip-Sync aktiv</label>
   <label>Beat ({Math.round(beat*100)} %) <input type="range" min="0" max="100" value={Math.round(beat*100)} onChange={e=>setBeat(Number(e.target.value)/100)}/></label>
  </div>
  <p role="status">{cue.reason} · Fotoauswahl: {cue.scene} · gleichzeitig: {cue.visiblePhotos} · Foto-Deckkraft: {Math.round(cue.photoOpacity*100)} % · Bewegung: {Math.round(cue.photoMotion*100)} % · Künstlertext: {cue.bioMode==='teaser'?'kurz':'vollständig'}</p>
  <button type="button" onClick={()=>update(DEFAULT_ARTIST_VISUAL_V653)}>Standardeinstellungen wiederherstellen</button>
  <small>Manuelle V350-Lyrics/Foto-Einstellungen haben Vorrang. V653 verändert keine Lyrics-Timings, Gesichter, Avatare oder Bildrechte.</small>
 </fieldset>;
}
