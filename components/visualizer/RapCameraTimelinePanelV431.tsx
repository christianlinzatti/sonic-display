"use client";
import {useEffect,useMemo,useRef} from "react";
import type {Lyrics} from "@/types/music";
import {useUiPreferences} from "@/context/UiPreferencesContext";
import {normalizeRapCameraKeyframesV432} from "./rapCameraKeyframesV432";
import {buildRapCameraTimelineV431,rapCameraPreviewTimeV431,timelineLineAtV431,
  visibleRapCameraWindowV431,type RapCameraTimelineItemV431} from "./rapCameraTimelineV431";
import type {RapCameraShotV429} from "./cinematicRapCameraV429";

const labels:Record<RapCameraShotV429,string>={none:"Keine Kameraregie",
  "solo-close":"Solo · Nah", "reply-side":"Antwort · Seite", "duet-wide":"Duett · Weit", "hook-push":"Hook · Push"};
const colors:Record<RapCameraShotV429,string>={none:"#64748b", "solo-close":"#38bdf8",
  "reply-side":"#c084fc", "duet-wide":"#34d399", "hook-push":"#fbbf24"};
const time=(ms:number)=>`${Math.floor(ms/60000)}:${String(Math.floor(ms/1000)%60).padStart(2,"0")}`;
/** Lightweight schematic thumbnail, NOT a second camera / GL renderer. */
export function RapCameraCompositionPreviewV431({shot,leadSlot,large=false}:{
  shot:RapCameraShotV429;leadSlot:number;large?:boolean;
}){
  const side=leadSlot%2===0?-1:1;
  const solo=shot==="solo-close", duet=shot==="duet-wide", reply=shot==="reply-side";
  const leadX=reply?50+side*21:solo?50:shot==="hook-push"?50:38;
  const scale=solo?1.22:duet?.62:shot==="hook-push"?.95:.82;
  const color=colors[shot];
  const figure=(x:number,opacity=1)=>
    <g transform={`translate(${x},38) scale(${scale})`} opacity={opacity}>
      <circle cx="0" cy="-15" r="7" fill={color}/>
      <rect x="-12" y="-6" rx="7" width="24" height="26" fill={color}/>
    </g>;
  return <svg aria-hidden="true" viewBox="0 0 100 64" role="img"
    style={{display:"block",width:large?184:96,maxWidth:"100%",height:"auto",borderRadius:7,background:"#101a2d"}}>
    <rect x="5" y="5" width="90" height="54" rx="6" fill="none" stroke={color} strokeWidth="1.5"/>
    <path d="M12 14 h10 M78 14 h10 M12 50 h10 M78 50 h10" fill="none" stroke="#94a3b8" strokeWidth="1.2"/>
    {shot==="none"?<path d="M32 22 L68 44 M68 22 L32 44" stroke="#64748b" strokeWidth="3"/>:<>
      {duet&&figure(67,.75)}
      {figure(leadX)}
      {shot==="hook-push"&&<circle cx="50" cy="31" r="27" fill="none" stroke="#fbbf24" strokeDasharray="3 4"/>}
    </>}
  </svg>;
}
export function RapCameraTimelinePanelV431({trackId,lyrics,previewMs,liveProgressMs,previewLocked,onPreview,avatarCount}:{
  trackId:string;lyrics:Lyrics|null|undefined;previewMs:number;liveProgressMs:number;previewLocked:boolean;onPreview:(timeMs:number)=>void;
  avatarCount:number;
}){
  const {preferences}=useUiPreferences();
  const assignments=trackId?(preferences.rapDuetAssignmentsV416??{})[trackId]:null;
  const overrides=trackId?(preferences.rapCameraOverridesV430??{})[trackId]:null;
  const keyframes=useMemo(()=>normalizeRapCameraKeyframesV432(trackId?(preferences.rapCameraKeyframesV432??{})[trackId]:null),
    [preferences.rapCameraKeyframesV432,trackId]);
  const frameCounts=useMemo(()=>{const counts=new Map<number,number>();for(const frame of keyframes)counts.set(frame.lineIndex,(counts.get(frame.lineIndex)??0)+1);return counts;},[keyframes]);
  const timeline=useMemo(()=>buildRapCameraTimelineV431({trackId,lyrics,assignments,overrides,avatarCount,
      autoAssignIfMissing:preferences.rapCameraAutoFixEnabledV436??true}),
    [trackId,lyrics,assignments,overrides,avatarCount,preferences.rapCameraAutoFixEnabledV436]);
  const index=timelineLineAtV431(timeline.items,previewMs);
  const liveIndex=timelineLineAtV431(timeline.items,liveProgressMs);
  const selectedRef=useRef<HTMLButtonElement|null>(null);
  useEffect(()=>{
    selectedRef.current?.scrollIntoView({block:"nearest",inline:"center",behavior:"auto"});
  },[index,trackId]);
  const {items}=visibleRapCameraWindowV431(timeline.items,index);
  const selected=index>=0?timeline.items[index]:null;
  const focus=(item:RapCameraTimelineItemV431)=>onPreview(rapCameraPreviewTimeV431(item));
  const step=(direction:-1|1)=>{
    if(!timeline.items.length)return;
    const next=index<0?0:Math.max(0,Math.min(timeline.items.length-1,index+direction));
    focus(timeline.items[next]);
  };
  return <fieldset aria-label="V431 Visual Rap Camera Timeline" style={{marginTop:12,padding:12,
    border:"1px solid #3b647e",borderRadius:10,minWidth:0}}>
    <legend>V431 · Visual Rap Camera Timeline</legend>
    <p>Synchronisierte Lyrics und geplante Kamera-Perspektiven nebeneinander.
      <strong> {timeline.assigned} zugeordnete</strong> · {timeline.edited} manuell angepasste Zeilen.</p>
    {!preferences.rapCameraEnabledV429&&<p style={{color:"#e9b65c"}}>
      V429 ist deaktiviert: Die Timeline zeigt den Plan nur als Vorschau, nicht als aktive Kamerafahrt.</p>}
    {!timeline.total?<p>Für die Timeline werden ein aktueller Titel und synchronisierte Lyrics benötigt.</p>:<>
      {timeline.assigned===0&&<p>Für Kamera-Shots benötigst du mindestens zwei Avatare und synchronisierte Lyrics. V436 kann die Grundregie ohne manuelle V416-Rollen erstellen, sofern die Automatik eingeschaltet ist.</p>}
      <div style={{display:"flex",gap:8,flexWrap:"wrap",alignItems:"center",marginBottom:10}}>
        <button type="button" onClick={()=>step(-1)} disabled={index<=0} aria-label="Vorherige Lyrics-Zeile">← Vorherige</button>
        <strong aria-live="polite">{selected?`${previewLocked?"Vorschau":"Live"} · Zeile ${selected.lineIndex+1} · ${time(selected.startMs)}`:"Keine Zeile an dieser Zeit"}</strong>
        {previewLocked&&<span style={{fontSize:12}}>Live: {liveIndex>=0?`Zeile ${timeline.items[liveIndex].lineIndex+1}`:"außerhalb der Lyrics"}</span>}
        <button type="button" onClick={()=>step(1)} disabled={index>=timeline.items.length-1} aria-label="Nächste Lyrics-Zeile">Nächste →</button>
        <span style={{fontSize:12,opacity:.85}}>Ausschnitt aus {timeline.total} gültigen Lyrics-Zeilen</span>
      </div>
      <div aria-label="Kamera-Shots entlang der Lyrics-Zeitachse" style={{display:"flex",gap:5,
        overflowX:"auto",padding:"0 0 10px",scrollSnapType:"x proximity"}}>
        {items.map(item=>{
          const active=item.lineIndex===selected?.lineIndex;
          const color=colors[item.shot];
          const width=Math.max(106,Math.min(230,Math.round(item.durationMs/24)));
          return <button type="button" key={`${trackId}-${item.lineIndex}-${item.startMs}`}
            aria-current={active?"true":undefined}
            aria-label={`Zeile ${item.lineIndex+1}, ${time(item.startMs)}: ${labels[item.shot]}, ${item.text||"Instrumental"}`}
            onClick={()=>focus(item)} ref={active?selectedRef:undefined} style={{flex:`0 0 ${width}px`,scrollSnapAlign:"center",
              textAlign:"left",padding:8,borderRadius:8,minWidth:0,color:"#e5edf8",
              background:active?"#1c3b53":"#172537",border:`${active?2:1}px solid ${color}`,
              boxShadow:active?`0 0 0 2px ${color}33`:"none",opacity:item.eligible?1:.65}}>
            <span style={{display:"block",fontSize:11,opacity:.85}}>{time(item.startMs)} · #{item.lineIndex+1}{item.lineIndex===timeline.items[liveIndex]?.lineIndex?" · ● Live":""}</span>
            <span style={{display:"block",height:3,background:color,margin:"5px 0 7px"}}/>
            <RapCameraCompositionPreviewV431 shot={item.shot} leadSlot={item.leadSlot}/>
            <span style={{display:"block",fontSize:12,fontWeight:600,marginTop:5}}>{labels[item.shot]}</span>
            <span style={{display:"block",fontSize:12,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}} title={item.text}>{item.text||"(Pause)"}</span>
            <span style={{display:"block",fontSize:10,marginTop:3}}>
              {item.override!==null?item.override==="off"?"● Ruhemodus gespeichert":`● Eigener Shot · ${item.strength} %`:item.eligible?"Automatische Zuordnung":"Nicht zugeordnet"} {frameCounts.has(item.lineIndex)?` · ◆ ${frameCounts.get(item.lineIndex)} Keyframes`:""}
            </span>
          </button>;
        })}
      </div>
      {selected&&<div aria-live="polite" style={{display:"flex",alignItems:"center",gap:14,
        flexWrap:"wrap",padding:"10px 0"}}>
        <RapCameraCompositionPreviewV431 large shot={selected.shot} leadSlot={selected.leadSlot}/>
        <div style={{flex:"1 1 190px"}}>
          <strong>{labels[selected.shot]}</strong>
          <p style={{margin:"4px 0"}}>Zeile {selected.lineIndex+1}: {selected.text||"(Pause)"}</p>
          <small>{time(selected.startMs)}–{time(selected.endMs)} ·
            {selected.override!==null?" Eigene V430-Einstellung":" Automatische V429-Perspektive"} ·
            {selected.eligible?" manuelle V416-Rapper-Zuordnung":" keine aktive Rapper-Zuordnung"}</small>
        </div>
      </div>}
    </>}
    <small>Ein Klick zeigt die gewünschte Lyrics-Zeile im bestehenden Vorschauzeit-Regler und im V430-Editor.
      Er verändert weder die Spotify-Wiedergabe noch die Bühnenkamera. Miniaturen sind schematische
      Perspektiven, keine Live-3D-Renderings. Manuelle Kamera, Keyframes, Lyrics-Schutz und reduzierte
      Bewegung behalten die bestehenden V429-Sicherheitsregeln.</small>
  </fieldset>;
}
