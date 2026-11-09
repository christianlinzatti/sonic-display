'use client';
/** V1142: explicit, bounded dashboard actions; no background LAN poll. */
import {useCallback,useEffect,useState} from 'react';
import {GOVEE_CONFIG_EVENT_V909,GOVEE_CONFIG_KEY_V909,loadGoveeConfigV909,
 saveGoveeConfigV909,goveeBridgeRequestV909,type GoveeConfigV909,type GoveeDeviceV909} from '@/lib/goveeLanV909';
import {GOVEE_GROUPS_EVENT_V915} from '@/lib/goveeDeviceGroupsV915';
import {sendGoveePowerV1138,canExecuteGoveePowerV1138} from '@/lib/goveePowerV1138';
import {sendTargetedGoveePowerV1141} from '@/lib/goveePowerRoutingV1141';
import {readGoveeStatusV1140,type GoveeConfirmedStatusV1140} from '@/lib/goveeLiveStatusV1140';

type Scene='hardtekk'|'calm'|'night';
const looks:Record<Scene,{label:string;brightness:number;color:{r:number;g:number;b:number}}>={
 hardtekk:{label:'Hardtekk',brightness:70,color:{r:12,g:125,b:255}},
 calm:{label:'Entspannen',brightness:35,color:{r:240,g:125,b:45}},
 night:{label:'Nacht',brightness:12,color:{r:100,g:20,b:28}}
};
export function GoveeLightDashboardV1142({onActivity}:{onActivity?:()=>void}={}){
 const [config,setConfig]=useState<GoveeConfigV909|null>(null);
 const [names,setNames]=useState<Record<string,string>>({});
 const [statuses,setStatuses]=useState<Record<string,GoveeConfirmedStatusV1140>>({});
 const [busy,setBusy]=useState(false);
 const [notice,setNotice]=useState('Status noch nicht geprüft.');
 const [brightness,setBrightness]=useState(65);
 useEffect(()=>{
  const refresh=()=>{const cfg=loadGoveeConfigV909();setConfig(cfg);setBrightness(cfg.masterBrightness);};
  const onStorage=(event:StorageEvent)=>{if(!event.key||event.key===GOVEE_CONFIG_KEY_V909)refresh();};
  refresh();window.addEventListener(GOVEE_CONFIG_EVENT_V909,refresh);window.addEventListener(GOVEE_GROUPS_EVENT_V915,refresh);
  window.addEventListener('storage',onStorage);
  return()=>{window.removeEventListener(GOVEE_CONFIG_EVENT_V909,refresh);window.removeEventListener(GOVEE_GROUPS_EVENT_V915,refresh);
   window.removeEventListener('storage',onStorage);};
 },[]);
 const configured=Boolean(config&&canExecuteGoveePowerV1138(config));
 const markUnknown=()=>setStatuses({});
 const operation=async(fn:()=>Promise<string>)=>{
  if(busy)return;setBusy(true);onActivity?.();
  try{setNotice(await fn());}
  catch(e){setNotice(e instanceof Error?e.message:'Govee-LAN-Aufruf fehlgeschlagen.');}
  finally{setBusy(false);}
 };
 const readStatus=useCallback(async()=>{
  const cfg=loadGoveeConfigV909();
  if(!canExecuteGoveePowerV1138(cfg))throw Error('Zuerst Govee LAN und Leuchten konfigurieren.');
  const inventory=await goveeBridgeRequestV909<{devices:GoveeDeviceV909[]}>(cfg,'/devices');
  setNames(Object.fromEntries(inventory.devices.filter(d=>cfg.selectedIps.includes(d.ip)).map(d=>[d.ip,d.name?.trim()||d.sku||d.ip])));
  const next:Record<string,GoveeConfirmedStatusV1140>={};
  for(const ip of cfg.selectedIps.slice(0,32)){
   try{next[ip]=await readGoveeStatusV1140(cfg,ip);}
   catch{next[ip]={ip,name:ip,online:false,confirmed:false,on:null,brightness:null};}
  }
  setStatuses(next);
  const verified=Object.values(next).filter(v=>v.confirmed);
  return `Status abgefragt: ${verified.length} von ${cfg.selectedIps.length} Geräten mit frischer Statusantwort; ${verified.filter(v=>v.on).length} davon eingeschaltet.`;
 },[]);
 const all=async(on:boolean)=>{const result=await sendGoveePowerV1138(on);markUnknown();return result;};
 const one=async(index:number,on:boolean)=>{const result=await sendTargetedGoveePowerV1141(on,{fixtureNumber:index+1});markUnknown();return result;};
 const manual=async(action:'brightness'|'look',value:number|{color:{r:number;g:number;b:number};brightness:number})=>{
  const cfg=loadGoveeConfigV909();
  if(!canExecuteGoveePowerV1138(cfg))throw Error('Bridge oder Lampenauswahl fehlen.');
  // Exact selected lamps, no inferred all-home access; manual actions override music sync.
  saveGoveeConfigV909({...cfg,autoSync:false,...(action==='brightness'?{masterBrightness:Number(value)}:{})});
  let sent=0;
  for(const ip of cfg.selectedIps){
   const current=loadGoveeConfigV909();
   if(!canExecuteGoveePowerV1138(current)||current.endpoint!==cfg.endpoint||current.token!==cfg.token||
    JSON.stringify(current.selectedIps)!==JSON.stringify(cfg.selectedIps))
    throw Error('Govee-Auswahl während des Befehls geändert.');
   await goveeBridgeRequestV909(cfg,'/devices/add','POST',{ip});
   await goveeBridgeRequestV909(cfg,'/command','POST',{ip,action,value});
   sent++;
  }
  markUnknown();
  return `Manuelles Lichtprogramm an ${sent} Leuchte(n) gesendet. Status noch unbestätigt.`;
 };
 const concert=async()=>{
  const cfg=loadGoveeConfigV909();
  if(!canExecuteGoveePowerV1138(cfg))throw Error('Govee-LAN-Konfiguration fehlt.');
  saveGoveeConfigV909({...cfg,autoSync:true});
  markUnknown();
  return 'Konzert: Musik-Lichtsynchronisation aktiviert. Sie steuert nur bei laufender Musik und geöffnetem Display; ausgeschaltete Lampen werden nicht eingeschaltet.';
 };
 return <section className="govee-v915" aria-label="Govee Lichtzentrale V1142">
  <h4>Govee · Lichtzentrale</h4>
  <p className="settings-note">Ausgewählte Leuchten einzeln steuern und ihren echten LAN-Status auf Knopfdruck prüfen. Keine automatische Statusabfrage im Hintergrund.</p>
  <div className="govee-v909-actions">
   <button type="button" disabled={!configured||busy} onClick={()=>void operation(()=>all(true))}>Alle EIN</button>
   <button type="button" disabled={!configured||busy} onClick={()=>void operation(()=>all(false))}>Alle AUS</button>
   <button type="button" disabled={!configured||busy} onClick={()=>void operation(readStatus)}>Status prüfen</button>
  </div>
  <div className="govee-v915-groups">
   {(config?.selectedIps||[]).slice(0,4).map((ip,index)=>{
    const status=statuses[ip];
    return <div className="govee-v915-card" key={ip}>
     <strong>{names[ip]||`Govee Lampe ${index+1}`}</strong>
     <small>{status?.confirmed?(status.on?'Bestätigt EIN':'Bestätigt AUS'):status?.online?'Online · Schaltzustand nicht bestätigt':'Status unbekannt / nicht erreichbar'}</small>
     <div className="govee-v909-actions">
      <button type="button" disabled={!configured||busy} onClick={()=>void operation(()=>one(index,true))}>EIN</button>
      <button type="button" disabled={!configured||busy} onClick={()=>void operation(()=>one(index,false))}>AUS</button>
     </div>
    </div>;
   })}
  </div>
  {(config?.selectedIps.length||0)>4&&<small>Weitere Leuchten können über „Alle EIN/AUS“ bedient werden; die Kacheln zeigen die ersten vier ausgewählten Geräte.</small>}
  <div className="govee-v958-settings" aria-label="Govee Favoriten">
   <button type="button" disabled={!configured||busy} onClick={()=>void operation(concert)}>Konzert · Musik-Sync</button>
   {(Object.keys(looks) as Scene[]).map(id=><button key={id} type="button" disabled={!configured||busy}
    onClick={()=>void operation(()=>manual('look',{color:looks[id].color,brightness:Math.min(looks[id].brightness,loadGoveeConfigV909().masterBrightness)}))}>{looks[id].label}</button>)}
  </div>
  <label>Helligkeit ({brightness} %)
   <input type="range" min={1} max={100} value={brightness} onChange={e=>setBrightness(Number(e.target.value))}/>
  </label>
  <button type="button" disabled={!configured||busy} onClick={()=>void operation(()=>manual('brightness',brightness))}>Helligkeit an ausgewählte Lampen senden</button>
  <p role="status" className="settings-note">{notice}</p>
  {!configured&&<p className="settings-note">Bitte unter Einstellungen → Govee LAN aktivieren, Bridge-Token eintragen und Lampen auswählen.</p>}
 </section>;
}
