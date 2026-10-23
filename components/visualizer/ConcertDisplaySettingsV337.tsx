"use client";
import {useState} from "react";
import {readConcertDisplayV337,saveConcertDisplayV337,type ConcertDisplaySettingsV337} from "@/services/stageContent/concertDisplayV337";
export function ConcertDisplaySettingsV337(){
 const [value,setValue]=useState(readConcertDisplayV337);
 const update=(patch:Partial<ConcertDisplaySettingsV337>)=>setValue(saveConcertDisplayV337({...value,...patch}));
 return <fieldset><legend>V337 – Konzertanzeige gestalten</legend>
  <p>Alle Konzertleinwände verwenden diese Vorlage. Eventbilder werden nur angezeigt, wenn der Datenanbieter ein gültiges Bild liefert.</p>
  <label>Darstellung <select value={value.style} onChange={e=>update({style:e.target.value as ConcertDisplaySettingsV337['style']})}><option value="spotlight">Spotlight – großes Event</option><option value="agenda">Agenda – mehrere Termine</option></select></label>
  <label className="setting-check"><input type="checkbox" checked={value.showPoster} onChange={e=>update({showPoster:e.target.checked})}/> Eventplakate anzeigen, wenn verfügbar</label>
  <label className="setting-check"><input type="checkbox" checked={value.showTicketStatus} onChange={e=>update({showTicketStatus:e.target.checked})}/> Ticketstatus anzeigen, wenn bekannt</label>
  <label>Einblendung ({value.transitionMs} ms) <input type="range" min="0" max="1500" step="50" value={value.transitionMs} onChange={e=>update({transitionMs:Number(e.target.value)})}/></label>
  <small>Der Bildschirm ist nicht klickbar; verfügbare Ticketlinks werden weiterhin in den API-Daten bereitgestellt.</small>
 </fieldset>
}
