"use client";
import {useEffect,useMemo,useState} from "react";
import {STAGE_CONTENT_EVENT_V330,STAGE_CONTENT_KEY_V330,readStageContentV330,selectStageSlidesV330,type StageContentV330} from "./stageContentV330";
import {loadStageSlidesV330} from "./providersV330";
import {sampleStageCoverV330,type ImagePaletteV330} from "./paletteV330";
import {loadAblyBrowserV389,type AblyRealtimeClientV389} from "./ablyBrowserClientV389";
export function useStageContentV330(track:{id:string;title:string;artist:string;albumCoverUrl:string|null}|null){
  const [settings,setSettings]=useState(readStageContentV330);
  const [slides,setSlides]=useState<StageContentV330[]>([]);
  const [index,setIndex]=useState(0);
  const [livePush,setLivePush]=useState<{item:StageContentV330;id:string;expires:number}|null>(null);
  const [palette,setPalette]=useState<{url:string;value:ImagePaletteV330}|null>(null);
  useEffect(()=>{
    const reload=()=>setSettings(readStageContentV330());
    const storage=(e:StorageEvent)=>{if(e.key===STAGE_CONTENT_KEY_V330)reload();};
    reload();window.addEventListener(STAGE_CONTENT_EVENT_V330,reload);window.addEventListener("storage",storage);
    return()=>{window.removeEventListener(STAGE_CONTENT_EVENT_V330,reload);window.removeEventListener("storage",storage);};
  },[]);
  const trackId=track?.id??"",title=track?.title??"",artist=track?.artist??"",coverUrl=track?.albumCoverUrl??null;
  useEffect(()=>{
    const abort=new AbortController();
    setSlides([]);setIndex(0);
    if(!settings.enabled||!trackId)return()=>abort.abort();
    void loadStageSlidesV330({id:trackId,title,artist,albumCoverUrl:coverUrl},settings,abort.signal)
      .then(data=>{if(!abort.signal.aborted)setSlides(data);});
    return()=>abort.abort();
  },[settings,trackId,title,artist,coverUrl]);
  useEffect(()=>{
    if(!settings.enabled||slides.length<2)return;
    const timer=window.setInterval(()=>setIndex(n=>(n+1)%slides.length),settings.rotationSeconds*1000);
    return()=>window.clearInterval(timer);
  },[settings.enabled,settings.rotationSeconds,slides.length]);
  useEffect(()=>{
    const abort=new AbortController();
    if(!settings.accentFromCover||!coverUrl){setPalette(null);return()=>abort.abort();}
    void sampleStageCoverV330(coverUrl,abort.signal).then(value=>{if(!abort.signal.aborted)setPalette(value?{url:coverUrl,value}:null);});
    return()=>abort.abort();
  },[settings.accentFromCover,coverUrl]);
  // Immediate push content pre-empts the normal rotation; restore the original slide on expiry.
  useEffect(()=>{
    if(!settings.enabled){setLivePush(null);return;}
    let stream:EventSource|null=null;
    let realtime:AblyRealtimeClientV389|null=null;
    let disposed=false;
    let timeout:ReturnType<typeof setTimeout>|undefined;
    const show=(raw:unknown)=>{
      if(!raw||typeof raw!=="object")return;
      const msg=raw as {id?:string;title?:string;text?:string;durationSeconds?:number;receivedAt?:number};
      if(!msg.id||typeof msg.text!=="string"||!msg.text.trim())return;
      const expires=(msg.receivedAt??Date.now())+Math.max(3,Math.min(120,msg.durationSeconds??15))*1000;
      if(expires<=Date.now())return;
      if(timeout)clearTimeout(timeout);
      setLivePush({id:msg.id,item:{source:"text",kind:"text",title:String(msg.title||"Nachricht").slice(0,90),text:msg.text.slice(0,1600)},expires});
      timeout=setTimeout(()=>setLivePush(current=>current?.id===msg.id?null:current),expires-Date.now());
    };
    const local=()=>{
      if(disposed)return;
      stream=new EventSource("/api/stage-content/live");
      stream.addEventListener("stage-message",event=>{
        try{show(JSON.parse((event as MessageEvent).data));}catch{/* malformed payload */}
      });
    };
    void (async()=>{
      try{
        const result=await fetch("/api/stage-content/realtime-config",{cache:"no-store"});
        if(disposed)return;
        if(!result.ok){local();return;}
        const config=await result.json() as {enabled:boolean;channel:string};
        if(!config.enabled){local();return;}
        const {Realtime}=await loadAblyBrowserV389();
        if(disposed)return;
        const client=new Realtime({authUrl:"/api/stage-content/realtime-token",authMethod:"GET"});
        realtime=client;
        const channel=client.channels.get(config.channel);
        await channel.subscribe("stage-message",message=>{if(!disposed)show(message.data);});
      }catch{
        // Never use instance-local SSE as a fake cross-instance fallback if Ably is configured.
        // Browser SDK reconnects on transient transport failures.
      }
    })();
    return()=>{disposed=true;if(timeout)clearTimeout(timeout);stream?.close();realtime?.close();};
  },[settings.enabled]);
  const item=useMemo(()=>settings.enabled?(livePush&&livePush.expires>Date.now()?livePush.item:selectStageSlidesV330(slides,index)):null,[settings.enabled,slides,index,livePush]);
  const musicPalette=settings.accentFromCover&&coverUrl===palette?.url?palette.value:null;
  return {settings,slides,item,musicPalette,livePush:livePush&&livePush.expires>Date.now()?livePush.item:null,rotationIndex:index};
}
