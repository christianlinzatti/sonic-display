/** V929 – Smart Govee Troubleshooting Assistant.
 * Deterministic, read-only diagnosis from the existing V928 dashboard snapshot.
 * No network calls, timers, browser storage, commands or automatic configuration changes.
 * All descriptions are static: never interpolate device IPs, token, endpoint, names or raw UDP errors.
 */
import type {GoveeConfigV909} from '@/lib/goveeLanV909';
import type {GoveeDashboardV928,GoveeDashboardHealthV928,GoveeDashboardDeviceV928} from '@/lib/goveeRoomDashboardV928';

export type GoveeDiagnosticSeverityV929='critical'|'warning'|'info';
export type GoveeDiagnosticCategoryV929='bridge'|'device'|'music'|'show'|'timing';
export type GoveeSymptomV929='automatic'|'no-light'|'no-bass'|'wrong-timing'|'no-show';
export type GoveeDiagnosticV929={
 id:string;code:string;severity:GoveeDiagnosticSeverityV929;category:GoveeDiagnosticCategoryV929;
 title:string;description:string;steps:readonly string[];targetId?:string;fixtureNumber?:number;
};
export type GoveeTroubleshootingResultV929={
 schema:'govee-troubleshooting-v929';status:'action-required'|'check-recommended'|'configured';
 criticalCount:number;warningCount:number;infoCount:number;issues:GoveeDiagnosticV929[];
};
export type GoveeTroubleshootingInputV929={
 dashboard:GoveeDashboardV928;config:GoveeConfigV909;health:GoveeDashboardHealthV928|null;
};
export type GoveeSymptomGuideV929={id:GoveeSymptomV929;title:string;description:string;steps:readonly string[]};

const modelName=(model:string):string=>['H6063','H610B','H61A2','H6051'].includes(model)?model:'Govee';
const modelHint=(model:string):string=>{
 switch(model){
  case 'H6063':return 'Bei den H6063-Wandelementen LAN Control in der Govee-App prüfen, sofern die installierte Firmware diese Option unterstützt.';
  case 'H610B':return 'Beim H610B-Lichtstreifen LAN Control und die WLAN-Verbindung in der Govee-App kontrollieren, sofern unterstützt.';
  case 'H61A2':return 'Bei der H61A2-Neonleuchte kontrollieren, ob Modell und Firmware die Govee-LAN-Steuerung tatsächlich unterstützen.';
  case 'H6051':return 'Bei H6051 in der Govee-App WLAN und gegebenenfalls die verfügbare LAN-Control-Option prüfen.';
  default:return 'Modell- und Firmware-Kompatibilität mit Govee LAN Control prüfen; nicht jedes Govee-Modell unterstützt dieses Protokoll.';
 }
};
const severityRank:Record<GoveeDiagnosticSeverityV929,number>={critical:0,warning:1,info:2};
/** Pure function; uses only documented readiness signals, never infers real light output. */
export function buildGoveeTroubleshootingV929(input:GoveeTroubleshootingInputV929):GoveeTroubleshootingResultV929{
 const {dashboard:d,config,health}=input;
 const issues:GoveeDiagnosticV929[]=[];
 const add=(code:string,severity:GoveeDiagnosticSeverityV929,category:GoveeDiagnosticCategoryV929,
  title:string,description:string,steps:readonly string[],targetId?:string,fixtureNumber?:number)=>{
  issues.push({id:fixtureNumber===undefined?code:`${code}-${fixtureNumber}`,code,severity,category,title,
   description,steps,targetId,fixtureNumber});
 };
 if(!config.token.trim())add('TOKEN_MISSING','critical','bridge','Bridge-Token fehlt',
  'Die lokale Bridge kann ohne ihren Zugangstoken nicht authentifiziert angesprochen werden.',[
   'Auf dem Raspberry Pi im Projektverzeichnis npm run pi:token ausführen.',
   'Den ausgegebenen Token ausschließlich in das Passwortfeld „Bridge-Token“ übernehmen.',
   '„Verbindung prüfen“ anklicken. Den Token nicht in Screenshots oder Diagnoseberichte übernehmen.'
  ],'govee-v909-auth');
 if(d.bridge==='unchecked')add('BRIDGE_UNCHECKED','info','bridge','Bridge noch nicht geprüft',
  'Es liegt keine bestätigte Verbindungsmessung vor – das ist noch kein Fehler.',[
   'Prüfen, ob die lokale Bridge auf dem Raspberry Pi gestartet wurde.',
   '„Verbindung prüfen“ anklicken und die Browserfreigabe für das lokale Netzwerk erteilen, falls danach gefragt wird.'
  ],'govee-v909-connect');
 if(d.bridge==='offline')add('BRIDGE_OFFLINE','critical','bridge','Govee-Bridge nicht erreichbar',
  'Der letzte Verbindungsversuch war nicht erfolgreich. Daraus lässt sich die genaue Ursache noch nicht bestimmen.',[
   'Auf dem Raspberry Pi kontrollieren, ob der V910-Bridge-Dienst läuft.',
   'Die Bridge-Adresse im Govee-Bereich kontrollieren; im Pi-Chromium normalerweise http://127.0.0.1:8765.',
   'Token und gegebenenfalls die Freigabe für den lokalen/Loopback-Netzwerkzugriff im Browser prüfen.',
   'Anschließend „Verbindung prüfen“ erneut ausführen.'
  ],'govee-v909-connect');
 if(d.bridge==='offline'&&health?.udpError) add('UDP_ERROR','warning','bridge','Bridge meldet UDP-Problem',
  'Zusätzlich wurde ein UDP-Fehler signalisiert. Der genaue Fehlertext wird aus Datenschutzgründen nicht übernommen.',[
   'Sicherstellen, dass Bridge und Govee-Leuchten im selben erreichbaren LAN/WLAN sind.',
   'Router-Client-Isolation, Firewall und Govee-LAN-Control-Einstellung prüfen.',
   'Den Geräte-Scan erneut ausführen. Eine erfolgreiche Bridge-Anmeldung allein beweist keine Geräteerreichbarkeit.'
  ],'govee-v909-scan');
 if(d.bridge==='stale')add('STALE_SNAPSHOT','warning','bridge','Statusdaten sind veraltet',
  'Die Geräteinformationen stammen nicht aus einer ausreichend aktuellen Abfrage.',[
   '„Bridge und Geräte jetzt aktualisieren“ anklicken.',
   'Verbindungsstatus und die Zeit der letzten Geräteantwort anschließend erneut ansehen.'
  ],'govee-v909-connect');
 if(d.selectedCount===0)add('NO_SELECTED_DEVICES','warning','device','Keine Leuchte ausgewählt',
  'Ohne ausgewählte LAN-Geräte kann keine Konzertbeleuchtung gesendet werden.',[
   '„Leuchten im LAN suchen“ verwenden oder eine private Geräte-IP manuell hinzufügen.',
   'Anschließend die gewünschten Leuchten in der Geräteliste anhaken.'
  ],'govee-v909-devices');
 if(d.bridge==='connected'){
  d.devices.slice(0,12).forEach((device:GoveeDashboardDeviceV928,index:number)=>{
   const n=index+1;
   const label=`${modelName(device.model)} · Leuchte ${n}`;
   if(device.presence==='unregistered')add('DEVICE_UNREGISTERED','warning','device',`${label} nicht registriert`,
    'Die ausgewählte Leuchte fehlt in der aktuellen Bridge-Geräteliste.',[
     'LAN-Gerätesuche erneut starten; bei Bedarf die IP im Eingabefeld manuell registrieren.',
     modelHint(device.model),
     'Auswahl und tatsächliche UDP-Antwort im Dashboard erneut kontrollieren.'
    ],'govee-v909-scan',n);
   else if(device.presence==='not-seen')add('DEVICE_NOT_RECENT','warning','device',`${label} länger nicht bestätigt`,
    'Seit mehr als 90 Sekunden wurde keine aktuelle UDP-Antwort dieser Leuchte bestätigt.',[
     'Leuchte, WLAN-Verbindung und Stromversorgung kontrollieren.',
     modelHint(device.model),
     'Erneut nach Geräten suchen und einen Statusabruf auslösen. Der Statusabruf misst nicht die sichtbare Lichtwirkung.'
    ],'govee-v909-scan',n);
   else if(device.presence==='unknown')add('DEVICE_UNCONFIRMED','warning','device',`${label} ohne UDP-Nachweis`,
    'Eine registrierte IP oder ein Online-Flag ohne Zeitstempel genügt nicht als Erreichbarkeitsnachweis.',[
     '„Leuchten im LAN suchen“ und danach „Gerätestatus lesen“ ausführen.',
     modelHint(device.model),
     'Bei weiterhin fehlender Antwort lokale Netzwerkerreichbarkeit und unterstützte Firmware kontrollieren.'
    ],'govee-v909-scan',n);
  });
 }
 if(!config.enabled)add('LIGHTING_OFF','info','music','Govee-Lichtintegration ist ausgeschaltet',
  'Dies kann bewusst so eingestellt sein. Für automatische Konzertbeleuchtung muss die Integration aktiviert werden.',[
   'Wenn du automatische Lichteffekte möchtest, den Schalter „Govee-Lichtintegration aktivieren“ einschalten.',
   'Danach die Musik-Synchronisierung separat aktivieren. Nichts wird automatisch umgeschaltet.'
  ],'govee-v909-auto');
 else if(!config.autoSync)add('AUTOSYNC_OFF','warning','music','Musik-Synchronisierung ist ausgeschaltet',
  'Die Bridge kann manuell bedienbar sein, ohne dass automatisch Musiklicht gesendet wird. Manuelle Schaltbefehle deaktivieren die Synchronisierung absichtlich.',[
   'Eine laufende Musikwiedergabe starten.',
   'Wenn gewünscht „Farben und Helligkeit zur laufenden Musik synchronisieren“ einschalten.',
   'Bei erneuten manuellen Farb-/Power-Befehlen die Auto-Sync-Einstellung erneut kontrollieren.'
  ],'govee-v909-auto');
 if(config.showEnabledV912&&!d.showConfigured)add('SHOW_NOT_FOUND','warning','show','Aktive Lichtshow fehlt',
  'Die gewählte V912-Show-ID ist nicht in der gespeicherten Show-Bibliothek vorhanden.',[
   'Im Light Show Editor eine existierende Show auswählen oder eine gespeicherte Vorlage importieren.',
   'Die Show bewusst aktivieren. Bestehende Shows werden vom Assistenten nicht verändert.'
  ],'govee-v912-editor');
 const needsDirector=d.features.some(f=>f.enabled&&f.requires==='director');
 if(needsDirector&&!config.directorEnabledV911)add('DIRECTOR_REQUIRED','warning','show','Lichtregie V911 für aktive Module erforderlich',
  'Mindestens eine eingeschaltete Abschnitts- oder Genre-Funktion benötigt den V911 Director.',[
   'Bei Bedarf im Govee-Bereich die V911-Lichtregie aktivieren.',
   'Für Verse-/Hook-/Drop-Akzente zusätzlich bestätigte V318-Songabschnitte bereitstellen.',
   'Fehlen bestätigte Abschnitte, läuft die vorhandene Ambient-Steuerung weiter.'
  ],'govee-v909-director');
 if(d.features.some(f=>f.enabled&&['v917','v918','v922'].includes(f.id)))add('MICROPHONE_UNVERIFIED','info','music',
  'Mikrofon für Bass-/Beat-Effekte nicht im Dashboard messbar',
  'Aktivierte Bass- oder Beatmodule bedeuten nicht, dass die Mikrofonanalyse gerade Daten liefert.',[
   'Prüfen, ob die Mikrofonanalyse in Sonic Display ausdrücklich eingeschaltet ist.',
   'Browser-Mikrofonberechtigung, ausgewähltes Eingabegerät und anliegendes Audiosignal kontrollieren.',
   'Ohne verlässliche Live-Mikrofonwerte gibt es keine zusätzlichen echten Kick-Impulse.'
  ]);
 if(d.devices.some(device=>device.visualDelayMs>0))add('OPTICAL_DELAY_UNVERIFIED','info','timing',
  'Optische Zeitversätze sind manuell festgelegt',
  'Der V927-Vorlauf beruht auf Einstellungen, nicht auf einer automatischen Messung der sichtbaren LED-Reaktion.',[
   'Lichtwellen zuerst in der Vorschau und anschließend an realen Leuchten vergleichen.',
   'Zeitversätze im V927-Kalibrierungsstudio einzeln und in kleinen Schritten nachführen.',
   'Bridge-Roundtrip-Zeiten nicht als optische LED-Latenz übernehmen.'
  ],'govee-v927-calibration');
 if(!issues.some(issue=>issue.severity!=='info')&&d.readyForSync&&d.recentCount>0){
  add('CONFIGURED_NOT_VERIFIED','info','music','Konfiguration plausibel – Lichtwirkung nicht bestätigt',
   'Die verfügbaren Statusdaten zeigen keinen offensichtlichen Konfigurationsfehler. Sie beweisen weder laufende Musik noch einen sichtbaren Farbwechsel.',[
    'Musik starten und mit einer bewusst gewählten, moderaten Testszene die sichtbare Reaktion überprüfen.',
    'Bei ausbleibender Reaktion das Symptom „Kein Licht“ auswählen und die Schritte durchgehen.'
   ]);
 }
 issues.sort((a,b)=>severityRank[a.severity]-severityRank[b.severity]||a.id.localeCompare(b.id));
 const criticalCount=issues.filter(i=>i.severity==='critical').length;
 const warningCount=issues.filter(i=>i.severity==='warning').length;
 return {schema:'govee-troubleshooting-v929',status:criticalCount?'action-required':warningCount?'check-recommended':'configured',
  criticalCount,warningCount,infoCount:issues.length-criticalCount-warningCount,issues};
}

const symptomGuides:Readonly<Record<Exclude<GoveeSymptomV929,'automatic'>,GoveeSymptomGuideV929>>={
 'no-light':{id:'no-light',title:'Es leuchtet nichts',description:'Schnelle Prüfung, wenn Musik läuft, aber kein sichtbares Govee-Licht folgt.',steps:[
  'Bridge-Verbindung prüfen und mindestens eine Leuchte auswählen.',
  'Im Dashboard eine kürzlich empfangene UDP-Antwort kontrollieren; sie ist noch keine Schaltbestätigung.',
  'Govee-Integration und Musik-Synchronisierung einschalten und die laufende Wiedergabe kontrollieren.',
  'Für einen bewussten manuellen Test die Farbe senden; dabei wird Auto-Sync absichtlich ausgeschaltet und muss danach erneut aktiviert werden.',
  'Bei fehlender manueller Wirkung Govee-LAN-Control, Firmware, WLAN und Router-Client-Isolation prüfen.'
 ]},
 'no-bass':{id:'no-bass',title:'Kein Bass- oder Kick-Effekt',description:'Diagnosehilfe für V917, V918, V922 und Neon-Bass.',steps:[
  'Prüfen, ob Bassreaktion beziehungsweise das gewünschte Bassmodul aktiviert ist.',
  'Mikrofonanalyse ausdrücklich aktivieren und Berechtigung im Browser prüfen.',
  'Richtiges Mikrofon beziehungsweise Loopback-Signal auswählen und Eingangspegel prüfen.',
  'Erkennungsschwelle kontrollieren; fehlende echte Mikrofonimpulse nicht durch erfundene Beats ersetzen.',
  'Die LAN-Senderate ist absichtlich begrenzt; nicht jeder schnelle Hardtekk-Kick wird an die Hardware gesendet.'
 ]},
 'wrong-timing':{id:'wrong-timing',title:'Lichtwellen sind zeitlich versetzt',description:'Für räumliche Lichtwellen und verzögerte Reaktionen einzelner Geräte.',steps:[
  'V926-Raumpositionen und Wellenrichtung mit der wirklichen Aufstellung vergleichen.',
  'V927-Geräteversätze einzeln anhand tatsächlich sichtbarer Reaktionen kalibrieren.',
  'LAN-Status-Roundtrip nicht mit optischer Lichtlatenz verwechseln.',
  'Bei Beat-Vorhersage den V918-Vorlauf konservativ einstellen.',
  'Schnelle Lichtkommandos bleiben durch die bestehende LAN-Senderate begrenzt.'
 ]},
 'no-show':{id:'no-show',title:'Hook-/Drop-Lichtshow bleibt aus',description:'Für inaktive V912-Shows oder fehlende musikalische Abschnitts-Cues.',steps:[
  'Im V912-Editor prüfen, ob die gewünschte Show gespeichert und ausgewählt ist.',
  'V911-Lichtregie und die für die Show benötigten Module bei Bedarf einschalten.',
  'Bestätigte V318-Songabschnitte für den aktuellen Track prüfen; unbestätigte Drops werden nicht erfunden.',
  'Kontrollieren, ob Musik läuft und Govee-Auto-Sync aktiviert ist.',
  'Erst in der lokalen Vorschau prüfen, dann mit moderater Helligkeit am Gerät testen.'
 ]}
};
export function getGoveeSymptomGuideV929(symptom:GoveeSymptomV929):GoveeSymptomGuideV929|null{
 return symptom==='automatic'?null:symptomGuides[symptom];
}
/** Safe report: no IP, endpoint, token, raw errors, names, positions or customer-provided strings. */
export function createGoveeTroubleshootingReportV929(result:GoveeTroubleshootingResultV929,generatedAt:string):string{
 return JSON.stringify({schema:result.schema,generatedAt,status:result.status,
  criticalCount:result.criticalCount,warningCount:result.warningCount,infoCount:result.infoCount,
  diagnostics:result.issues.map(issue=>({code:issue.code,severity:issue.severity,category:issue.category,
   fixtureNumber:issue.fixtureNumber??null}))},null,2);
}
