'use client';
import {useEffect,useState,type CSSProperties} from 'react';
import {VISUAL_FX_EVENT_V353,readVisualFxV353,saveVisualFxV353,decideVisualFxV353,removeVisualFxPresetV353,
 upsertVisualFxPresetV353,resolveVisualFxTuningV353,VISUAL_FX_PRESETS_V353,DEFAULT_VISUAL_FX_V353,
 type VisualFxModeV353,type VisualFxPresetIdV353,type VisualFxTransitionV353,type VisualFxTuningV353,type VisualFxQualityV353} from '@/services/stageContent/visualEffectsStudioV353';
import type {GenreVisualIdV352} from '@/services/stageContent/genreVisualDirectorV352';
const presets=Object.keys(VISUAL_FX_PRESETS_V353) as VisualFxPresetIdV353[];
const genres:GenreVisualIdV352[]=['hiphop','hardstyle','hardtekk','techno','rock','ambient','pop'];
export function VisualEffectsStudioSettingsV353(){
 const [settings,setSettings]=useState(readVisualFxV353);
 const [name,setName]=useState('Mein Bühnen-FX');
 const [section,setSection]=useState('drop');
 const [genre,setGenre]=useState<GenreVisualIdV352>('hardtekk');
 const [quality,setQuality]=useState<VisualFxQualityV353>('high');
 const [lyrics,setLyrics]=useState(true);
 const [playing,setPlaying]=useState(true);
 const [reduced,setReduced]=useState(false);
 const [status,setStatus]=useState('');
 useEffect(()=>{const refresh=()=>setSettings(readVisualFxV353());window.addEventListener(VISUAL_FX_EVENT_V353,refresh);return()=>window.removeEventListener(VISUAL_FX_EVENT_V353,refresh);},[]);
 const update=(patch:Partial<typeof settings>)=>saveVisualFxV353({...settings,...patch});
 const chosen=resolveVisualFxTuningV353(settings,genre);
 const custom=(patch:Partial<VisualFxTuningV353>)=>update({mode:'custom',custom:{...chosen.tuning,...patch}});
 const cue=decideVisualFxV353({playing,reducedMotion:reduced,lyricsActive:lyrics,genre,section,beatAccent:.85,quality},settings);
 const save=()=>{
  const saved=upsertVisualFxPresetV353(settings,name,chosen.tuning);
  if(saved.saved.length===settings.saved.length&&!saved.saved.some(p=>p.name===name.trim().slice(0,36))){setStatus('Maximal acht eigene Presets möglich.');return;}
  saveVisualFxV353(saved);setStatus(`Preset „${name.trim().slice(0,36)}“ gespeichert.`);
 };
 return <fieldset className="sonic-visual-fx-v353"><legend>V353 – Visual Effects Studio</legend>
  <p>Partikel, Glow, Shader und Fotoübergänge für die vorhandene 3D-Bühne. Einstellungen wirken live, Genre-Automatik und V351-Lyrics-Schutz bleiben aktiv.</p>
  <label className="sonic-smart-stage-check-v351"><input type="checkbox" checked={settings.enabled} onChange={e=>update({enabled:e.target.checked})}/> Visual Effects Studio aktivieren</label>
  <div className="sonic-smart-stage-grid-v351">
   <label>Effekt-Regie <select value={settings.mode} onChange={e=>update({mode:e.target.value as VisualFxModeV353})}>
    <option value="auto">Automatisch nach Genre</option><option value="builtin">Vordefiniertes Preset</option>
    <option value="custom">Individuell</option><option value="saved" disabled={!settings.saved.length}>Gespeichertes Preset</option><option value="off">Aus (vorhandene FX unverändert)</option>
   </select></label>
   {settings.mode==='builtin'&&<label>Effekt-Preset <select value={settings.preset} onChange={e=>update({preset:e.target.value as VisualFxPresetIdV353})}>{presets.map(p=><option key={p} value={p}>{VISUAL_FX_PRESETS_V353[p].label}</option>)}</select></label>}
   {settings.mode==='saved'&&<label>Eigenes Preset <select value={settings.selectedId} onChange={e=>update({selectedId:e.target.value})}>{settings.saved.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select></label>}
  </div>
  <div className="sonic-genre-visual-toggles-v352">{([
   ['particlesEnabled','Partikel'],['glowEnabled','Glow / Emission'],['shaderEnabled','Shader-Hintergrund'],['transitionsEnabled','Fotoübergänge (nur wenn V347 aktiviert)']
  ] as const).map(([key,label])=><label key={key}><input type="checkbox" checked={settings[key]} onChange={e=>update({[key]:e.target.checked})}/>{label}</label>)}</div>
  <div className="sonic-visual-fx-controls-v353">
   {([
    ['particles','Partikeldichte'],['glow','Glow-Intensität'],['shader','Shader-Intensität'],
    ['transition','Übergangslänge'],['speed','Partikelbewegung']
   ] as const).map(([key,label])=><label key={key}>{label} <strong>{Math.round(chosen.tuning[key]*100)} %</strong>
    <input type="range" min="0" max="100" step="5" value={Math.round(chosen.tuning[key]*100)} onChange={e=>custom({[key]:Number(e.target.value)/100})}/></label>)}
   <label>Effektfarbe <input type="color" value={chosen.tuning.color} onChange={e=>custom({color:e.target.value})}/></label>
   <label>Bildwechsel <select value={chosen.tuning.photoStyle} onChange={e=>custom({photoStyle:e.target.value as VisualFxTransitionV353})}><option value="fade">Sanfte Blende</option><option value="zoom">Cinematic Zoom</option><option value="slide">Seitlicher Wechsel</option></select></label>
  </div>
  <div className="sonic-visual-fx-presets-v353"><label>Eigener Preset-Name <input maxLength={36} value={name} onChange={e=>setName(e.target.value)}/></label>
   <button type="button" onClick={save} disabled={!name.trim()}>Aktuelle Werte als Preset speichern</button>
   {settings.mode==='saved'&&<button type="button" onClick={()=>update(removeVisualFxPresetV353(settings,settings.selectedId))}>Gewähltes Preset löschen</button>}
   <span aria-live="polite">{status}</span></div>
  <div className="sonic-visual-fx-preview-v353"><h4>Live-Parameter-Simulator</h4><div className="sonic-smart-stage-grid-v351">
   <label>Genre <select value={genre} onChange={e=>setGenre(e.target.value as GenreVisualIdV352)}>{genres.map(g=><option key={g} value={g}>{g}</option>)}</select></label>
   <label>Songabschnitt <select value={section} onChange={e=>setSection(e.target.value)}><option value="verse">Verse</option><option value="build">Build-up</option><option value="drop">Drop</option><option value="intro">Intro</option></select></label>
   <label>Leistungsprofil <select value={quality} onChange={e=>setQuality(e.target.value as VisualFxQualityV353)}><option value="high">High</option><option value="balanced">Balanced</option><option value="low">Eco / Raspberry Pi</option></select></label>
   <label><input type="checkbox" checked={lyrics} onChange={e=>setLyrics(e.target.checked)}/> Lyrics aktiv</label>
   <label><input type="checkbox" checked={playing} onChange={e=>setPlaying(e.target.checked)}/> Musik läuft</label>
   <label><input type="checkbox" checked={reduced} onChange={e=>setReduced(e.target.checked)}/> Weniger Bewegung</label>
  </div>
  <div className="sonic-visual-fx-demo-v353" style={{'--sonic-v353-preview-color':cue.color,'--sonic-v353-preview-opacity':String(cue.shaderStrength*2)} as CSSProperties}>
   <div className="sonic-visual-fx-halo-v353"/><span className="sonic-visual-fx-caption-v353">♫&nbsp; {cue.label}</span>
   <div className="sonic-visual-fx-sparkles-v353" style={{opacity:cue.particleOpacity}}>{Array.from({length:Math.min(20,Math.ceil(cue.particleCount/4))},(_,i)=><i key={i} style={{left:`${(i*41)%94+3}%`,top:`${(i*23)%75+12}%`}}/>)}</div>
   {lyrics&&<span className="sonic-visual-fx-lyrics-v353">Lyrics bleiben lesbar</span>}
  </div><p aria-live="polite">{cue.reason}</p>
  <p>Partikel {cue.particleCount}/96 · Glow {Math.round(cue.glowGain*100)} % · Shader {Math.round(cue.shaderStrength*100)} % · Übergang {cue.transitionMs} ms</p>
  <small>Die Vorschau ist leichtgewichtig und benötigt keinen zweiten WebGL-Renderer. Gespeicherte Galerie-Effekte aus V347 bleiben separat ein-/ausschaltbar.</small>
  </div>
  <button type="button" onClick={()=>update(DEFAULT_VISUAL_FX_V353)}>V353-Standard wiederherstellen</button>
 </fieldset>;
}
