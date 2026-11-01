/** V694 browser-only storage adapter. No server persistence, cookies or network. */
import {decodeV694Archive,emptyV694Archive,encodeV694Archive,V694_STORAGE_KEY,type V694Archive} from './concertQualityHistoryV694';
export type V694Read={archive:V694Archive;available:boolean;corrupt:boolean;notice:string};
export function loadV694History():V694Read{
 if(typeof window==='undefined')return {archive:emptyV694Archive(),available:false,corrupt:false,notice:'Nur im Browser verfügbar.'};
 try{
  const raw=window.localStorage.getItem(V694_STORAGE_KEY);
  if(raw===null)return {archive:emptyV694Archive(),available:true,corrupt:false,notice:''};
  const archive=decodeV694Archive(raw);
  return archive?{archive,available:true,corrupt:false,notice:''}:
   {archive:emptyV694Archive(),available:true,corrupt:true,notice:'Gespeicherte QA-Historie hat ein ungültiges/älteres Format. Sie wird nicht überschrieben: zum Ersetzen bewusst JSON importieren oder lokale Historie löschen.'};
 }catch{return {archive:emptyV694Archive(),available:false,corrupt:false,notice:'Browser-Speicher blockiert: Änderungen bleiben nur bis zum Schließen der QA-Ansicht erhalten.'};}
}
export function persistV694History(archive:V694Archive):boolean{
 const raw=encodeV694Archive(archive);if(raw===null||typeof window==='undefined')return false;
 try{window.localStorage.setItem(V694_STORAGE_KEY,raw);return true;}catch{return false;}
}
