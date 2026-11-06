"use client";
import {networkJsonV1010,requestActionV1010} from '@/lib/networkJsonV1010';
import {clientNetworkV1010} from '@/lib/networkCoordinatorV1010';
import {useEffect,useMemo,useRef,useState} from "react";
import type {Track} from "@/types/music";

type Artist = NonNullable<Track["artistDetails"]>[number];
type FollowState = boolean|null;
type ApiError = {code?:string;message?:string};
const isConsentError=(code:string|undefined)=>code==="consent_required"||code==="reauth_required";
/** Per-track keyed component, requests only when artists change; no per-frame requests. */
export function ArtistFollowV359({artists}:{artists:Artist[]|undefined}) {
  const entries=useMemo(()=>Array.from(new Map((artists??[]).filter(a=>/^[A-Za-z0-9]{10,32}$/.test(a.id)).map(a=>[a.id,a])).values()).slice(0,10),[artists]);
  const ids=entries.map(a=>a.id).join(",");
  const [statuses,setStatuses]=useState<Record<string,FollowState>>({});
  const [busy,setBusy]=useState<string|null>(null);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState<string|null>(null);
  const [needsConsent,setNeedsConsent]=useState(false);
  const [apiUnsupported,setApiUnsupported]=useState(false);
  useEffect(() => {
    const onFollow = (event: Event) => {
      const data = (event as CustomEvent<{artistId?:unknown;following?:unknown}>).detail;
      const artistId = data?.artistId;
      const following = data?.following;
      if (typeof artistId === "string" && typeof following === "boolean") {
        setStatuses(previous => Object.hasOwn(previous, artistId)
          ? {...previous, [artistId]: following}
          : previous);
      }
    };
    window.addEventListener("sonic:artist-follow-changed-v359", onFollow);
    return () => window.removeEventListener("sonic:artist-follow-changed-v359", onFollow);
  }, []);
  const mounted=useRef(true);
  useEffect(()=>{mounted.current=true;return()=>{mounted.current=false;};},[]);
  useEffect(()=>{
    const controller=new AbortController();
    setStatuses({});setLoading(Boolean(ids));setError(null);setNeedsConsent(false);setApiUnsupported(false);
    if(!ids)return;
    const read=async()=>{
      try {
        const response=await networkJsonV1010(`/api/spotify/artists/follow?ids=${encodeURIComponent(ids)}`,{cache:"no-store",signal:controller.signal},{provider:"spotify",priority:"lyrics",ttlMs:20000,staleMs:40000});
        const data=await response.json() as {statuses?:Record<string,boolean|null>}&ApiError;
        if(!response.ok){setNeedsConsent(isConsentError(data.code));setApiUnsupported(data.code==="unsupported");throw new Error(data.message??"Spotify-Follow-Status nicht verfügbar.");}
        if(!data.statuses)throw new Error("Spotify hat keinen Follow-Status geliefert.");
        setStatuses(data.statuses);
      }catch(e){if(!controller.signal.aborted)setError(e instanceof Error?e.message:"Abfrage fehlgeschlagen.");}
      finally{if(!controller.signal.aborted)setLoading(false);}
    };
    void read();
    return()=>controller.abort();
  },[ids]);
  const change=async(artist:Artist,follow:boolean)=>{
    if(busy||needsConsent||apiUnsupported)return;
    setBusy(artist.id);setError(null);
    try {
      const response=await requestActionV1010(`artist-follow:${artist.id}`,async signal=>{
        const response=await fetch("/api/spotify/artists/follow",{method:"POST",cache:"no-store",signal,headers:{"Content-Type":"application/json"},body:JSON.stringify({artistId:artist.id,follow})});
        const body=await response.json();return {ok:response.ok,status:response.status,headers:response.headers,json:async()=>body};
      });
      const data=await response.json() as {following?:boolean}&ApiError;
      if(!response.ok){setNeedsConsent(isConsentError(data.code));setApiUnsupported(data.code==="unsupported");throw Object.assign(new Error(data.message??"Spotify konnte das Abo nicht ändern."),{status:response.status});}
      if(typeof data.following!=="boolean")throw new Error("Spotify hat die Änderung nicht bestätigt.");
      clientNetworkV1010.invalidatePrefix('spotify:/api/spotify/artists/follow?');
      if(mounted.current)setStatuses(previous=>({...previous,[artist.id]:data.following!}));
    }catch(e){
      const knownStatus=(e as {status?:number}).status;
      if(knownStatus&&knownStatus<500){if(mounted.current)setError(e instanceof Error?e.message:'Spotify-Aktion fehlgeschlagen.');return;}
      // A timed-out mutation might have succeeded. Read back before showing failure.
      clientNetworkV1010.invalidatePrefix('spotify:/api/spotify/artists/follow?');
      try{
        const checked=await networkJsonV1010(`/api/spotify/artists/follow?ids=${encodeURIComponent(artist.id)}`,{cache:'no-store'},
          {provider:'spotify',priority:'action',retry:0,fresh:true});
        const actual=await checked.json() as {statuses?:Record<string,boolean>};
        if(checked.ok&&typeof actual.statuses?.[artist.id]==='boolean'){
          const following=actual.statuses[artist.id];
          if(mounted.current)setStatuses(previous=>({...previous,[artist.id]:following}));
          if(following===follow){if(mounted.current)setError(null);return;}
        }
      }catch{/* confirmation unavailable: keep state unconfirmed */}
      if(mounted.current)setError(e instanceof Error?e.message:"Spotify-Aktion unbestätigt. Bitte Status erneut prüfen.");
    }
    finally{if(mounted.current)setBusy(null);}
  };
  if(!entries.length)return null;
  return <section className="artist-follow-v359" aria-label="Spotify Künstler-Abonnements">
    <div className="artist-follow-heading-v359">Künstler auf Spotify</div>
    <div className="artist-follow-list-v359">
      {entries.map(artist=>{
        const followed=statuses[artist.id];
        const known=typeof followed==="boolean";
        return <div key={artist.id} className="artist-follow-entry-v359">
          <a href={artist.spotifyUrl} target="_blank" rel="noopener noreferrer" title={`${artist.name} auf Spotify öffnen`}>{artist.name} <span aria-hidden="true">↗</span></a>
          <span className={followed===true?"artist-follow-yes-v359":"artist-follow-state-v359"} aria-live="polite">{loading?"Prüfe …":followed===true?"✓ Du folgst":followed===false?"Noch nicht gefolgt":"Status unbekannt"}</span>
          <button type="button" disabled={!known||Boolean(busy)||loading||needsConsent||apiUnsupported} aria-label={`${artist.name} ${followed?"entfolgen":"folgen"}`} onClick={()=>void change(artist,!followed)}>{busy===artist.id?"Speichere …":followed?"Entfolgen":"+ Folgen"}</button>
        </div>;
      })}
    </div>
    {error&&<p role="alert" className="artist-follow-error-v359">{error}</p>}
    {needsConsent&&<a className="artist-follow-login-v359" href="/api/spotify/login">Spotify neu verbinden und Zugriff erlauben</a>}
    {apiUnsupported&&<p className="artist-follow-hint-v359">Öffne den Künstler über den Namen und folge direkt in Spotify.</p>}
  </section>;
}
