'use client';
import {liveConcertContext} from '@/lib/concertScenePlan';
import {useConcertPresentation} from '../concertPresentation';
import {useMemo,useEffect,useState,useRef} from 'react';
import {type StoryInputV1131} from '@/lib/concertStoryV1131';
import {concertScoreV1134} from '@/lib/concertScoreV1134';
import {useCrewSettings} from './useSonicCrew';
import {useAudioAnalysis} from '@/context/AudioAnalysisContext';
import {measuredMusic} from '@/lib/musicalEvidence';
export function useConcertStoryV1131(input:StoryInputV1131,useMeasured=true){
 const lead=useRef(0);
 const [performed,setPerformed]=useState<{source:string;position:number;kind:'feet'|'duet'}|null>(null);
 useEffect(()=>{const observe=(event:Event)=>{const d=(event as CustomEvent).detail;if(typeof d?.source!=='string'||!Number.isFinite(d.progressMs)||d.slot!==lead.current)return;if(d.clip===null){setPerformed(null);return;}if(typeof d.clip!=='string')return;const kind=/CrossStep|HeelToe|SideGlide|DiagonalStep|PivotStep|TurnPhrase/.test(d.clip)?'feet' as const:'duet' as const;setPerformed(old=>old&&old.source===d.source&&old.kind===kind&&Math.abs(old.position-d.progressMs)<800?old:{source:d.source,position:d.progressMs,kind});};window.addEventListener('sonic:crew-performance',observe);return()=>window.removeEventListener('sonic:crew-performance',observe);},[]);
 const concert=useConcertPresentation(),settings=useCrewSettings(),enabled=settings.enabled&&settings.mode==='adaptive';
 const analysis=useAudioAnalysis(),evidence=input.audioEvidence??measuredMusic(useMeasured&&analysis.active,analysis.metrics);
 const score=useMemo(()=>enabled?concertScoreV1134({...input,concert,scenery:settings.scenery,showPlans:settings.showPlans,showStyle:settings.showStyle,showTake:settings.showTake,...(useMeasured&&settings.showPlans?liveConcertContext(input,analysis.active):{}),audioEvidence:evidence,taste:settings.taste,history:settings.remember===false?undefined:settings.history}):null,[enabled,concert,settings.scenery,useMeasured,analysis.active,settings.showPlans,settings.showStyle,settings.showTake,settings.taste,settings.history,settings.remember,evidence?.phase,evidence?.confidence,evidence?.energy,evidence?.onset,evidence?.anticipation,input.trackId,input.playback?.positionMs,input.playback?.fetchedAt,input.playback?.playing,input.progressMs,input.durationMs,input.bpm,
  input.genre,input.section,input.energy,input.lyrics,input.lyricDensity,input.count]);
 lead.current=score?.leader??0;
 return score&&performed?.source===score.sourceKey&&Math.abs(performed.position-score.positionMs)<1500?{...score,performanceShot:performed.kind}:score;
}
