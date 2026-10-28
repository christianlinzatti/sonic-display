"use client";
import {useCallback,useEffect,useMemo,useRef,useState} from "react";
import {useMusic} from "@/context/MusicContext";
import {useUiPreferences} from "@/context/UiPreferencesContext";
import type {UiPreferences} from "@/types/music";
import {undoControlPatchV649} from "./concertControlPolicyV649";
import {sanitizeConcertPatchV650,type ConcertPresetV650} from "./concertPresetsV650";
import {decideSmartPresetV651,isSmartPresetModeV651,SMART_PRESET_MODE_KEY_V651,SMART_PRESET_STABLE_MS_V651,type SmartPresetModeV651} from "./smartPresetAutomationV651";
import type {KioskView} from "./TouchKioskControls";
import type {TouchReadabilityV648} from "./touchDisplayPolicyV648";

type Presentation={view:KioskView;readability:TouchReadabilityV648;displayProfile:"off"|"auto"|"eco"|"sharp"};
type KioskInputs=Presentation&{enabled:boolean;setView:(view:KioskView)=>void;setReadabilityV648:(value:TouchReadabilityV648)=>void;setDisplayProfile:(value:Presentation["displayProfile"])=>void};
type Undo={trackId:string;patch:Partial<UiPreferences>;presentation:Partial<Presentation>};
export type SmartPresetAutomationUiV651={mode:SmartPresetModeV651;setMode:(mode:SmartPresetModeV651)=>void;
 preset:ConcertPresetV650|null;canSuggest:boolean;reason:string;score:number;
 applySuggested:()=>void;undoLast:()=>void;canUndo:boolean;manualChange:()=>void;lastAction:string};
/** Runs while the touch controls are mounted, even when their control dialog is closed. */
export function useSmartPresetAutomationV651(kiosk:KioskInputs):SmartPresetAutomationUiV651{
 const music=useMusic();
 const {preferences,updatePreferences}=useUiPreferences();
 const [mode,setModeState]=useState<SmartPresetModeV651>("off");
 const [hydrated,setHydrated]=useState(false);
 const [lockedTrack,setLockedTrack]=useState<string|null>(null);
 const [appliedTrack,setAppliedTrack]=useState<string|null>(null);
 const [lastAction,setLastAction]=useState("");
 const undoRef=useRef<Undo|null>(null);
 const [canUndo,setCanUndo]=useState(false);
 const trackId=music.track?.id??null;
 const skipAutoTrackRef=useRef<string|null>(null);
 useEffect(()=>{try{const stored=localStorage.getItem(SMART_PRESET_MODE_KEY_V651);if(isSmartPresetModeV651(stored)){setModeState(stored);if(stored==="auto")skipAutoTrackRef.current=trackId;}}catch{}setHydrated(true);},[]);
 const setMode=useCallback((next:SmartPresetModeV651)=>{
  if(!isSmartPresetModeV651(next))return;
  // Clear all pending application effects via the dependency change.
  if(next==="auto")skipAutoTrackRef.current=trackId;
  setModeState(next);setLastAction(next==="auto"?"Automatik aktiviert – nur bei einem neuen Song und sicherem Genre.":next==="suggest"?"Vorschläge aktiviert. Es wird nichts automatisch umgestellt.":"Automatik ausgeschaltet.");
  try{localStorage.setItem(SMART_PRESET_MODE_KEY_V651,next);}catch{setLastAction("Auswahl gilt nur in dieser Sitzung; Browserspeicher nicht verfügbar.");}
 },[trackId]);
 const manualChange=useCallback(()=>{
  if(trackId)setLockedTrack(trackId);
  undoRef.current=null;setCanUndo(false);
  setLastAction("Manuelle Änderung: keine weitere automatische Profilwahl für diesen Song.");
 },[trackId]);
 const decision=useMemo(()=>decideSmartPresetV651({trackId,genre:music.genre,genreStatus:music.genreStatus,
  genreSource:music.genreSource,genreOverride:music.genreOverride,genreConfidence:music.genreConfidence,
  isPlaying:music.isPlaying,progressMs:music.progressMs,mode:kiosk.enabled&&hydrated?mode:"off",lockedTrackId:lockedTrack,alreadyAppliedTrackId:appliedTrack,autoSkipTrackId:skipAutoTrackRef.current}),
 [trackId,music.genre,music.genreStatus,music.genreSource,music.genreOverride,music.genreConfidence,music.isPlaying,music.progressMs,mode,kiosk.enabled,hydrated,lockedTrack,appliedTrack]);
 const apply=useCallback((preset:ConcertPresetV650,automatic:boolean)=>{
  if(!trackId||!kiosk.enabled)return;
  const safe=sanitizeConcertPatchV650(preset.patch);if(!safe)return;
  const changed=Object.fromEntries(Object.entries(safe).filter(([key,value])=>!Object.is(preferences[key as keyof UiPreferences],value))) as Partial<UiPreferences>;
  const presentation:Partial<Presentation>={};
  if(kiosk.view!==preset.view)presentation.view=kiosk.view;
  if(kiosk.readability!==preset.readability)presentation.readability=kiosk.readability;
  if(preset.displayProfile!==undefined&&kiosk.displayProfile!==preset.displayProfile)presentation.displayProfile=kiosk.displayProfile;
  const presentationChanged=Object.keys(presentation).length>0;
  if(!Object.keys(changed).length&&!presentationChanged){setAppliedTrack(trackId);setLastAction(`„${preset.name}“ ist bereits eingestellt.`);return;}
  undoRef.current={trackId,patch:undoControlPatchV649(preferences,changed),presentation};setCanUndo(true);
  // Only V649-approved settings and V648 kiosk presentation. No songwriter/authored timelines or audio paths.
  if(Object.keys(changed).length)updatePreferences(changed);
  if(kiosk.view!==preset.view)kiosk.setView(preset.view);
  if(kiosk.readability!==preset.readability)kiosk.setReadabilityV648(preset.readability);
  if(preset.displayProfile!==undefined&&kiosk.displayProfile!==preset.displayProfile)kiosk.setDisplayProfile(preset.displayProfile);
  setAppliedTrack(trackId);if(!automatic)setLockedTrack(trackId);
  setLastAction(`${automatic?"Automatisch":"Manuell"} angewendet: ${preset.name}.`);
 },[trackId,kiosk.enabled,kiosk.view,kiosk.readability,kiosk.displayProfile,kiosk.setView,kiosk.setReadabilityV648,kiosk.setDisplayProfile,preferences,updatePreferences]);
 const undoLast=useCallback(()=>{
  const previous=undoRef.current;if(!previous||previous.trackId!==trackId)return;
  undoRef.current=null;setCanUndo(false);setLockedTrack(trackId);
  if(Object.keys(previous.patch).length)updatePreferences(previous.patch);
  if(previous.presentation.view!==undefined)kiosk.setView(previous.presentation.view);
  if(previous.presentation.readability!==undefined)kiosk.setReadabilityV648(previous.presentation.readability);
  if(previous.presentation.displayProfile!==undefined)kiosk.setDisplayProfile(previous.presentation.displayProfile);
  setLastAction("Letzten automatischen/manuellen Profilwechsel zurückgenommen. Automatik für diesen Song gesperrt.");
 },[trackId,kiosk.setView,kiosk.setReadabilityV648,kiosk.setDisplayProfile,updatePreferences]);
 // A changed track clears the *UI* undo; a previously recorded per-track lock does not carry over.
 useEffect(()=>{undoRef.current=null;setCanUndo(false);setLastAction("");},[trackId]);
 useEffect(()=>{
  if(!decision.canAutoApply||!decision.preset||!trackId||appliedTrack===trackId)return;
  // A stability delay protects against stale genre results from the previous track during polling.
  const preset=decision.preset;
  const handle=window.setTimeout(()=>{apply(preset,true);},SMART_PRESET_STABLE_MS_V651);
  return ()=>window.clearTimeout(handle);
 // Explicit primitives; a preference update is not allowed to continually restart the pending timer.
 },[trackId,decision.canAutoApply,decision.preset?.id,appliedTrack,apply]);
 const applySuggested=useCallback(()=>{if(decision.canSuggest&&decision.preset){apply(decision.preset,false);}},[decision,apply]);
 return {mode,setMode,preset:decision.preset,canSuggest:decision.canSuggest,reason:decision.reason,score:decision.score,
  applySuggested,undoLast,canUndo:canUndo&&undoRef.current?.trackId===trackId,manualChange,lastAction};
}
