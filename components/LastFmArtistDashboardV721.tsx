'use client';
import {useMemo,useState} from 'react';
import type {LastFmEventV706} from '@/lib/lastfm-history-v706';
import {buildLastFmArtistDashboardV721,filterLastFmArtistDashboardV721,type V721Artist,type V721Comeback} from '@/lib/lastfm-artist-dashboard-v721';

type Category='all'|'rising'|'loyal'|'comebacks';
type Props={key?:string;events:readonly LastFmEventV706[];onOpenRange:(from:string,to:string,artist:string)=>void;onOpenArtist:(year:number,artist:string)=>void};
const fmt=(n:number)=>n.toLocaleString('de-AT');
const fmtDate=(s:string)=>new Date(`${s}T12:00:00`).toLocaleDateString('de-AT',{day:'numeric',month:'short',year:'numeric'});
const pct=(n:number)=>`${(n*100).toFixed(1).replace('.',',')} %`;

/** V721: read-only categories, based on the already loaded account-bound V713 archive. */
export function LastFmArtistDashboardV721({events,onOpenRange,onOpenArtist}:Props){
 const [category,setCategory]=useState<Category>('all');
 const [query,setQuery]=useState('');
 const [expanded,setExpanded]=useState(false);
 const data=useMemo(()=>buildLastFmArtistDashboardV721(events),[events]);
 const limit=expanded?50:8;
 const rising=useMemo(()=>filterLastFmArtistDashboardV721(data.rising,query,limit),[data,query,limit]);
 const loyal=useMemo(()=>filterLastFmArtistDashboardV721(data.loyal,query,limit),[data,query,limit]);
 const comebacks=useMemo(()=>filterLastFmArtistDashboardV721(data.comebacks,query,limit),[data,query,limit]);
 const tabs:{id:Category;label:string;count:number}[]=[{id:'all',label:'Übersicht',count:data.rising.length+data.loyal.length+data.comebacks.length},{id:'rising',label:'Aufstrebend',count:data.rising.length},{id:'loyal',label:'Langjährige Favoriten',count:data.loyal.length},{id:'comebacks',label:'Comebacks',count:data.comebacks.length}];
 function openRecent(a:V721Artist){onOpenRange(data.current.from,data.current.to,a.artist);}
 function openComeback(item:V721Comeback){onOpenRange(item.returnDay,data.current.to,item.artist.artist);}
 const showRise=category==='all'||category==='rising',showLoyal=category==='all'||category==='loyal',showReturn=category==='all'||category==='comebacks';
 return <section id="lastfm-artist-dashboard-v721" className="lastfm-artist-v721" aria-label="Artist Discovery Dashboard">
  <div className="lastfm-artist-head-v721"><div><h4>Artist Discovery Dashboard · V721</h4><p>Wer gewinnt an Bedeutung, wer begleitet dich über Jahre und wer taucht nach längerer Pause wieder auf?</p></div><span>{fmt(data.artistCount)} Künstler im Archiv</span></div>
  {!data.total?<p>Keine Scrobbles vorhanden. Importiere zuerst deinen Last.fm-Hörverlauf.</p>:<>
   <div className="lastfm-artist-summary-v721" aria-label="Auswertungsgrundlage">
    <div><small>Letzter archivierter Tag</small><strong>{data.asOf?fmtDate(data.asOf):'–'}</strong></div>
    <div><small>Aktuelle 30 Kalendertage</small><strong>{fmt(data.current.plays)} Scrobbles</strong><span>{fmtDate(data.current.from)} – {fmtDate(data.current.to)}</span></div>
    <div><small>30 Kalendertage davor</small><strong>{fmt(data.previous.plays)} Scrobbles</strong><span>{fmtDate(data.previous.from)} – {fmtDate(data.previous.to)}</span></div>
   </div>
   {!data.comparable&&<p className="lastfm-artist-alert-v721" role="status">Für einen belastbareren Aufwärtstrend braucht es in beiden 30-Tage-Fenstern mindestens zehn archivierte Scrobbles. Die anderen Kategorien bleiben verfügbar.</p>}
   <div className="lastfm-artist-controls-v721"><div className="lastfm-artist-tabs-v721" role="group" aria-label="Künstlerkategorie auswählen">{tabs.map(t=><button type="button" key={t.id} className={category===t.id?'is-selected':''} aria-pressed={category===t.id} onClick={()=>{setCategory(t.id);setExpanded(false);}}>{t.label} <span>{fmt(t.count)}</span></button>)}</div><label>Künstler suchen<input aria-label="Künstler im Artist Discovery Dashboard suchen" type="search" value={query} onChange={(e:{target:{value:string}})=>{setQuery(e.target.value);setExpanded(false);}} placeholder="Künstlername"/></label></div>
   <div className="lastfm-artist-boards-v721">
    {showRise&&<article className="lastfm-artist-group-v721"><div className="lastfm-artist-group-title-v721"><div><h5><span aria-hidden="true">↗</span> Aufstrebende Künstler</h5><p>Mindestens drei aktuelle Scrobbles, zwei mehr als zuvor und ≥5 Prozentpunkte höherer Anteil. Beide Zeitfenster brauchen ≥10 Scrobbles.</p></div><strong>{fmt(data.rising.length)}</strong></div>
     {rising.length?<ol>{rising.map(a=><li key={a.key}><button type="button" onClick={()=>openRecent(a)} title="Aktuelle 30 Tage dieses Künstlers in der Chronik öffnen"><span className="lastfm-artist-name-v721"><strong>{a.artist}</strong><small>{fmt(a.previousPlays)} → {fmt(a.currentPlays)} Scrobbles</small></span><span className="lastfm-artist-metrics-v721"><strong>+{pct(a.shareChange)}</strong><small>{pct(a.currentShare)} aktueller Anteil</small></span></button></li>)}</ol>:<p className="lastfm-artist-empty-v721">{!data.comparable?'Noch nicht ausreichend Vergleichsdaten.':query?'Keine Treffer für deine Suche.':'Derzeit kein Anstieg nach diesen Kriterien nachweisbar.'}</p>}
    </article>}
    {showLoyal&&<article className="lastfm-artist-group-v721"><div className="lastfm-artist-group-title-v721"><div><h5><span aria-hidden="true">★</span> Langjährige Favoriten</h5><p>In mindestens drei verschiedenen Kalenderjahren erfasst, mindestens 30 Scrobbles insgesamt und Aktivität im letzten archivierten Jahr.</p></div><strong>{fmt(data.loyal.length)}</strong></div>
     {loyal.length?<ol>{loyal.map(a=><li key={a.key}><button type="button" onClick={()=>onOpenArtist(a.years[a.years.length-1],a.artist)} title="Jahreschronik dieses Künstlers öffnen"><span className="lastfm-artist-name-v721"><strong>{a.artist}</strong><small>{a.years[0]}–{a.years[a.years.length-1]} · {fmt(a.activeMonths)} aktive Monate</small></span><span className="lastfm-artist-metrics-v721"><strong>{a.years.length} Jahre</strong><small>{fmt(a.plays)} Scrobbles</small></span></button></li>)}</ol>:<p className="lastfm-artist-empty-v721">{query?'Keine Treffer für deine Suche.':'Noch keine entsprechenden Langzeit-Favoriten im Archiv nachweisbar.'}</p>}
    </article>}
    {showReturn&&<article className="lastfm-artist-group-v721"><div className="lastfm-artist-group-title-v721"><div><h5><span aria-hidden="true">↺</span> Künstler-Comebacks</h5><p>Erneut im Archiv nach mindestens 90 lokalen Kalendertagen zwischen zwei erfassten Wiedergaben; Rückkehr innerhalb der letzten 90 archivierten Tage.</p></div><strong>{fmt(data.comebacks.length)}</strong></div>
     {comebacks.length?<ol>{comebacks.map(c=><li key={c.artist.key}><button type="button" onClick={()=>openComeback(c)} title="Wiedergaben ab dem Rückkehrtag in der Chronik öffnen"><span className="lastfm-artist-name-v721"><strong>{c.artist.artist}</strong><small>Wieder erfasst: {fmtDate(c.returnDay)} · {fmt(c.playsAfterReturn)} Scrobbles danach</small></span><span className="lastfm-artist-metrics-v721"><strong>{fmt(c.gapDays)} Tage</strong><small>Beobachtete Pause</small></span></button></li>)}</ol>:<p className="lastfm-artist-empty-v721">{query?'Keine Treffer für deine Suche.':'Keine Rückkehr mit einer nachgewiesenen 90-Tage-Pause im betrachteten Archivfenster.'}</p>}
    </article>}
   </div>
   {(data.rising.length>8||data.loyal.length>8||data.comebacks.length>8)&&<button type="button" className="lastfm-artist-expand-v721" aria-expanded={expanded} onClick={()=>setExpanded(v=>!v)}>{expanded?'Weniger anzeigen':'Bis zu 50 Künstler je Kategorie anzeigen'}</button>}
   <p className="lastfm-artist-note-v721">{data.limitations} Die Kategorien können sich überschneiden. „Favorit“, „Aufstieg“ und „Comeback“ sind ausschließlich regelbasierte Beschreibungen beobachteter Scrobbles, keine gesicherten Vorlieben oder neuen Musikentdeckungen. Keine Genre-Schätzungen, zusätzlichen Netzwerkaufrufe oder Last.fm-Schreibvorgänge.</p>
  </>}
 </section>;
}
