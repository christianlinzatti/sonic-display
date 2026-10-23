"use client";
import {StageImageGalleryV338} from "./StageImageGalleryV338";
import {useEffect,useState} from "react";
import type {ConcertEventV330} from "@/services/stageContent/stageContentV330";
import {CONCERT_DISPLAY_EVENT_V337,formattedConcertDateV337,displayTicketStatusV337,readConcertDisplayV337} from "@/services/stageContent/concertDisplayV337";
export function ConcertDisplayV337({events,title,reducedMotion=false}:{events:ConcertEventV330[];title:string;reducedMotion?:boolean}) {
 const [settings,setSettings]=useState(readConcertDisplayV337);
 useEffect(()=>{const refresh=()=>setSettings(readConcertDisplayV337());window.addEventListener(CONCERT_DISPLAY_EVENT_V337,refresh);return()=>window.removeEventListener(CONCERT_DISPLAY_EVENT_V337,refresh)},[]);
 const lead=events[0];
 if(!lead)return <div className="sonic-content-screen-v330-events"><h3>{title}</h3></div>;
 const posterImages=[...new Set([...(lead.posterUrls??[]),lead.posterUrl].filter((x):x is string=>!!x))];
 const usePoster=settings.showPoster&&posterImages.length>0;
 return <div key={`${lead.date}-${lead.title}`} className={`sonic-concert-display-v337 ${settings.style==='agenda'?'sonic-concert-agenda-v337':'sonic-concert-spotlight-v337'}`} style={{animationDuration:reducedMotion?'0ms':`${settings.transitionMs}ms`}}>
   <header><span>LIVE · NÄCHSTE KONZERTE</span><h3>{title}</h3></header>
   {settings.style==='spotlight'&&<section className="sonic-concert-feature-v337">
     {usePoster&&<StageImageGalleryV338 images={posterImages} alt={`Eventbild: ${lead.title}`} reducedMotion={reducedMotion} className="sonic-concert-poster-v338"/>}
     <div className="sonic-concert-feature-text-v337"><strong className="sonic-concert-date-v337">{formattedConcertDateV337(lead.date)}</strong><h4>{lead.title}</h4><p>{[lead.venue,lead.city].filter(Boolean).join(' · ')}</p>
       {settings.showTicketStatus&&displayTicketStatusV337(lead.status)&&<span className="sonic-concert-status-v337">{displayTicketStatusV337(lead.status)}</span>}
       {lead.url&&<span className="sonic-concert-link-v337">Ticketinfos verfügbar</span>}
     </div>
   </section>}
   <div className="sonic-concert-list-v337">{(settings.style==='spotlight'?events.slice(1,4):events.slice(0,5)).map((e,i)=><div className="sonic-concert-row-v337" key={`${e.date}-${e.title}-${i}`}>
     <strong>{formattedConcertDateV337(e.date)}</strong><span>{e.title}<small>{[e.venue,e.city].filter(Boolean).join(' · ')}</small></span>
     {settings.showTicketStatus&&displayTicketStatusV337(e.status)&&<em>{displayTicketStatusV337(e.status)}</em>}
   </div>)}</div>
 </div>;
}
