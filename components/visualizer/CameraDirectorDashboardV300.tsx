"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { LiveStagePreviewV301 } from "./LiveStagePreviewV301";
import { LiveCameraEditingStudioV302 } from "./LiveCameraEditingStudioV302";
import { VisualCameraOrbitSurfaceV303 } from "./VisualCameraOrbitSurfaceV303";
import { CAMERA_ORBIT_ACTIVE_EVENT } from "./cameraOrbitV303";
import { CAMERA_PRESET_EVENT, readCameraPresets, type CameraPresetLibrary, EMPTY_CAMERA_PRESETS } from "./cameraPresetLibraryV290";
import { CAMERA_KEYFRAMES_EVENT, readCameraKeyframes, type CameraKeyframe } from "./cameraKeyframesV295";
import { CAMERA_DASHBOARD_NAV_EVENT, CAMERA_DASHBOARD_STAGE_EDGES, buildCameraDashboardLanes, cameraKeyframePosition, cameraLaneCursor, projectCameraStagePoint, type CameraDashboardNavigation } from "./cameraDashboardHelpersV300";
import type { CameraStudioStatus } from "./cameraStudioHelpersV299";
import type { StageSection } from "./stageDirectorV287";

const labels:Record<StageSection,string>={verse:"Verse",break:"Break",build:"Build",hook:"Hook",drop:"Drop"};
type Props={status:CameraStudioStatus|null;connected:boolean};
function SchematicStageView({status}:{status:CameraStudioStatus}) {
  const lines = useMemo(()=>CAMERA_DASHBOARD_STAGE_EDGES.map(([a,b],i)=>{
    const from=projectCameraStagePoint(a,status);
    const to=projectCameraStagePoint(b,status);
    return from&&to?{key:i,from,to}:null;
  }).filter((s):s is NonNullable<typeof s>=>s!==null),[status]);
  const nodes=useMemo(()=>{
    const n=(x:number,y:number,z:number)=>projectCameraStagePoint([x,y,z],status);
    return [{name:"Kopf",point:n(0,1.1,0),radius:16},{name:"Torso",point:n(0,.2,0),radius:24},
      {name:"Links",point:n(-.65,-.1,0),radius:8},{name:"Rechts",point:n(.65,-.1,0),radius:8},
      {name:"Fuß links",point:n(-.3,-1.1,0),radius:7},{name:"Fuß rechts",point:n(.3,-1.1,0),radius:7}];
  },[status]);
  const bodyEdges:[[number,number,number],[number,number,number]][]=[
    [[0,1.1,0],[0,.2,0]],[[0,.2,0],[-.65,-.1,0]],[[0,.2,0],[.65,-.1,0]],
    [[0,.2,0],[-.3,-1.1,0]],[[0,.2,0],[.3,-1.1,0]],
  ];
  return <svg viewBox="0 0 420 238" width="100%" height="238" aria-label="Schematische 3D-Bühne aus Sicht der aktuellen Live-Kamera" role="img">
    <defs><linearGradient id="camera-dash-bg-v300" x2="0" y2="1"><stop stopColor="#141f37"/><stop offset="1" stopColor="#050b16"/></linearGradient></defs>
    <rect width="420" height="238" fill="url(#camera-dash-bg-v300)"/>
    {lines.map(edge=><line key={edge.key} x1={edge.from.x} y1={edge.from.y} x2={edge.to.x} y2={edge.to.y} stroke="#6383b5" strokeOpacity={edge.key>3?.25:.65} strokeWidth={edge.key<4?1.4:.8}/>)}
    {bodyEdges.map(([a,b],i)=>{const from=projectCameraStagePoint(a,status),to=projectCameraStagePoint(b,status);return from&&to?<line key={i} x1={from.x} y1={from.y} x2={to.x} y2={to.y} stroke="#75d5ee" strokeWidth="8" strokeLinecap="round"/>:null;})}
    {nodes.map(node=>node.point?<circle key={node.name} cx={node.point.x} cy={node.point.y} r={node.radius*(4.2/Math.max(1.2,Math.abs(status.camera.z)))} fill="#8eebfa" stroke="#c9faff" strokeWidth="1.2"/>:null)}
    <path d="M201 119 H219 M210 110 V128" stroke="#ffffff9c" strokeWidth="1"/>
    <rect x="9" y="8" rx="6" width="120" height="22" fill="#0a1527de"/>
    <text x="18" y="23" fill="#cfe8ff" fontSize="11">LIVE · 3D-Framing</text>
    <text x="410" y="227" fill="#9fbed7" fontSize="10" textAnchor="end">FOV {status.camera.fov.toFixed(0)}° · Z {status.camera.z.toFixed(1)}</text>
  </svg>;
}
export function CameraDirectorDashboardV300({status,connected}:Props) {
  const [library,setLibrary]=useState<CameraPresetLibrary>(EMPTY_CAMERA_PRESETS);
  const [allFrames,setAllFrames]=useState<Record<string,CameraKeyframe[]>>({});
  const [selected,setSelected]=useState<StageSection>("verse");
  const [showPreview,setShowPreview]=useState(false);
  const [previewMode,setPreviewMode]=useState<"live"|"schematic">("live");
  const [orbitActive,setOrbitActive]=useState(false);
  useEffect(()=>{
    const onActive=(e:Event)=>setOrbitActive((e as CustomEvent<unknown>).detail===true);
    window.addEventListener(CAMERA_ORBIT_ACTIVE_EVENT,onActive);
    return ()=>window.removeEventListener(CAMERA_ORBIT_ACTIVE_EVENT,onActive);
  },[]);
  const onUnavailable=useCallback(()=>{},[]);
  useEffect(()=>{
    const sync=()=>{const l=readCameraPresets();setLibrary(l);setAllFrames(Object.fromEntries(l.presets.map(p=>[p.id,readCameraKeyframes(p.id)])));};
    sync();window.addEventListener(CAMERA_PRESET_EVENT,sync);window.addEventListener(CAMERA_KEYFRAMES_EVENT,sync);window.addEventListener("storage",sync);
    return ()=>{window.removeEventListener(CAMERA_PRESET_EVENT,sync);window.removeEventListener(CAMERA_KEYFRAMES_EVENT,sync);window.removeEventListener("storage",sync);};
  },[]);
  const lanes=useMemo(()=>buildCameraDashboardLanes(library,allFrames),[library,allFrames]);
  const section=status?.section ?? selected;
  const navigate=(payload:CameraDashboardNavigation)=>{
    setSelected(payload.section);
    window.dispatchEvent(new CustomEvent(CAMERA_DASHBOARD_NAV_EVENT,{detail:payload}));
  };
  return <section className="camera-dashboard-v300" aria-label="Visual Camera Director Dashboard">
    <header className="camera-dashboard-heading-v300"><h4>V300 · Visual Camera Director Dashboard</h4><span className="camera-dashboard-connection-v300">{connected?"● Live-Kamera verbunden":"○ Keine Live-Bühne"}</span></header>
    <p>Grafische Übersicht deiner fünf Songphasen, zugewiesenen Presets und Keyframes. Die Zeilen zeigen <strong>Animationszeit innerhalb der jeweiligen Kamerafahrt</strong>, nicht erfundene Songabschnitt-Grenzen.</p>
    <div className="camera-dashboard-lanes-v300" role="group" aria-label="Kamera-Keyframe-Timelines">
      {lanes.map(lane=>{
        const active=connected&&section===lane.section;
        const cursor=active&&status?.source==="Keyframe-Fahrt"?cameraLaneCursor(status.progressMs,lane.duration):null;
        return <div key={lane.section} className={`camera-dashboard-lane-v300${active?" camera-dashboard-lane-active-v300":""}`}>
          <button type="button" className="camera-dashboard-lane-label-v300" aria-pressed={selected===lane.section} onClick={()=>navigate({section:lane.section,presetId:lane.presetId??undefined})} title={`${labels[lane.section]} im Preset-Editor öffnen`}>
            {labels[lane.section]} {active?"●":""}
          </button>
          <div className="camera-dashboard-lane-detail-v300"><span>{lane.presetName??"Automatische Kamera"}</span><small>{lane.keyframes.length?`${lane.keyframes.length} Keyframes · ${lane.duration.toFixed(1)} s`:"Keine Keyframes"}</small></div>
          <div className="camera-dashboard-track-v300" aria-label={`${labels[lane.section]}: ${lane.keyframes.length} Keyframes`}>
            {lane.duration>0&&<div className="camera-dashboard-track-line-v300"/>}
            {lane.keyframes.map(frame=><button key={frame.id} type="button" className="camera-dashboard-keyframe-v300" style={{left:`${cameraKeyframePosition(frame.time,lane.duration)}%`}} title={`${labels[lane.section]} · ${frame.time.toFixed(2)} s – Keyframe bearbeiten`} aria-label={`${labels[lane.section]} Keyframe bei ${frame.time.toFixed(2)} Sekunden bearbeiten`} onClick={()=>navigate({section:lane.section,presetId:lane.presetId??undefined,seconds:frame.time})}/>)}
            {cursor!==null&&<span className="camera-dashboard-playhead-v300" style={{left:`${cursor}%`}} title={`Songposition ${Math.round((status?.progressMs??0)/1000)} Sekunden`}/>}
          </div>
        </div>;
      })}
    </div>
    <div className="camera-dashboard-legend-v300"><span><i className="camera-dashboard-legend-key-v300"/> Keyframe</span><span><i className="camera-dashboard-legend-cursor-v300"/> Aktive Loop-Position</span><span>Songzeit: {connected&&status?`${Math.floor(status.progressMs/60000)}:${String(Math.floor(status.progressMs/1000)%60).padStart(2,"0")}`:"—"}</span></div>
    <div className="camera-dashboard-preview-heading-v300"><strong>V304 · Live-Bühne & 360° Orbit/Pan</strong><button type="button" onClick={()=>setShowPreview(value=>!value)} aria-expanded={showPreview}>{showPreview?"Vorschau schließen":"3D-Vorschau öffnen"}</button></div>
    {showPreview&&<div className="camera-dashboard-preview-v300">
      <div className="live-stage-toggle-v301" role="group" aria-label="Art der Bühnenvorschau">
        <button type="button" aria-pressed={previewMode==="live"} onClick={()=>setPreviewMode("live")}>Echte Live-Bühne</button>
        <button type="button" aria-pressed={previewMode==="schematic"} onClick={()=>setPreviewMode("schematic")}>Schematische Ansicht</button>
      </div>
      <VisualCameraOrbitSurfaceV303 active={orbitActive && connected}>
        {previewMode==="live"?<LiveStagePreviewV301 onUnavailable={onUnavailable}/>:connected&&status?<SchematicStageView status={status}/>:<p className="camera-dashboard-no-preview-v300">Keine Live-Kamera verbunden. Starte die 3D-Musikvisualisierung.</p>}
      </VisualCameraOrbitSurfaceV303>
      <small>{previewMode==="live"?"Direktes Bild aus dem laufenden Avatar-/Bühnen-Canvas inklusive Beleuchtung und Kamerabewegung. Der Browser muss Canvas-Capture unterstützen; lokale oder fremde GLTF-Texturen können dies einschränken.":"Schematische Projektion mit echter Live-Kameraposition und FOV; kein Avatar-Mitschnitt."}</small>
      <LiveCameraEditingStudioV302 status={status} connected={connected}/>
    </div>}
    <small>Klicke auf einen Songabschnitt oder einen Keyframe, um ihn im bestehenden Editor zu öffnen. Aufnahmen, Keyframes und Kamerafahrten bleiben in ihrer bisherigen Speicherung unverändert.</small>
  </section>;
}
