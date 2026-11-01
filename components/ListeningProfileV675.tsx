'use client';

import {useMemo,useState} from 'react';
import {useUiPreferences} from '@/context/UiPreferencesContext';
import type {RecentTrackV672} from '@/lib/recently-played-v672';
import type {HistoryGenreMapV674} from '@/lib/recently-played-discovery-v674';
import {buildListeningProfileV675,musicProfilePatchV675,snapshotProfilePatchV675,type ProfileRecommendationV675} from '@/lib/listening-profile-v675';
import type {UiPreferences} from '@/types/music';

/** Read-only derived insights. Settings change only after an explicit click. */
export function ListeningProfileV675({tracks,known,onOpenGenres}:{tracks:ReadonlyArray<RecentTrackV672>;known:HistoryGenreMapV674;onOpenGenres:()=>void}){
 const {preferences,updatePreferences}=useUiPreferences();
 const profile=useMemo(()=>buildListeningProfileV675(tracks,known),[tracks,known]);
 const [useFx,setUseFx]=useState(false);
 const [lastChange,setLastChange]=useState<{before:Partial<UiPreferences>;applied:Partial<UiPreferences>}|null>(null);
 const [status,setStatus]=useState('');
 const apply=(recommendation:ProfileRecommendationV675)=>{
  const patch=musicProfilePatchV675(recommendation,useFx);
  const before=snapshotProfilePatchV675(preferences,patch);
  updatePreferences(patch);
  setLastChange({before,applied:patch});
  setStatus(`„${recommendation.name}“ übernommen. Die automatische Song-Dramaturgie bleibt aktiv.`);
 };
 const undo=()=>{
  if(!lastChange)return;
  // Do not overwrite later user edits to any of the suggested settings.
  const keys=Object.keys(lastChange.applied) as (keyof UiPreferences)[];
  if(keys.some(k=>preferences[k]!==lastChange.applied[k])){
   setStatus('Die Einstellungen wurden inzwischen geändert. Rückgängig wurde zum Schutz deiner Änderungen nicht ausgeführt.');
   setLastChange(null);return;
  }
  updatePreferences(lastChange.before);setLastChange(null);setStatus('Vorherige Bühnen- und Tanzeinstellungen wiederhergestellt.');
 };
 const best=profile.families[0];
 return <section className="recent-profile-v675" aria-label="Dein temporäres Musikprofil">
  <header className="recent-gallery-head-v674"><div><span className="recent-discovery-kicker-v674">DEIN SOUND / DEINE SHOW</span><h3>Dein Musikprofil<span>.</span></h3><p>Aus deinen geladenen Spotify-Wiedergaben, nicht aus deinem gesamten Hörverlauf.</p></div><span className="recent-discovery-caveat-v674">{profile.coverage}% Genre-Abdeckung</span></header>
  <div className="recent-profile-hero-v675"><div><span className="recent-discovery-kicker-v674">DEIN MOMENTANER SOUND</span><strong>{best?.label||'Noch nicht bestimmt'}</strong><p>{profile.note}</p></div><div className="recent-profile-metrics-v675"><div><b>{profile.total}</b><small>Wiedergaben geladen</small></div><div><b>{profile.classified}</b><small>mit erkanntem Genre</small></div><div><b>{profile.uniqueTracks}</b><small>verschiedene Songs</small></div></div></div>
  <div className="recent-profile-panels-v675">
   <section className="recent-profile-panel-v675"><h4>Deine Soundrichtungen</h4><p>Genre-Familien, nach Wiedergaben in der erkannten Teilmenge.</p>{profile.families.length?<ol className="recent-profile-genres-v675">{profile.families.map(family=><li key={family.family}><div><b>{family.label}</b><span>{family.plays}× · {family.share}% der erkannten Wiedergaben</span></div><div className="recent-profile-track-v675"><span style={{width:`${family.share}%`,backgroundColor:family.color}}/></div><small>{family.uniqueSongs} verschiedene Songs</small></li>)}</ol>:<p>Ohne Genre-Erkennung kann Sonic Display noch keine Musikrichtung zuordnen.</p>}<button type="button" className="recent-profile-link-v675" onClick={onOpenGenres}>Genre-Mix öffnen und Daten prüfen →</button></section>
   <section className="recent-profile-panel-v675"><h4>Deine aktuellen Künstler</h4><p>Meistgehörte Hauptkünstler in den geladenen Wiedergaben, keine Allzeit-Rangliste.</p>{profile.artists.length?<ol className="recent-profile-artists-v675">{profile.artists.map((artist,index)=><li key={artist.name}><b>{String(index+1).padStart(2,'0')}</b><div className="recent-profile-art-v675">{artist.cover?<img src={artist.cover} alt="" loading="lazy"/>:<span aria-hidden="true">♫</span>}</div><div><strong>{artist.name}</strong><small>{artist.uniqueSongs} Songs · {artist.plays} Wiedergaben</small></div></li>)}</ol>:<p>Noch keine Künstler geladen.</p>}</section>
  </div>
  <section className="recent-profile-recs-v675"><div className="recent-profile-recs-title-v675"><div><span className="recent-discovery-kicker-v674">SMART SHOW MATCH</span><h4>Deine passenden Bühnen-Looks</h4><p>Aus verifizierten Genres empfohlen. Die Wahl bleibt bei dir.</p></div><label><input type="checkbox" checked={useFx} onChange={e=>setUseFx(e.target.checked)}/> Optionale DanceFX übernehmen</label></div>
   {profile.recommendations.length?<div className="recent-profile-rec-grid-v675">{profile.recommendations.map((rec,index)=><article key={rec.key} className="recent-profile-rec-v675"><div className="recent-profile-rec-top-v675"><span>0{index+1} / {rec.familyLabel}</span><span>{rec.plays} Wiedergaben · {rec.uniqueSongs} Songs</span></div><div className={`recent-profile-stage-v675 recent-profile-stage-${rec.key}-v675`} aria-hidden="true"><span>◉</span><span>✦</span><span>◉</span></div><h5>{rec.name}</h5><p>{rec.description}</p><div className="recent-profile-tags-v675"><span>🎭 {rec.avatarDancePreset}</span><span>☀ Licht {rec.lightStrength}%</span><span>♫ {rec.showStyle}</span></div><button type="button" onClick={()=>apply(rec)}>Look für die Bühne übernehmen</button></article>)}</div>:<div className="recent-empty-v672">Für verlässliche Bühnenvorschläge sind mindestens drei erkannte Wiedergaben und zwei verschiedene Songs je Musikrichtung nötig. Im Genre-Mix kannst du weitere Titel prüfen.</div>}
   <p className="recent-profile-safety-v675">Nur Bühne, Tanzstil und Licht werden angepasst; DanceFX ausschließlich mit Häkchen. Song-Erkennung, Künstlerzuordnung, automatisch inszenierte Verse/Hooks/Drops, Lyrics und Kamera bleiben unverändert.</p>
   {lastChange&&<button type="button" className="recent-profile-undo-v675" onClick={undo}>Letzten Look rückgängig machen</button>}
   {status&&<p className="recent-profile-status-v675" role="status">{status}</p>}
  </section>
  <footer className="recent-profile-foot-v675">{profile.unclassified} Wiedergaben ohne erkannte Genres · Keine Speicherung oder Server-Profilbildung · Vorschläge gelten nur für die geladenen Daten.</footer>
 </section>;
}
