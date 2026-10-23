"use client";
import { useEffect, useMemo, useState } from "react";
import type { CSSProperties } from "react";
import { MUSIC_GENRES, type MusicGenre } from "@/config/musicGenres";

const THEME_KEY = "sonic-display:v168:theme-enabled";
export type AmbientPalette = { primary: string; secondary: string; glow: string; source: "genre" | "cover" };
const DEFAULT_PALETTE: AmbientPalette = { primary: "#31d7dc", secondary: "#15374c", glow: "#31d7dc", source: "genre" };
export function genrePalette(genre: MusicGenre | null): AmbientPalette { return genre && MUSIC_GENRES[genre] ? {primary:MUSIC_GENRES[genre].a,secondary:MUSIC_GENRES[genre].b,glow:MUSIC_GENRES[genre].accent,source:"genre"} : DEFAULT_PALETTE; }
/** Cover sampling works only for images permitted by CORS; failures are expected and safe. */
export function sampleCoverPalette(url: string, signal?: AbortSignal): Promise<AmbientPalette | null> {
  return new Promise(resolve => {
    if (typeof Image === "undefined" || !url || signal?.aborted) { resolve(null); return; }
    const img = new Image(); img.crossOrigin = "anonymous";
    let finished = false;
    const finish = (value: AmbientPalette | null) => { if(finished)return;finished=true;img.onload=null;img.onerror=null;signal?.removeEventListener("abort",abort);resolve(value); };
    const abort = () => { img.src = ""; finish(null); };
    signal?.addEventListener("abort",abort,{once:true});
    img.onerror = () => finish(null);
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");canvas.width=24;canvas.height=24;
        const ctx=canvas.getContext("2d",{willReadFrequently:true});if(!ctx){finish(null);return;}
        ctx.drawImage(img,0,0,24,24);
        const pixels=ctx.getImageData(0,0,24,24).data;
        let best=-1, rgb:[number,number,number]=[60,150,170];
        for(let i=0;i<pixels.length;i+=4){const r=pixels[i],g=pixels[i+1],b=pixels[i+2];
          const max=Math.max(r,g,b),min=Math.min(r,g,b),sat=max-min;
          const light=(max+min)/2;if(pixels[i+3]<225||light<40||light>220||sat<32)continue;
          const score=sat * (1-Math.abs(light-137)/240);
          if(score>best){best=score;rgb=[r,g,b];}
        }
        if(best<0){finish(null);return;}
        const hex=(value:number)=>Math.round(Math.max(0,Math.min(255,value))).toString(16).padStart(2,"0");
        const primary=`#${rgb.map(hex).join("")}`;
        const secondary=`#${rgb.map(c=>hex(c*.33)).join("")}`;
        finish({primary,secondary,glow:primary,source:"cover"});
      }catch{finish(null);} // CORS-tainted canvas, invalid artwork or unsupported browser
    };
    img.src=url;
  });
}
export function useMusicAwareTheme(genre:MusicGenre|null,coverUrl?:string|null) {
  const [enabled,setEnabled]=useState(false);
  const [cover,setCover]=useState<{url:string; palette:AmbientPalette}|null>(null);
  useEffect(()=>{try{setEnabled(localStorage.getItem(THEME_KEY)==="true");}catch{}},[]);
  const toggle=(next:boolean)=>{setEnabled(next);try{localStorage.setItem(THEME_KEY,String(next));}catch{}};
  useEffect(()=>{
    if(!enabled||!coverUrl){return;}
    const abort=new AbortController();
    void sampleCoverPalette(coverUrl,abort.signal).then(palette=>{if(!abort.signal.aborted)setCover(palette?{url:coverUrl,palette}:null);});
    return()=>abort.abort();
  },[enabled,coverUrl]);
  const palette=useMemo(()=>coverUrl&&cover?.url===coverUrl?cover.palette:genrePalette(genre),[cover,coverUrl,genre]);
  const vars=useMemo(()=>({"--sonic-theme-primary":palette.primary,"--sonic-theme-secondary":palette.secondary,"--sonic-theme-glow":palette.glow} as CSSProperties),[palette]);
  return {enabled,setEnabled:toggle,palette,vars};
}
