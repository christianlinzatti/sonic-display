"use client";
import { useEffect, useRef, type PointerEvent as ReactPointerEvent, type ReactNode, type KeyboardEvent } from "react";
import { publishCameraOrbitGesture } from "./cameraOrbitV303";

type Point = {x:number;y:number};
function distance(a:Point,b:Point){return Math.hypot(a.x-b.x,a.y-b.y);}
/** Transparent pointer overlay over the existing captured stage video / SVG. Never creates a Canvas. */
export function VisualCameraOrbitSurfaceV303({active,children}:{active:boolean;children:ReactNode}) {
  const layer=useRef<HTMLDivElement>(null);
  const pointers=useRef(new Map<number,Point>());
  const pinch=useRef<number|null>(null);
  const midpoint=useRef<Point|null>(null);
  const dragPan=useRef(false);
  const clear=()=>{pointers.current.clear();pinch.current=null;midpoint.current=null;dragPan.current=false;};
  useEffect(()=>{if(!active)clear();return clear;},[active]);
  useEffect(()=>{
    if(!active)return;
    const element=layer.current;
    if(!element)return;
    // A non-passive handler reliably prevents page scrolling while zooming on the stage.
    const wheel=(event:WheelEvent)=>{
      event.preventDefault();
      const pixels=event.deltaY*(event.deltaMode===1?16:event.deltaMode===2?420:1);
      publishCameraOrbitGesture({kind:"zoom",factor:Math.exp(Math.max(-350,Math.min(350,pixels))*.0015)});
    };
    element.addEventListener("wheel",wheel,{passive:false});
    return ()=>element.removeEventListener("wheel",wheel);
  },[active]);
  const down=(event:ReactPointerEvent<HTMLDivElement>)=>{
    if(!active || (event.pointerType==="mouse" && event.button!==0 && event.button!==2))return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    if(event.pointerType==="mouse")dragPan.current=event.button===2 || event.shiftKey || event.altKey;
    pointers.current.set(event.pointerId,{x:event.clientX,y:event.clientY});
    const list=[...pointers.current.values()];
    pinch.current=list.length===2?distance(list[0],list[1]):null;
    midpoint.current=list.length===2?{x:(list[0].x+list[1].x)/2,y:(list[0].y+list[1].y)/2}:null;
  };
  const move=(event:ReactPointerEvent<HTMLDivElement>)=>{
    if(!active)return;
    const previous=pointers.current.get(event.pointerId);
    if(!previous)return;
    event.preventDefault();
    const updated={x:event.clientX,y:event.clientY};
    pointers.current.set(event.pointerId,updated);
    const list=[...pointers.current.values()];
    if(list.length===1){publishCameraOrbitGesture({kind:dragPan.current?"pan":"rotate",deltaX:updated.x-previous.x,deltaY:updated.y-previous.y});return;}
    if(list.length===2){
      const current=distance(list[0],list[1]);
      const before=pinch.current;
      if(before!==null && before>4 && current>4)publishCameraOrbitGesture({kind:"zoom",factor:before/current});
      pinch.current=current;
      const now={x:(list[0].x+list[1].x)/2,y:(list[0].y+list[1].y)/2};
      if(midpoint.current)publishCameraOrbitGesture({kind:"pan",deltaX:now.x-midpoint.current.x,deltaY:now.y-midpoint.current.y});
      midpoint.current=now;
    }
  };
  const up=(event:ReactPointerEvent<HTMLDivElement>)=>{
    pointers.current.delete(event.pointerId);
    pinch.current=null;midpoint.current=null;
    const list=[...pointers.current.values()];
    if(list.length===2){pinch.current=distance(list[0],list[1]);midpoint.current={x:(list[0].x+list[1].x)/2,y:(list[0].y+list[1].y)/2};}
    if(event.currentTarget.hasPointerCapture(event.pointerId))event.currentTarget.releasePointerCapture(event.pointerId);
  };
  const key=(event:KeyboardEvent<HTMLDivElement>)=>{
    if(!active)return;
    let gesture:{kind:"rotate"|"pan";deltaX:number;deltaY:number}|{kind:"zoom";factor:number}|null=null;
    const pan=event.shiftKey || event.altKey;
    switch(event.key){
      case "ArrowLeft":gesture={kind:pan?"pan":"rotate",deltaX:-24,deltaY:0};break;
      case "ArrowRight":gesture={kind:pan?"pan":"rotate",deltaX:24,deltaY:0};break;
      case "ArrowUp":gesture={kind:pan?"pan":"rotate",deltaX:0,deltaY:-24};break;
      case "ArrowDown":gesture={kind:pan?"pan":"rotate",deltaX:0,deltaY:24};break;
      case "+":case "=":gesture={kind:"zoom",factor:.91};break;
      case "-":gesture={kind:"zoom",factor:1.1};break;
    }
    if(gesture){event.preventDefault();publishCameraOrbitGesture(gesture);}
  };
  return <div className={`visual-camera-orbit-surface-v303${active?" visual-camera-orbit-active-v303":""}`}>
    {children}
    {active&&<div ref={layer} onContextMenu={e=>e.preventDefault()} className="visual-camera-orbit-hit-v303" role="group" tabIndex={0}
      aria-label="360-Grad-Kamera: Ziehen oder Pfeiltasten dreht, Rechtsklick-Ziehen oder Shift-Ziehen verschiebt. Zwei Finger verschieben und zoomen, Mausrad zoomt."
      onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up} onLostPointerCapture={up} onKeyDown={key}>
      <span className="visual-camera-orbit-hint-v303" aria-hidden="true">360°: Ziehen · Pan: Shift/Rechtsziehen oder zwei Finger · Zoom: Rad/Pinch</span>
    </div>}
  </div>;
}
