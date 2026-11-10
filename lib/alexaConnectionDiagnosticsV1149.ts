/** V1149: read-only, privacy-safe Alexa setup diagnostics.
 * Pure interpretation of existing Spotify/relay status and local Govee health.
 * No secret values, raw device IDs, network operations or hardware commands.
 */
export type DiagnosticStateV1149='ok'|'attention'|'error'|'unknown';
export type DiagnosticV1149={state:DiagnosticStateV1149;summary:string;nextStep:string};
export type ServerDiagnosticsV1149={spotify:DiagnosticV1149;relay:DiagnosticV1149};
const result=(state:DiagnosticStateV1149,summary:string,nextStep:string):DiagnosticV1149=>({state,summary,nextStep});
const object=(value:unknown):Record<string,unknown>=>value&&typeof value==='object'&&!Array.isArray(value)?value as Record<string,unknown>:{};
const unknownSpotify=()=>result('unknown','Spotify-Status nicht bestätigt.','Verbindung und Vercel-Deployment prüfen; danach erneut testen.');
const unknownRelay=()=>result('unknown','Alexa-Relay nicht geprüft.','Zuerst die Spotify-Verbindung herstellen und dann erneut prüfen.');

export function classifyAlexaServerV1149(status:number,payload:unknown):ServerDiagnosticsV1149{
 const data=object(payload);
 if(status===401||data.spotify===false)
  return {spotify:result('attention','Spotify-Anmeldung fehlt oder ist abgelaufen.','Spotify unter Einstellungen neu verbinden.'),
   relay:unknownRelay()};
 if(data.spotify!==true)
  return {spotify:unknownSpotify(),relay:unknownRelay()};
 const spotify=result('ok','Spotify vom Server bestätigt.'+(data.artistScopes===true?' Künstler-Freigaben vorhanden.':data.artistScopes===false?' Künstler-Freigaben fehlen.':''),
  data.artistScopes===false?'Für Künstlerbefehle Spotify mit den nötigen Berechtigungen neu verbinden.':'Kein weiterer Schritt für die Spotify-Anmeldung erforderlich.');
 if(data.relay==='ready'&&status>=200&&status<300)
  return {spotify,relay:result('ok','Signiertes Alexa-Relay und Redis vom Server erreichbar.',
   'Amazon Alexa-Skill und Lambda sind dadurch nicht getestet. Sprachbefehl später separat am Echo prüfen.')};
 if(data.relay==='not-configured')
  return {spotify,relay:result('attention','Alexa-Relay auf dem Server nicht vollständig konfiguriert.',
   'ALEXA_BRIDGE_SECRET und die Redis/Upstash-Umgebungsvariablen in Vercel prüfen.')};
 if(data.relay==='unavailable')
  return {spotify,relay:result('error','Alexa-Relay oder Redis momentan nicht erreichbar.',
   'Upstash-Zugang, Vercel-Logs und Serverkonfiguration prüfen.')};
 return {spotify,relay:result('unknown','Alexa-Relay-Status nicht eindeutig.',
  'Verbindung erneut testen und die Vercel-Logs prüfen.')};
}
export function classifyAlexaServerErrorV1149():ServerDiagnosticsV1149{
 return {spotify:unknownSpotify(),relay:result('unknown','Alexa-Relay nicht erreichbar oder Diagnose unterbrochen.',
  'Netzwerk und das Vercel-Deployment prüfen. Keine Befehle wurden ausgeführt.')};
}
export type GoveeProbeConfigV1149={
 enabled:boolean;selectedIps:readonly string[];
};
export function classifyGoveeBridgeV1149(
 config:GoveeProbeConfigV1149,
 health:unknown,
 devices?:unknown
):DiagnosticV1149{
 const h=object(health);
 if(h.ok!==true)
  return result('error','Govee-Bridge antwortet, aber UDP ist nicht als betriebsbereit bestätigt.',
   'Bridge-/UDP-Diagnose am PC oder Raspberry Pi prüfen. Es wurden keine Lampen geschaltet.');
 if(!config.enabled)return result('attention','Govee-Bridge erreichbar, aber Lichtintegration ist ausgeschaltet.',
  'Unter Einstellungen → Govee LAN die Integration bei Bedarf aktivieren.');
 if(config.selectedIps.length===0)return result('attention','Govee-Bridge erreichbar; noch keine Leuchte ausgewählt.',
  'Unter Einstellungen → Govee LAN die gewünschten Lampen auswählen.');
 if(!Array.isArray(devices))
  return result('unknown','Govee-Bridge erreichbar; Auswahl und Gerätepräsenz nicht bestätigt.',
   'Geräteliste im Govee-LAN-Tab prüfen und Verbindungstest erneut ausführen.');
 const live=new Set(devices.filter(x=>{
  const d=object(x);
  return typeof d.ip==='string'&&d.online===true;
 }).map(x=>object(x).ip as string));
 const online=config.selectedIps.filter(ip=>live.has(ip)).length;
 if(online===config.selectedIps.length)
  return result('ok',`Bridge und ${online} von ${config.selectedIps.length} ausgewählten Lampen zuletzt erreichbar.`,
   'Eine bestätigte Farb- oder Schaltreaktion ist damit noch nicht bewiesen. Status separat prüfen.');
 return result('attention',`Bridge erreichbar; ${online} von ${config.selectedIps.length} ausgewählten Lampen zuletzt erreichbar.`,
  'Leuchten einschalten, WLAN/LAN prüfen und ggf. Gerätesuche im Govee-Tab manuell ausführen.');
}
export function classifyGoveeNotConfiguredV1149(config:{token:string;selectedIps:readonly string[]}):DiagnosticV1149|null{
 if(!config.token.trim())return result('attention','Kein Govee-Bridge-Token gespeichert.',
  'Bridge-Token unter Einstellungen → Govee LAN hinterlegen. Der Test sendet ihn nur an die lokale Bridge.');
 return null;
}
export function classifyGoveeErrorV1149():DiagnosticV1149{
 return result('error','Die lokale Govee-Bridge ist nicht erreichbar oder lehnt den Zugriff ab.',
  'Bridge-Dienst und Token prüfen; im Browser ggf. Zugriff auf das lokale Netzwerk erlauben.');
}
