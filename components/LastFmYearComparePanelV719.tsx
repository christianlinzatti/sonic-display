'use client';
import {useMemo,useState} from 'react';
import type {LastFmEventV706} from '@/lib/lastfm-history-v706';
import {compareLastFmYearsV719,listLastFmYearsV719} from '@/lib/lastfm-year-compare-v719';

type Props={key?:string;events:readonly LastFmEventV706[];onOpenYear:(year:number)=>void;onOpenArtist:(year:number,artist:string)=>void;onOpenSong:(year:number,artist:string,title:string)=>void};
const fmt=(n:number)=>n.toLocaleString('de-AT');
const delta=(n:number)=>(n>0?'+':'')+fmt(n);
const monthLabels=['Jan','Feb','Mär','Apr','Mai','Jun','Jul','Aug','Sep','Okt','Nov','Dez'];

/** All calculations run locally on the existing V713 archive. No Last.fm calls or scrobbling. */
export function LastFmYearComparePanelV719({events,onOpenYear,onOpenArtist,onOpenSong}:Props){
 const [choiceA,setChoiceA]=useState<number|null>(null);
 const [choiceB,setChoiceB]=useState<number|null>(null);
 const available=useMemo(()=>listLastFmYearsV719(events),[events]);
 const defaultB=available[available.length-1]??null;
 const defaultA=available[available.length-2]??defaultB;
 const yearA=choiceA!==null&&available.includes(choiceA)?choiceA:defaultA;
 const yearB=choiceB!==null&&available.includes(choiceB)?choiceB:defaultB;
 const result=useMemo(()=>yearA!==null&&yearB!==null?compareLastFmYearsV719(events,yearA,yearB):null,[events,yearA,yearB]);
 const maxMonth=Math.max(1,...(result?.a.months??[]),...(result?.b.months??[]));
 const different=yearA!==yearB;
 const totals=result?.hasData??false;
 return <section id="lastfm-year-compare-v719" className="lastfm-year-compare-v719" aria-label="Zwei Musikjahre vergleichen">
  <div className="lastfm-compare-head-v719"><div><h4>Musikjahre im Vergleich · V719</h4><p>Wie haben sich deine archivierten Hörgewohnheiten zwischen zwei frei wählbaren Jahren verändert?</p></div>
   <div className="lastfm-compare-controls-v719">
    <label>Jahr A<select aria-label="Ausgangsjahr A" value={yearA??''} disabled={!available.length} onChange={(e:{target:{value:string}})=>setChoiceA(Number(e.target.value))}>{available.map(year=><option key={year} value={year}>{year}</option>)}</select></label>
    <button type="button" disabled={!different||!available.length} onClick={()=>{setChoiceA(yearB);setChoiceB(yearA);}} aria-label="Jahre A und B tauschen">⇄ Tauschen</button>
    <label>Jahr B<select aria-label="Vergleichsjahr B" value={yearB??''} disabled={!available.length} onChange={(e:{target:{value:string}})=>setChoiceB(Number(e.target.value))}>{available.map(year=><option key={year} value={year}>{year}</option>)}</select></label>
   </div>
  </div>
  {!result||!available.length?<p>Es sind noch keine Musikjahre im lokalen Last.fm-Archiv erfasst.</p>:<>
   <div className="lastfm-compare-summary-v719" aria-label="Jahreskennzahlen"><div><small>Kennzahl</small><strong>{yearA}</strong><strong>{yearB}</strong><strong>Δ B − A</strong></div>
    {([['Scrobbles','plays'],['Künstler','artists'],['Songs','songs'],['Aktive Tage','days']] as const).map(([label,key])=><div key={key}><span>{label}</span><span>{fmt(result.a[key])}</span><span>{fmt(result.b[key])}</span><b>{delta(result.delta[key])}</b></div>)}
   </div>
   {different&&totals?<>
    <div className="lastfm-compare-month-card-v719"><h5>Monatsverlauf im direkten Vergleich</h5><p>Gleicher Monatsmaßstab für beide Jahre. Tippe auf ein Jahr, um die Scrobbles in der Chronik zu öffnen.</p>
     <div className="lastfm-compare-legend-v719"><span className="year-a-v719">{yearA}</span><span className="year-b-v719">{yearB}</span></div>
     <div className="lastfm-compare-months-v719">{result.a.months.map((aCount,i)=><div key={i} className="lastfm-compare-month-v719" title={`${monthLabels[i]}: ${yearA} ${fmt(aCount)}, ${yearB} ${fmt(result.b.months[i])} Scrobbles`}>
      <div className="lastfm-compare-bars-v719"><i className="year-a-v719" style={{height:`${aCount?Math.max(4,Math.round(aCount/maxMonth*100)):0}%`}}/><i className="year-b-v719" style={{height:`${result.b.months[i]?Math.max(4,Math.round(result.b.months[i]/maxMonth*100)):0}%`}}/></div><small>{monthLabels[i]}</small></div>)}</div>
     <div className="lastfm-compare-open-v719"><button type="button" onClick={()=>onOpenYear(result.a.year)}>Chronik {yearA} öffnen</button><button type="button" onClick={()=>onOpenYear(result.b.year)}>Chronik {yearB} öffnen</button></div>
    </div>
    <div className="lastfm-compare-grid-v719">
     <article><h5>Neue Favoriten in {yearB}</h5><p>In Jahr B vorhanden, in Jahr A nicht beobachtet. Nicht zwingend erstmals gehört.</p>
      {result.newInB.length?<ol>{result.newInB.map(item=><li key={item.key}><button type="button" onClick={()=>onOpenArtist(yearB!,item.name)}><strong>{item.name}</strong><span>{fmt(item.plays)} Scrobbles · {item.firstArchiveYear===yearB?'erstmals im Archiv':'schon '+item.firstArchiveYear+' im Archiv'}</span></button></li>)}</ol>:<p>Keine neuen Künstler gegenüber Jahr A.</p>}</article>
     <article><h5>Im Vergleichsjahr nicht erfasst</h5><p>Künstler aus Jahr A ohne Scrobbles in Jahr B – kein Beweis, dass du sie nicht gehört hast.</p>
      {result.missingInB.length?<ol>{result.missingInB.map(item=><li key={item.key}><button type="button" onClick={()=>onOpenArtist(yearA!,item.name)}><strong>{item.name}</strong><span>{fmt(item.plays)} Scrobbles in {yearA}</span></button></li>)}</ol>:<p>Alle Künstler aus A kommen auch in B vor.</p>}</article>
     <article><h5>Gemeinsame Künstler mit verändertem Anteil</h5><p>Prozentpunkte am jährlichen Scrobble-Anteil, nicht absolute Hörzeit.</p>
      {result.movers.length?<ol>{result.movers.map(item=><li key={item.key}><button type="button" onClick={()=>onOpenArtist(yearB!,item.name)}><strong>{item.name}</strong><span>{fmt(item.before)} → {fmt(item.after)} Scrobbles · {item.shareChange>0?'+':''}{item.shareChange.toFixed(1)} Prozentpunkte</span></button></li>)}</ol>:<p>Keine in beiden Jahren erfassten Künstler.</p>}</article>
     <article><h5>Wiederentdeckte Songs</h5><p>In beiden gewählten Jahren erfasste Songs, die im chronologisch späteren Jahr nach mindestens 90 Tagen ohne archivierten Scrobble zurückkehren.</p>
      {result.rediscoveries.length?<ol>{result.rediscoveries.map(item=><li key={item.key}><button type="button" onClick={()=>onOpenSong(result.laterYear,item.artist,item.title)}><strong>{item.title}</strong><span>{item.artist} · {fmt(item.gapDays)} Tage Archiv-Pause</span></button></li>)}</ol>:<p>Keine solche Wiederentdeckung nachweisbar.</p>}</article>
    </div>
    {result.retained.length>0&&<p className="lastfm-compare-retained-v719">In beiden Jahren vertreten: {result.retained.map(a=>a.name).join(' · ')}{result.retained.length===8?' · …':''}</p>}
   </>:<p className="lastfm-compare-note-v719">{!different?'Wähle zwei unterschiedliche Jahre, um Veränderungen zu sehen.':'Für einen Vergleich müssen in beiden Jahren archivierte Scrobbles vorhanden sein.'}</p>}
   <p className="lastfm-compare-note-v719">Es werden ausschließlich Scrobbles aus deinem lokalen Archiv verglichen – keine geschätzten Hörminuten oder erfundenen Genre-Zuordnungen. Laufende oder unvollständige Jahre, abweichende Archivabdeckung und fehlende Scrobbles verzerren Vergleiche. Die Daten werden nicht an Last.fm übertragen.</p>
  </>}
 </section>;
}
