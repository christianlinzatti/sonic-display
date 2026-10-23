"use client";
import {useEffect,useState} from 'react';
import {getRuleV334,readSchedulerV334,saveSchedulerV334,SCHEDULER_EVENT_V334,SECTIONS_V334,SOURCES_V334,type RuleV334,type SchedulerV334} from '@/services/stageContent/schedulerV334';
import {readLayoutV333,SCREEN_LAYOUT_EVENT_V333} from '@/services/stageContent/layoutV333';
const names:Record<string,string>={canvas:'Spotify Canvas',cover:'Albumcover',text:'API-Texte',photos:'Künstlerfotos',concerts:'Konzerttermine',verse:'Verse',hook:'Hook',drop:'Drop',build:'Build-up',break:'Break'};
export function StageContentSchedulerSettingsV334(){
 const [settings,setSettings]=useState(readSchedulerV334);
 const [layout,setLayout]=useState(readLayoutV333);
 const [screenId,setScreenId]=useState('main');
 useEffect(()=>{const load=()=>setSettings(readSchedulerV334()),loadLayout=()=>setLayout(readLayoutV333());window.addEventListener(SCHEDULER_EVENT_V334,load);window.addEventListener(SCREEN_LAYOUT_EVENT_V333,loadLayout);
 return()=>{window.removeEventListener(SCHEDULER_EVENT_V334,load);window.removeEventListener(SCREEN_LAYOUT_EVENT_V333,loadLayout);};},[]);
 const commit=(next:SchedulerV334)=>setSettings(saveSchedulerV334(next));
 const update=(source:typeof SOURCES_V334[number],patch:Partial<RuleV334>)=>{
  const rule={...getRuleV334(settings,screenId,source),...patch};
  commit({...settings,screens:{...settings.screens,[screenId]:{...settings.screens[screenId],[source]:rule}}});
 };
 return <fieldset className="stage-content-config-v330" style={{marginTop:16}}>
  <legend>V334 – Intelligent Content Scheduling</legend>
  <p>Pro Leinwand steuern, welcher Inhalt wann und wie oft erscheint. Die Prioritäten gewichten die Rotation, ohne Quellen niedriger Priorität auszuschließen. Push-Verhalten bleibt separat im V333-Editor einstellbar.</p>
  <label className="setting-check"><input type="checkbox" checked={settings.enabled} onChange={e=>commit({...settings,enabled:e.target.checked})}/><strong>Intelligente Inhaltsverteilung aktivieren</strong></label>
  <label>Leinwand<select value={screenId} onChange={e=>setScreenId(e.target.value)}>{layout.screens.map(screen=><option key={screen.id} value={screen.id}>{screen.label}</option>)}</select></label>
  {SOURCES_V334.map(source=>{const rule=getRuleV334(settings,screenId,source);return <fieldset key={source} style={{marginTop:8}}>
   <legend>{names[source]}</legend>
   <label className="setting-check"><input type="checkbox" checked={rule.enabled} onChange={e=>update(source,{enabled:e.target.checked})}/> Quelle bei automatischer Planung verwenden</label>
   <label>Priorität ({rule.priority})<input type="range" min="0" max="3" step="1" value={rule.priority} onChange={e=>update(source,{priority:Number(e.target.value)})}/></label>
   <label>Anzeigedauer ({rule.durationSeconds} Sekunden)<input type="range" min="3" max="120" step="1" value={rule.durationSeconds} onChange={e=>update(source,{durationSeconds:Number(e.target.value)})}/></label>
   <div><strong>Songabschnitte</strong><div style={{display:'flex',flexWrap:'wrap',gap:10,marginTop:6}}>{SECTIONS_V334.map(section=><label key={section} className="setting-check"><input type="checkbox" checked={rule.sections.includes(section)} onChange={e=>update(source,{sections:e.target.checked?[...rule.sections,section]:rule.sections.filter(s=>s!==section)})}/>{names[section]}</label>)}</div></div>
  </fieldset>})}
  <button type="button" onClick={()=>commit({enabled:false,screens:{}})}>Scheduler-Regeln zurücksetzen</button>
  <small>Nur bereits geladene Inhalte werden eingeplant. Eine Quelle ohne API-Antwort oder ohne gültigen Songabschnitt wird übersprungen. Bei deaktiviertem Scheduler bleibt V333 unverändert.</small>
 </fieldset>;
}
