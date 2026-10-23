"use client";
import { useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";
import { GENRES, type MusicGenre } from "@/types/animation";
import { useMusic } from "@/context/MusicContext";
import { filterGenreCorrections, summarizeGenreCorrections, updateSelectedGenre, removeSelectedCorrections, exportGenreMemory, previewGenreMemoryImport, mergeGenreMemory, type GenreMemoryImportPreview } from "@/services/genre/genreMemoryManagement";

import { genreMemoryInsights, createGenreSnapshot, restoreGenreSnapshot, loadGenreSnapshots, saveGenreSnapshots, type GenreSnapshot } from "@/services/genre/genreMemoryInsights";

export function GenreCorrectionDashboard({onClose}:{onClose:()=>void}){
 const {genreMemory,replaceGenreMemory}=useMusic();
 const [snapshots,setSnapshots]=useState<GenreSnapshot[]>([]);
 const [snapshotLabel,setSnapshotLabel]=useState("Meine Genre-Korrekturen");
 useEffect(()=>{setSnapshots(loadGenreSnapshots());},[]);
 const insights=useMemo(()=>genreMemoryInsights(genreMemory),[genreMemory]);
 const [search,setSearch]=useState("");
 const [genreFilter,setGenreFilter]=useState<MusicGenre|"all">("all");
 const [selection,setSelection]=useState<string[]>([]);
 const [targetGenre,setTargetGenre]=useState<MusicGenre>("hardtekk");
 const [preview,setPreview]=useState<GenreMemoryImportPreview|null>(null);
 const [error,setError]=useState("");
 const picker=useRef<HTMLInputElement>(null);
 const filtered=useMemo(()=>filterGenreCorrections(genreMemory,search,genreFilter),[genreMemory,search,genreFilter]);
 const summary=useMemo(()=>summarizeGenreCorrections(genreMemory),[genreMemory]);
 const selected=selection.filter(id=>genreMemory.corrections.some(c=>c.trackId===id));
 const toggle=(id:string)=>setSelection(old=>old.includes(id)?old.filter(x=>x!==id):[...old,id]);
 const save=(next:typeof genreMemory)=>{if(replaceGenreMemory(next)){setSelection([]);setPreview(null);setError("");}else setError("Speichern im Browser fehlgeschlagen.");};
 function backup(){try{const next=createGenreSnapshot(snapshots,genreMemory,snapshotLabel);if(!saveGenreSnapshots(next)){setError("Sicherung konnte nicht gespeichert werden.");return;}setSnapshots(next);setError("");}catch(e){setError(e instanceof Error?e.message:"Sicherung fehlgeschlagen.");}}
 function restore(id:string){const snapshot=snapshots.find(s=>s.id===id);if(!snapshot)return;if(!window.confirm(`Sicherung ${snapshot.label} wiederherstellen? Die aktuelle Liste wird ersetzt.`))return;save(restoreGenreSnapshot(snapshot));}
 function deleteBackup(id:string){if(!window.confirm("Diese lokale Sicherung löschen?"))return;const next=snapshots.filter(s=>s.id!==id);if(saveGenreSnapshots(next))setSnapshots(next);else setError("Löschen der Sicherung fehlgeschlagen.");}
 function exportJson(){
  const blob=new Blob([exportGenreMemory(genreMemory)],{type:"application/json"});
  const url=URL.createObjectURL(blob);
  const anchor=document.createElement("a");anchor.href=url;anchor.download="sonic-display-genre-korrekturen.json";anchor.click();
  URL.revokeObjectURL(url);
 }
 async function importJson(event:ChangeEvent<HTMLInputElement>){
  const file=event.target.files?.[0];event.target.value="";
  if(!file)return;
  if(file.size>1024*1024){setError("Importdatei ist zu groß (max. 1 MB).");return;}
  try{setPreview(previewGenreMemoryImport(await file.text(),genreMemory));setError("");}catch(err){setPreview(null);setError(err instanceof Error?err.message:"Import fehlgeschlagen.");}
 }
 return <section className="genre-memory-dashboard" aria-label="Genre-Korrektur-Dashboard" style={{border:"1px solid #566",padding:12,borderRadius:10,marginBlock:12,maxHeight:560,overflow:"auto"}}>
  <header style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:8}}><strong>Genre-Lern-Dashboard</strong><button type="button" onClick={onClose}>Schließen</button></header>
  <p>{summary.total} gespeicherte Song-Korrekturen · {summary.artists} Artists</p>
  <div style={{display:"flex",flexWrap:"wrap",gap:8}}>{GENRES.map(g=><span key={g.id}>{g.label}: <strong>{summary.counts[g.id]}</strong></span>)}</div>
  <section aria-label="Genre-Statistik und Sicherungen" style={{border:"1px solid #475569",padding:10,marginBlock:12,borderRadius:8}}>
   <h4>Genre-Insights und Sicherungen</h4>
   <p>Letzte 30 Tage: {insights.recent} Korrekturen · Älter: {insights.older} · Artists mit unterschiedlichen Genres: {insights.mixedArtists.length}</p>
   {insights.mixedArtists.slice(0,5).map(a=><p key={a.artist} style={{fontSize:12}}>{a.artist}: {Object.entries(a.genres).map(([g,n])=>`${g} ${n}`).join(" · ")}</p>)}
   <div style={{display:"flex",gap:8,flexWrap:"wrap"}}><input aria-label="Name der Genre-Sicherung" maxLength={90} value={snapshotLabel} onChange={e=>setSnapshotLabel(e.target.value)}/><button type="button" onClick={backup}>Genre-Sicherung erstellen</button></div>
   <p>{snapshots.length} von 10 lokalen Sicherungen</p>
   {snapshots.map(s=><div key={s.id} style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}><span>{s.label} · {s.memory.corrections.length} Einträge · {new Date(s.createdAt).toLocaleDateString("de-AT")}</span><button type="button" onClick={()=>restore(s.id)}>Sicherung wiederherstellen</button><button type="button" onClick={()=>deleteBackup(s.id)}>Sicherung löschen</button></div>)}
  </section>
  <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBlock:12}}>
   <input aria-label="Suche Artist oder Track-ID" placeholder="Artist oder Track-ID suchen" value={search} onChange={e=>setSearch(e.target.value)}/>
   <select aria-label="Genre filtern" value={genreFilter} onChange={e=>setGenreFilter(e.target.value as MusicGenre|"all")}><option value="all">Alle Genres</option>{GENRES.map(g=><option key={g.id} value={g.id}>{g.label}</option>)}</select>
   <button type="button" onClick={()=>setSelection(filtered.map(c=>c.trackId))}>Gefilterte auswählen</button>
   <button type="button" onClick={()=>setSelection([])}>Auswahl aufheben</button>
  </div>
  <div style={{maxHeight:215,overflow:"auto"}}>{filtered.length===0?<p>Keine passenden Korrekturen.</p>:filtered.map(c=><label key={c.trackId} style={{display:"flex",alignItems:"center",gap:8,padding:"5px 0",borderBottom:"1px solid #475569"}}>
   <input type="checkbox" checked={selected.includes(c.trackId)} onChange={()=>toggle(c.trackId)} aria-label={`${c.trackId} auswählen`}/>
   <span style={{flex:1,minWidth:0,overflowWrap:"anywhere"}}><strong>{c.artist||"Unbekannter Artist"}</strong> · {c.trackId}</span>
   <select aria-label={`Genre von ${c.trackId}`} value={c.genre} onChange={e=>save(updateSelectedGenre(genreMemory,[c.trackId],e.target.value as MusicGenre))}>{GENRES.map(g=><option value={g.id} key={g.id}>{g.label}</option>)}</select>
  </label>)}</div>
  <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBlock:12,alignItems:"center"}}>
   <span>{selected.length} ausgewählt</span>
   <select aria-label="Neues Genre für Auswahl" value={targetGenre} onChange={e=>setTargetGenre(e.target.value as MusicGenre)}>{GENRES.map(g=><option value={g.id} key={g.id}>{g.label}</option>)}</select>
   <button type="button" disabled={!selected.length} onClick={()=>save(updateSelectedGenre(genreMemory,selected,targetGenre))}>Auswahl ändern</button>
   <button type="button" disabled={!selected.length} onClick={()=>{if(window.confirm(`${selected.length} Genre-Korrekturen löschen?`))save(removeSelectedCorrections(genreMemory,selected));}}>Auswahl löschen</button>
  </div>
  <div style={{display:"flex",gap:8,flexWrap:"wrap"}}><button type="button" onClick={exportJson}>JSON exportieren</button><button type="button" onClick={()=>picker.current?.click()}>JSON importieren</button><input hidden ref={picker} type="file" accept="application/json,.json" onChange={importJson}/></div>
  {preview&&<div role="status" style={{marginTop:10}}><p>Import-Vorschau: {preview.newCount} neue, {preview.conflicts} Konflikte, {preview.unchanged} unverändert. Maximal 250 Einträge bleiben gespeichert.</p>
   <button type="button" onClick={()=>save(mergeGenreMemory(genreMemory,preview.incoming,false))}>Importieren (bestehende behalten)</button>{" "}
   <button type="button" onClick={()=>{if(window.confirm("Konflikte durch importierte Korrekturen ersetzen?"))save(mergeGenreMemory(genreMemory,preview.incoming,true));}}>Importieren (Konflikte ersetzen)</button>{" "}
   <button type="button" onClick={()=>setPreview(null)}>Abbrechen</button></div>}
  {error&&<p role="alert">{error}</p>}
  <p style={{fontSize:12}}>Die Übersicht zeigt Spotify-Track-IDs, da der gespeicherte V181-Datensatz keine Songtitel enthält. Die Daten bleiben lokal und können als JSON auf ein anderes Gerät übertragen werden.</p>
 </section>;
}
