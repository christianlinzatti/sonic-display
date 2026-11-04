'use client';
import {useEffect,useMemo,useState} from 'react';
import {goveeBridgeRequestV909,type GoveeConfigV909,type GoveeDeviceV909} from '@/lib/goveeLanV909';
import {DEFAULT_GOVEE_CALIBRATION_V927,GOVEE_CALIBRATION_KEY_V927,GOVEE_CALIBRATION_EVENT_V927,
 loadGoveeCalibrationV927,saveGoveeCalibrationV927,normalizeGoveeCalibrationV927,
 setGoveeVisualDelayV927,recordGoveeStatusRoundtripV927,previewGoveeCalibrationV927,
 type GoveeRoomCalibrationV927} from '@/lib/goveeRoomCalibrationV927';

/** No automatic measurement, no lamp flashing, no new bridge endpoints.
 * Network diagnostics only upon deliberate click, and only while auto-sync is off.
 */
export function GoveeRoomCalibrationStudioV927({config,devices}:{config:GoveeConfigV909;devices:GoveeDeviceV909[]}){
 const [saved,setSaved]=useState<GoveeRoomCalibrationV927>(DEFAULT_GOVEE_CALIBRATION_V927);
 const [draft,setDraft]=useState<GoveeRoomCalibrationV927>(DEFAULT_GOVEE_CALIBRATION_V927);
 const [selected,setSelected]=useState('');
 const [progress,setProgress]=useState(5000);
 const [busy,setBusy]=useState(false);
 const [notice,setNotice]=useState('');
 const ips=config.selectedIps;
 useEffect(()=>{
  const read=()=>{const s=loadGoveeCalibrationV927();setSaved(s);setDraft(s);};
  const storage=(event:StorageEvent)=>{if(!event.key||event.key===GOVEE_CALIBRATION_KEY_V927)read();};
  read();window.addEventListener(GOVEE_CALIBRATION_EVENT_V927,read);window.addEventListener('storage',storage);
  return()=>{window.removeEventListener(GOVEE_CALIBRATION_EVENT_V927,read);window.removeEventListener('storage',storage);};
 },[]);
 useEffect(()=>{if(!ips.includes(selected))setSelected(ips[0]??'');},[ips,selected]);
 const dirty=JSON.stringify(normalizeGoveeCalibrationV927(draft))!==JSON.stringify(normalizeGoveeCalibrationV927(saved));
 const change=(patch:Partial<GoveeRoomCalibrationV927>)=>{setDraft(previous=>normalizeGoveeCalibrationV927({...previous,...patch}));setNotice('');};
 const preview=useMemo(()=>previewGoveeCalibrationV927(ips,draft,progress),[ips,draft,progress]);
 const delay=draft.fixtures[selected]?.visualDelayMs??0;
 const probe=async()=>{
  if(!selected||!ips.includes(selected)||config.autoSync||!config.token.trim()||busy)return;
  setBusy(true);setNotice('Lese den Gerätestatus dreimal über die lokale Bridge …');
  try{
   const times:number[]=[];
   // /status performs a fixed ~350 ms wait on the bridge. The reply is NOT
   // a guarantee of a fresh UDP answer, much less a visible LED transition.
   for(let i=0;i<3;i++){
    const started=performance.now();
    await goveeBridgeRequestV909<{device:GoveeDeviceV909}>(config,'/status','POST',{ip:selected});
    times.push(Math.round(performance.now()-started));
   }
   setDraft(previous=>recordGoveeStatusRoundtripV927(previous,selected,times,Date.now()));
   setNotice(`Diagnose: ${times.join(' / ')} ms inklusive der festen Bridge-Wartezeit. Die sichtbare Lampenlatenz musst du selbst abgleichen. Noch nicht gespeichert.`);
  }catch(error){setNotice('Statusabfrage fehlgeschlagen: '+(error instanceof Error?error.message:String(error)));}
  finally{setBusy(false);}
 };
 const save=()=>{
  try{saveGoveeCalibrationV927(draft);setSaved(normalizeGoveeCalibrationV927(draft));
   setNotice('Kalibrierung gespeichert. Wirkt nur bei aktivierter V927 und laufender Govee-Musiksynchronisierung.');}
  catch{setNotice('Speichern fehlgeschlagen; Browser-Speicher prüfen.');}
 };
 const revert=()=>{setDraft(saved);setNotice('Nicht gespeicherte Änderungen verworfen.');};
 const current=preview.find(item=>item.ip===selected);
 return <section id="govee-v927-calibration" className="govee-v909-panel govee-v927" aria-label="V927 Intelligent Room Light Calibration">
  <h3>V927 · Intelligent Room Light Calibration</h3>
  <p className="settings-note">Individuelle <strong>sichtbare Verzögerung</strong> deiner Govee-Leuchten ausgleichen. Die manuell gewählten Millisekunden verschieben vorhandene V922-Schockwellen, V923-Neonbewegungen, V925-Festivaleffekte und V926-Raumwellen im gemeinsamen Sendedurchlauf. Es werden keine zusätzlichen Timer oder Netzwerkbefehle im Livebetrieb erzeugt.</p>
  <label className="setting-check"><input type="checkbox" checked={draft.enabled} onChange={e=>change({enabled:e.target.checked})}/>
   Zeitversatz für räumliche Lichtwellen aktivieren (Opt-in)</label>
  <div className="govee-v909-grid">
   <label>Maximaler Vorlauf ({draft.maxAdvanceMs} ms)
    <input type="range" min={0} max={500} step={10} value={draft.maxAdvanceMs} onChange={e=>change({maxAdvanceMs:Number(e.target.value)})}/>
   </label>
   <label>Leuchte auswählen
    <select value={ips.includes(selected)?selected:ips[0]??''} onChange={e=>setSelected(e.target.value)} disabled={!ips.length}>
     {ips.length===0&&<option value="">Keine Govee-Leuchten ausgewählt</option>}
     {ips.map(ip=>{const device=devices.find(d=>d.ip===ip);return <option value={ip} key={ip}>{device?.name||device?.sku||ip} · {ip}</option>;})}
    </select>
   </label>
   {selected&&ips.includes(selected)&&<label>Sichtbare Verzögerung für diese Leuchte ({delay} ms)
    <input type="range" min={0} max={500} step={10} value={delay}
     onChange={e=>{setDraft(v=>setGoveeVisualDelayV927(v,selected,Number(e.target.value)));setNotice('');}}/>
   </label>}
   <label>Vorschau-Zeitpunkt ({(progress/1000).toFixed(1)} s)
    <input type="range" min={0} max={15000} step={100} value={progress} onChange={e=>setProgress(Number(e.target.value))}/>
   </label>
  </div>
  <h4>Vergleich der Leuchten – reine Simulation</h4>
  {ips.length===0?<p className="settings-note">Bitte zuerst mindestens eine Govee-Leuchte auswählen.</p>:
   <div className="govee-v927-fixtures" aria-label="Vorschau der Zeitversätze ohne LAN-Befehle">
    {preview.map(item=>{
     const device=devices.find(d=>d.ip===item.ip);
     const amount=draft.maxAdvanceMs>0?item.appliedAdvanceMs/draft.maxAdvanceMs:0;
     return <button type="button" key={item.ip} className={`govee-v927-fixture${selected===item.ip?' selected':''}`}
      onClick={()=>setSelected(item.ip)} aria-pressed={selected===item.ip}>
      <strong>{device?.name||device?.sku||item.ip}</strong>
      <span className="govee-v927-bar"><span style={{width:`${Math.round(amount*100)}%`}}/></span>
      <small>{item.visibleDelayMs} ms eingestellt · +{item.appliedAdvanceMs} ms Vorlauf</small>
     </button>;
    })}
   </div>}
  {current&&<p className="settings-note">Beispiel: Bei {(current.currentMs/1000).toFixed(1)} s Songzeit wird die Wellenphase für die gewählte Leuchte so berechnet, als wäre sie bei {(current.compensatedMs/1000).toFixed(2)} s. Das ist <strong>kein</strong> zusätzlicher Sendezeitpunkt und keine garantierte millisekundengenaue Hardware-Synchronisierung.</p>}
  <h4>Netzwerkdiagnose · nur auf ausdrückliche Anforderung</h4>
  <p className="settings-note">Die read-only <code>/status</code>-Abfrage enthält eine feste Wartezeit von etwa <strong>350 ms</strong> in der Pi-Bridge und kann auch ohne eine neue Antwort der Leuchte zurückkehren. Sie misst <strong>nicht</strong>, wann die LEDs tatsächlich sichtbar reagieren, und verändert den eingestellten Vorlauf nicht.</p>
  <div className="govee-v909-actions">
   <button type="button" onClick={()=>void probe()} disabled={busy||!selected||!ips.includes(selected)||config.autoSync||!config.token.trim()}>
    {busy?'Statusabfrage läuft …':'3× Statusantwort messen (read-only)'}</button>
  </div>
  {config.autoSync&&<p className="settings-note">Für die Diagnose zuerst die automatische Govee-Musiksynchronisierung unten ausschalten. Die Vorschau und Zeitversatz-Regler funktionieren jederzeit.</p>}
  {current?.statusRoundtripMs!=null&&<p className="settings-note">Letzte Bridge-/Status-Abfrage für diese Leuchte: {current.statusRoundtripMs} ms (Diagnose, keine LED-Latenz).</p>}
  <div className="govee-v909-actions">
   <button type="button" onClick={save} disabled={busy||!dirty}>Kalibrierung speichern</button>
   <button type="button" onClick={revert} disabled={busy||!dirty}>Änderungen verwerfen</button>
  </div>
  <p className="settings-note" role="status">{notice||(dirty?'Noch nicht gespeichert – Live-Beleuchtung unverändert.':`Gespeichert · Status: ${saved.enabled&&config.enabled&&config.autoSync?'aktiv':'aus'}`)}</p>
  <p className="settings-note"><strong>So kalibrieren:</strong> Vergleiche die Lichtbewegungen mit der virtuellen Bühne oder einer Videoaufnahme. Reagiert eine Leuchte sichtbar später, erhöhe ihre Verzögerung in 10-ms-Schritten, bis die Wellen besser zusammenpassen. Ein Netzwerk-Roundtrip darf niemals automatisch als sichtbare Reaktionszeit übernommen werden. Ein Vorlauf kann bei der langsamen LAN-Befehlsrate nur die <em>geplante Wellenphase</em> korrigieren. Einzelne Kicks sind nicht framegenau synchronisierbar. Die V915-Gruppendimmung bleibt wirksam.</p>
 </section>;
}
