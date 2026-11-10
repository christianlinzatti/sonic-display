'use client';
import {useEffect,useRef,useState} from 'react';
import {backgroundJsonV1009} from '@/lib/backgroundJsonV1009';
import {goveeBridgeRequestV909,loadGoveeConfigV909,type GoveeDeviceV909} from '@/lib/goveeLanV909';
import {classifyAlexaServerV1149,classifyAlexaServerErrorV1149,classifyGoveeBridgeV1149,
 classifyGoveeNotConfiguredV1149,classifyGoveeErrorV1149,type DiagnosticV1149} from '@/lib/alexaConnectionDiagnosticsV1149';

const empty:DiagnosticV1149={state:'unknown',summary:'Noch nicht geprüft.',nextStep:'Verbindungstest starten.'};
const TITLES={spotify:'Spotify-Anmeldung',relay:'Alexa-Relay / Redis',govee:'Lokale Govee-Bridge'};
const INFO:Record<DiagnosticV1149['state'],string>={
 ok:'Bestätigt',attention:'Einrichtung nötig',error:'Problem erkannt',unknown:'Nicht bestätigt'
};
type Results={spotify:DiagnosticV1149;relay:DiagnosticV1149;govee:DiagnosticV1149};
type Health={ok?:boolean;devices?:number;onlineDevices?:number};
export function AlexaConnectionWizardV1149(){
 const [results,setResults]=useState<Results>({spotify:empty,relay:empty,govee:empty});
 const [running,setRunning]=useState(false),[lastCheck,setLastCheck]=useState<number|null>(null);
 const runId=useRef(0),abortRef=useRef<AbortController|null>(null);
 useEffect(()=>()=>{runId.current++;abortRef.current?.abort();},[]);
 const run=async()=>{
  if(running)return;
  const id=++runId.current;
  const controller=new AbortController();abortRef.current=controller;
  const put=(patch:Partial<Results>)=>{if(id===runId.current&&!controller.signal.aborted)setResults(v=>({...v,...patch}));};
  setRunning(true);setLastCheck(null);
  setResults({
   spotify:{...empty,summary:'Prüfung läuft …'},
   relay:{...empty,summary:'Prüfung läuft …'},
   govee:{...empty,summary:'Prüfung läuft …'}
  });
  const server=async()=>{
   try{
    const response=await backgroundJsonV1009('/api/alexa/status',{cache:'no-store',signal:controller.signal},12000);
    const data:unknown=await response.json();
    put(classifyAlexaServerV1149(response.status,data));
   }catch{put(classifyAlexaServerErrorV1149());}
  };
  const bridge=async()=>{
   try{
    const cfg=loadGoveeConfigV909();
    const missing=classifyGoveeNotConfiguredV1149(cfg);
    if(missing){put({govee:missing});return;}
    const health=await goveeBridgeRequestV909<Health>(cfg,'/health');
    if(health.ok!==true||!cfg.enabled||cfg.selectedIps.length===0){
     put({govee:classifyGoveeBridgeV1149(cfg,health)});return;
    }
    const list=await goveeBridgeRequestV909<{devices:GoveeDeviceV909[]}>(cfg,'/devices');
    const current=loadGoveeConfigV909();
    if(current.endpoint!==cfg.endpoint||current.token!==cfg.token||current.enabled!==cfg.enabled||
      JSON.stringify(current.selectedIps)!==JSON.stringify(cfg.selectedIps)){
      put({govee:{state:'unknown',summary:'Govee-Konfiguration während der Prüfung geändert.',
       nextStep:'Mit der neuen Auswahl erneut testen.'}});return;
    }
    put({govee:classifyGoveeBridgeV1149(cfg,health,list.devices)});
   }catch{put({govee:classifyGoveeErrorV1149()});}
  };
  try{await Promise.all([server(),bridge()]);}
  finally{if(id===runId.current){abortRef.current=null;setRunning(false);setLastCheck(Date.now());}}
 };
 return <fieldset aria-label="V1149 Verbindungstest Alexa Spotify Govee">
  <legend>V1149 · Verbindungstest in drei Schritten</legend>
  <p className="settings-note">Ein Klick prüft Spotify-Anmeldung, Alexa-Relay und die Govee-Bridge unabhängig. Es werden ausschließlich lesende Statusabfragen ausgeführt: keine Geräte gescannt, keine Lampen geschaltet und keine Spotify-Wiedergabe gestartet. Der Alexa-Skill auf dem Echo kann hier nicht direkt getestet werden.</p>
  <div className="govee-v958-settings">
   <button type="button" disabled={running} onClick={()=>void run()}>
    {running?'Prüfe Verbindungen…':'Alle drei Verbindungen prüfen'}
   </button>
  </div>
  <ol>{(['spotify','relay','govee'] as const).map(key=>{
   const item=results[key];
   return <li key={key}>
    <strong>{TITLES[key]} · {INFO[item.state]}</strong>
    <p className="settings-note">{item.summary}</p>
    <small>Nächster Schritt: {item.nextStep}</small>
   </li>;
  })}</ol>
  <p role="status" className="settings-note">
   {running?'Statusprüfung läuft.':lastCheck!==null?
    `Letzte Prüfung: ${new Date(lastCheck).toLocaleTimeString('de-AT')}. Kein Hardwarebefehl wurde ausgeführt.`:
    'Noch kein Verbindungstest ausgeführt.'}
  </p>
 </fieldset>;
}
