'use client';
import {useEffect,useMemo,useState} from 'react';
import {AlexaConcertControlV967} from '@/components/AlexaConcertControlV967';
import {useMusic} from '@/context/MusicContext';
import {concertContinuityAuditV960} from '@/lib/concertContinuityV960';
import type {GoveeConfigV909,GoveeDeviceV909} from '@/lib/goveeLanV909';
import {loadGoveeSpatialV926,saveGoveeSpatialV926} from '@/lib/goveeSpatialDirectorV926';
import {loadGoveeCalibrationV927} from '@/lib/goveeRoomCalibrationV927';
import {readTrackAnalysisV318,ANALYSIS_EVENT_V318,ANALYSIS_STORAGE_KEY_V318,type TrackAnalysisV318} from '@/services/musicAnalysis/trackAnalysisV318';
import {composeConcertSceneV958,rehearseConcertV938,qualityImportedConcertV957,loadConcertRoadmapV958,saveConcertRoadmapV958,
 upsertRoomPresetV936,latencyAnalysisV932,CONCERT_SIGNAL_EVENT_V933,CONCERT_ROADMAP_EVENT_V958,
 type ConcertSettingsV958,type ConcertPhaseV958,type ConcertRoleV935,type ConcertCameraV940,
 type ConcertDanceV941,type ConcertFxV955,type ConcertSignalV933} from '@/lib/ultimateConcertRoadmapV958';

const phaseOptions:ConcertPhaseV958[]=['verse','hook','build','drop','break','outro'];
const roles:ConcertRoleV935[]=['spotlight','rhythm','backdrop','audience','accent'];
const cameraOptions:ConcertCameraV940[]=['wide','medium','close','orbit'];
const formationOptions:ConcertDanceV941[]=['solo','duet','sync','mirror'];
const fxOptions:ConcertFxV955[]=['beams','lasers','sweep','bass-impact','fog','confetti','streamers'];
export function ConcertRoadmapStudioV958({config,devices,onConfig}:{config:GoveeConfigV909;devices:GoveeDeviceV909[];
 onConfig:(patch:Partial<GoveeConfigV909>)=>void}){
 const {track,genre}=useMusic();
 const [settings,setSettings]=useState<ConcertSettingsV958|null>(null);
 const [phase,setPhase]=useState<ConcertPhaseV958>('hook');const [position,setPosition]=useState(60);
 const [presetName,setPresetName]=useState('Mein Konzertraum');const [selectedPreset,setSelectedPreset]=useState('');
 const [camera,setCamera]=useState<ConcertCameraV940>('wide');
 const [formation,setFormation]=useState<ConcertDanceV941>('sync');const [effect,setEffect]=useState<ConcertFxV955>('beams');
 const [signals,setSignals]=useState<ConcertSignalV933[]>([]);const [notice,setNotice]=useState('');
 const [actualAnalysis,setActualAnalysis]=useState<TrackAnalysisV318|null>(null);
 useEffect(()=>{setSettings(loadConcertRoadmapV958());
  const receive=(event:Event)=>{const msg=(event as CustomEvent<ConcertSignalV933>).detail;
   if(msg&&Number.isSafeInteger(msg.fixture)&&msg.fixture>=1&&msg.fixture<=32&&Number.isFinite(msg.atMs))
    setSignals(previous=>[...previous.filter(s=>s.fixture!==msg.fixture),msg].slice(-32));};
  window.addEventListener(CONCERT_SIGNAL_EVENT_V933,receive);
  return()=>window.removeEventListener(CONCERT_SIGNAL_EVENT_V933,receive);
 },[]);
 useEffect(()=>{const refresh=()=>setSettings(loadConcertRoadmapV958());
  window.addEventListener(CONCERT_ROADMAP_EVENT_V958,refresh);
  return()=>window.removeEventListener(CONCERT_ROADMAP_EVENT_V958,refresh);
 },[]);
 useEffect(()=>{
  const refresh=()=>setActualAnalysis(readTrackAnalysisV318(track?.id||''));
  const storage=(event:StorageEvent)=>{if(!event.key||event.key===ANALYSIS_STORAGE_KEY_V318)refresh();};
  refresh();window.addEventListener(ANALYSIS_EVENT_V318,refresh);window.addEventListener('storage',storage);
  return()=>{window.removeEventListener(ANALYSIS_EVENT_V318,refresh);window.removeEventListener('storage',storage);};
 },[track?.id]);
 const save=(patch:Partial<ConcertSettingsV958>)=>{
  if(!settings)return;
  const result={...settings,...patch};try{saveConcertRoadmapV958(result);setSettings(loadConcertRoadmapV958());}
  catch{setNotice('Speichern nicht möglich: lokalen Speicher und Speicherplatz prüfen.');}
 };
 const duration=track?.durationMs||180000;
 const previewAt=Math.round(duration*position/100);
 const scene=useMemo(()=>settings?composeConcertSceneV958({trackId:track?.id||'rehearsal',progressMs:previewAt,
  durationMs:duration,phase,sectionIndex:Math.floor(position/8),sectionStartMs:Math.max(0,previewAt-2000),
  verified:false,genre:String(genre||''),energy:.7,bass:.7,lyricsVisible:false,reducedMotion:false},settings):null,
 [settings,track?.id,previewAt,duration,phase,position,genre]);
 const rehearsal=useMemo(()=>settings?rehearseConcertV938(track?.id||'rehearsal',duration,String(genre||''),settings):null,
  [settings,track?.id,duration,genre]);
 const continuity=useMemo(()=>rehearsal?concertContinuityAuditV960(rehearsal.scenes,true):null,[rehearsal]);
 const realQuality=useMemo(()=>settings?qualityImportedConcertV957(actualAnalysis,String(genre||''),settings):null,
  [actualAnalysis,genre,settings]);
 const addPreset=()=>{if(!settings||!config.selectedIps.length)return;
  const spatial=loadGoveeSpatialV926();const id=`room-${Date.now()}`;
  const rolesValue:Record<string,ConcertRoleV935>={};
  const positions:Record<string,{x:number;y:number}>={};
  config.selectedIps.forEach((ip,i)=>{rolesValue[ip]=settings.roleOverrides[ip]||roles[i%roles.length];
   positions[ip]=spatial.positions[ip]||{x:.2+.6*(i%2),y:.2+.6*Math.floor(i/2)/Math.max(1,Math.ceil(config.selectedIps.length/2)-1)};});
  const s=upsertRoomPresetV936(settings,{id,name:presetName,roles:rolesValue,positions});save(s);setSelectedPreset(id);
  setNotice('Raumpreset lokal gespeichert. Die laufende Show wurde nicht verändert.');};
 const applyPreset=()=>{const preset=settings?.presets.find(p=>p.id===selectedPreset);if(!preset)return;
  // Explicit user action; only V926 positions and new V935 roles. Existing V912 shows are untouched.
  save({roleOverrides:preset.roles});saveGoveeSpatialV926({...loadGoveeSpatialV926(),positions:preset.positions});
  setNotice('Raumpositionen und neue Konzertrollen übernommen. Vorhandene Lichtshows bleiben unverändert.');};
 const addTimeline=()=>{if(!track?.id||!settings)return;
  const current=settings.timeline[track.id]||[];
  save({timeline:{...settings.timeline,[track.id]:[...current,{atMs:previewAt,phase,camera,formation,effect}].sort((a,b)=>a.atMs-b.atMs)}});
  setNotice('Manuellen Regie-Cue gespeichert. Er ersetzt keine vorhandene V354-Show-Timeline.');};
 const changeTimeline=(index:number,patch:Partial<NonNullable<ConcertSettingsV958['timeline'][string]>[number]>)=>{
  if(!track?.id||!settings)return;
  const updated=(settings.timeline[track.id]||[]).map((cue,i)=>i===index?{...cue,...patch}:cue).sort((a,b)=>a.atMs-b.atMs);
  save({timeline:{...settings.timeline,[track.id]:updated}});
 };
 const deleteTimeline=(index:number)=>{
  if(!track?.id||!settings)return;
  save({timeline:{...settings.timeline,[track.id]:(settings.timeline[track.id]||[]).filter((_,i)=>i!==index)}});
 };
 const calibration=typeof window!=='undefined'?loadGoveeCalibrationV927():null;
 if(!settings)return <p className="settings-note">Concert Studio wird geladen …</p>;
 return <section className="govee-v958" aria-label="V930 bis V958 Ultimate Concert Experience">
  <h3>V930–V958 · Ultimate Concert Experience Studio</h3>
  <p className="settings-note">Konzertdramaturgie, Vorschau und Gerätesignale – ohne zusätzliche LAN-Timer. Bestehende manuelle Govee-Lichtshows und die V354-Bühnen-Timeline behalten Vorrang.</p>
  <div className="govee-v958-settings">
   <label><input type="checkbox" checked={settings.enabled} onChange={e=>save({enabled:e.target.checked})}/> Intelligente Konzertregie aktivieren</label>
   <label><input type="checkbox" checked={settings.virtualFx} disabled={!settings.enabled} onChange={e=>save({virtualFx:e.target.checked})}/> Virtuelle 3D-Bühneneffekte aktivieren</label>
   <label><input type="checkbox" checked={settings.hardwareSync} disabled={!settings.enabled} onChange={e=>save({hardwareSync:e.target.checked})}/> Konzert-Cues zusätzlich dezent an Govee-LAN übertragen (opt-in)</label>
   <label><input type="checkbox" checked={settings.transitionsV960} disabled={!settings.enabled}
    onChange={e=>save({transitionsV960:e.target.checked})}/> V960: Sanfte Verse/Hook/Drop-Übergänge (nur bestätigte Abschnitte)</label>
   <label><input type="checkbox" checked={settings.compactFxV960} disabled={!settings.enabled||!settings.virtualFx}
    onChange={e=>save({compactFxV960:e.target.checked})}/> V960: Kompaktes 3D-FX-Profil (maximal zwei Effekte)</label>
   <label><input type="checkbox" checked={settings.lightGovernorV961} disabled={!settings.enabled||!settings.hardwareSync}
    onChange={e=>save({lightGovernorV961:e.target.checked})}/> V961: Sanfte Govee-Lichtwechsel (max. +12% Helligkeit und 40 RGB-Stufen je vorhandenem Auto-Sync-Tick)</label>
   <label><input type="checkbox" checked={settings.narrativeV962} disabled={!settings.enabled||!settings.hardwareSync}
    onChange={e=>save({narrativeV962:e.target.checked})}/> V962: Songdramaturgie für Govee (Verse/Hook/Build/Drop/Break/Outro – nur bestätigte Abschnitte)</label>
   <label><input type="checkbox" checked={settings.bridgeV963} disabled={!settings.enabled||!settings.hardwareSync}
    onChange={e=>save({bridgeV963:e.target.checked})}/> V963: Spannungsaufbau vor bestätigten Hook-/Drop-Wechseln (keine zusätzlichen Govee-Befehle; manuelle Shows geschützt)</label>
   <label><input type="checkbox" checked={settings.peakRecoveryV964} disabled={!settings.enabled||!settings.hardwareSync}
    onChange={e=>save({peakRecoveryV964:e.target.checked})}/> V964: Kurze Erholungsphase nach bestätigten Hook-/Drop-Spitzen (nur automatische Govee-Cues)</label>
   <label><input type="checkbox" checked={settings.roomWaveV965} disabled={!settings.enabled||!settings.hardwareSync}
    onChange={e=>save({roomWaveV965:e.target.checked})}/> V965: Langsame, genreabhängige Lichtwelle durch den Raum bei bestätigten Hooks und Drops (mindestens zwei Lampen; keine Blitze)</label>
   <label><input type="checkbox" checked={settings.immersiveV966} disabled={!settings.enabled||!settings.virtualFx}
    onChange={e=>save({immersiveV966:e.target.checked})}/> V966: Immersive Konzertatmosphäre – räumliche Lichtkegel, Bühnenhintergrund und Publikumsrand (nur virtuell; keine Lichtblitze)</label>
   <label>V966 Immersion: {settings.immersiveStrengthV966}% <input type="range" min={0} max={100} step={5}
    value={settings.immersiveStrengthV966} disabled={!settings.enabled||!settings.virtualFx||!settings.immersiveV966}
    onChange={e=>save({immersiveStrengthV966:Number(e.target.value)})}/></label>
   <label>Einfluss {settings.strength}% <input type="range" min={0} max={100} value={settings.strength} onChange={e=>save({strength:Number(e.target.value)})}/></label>
  </div>
  {settings.hardwareSync&&<p className="settings-note" role="status">Neue Govee-Cues werden nur bei aktivem Auto-Sync und echten bestätigten Songphasen berücksichtigt. Gespeicherte Shows und manuell gesetzte Kameracues bleiben unverändert. Keine Strobe-/Power-Kommandos.</p>}
  <AlexaConcertControlV967/>
  <h4>V939 / V945 / V946 · Konzertregie und Anti-Repetition</h4>
  <div className="govee-v958-settings"><label>Vorschauphase <select value={phase} onChange={e=>setPhase(e.target.value as ConcertPhaseV958)}>
   {phaseOptions.map(p=><option key={p} value={p}>{p}</option>)}
  </select></label><label>Songverlauf: {Math.round(position)}% <input aria-label="Vorschauposition" type="range" min={0} max={100} step={1} value={position} onChange={e=>setPosition(Number(e.target.value))}/></label></div>
  {scene&&<div className="govee-v958-preview" style={{border:`1px solid ${scene.palette[0]}`}}>
   <div className="govee-v958-wall" style={{background:`linear-gradient(125deg, ${scene.palette[0]}, ${scene.palette[1]})`}}>
    <span>LED WALL 3.0 · {scene.wall.toUpperCase()}</span><strong>{scene.phase.toUpperCase()}</strong>
   </div>
   <p><strong>Kamera:</strong> {scene.camera} · <strong>Formation:</strong> {scene.formation} · <strong>Genre:</strong> {scene.genre}</p>
   <p><strong>Effekte:</strong> {scene.effects.join(', ')||'ruhiger Moment'} · <strong>Energie:</strong> {Math.round(scene.intensity*100)}%</p>
   <small>Simulierte Vorschau, kein bestätigter Songabschnitt und keine echte LED-Rückmeldung.</small>
  </div>}
  <div className="govee-v958-summary"><strong>V938 Lichtshow-Probe:</strong> {rehearsal?.scenes.length} synthetische Szenen · <strong>V957 Qualitätswert:</strong> {rehearsal?.quality.score}/100 · Wiederholungen: {rehearsal?.quality.repetitions} · Überladungen: {rehearsal?.quality.overloaded}</div>
  <p className="settings-note">{realQuality?.available
   ?`V957 echte V318-Songabschnitte: ${realQuality.scenes.length} · Qualitätswert ${realQuality.quality.score}/100 · Szenenwiederholungen ${realQuality.quality.repetitions}`
   :'V957: Für den aktuellen Titel liegen keine bestätigten V318-Songabschnitte vor; die Qualitätsprobe oben ist ausschließlich synthetisch.'}</p>
  <h4>V960 · Concert Continuity Intelligence</h4>
  <p className="settings-note">Opt-in: echte benachbarte V318-Abschnitte werden ohne zusätzliche Netzwerk- oder Render-Schleife überblendet.
   V912-Lichtshows, eigene V354-Regie-Cues und manuelle Einstellungen behalten Vorrang.</p>
  <p className="settings-note">Synthetischer Ablauf: {continuity?.phaseChanges??0} Phasenwechsel,
   {continuity?.repeated??0} aufeinanderfolgende Kamera-/Formation-Wiederholungen.
   {realQuality?.available?` Importierte Songabschnitte: ${concertContinuityAuditV960(realQuality.scenes).phaseChanges} bestätigte Phasenwechsel.`
    :' Keine bestätigte Songanalyse – keine Hardware-Übergänge.'}</p>
  <h4>V961 · Govee Concert Light Governor</h4>
  <p className="settings-note">Optional, nur während laufender Wiedergabe mit bestätigter V318-Songphase und eingeschalteter Govee-Konzertsteuerung. Neue 100%-Lichtspitzen werden abgefedert; Verdunkelung erfolgt sofort. V912-Lichtshows, eigene V354-Regie und die Wiederverbindung einer Lampe behalten Vorrang. Kein neuer LAN-Timer, keine zusätzliche Bridge-Abfrage, keine Power- oder Stroboskopbefehle.</p>
  <h4>V962 · Intelligent Concert Narrative</h4>
  <p className="settings-note">Optional: Verse bleiben fokussiert, Hooks werden voller, Builds steigern sich bis zum Drop, Breaks und Outros werden ruhiger. Bestätigte V318-Songabschnitte sind Pflicht. Die Lichtkurve darf nur dimmen und überschreibt weder V912-Lichtshows noch manuelle V354-Cues. Keine neuen LAN-Timer oder zusätzlichen Lichtkommandos.</p>
  <h4>V948 · Professional Timeline Studio</h4>
  <p className="settings-note">Zusätzliche manuelle Cues für den aktuellen Song. Keine automatische Änderung von V354 oder gespeicherten V912-Shows.</p>
  <div className="govee-v958-settings"><label>Kamera <select value={camera} onChange={e=>setCamera(e.target.value as ConcertCameraV940)}>{cameraOptions.map(v=><option key={v}>{v}</option>)}</select></label>
   <label>Tanz <select value={formation} onChange={e=>setFormation(e.target.value as ConcertDanceV941)}>{formationOptions.map(v=><option key={v}>{v}</option>)}</select></label>
   <label>Virtueller Effekt <select value={effect} onChange={e=>setEffect(e.target.value as ConcertFxV955)}>{fxOptions.map(v=><option key={v}>{v}</option>)}</select></label>
   <button type="button" disabled={!track?.id} onClick={addTimeline}>Cue an Vorschauposition speichern</button>
  </div>
  <p className="settings-note">{track?.id?`${settings.timeline[track.id]?.length||0} manuelle Cues für diesen Track gespeichert`:'Kein aktueller Song – Timeline-Eingabe gesperrt'}.</p>
  {track?.id&&(settings.timeline[track.id]||[]).length>0&&<div className="govee-v958-cues" aria-label="Gespeicherte Konzert-Cues">
   {(settings.timeline[track.id]||[]).map((cue,index)=><div key={`${cue.atMs}-${index}`} className="govee-v958-cue">
    <label>Start in Sekunden <input type="number" min={0} max={Math.floor(duration/1000)} value={Math.round(cue.atMs/1000)}
      onChange={e=>changeTimeline(index,{atMs:Math.round(Number(e.target.value)*1000)})}/></label>
    <label>Phase <select value={cue.phase} onChange={e=>changeTimeline(index,{phase:e.target.value as ConcertPhaseV958})}>
      {phaseOptions.map(v=><option key={v}>{v}</option>)}</select></label>
    <label>Kamera <select value={cue.camera||'wide'} onChange={e=>changeTimeline(index,{camera:e.target.value as ConcertCameraV940})}>
      {cameraOptions.map(v=><option key={v}>{v}</option>)}</select></label>
    <label>Formation <select value={cue.formation||'sync'} onChange={e=>changeTimeline(index,{formation:e.target.value as ConcertDanceV941})}>
      {formationOptions.map(v=><option key={v}>{v}</option>)}</select></label>
    <button type="button" onClick={()=>deleteTimeline(index)}>Cue entfernen</button>
   </div>)}
  </div>}
  <h4>V935 / V936 · Geräte-Rollen und Raumaufstellungen</h4>
  <div className="govee-v958-roles">{config.selectedIps.map((ip,index)=>{
   const model=devices.find(d=>d.ip===ip)?.sku||'Leuchte';
   return <label key={ip}>{model} · Leuchte {index+1}<select value={settings.roleOverrides[ip]||roles[index%roles.length]}
    onChange={e=>save({roleOverrides:{...settings.roleOverrides,[ip]:e.target.value as ConcertRoleV935}})}>
    {roles.map(role=><option key={role} value={role}>{role}</option>)}</select>
    {calibration&&<small>V932: optisch {latencyAnalysisV932(calibration.fixtures[ip]?.visualDelayMs??0,calibration.fixtures[ip]?.statusRoundtripMs??null).opticalMs} ms · Netzwerkdiagnose {calibration.fixtures[ip]?.statusRoundtripMs??'–'} ms</small>}
   </label>;})}</div>
  <div className="govee-v958-settings">
   <label>Presetname <input value={presetName} maxLength={40} onChange={e=>setPresetName(e.target.value)}/></label>
   <button type="button" disabled={!config.selectedIps.length} onClick={addPreset}>Aktuelle Raumaufstellung speichern</button>
   <select aria-label="Gespeichertes Raumpreset" value={selectedPreset} onChange={e=>setSelectedPreset(e.target.value)}><option value="">Preset wählen</option>
    {settings.presets.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select>
   <button type="button" disabled={!selectedPreset} onClick={applyPreset}>Gewähltes Preset anwenden</button>
  </div>
  <h4>V933 · Live Light Signal Monitor</h4>
  {!signals.length?<p className="settings-note">Noch kein V958-Lichtbefehl gesendet. Die Anzeige verwendet nur bestehende Versandereignisse.</p>
   :<div className="govee-v958-signals" aria-live="polite">{signals.map(item=><div key={item.fixture}>
    Leuchte {item.fixture}: {item.phase} · {item.cue} · {item.brightness}% · Songzeit {Math.round(item.atMs/1000)}s
   </div>)}</div>}
  <small>Nur erfolgreiche Bridge-HTTP-Antworten, keine Garantie sichtbarer LED-Reaktion und keine zusätzlichen Statusabfragen.</small>
  {notice&&<p className="settings-note" role="status">{notice}</p>}
  <p className="settings-note">V930: kontrollierter Wiederverbindungs-Backoff · V931: eigener Build-Gate · V934: sichere virtuelle Ruheszene · V937: Prioritätsmixer ohne Show-Überschreibung · V949–V955: ausschließlich virtuelle FX · V956: Finale nur bei bestätigtem Songende · V958: ein gemeinsamer Composer.</p>
 </section>;
}
