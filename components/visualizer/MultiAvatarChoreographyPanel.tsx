"use client";
import {useEffect,useState} from "react";
import {EnsemblePerformanceControlsV392} from "./EnsemblePerformanceControlsV392";
import {MultiAvatarStageStudioV326} from "./MultiAvatarStageStudioV326";
import {EnsembleChoreographyStudioV325} from "./EnsembleChoreographyStudioV325";
import {AdaptiveEnsembleBalanceControlsV324} from "./AdaptiveEnsembleBalanceControlsV324";
import {DEFAULT_MULTI_AVATAR_SETTINGS,readMultiAvatarSettings,saveMultiAvatarSettings,type MultiAvatarSettings} from "./multiAvatarChoreography";
export function MultiAvatarChoreographyPanel(){
  const [s,setS]=useState<MultiAvatarSettings>(DEFAULT_MULTI_AVATAR_SETTINGS);
  useEffect(()=>setS(readMultiAvatarSettings()),[]);
  const edit=(patch:Partial<MultiAvatarSettings>)=>setS(saveMultiAvatarSettings({...s,...patch}));
  return <fieldset className="multi-avatar-controls"><legend>V274 – Multi-Avatar Interaction Studio</legend>
    <label className="setting-check"><input type="checkbox" checked={s.enabled} onChange={e=>edit({enabled:e.target.checked})}/> Gemeinsamen Choreografie-Director aktivieren (zwei Avatare)</label>
    <p>Gemeinsame Taktzählung, Lead-/Background-Rollen und Formationswechsel für beide Tänzer; automatische Wechsel zwischen Lead-Solo, Partner-Solo und gemeinsamen Passagen. Hat bei Aktivierung Vorrang vor V141 Duo-Automatik.</p>
    <label className="setting-check"><input type="checkbox" checked={s.smartInteraction === true} onChange={e=>edit({smartInteraction:e.target.checked})}/> V274: Intelligente musikalische Interaktionen (Solo, Duo, Formation)</label>
    <p>Wenn aktiviert, richten sich Rollen und Formation an geschätzten Verse-, Hook-, Build-up- und Drop-Signalen aus. Wechsel erfolgen stabilisiert und ohne neue Avatar-Downloads.</p>
    <label>Choreografie-Muster<select value={s.pattern} onChange={e=>edit({pattern:e.target.value as MultiAvatarSettings["pattern"]})}><option value="alternating">Abwechselnde Solos</option><option value="call-response">Call & Response + gemeinsam</option><option value="unison">Durchgehend synchron</option></select></label>
    <label>Takte je Abschnitt ({s.barsPerPart})<input type="range" min="1" max="16" value={s.barsPerPart} onChange={e=>edit({barsPerPart:Number(e.target.value)})}/></label>
    <label>Solo-Kontrast ({Math.round(s.soloEmphasis*100)} %)<input type="range" min="0" max="100" step="5" value={s.soloEmphasis*100} onChange={e=>edit({soloEmphasis:Number(e.target.value)/100})}/></label>
    <label className="setting-check"><input type="checkbox" checked={s.dropTogether} onChange={e=>edit({dropTogether:e.target.checked})}/> Gemeinsame Bewegungsakzente bei starken Drops</label>
    <button type="button" onClick={()=>edit(DEFAULT_MULTI_AVATAR_SETTINGS)}>V206 auf Standard zurücksetzen</button>
    <small>Die Synchronisation basiert auf geschätzten BPM und Kick-/Energiewerten. Der Director steuert zwei gleichzeitig geladene Charaktere, keine beliebig große Gruppe. V230 ergänzt Diagonal-/Breit-Formationen und versetzte Partner-Gesten.</small>
  <EnsemblePerformanceControlsV392 /><AdaptiveEnsembleBalanceControlsV324 /><EnsembleChoreographyStudioV325 /><MultiAvatarStageStudioV326 /></fieldset>;
}
