'use client';
import {useEffect,useMemo,useState} from 'react';
import type {GoveeConfigV909,GoveeDeviceV909} from '@/lib/goveeLanV909';
import {resolveGoveeRoleV911,type GoveePhaseV911,type GoveeRoleV911} from '@/lib/goveeConcertDirectorV911';
import {GOVEE_PHASES_V912,colorToHexV912,type GoveeShowV912} from '@/lib/goveeLightShowV912';
import {GOVEE_PRESETS_V916,GOVEE_PRESET_FAVORITES_KEY_V916,GOVEE_PRESET_FAVORITES_EVENT_V916,
 getGoveePresetCueV916,getGoveePresetV916,recommendGoveePresetIdV916,
 applyGoveePresetToShowV916,createGoveePresetShowV916,
 loadGoveePresetFavoritesV916,saveGoveePresetFavoritesV916,
 type GoveePresetGenreV916,type GoveePresetTargetV916} from '@/lib/goveePresetLibraryV916';

type Props={config:GoveeConfigV909;devices:GoveeDeviceV909[];genre:string;draft:GoveeShowV912|null;count:number;
 onCreate:(show:GoveeShowV912)=>void;onApply:(show:GoveeShowV912,message:string)=>void};
const genreNames:Record<GoveePresetGenreV916,string>={deutschrap:'Deutschrap',hardtekk:'Hardtekk',hardstyle:'Hardstyle',deutschrock:'Deutschrock'};
const roleNames:Record<GoveeRoleV911,string>={wall:'Bühne',rhythm:'Rhythmus',neon:'Neon',ambient:'Ambient'};
const phaseNames:Record<GoveePhaseV911,string>={ambient:'Ambient',verse:'Verse',hook:'Hook',build:'Build-up',drop:'Drop',break:'Break'};
const sampleRoles:readonly {name:string;role:GoveeRoleV911}[]=[
 {name:'H6063',role:'wall'},{name:'H610B',role:'rhythm'},{name:'H61A2',role:'neon'},{name:'H6051',role:'ambient'}
];
const newShowId=()=>`preset_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,10)}`;

export function GoveePresetStudioV916({config,devices,genre,draft,count,onCreate,onApply}:Props){
 const [filter,setFilter]=useState<'all'|GoveePresetGenreV916>('all');
 const [favoritesOnly,setFavoritesOnly]=useState(false);
 const [favorites,setFavorites]=useState<string[]>([]);
 const [selectedId,setSelectedId]=useState('rap_nachtstadt');
 const [phase,setPhase]=useState<GoveePhaseV911>('hook');
 const [scope,setScope]=useState<'phase'|'all'>('all');
 const [notice,setNotice]=useState('Vorlagen sind Vorschauen. Deine Leuchten werden nicht direkt angesteuert.');
 useEffect(()=>{
  const refresh=()=>setFavorites(loadGoveePresetFavoritesV916());
  const onStorage=(event:StorageEvent)=>{if(event.key===GOVEE_PRESET_FAVORITES_KEY_V916||event.key===null)refresh();};
  refresh();window.addEventListener(GOVEE_PRESET_FAVORITES_EVENT_V916,refresh);window.addEventListener('storage',onStorage);
  return()=>{window.removeEventListener(GOVEE_PRESET_FAVORITES_EVENT_V916,refresh);window.removeEventListener('storage',onStorage);};
 },[]);
 const recommended=recommendGoveePresetIdV916(genre);
 const presets=useMemo(()=>GOVEE_PRESETS_V916.filter(p=>(filter==='all'||p.genre===filter)&&(!favoritesOnly||favorites.includes(p.id))),[filter,favoritesOnly,favorites]);
 const selected=getGoveePresetV916(selectedId)??GOVEE_PRESETS_V916[0];
 const targets=useMemo<GoveePresetTargetV916[]>(()=>config.selectedIps.map(ip=>({
  ip,role:resolveGoveeRoleV911(config.deviceRolesV911[ip],devices.find(d=>d.ip===ip)?.sku)
 })),[config.selectedIps,config.deviceRolesV911,devices]);
 const previewDevices=targets.length?targets.map(t=>({name:devices.find(d=>d.ip===t.ip)?.name||devices.find(d=>d.ip===t.ip)?.sku||t.ip,...t})):
  sampleRoles.map(d=>({...d,ip:''}));
 const favorite=()=>{
  try{const next=favorites.includes(selected.id)?favorites.filter(id=>id!==selected.id):[...favorites,selected.id];
   setFavorites(saveGoveePresetFavoritesV916(next));setNotice(favorites.includes(selected.id)?'Aus Favoriten entfernt.':'Als Favorit gespeichert.');}
  catch(error){setNotice(error instanceof Error?error.message:'Favorit konnte nicht gespeichert werden.');}
 };
 const create=()=>{
  if(!targets.length){setNotice('Bitte zuerst mindestens eine Govee-Leuchte auswählen.');return;}
  if(count>=12){setNotice('Die Show-Bibliothek ist voll. Maximal zwölf Shows sind erlaubt.');return;}
  const next=createGoveePresetShowV916(selected.id,targets,newShowId(),Date.now());
  if(!next){setNotice('Vorlage konnte nicht erstellt werden. Bitte Leuchten prüfen.');return;}
  onCreate(next);setNotice('Neue, vollständig bearbeitbare Lichtshow angelegt.');
 };
 const apply=()=>{
  if(!draft||!targets.length){setNotice('Bitte zuerst eine Show und mindestens eine Leuchte auswählen.');return;}
  const next=applyGoveePresetToShowV916(draft,selected.id,targets,scope,phase);
  onApply(next,`„${selected.name}“ für ${scope==='all'?'alle Songphasen':phaseNames[phase]} übernommen. Zum dauerhaften Speichern unten „Änderungen speichern“ auswählen.`);
  setNotice('Vorlage nur in den Entwurf übernommen – noch nicht gespeichert.');
 };
 return <section className="govee-v916" aria-label="V916 Smart Light Preset Library">
  <div className="govee-v916-heading"><div><h4>V916 · Smart Light Preset Library</h4>
   <p className="settings-note">Acht sorgfältig abgestimmte Konzertlooks. Eine Vorschau sendet <strong>keine</strong> LAN-Befehle.</p></div>
   <button type="button" onClick={()=>{setSelectedId(recommended);setFilter('all');setFavoritesOnly(false);}}>
    Genre-Vorschlag ansehen
   </button>
  </div>
  <div className="govee-v909-grid">
   <label>Genre auswählen<select aria-label="Lichtvorlagen nach Genre" value={filter} onChange={e=>setFilter(e.target.value as typeof filter)}>
    <option value="all">Alle Genres</option>{(Object.keys(genreNames) as GoveePresetGenreV916[]).map(g=><option key={g} value={g}>{genreNames[g]}</option>)}
   </select></label>
   <label className="setting-check"><input type="checkbox" checked={favoritesOnly} onChange={e=>setFavoritesOnly(e.target.checked)}/> Nur Favoriten</label>
  </div>
  <div className="govee-v916-catalog" aria-label="Verfügbare Konzertlicht-Vorlagen">
   {presets.map(p=><button type="button" key={p.id} className={`govee-v916-card ${selected.id===p.id?'govee-v916-selected':''}`}
     aria-pressed={selected.id===p.id} onClick={()=>setSelectedId(p.id)}>
     <span className="govee-v916-colors">{(['wall','rhythm','neon','ambient'] as const).map(role=><span key={role} style={{backgroundColor:p.palette[role]}}/>)}</span>
     <strong>{p.name}{favorites.includes(p.id)?' ★':''}</strong><small>{p.description}</small>
   </button>)}
   {!presets.length&&<p className="settings-note">Noch keine passenden Favoriten vorhanden. Deaktiviere „Nur Favoriten“, um Vorlagen auszuwählen.</p>}
  </div>
  <div className="govee-v916-detail">
   <div className="govee-v916-detail-title"><div><strong>{selected.name}</strong><p className="settings-note">{selected.description}</p></div>
    <button type="button" aria-pressed={favorites.includes(selected.id)} onClick={favorite}>{favorites.includes(selected.id)?'★ Favorit entfernen':'☆ Als Favorit'}</button>
   </div>
   <label>Vorschau der Songphase
    <select aria-label="V916 Songphase Vorschau" value={phase} onChange={e=>setPhase(e.target.value as GoveePhaseV911)}>
     {GOVEE_PHASES_V912.map(p=><option key={p} value={p}>{phaseNames[p]}</option>)}
    </select>
   </label>
   <div className="govee-v916-preview" aria-label="V916 Lichtvorschau für ausgewählte Phase">
    {previewDevices.map(d=>{
     const cue=getGoveePresetCueV916(selected.id,d.role,phase);
     return <div key={d.ip||d.name} className="govee-v916-fixture">
      <div className="govee-v916-light" style={{backgroundColor:cue?colorToHexV912(cue.color):'#333',opacity:cue?Math.max(.35,cue.brightness/100):.4}}/>
      <strong>{d.name}</strong><small>{roleNames[d.role]} · {cue?.brightness??0}% · {((cue?.fadeMs??3200)/1000).toFixed(1)} s</small>
     </div>;
    })}
   </div>
   {!targets.length&&<p className="settings-note">Beispielvorschau für die vier bekannten Modelle. Zum Erstellen oder Übernehmen bitte zuerst deine Leuchten auswählen.</p>}
   <div className="govee-v909-grid"><label>Vorlage in bestehende Show übernehmen
    <select aria-label="V916 Übernahmeumfang" value={scope} onChange={e=>setScope(e.target.value as 'phase'|'all')}>
     <option value="all">Alle sechs Songphasen</option><option value="phase">Nur {phaseNames[phase]}</option>
    </select></label></div>
   <div className="govee-v909-actions">
    <button type="button" onClick={create} disabled={!targets.length||count>=12}>Neue Show aus Vorlage erstellen</button>
    <button type="button" onClick={apply} disabled={!draft||!targets.length}>In aktuellen Entwurf übernehmen</button>
   </div>
   <p className="settings-note">Nur ausgewählte LAN-Leuchten werden berücksichtigt. Bestehende Shows bleiben erhalten, bis du Änderungen ausdrücklich speicherst. Die reale Beleuchtung wird ausschließlich über die separat aktivierte V911-Musiksteuerung ausgeführt.</p>
  </div>
  <p role="status" className="govee-v909-notice">{notice}</p>
 </section>;
}
