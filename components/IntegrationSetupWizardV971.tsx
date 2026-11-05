'use client';
import {useEffect,useMemo,useState} from 'react';
import {buildIntegrationStepsV971,setupProgressV971,type BridgeStateV971} from '@/lib/integrationSetupV971';
import {ALEXA_LOCAL_ENABLED_KEY_V967} from '@/lib/alexaConcertV967';
import {ALEXA_GOVEE_CONSENT_EVENT_V970,loadAlexaGoveeConsentV970} from '@/lib/alexaGoveeV970';
import type {GoveeConfigV909} from '@/lib/goveeLanV909';

type Props={config:GoveeConfigV909;bridgeState:BridgeStateV971;bridgeHealthy:boolean;
 onlineDevices:number;busy:boolean;onCheck:()=>void;onScan:()=>void};
const LOCAL_EVENT='sonic-display:alexa-local-status-v971';
function currentAlexaReceiver(){
 try{const saved=JSON.parse(localStorage.getItem(ALEXA_LOCAL_ENABLED_KEY_V967)||'null') as {enabled?:boolean;since?:number}|null;
  return saved?.enabled===true&&typeof saved.since==='number'&&saved.since>0&&saved.since<=Date.now();
 }catch{return false;}
}
/** Display-only setup coach. The user must opt into hardware/voice in existing panels. */
export function IntegrationSetupWizardV971({config,bridgeState,bridgeHealthy,onlineDevices,busy,onCheck,onScan}:Props){
 const [receiver,setReceiver]=useState(false);
 const [consent,setConsent]=useState(false);
 const [details,setDetails]=useState(false);
 useEffect(()=>{
  const refresh=()=>{setReceiver(currentAlexaReceiver());setConsent(loadAlexaGoveeConsentV970().enabled);};
  const storage=(event:StorageEvent)=>{if(!event.key||event.key===ALEXA_LOCAL_ENABLED_KEY_V967||event.key==='sonic-display:alexa-govee-consent-v970')refresh();};
  refresh();window.addEventListener('storage',storage);window.addEventListener(LOCAL_EVENT,refresh);
  window.addEventListener(ALEXA_GOVEE_CONSENT_EVENT_V970,refresh);
  return()=>{window.removeEventListener('storage',storage);window.removeEventListener(LOCAL_EVENT,refresh);
   window.removeEventListener(ALEXA_GOVEE_CONSENT_EVENT_V970,refresh);};
 },[]);
 const steps=useMemo(()=>buildIntegrationStepsV971({bridgeState,bridgeHealthy,tokenPresent:Boolean(config.token.trim()),
  selectedDevices:config.selectedIps.length,onlineDevices,
  syncEnabled:config.enabled&&config.autoSync,alexaReceiverEnabled:receiver,alexaGoveeAllowed:consent}),
  [bridgeState,bridgeHealthy,config.token,config.selectedIps.length,config.enabled,config.autoSync,onlineDevices,receiver,consent]);
 const progress=setupProgressV971(steps);
 return <section id="v971-integration-wizard" aria-label="V971 Einrichtungsassistent Alexa und Govee" className="v971-setup-wizard">
  <h3>V971 · Alexa &amp; Govee Einrichtungsassistent</h3>
  <p className="settings-note">{progress.completed} von {progress.total} lokalen Einrichtungsschritten erfüllt. Die Alexa-Cloud bleibt bis zum echten Echo-/Lambda-Test <strong>ungeprüft</strong>.</p>
  <div className="govee-v909-actions">
   <button type="button" disabled={busy||!config.token.trim()} onClick={onCheck}>Bridge-Verbindung prüfen</button>
   <button type="button" disabled={busy||bridgeState!=='connected'} onClick={onScan}>Geräte suchen</button>
   <button type="button" onClick={()=>setDetails(value=>!value)} aria-expanded={details}>Einrichtung {details?'ausblenden':'anzeigen'}</button>
  </div>
  <ol className="v971-setup-steps">
   {steps.map(step=><li key={step.id}>
    <strong>{step.state==='ready'?'✓ ':step.state==='unknown'?'? ':'○ '}{step.label}</strong>
    <span className="settings-note">{step.detail}</span>
   </li>)}
  </ol>
  {details&&<div className="v971-setup-guide">
   <p><strong>1. Windows:</strong> Das separat beigelegte Paket <code>SonicDisplay-Govee-LAN-Bridge-Windows-V971.zip</code> entpacken,
    <code>start-govee-bridge.cmd</code> ausführen und danach <code>show-token.cmd</code> zum bewussten Anzeigen des Tokens starten.
    Für eine gehostete Sonic-Display-Seite <code>start-for-vercel.cmd</code> mit deiner exakten HTTPS-Origin verwenden.</p>
   <p><strong>1b. Raspberry Pi:</strong> Das Paket <code>SonicDisplay-Govee-LAN-Bridge-RaspberryPi-V971.zip</code> auf dem Pi entpacken,
    dann <code>bash start-govee-bridge.sh</code> oder für die Vercel-Seite
    <code>bash start-for-vercel.sh https://deine-app.vercel.app</code> ausführen.
    Mit <code>bash check-bridge.sh</code> den Dienst prüfen und mit <code>bash show-token.sh</code> das lokale Token bewusst anzeigen.
    Bei bereits installiertem V910-Kiosk zuerst <code>systemctl --user status sonic-govee-bridge-v910.service</code> prüfen:
    keine zweite Bridge am selben Port starten. Chromium muss auf demselben Pi laufen.</p>
   <p><strong>2. LAN:</strong> Token oben eintragen, Bridge prüfen, Geräte suchen, Lampen auswählen. Dann Govee-Integration und Musik-Sync bewusst einschalten.
    Der Bridge-Test liest nur Statusinformationen und sendet keine Farb- oder Power-Kommandos.</p>
   <p><strong>3. Alexa:</strong> In der <a href="https://developer.amazon.com/alexa/console/ask" target="_blank" rel="noopener noreferrer">Alexa Developer Console</a> das Sprachmodell aus <code>integrations/alexa/interaction-model.de-DE.json</code> importieren,
    die Lambda-Funktion aus <code>integrations/alexa/handler.cjs</code> einrichten und die Skill-ID sowie den eigenen Alexa-Benutzer erlauben.
    Signatur-Secret und Upstash-Variablen nur in AWS bzw. Vercel speichern, nie im Browser oder Projekt-ZIP.</p>
   <p><strong>4. Freigabe:</strong> Im Ultimate Concert Experience Studio Alexa-Empfang und die gesonderte Govee-Freigabe aktivieren; anschließend eine echte Sprachprobe mit laufender Musik durchführen.
    Alexa-Schaltbefehle für Stromversorgung und Spotify bleiben gesperrt.</p>
  </div>}
 </section>;
}
