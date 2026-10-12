"use client";
import { upload } from "@vercel/blob/client";
import { useEffect, useRef, useState } from "react";
import { useUiPreferences } from "@/context/UiPreferencesContext";
import { useAudioAnalysis } from "@/context/AudioAnalysisContext";
import { avatarModels, getAvatarModel } from "@/components/visualizer/avatarModels";
import type { AvatarModel } from "@/components/visualizer/avatarModels";
import { AvatarEditor } from "@/components/visualizer/AvatarEditor";
import { AudioDebugPanel } from "@/components/visualizer/AudioDebugPanel";
import { BeatCalibrationAssistant } from "@/components/visualizer/BeatCalibrationAssistant";
import { avatarRigProfiles } from "@/components/visualizer/avatarRigProfiles";
import { avatarDancePresets } from "@/components/visualizer/avatarDancePresets";
import { DancePresetStudio } from "@/components/visualizer/DancePresetStudio";
import { AvatarPreview3D } from "@/components/visualizer/AvatarPreview3D";

export function SettingsPanel() {
  const [open, setOpen] = useState(false);
  const [admin, setAdmin] = useState(false);
  const [adminConfigured, setAdminConfigured] = useState(true);
  const [adminPassword, setAdminPassword] = useState("");
  const [adminError, setAdminError] = useState("");
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const refreshAdmin = async () => { try {const r=await fetch("/api/admin",{cache:"no-store"});const d=await r.json();setAdmin(d.authenticated===true);setAdminConfigured(d.configured===true);}catch{setAdmin(false);} };
  const login = async () => {const r=await fetch("/api/admin",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({password:adminPassword})});const d=await r.json();if(!r.ok){setAdminError(d.error||"Login fehlgeschlagen");return;}setAdmin(true);setAdminPassword("");setAdminError("");};
  const logout = async () => {await fetch("/api/admin",{method:"DELETE"});setAdmin(false);};
  const uploadAvatar = async () => {if(!uploadFile||!admin)return;setUploading(true);setAdminError("");try {if(!/\.glb$/i.test(uploadFile.name))throw Error("Bitte GLB-Datei auswählen");const base=uploadFile.name.replace(/\.glb$/i,"").replace(/[^a-zA-Z0-9_-]/g,"-").slice(0,60)||"avatar";const name=`${base}-${crypto.randomUUID().slice(0,8)}.glb`;const result=await upload(`sonic/models/${name}`,uploadFile,{access:"public",handleUploadUrl:"/api/avatars/upload",contentType:"model/gltf-binary"});if(!result.url)throw Error("Upload fehlgeschlagen");await refreshLibrary();setUploadFile(null);setAdminError("Avatar hochgeladen: "+name);}catch(e){setAdminError(e instanceof Error?e.message:"Upload fehlgeschlagen");}finally{setUploading(false);}};
  const uploadPreview = async () => {if(!previewFile||!admin)return;setUploading(true);try{const ext=previewFile.name.split(".").pop()?.toLowerCase();if(!ext||!["png","jpg","jpeg","webp"].includes(ext))throw Error("PNG/JPG/WebP erforderlich");const blob=await upload(`sonic/previews/${crypto.randomUUID()}.${ext}`,previewFile,{access:"public",handleUploadUrl:"/api/avatars/upload"});setAvatarDraft(v=>({...v,preview:blob.url}));setPreviewFile(null);}catch(e){setAdminError(e instanceof Error?e.message:"Vorschaubild-Upload fehlgeschlagen");}finally{setUploading(false);}};

  const [search, setSearch] = useState("");
  const [localModels, setLocalModels] = useState<AvatarModel[]>([]);
  const [avatarFilter, setAvatarFilter] = useState("");
  const [editingModel, setEditingModel] = useState<string | null>(null);
  const [avatarDraft, setAvatarDraft] = useState({ label: "", description: "", preview: "", genre: "", tags: "", category: "", favorite: false, defaultDancePreset: "auto" });
  const [savingAvatar, setSavingAvatar] = useState(false);
  const [avatarSaveMessage, setAvatarSaveMessage] = useState<string | null>(null);
  const editAvatar = (model: AvatarModel) => {
    setEditingModel(model.id);
    setAvatarSaveMessage(null);
    setAvatarDraft({ label: model.label, description: model.description, preview: model.preview ?? "", genre: (model.genre ?? []).join(", "), tags: (model.tags ?? []).join(", "), category: model.category ?? "Eigene Modelle", favorite: model.favorite ?? false, defaultDancePreset: model.defaultDancePreset ?? "auto" });
  };
  const saveAvatar = async () => {
    if (!editingModel?.startsWith("local:") || savingAvatar) return;
    setSavingAvatar(true);
    setAvatarSaveMessage(null);
    try {
      const response = await fetch("/api/avatars/config", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ filename: editingModel.slice(6), metadata: { ...avatarDraft, genre: avatarDraft.genre.split(",").map(v => v.trim()).filter(Boolean), tags: avatarDraft.tags.split(",").map(v => v.trim()).filter(Boolean) } }) });
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
      const data: { models?: AvatarModel[] } = await response.json();
      setLocalModels(Array.isArray(data.models) ? data.models : []);
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
  const currentAvatar = localModels.find(model => model.id === preferences.avatarModelId) ?? getAvatarModel(preferences.avatarModelId);
  const libraryModels = [...avatarModels, ...localModels].filter(model => {
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
      <div className="settings-workspace">
      <aside className="settings-sidebar">
        <label className="settings-search-label" htmlFor="settings-search">Einstellungen suchen</label>
        <input id="settings-search" ref={searchRef} className="settings-search" type="search" placeholder="z. B. Beat, Avatar, Lyrics…" value={search} onChange={e => setSearch(e.target.value)} />
        <nav className="settings-tabs" aria-label="Einstellungsbereiche">
          {filteredSections.map(section => <button type="button" key={section.id} className={tab === section.id ? "active" : ""} aria-current={tab === section.id ? "page" : undefined} onClick={() => setTab(section.id)}>{section.label}<span aria-hidden="true">›</span></button>)}
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
        <AvatarPreview3D modelUrl={currentAvatar.url} preferences={preferences} />
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
        <div className="avatar-library-edit-actions">{localModels.map(model => admin && <button key={model.id} type="button" onClick={() => editAvatar(model)}>✎ {model.label} bearbeiten</button>)}</div>
        {admin && editingModel && <form className="avatar-metadata-editor" onSubmit={event => { event.preventDefault(); void saveAvatar(); }}>
          <h3>Avatar bearbeiten: {editingModel.slice(6)}</h3>
          <label>Name<input maxLength={100} value={avatarDraft.label} onChange={e => setAvatarDraft(v => ({ ...v, label: e.target.value }))}/></label>
          <label>Beschreibung<textarea maxLength={500} value={avatarDraft.description} onChange={e => setAvatarDraft(v => ({ ...v, description: e.target.value }))}/></label>
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
        {libraryModels.length === 0 && (
          <small>Keine Modelle für diesen Filter gefunden.</small>
        )}
        {localModels.length === 0 && !libraryLoading && <small>Lege z. B. <code>robot.glb</code> in <code>public/avatars/</code> ab und klicke „Modelle neu laden“. Externe Texturen bei .gltf müssen ebenfalls vorhanden sein.</small>}
      </fieldset>
      <fieldset><legend>Avatar tuning</legend>
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
      {tab === "display" && <label className="setting-check"><input type="checkbox" checked={preferences.lyricsVisible} onChange={e => updatePreferences({ lyricsVisible: e.target.checked })}/> Show lyrics</label>}
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
      {tab === "diagnostics" && <AudioDebugPanel />}
      {tab === "display" && <label className="setting-check"><input type="checkbox" checked={preferences.reducedMotion} onChange={e => updatePreferences({ reducedMotion: e.target.checked })}/> Reduce motion</label>}
      {tab === "display" && <p className="settings-note">Without microphone, beat timing is synthetic and based on a genre tempo estimate, not actual Spotify beat data. With microphone, frequency analysis runs locally in your browser. Your preferences are saved on this device.</p>}
      {tab === "display" && <button className="settings-reset" onClick={() => { setMicrophone(false); updatePreferences({ visualizerMode: "avatar", lyricsVisible: true, reducedMotion: false, avatarModelId: "procedural", avatarScale: 1, avatarOffsetY: 0, avatarAnimationIntensity: 1, danceAggression: 0.5, danceVariation: 0.5, danceMotionStyle: "balanced", avatarRigProfile: "auto", avatarDancePreset: "auto", autoAvatarByGenre: false, beatSensitivity: 1, beatCooldownMs: 180, beatSyncMode: "off", beatSyncOffsetMs: 0 }); }}>Reset preferences</button>}
      </div></div>
    </section>}
  </aside>;
}
