'use client';
import {useEffect,useMemo,useState} from 'react';
import {useMusic} from '@/context/MusicContext';
import type {GoveeConfigV909,GoveeDeviceV909} from '@/lib/goveeLanV909';
import {DEFAULT_GOVEE_SPATIAL_V926,GOVEE_SPATIAL_DIRECTIONS_V926,GOVEE_SPATIAL_KEY_V926,GOVEE_SPATIAL_EVENT_V926,
 loadGoveeSpatialV926,saveGoveeSpatialV926,normalizeGoveeSpatialV926,
 defaultGoveeSpatialPointV926,previewGoveeSpatialV926,resolveGoveeSpatialOrderV926,
 type GoveeSpatialSettingsV926,type GoveeSpatialDirectionV926} from '@/lib/goveeSpatialDirectorV926';

const names:Record<GoveeSpatialDirectionV926,string>={
 'left-right':'Links → rechts','right-left':'Rechts → links',
 'stage-audience':'Bühne → Publikum','audience-stage':'Publikum → Bühne',
 clockwise:'Im Uhrzeigersinn',counterclockwise:'Gegen den Uhrzeigersinn',
};
const layoutNames:{id:'corners'|'stage'|'circle';label:string}[]=[
 {id:'corners',label:'Vier Ecken'},{id:'stage',label:'Bühne → Publikum'},{id:'circle',label:'Kreis im Raum'},
];
type LayoutName=typeof layoutNames[number]['id'];
export function GoveeSpatialStudioV926({config,devices}:{config:GoveeConfigV909;devices:GoveeDeviceV909[]}){
 const {genre}=useMusic();
 const [saved,setSaved]=useState<GoveeSpatialSettingsV926>(DEFAULT_GOVEE_SPATIAL_V926);
 const [draft,setDraft]=useState<GoveeSpatialSettingsV926>(DEFAULT_GOVEE_SPATIAL_V926);
 const [selected,setSelected]=useState('');
 const [progress,setProgress]=useState(3200);
 const [previewGenre,setPreviewGenre]=useState('Hardstyle');
 const [notice,setNotice]=useState('');
 const ips=config.selectedIps;
 useEffect(()=>{
  const read=()=>{const current=loadGoveeSpatialV926();setSaved(current);setDraft(current);};
  const storage=(e:StorageEvent)=>{if(!e.key||e.key===GOVEE_SPATIAL_KEY_V926)read();};
  read();window.addEventListener(GOVEE_SPATIAL_EVENT_V926,read);window.addEventListener('storage',storage);
  return()=>{window.removeEventListener(GOVEE_SPATIAL_EVENT_V926,read);window.removeEventListener('storage',storage);};
 },[]);
 useEffect(()=>{if(!ips.includes(selected))setSelected(ips[0]??'');},[ips,selected]);
 const dirty=JSON.stringify(normalizeGoveeSpatialV926(draft))!==JSON.stringify(normalizeGoveeSpatialV926(saved));
 const change=(patch:Partial<GoveeSpatialSettingsV926>)=>{setDraft(prev=>normalizeGoveeSpatialV926({...prev,...patch}));setNotice('');};
 const positionFor=(ip:string)=>draft.positions[ip]??defaultGoveeSpatialPointV926(ips.indexOf(ip),ips.length);
 const changePoint=(axis:'x'|'y',v:number)=>{
  if(!selected)return;
  const previous=positionFor(selected);
  change({positions:{...draft.positions,[selected]:{...previous,[axis]:Math.max(0,Math.min(1,v))}}});
 };
 const applyLayout=(layout:LayoutName)=>{
  const positions={...draft.positions};
  ips.forEach((ip,i)=>{
   const n=Math.max(1,ips.length),angle=2*Math.PI*i/n;
   positions[ip]=layout==='corners'?defaultGoveeSpatialPointV926(i,n):
    layout==='stage'?{x:Math.round((.1+.8*(n===1?.5:i/(n-1)))*1000)/1000,y:i%2===0?.16:.84}:
    {x:Math.round((.5+.37*Math.sin(angle))*1000)/1000,y:Math.round((.5-.37*Math.cos(angle))*1000)/1000};
  });
  change({positions});
 };
 const order=useMemo(()=>resolveGoveeSpatialOrderV926(ips,draft),[ips,draft]);
 const preview=useMemo(()=>previewGoveeSpatialV926(ips,draft,progress,previewGenre,config.masterBrightness),
  [ips,draft,progress,previewGenre,config.masterBrightness]);
 const save=()=>{try{saveGoveeSpatialV926(draft);setNotice('Raumpositionen gespeichert. Live-Wellen ändern sich erst bei aktivierter V926-Regie.');}catch{
  setNotice('Speichern fehlgeschlagen (z. B. Browser-Speicher voll).');}};
 const revert=()=>{setDraft(saved);setNotice('Nicht gespeicherte Änderungen zurückgesetzt.');};
 return <section className="govee-v909-panel govee-v926" aria-label="V926 Smart Spatial Light Director">
  <h3>V926 · Smart Spatial Light Director</h3>
  <p className="settings-note">Ordne deine Govee-Leuchten so an, wie sie tatsächlich im Zimmer stehen. V922-Schockwellen, V923-Neonbewegungen und V925-Festivaleffekte können dadurch der <strong>räumlichen Reihenfolge</strong> statt der Geräteliste folgen. Zusätzlich gibt es eine langsame, sanfte Raumwelle. Keine GPS-Abfrage, kein LAN-Befehl aus dieser Vorschau.</p>
  <label className="setting-check"><input type="checkbox" checked={draft.enabled} onChange={e=>change({enabled:e.target.checked})}/>
   Räumliche Lichtregie aktivieren (benötigt Govee-Musiksynchronisierung)</label>
  <div className="govee-v909-grid">
   <label>Wellenrichtung<select value={draft.direction} onChange={e=>change({direction:e.target.value as GoveeSpatialDirectionV926})}>
    {GOVEE_SPATIAL_DIRECTIONS_V926.map(v=><option key={v} value={v}>{names[v]}</option>)}
   </select></label>
   <label>Räumliche Akzentstärke ({draft.strength} %)<input type="range" min={0} max={100} step={5} value={draft.strength} onChange={e=>change({strength:Number(e.target.value)})}/></label>
   <label>Farbmischung ({draft.colorMixPercent} %)<input type="range" min={0} max={30} step={1} value={draft.colorMixPercent} onChange={e=>change({colorMixPercent:Number(e.target.value)})}/></label>
   <label>Maximale Zusatzhelligkeit (+{draft.maxBoostPoints} Punkte)<input type="range" min={0} max={8} step={1} value={draft.maxBoostPoints} onChange={e=>change({maxBoostPoints:Number(e.target.value)})}/></label>
   <label>Wellenperiode ({(draft.periodMs/1000).toFixed(1)} s)<input type="range" min={3500} max={16000} step={500} value={draft.periodMs} onChange={e=>change({periodMs:Number(e.target.value)})}/></label>
  </div>
  <h4>Raumplan · Bühne oben, Publikum unten</h4>
  <div className="govee-v926-presets" aria-label="Raumaufstellung Vorlagen">{layoutNames.map(p=><button type="button" key={p.id} onClick={()=>applyLayout(p.id)} disabled={!ips.length}>{p.label}</button>)}</div>
  {ips.length===0?<p className="settings-note">Bitte zuerst oben mindestens eine Govee-Leuchte auswählen, damit du sie im Raum platzieren kannst.</p>:
   <>
    <div className="govee-v926-room" aria-label="Raumplan mit Gerätepositionen">
     <div className="govee-v926-stage">BÜHNE</div>
     {preview.map((item,i)=>{
      const device=devices.find(d=>d.ip===item.ip);
      const name=device?.name||device?.sku||item.ip;
      return <button type="button" key={item.ip} className={`govee-v926-pin${selected===item.ip?' selected':''}`}
       aria-label={`${name} an Position ${Math.round(item.position.x*100)} Prozent X, ${Math.round(item.position.y*100)} Prozent Y auswählen`}
       aria-pressed={selected===item.ip} title={`${name} · ${item.ip} · Schritt ${item.rank+1}`}
       onClick={()=>setSelected(item.ip)}
       style={{left:`${item.position.x*100}%`,top:`${item.position.y*100}%`,
        backgroundColor:`rgb(${item.look.color.r},${item.look.color.g},${item.look.color.b})`,opacity:.5+.5*item.look.brightness/100}}>
        {item.rank+1}
       </button>;
     })}
     <div className="govee-v926-audience">PUBLIKUM</div>
    </div>
    <div className="govee-v909-grid">
     <label>Leuchte positionieren<select value={ips.includes(selected)?selected:ips[0]} onChange={e=>setSelected(e.target.value)}>
      {ips.map(ip=>{const device=devices.find(d=>d.ip===ip);return <option key={ip} value={ip}>{device?.name||device?.sku||ip} · {ip}</option>;})}
     </select></label>
     {selected&&ips.includes(selected)&&<>
      <label>Links ↔ rechts ({Math.round(positionFor(selected).x*100)} %)<input type="range" min={0} max={100} step={1} value={Math.round(positionFor(selected).x*100)} onChange={e=>changePoint('x',Number(e.target.value)/100)}/></label>
      <label>Bühne ↔ Publikum ({Math.round(positionFor(selected).y*100)} %)<input type="range" min={0} max={100} step={1} value={Math.round(positionFor(selected).y*100)} onChange={e=>changePoint('y',Number(e.target.value)/100)}/></label>
     </>}
    </div>
    <p className="settings-note">Wellenverlauf: {order.map((ip,i)=>`${i+1}. ${devices.find(d=>d.ip===ip)?.name||devices.find(d=>d.ip===ip)?.sku||ip}`).join(' → ')}.</p>
   </>}
  <h4>Raumwellen-Vorschau · keine LAN-Befehle</h4>
  <div className="govee-v909-grid">
   <label>Vorschau-Genre<select value={previewGenre} onChange={e=>setPreviewGenre(e.target.value)}>{['Deutschrap','Hardtekk','Hardstyle','Deutschrock'].map(g=><option key={g}>{g}</option>)}</select></label>
   <label>Simulierte Songzeit ({(progress/1000).toFixed(1)} s)<input type="range" min={0} max={16000} step={250} value={progress} onChange={e=>setProgress(Number(e.target.value))}/></label>
  </div>
  <div className="govee-v925-fixtures" aria-label="Simulierte Raumwelle für ausgewählte Leuchten">
   {preview.map(item=><div className="govee-v925-fixture" key={item.ip}>
    <div className="govee-v925-light" style={{backgroundColor:`rgb(${item.look.color.r},${item.look.color.g},${item.look.color.b})`,opacity:.24+.76*item.look.brightness/100}}/>
    <strong>{devices.find(d=>d.ip===item.ip)?.sku||item.ip}</strong><small>Position {item.rank+1} · {item.look.brightness}%</small>
   </div>)}
  </div>
  <div className="govee-v909-actions">
   <button type="button" disabled={!dirty} onClick={save}>Raumaufstellung speichern</button>
   <button type="button" disabled={!dirty} onClick={revert}>Änderungen verwerfen</button>
  </div>
  <p className="settings-note" role="status">{notice||(dirty?'Noch nicht gespeichert – Live-Lichter bleiben unverändert.':`Gespeichert · Live-Status: ${config.enabled&&config.autoSync&&saved.enabled?'aktiv':'aus'}`)}</p>
  <p className="settings-note"><strong>Hinweis:</strong> Raumpositionen sind manuell eingestellte relative X/Y-Werte, keine vermessenen Distanzen. Kreis- und Wellenbewegungen erfolgen über <strong>ganze Leuchten</strong>, nicht über einzelne LED-Segmente. Keine automatische Netzwerksuche, kein Stroboskop, keine zusätzlichen LAN-Timer. Die V915-Gruppendimmung wird weiterhin zuletzt angewendet. Aktuelles Musikgenre: {String(genre??'nicht erkannt')}.</p>
 </section>;
}
