'use client';
import {useAudioAnalysis} from '@/context/AudioAnalysisContext';
import {musicAnalysisLabel} from '@/hooks/spectralMusicAnalyzer';
/** Read-only source information inside the drawer; the stage gets no additional overlay. */
export function ConcertAnalysisStatus(){
 const analysis=useAudioAnalysis();
 return <output aria-label="Musikanalyse">{musicAnalysisLabel(analysis.active,analysis.enabled,analysis.metrics)}</output>;
}
