"use client";
import { useEffect, useRef, useState } from "react";
import { currentLiveStageCanvas, LIVE_STAGE_CANVAS_EVENT, LIVE_STAGE_MAX_FPS } from "./liveStagePreviewStateV301";
/** Show the exact rendered stage without creating another WebGL context. */
export function LiveStagePreviewV301({onUnavailable}:{onUnavailable?:()=>void}) {
  const video = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [error,setError] = useState<string|null>(null);
  const [active,setActive] = useState(false);
  useEffect(() => {
    let cancelled = false;
    const stop = () => {
      if (video.current) { video.current.pause(); video.current.srcObject = null; }
      streamRef.current?.getTracks().forEach(t=>t.stop());
      streamRef.current = null;
    };
    const connect = () => {
      stop();
      const canvas = currentLiveStageCanvas();
      if (!canvas) {setActive(false);setError("Keine aktive 3D-Bühne");onUnavailable?.();return;}
      try {
        if (typeof canvas.captureStream !== "function") throw new Error("Canvas-Streaming wird von diesem Browser nicht unterstützt");
        const stream = canvas.captureStream(LIVE_STAGE_MAX_FPS);
        if (!stream.getVideoTracks().length) throw new Error("Der Browser liefert keinen Bühnen-Videostream");
        if (cancelled) {stream.getTracks().forEach(t=>t.stop());return;}
        streamRef.current = stream;
        if (video.current) {
          video.current.srcObject = stream;
          video.current.play().then(()=>{if(!cancelled){setError(null);setActive(true);}}).catch(()=>{setError("Videovorschau konnte nicht gestartet werden");setActive(false);onUnavailable?.();});
        }
      } catch(e) {setError(e instanceof Error?e.message:"Live-Vorschau nicht verfügbar");setActive(false);onUnavailable?.();}
    };
    connect();
    window.addEventListener(LIVE_STAGE_CANVAS_EVENT,connect);
    return ()=>{cancelled=true;window.removeEventListener(LIVE_STAGE_CANVAS_EVENT,connect);stop();};
  },[onUnavailable]);
  return <div className="live-stage-preview-v301">
    <video ref={video} muted playsInline autoPlay aria-label="Echtes Live-Bühnenbild mit Avatar, Licht und aktiver Kamera" style={{display:active?"block":"none"}} />
    {error&&<p className="camera-dashboard-no-preview-v300" role="status">{error}. Verwende bei Bedarf die schematische Vorschau.</p>}
    <small>{active?`Live-Bühnenbild · bestehendes Canvas · maximal ${LIVE_STAGE_MAX_FPS} FPS · kein zweiter WebGL-Kontext`:"Die Vorschau benötigt eine aktive 3D-Bühne und Canvas-Streaming im Browser."}</small>
  </div>;
}
