'use client';
import {useRef,useState} from 'react';
import {readBackupV732} from '@/lib/lastfm-explorer-v732';
export function ExplorerBackupFileV732({onText}:{onText:(text:string)=>void}){
 const [status,setStatus]=useState(''),sequence=useRef(0);
 async function read(files:FileList|null){const id=++sequence.current;if(!files||files.length!==1){setStatus('Bitte genau eine JSON-Datei wählen.');return;}try{const text=await readBackupV732(files[0]);if(id===sequence.current){onText(text);setStatus('Datei geladen. Bitte den Import prüfen.');}}catch{if(id===sequence.current)setStatus('Datei konnte nicht gelesen werden oder ist größer als 200 KB.');}}
 return <div onDragOver={e=>e.preventDefault()} onDrop={e=>{e.preventDefault();void read(e.dataTransfer.files);}} style={{border:'1px dashed currentColor',padding:12}}><label>Backup-Datei auswählen oder hier ablegen<input type="file" accept=".json,application/json" onChange={e=>{void read(e.target.files);e.target.value='';}}/></label><p role="status">{status}</p></div>;
}
