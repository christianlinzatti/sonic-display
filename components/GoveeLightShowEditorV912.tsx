'use client';
import {useEffect,useMemo,useState} from 'react';
import {GoveeColorHarmonyStudioV913} from '@/components/GoveeColorHarmonyStudioV913';
import {GoveePresetStudioV916} from '@/components/GoveePresetStudioV916';
import type {GoveeConfigV909,GoveeDeviceV909} from '@/lib/goveeLanV909';
import {resolveGoveeRoleV911,planGoveeConcertLookV911,type GoveePhaseV911} from '@/lib/goveeConcertDirectorV911';
import {GOVEE_PHASES_V912,GOVEE_SHOWS_EVENT_V912,GOVEE_SHOWS_KEY_V912,
 colorToHexV912,hexToGoveeColorV912,loadGoveeShowsV912,normalizeGoveeShowLibraryV912,
 getGoveeFadeMsV912,replaceGoveeShowCueV912,saveGoveeShowsV912,
 type GoveeShowCueV912,type GoveeShowV912} from '@/lib/goveeLightShowV912';
import {GOVEE_TRANSITION_CURVES_V914,GOVEE_MOTION_STYLES_V914,easeGoveeTransitionV914,planGoveeAdvancedShowLookV914,
 type GoveeTransitionCurveV914,type GoveeMotionStyleV914} from '@/lib/goveeTransitionsV914';

type Props={config:GoveeConfigV909;devices:GoveeDeviceV909[];genre:string;onConfig:(patch:Partial<GoveeConfigV909>)=>void};
const labels:Record<GoveePhaseV911,string>={ambient:'Ambient / ohne Songphase',verse:'Verse',hook:'Hook',build:'Build-up',drop:'Drop',break:'Break'};
const metrics={bass:0,beatStrength:0,energyEnvelope:.45,volume:.45};
const curveLabels:Record<GoveeTransitionCurveV914,string>={smooth:'Weich / Smoothstep',linear:'Gleichmäßig / Linear',sine:'Sanft / Sinus',
 'ease-in':'Langsam starten', 'ease-out':'Schnell starten',cinematic:'Filmischer Aufbau'};
const motionLabels:Record<GoveeMotionStyleV914,string>={steady:'Stabil',breath:'Langsames Atmen (9 s)',lift:'Sanfter Akzent beim Wechsel'};
const uniqueId=()=>`show_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,10)}`;

export function GoveeLightShowEditorV912({config,devices,genre,onConfig}:Props){
 const [shows,setShows]=useState<GoveeShowV912[]>([]);
 const [draft,setDraft]=useState<GoveeShowV912|null>(null);
 const [newName,setNewName]=useState('Meine Konzertshow');
 const [phase,setPhase]=useState<GoveePhaseV911>('verse');
 const [previewPrevious,setPreviewPrevious]=useState<GoveePhaseV911>('verse');
 const [previewProgress,setPreviewProgress]=useState(100);
 const [ip,setIp]=useState('');
 const [message,setMessage]=useState('Eigene Shows bleiben lokal im Browser gespeichert.');
 useEffect(()=>{
  const refresh=()=>setShows(loadGoveeShowsV912());
  const storage=(e:StorageEvent)=>{if(e.key===GOVEE_SHOWS_KEY_V912||e.key===null)refresh();};
  refresh();window.addEventListener(GOVEE_SHOWS_EVENT_V912,refresh);window.addEventListener('storage',storage);
  return ()=>{window.removeEventListener(GOVEE_SHOWS_EVENT_V912,refresh);window.removeEventListener('storage',storage);};
 },[]);
 useEffect(()=>{setDraft(shows.find(s=>s.id===config.selectedShowIdV912)??null);},[config.selectedShowIdV912,shows]);
 useEffect(()=>{if(!config.selectedIps.includes(ip))setIp(config.selectedIps[0]??'');},[ip,config.selectedIps]);
 const selected=useMemo(()=>shows.find(s=>s.id===config.selectedShowIdV912),[shows,config.selectedShowIdV912]);
 const saveLibrary=(all:GoveeShowV912[],success:string)=>{
  try{saveGoveeShowsV912(all);setMessage(success);return true;}
  catch(error){setMessage(error instanceof Error?error.message:'Speichern fehlgeschlagen.');return false;}
 };
 const baseCue=(deviceIp:string,section:GoveePhaseV911):GoveeShowCueV912=>{
  const d=devices.find(item=>item.ip===deviceIp);
  const role=resolveGoveeRoleV911(config.deviceRolesV911[deviceIp],d?.sku);
  const look=planGoveeConcertLookV911({genre,progressMs:8500,phase:{phase:section,previous:section,transition:1,verified:section!=='ambient'},
   role,metrics,microphoneActive:false,config});
  return {...look,fadeMs:3200,curveV914:'smooth',motionV914:'steady'};
 };
 const draftWithDevices=(source:GoveeShowV912,ips:string[])=>{
  let next=source;
  for(const deviceIp of ips){
   for(const section of GOVEE_PHASES_V912){
    if(!next.cues[deviceIp]?.[section])next=replaceGoveeShowCueV912(next,deviceIp,section,baseCue(deviceIp,section));
   }
  }
  return next;
 };
 const create=()=>{
  if(!config.selectedIps.length){setMessage('Zuerst mindestens eine Leuchte auswählen.');return;}
  if(shows.length>=12){setMessage('Maximal 12 Shows erlaubt.');return;}
  const name=newName.trim().slice(0,48);
  if(!name){setMessage('Bitte einen Namen eingeben.');return;}
  const now=Date.now();const fresh=draftWithDevices({schema:'govee-light-show-v912',id:uniqueId(),name,createdAt:now,updatedAt:now,cues:{}},config.selectedIps);
  if(saveLibrary([...shows,fresh],`„${name}“ erstellt. Du kannst die Farben jetzt bearbeiten.`))onConfig({selectedShowIdV912:fresh.id});
 };
 const persist=()=>{
  if(!draft)return;
  const next={...draft,name:draft.name.trim().slice(0,48),updatedAt:Date.now()};
  if(!next.name){setMessage('Show-Name darf nicht leer sein.');return;}
  saveLibrary(shows.map(s=>s.id===next.id?next:s),`„${next.name}“ gespeichert.`);
 };
 const duplicate=()=>{
  if(!draft||shows.length>=12){setMessage('Keine Show ausgewählt oder Bibliothek voll.');return;}
  const now=Date.now();const next={...draft,id:uniqueId(),name:(draft.name+' Kopie').slice(0,48),createdAt:now,updatedAt:now};
  if(saveLibrary([...shows,next],'Show kopiert.'))onConfig({selectedShowIdV912:next.id});
 };
 const remove=()=>{
  if(!draft||!window.confirm(`Lichtshow „${draft.name}“ wirklich löschen?`))return;
  const remaining=shows.filter(s=>s.id!==draft.id);
  if(saveLibrary(remaining,'Lichtshow gelöscht.'))onConfig({selectedShowIdV912:remaining[0]?.id??'',showEnabledV912:false});
 };
 const exportJson=()=>{
  if(!shows.length){setMessage('Keine Shows für den Export vorhanden.');return;}
  const url=URL.createObjectURL(new Blob([JSON.stringify({schema:'govee-light-library-v912',shows},null,2)],{type:'application/json'}));
  const link=document.createElement('a');link.href=url;link.download='sonic-govee-shows-v912.json';document.body.append(link);link.click();link.remove();
  window.setTimeout(()=>URL.revokeObjectURL(url),1500);
  setMessage('Lichtshows exportiert (ohne Bridge-Token).');
 };
 const importJson=async(file:File|undefined)=>{
  if(!file)return;
  if(file.size>256_000){setMessage('Importdatei ist zu groß (max. 256 KB).');return;}
  try{
   const raw:unknown=JSON.parse(await file.text());
   const value=raw&&typeof raw==='object'&&!Array.isArray(raw)?raw as Record<string,unknown>:{};
   if(value.schema!=='govee-light-library-v912'||!Array.isArray(value.shows)||value.shows.length>12)throw Error('Ungültiges Lichtshow-Format.');
   const imported=normalizeGoveeShowLibraryV912(value.shows);
   if(!imported.length||imported.length!==value.shows.length)throw Error('Import enthält ungültige Lichtshows.');
   if(saveLibrary(imported,`${imported.length} Lichtshow(s) importiert. Vor dem Aktivieren bitte Geräte-IP-Zuordnung prüfen.`)){
    onConfig({selectedShowIdV912:imported[0].id,showEnabledV912:false});
   }
  }catch(error){setMessage(error instanceof Error?error.message:'Import fehlgeschlagen.');}
 };
 const cue=ip&&draft?(draft.cues[ip]?.[phase]??baseCue(ip,phase)):null;
 const edit=(patch:Partial<GoveeShowCueV912>)=>{
  if(!draft||!ip||!cue)return;
  setDraft(replaceGoveeShowCueV912(draft,ip,phase,{...cue,...patch}));
 };
 const preview=(deviceIp:string)=>{
  const role=resolveGoveeRoleV911(config.deviceRolesV911[deviceIp],devices.find(d=>d.ip===deviceIp)?.sku);
  const common={genre,progressMs:8000,phase:{phase,previous:previewPrevious,transition:previewProgress/100,verified:phase!=='ambient'},role,config,metrics,microphoneActive:false};
  return draft?planGoveeAdvancedShowLookV914({...common,show:draft,ip:deviceIp}):planGoveeConcertLookV911(common);
 };
 return <section id="govee-v912-editor" className="govee-v912" aria-label="V912 Light Show Editor">
  <h3>V912 · Visual Govee Light Show Editor</h3>
  <p className="settings-note">Gestalte Farben, Helligkeit und Übergänge für jede ausgewählte Leuchte und Musikphase. <strong>Vorschau und Bearbeitung senden keine Befehle.</strong> Maximal 12 Shows; Speicherung in diesem Browser. V914 ermöglicht eigene Überblendungskurven und langsame Lichtbewegungen. Ein Wechsel des Geräts erfordert JSON-Export/-Import.</p>
  <div className="govee-v909-grid">
   <label>Gespeicherte Show
    <select aria-label="Gespeicherte Govee-Lichtshow" value={config.selectedShowIdV912} onChange={e=>onConfig({selectedShowIdV912:e.target.value,showEnabledV912:false})}>
     <option value="">Keine ausgewählt</option>{shows.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}
    </select>
   </label>
   <label>Name für neue Show<input type="text" maxLength={48} value={newName} onChange={e=>setNewName(e.target.value)}/></label>
  </div>
  <div className="govee-v909-actions">
   <button type="button" onClick={create} disabled={!config.selectedIps.length||shows.length>=12}>Neue Show erstellen</button>
   <button type="button" onClick={duplicate} disabled={!draft||shows.length>=12}>Duplizieren</button>
   <button type="button" onClick={remove} disabled={!draft}>Löschen</button>
   <button type="button" onClick={exportJson} disabled={!shows.length}>JSON exportieren</button>
   <label className="govee-v912-file">JSON importieren<input type="file" accept="application/json,.json" onChange={e=>{const f=e.target.files?.[0];void importJson(f);e.target.value='';}}/></label>
  </div>
  <GoveePresetStudioV916 config={config} devices={devices} genre={genre} draft={draft} count={shows.length}
   onCreate={next=>{if(saveLibrary([...shows,next],`„${next.name}“ aus V916-Vorlage erstellt.`))onConfig({selectedShowIdV912:next.id,showEnabledV912:false});}}
   onApply={(next,notice)=>{setDraft(next);setMessage(notice);}}/>
  {draft&&<>
   <div className="govee-v909-grid">
    <label>Show-Name<input type="text" maxLength={48} value={draft.name} onChange={e=>setDraft({...draft,name:e.target.value})}/></label>
    <label>Leuchte
     <select aria-label="Leuchte bearbeiten" value={ip} onChange={e=>setIp(e.target.value)}>{config.selectedIps.map(p=><option key={p} value={p}>{devices.find(d=>d.ip===p)?.sku||'Govee'} · {p}</option>)}</select>
    </label>
    <label>Songphase
     <select aria-label="Songphase bearbeiten" value={phase} onChange={e=>setPhase(e.target.value as GoveePhaseV911)}>{GOVEE_PHASES_V912.map(p=><option key={p} value={p}>{labels[p]}</option>)}</select>
    </label>
   </div>
   {ip&&cue&&<div className="govee-v912-controls">
     <label>RGB-Farbe<input type="color" aria-label="Show-Farbe" value={colorToHexV912(cue.color)} onChange={e=>edit({color:hexToGoveeColorV912(e.target.value)})}/></label>
     <label>Helligkeit ({cue.brightness} %)<input type="range" min="20" max="100" step="1" value={cue.brightness} onChange={e=>edit({brightness:Number(e.target.value)})}/></label>
     <label>Übergang ({(cue.fadeMs/1000).toFixed(1)} s)<input type="range" min="1200" max="12000" step="200" value={cue.fadeMs} onChange={e=>edit({fadeMs:Number(e.target.value)})}/></label>
     <label>V914 Übergangskurve
      <select aria-label="Govee Übergangskurve" value={cue.curveV914??'smooth'} onChange={e=>edit({curveV914:e.target.value as GoveeTransitionCurveV914})}>
       {GOVEE_TRANSITION_CURVES_V914.map(curve=><option key={curve} value={curve}>{curveLabels[curve]}</option>)}
      </select>
     </label>
     <label>V914 Lichtbewegung
      <select aria-label="Govee Lichtbewegung" value={cue.motionV914??'steady'} onChange={e=>edit({motionV914:e.target.value as GoveeMotionStyleV914})}>
       {GOVEE_MOTION_STYLES_V914.map(style=><option key={style} value={style}>{motionLabels[style]}</option>)}
      </select>
     </label>
   </div>}
   {ip&&cue&&<div className="govee-v914" aria-label="V914 Advanced Light Transitions">
    <div className="govee-v914-head"><h4>V914 · Advanced Light Transitions</h4><span>Nur Vorschau · keine LAN-Befehle</span></div>
    <p className="settings-note">Sechs Übergangskurven und zwei besonders sanfte Helligkeitsbewegungen. Die Kurve gilt beim Wechsel <strong>in</strong> die aktuell ausgewählte Phase. Ein alter Entwurf bleibt bis „Änderungen speichern“ unverändert.</p>
    <svg viewBox="0 0 340 110" role="img" aria-label={`Helligkeitsverlauf: ${curveLabels[cue.curveV914??'smooth']}`} className="govee-v914-chart">
     <path d="M16 8 V94 H324" stroke="currentColor" strokeOpacity=".45" strokeWidth="1.5" fill="none"/>
     <path d={'M'+Array.from({length:81},(_,i)=>{
      const t=i/80;return `${(16+t*308).toFixed(2)},${(94-easeGoveeTransitionV914(t,cue.curveV914??'smooth')*80).toFixed(2)}`;
     }).join(' L')} fill="none" stroke="#70d9fd" strokeWidth="3" strokeLinecap="round"/>
     <circle cx={16+previewProgress/100*308} cy={94-easeGoveeTransitionV914(previewProgress/100,cue.curveV914??'smooth')*80} r="5" fill="#ffd277"/>
     <text x="16" y="106" fill="currentColor" fontSize="10">Start</text><text x="292" y="106" fill="currentColor" fontSize="10">Ende</text>
    </svg>
    <div className="govee-v909-actions">
     <button type="button" onClick={()=>edit({fadeMs:7000,curveV914:'sine',motionV914:'breath'})}>Sanfte Atmosphäre</button>
     <button type="button" onClick={()=>edit({fadeMs:5200,curveV914:'cinematic',motionV914:'lift'})}>Filmischer Aufbau</button>
     <button type="button" onClick={()=>edit({fadeMs:1800,curveV914:'ease-out',motionV914:'steady'})}>Schneller Akzent</button>
    </div>
   </div>}
   <GoveeColorHarmonyStudioV913 config={config} devices={devices} genre={genre} phase={phase} draft={draft}
    onApply={(next,text)=>{setDraft(next);setMessage(text);}}/>
   <div className="govee-v909-actions">
    <button type="button" onClick={()=>setDraft(draftWithDevices(draft,config.selectedIps))}>Neu ausgewählte Leuchten ergänzen</button>
    <button type="button" onClick={persist} className="govee-v912-save">Änderungen speichern</button>
    <button type="button" onClick={()=>setDraft(selected??null)}>Änderungen verwerfen</button>
   </div>
   <div className="govee-v909-grid">
    <label>Vorschau-Übergang von
     <select aria-label="Übergang von Phase" value={previewPrevious} onChange={e=>setPreviewPrevious(e.target.value as GoveePhaseV911)}>{GOVEE_PHASES_V912.map(p=><option key={p} value={p}>{labels[p]}</option>)}</select>
    </label>
    <label>Vorschau-Übergang ({previewProgress} %)
     <input aria-label="Vorschau Fortschritt" type="range" min="0" max="100" value={previewProgress} onChange={e=>setPreviewProgress(Number(e.target.value))}/>
    </label>
   </div>
   <p className="settings-note">Die Vorschau simuliert die Überblendung von der ausgewählten vorherigen Phase zur oben gewählten Songphase (0–100 %). Der reale Verlauf hängt von den bestätigten Songphasen und der gewählten Kurve ab; die LAN-Bridge arbeitet in begrenzten Schritten und kann deshalb zeitlich verzögert reagieren.</p>
   <div className="govee-v912-preview" aria-label="Govee Lichtshow Farb- und Helligkeitsvorschau">
    {config.selectedIps.map(p=>{
     const look=preview(p);const found=devices.find(d=>d.ip===p);
     return <div key={p} className="govee-v912-preview-card">
      <strong>{found?.name||found?.sku||p}</strong>
      <span className="govee-v912-swatch" style={{backgroundColor:`rgb(${look.color.r},${look.color.g},${look.color.b})`,opacity:Math.max(.3,look.brightness/100)}} aria-label={`RGB ${look.color.r}, ${look.color.g}, ${look.color.b}`}/>
      <small>{p} · {look.brightness}% · {getGoveeFadeMsV912(draft,p,phase)/1000}s</small>
     </div>;
    })}
   </div>
  </>}
  {!config.selectedIps.length&&<p className="settings-note">Bitte zuerst oben Leuchten auswählen, bevor du eine Show erstellst.</p>}
  <label className="setting-check"><input type="checkbox" checked={config.showEnabledV912} disabled={!selected||!config.directorEnabledV911} onChange={e=>onConfig({showEnabledV912:e.target.checked})}/> Gespeicherte V912-Lichtshow bei aktiver V911-Regie verwenden</label>
  <p className="settings-note">Die Musikautomatik benötigt zusätzlich „Govee aktivieren“ und „Zur Musik synchronisieren“. Nur bestätigte Songabschnitte nutzen Verse/Hook/Build/Drop/Break; sonst wird ausschließlich Ambient gespielt. Helligkeit bleibt durch den globalen Regler begrenzt. Die Bridge sendet nur ganze RGB-Leuchten, keine RGBIC-Einzelsegmente.</p>
  <p role="status" className="govee-v909-notice">{message}</p>
 </section>;
}
