"use client";
import {useEffect,useState} from 'react';
import {readPhotoDirectorV346,savePhotoDirectorV346,PHOTO_DIRECTOR_EVENT_V346,decidePhotoMoodV346,type PhotoDirectorSettingsV346,type PhotoDirectorMoodV346} from '@/services/stageContent/photoDirectorV346';
export function PhotoDirectorSettingsV346({sampleImages=3,section='verse',genre='',beatAccent=0,playing=true}:{sampleImages?:number;section?:string;genre?:string;beatAccent?:number;playing?:boolean}){
 const [settings,setSettings]=useState(readPhotoDirectorV346);
 const [demoSection,setDemoSection]=useState('verse');const [demoGenre,setDemoGenre]=useState('hardstyle');const [demoBeat,setDemoBeat]=useState(.35);
 useEffect(()=>{const onChange=()=>setSettings(readPhotoDirectorV346());window.addEventListener(PHOTO_DIRECTOR_EVENT_V346,onChange);return()=>window.removeEventListener(PHOTO_DIRECTOR_EVENT_V346,onChange);},[]);
 const patch=(p:Partial<PhotoDirectorSettingsV346>)=>savePhotoDirectorV346({...settings,...p});
 const decision=decidePhotoMoodV346({section:demoSection,genre:demoGenre,beatAccent:demoBeat,imageCount:sampleImages||3,playing},settings);
 return <fieldset className="sonic-photo-director-settings-v346"><legend>V346 – Intelligent Photo Layout Director</legend>
 <p>Automatische Bilddramaturgie: Strophen ruhig, Refrains ausgewogen und Drops dynamisch. Benötigt eine aktivierte Mehrbild-Komposition aus V345.</p>
 <label className="setting-check"><input type="checkbox" checked={settings.enabled} onChange={e=>patch({enabled:e.target.checked})}/> Intelligenten Layout Director aktivieren</label>
 <label>Steuerung <select value={settings.mode} onChange={e=>patch({mode:e.target.value==='manual'?'manual':'auto'})}><option value="auto">Automatisch nach Song</option><option value="manual">Manuelle Vorgabe (immer Vorrang)</option></select></label>
 {settings.mode==='manual'?<label>Bildstimmung <select value={settings.manualMood} onChange={e=>patch({manualMood:e.target.value as PhotoDirectorMoodV346})}><option value="focus">Fokus – Einzelbild</option><option value="balanced">Ausgewogen – bis zu drei Bilder</option><option value="impact">Impact – bis zu acht Bilder</option></select></label>:<>
 <label>Empfindlichkeit: {Math.round(settings.sensitivity*100)} % <input type="range" min="0" max="1" step="0.05" value={settings.sensitivity} onChange={e=>patch({sensitivity:Number(e.target.value)})}/></label>
 <label>Mindestdauer einer Anordnung: {settings.minimumHoldSeconds} s <input type="range" min="2" max="30" step="1" value={settings.minimumHoldSeconds} onChange={e=>patch({minimumHoldSeconds:Number(e.target.value)})}/></label>
 </>}
 <div className="sonic-preview-toolbar-v343"><label>Test-Abschnitt <select value={demoSection} onChange={e=>setDemoSection(e.target.value)}><option value="intro">Intro</option><option value="verse">Strophe</option><option value="chorus">Refrain</option><option value="drop">Drop</option><option value="breakdown">Breakdown</option></select></label>
 <label>Test-Genre <select value={demoGenre} onChange={e=>setDemoGenre(e.target.value)}><option value="hardstyle">Hardstyle</option><option value="hardtekk">Hardtekk</option><option value="deutschrap">Deutschrap</option><option value="ambient">Ambient</option></select></label>
 <label>Test-Beat: {Math.round(demoBeat*100)} % <input type="range" min="0" max="1" step="0.05" value={demoBeat} onChange={e=>setDemoBeat(Number(e.target.value))}/></label></div>
 <p role="status">Vorschlag: <strong>{decision.mood==='focus'?'Fokus':decision.mood==='balanced'?'Ausgewogen':'Impact'}</strong> · {decision.activeLayers} Bild(er) · {decision.reason}</p>
 <small>Der Test verändert keine Songdaten. Ohne erkennbaren Abschnitt funktioniert die Steuerung über das Beat-Signal. Mit aktivierter manueller Vorgabe bleiben gespeicherte V345-Kompositionen unverändert.</small>
 </fieldset>;
}
