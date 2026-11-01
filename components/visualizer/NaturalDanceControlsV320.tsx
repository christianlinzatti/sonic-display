'use client';
import {useEffect,useState} from 'react';
import {DEFAULT_NATURAL_DANCE_V320,NATURAL_DANCE_EVENT_V320,refreshNaturalDanceV320,writeNaturalDanceV320,type NaturalDanceSettingsV320} from './naturalDanceIntelligenceV320';
import {DEFAULT_DANCE_FLOW_V391,DANCE_FLOW_EVENT_V391,refreshDanceFlowV391,writeDanceFlowV391,type DanceFlowSettingsV391} from './naturalDanceIntelligenceV391';
import type {DanceQualityStyle} from './danceQualityV307';
import {DEFAULT_NATURAL_DANCE_MOTION_V545,NATURAL_DANCE_MOTION_EVENT_V545,refreshNaturalDanceMotionV545,writeNaturalDanceMotionV545,type NaturalDanceMotionSettingsV545} from './naturalDanceMotionV545';
import {DEFAULT_STAGE_BLOCKING_V840,STAGE_BLOCKING_EVENT_V840,refreshStageBlockingV840,writeStageBlockingV840,type StageBlockingSettingsV840} from './dynamicPerformerStageBlockingV840';
import {DEFAULT_NATURAL_FOOTWORK_V839,NATURAL_FOOTWORK_EVENT_V839,refreshNaturalFootworkV839,writeNaturalFootworkV839,type NaturalFootworkSettingsV839} from './naturalDanceFootworkV839';
import {DEFAULT_GROUNDING_SETTINGS_V665,GROUNDING_SETTINGS_EVENT_V665,refreshGroundingSettingsV665,writeGroundingSettingsV665,type RealisticGroundingSettingsV665} from './realisticDanceGroundingV665';
import {DEFAULT_GENRE_DANCE_SETTINGS_V666,GENRE_DANCE_SETTINGS_EVENT_V666,refreshGenreDanceSettingsV666,writeGenreDanceSettingsV666,type GenreDanceSettingsV666,type DanceStyleV666} from './genreDancePerformanceV666';

export function NaturalDanceControlsV320(){
  const [blocking840,setBlocking840]=useState<StageBlockingSettingsV840>(DEFAULT_STAGE_BLOCKING_V840);
  const [blockingStatus840,setBlockingStatus840]=useState('');
  useEffect(()=>{const sync=()=>setBlocking840(refreshStageBlockingV840());sync();
    window.addEventListener(STAGE_BLOCKING_EVENT_V840,sync);window.addEventListener('storage',sync);
    return()=>{window.removeEventListener(STAGE_BLOCKING_EVENT_V840,sync);window.removeEventListener('storage',sync);};},[]);
  const change840=(patch:Partial<StageBlockingSettingsV840>)=>{
    const next={...blocking840,...patch};
    if(writeStageBlockingV840(next)){setBlocking840(next);setBlockingStatus840('Gespeichert.');}
    else setBlockingStatus840('Speichern fehlgeschlagen.');
  };
  const [foot839,setFoot839]=useState<NaturalFootworkSettingsV839>(DEFAULT_NATURAL_FOOTWORK_V839);
  const [footStatus839,setFootStatus839]=useState('');
  useEffect(()=>{const sync=()=>setFoot839(refreshNaturalFootworkV839());sync();
    window.addEventListener(NATURAL_FOOTWORK_EVENT_V839,sync);window.addEventListener('storage',sync);
    return()=>{window.removeEventListener(NATURAL_FOOTWORK_EVENT_V839,sync);window.removeEventListener('storage',sync);};},[]);
  const change839=(patch:Partial<NaturalFootworkSettingsV839>)=>{
    const next={...foot839,...patch};
    if(writeNaturalFootworkV839(next)){setFoot839(next);setFootStatus839('Gespeichert.');}
    else setFootStatus839('Speichern nicht möglich – vorhandene Einstellungen bleiben erhalten.');
  };
  const [genre666,setGenre666]=useState<GenreDanceSettingsV666>(DEFAULT_GENRE_DANCE_SETTINGS_V666);
  const [genreStatus666,setGenreStatus666]=useState('');
  useEffect(()=>{const sync=()=>setGenre666(refreshGenreDanceSettingsV666());sync();
    window.addEventListener(GENRE_DANCE_SETTINGS_EVENT_V666,sync);window.addEventListener('storage',sync);
    return()=>{window.removeEventListener(GENRE_DANCE_SETTINGS_EVENT_V666,sync);window.removeEventListener('storage',sync);};},[]);
  const change666=(patch:Partial<GenreDanceSettingsV666>)=>{
    const next={...genre666,...patch};
    if(writeGenreDanceSettingsV666(next)){setGenre666(next);setGenreStatus666('Gespeichert.');}
    else setGenreStatus666('Speichern nicht möglich – bisherige Einstellungen bleiben erhalten.');
  };
  const [grounding665,setGrounding665]=useState<RealisticGroundingSettingsV665>(DEFAULT_GROUNDING_SETTINGS_V665);
  const [groundingStatus665,setGroundingStatus665]=useState('');
  useEffect(()=>{const sync=()=>setGrounding665(refreshGroundingSettingsV665());sync();
    window.addEventListener(GROUNDING_SETTINGS_EVENT_V665,sync);window.addEventListener('storage',sync);
    return()=>{window.removeEventListener(GROUNDING_SETTINGS_EVENT_V665,sync);window.removeEventListener('storage',sync);};},[]);
  const change665=(patch:Partial<RealisticGroundingSettingsV665>)=>{
    const next={...grounding665,...patch};
    if(writeGroundingSettingsV665(next)){setGrounding665(next);setGroundingStatus665('Gespeichert.');}
    else setGroundingStatus665('Speichern nicht möglich – bisherige Einstellungen bleiben erhalten.');
  };
  const [natural545,setNatural545]=useState<NaturalDanceMotionSettingsV545>(DEFAULT_NATURAL_DANCE_MOTION_V545);
  useEffect(()=>{const sync=()=>setNatural545(refreshNaturalDanceMotionV545());sync();
    window.addEventListener(NATURAL_DANCE_MOTION_EVENT_V545,sync);window.addEventListener('storage',sync);
    return()=>{window.removeEventListener(NATURAL_DANCE_MOTION_EVENT_V545,sync);window.removeEventListener('storage',sync);};},[]);
  const change545=(patch:Partial<NaturalDanceMotionSettingsV545>)=>{
    const next={...natural545,...patch};setNatural545(next);writeNaturalDanceMotionV545(next);
  };
  const [flow,setFlow]=useState<DanceFlowSettingsV391>(DEFAULT_DANCE_FLOW_V391);
  useEffect(()=>{const sync=()=>setFlow(refreshDanceFlowV391());sync();window.addEventListener(DANCE_FLOW_EVENT_V391,sync);window.addEventListener("storage",sync);return()=>{window.removeEventListener(DANCE_FLOW_EVENT_V391,sync);window.removeEventListener("storage",sync);};},[]);
  const changeFlow=(patch:Partial<DanceFlowSettingsV391>)=>{const next={...flow,...patch};setFlow(next);writeDanceFlowV391(next);};
  const [settings,setSettings]=useState<NaturalDanceSettingsV320>(DEFAULT_NATURAL_DANCE_V320);
  useEffect(()=>{
    const sync=()=>setSettings(refreshNaturalDanceV320());sync();
    window.addEventListener(NATURAL_DANCE_EVENT_V320,sync);window.addEventListener('storage',sync);
    return()=>{window.removeEventListener(NATURAL_DANCE_EVENT_V320,sync);window.removeEventListener('storage',sync);};
  },[]);
  const update=(patch:Partial<NaturalDanceSettingsV320>)=>{const next={...settings,...patch};setSettings(next);writeNaturalDanceV320(next);};
  const slider=(key:'weightTransfer'|'followThrough'|'groove'|'footSafety',label:string)=><label key={key}>
    {label} ({settings[key]} %)<input type="range" min="0" max="100" step="5" value={settings[key]}
      disabled={!settings.enabled} onChange={event=>update({[key]:Number(event.target.value)})}/></label>;
  return <fieldset className="stage-director-v287 natural-dance-v320">
    <legend>Natürlicher Tanz · V320 + V391</legend>
    <p>Rhythmische Gewichtsverlagerung, natürliches Nachschwingen und genreangepasste Akzente – ausschließlich als kleine Zusatzbewegungen.</p>
    <label className="setting-check"><input type="checkbox" checked={settings.enabled} onChange={event=>update({enabled:event.target.checked})}/> Natürliche Tanzbewegung aktivieren</label>
    <label>Tanzstil<select disabled={!settings.enabled} value={settings.style} onChange={event=>update({style:event.target.value as DanceQualityStyle})}>
      <option value="auto">Automatisch nach Genre</option><option value="rave">Hardtekk / Hardstyle</option><option value="rap">Deutschrap / Hip-Hop</option><option value="cinematic">Cinematic / Ambient</option>
    </select></label>
    {slider('weightTransfer','Gewichtsverlagerung und Gegenbewegung')}
    {slider('followThrough','Natürliches Nachschwingen')}
    {slider('groove','Beat- und Snare-Akzente')}
    {slider('footSafety','Fußkontakt-Schutz')}
    <button type="button" onClick={()=>update({...DEFAULT_NATURAL_DANCE_V320})}>V320 zurücksetzen</button>
    <div className="dynamic-stage-blocking-v840" style={{padding:'12px 0'}}>
      <strong>V840 · Dynamic Performer Stage Blocking 2.0</strong>
      <p>Weiche, kontaktgesicherte Bühnenformationen für zwei bis vier Performer – nur bei bestätigter Sängerzuordnung und bereits validierten V808-Positions-Cues. Kein X-Spurwechsel und kein Eingriff in die Fuß-IK.</p>
      <label className="setting-check"><input type="checkbox" checked={blocking840.enabled}
        onChange={e=>change840({enabled:e.target.checked})}/> Sanfte Formationsübergänge aktivieren</label>
      <label>Inszenierung <select disabled={!blocking840.enabled} value={blocking840.style}
        onChange={e=>change840({style:e.target.value as StageBlockingSettingsV840['style']})}>
        <option value="subtle">Natürlich / dezent</option><option value="concert">Konzert / dynamischer</option>
      </select></label>
      <label>Stärke ({blocking840.strength} %)<input type="range" min="0" max="100" step="5"
        disabled={!blocking840.enabled} value={blocking840.strength}
        onChange={e=>change840({strength:Number(e.target.value)})}/></label>
      <button type="button" onClick={()=>change840(DEFAULT_STAGE_BLOCKING_V840)}>V840 zurücksetzen</button>
      <small role="status">{blockingStatus840}</small>
      <small>Manuelle Cues, Kollisionserkennung, fehlender Bodenkontakt und reduzierte Bewegung haben Vorrang. Keine neue automatische Gesangserkennung.</small>
    </div>
    <div className="natural-footwork-v839" style={{padding:'12px 0'}}>
      <strong>V839 · Natural Dance &amp; Footwork 4.0</strong>
      <p>Kontaktbewusstes Abfedern bestehender Hüft-, Bein- und Schrittanimationen. Beim Abheben kehrt die Bewegungsfreiheit sanft zurück. Manuelle Clips und die Fuß-IK behalten Vorrang.</p>
      <label className="setting-check"><input type="checkbox" checked={foot839.enabled}
        onChange={e=>change839({enabled:e.target.checked})}/> Automatischer Tanz-Feinschliff</label>
      <label>Genre-Rhythmus <select disabled={!foot839.enabled} value={foot839.style}
        onChange={e=>change839({style:e.target.value as NaturalFootworkSettingsV839['style']})}>
        <option value="auto">Automatisch nach Genre</option><option value="rap">Deutschrap · weicher</option>
        <option value="hardtekk">Hardtekk · schneller</option><option value="neutral">Neutral</option>
      </select></label>
      <label>Feinschliff-Stärke ({foot839.strength} %)<input type="range" min="0" max="100" step="5"
        disabled={!foot839.enabled} value={foot839.strength} onChange={e=>change839({strength:Number(e.target.value)})}/></label>
      <button type="button" onClick={()=>change839(DEFAULT_NATURAL_FOOTWORK_V839)}>V839 zurücksetzen</button>
      <small role="status">{footStatus839}</small>
      <small>Nur bei real beobachtetem Fußkontakt und automatischer Performance. Keine neuen Schritte oder Beats, keine Änderung am GLB-Clip, keine erfundene Fußstellung.</small>
    </div>
    <div className="natural-dance-v391" style={{padding:'12px 0'}}>
      <strong>V391 · Natural Dance Intelligence 3.0 – Flow</strong>
      <p>Unregelmäßige, beatgebundene Gewichtsverlagerung und weicheres Nachschwingen. Nur additive Rig-Kanäle, kein Eingriff in Clip-Keyframes oder Fuß-IK.</p>
      <label className="setting-check"><input type="checkbox" checked={flow.enabled} onChange={e=>changeFlow({enabled:e.target.checked})}/> V391 Flow-Variation aktivieren</label>
      <label>Variation ({flow.strength} %)<input type="range" min="0" max="100" step="5" disabled={!flow.enabled} value={flow.strength} onChange={e=>changeFlow({strength:Number(e.target.value)})}/></label>
      <button type="button" onClick={()=>changeFlow(DEFAULT_DANCE_FLOW_V391)}>V391 zurücksetzen</button>
    </div>
    <div className="natural-dance-v545" style={{padding:'12px 0'}}>
      <strong>V545 · Natural Dance Motion 6.0 – GLB-Fußkontakt</strong>
      <p>Glättet nur Zusatzrotationen an Hüfte und Beinen, wenn die vorhandene Fuß-IK sicheren Kontakt meldet. Deutschrap bleibt geschmeidig; Hardstyle/Hardtekk reagieren schneller.</p>
      <label className="setting-check"><input type="checkbox" checked={natural545.enabled}
        onChange={event=>change545({enabled:event.target.checked})}/> Fußkontakt-Glättung aktivieren</label>
      <label>Schutzstärke ({natural545.strength} %)<input type="range" min="0" max="100" step="5"
        disabled={!natural545.enabled} value={natural545.strength}
        onChange={event=>change545({strength:Number(event.target.value)})}/></label>
      <button type="button" onClick={()=>change545(DEFAULT_NATURAL_DANCE_MOTION_V545)}>V545 zurücksetzen</button>
    </div>
    <div className="genre-dance-v666" style={{padding:'12px 0'}}>
      <strong>V666 · Genre-Specific Dance Intelligence</strong>
      <p>V666.1: Genre-Tanzregie läuft automatisch für erkannte Genres, passend zu Verse, Hook und Drop.
        Die Animationen stammen aus der installierten Motion-Bibliothek; manuelle Choreografien haben Vorrang.</p>
      <label className="setting-check"><input type="checkbox" checked={genre666.enabled}
        onChange={e=>change666({enabled:e.target.checked})}/> Automatische Genre-Tanzregie aktiviert (bei Bedarf ausschalten)</label>
      <label>Stil <select value={genre666.style} disabled={!genre666.enabled}
        onChange={e=>change666({style:e.target.value as DanceStyleV666})}>
        <option value="auto">Automatisch aus Song-Genre (Standard)</option>
        <option value="deutschrap">Deutschrap – Headnod und Rap-Gesten</option>
        <option value="hardstyle">Hardstyle – druckvolle Akzente</option>
        <option value="hardtekk">Hardtekk – schnelle Bounce-Akzente</option>
        <option value="rock">Rock – Headbanging und Bühnenpräsenz</option>
        <option value="pop">Pop – weichere Sways und Armbewegungen</option>
      </select></label>
      <label>Ausdrucksstärke ({genre666.strength} %)<input type="range" min="0" max="100" step="5"
        value={genre666.strength} disabled={!genre666.enabled}
        onChange={e=>change666({strength:Number(e.target.value)})}/></label>
      <button type="button" onClick={()=>change666(DEFAULT_GENRE_DANCE_SETTINGS_V666)}>V666 zurücksetzen</button>
      <small role="status">{genreStatus666}</small>
      <small>Standardmäßig automatisch aktiv. Ohne erkennbares Song-Genre wird nichts geraten.
        Manuelle Choreografie, Pause, reduzierte Bewegung und niedrige Renderqualität haben Vorrang.
        Sichtbare Stilunterschiede hängen von den installierten GLB-Motions ab.</small>
    </div>
    <div className="realistic-dance-grounding-v665" style={{padding:'12px 0'}}>
      <strong>V665 · Realistic Dance Grounding</strong>
      <p>Beruhigt additive Hüft-, Bein- und Fußbewegungen anhand des vorhandenen Fußkontakts.
        Beim Wechsel zu einem tatsächlich ausgewählten Hocke-Clip werden Zusatzbewegungen weich reduziert.
        Die Animation selbst, Fuß-IK und Bühnenposition bleiben unverändert.</p>
      <label className="setting-check"><input type="checkbox" checked={grounding665.enabled}
        onChange={e=>change665({enabled:e.target.checked})}/> Zusätzliche Stand- und Hocke-Stabilisierung aktivieren</label>
      <label>Stabilisierung ({grounding665.strength} %)<input type="range" min="0" max="100" step="5"
        disabled={!grounding665.enabled} value={grounding665.strength}
        onChange={e=>change665({strength:Number(e.target.value)})}/></label>
      <label>Übergangsdauer ({grounding665.transitionMs} ms)<input type="range" min="120" max="800" step="40"
        disabled={!grounding665.enabled} value={grounding665.transitionMs}
        onChange={e=>change665({transitionMs:Number(e.target.value)})}/></label>
      <button type="button" onClick={()=>change665(DEFAULT_GROUNDING_SETTINGS_V665)}>V665 zurücksetzen</button>
      <small role="status">{groundingStatus665}</small>
      <small>Standardmäßig aus. Ohne Fuß-IK kein Effekt; kein echter Physiksimulator und keine automatisch erzeugte Hockpose.</small>
    </div>
    <small>Respektiert Pause, Reduced Motion und importierte GLB-Keyframes. Bei manuell gewählten Choreografien wird der Effekt bewusst stark reduziert. Keine Änderung der Fuß-IK oder Root-Translation.</small>
  </fieldset>;
}
