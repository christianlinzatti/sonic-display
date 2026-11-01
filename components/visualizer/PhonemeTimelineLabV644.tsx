"use client";
import {useEffect,useRef,useState} from "react";
import {useMusic} from "@/context/MusicContext";
import {clearAdvancedVisemeModeV662,getAdvancedVisemeModeV662,setAdvancedVisemeModeV662,type AdvancedVisemeModeV662} from "./advancedPhonemeLipSyncV662";
import {clearDeutschrapPerformanceModeV663,getDeutschrapPerformanceModeV663,setDeutschrapPerformanceModeV663,type DeutschrapPerformanceModeV663} from "./expressiveDeutschrapPerformanceV663";
import {VISEMES_V644,createVisemeDocumentV644,normalizeVisemeDocumentV644,setLiveVisemeV644,clearLiveVisemeV644,
  getLiveVisemeV644,type VisemeMarkV644,type VisemeV644} from "./phonemeLipSyncV644";

const trackKey=(v:string)=>v.replace(/[^a-z0-9_-]/gi,'').slice(0,40)||'track';
function saveReport(text:string,name:string){
 const u=URL.createObjectURL(new Blob([text],{type:'application/json'}));
 const a=document.createElement('a');a.href=u;a.download=name;a.click();
 window.setTimeout(()=>URL.revokeObjectURL(u),2000);
}
/** Explicit, manual per-singer viseme authoring. Never uploads or saves user audio. */
export function PhonemeTimelineLabV644(){
 const {track,progressMs}=useMusic();
 const id=track?.id??'',durationMs=track?.durationMs??0;
 const liveTrack=useRef(id);liveTrack.current=id;
 const [open,setOpen]=useState(false),[enabled,setEnabled]=useState(false);
 const [marks,setMarks]=useState<VisemeMarkV644[]>([]),[slot,setSlot]=useState<0|1|2|3>(0);
 const [viseme,setViseme]=useState<VisemeV644>('AA'),[start,setStart]=useState(0),[length,setLength]=useState(160);
 const [message,setMessage]=useState('');
 const [advancedModeV662,setAdvancedModeV662]=useState<AdvancedVisemeModeV662>('off');
 const [rapPerformanceModeV663,setRapPerformanceModeV663]=useState<DeutschrapPerformanceModeV663>('off');
 // No old song's facial data survives a change of track or unmount.
 useEffect(()=>{
  const saved=getLiveVisemeV644();
  if(saved&&saved.document.trackId===id&&Math.abs(saved.document.durationMs-durationMs)<=3500){
   setMarks(saved.document.marks);setEnabled(saved.enabled);
   setAdvancedModeV662(getAdvancedVisemeModeV662(id));
   setRapPerformanceModeV663(getDeutschrapPerformanceModeV663(id));
  }else{clearLiveVisemeV644();clearAdvancedVisemeModeV662();setMarks([]);setEnabled(false);setAdvancedModeV662('off');clearDeutschrapPerformanceModeV663();setRapPerformanceModeV663('off');}
  setStart(0);setMessage('');
  // Do not clear on dialog close: the live performance must continue.
  // SmartLazySettings clears after an actual track change.
 },[id,durationMs]);
 const validDocument=createVisemeDocumentV644(id,durationMs,marks);
 const update=(next:VisemeMarkV644[],on=enabled)=>{
  const doc=createVisemeDocumentV644(id,durationMs,next);
  if(!doc){setMessage('Ungültiger oder überlappender Abschnitt. Bitte Zeiten prüfen.');return false;}
  setMarks(doc.marks);setEnabled(on);setLiveVisemeV644(doc,id,durationMs,on);setMessage('');return true;
 };
 const add=()=>{
  if(!track||!Number.isInteger(start)||!Number.isInteger(length)||length<30||start<0||start+length>durationMs){setMessage('Start/Dauer müssen gültige Millisekunden im aktuellen Song sein.');return;}
  if(update([...marks,{slot,startMs:start,endMs:start+length,viseme}]))setStart(Math.min(durationMs,Math.max(0,start+length)));
 };
 const importJson=async(f:File|null)=>{
  if(!f||!track)return;
  try{
   if(f.size<=0||f.size>250_000)throw Error('JSON zu groß oder leer (max. 250 KB).');
   const raw:unknown=JSON.parse(await f.text());
   if(liveTrack.current!==id)return;
   const doc=normalizeVisemeDocumentV644(raw,id,durationMs);
   if(!doc)throw Error('Ungültige Spur, Zeitbereich oder anderer Song.');
   if(!update(doc.marks,false))return;
   setMessage('Manuelle Zeitmarken importiert. Wiedergabe bleibt deaktiviert, bis du sie einschaltest.');
  }catch(e){setMessage(e instanceof Error?e.message:'Import fehlgeschlagen.');}
 };
 const exportJson=()=>{
  if(!validDocument||!marks.length){setMessage('Keine gültigen Zeitmarken vorhanden.');return;}
  saveReport(JSON.stringify(validDocument),`sonic-v644-visemes-${trackKey(id)}.json`);
 };
 const remove=(i:number)=>{update(marks.filter((_,idx)=>idx!==i));};
 const activate=(on:boolean)=>{
  if(!validDocument||!marks.length){setMessage('Füge zuerst einen Visem-Abschnitt hinzu.');return;}
  setEnabled(on);setLiveVisemeV644(validDocument,id,durationMs,on);setMessage(on?'Manuelle Visemspur aktiv – nur zeitlich markierte Abschnitte werden überlagert.':'Manuelle Visemspur deaktiviert.');
 };
 return <fieldset aria-label="V644 manuelle Visem-Timeline" style={{marginTop:12,padding:12,border:'1px solid #586c85',borderRadius:10,display:'grid',gap:8}}>
  <legend>V644 · Advanced Phoneme Lip-Sync</legend>
  <button type="button" onClick={()=>setOpen(v=>!v)} aria-expanded={open}>{open?'▾ Manuelle Visemspur schließen':'▸ Manuelle Visemspur bearbeiten'}</button>
  {open&&<>
   <small><b>Keine automatische Phonemerkennung:</b> Markiere selbst die Zeitbereiche und passenden Mundformen (Viseme) einer bereits bekannten Aussprache oder importiere eine manuell ausgerichtete Spur. V643-RMS ist dafür nicht ausreichend. Nur dieser Song und Avatar-Slot werden beeinflusst. Lokal, ohne Audio-Upload.</small>
   <p>{track?<><b>{track.title}</b> · {Math.round(durationMs/1000)} Sekunden</>:'Bitte zuerst einen Song auswählen.'}</p>
   <label>Avatar-Slot <select disabled={!track} value={slot} onChange={e=>setSlot(Number(e.target.value) as 0|1|2|3)}>{[0,1,2,3].map(i=><option key={i} value={i}>Avatar {i+1}</option>)}</select></label>
   <label>Visem (manuell) <select value={viseme} onChange={e=>setViseme(e.target.value as VisemeV644)}>{VISEMES_V644.map(v=><option key={v} value={v}>{v}</option>)}</select></label>
   <label>Start (ms) <input type="number" step="10" min="0" max={durationMs} disabled={!track} value={start} onChange={e=>setStart(Number(e.target.value))}/></label>
   <label>Dauer (ms) <input type="number" step="10" min="30" max="2000" disabled={!track} value={length} onChange={e=>setLength(Number(e.target.value))}/></label>
   <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
    <button type="button" disabled={!track} onClick={()=>setStart(Math.max(0,Math.min(durationMs,Math.round(progressMs/10)*10)))}>Aktuelle Songposition verwenden</button>
    <button type="button" disabled={!track} onClick={add}>Zeitmarke hinzufügen</button>
   </div>
   <label><input type="checkbox" checked={enabled} disabled={!marks.length} onChange={e=>activate(e.target.checked)}/> Manuelle Visemspur aktivieren (Opt-in)</label>
   <label>V662 · Natürliche Lautübergänge
    <select value={advancedModeV662} disabled={!track||!marks.length} onChange={e=>{
      const mode=e.target.value as AdvancedVisemeModeV662;
      if(setAdvancedVisemeModeV662(id,mode)){setAdvancedModeV662(mode);setMessage(mode==='off'?'V644-Originalübergänge aktiv.':'V662-Profil für diesen Song aktiviert – nur innerhalb markierter Visemintervalle.');}
    }}>
     <option value="off">Aus · Original V644</option>
     <option value="rap">Deutschrap · präzise Konsonanten</option>
     <option value="singing">Gesang · weichere Übergänge</option>
    </select>
   </label>
   <label>V663 · Expressive Deutschrap Performance
    <select disabled={!track} value={rapPerformanceModeV663} onChange={e=>{
      const mode=e.target.value as DeutschrapPerformanceModeV663;
      if(setDeutschrapPerformanceModeV663(id,mode)){
        setRapPerformanceModeV663(mode);
        setMessage(mode==='off'?'V663 deaktiviert.':'V663 nur für diesen Song aktiviert – bestätigte Rap-Wörter und Sängerrollen erforderlich.');
      }
    }}>
     <option value="off">Aus · bisherige Bühnenregie</option>
     <option value="subtle">Natürlich · ruhige Rap-Gesten</option>
     <option value="stage">Live-Bühne · deutlichere Hooks</option>
    </select>
   </label>
   <small>V663 koordiniert Kopf, bestätigte Blickrichtung, Schultern und IK-gestützte Arme mit bereits verifizierten Rap-Wörtern. Keine automatische Sänger- oder Emotionserkennung. Manuelle Bewegungen, GLB-Animationen, reduzierte Bewegung und die bisherigen Mundformen behalten Vorrang. Für die Performance sind keine V644-Visemmarkierungen erforderlich.</small>
   <small>V662 verändert nur die Übergangskurve zwischen direkt angrenzenden, manuell gesetzten Mundformen. Keine Phonemerkennung, keine künstlichen Silben. Verschlüsse und manuelle Zeitmarken bleiben maßgeblich; die Wiedergabe muss oben separat aktiviert sein.</small>
   <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
    <button type="button" disabled={!marks.length} onClick={exportJson}>Visem-Zeitmarken als JSON exportieren</button>
    <button type="button" disabled={!marks.length} onClick={()=>{clearLiveVisemeV644();clearAdvancedVisemeModeV662();setAdvancedModeV662('off');setMarks([]);setEnabled(false);setMessage('Spur gelöscht.');}}>Alle Markierungen löschen</button>
   </div>
   <label>Manuell ausgerichtete Spur importieren (JSON) <input type="file" accept=".json,application/json" disabled={!track} onChange={e=>{void importJson(e.target.files?.[0]??null);e.target.value='';}}/></label>
   {message&&<small role="status">{message}</small>}
   {!!marks.length&&<section aria-label="Manuelle Visemabschnitte" style={{maxHeight:180,overflowY:'auto',display:'grid',gap:4}}>
    {marks.map((m,i)=><div key={`${m.slot}-${m.startMs}-${i}`} style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:8}}>
     <small>Avatar {m.slot+1} · {(m.startMs/1000).toFixed(2)}–{(m.endMs/1000).toFixed(2)} s · {m.viseme}</small>
     <button type="button" onClick={()=>remove(i)} aria-label={`Visem ${i+1} entfernen`}>Entfernen</button>
    </div>)}
   </section>}
   <small>Die Timeline ersetzt nur für explizit markierte Intervalle die automatischen Mundziele. Demovorschau, manuelle GLB-Animationen und vorrangige Silben-/Audio-Korrekturen behalten Vorrang. Visem-Zeitmarken belegen keine phonetische Erkennung und sagen nichts über die Sängeridentität aus. Beim Songwechsel wird die Live-Spur gelöscht; Schließen des Dialogs stoppt sie nicht.</small>
  </>}
 </fieldset>;
}
