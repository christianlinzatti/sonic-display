'use client';
import {useMemo} from 'react';
import {type StoryInputV1131} from '@/lib/concertStoryV1131';
import {concertScoreV1134} from '@/lib/concertScoreV1134';
import {useCrewSettings} from './useSonicCrew';
export function useConcertStoryV1131(input:StoryInputV1131){
 const settings=useCrewSettings(),enabled=settings.enabled&&settings.mode==='adaptive';
 return useMemo(()=>enabled?concertScoreV1134(input):null,[enabled,input.trackId,input.playback?.positionMs,input.playback?.fetchedAt,input.playback?.playing,input.progressMs,input.durationMs,input.bpm,
  input.genre,input.section,input.energy,input.lyrics,input.lyricDensity,input.count]);
}
