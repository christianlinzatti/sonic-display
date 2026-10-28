"use client";
import {useEffect,useRef,useState} from "react";
import {useMusic} from "@/context/MusicContext";
import {analyzeIsolatedVocalStemV643,bundleVocalStemsV643,normalizeVocalStemBundleV643,sampleVocalStemV643,type VocalStemDocumentV643,type VocalStemSlotV643} from "./vocalStemAnalysisV643";

const maxAudioBytes=80*1024*1024;
const names=['Stimme / Avatar 1','Stimme / Avatar 2','Stimme / Avatar 3','Stimme / Avatar 4'];
const download=(text:string,name:string)=>{
 const url=URL.createObjectURL(new Blob([text],{type:'application/json'}));
 const a=document.createElement('a');a.href=url;a.download=name;a.click();
 // The blob is temporary; it is never uploaded or added to preferences.
 window.setTimeout(()=>URL.revokeObjectURL(url),2000);
};
export function VocalStemLabV643(){
 const {track,progressMs}=useMusic();
 const [open,setOpen]=useState(false),[selected,setSelected]=useState<VocalStemSlotV643>(0);
 const [file,setFile]=useState<File|null>(null);
 const [stems,setStems]=useState<VocalStemDocumentV643[]>([]);
 const [previewMs,setPreviewMs]=useState<number|null>(null);
 const [busy,setBusy]=useState(false),[message,setMessage]=useState('');
 const liveTrack=useRef(track?.id??'');
 const token=useRef(0);
 const id=track?.id??'',durationMs=track?.durationMs??0;
 useEffect(()=>{liveTrack.current=id;token.current++;setFile(null);setStems([]);setPreviewMs(null);setMessage('');setBusy(false);},[id]);
 const analyze=async()=>{
  if(!file||busy||!track||!id)return;
  const selectedTrack=id,request=++token.current;
  let audio:AudioContext|null=null;
  setBusy(true);setMessage('');
  try{
   if(file.size<=0||file.size>maxAudioBytes)throw Error('Audiodatei muss zwischen 1 Byte und 80 MB groß sein.');
   if(!(/\.(wav|mp3|ogg|m4a|aac|flac|opus)$/i.test(file.name)||file.type.startsWith('audio/')))throw Error('Bitte eine unterstützte Audiodatei auswählen.');
   audio=new AudioContext();
   const buffer=await audio.decodeAudioData(await file.arrayBuffer());
   if(buffer.numberOfChannels<1||buffer.numberOfChannels>2)throw Error('Bitte eine Mono- oder Stereo-Gesangsspur verwenden (maximal 2 Kanäle).');
   if(buffer.duration<2||buffer.duration>720)throw Error('Die Gesangsspur muss zwischen 2 Sekunden und 12 Minuten lang sein.');
   if(Math.abs(buffer.duration*1000-durationMs)>3500)throw Error('Die Stem-Länge weicht mehr als 3,5 Sekunden vom aktuellen Song ab. Bitte vollständige, zeitlich passende Vocal-Stems verwenden.');
   const channels=Array.from({length:buffer.numberOfChannels},(_,i)=>buffer.getChannelData(i));
   const result=analyzeIsolatedVocalStemV643(channels,buffer.sampleRate,selectedTrack,selected,durationMs);
   if(!result)throw Error('Gesangsspur kann nicht analysiert werden (2 bis 720 Sekunden, gültiges PCM erforderlich).');
   if(token.current!==request||liveTrack.current!==selectedTrack)return;
   setStems(old=>[...old.filter(s=>s.slot!==selected),result].sort((a,b)=>a.slot-b.slot));
   setFile(null);setMessage('Lokale Gesangsspur analysiert. Der Bericht enthält nur abgeleitete Signale; Live-Lip-Sync bleibt unverändert.');
  }catch(e){if(token.current===request&&liveTrack.current===selectedTrack)setMessage(e instanceof Error?e.message:'Analyse fehlgeschlagen.');}
  finally{if(audio)void audio.close().catch(()=>{});if(token.current===request)setBusy(false);}
 };
 const importReport=async(f:File|null)=>{
  if(!f||!id||busy)return;
  try{
   if(f.size<20||f.size>3*1024*1024)throw Error('Der JSON-Bericht muss kleiner als 3 MB sein.');
   const data:unknown=JSON.parse(await f.text());
   const report=normalizeVocalStemBundleV643(data as Parameters<typeof normalizeVocalStemBundleV643>[0],id,durationMs);
   if(!report)throw Error('Ungültiger Bericht oder falscher Song. Import abgelehnt.');
   if(liveTrack.current!==id)return;
   setStems(report.stems);setMessage('V643-Merkmale für diesen Song importiert. Keine Audio-Bytes eingelesen.');
  }catch(e){setMessage(e instanceof Error?e.message:'Import fehlgeschlagen.');}
 };
 const exportReport=()=>{
  const report=bundleVocalStemsV643(stems,id,durationMs);
  if(!report){setMessage('Kein gültiger Bericht zum aktuellen Song vorhanden.');return;}
  download(JSON.stringify(report),`sonic-v643-vocal-${id.replace(/[^a-zA-Z0-9_-]/g,'').slice(0,35)||'track'}.json`);
 };
 const sampleTime=previewMs??progressMs;
 return <fieldset aria-label="V643 Vocal Stem Analyse" style={{border:'1px solid #586c85',borderRadius:10,marginTop:14,padding:12,display:'grid',gap:9}}>
  <legend>V643 · Real Vocal Stem Analysis</legend>
  <button type="button" aria-expanded={open} onClick={()=>setOpen(v=>!v)}>{open?'▾ Vocal Stem Lab schließen':'▸ Isolierte Gesangsspuren lokal auswerten'}</button>
  {open&&<>
   <small>Wähle selbst bereitgestellte, <b>bereits isolierte</b> Vocal-Stems. Es findet <b>keine Stem-Separation von Spotify</b>, keine Spracherkennung und kein Upload statt. Nur lokale Energie-/Einsatz-/Periodizitätswerte werden berechnet. Kein automatischer Einfluss auf die aktuellen Avatar-Münder; die Ergebnisse sind eine Grundlage für V644.</small>
   <p>{track?<><b>{track.title}</b> · {Math.round(durationMs/1000)} Sekunden</>:'Bitte zuerst einen Spotify-Song auswählen.'}</p>
   <label>Stimme / Performer manuell zuweisen <select aria-label="V643 Stimmenslot" disabled={!track||busy} value={selected} onChange={e=>{setSelected(Number(e.target.value) as VocalStemSlotV643);setFile(null);}}>{names.map((name,i)=><option value={i} key={i}>{name}</option>)}</select></label>
   <label>Passende isolierte Vocal-Audiodatei (max. 80 MB) <input aria-label="V643 Gesangsdatei" type="file" accept="audio/*,.wav,.mp3,.ogg,.m4a,.aac,.flac,.opus" disabled={!track||busy} onChange={e=>{setFile(e.target.files?.[0]??null);setMessage('');}}/></label>
   <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
    <button type="button" onClick={()=>void analyze()} disabled={!track||!file||busy}>{busy?'Stimme wird analysiert …':'Stem analysieren'}</button>
    <button type="button" onClick={exportReport} disabled={!stems.length||busy}>Merkmale als JSON exportieren</button>
    <button type="button" onClick={()=>{token.current++;setStems([]);setFile(null);setPreviewMs(null);setMessage('V643-Analyse aus dem Arbeitsspeicher entfernt.');}} disabled={!stems.length||busy}>Analyse löschen</button>
   </div>
   <label>Vorher exportierten V643-Bericht importieren <input type="file" accept=".json,application/json" aria-label="V643 Bericht importieren" disabled={!track||busy} onChange={e=>{void importReport(e.target.files?.[0]??null);e.target.value='';}}/></label>
   {message&&<small role="status">{message}</small>}
   {!!stems.length&&<>
    <label>Analysezeitpunkt: {(Math.min(durationMs,Math.max(0,sampleTime))/1000).toFixed(1)} s <input type="range" aria-label="V643 Vorschauposition" min="0" max={durationMs} step="80" value={Math.min(durationMs,Math.max(0,sampleTime))} onChange={e=>setPreviewMs(Number(e.target.value))}/></label>
    <button type="button" onClick={()=>setPreviewMs(null)}>Spotify-Songposition folgen</button>
    {stems.map(stem=>{
     const current=sampleVocalStemV643(stem,sampleTime);
     const from=Math.max(0,Math.floor(sampleTime/stem.hopMs)-15);
     return <section key={stem.slot} style={{background:'#17212f',borderRadius:8,padding:9}}>
      <strong>{names[stem.slot]}</strong> · {stem.phrases.length} mögliche Vocal-Phrasen
      <div style={{display:'flex',alignItems:'end',gap:2,height:56,marginTop:8}} role="img" aria-label={`V643 Energie-Vorschau für ${names[stem.slot]}`}>
       {Array.from({length:31},(_,i)=>stem.points[Math.min(stem.points.length-1,from+i)]??[0,0,0]).map((p,i)=><div key={i} title={`Energie ${p[0]} % · Einsatz ${p[1]} % · Periodizität ${p[2]} %`} style={{flex:1,height:`${Math.max(2,p[0])}%`,background:i===15?'#9fe6ff':'#8d97c7',borderRadius:2}}/>)}
      </div>
      <small>Energie {Math.round((current?.energy??0)*100)} % · Einsatz {Math.round((current?.onset??0)*100)} % · Periodizität {Math.round((current?.periodicity??0)*100)} %. Möglicher Vocal-Bereich: {current?.possibleVocal?'Ja':'Nein'}.</small>
      <small>Aktivität {stem.stats.activityPercent} % · periodische Anteile {stem.stats.periodicPercent} % · Signalspitzen {stem.stats.peakPercent} % · Clipping {stem.stats.clippingPercent} %.</small>
      <button type="button" disabled={busy} onClick={()=>setStems(old=>old.filter(s=>s.slot!==stem.slot))}>Diese Stimme entfernen</button>
     </section>;
    })}
    <small>„Vocal-Phrasen“ sind nur signalbasierte Bereiche aus deiner als isoliert gekennzeichneten Datei. Weder Wort- noch Phonem-Zeitmarken, automatische Sängeridentitäten oder garantierte Stimmaktivität werden ermittelt. Die exportierte JSON-Datei enthält keine Musik oder Lyrics und wird nicht automatisch gespeichert.</small>
   </>}
  </>}
 </fieldset>;
}
