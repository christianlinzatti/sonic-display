'use client';
/** V697: manual concert acceptance UI. Imports are local-only previews, never release evidence. */
import {useEffect,useRef,useState} from 'react';
import {V697_SCENARIOS,V697_CHECK_LABELS,V697_STORAGE_KEY,V697_REVIEW_MAX_BYTES,comparablePreviewsV697,criteriaV697,decodeReviewV697,emptyReviewV697,
 previewCaptureV697,reviewProgressV697,updateCheckV697,validCheckV697,type V697CapturePreview,type V697Review,type V697Status} from './concertAcceptanceDashboardV697';

import {ConcertVisualReviewPanelV698} from './ConcertVisualReviewPanelV698';
type Shot={file:string;url:string};
const seconds=(value:number)=>`${Math.floor(value/60)}:${String(Math.floor(value%60)).padStart(2,'0')}`;
const download=(filename:string,data:string)=>{
 const url=URL.createObjectURL(new Blob([data],{type:'application/json'}));const a=document.createElement('a');
 a.href=url;a.download=filename;document.body.append(a);a.click();a.remove();window.setTimeout(()=>URL.revokeObjectURL(url),1000);
};
export function ConcertAcceptanceDashboardV697(){
 const [review,setReview]=useState<V697Review>(emptyReviewV697);
 const [selected,setSelected]=useState('rap-solo');
 const [notice,setNotice]=useState('');
 const [corrupt,setCorrupt]=useState(false);
 const [capturePreviews,setCapturePreviews]=useState<Record<string,V697CapturePreview>>({});
 const [photos,setPhotos]=useState<Record<string,Shot[]>>({});
 const urls=useRef<string[]>([]);
 useEffect(()=>{
  try{const data=localStorage.getItem(V697_STORAGE_KEY);if(!data)return;
   if(data.length>V697_REVIEW_MAX_BYTES){setCorrupt(true);setNotice('Gespeicherte Prüfliste ist zu groß und wurde nicht überschrieben.');return;}
   const parsed=decodeReviewV697(JSON.parse(data));if(parsed)setReview(parsed);
   else{setCorrupt(true);setNotice('Gespeicherte Prüfliste ist ungültig. Bitte erst ein neues Prüfblatt importieren oder die Speicherung bewusst ersetzen.');}
  }catch{setCorrupt(true);setNotice('Browser-Speicherung ist nicht lesbar. Die vorhandenen Daten bleiben unverändert.');}
  return ()=>{urls.current.forEach(url=>URL.revokeObjectURL(url));urls.current=[];};
 },[]);
 const scene=V697_SCENARIOS.find(s=>s.id===selected)??V697_SCENARIOS[0];
 const entry=review.scenarios.find(s=>s.id===scene.id)??review.scenarios[0];
 const progress=reviewProgressV697(review);
 const updated=(next:V697Review)=>{setReview(next);setNotice('Änderungen noch nicht lokal gespeichert.');};
 const save=()=>{
  if(!progress.readyToExport){setNotice('Bitte ungültige Begründungen/Zeitmarken zuerst korrigieren.');return;}
  const parsed=decodeReviewV697(review);if(!parsed){setNotice('Prüfblatt enthält ungültige Daten.');return;}
  try{localStorage.setItem(V697_STORAGE_KEY,JSON.stringify(parsed));setCorrupt(false);setNotice('Prüfliste lokal im Browser gespeichert.');}
  catch{setNotice('Lokale Speicherung fehlgeschlagen. Bitte JSON herunterladen und sicher aufbewahren.');}
 };
 const clear=()=>{
  if(!window.confirm('Lokale V697-Prüfliste wirklich löschen? Nicht gespeicherte Änderungen gehen verloren.'))return;
  try{localStorage.removeItem(V697_STORAGE_KEY);setReview(emptyReviewV697());setCorrupt(false);setNotice('Lokale Prüfliste gelöscht.');}
  catch{setNotice('Browser-Speicherung konnte nicht gelöscht werden.');}
 };
 const importReview=async(file:File|undefined)=>{
  if(!file)return;
  if(file.size>V697_REVIEW_MAX_BYTES||file.size<10){setNotice('Prüfblatt zu groß oder leer.');return;}
  try{const parsed=decodeReviewV697(JSON.parse(await file.text()));if(!parsed){setNotice('V696-Prüfblatt nicht kompatibel. Bestehende Eingaben bleiben erhalten.');return;}
   updated(parsed);setNotice('Prüfblatt importiert. Bei Bedarf jetzt lokal speichern.');}
  catch{setNotice('JSON-Datei konnte nicht gelesen werden. Bestehende Eingaben bleiben erhalten.');}
 };
 const exportReview=()=>{
  const validated=decodeReviewV697(review);
  if(!validated||!progress.readyToExport){setNotice('Prüfblatt enthält unvollständige Begründungen/Zeitmarken bei bewerteten Punkten.');return;}
  download('review.json',JSON.stringify(validated,null,2)+'\n');setNotice('V696-kompatibles review.json exportiert. Lege es unter artifacts/v696/review.json ab und starte den CLI-Abnahmecheck.');
 };
 const importCapture=async(file:File|undefined)=>{
  if(!file)return;if(file.size>2_000_000||file.size<5){setNotice('V592-Bericht ist zu groß oder leer.');return;}
  try{const parsed=previewCaptureV697(JSON.parse(await file.text()),scene.id);
   if(!parsed){setNotice('Bericht passt nicht zum gewählten Szenario oder ist unvollständig. Keine Daten übernommen.');return;}
   setCapturePreviews(old=>({...old,[scene.id]:parsed}));setNotice('V592-Bericht als lokale Vorschau geladen. Die echte PNG-/GLB-Prüfung erfolgt ausschließlich im V696-CLI.');
  }catch{setNotice('V592-JSON konnte nicht gelesen werden.');}
 };
 const importImages=async(files:FileList|null)=>{
  if(!files)return;const capture=capturePreviews[scene.id];if(!capture){setNotice('Zuerst einen passenden V592-Bericht für dieses Szenario laden.');return;}
  const found:Shot[]=[];
  for(const file of Array.from(files).slice(0,8)){
   if(!capture.moments.some(m=>m.file===file.name)||!/^live-\d{2}\.png$/.test(file.name)||file.size<120||file.size>16_000_000)continue;
   try{const header=new DataView(await file.slice(0,24).arrayBuffer());
    if(header.getUint32(0)!==0x89504e47||header.getUint32(4)!==0x0d0a1a0a||header.getUint32(12)!==0x49484452||
      header.getUint32(16)<640||header.getUint32(16)>3840||header.getUint32(20)<480||header.getUint32(20)>2160)continue;
    const url=URL.createObjectURL(file);urls.current.push(url);found.push({file:file.name,url});
   }catch{/* ignore bad image */}
  }
  if(!found.length){setNotice('Keine passenden PNG-Dateien für diesen Bericht gefunden.');return;}
  setPhotos(old=>({...old,[scene.id]:found}));setNotice(`${found.length} Bilddateien lokal geöffnet. PNG-Prüfsummen und echte GLB-Nachweise muss das V696-CLI bestätigen.`);
 };
 return <main className="v697-dashboard" data-v697-acceptance-dashboard="manual-only">
  <header className="v697-header"><div><a href="/" className="v697-back">← Sonic Display</a><h1>Concert Acceptance Dashboard <span>V697</span></h1>
   <p>Deutschrap und Hardstyle/Hardtekk mit 1, 2 oder 4 echten GLB-Avataren prüfen. Manuelle Prüfliste, lokale Screenshot-Vorschau und V696-kompatibler Export.</p></div>
   <div className="v697-status" role="status">Keine automatische Freigabe<br/><b>{progress.status}</b></div>
  </header>
  <section className="v697-panel"><h2>Abnahmestand</h2><div className="v697-metrics">
    <div><b>{progress.finished}/{progress.total}</b><span>Bewertete Prüfpunkte</span></div><div><b>{review.scenarios.filter(s=>s.genreConfirmed).length}/6</b><span>Genre bestätigt</span></div>
    <div><b>{Object.keys(capturePreviews).length}/6</b><span>Importierte V592-Vorschauen (ungeprüft)</span></div><div><b>{progress.failed}</b><span>Gemeldete Mängel</span></div>
   </div><p>Aufnahmen werden nur in dieser Browser-Ansicht angezeigt. Ein importierter Report beweist noch keine reale oder bestandene GLB-Abnahme.</p>
  </section>
  <div className="v697-columns"><aside className="v697-panel v697-side"><h2>Testprofile</h2>
   {V697_SCENARIOS.map(s=>{const r=review.scenarios.find(x=>x.id===s.id);const finished=r?.checks.filter(x=>x.status!=='pending').length??0;
    return <button type="button" key={s.id} className={`v697-profile ${selected===s.id?'active':''}`} onClick={()=>{setSelected(s.id);setNotice('');}}>
     <b>{s.genre}</b><span>{s.actors} GLB · {finished}/{r?.checks.length??0} Kriterien</span>{capturePreviews[s.id]?<small>V592-Vorschau geladen</small>:<small>Kein Bericht importiert</small>}
    </button>;})}
   <div className="v697-info"><b>Messungen importieren</b><p>Starte zunächst die sechs V696-Benchmarks auf deinem Rechner. Lade anschließend je Profil die zugehörige <code>report.json</code> und die <code>live-XX.png</code>-Dateien.</p></div>
  </aside>
  <div className="v697-content"><section className="v697-panel"><h2>Prüfende Person und Testumgebung</h2><div className="v697-fields">
   {([['reviewer','Prüfende Person',80],['device','Gerät / GPU / Display',120],['browser','Browser und Version',120]] as const).map(([key,label,max])=><label key={key}>{label}<input maxLength={max} value={review[key]} onChange={(e:{target:HTMLInputElement})=>updated({...review,[key]:e.target.value})}/></label>)}
  </div><div className="v697-actions"><button type="button" onClick={save}>Lokal speichern</button><button type="button" onClick={exportReview}>review.json exportieren</button>
   <label className="v697-file">review.json importieren<input type="file" accept=".json,application/json" onChange={(e:{target:HTMLInputElement})=>{void importReview(e.target.files?.[0]);e.target.value='';}}/></label>
   <button type="button" className="v697-danger" onClick={clear}>Prüfliste löschen</button></div>
   {corrupt&&<p className="v697-warning">Ungültige gespeicherte Daten werden nicht stillschweigend überschrieben. Bewusst „Lokal speichern“ verwenden, um sie zu ersetzen.</p>}
   {notice&&<p className="v697-notice" role="status">{notice}</p>}
  </section>
  <section className="v697-panel"><h2>{scene.genre} – {scene.actors} GLB-{scene.actors===1?'Avatar':'Avatare'}</h2>
   <label className="v697-confirm"><input type="checkbox" checked={entry.genreConfirmed} onChange={(e:{target:HTMLInputElement})=>updated({...review,scenarios:review.scenarios.map(s=>s.id===scene.id?{...s,genreConfirmed:e.target.checked}:s)})}/> Musikgenre bei echter Wiedergabe bestätigt</label>
   <label className="v697-caption">Gesamtnotiz (optional)<textarea maxLength={1000} rows={2} value={entry.notes} onChange={(e:{target:HTMLTextAreaElement})=>updated({...review,scenarios:review.scenarios.map(s=>s.id===scene.id?{...s,notes:e.target.value}:s)})}/></label>
   <div className="v697-import"><label className="v697-file">V592 report.json für dieses Profil laden<input type="file" accept=".json,application/json" onChange={(e:{target:HTMLInputElement})=>{void importCapture(e.target.files?.[0]);e.target.value='';}}/></label>
    <label className="v697-file">Passende PNG-Bilder öffnen<input type="file" accept="image/png,.png" multiple onChange={(e:{target:HTMLInputElement})=>{void importImages(e.target.files);e.target.value='';}}/></label></div>
   {capturePreviews[scene.id]?<div className="v697-capture"><p><b>Ungeprüfte lokale Berichtsvorschau</b> · Song: {capturePreviews[scene.id].trackId} · {capturePreviews[scene.id].width} × {capturePreviews[scene.id].height}</p>
    <p>FPS {capturePreviews[scene.id].fps.toFixed(1)} · P95 {capturePreviews[scene.id].p95Ms.toFixed(1)} ms · {capturePreviews[scene.id].mode}</p>
    <div className="v697-shots">{capturePreviews[scene.id].moments.map(m=>{const shot=photos[scene.id]?.find(p=>p.file===m.file);
     return <figure key={m.file}>{shot?<a href={shot.url} target="_blank" rel="noreferrer"><img src={shot.url} alt={`Bühnenaufnahme bei ${seconds(m.timeSec)} – ${m.file}`}/></a>:<div className="v697-placeholder">{m.file}<span>PNG noch nicht geladen</span></div>}
      <figcaption><b>{seconds(m.timeSec)}</b> · {m.act||m.moment||'Abschnitt nicht erfasst'} · {m.shot||'Kameratyp offen'}</figcaption></figure>;})}</div>
    <p className="v697-warning">Bildvorschau ist keine technische Echtheits-, PNG-Prüfsummen- oder Qualitätsvalidierung. Fehlende Bilder werden nicht als bestanden bewertet.</p></div>:<p>Noch keine V592-Aufnahme für dieses Profil geladen. Die Prüfliste kann trotzdem vorbereitet werden.</p>}
  </section>
  <ConcertVisualReviewPanelV698 previews={capturePreviews} photos={photos}/>
  <section className="v697-panel"><h2>Visuelle und technische Prüfliste</h2><p>„Bestanden“ und „Mangel“ erfordern jeweils eine nachvollziehbare Notiz (mindestens 12 Zeichen) und eine echte Song-Zeitmarke in Sekunden. Offene Punkte dürfen leer bleiben.</p>
   <div className="v697-checks">{entry.checks.map(c=><article className={`v697-check ${!validCheckV697(c)?'invalid':''}`} key={c.id}>
    <label className="v697-check-title" htmlFor={`v697-${scene.id}-${c.id}`}><b>{V697_CHECK_LABELS[c.id]??c.id}</b><small>{c.id}</small></label>
    <div className="v697-check-fields"><label>Ergebnis<select id={`v697-${scene.id}-${c.id}`} value={c.status} onChange={(e:{target:HTMLSelectElement})=>updated(updateCheckV697(review,scene.id,c.id,{status:e.target.value as V697Status}))}>
      <option value="pending">Offen</option><option value="pass">Manuell bestanden</option><option value="fail">Mangel beobachtet</option></select></label>
     <label>Zeitmarke (Sek.)<input type="number" min={0} max={86400} step="0.1" value={c.songTimeSec??''} onChange={(e:{target:HTMLInputElement})=>updated(updateCheckV697(review,scene.id,c.id,{songTimeSec:e.target.value===''?null:Number(e.target.value)}))}/></label></div>
    <label>Beobachtung / konkrete Verbesserung<textarea rows={2} maxLength={800} value={c.note} onChange={(e:{target:HTMLTextAreaElement})=>updated(updateCheckV697(review,scene.id,c.id,{note:e.target.value}))}/></label>
    {!validCheckV697(c)&&<small className="v697-warning">Für bewertete Punkte Zeitmarke und mindestens 12 Zeichen Begründung ergänzen.</small>}
   </article>)}</div>
  </section>
  <section className="v697-panel"><h2>Vorläufiger Performance-Vergleich</h2>
   {(['Deutschrap','Hardstyle/Hardtekk'] as const).map(genre=><div key={genre}><h3>{genre}</h3>{comparablePreviewsV697(Object.values(capturePreviews),genre)?
    <table><thead><tr><th>GLB</th><th>FPS</th><th>P95 ms</th></tr></thead><tbody>{V697_SCENARIOS.filter(s=>s.genre===genre).map(s=><tr key={s.id}><td>{s.actors}</td><td>{capturePreviews[s.id].fps.toFixed(1)}</td><td>{capturePreviews[s.id].p95Ms.toFixed(1)}</td></tr>)}</tbody></table>:
    <p>Nicht vergleichbar: Für 1, 2 und 4 GLB-Avatare sind drei Berichte mit gleichem Song, gleicher Auflösung und gleichem Chromium-Modus erforderlich.</p>}</div>)}
   <p className="v697-warning">Die Vorschau bestätigt weder identische GLB-Komplexität noch GPU-Temperatur, Laufzeit oder echte Messwerte. Das V696-CLI prüft die Quelldaten und alle PNGs separat.</p>
  </section></div></div>
  <footer className="v697-footer"><strong>Produktionsfreigabe weiterhin gesperrt.</strong> Zum Abschluss <code>review.json</code> in <code>artifacts/v696/review.json</code> übernehmen, die sechs Original-Aufnahmen unter <code>artifacts/v696/captures/</code> ablegen und <code>npm run audit:v696:collect</code> sowie <code>npm run audit:v695:release</code> ausführen. Die Ergebnisse nicht ohne eigene Sichtprüfung freigeben.</footer>
 </main>;
}
