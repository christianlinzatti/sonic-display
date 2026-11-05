/** V971: display-only readiness diagnostics. No hardware actions or credentials. */
export type BridgeStateV971='unchecked'|'connected'|'offline';
export type SetupStateV971='ready'|'action'|'unknown';
export type SetupStepV971={id:string;label:string;state:SetupStateV971;detail:string};
export type SetupSnapshotV971={
 bridgeState:BridgeStateV971;
 bridgeHealthy:boolean;
 tokenPresent:boolean;
 selectedDevices:number;
 onlineDevices:number;
 syncEnabled:boolean;
 alexaReceiverEnabled:boolean;
 alexaGoveeAllowed:boolean;
};
export function buildIntegrationStepsV971(input:SetupSnapshotV971):SetupStepV971[]{
 const bridgeOnline=input.bridgeState==='connected'&&input.bridgeHealthy;
 const devicesReady=bridgeOnline&&input.selectedDevices>0&&input.onlineDevices>0;
 return [
  {id:'bridge',label:'Govee-LAN-Bridge',state:bridgeOnline?'ready':'action',
   detail:bridgeOnline?'Lokal erreichbar; Bridge antwortet.':'Bridge auf Windows oder Raspberry Pi starten und Verbindung prüfen.'},
  {id:'token',label:'Lokaler Bridge-Token',state:input.tokenPresent?'ready':'action',
   detail:input.tokenPresent?'Token eingetragen (nicht angezeigt).':'Token bewusst mit show-token.cmd (Windows) oder bash show-token.sh (Pi) anzeigen und eintragen.'},
  {id:'devices',label:'Govee-Lampen',state:devicesReady?'ready':'action',
   detail:devicesReady?`${input.onlineDevices} zuletzt erreichbare Lampe(n); ${input.selectedDevices} ausgewählt.`:
    'Govee LAN Control aktivieren, Geräte suchen und erreichbare Lampen auswählen.'},
  {id:'sync',label:'Govee-Musik-Synchronisation',state:devicesReady&&input.syncEnabled?'ready':'action',
   detail:'Govee-Lichtintegration und Musik-Synchronisation müssen ausdrücklich eingeschaltet sein.'},
  {id:'alexaReceiver',label:'Alexa-Empfang im Konzertstudio',state:input.alexaReceiverEnabled?'ready':'action',
   detail:input.alexaReceiverEnabled?'Empfang lokal eingeschaltet; kein Cloud-Verbindungstest.':
    'Im Konzertstudio den Alexa-Empfang separat aktivieren.'},
  {id:'consent',label:'Separate Alexa-Govee-Freigabe',state:input.alexaGoveeAllowed?'ready':'action',
   detail:'Diese Freigabe erlaubt nur sanfte Looks bei bereits laufender Synchronisation.'},
  {id:'cloud',label:'Amazon Skill / AWS Lambda / Upstash',state:'unknown',
   detail:'Cloud-Verbindung hier nicht bestätigt. Skill, Lambda-Variablen und Relay in Alexa-Konsole testen.'},
 ];
}
export function setupProgressV971(steps:SetupStepV971[]):{completed:number;total:number;cloudVerified:boolean}{
 return {completed:steps.filter(step=>step.state==='ready').length,
  total:steps.filter(step=>step.state!=='unknown').length,cloudVerified:false};
}
