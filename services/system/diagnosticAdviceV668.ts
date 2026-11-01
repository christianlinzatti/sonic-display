/** V668: deterministic, read-only diagnostic suggestions based on V667 observed status.
 * No credentials, network calls, persistent writes or guesses about availability.
 */
export type DiagnosticRowV668 = {
  id:string; label:string; configured:boolean|null; enabled:boolean|null;
  health:"ok"|"warning"|"error"|"unknown"; detail:string; group:"live"|"local"|"external";
};
export type DiagnosticSeverityV668 = "critical"|"warning"|"info";
export type DiagnosticRouteV668 = "audio"|"avatar"|"display"|"diagnostics";
export type DiagnosticAdviceV668 = {
  id:string; severity:DiagnosticSeverityV668; title:string; explanation:string;
  action:string; route?:DiagnosticRouteV668; type:"navigate"|"refresh"|"server"|"none";
};
export type DiagnosticOptionsV668 = { serverError:boolean; serverLoaded:boolean; showOptional?:boolean };
const optionalIds = new Set(["genius","lastfm","theaudiodb","flickr","blob","admin","push","spotify-lyrics"]);
const optionalInstructions:Readonly<Record<string,string>>={
  genius:"Optionalen Genius-API-Zugriff in der Server-Konfiguration einrichten; anschließend den Status aktualisieren.",
  lastfm:"Optionalen Last.fm-API-Schlüssel auf dem Server hinterlegen, wenn zusätzliche Genre-Metadaten gewünscht sind.",
  theaudiodb:"TheAudioDB-Integration in der Server-Konfiguration einrichten, wenn du zusätzliche Musikdaten nutzen möchtest.",
  flickr:"Optionalen Flickr-Zugriff konfigurieren, wenn Künstlerbilder verwendet werden sollen.",
  blob:"Vercel-Blob-Zugang auf dem Server konfigurieren, wenn Cloud-Uploads benötigt werden.",
  admin:"Admin-Zugang und Session-Schutz auf dem Server konfigurieren, wenn die Avatar-Administration genutzt werden soll.",
  push:"Web-Push-Serverkonfiguration vervollständigen, wenn Browser-Benachrichtigungen genutzt werden sollen.",
  "spotify-lyrics":"Spotify Color Lyrics ist optional und verwendet eine undokumentierte Schnittstelle. Nur bewusst aktivieren, wenn du diese Einschränkung akzeptierst."
};
const priority:Record<DiagnosticSeverityV668,number>={critical:0,warning:1,info:2};
export function diagnoseDashboardV668(rows:ReadonlyArray<DiagnosticRowV668>,options:DiagnosticOptionsV668):DiagnosticAdviceV668[]{
  const byId=new Map(rows.map(row=>[row.id,row]));
  const result:DiagnosticAdviceV668[]=[];
  const add=(item:DiagnosticAdviceV668)=>{if(!result.some(found=>found.id===item.id))result.push(item);};
  const spotify=byId.get("spotify-live");
  if(options.serverError){
    add({id:"status-server",severity:"warning",title:"Serverstatus nicht abrufbar",
      explanation:"Die Konfigurationsübersicht konnte nicht geladen werden. Über externe Dienste lässt sich daher keine verlässliche Aussage treffen.",
      action:"Status erneut abrufen",type:"refresh"});
  }
  if(spotify?.configured===false){
    add({id:"spotify-config",severity:"critical",title:"Spotify-Konfiguration unvollständig",
      explanation:"Prüfe die OAuth-Clientdaten, Rückrufadresse und Session-Konfiguration in der Server-Umgebung. Werte nicht im Browser eingeben oder veröffentlichen.",
      action:"Server-Konfiguration prüfen",type:"server"});
  }else if(spotify?.health==="error"){
    add({id:"spotify-error",severity:"critical",title:"Spotify meldet einen Verbindungsfehler",
      explanation:"Prüfe Spotify-Anmeldung, Rückrufadresse und Token-Aktualisierung. Die Ursache ist anhand dieser Statusdaten nicht sicher bestimmbar.",
      action:"Spotify-Verbindung prüfen",type:"server"});
  }else if(spotify?.configured===true&&spotify.health==="unknown"&&spotify.enabled===true){
    add({id:"spotify-unknown",severity:"info",title:"Spotify noch nicht als verbunden bestätigt",
      explanation:"Die Server-Zugangsdaten sind vorhanden, aber eine aktuelle erfolgreiche Wiedergabeantwort fehlt. Bitte Spotify verbinden oder eine Wiedergabe starten.",
      action:"Status erneut abrufen",type:"refresh"});
  }
  const mic=byId.get("mic");
  if(mic?.enabled===true&&(mic.health==="error"||mic.health==="warning")){
    add({id:"mic-active",severity:"warning",title:"Mikrofonanalyse benötigt Aufmerksamkeit",
      explanation:"Prüfe die Browserberechtigung, das ausgewählte Mikrofon und ob das Gerät tatsächlich Audio liefert. Zugriff ist nur mit deiner Freigabe möglich.",
      action:"Audio-Einstellungen öffnen",type:"navigate",route:"audio"});
  }
  const motion=byId.get("motion");
  if(motion?.enabled===true&&motion.configured===false){
    add({id:"motions-empty",severity:"warning",title:"Keine installierten Motions für die Automatik",
      explanation:"Die automatische Tanzwahl ist aktiv, aber es sind keine Motion-Einträge vorhanden. Installiere passende GLB-Animationen, bevor du einen Wechsel erwartest.",
      action:"Avatar- & Motion-Einstellungen",type:"navigate",route:"avatar"});
  }
  const genre=byId.get("genre-auto");
  if(genre?.enabled===true&&genre.health==="warning"){
    add({id:"genre-unknown",severity:"warning",title:"Automatisches Tanzgenre nicht bestimmt",
      explanation:"Es liegt noch kein bestätigtes Genre vor. Prüfe die Metadatenquelle oder lege bei Bedarf den Stil selbst fest; die App rät keinen Genre-Wert.",
      action:"Genre-Einstellungen öffnen",type:"navigate",route:"avatar"});
  }
  const lyrics=byId.get("lyrics-live");
  if(lyrics?.enabled===true&&lyrics.health==="unknown"&&lyrics.detail.includes("Für diesen Song")){
    add({id:"lyrics-missing",severity:"info",title:"Lyrics für diesen Song noch nicht bestätigt",
      explanation:"Es kann an einer laufenden Suche oder fehlender Provider-Abdeckung liegen. Prüfe zuerst die Lyrics-Anzeige; ein externer Dienst wurde nicht eigens getestet.",
      action:"Lyrics-Einstellungen öffnen",type:"navigate",route:"display"});
  }
  const rawErrors=rows.filter(r=>r.health==="error"&&!(["spotify-live","mic"].includes(r.id)));
  for(const row of rawErrors.slice(0,3)){
    add({id:`runtime-${row.id}`,severity:"warning",title:`${row.label}: gemeldeter Fehler`,
      explanation:"Die vorhandene Laufzeitmeldung weist auf einen Fehler hin. Das Dashboard kann die Ursache nicht ohne weitere Diagnosedaten bestätigen.",
      action:"Performance-Diagnose öffnen",type:"navigate",route:"diagnostics"});
  }
  if(options.showOptional&&options.serverLoaded){
    for(const row of rows){
      if(row.group!=="external"||!optionalIds.has(row.id)||row.configured!==false)continue;
      add({id:`optional-${row.id}`,severity:"info",title:`${row.label}: optional nicht eingerichtet`,
        explanation:optionalInstructions[row.id]??"Optionale Integration kann bei Bedarf konfiguriert werden.",
        action:"Server-Konfiguration prüfen",type:"server"});
    }
  }
  return result.sort((a,b)=>priority[a.severity]-priority[b.severity]||a.id.localeCompare(b.id));
}
