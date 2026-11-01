'use client';
import {useEffect,useMemo,useState} from 'react';
import {buildConnectedServicesV725,summarizeConnectedServicesV725,type V725Group,type V725State} from '@/services/system/connectedServicesV725';
import type {ConfigurationSnapshotV667} from '@/services/system/configurationStatusV667';
import {V706_USERNAME_KEY,validLastFmUsernameV706} from '@/lib/lastfm-history-v706';
import {readLastFmAutoConsentV708,readLastFmAutoStatusV708,V708_CHANGE_EVENT,V708_STATUS_EVENT} from '@/lib/automatic-lastfm-history-v708';

export type V725Props={snapshot:ConfigurationSnapshotV667|null;serverError:boolean;
 spotify:{connected:boolean;error:string|null;fetchedAt:number};lyrics:{hasTrack:boolean;provider:string|null;enabled:boolean};
 onRefresh:()=>void;refreshing:boolean;};
type Local={user:string|null;consent:boolean;consentError:string|null;lastSuccessAt:string|null;added:number|null;storageError:boolean};
const empty:Local={user:null,consent:false,consentError:null,lastSuccessAt:null,added:null,storageError:false};
const labels:Record<V725State,string>={working:'Bestätigt',attention:'Prüfen',disabled:'Aus / nicht eingerichtet',unknown:'Ungeprüft'};
const name:Record<V725Group,string>={core:'Musikkonten',lyrics:'Lyrics-Dienste',optional:'Weitere Integrationen'};
function readLocal():Local{
 try{
  const raw=window.localStorage.getItem(V706_USERNAME_KEY);
  if(!raw||!validLastFmUsernameV706(raw))return {...empty,user:null};
  const consent=readLastFmAutoConsentV708(window.localStorage,raw);
  const status=readLastFmAutoStatusV708(window.localStorage,raw);
  return {user:raw,consent:consent.enabled,consentError:consent.error,lastSuccessAt:status?.at??null,added:status?.added??null,storageError:false};
 }catch{return {...empty,storageError:true};}
}
/** Reuses the existing V667 server snapshot; does not poll Spotify, Last.fm, lyrics or other providers. */
export function ConnectedServicesMonitorV725({snapshot,serverError,spotify,lyrics,onRefresh,refreshing}:V725Props){
 const [local,setLocal]=useState<Local>(empty);
 const [filter,setFilter]=useState<'all'|'attention'|'disabled'|'unknown'>('all');
 const [now,setNow]=useState(0);
 useEffect(()=>{
  const update=()=>{setLocal(readLocal());setNow(Date.now());};
  update();const t=window.setInterval(update,60_000);
  window.addEventListener('storage',update);
  window.addEventListener(V708_CHANGE_EVENT,update);window.addEventListener(V708_STATUS_EVENT,update);
  return()=>{window.clearInterval(t);window.removeEventListener('storage',update);window.removeEventListener(V708_CHANGE_EVENT,update);window.removeEventListener(V708_STATUS_EVENT,update);};
 },[]);
 const cards=useMemo(()=>buildConnectedServicesV725({snapshot,serverError,spotify,lyrics,lastfm:local,now:now||Date.now()}),[snapshot,serverError,spotify,lyrics,local,now]);
 const totals=useMemo(()=>summarizeConnectedServicesV725(cards),[cards]);
 const groups:V725Group[]=['core','lyrics','optional'];
 const shown=cards.filter(c=>filter==='all'||(filter==='attention'?c.state==='attention':c.state===filter));
 return <section className="services-v725" aria-label="Connected Services Monitor" data-v725-monitor>
  <div className="services-head-v725"><div><span className="services-kicker-v725">CONNECTED SERVICES / V725</span><h3>Verbindungen & Dienste</h3>
   <p>Server-Konfiguration, freiwillige Aktivierung und belegter Laufzeitstatus sind drei verschiedene Dinge. Kein automatischer externer Verbindungstest.</p></div>
   <button type="button" disabled={refreshing} onClick={onRefresh}>{refreshing?'Aktualisiere …':'↻ Serverstatus aktualisieren'}</button>
  </div>
  <div className="services-summary-v725" role="group" aria-label="Dienstestatus filtern">
   {([['all','Alle',totals.total],['attention','Zu prüfen',totals.attention],['disabled','Aus',totals.disabled],['unknown','Ungeprüft',totals.unknown]] as const).map(([id,label,n])=><button key={id} type="button" aria-pressed={filter===id} onClick={()=>setFilter(id)}><strong>{n}</strong><span>{label}</span></button>)}
   <span className="services-working-v725">{totals.working} aktuell bestätigt</span>
  </div>
  {groups.map(group=>{
   const subset=shown.filter(c=>c.group===group);
   if(!subset.length)return null;
   return <section className="services-section-v725" key={group} aria-label={name[group]}><h4>{name[group]}</h4>
    <div className="services-cards-v725">{subset.map(c=><article className={`services-card-v725 services-card-${c.state}-v725`} key={c.id}>
     <div className="services-card-head-v725"><strong>{c.label}</strong><span className={`services-indicator-v725 services-indicator-${c.state}-v725`}>{labels[c.state]}</span></div>
     <p className="services-flags-v725">Konfiguriert: <b>{c.configured===null?'unbekannt':c.configured?'ja':'nein'}</b> · Aktiv: <b>{c.enabled===null?'unbekannt':c.enabled?'ja':'nein'}</b></p>
     <p>{c.explanation}</p><small>Hinweis: {c.action}{c.observedAt?` · Signal von ${c.observedAt}`:''}</small>
    </article>)}</div>
   </section>;
  })}
  {!shown.length&&<p role="status">Für diese Auswahl liegen keine Einträge vor.</p>}
  <p className="services-foot-v725">„Bestätigt“ gilt nur für ein konkretes aktuelles Signal. „Ungeprüft“ ist kein Fehler. Last.fm-Scrobbles kommen weiter ausschließlich aus deiner vorhandenen Spotify→Last.fm-Verbindung. Die Archivautomatik liest nur und benötigt deine separate Freigabe.</p>
 </section>;
}
