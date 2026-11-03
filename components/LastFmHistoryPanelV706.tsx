'use client';
import {LastFmExplorerV729} from '@/components/LastFmExplorerV729';
import type {ExplorerSelectionV729} from '@/lib/lastfm-explorer-v729';
import {useEffect,useMemo,useRef,useState} from 'react';
import {canonicalLastFmUsernameV706,emptyLastFmArchiveV706,lastFmHistoryStatsV706,mergeLastFmArchiveV706,parseLastFmArchiveV706,readLastFmArchiveV706,validLastFmUsernameV706,writeLastFmArchiveV706,V706_MAX_EVENTS,V706_MAX_JSON_CHARS,V706_PAGE_SIZE,V706_USERNAME_KEY,type LastFmArchiveV706,type LastFmPageV706,type LastFmEventV706} from '@/lib/lastfm-history-v706';
import {applyLastFmRecoveryPageV709,clearLastFmGapV709,readLastFmGapV709,startLastFmRecoveryV709,V709_GAP_EVENT,V709_MAX_BATCH_PAGES,type V709Gap,type V709Session} from '@/lib/lastfm-recovery-v709';
import {appendLongtermHistoryV713,loadAndMigrateHistoryV713,makeLongtermBackupV713,mirrorRecentHistoryV713,openLongtermDbV713,parseLongtermBackupV713,readLongtermHistoryV713,V713_CHANGE_EVENT,V713_MAX_BACKUP_BYTES} from '@/lib/lastfm-indexed-history-v713';
import {LastFmIntelligencePanelV711} from '@/components/LastFmIntelligencePanelV711';
import {LastFmWrappedPanelV712} from '@/components/LastFmWrappedPanelV712';
import {LastFmTasteEvolutionPanelV714} from '@/components/LastFmTasteEvolutionPanelV714';
import {LastFmMonthlyInsightsV856} from '@/components/LastFmMonthlyInsightsV856';
import {LastFmPersonalDiscoveryV857} from '@/components/LastFmPersonalDiscoveryV857';
import {LastFmDiscoveryHomeV858} from '@/components/LastFmDiscoveryHomeV858';
import {LastFmInteractiveTimelineV859} from '@/components/LastFmInteractiveTimelineV859';
import {LastFmArtistDeepDiveV860} from '@/components/LastFmArtistDeepDiveV860';
import {LastFmSongRediscoveryV861} from '@/components/LastFmSongRediscoveryV861';
import {LastFmGenreEvolutionV862} from '@/components/LastFmGenreEvolutionV862';
import {LastFmListeningSessionAnalyzerV863} from '@/components/LastFmListeningSessionAnalyzerV863';
import {LastFmMilestonesPanelV717} from '@/components/LastFmMilestonesPanelV717';
import {LastFmTasteStoryPanelV718} from '@/components/LastFmTasteStoryPanelV718';
import {LastFmYearComparePanelV719} from '@/components/LastFmYearComparePanelV719';
import {LastFmDiscoveryTimelinePanelV720} from '@/components/LastFmDiscoveryTimelinePanelV720';
import {LastFmArtistDashboardV721} from '@/components/LastFmArtistDashboardV721';
import {LastFmPersonalInsightsDashboardV722} from '@/components/LastFmPersonalInsightsDashboardV722';
import {LastFmPeriodRecapPanelV727} from '@/components/LastFmPeriodRecapPanelV727';
import {LastFmOnThisDayPanelV728} from '@/components/LastFmOnThisDayPanelV728';
import {LastFmSharedHistoryFilterV726} from '@/components/LastFmSharedHistoryFilterV726';
import {buildLastFmSharedFilterV726,V726_DEFAULT_SELECTION,type V726Selection} from '@/lib/lastfm-shared-history-filter-v726';
import {filterLastFmHistoryV715,groupLastFmPageV715,makeLastFmCsvV715,pageLastFmHistoryV715,V715_CSV_LIMIT,type V715Period} from '@/lib/lastfm-history-explorer-v715';
import {buildLastFmCalendarV716,calendarBoundsV716,localDayKeyV716,moveMonthV716} from '@/lib/lastfm-history-calendar-v716';
import {lastFmHealthV710,readRecoveryConsentV710,readRecoveryRunV710,setRecoveryConsentV710,V710_CHANGE_EVENT,V710_STATUS_EVENT,type V710Run} from '@/lib/lastfm-health-v710';
import {V708_CHANGE_EVENT,V708_STATUS_EVENT,lastFmAutoConsentKeyV708,lastFmAutoStatusKeyV708,readLastFmAutoConsentV708,readLastFmAutoStatusV708,setLastFmAutoConsentV708,type V708Status} from '@/lib/automatic-lastfm-history-v708';
const date=new Intl.DateTimeFormat('de-AT',{dateStyle:'medium',timeStyle:'short'});
const maxBatch=10;
function downloadArchive(archive:LastFmArchiveV706){
 const blob=new Blob([JSON.stringify(makeLongtermBackupV713(archive))+'\n'],{type:'application/json;charset=utf-8'});
 const url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download=`sonic-lastfm-${canonicalLastFmUsernameV706(archive.username)}.json`;document.body.appendChild(link);link.click();link.remove();window.setTimeout(()=>URL.revokeObjectURL(url),10000);
}
/** V706 is opt-in: no Last.fm requests until the user explicitly clicks import. */
export function LastFmHistoryPanelV706(){
 const [explorerSelection,setExplorerSelection]=useState<ExplorerSelectionV729|null>(null);
 function openExplorer(selection:ExplorerSelectionV729){setExplorerSelection(selection);window.requestAnimationFrame(()=>{const panel=document.getElementById('lastfm-explorer-v729');panel?.focus({preventScroll:true});panel?.scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});});}
 const [draft,setDraft]=useState('');
 const [user,setUser]=useState('');
 const [archive,setArchive]=useState<LastFmArchiveV706|null>(null);
 const [nextPage,setNextPage]=useState(1);
 const [totalPages,setTotalPages]=useState<number|null>(null);
 const [totalRemote,setTotalRemote]=useState<number|null>(null);
 const [batch,setBatch]=useState(5);
 const [nowPlaying,setNowPlaying]=useState<string|null>(null);
 const [autoEnabled,setAutoEnabled]=useState(false);
 const [autoError,setAutoError]=useState('');
 const [autoStatus,setAutoStatus]=useState<V708Status|null>(null);
 const [autoRecovery,setAutoRecovery]=useState(false);
 const [autoRecoveryRun,setAutoRecoveryRun]=useState<V710Run|null>(null);
 const [autoRecoveryError,setAutoRecoveryError]=useState('');
 const [added,setAdded]=useState(0);
 const [gap,setGap]=useState<V709Gap|null>(null);
 const [recovery,setRecovery]=useState<V709Session|null>(null);
 const [recoveryNote,setRecoveryNote]=useState('');
 const [busy,setBusy]=useState(false);
 const [error,setError]=useState('');
 const [notice,setNotice]=useState('');
 const [term,setTerm]=useState('');
 const [artistFilter,setArtistFilter]=useState('');
 const [period,setPeriod]=useState<V715Period>('all');
 const [sharedSelection,setSharedSelection]=useState<V726Selection>({...V726_DEFAULT_SELECTION});
 const [fromDate,setFromDate]=useState('');
 const [toDate,setToDate]=useState('');
 const [historyPage,setHistoryPage]=useState(1);
 const [historyPageSize,setHistoryPageSize]=useState(50);
 const [calendarMonth,setCalendarMonth]=useState('');
 const controller=useRef<AbortController|null>(null);
 const importFile=useRef<HTMLInputElement|null>(null);
 const dbRef=useRef<Promise<IDBDatabase>|null>(null);
 const currentUser=useRef('');
 const [longtermStatus,setLongtermStatus]=useState('');
 function database(){if(!dbRef.current)dbRef.current=openLongtermDbV713().catch((e:unknown)=>{dbRef.current=null;throw e;});return dbRef.current;}
 async function refreshLongterm(forUser:string){
  if(!validLastFmUsernameV706(forUser))return;
  try{
   const db=await database();
   const full=await loadAndMigrateHistoryV713(db,window.localStorage,forUser);
   if(currentUser.current!==forUser)return;
   setArchive(full);setLongtermStatus(`${full.events.length.toLocaleString('de-AT')} Scrobbles dauerhaft in IndexedDB archiviert.`);
  }catch(e){if(currentUser.current===forUser){setLongtermStatus('IndexedDB nicht bereit: '+(e instanceof Error?e.message:'Unbekannter Fehler')+' Bitte keine Daten löschen.');}}
 }
 async function savePageLongterm(forUser:string,items:LastFmEventV706[]){
  const db=await database();await loadAndMigrateHistoryV713(db,window.localStorage,forUser);
  if(currentUser.current!==forUser||window.localStorage.getItem(V706_USERNAME_KEY)!==forUser)throw new Error('Last.fm-Konto gewechselt.');
  const result=await appendLongtermHistoryV713(db,forUser,items);
  const full=await readLongtermHistoryV713(db,forUser);
  mirrorRecentHistoryV713(window.localStorage,full);
  if(currentUser.current===forUser){setArchive(full);setLongtermStatus(`${result.total.toLocaleString('de-AT')} Scrobbles in IndexedDB archiviert.`);window.dispatchEvent(new Event(V713_CHANGE_EVENT));}
  return result;
 }
 useEffect(()=>{
  try{const stored=window.localStorage.getItem(V706_USERNAME_KEY);if(stored&&validLastFmUsernameV706(stored))setDraft(stored);}catch{/* storage can be disabled */}
  return()=>controller.current?.abort();
 },[]);
 useEffect(()=>{
  if(!user)return;
  const refresh=()=>{
   try{
    const consent=readLastFmAutoConsentV708(window.localStorage,user);setAutoEnabled(consent.enabled);setAutoError(consent.error??'');setAutoStatus(readLastFmAutoStatusV708(window.localStorage,user));setGap(readLastFmGapV709(window.localStorage,user));
    const rc=readRecoveryConsentV710(window.localStorage,user);setAutoRecovery(rc.enabled);setAutoRecoveryError(rc.error??'');setAutoRecoveryRun(readRecoveryRunV710(window.localStorage,user)??null);
    const latest=readLastFmArchiveV706(window.localStorage,user);
    if(!latest.error&&latest.archive)void refreshLongterm(user);
    else if(latest.error)setAutoError(latest.error);
   }catch{setAutoEnabled(false);setAutoError('Lokaler Speicher nicht verfügbar.');}
  };
  const otherTab=(e:StorageEvent)=>{if(e.key===null||e.key?.startsWith('sonic-display:lastfm:recovery-gap:v709:')||e.key===lastFmAutoConsentKeyV708(user)||e.key===lastFmAutoStatusKeyV708(user)||e.key===V706_USERNAME_KEY||e.key?.startsWith('sonic-display:lastfm:recovery-'))refresh();};
  refresh();window.addEventListener(V713_CHANGE_EVENT,refresh);window.addEventListener(V708_STATUS_EVENT,refresh);window.addEventListener(V709_GAP_EVENT,refresh);window.addEventListener(V710_STATUS_EVENT,refresh);window.addEventListener('storage',otherTab);
  return()=>{window.removeEventListener(V713_CHANGE_EVENT,refresh);window.removeEventListener(V708_STATUS_EVENT,refresh);window.removeEventListener(V709_GAP_EVENT,refresh);window.removeEventListener(V710_STATUS_EVENT,refresh);window.removeEventListener('storage',otherTab);};
 },[user]);
 function toggleAuto(){
  if(!user||!archive||busy)return;
  const next=!autoEnabled;
  if(!setLastFmAutoConsentV708(window.localStorage,user,next)){setAutoError('Automatik konnte nicht gespeichert werden. Bitte Archiv und Browser-Speicher prüfen.');return;}
  setAutoEnabled(next);setAutoError('');
  window.dispatchEvent(new Event(V708_CHANGE_EVENT));
 }
 function toggleAutoRecovery(){
  if(!user||!archive||busy)return;
  const target=!autoRecovery;
  if(!setRecoveryConsentV710(window.localStorage,user,target)){setAutoRecoveryError('Nachholen konnte nicht aktiviert werden: zuerst die automatische Last.fm-Sicherung einschalten und das Archiv prüfen.');return;}
  setAutoRecovery(target);setAutoRecoveryError('');window.dispatchEvent(new Event(V710_CHANGE_EVENT));
 }
 function selectUser(){
  const newUser=draft.trim();if(!validLastFmUsernameV706(newUser)){setError('Bitte einen gültigen Last.fm-Benutzernamen eingeben (maximal 64 Zeichen).');return;}
  controller.current?.abort();currentUser.current=newUser;setBusy(false);setError('');setNotice('');setNextPage(1);setTotalPages(null);setTotalRemote(null);setAdded(0);setNowPlaying(null);setGap(null);setRecovery(null);setRecoveryNote('');setTerm('');setArtistFilter('');setPeriod('all');setFromDate('');setToDate('');setSharedSelection({...V726_DEFAULT_SELECTION});setHistoryPage(1);setCalendarMonth('');setAutoRecovery(false);setAutoRecoveryRun(null);setAutoRecoveryError('');setUser(newUser);
  try{window.localStorage.setItem(V706_USERNAME_KEY,newUser);window.dispatchEvent(new Event(V708_CHANGE_EVENT));}catch{/* no persistent preference */}
  try{
   const stored=readLastFmArchiveV706(window.localStorage,newUser);
   if(stored.error){setError(stored.error);setExplorerSelection(null);setArchive(null);}else setArchive(stored.archive??emptyLastFmArchiveV706(newUser));
  }catch{setError('Lokaler Speicher ist im Browser nicht verfügbar. Bitte Browser-Einstellungen prüfen.');setArchive(null);}
  void refreshLongterm(newUser);
 }
 function changeUser(){setExplorerSelection(null);currentUser.current='';controller.current?.abort();try{window.localStorage.removeItem(V706_USERNAME_KEY);window.dispatchEvent(new Event(V708_CHANGE_EVENT));}catch{/* ignore */}setBusy(false);setUser('');setArchive(null);setNextPage(1);setTotalPages(null);setTotalRemote(null);setNowPlaying(null);setGap(null);setRecovery(null);setRecoveryNote('');setTerm('');setArtistFilter('');setPeriod('all');setFromDate('');setToDate('');setSharedSelection({...V726_DEFAULT_SELECTION});setHistoryPage(1);setCalendarMonth('');setAutoRecovery(false);setAutoRecoveryRun(null);setAutoRecoveryError('');setError('');setNotice('');}
 async function importPages(){
  if(!user||!archive||busy)return;
  const abort=new AbortController();controller.current?.abort();controller.current=abort;
  setBusy(true);setError('');setNotice('');let working=archive,imported=0,trimmed=0,loaded=0;
  try{
   for(let i=0;i<Math.min(batch,maxBatch);i++){
    if(abort.signal.aborted)break;
    const page=nextPage+i;if(totalPages!==null&&page>totalPages)break;
    const response=await fetch(`/api/lastfm/recent-tracks?user=${encodeURIComponent(user)}&page=${page}`,{cache:'no-store',signal:abort.signal});
    const raw=await response.json() as Partial<LastFmPageV706>&{message?:string;code?:string};
    if(!response.ok)throw new Error(raw.message??`Last.fm antwortet mit HTTP ${response.status}.`);
    if(raw.username!==user||raw.page!==page||!Array.isArray(raw.events)||typeof raw.totalPages!=='number'||!Number.isInteger(raw.totalPages)||typeof raw.total!=='number'||!Number.isInteger(raw.total))throw new Error('Last.fm hat unerwartete Daten zurückgegeben.');
    // Include any events written by the opt-in background recorder or another browser tab.
    const result=await savePageLongterm(user,raw.events);
    working=await readLongtermHistoryV713(await database(),user);imported+=result.added;loaded++;
    setArchive(working);setAdded(imported);setTotalPages(raw.totalPages);setTotalRemote(raw.total);
    if(page===1)setNowPlaying(raw.nowPlaying&&typeof raw.nowPlaying.artist==='string'&&typeof raw.nowPlaying.title==='string'?`${raw.nowPlaying.artist} – ${raw.nowPlaying.title}`:null);
    setNextPage(page+1);
    if(page>=raw.totalPages||!raw.events.length)break;
   }
   if(!abort.signal.aborted)setNotice(`${loaded} Seite(n) importiert, ${imported} neue Scrobbles in IndexedDB gespeichert. Ältere Wiedergaben bleiben erhalten.`);
  }catch(e){if(!abort.signal.aborted)setError(e instanceof Error?e.message:'Last.fm-Import fehlgeschlagen.');}
  finally{if(!abort.signal.aborted)setBusy(false);}
 }
 /** V709: user-triggered, bounded historical pagination with a fixed Last.fm `to` snapshot. */
 async function recoverGap(){
  if(!user||!archive||busy)return;
  const selected=readLastFmArchiveV706(window.localStorage,user);
  if(selected.error||!selected.archive){setError(selected.error??'Bitte zuerst ein Last.fm-Archiv anlegen.');return;}
  const session=recovery&&!recovery.done&&recovery.username===user?recovery:startLastFmRecoveryV709(selected.archive,new Date(),readLastFmGapV709(window.localStorage,user));
  const abort=new AbortController();controller.current?.abort();controller.current=abort;
  setBusy(true);setError('');setNotice('');setRecoveryNote('');
  let state=session,totalAdded=0,totalTrimmed=0,loaded=0;
  try{
   for(let i=0;i<V709_MAX_BATCH_PAGES&&!state.done;i++){
    if(abort.signal.aborted||window.localStorage.getItem(V706_USERNAME_KEY)!==user)throw new Error('Last.fm-Konto gewechselt; Nachholen abgebrochen.');
    const response=await fetch(`/api/lastfm/recent-tracks?user=${encodeURIComponent(user)}&page=${state.nextPage}&to=${state.to}`,{cache:'no-store',signal:abort.signal});
    if(response.status===429){const retry=response.headers.get('Retry-After');throw new Error(`Last.fm-Anfragelimit erreicht.${retry?' Bitte Retry-After beachten: '+retry+' Sekunden.':''}`);}
    if(!response.ok)throw new Error(`Last.fm meldet HTTP ${response.status}.`);
    const raw:unknown=await response.json();
    if(abort.signal.aborted)throw new Error('Nachladen abgebrochen.');
    const updated=applyLastFmRecoveryPageV709(window.localStorage,state,raw);
    if(updated.status!=='ok'||!updated.archive)throw new Error(`Nachholen nicht möglich (${updated.status}). Das Archiv bleibt erhalten.`);
    state=updated.session;loaded++;totalAdded+=updated.added;totalTrimmed+=updated.trimmed;
    await savePageLongterm(user,(raw as LastFmPageV706).events);setRecovery(state);
    window.dispatchEvent(new Event(V708_STATUS_EVENT));
   }
   if(state.done&&state.reason!=='limit'){
    if(clearLastFmGapV709(window.localStorage,user)){setGap(null);window.dispatchEvent(new Event(V709_GAP_EVENT));}
   }
   const ending=state.done?(state.reason==='overlap'?'Vorhandenen Scrobble-Anker erreicht.':state.reason==='last-page'?'Letzte verfügbare Last.fm-Seite erreicht.':'Sicherheitsgrenze von 100 Seiten erreicht; möglicherweise unvollständig.'):`Noch ältere Seiten verfügbar. Mit „Weitere ältere Scrobbles nachladen“ fortsetzen.`;
   setRecoveryNote(`${loaded} Seite(n) geprüft · ${totalAdded} Scrobbles ergänzt.${totalTrimmed?' Ältere Einträge wegen Archivgrenze verdrängt.':''} ${ending}`);
  }catch(e){if(!abort.signal.aborted)setError(e instanceof Error?e.message:'Nachladen fehlgeschlagen.');}
  finally{if(!abort.signal.aborted)setBusy(false);}
 }
 async function importJSON(file:File|undefined){
  if(!file||!user||!archive)return;
  setError('');setNotice('');
  if(file.size>V713_MAX_BACKUP_BYTES){setError('JSON-Datei ist zu groß (maximal 100 MB).');return;}
  try{
   const restored=parseLongtermBackupV713(await file.text(),user);
   const result=await savePageLongterm(user,restored.events);
   setNotice(`${result.added} Ereignisse aus dem Backup ergänzt; vorhandenes Langzeitarchiv erhalten.`);
  }catch(e){setError(e instanceof Error?e.message:'JSON-Import fehlgeschlagen.');}
  finally{if(importFile.current)importFile.current.value='';}
 }
 const sharedResult=useMemo(()=>buildLastFmSharedFilterV726(archive?.events??[],sharedSelection),[archive,sharedSelection]);
 const filtered=useMemo(()=>sharedResult.error?{events:[],error:sharedResult.error}:filterLastFmHistoryV715(sharedResult.events,{query:term,period,from:fromDate,to:toDate,artist:artistFilter}),[sharedResult,term,period,fromDate,toDate,artistFilter]);
 const visible=filtered.events;
 // Calendar counts follow search/artist, but NOT the active date window or page.
 const calendarSource=useMemo(()=>filterLastFmHistoryV715(sharedResult.events,{query:term,artist:artistFilter,period:'all',from:'',to:''}).events,[sharedResult,term,artistFilter]);
 const calendarBounds=useMemo(()=>calendarBoundsV716(sharedResult.events),[sharedResult]);
 const shownMonth=calendarMonth&&calendarMonth>=calendarBounds.oldest&&calendarMonth<=calendarBounds.newest?calendarMonth:calendarBounds.newest;
 const calendar=useMemo(()=>buildLastFmCalendarV716(calendarSource,shownMonth),[calendarSource,shownMonth]);
 const selectedDay=period==='custom'&&fromDate===toDate?fromDate:'';
 const todayDay=localDayKeyV716(new Date());
 const prevMonth=moveMonthV716(shownMonth,-1);
 const nextMonth=moveMonthV716(shownMonth,1);
 function selectHistoryDay(day:string){
  setSharedSelection({...V726_DEFAULT_SELECTION,range:'custom',from:day,to:day});
  setPeriod('custom');setFromDate(day);setToDate(day);setHistoryPage(1);
  setCalendarMonth(day.slice(0,7));
  // Scroll after React commits the selected day's chronology.
  window.requestAnimationFrame(()=>{const destination=document.getElementById('lastfm-history-chronicle-v716');destination?.focus({preventScroll:true});destination?.scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});});
 }
 function updateCalendarFromDate(value:string){if(/^\d{4}-(0[1-9]|1[0-2])-\d{2}$/.test(value))setCalendarMonth(value.slice(0,7));}
 function openMilestoneMonth(month:string){
  const [year,number]=month.split('-').map(Number);
  if(!Number.isSafeInteger(year)||!Number.isSafeInteger(number)||year<2000||number<1||number>12)return;
  const lastDay=String(new Date(year,number,0).getDate()).padStart(2,'0');
  setSharedSelection({...V726_DEFAULT_SELECTION,range:'custom',from:`${month}-01`,to:`${month}-${lastDay}`});
  setTerm('');setArtistFilter('');setPeriod('custom');setFromDate(`${month}-01`);setToDate(`${month}-${lastDay}`);setHistoryPage(1);setCalendarMonth(month);
  window.requestAnimationFrame(()=>{const destination=document.getElementById('lastfm-history-chronicle-v716');destination?.focus({preventScroll:true});destination?.scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});});
 }

 function openArtistDashboardRangeV721(from:string,to:string,artist:string){
  const date=/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;
  if(!date.test(from)||!date.test(to)||from>to||!artist.trim())return;
  setSharedSelection({...V726_DEFAULT_SELECTION,range:'custom',from,to});
  setTerm('');setArtistFilter(artist);setPeriod('custom');setFromDate(from);setToDate(to);setHistoryPage(1);setCalendarMonth(to.slice(0,7));
  window.requestAnimationFrame(()=>{const destination=document.getElementById('lastfm-history-chronicle-v716');destination?.focus({preventScroll:true});destination?.scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});});
 }
 function openStoryYear(year:number,artist=''){
  if(!Number.isSafeInteger(year)||year<2000||year>new Date().getFullYear())return;
  setSharedSelection({...V726_DEFAULT_SELECTION,range:'year',year});
  setTerm('');setArtistFilter(artist);setPeriod('custom');setFromDate(`${year}-01-01`);setToDate(`${year}-12-31`);setHistoryPage(1);setCalendarMonth(`${year}-01`);
  window.requestAnimationFrame(()=>{const destination=document.getElementById('lastfm-history-chronicle-v716');destination?.focus({preventScroll:true});destination?.scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});});
 }

 const summary=useMemo(()=>lastFmHistoryStatsV706(visible),[visible]);
 const history=useMemo(()=>pageLastFmHistoryV715(visible,historyPage,historyPageSize),[visible,historyPage,historyPageSize]);
 const groups=useMemo(()=>groupLastFmPageV715(history.events,history.start),[history]);
 const clearHistoryFilters=()=>{setArtistFilter('');setTerm('');setPeriod('all');setFromDate('');setToDate('');setSharedSelection({...V726_DEFAULT_SELECTION});setHistoryPage(1);};
 const applySharedSelectionV726=(selection:V726Selection)=>{setSharedSelection(selection);setTerm('');setArtistFilter('');setPeriod('all');setFromDate('');setToDate('');setHistoryPage(1);setCalendarMonth('');};
 function exportFilteredHistory(){
  if(filtered.error||!visible.length)return;
  const result=makeLastFmCsvV715(visible);
  const blob=new Blob([result.csv],{type:'text/csv;charset=utf-8'});
  const url=URL.createObjectURL(blob),link=document.createElement('a');
  link.href=url;link.download=`sonic-lastfm-history-${canonicalLastFmUsernameV706(user)}.csv`;
  document.body.appendChild(link);link.click();link.remove();window.setTimeout(()=>URL.revokeObjectURL(url),10000);
  setNotice(`${result.exported.toLocaleString('de-AT')} gefilterte Scrobbles als CSV exportiert.${result.truncated?` Export auf die neuesten ${V715_CSV_LIMIT.toLocaleString('de-AT')} Treffer begrenzt; JSON-Backup enthält das gesamte Archiv.`:''}`);
 }
 const health=useMemo(()=>lastFmHealthV710(archive?.events??[]),[archive]);
 const maxMonth=Math.max(1,...health.monthCounts.map(x=>x.count));
 const complete=totalPages!==null&&nextPage>totalPages;
 return <section className="lastfm-v706" aria-label="Last.fm Hörverlauf">
  <header className="lastfm-head-v706"><div><span className="recent-insight-kicker-v673">LAST.FM / SCROBBLE-HISTORY</span><h3>Dein Last.fm-Verlauf<span>.</span></h3><p>Langfristige Scrobble-Chronik neben deinem Spotify-Archiv. Import auf Klick; automatischer Abgleich nur nach eigener Aktivierung.</p></div><div className="lastfm-header-links-v715"><a href="#lastfm-discovery-home-v858">Musik-Startseite ↓</a><a href="#lastfm-song-rediscovery-v861">Song-Wiederentdeckungen ↓</a><a href="#lastfm-interactive-timeline-v859">Musik-Zeitreise ↓</a><a href="#lastfm-explorer-v729">Artist &amp; Track Explorer ↓</a><a href="#lastfm-on-this-day-v728">On This Day ↓</a><a href="#lastfm-personal-insights-v722">Personal Insights ↓</a><a href="#lastfm-artist-dashboard-v721">Artist Dashboard ↓</a><a href="#lastfm-discovery-timeline-v720">Discovery Timeline ↓</a><a href="#lastfm-year-compare-v719">Jahresvergleich ↓</a><a href="#lastfm-taste-story-v718">Music Taste Story ↓</a><a href="#lastfm-history-explorer-v715">Chronik durchsuchen ↓</a><a href="https://www.last.fm/settings/applications" target="_blank" rel="noopener noreferrer">Last.fm Einstellungen ↗</a></div></header>
  {!user?<div className="lastfm-setup-v706"><label htmlFor="lastfm-username-v706">Last.fm-Benutzername</label><div><input id="lastfm-username-v706" value={draft} maxLength={64} onChange={(e:{target:{value:string}})=>setDraft(e.target.value)} onKeyDown={(e:{key:string})=>{if(e.key==='Enter')selectUser();}} placeholder="Dein Last.fm-Benutzername" autoComplete="off"/><button type="button" onClick={selectUser}>Last.fm-Verlauf öffnen</button></div><p>Du brauchst einen auf dem Server konfigurierten <code>LASTFM_API_KEY</code>. Kein Last.fm-Passwort und keine Schreibberechtigung erforderlich. Es werden nur bei Last.fm tatsächlich vorhandene Scrobbles angezeigt.</p></div>:
  <div className="lastfm-connected-v706"><div><strong>Last.fm: {user}</strong><span> {(archive?.events.length??0).toLocaleString('de-AT')} gespeicherte Scrobbles · IndexedDB-Langzeitarchiv · getrennt von Spotify</span></div><button type="button" onClick={changeUser} disabled={busy}>Benutzer wechseln</button></div>}
  {user&&archive&&<>
   <div className="lastfm-auto-v708" aria-label="Automatischer Last.fm-Abgleich">
    <div><strong>Automatische Last.fm-Sicherung</strong><p>Standardmäßig aus. Nach deiner Aktivierung fragt Sonic Display höchstens alle fünf Minuten die 200 neuesten Scrobbles ab – nur bei geöffnetem Sonic Display und aktivem Browser-Tab.</p>
    <small>{autoStatus?`Letzter erfolgreicher Abgleich: ${date.format(new Date(autoStatus.at))} · ${autoStatus.added} neue Scrobbles`:'Noch kein erfolgreicher automatischer Abgleich.'}</small></div>
    <button type="button" aria-pressed={autoEnabled} disabled={busy} onClick={toggleAuto}>{autoEnabled?'Automatische Sicherung ausschalten':'Automatische Sicherung einschalten'}</button>
   </div>
   {autoError&&<p role="alert" className="lastfm-error-v706">{autoError}</p>}
   <div className="lastfm-health-v710" aria-label="Last.fm Synchronisierungsstatus">
    <div><strong>History Health · Synchronisierungsstatus</strong>
     <p>{!autoEnabled?'Automatische Last.fm-Sicherung ist aus.':autoStatus?'Letzter erfolgreicher Abgleich: '+date.format(new Date(autoStatus.at)):'Automatik aktiviert, aber noch kein erfolgreicher Abgleich.'} {gap?'Mögliche Archivlücke erkannt – ältere Scrobbles noch nicht vollständig geprüft.':'Keine gemeldete Lücke; unbekannte ältere Lücken bleiben möglich.'}</p>
     <small>{autoRecoveryRun?`Automatische Nachholung: ${autoRecoveryRun.pages} Seite(n), ${autoRecoveryRun.added} neue Scrobbles · ${autoRecoveryRun.session.done?(autoRecoveryRun.session.reason==='limit'?'Sicherheitsgrenze erreicht':'Abgeschlossen'):'Weitere Prüfung ausstehend'}`:'Noch kein automatischer Nachholfortschritt.'}</small>
    </div>
    <button type="button" aria-pressed={autoRecovery} disabled={busy||!autoEnabled&&!autoRecovery} onClick={toggleAutoRecovery}>{autoRecovery?'Automatische Lückenreparatur ausschalten':'Automatische Lückenreparatur einschalten'}</button>
    <p>Separat zustimmungspflichtig. Nur bei erkannter Lücke: höchstens eine zusätzliche Seite alle fünf Minuten, maximal 100 Seiten pro Sitzung. Nur im sichtbaren, fokussierten Tab mit Web-Locks-Unterstützung; deaktivierte V708-Automatik pausiert die Reparatur.</p>
    {autoRecoveryError&&<p role="alert" className="lastfm-error-v706">{autoRecoveryError}</p>}
   </div>
   <div className="lastfm-recovery-v709" aria-label="Last.fm-Verlauf nachholen">
    <div><strong>History Recovery · mögliche Lücken nachholen</strong>
     <p>{gap?`Mögliche Lücke erkannt: Der neueste zuvor gespeicherte Scrobble stammt vom ${date.format(new Date(gap.lastArchivedAt))}; die neueste volle Last.fm-Seite reicht nur bis ${date.format(new Date(gap.oldestFetchedAt))}.`:'Keine konkrete Lückenwarnung erkannt. Nach längeren Pausen oder einer Ersteinrichtung kannst du ältere Scrobbles trotzdem gezielt nachladen.'} Eine Lücke ist nicht sicher nachgewiesen. Je Durchgang werden höchstens fünf Seiten (1.000 Scrobbles) abgefragt. Ein vorhandener Scrobble-Anker beendet die Suche; nicht archivierte ältere Lücken können weitere Durchgänge erfordern.</p>
     {recoveryNote&&<small role="status">{recoveryNote}</small>}
    </div>
    <button type="button" disabled={busy||recovery?.done===true} onClick={()=>void recoverGap()}>{busy?'Nachholen läuft …':recovery&&!recovery.done?'Weitere ältere Scrobbles nachladen':'Mögliche Lücke nachladen'}</button>
    {recovery&&<button type="button" disabled={busy} onClick={()=>{setRecovery(null);setRecoveryNote('Nachholvorgang zurückgesetzt; gespeicherte Scrobbles bleiben erhalten.');}}>Suche neu beginnen</button>}
   </div>
   <div className="lastfm-longterm-v713" role="status"><strong>V713 · Langzeitarchiv</strong><p>{longtermStatus||'IndexedDB wird geprüft. Bereits gespeicherte Last.fm-Daten werden nicht gelöscht.'} Die bisherigen 8.000 Einträge im Browser-Speicher bleiben als Kompatibilitätsspiegel; IndexedDB behält ältere Scrobbles ohne feste 8.000er-Grenze, abhängig vom verfügbaren Gerätespeicher. JSON-Backup enthält das gesamte geladene Langzeitarchiv.</p></div><div className="lastfm-actions-v706"><label>Importumfang <select value={batch} disabled={busy} onChange={(e:{target:{value:string}})=>setBatch(Number(e.target.value))}><option value={1}>200 Scrobbles</option><option value={5}>bis 1.000 Scrobbles</option><option value={10}>bis 2.000 Scrobbles</option></select></label><button type="button" disabled={busy||complete} onClick={()=>void importPages()}>{busy?'Import läuft …':nextPage===1?'Scrobbles importieren':'Weitere Scrobbles importieren'}</button><button type="button" disabled={!archive.events.length||busy} onClick={()=>downloadArchive(archive)}>JSON-Backup ↓</button><label className="lastfm-upload-v706">JSON-Backup einlesen <input ref={importFile} type="file" accept=".json,application/json" disabled={busy} onChange={(e:{target:{files:FileList|null}})=>void importJSON(e.target.files?.[0])}/></label></div>
   <p className="lastfm-source-v706">{totalRemote===null?'Noch keine API-Abfrage.':`Last.fm meldet ${totalRemote.toLocaleString('de-AT')} Scrobbles auf ${totalPages} Seiten · nächste Seite ${nextPage}${complete?' · alle Seiten abgefragt':''}.`} Langzeitarchiv in IndexedDB, begrenzt durch Browser-Speicherplatz statt 8.000 Einträgen. {nowPlaying?`Gerade läuft: ${nowPlaying} (nicht als Scrobble gespeichert).`:''}</p>
   {error&&<p className="lastfm-error-v706" role="alert">{error}</p>}
   {notice&&<p role="status" className="lastfm-notice-v706">{notice}</p>}
   <LastFmDiscoveryHomeV858 key={`home-v858-${user}`} events={archive.events} onOpenArtist={artist=>openExplorer({artist})} onOpenSong={(artist,title)=>openExplorer({artist,title})}/>
   <LastFmInteractiveTimelineV859 key={`timeline-v859-${user}`} events={archive.events} onOpenArtist={artist=>openExplorer({artist})}/>
   <LastFmArtistDeepDiveV860 key={`artist-v860-${user}`} events={archive.events} onOpenArtist={artist=>openExplorer({artist})} onOpenSong={(artist,title)=>openExplorer({artist,title})}/>
   <LastFmSongRediscoveryV861 key={`rediscovery-v861-${user}`} events={archive.events} onOpenSong={(artist,title)=>openExplorer({artist,title})}/>
   <LastFmGenreEvolutionV862 key={`genre-evolution-v862-${user}`} events={archive.events}/>
   <LastFmListeningSessionAnalyzerV863 key={`sessions-v863-${user}`} events={archive.events} onOpenArtist={artist=>openExplorer({artist})} onOpenSong={(artist,title)=>openExplorer({artist,title})}/>
   <LastFmSharedHistoryFilterV726 result={sharedResult} selection={sharedSelection} onChange={applySharedSelectionV726}/>
   <LastFmExplorerV729 key={user} events={archive.events} account={user} selection={explorerSelection} onSelect={setExplorerSelection}/>
   <LastFmOnThisDayPanelV728 key={user} events={archive.events} onOpenDay={(day,artist='',song='')=>{setSharedSelection({...V726_DEFAULT_SELECTION,range:'custom',from:day,to:day});setTerm(song);setArtistFilter(artist);setPeriod('all');setFromDate('');setToDate('');setHistoryPage(1);setCalendarMonth(day.slice(0,7));window.requestAnimationFrame(()=>{const destination=document.getElementById('lastfm-history-chronicle-v716');destination?.focus({preventScroll:true});destination?.scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});});}}/>
   <LastFmPeriodRecapPanelV727 key={user} events={archive.events} onOpenRange={(from,to,artist='',song='')=>{setSharedSelection({...V726_DEFAULT_SELECTION,range:'custom',from,to});setTerm(song);setArtistFilter(artist);setPeriod('all');setFromDate('');setToDate('');setHistoryPage(1);setCalendarMonth(to.slice(0,7));window.requestAnimationFrame(()=>{const destination=document.getElementById('lastfm-history-chronicle-v716');destination?.focus({preventScroll:true});destination?.scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});});}}/>
   <LastFmPersonalInsightsDashboardV722 key={user} account={user} events={sharedResult.events} periodLabel={sharedResult.label}
    onOpenDay={(day)=>{setTerm('');setArtistFilter('');selectHistoryDay(day);}}
    onOpenMonth={openMilestoneMonth}
    onOpenArtist={(year,artist)=>openStoryYear(year,artist)}
    onOpenSong={(artist,title)=>{setTerm(title);setArtistFilter(artist);setPeriod('all');setFromDate('');setToDate('');setSharedSelection({...V726_DEFAULT_SELECTION});setHistoryPage(1);window.requestAnimationFrame(()=>{const destination=document.getElementById('lastfm-history-chronicle-v716');destination?.focus({preventScroll:true});destination?.scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});});}}
    onOpenReturn={(day,artist)=>{setTerm('');setArtistFilter(artist);selectHistoryDay(day);}}/>
   <section className="lastfm-longterm-v710" aria-label="Last.fm Langzeitstatistik">
    <h4>Deine Langzeitstatistik · gesamtes Archiv (unabhängig vom V726-Filter)</h4>
    <div className="lastfm-longterm-kpis-v710">
     <div><strong>{health.last30}</strong><small>Letzte 30 Tage</small></div>
     <div><strong>{health.previous30}</strong><small>Vorherige 30 Tage</small></div>
     <div><strong>{health.activeDays365}</strong><small>Erfasste Tage (365 Tage)</small></div>
     <div><strong>{health.total}</strong><small>Archivierte Ereignisse</small></div>
    </div>
    <h5>Die letzten zwölf Kalendermonate (UTC)</h5>
    <div className="lastfm-months-v710">{health.monthCounts.map(m=><div key={m.month} title={`${m.month}: ${m.count} Scrobbles`}><span>{m.month.slice(5)}</span><i style={{height:`${Math.max(3,Math.round(m.count/maxMonth*70))}px`}}/><strong>{m.count}</strong></div>)}</div>
    <p>Uhrzeiten (UTC): Nacht 0–6 Uhr {health.hourBuckets[0]} · Vormittag 6–12 Uhr {health.hourBuckets[1]} · Nachmittag 12–18 Uhr {health.hourBuckets[2]} · Abend 18–24 Uhr {health.hourBuckets[3]}. Kein Anspruch auf lückenlose Erfassung oder tatsächliche Hörminuten.</p>
   </section>
   <section id="lastfm-history-explorer-v715" className="lastfm-explorer-v715" aria-label="History Explorer – Archiv durchsuchen">
    <div className="lastfm-explorer-header-v715"><div><h4>History Explorer · Gefilterte Chronik</h4><p>Der gemeinsame V726-Zeitraum gilt auch hier. Zusätzliche Such- und Datumsfilter verfeinern nur die Chronik.</p></div><button type="button" onClick={clearHistoryFilters}>Filter zurücksetzen</button></div>
    <section className="lastfm-calendar-v716" aria-label="Interaktiver History-Kalender">
     <div className="lastfm-calendar-title-v716"><div><h5>Hörkalender</h5><p>Tippe einen Tag an und springe zu seinen Songs. Die Farbintensität zeigt gespeicherte Scrobbles – keine Hörminuten.</p></div>
      <div className="lastfm-calendar-nav-v716"><button type="button" aria-label="Vorheriger Monat" disabled={!prevMonth||prevMonth<calendarBounds.oldest} onClick={()=>prevMonth&&setCalendarMonth(prevMonth)}>‹</button><strong aria-live="polite">{calendar.label}</strong><button type="button" aria-label="Nächster Monat" disabled={!nextMonth||nextMonth>calendarBounds.newest} onClick={()=>nextMonth&&setCalendarMonth(nextMonth)}>›</button></div>
     </div>
     <div className="lastfm-calendar-stats-v716"><span><strong>{calendar.total.toLocaleString('de-AT')}</strong> Scrobbles</span><span><strong>{calendar.activeDays}</strong> aktive Tage</span><span>Maximal <strong>{calendar.peakDay}</strong> an einem Tag</span></div>
     <div className="lastfm-calendar-week-v716" aria-hidden="true">{['Mo','Di','Mi','Do','Fr','Sa','So'].map(day=><span key={day}>{day}</span>)}</div>
     <div className="lastfm-calendar-grid-v716" role="group" aria-label={`Tage im ${calendar.label}`}>
      {calendar.cells.map((cell,i)=>cell?<button key={cell.day} type="button" className={`lastfm-calendar-day-v716 level-${cell.level}${selectedDay===cell.day?' is-selected':''}${todayDay===cell.day?' is-today':''}`} aria-pressed={selectedDay===cell.day} aria-label={`${cell.date}. ${calendar.label}: ${cell.count} Scrobbles${selectedDay===cell.day?', ausgewählt':''}`} title={`${cell.day}: ${cell.count} Scrobbles`} onClick={()=>selectHistoryDay(cell.day)}><span>{cell.date}</span><small>{cell.count||'·'}</small></button>:<span key={`empty-${i}`} className="lastfm-calendar-empty-v716" aria-hidden="true"/>)}
     </div>
     <div className="lastfm-calendar-footer-v716"><div className="lastfm-calendar-legend-v716"><span>Weniger</span>{[0,1,2,3,4].map(level=><i key={level} className={`level-${level}`}/>)}<span>Mehr</span></div><div className="lastfm-calendar-shortcuts-v716">{shownMonth!==calendarBounds.newest&&<button type="button" onClick={()=>setCalendarMonth(calendarBounds.newest)}>Zum neuesten Monat</button>}{selectedDay&&<button type="button" onClick={()=>{setPeriod('all');setFromDate('');setToDate('');setHistoryPage(1);}}>Tagesfilter aufheben</button>}</div></div>
     <p className="lastfm-calendar-hint-v716">Kalenderzahlen berücksichtigen den gemeinsamen V726-Zeitraum, deine Suche und den lokalen Künstlerfilter, aber nicht den zusätzlichen Chronik-Datumsfilter. Leere Tage bedeuten nur, dass keine Scrobbles im lokalen Archiv vorhanden sind.</p>
    </section>
    <div id="lastfm-milestones-v717"><LastFmMilestonesPanelV717 events={archive.events} month={shownMonth}
     onSelectDay={(day)=>{setTerm('');setArtistFilter('');selectHistoryDay(day);}} onSelectMonth={openMilestoneMonth}
     onFindSong={(song)=>{setArtistFilter(song.artist);setTerm(song.title);selectHistoryDay(song.day);}}/></div>
    <div id="lastfm-taste-story-v718"><LastFmTasteStoryPanelV718 events={archive.events}
     onOpenYear={(year)=>openStoryYear(year)} onOpenMonth={openMilestoneMonth}
     onOpenArtist={(year,artist)=>openStoryYear(year,artist)}/></div>
    <LastFmArtistDashboardV721 key={user} events={archive.events}
     onOpenRange={openArtistDashboardRangeV721} onOpenArtist={(year,artist)=>openStoryYear(year,artist)}/>
    <LastFmDiscoveryTimelinePanelV720 key={user} events={archive.events}
     onOpenYear={(year)=>openStoryYear(year)} onOpenMonth={(month,artist)=>{openMilestoneMonth(month);setArtistFilter(artist);}}
     onOpenArtist={(year,artist)=>openStoryYear(year,artist)}
     onOpenSong={(year,artist,title)=>{openStoryYear(year,artist);setTerm(title);}}/>
    <LastFmYearComparePanelV719 key={user} events={archive.events}
     onOpenYear={(year)=>openStoryYear(year)} onOpenArtist={(year,artist)=>openStoryYear(year,artist)}
     onOpenSong={(year,artist,title)=>{openStoryYear(year,artist);setTerm(title);}}/>
    <div className="lastfm-search-v706">
     <label>Chronik-Zusatzfilter <select value={period} onChange={(e:{target:{value:string}})=>{setPeriod(e.target.value as V715Period);setHistoryPage(1);}}><option value="all">Gesamtes Archiv</option><option value="30">Letzte 30 Tage</option><option value="365">Letzte 365 Tage</option><option value="custom">Eigener Zeitraum</option></select></label>
     <label>Suche <input type="search" value={term} onChange={(e:{target:{value:string}})=>{setTerm(e.target.value);setHistoryPage(1);}} placeholder="Song, Künstler, Album" aria-label="History durchsuchen"/></label>
     <label>Einträge pro Seite <select value={historyPageSize} onChange={(e:{target:{value:string}})=>{setHistoryPageSize(Number(e.target.value));setHistoryPage(1);}}><option value={50}>50</option><option value={100}>100</option><option value={200}>200</option></select></label>
    </div>
    {period==='custom'&&<div className="lastfm-search-v706 lastfm-dates-v715"><label>Von (einschließlich)<input type="date" min="2000-01-01" value={fromDate} onChange={(e:{target:{value:string}})=>{setFromDate(e.target.value);updateCalendarFromDate(e.target.value);setHistoryPage(1);}}/></label><label>Bis (einschließlich)<input type="date" min="2000-01-01" value={toDate} onChange={(e:{target:{value:string}})=>{setToDate(e.target.value);updateCalendarFromDate(e.target.value);setHistoryPage(1);}}/></label></div>}
    {artistFilter&&<div className="lastfm-artist-active-v715"><span>Künstler: <strong>{artistFilter}</strong></span><button type="button" onClick={()=>{setArtistFilter('');setHistoryPage(1);}}>Künstlerfilter entfernen</button></div>}
    {filtered.error&&<p role="alert" className="lastfm-error-v706">{filtered.error}</p>}
   <div className="lastfm-metrics-v706"><div><strong>{summary.plays}</strong><small>Scrobbles im Filter</small></div><div><strong>{summary.uniqueSongs}</strong><small>Verschiedene Songs</small></div><div><strong>{summary.artists}</strong><small>Künstler</small></div></div>
    <div className="lastfm-explorer-toolbar-v715"><span role="status">{filtered.error?'Ungültiger Zeitraum':visible.length===0?'Keine Treffer':`${(history.start+1).toLocaleString('de-AT')}–${history.end.toLocaleString('de-AT')} von ${history.total.toLocaleString('de-AT')} Treffern · Seite ${history.page} / ${history.pages}`}</span><button type="button" disabled={Boolean(filtered.error)||visible.length===0} onClick={exportFilteredHistory}>Gefilterte CSV ↓</button></div>
    <p className="lastfm-explorer-note-v715">CSV: maximal {V715_CSV_LIMIT.toLocaleString('de-AT')} neueste Treffer mit UTC-Zeitstempel. Das JSON-Backup sichert alle Einträge. Datumsfilter und Tagesgruppen verwenden deine lokale Zeitzone; die 30-/365-Tage-Filter sind gleitende Zeitfenster.</p>
   </section>
   <div className="lastfm-layout-v706"><section id="lastfm-history-chronicle-v716" className="lastfm-chronicle-v716" tabIndex={-1} aria-label="Chronik der gefilterten Scrobbles"><h4>Chronik</h4>{history.total===0?<p className="lastfm-empty-v706">{filtered.error?'Bitte den Zeitraum korrigieren.':'Keine Scrobbles in dieser Auswahl. Passe die Filter an oder importiere deinen Last.fm-Verlauf.'}</p>:<div className="lastfm-history-groups-v715">{groups.map(group=><div className="lastfm-day-group-v715" key={group.day}><h5>{new Date(`${group.day}T12:00:00`).toLocaleDateString('de-AT',{weekday:'long',day:'numeric',month:'long',year:'numeric'})}</h5><ol className="lastfm-tracks-v706">{group.events.map((e,i)=><li key={`${e.playedAt}:${e.artist}:${e.title}:${group.offset+i}`}><span className="lastfm-rank-v706">{String(group.offset+i+1).padStart(2,'0')}</span><div className="lastfm-item-v706"><strong>{e.url?<a href={e.url} target="_blank" rel="noopener noreferrer">{e.title} ↗</a>:e.title}</strong><span><button type="button" className="lastfm-artist-filter-v715" title="Auf diesen Künstler filtern" onClick={()=>{setArtistFilter(e.artist);setHistoryPage(1);}}>{e.artist}</button> · {e.album}</span><small>{date.format(new Date(e.playedAt))}</small><button type="button" onClick={()=>openExplorer({artist:e.artist})}>Künstlerprofil</button><button type="button" onClick={()=>openExplorer({artist:e.artist,title:e.title})}>Songprofil</button></div></li>)}</ol></div>)}</div>}
   {history.total>0&&<nav className="lastfm-pager-v715" aria-label="History Seiten"><button type="button" disabled={history.page<=1} onClick={()=>setHistoryPage(1)}>Erste</button><button type="button" disabled={history.page<=1} onClick={()=>setHistoryPage(p=>Math.max(1,p-1))}>Zurück</button><span>Seite {history.page} von {history.pages}</span><button type="button" disabled={history.page>=history.pages} onClick={()=>setHistoryPage(p=>Math.min(history.pages,p+1))}>Weiter</button><button type="button" disabled={history.page>=history.pages} onClick={()=>setHistoryPage(history.pages)}>Letzte</button></nav>}</section><aside><h4>Deine Top-Künstler</h4><ol>{summary.topArtists.map(([name,count])=><li key={name}><button type="button" className="lastfm-artist-filter-v715" onClick={()=>{setArtistFilter(name);setHistoryPage(1);}} title="Künstler filtern">{name}</button><strong>{count}×</strong></li>)}</ol><h4>Deine Top-Songs</h4><ol>{summary.topSongs.map(e=><li key={`${e.artist}:${e.title}`}><span>{e.title}<small> {e.artist}</small></span><strong>{e.plays}×</strong></li>)}</ol><h4>Monatsverlauf</h4><ol>{summary.months.map(([month,count])=><li key={month}><span>{month}</span><strong>{count}</strong></li>)}</ol></aside></div>
   <LastFmWrappedPanelV712 events={archive.events}/>
   <div key={`monthly-v856-${user}`}><LastFmMonthlyInsightsV856 events={archive.events} onOpenArtist={artist=>openExplorer({artist})} onOpenSong={(artist,title)=>openExplorer({artist,title})}/></div>
   <div key={`discovery-v857-${user}`}><LastFmPersonalDiscoveryV857 events={archive.events} onOpenArtist={artist=>openExplorer({artist})}/></div>
   <LastFmTasteEvolutionPanelV714 events={archive.events}/>
   <LastFmIntelligencePanelV711 events={archive.events}/>
  </>}
  {!user&&error&&<p role="alert" className="lastfm-error-v706">{error}</p>}
  <footer>Quelle: Last.fm · Scrobbles, keine garantierten Hörminuten. Spotify-Archiv und Spotify-Statistiken bleiben unberührt.</footer>
 </section>;
}
