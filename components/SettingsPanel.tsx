"use client";
import {invalidateAvatarCatalogV733} from "@/services/avatarCatalogV733";
import {DEFAULT_HIP_STUDIO_V738,normalizeHipStudioV738} from "@/components/visualizer/hipMotionStudioV738";
import {DEFAULT_NATURAL_DANCE_V758,normalizeNaturalDanceV758} from "@/components/visualizer/naturalDanceMotionV758";
import {DEFAULT_DANCE_VARIETY_V759,normalizeDanceVarietyV759} from "@/components/visualizer/intelligentDanceVarietyV759";
import {DEFAULT_NATURAL_BODY_V740,normalizeNaturalBodyV740} from "@/components/visualizer/naturalBodyDynamicsV740";
import {DEFAULT_GLUTE_V741,normalizeGluteSettingsV741} from "@/components/visualizer/advancedGluteRigV741";
import {DEFAULT_BEAT_BASS_V743,normalizeBeatBassV743} from "@/components/visualizer/beatBassHipMotionV743";
import {DEFAULT_SMART_HIP_V744,normalizeSmartHipV744} from "@/components/visualizer/smartHipChoreographyV744";
import {DEFAULT_ENSEMBLE_HIP_V745,normalizeEnsembleHipV745} from "@/components/visualizer/multiAvatarHipSyncV745";
import {DEFAULT_VOCAL_PERFORMANCE_V746,normalizeVocalPerformanceV746} from "@/components/visualizer/vocalPerformanceDirectorV746";
import {DEFAULT_VOCAL_BODY_SYNC_V757,normalizeVocalBodySyncV757} from "@/components/visualizer/vocalBodySyncV757";
import {normalizeConcertQualityV750} from "./visualizer/integratedConcertQualityV750";
import {normalizeCinematicConcertV761} from "./visualizer/cinematicConcertDirectorV761";
import {ConcertFxStudioV810} from "./visualizer/ConcertFxStudioPanelV810";
import {ConcertBenchmarkPanelV827} from './visualizer/ConcertBenchmarkPanelV827';
import {ConcertQualityDashboardV826} from "./visualizer/ConcertQualityDashboardV826";
import {normalizeDynamicStageLightingV762} from "./visualizer/cinematicScenicLightingV762";
import {ConcertQualityDashboardV751} from "./visualizer/ConcertQualityDashboardV751";
import {normalizePerformanceLightingV749} from "./visualizer/performanceLightingDirectorV749";
import {normalizeLyricsPerformanceV748} from "./visualizer/lyricsPerformanceStudioV748";
import {DEFAULT_PERFORMANCE_CAMERA_V747,normalizePerformanceCameraV747} from "@/components/visualizer/performanceCameraDirectorV747";
import {DEFAULT_GENRE_HIP_V742,normalizeGenreHipV742,GENRE_HIP_STYLES_V742} from "@/components/visualizer/genreHipIntelligenceV742";
import { STAGE_ENVIRONMENTS, type StageEnvironmentId } from "@/components/visualizer/stages";
import { StageThemePreviewGrid } from "@/components/visualizer/StageThemePreviewGrid";
import { ConcertDetailPreviewLauncherV556 } from "@/components/visualizer/ConcertDetailPreviewLauncherV556";
import { StageThemeLivePreview } from "@/components/visualizer/StageThemeLivePreview";
const SmartConcertTimelineAutomationV764 = dynamic(() => import("@/components/visualizer/SmartConcertTimelineAutomationV764").then(m=>m.SmartConcertTimelineAutomationV764), {ssr:false});
const InteractiveConcertTimelineStudioV763 = dynamic(() => import("@/components/visualizer/InteractiveConcertTimelineStudioV763").then(m=>m.InteractiveConcertTimelineStudioV763), {ssr:false});
const MultiAvatarChoreographyPanel = dynamic(() => import("@/components/visualizer/MultiAvatarChoreographyPanel").then(module => module.MultiAvatarChoreographyPanel), { ssr: false });
const CharacterMotionBatchInstaller = dynamic(() => import("@/components/CharacterMotionBatchInstaller").then(module => module.CharacterMotionBatchInstaller), { ssr: false });
const MotionInstaller = dynamic(() => import("@/components/MotionInstaller").then(module => module.MotionInstaller), { ssr: false });
const PortableBackupV657 = dynamic(() => import("@/components/PortableBackupV657").then(module => module.PortableBackupV657), { ssr: false });
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
const PerformanceMemoryDashboardV770 = dynamic(() => import("@/components/visualizer/PerformanceMemoryDashboardV770").then(m=>m.PerformanceMemoryDashboardV770), {ssr:false});
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
const VocalStemLabV643 = dynamic(() => import("@/components/visualizer/VocalStemLabV643").then(m => m.VocalStemLabV643), {ssr:false});
const PhonemeTimelineLabV644 = dynamic(() => import("@/components/visualizer/PhonemeTimelineLabV644").then(m=>m.PhonemeTimelineLabV644),{ssr:false});
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
const GoveeLanPanelV909 = dynamic(() => import("@/components/GoveeLanPanelV909").then(m => m.GoveeLanPanelV909), {ssr:false});
const ServiceStatusDashboardV667 = dynamic(() => import("@/components/ServiceStatusDashboardV667").then(m => m.ServiceStatusDashboardV667), {ssr:false});
const LongRunStabilitySettingsV355 = dynamic(() => import("@/components/visualizer/LongRunStabilityV355").then(m => m.LongRunStabilitySettingsV355), { ssr:false });
const LongSessionMonitoringPanel = dynamic(() => import("@/components/LongSessionMonitoringPanel").then(m => m.LongSessionMonitoringPanel), { ssr:false });
import { readChoreographies, CHOREOGRAPHY_CHANGE_EVENT } from "@/components/visualizer/avatarChoreographies";

export function SettingsPanel({ initiallyOpen = false }: { initiallyOpen?: boolean } = {}) {
  const [open, setOpen] = useState(initiallyOpen);
  // V738: normalized persisted profile is shared by stage and 3D preview.

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
    finally {invalidateAvatarCatalogV733(); setAnimationUploading(false); }
  };
  const refreshAdmin = async () => { try {const r=await fetch("/api/admin",{cache:"no-store"});const d=await r.json();setAdmin(d.authenticated===true);setAdminConfigured(d.configured===true);setBlobUploadEnabled(d.blobEnabled===true);}catch{setAdmin(false);} };
  const login = async () => {const r=await fetch("/api/admin",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({password:adminPassword})});const d=await r.json();if(!r.ok){setAdminError(d.error||"Login fehlgeschlagen");return;}setAdmin(true);setAdminPassword("");setAdminError("");};
  const logout = async () => {await fetch("/api/admin",{method:"DELETE"});setAdmin(false);};
  const uploadAvatar = async () => {if(!uploadFile||!admin)return;setUploading(true);setAdminError("");try {if(!/\.glb$/i.test(uploadFile.name))throw Error("Bitte GLB-Datei auswählen");const base=uploadFile.name.replace(/\.glb$/i,"").replace(/[^a-zA-Z0-9_-]/g,"-").slice(0,60)||"avatar";const name=`${base}-${crypto.randomUUID().slice(0,8)}.glb`;const result=await upload(`sonic/models/${name}`,uploadFile,{access:"public",handleUploadUrl:"/api/avatars/upload",contentType:"model/gltf-binary"});if(!result.url)throw Error("Upload fehlgeschlagen");await refreshLibrary();setUploadFile(null);setAdminError("Avatar hochgeladen: "+name);}catch(e){setAdminError(e instanceof Error?e.message:"Upload fehlgeschlagen");}finally{invalidateAvatarCatalogV733();setUploading(false);}};
  const uploadPreview = async () => {if(!previewFile||!admin)return;setUploading(true);try{const ext=previewFile.name.split(".").pop()?.toLowerCase();if(!ext||!["png","jpg","jpeg","webp"].includes(ext))throw Error("PNG/JPG/WebP erforderlich");const blob=await upload(`sonic/previews/${crypto.randomUUID()}.${ext}`,previewFile,{access:"public",handleUploadUrl:"/api/avatars/upload"});setAvatarDraft(v=>({...v,preview:blob.url}));setPreviewFile(null);}catch(e){setAdminError(e instanceof Error?e.message:"Vorschaubild-Upload fehlgeschlagen");}finally{invalidateAvatarCatalogV733();setUploading(false);}};

  const [search, setSearch] = useState("");
  const [localModels, setLocalModels] = useState<AvatarModel[]>([]);
  const [defaultOverrides, setDefaultOverrides] = useState<AvatarModel[]>([]);
  const [avatarFilter, setAvatarFilter] = useState("");
  const [editingModel, setEditingModel] = useState<string | null>(null);
  const [avatarDraft, setAvatarDraft] = useState({ label: "", description: "", preview: "", genre: "", tags: "", category: "", favorite: false, defaultDancePreset: "auto", modelUrl: "", animationUrl: "" });
  const [savingAvatar, setSavingAvatar] = useState(false);
  const [avatarSaveMessage, setAvatarSaveMessage] = useState<string | null>(null);
  const [avatarEditLoading, setAvatarEditLoading] = useState(false);
  const [avatarRecovery, setAvatarRecovery] = useState<{source:string;warnings:string[];journalConflicts:{filename:string}[];unsafe:boolean;backupAvailable:boolean}|null>(null);
  const [avatarRecoveryMessage,setAvatarRecoveryMessage]=useState<string|null>(null);
  const avatarRevisionRef=useRef<string|null>(null);
  const avatarEditorGeneration=useRef(0);
  const loadAvatarRecovery=async()=>{
    try{const response=await fetch('/api/avatars/config/recovery',{cache:'no-store'});
      if(!response.ok)throw Error('Konfiguration nicht lesbar');
      const json=await response.json();setAvatarRecovery(json.diagnostics);
    }catch(error){setAvatarRecoveryMessage(error instanceof Error?error.message:'Konfigurationsprüfung fehlgeschlagen');}
  };
  const restoreAvatarBackup=async()=>{
    if(!window.confirm('Letzte lokale Avatar-Konfigurationssicherung wiederherstellen? Aktuelle Änderungen können verloren gehen.'))return;
    try{
      const response=await fetch('/api/avatars/config/recovery',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'restore-local-backup',confirmed:true})});
      const json=await response.json();if(!response.ok)throw Error(json.error||'Wiederherstellung fehlgeschlagen');
      setAvatarRecoveryMessage('Sicherung wiederhergestellt. Avatar-Liste aktualisiert.');
      await Promise.all([refreshLibrary(),loadAvatarRecovery()]);
    }catch(error){setAvatarRecoveryMessage(error instanceof Error?error.message:'Wiederherstellung fehlgeschlagen');}
  };
  const editAvatar = async (model: AvatarModel) => {
    const generation=++avatarEditorGeneration.current;
    const filename=model.id.startsWith('local:')?model.id.slice(6):`default:${model.id}`;
    setEditingModel(null);setAvatarSaveMessage(null);setAvatarEditLoading(true);
    try {
      // Revision and form values MUST come from the same server snapshot.
      const response=await fetch('/api/avatars/config',{cache:'no-store'});
      const json=await response.json();if(!response.ok)throw Error(json.error||'Konfiguration konnte nicht geladen werden');
      if(generation!==avatarEditorGeneration.current)return;
      const saved:Record<string,unknown>=json.metadata?.[filename]??{};
      const original={label:model.label,description:model.description,preview:model.preview??'',genre:model.genre??[],tags:model.tags??[],category:model.category??'Eigene Modelle',favorite:model.favorite??false,defaultDancePreset:model.defaultDancePreset??'auto',modelUrl:model.url??'',animationUrl:model.animationUrl??''};
      const data={...original,...saved};
      const text=(key:keyof typeof original)=>typeof data[key]==='string'?data[key] as string:'';
      const tags=(key:'genre'|'tags')=>Array.isArray(data[key])?(data[key] as unknown[]).filter((v):v is string=>typeof v==='string').join(', '):'';
      avatarRevisionRef.current=json.revisions?.[filename]??json.emptyRevision??null;
      if(!avatarRevisionRef.current)throw Error('Versionskennung fehlt; Bearbeitung zum Schutz vor Datenverlust abgebrochen');
      setAvatarDraft({label:text('label'),description:text('description'),preview:text('preview'),genre:tags('genre'),tags:tags('tags'),category:text('category'),favorite:data.favorite===true,defaultDancePreset:text('defaultDancePreset')||'auto',modelUrl:text('modelUrl')||model.url||'',animationUrl:text('animationUrl')});
      setEditingModel(model.id);
    } catch(error){if(generation===avatarEditorGeneration.current)setAvatarSaveMessage(error instanceof Error?error.message:'Bearbeitung nicht möglich');}
    finally{invalidateAvatarCatalogV733();if(generation===avatarEditorGeneration.current)setAvatarEditLoading(false);}
  };
  const saveAvatar = async () => {
    if (!editingModel || savingAvatar) return;
    setSavingAvatar(true);
    setAvatarSaveMessage(null);
    try {
      const response = await fetch("/api/avatars/config", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ expectedRevision:avatarRevisionRef.current, filename: editingModel.startsWith("local:") ? editingModel.slice(6) : `default:${editingModel}`, metadata: { ...avatarDraft, genre: avatarDraft.genre.split(",").map(v => v.trim()).filter(Boolean), tags: avatarDraft.tags.split(",").map(v => v.trim()).filter(Boolean) } }) });
      const data: { error?: string } = await response.json();
      if (!response.ok) throw new Error(response.status===409?`${data.error || 'Konflikt'} Deine Eingaben bleiben erhalten. Zum Vergleich bitte die Bearbeitung erneut öffnen.`:(data.error || `HTTP ${response.status}`));
      await refreshLibrary();
      setAvatarSaveMessage('Avatar-Einstellungen dauerhaft gespeichert.');
      setEditingModel(null);
    } catch (error) { setAvatarSaveMessage(error instanceof Error ? error.message : "Speichern fehlgeschlagen"); }
    finally {invalidateAvatarCatalogV733(); setSavingAvatar(false); }
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
    } finally {invalidateAvatarCatalogV733(); setLibraryLoading(false); }
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
    } finally {invalidateAvatarCatalogV733(); setConverting(false); }
  };
  useEffect(() => { if (open) { void refreshLibrary(); void refreshAdmin(); } }, [open]);
  const searchRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const sections = [
    { id: "dashboard", label: "Dienste & Status", hint: "Dashboard Status Dienste Spotify Last.fm Lyrics Konfiguration Verbindung Mikrofon Automatik Übersicht" },
    { id: "display", label: "Anzeige", hint: "Visualizer Lyrics Motion Bildschirm" },
    { id: "avatar", label: "Avatar & Tanz", hint: "Avatar GLTF Vorschau Scale Rig Dance Preset Intensität Aggression Variation Motion Studio" },
    { id: "audio", label: "Mikrofon & Beat", hint: "Audio BPM Mikrofon Sensitivity Calibration Cooldown Sync Offset" },
    { id: "govee", label: "Govee LAN", hint: "Govee Lichter WLAN LAN Geräte Licht Bühne Farben Beleuchtung Bridge" },
    { id: "diagnostics", label: "Diagnose", hint: "Debug FPS Performance Beat Rhythm" },
  ] as const;
  const filteredSections = sections.filter(section => (section.label + " " + section.hint).toLowerCase().includes(search.trim().toLowerCase()));

  const [facialStudioOpen,setFacialStudioOpen]=useState(false);
  const [vocalSyncInspectorOpenV373,setVocalSyncInspectorOpenV373]=useState(false);
  const [rapEditorOpenV408,setRapEditorOpenV408]=useState(false);
  const [tab, setTab] = useState<"dashboard" | "display" | "avatar" | "audio" | "govee" | "diagnostics">("dashboard");
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
  const hipStudioV738=normalizeHipStudioV738(preferences.avatarHipStudioV738);
  const naturalBodyV740=normalizeNaturalBodyV740(preferences.avatarNaturalBodyV740);
  const naturalDanceV758=normalizeNaturalDanceV758(preferences.avatarNaturalDanceV758);
  const danceVarietyV759=normalizeDanceVarietyV759(preferences.avatarDanceVarietyV759);
  const gluteV741=normalizeGluteSettingsV741(preferences.avatarGluteRigV741);
  const genreHipV742=normalizeGenreHipV742(preferences.avatarGenreHipV742);
  const beatBassV743=normalizeBeatBassV743(preferences.avatarBeatBassV743);
  const smartHipV744=normalizeSmartHipV744(preferences.avatarSmartHipV744);
  const ensembleHipV745=normalizeEnsembleHipV745(preferences.avatarEnsembleHipV745);
  const vocalPerformanceV746=normalizeVocalPerformanceV746(preferences.avatarVocalPerformanceV746);
  const vocalBodySyncV757=normalizeVocalBodySyncV757(preferences.avatarVocalBodySyncV757);
  const concertQualityV750=normalizeConcertQualityV750(preferences.concertQualityV750);
  const cinematicConcertV761=normalizeCinematicConcertV761(preferences.cinematicConcertV761);
  const scenicLightingV762=normalizeDynamicStageLightingV762(preferences.scenicLightingV762);
  const performanceLightingV749=normalizePerformanceLightingV749(preferences.avatarPerformanceLightingV749);
  const lyricsPerformanceV748=normalizeLyricsPerformanceV748(preferences.lyricsPerformanceV748);
  const performanceCameraV747=normalizePerformanceCameraV747(preferences.avatarPerformanceCameraV747);
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
      {tab === "dashboard" && <ServiceStatusDashboardV667 onNavigate={setTab} />}
      {tab === "govee" && <GoveeLanPanelV909 />}
      {tab === "diagnostics" && <fieldset><legend>V826–V827 · Live-Konzertqualität</legend><ConcertQualityDashboardV826 enabled={preferences.concertFxV810?.qualityDashboardV826!==false}/><ConcertBenchmarkPanelV827 enabled={preferences.concertFxV810?.qualityDashboardV826!==false}/></fieldset>}
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
        <div className="avatar-library-edit-actions">{admin && libraryModels.map(model => <button key={model.id} type="button" disabled={avatarEditLoading||savingAvatar} onClick={() => void editAvatar(model)}>✎ {model.label} bearbeiten</button>)}</div>
        {admin && <div className="avatar-metadata-editor"><h4>V658 – Konfigurationsprüfung &amp; Wiederherstellung</h4>
          <button type="button" onClick={()=>void loadAvatarRecovery()}>Speicherzustand prüfen</button>
          {avatarRecovery && <><p>Quelle: {avatarRecovery.source} · {avatarRecovery.unsafe?'Schreibzugriff vorsichtshalber gesperrt':'Schreibzugriff möglich'}</p>
            {avatarRecovery.warnings.map((warning,i)=><p key={i} role="alert">{warning}</p>)}
            {avatarRecovery.backupAvailable && avatarRecovery.source!=='empty' && !blobUploadEnabled && <button type="button" onClick={()=>void restoreAvatarBackup()}>Letzte lokale Sicherung wiederherstellen</button>}
            {avatarRecovery.journalConflicts.length>0&&<p role="alert">{avatarRecovery.journalConflicts.length} Änderungskonflikte protokolliert. Betroffene Modelle: {[...new Set(avatarRecovery.journalConflicts.map(c=>c.filename))].join(', ')}</p>}
          </>}
          {avatarRecoveryMessage && <p role="status">{avatarRecoveryMessage}</p>}
        </div>}
        {avatarEditLoading && <p role="status">Konfigurationsversion wird geladen…</p>}
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
          <div className="avatar-editor-buttons"><button type="submit" disabled={savingAvatar}>{savingAvatar ? "Speichere…" : "Speichern"}</button><button type="button" onClick={() => {avatarEditorGeneration.current++;setEditingModel(null);}}>Abbrechen</button></div>
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
        {(preferences.stageTheme === "arena360") && <div className="arena360-settings-v1031">
          <strong>V1037 · Arena Transformation 2.0</strong>
          <div className="arena360-experience-options-v1032">
            <strong>Transformierende 360°-Bühne</strong>
            <label className="setting-check"><input type="checkbox"
              checked={preferences.arenaTransformingDeckEnabledV1037 ?? true}
              onChange={e=>updatePreferences({arenaTransformingDeckEnabledV1037:e.target.checked})}/>
              Bewegliche LED-Bühnensegmente rund um das Hauptdeck</label>
            <label>Bewegungsmuster
              <select value={preferences.arenaTransformingDeckModeV1037 ?? 'auto'}
                disabled={!(preferences.arenaTransformingDeckEnabledV1037 ?? true)}
                onChange={e=>updatePreferences({arenaTransformingDeckModeV1037:e.target.value as 'auto'|'fan'|'spiral'|'halo'})}>
                <option value="auto">Automatisch nach Songabschnitt</option>
                <option value="fan">Fächer</option><option value="spiral">Spirale</option><option value="halo">Leuchtring</option>
              </select>
            </label>
            <label>Verwandlungsstärke: {preferences.arenaTransformingDeckStrengthV1037 ?? 70} %
              <input type="range" min={0} max={100} step={5}
                disabled={!(preferences.arenaTransformingDeckEnabledV1037 ?? true)}
                value={preferences.arenaTransformingDeckStrengthV1037 ?? 70}
                onChange={e=>updatePreferences({arenaTransformingDeckStrengthV1037:Number(e.target.value)})}/>
            </label>
            <small>Bis zu acht äußere Segment-Petalen fahren sanft aus und heben sich leicht an. Der zentrale Avatar-Boden bleibt starr, die Bühne rotiert weiterhin; Bewegung stoppt bei Pause oder reduzierter Animation. Keine echten Mechanikantriebe.</small>
          </div>
          <strong>V1036 · Laser & Atmospheric Arena</strong>
          <div className="arena360-experience-options-v1032">
            <strong>Rundum-Licht, LED-Himmel und Bühnennebel</strong>
            <label className="setting-check"><input type="checkbox"
              checked={preferences.arenaLasersEnabledV1036 ?? true}
              onChange={e=>updatePreferences({arenaLasersEnabledV1036:e.target.checked})}/> Sanft animierte Laserfächer rund um die Bühne</label>
            <label className="setting-check"><input type="checkbox"
              checked={preferences.arenaMovingSkyEnabledV1036 ?? true}
              onChange={e=>updatePreferences({arenaMovingSkyEnabledV1036:e.target.checked})}/> Beweglicher LED-Himmel über dem Publikum</label>
            <label className="setting-check"><input type="checkbox"
              checked={preferences.arenaGroundFogEnabledV1036 ?? true}
              onChange={e=>updatePreferences({arenaGroundFogEnabledV1036:e.target.checked})}/> Dezenter, shaderbasierter Bodennebel</label>
            <label className="setting-check"><input type="checkbox"
              checked={preferences.arenaPeakDirectorEnabledV1036 ?? true}
              disabled={!(preferences.arenaFullSongDirectorEnabledV1035 ?? true)}
              onChange={e=>updatePreferences({arenaPeakDirectorEnabledV1036:e.target.checked})}/> Gezielt dosierte Showhöhepunkte bei echten Beats</label>
            <small>Ressourcenschonende, rein virtuelle Effekte. Höhepunkte benötigen einen erkannten Hook/Drop und starke Audioimpulse; 18 Sekunden Abstand verhindern Dauerfeuer. Keine Strobo-Blitze. Bei Pause oder reduzierter Bewegung bleiben die Effekte ruhig.</small>
          </div>
          <strong>V1035 · AI Arena Show Director</strong>
          <div className="arena360-experience-options-v1032">
            <strong>Intelligente Show über den ganzen Song</strong>
            <label className="setting-check"><input type="checkbox"
              checked={preferences.arenaFullSongDirectorEnabledV1035 ?? true}
              onChange={e=>updatePreferences({arenaFullSongDirectorEnabledV1035:e.target.checked})}/> Dynamischer Showbogen aus Songabschnitt, Fortschritt und Musikenergie</label>
            <label className="setting-check"><input type="checkbox"
              checked={preferences.arenaLedColumnsEnabledV1035 ?? true}
              onChange={e=>updatePreferences({arenaLedColumnsEnabledV1035:e.target.checked})}/> Bewegliche LED-Säulen um die Bühne</label>
            <label className="setting-check"><input type="checkbox"
              checked={preferences.arenaVirtualPyroEnabledV1035 ?? true}
              disabled={!(preferences.arenaFullSongDirectorEnabledV1035 ?? true)}
              onChange={e=>updatePreferences({arenaVirtualPyroEnabledV1035:e.target.checked})}/> Virtuelle Pyro-Partikel bei erkannten Drops</label>
            <label className="setting-check"><input type="checkbox"
              checked={preferences.arenaCrowdChantEnabledV1035 ?? true}
              disabled={!(preferences.arenaAudienceEnabledV1032 ?? true)}
              onChange={e=>updatePreferences({arenaCrowdChantEnabledV1035:e.target.checked})}/> Publikum bei Hooks stärker mitbewegen</label>
            <label>Showintensität ({preferences.arenaShowIntensityV1035 ?? 65} %)
              <input type="range" min="0" max="100" step="5" value={preferences.arenaShowIntensityV1035 ?? 65}
                onChange={e=>updatePreferences({arenaShowIntensityV1035:Number(e.target.value)})}/>
            </label>
            <small>Lokale, regelbasierte Dramaturgie: keine externen KI-Anfragen. Intro, Hauptteil und Finale werden anhand der tatsächlichen Wiedergabeposition variiert; Pyro gibt es nur bei erkanntem Drop und kräftigem gemessenem Beat. Alle Effekte sind rein virtuell und leistungsbegrenzt.</small>
          </div>
          <strong>V1034 · Ultimate 360° Concert Experience</strong>
          <div className="arena360-experience-options-v1032">
            <strong>Automatische Show-Regie nach Songabschnitt</strong>
            <label className="setting-check"><input type="checkbox"
              checked={preferences.arenaShowDirectorEnabledV1034 ?? true}
              onChange={e=>updatePreferences({arenaShowDirectorEnabledV1034:e.target.checked})}/> Verse-/Hook-/Drop-Inszenierung aktivieren</label>
            <label className="setting-check"><input type="checkbox"
              checked={preferences.arenaSecondLevelEnabledV1034 ?? true}
              onChange={e=>updatePreferences({arenaSecondLevelEnabledV1034:e.target.checked})}/> Zweite bewegliche Bühnenebene</label>
            <label className="setting-check"><input type="checkbox"
              checked={preferences.arenaSkyFormationEnabledV1034 ?? true}
              onChange={e=>updatePreferences({arenaSkyFormationEnabledV1034:e.target.checked})}/> Lichtformationen über dem Publikum</label>
            <label className="setting-check"><input type="checkbox"
              checked={preferences.arenaSectionCameraEnabledV1034 ?? true}
              disabled={!(preferences.arenaCameraEnabledV1032 ?? true)}
              onChange={e=>updatePreferences({arenaSectionCameraEnabledV1034:e.target.checked})}/> Eigene Kamerakompositionen für Verse, Hook und Drop</label>
            <small>Die zweite Ebene ist ein unabhängig hebender LED-Ring um den Künstlerbereich; die Avatare bleiben auf dem Hauptdeck. Der aktive Songabschnitt bestimmt Formationsmuster, sanfte Ringhöhe und die automatische Kamerawirkung. Manuelle, Lyrics- und Gesangsaufnahmen behalten Vorrang.</small>
          </div>
          <label className="setting-check"><input type="checkbox"
            checked={preferences.stageRotationEnabledV1031 ?? true}
            onChange={e=>updatePreferences({stageRotationEnabledV1031:e.target.checked})}/>
            Drehplattform mit Künstlern drehen
          </label>
          <label>Drehgeschwindigkeit ({preferences.stageRotationSpeedV1031 ?? 90}° pro Minute)
            <input type="range" min="0" max="180" step="5" value={preferences.stageRotationSpeedV1031 ?? 90}
              onChange={e=>updatePreferences({stageRotationSpeedV1031:Number(e.target.value)})}/>
          </label>
          <div className="arena360-experience-options-v1032">
            <strong>Publikum &amp; LED-Kuppel</strong>
            <label className="setting-check"><input type="checkbox" checked={preferences.arenaWavesEnabledV1033 ?? true}
              disabled={!(preferences.arenaAudienceEnabledV1032 ?? true)}
              onChange={e=>updatePreferences({arenaWavesEnabledV1033:e.target.checked})}/> Animierte Publikumswellen</label>
            <label className="setting-check"><input type="checkbox" checked={preferences.arenaPhoneSyncEnabledV1033 ?? true}
              disabled={!(preferences.arenaAudienceEnabledV1032 ?? true)}
              onChange={e=>updatePreferences({arenaPhoneSyncEnabledV1033:e.target.checked})}/> Handylichter zur Musik synchronisieren</label>
            <label>Handylicht-Muster
              <select value={preferences.arenaPhoneModeV1033 ?? "wave"}
                disabled={!(preferences.arenaAudienceEnabledV1032 ?? true) || !(preferences.arenaPhoneSyncEnabledV1033 ?? true)}
                onChange={e=>updatePreferences({arenaPhoneModeV1033:e.target.value === "pulse" ? "pulse" : e.target.value === "chase" ? "chase" : "wave"})}>
                <option value="wave">Wandernde Lichtwelle</option>
                <option value="pulse">Beat-Puls</option>
                <option value="chase">Lauflicht rundherum</option>
              </select>
            </label>
            <label className="setting-check"><input type="checkbox" checked={preferences.arenaDomeEnabledV1033 ?? true}
              onChange={e=>updatePreferences({arenaDomeEnabledV1033:e.target.checked})}/> Schwebende LED-Kuppel</label>
            <strong>Konzertkamera</strong>
            <label className="setting-check"><input type="checkbox" checked={preferences.arenaFlyoverEnabledV1033 ?? true}
              disabled={!(preferences.arenaCameraEnabledV1032 ?? true)}
              onChange={e=>updatePreferences({arenaFlyoverEnabledV1033:e.target.checked})}/> Kameraflug über das Publikum bei starken Drops</label>
            <label className="setting-check"><input type="checkbox" checked={preferences.arenaAudienceEnabledV1032 ?? true}
              onChange={e=>updatePreferences({arenaAudienceEnabledV1032:e.target.checked})}/> Publikum rund um die Bühne</label>
            <label className="setting-check"><input type="checkbox" checked={preferences.arenaLightsEnabledV1032 ?? true}
              onChange={e=>updatePreferences({arenaLightsEnabledV1032:e.target.checked})}/> Bewegliche Rundum-Scheinwerfer</label>
            <label className="setting-check"><input type="checkbox" checked={preferences.arenaDropEnabledV1032 ?? true}
              onChange={e=>updatePreferences({arenaDropEnabledV1032:e.target.checked})}
              disabled={!(preferences.arenaLightsEnabledV1032 ?? true)}/> Sanfter Lichtimpuls bei starken Drops</label>
            <label className="setting-check"><input type="checkbox" checked={preferences.arenaCameraEnabledV1032 ?? true}
              onChange={e=>updatePreferences({arenaCameraEnabledV1032:e.target.checked})}/> Automatische Arena-Kamerafahrten</label>
            <label>Kamerafahrt
              <select value={preferences.arenaCameraModeV1032 ?? "arc"}
                disabled={!(preferences.arenaCameraEnabledV1032 ?? true)}
                onChange={e=>updatePreferences({arenaCameraModeV1032:e.target.value === "orbit" ? "orbit" : "arc"})}>
                <option value="arc">Sanfte Rundum-Schwenks</option>
                <option value="orbit">Volle 360°-Umrundung (100 s)</option>
              </select>
            </label>
          </div>
          <small>Die Künstler rotieren gemeinsam mit der Plattform. Publikum und Scheinwerfer bleiben an festen Plätzen. Die Arena-Kamera und der Drop-Flyover respektieren manuelle Aufnahmen sowie Gesangs- und Lyrics-Nahaufnahmen. Publikumswellen und Pixel-Kuppel werden je nach Grafikleistung begrenzt. Pause und „Bewegung reduzieren“ schalten dynamische Bewegungen und Drop-Lichtimpulse aus. Die Grafikqualität begrenzt die Anzahl echter Scheinwerfer und LED-Formationspunkte automatisch. Die V1035-Regie übernimmt erkannte Songabschnitte; ohne erkennbare Drops gibt es keine virtuellen Pyro-Auslösungen. Pause und reduzierte Bewegung unterdrücken die neuen Effekte.</small>
        </div>}
        <ConcertQualityDashboardV751 avatarModelUrl={currentAvatar?.url??null} avatarChoicesV805={[...avatarModels.map(m=>defaultOverrides.find(o=>o.id===m.id)??m),...localModels].filter(m=>!!m.url).map(m=>({id:m.id,label:m.label,url:m.url!}))} stageTheme={preferences.stageTheme??"classic"}/>
        <InteractiveConcertTimelineStudioV763/>
        <SmartConcertTimelineAutomationV764/>
        <ConcertFxStudioV810 value={preferences.concertFxV810} onChange={concertFxV810=>updatePreferences({concertFxV810})}/>
        <fieldset><legend>V762 · Dynamic Stage &amp; Lighting 4.0</legend>
          <label className="setting-check"><input type="checkbox" checked={scenicLightingV762.enabled} onChange={e=>updatePreferences({scenicLightingV762:{...scenicLightingV762,enabled:e.target.checked}})}/> Dynamische Bühnenakzente einschalten</label>
          <label>Effektstärke ({scenicLightingV762.strength} %)<input type="range" min="0" max="100" step="5" value={scenicLightingV762.strength} onChange={e=>updatePreferences({scenicLightingV762:{...scenicLightingV762,strength:Number(e.target.value)}})}/></label>
          {([{key:'gobos',label:'Gobo-Lichtmuster am Boden'},{key:'ledWall',label:'Variierende LED-Wand'},{key:'spotlights',label:'Bewegliche Spotlight-Akzente'},{key:'floorHaze',label:'Bestehenden Bodennebel dynamisch verfeinern'},{key:'protectLyrics',label:'Lyrics-Lesbarkeit priorisieren'}] as const).map(item=><label key={item.key} className="setting-check"><input type="checkbox" checked={scenicLightingV762[item.key]} onChange={e=>updatePreferences({scenicLightingV762:{...scenicLightingV762,[item.key]:e.target.checked}})}/>{item.label}</label>)}
          <small>Opt-in. Nur bei verifizierter V761-/V604-Konzertszene. Gobo ist eine günstige Shader-Bodenprojektion, kein echtes Projektionslicht. Die LED-Wand, die bestehenden Scheinwerfer und der vorhandene Nebelrenderer werden wiederverwendet. Manuelle Licht-Timelines, Blackouts, Pausen, Reduced Motion und Low-Tier haben Vorrang.</small>
        </fieldset>
        <fieldset><legend>V761 · Cinematic Concert Director 4.0</legend>
          <label className="setting-check"><input type="checkbox" checked={cinematicConcertV761.enabled} onChange={e=>updatePreferences({cinematicConcertV761:{...cinematicConcertV761,enabled:e.target.checked}})}/> Gemeinsamen Song-Szenenplan aktivieren</label>
          <label>Regiestärke ({cinematicConcertV761.strength} %)<input type="range" min="0" max="100" step="5" value={cinematicConcertV761.strength} onChange={e=>updatePreferences({cinematicConcertV761:{...cinematicConcertV761,strength:Number(e.target.value)}})}/></label>
          <label>Motivwechsel ({cinematicConcertV761.variety} %)<input type="range" min="0" max="100" step="5" value={cinematicConcertV761.variety} onChange={e=>updatePreferences({cinematicConcertV761:{...cinematicConcertV761,variety:Number(e.target.value)}})}/></label>
          <label>Szenenübergang ({cinematicConcertV761.transitionMs} ms)<input type="range" min="400" max="3000" step="100" value={cinematicConcertV761.transitionMs} onChange={e=>updatePreferences({cinematicConcertV761:{...cinematicConcertV761,transitionMs:Number(e.target.value)}})}/></label>
          <label className="setting-check"><input type="checkbox" checked={cinematicConcertV761.protectLyrics} onChange={e=>updatePreferences({cinematicConcertV761:{...cinematicConcertV761,protectLyrics:e.target.checked}})}/> Lesbare Lyrics vor optionalen Szeneneffekten priorisieren</label>
          <small>V761 variiert Porträt-, Dialog-, Gruppen-, Weitwinkel-, Aufbau- und Ruhe-Motive über verifizierte Songabschnitte. Unbekannte Songstrukturen bleiben unangetastet. Kein automatisches Erkennen von Sängern, keine neue Kamera oder Lichtquelle. Manuelle Regie und bestehende Sicherheitsprüfungen haben Vorrang. Die aktive Szene wird als data-v761-scene im Bühnenstatus ausgegeben.</small>
        </fieldset>
        <fieldset><legend>V750 · Integrated Concert Quality &amp; Performance</legend>
          <label className="setting-check"><input type="checkbox" checked={concertQualityV750.enabled} onChange={e=>updatePreferences({concertQualityV750:{...concertQualityV750,enabled:e.target.checked}})}/> Automatische Konzert-Qualitätsregie</label>
          <label>Intensität der Schutzregeln ({concertQualityV750.strength} %)<input type="range" min="0" max="100" step="5" value={concertQualityV750.strength} onChange={e=>updatePreferences({concertQualityV750:{...concertQualityV750,strength:Number(e.target.value)}})}/></label>
          <label className="setting-check"><input type="checkbox" checked={concertQualityV750.protectLyrics} onChange={e=>updatePreferences({concertQualityV750:{...concertQualityV750,protectLyrics:e.target.checked}})}/> Zusätzlichen Lyrics-Schutz priorisieren</label>
          <label className="setting-check"><input type="checkbox" checked={concertQualityV750.protectPerformance} onChange={e=>updatePreferences({concertQualityV750:{...concertQualityV750,protectPerformance:e.target.checked}})}/> Bestätigte Sänger bei Kamerabewegungen schützen</label>
          <label className="setting-check"><input type="checkbox" checked={concertQualityV750.adaptiveLoad} onChange={e=>updatePreferences({concertQualityV750:{...concertQualityV750,adaptiveLoad:e.target.checked}})}/> Bei großen Gruppen / niedriger Qualitätsstufe zurückhaltender inszenieren</label>
          <small>V750 passt nur Zusatzbewegungen und -akzente von V735/V746–V749 an. Gespeicherte Szenen, manuelle Kamera- und Licht-Timelines, echte Lippenanimationen sowie Fuß-IK werden nicht verändert. Die Anzeige ist eine Planungsheuristik, keine gemessene FPS- oder GPU-Diagnose.</small>
        </fieldset>
        <fieldset><legend>V749 · Concert Lighting Director</legend>
          <label className="setting-check"><input type="checkbox" checked={performanceLightingV749.enabled} onChange={e=>updatePreferences({avatarPerformanceLightingV749:{...performanceLightingV749,enabled:e.target.checked}})}/> Musik- und performanceabhängige Lichtregie</label>
          <label>Regiestärke ({performanceLightingV749.strength} %)<input type="range" min="0" max="100" step="5" value={performanceLightingV749.strength} onChange={e=>updatePreferences({avatarPerformanceLightingV749:{...performanceLightingV749,strength:Number(e.target.value)}})}/></label>
          <label className="setting-check"><input type="checkbox" checked={performanceLightingV749.vocalPortraits} onChange={e=>updatePreferences({avatarPerformanceLightingV749:{...performanceLightingV749,vocalPortraits:e.target.checked}})}/> Sänger-Spotlights bei bestätigten Rollen</label>
          <label className="setting-check"><input type="checkbox" checked={performanceLightingV749.groupHooks} onChange={e=>updatePreferences({avatarPerformanceLightingV749:{...performanceLightingV749,groupHooks:e.target.checked}})}/> Gruppenbeleuchtung in Hooks</label>
          <label className="setting-check"><input type="checkbox" checked={performanceLightingV749.dropAccents} onChange={e=>updatePreferences({avatarPerformanceLightingV749:{...performanceLightingV749,dropAccents:e.target.checked}})}/> Kick-abhängige Drop-Akzente</label>
          <label className="setting-check"><input type="checkbox" checked={performanceLightingV749.protectLyrics} onChange={e=>updatePreferences({avatarPerformanceLightingV749:{...performanceLightingV749,protectLyrics:e.target.checked}})}/> Zusätzlicher Lyrics-Kontrastschutz</label>
          <label>Übergang ({performanceLightingV749.transitionMs} ms)<input type="range" min="250" max="2500" step="50" value={performanceLightingV749.transitionMs} onChange={e=>updatePreferences({avatarPerformanceLightingV749:{...performanceLightingV749,transitionMs:Number(e.target.value)}})}/></label>
          <small>Bestehende Licht-Timelines und Blackouts haben Vorrang. Sprecher-Fokus nutzt nur die geprüfte V528/V551-Zuordnung; keine automatische Sprechererkennung. Die Beleuchtung verwendet vorhandene Lichter.</small>
        </fieldset>
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
        <fieldset><legend>Hüftbewegungen · V735</legend>
          <p>Hip_Sway (Hüftschwingen), Hip_Circle (Beckenkreisen) und Hip_Bounce (rhythmischer Bounce) werden auf dem vorhandenen GLB-Rig erzeugt. Auto wechselt musikalisch zwischen den Bewegungen. Manuelle Choreografien haben Vorrang.</p>
          <label>Bewegung<select value={preferences.avatarHipDanceModeV735??"auto"} onChange={e=>updatePreferences({avatarHipDanceModeV735:e.target.value as NonNullable<typeof preferences.avatarHipDanceModeV735>})}>
            <option value="off">Aus</option><option value="auto">Auto nach Musik</option>
            <option value="Hip_Sway">Hip_Sway – Hüftschwingen</option>
            <option value="Hip_Circle">Hip_Circle – Beckenkreisen</option>
            <option value="Hip_Bounce">Hip_Bounce – Hip-Bounce</option>
          </select></label>
          <label>Stärke ({preferences.avatarHipDanceStrengthV735??45} %)<input type="range" min="0" max="100" step="5" value={preferences.avatarHipDanceStrengthV735??45} onChange={e=>updatePreferences({avatarHipDanceStrengthV735:Number(e.target.value)})}/></label>
          <label>Tempo ({preferences.avatarHipDanceSpeedV735??100} %)<input type="range" min="50" max="200" step="5" value={preferences.avatarHipDanceSpeedV735??100} onChange={e=>updatePreferences({avatarHipDanceSpeedV735:Number(e.target.value)})}/></label>
          <fieldset><legend>Hip Motion Studio · V738</legend>
            <label>Weicher Übergang ({hipStudioV738.transitionSeconds.toFixed(2)} s)<input type="range" min="0.1" max="1.5" step="0.05" value={hipStudioV738.transitionSeconds} onChange={e=>updatePreferences({avatarHipStudioV738:{...hipStudioV738,transitionSeconds:Number(e.target.value)}})}/></label>
            <label>Hip_Sway Intensität ({hipStudioV738.swayStrength} %)<input type="range" min="0" max="150" step="5" value={hipStudioV738.swayStrength} onChange={e=>updatePreferences({avatarHipStudioV738:{...hipStudioV738,swayStrength:Number(e.target.value)}})}/></label>
            <label>Hip_Circle Intensität ({hipStudioV738.circleStrength} %)<input type="range" min="0" max="150" step="5" value={hipStudioV738.circleStrength} onChange={e=>updatePreferences({avatarHipStudioV738:{...hipStudioV738,circleStrength:Number(e.target.value)}})}/></label>
            <label>Hip_Bounce Intensität ({hipStudioV738.bounceStrength} %)<input type="range" min="0" max="150" step="5" value={hipStudioV738.bounceStrength} onChange={e=>updatePreferences({avatarHipStudioV738:{...hipStudioV738,bounceStrength:Number(e.target.value)}})}/></label>
            <label>Beat-Unterteilung<select value={hipStudioV738.rhythm} onChange={e=>updatePreferences({avatarHipStudioV738:{...hipStudioV738,rhythm:e.target.value as typeof hipStudioV738.rhythm}})}>
              <option value="half">Halftime (½)</option><option value="normal">Normal (1×)</option><option value="double">Doubletime (2×)</option>
            </select></label>
            <button type="button" onClick={()=>updatePreferences({avatarHipStudioV738:{...DEFAULT_HIP_STUDIO_V738}})}>V738 Motion Studio zurücksetzen</button>
            <small>Wird auf die V735-Grundstärke aufgerechnet und bleibt innerhalb ihrer sicheren Gelenkgrenzen. Wechsel zwischen Auto-/GLB-Priorität und Track-Seeks setzen die Überblendung zurück. Das Live-Rig nutzt weiterhin nur die bestehende Foot-IK.</small>
          </fieldset>
          <small>Beckenverschiebungen sind nur bei erkannter Fuß-IK möglich; ohne passende Bein-Ketten bleibt es bei begrenzter Rotation. Die Verformung einzelner Gesäßhälften benötigt zusätzliche Skin-Weights und ist nicht Teil dieses Updates.</small>
          <fieldset><legend>Natural Body Dynamics · V740</legend>
            <label><input type="checkbox" checked={naturalBodyV740.enabled} onChange={e=>updatePreferences({avatarNaturalBodyV740:{...naturalBodyV740,enabled:e.target.checked}})}/> Natürliche Ganzkörper-Gegenbewegung</label>
            <label>Ganzkörper-Stärke ({naturalBodyV740.strength} %)<input type="range" min="0" max="100" step="5" value={naturalBodyV740.strength} onChange={e=>updatePreferences({avatarNaturalBodyV740:{...naturalBodyV740,strength:Number(e.target.value)}})}/></label>
            <label>Arme & Schultern ({naturalBodyV740.arms} %)<input type="range" min="0" max="100" step="5" value={naturalBodyV740.arms} onChange={e=>updatePreferences({avatarNaturalBodyV740:{...naturalBodyV740,arms:Number(e.target.value)}})}/></label>
            <label>Beine & Knie ({naturalBodyV740.legs} %)<input type="range" min="0" max="100" step="5" value={naturalBodyV740.legs} onChange={e=>updatePreferences({avatarNaturalBodyV740:{...naturalBodyV740,legs:Number(e.target.value)}})}/></label>
            <small>Stützbeine und Fußgelenke werden nicht zusätzlich bewegt; Foot-IK und manuelle Choreografien behalten Vorrang. Fehlende Rig-Knochen werden übersprungen.</small>
            <button type="button" onClick={()=>updatePreferences({avatarNaturalBodyV740:{...DEFAULT_NATURAL_BODY_V740}})}>Natural Body zurücksetzen</button>
          </fieldset>
          <fieldset><legend>Natural Dance Motion 4.0 · V758</legend>
            <label><input type="checkbox" checked={naturalDanceV758.enabled} onChange={e=>updatePreferences({avatarNaturalDanceV758:{...naturalDanceV758,enabled:e.target.checked}})}/> Natürliche Gewichtsverlagerung aktivieren</label>
            {([['strength','Gesamtstärke'],['balance','Gewichtsverlagerung'],['followThrough','Oberkörper & Arme'],['transition','Weiche Übergänge']] as const).map(([key,label])=><label key={key}>{label} ({naturalDanceV758[key]} %)<input type="range" min="0" max="100" step="5" value={naturalDanceV758[key]} onChange={e=>updatePreferences({avatarNaturalDanceV758:{...naturalDanceV758,[key]:Number(e.target.value)}})}/></label>)}
            <small>Ergänzt die vorhandene Hip- und Body-Regie; einseitige Gewichtsverlagerungen nur bei bekanntem Fußkontakt. GLB-Clips, manuelle Bewegungen und die Foot-IK bleiben maßgeblich. In der Avatar-Vorschau wird derselbe Controller verwendet.</small>
            <button type="button" onClick={()=>updatePreferences({avatarNaturalDanceV758:{...DEFAULT_NATURAL_DANCE_V758}})}>V758 zurücksetzen</button>
          </fieldset>
          <fieldset><legend>Intelligent Dance Variety · V759</legend>
            <label><input type="checkbox" checked={danceVarietyV759.enabled} onChange={e=>updatePreferences({avatarDanceVarietyV759:{...danceVarietyV759,enabled:e.target.checked}})}/> Automatische Phrasenvariationen aktivieren</label>
            {([['strength','Gesamtstärke'],['variety','Motivwechsel'],['transition','Weiche Übergänge']] as const).map(([key,label])=><label key={key}>{label} ({danceVarietyV759[key]} %)<input type="range" min="0" max="100" step="5" value={danceVarietyV759[key]} onChange={e=>updatePreferences({avatarDanceVarietyV759:{...danceVarietyV759,[key]:Number(e.target.value)}})}/></label>)}
            <label>Phrasenlänge <select value={danceVarietyV759.phraseBeats} onChange={e=>updatePreferences({avatarDanceVarietyV759:{...danceVarietyV759,phraseBeats:Number(e.target.value) as 4|8|16}})}><option value="4">4 Beats</option><option value="8">8 Beats</option><option value="16">16 Beats</option></select></label>
            <small>V759 variiert nur vorhandene Bewegungen bei Verse, Hook und Drop. Kein automatisches Austauschen von GLB-Clips; manuelle Timelines, Sängersteuerung und Foot-IK bleiben geschützt. Avatar-Vorschau mit simulierten Takten.</small>
            <button type="button" onClick={()=>updatePreferences({avatarDanceVarietyV759:{...DEFAULT_DANCE_VARIETY_V759}})}>V759 zurücksetzen</button>
          </fieldset>
          <fieldset><legend>Advanced Hip & Glute Rig · V741</legend>
            <p>Optionale separate Gesäßverformung für GLB-Avatare mit benannten, tatsächlich gewichteten Glute_L/Glute_R-Knochen oder passenden Morph-Targets. Diese Einstellung erzeugt keine neuen Knochen oder Skin-Weights.</p>
            <label><input type="checkbox" checked={gluteV741.enabled} onChange={e=>updatePreferences({avatarGluteRigV741:{...gluteV741,enabled:e.target.checked}})}/> Gesäßverformung für unterstützte Avatare aktivieren</label>
            <label>Treiber<select value={gluteV741.driver} onChange={e=>updatePreferences({avatarGluteRigV741:{...gluteV741,driver:e.target.value as typeof gluteV741.driver}})}>
              <option value="auto">Auto – Morph bevorzugen, sonst gewichtete Knochen</option>
              <option value="morph">Nur vorhandene Morph-Targets</option>
              <option value="bone">Nur gewichtete Gesäßknochen</option>
            </select></label>
            <label>Verformungsstärke ({gluteV741.strength} %)<input type="range" min="0" max="100" step="5" value={gluteV741.strength} onChange={e=>updatePreferences({avatarGluteRigV741:{...gluteV741,strength:Number(e.target.value)}})}/></label>
            <label>Linke Seite ({gluteV741.left} %)<input type="range" min="0" max="100" step="5" value={gluteV741.left} onChange={e=>updatePreferences({avatarGluteRigV741:{...gluteV741,left:Number(e.target.value)}})}/></label>
            <label>Rechte Seite ({gluteV741.right} %)<input type="range" min="0" max="100" step="5" value={gluteV741.right} onChange={e=>updatePreferences({avatarGluteRigV741:{...gluteV741,right:Number(e.target.value)}})}/></label>
            <small>Standardmäßig deaktiviert. Nur bei laufenden prozeduralen Hüftbewegungen aktiv; bei Pause, Reduced Motion und manueller Choreografie neutral. Die Verfügbarkeit je Avatar steht in der 3D-Vorschau.</small>
            <button type="button" onClick={()=>updatePreferences({avatarGluteRigV741:{...DEFAULT_GLUTE_V741}})}>V741 zurücksetzen</button>
          </fieldset>
          <fieldset><legend>Genre Dance Intelligence · V742</legend>
            <p>Individuelle Hüftchoreografien für Deutschrap, Hardtekk, Hardstyle, Rock und Pop. Verse, Hook und Drop erhalten eigene Bewegungsfolgen. Wirkt nur bei Hüftbewegung „Auto“.</p>
            <label><input type="checkbox" checked={genreHipV742.enabled} onChange={e=>updatePreferences({avatarGenreHipV742:{...genreHipV742,enabled:e.target.checked}})}/> Genreabhängige Hüftchoreografie aktivieren</label>
            <label>Genre<select value={genreHipV742.style} onChange={e=>updatePreferences({avatarGenreHipV742:{...genreHipV742,style:e.target.value as typeof genreHipV742.style}})}>
              {GENRE_HIP_STYLES_V742.map(style=><option key={style} value={style}>{style==='auto'?'Auto – erkannter Musikstil':style==='deutschrap'?'Deutschrap':style==='hardtekk'?'Hardtekk':style==='hardstyle'?'Hardstyle':style==='rock'?'Rock':'Pop'}</option>)}
            </select></label>
            <label>Genre-Einfluss ({genreHipV742.strength} %)<input type="range" min="0" max="100" step="5" value={genreHipV742.strength} onChange={e=>updatePreferences({avatarGenreHipV742:{...genreHipV742,strength:Number(e.target.value)}})}/></label>
            <small>Bei unbekanntem Genre ohne manuelle Stilwahl bleibt die bisherige V735-Automatik erhalten. GLB-Clips, Fuß-IK und manuelle Choreografien haben Vorrang. Änderungen funktionieren ohne separate Animationen im GLB.</small>
            <button type="button" onClick={()=>updatePreferences({avatarGenreHipV742:{...DEFAULT_GENRE_HIP_V742}})}>V742 zurücksetzen</button>
          </fieldset>
          <fieldset><legend>Beat &amp; Bass Motion · V743</legend>
            <p>Kick-Akzente verstärken Hip_Bounce, Bass-Groove begleitet Hip_Sway und Hip_Circle. Benutzt echte Audiosignale; ohne erkennbare Signale bleibt die Bewegung unverstärkt.</p>
            <label><input type="checkbox" checked={beatBassV743.enabled} onChange={e=>updatePreferences({avatarBeatBassV743:{...beatBassV743,enabled:e.target.checked}})}/> Musikreaktive Hüftbewegungen</label>
            <label>Gesamtstärke ({beatBassV743.strength} %)<input type="range" min="0" max="100" step="5" value={beatBassV743.strength} onChange={e=>updatePreferences({avatarBeatBassV743:{...beatBassV743,strength:Number(e.target.value)}})}/></label>
            <label>Kick-Reaktion ({beatBassV743.kick} %)<input type="range" min="0" max="100" step="5" value={beatBassV743.kick} onChange={e=>updatePreferences({avatarBeatBassV743:{...beatBassV743,kick:Number(e.target.value)}})}/></label>
            <label>Bass-Groove ({beatBassV743.bass} %)<input type="range" min="0" max="100" step="5" value={beatBassV743.bass} onChange={e=>updatePreferences({avatarBeatBassV743:{...beatBassV743,bass:Number(e.target.value)}})}/></label>
            <label>Empfindlichkeit ({beatBassV743.sensitivity} %)<input type="range" min="0" max="100" step="5" value={beatBassV743.sensitivity} onChange={e=>updatePreferences({avatarBeatBassV743:{...beatBassV743,sensitivity:Number(e.target.value)}})}/></label>
            <small>Die Signale stammen aus der vorhandenen Audioanalyse (bei Mikrofonzugriff abhängig von Berechtigung und Eingang). Die Intensität ist begrenzt; Foot-IK, GLB-Clips und manuelle Choreografien haben Vorrang. Die 3D-Vorschau bietet eine getrennte, ausdrücklich simulierte Testquelle.</small>
            <button type="button" onClick={()=>updatePreferences({avatarBeatBassV743:{...DEFAULT_BEAT_BASS_V743}})}>V743 zurücksetzen</button>
          </fieldset>
          <fieldset><legend>Smart Choreography 3.0 · V744</legend>
            <p>Abwechslungsreiche Bewegungsphrasen für Verse, Hook, Build-up und Drop. Die Genre-V742-Automatik bleibt Voraussetzung; V738 übernimmt die weichen Übergänge.</p>
            <label><input type="checkbox" checked={smartHipV744.enabled} onChange={e=>updatePreferences({avatarSmartHipV744:{...smartHipV744,enabled:e.target.checked}})}/> Intelligente Hüftchoreografie aktivieren</label>
            <label>Abwechslung ({smartHipV744.variety} %)<input type="range" min="0" max="100" step="5" value={smartHipV744.variety} onChange={e=>updatePreferences({avatarSmartHipV744:{...smartHipV744,variety:Number(e.target.value)}})}/></label>
            <label>Dynamischer Spannungsbogen ({smartHipV744.dynamics} %)<input type="range" min="0" max="100" step="5" value={smartHipV744.dynamics} onChange={e=>updatePreferences({avatarSmartHipV744:{...smartHipV744,dynamics:Number(e.target.value)}})}/></label>
            <label>Bewegungsphrase<select value={smartHipV744.phraseBeats} onChange={e=>updatePreferences({avatarSmartHipV744:{...smartHipV744,phraseBeats:Number(e.target.value) as 8|16}})}><option value={8}>8 Beats – lebendig</option><option value={16}>16 Beats – ruhiger</option></select></label>
            <small>Nur bei „Auto“, aktivem V742-Genre und laufender Wiedergabe. Keine Clip-Installation erforderlich. Vorhandene GLB-Motions, manuelle Timelines und Foot-IK bleiben vorrangig.</small>
            <button type="button" onClick={()=>updatePreferences({avatarSmartHipV744:{...DEFAULT_SMART_HIP_V744}})}>V744 zurücksetzen</button>
          </fieldset>
          <fieldset><legend>Multi-Avatar Dance Sync · V745</legend>
            <p>V744-Phrasen gemeinsam tanzen, gestaffelt einsetzen oder als Lead/Background abwechseln. Hook und Drop werden gemeinsam betont. Nur für prozedurale Hüftanimationen bei mindestens zwei GLB-Performern.</p>
            <label><input type="checkbox" checked={ensembleHipV745.enabled} onChange={e=>updatePreferences({avatarEnsembleHipV745:{...ensembleHipV745,enabled:e.target.checked}})}/> Ensemble-Hüftchoreografie</label>
            <label>Ensemble-Stil <select value={ensembleHipV745.mode} onChange={e=>updatePreferences({avatarEnsembleHipV745:{...ensembleHipV745,mode:e.target.value as typeof ensembleHipV745.mode}})}>
              <option value="auto">Auto – passend zum Songabschnitt</option><option value="sync">Synchron</option><option value="stagger">Versetzte Einsätze</option><option value="call-response">Lead / Background im Wechsel</option>
            </select></label>
            <label>Lead-Avatar <select value={ensembleHipV745.leadSlot} onChange={e=>updatePreferences({avatarEnsembleHipV745:{...ensembleHipV745,leadSlot:Number(e.target.value)}})}>
              {[0,1,2,3].map(slot=><option key={slot} value={slot}>Avatar {slot+1}</option>)}
            </select></label>
            <label>Versatz <select value={ensembleHipV745.delayBeats} onChange={e=>updatePreferences({avatarEnsembleHipV745:{...ensembleHipV745,delayBeats:Number(e.target.value) as 1|2|4}})}>
              <option value={1}>1 Beat</option><option value={2}>2 Beats</option><option value={4}>4 Beats</option>
            </select></label>
            <label>Ensemble-Einfluss ({ensembleHipV745.strength} %)<input type="range" min="0" max="100" step="5" value={ensembleHipV745.strength} onChange={e=>updatePreferences({avatarEnsembleHipV745:{...ensembleHipV745,strength:Number(e.target.value)}})}/></label>
            <small>Solo, Pause, reduzierte Bewegung, manuelle Choreografien und echte GLB-Clips bleiben unverändert. Der Lead gilt für Hüftbewegungen; die Gesangsrolle wird nicht geändert. Unter Avatar-Vorschau kannst du jede Rolle einzeln prüfen.</small>
            <button type="button" onClick={()=>updatePreferences({avatarEnsembleHipV745:{...DEFAULT_ENSEMBLE_HIP_V745}})}>V745 zurücksetzen</button>
          </fieldset>
          <button type="button" onClick={()=>updatePreferences({avatarHipDanceModeV735:"auto",avatarHipDanceStrengthV735:45,avatarHipDanceSpeedV735:100})}>Hüftbewegungen zurücksetzen</button>
        </fieldset>
          <fieldset><legend>Vocal Performance 2.0 · V746</legend>
            <p>Stimmt leichte Kopf-, Brust- und Armreaktionen auf bestätigte Wort-Zeitmarken und den bestehenden Lip-Sync ab. Keine Veränderungen der Mund- oder Face-Rig-Steuerung.</p>
            <label><input type="checkbox" checked={vocalPerformanceV746.enabled} onChange={e=>updatePreferences({avatarVocalPerformanceV746:{...vocalPerformanceV746,enabled:e.target.checked}})}/> Zusätzliche Vocal-Performance</label>
            <label>Gesamtstärke ({vocalPerformanceV746.strength} %)<input type="range" min="0" max="100" step="5" value={vocalPerformanceV746.strength} onChange={e=>updatePreferences({avatarVocalPerformanceV746:{...vocalPerformanceV746,strength:Number(e.target.value)}})}/></label>
            <label>Kopfreaktion ({vocalPerformanceV746.head} %)<input type="range" min="0" max="100" step="5" value={vocalPerformanceV746.head} onChange={e=>updatePreferences({avatarVocalPerformanceV746:{...vocalPerformanceV746,head:Number(e.target.value)}})}/></label>
            <label>Oberkörper &amp; Gestik ({vocalPerformanceV746.gestures} %)<input type="range" min="0" max="100" step="5" value={vocalPerformanceV746.gestures} onChange={e=>updatePreferences({avatarVocalPerformanceV746:{...vocalPerformanceV746,gestures:Number(e.target.value)}})}/></label>
            <label>Deutschrap-Akzente ({vocalPerformanceV746.rapEmphasis} %)<input type="range" min="0" max="100" step="5" value={vocalPerformanceV746.rapEmphasis} onChange={e=>updatePreferences({avatarVocalPerformanceV746:{...vocalPerformanceV746,rapEmphasis:Number(e.target.value)}})}/></label>
            <small>Bei mehreren Avataren sind ausdrückliche Sänger-Zuordnungen notwendig. Der V745-Tanz-Lead wird nicht automatisch als Sänger behandelt. Fehlen Wort-Zeitmarken, bleiben die zusätzlichen V746-Gesten aus. Manuelle Clips, Pausen und reduzierte Bewegung haben Vorrang.</small>
            <button type="button" onClick={()=>updatePreferences({avatarVocalPerformanceV746:{...DEFAULT_VOCAL_PERFORMANCE_V746}})}>V746 zurücksetzen</button>
          </fieldset>
          <fieldset><legend>Vocal &amp; Body Synchronization 3.0 · V757</legend>
            <p>Zusätzliche Kopf-, Brust- und Armakzente an echten Wortanfängen und anhand der vorhandenen Mundaktivität. Keine neue Mundsteuerung oder automatische Stimmenidentifikation.</p>
            <label><input type="checkbox" checked={vocalBodySyncV757.enabled} onChange={e=>updatePreferences({avatarVocalBodySyncV757:{...vocalBodySyncV757,enabled:e.target.checked}})}/> Wortbasierte Vocal-Körper-Synchronisation</label>
            <label>Gesamtstärke ({vocalBodySyncV757.strength} %)<input type="range" min="0" max="100" step="5" value={vocalBodySyncV757.strength} onChange={e=>updatePreferences({avatarVocalBodySyncV757:{...vocalBodySyncV757,strength:Number(e.target.value)}})}/></label>
            <label>Kopfakzente ({vocalBodySyncV757.head} %)<input type="range" min="0" max="100" step="5" value={vocalBodySyncV757.head} onChange={e=>updatePreferences({avatarVocalBodySyncV757:{...vocalBodySyncV757,head:Number(e.target.value)}})}/></label>
            <label>Oberkörper &amp; Arme ({vocalBodySyncV757.gestures} %)<input type="range" min="0" max="100" step="5" value={vocalBodySyncV757.gestures} onChange={e=>updatePreferences({avatarVocalBodySyncV757:{...vocalBodySyncV757,gestures:Number(e.target.value)}})}/></label>
            <label>Ruhe bei schnellem Rap ({vocalBodySyncV757.rapidControl} %)<input type="range" min="0" max="100" step="5" value={vocalBodySyncV757.rapidControl} onChange={e=>updatePreferences({avatarVocalBodySyncV757:{...vocalBodySyncV757,rapidControl:Number(e.target.value)}})}/></label>
            <small>V756-Sängerrollen gelten weiterhin. Nur bestätigte Wort-Zeitmarken lösen die zusätzlichen Akzente aus; bei Zeilen-Lyrics bleibt V757 aus. Manuelle GLB-Choreografien, Pausen, reduzierte Bewegung und die vorhandene Fuß-IK haben Vorrang.</small>
            <button type="button" onClick={()=>updatePreferences({avatarVocalBodySyncV757:{...DEFAULT_VOCAL_BODY_SYNC_V757}})}>V757 zurücksetzen</button>
          </fieldset>
        <fieldset><legend>Cinematic Camera Director · V747</legend>
          <p>Ergänzt die automatische Kameraregie um Rap-Nahaufnahmen bei bestätigter Sängerrolle sowie Gruppenbilder bei verifizierten Hooks und Drops. Vorhandene Kamerapresets und Lyrics-Schutz bleiben vorrangig.</p>
          <label><input type="checkbox" checked={performanceCameraV747.enabled} onChange={e=>updatePreferences({avatarPerformanceCameraV747:{...performanceCameraV747,enabled:e.target.checked}})}/> Automatische Performance-Kamera</label>
          <label><input type="checkbox" checked={performanceCameraV747.vocalFocus} onChange={e=>updatePreferences({avatarPerformanceCameraV747:{...performanceCameraV747,vocalFocus:e.target.checked}})}/> Sängerfokus bei bestätigter Rolle</label>
          <label><input type="checkbox" checked={performanceCameraV747.groupShots} onChange={e=>updatePreferences({avatarPerformanceCameraV747:{...performanceCameraV747,groupShots:e.target.checked}})}/> Gruppenbilder bei Hook / Drop</label>
          <label>Regie-Stärke ({performanceCameraV747.strength} %)<input type="range" min="0" max="100" step="5" value={performanceCameraV747.strength} onChange={e=>updatePreferences({avatarPerformanceCameraV747:{...performanceCameraV747,strength:Number(e.target.value)}})}/></label>
          <label>Weiche Einblendung ({performanceCameraV747.transitionMs} ms)<input type="range" min="450" max="2500" step="50" value={performanceCameraV747.transitionMs} onChange={e=>updatePreferences({avatarPerformanceCameraV747:{...performanceCameraV747,transitionMs:Number(e.target.value)}})}/></label>
          <small>Ohne bestätigte Sängerzuordnung keine neue Sänger-Nahaufnahme. Ohne verifizierte Songabschnitte keine neuen Hook-/Drop-Einstellungen. Manuelle Kamerafahrten, Editor, reduzierte Bewegung und geschützte Lyrics haben Vorrang. Die vollständige Besetzung bleibt im überprüften Bild.</small>
          <button type="button" onClick={()=>updatePreferences({avatarPerformanceCameraV747:{...DEFAULT_PERFORMANCE_CAMERA_V747}})}>V747 zurücksetzen</button>
        </fieldset>
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
          <VocalStemLabV643/>
          <PhonemeTimelineLabV644/>
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
        <fieldset><legend>V748 · Lyrics Performance Studio</legend>
          <label className="setting-check"><input type="checkbox" checked={lyricsPerformanceV748.enabled} onChange={e=>updatePreferences({lyricsPerformanceV748:{...lyricsPerformanceV748,enabled:e.target.checked}})}/> Zusätzliche Lyrics-Inszenierung aktivieren</label>
          <label>Gesamtstärke ({lyricsPerformanceV748.strength} %)<input type="range" min="0" max="100" step="5" value={lyricsPerformanceV748.strength} onChange={e=>updatePreferences({lyricsPerformanceV748:{...lyricsPerformanceV748,strength:Number(e.target.value)}})}/></label>
          <label>Lesbarkeit / Kontrast ({lyricsPerformanceV748.readability} %)<input type="range" min="0" max="100" step="5" value={lyricsPerformanceV748.readability} onChange={e=>updatePreferences({lyricsPerformanceV748:{...lyricsPerformanceV748,readability:Number(e.target.value)}})}/></label>
          <label>Wortakzente ({lyricsPerformanceV748.wordAccent} %)<input type="range" min="0" max="100" step="5" value={lyricsPerformanceV748.wordAccent} onChange={e=>updatePreferences({lyricsPerformanceV748:{...lyricsPerformanceV748,wordAccent:Number(e.target.value)}})}/></label>
          <label>Hook-/Drop-Akzente ({lyricsPerformanceV748.hookAccent} %)<input type="range" min="0" max="100" step="5" value={lyricsPerformanceV748.hookAccent} onChange={e=>updatePreferences({lyricsPerformanceV748:{...lyricsPerformanceV748,hookAccent:Number(e.target.value)}})}/></label>
          <small>Wortakzente nur mit verifizierten Wortzeiten. Hook-Akzente nur bei vorhandenen Songabschnitt-Signalen; kein erfundener Lyrics-Takt. Lesbarkeitsbegrenzungen gelten auch bei deaktivierter Bewegung.</small>
        </fieldset>
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
      {tab === "diagnostics" && <><PerformanceControlCenterV261 /><PerformanceSessionAnalyzerV262 /><RenderDiagnosticsPanel /><PerformanceMemoryDashboardV770 /><LongRunStabilitySettingsV355 /><LongSessionMonitoringPanel /><AvatarFrameProfilerPanel /><LodContinuityDiagnosticsPanel /><AvatarAssetOptimizationStudio /><PerformanceBenchmark /><AudioDebugPanel /></>}
      {tab === "display" && <label className="setting-check"><input type="checkbox" checked={preferences.reducedMotion} onChange={e => updatePreferences({ reducedMotion: e.target.checked })}/> Reduce motion</label>}
      {tab === "display" && <><PortableBackupV657 /><UnifiedSettingsBackup /><BackupMigrationAssistant /><BackupIntegrityDiagnostics /></>}
      {tab === "display" && <p className="settings-note">Without microphone, beat timing is synthetic and based on a genre tempo estimate, not actual Spotify beat data. With microphone, frequency analysis runs locally in your browser. Your preferences are saved on this device.</p>}
      {tab === "display" && <button className="settings-reset" onClick={() => { setMicrophone(false); updatePreferences({ rapExpressiveEnabledV425:false,rapExpressiveStrengthV425:65,rapDuetEnabledV416:false,rapDuetCameraV416:true,rapLyricsGestureEnabledV414:false,avatarRapLipEnabledV415:false,avatarRapLipPrecisionV415:70,avatarRapLipOffsetMsV415:0,avatarRapSyllableEnabledV419:false,avatarRapSyllableStrengthV419:65,avatarRapSyllableSmoothnessV419:70,rapSyllableEditsEnabledV420:false,rapAudioEnabledV423:false,rapAudioStrengthV423:45,rapAudioOffsetMsV423:0, visualizerMode: "avatar", lyricsVisible: true, avatarLipSyncEnabled: true, avatarLipSyncStrength: 90, rapPerformanceEditorV408:{enabled:false,head:100,gestures:100,verse:100,hook:100,kick:100,snare:100,lipSync:100}, avatarLipSyncMode: "lyrics", avatarVocalStyleV368:"auto", avatarFacialExpressionV368:55,avatarJawFollowV369:65,avatarFacialProfilesV370:{},avatarVocalCameraV369:"auto",avatarVocalCameraStrengthV369:55,avatarVocalBodyEnabledV371:true,avatarVocalBodyStrengthV371:60,avatarVocalEyeContactV371:true,avatarVocalGesturesV371:true, avatarVocalCoordinationEnabledV372:true,avatarVocalCoordinationStrengthV372:70,avatarVocalCoordinationOffsetMsV372:0,avatarVocalPerformanceModeV393:"off",avatarVocalPerformanceStrengthV393:55, avatarAdaptivePerformanceModeV375:"off",avatarAdaptivePerformanceStrengthV375:65,avatarVocalDuetModeV376:"off",avatarVocalDuetStrengthV376:60, avatarConcertDirectorModeV386:"off",avatarConcertDirectorStrengthV386:65,avatarConcertDirectorCameraV386:true,avatarConcertDirectorLightingV386:true,avatarVocalCameraModeV401:"off",avatarVocalCameraStrengthV401:55,avatarVisualDirectorModeV397:"off",avatarVisualDirectorStrengthV397:65,avatarCameraStudioV398:{enabled:false,holdMs:1150,scenes:{verse:{shot:"auto",distance:50,pan:0},hook:{shot:"auto",distance:50,pan:0},drop:{shot:"auto",distance:50,pan:0}}},avatarUnifiedModeV402:"off",avatarUnifiedStrengthV402:70,avatarUnifiedCameraV402:true,avatarUnifiedLightingV402:true,avatarUnifiedDanceV402:true,avatarUnifiedVocalV402:true,avatarExperienceModeV396:"off",avatarExperienceStrengthV396:65,avatarFestivalModeV394:"off",avatarFestivalStrengthV394:70,avatarFestivalCameraV394:true,avatarFestivalLightingV394:true,avatarFestivalAtmosphereV394:true,avatarFestivalLasersV394:false,avatarShowModeV387:"off",avatarShowStrengthV387:70,avatarShowCameraV387:true,avatarShowLightingV387:true,avatarShowAtmosphereV387:true,avatarManualVocalEnabledV385:false,avatarManualVocalCameraV385:true,avatarVocalAssignmentsV385:{}, avatarDuetCameraModeV377:"off",avatarDuetCameraStrengthV377:65,avatarLyricsCameraModeV378:"off",avatarLyricsCameraStrengthV378:70,avatarLyricsContrastV378:true, lyricsFocusMode: true, lyricsStyle: "kinetic", lyricsAnimationIntensity: 65, lyricsKineticPresetV382:"auto", lyricsKineticStrengthV382:65, lyricsKineticDropsV382:true, lyricsBeatReactive: true, lyricsReactiveIntensity: 60, lyricsKickReactive: true, lyricsBassReactive: true, lyricsDropReactive: true, lyricsWordHighlight: true, lyricsFontSize: 100, lyricsFontFamilyV379: "system", lyricsPosition: "center", lyricsGlow: 65, lyricsGradientFrom: "#79f7ff", lyricsGradientTo: "#d789ff", lyricsAnimationSpeed: 100, lyricsOffsetMs: 0, lyricsImmersiveEnabled: false, lyricsImmersiveSide: "right", lyricsImmersiveDepth: 45, reducedMotion: false, avatarModelId: "procedural", avatarScale: 1, avatarOffsetY: 0, avatarAnimationIntensity: 1, danceAggression: 0.5, danceVariation: 0.5, danceMotionStyle: "balanced", avatarMotionMode: "hybrid", avatarClipSpeed: 1, avatarCrossfadeSeconds: 0.35, avatarArmResponse: 1, avatarLegResponse: 1, avatarRigProfile: "auto", avatarDancePreset: "auto", autoAvatarByGenre: false, beatSensitivity: 1, beatCooldownMs: 180, beatSyncMode: "off", beatSyncOffsetMs: 0 }); }}>Reset preferences</button>}
      </div></div>
    </section>}
  </aside>;
}
