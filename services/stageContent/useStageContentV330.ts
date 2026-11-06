"use client";
import {backgroundJsonV1009 as fetch} from '@/lib/backgroundJsonV1009';
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
    void loadStageSlidesV330({id:trackId,title,artist,albumCoverUrl:coverUrl},settings,abort.signal,data=>{if(!abort.signal.aborted)setSlides(data);})
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
    let reconnectTimer:ReturnType<typeof setTimeout>|undefined;
    let attempt=0;
    let connecting=false;
    const configAbort=new AbortController();
    type Message={id:string;title?:string;text:string;durationSeconds?:number;receivedAt?:number;priority?:string};
    let current:Message|null=null;const queue:Message[]=[];const seen=new Set<string>();
    const pump=()=>{
      if(disposed||current)return;
      const next=queue.shift();if(!next){setLivePush(null);return;}
      current=next;const expires=Date.now()+Math.max(3,Math.min(120,next.durationSeconds??15))*1000;
      setLivePush({id:next.id,item:{source:'text',kind:'text',title:String(next.title||'Nachricht').slice(0,90),text:next.text.slice(0,1600)},expires});
      timeout=setTimeout(()=>{current=null;pump();},expires-Date.now());
    };
    const show=(raw:unknown)=>{
      if(disposed||!raw||typeof raw!=='object')return;const msg=raw as Message;
      if(typeof msg.id!=='string'||typeof msg.text!=='string'||!msg.text.trim()||seen.has(msg.id))return;
      if(typeof msg.receivedAt==='number'&&Date.now()-msg.receivedAt>300000)return;
      seen.add(msg.id);if(seen.size>200)seen.delete(seen.values().next().value!);
      if(msg.priority==='high'){
        if(current&&current.priority!=='high'){if(timeout)clearTimeout(timeout);queue.unshift(current);current=null;}
        const firstNormal=queue.findIndex(m=>m.priority!=='high');queue.splice(firstNormal<0?queue.length:firstNormal,0,msg);
      }else queue.push(msg);
      if(queue.length>30)queue.pop();pump();
    };
    const local=()=>{
      if(disposed)return;
      stream=new EventSource("/api/stage-content/live");
      stream.addEventListener("stage-message",event=>{
        try{show(JSON.parse((event as MessageEvent).data));}catch{/* malformed payload */}
      });
    };
    const connect=async()=>{
      if(disposed||stream||realtime||connecting)return;
      connecting=true;
      try{
        const result=await fetch("/api/stage-content/realtime-config",{cache:"no-store",signal:configAbort.signal});
        if(disposed)return;
        if(!result.ok)throw new Error("Konfiguration vorübergehend nicht verfügbar");
        const config=await result.json() as {enabled:boolean;channel:string};
        if(disposed)return;
        if(!config.enabled){local();return;}
        const {Realtime}=await loadAblyBrowserV389();
        if(disposed)return;
        const client=new Realtime({authUrl:"/api/stage-content/realtime-token",authMethod:"GET"});
        realtime=client;
        const channel=client.channels.get(config.channel);
        await channel.subscribe("stage-message",message=>{if(!disposed)show(message.data);});
        attempt=0;
      }catch{
        if(disposed)return;
        if(realtime){realtime.close();realtime=null;}
        // Do not silently switch to instance-local SSE when Ably may be configured.
        // Retry the configuration endpoint, even after an initial network failure.
        reconnectTimer=setTimeout(()=>{reconnectTimer=undefined;void connect();},Math.min(30000,1000*2**Math.min(attempt++,5)));
      }finally{connecting=false;}
    };
    const onOnline=()=>{if(reconnectTimer)clearTimeout(reconnectTimer);reconnectTimer=undefined;void connect();};
    window.addEventListener("online",onOnline);
    void connect();
    return()=>{disposed=true;window.removeEventListener("online",onOnline);if(timeout)clearTimeout(timeout);if(reconnectTimer)clearTimeout(reconnectTimer);configAbort.abort();stream?.close();realtime?.close();};
  },[settings.enabled]);
  const item=useMemo(()=>settings.enabled?(livePush&&livePush.expires>Date.now()?livePush.item:selectStageSlidesV330(slides,index)):null,[settings.enabled,slides,index,livePush]);
  const musicPalette=settings.accentFromCover&&coverUrl===palette?.url?palette.value:null;
  return {settings,slides,item,musicPalette,livePush:livePush&&livePush.expires>Date.now()?livePush.item:null,rotationIndex:index};
}
