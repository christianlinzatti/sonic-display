"use client";
import {useEffect,useMemo,useRef,useState} from 'react';
import {readArchiveV701,validArchiveOwnerV701,type V701Archive} from '@/lib/persistent-listening-history-v701';
import {V702_STATUS_EVENT} from '@/lib/automatic-listening-history-v702';
import {planDiscoveryV705,suggestionsV705,V705_GENRES,V705_MODES,type V705Genre,type V705Mode,type V705Request,type V705Suggestion} from '@/lib/smart-music-discovery-v705';

type CatalogueResponse={tracks?:unknown;message?:string;code?:string};
/** Uses existing Spotify catalog-search API only when the user clicks Search. Never uploads the archive. */
export function SmartMusicDiscoveryStudioV705({onOpenArchive}:{onOpenArchive:()=>void}){
 const [owner,setOwner]=useState<string|null>(null),[archive,setArchive]=useState<V701Archive|null>(null);
 const [identityBusy,setIdentityBusy]=useState(true),[identityError,setIdentityError]=useState('');
 const [refresh,setRefresh]=useState(0),[genre,setGenre]=useState<V705Genre>('deutschrap'),[mode,setMode]=useState<V705Mode>('mix');
 const [loading,setLoading]=useState(false),[results,setResults]=useState<V705Suggestion[]|null>(null),[notice,setNotice]=useState('');
 const controller=useRef<AbortController|null>(null);
 const plan=useMemo(()=>planDiscoveryV705(archive,genre,mode),[archive,genre,mode]);
 useEffect(()=>{
  const signal=new AbortController();setIdentityBusy(true);setIdentityError('');setArchive(null);setOwner(null);
  const load=async()=>{try{
   const response=await fetch('/api/spotify/history-identity',{cache:'no-store',signal:signal.signal});
   if(!response.ok)throw new Error('Bitte Spotify verbinden, damit Empfehlungen deinem Konto zugeordnet werden können.');
   const data=await response.json() as {spotifyUserId?:unknown};
   if(!validArchiveOwnerV701(data.spotifyUserId))throw new Error('Spotify-Konto konnte nicht sicher zugeordnet werden.');
   if(signal.signal.aborted)return;
   const saved=readArchiveV701(window.localStorage,data.spotifyUserId);
   setOwner(data.spotifyUserId);setArchive(saved.archive);setIdentityError(saved.error??'');
  }catch(err){if(!signal.signal.aborted)setIdentityError(err instanceof Error?err.message:'Spotify-Konto nicht erreichbar.');}
   finally{if(!signal.signal.aborted)setIdentityBusy(false);}};
  void load();return()=>signal.abort();
 },[refresh]);
 useEffect(()=>{if(!owner)return;
  const update=()=>{const saved=readArchiveV701(window.localStorage,owner);controller.current?.abort();setLoading(false);setResults(null);setNotice('');setArchive(saved.archive);setIdentityError(saved.error??'');};
  const onStorage=(e:StorageEvent)=>{if(e.key===null||e.key===`sonic-display:personal-history:v701:${encodeURIComponent(owner)}`)update();};
  window.addEventListener('storage',onStorage);window.addEventListener(V702_STATUS_EVENT,update);
  return()=>{window.removeEventListener('storage',onStorage);window.removeEventListener(V702_STATUS_EVENT,update);};
 },[owner]);
 useEffect(()=>()=>controller.current?.abort(),[]);
 const reset=()=>{controller.current?.abort();controller.current=null;setLoading(false);setResults(null);setNotice('');};
 const changeGenre=(next:V705Genre)=>{reset();setGenre(next);};
 const changeMode=(next:V705Mode)=>{reset();setMode(next);};
 const search=async()=>{
  if(identityBusy||identityError||loading)return;
  reset();const ctrl=new AbortController();controller.current=ctrl;setLoading(true);
  if(!plan.requests.length){setNotice('Keine passenden Künstler im Archiv. Wähle „Genre entdecken“ oder „Gemischt“.');setResults([]);setLoading(false);return;}
  const failures:string[]=[];
  try{
   // Fail closed on an account switch between opening the panel and requesting recommendations.
   const identityResponse=await fetch('/api/spotify/history-identity',{cache:'no-store',signal:ctrl.signal});
   if(!identityResponse.ok)throw new Error('Spotify-Konto nicht erreichbar. Bitte erneut verbinden.');
   const identity=await identityResponse.json() as {spotifyUserId?:unknown};
   if(ctrl.signal.aborted)return;
   if(!validArchiveOwnerV701(identity.spotifyUserId)||identity.spotifyUserId!==owner){
    setArchive(null);setOwner(null);setIdentityError('Spotify-Konto hat sich geändert. Bitte Archiv neu zuordnen.');
    return;
   }
   const groups=await Promise.all(plan.requests.map(async(request:V705Request)=>{
    try{
     const response=await fetch(request.url,{cache:'no-store',signal:ctrl.signal});
     const data=await response.json() as CatalogueResponse;
     if(!response.ok){failures.push(data.message??`Spotify-Fehler ${response.status}`);return {request,tracks:[]};}
     if(!Array.isArray(data.tracks)){failures.push('Spotify hat eine ungültige Katalogantwort geliefert.');return {request,tracks:[]};}
     return {request,tracks:data.tracks};
    }catch(err){if(!ctrl.signal.aborted)failures.push(err instanceof Error?err.message:'Spotify-Suche nicht erreichbar.');return {request,tracks:[]};}
   }));
   if(ctrl.signal.aborted)return;
   setResults(suggestionsV705(plan,mode,groups));
   setNotice(failures.length?`${failures.length} von ${plan.requests.length} Spotify-Suchabfragen fehlgeschlagen. Ergebnisse sind möglicherweise unvollständig. ${failures[0]}`:'');
  }catch(err){if(!ctrl.signal.aborted){setResults([]);setNotice(err instanceof Error?err.message:'Spotify-Suche nicht verfügbar.');}}finally{if(!ctrl.signal.aborted)setLoading(false);}
 };
 return <section className="smart-discovery-v705" aria-label="Smart Music Discovery Studio">
  <header className="smart-discovery-head-v705"><div><span className="recent-insight-kicker-v673">V705 / SPOTIFY KATALOG</span><h3>Smart Music Discovery Studio<span>.</span></h3><p>Neue Hörideen aus Genre-Suchen und – wenn vorhanden – deinen archivierten Lieblingskünstlern.</p></div><button type="button" disabled={identityBusy} onClick={()=>{reset();setRefresh(n=>n+1);}}>Archiv aktualisieren</button></header>
  {identityBusy&&<p role="status">Spotify-Konto und freiwilliges Musikarchiv zuordnen …</p>}
  {!identityBusy&&identityError&&<p className="smart-discovery-alert-v705" role="alert">{identityError} Das Archiv wird nicht verändert. <a href="/api/spotify/login">Spotify verbinden</a></p>}
  {!identityBusy&&!identityError&&<>
   <div className="smart-discovery-info-v705"><span><strong>{plan.archivedEvents}</strong> gespeicherte Ereignisse</span><span><strong>{plan.knownTrackCount}</strong> bekannte Track-IDs</span><span><strong>{plan.seeds.length}</strong> Künstler als Suchansatz</span></div>
   {!archive&&<p className="smart-discovery-alert-v705">Noch kein lokales Archiv vorhanden: Genre-Suche ist möglich, aber bereits gehörte Titel können nicht ausgefiltert werden. <button type="button" onClick={onOpenArchive}>Mein Archiv öffnen</button></p>}
   <div className="smart-discovery-controls-v705"><label>Genre
    <select value={genre} onChange={(e:{target:{value:string}})=>changeGenre(e.target.value as V705Genre)}>{V705_GENRES.map(g=><option key={g.id} value={g.id}>{g.label}</option>)}</select>
   </label><label>Entdeckungsmodus
    <select value={mode} onChange={(e:{target:{value:string}})=>changeMode(e.target.value as V705Mode)}>{V705_MODES.map(m=><option key={m.id} value={m.id}>{m.label}</option>)}</select>
   </label><button className="smart-discovery-load-v705" type="button" disabled={loading||!plan.requests.length} onClick={()=>void search()}>{loading?'Suche läuft …':'Musikvorschläge suchen'}</button></div>
   <p className="smart-discovery-hint-v705">{V705_MODES.find(m=>m.id===mode)?.detail}. {mode==='favorites'||mode==='mix'?`Häufige Künstler-Credits im Archiv: ${plan.seeds.length?plan.seeds.join(', '):'keine'}.`:''} Die Suche beginnt erst nach Klick.</p>
   {notice&&<p role="status" className="smart-discovery-alert-v705">{notice}</p>}
   {loading&&<p role="status">Spotify-Katalog durchsuchen – maximal drei begrenzte Abfragen …</p>}
   {!loading&&results?.length===0&&<p role="status">Keine passenden Katalogtitel gefunden. Probiere ein anderes Genre oder den Modus „Genre entdecken“.</p>}
   {!loading&&results&&results.length>0&&<><div className="smart-discovery-result-head-v705"><h4>{results.length} Katalogvorschläge</h4><p>Keine bestätigten Spotify-Empfehlungen. Titel sind nur <strong>nicht in deinem lokalen Archiv erfasst</strong>.</p></div>
    <ol className="smart-discovery-list-v705">{results.map((track,i)=><li key={track.id}>
     <span className="smart-discovery-rank-v705">{String(i+1).padStart(2,'0')}</span>
     <div className="smart-discovery-art-v705">{track.coverUrl?<img src={track.coverUrl} alt="" loading="lazy"/>:<span aria-hidden="true">♫</span>}</div>
     <div className="smart-discovery-detail-v705"><a href={track.spotifyUrl} target="_blank" rel="noopener noreferrer">{track.title} ↗</a><span>{track.artists.join(', ')} · {track.album}</span><small>{track.reason}</small></div>
     <span className="smart-discovery-source-v705">{track.source==='favorite'?'Dein Künstler':'Genre-Suche'}</span>
    </li>)}</ol>
   </>}
   <p className="smart-discovery-disclaimer-v705">Transparenz: Spotify-Katalogsuche (keine personalisierte Spotify-Recommendations-API). Ergebnisse sind weder garantiert unbekannt noch unabhängig geprüfte „Geheimtipps“. Die Genre-Suche kann ungenaue Treffer liefern. Der Abgleich nutzt nur die gespeicherten Track-IDs. Bei „Bekannte Künstler“ oder „Gemischt“ wird maximal ein Künstlername pro Suche als Suchbegriff an Spotify gesendet – niemals deine Ereignisliste, Zeitstempel oder dein Benutzerkonto aus dem Archiv. Kein automatisches Speichern, kein Abspielen, kein Analytics-Upload. Genre und Modus können jederzeit gewechselt werden.</p>
  </>}
 </section>;
}
