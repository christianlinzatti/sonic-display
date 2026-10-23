"use client";
import { useAudioAnalysis } from "@/context/AudioAnalysisContext";
import { useUiPreferences } from "@/context/UiPreferencesContext";
import { DEFAULT_RAP_GROOVE, rapGroovePose, type RapGrooveMode, type RapGrooveSettings } from "./rapGrooveEngine";
import { useMusic } from "@/context/MusicContext";
export function RapFlowBeatGrooveStudio(){
 const {preferences,updatePreferences}=useUiPreferences();const {metrics,active}=useAudioAnalysis();const {genre}=useMusic();
 const settings=preferences.rapGroove??DEFAULT_RAP_GROOVE;
 const set=(patch:Partial<RapGrooveSettings>)=>updatePreferences({rapGroove:{...settings,...patch}});
 const pose=rapGroovePose(metrics,0,settings,genre,true,false);
 return <fieldset><legend>Full Body Rap Dance Intelligence · V112</legend>
 <p>Für Deutschrap, Hip-Hop und Trap: Head-Nod auf den Beat, Snare-Akzente und dezentes Halftime-Bouncing mit Hüftarbeit, Fußschritten und Gewichtsverlagerung. Nutzt die bestehende Audioanalyse, ohne echte Vocal-/Flow-Erkennung vorzutäuschen.</p>
 <label className="setting-check"><input type="checkbox" checked={settings.enabled} onChange={e=>set({enabled:e.target.checked})}/> Live-Rap-Groove aktivieren</label>
 <label>Rhythmusprofil <select value={settings.mode} onChange={e=>set({mode:e.target.value as RapGrooveMode})}>{["auto","boom-bap","trap","halftime","doubletime"].map(v=><option key={v} value={v}>{v}</option>)}</select></label>
 <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))",gap:12}}>
 {([['head','Head-Nod'],['shoulders','Schultern / Arme'],['bounce','Bounce'],['snare','Snare-Akzent'],['hips','Hüft-Groove'],['steps','Fußarbeit'],['weight','Gewichtsverlagerung']] as const).map(([key,label])=><label key={key}>{label}: {Math.round((settings[key]??DEFAULT_RAP_GROOVE[key]??0)*100)} %<input type="range" min="0" max="100" value={Math.round((settings[key]??DEFAULT_RAP_GROOVE[key]??0)*100)} onChange={e=>set({[key]:Number(e.target.value)/100})}/></label>)}
 </div><p><small>Aktuell: {genre??"kein Genre"} · {active?"Mikrofon aktiv":"kein echtes Audiosignal"} · geschätzter Rhythmus: {pose.mode} · BPM: {metrics.bpm??"–"}. Bei deaktivierter Audioanalyse sind nur synthetische/andere vorhandene Signale verfügbar.</small></p>
 <button type="button" onClick={()=>set(DEFAULT_RAP_GROOVE)}>Zurücksetzen</button>
 </fieldset>;
}
