'use client';
import {useMemo} from 'react';
import {type StoryInputV1131} from '@/lib/concertStoryV1131';
import {concertScoreV1134} from '@/lib/concertScoreV1134';
import {useCrewSettings} from './useSonicCrew';
import {useAudioAnalysis} from '@/context/AudioAnalysisContext';
import {measuredMusic} from '@/lib/musicalEvidence';
export function useConcertStoryV1131(input:StoryInputV1131,useMeasured=true){
 const settings=useCrewSettings(),enabled=settings.enabled&&settings.mode==='adaptive';
 const analysis=useAudioAnalysis(),evidence=input.audioEvidence??measuredMusic(useMeasured&&analysis.active,analysis.metrics);
 return useMemo(()=>enabled?concertScoreV1134({...input,audioEvidence:evidence,taste:settings.taste,history:settings.remember===false?undefined:settings.history}):null,[enabled,settings.taste,settings.history,settings.remember,evidence?.phase,evidence?.confidence,evidence?.energy,evidence?.onset,evidence?.anticipation,input.trackId,input.playback?.positionMs,input.playback?.fetchedAt,input.playback?.playing,input.progressMs,input.durationMs,input.bpm,
  input.genre,input.section,input.energy,input.lyrics,input.lyricDensity,input.count]);
}
