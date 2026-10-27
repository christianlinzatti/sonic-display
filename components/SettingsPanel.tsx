"use client";
import { STAGE_ENVIRONMENTS, type StageEnvironmentId } from "@/components/visualizer/stages";
import { StageThemePreviewGrid } from "@/components/visualizer/StageThemePreviewGrid";
import { ConcertDetailPreviewLauncherV556 } from "@/components/visualizer/ConcertDetailPreviewLauncherV556";
import { StageThemeLivePreview } from "@/components/visualizer/StageThemeLivePreview";
const MultiAvatarChoreographyPanel = dynamic(() => import("@/components/visualizer/MultiAvatarChoreographyPanel").then(module => module.MultiAvatarChoreographyPanel), { ssr: false });
const CharacterMotionBatchInstaller = dynamic(() => import("@/components/CharacterMotionBatchInstaller").then(module => module.CharacterMotionBatchInstaller), { ssr: false });
const MotionInstaller = dynamic(() => import("@/components/MotionInstaller").then(module => module.MotionInstaller), { ssr: false });
const BackupIntegrityDiagnostics = dynamic(() => import("@/components/BackupIntegrityDiagnostics").then(module => module.BackupIntegrityDiagnostics), { ssr: false });
const BackupMigrationAssistant = dynamic(() => import("@/components/BackupMigrationAssistant").then(module => module.BackupMigrationAssistant), { ssr: false });
const UnifiedSettingsBackup = dynamic(() => import("@/components/UnifiedSettingsBackup").then(module => module.UnifiedSettingsBackup), { ssr: false });
const CinematicCameraTimelineV400 = dynamic(() => import("@/components/visualizer/CinematicCameraTimelinePanelV400").then(m=>m.CinematicCameraTimelineV400), {ssr:false});
const LiveMultiAvatarCameraStudioV399 = dynamic(() => import("@/components/visualizer/LiveMultiAvatarCameraStudioV399").then(m=>m.LiveMultiAvatarCameraStudioV399), {ssr:false});
const CameraPerformanceStudioV398 = dynamic(() => import("@/components/visualizer/CameraPerformanceStudioPanelV398").then(m=>m.CameraPerformanceStudioV398), {ssr:false});
const LodContinuityDiagnosticsPanel = dynamic(() => import("@/components/visualizer/LodContinuityDiagnosticsPanel").then(module => module.LodContinuityDiagnosticsPanel), { ssr: false });

import { upload } from "@vercel/blob/client";
import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useUiPreferences } from "@/context/UiPreferencesContext";
import { useAudioAnalysis } from "@/context/AudioAnalysisContext";
import { avatarModels, getAvatarModel } from "@/components/visualizer/avatarModels";
import type { AvatarModel } from "@/components/visualizer/avatarModels";
const AvatarEditor = dynamic(() => import("@/components/visualizer/AvatarEditor").then(module => module.AvatarEditor), { ssr: false });
const AudioDebugPanel = dynamic(() => import("@/components/visualizer/AudioDebugPanel").then(module => module.AudioDebugPanel), { ssr: false });
const AvatarAssetOptimizationStudio = dynamic(() => import("@/components/visualizer/AvatarAssetOptimizationStudio").then(module => module.AvatarAssetOptimizationStudio), { ssr: false });
const PerformanceBenchmark = dynamic(() => import("@/components/visualizer/PerformanceBenchmarkPanel").then(module => module.PerformanceBenchmark), { ssr: false });
const PerformanceSessionAnalyzerV262 = dynamic(() => import("@/components/PerformanceSessionAnalyzerV262").then(m => m.PerformanceSessionAnalyzerV262), { ssr:false });
const PerformanceControlCenterV261 = dynamic(() => import("@/components/PerformanceControlCenterV261").then(m => m.PerformanceControlCenterV261), { ssr:false });
const RenderDiagnosticsPanel = dynamic(() => import("@/components/visualizer/RenderDiagnosticsPanel").then(module => module.RenderDiagnosticsPanel), { ssr: false });
const BeatCalibrationAssistant = dynamic(() => import("@/components/visualizer/BeatCalibrationAssistant").then(module => module.BeatCalibrationAssistant), { ssr: false });
import { avatarRigProfiles } from "@/components/visualizer/avatarRigProfiles";
import { avatarDancePresets } from "@/components/visualizer/avatarDancePresets";
const DancePresetStudio = dynamic(() => import("@/components/visualizer/DancePresetStudio").then(module => module.DancePresetStudio), { ssr: false });
const VisualLyricsStudioV379 = dynamic(() => import("@/components/VisualLyricsStudioV379").then(module => module.VisualLyricsStudioV379), { ssr: false });
const FacialAnimationStudioV370 = dynamic(() => import("@/components/visualizer/FacialAnimationStudioV370").then(m => m.FacialAnimationStudioV370), { ssr:false });
const MultiVocalPerformanceStudioV385 = dynamic(() => import("@/components/visualizer/MultiVocalPerformanceStudioV385").then(m => m.MultiVocalPerformanceStudioV385), {ssr:false});
const ExpressiveRapDirectorPanelV425 = dynamic(() => import("@/components/visualizer/ExpressiveRapDirectorPanelV425").then(m=>m.ExpressiveRapDirectorPanelV425),{ssr:false});
const RapDuetStudioV416 = dynamic(() => import("@/components/visualizer/RapDuetStudioPanelV416").then(m => m.RapDuetStudioV416), {ssr:false});
const VocalSyncInspectorV373 = dynamic(() => import("@/components/visualizer/VocalSyncInspectorV373").then(m => m.VocalSyncInspectorV373), { ssr:false });
const RapPerformanceEditorV408 = dynamic(() => import("@/components/visualizer/RapPerformanceEditorPanelV408").then(m => m.RapPerformanceEditorV408), {ssr:false});
const AvatarPreview3D = dynamic(() => import("@/components/visualizer/AvatarPreview3D").then(module => module.AvatarPreview3D), { ssr: false });
const MotionTimelineStudio = dynamic(() => import("@/components/visualizer/MotionTimelineStudio").then(module => module.MotionTimelineStudio), { ssr: false });
const AnimationBlendingStudio = dynamic(() => import("@/components/visualizer/AnimationBlendingStudio").then(module => module.AnimationBlendingStudio), { ssr: false });
const AvatarSkeletonEditor = dynamic(() => import("@/components/visualizer/AvatarSkeletonEditor").then(module => module.AvatarSkeletonEditor), { ssr: false });
const AvatarAnatomyStudio = dynamic(() => import("@/components/visualizer/AvatarAnatomyStudio").then(module => module.AvatarAnatomyStudio), { ssr: false });
const RetargetingStudio = dynamic(() => import("@/components/visualizer/RetargetingStudio").then(module => module.RetargetingStudio), { ssr: false });
const DanceDebugger = dynamic(() => import("@/components/visualizer/DanceDebugger").then(module => module.DanceDebugger), { ssr: false });
import { LoadingMetricsPanel } from "@/components/LoadingMetricsPanel";
const StageDirectorControlsV287 = dynamic(() => import("@/components/visualizer/StageDirectorControlsV287").then(m => m.StageDirectorControlsV287), { ssr: false });
const StageContentPluginSettingsV330 = dynamic(() => import("@/components/visualizer/StageContentPluginSettingsV330").then(m=>m.StageContentPluginSettingsV330), { ssr:false });
const StagePresetLibraryV286 = dynamic(() => import("@/components/visualizer/StagePresetLibraryV286").then(m => m.StagePresetLibraryV286), { ssr: false });
const RuntimePerformancePanelV285 = dynamic(() => import("@/components/RuntimePerformancePanelV285").then(m => m.RuntimePerformancePanelV285), { ssr: false });
const AvatarFrameProfilerPanel = dynamic(() => import("@/components/AvatarFrameProfilerPanel").then(m => m.AvatarFrameProfilerPanel), { ssr:false });
const LongRunStabilitySettingsV355 = dynamic(() => import("@/components/visualizer/LongRunStabilityV355").then(m => m.LongRunStabilitySettingsV355), { ssr:false });
const LongSessionMonitoringPanel = dynamic(() => import("@/components/LongSessionMonitoringPanel").then(m => m.LongSessionMonitoringPanel), { ssr:false });
import { readChoreographies, CHOREOGRAPHY_CHANGE_EVENT } from "@/components/visualizer/avatarChoreographies";

export function SettingsPanel({ initiallyOpen = false }: { initiallyOpen?: boolean } = {}) {
  const [open, setOpen] = useState(initiallyOpen);
  const [directorChoreographies, setDirectorChoreographies] = useState<ReturnType<typeof readChoreographies>>([]);
  useEffect(() => { const refresh = () => setDirectorChoreographies(readChoreographies()); refresh(); window.addEventListener(CHOREOGRAPHY_CHANGE_EVENT, refresh); window.addEventListener("storage", refresh); return () => { window.removeEventListener(CHOREOGRAPHY_CHANGE_EVENT, refresh); window.removeEventListener("storage", refresh); }; }, []);
  const [admin, setAdmin] = useState(false);
  const [adminConfigured, setAdminConfigured] = useState(true);
  const [blobUploadEnabled, setBlobUploadEnabled] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");
  const [adminError, setAdminError] = useState("");
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const [animationFile, setAnimationFile] = useState<File | null>(null);
  const [animationUploading, setAnimationUploading] = useState(false);
  const [animationStatus, setAnimationStatus] = useState("");
  const uploadAnimation = async () => {
    if (!admin || !animationFile || !editingModel || animationUploading) return;
    setAnimationUploading(true); setAnimationStatus("");
    try {
      if (!/\.glb$/i.test(animationFile.name)) throw Error("Bitte eine Animations-GLB-Datei auswählen.");
      const base = animationFile.name.replace(/\.glb$/i, "").replace(/[^a-zA-Z0-9_-]/g, "-").slice(0,50) || "dance";
      const filename = `${base}-${crypto.randomUUID().slice(0,8)}.glb`;
      let url: string;
      if (blobUploadEnabled) {
        const uploaded = await upload(`sonic/animations/${filename}`, animationFile, { access: "public", handleUploadUrl: "/api/avatars/upload", contentType: "model/gltf-binary" });
        url = uploaded.url;
      } else {
        const body = new FormData(); body.set("file", animationFile);
        const response = await fetch("/api/avatars/animations/import", { method: "POST", body });
        const data: { url?: string; error?: string } = await response.json();
        if (!response.ok || !data.url) throw Error(data.error || "Import fehlgeschlagen");
        url = data.url;
      }
      setAvatarDraft(v => ({...v,animationUrl:url}));
      setAnimationStatus("Animation hochgeladen. Klicke auf Speichern, um sie diesem Avatar zuzuweisen.");
      setAnimationFile(null);
    } catch(error) { setAnimationStatus(error instanceof Error ? error.message : "Upload fehlgeschlagen"); }
    finally { setAnimationUploading(false); }
  };
  const refreshAdmin = async () => { try {const r=await fetch("/api/admin",{cache:"no-store"});const d=await r.json();setAdmin(d.authenticated===true);setAdminConfigured(d.configured===true);setBlobUploadEnabled(d.blobEnabled===true);}catch{setAdmin(false);} };
  const login = async () => {const r=await fetch("/api/admin",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({password:adminPassword})});const d=await r.json();if(!r.ok){setAdminError(d.error||"Login fehlgeschlagen");return;}setAdmin(true);setAdminPassword("");setAdminError("");};
  const logout = async () => {await fetch("/api/admin",{method:"DELETE"});setAdmin(false);};
  const uploadAvatar = async () => {if(!uploadFile||!admin)return;setUploading(true);setAdminError("");try {if(!/\.glb$/i.test(uploadFile.name))throw Error("Bitte GLB-Datei auswählen");const base=uploadFile.name.replace(/\.glb$/i,"").replace(/[^a-zA-Z0-9_-]/g,"-").slice(0,60)||"avatar";const name=`${base}-${crypto.randomUUID().slice(0,8)}.glb`;const result=await upload(`sonic/models/${name}`,uploadFile,{access:"public",handleUploadUrl:"/api/avatars/upload",contentType:"model/gltf-binary"});if(!result.url)throw Error("Upload fehlgeschlagen");await refreshLibrary();setUploadFile(null);setAdminError("Avatar hochgeladen: "+name);}catch(e){setAdminError(e instanceof Error?e.message:"Upload fehlgeschlagen");}finally{setUploading(false);}};
  const uploadPreview = async () => {if(!previewFile||!admin)return;setUploading(true);try{const ext=previewFile.name.split(".").pop()?.toLowerCase();if(!ext||!["png","jpg","jpeg","webp"].includes(ext))throw Error("PNG/JPG/WebP erforderlich");const blob=await upload(`sonic/previews/${crypto.randomUUID()}.${ext}`,previewFile,{access:"public",handleUploadUrl:"/api/avatars/upload"});setAvatarDraft(v=>({...v,preview:blob.url}));setPreviewFile(null);}catch(e){setAdminError(e instanceof Error?e.message:"Vorschaubild-Upload fehlgeschlagen");}finally{setUploading(false);}};

  const [search, setSearch] = useState("");
  const [localModels, setLocalModels] = useState<AvatarModel[]>([]);
  const [defaultOverrides, setDefaultOverrides] = useState<AvatarModel[]>([]);
  const [avatarFilter, setAvatarFilter] = useState("");
  const [editingModel, setEditingModel] = useState<string | null>(null);
  const [avatarDraft, setAvatarDraft] = useState({ label: "", description: "", preview: "", genre: "", tags: "", category: "", favorite: false, defaultDancePreset: "auto", modelUrl: "", animationUrl: "" });
  const [savingAvatar, setSavingAvatar] = useState(false);
  const [avatarSaveMessage, setAvatarSaveMessage] = useState<string | null>(null);
  const editAvatar = (model: AvatarModel) => {
    setEditingModel(model.id);
    setAvatarSaveMessage(null);
    setAvatarDraft({ label: model.label, description: model.description, preview: model.preview ?? "", genre: (model.genre ?? []).join(", "), tags: (model.tags ?? []).join(", "), category: model.category ?? "Eigene Modelle", favorite: model.favorite ?? false, defaultDancePreset: model.defaultDancePreset ?? "auto", modelUrl: model.url ?? "", animationUrl: model.animationUrl ?? "" });
  };
  const saveAvatar = async () => {
    if (!editingModel || savingAvatar) return;
    setSavingAvatar(true);
    setAvatarSaveMessage(null);
    try {
      const response = await fetch("/api/avatars/config", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ filename: editingModel.startsWith("local:") ? editingModel.slice(6) : `default:${editingModel}`, metadata: { ...avatarDraft, genre: avatarDraft.genre.split(",").map(v => v.trim()).filter(Boolean), tags: avatarDraft.tags.split(",").map(v => v.trim()).filter(Boolean) } }) });
      const data: { error?: string } = await response.json();
      if (!response.ok) throw new Error(data.error || `HTTP ${response.status}`);
      await refreshLibrary();
      setAvatarSaveMessage("Avatar-Einstellungen dauerhaft gespeichert.");
      setEditingModel(null);
    } catch (error) { setAvatarSaveMessage(error instanceof Error ? error.message : "Speichern fehlgeschlagen"); }
    finally { setSavingAvatar(false); }
  };
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [libraryLoading, setLibraryLoading] = useState(false);
  const [fbxFile, setFbxFile] = useState<File | null>(null);
  const [converting, setConverting] = useState(false);
  const [conversionMessage, setConversionMessage] = useState<string | null>(null);
  const [libraryError, setLibraryError] = useState<string | null>(null);
  const refreshLibrary = async () => {
    setLibraryLoading(true);
    setLibraryError(null);
    try {
      const response = await fetch("/api/avatars", { cache: "no-store" });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data: { models?: AvatarModel[]; defaults?: AvatarModel[] } = await response.json();
      setLocalModels(Array.isArray(data.models) ? data.models : []);
      setDefaultOverrides(Array.isArray(data.defaults) ? data.defaults : []);
    } catch {
      setLibraryError("Modelle konnten nicht geladen werden. Prüfe den Next.js-Server.");
    } finally { setLibraryLoading(false); }
  };
  const convertFbx = async () => {
    if (!fbxFile || converting) return;
    setConverting(true);
    setConversionMessage(null);
    try {
      const body = new FormData();
      body.set("file", fbxFile);
      const response = await fetch("/api/avatars/import", { method: "POST", body });
      const data: { model?: AvatarModel; error?: string } = await response.json();
      if (!response.ok || !data.model) throw new Error(data.error || `HTTP ${response.status}`);
      await refreshLibrary();
      updatePreferences({ avatarModelId: data.model.id });
      setConversionMessage(`${data.model.label} wurde konvertiert und ausgewählt.`);
      setFbxFile(null);
    } catch (error) {
      setConversionMessage(error instanceof Error ? error.message : "Konvertierung fehlgeschlagen");
    } finally { setConverting(false); }
  };
  useEffect(() => { if (open) { void refreshLibrary(); void refreshAdmin(); } }, [open]);
  const searchRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const sections = [
    { id: "display", label: "Anzeige", hint: "Visualizer Lyrics Motion Bildschirm" },
    { id: "avatar", label: "Avatar & Tanz", hint: "Avatar GLTF Vorschau Scale Rig Dance Preset Intensität Aggression Variation Motion Studio" },
    { id: "audio", label: "Mikrofon & Beat", hint: "Audio BPM Mikrofon Sensitivity Calibration Cooldown Sync Offset" },
    { id: "diagnostics", label: "Diagnose", hint: "Debug FPS Performance Beat Rhythm" },
  ] as const;
  const filteredSections = sections.filter(section => (section.label + " " + section.hint).toLowerCase().includes(search.trim().toLowerCase()));

  const [facialStudioOpen,setFacialStudioOpen]=useState(false);
  const [vocalSyncInspectorOpenV373,setVocalSyncInspectorOpenV373]=useState(false);
  const [rapEditorOpenV408,setRapEditorOpenV408]=useState(false);
  const [tab, setTab] = useState<"display" | "avatar" | "audio" | "diagnostics">("display");
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);
  useEffect(() => {
    if (open) searchRef.current?.focus();
    else triggerRef.current?.focus();
  }, [open]);
  useEffect(() => {
    if (!search.trim() || filteredSections.some(section => section.id === tab)) return;
    if (filteredSections.length) setTab(filteredSections[0].id);
  }, [search, tab, filteredSections.map(section => section.id).join(",")]);
  const { preferences, updatePreferences } = useUiPreferences();
  const [cameraStudioOpenV398,setCameraStudioOpenV398]=useState(false);
  const [cameraStudioOpenV399,setCameraStudioOpenV399]=useState(false);
  const [cameraTimelineOpenV400,setCameraTimelineOpenV400]=useState(false);
  const currentAvatar = [...defaultOverrides, ...localModels].find(model => model.id === preferences.avatarModelId) ?? getAvatarModel(preferences.avatarModelId);
  const libraryModels = [...avatarModels.map(model => defaultOverrides.find(v => v.id === model.id) ?? model), ...localModels].filter(model => {
    if (favoritesOnly && !model.favorite) return false;
    const haystack = [model.label, model.description, model.category ?? "", ...(model.genre ?? []), ...(model.tags ?? [])].join(" ").toLowerCase();
    return haystack.includes(avatarFilter.trim().toLowerCase());
  }).sort((a, b) => Number(Boolean(b.favorite)) - Number(Boolean(a.favorite)));
  const { setEnabled, syncOffsetMs, syncConfidence, syncStatus } = useAudioAnalysis();
  const setMicrophone = (enabled: boolean) => {
    setEnabled(enabled);
  };
  return <aside className="settings-panel">
    <button ref={triggerRef} className="settings-trigger" aria-expanded={open} onClick={() => setOpen(v => !v)}>⚙ Settings</button>
    {open && <section ref={dialogRef} className="settings-popover" role="dialog" aria-modal="true" aria-label="Sonic Display Einstellungen">
      <div className="settings-heading"><div><span className="settings-eyebrow">SONIC DISPLAY</span><h2>Einstellungen</h2><p>Dein Display. Dein Sound. Dein Avatar.</p></div><button className="settings-close" onClick={() => setOpen(false)} aria-label="Einstellungen schließen">×</button></div>
      {tab === "diagnostics" && <><RuntimePerformancePanelV285 /><LoadingMetricsPanel /></>}
      <div className="settings-workspace">
      <aside className="settings-sidebar">
        <label className="settings-search-label" htmlFor="settings-search">Einstellungen suchen</label>
        <input id="settings-search" ref={searchRef} className="settings-search" type="search" placeholder="z. B. Beat, Avatar, Lyrics…" value={search} onChange={e => setSearch(e.target.value)} />
        <nav className="settings-tabs" aria-label="Einstellungsbereiche">
          {filteredSections.map(section => <button type="button" key={section.id} data-v571-tab={section.id} className={tab === section.id ? "active" : ""} aria-current={tab === section.id ? "page" : undefined} onClick={() => setTab(section.id)}>{section.label}<span aria-hidden="true">›</span></button>)}
        </nav>
        {filteredSections.length === 0 && <p className="settings-no-results">Keine passende Kategorie. Suche nach „Avatar“, „Beat“ oder „Lyrics“.</p>}
        <div className="settings-sidebar-footer">Einstellungen werden auf diesem Gerät gespeichert.</div>
      </aside>
      <div className="settings-content">
      {tab === "display" && <>
      <label>Visualizer<select value={preferences.visualizerMode} onChange={e => updatePreferences({ visualizerMode: e.target.value as typeof preferences.visualizerMode })}>
        <option value="wave">Waveform</option><option value="particles">Particles</option><option value="album-glow">Album glow</option><option value="avatar">Avatar</option>
      </select></label>
      </>}
      {tab === "avatar" && <>
      <div className="settings-avatar-preview" aria-label="Aktuell ausgewählter Avatar">
        <AvatarPreview3D modelUrl={currentAvatar.url} sharedMotionUrlV531={currentAvatar.sharedMotionUrl} preferences={preferences} />
        <div><span className="settings-eyebrow">AKTIVER AVATAR</span><h3>{currentAvatar.label}</h3><p>{currentAvatar.description}</p><span className="settings-preview-meta">Rig: {preferences.avatarRigProfile} · Dance: {preferences.avatarDancePreset}</span></div>
      </div>
      <fieldset className="avatar-library"><legend>Avatar-Bibliothek</legend>
        <div className="fbx-import">
          <strong>FBX automatisch nach GLB konvertieren</strong>
          <p>Wähle eine FBX-Datei aus. Sonic Display konvertiert sie lokal mit Blender, speichert sie als GLB und wählt sie direkt aus.</p>
          <label>FBX-Datei (max. 35 MB)<input type="file" accept=".fbx" disabled={converting} onChange={event => { setFbxFile(event.target.files?.[0] ?? null); setConversionMessage(null); }} /></label>
          <button type="button" onClick={() => void convertFbx()} disabled={!fbxFile || converting}>{converting ? "Konvertiere…" : "FBX importieren & konvertieren"}</button>
          {conversionMessage && <p role="status">{conversionMessage}</p>}
          <small>Voraussetzung: Blender muss lokal installiert und über PATH oder BLENDER_PATH erreichbar sein. Nur bei lokalem <code>npm run dev</code> verfügbar. Texturen sollten in die FBX eingebettet sein.</small>
        </div>
        <div className="avatar-metadata-editor">
          <h3>Administrator & Vercel Blob</h3>
          {!adminConfigured && <p role="alert">Bitte SONIC_ADMIN_PASSWORD und SONIC_ADMIN_SESSION_SECRET in den Umgebungsvariablen setzen.</p>}
          {admin ? <><p>✓ Als Administrator angemeldet</p><button type="button" onClick={() => void logout()}>Abmelden</button>
          <label>GLB-Modell hochladen<input type="file" accept=".glb,model/gltf-binary" onChange={e=>setUploadFile(e.target.files?.[0]??null)}/></label><button type="button" disabled={!uploadFile||uploading} onClick={()=>void uploadAvatar()}>{uploading?"Lädt hoch…":"GLB dauerhaft hochladen"}</button></> : <><label>Admin-Passwort<input type="password" value={adminPassword} onChange={e=>setAdminPassword(e.target.value)}/></label><button type="button" onClick={()=>void login()}>Anmelden</button></>}
          {adminError && <p role="status">{adminError}</p>}
        </div>
        <CharacterMotionBatchInstaller admin={admin} blobEnabled={blobUploadEnabled} models={libraryModels} preferences={preferences} onInstalled={refreshLibrary} />
        <MotionInstaller admin={admin} blobEnabled={blobUploadEnabled} models={libraryModels} selectedId={preferences.avatarModelId} onInstalled={refreshLibrary} />
        <div className="avatar-library-tools"><p>Lokale Dateien oder auf Vercel hochgeladene GLB-Modelle werden automatisch erkannt.</p><button type="button" onClick={() => void refreshLibrary()} disabled={libraryLoading}>{libraryLoading ? "Suche läuft…" : "↻ Modelle neu laden"}</button></div>
        {libraryError && <p role="alert">{libraryError}</p>}
        <p className="avatar-library-count">{localModels.length} lokale Modelle gefunden</p>
        <div className="avatar-library-filters"><label>Modelle filtern<input type="search" placeholder="Genre, Kategorie, Tag oder Name" value={avatarFilter} onChange={e => setAvatarFilter(e.target.value)} /></label><label className="setting-check"><input type="checkbox" checked={favoritesOnly} onChange={e => setFavoritesOnly(e.target.checked)} /> Nur Favoriten</label></div>
        <div className="avatar-library-grid">{libraryModels.map(model => {
        const available = model.id === "procedural" || Boolean(model.url);
        return <button type="button" key={model.id} className={`avatar-card ${preferences.avatarModelId === model.id ? "selected" : ""}`} aria-pressed={preferences.avatarModelId === model.id} disabled={!available} onClick={() => updatePreferences({ avatarModelId: model.id, ...(model.defaultDancePreset ? { avatarDancePreset: model.defaultDancePreset } : {}) })}>
          <img src={model.preview ?? "/avatars/default-preview.svg"} alt="" width="96" height="72" /><strong>{model.favorite ? "★ " : ""}{model.label}</strong>{model.category && <small>{model.category}</small>}{Boolean(model.genre?.length) && <small>Genres: {model.genre?.join(", ")}</small>}{Boolean(model.tags?.length) && <small>Tags: {model.tags?.join(", ")}</small>}{model.defaultDancePreset && <small>Dance: {model.defaultDancePreset}</small>}<small>{available ? model.description : "Modellpfad konfigurieren"}</small><span className="avatar-library-status">{!available ? "Nicht konfiguriert" : preferences.avatarModelId === model.id ? "✓ Aktiv" : model.id.startsWith("local:") ? "Lokal" : "Verfügbar"}</span>
        </button>;
      })}</div>
        <div className="avatar-library-edit-actions">{admin && libraryModels.map(model => <button key={model.id} type="button" onClick={() => editAvatar(model)}>✎ {model.label} bearbeiten</button>)}</div>
        {admin && editingModel && <form className="avatar-metadata-editor" onSubmit={event => { event.preventDefault(); void saveAvatar(); }}>
          <h3>Avatar bearbeiten: {editingModel.startsWith("local:") ? editingModel.slice(6) : editingModel}</h3>
          <label>Name<input maxLength={100} value={avatarDraft.label} onChange={e => setAvatarDraft(v => ({ ...v, label: e.target.value }))}/></label>
          <label>Beschreibung<textarea maxLength={500} value={avatarDraft.description} onChange={e => setAvatarDraft(v => ({ ...v, description: e.target.value }))}/></label>
          {!editingModel.startsWith("local:") && editingModel !== "procedural" && <label>GLB-Modell-URL<input maxLength={500} placeholder="https://.../model.glb" value={avatarDraft.modelUrl ?? ""} onChange={e => setAvatarDraft(v => ({ ...v, modelUrl: e.target.value }))}/></label>}
          {!editingModel.startsWith("local:") && editingModel !== "procedural" && <label>Hochgeladenes Modell zuweisen<select value={localModels.some(m => m.url === avatarDraft.modelUrl) ? avatarDraft.modelUrl : ""} onChange={e => setAvatarDraft(v => ({...v, modelUrl:e.target.value}))}><option value="">Modell auswählen…</option>{localModels.filter(m=>m.url).map(m=><option key={m.id} value={m.url!}>{m.label}</option>)}</select></label>}
          {editingModel !== "procedural" && <div className="fbx-import">
            <h4>Animation-Importer · V87</h4>
            <p>Eine GLB-Datei mit Animations-Clips hochladen und diesem Avatar zuweisen. Die Spuren müssen zum Skelett des Avatars passen.</p>
            <label>Animations-GLB<input type="file" accept=".glb,model/gltf-binary" disabled={animationUploading} onChange={e => {setAnimationFile(e.target.files?.[0]??null);setAnimationStatus("");}}/></label>
            <button type="button" disabled={!animationFile||animationUploading} onClick={() => void uploadAnimation()}>{animationUploading?"Animation wird hochgeladen…":"Animation hochladen"}</button>
            <label>Animations-URL<input type="text" placeholder="https://…/dance.glb" value={avatarDraft.animationUrl} onChange={e=>setAvatarDraft(v=>({...v,animationUrl:e.target.value}))}/></label>
            <button type="button" onClick={()=>setAvatarDraft(v=>({...v,animationUrl:""}))}>Animation entfernen</button>
            {animationStatus && <p role="status">{animationStatus}</p>}
            <small>GLB mit AnimationTracks erforderlich. FBX-Dateien können lokal über Blender in GLB umgewandelt werden. Änderungen erst nach „Speichern“ aktiv.</small>
          </div>}
          <label>Vorschaubild-Pfad<input maxLength={250} value={avatarDraft.preview} onChange={e => setAvatarDraft(v => ({ ...v, preview: e.target.value }))}/></label>
          <label>Vorschaubild hochladen<input type="file" accept="image/png,image/jpeg,image/webp" onChange={e=>setPreviewFile(e.target.files?.[0]??null)}/></label><button type="button" disabled={!previewFile||uploading} onClick={()=>void uploadPreview()}>Vorschaubild hochladen</button>
          <label>Genres (Komma-getrennt)<input value={avatarDraft.genre} onChange={e => setAvatarDraft(v => ({ ...v, genre: e.target.value }))}/></label>
          <label>Tags (Komma-getrennt)<input value={avatarDraft.tags} onChange={e => setAvatarDraft(v => ({ ...v, tags: e.target.value }))}/></label>
          <label>Kategorie<input maxLength={80} value={avatarDraft.category} onChange={e => setAvatarDraft(v => ({ ...v, category: e.target.value }))}/></label>
          <label>Dance Preset<select value={avatarDraft.defaultDancePreset} onChange={e => setAvatarDraft(v => ({ ...v, defaultDancePreset: e.target.value }))}>{avatarDancePresets.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}</select></label>
          <label className="setting-check"><input type="checkbox" checked={avatarDraft.favorite} onChange={e => setAvatarDraft(v => ({ ...v, favorite: e.target.checked }))}/> Favorit</label>
          <div className="avatar-editor-buttons"><button type="submit" disabled={savingAvatar}>{savingAvatar ? "Speichere…" : "Speichern"}</button><button type="button" onClick={() => setEditingModel(null)}>Abbrechen</button></div>
        </form>}
        {avatarSaveMessage && <p role="status">{avatarSaveMessage}</p>}
        {libraryModels.length === 0 && <small>Keine Modelle für diesen Filter gefunden.</small>}
        {localModels.length === 0 && !libraryLoading && <small>Lege z. B. <code>robot.glb</code> in <code>public/avatars/</code> ab und klicke „Modelle neu laden“. Externe Texturen bei .gltf müssen ebenfalls vorhanden sein.</small>}
      </fieldset>
      <fieldset><legend>Dance Debugger · V102</legend>
        <DanceDebugger modelUrl={currentAvatar.url} animationUrl={currentAvatar.animationUrl} />
      </fieldset>
      <fieldset><legend>V153 – Skeleton &amp; Joint Constraint Editor</legend><AvatarSkeletonEditor modelUrl={currentAvatar.url} /></fieldset>
      <fieldset><legend>V151 – Advanced Avatar Anatomy &amp; Rig Calibration Studio</legend><AvatarAnatomyStudio modelUrl={currentAvatar.url} /></fieldset>
      <fieldset><legend>Advanced Retargeting Studio · V103</legend><RetargetingStudio modelUrl={currentAvatar.url} /></fieldset>
      <fieldset><legend>Dance Studio · Animation Timeline V93</legend>
        <p>Animation abspielen oder pausieren, in Zeitlupe betrachten und die Fußkorrektur direkt mit dem unveränderten Clip vergleichen. Die IK-Regler unterhalb wirken auch in dieser Vorschau.</p>
        <AvatarPreview3D modelUrl={currentAvatar.url} animationUrl={currentAvatar.animationUrl} sharedMotionUrlV531={currentAvatar.sharedMotionUrl} preferences={preferences} studio />
        <small>Für den Vorher/Nachher-Vergleich werden zwei unabhängige Kopien desselben GLB geladen. Die Timeline unterstützt eingebettete Clips und separat zugewiesene Animations-GLBs mit kompatiblen humanoiden Bones.</small>
      </fieldset>
      <fieldset><legend>Smart Dance Director · V97</legend>
        <p>Automatische Auswahl deiner gespeicherten Choreografien nach Genre, geschätztem BPM und Audioenergie. Wechsel erfolgen frühestens nach 12 Sekunden; neue Sequenzen verwenden die bestehenden Crossfades.</p>
        <label className="setting-check"><input type="checkbox" checked={preferences.smartDanceEnabled ?? false} onChange={e => updatePreferences({ smartDanceEnabled: e.target.checked })}/> Smart Dance Director aktivieren</label>
        <label>Manuelle Übersteuerung
          <select value={preferences.smartDanceOverride ?? ""} onChange={e => updatePreferences({ smartDanceOverride: e.target.value })}>
            <option value="">Automatisch auswählen</option>
            {directorChoreographies.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}
          </select>
        </label>
        <small>Die manuelle Übersteuerung hat Vorrang vor der automatischen Auswahl. Die Director-Auswahl nutzt nur Choreografien, die zum aktuell gewählten Avatar und seiner Animationsquelle passen. Ohne passende Loops bleibt die normale Animation aktiv. Ohne Mikrofon sind BPM und Energie gegebenenfalls geschätzt.</small>
      </fieldset>
      <fieldset><legend>Dynamic Stage · V101</legend>
        <p>Wähle die Bühnenumgebung für deinen 3D-Avatar. Bass und Kick können die Bühnenbeleuchtung beeinflussen; die automatische Grafikqualität begrenzt die Lichtintensität.</p>
        <StageThemePreviewGrid
          value={preferences.stageTheme ?? "classic"}
          onChange={stageTheme => updatePreferences({ stageTheme })}
          reactive={preferences.stageReactive ?? true}
          lightStrength={preferences.stageLightStrength ?? 60}
          reducedMotion={preferences.reducedMotion}
          concertDetailsV555={{enabled:preferences.concertDetailEnabledV555??true,gobo:preferences.concertGoboV555??true,
            pixelWall:preferences.concertPixelWallV555??true,floorFog:preferences.concertFloorFogV555??true,
            duetArc:preferences.concertDuetArcV555??true,adlibEcho:preferences.concertAdlibEchoV555??true,
            hookProjection:preferences.concertHookProjectionV555??true,rhymeAccent:preferences.concertRhymeAccentV555??true,
            strength:preferences.concertDetailStrengthV555??45,avatarLight:preferences.concertAvatarLightV557??true,avatarLightStrength:preferences.concertAvatarLightStrengthV557??55,portraitLight:preferences.concertPortraitLightV558??true,portraitWarmth:preferences.concertPortraitWarmthV558??52,beatPortraitLight:preferences.concertBeatPortraitLightV559??true,beatPortraitStrength:preferences.concertBeatPortraitStrengthV559??45,cinematicFaceLightV566:preferences.concertCinematicFaceLightV566??true,cinematicFaceStrengthV566:preferences.concertCinematicFaceStrengthV566??50}}
        />
        <StageThemeLivePreview theme={preferences.stageTheme ?? "classic"} reactive={preferences.stageReactive ?? true} lightStrength={preferences.stageLightStrength ?? 60} reducedMotion={preferences.reducedMotion} />
        <label>Bühnenstil<select value={preferences.stageTheme ?? "classic"} onChange={e => updatePreferences({stageTheme: e.target.value as StageEnvironmentId})}>
          {STAGE_ENVIRONMENTS.map(stage => <option value={stage.id} key={stage.id}>{stage.label}</option>)}
        </select></label>
        <small className="settings-note">Die Vorschaukarten zeigen die visuelle Richtung der Bühne direkt in den Settings. Hover oder Fokus öffnet eine kleine 3D-Vorschau; Klick oder Tippen wählt die Bühne aus. Mit „Große 3D-Vorschau öffnen“ kannst du die Bühne frei drehen, zoomen und die Lichteffekte ausprobieren.</small>
        <label className="setting-check"><input type="checkbox" checked={preferences.stageReactive ?? true} onChange={e => updatePreferences({stageReactive: e.target.checked})}/> Musikreaktive Beleuchtung</label>
        <label>Lichtreaktion ({preferences.stageLightStrength ?? 60} %)<input type="range" min="0" max="100" step="5" value={preferences.stageLightStrength ?? 60} onChange={e => updatePreferences({stageLightStrength:Number(e.target.value)})}/></label>
        <button type="button" onClick={() => updatePreferences({stageTheme:"classic",stageReactive:true,stageLightStrength:60})}>Bühne zurücksetzen</button>
        <StageDirectorControlsV287 />
        <StagePresetLibraryV286 current={{stageTheme:preferences.stageTheme ?? "classic",stageReactive:preferences.stageReactive ?? true,stageLightStrength:preferences.stageLightStrength ?? 60}} onApply={next => updatePreferences(next)} />
        <small>Bei deaktivierter Mikrofonanalyse stehen möglicherweise nur geschätzte Beat-Signale zur Verfügung. Die Bühne bleibt auch ohne Musikreaktion beleuchtet.</small>
      </fieldset>
      <fieldset><legend>Konzert-Bühneneffekte · V555–V568</legend>
        <p>Bewegte Gobo-Muster, LED-Wand, flacher Bodennebel und passende Lyrik-/Duett-Akzente. Die Haupt-Lyrics bleiben unverändert lesbar. Ohne bestätigte Performer-Zuordnung gibt es keinen Lichtbogen.</p>
        <label className="setting-check"><input type="checkbox" checked={preferences.concertDetailEnabledV555??true} onChange={e=>updatePreferences({concertDetailEnabledV555:e.target.checked})}/> Konzertdetails aktivieren</label>
        {([
          ['concertGoboV555','Gobo-Projektionen'],['concertPixelWallV555','LED-Pixelwand'],
          ['concertFloorFogV555','Dezenter Bodennebel'],['concertDuetArcV555','Lichtverbindung im Duett'],
          ['concertAdlibEchoV555','Adlib-Echos'],['concertHookProjectionV555','Hook-Projektionen'],
          ['concertRhymeAccentV555','Reim-Akzente'],
        ] as const).map(([key,label])=><label className="setting-check" key={key}>
          <input type="checkbox" checked={preferences[key]??true} onChange={e=>updatePreferences({[key]:e.target.checked})}/>{label}
        </label>)}
        <label>Effektstärke ({preferences.concertDetailStrengthV555??45} %)
          <input type="range" min="0" max="100" step="5" value={preferences.concertDetailStrengthV555??45}
            onChange={e=>updatePreferences({concertDetailStrengthV555:Number(e.target.value)})}/></label>
        <label className="setting-check"><input type="checkbox" checked={preferences.concertAvatarLightV557??true}
          onChange={e=>updatePreferences({concertAvatarLightV557:e.target.checked})}/> Avatar-Beleuchtung V557 (Hook &amp; Duett)</label>
        <label>Avatar-Lichtbalance ({preferences.concertAvatarLightStrengthV557??55} %)
          <input type="range" min="0" max="100" step="5" value={preferences.concertAvatarLightStrengthV557??55}
            onChange={e=>updatePreferences({concertAvatarLightStrengthV557:Number(e.target.value)})}/></label>
        <label className="setting-check"><input type="checkbox" checked={preferences.concertPortraitLightV558??true}
          onChange={e=>updatePreferences({concertPortraitLightV558:e.target.checked})}/> Sanftes Gesicht- &amp; Körperlicht V558</label>
        <label>Licht-Wärme ({preferences.concertPortraitWarmthV558??52} %)
          <input type="range" min="0" max="100" step="5" value={preferences.concertPortraitWarmthV558??52}
            onChange={e=>updatePreferences({concertPortraitWarmthV558:Number(e.target.value)})}/></label>
        <label className="setting-check"><input type="checkbox" checked={preferences.concertBeatPortraitLightV559??true}
          onChange={e=>updatePreferences({concertBeatPortraitLightV559:e.target.checked})}/> Beat- &amp; Musikenergie-Porträtlicht V559</label>
        <label>Beat-Lichtakzent ({preferences.concertBeatPortraitStrengthV559??45} %)
          <input type="range" min="0" max="100" step="5" value={preferences.concertBeatPortraitStrengthV559??45}
            onChange={e=>updatePreferences({concertBeatPortraitStrengthV559:Number(e.target.value)})}/></label>
        <label className="setting-check"><input type="checkbox" checked={preferences.concertCinematicFaceLightV566??true}
          onChange={e=>updatePreferences({concertCinematicFaceLightV566:e.target.checked})}/> V566 · Kameraabhängiges Gesichtslicht</label>
        <label>Gesichtslicht-Akzent V566 ({preferences.concertCinematicFaceStrengthV566??50} %)
          <input type="range" min="0" max="100" step="5" value={preferences.concertCinematicFaceStrengthV566??50}
            onChange={e=>updatePreferences({concertCinematicFaceStrengthV566:Number(e.target.value)})}/></label>
        <label className="setting-check"><input type="checkbox" checked={preferences.smartConcertDirectorEnabledV568??true}
          onChange={e=>updatePreferences({smartConcertDirectorEnabledV568:e.target.checked})}/> V568 · Smart Concert Show Director</label>
        <label>Gemeinsame Show-Abstimmung ({preferences.smartConcertDirectorStrengthV568??65} %)
          <input type="range" min="0" max="100" step="5" value={preferences.smartConcertDirectorStrengthV568??65}
            onChange={e=>updatePreferences({smartConcertDirectorStrengthV568:Number(e.target.value)})}/></label>
        <small>V568: Synchronisiert nur kleine automatische Tanz-, Kamera-, Licht- und dekorative Lyrics-Akzente auf derselben Song-Timeline. Sängerfokus nur aus geprüften manuellen Rollen; ohne Rollen keine automatische Sängererkennung. Manuelle Choreografien, Kamera- und Lichtvorgaben sowie gut lesbare Lyrics haben Vorrang.</small>
        <small>V566: Kameranähe und Blickausrichtung zur sichtbaren Avatar-Position werden gemessen. Kein echter Blickkontakt, keine Haut-/Gesichtserkennung; keine zusätzlichen Schatten oder Lichter. Manuelle Licht-Cues und Blackouts bleiben vorrangig.</small>
        <small>V559: Musikenergie und mittlere Frequenzen dienen als Näherung für Gesangsaktivität, ohne echte Stimmtrennung. Beat-Impulse werden sanft geglättet; manuelle Licht-Cues, Blackouts und reduzierte Bewegung haben Vorrang.</small>
        <label className="setting-check"><input type="checkbox" checked={preferences.concertGlbMaterialQualityV560??true}
          onChange={e=>updatePreferences({concertGlbMaterialQualityV560:e.target.checked})}/> V560 · Schonende Haut-/Gesichts-Materialkorrektur für GLB</label>
        <label>GLB-Materialkorrektur ({preferences.concertGlbMaterialStrengthV560??65} %)
          <input type="range" min="0" max="100" step="5" value={preferences.concertGlbMaterialStrengthV560??65}
            onChange={e=>updatePreferences({concertGlbMaterialStrengthV560:Number(e.target.value)})}/></label>
        <small>V560: Nur eindeutig bezeichnete PBR-Haut- und Gesichtsmaterialien werden auf der privaten Avatar-Kopie angepasst. Augen, Haare, transparente Teile, Texturen, Farben und Spezialmaterialien bleiben unverändert. Keine neuen Echtzeit-Schatten; unbekannte GLBs behalten ihre Originaloptik.</small>
        <ConcertDetailPreviewLauncherV556 stageId={preferences.stageTheme??'classic'}
          avatarModelUrl={currentAvatar?.url??null} duetModelsV563={libraryModels.filter(model=>Boolean(model.url)).map(model=>({id:model.id,label:model.label,url:model.url??null}))} onSelect={stageTheme=>updatePreferences({stageTheme})} reactive={preferences.stageReactive??true}
          lightStrength={preferences.stageLightStrength??60} reducedMotion={preferences.reducedMotion}
          concertDetails={{enabled:preferences.concertDetailEnabledV555??true,gobo:preferences.concertGoboV555??true,
            pixelWall:preferences.concertPixelWallV555??true,floorFog:preferences.concertFloorFogV555??true,
            duetArc:preferences.concertDuetArcV555??true,adlibEcho:preferences.concertAdlibEchoV555??true,
            hookProjection:preferences.concertHookProjectionV555??true,rhymeAccent:preferences.concertRhymeAccentV555??true,
            strength:preferences.concertDetailStrengthV555??45,avatarLight:preferences.concertAvatarLightV557??true,avatarLightStrength:preferences.concertAvatarLightStrengthV557??55,portraitLight:preferences.concertPortraitLightV558??true,portraitWarmth:preferences.concertPortraitWarmthV558??52,beatPortraitLight:preferences.concertBeatPortraitLightV559??true,beatPortraitStrength:preferences.concertBeatPortraitStrengthV559??45,cinematicFaceLightV566:preferences.concertCinematicFaceLightV566??true,cinematicFaceStrengthV566:preferences.concertCinematicFaceStrengthV566??50}}/>
        <small>Pi/Low-Tier reduziert 3D-Effekte automatisch. Adlibs: (Hey) oder [adlib:Hey] in zeitmarkierten Lyrics. Reimfarben sind grafische Endungs-Ähnlichkeiten, keine Sprachanalyse.</small>
      </fieldset>
      <StageContentPluginSettingsV330 />
      <fieldset><legend>Dance FX · V100</legend>
        <p>Musikreaktive Bodenschockwellen, stilisierte Fußspuren und kurze Bewegungsspuren. Die Effekte reagieren auf gemessene Kick-Impulse und werden bei niedriger Renderqualität reduziert.</p>
        <label className="setting-check"><input type="checkbox" checked={preferences.danceFxEnabled ?? false} onChange={e => updatePreferences({ danceFxEnabled:e.target.checked })}/> Dance FX aktivieren</label>
        <label>Effektstärke ({preferences.danceFxStrength ?? 60} %)<input type="range" min="0" max="100" step="5" value={preferences.danceFxStrength ?? 60} onChange={e => updatePreferences({ danceFxStrength:Number(e.target.value) })}/></label>
        <label className="setting-check"><input type="checkbox" checked={preferences.danceFxShockwaves ?? true} onChange={e => updatePreferences({ danceFxShockwaves:e.target.checked })}/> Kick-Schockwellen</label>
        <label className="setting-check"><input type="checkbox" checked={preferences.danceFxFootprints ?? true} onChange={e => updatePreferences({ danceFxFootprints:e.target.checked })}/> Stilisierte Fußspuren</label>
        <label className="setting-check"><input type="checkbox" checked={preferences.danceFxTrails ?? true} onChange={e => updatePreferences({ danceFxTrails:e.target.checked })}/> Bewegungsspuren</label>
        <button type="button" onClick={() => updatePreferences({ danceFxEnabled:false, danceFxStrength:60, danceFxShockwaves:true, danceFxFootprints:true, danceFxTrails:true })}>Dance FX zurücksetzen</button>
        <small>Ohne echten Audio-Impuls werden keine Effekte erzeugt. Die Fußspuren sind eine stilisierte Bühnenwirkung und noch nicht an die exakten Fußknochenpositionen gebunden. Bei „Reduzierte Bewegung“ bleiben sie deaktiviert.</small>
      </fieldset>
      <fieldset><legend>Visual Performance · V468</legend>
        <p>GPU-Post-Processing im Beat, leichtgewichtige Shader-Hintergründe, Live-Kleidungsfarben und additive Audio-Akzente. Alles ohne Mikrofon-Zwang und mit automatischer Qualitätsreduzierung.</p>
        <label className="setting-check"><input type="checkbox" checked={preferences.dancePostEnabledV468??true} onChange={e=>updatePreferences({dancePostEnabledV468:e.target.checked})}/> Chromatic Glow / Glitch / Nachbild bei Kick (nur mit Dance FX)</label>
        <label>Prozedurale Bühne<select value={preferences.shaderEnvironmentV468??'auto'} onChange={e=>updatePreferences({shaderEnvironmentV468:e.target.value as NonNullable<typeof preferences.shaderEnvironmentV468>})}>
          <option value="auto">Automatisch je Bühnenstil</option><option value="off">Aus</option><option value="tunnel">Cyberpunk-Tunnel</option><option value="galaxy">Partikel-Galaxie</option><option value="waves">Fluid Waves</option>
        </select></label>
        <label>Avatar-Kleidung<select value={preferences.wardrobeModeV468??'album'} onChange={e=>updatePreferences({wardrobeModeV468:e.target.value as NonNullable<typeof preferences.wardrobeModeV468>})}>
          <option value="album">Automatisch – Albumcover-Farbpalette</option><option value="custom">Eigene Farbe</option><option value="off">Originalmaterial</option>
        </select></label>
        {preferences.wardrobeModeV468==='custom'&&<label>Farbe <input type="color" value={preferences.wardrobeColorV468??'#de38fa'} onChange={e=>updatePreferences({wardrobeColorV468:e.target.value})}/></label>}
        <label>Kleidungstextur<select value={preferences.wardrobePatternV468??'original'} onChange={e=>updatePreferences({wardrobePatternV468:e.target.value as NonNullable<typeof preferences.wardrobePatternV468>})}>
          <option value="original">Originaltextur beibehalten</option><option value="neon-grid">Cyberpunk-Raster</option><option value="stripes">Streifen</option>
        </select></label>
        <label>Material-Emission ({preferences.wardrobeGlowV468??35} %)<input type="range" min="0" max="100" step="5" value={preferences.wardrobeGlowV468??35} onChange={e=>updatePreferences({wardrobeGlowV468:Number(e.target.value)})}/></label>
        <label className="setting-check"><input type="checkbox" checked={preferences.audioMotionEnabledV468??true} onChange={e=>updatePreferences({audioMotionEnabledV468:e.target.checked})}/> Live-Audio-Overlay auf GLB-Tanz (Arme / Oberkörper)</label>
        <label>Audio-Motion-Stärke ({preferences.audioMotionStrengthV468??45} %)<input type="range" min="0" max="100" step="5" value={preferences.audioMotionStrengthV468??45} onChange={e=>updatePreferences({audioMotionStrengthV468:Number(e.target.value)})}/></label>
        <button type="button" onClick={()=>updatePreferences({dancePostEnabledV468:true,shaderEnvironmentV468:'auto',wardrobeModeV468:'album',wardrobeColorV468:'#de38fa',wardrobePatternV468:'original',wardrobeGlowV468:35,audioMotionEnabledV468:true,audioMotionStrengthV468:45})}>V468 zurücksetzen</button>
        <small>Post-FX erscheinen nur bei aktiven Dance FX und verfügbaren Kick-Impulsen. Auf Low-Quality / bei reduzierter Bewegung werden intensive Effekte abgeschaltet. Die Kleidungsfärbung verändert nur als Kleidung erkannte GLB-Materialien, nie Haut oder Gesicht. Fuß-IK hat Vorrang vor Bein-Puls.</small>
      </fieldset>
      <AnimationBlendingStudio modelUrl={currentAvatar.url} animationUrl={currentAvatar.animationUrl} />
      <MotionTimelineStudio modelUrl={currentAvatar.url} animationUrl={currentAvatar.animationUrl} />
      <fieldset><legend>Dance Studio · Motion Engine V86</legend>
        <p>Die Änderungen wirken live auf die Avatar-Bühne. Die 3D-Vorschau oben verwendet weiterhin ihre eigene Beat-Simulation.</p>
        <label>Animationsmodus<select value={preferences.avatarMotionMode ?? "hybrid"} onChange={e => updatePreferences({ avatarMotionMode: e.target.value as "hybrid" | "choreography" | "reactive" })}>
          <option value="hybrid">Hybrid – Tanz-Clip + Musikreaktion</option>
          <option value="choreography">Choreography – GLB-Tanzanimation</option>
          <option value="reactive">Music Reactive – audio-gesteuerte Bewegung</option>
        </select></label>
        <small>Choreography benötigt einen geeigneten eingebetteten GLB-Clip. Ohne Clip wird auf die vorhandene prozedurale Bewegung zurückgegriffen. Der eingebaute Procedural-Avatar besitzt keine GLB-Clips.</small>
        <label>Clip-Tempo ({(preferences.avatarClipSpeed ?? 1).toFixed(2)}×)<input type="range" min="0.5" max="2" step="0.05" value={preferences.avatarClipSpeed ?? 1} onChange={e => updatePreferences({ avatarClipSpeed: Number(e.target.value) })}/></label>
        <label>Überblendung ({(preferences.avatarCrossfadeSeconds ?? 0.35).toFixed(2)} s)<input type="range" min="0.1" max="1.5" step="0.05" value={preferences.avatarCrossfadeSeconds ?? 0.35} onChange={e => updatePreferences({ avatarCrossfadeSeconds: Number(e.target.value) })}/></label>
        <label>Armbewegungen ({Math.round((preferences.avatarArmResponse ?? 1) * 100)} %)<input type="range" min="0" max="2" step="0.05" value={preferences.avatarArmResponse ?? 1} onChange={e => updatePreferences({ avatarArmResponse: Number(e.target.value) })}/></label>
        <label>Beinarbeit ({Math.round((preferences.avatarLegResponse ?? 1) * 100)} %)<input type="range" min="0" max="2" step="0.05" value={preferences.avatarLegResponse ?? 1} onChange={e => updatePreferences({ avatarLegResponse: Number(e.target.value) })}/></label>
        <fieldset><legend>Foot IK · V91</legend>
          <p>Fußstabilisierung für humanoide GLB-Avatare mit erkannten Hüft-, Knie- und Fußknochen. Die Einstellungen wirken sofort auf die 3D-Bühne.</p>
          <label className="setting-check"><input type="checkbox" checked={preferences.avatarFootIKEnabled ?? true} onChange={e => updatePreferences({ avatarFootIKEnabled: e.target.checked })}/> Foot IK aktivieren</label>
          <label>IK-Stärke ({preferences.avatarFootIKStrength ?? 70} %)<input type="range" min="0" max="100" step="5" disabled={!(preferences.avatarFootIKEnabled ?? true)} value={preferences.avatarFootIKStrength ?? 70} onChange={e => updatePreferences({ avatarFootIKStrength: Number(e.target.value) })}/></label>
          <label>Bodenkontakt-Empfindlichkeit ({preferences.avatarFootIKContact ?? 50} %)<input type="range" min="0" max="100" step="5" disabled={!(preferences.avatarFootIKEnabled ?? true)} value={preferences.avatarFootIKContact ?? 50} onChange={e => updatePreferences({ avatarFootIKContact: Number(e.target.value) })}/></label>
          <label>Fußfixierung ({preferences.avatarFootIKLock ?? 50} %)<input type="range" min="0" max="100" step="5" disabled={!(preferences.avatarFootIKEnabled ?? true)} value={preferences.avatarFootIKLock ?? 50} onChange={e => updatePreferences({ avatarFootIKLock: Number(e.target.value) })}/></label>
          <small>Hohe Fußfixierung kann bei Hakken und Sprüngen unnatürliche Bewegungen erzeugen. Erhöhe die Werte schrittweise. Beim Procedural-Avatar steht keine humanoide IK-Kette zur Verfügung.</small>
          <button type="button" onClick={() => updatePreferences({ avatarFootIKEnabled: true, avatarFootIKStrength: 70, avatarFootIKContact: 50, avatarFootIKLock: 50 })}>Foot IK zurücksetzen</button>
        </fieldset>
        <div className="avatar-editor-buttons"><button type="button" onClick={() => updatePreferences({ avatarMotionMode: "hybrid", avatarClipSpeed: 1, avatarCrossfadeSeconds: 0.35, avatarArmResponse: 1, avatarLegResponse: 1 })}>Motion Engine zurücksetzen</button></div>
      </fieldset>
      <fieldset><legend>Avatar tuning</legend>
        <MultiAvatarChoreographyPanel />
        <fieldset className="multi-avatar-controls"><legend>V141 – Intelligent Duo Choreography Director</legend>
          <label className="setting-check"><input type="checkbox" checked={preferences.duoDirectorEnabled ?? false} onChange={e => updatePreferences({duoDirectorEnabled: e.target.checked})}/> Automatische Solo-/Duo-Choreografie (BPM, Genre, Musikenergie)</label>
          <p>Automatik wechselt phrasenweise zwischen Solo, Synchron, Spiegel und Duett. Manuelle Aufstellung bleibt bei ausgeschalteter Automatik erhalten.</p>
          <label>Aufstellung<select value={preferences.multiAvatarMode ?? "solo"} onChange={e => updatePreferences({ multiAvatarMode: e.target.value as NonNullable<typeof preferences.multiAvatarMode> })}>
            <option value="solo">Solo (wie bisher)</option><option value="sync">Duo – synchron</option><option value="mirror">Duo – gespiegelt</option><option value="duet">Duo – unterschiedliche Tanz-Presets</option>
          </select></label>
          {(preferences.multiAvatarMode ?? "solo") !== "solo" && <>
            <label>Zweiter Avatar<select value={preferences.secondaryAvatarModelId ?? "procedural"} onChange={e => updatePreferences({ secondaryAvatarModelId: e.target.value })}>
              {libraryModels.filter(model => model.id === "procedural" || Boolean(model.url)).map(model => <option key={model.id} value={model.id}>{model.label}</option>)}
            </select></label>
            {preferences.multiAvatarMode === "duet" && <label>Zweiter Tanzstil<select value={preferences.secondaryDancePreset ?? "auto"} onChange={e => updatePreferences({ secondaryDancePreset: e.target.value as NonNullable<typeof preferences.secondaryDancePreset> })}>
              {(["auto", "hardstyle", "techno", "rock-metal", "robot", "ambient", "freestyle"] as const).map(x => <option key={x} value={x}>{x}</option>)}
            </select></label>}
            <p>Beide Avatare verwenden denselben Musik-Stream, aber getrennte Animationsinstanzen. Spiegelung erfolgt über die Bühnenachse.</p>
          </>}
        </fieldset>
        <fieldset><legend>V149 – Partner Contact Calibration Studio</legend>
          <p>Individuelle Handkontakt-Kalibrierung für unterschiedlich große GLB-Avatare. Änderungen werden lokal gespeichert.</p>
          {(["partnerContactCalibration", "secondaryContactCalibration"] as const).map((field, index) => {
            const config = preferences[field] ?? {reach:1,height:0,strength:1};
            const set = (key: "reach"|"height"|"strength", value: number) => updatePreferences({[field]:{...config,[key]:value}});
            return <div key={field}>
              <strong>{index === 0 ? "Avatar A" : "Avatar B"}</strong>
              <label>Reichweitenfaktor ({config.reach.toFixed(2)}×)<input type="range" min="0.65" max="1.45" step="0.05" value={config.reach} onChange={e=>set("reach",Number(e.target.value))}/></label>
              <label>Kontakthöhe ({config.height.toFixed(2)} m)<input type="range" min="-0.35" max="0.35" step="0.05" value={config.height} onChange={e=>set("height",Number(e.target.value))}/></label>
              <label>Kontaktintensität ({config.strength.toFixed(2)}×)<input type="range" min="0" max="1.5" step="0.05" value={config.strength} onChange={e=>set("strength",Number(e.target.value))}/></label>
              <button type="button" onClick={()=>updatePreferences({[field]:{reach:1,height:0,strength:1}})}>Avatar {index === 0 ? "A" : "B"} zurücksetzen</button>
            </div>;
          })}
          <small>Keine automatische Körpervermessung. Werte beeinflussen nur die begrenzte Partner-Hand-IK; reale Handkontakte hängen vom Rig ab.</small>
        </fieldset>
        <div className="v367-lip-settings">
          <h3>V369 · Vocal Close-Ups & Facial Performance</h3>
          <label className="setting-check"><input type="checkbox" checked={preferences.avatarLipSyncEnabled ?? true} onChange={e => updatePreferences({ avatarLipSyncEnabled: e.target.checked })}/> Lippensynchronisierte Tänzer aktivieren</label>
          <label>Synchronisation<select value={preferences.avatarLipSyncMode ?? "lyrics"} onChange={e => updatePreferences({ avatarLipSyncMode: e.target.value as "lyrics" | "hybrid" })}><option value="lyrics">Lyrics-Zeitstempel</option><option value="hybrid">Lyrics + Audio-Energie</option></select></label>
          <label>Mundbewegung ({preferences.avatarLipSyncStrength ?? 90} %)<input type="range" min="0" max="150" step="5" value={preferences.avatarLipSyncStrength ?? 90} onChange={e => updatePreferences({ avatarLipSyncStrength: Number(e.target.value) })}/></label>
          <label>Gesangsstil<select value={preferences.avatarVocalStyleV368 ?? "auto"} onChange={e=>updatePreferences({avatarVocalStyleV368:e.target.value as "auto"|"rap"|"singing"})}><option value="auto">Automatisch (Genre + Worttempo)</option><option value="rap">Deutschrap / Rap</option><option value="singing">Gesang / Melodisch</option></select></label>
          <label>Gesichtsausdruck ({preferences.avatarFacialExpressionV368 ?? 55} %)<input type="range" min="0" max="100" step="5" value={preferences.avatarFacialExpressionV368 ?? 55} onChange={e=>updatePreferences({avatarFacialExpressionV368:Number(e.target.value)})}/></label>
          <label>Kiefer-/Lippen-Koordination ({preferences.avatarJawFollowV369 ?? 65} %)<input type="range" min="0" max="100" step="5" value={preferences.avatarJawFollowV369 ?? 65} onChange={e=>updatePreferences({avatarJawFollowV369:Number(e.target.value)})}/></label>
          <label>Vocal-Kamera<select value={preferences.avatarVocalCameraV369 ?? "auto"} onChange={e=>updatePreferences({avatarVocalCameraV369:e.target.value as "off"|"auto"|"performance"})}><option value="off">Aus</option><option value="auto">Nur markante Wörter</option><option value="performance">Dezente Nahaufnahmen bei Wort-Timing</option></select></label>
          <label>Vocal-Kamerastärke ({preferences.avatarVocalCameraStrengthV369 ?? 55} %)<input type="range" min="0" max="100" step="5" value={preferences.avatarVocalCameraStrengthV369 ?? 55} onChange={e=>updatePreferences({avatarVocalCameraStrengthV369:Number(e.target.value)})}/></label>
          <fieldset className="v371-vocal-stage-settings">
            <legend>V371 · Expressive Vocal Performance</legend>
            <label className="setting-check"><input type="checkbox" checked={preferences.avatarVocalBodyEnabledV371 ?? true} onChange={e=>updatePreferences({avatarVocalBodyEnabledV371:e.target.checked})}/> Kopf, Blick und Gesten zur Stimme</label>
            <label>Vocal-Präsenz ({preferences.avatarVocalBodyStrengthV371 ?? 60} %)<input type="range" min="0" max="150" step="5" value={preferences.avatarVocalBodyStrengthV371 ?? 60} onChange={e=>updatePreferences({avatarVocalBodyStrengthV371:Number(e.target.value)})}/></label>
            <label className="setting-check"><input type="checkbox" checked={preferences.avatarVocalEyeContactV371 ?? true} onChange={e=>updatePreferences({avatarVocalEyeContactV371:e.target.checked})}/> Dezenten Blickkontakt nutzen</label>
            <label className="setting-check"><input type="checkbox" checked={preferences.avatarVocalGesturesV371 ?? true} onChange={e=>updatePreferences({avatarVocalGesturesV371:e.target.checked})}/> Oberkörper- und Armgesten nutzen</label>
            <small>Die Impulse orientieren sich an Wort-Zeitstempeln, Textakzenten und dem bestehenden Rap-/Gesangsmodus. Bei nur zeilenweisen Lyrics bleibt die Bewegung bewusst zurückhaltend. Partnerinteraktionen, bestehende Choreografien, Pause und Reduced Motion haben Vorrang.</small>
          </fieldset>
          <fieldset className="v372-vocal-coordination-settings">
            <legend>V372 · Unified Vocal Performance Director</legend>
            <label className="setting-check"><input type="checkbox" checked={preferences.avatarVocalCoordinationEnabledV372??true} onChange={e=>updatePreferences({avatarVocalCoordinationEnabledV372:e.target.checked})}/> Lippen, Mimik, Kopf und Gesten zusammen steuern</label>
            <label>Zusammenspiel ({preferences.avatarVocalCoordinationStrengthV372??70} %)<input type="range" min="0" max="100" step="5" value={preferences.avatarVocalCoordinationStrengthV372??70} onChange={e=>updatePreferences({avatarVocalCoordinationStrengthV372:Number(e.target.value)})}/></label>
            <label>Versatz für Tänzer ({preferences.avatarVocalCoordinationOffsetMsV372??0} ms)<input type="range" min="-200" max="200" step="10" value={preferences.avatarVocalCoordinationOffsetMsV372??0} onChange={e=>updatePreferences({avatarVocalCoordinationOffsetMsV372:Number(e.target.value)})}/></label>
            <button type="button" onClick={()=>updatePreferences({avatarVocalCoordinationOffsetMsV372:0})}>Versatz zurücksetzen</button>
            <small>Ein gemeinsamer Lyrics-Takt für Gesicht und Körper. Der Versatz betrifft beide Avatar-Kanäle, nicht den eingeblendeten Text. Nur echte Wort-Zeitstempel lösen stärkere Betonungen aus; bei Instrumental, Pause und Seek klingen die Bewegungen ab.</small>
          </fieldset>
          <fieldset className="v374-vocal-quality-settings">
            <legend>V374 · Vocal Performance Quality Engine</legend>
            <label className="setting-check"><input type="checkbox" checked={preferences.avatarVocalQualityEnabledV374??true} onChange={e=>updatePreferences({avatarVocalQualityEnabledV374:e.target.checked})}/> Natürlichere Vocal-Performance aktivieren</label>
            <label>Weiche Mundform-Übergänge ({preferences.avatarVocalMouthSmoothnessV374??65} %)<input type="range" min="0" max="100" step="5" value={preferences.avatarVocalMouthSmoothnessV374??65} onChange={e=>updatePreferences({avatarVocalMouthSmoothnessV374:Number(e.target.value)})}/></label>
            <label>Rap-Gesten beruhigen ({preferences.avatarVocalRapGestureCalmV374??70} %)<input type="range" min="0" max="100" step="5" value={preferences.avatarVocalRapGestureCalmV374??70} onChange={e=>updatePreferences({avatarVocalRapGestureCalmV374:Number(e.target.value)})}/></label>
            <label>Auftritt mit mehreren Tänzern<select value={preferences.avatarVocalEnsembleModeV374??"lead"} onChange={e=>updatePreferences({avatarVocalEnsembleModeV374:e.target.value as "balanced"|"lead"|"call-response"})}><option value="balanced">Gemeinsam / ausgeglichen</option><option value="lead">Lead-Tänzer + dezente Begleitung</option><option value="call-response">Phrasenweise wechselnde Hauptrolle</option></select></label>
            <small>Die Rollen werden ausschließlich visuell anhand der Tänzerposition und der zeitlich markierten Lyrics vergeben. Keine Erkennung echter Sänger oder Stimmen. Geschlossene Lippen bei M/B/P haben Vorrang. Bei Pause, Instrumental und nur zeilensynchronen Lyrics werden keine zusätzlichen Wortakzente erzeugt.</small>
          </fieldset>
          <fieldset className="v415-rap-lipsync-settings" aria-label="V415 Rap Lip-Sync Präzision">
            <legend>V415 · Advanced Rap Lip-Sync</legend>
            <label className="setting-check"><input type="checkbox" checked={preferences.avatarRapLipEnabledV415??false} onChange={e=>updatePreferences({avatarRapLipEnabledV415:e.target.checked})}/> Präzise Rap-Mundübergänge aktivieren</label>
            <label>Artikulations-Präzision ({preferences.avatarRapLipPrecisionV415??70} %)<input type="range" min="0" max="100" step="5" value={preferences.avatarRapLipPrecisionV415??70} onChange={e=>updatePreferences({avatarRapLipPrecisionV415:Number(e.target.value)})}/></label>
            <label>Nur Mund verschieben ({preferences.avatarRapLipOffsetMsV415??0} ms)<input type="range" min="-150" max="150" step="5" value={preferences.avatarRapLipOffsetMsV415??0} onChange={e=>updatePreferences({avatarRapLipOffsetMsV415:Number(e.target.value)})}/></label>
            <button type="button" onClick={()=>updatePreferences({avatarRapLipOffsetMsV415:0})}>Mundversatz zurücksetzen</button>
            <small>Opt-in: geschätzte B/P/M-Lippenverschlüsse und sanfte Übergänge zwischen eng benachbarten, wortgetakteten Rap-Wörtern. Die Einstellung verschiebt nur den Mund, nicht Gesten oder eingeblendete Lyrics. Ohne echte Wortmarken, bei Pausen und Reduced Motion gibt es keine zusätzlichen Akzente. Keine akustische Phonemerkennung.</small>
          </fieldset>
          <fieldset className="v419-rap-syllable-settings" aria-label="V419 Rap Silbenartikulation">
            <legend>V419 · Rap-Silbenartikulation (Textschätzung)</legend>
            <label className="setting-check"><input type="checkbox" checked={preferences.avatarRapSyllableEnabledV419??false} onChange={e=>updatePreferences({avatarRapSyllableEnabledV419:e.target.checked})}/> Natürlichere Vokalwechsel aktivieren</label>
            <label>Artikulationsstärke ({preferences.avatarRapSyllableStrengthV419??65} %)<input type="range" min="0" max="100" step="5" value={preferences.avatarRapSyllableStrengthV419??65} onChange={e=>updatePreferences({avatarRapSyllableStrengthV419:Number(e.target.value)})}/></label>
            <label>Übergangsglättung ({preferences.avatarRapSyllableSmoothnessV419??70} %)<input type="range" min="0" max="100" step="5" value={preferences.avatarRapSyllableSmoothnessV419??70} onChange={e=>updatePreferences({avatarRapSyllableSmoothnessV419:Number(e.target.value)})}/></label>
            <small>Verwendet ausschließlich vorhandene Wort-Zeitstempel. Vokalgruppen und vermutete Silben werden aus dem Text abgeleitet, keine echte Phonem- oder akustische Silbenerkennung. B/P/M-Lippenverschlüsse bleiben geschützt; für Pause, Zeilen-Timing und Reduced Motion deaktiviert. Mit V415 kombinierbar.</small>
          </fieldset>
          <fieldset className="v393-vocal-intelligence-settings">
            <legend>V393 · Vocal Performance Intelligence 3.0</legend>
            <label>Vocal-Bühnenpräsenz<select value={preferences.avatarVocalPerformanceModeV393??"off"} onChange={e=>updatePreferences({avatarVocalPerformanceModeV393:e.target.value as "off"|"subtle"|"expressive"})}><option value="off">Aus (bisheriges Verhalten)</option><option value="subtle">Dezent · natürlich</option><option value="expressive">Ausdrucksstark · Live-Performance</option></select></label>
            <label>Betonung und Gestik ({preferences.avatarVocalPerformanceStrengthV393??55} %)<input type="range" min="0" max="100" step="5" value={preferences.avatarVocalPerformanceStrengthV393??55} onChange={e=>updatePreferences({avatarVocalPerformanceStrengthV393:Number(e.target.value)})}/></label>
            <small>Wortgenaue Lyrics verbinden bestehende Mundformen mit Kopf, Schultern und Armgesten. Rap erhält rhythmischere Betonungen, Gesang weichere Bewegungen. Bei zeilenweisen Lyrics, Pause, Reduced Motion und fest vorgegebenen Choreografien keine neuen Akzente. Keine tatsächliche Sprecher- oder Phonemerkennung.</small>
          </fieldset>
          <fieldset className="v390-expressive-face-settings">
            <legend>V390 · Lebendige Gesichtsmimik</legend>
            <label className="setting-check"><input type="checkbox" checked={preferences.avatarExpressiveFaceEnabledV390??false} onChange={e=>updatePreferences({avatarExpressiveFaceEnabledV390:e.target.checked})}/> Dezente Mimik und natürliches Blinzeln aktivieren</label>
            <label>Ausdrucksstärke ({preferences.avatarExpressiveFaceStrengthV390??45} %)<input type="range" min="0" max="100" step="5" value={preferences.avatarExpressiveFaceStrengthV390??45} onChange={e=>updatePreferences({avatarExpressiveFaceStrengthV390:Number(e.target.value)})}/></label>
            <small>Nutzen vorhandene Gesichts-Morphs. Keine simulierte Phonemerkennung; bei reduzierter Bewegung ausgeschaltet.</small>
          </fieldset>
          <fieldset className="v384-natural-articulation-settings">
            <legend>V384 · Natural Vocal Articulation</legend>
            <label className="setting-check"><input type="checkbox" checked={preferences.avatarNaturalArticulationEnabledV384??true} onChange={e=>updatePreferences({avatarExpressiveFaceEnabledV390:false,avatarExpressiveFaceStrengthV390:45,avatarNaturalArticulationEnabledV384:e.target.checked})}/> Natürlichere Lippenartikulation aktivieren</label>
            <label>Artikulationsstärke ({preferences.avatarArticulationStrengthV384??70} %)<input type="range" min="0" max="100" step="5" value={preferences.avatarArticulationStrengthV384??70} onChange={e=>updatePreferences({avatarArticulationStrengthV384:Number(e.target.value)})}/></label>
            <label>M/B/P-Lippenverschluss ({preferences.avatarLipSealV384??90} %)<input type="range" min="0" max="100" step="5" value={preferences.avatarLipSealV384??90} onChange={e=>updatePreferences({avatarLipSealV384:Number(e.target.value)})}/></label>
            <label>Kieferberuhigung bei schnellem Rap ({preferences.avatarJawStabilityV384??65} %)<input type="range" min="0" max="100" step="5" value={preferences.avatarJawStabilityV384??65} onChange={e=>updatePreferences({avatarJawStabilityV384:Number(e.target.value)})}/></label>
            <small>V384 steuert die vorhandenen, mit V383 kalibrierten Morph-Kanäle. Nur Wortzeitstempel erlauben gezielte Lippenverschlüsse; Zeilen-Lyrics und Instrumental bleiben auf dem bisherigen Verhalten. Keine echten Phoneme oder Sprechererkennung.</small>
          </fieldset>
          <fieldset className="v375-adaptive-performance-settings">
            <legend>V375 · Adaptive Performance Director</legend>
            <label>Automatische Auftrittsregie<select value={preferences.avatarAdaptivePerformanceModeV375??"off"} onChange={e=>updatePreferences({avatarAdaptivePerformanceModeV375:e.target.value as "off"|"balanced"|"dynamic"})}><option value="off">Aus – Besetzung unverändert</option><option value="balanced">Zurückhaltend – Solo / Duo / Gruppe</option><option value="dynamic">Dynamisch – Verse / Hook / Drop</option></select></label>
            <label>Performance-Stärke ({preferences.avatarAdaptivePerformanceStrengthV375??65} %)<input type="range" min="0" max="100" step="5" value={preferences.avatarAdaptivePerformanceStrengthV375??65} onChange={e=>updatePreferences({avatarAdaptivePerformanceStrengthV375:Number(e.target.value)})}/></label>
            <fieldset><legend>V376 · Interaktive Vocal-Duette</legend>
              <label>Interaktion<select value={preferences.avatarVocalDuetModeV376??"off"} onChange={e=>updatePreferences({avatarVocalDuetModeV376:e.target.value as "off"|"handoff"|"dialogue"})}><option value="off">Aus – bisheriges Verhalten</option><option value="handoff">Lead-Übergabe an Phrasengrenzen</option><option value="dialogue">Rap-Dialog / Call-and-Response je Zeile</option></select></label>
              <label>Interaktionsstärke ({preferences.avatarVocalDuetStrengthV376??60} %)<input type="range" min="0" max="100" step="5" value={preferences.avatarVocalDuetStrengthV376??60} onChange={e=>updatePreferences({avatarVocalDuetStrengthV376:Number(e.target.value)})}/></label>
              <small>Voraussetzung: mehrere Tänzer und synchronisierte Lyrics. Visuelle Rollen, keine echte Sprechererkennung. Manuelle Bühnenabläufe haben Vorrang.</small>
              <fieldset className="v377-duet-camera-settings"><legend>V377 · Cinematic Duet Camera</legend>
                <label>Kamera bei Gesangsduetten<select value={preferences.avatarDuetCameraModeV377??"off"} onChange={e=>updatePreferences({avatarDuetCameraModeV377:e.target.value as "off"|"subtle"|"cinematic"})}><option value="off">Aus – bisherige Kameraregie</option><option value="subtle">Dezent – ruhige Bildwechsel</option><option value="cinematic">Filmisch – Close-up, Two-Shot, Gruppe</option></select></label>
                <label>Kamera-Intensität ({preferences.avatarDuetCameraStrengthV377??65} %)<input type="range" min="0" max="100" step="5" value={preferences.avatarDuetCameraStrengthV377??65} onChange={e=>updatePreferences({avatarDuetCameraStrengthV377:Number(e.target.value)})}/></label>
                <fieldset className="v378-lyrics-camera-settings"><legend>V378 · Cinematic Lyrics Composition</legend>
                <label>Lyrics &amp; Kamera<select value={preferences.avatarLyricsCameraModeV378??"off"} onChange={e=>updatePreferences({avatarLyricsCameraModeV378:e.target.value as "off"|"readable"|"cinematic"})}><option value="off">Aus – bisherige Bildkomposition</option><option value="readable">Lesbarkeit – ruhige Text-Schutzzone</option><option value="cinematic">Filmisch – vereinzelt Lyrics-Fokus</option></select></label>
                <label>Kompositionsstärke ({preferences.avatarLyricsCameraStrengthV378??70} %)<input type="range" min="0" max="100" step="5" value={preferences.avatarLyricsCameraStrengthV378??70} onChange={e=>updatePreferences({avatarLyricsCameraStrengthV378:Number(e.target.value)})}/></label>
                <label><input type="checkbox" checked={preferences.avatarLyricsContrastV378??true} onChange={e=>updatePreferences({avatarLyricsContrastV378:e.target.checked})}/> Kontrast-Hintergrund für Lyrics</label>
                <small>Wirkt nur bei eingeblendeten immersiven, synchronisierten Lyrics. Manuelle Kamera und bestehende Choreografien bleiben unverändert; keine automatische Spracherkennung.</small>
              </fieldset>
              <small>Nur bei aktivem V376 Rap-Dialog oder Lead-Übergabe und mehreren Tänzern. Hooks/Drops werden weit gezeigt. Manuelle Kamerapresets, Live-Editor, reduzierte Bewegung und Lyrics-Schutz haben Vorrang. Keine echte Sprechererkennung.</small>
              </fieldset>
            </fieldset>
            <small>Bei einem Avatar bleibt die Show ein Solo. Bei Duo oder Gruppen mit bis zu vier Tänzern wechselt die sichtbar hervorgehobene Besetzung weich anhand des vorhandenen Songabschnitts und der Lyrics-Phrasen. Manuelle Song-Choreografien und die reduzierte Bewegung haben Vorrang. Keine Erkennung echter Sänger.</small>
          </fieldset>
          <button type="button" className="v373-open" aria-expanded={rapEditorOpenV408} aria-controls="rap-performance-editor-v408" onClick={()=>setRapEditorOpenV408(v=>!v)}>{rapEditorOpenV408?"▾ V412 · Rap Performance Editor schließen":"▸ V412 · Rap Performance Editor öffnen"}</button>
          {rapEditorOpenV408&&<div id="rap-performance-editor-v408"><RapPerformanceEditorV408 models={[...avatarModels.map(m=>defaultOverrides.find(o=>o.id===m.id)??m),...localModels]} onRefresh={()=>{void refreshLibrary();}} libraryLoading={libraryLoading}/></div>}
          <button type="button" className="v373-open" aria-expanded={vocalSyncInspectorOpenV373} onClick={()=>setVocalSyncInspectorOpenV373(v=>!v)}>{vocalSyncInspectorOpenV373?"▾ V373 · Vocal Sync Inspector schließen":"▸ V373 · Vocal Sync Inspector öffnen"}</button>
          <MultiVocalPerformanceStudioV385/>
          <RapDuetStudioV416/>
          <ExpressiveRapDirectorPanelV425/>
          <fieldset className="v386-concert-director-settings"><legend>V386 · Expressive Concert Director</legend>
            <label>Konzert-Interaktion <select value={preferences.avatarConcertDirectorModeV386??"off"} onChange={e=>updatePreferences({avatarConcertDirectorModeV386:e.target.value as "off"|"subtle"|"expressive"})}><option value="off">Aus – bestehende Regie</option><option value="subtle">Dezent – Blickkontakt und kleine Reaktionen</option><option value="expressive">Expressiv – Gesang, Gesten, Kamera und Licht</option></select></label>
            <label>Ausdrucksstärke ({preferences.avatarConcertDirectorStrengthV386??65} %)<input type="range" min="0" max="100" step="5" value={preferences.avatarConcertDirectorStrengthV386??65} onChange={e=>updatePreferences({avatarConcertDirectorStrengthV386:Number(e.target.value)})}/></label>
            <label className="setting-check"><input type="checkbox" checked={preferences.avatarConcertDirectorCameraV386??true} onChange={e=>updatePreferences({avatarConcertDirectorCameraV386:e.target.checked})}/> Automatische Kamera bei Übergaben und Hooks</label>
            <label className="setting-check"><input type="checkbox" checked={preferences.avatarConcertDirectorLightingV386??true} onChange={e=>updatePreferences({avatarConcertDirectorLightingV386:e.target.checked})}/> Dezenter Lichtfokus auf den aktiven Tänzer</label>
            <small>Benötigt mehrere Tänzer und synchronisierte Lyrics mit V385-Stimmenzuordnung oder aktivem V376-Duett. Manuell gespeicherte Choreografien, Kameras und Licht-Timelines haben Vorrang. Keine Stimmentrennung oder Sängererkennung. Bei Pausen und reduzierter Bewegung bleibt die Zusatzregie aus.</small>
          </fieldset>
          <fieldset className="v402-unified-concert-settings"><legend>V402 · Unified Concert Show Director</legend>
            <label>Gemeinsame Konzertdramaturgie <select value={preferences.avatarUnifiedModeV402??"off"} onChange={e=>updatePreferences({avatarUnifiedModeV402:e.target.value as "off"|"balanced"|"festival"})}><option value="off">Aus – bestehende Show unverändert</option><option value="balanced">Ausgewogen – Rap, Hook und Gruppe</option><option value="festival">Festival – energiereichere Builds und Drops</option></select></label>
            <label>Gesamtintensität ({preferences.avatarUnifiedStrengthV402??70} %)<input type="range" min="0" max="100" step="5" value={preferences.avatarUnifiedStrengthV402??70} onChange={e=>updatePreferences({avatarUnifiedStrengthV402:Number(e.target.value)})}/></label>
            <label><input type="checkbox" checked={preferences.avatarUnifiedCameraV402??true} onChange={e=>updatePreferences({avatarUnifiedCameraV402:e.target.checked})}/> Automatische Kamera koordinieren</label>
            <label><input type="checkbox" checked={preferences.avatarUnifiedLightingV402??true} onChange={e=>updatePreferences({avatarUnifiedLightingV402:e.target.checked})}/> Konzertlicht und Atmosphäre koordinieren</label>
            <label><input type="checkbox" checked={preferences.avatarUnifiedDanceV402??true} onChange={e=>updatePreferences({avatarUnifiedDanceV402:e.target.checked})}/> Gruppenchoreografie koordinieren</label>
            <label><input type="checkbox" checked={preferences.avatarUnifiedVocalV402??true} onChange={e=>updatePreferences({avatarUnifiedVocalV402:e.target.checked})}/> Vocal-Gesten koordinieren</label>
            <small>Geglättete, genreabhängige Regie für bestehende V387/V392/V393/V394-Systeme. Gespeicherte V400-Kameramarken, manuelle Tanz-/Licht-Timelines, eigene Modi und Lyrics-Schutzzonen bleiben vorrangig. Keine neue Audio- oder Sängererkennung, keine zusätzlichen 3D-Objekte. Standardmäßig aus.</small>
          </fieldset>
          <fieldset className="v396-performance-experience-settings"><legend>V396 · Intelligent Performance Experience</legend>
            <label>Gemeinsame Musikregie <select value={preferences.avatarExperienceModeV396??"off"} onChange={e=>updatePreferences({avatarExperienceModeV396:e.target.value as "off"|"balanced"|"expressive"})}><option value="off">Aus – bisherige Einstellungen</option><option value="balanced">Ausgewogen – Rap, Hook und Gruppe verbinden</option><option value="expressive">Expressiv – mehr Festival-Dynamik</option></select></label>
            <label>Regiestärke ({preferences.avatarExperienceStrengthV396??65} %)<input type="range" min="0" max="100" step="5" value={preferences.avatarExperienceStrengthV396??65} onChange={e=>updatePreferences({avatarExperienceStrengthV396:Number(e.target.value)})}/></label>
            <small>Vereint V387 Konzertshow, V392 Ensemble, V393 Vocal-Gesten und V394 Festival-Regie. Individuell ausgewählte Modi, manuelle Choreografien, Kamera-, Licht- und Lyrics-Timelines haben Vorrang. Kein zusätzlicher Laser oder Stroboskop; bei Pause/reduzierter Bewegung aus.</small>
          </fieldset>
          <fieldset className="v401-vocal-camera-settings"><legend>V401 · Vocal Camera Intelligence 4.0</legend>
            <label>Vocal-Kameraregie <select value={preferences.avatarVocalCameraModeV401??"off"} onChange={e=>updatePreferences({avatarVocalCameraModeV401:e.target.value as "off"|"subtle"|"musicvideo"})}><option value="off">Aus – unveränderte Kamera</option><option value="subtle">Dezent – ruhige Vocal-Nahaufnahmen</option><option value="musicvideo">Musikvideo – stärkere Rap-Akzente</option></select></label>
            <label>Vocal-Kamera-Stärke ({preferences.avatarVocalCameraStrengthV401??55} %)<input type="range" min="0" max="100" step="5" value={preferences.avatarVocalCameraStrengthV401??55} onChange={e=>updatePreferences({avatarVocalCameraStrengthV401:Number(e.target.value)})}/></label>
            <small>Nutzt die vorhandenen Wort-Zeitmarken und die V368-Gesichtsanimation, keine Sprechererkennung. Gespeicherte V400-Kameramarken, manuelle Aufnahmen, Duette, die Lyrics-Schutzzone und reduzierte Bewegung haben Vorrang. Standardmäßig aus.</small>
          </fieldset>
          <fieldset className="v397-visual-performance-director-settings"><legend>V397 · Visual Performance Director</legend>
            <label>Intelligente Kameraperspektiven <select value={preferences.avatarVisualDirectorModeV397??"off"} onChange={e=>updatePreferences({avatarVisualDirectorModeV397:e.target.value as "off"|"subtle"|"cinematic"})}><option value="off">Aus – bisherige Kameraregie</option><option value="subtle">Dezent – ruhige Nahaufnahmen</option><option value="cinematic">Musikvideo – Solo, Two-Shot und Gruppe</option></select></label>
            <label>Bildstärke ({preferences.avatarVisualDirectorStrengthV397??65} %)<input type="range" min="0" max="100" step="5" value={preferences.avatarVisualDirectorStrengthV397??65} onChange={e=>updatePreferences({avatarVisualDirectorStrengthV397:Number(e.target.value)})}/></label>
            <small>Nur echte, zeitmarkierte Lyrics für Solo/Übergaben und bestätigte Songabschnitte für Gruppenaufnahmen. Eine reale Sprechererkennung findet nicht statt. Manuell gespeicherte Kameras, Duettaufnahmen, Lyrics-Schutz und reduzierte Bewegung haben Vorrang.</small>
          </fieldset>
          <button type="button" className="v398-open-camera-studio" aria-expanded={cameraStudioOpenV398}
            onClick={()=>setCameraStudioOpenV398(v=>!v)}>{cameraStudioOpenV398?"▾ V398 · Camera Performance Studio schließen":"▸ V398 · Camera Performance Studio mit 3D-Vorschau öffnen"}</button>
          {cameraStudioOpenV398&&<CameraPerformanceStudioV398 avatarUrl={currentAvatar?.url??null} avatarLabel={currentAvatar?.label}/>}
          <button type="button" className="v399-open-camera-studio" aria-expanded={cameraStudioOpenV399}
            onClick={()=>setCameraStudioOpenV399(v=>!v)}>{cameraStudioOpenV399?"▾ V399 · Multi-Avatar Camera Studio schließen":"▸ V399 · Live Multi-Avatar Camera Studio öffnen"}</button>
          {cameraStudioOpenV399&&<LiveMultiAvatarCameraStudioV399
            models={[...avatarModels.map(m=>defaultOverrides.find(o=>o.id===m.id)??m),...localModels]}
            activeAvatar={currentAvatar}/>}
          <button type="button" className="v400-open-camera-timeline" aria-expanded={cameraTimelineOpenV400}
            onClick={()=>setCameraTimelineOpenV400(v=>!v)}>{cameraTimelineOpenV400?"▾ V400 · Cinematic Camera Timeline schließen":"▸ V400 · Cinematic Camera Timeline öffnen"}</button>
          {cameraTimelineOpenV400&&<CinematicCameraTimelineV400
            models={[...avatarModels.map(m=>defaultOverrides.find(o=>o.id===m.id)??m),...localModels]}
            activeAvatar={currentAvatar}/>}

          <fieldset className="v394-festival-show-settings"><legend>V394 · Cinematic Festival Show 3.0</legend>
            <label>Festival-Regie <select value={preferences.avatarFestivalModeV394??"off"} onChange={e=>updatePreferences({avatarFestivalModeV394:e.target.value as "off"|"cinematic"|"festival"})}><option value="off">Aus · bisherige Show</option><option value="cinematic">Cinematic · Rap- und Hook-Regie</option><option value="festival">Festival · Build und Drop</option></select></label>
            <label>Festival-Intensität ({preferences.avatarFestivalStrengthV394??70} %)<input type="range" min="0" max="100" step="5" value={preferences.avatarFestivalStrengthV394??70} onChange={e=>updatePreferences({avatarFestivalStrengthV394:Number(e.target.value)})}/></label>
            <label className="setting-check"><input type="checkbox" checked={preferences.avatarFestivalCameraV394??true} onChange={e=>updatePreferences({avatarFestivalCameraV394:e.target.checked})}/> Automatische Kameraführung (Lyrics geschützt)</label>
            <label className="setting-check"><input type="checkbox" checked={preferences.avatarFestivalLightingV394??true} onChange={e=>updatePreferences({avatarFestivalLightingV394:e.target.checked})}/> Dynamische Festival-Scheinwerfer</label>
            <label className="setting-check"><input type="checkbox" checked={preferences.avatarFestivalAtmosphereV394??true} onChange={e=>updatePreferences({avatarFestivalAtmosphereV394:e.target.checked})}/> Nebel und bewegte Lichtkegel</label>
            <label className="setting-check"><input type="checkbox" checked={preferences.avatarFestivalLasersV394??false} onChange={e=>updatePreferences({avatarFestivalLasersV394:e.target.checked})}/> Dezente Laserfächer (nur High-Tier)</label>
            <small>Nutzen vorhandene Songabschnitte, Audioenergie und Beat-Markierungen. Keine Stroboskop-Flashes, keine neuen Shadow Maps. Bestehende manuelle Kamera-, Licht- und Lyrics-Vorgaben haben Vorrang; reduzierte Bewegung deaktiviert die Regie. Lasereffekte sind standardmäßig aus.</small>
          </fieldset>
          <fieldset className="v387-concert-show-settings"><legend>V387 · Intelligent Concert Show 2.0</legend>
            <label>Show-Dynamik <select value={preferences.avatarShowModeV387??"off"} onChange={e=>updatePreferences({avatarShowModeV387:e.target.value as "off"|"balanced"|"festival"})}><option value="off">Aus – bestehende Bühne</option><option value="balanced">Ausgewogen – dramaturgische Übergänge</option><option value="festival">Festival – Drops, Spotlights und Nebel</option></select></label>
            <label>Show-Intensität ({preferences.avatarShowStrengthV387??70} %)<input type="range" min="0" max="100" step="5" value={preferences.avatarShowStrengthV387??70} onChange={e=>updatePreferences({avatarShowStrengthV387:Number(e.target.value)})}/></label>
            <label className="setting-check"><input type="checkbox" checked={preferences.avatarShowCameraV387??true} onChange={e=>updatePreferences({avatarShowCameraV387:e.target.checked})}/> Automatische Kamera behutsam anpassen</label>
            <label className="setting-check"><input type="checkbox" checked={preferences.avatarShowLightingV387??true} onChange={e=>updatePreferences({avatarShowLightingV387:e.target.checked})}/> Bühnenlicht und Spotlights koordinieren</label>
            <label className="setting-check"><input type="checkbox" checked={preferences.avatarShowAtmosphereV387??true} onChange={e=>updatePreferences({avatarShowAtmosphereV387:e.target.checked})}/> Vorhandene Lichtkegel und Nebel verstärken</label>
            <small>Folgt erkannten Verse-, Hook-, Break-, Build- und Drop-Abschnitten. Keine künstliche Drop-Erkennung. Gespeicherte Kamera-/Licht-Timelines bleiben vorrangig. Keine zusätzlichen Spotlights, WebGL-Canvas oder Shadow-Maps; reduzierte Bewegung deaktiviert die Zusatzregie.</small>
          </fieldset>
          {vocalSyncInspectorOpenV373&&<VocalSyncInspectorV373/>}
          <small>Mundformen, Akzente und Kameranahaufnahmen werden aus getaktetem Text geschätzt, nicht aus isolierten Vocals. Automatik erkennt Rap anhand Genre und Texttempo (keine Stimmanalyse). Bei Zeilen-Timing ist die Annäherung weniger präzise. Lippenverschluss, Blinzeln und Mimik setzen passende Rig-Morphs voraus. Instrumentalpausen und angehaltene Wiedergabe öffnen den Mund nicht. Spotify-Audio wird nicht isoliert oder phonetisch transkribiert.</small>
          <button type="button" className="v370-open" aria-expanded={facialStudioOpen} onClick={()=>setFacialStudioOpen(v=>!v)}>{facialStudioOpen?"▾ Gesichtsanimation-Studio schließen":"▸ V370 · Gesichtsanimation-Studio öffnen"}</button>
          {facialStudioOpen && <FacialAnimationStudioV370 models={[...avatarModels.map(m=>defaultOverrides.find(o=>o.id===m.id)??m),...localModels]} initialAvatarId={preferences.avatarModelId}/>}
        </div>
        <label>Scale ({preferences.avatarScale.toFixed(2)}×)<input type="range" min="0.5" max="1.8" step="0.05" value={preferences.avatarScale} onChange={e => updatePreferences({ avatarScale: Number(e.target.value) })}/></label>
        <label>Vertical position ({preferences.avatarOffsetY.toFixed(2)})<input type="range" min="-1" max="1" step="0.05" value={preferences.avatarOffsetY} onChange={e => updatePreferences({ avatarOffsetY: Number(e.target.value) })}/></label>
        <label>Animation intensity ({preferences.avatarAnimationIntensity.toFixed(1)}×)<input type="range" min="0" max="2" step="0.1" value={preferences.avatarAnimationIntensity} onChange={e => updatePreferences({ avatarAnimationIntensity: Number(e.target.value) })}/></label>
        <label>Dance aggression ({Math.round(preferences.danceAggression * 100)}%)<input type="range" min="0" max="1" step="0.05" value={preferences.danceAggression} onChange={e => updatePreferences({ danceAggression: Number(e.target.value) })}/></label>
        <label>Dance variation ({Math.round(preferences.danceVariation * 100)}%)<input type="range" min="0" max="1" step="0.05" value={preferences.danceVariation} onChange={e => updatePreferences({ danceVariation: Number(e.target.value) })}/></label>
        <label>Motion style<select value={preferences.danceMotionStyle} onChange={e => updatePreferences({ danceMotionStyle: e.target.value as typeof preferences.danceMotionStyle })}><option value="smooth">Smooth</option><option value="balanced">Balanced</option><option value="sharp">Sharp</option></select></label>
        <label>Dance preset<select value={preferences.avatarDancePreset} onChange={e => updatePreferences({ avatarDancePreset: e.target.value as typeof preferences.avatarDancePreset })}>{avatarDancePresets.map(preset => <option key={preset.id} value={preset.id}>{preset.label}</option>)}</select></label>
        <small>{avatarDancePresets.find(p => p.id === preferences.avatarDancePreset)?.description}</small>
        <label>Rig profile<select value={preferences.avatarRigProfile} onChange={e => updatePreferences({ avatarRigProfile: e.target.value as typeof preferences.avatarRigProfile })}>{avatarRigProfiles.map(profile => <option key={profile.id} value={profile.id}>{profile.label}</option>)}</select></label>
        <label className="setting-check"><input type="checkbox" checked={preferences.autoAvatarByGenre} onChange={e => updatePreferences({ autoAvatarByGenre: e.target.checked })}/> Automatically select avatar by genre</label>
      </fieldset>
      <DancePresetStudio />
      {preferences.visualizerMode === "avatar" && <AvatarEditor />}
      </>}
      {tab === "display" && <fieldset><legend>Lyrics · Animation</legend>
        <label className="setting-check"><input type="checkbox" checked={preferences.geniusSongInsightsEnabledV447??true} onChange={e => updatePreferences({ geniusSongInsightsEnabledV447:e.target.checked })}/> V447 · Genius Song Insights automatisch anzeigen</label>
        <small>Optionale Songgeschichten, Credits, Samples und zugeordneten Annotationen. Benötigt GENIUS_ACCESS_TOKEN auf dem Server; die Lyrics-/Avatar-Regie bleibt unverändert.</small>
        <label className="setting-check"><input type="checkbox" checked={preferences.geniusCinematicEnabledV448??true} onChange={e => updatePreferences({ geniusCinematicEnabledV448:e.target.checked })}/> V448 · Cinematic Genius Insights (Fotos, Credits & Sample-Verbindungen)</label>
        <small>Automatischer, dezenter Wechsel zwischen Album-/Künstlerbild, Credits und musikalischen Verbindungen. Ohne zusätzliche Dienste; berücksichtigt „Reduced Motion“.</small>
        <label className="setting-check"><input type="checkbox" checked={preferences.geniusDiscoveryEnabledV449??true} onChange={e => updatePreferences({ geniusDiscoveryEnabledV449:e.target.checked })}/> V449 · Genius Music Discovery (verwandte Songs, Produzenten & Features)</label>
        <small>Führt nur belegte Genius-Verbindungen auf und öffnet bei Bedarf die bestehende Spotify-Suche. Keine automatisch erfundenen Empfehlungen; kompakt und standardmäßig eingeklappt.</small>
        <label className="setting-check"><input type="checkbox" checked={preferences.geniusSpotlightEnabledV450??true} onChange={e => updatePreferences({ geniusSpotlightEnabledV450:e.target.checked })}/> V450 · Animierte Musikverbindungen & Producer-Spotlight</label>
        <small>Zeigt alle 56 Sekunden eine belegte Sample-/Remix-Verbindung oder einen Song-Credit für nur 10 Sekunden. Kein Overlay über Bühne oder Lyrics; ohne echte Sprecheridentifikation.</small>
        <label className="setting-check"><input type="checkbox" checked={preferences.smartVisualBalanceEnabledV451??true} onChange={e => updatePreferences({ smartVisualBalanceEnabledV451:e.target.checked })}/> V451 · Smart Visual Show Balance (Lyrics zuerst, Infokarten in Pausen)</label>
        <small>Eine automatische Genius-Karte zur Zeit, bevorzugt während Lyrics-Pausen. Bestehende manuelle Bühnen- und Lyrics-Einstellungen bleiben unverändert. Ausschalten stellt das bisherige Verhalten wieder her.</small>
        <label className="setting-check"><input type="checkbox" checked={preferences.lyricsVisible} onChange={e => updatePreferences({ lyricsVisible: e.target.checked })}/> Lyrics anzeigen</label>
        <label>V382 · Kinetic-Lyrics-Stil<select value={preferences.lyricsKineticPresetV382??"auto"} onChange={e=>updatePreferences({lyricsKineticPresetV382:e.target.value as typeof preferences.lyricsKineticPresetV382})}><option value="off">Aus (klassisch)</option><option value="auto">Automatisch</option><option value="rap">Deutschrap / Flow</option><option value="festival">Hardstyle / Festival</option><option value="cinematic">Ruhig / Cinematic</option></select></label>
        <label>V382 · Wortdynamik ({preferences.lyricsKineticStrengthV382??65} %)<input type="range" min="0" max="100" step="5" value={preferences.lyricsKineticStrengthV382??65} onChange={e=>updatePreferences({lyricsKineticStrengthV382:Number(e.target.value)})}/></label>
        <label className="setting-check"><input type="checkbox" checked={preferences.lyricsKineticDropsV382??true} onChange={e=>updatePreferences({lyricsKineticDropsV382:e.target.checked})}/> Festival-Akzente bei gemessener Audioenergie</label>
        <small>V382: Lyrics reagieren auf vorhandene Wortmarken. Ohne Wortmarken wird nur die Zeilendauer geschätzt; ohne Zeilensynchronisierung gibt es keine künstliche Wortanimation. Drop-Akzente benötigen Audioanalyse.</small>
        <label>Animationsintensität ({preferences.lyricsAnimationIntensity ?? 65} %)<input type="range" min="0" max="100" step="5" value={preferences.lyricsAnimationIntensity ?? 65} onChange={e => updatePreferences({ lyricsAnimationIntensity: Number(e.target.value) })}/></label>
        <label className="setting-check"><input type="checkbox" checked={preferences.lyricsBeatReactive ?? true} onChange={e => updatePreferences({ lyricsBeatReactive: e.target.checked })}/> Beat-Reaktion aktiv</label>
        <div className="lyrics-reactive-settings">
          <h3>Music Reactive Lyrics</h3>
          <label>Musik-Reaktionsstärke ({preferences.lyricsReactiveIntensity ?? 60} %)<input type="range" min="0" max="100" step="5" value={preferences.lyricsReactiveIntensity ?? 60} onChange={e => updatePreferences({ lyricsReactiveIntensity: Number(e.target.value) })}/></label>
          <label className="setting-check"><input type="checkbox" checked={preferences.lyricsKickReactive ?? true} onChange={e => updatePreferences({ lyricsKickReactive: e.target.checked })}/> Kick: kurzer Textimpuls</label>
          <label className="setting-check"><input type="checkbox" checked={preferences.lyricsBassReactive ?? true} onChange={e => updatePreferences({ lyricsBassReactive: e.target.checked })}/> Bass: weicher Hintergrund-Glow</label>
          <label className="setting-check"><input type="checkbox" checked={preferences.lyricsDropReactive ?? true} onChange={e => updatePreferences({ lyricsDropReactive: e.target.checked })}/> Starke Akzente: zusätzlicher Glow</label>
          <small>Reagiert auf tatsächliche Mikrofonanalyse, wenn diese aktiv ist. Starke Akzente sind eine heuristische Erkennung und keine verlässliche Drop-Erkennung. Bei deaktiviertem Mikrofon bleibt dieser Effekt ruhig.</small>
        </div>
        <label className="setting-check"><input type="checkbox" checked={preferences.lyricsFocusMode ?? true} onChange={e => updatePreferences({lyricsFocusMode:e.target.checked})}/> Fokus-Karaoke mit aktueller Zeile und nächster Zeile</label>
        <label className="setting-check"><input type="checkbox" checked={preferences.lyricsWordHighlight ?? true} onChange={e => updatePreferences({ lyricsWordHighlight: e.target.checked })}/> Wörter einzeln hervorheben</label>
        <small>Smart Lyrics Sync verwendet echte Wort-Zeitstempel, wenn LRCLIB sie liefert. Andernfalls werden die Wortzeiten aus der Zeilendauer geschätzt. Ohne Synchronisierung gibt es keine wortgenaue Karaoke-Anzeige. Reduzierte Bewegung deaktiviert starke Animationen.</small>
        <VisualLyricsStudioV379 />
      </fieldset>}
      {tab === "audio" && <>
      <label className="setting-check"><input type="checkbox" checked={preferences.microphoneEnabled} onChange={e => setMicrophone(e.target.checked)}/> Use live microphone analysis (otherwise estimated rhythm)</label>
      <fieldset><legend>Beat calibration</legend>
        <label>Beat sensitivity ({preferences.beatSensitivity.toFixed(2)}×)<input type="range" min="0.5" max="2" step="0.05" value={preferences.beatSensitivity} onChange={e => updatePreferences({ beatSensitivity: Number(e.target.value) })}/></label>
        <label>Minimum time between beats ({preferences.beatCooldownMs} ms)<input type="range" min="120" max="400" step="10" value={preferences.beatCooldownMs} onChange={e => updatePreferences({ beatCooldownMs: Number(e.target.value) })}/></label>
        <small>Higher sensitivity detects quieter bass impulses; cooldown suppresses repeated detections.</small>
        <label>Beat synchronization<select value={preferences.beatSyncMode} onChange={e => updatePreferences({ beatSyncMode: e.target.value as typeof preferences.beatSyncMode })}>
          <option value="off">Off</option><option value="auto">Auto (estimate phase)</option><option value="manual">Manual audio delay</option>
        </select></label>
        {preferences.beatSyncMode !== "off" && <label>Manual offset ({preferences.beatSyncOffsetMs} ms)<input type="range" min="-500" max="500" step="10" value={preferences.beatSyncOffsetMs} onChange={e => updatePreferences({ beatSyncOffsetMs: Number(e.target.value) })}/></label>}
        <small>Sync: {syncStatus}; estimated offset {syncOffsetMs} ms; confidence {Math.round(syncConfidence * 100)}%. In manual mode a positive offset delays the microphone-driven animation. Negative offsets cannot predict future sound. Auto estimates phase relative to a synthetic genre BPM grid; it does not automatically shift live microphone audio.</small>
        <BeatCalibrationAssistant />
      </fieldset>
      </>}
      {tab === "diagnostics" && <><PerformanceControlCenterV261 /><PerformanceSessionAnalyzerV262 /><RenderDiagnosticsPanel /><LongRunStabilitySettingsV355 /><LongSessionMonitoringPanel /><AvatarFrameProfilerPanel /><LodContinuityDiagnosticsPanel /><AvatarAssetOptimizationStudio /><PerformanceBenchmark /><AudioDebugPanel /></>}
      {tab === "display" && <label className="setting-check"><input type="checkbox" checked={preferences.reducedMotion} onChange={e => updatePreferences({ reducedMotion: e.target.checked })}/> Reduce motion</label>}
      {tab === "display" && <><UnifiedSettingsBackup /><BackupMigrationAssistant /><BackupIntegrityDiagnostics /></>}
      {tab === "display" && <p className="settings-note">Without microphone, beat timing is synthetic and based on a genre tempo estimate, not actual Spotify beat data. With microphone, frequency analysis runs locally in your browser. Your preferences are saved on this device.</p>}
      {tab === "display" && <button className="settings-reset" onClick={() => { setMicrophone(false); updatePreferences({ rapExpressiveEnabledV425:false,rapExpressiveStrengthV425:65,rapDuetEnabledV416:false,rapDuetCameraV416:true,rapLyricsGestureEnabledV414:false,avatarRapLipEnabledV415:false,avatarRapLipPrecisionV415:70,avatarRapLipOffsetMsV415:0,avatarRapSyllableEnabledV419:false,avatarRapSyllableStrengthV419:65,avatarRapSyllableSmoothnessV419:70,rapSyllableEditsEnabledV420:false,rapAudioEnabledV423:false,rapAudioStrengthV423:45,rapAudioOffsetMsV423:0, visualizerMode: "avatar", lyricsVisible: true, avatarLipSyncEnabled: true, avatarLipSyncStrength: 90, rapPerformanceEditorV408:{enabled:false,head:100,gestures:100,verse:100,hook:100,kick:100,snare:100,lipSync:100}, avatarLipSyncMode: "lyrics", avatarVocalStyleV368:"auto", avatarFacialExpressionV368:55,avatarJawFollowV369:65,avatarFacialProfilesV370:{},avatarVocalCameraV369:"auto",avatarVocalCameraStrengthV369:55,avatarVocalBodyEnabledV371:true,avatarVocalBodyStrengthV371:60,avatarVocalEyeContactV371:true,avatarVocalGesturesV371:true, avatarVocalCoordinationEnabledV372:true,avatarVocalCoordinationStrengthV372:70,avatarVocalCoordinationOffsetMsV372:0,avatarVocalPerformanceModeV393:"off",avatarVocalPerformanceStrengthV393:55, avatarAdaptivePerformanceModeV375:"off",avatarAdaptivePerformanceStrengthV375:65,avatarVocalDuetModeV376:"off",avatarVocalDuetStrengthV376:60, avatarConcertDirectorModeV386:"off",avatarConcertDirectorStrengthV386:65,avatarConcertDirectorCameraV386:true,avatarConcertDirectorLightingV386:true,avatarVocalCameraModeV401:"off",avatarVocalCameraStrengthV401:55,avatarVisualDirectorModeV397:"off",avatarVisualDirectorStrengthV397:65,avatarCameraStudioV398:{enabled:false,holdMs:1150,scenes:{verse:{shot:"auto",distance:50,pan:0},hook:{shot:"auto",distance:50,pan:0},drop:{shot:"auto",distance:50,pan:0}}},avatarUnifiedModeV402:"off",avatarUnifiedStrengthV402:70,avatarUnifiedCameraV402:true,avatarUnifiedLightingV402:true,avatarUnifiedDanceV402:true,avatarUnifiedVocalV402:true,avatarExperienceModeV396:"off",avatarExperienceStrengthV396:65,avatarFestivalModeV394:"off",avatarFestivalStrengthV394:70,avatarFestivalCameraV394:true,avatarFestivalLightingV394:true,avatarFestivalAtmosphereV394:true,avatarFestivalLasersV394:false,avatarShowModeV387:"off",avatarShowStrengthV387:70,avatarShowCameraV387:true,avatarShowLightingV387:true,avatarShowAtmosphereV387:true,avatarManualVocalEnabledV385:false,avatarManualVocalCameraV385:true,avatarVocalAssignmentsV385:{}, avatarDuetCameraModeV377:"off",avatarDuetCameraStrengthV377:65,avatarLyricsCameraModeV378:"off",avatarLyricsCameraStrengthV378:70,avatarLyricsContrastV378:true, lyricsFocusMode: true, lyricsStyle: "kinetic", lyricsAnimationIntensity: 65, lyricsKineticPresetV382:"auto", lyricsKineticStrengthV382:65, lyricsKineticDropsV382:true, lyricsBeatReactive: true, lyricsReactiveIntensity: 60, lyricsKickReactive: true, lyricsBassReactive: true, lyricsDropReactive: true, lyricsWordHighlight: true, lyricsFontSize: 100, lyricsFontFamilyV379: "system", lyricsPosition: "center", lyricsGlow: 65, lyricsGradientFrom: "#79f7ff", lyricsGradientTo: "#d789ff", lyricsAnimationSpeed: 100, lyricsOffsetMs: 0, lyricsImmersiveEnabled: false, lyricsImmersiveSide: "right", lyricsImmersiveDepth: 45, reducedMotion: false, avatarModelId: "procedural", avatarScale: 1, avatarOffsetY: 0, avatarAnimationIntensity: 1, danceAggression: 0.5, danceVariation: 0.5, danceMotionStyle: "balanced", avatarMotionMode: "hybrid", avatarClipSpeed: 1, avatarCrossfadeSeconds: 0.35, avatarArmResponse: 1, avatarLegResponse: 1, avatarRigProfile: "auto", avatarDancePreset: "auto", autoAvatarByGenre: false, beatSensitivity: 1, beatCooldownMs: 180, beatSyncMode: "off", beatSyncOffsetMs: 0 }); }}>Reset preferences</button>}
      </div></div>
    </section>}
  </aside>;
}
