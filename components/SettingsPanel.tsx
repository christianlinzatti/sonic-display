"use client";
import { useState } from "react";
import { useUiPreferences } from "@/context/UiPreferencesContext";
import { useAudioAnalysis } from "@/context/AudioAnalysisContext";
import { avatarModels } from "@/components/visualizer/avatarModels";

export function SettingsPanel() {
  const [open, setOpen] = useState(false);
  const { preferences, updatePreferences } = useUiPreferences();
  const { setEnabled } = useAudioAnalysis();
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
      <label>Avatar model<select value={preferences.avatarModelId} onChange={e => updatePreferences({ avatarModelId: e.target.value })}>{avatarModels.map(model => <option key={model.id} value={model.id}>{model.label}</option>)}</select></label>
      <label className="setting-check"><input type="checkbox" checked={preferences.lyricsVisible} onChange={e => updatePreferences({ lyricsVisible: e.target.checked })}/> Show lyrics</label>
      <label className="setting-check"><input type="checkbox" checked={preferences.microphoneEnabled} onChange={e => setMicrophone(e.target.checked)}/> Enable microphone analysis</label>
      <label className="setting-check"><input type="checkbox" checked={preferences.reducedMotion} onChange={e => updatePreferences({ reducedMotion: e.target.checked })}/> Reduce motion</label>
      <p className="settings-note">Microphone access is processed locally in your browser. Your preferences are saved on this device.</p>
      <button className="settings-reset" onClick={() => { setMicrophone(false); updatePreferences({ visualizerMode: "avatar", lyricsVisible: true, reducedMotion: false, avatarModelId: "procedural" }); }}>Reset preferences</button>
    </section>}
  </aside>;
}
