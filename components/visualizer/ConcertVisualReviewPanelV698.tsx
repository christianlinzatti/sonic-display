'use client';
/** V698: local, human-authored observations linked to V697 temporary PNG previews and optional V694 archive IDs. */
import {useEffect,useState} from 'react';
import type {V697CapturePreview} from './concertAcceptanceDashboardV697';
import {V694_STORAGE_KEY,decodeV694Archive,type V694Entry} from './concertQualityHistoryV694';
import {V698_STORAGE_KEY,V698_MAX_BYTES,V698_CATEGORIES,V698_SEVERITIES,V698_STAGES,
 addV698Annotation,comparableV698,decodeV698Archive,deleteV698Annotation,emptyV698Archive,encodeV698Archive,
 matchesV694Entry,shotRefV698,updateV698Stage,type V698Archive,type V698Category,type V698Severity,type V698ShotRef,type V698Stage} from './concertVisualReviewV698';

type Photo={file:string;url:string};
type Option={key:string;ref:V698ShotRef;url:string};
const categoryNames:Record<V698Category,string>={'dance':'Tanz / GLB','lip-sync':'Lip-Sync','lyrics':'Lyrics','camera':'Kamera','lighting':'Licht','performance':'Performance'};
const sec=(v:number)=>`${Math.floor(v/60)}:${String(Math.floor(v%60)).padStart(2,'0')}`;
function downloadJson(content:string){const url=URL.createObjectURL(new Blob([content+'\n'],{type:'application/json'}));
 const anchor=document.createElement('a');anchor.href=url;anchor.download='sonic-v698-visual-review.json';document.body.append(anchor);anchor.click();anchor.remove();
 window.setTimeout(()=>URL.revokeObjectURL(url),1000);}
export function ConcertVisualReviewPanelV698({previews,photos}:{previews:Record<string,V697CapturePreview>;photos:Record<string,Photo[]>}){
 const [archive,setArchive]=useState<V698Archive>(emptyV698Archive);
 const [history,setHistory]=useState<V694Entry[]>([]);
 const [corrupt,setCorrupt]=useState(false);
 const [notice,setNotice]=useState('');
 const [selectionA,setSelectionA]=useState('');const [selectionB,setSelectionB]=useState('');
 const [category,setCategory]=useState<V698Category>('camera');const [severity,setSeverity]=useState<V698Severity>('mittel');
 const [observation,setObservation]=useState('');const [nextStep,setNextStep]=useState('');const [historyEntryId,setHistoryEntryId]=useState('');
 useEffect(()=>{
  try{const raw=localStorage.getItem(V698_STORAGE_KEY);if(raw!==null){const decoded=decodeV698Archive(raw);
   if(decoded)setArchive(decoded);else{setCorrupt(true);setNotice('Gespeicherte V698-Prüfnotizen ungültig. Nicht automatisch überschrieben.');}}}
  catch{setCorrupt(true);setNotice('Browser-Speicher nicht lesbar; bisherige Daten bleiben unangetastet.');}
  try{const raw=localStorage.getItem(V694_STORAGE_KEY);const decoded=raw?decodeV694Archive(raw):null;
   if(decoded)setHistory(decoded.entries);
  }catch{/* V694 optional, read only */}
 },[]);
 const choices:Option[]=Object.entries(previews).flatMap(([id,c])=>c.moments.flatMap(m=>{
  const photo=photos[id]?.find(p=>p.file===m.file);const ref=shotRefV698(c,m);
  return photo&&ref?[{key:`${id}|${m.file}|${c.date}`,ref,url:photo.url}]:[];
 }));
 const a=choices.find(x=>x.key===selectionA)??choices[0];
 const b=choices.find(x=>x.key===selectionB)??choices.find(x=>x.key!==a?.key);
 const compatible=!!a&&!!b&&comparableV698(a.ref,b.ref);
 const matchingHistory=compatible?history.filter(h=>h.trackId===a.ref.trackId):[];
 const chosenHistory=matchingHistory.some(h=>h.id===historyEntryId)?historyEntryId:null;
 const add=()=>{
  if(!compatible){setNotice('Bitte zwei unterschiedliche, vergleichbare PNG-Aufnahmen desselben Songs auswählen.');return;}
  const next=addV698Annotation(archive,{before:a.ref,after:b.ref,category,severity,observation,nextStep,historyEntryId:chosenHistory},Date.now());
  if(!next){setNotice('Notiz ungültig. Beobachtung und Maßnahme brauchen jeweils mindestens 12 Zeichen; maximal 1000.');return;}
  setArchive(next);setObservation('');setNextStep('');setNotice('Notiz hinzugefügt – zum Behalten ausdrücklich „V698 lokal speichern“ klicken.');
 };
 const save=()=>{const raw=encodeV698Archive(archive);if(!raw){setNotice('Notizen enthalten ungültige Daten; nichts gespeichert.');return;}
  try{localStorage.setItem(V698_STORAGE_KEY,raw);setCorrupt(false);setNotice('V698-Notizen lokal gespeichert.');}
  catch{setNotice('Speichern fehlgeschlagen. Bitte zuerst JSON exportieren.');}
 };
 const exportData=()=>{const raw=encodeV698Archive(archive);if(!raw){setNotice('Export blockiert: ungültige Notizen.');return;}
  downloadJson(raw);setNotice('V698-Prüfnotizen als separates JSON exportiert. V696-review.json bleibt unverändert.');};
 const importData=async(file:File|undefined)=>{if(!file)return;
  if(file.size<10||file.size>V698_MAX_BYTES){setNotice('V698-Datei zu groß oder leer; nichts geändert.');return;}
  try{const parsed=decodeV698Archive(await file.text());if(!parsed){setNotice('Ungültige V698-Datei. Bestehende Notizen bleiben erhalten.');return;}
   if(!window.confirm('Aktuelle V698-Notizen im Editor durch die importierten ersetzen?'))return;
   setArchive(parsed);setNotice('Notizen importiert; zum dauerhaften Behalten lokal speichern.');}
  catch{setNotice('V698-Datei nicht lesbar. Bestehende Notizen bleiben erhalten.');}
 };
 const clear=()=>{if(!window.confirm('Alle V698-Notizen aus dem Browser und dieser Ansicht löschen?'))return;
  try{localStorage.removeItem(V698_STORAGE_KEY);setArchive(emptyV698Archive());setCorrupt(false);setNotice('V698-Notizen gelöscht.');}
  catch{setNotice('Löschen im Browser fehlgeschlagen; keine Änderung.');}
 };
 const renderOption=(opt:Option)=>`${opt.ref.scenarioId} · ${sec(opt.ref.timeSec)} · ${opt.ref.file} · ${opt.ref.capturedAt.slice(0,10)}`;
 return <section className="v697-panel v698-studio" data-v698-visual-review="manual-unverified">
  <h2>V698 · Visual Concert Review Studio</h2>
  <p>Geladene Bühnenbilder nebeneinander prüfen, Schwachstellen mit zwei Song-Zeitmarken markieren und Verbesserungen verfolgen. Importierte PNGs und V592-Reports sind <strong>ungeprüfte lokale Vorschauen</strong>, niemals ein Live- oder Freigabenachweis.</p>
  <div className="v698-grid">
   {([['A',a,selectionA,setSelectionA],['B',b,selectionB,setSelectionB]] as const).map(([name,selected,value,setValue])=><div className="v698-shot" key={name}>
    <label>Screenshot {name}<select value={selected?.key??''} onChange={(e:{target:HTMLSelectElement})=>setValue(e.target.value)} disabled={!choices.length}>
     {choices.length?choices.map(opt=><option value={opt.key} key={opt.key}>{renderOption(opt)}</option>):<option value="">Noch keine PNGs geladen</option>}
    </select></label>
    {selected?<figure><img src={selected.url} alt={`Ungeprüfte Bühnenaufnahme ${name} bei ${sec(selected.ref.timeSec)}`}/>
      <figcaption>{selected.ref.scenarioId} · {sec(selected.ref.timeSec)} · {selected.ref.act||'Abschnitt unbekannt'} · {selected.ref.cameraShot||'Shot unbekannt'}</figcaption></figure>:
      <div className="v698-placeholder">Für den visuellen Vergleich zuerst zwei unterschiedliche PNG-Dateien und die passenden V592-Berichte laden.</div>}
   </div>)}
  </div>
  <p className={compatible?'v698-ok':'v697-warning'}>{compatible?
    `Manuell gegenüberstellbar: derselbe Song (${a.ref.trackId}), ${a.ref.width}×${a.ref.height}, ${a.ref.mode}. Kein Nachweis gleicher GPU-/GLB-Bedingungen.`:
    'Kein gültiges Vergleichspaar: zwei verschiedene Bilder, derselbe Song, dieselbe Auflösung und derselbe Aufnahmemodus nötig.'}</p>
  <div className="v698-form">
   <label>Thema<select value={category} onChange={(e:{target:HTMLSelectElement})=>setCategory(e.target.value as V698Category)}>{V698_CATEGORIES.map(k=><option value={k} key={k}>{categoryNames[k]}</option>)}</select></label>
   <label>Priorität<select value={severity} onChange={(e:{target:HTMLSelectElement})=>setSeverity(e.target.value as V698Severity)}>{V698_SEVERITIES.map(k=><option key={k} value={k}>{k}</option>)}</select></label>
   <label>V694-Historieneintrag (optional; nur gleiche Track-ID)<select value={chosenHistory??''} onChange={(e:{target:HTMLSelectElement})=>setHistoryEntryId(e.target.value)}>
    <option value="">Nicht verknüpfen</option>{matchingHistory.map(h=><option value={h.id} key={h.id}>{new Date(h.archivedAt).toLocaleString('de-AT')} · {h.id}</option>)}
   </select></label>
   <label className="v698-wide">Beobachtung (mind. 12 Zeichen)<textarea maxLength={1000} rows={2} value={observation} onChange={(e:{target:HTMLTextAreaElement})=>setObservation(e.target.value)}/></label>
   <label className="v698-wide">Nächster konkreter Verbesserungsschritt (mind. 12 Zeichen)<textarea maxLength={1000} rows={2} value={nextStep} onChange={(e:{target:HTMLTextAreaElement})=>setNextStep(e.target.value)}/></label>
  </div>
  <div className="v697-actions"><button type="button" onClick={add} disabled={!compatible}>Prüfnotiz hinzufügen</button>
   <button type="button" onClick={save}>V698 lokal speichern</button><button type="button" onClick={exportData}>V698-JSON exportieren</button>
   <label className="v697-file">V698-JSON importieren<input type="file" accept=".json,application/json" onChange={(e:{target:HTMLInputElement})=>{void importData(e.target.files?.[0]);e.target.value='';}}/></label>
   <button type="button" className="v697-danger" onClick={clear}>V698-Historie löschen</button>
  </div>
  {corrupt&&<p className="v697-warning">Beschädigte Speicherdaten bleiben erhalten, bis du bewusst speicherst, importierst oder löschst.</p>}
  {notice&&<p role="status" className="v697-notice">{notice}</p>}
  <h3>Dokumentierte Prüfnotizen ({archive.annotations.length}/80)</h3>
  {archive.annotations.length===0?<p>Keine Prüfnotiz erfasst. Ein fehlendes Bild ist kein bestandenes Qualitätskriterium.</p>:<div className="v698-notes">
   {archive.annotations.map(item=>{const linked=history.find(h=>matchesV694Entry(item,h));
    return <article key={item.id} className="v698-note"><div><b>{categoryNames[item.category]} · {item.severity}</b>
       <span>V698 · {item.before.scenarioId} {sec(item.before.timeSec)} → {item.after.scenarioId} {sec(item.after.timeSec)}</span>
       <small>Song {item.before.trackId} · {item.before.file} / {item.after.file}</small></div>
      <p><strong>Beobachtung:</strong> {item.observation}</p><p><strong>Maßnahme:</strong> {item.nextStep}</p>
      <p>{item.historyEntryId?(linked?`Verknüpft mit V694-Bericht ${linked.id} (nur Referenz).`:`V694-Referenz ${item.historyEntryId} – im aktuellen Browser nicht auffindbar.`):'Keine V694-Verknüpfung.'}</p>
      <div className="v697-actions"><label>Bearbeitungsstand<select value={item.stage} onChange={(e:{target:HTMLSelectElement})=>{setArchive(old=>updateV698Stage(old,item.id,e.target.value as V698Stage));setNotice('Status geändert – für dauerhafte Speicherung bitte speichern.');}}>
       {V698_STAGES.map(k=><option key={k} value={k}>{k}</option>)}</select></label>
       <button type="button" className="v697-danger" onClick={()=>{if(!window.confirm('Diese Prüfnotiz entfernen?'))return;setArchive(old=>deleteV698Annotation(old,item.id));setNotice('Notiz entfernt – zum dauerhaften Löschen bitte speichern.');}}>Notiz entfernen</button></div>
     </article>;})}
  </div>}
  <p className="v697-warning">Zeitmarken und Notizen bleiben lokal und werden nur auf ausdrücklichen Klick gespeichert. Screenshot-Bilddaten bleiben nur im Arbeitsspeicher und müssen nach dem Neuladen erneut ausgewählt werden. V694 wird nur gelesen, V696-review.json nicht verändert. Keine automatische Qualitätseinstufung oder Produktionsfreigabe.</p>
 </section>;
}
