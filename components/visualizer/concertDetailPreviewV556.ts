import type {Lyrics} from '@/types/music';
import {planConcertDetailsV555,type ConcertDetailSettingsV555} from './concertDetailEffectsV555';
import {balanceConcertDetailsV556,type ConcertQualityV556} from './concertBalanceV556';

export type ConcertPreviewModeV556='verse'|'hook'|'dense'|'duet'|'rapHook';
const EXAMPLES_V556={
  verse:{text:'Wir stehen hier und leben diesen Moment',section:'verse',length:6500},
  hook:{text:'HEUTE IST UNSERE NACHT',section:'hook',length:3600},
  dense:{text:'Ich komm durch die Straßen mit den tausend Gedanken und schnellen Reimen und immer noch mehr Worten auf jedem Beat und jeder neuen Zeile',section:'hook',length:2400},
  duet:{text:'Du sagst das Wort und ich antworte',section:'verse',length:4200},
  rapHook:{text:'HEUTE NACHT DREHT SICH DIE WELT',section:'hook',length:3100},
} as const;
/** Synthetic, clearly labelled studio demo – never passed off as real song timing. */
export function concertPreviewV556(mode:ConcertPreviewModeV556,settings:ConcertDetailSettingsV555,
  reducedMotion=false,tier:ConcertQualityV556='balanced',playing=true){
  const example=EXAMPLES_V556[mode];
  const lyrics={provider:'lrclib',synced:true,plainText:null,
    lines:[{text:example.text,startMs:0,endMs:example.length}] } as Lyrics;
  const cue=planConcertDetailsV555({lyrics,progressMs:900,activeIndex:0,
    playing,reducedMotion,section:example.section,settings});
  return {cue,caption:example.text,balance:balanceConcertDetailsV556({cue,settings,playing,reducedMotion,tier})};
}
