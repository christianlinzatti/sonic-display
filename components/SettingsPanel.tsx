"use client";
import { useState } from "react";
import { useUiPreferences } from "@/context/UiPreferencesContext";
import { useAudioAnalysis } from "@/context/AudioAnalysisContext";
import { avatarModels } from "@/components/visualizer/avatarModels";
import { AvatarEditor } from "@/components/visualizer/AvatarEditor";
import { AudioDebugPanel } from "@/components/visualizer/AudioDebugPanel";
import { BeatCalibrationAssistant } from "@/components/visualizer/BeatCalibrationAssistant";
import { avatarRigProfiles } from "@/components/visualizer/avatarRigProfiles";
import { avatarDancePresets } from "@/components/visualizer/avatarDancePresets";
import { DancePresetStudio } from "@/components/visualizer/DancePresetStudio";

export function SettingsPanel() {
  const [open, setOpen] = useState(false);
  const { preferences, updatePreferences } = useUiPreferences();
  const { setEnabled, syncOffsetMs, syncConfidence, syncStatus } = useAudioAnalysis();
  const setMicrophone = (enabled: boolean) => {
    updatePreferences({ microphoneEnabled: enabled });
    setEnabled(enabled);
  };
  return <aside className="settings-panel">
    <button className="settings-trigger" aria-expanded={open} onClick={() => setOpen(v => !v)}>⚙ Settings</button>
    {open && <section className="settings-popover" aria-label="Display settings">
      <header><strong>Display settings</strong><button className="settings-close" onClick={() => setOpen(false)} aria-label="Close settings">×</button></header>
      <label>Visualizer<select value={preferences.visualizerMode} onChange={e => updatePreferences({ visualizerMode: e.target.value as typeof preferences.visualizerMode })}>
        <option value="wave">Waveform</option><option value="particles">Particles</option><option value="album-glow">Album glow</option><option value="avatar">Avatar</option>
      </select></label>
      <fieldset className="avatar-library"><legend>Avatar library</legend><div className="avatar-library-grid">{avatarModels.map(model => {
        const available = model.id === "procedural" || Boolean(model.url);
        return <button type="button" key={model.id} className={`avatar-card ${preferences.avatarModelId === model.id ? "selected" : ""}`} aria-pressed={preferences.avatarModelId === model.id} disabled={!available} onClick={() => updatePreferences({ avatarModelId: model.id })}>
          <img src={model.preview ?? "/avatars/default-preview.svg"} alt="" width="96" height="72" /><strong>{model.label}</strong><small>{available ? model.description : "Set model URL in environment"}</small>
        </button>;
      })}</div></fieldset>
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
      <label className="setting-check"><input type="checkbox" checked={preferences.lyricsVisible} onChange={e => updatePreferences({ lyricsVisible: e.target.checked })}/> Show lyrics</label>
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
      <AudioDebugPanel />
      <label className="setting-check"><input type="checkbox" checked={preferences.reducedMotion} onChange={e => updatePreferences({ reducedMotion: e.target.checked })}/> Reduce motion</label>
      <p className="settings-note">Without microphone, beat timing is synthetic and based on a genre tempo estimate, not actual Spotify beat data. With microphone, frequency analysis runs locally in your browser. Your preferences are saved on this device.</p>
      <button className="settings-reset" onClick={() => { setMicrophone(false); updatePreferences({ visualizerMode: "avatar", lyricsVisible: true, reducedMotion: false, avatarModelId: "procedural", avatarScale: 1, avatarOffsetY: 0, avatarAnimationIntensity: 1, danceAggression: 0.5, danceVariation: 0.5, danceMotionStyle: "balanced", avatarRigProfile: "auto", avatarDancePreset: "auto", autoAvatarByGenre: false, beatSensitivity: 1, beatCooldownMs: 180, beatSyncMode: "off", beatSyncOffsetMs: 0 }); }}>Reset preferences</button>
    </section>}
  </aside>;
}
