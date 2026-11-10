'use client';
import {useEffect,useState,type CSSProperties} from 'react';
import {readGroupV326,GROUP_EVENT_V326} from './visualizer/multiAvatarStageDirectorV326';
import {concertScoreV1134} from '@/lib/concertScoreV1134';
import {useMusic} from '@/context/MusicContext';
import {useAudioAnalysis} from '@/context/AudioAnalysisContext';
import {useUiPreferences} from '@/context/UiPreferencesContext';
import {useCrewSettings} from './visualizer/useSonicCrew';
import {measuredMusic} from '@/lib/musicalEvidence';
import {showCueV1130,lyricDensityV1130,lyricSectionV1130} from '@/lib/showIntelligenceV1130';
export function LiveShowDirectorV1130({progressMs}:{progressMs:number}){
 const {lyrics,genre,track,isPlaying}=useMusic(),{metrics,active}=useAudioAnalysis();
 const {preferences}=useUiPreferences(),crew=useCrewSettings();
 const [group,setGroup]=useState(readGroupV326);
 useEffect(()=>{const update=()=>setGroup(readGroupV326());window.addEventListener(GROUP_EVENT_V326,update);return()=>window.removeEventListener(GROUP_EVENT_V326,update);},[]);
 if(!track||!crew.enabled||crew.mode!=='adaptive')return null;
 const cue=concertScoreV1134({trackId:track.id,taste:crew.taste,history:crew.remember===false?undefined:crew.history,audioEvidence:measuredMusic(active,metrics),progressMs,durationMs:track.durationMs,genre,
  lyrics,count:group.enabled?group.count:1,bpm:metrics.bpm,energy:active?metrics.energyEnvelope:undefined,
  section:lyrics?.synced?undefined:lyricSectionV1130(lyrics,progressMs),lyricDensity:lyricDensityV1130(lyrics,progressMs)});
 const motion=isPlaying&&!preferences.reducedMotion;
 return <aside className={`show-v1130 show-v1130-${cue.act} ${motion?'show-v1130-moving':''}`}
  aria-label="Intelligente Show-Regie" data-show-audio={cue.music.measured?'measured':'planned'} data-show-shot={cue.shot} data-show-genre={genre??''} data-show-memory={cue.memory?.phase??'none'} data-show-theme={cue.memory?.theme??''} data-show-dialogue={cue.dialogue?.phase??'none'} data-show-staging={cue.staging} data-show-build={cue.anticipationProgress.toFixed(3)} data-show-leader={cue.leader} data-show-accent={cue.accent.toFixed(3)} data-show-act={cue.act} data-show-chapter={cue.chorusVisit} data-show-interaction={cue.interaction}
  style={{'--show-color':cue.palette,'--show-gain':cue.intensity,'--show-light':cue.lightGain} as CSSProperties}>
  <div className="show-v1130-halo" aria-hidden="true"/>
  <div className="show-v1130-status"><span aria-hidden="true">✦</span> {cue.chapter}
   <small>{isPlaying?'LIVE SHOW':'PAUSE'} · {cue.mode==='spotlight'?'Solo & Antwort':cue.mode==='canon'?'Kanon':cue.mode==='unison'?'Gemeinsamer Hit':'Ruhiger Moment'}</small>
  </div>
 </aside>;
}
