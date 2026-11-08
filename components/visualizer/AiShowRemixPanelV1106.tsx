'use client';
/** V1106 · Deliberate opt-in, preview, explicit apply and conflict-safe undo. */
import {useEffect,useRef,useState} from 'react';
import {useUiPreferences} from '@/context/UiPreferencesContext';
import {useAudioAnalysis} from '@/context/AudioAnalysisContext';
import {useMusic} from '@/context/MusicContext';
import {DEFAULT_CREATIVE_BRIEF_V1107,curateCreativeRemixV1107,auditCreativeRemixV1107,
 type CreativeStyleV1107} from '@/lib/aiCreativeProducerV1107';
import {createMusicEmotionSessionV1108,collectMusicEmotionSampleV1108,readMusicEmotionV1108,
 suggestCreativeDirectionV1108,type MusicEmotionReadingV1108,type MusicMoodHintV1108} from '@/lib/aiMusicEmotionV1108';
import {AVATAR_CAST_V1112,AVATAR_PERSONALITY_LABELS_V1112,directAvatarPersonalityV1112,
 sampleAvatarPersonalityV1112,syncPersonalityConductorV1112,
 type AvatarPersonalityV1112,type AvatarCastV1112,type AvatarPersonalityShowV1112} from '@/lib/aiAvatarPersonalityV1112';
import {choreographDanceV1114,syncDancePerformanceV1114,sampleDanceCueV1114,
 DANCE_STYLE_LABELS_V1114,type DanceStyleV1114,type DanceShowV1114} from '@/lib/aiDanceChoreographerV1114';
import {useCrewSettings,writeCrewSettings} from '@/components/visualizer/useSonicCrew';
import {directVocalActingV1115,sampleVocalCueV1115,vocalPresetV1115,
 VOCAL_STYLE_LABELS_V1115,type VocalStyleV1115,type VocalShowV1115,type VocalPresetV1115}
 from '@/lib/aiVocalActingV1115';
import {directStageTransformationV1117,stageLivePresetV1117,sampleStageCueV1117,
 STAGE_STYLE_LABELS_V1117,type StageStyleV1117,type StageShowV1117,
 type StageLivePresetV1117} from '@/lib/aiStageTransformationV1117';
import {directArtistInteractionV1116,sampleInteractionCueV1116,liveArtistPresetV1116,
 INTERACTION_LABELS_V1116,type InteractionStyleV1116,type InteractionShowV1116,
 type LiveArtistPresetV1116} from '@/lib/aiArtistInteractionV1116';
import {directPerformanceV1113,syncPerformancePersonalityV1113,samplePerformanceCueV1113,
 PERFORMANCE_MODE_LABELS_V1113,type PerformanceModeV1113,type PerformanceShowV1113} from '@/lib/aiPerformanceDirectorV1113';
import {conductAiShowV1111,sampleConductorCueV1111,
 type ConductorModeV1111,type ConductorShowV1111} from '@/lib/aiLiveShowConductorV1111';
import {readDropReadinessV1110,directDropRemixV1110,syncDropStoryV1110,
 type DropReadingV1110,type DropCueV1110} from '@/lib/aiDropPredictionV1110';
import {composeConcertStoryV1109,STORY_ARC_LABELS_V1109,
 type ConcertStoryArcV1109,type ConcertStoryPacingV1109,type ConcertStoryResultV1109} from '@/lib/aiConcertStoryV1109';
import {generateArenaShowPlanV1040,normalizeArenaShowPlanV1040,
 type ArenaShowPlanV1040} from '@/lib/arena360ShowDesignerV1040';
import {applyAiShowRemixV1106,localAiShowRemixV1106,normalizeAiShowRemixV1106,
 type AiShowRemixV1106,type RemixGenreV1106} from '@/lib/arena360AiShowRemixV1106';
const NAMES:Record<string,string>={intro:'Intro',verse:'Strophe',build:'Build-up',hook:'Hook',
 interlude:'Atempause',finale:'Finale'};
export function AiShowRemixPanelV1106({plan,prompt,genre,title,durationMs}:{
 plan:ArenaShowPlanV1040|null;prompt:string;genre:string;title:string;durationMs:number;
}){
 const {preferences,updatePreferences}=useUiPreferences();
 const crewSettings=useCrewSettings();
 const crewUndo=useRef<{before:typeof crewSettings;after:string}|null>(null);
 const audio=useAudioAnalysis();
 const music=useMusic();
 const [director,setDirector]=useState<CreativeStyleV1107>('cinematic');
 const [contrast,setContrast]=useState(50);
 const [surprise,setSurprise]=useState(35);
 const [mood,setMood]=useState<MusicMoodHintV1108>('none');
 const [moodExplanation,setMoodExplanation]=useState('Noch keine Messung ausgewählt.');
 const [sampling,setSampling]=useState(false);
 const [sampleCount,setSampleCount]=useState(0);
 const [reading,setReading]=useState<MusicEmotionReadingV1108|null>(null);
 const emotionSession=useRef(createMusicEmotionSessionV1108());
 const [dropReading,setDropReading]=useState<DropReadingV1110|null>(null);
 const [dropCue,setDropCue]=useState<DropCueV1110|null>(null);
 const currentTrack=music.track?.id??'';
 const [storyArc,setStoryArc]=useState<ConcertStoryArcV1109>('crescendo');
 const [storyPacing,setStoryPacing]=useState<ConcertStoryPacingV1109>('balanced');
 const [storyEnabled,setStoryEnabled]=useState(false);
 const [storyPreview,setStoryPreview]=useState<ConcertStoryResultV1109|null>(null);
 const [conductorEnabled,setConductorEnabled]=useState(false);
 const [conductorMode,setConductorMode]=useState<ConductorModeV1111>('cinematic');
 const [conductorSurprise,setConductorSurprise]=useState(true);
 const [conductorPreview,setConductorPreview]=useState<ConductorShowV1111|null>(null);
 const [personalityEnabled,setPersonalityEnabled]=useState(false);
 const [cast,setCast]=useState<AvatarCastV1112>(()=>AVATAR_CAST_V1112.map(x=>({...x})));
 const [personalityPreview,setPersonalityPreview]=useState<AvatarPersonalityShowV1112|null>(null);
 const [performanceEnabled,setPerformanceEnabled]=useState(false);
 const [performanceMode,setPerformanceMode]=useState<PerformanceModeV1113>('natural');
 const [performanceExpression,setPerformanceExpression]=useState(50);
 const [performancePreview,setPerformancePreview]=useState<PerformanceShowV1113|null>(null);
 const [danceStyle,setDanceStyle]=useState<DanceStyleV1114>('expressive');
 const [danceEnabled,setDanceEnabled]=useState(false);
 const [dancePreview,setDancePreview]=useState<DanceShowV1114|null>(null);
 const [crewCanUndo,setCrewCanUndo]=useState(false);
 const [vocalStyle,setVocalStyle]=useState<VocalStyleV1115>('rap');
 const [vocalExpression,setVocalExpression]=useState(50);
 const [vocalEnabled,setVocalEnabled]=useState(false);
 const [vocalPreview,setVocalPreview]=useState<VocalShowV1115|null>(null);
 const [vocalCanUndo,setVocalCanUndo]=useState(false);
 const [interactionStyle,setInteractionStyle]=useState<InteractionStyleV1116>('dialogue');
 const [interactionStrength,setInteractionStrength]=useState(50);
 const [interactionEnabled,setInteractionEnabled]=useState(false);
 const [interactionPreview,setInteractionPreview]=useState<InteractionShowV1116|null>(null);
 const [interactionCanUndo,setInteractionCanUndo]=useState(false);
 const [stageStyle,setStageStyle]=useState<StageStyleV1117>('kinetic');
 const [stageStrength,setStageStrength]=useState(50);
 const [stageEnabled,setStageEnabled]=useState(false);
 const [stagePreview,setStagePreview]=useState<StageShowV1117|null>(null);
 const [stageCanUndo,setStageCanUndo]=useState(false);
 const stageUndo=useRef<{before:Partial<typeof preferences>;after:StageLivePresetV1117}|null>(null);
 const interactionUndo=useRef<{before:Partial<typeof preferences>;after:LiveArtistPresetV1116}|null>(null);
 const vocalUndo=useRef<{before:Partial<typeof preferences>;after:VocalPresetV1115}|null>(null);
 const [conductorScrub,setConductorScrub]=useState(35);
 const [followSong,setFollowSong]=useState(false);
 const [idea,setIdea]=useState('Düsteres Intro, starke Hook, schwebende Bühnen und ein überraschendes Finale');
 const [cap,setCap]=useState(70);
 const [preview,setPreview]=useState<AiShowRemixV1106|null>(null);
 const [source,setSource]=useState<'ai'|'local'|null>(null);
 const [status,setStatus]=useState('');
 const [busy,setBusy]=useState(false);
 const [baseSignature,setBaseSignature]=useState('');
 const [canUndo,setCanUndo]=useState(false);
 const controller=useRef<AbortController|null>(null);
 const requestId=useRef(0);
 const undo=useRef<{before:ArenaShowPlanV1040|null;after:string}|null>(null);
 const base=plan??generateArenaShowPlanV1040({prompt,genre,durationMs,title});
 const signature=JSON.stringify(base);
 const style:RemixGenreV1106=base.genre;
 const creativeBrief=()=>({style:director,contrast,surprise,mood});
 const storyOptions=()=>({arc:storyArc,pacing:storyPacing,intensityCap:cap});
 const storyFor=(remix:AiShowRemixV1106)=>composeConcertStoryV1109(base,remix,storyOptions());
 // A Drop cue is an explicit user choice and is applied only to PREVIEW data.
 const withDrop=(remix:AiShowRemixV1106,story:ConcertStoryResultV1109|null)=>{
  const staged=dropCue?directDropRemixV1110(story?.remix??remix,dropCue,cap):story?.remix??remix;
  return {staged,story:story?syncDropStoryV1110(story,staged):null};
 };
 const withConductor=(remix:AiShowRemixV1106,story:ConcertStoryResultV1109|null,force=false)=>{
  const dropped=withDrop(remix,story);
  if(!dropped.staged)return {staged:null,story:null,conductor:null};
  const conductor=(conductorEnabled||force)?conductAiShowV1111(base,dropped.staged,
   {mode:conductorMode,intensityCap:cap,surprise:conductorSurprise}):null;
  if((conductorEnabled||force)&&!conductor)return {staged:null,story:null,conductor:null};
  const staged=conductor?.remix??dropped.staged;
  const stagedStory=dropped.story?syncDropStoryV1110(dropped.story,staged):null;
  return {staged,story:stagedStory,conductor};
 };
 const withPersonality=(staged:AiShowRemixV1106|null,conductor:ConductorShowV1111|null,force=false)=>{
  if(!staged)return {staged:null,conductor:null,personality:null};
  if(!personalityEnabled&&!force)return {staged,conductor,personality:null};
  const personality=directAvatarPersonalityV1112(base,staged,cast,cap);
  if(!personality)return {staged:null,conductor:null,personality:null};
  return {staged:personality.remix,conductor:syncPersonalityConductorV1112(conductor,personality),personality};
 };
 const withPerformance=(staged:AiShowRemixV1106|null,conductor:ConductorShowV1111|null,
  personality:AvatarPersonalityShowV1112|null,force=false)=>{
  if(!staged)return {staged:null,conductor:null,personality:null,performance:null};
  if(!performanceEnabled&&!force)return {staged,conductor,personality,performance:null};
  if(!personality)return {staged:null,conductor:null,personality:null,performance:null};
  const performance=directPerformanceV1113(base,personality,
   {mode:performanceMode,expression:performanceExpression,intensityCap:cap});
  if(!performance)return {staged:null,conductor:null,personality:null,performance:null};
  const aligned=syncPerformancePersonalityV1113(personality,performance);
  if(!aligned)return {staged:null,conductor:null,personality:null,performance:null};
  return {staged:performance.remix,conductor:syncPersonalityConductorV1112(conductor,aligned),
   personality:aligned,performance};
 };
 const withDance=(staged:AiShowRemixV1106|null,conductor:ConductorShowV1111|null,
  personality:AvatarPersonalityShowV1112|null,performance:PerformanceShowV1113|null,force=false)=>{
  if(!staged)return {staged:null,conductor:null,personality:null,performance:null,dance:null};
  if(!danceEnabled&&!force)return {staged,conductor,personality,performance,dance:null};
  if(!performance||!personality)return {staged:null,conductor:null,personality:null,performance:null,dance:null};
  const dance=choreographDanceV1114(base,performance,{style:danceStyle,intensityCap:cap});
  if(!dance)return {staged:null,conductor:null,personality:null,performance:null,dance:null};
  const alignedPerformance=syncDancePerformanceV1114(performance,dance);
  if(!alignedPerformance)return {staged:null,conductor:null,personality:null,performance:null,dance:null};
  const alignedPersonality=syncPerformancePersonalityV1113(personality,alignedPerformance);
  if(!alignedPersonality)return {staged:null,conductor:null,personality:null,performance:null,dance:null};
  return {staged:dance.remix,conductor:syncPersonalityConductorV1112(conductor,alignedPersonality),
   personality:alignedPersonality,performance:alignedPerformance,dance};
 };
 const withVocal=(performance:PerformanceShowV1113|null,dance:DanceShowV1114|null,force=false)=>{
  if(!vocalEnabled&&!force)return null;
  return directVocalActingV1115(base,performance,dance,
   {style:vocalStyle,expression:vocalExpression,intensityCap:cap});
 };
 const withInteraction=(performance:PerformanceShowV1113|null,dance:DanceShowV1114|null,
  vocal:VocalShowV1115|null,force=false)=>{
  if(!interactionEnabled&&!force)return null;
  return directArtistInteractionV1116(base,performance,dance,vocal,
   {style:interactionStyle,strength:interactionStrength,intensityCap:cap});
 };
 const songDuration=music.track?.durationMs??0;
 const followAvailable=music.isPlaying&&Number.isFinite(songDuration)&&songDuration>0&&
  Number.isFinite(music.progressMs)&&music.progressMs>=0;
 const previewPercent=followSong&&followAvailable?
  Math.min(1,Math.max(0,music.progressMs/songDuration)):conductorScrub/100;
 const activeConductorCue=sampleConductorCueV1111(conductorPreview,previewPercent);
 const activePersonalityCue=sampleAvatarPersonalityV1112(personalityPreview,previewPercent);
 const activePerformanceCue=samplePerformanceCueV1113(performancePreview,previewPercent);
 const activeDanceCue=sampleDanceCueV1114(dancePreview,previewPercent);
 const activeVocalCue=sampleVocalCueV1115(vocalPreview,previewPercent);
 const activeInteractionCue=sampleInteractionCueV1116(interactionPreview,previewPercent);
 const activeStageCue=sampleStageCueV1117(stagePreview,previewPercent);
 const stageOptions=()=>({style:stageStyle,strength:stageStrength,intensityCap:cap});
 const canSample=audio.active&&music.isPlaying&&!preferences.reducedMotion&&!!currentTrack;
 // Tracking is strictly session-only: stop and forget measurements on a song
 // change, playback interruption, microphone loss or reduced-motion preference.
 useEffect(()=>{
  emotionSession.current=createMusicEmotionSessionV1108();
  setReading(null);setDropReading(null);setDropCue(null);setSampleCount(0);setSampling(false);
  setFollowSong(false);setConductorPreview(null);setPersonalityPreview(null);setPerformancePreview(null);setDancePreview(null);setVocalPreview(null);setInteractionPreview(null);
 },[currentTrack]);
 useEffect(()=>{
  // Completed readings are also invalidated if the microphone or playback stops.
  if(!canSample){
   emotionSession.current=createMusicEmotionSessionV1108();
   setSampleCount(0);setReading(null);setDropReading(null);setDropCue(null);setSampling(false);
  }
 },[canSample]);
 useEffect(()=>{
  if(!sampling)return;
  if(!canSample){
   emotionSession.current=createMusicEmotionSessionV1108();
   setSampleCount(0);setReading(null);setDropReading(null);setDropCue(null);setSampling(false);
   return;
  }
  const old=emotionSession.current;
  const next=collectMusicEmotionSampleV1108(old,audio.metrics,{
   microphoneActive:audio.active,playing:music.isPlaying,reducedMotion:preferences.reducedMotion
  },Date.now(),currentTrack);
  if(next!==old){
   emotionSession.current=next;
   setSampleCount(next.samples.length);
   const measured=readMusicEmotionV1108(next);
   setReading(measured);setDropReading(readDropReadinessV1110(next,measured));
  }
 },[sampling,canSample,currentTrack,audio.active,audio.metrics,music.isPlaying,preferences.reducedMotion]);
 const startEmotionMeasurement=()=>{
  if(!canSample)return;
  emotionSession.current=createMusicEmotionSessionV1108();
  setReading(null);setDropReading(null);setDropCue(null);setSampleCount(0);setSampling(true);
  setMoodExplanation('Messung läuft ausschließlich lokal. Noch kein Vorschlag übernommen.');
 };
 const adoptEmotionSuggestion=()=>{
  if(sampling||!canSample)return;
  const recommended=suggestCreativeDirectionV1108(reading);
  if(!recommended)return;
  setDirector(recommended.style);setContrast(recommended.contrast);
  setSurprise(recommended.surprise);setMood(recommended.mood);
  invalidate();
  setMoodExplanation(`Messwertbasierter Regievorschlag übernommen (${Math.round(reading!.confidence*100)}% Messsicherheit). Erstelle nun ausdrücklich eine Vorschau; keine Bühne oder Lampe wurde geschaltet.`);
  setReading(null);setDropReading(null);setSampleCount(0);emotionSession.current=createMusicEmotionSessionV1108();
 };
 const acceptDropCue=()=>{
  if(busy||sampling||!canSample||!dropReading?.cue||dropReading.confidence<.56)return;
  invalidate();setDropCue(dropReading.cue);
  setStatus('V1110 Drop-Regieidee vorgemerkt: wirkt nur auf eine neue Vorschau, noch nichts am Showplan geändert.');
 };
 const discardEmotionMeasurement=()=>{
  emotionSession.current=createMusicEmotionSessionV1108();
  setSampling(false);setReading(null);setDropReading(null);setDropCue(null);setSampleCount(0);
  setMoodExplanation('Lokale Messwerte verworfen. Es wurde nichts gespeichert oder übertragen.');
 };
 const invalidate=()=>{setStagePreview(null);controller.current?.abort();requestId.current++;setBusy(false);setPreview(null);setStoryPreview(null);setConductorPreview(null);setPersonalityPreview(null);setPerformancePreview(null);setDancePreview(null);setVocalPreview(null);setInteractionPreview(null);setSource(null);setStatus('');};
 useEffect(()=>{setStagePreview(null);controller.current?.abort();requestId.current++;setPreview(null);setStoryPreview(null);setConductorPreview(null);setPersonalityPreview(null);setPerformancePreview(null);setDancePreview(null);setVocalPreview(null);setInteractionPreview(null);setSource(null);setBusy(false);
  return ()=>{controller.current?.abort();requestId.current++;};
 },[signature]);
 const local=(storyOnly=false,conductorOnly=false,personalityOnly=false,performanceOnly=false,danceOnly=false,vocalOnly=false,interactionOnly=false,stageOnly=false)=>{
  invalidate();
  const curated=curateCreativeRemixV1107(localAiShowRemixV1106(idea,style,cap),creativeBrief(),cap);
  if(!curated){setStatus('Regieentwurf ungültig – keine Änderungen übernommen.');return;}
  const story=storyOnly||storyEnabled?storyFor(curated):null;
  if((storyOnly||storyEnabled)&&!story){setStatus('Storybogen konnte nicht sicher geplant werden. Der Showplan bleibt unverändert.');return;}
  const {staged,story:stagedStory,conductor}=withConductor(curated,story,conductorOnly);
  if(!staged||(story&&!stagedStory)){setStatus('Drop-Regieimpuls ungültig. Bestehender Showplan unverändert.');return;}
  const personalized=withPersonality(staged,conductor,personalityOnly||performanceOnly||danceOnly||vocalOnly||interactionOnly||performanceEnabled||danceEnabled||vocalEnabled||interactionEnabled);
  if(!personalized.staged){setStatus('V1112 Avatar-Persönlichkeiten konnten nicht sicher geplant werden. Bestehende Show unverändert.');return;}
  const directed=withPerformance(personalized.staged,personalized.conductor,personalized.personality,performanceOnly||danceOnly||vocalOnly||interactionOnly||danceEnabled||vocalEnabled||interactionEnabled);
  if(!directed.staged){setStatus('V1113 Performance Director konnte nicht sicher geplant werden. Bestehende Show unverändert.');return;}
  const danced=withDance(directed.staged,directed.conductor,directed.personality,directed.performance,danceOnly||vocalOnly||interactionOnly||vocalEnabled||interactionEnabled);
  if(!danced.staged){setStatus('V1114 Tanzregie konnte nicht sicher geplant werden. Bestehende Show unverändert.');return;}
  const vocal=withVocal(danced.performance,danced.dance,vocalOnly||interactionOnly||interactionEnabled);
  if((vocalOnly||interactionOnly||vocalEnabled||interactionEnabled)&&!vocal){setStatus('V1115 Vocal Acting konnte nicht sicher geplant werden. Bestehende Show unverändert.');return;}
  const interaction=withInteraction(danced.performance,danced.dance,vocal,interactionOnly);
  if((interactionOnly||interactionEnabled)&&!interaction){setStatus('V1116 Interaktion konnte nicht sicher geplant werden. Show unverändert.');return;}
  const finalRemix=interaction?.remix??danced.staged;
  const stage=stageEnabled||stageOnly?directStageTransformationV1117(base,finalRemix,stageOptions()):null;
  if((stageEnabled||stageOnly)&&!stage){setStatus('V1117 Bühnenverwandlung konnte nicht sicher geplant werden. Show unverändert.');return;}
  setStagePreview(stage);setInteractionPreview(interaction);setVocalPreview(vocal);
  setStoryPreview(stagedStory?syncDropStoryV1110(stagedStory,stage?.remix??finalRemix):null);
  setConductorPreview(danced.conductor);setPersonalityPreview(danced.personality);setPerformancePreview(danced.performance);setDancePreview(danced.dance);
  setPreview(stage?.remix??finalRemix);setBaseSignature(signature);setSource('local');
  setStatus(stage?'V1117: sieben Bühnenverwandlungen als lokale Vorschau. Reale virtuelle Plattformen nur nach separater Freigabe; keine Gerätebefehle.':interaction?'V1116: sieben Artist-Interaktionen als Vorschau. Kameraführung über vorhandene Modi; echte Partnerreaktionen nur durch separate V1079-Aktivierung bei synchronisierten Lyrics. Keine automatisch erkannten Sänger.':vocal?'V1115 Vocal Acting: sieben Szenen mit Bühnen-Vocal-Rollen als Vorschau. Die tatsächliche Lippen-/Gestik-Engine bleibt bis zur gesonderten Zustimmung unverändert. Keine Stimmen oder Phoneme erkannt.':danced.dance?'V1114: Solo, Duo, Kanon und Unisono als sichere Vorschau. Echte GLB-Tanzclips können zusätzlich in der Stage Crew mit V1114 Automatik aktiviert werden. Noch kein Gerät oder Clip geschaltet.':directed.performance?'V1113 Performance Director: sieben abgestimmte Charakter-Momente als Vorschau bereit; gemeinsam unterstützte Tanz- und Kameramodi können nach Bestätigung übernommen werden. Keine einzelnen GLB-Animationen oder Geräte gesteuert.':personalized.personality?'V1112 Avatar Personality: drei individuelle Performer-Rollen sind als Vorschau geplant; nur bestehende Kamera-/Tanzmodi werden später übernommen. Keine GLB-Clips oder Geräte geschaltet.':conductor?'V1111 Live Show Conductor: sieben koordinierte Szenen als lokale Regieprobe bereit. Keine Bühne oder Geräte geschaltet.':story?'V1109 lokaler Storybogen als Vorschau bereit. Keine KI-Anfrage, kein Gerät geschaltet und noch nichts übernommen.':
   'Lokaler Remix: keine Netzwerk- oder KI-Anfrage. Noch nichts übernommen.');
 };
 const remote=async()=>{
  if(idea.trim().length<4||idea.length>400){setStatus('Bitte 4 bis 400 Zeichen eingeben.');return;}
  invalidate();
  const id=requestId.current;
  const current=new AbortController();controller.current=current;
  setBusy(true);setStatus('KI erstellt einen Vorschlag. Die Live-Show bleibt unverändert.');
  try{
   const response=await fetch('/api/ai/show-remix',{method:'POST',cache:'no-store',signal:current.signal,
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({prompt:idea,genre:style,intensityCap:cap,brief:creativeBrief()})});
   const data:unknown=await response.json();
   if(requestId.current!==id)return;
   const parsed:{remix?:unknown;error?:string}=data&&typeof data==='object'
    ? data as {remix?:unknown;error?:string}:{};
   if(!response.ok)throw Error(typeof parsed.error==='string'?parsed.error:'KI-Anfrage fehlgeschlagen.');
   const proposal=normalizeAiShowRemixV1106(parsed.remix);
   if(!proposal||proposal.acts.some(a=>a.intensity>cap))throw Error('KI-Vorschlag konnte nicht sicher validiert werden.');
   const story=storyEnabled?storyFor(proposal):null;
   if(storyEnabled&&!story)throw Error('Storybogen konnte nicht sicher geplant werden.');
   const {staged,story:stagedStory,conductor}=withConductor(proposal,story);
   if(!staged||(story&&!stagedStory))throw Error('Drop-Regieimpuls konnte nicht sicher geplant werden.');
   const personalized=withPersonality(staged,conductor,performanceEnabled||danceEnabled||vocalEnabled||interactionEnabled);
   if(!personalized.staged)throw Error('Avatar-Persönlichkeiten konnten nicht sicher geplant werden.');
   const directed=withPerformance(personalized.staged,personalized.conductor,personalized.personality,danceEnabled||vocalEnabled||interactionEnabled);
   if(!directed.staged)throw Error('Performance-Regie konnte nicht sicher geplant werden.');
   const danced=withDance(directed.staged,directed.conductor,directed.personality,directed.performance,vocalEnabled||interactionEnabled);
   if(!danced.staged)throw Error('Tanzchoreografie konnte nicht sicher geplant werden.');
   const vocal=withVocal(danced.performance,danced.dance,interactionEnabled);
   if((vocalEnabled||interactionEnabled)&&!vocal)throw Error('V1115 Vocal Acting konnte nicht sicher geplant werden.');
   const interaction=withInteraction(danced.performance,danced.dance,vocal);
   if(interactionEnabled&&!interaction)throw Error('V1116 Artist Interaction konnte nicht sicher geplant werden.');
   const finalRemix=interaction?.remix??danced.staged;
   const stage=stageEnabled?directStageTransformationV1117(base,finalRemix,stageOptions()):null;
   if(stageEnabled&&!stage)throw Error('V1117 Bühnenverwandlung konnte nicht sicher geplant werden.');
   setStagePreview(stage);setInteractionPreview(interaction);setVocalPreview(vocal);
   setStoryPreview(stagedStory?syncDropStoryV1110(stagedStory,stage?.remix??finalRemix):null);
   setConductorPreview(danced.conductor);setPersonalityPreview(danced.personality);setPerformancePreview(danced.performance);setDancePreview(danced.dance);
   setPreview(stage?.remix??finalRemix);setSource('ai');setBaseSignature(signature);
   setStatus('KI-Vorschlag bereit. Prüfe alle sieben Szenen und übernimm ihn ausdrücklich.');
  }catch(error){
   if(requestId.current===id&&!current.signal.aborted)
    setStatus((error instanceof Error?error.message:'KI vorübergehend nicht erreichbar.')+' Du kannst den lokalen Remix verwenden.');
  }finally{if(requestId.current===id)setBusy(false);}
 };
 const apply=()=>{
  if(!preview)return;
  if(signature!==baseSignature){setStatus('Der Showplan wurde inzwischen geändert. Bitte einen neuen Remix erstellen.');setPreview(null);return;}
  const result=applyAiShowRemixV1106(base,preview,cap);
  if(!result){setStatus('Remix ungültig – bestehender Showplan bleibt erhalten.');return;}
  undo.current={before:plan,after:JSON.stringify(result)};
  setCanUndo(true);
  updatePreferences({arenaShowPlanV1040:result});
  setPreview(null);setStoryPreview(null);setConductorPreview(null);setPersonalityPreview(null);setPerformancePreview(null);setDancePreview(null);setVocalPreview(null);setInteractionPreview(null);setStagePreview(null);
  setStatus('Remix gespeichert. Die 360°-Showplan-Aktivierung bleibt unverändert – keine Geräte wurden gesteuert.');
 };
 const activateStageTransformation=()=>{
  if(busy||!stagePreview||!preview||signature!==baseSignature){
   setStatus('Bitte zuerst eine aktuelle V1117-Bühnenprobe erstellen.');return;
  }
  if(preferences.reducedMotion){setStatus('Bewegungsreduktion aktiv: keine Bühnenautomatik eingeschaltet.');return;}
  if(!preferences.arenaShowDesignerEnabledV1040||!preferences.arenaConcertDirectorEnabledV1048){
   setStatus('Bitte zuerst 360°-Show Designer und Konzertdirektor in den Bühneneinstellungen aktivieren.');return;
  }
  if(stageUndo.current){setStatus('Bühnenautomatik ist bereits übernommen. Vorher zuerst zurücksetzen.');return;}
  const preset=stageLivePresetV1117(stageOptions());
  if(!preset){setStatus('Ungültige Bühnenstärke.');return;}
  const before=Object.fromEntries(Object.keys(preset).map(k=>
   [k,preferences[k as keyof typeof preferences]])) as Partial<typeof preferences>;
  updatePreferences(preset);
  stageUndo.current={before,after:preset};setStageCanUndo(true);
  setStatus('V1117: vorhandene virtuelle Bühnenbewegung aktiviert. Manuelle Deck-/Float-Modi, Pause, GPU-Grenze und Bewegungsreduktion haben weiterhin Vorrang. Keine Govee-Steuerung.');
 };
 const revertStageTransformation=()=>{
  const saved=stageUndo.current;if(!saved)return;
  if(!Object.entries(saved.after).every(([k,v])=>preferences[k as keyof typeof preferences]===v)){
   stageUndo.current=null;setStageCanUndo(false);
   setStatus('Bühneneinstellungen wurden manuell geändert; Rückgängig nicht ausgeführt.');return;
  }
  updatePreferences(saved.before);stageUndo.current=null;setStageCanUndo(false);
  setStatus('Frühere Einstellungen für Bühnenbewegung wiederhergestellt.');
 };
 const activateCrewStory=()=>{
  if(!dancePreview||!preview){setStatus('Bitte zuerst eine neue V1114-Probe erstellen.');return;}
  if(crewUndo.current){setStatus('Die Automatik ist bereits aktiviert. Erst den vorherigen Crew-Modus wiederherstellen.');return;}
  const after=writeCrewSettings({...crewSettings,mode:'story',enabled:true});
  crewUndo.current={before:crewSettings,after:JSON.stringify(after)};
  setCrewCanUndo(true);
  setStatus('V1114 Stage-Crew-Automatik ausdrücklich aktiviert. Die echten Clips laufen nur bei laufender Wiedergabe, vorhandenem Abschnittssignal, eingerichteter Trio-Bühne und ohne manuelle Priorität.');
 };
 const revertCrewStory=()=>{
  if(!crewUndo.current)return;
  if(JSON.stringify(crewSettings)!==crewUndo.current.after){
   crewUndo.current=null;setCrewCanUndo(false);
   setStatus('Stage Crew wurde inzwischen manuell geändert; automatisches Zurücksetzen abgebrochen.');return;
  }
  writeCrewSettings(crewUndo.current.before);
  crewUndo.current=null;setCrewCanUndo(false);
  setStatus('Früherer Stage-Crew-Modus wiederhergestellt.');
 };
 const revert=()=>{
  if(!undo.current)return;
  const saved=normalizeArenaShowPlanV1040(preferences.arenaShowPlanV1040);
  if(JSON.stringify(saved)!==undo.current.after){
   setStatus('Der Showplan wurde nach dem Remix geändert; Rückgängig würde manuelle Änderungen überschreiben.');
   setCanUndo(false);undo.current=null;return;
  }
  updatePreferences({arenaShowPlanV1040:undo.current.before??undefined});
  undo.current=null;setCanUndo(false);setStatus('Vorheriger Showplan wiederhergestellt.');
 };
 const applyLiveInteraction=()=>{
  if(busy||!interactionPreview||!preview||signature!==baseSignature){
   setStatus('Bitte zuerst eine aktuelle V1116-Interaktionsprobe erstellen.');return;
  }
  if(preferences.reducedMotion){setStatus('Bewegungsreduktion aktiv: keine Interaktion eingeschaltet.');return;}
  if(interactionUndo.current){setStatus('Live-Interaktion wurde bereits übernommen. Zuerst zurücksetzen.');return;}
  const preset=liveArtistPresetV1116({style:interactionStyle,strength:interactionStrength,intensityCap:cap});
  if(!preset){setStatus('Ungültige Interaktionsstärke.');return;}
  const before=Object.fromEntries(Object.keys(preset).map(k=>[k,preferences[k as keyof typeof preferences]])) as Partial<typeof preferences>;
  updatePreferences(preset);
  interactionUndo.current={before,after:preset};setInteractionCanUndo(true);
  setStatus('V1116 Live-Interaktion bewusst eingeschaltet: vorhandene V1079-Partnerakzente nur bei synchronisierten Lyrics-Lücken, laufender Wiedergabe und kompatibler Bühne. Keine Sänger neu zugeordnet.');
 };
 const revertLiveInteraction=()=>{
  const saved=interactionUndo.current;if(!saved)return;
  if(!Object.entries(saved.after).every(([k,v])=>preferences[k as keyof typeof preferences]===v)){
   interactionUndo.current=null;setInteractionCanUndo(false);
   setStatus('Interaktionsregler inzwischen manuell geändert; automatisches Rückgängig abgebrochen.');return;
  }
  updatePreferences(saved.before);interactionUndo.current=null;setInteractionCanUndo(false);
  setStatus('Vorherige Live-Interaktion wiederhergestellt.');
 };
 const applyVocalPreset=()=>{
  if(busy||!vocalPreview||!preview||signature!==baseSignature){
   setStatus('Bitte zuerst eine aktuelle V1115-Vorschau erstellen.');return;
  }
  if(preferences.reducedMotion){setStatus('Bewegungsreduktion ist aktiv. Vocal-Preset nicht eingeschaltet.');return;}
  const preset=vocalPresetV1115({style:vocalStyle,expression:vocalExpression,intensityCap:cap});
  if(!preset){setStatus('V1115 Vocal-Preset ist ungültig.');return;}
  const before=Object.fromEntries(Object.keys(preset).map(key=>
   [key,preferences[key as keyof typeof preferences]])) as Partial<typeof preferences>;
  updatePreferences(preset);
  vocalUndo.current={before,after:preset};setVocalCanUndo(true);
  setStatus('V1115: vorhandene Lyrics-/Mimik-/Körper-Regler bewusst aktiviert. Vorhandene manuelle Sängerzuordnungen, Audio und GLB-Dateien unverändert.');
 };
 const revertVocalPreset=()=>{
  const saved=vocalUndo.current;if(!saved)return;
  if(!Object.entries(saved.after).every(([key,value])=>preferences[key as keyof typeof preferences]===value)){
   vocalUndo.current=null;setVocalCanUndo(false);
   setStatus('Vocal-Regler wurden manuell geändert: automatisches Rückgängig abgebrochen.');return;
  }
  updatePreferences(saved.before);vocalUndo.current=null;setVocalCanUndo(false);
  setStatus('V1115 Vocal-Regler auf die vorherigen Werte zurückgesetzt.');
 };
 return <fieldset className="arena-v1106-ai-remix" aria-label="V1106 KI Show Remix">
  <legend>V1106 · KI Creative Producer – Show Remix</legend>
  <p>Aus einer Idee werden sieben abwechslungsreiche, zusammenhängende 360°-Konzertphasen.
   Die Vorschläge verändern erst nach deinem Klick den vorhandenen Showplan;
   individuelle Zeitgrenzen bleiben erhalten.</p>
  <label>Was soll die Konzertshow besonders machen?
   <textarea rows={3} maxLength={400} value={idea} disabled={busy}
    onChange={e=>{setIdea(e.target.value);invalidate();}}
    placeholder="z. B. Hardtekk: ruhiger Start, explosive Hook, Laser-Tunnel, episches Finale"/>
  </label>
  <fieldset aria-label="V1107 KI Regiefeinschliff" className="arena-v1107-creative-directions">
   <legend>V1107 · KI Creative Producer 2.0</legend>
   <label>Regiestil
    <select value={director} disabled={busy} onChange={e=>{setDirector(e.target.value as CreativeStyleV1107);invalidate();}}>
     <option value="cinematic">Filmisch und dramaturgisch</option>
     <option value="festival">Große Festivalshow</option>
     <option value="intimate">Intim und emotional</option>
     <option value="surprise">Überraschende Perspektiven</option>
    </select>
   </label>
   <label>Kontraste zwischen Ruhe und Höhepunkten: {contrast}%
    <input type="range" min="0" max="80" step="5" value={contrast} disabled={busy}
     onChange={e=>{setContrast(Number(e.target.value));invalidate();}}/>
   </label>
   <label>Kreative Überraschungen: {surprise}%
    <input type="range" min="0" max="70" step="5" value={surprise} disabled={busy}
     onChange={e=>{setSurprise(Number(e.target.value));invalidate();}}/>
   </label>
   <label>Musikalischer Stimmungshinweis (optional)
    <select value={mood} disabled={busy} onChange={e=>{setMood(e.target.value as MusicMoodHintV1108);invalidate();}}>
     <option value="none">Ohne Stimmungshinweis</option>
     <option value="calm">Ruhig / zurückhaltend</option>
     <option value="atmospheric">Atmosphärisch</option>
     <option value="focused">Fokussiert</option>
     <option value="euphoric">Euphorisch</option>
     <option value="intense">Intensiv</option>
    </select>
   </label>
   <fieldset aria-label="V1108 Music Emotion Intelligence" className="arena-v1108-emotion-intelligence">
    <legend>V1108 · Musik-Energie &amp; Dramaturgie</legend>
    <p>Auf Wunsch misst die App über mehrere Sekunden lokale Energie, Frequenzen und Beat-Impulse.
     Daraus schätzt sie einen Spannungsverlauf und macht einen unverbindlichen Regievorschlag.</p>
    <button type="button" disabled={busy||sampling||!canSample} onClick={startEmotionMeasurement}>
     Lokale Musikanalyse starten
    </button>
    {sampling&&<button type="button" onClick={()=>setSampling(false)}>
      Analyse beenden und Vorschlag prüfen
    </button>}
    {(reading||sampling)&&<p role="status" aria-live="polite">
      {reading?<>Messdauer: {(reading.durationMs/1000).toFixed(1)} s · {reading.sampleCount} Messpunkte ·
       Energie: {Math.round(reading.energy*100)}% · Impulsklarheit: {Math.round(reading.beatClarity*100)}% ·
       Verlauf: {reading.trend==='rising'?'steigend':reading.trend==='falling'?'abfallend':'gleichmäßig'} ·
       Messsicherheit: {Math.round(reading.confidence*100)}%.
       {reading.ready?' Vorschlag bereit.':' Für die Übernahme ist ein klareres, längeres Signal nötig.'}
      </>:<>Messung läuft: {sampleCount} lokale Messpunkte. Mindestens 4,5 Sekunden erforderlich.</>}
    </p>}
    {reading&&<p role="note" aria-label="V1108 Musikstimmung Vorschau">
      Geschätzte Musikenergie: {reading.mood} · maximale gemessene Energie: {Math.round(reading.peakEnergy*100)}%.
      Keine echte Emotionserkennung oder zuverlässige Hook-/Drop-Erkennung.
    </p>}
    <button type="button" disabled={busy||sampling||!canSample||!suggestCreativeDirectionV1108(reading)}
     onClick={adoptEmotionSuggestion}>Regievorschlag bewusst übernehmen</button>
    {(sampling||reading)&&<button type="button" onClick={discardEmotionMeasurement}>Messung verwerfen</button>}
    <small role="note">{moodExplanation} Die Analyse ist nur bei laufendem Song, aktivem Mikrofon
     und ohne Bewegungsreduktion möglich. Keine Audioaufzeichnung, keine automatische KI-Anfrage,
     keine Audioübertragung, keine Speicherung. Es werden nur flüchtige Messwerte im Arbeitsspeicher
     verwendet. Die Stimmung ist eine unverbindliche Energie-Heuristik.</small>
    <fieldset aria-label="V1110 AI Drop Prediction" className="arena-v1110-drop-prediction">
     <legend>V1110 · Drop-Radar &amp; Regievorschau</legend>
     <p>Das lokale Drop-Radar erkennt nur bereits gemessene Spannungsanstiege oder Einschläge.
      Es kann einen kommenden Höhepunkt vermuten, aber weder einen echten Drop noch dessen Zeitpunkt sicher vorhersagen.</p>
     {dropReading?<p role="note" aria-label="V1110 Drop-Radar Ergebnis">
      {dropReading.message} · Energieanstieg: {Math.round(dropReading.energyRise*100)} Punkte ·
      Beat-Klarheit: {Math.round(dropReading.beatClarity*100)}% ·
      Messsicherheit: {Math.round(dropReading.confidence*100)}%.
     </p>:<small>Starte oben die lokale Musikanalyse (mindestens fünf Sekunden). Ohne Mikrofon bleibt das Radar inaktiv.</small>}
     <button type="button" disabled={busy||sampling||!canSample||!dropReading?.cue||dropReading.confidence<.56}
      onClick={acceptDropCue}>Drop-Dramaturgie für nächste Vorschau vormerken</button>
     {dropCue&&<p role="status">{dropCue==='prepare'?'Aufbau vorbereiten':'Gemessenen Einschlag inszenieren'} ist vorgemerkt.
      Kamera, Laserlook und Tanz werden erst beim nächsten Entwurf zur Vorschau geändert.</p>}
     {dropCue&&<button type="button" onClick={()=>{setDropCue(null);invalidate();}}>Drop-Regieidee zurücksetzen</button>}
     <small>Keine automatische Lichtsteuerung, Stroboskope, Gerätebefehle, Audioaufzeichnung oder Cloud-Übertragung.
      Der endgültige Showplan wird ausschließlich mit „Diese sieben Szenen in meinen Showplan übernehmen“ verändert.</small>
    </fieldset>
   </fieldset>
  </fieldset>
  <fieldset aria-label="V1109 AI Concert Story Engine" className="arena-v1109-concert-story">
   <legend>V1109 · AI Concert Story Engine</legend>
   <p>Plane einen Spannungsbogen über den ganzen Song: Ruhe, Aufbau, Höhepunkte, Atempause und Finale.
    Die sieben Zeitabschnitte bleiben unverändert. Das ist eine dramaturgische Planung,
    keine Erkennung von Strophen, Hooks oder Drops im echten Audio.</p>
   <label>Erzählbogen
    <select value={storyArc} disabled={busy} onChange={e=>{setStoryArc(e.target.value as ConcertStoryArcV1109);invalidate();}}>
     {Object.entries(STORY_ARC_LABELS_V1109).map(([value,name])=><option key={value} value={value}>{name}</option>)}
    </select>
   </label>
   <label>Spannungsverteilung
    <select value={storyPacing} disabled={busy} onChange={e=>{setStoryPacing(e.target.value as ConcertStoryPacingV1109);invalidate();}}>
     <option value="balanced">Ausgewogener Verlauf</option>
     <option value="slow-burn">Langsamer Spannungsaufbau</option>
     <option value="early-energy">Früher erster Höhepunkt</option>
    </select>
   </label>
   <label>
    <input type="checkbox" checked={storyEnabled} disabled={busy}
     onChange={e=>{setStoryEnabled(e.target.checked);invalidate();}}/>
    Storybogen auch auf neue Offline-/OpenAI-Remixe anwenden
   </label>
   <button type="button" disabled={busy} onClick={()=>local(true)}>Storybogen lokal entwerfen</button>
   <small>Der Story-Entwurf verwendet nur den aktuellen Songtitel, das gewählte Genre und deine
    Show-Einstellungen. Keine Audioaufzeichnung, keine automatischen OpenAI- oder Govee-Anfragen.
    Auch bei bewusst aktivierter Storyfunktion wird die bestehende Show erst nach deiner Bestätigung gespeichert.</small>
  </fieldset>
  <fieldset aria-label="V1111 AI Live Show Conductor" className="arena-v1111-live-conductor">
   <legend>V1111 · AI Live Show Conductor</legend>
   <p>Kamera, Avatar-Tanz, Plattform und Laserlook werden pro Songabschnitt gemeinsam geplant –
    mit ruhigem Einstieg, spannungsvollem Aufbau, Ensemble-Höhepunkt, Atempause und Finale.
    Die bestehende 360°-Show-Timeline führt den genehmigten Plan später aus.</p>
   <label>Regiecharakter
    <select value={conductorMode} disabled={busy} onChange={e=>{setConductorMode(e.target.value as ConductorModeV1111);invalidate();}}>
     <option value="cinematic">Filmisch und präzise</option>
     <option value="festival">Große Arena-Energie</option>
     <option value="balanced">Ausgewogen und fließend</option>
    </select>
   </label>
   <label>
    <input type="checkbox" checked={conductorSurprise} disabled={busy}
     onChange={e=>{setConductorSurprise(e.target.checked);invalidate();}}/>
    Überraschenden Perspektivwechsel vor dem Finale erlauben
   </label>
   <label>
    <input type="checkbox" checked={conductorEnabled} disabled={busy}
     onChange={e=>{setConductorEnabled(e.target.checked);invalidate();}}/>
    Konzertregie auch auf neue Offline-/OpenAI-Entwürfe anwenden
   </label>
   <button type="button" disabled={busy} onClick={()=>local(false,true)}>V1111 Konzertregie jetzt proben</button>
   <small>Die Probe ist eine lokale, lesbare Partitur und keine automatische Echtzeit-KI-Anfrage.
    Weder Govee-Geräte noch Strobo, Pyrotechnik oder Mikrofon werden ausgelöst.
    Nur der vorhandene Bestätigungsbutton kann den 360°-Showplan speichern.
    Es werden keine Songabschnitte oder Drop-Zeitpunkte aus Audiodaten erfunden.</small>
  </fieldset>
  <fieldset aria-label="V1112 AI Avatar Personality" className="arena-v1112-avatar-personality">
   <legend>V1112 · AI Avatar Personality</legend>
   <p>Gib den drei mitgelieferten Stage-Crew-Avataren individuelle Bühnencharaktere.
    Die Probe zeigt Fokus und Nebenrollen für alle sieben Szenen. Die übernommene
    360°-Timeline beeinflusst aktuell den <strong>gemeinsamen</strong> Tanz- und Kameramodus;
    individuelle GLB-Animationen oder die Zuordnung der Kamera zu einem bestimmten Avatar
    werden noch nicht automatisch gesteuert.</p>
   {cast.map((member,i)=><label key={member.id}>{member.label} Bühnenpersönlichkeit
    <select value={member.personality} disabled={busy} onChange={e=>{
     setCast(old=>old.map((person,j)=>j===i?{...person,personality:e.target.value as AvatarPersonalityV1112}:person));
     invalidate();
    }}>
     {Object.entries(AVATAR_PERSONALITY_LABELS_V1112).map(([personality,label])=><option key={personality} value={personality}>{label}</option>)}
    </select>
   </label>)}
   <label><input type="checkbox" checked={personalityEnabled} disabled={busy}
    onChange={e=>{setPersonalityEnabled(e.target.checked);invalidate();}}/>
    Charakterregie auch auf neue Offline-/OpenAI-Entwürfe anwenden
   </label>
   <button type="button" disabled={busy} onClick={()=>local(false,true,true)}>V1112 Avatar-Performance jetzt proben</button>
   <small>Keine dauernde KI-Abfrage. Die Charakterplanung bleibt lokal, ist ein Vorschlag
    und wird erst mit dem vorhandenen Showplan-Bestätigungsbutton übernommen.
    Keine Mikrofon- oder Gerätebefehle.</small>
  </fieldset>
  <fieldset aria-label="V1113 AI Performance Director" className="arena-v1113-performance-director">
   <legend>V1113 · AI Performance Director</legend>
   <p>Die drei Bühnenpersönlichkeiten erhalten einen dynamischen Auftritt über alle sieben Songphasen:
    ruhiger Einstieg, präzise Akzente, wechselnde Solo-Fokusse, Ensemble-Moment und Finale.
    Energie, Gestik und Spotlight werden pro Künstler separat als <strong>Probenpartitur</strong> ausgewiesen.
    Die Live-Engine verwendet weiterhin nur vorhandene gemeinsame Kamera- und Tanzmodi.</p>
   <label>Performance-Regiestil
    <select disabled={busy} value={performanceMode} onChange={e=>{
     setPerformanceMode(e.target.value as PerformanceModeV1113);invalidate();}}>
     {Object.entries(PERFORMANCE_MODE_LABELS_V1113).map(([key,name])=><option key={key} value={key}>{name}</option>)}
    </select>
   </label>
   <label>Ausdruckskraft in der Charakterprobe: {performanceExpression}%
    <input type="range" min="20" max="80" step="10" disabled={busy}
     value={performanceExpression} onChange={e=>{setPerformanceExpression(Number(e.target.value));invalidate();}}/>
   </label>
   <label><input type="checkbox" disabled={busy} checked={performanceEnabled}
    onChange={e=>{setPerformanceEnabled(e.target.checked);invalidate();}}/>
    Performance-Regie auch auf neue Offline-/OpenAI-Vorschläge anwenden
   </label>
   <button type="button" disabled={busy} onClick={()=>local(false,true,true,true)}>
    V1113 Bühnenperformance jetzt proben
   </button>
   <small>Die individuellen Gesten sind noch keine echten, separat gesteuerten GLB-Clips.
    Die Regie verändert erst nach deiner ausdrücklichen Bestätigung existierende gemeinsame
    Kamera-/Tanzmodi im 360°-Showplan. Keine automatische Geräte-, Mikrofon- oder OpenAI-Abfrage.</small>
  </fieldset>
  <fieldset aria-label="V1114 AI Dance Choreographer" className="arena-v1114-ai-dance-choreographer">
   <legend>V1114 · AI Dance Choreographer 4.0</legend>
   <p>Sieben Tanzszenen mit Solo, Duo, 2-Beat-Kanon und gemeinsamem Finale. Die
    Probenpartitur nennt pro Avatar existierende GLB-Clip-Vorschläge und Rollen.
    Die neue optionale Stage-Crew-Automatik schaltet die tatsächlich geladenen
    Tanzclips je nach <em>vorhandenem</em> Songabschnitt um.</p>
   <label>Choreografie-Stil
    <select value={danceStyle} disabled={busy} onChange={e=>{setDanceStyle(e.target.value as DanceStyleV1114);invalidate();}}>
     {Object.entries(DANCE_STYLE_LABELS_V1114).map(([value,label])=><option key={value} value={value}>{label}</option>)}
    </select>
   </label>
   <label><input type="checkbox" checked={danceEnabled} disabled={busy}
    onChange={e=>{setDanceEnabled(e.target.checked);invalidate();}}/>
    Tanzregie auch auf neue Offline-/OpenAI-Entwürfe anwenden
   </label>
   <button type="button" disabled={busy} onClick={()=>local(false,true,true,true,true)}>
    V1114 Tanzchoreografie jetzt proben
   </button>
   {crewCanUndo&&<button type="button" onClick={revertCrewStory}>Früheren Stage-Crew-Modus wiederherstellen</button>}
   <small>Keine fiktiven GLB-Animationen: Für echte Wiedergabe kann die bestehende
    Stage-Crew-Engine im separaten Schritt aktiviert werden. Manuelle Clips,
    Wiedergabepause und reduzierte Bewegung haben immer Vorrang. Der
    360°-Showplan ändert sich nur mit dem bisherigen Bestätigungsbutton.</small>
  </fieldset>
  <fieldset aria-label="V1115 AI Vocal Acting" className="arena-v1115-ai-vocal-acting">
   <legend>V1115 · AI Vocal Acting &amp; Lip-Sync Intelligence</legend>
   <p>Vocal-Regieprobe für alle drei Stage-Crew-Künstler: Rap-Phrasen, Antwortgesten,
    Duo-Momente und bewusste Atempause. Die Rollen sind <strong>Bühnenvorschläge</strong> –
    keine automatisch erkannten Sänger oder Phoneme.</p>
   <label>Vocal-Auftrittsstil
    <select value={vocalStyle} disabled={busy} onChange={e=>{setVocalStyle(e.target.value as VocalStyleV1115);invalidate();}}>
     {Object.entries(VOCAL_STYLE_LABELS_V1115).map(([value,label])=><option key={value} value={value}>{label}</option>)}
    </select>
   </label>
   <label>Gesicht und Gestik – Intensität {vocalExpression}%
    <input type="range" min="20" max="80" step="10" disabled={busy} value={vocalExpression}
     onChange={e=>{setVocalExpression(Number(e.target.value));invalidate();}}/>
   </label>
   <label><input type="checkbox" checked={vocalEnabled} disabled={busy}
     onChange={e=>{setVocalEnabled(e.target.checked);invalidate();}}/>
    Vocal-Regie auch in neue Offline-/OpenAI-Entwürfe aufnehmen
   </label>
   <button type="button" disabled={busy} onClick={()=>local(false,true,true,true,true,true)}>
    V1115 Vocal Acting jetzt proben
   </button>
   {vocalCanUndo&&<button type="button" onClick={revertVocalPreset}>Frühere Vocal-Regler wiederherstellen</button>}
   <small>Die integrierte Lyrics-/Mimik-Engine wird <strong>nicht</strong> automatisch eingeschaltet.
    Die mitgelieferten drei GLBs haben keine eigenen Kieferknochen oder Mund-Morph-Targets;
    deshalb kann die Partitur bei ihnen keine echte Phonem-Mundform erzeugen. Kopf-/Körpergestik und
    Avatar-Modelle mit kompatiblen Gesichts-Rigs nutzen weiterhin die vorhandene Engine.
    Keine neuen KI- oder Mikrofonanfragen.</small>
  </fieldset>
  <fieldset aria-label="V1116 AI Artist Interaction" className="arena-v1116-ai-artist-interaction">
   <legend>V1116 · AI Artist Interaction</legend>
   <p>Neon Pulse, Festival Nova und Chrome Beat bekommen aufeinander abgestimmte
    Antwortgesten, Partnerwechsel, Duo-Momente und einen gemeinsamen Höhepunkt.
    Die <strong>Regiepartitur</strong> plant mögliche Blicke und Begegnungen, erkennt aber
    weder Sänger noch echte Blicke aus den drei GLB-Rigs.</p>
   <label>Interaktionsstil
    <select value={interactionStyle} disabled={busy}
     onChange={e=>{setInteractionStyle(e.target.value as InteractionStyleV1116);invalidate();}}>
     {Object.entries(INTERACTION_LABELS_V1116).map(([key,label])=><option key={key} value={key}>{label}</option>)}
    </select>
   </label>
   <label>Interaktionsstärke {interactionStrength}%
    <input type="range" min="20" max="80" step="10" value={interactionStrength} disabled={busy}
     onChange={e=>{setInteractionStrength(Number(e.target.value));invalidate();}}/>
   </label>
   <label><input type="checkbox" checked={interactionEnabled} disabled={busy}
    onChange={e=>{setInteractionEnabled(e.target.checked);invalidate();}}/>
    Künstlerinteraktionen auch in neue Offline-/OpenAI-Entwürfe aufnehmen
   </label>
   <button type="button" disabled={busy} onClick={()=>local(false,true,true,true,true,true,true)}>
    V1116 Künstlerinteraktionen jetzt proben
   </button>
   {interactionCanUndo&&<button type="button" onClick={revertLiveInteraction}>
    Frühere Live-Interaktion wiederherstellen
   </button>}
   <small>Live nur nach eigenem zweiten Klick: verwendet die vorhandenen visuellen
    V1079-Partnerakzente, sofern echte synchronisierte Lyrics-Lücken vorliegen.
    Manuelle Animationen, bestehende Sängerzuordnungen und reduzierte Bewegung
    behalten Vorrang. Keine künstliche Audio-/Gesangserkennung, keine Govee-Befehle.</small>
  </fieldset>
  <fieldset aria-label="V1117 AI Stage Transformation" className="arena-v1117-ai-stage-transformation">
   <legend>V1117 · AI Stage Transformation</legend>
   <p>360°-Verwandlung mit echten vorhandenen Plattform-, Schwebebühnen- und
    Architekturmodulen: Intro, Strophen, Aufbau, Hook, Pause und großes Finale.
    Die Phasen sind entworfene Abschnitte, keine automatisch erkannten Drops.</p>
   <label>Bühnenverwandlungsstil
    <select value={stageStyle} disabled={busy}
     onChange={e=>{setStageStyle(e.target.value as StageStyleV1117);invalidate();}}>
     {Object.entries(STAGE_STYLE_LABELS_V1117).map(([key,value])=>
      <option key={key} value={key}>{value}</option>)}
    </select>
   </label>
   <label>Bühnenverwandlungsstärke {stageStrength}%
    <input type="range" min="20" max="80" step="10" value={stageStrength} disabled={busy}
     onChange={e=>{setStageStrength(Number(e.target.value));invalidate();}}/>
   </label>
   <label><input type="checkbox" checked={stageEnabled} disabled={busy}
    onChange={e=>{setStageEnabled(e.target.checked);invalidate();}}/>
    Bühnenverwandlung auch auf neue Offline-/OpenAI-Entwürfe anwenden
   </label>
   <button type="button" disabled={busy} onClick={()=>local(false,false,false,false,false,false,false,true)}>
    V1117 Bühnenverwandlung jetzt proben
   </button>
   {stageCanUndo&&<button type="button" onClick={revertStageTransformation}>
    Frühere Bühnenbewegung wiederherstellen
   </button>}
   <small>Die Probe verändert keine Live-Bühne. Nach dem Showplan-Übernehmen
    können vorhandene virtuelle Bühneneffekte separat aktiviert werden.
    Dafür müssen 360°-Show Designer und Konzertdirektor aktiv sein.
    Manuelle Formationen, reduzierte Bewegung und schwache Hardware haben Vorrang.
    Keine Govee-, Strobo- oder Pyrotechnik-Befehle.</small>
  </fieldset>
  <label>Maximale virtuelle Showintensität: {cap}%
   <input type="range" min="30" max="85" step="5" value={cap} disabled={busy}
    onChange={e=>{setCap(Number(e.target.value));invalidate();}}/>
  </label>
  <div style={{display:'flex',flexWrap:'wrap',gap:8}}>
   <button type="button" onClick={()=>void remote()} disabled={busy||idea.trim().length<4}>
    {busy?'KI entwirft…':'Mit OpenAI kreativ gestalten'}
   </button>
   <button type="button" onClick={()=>local(false)} disabled={busy}>Offline-Remix ausprobieren</button>
   {canUndo&&<button type="button" onClick={revert}>Letzten Remix rückgängig machen</button>}
  </div>
  <small>OpenAI wird nur auf Knopfdruck angefragt (mit konfiguriertem OPENAI_API_KEY und Spotify-Anmeldung).
   Übertragen werden ausschließlich dein kurzer Gestaltungswunsch, Genre, Regiestil, Kontraste, Intensitätslimit und ggf. ein bewusst ausgewählter Stimmungshinweis –
   niemals Lyrics, Audiodaten, Tokens oder Govee-Geräteinformationen. Offline bleibt alles lokal.</small>
  {status&&<p role="status" aria-live="polite">{status}</p>}
  {preview&&<section aria-label="V1106 Show Remix Vorschau">
   {stagePreview&&<section aria-label="V1117 Stage Transformation Partitur">
    <h3>V1117 · 360°-Bühnenverwandlung</h3>
    <p role="note" aria-label="V1117 Bühnenqualität">
     {stagePreview.quality.scenes} Szenen · {stagePreview.quality.layouts} Bühnenformationen ·
     {stagePreview.quality.floatingModes} Schwebevarianten ·
     {stagePreview.quality.quietBreak?'bewusste Atempause':'Atempause prüfen'} ·
     {stagePreview.quality.smoothTransitions?'weiche Übergänge':'Übergänge prüfen'}.
    </p>
    {activeStageCue&&<p role="status" aria-label="V1117 Aktuelle Bühnenszene">
     Szene {activeStageCue.index+1}: {activeStageCue.chapter} · Bühne {activeStageCue.deck} ·
     Plattformen {activeStageCue.floating} · Laserlook {activeStageCue.lasers}.
     Dies ist eine Regieprobe ohne Live-Bühnenbewegung.
    </p>}
    <ol aria-label="V1117 sieben Bühnenverwandlungen">
     {stagePreview.cues.map(c=><li key={c.index}>
      <strong>Szene {c.index+1}: {c.chapter}</strong> · {Math.round(c.start*100)}–{Math.round(c.end*100)}% ·
      Bühne {c.deck} · Plattformen {c.floating} · Laser {c.lasers} · {c.intensity}%.
     </li>)}
    </ol>
    <button type="button" disabled={busy||preferences.reducedMotion} onClick={activateStageTransformation}>
     V1117 vorhandene virtuelle Bühnenverwandlung aktivieren
    </button>
    <small>Zweiter, separater Opt-in-Schritt für bereits vorhandene V1066/V1067/V1082/V1086-Module.
     Es werden keine neuen 3D-Modelle erzeugt; die Live-Show verwendet die gespeicherte Timeline,
     Songposition und bestehende Leistungssperren.</small>
   </section>}
   {interactionPreview&&<section aria-label="V1116 Artist Interaction Partitur">
    <h3>V1116 · Künstlerwechsel und Duo-Regie</h3>
    <p role="note" aria-label="V1116 Interaktionsqualität">
     {interactionPreview.quality.scenes} Szenen · {interactionPreview.quality.leadChanges} Lead-Wechsel ·
     {interactionPreview.quality.partnerMoments} Partnermomente ·
     {interactionPreview.quality.quietMoments} ruhige Szenen ·
     {interactionPreview.quality.verifiedSingerAssignments} verifizierte Sänger.
    </p>
    {activeInteractionCue&&<p role="status" aria-label="V1116 Aktuelle Interaktion">
     Szene {activeInteractionCue.index+1}: {activeInteractionCue.kind} ·
     {activeInteractionCue.description}
    </p>}
    <ol aria-label="V1116 sieben Künstlerinteraktionen">
     {interactionPreview.cues.map(c=><li key={c.index}>
      <strong>Szene {c.index+1} · {c.kind}</strong> · {Math.round(c.start*100)}–{Math.round(c.end*100)}% ·
      Kamera {c.camera} · {c.gesture}.
      <span> {c.leadId?c.leadId.replace('sonic-','').replaceAll('-',' '):'Ensemble'}
       {c.partnerId?' ↔ '+c.partnerId.replace('sonic-','').replaceAll('-',' '):''}</span>
     </li>)}
    </ol>
    <button type="button" disabled={busy||preferences.reducedMotion} onClick={applyLiveInteraction}>
     V1116 vorhandene Live-Artist-Interaktion aktivieren
    </button>
    <small>Separater Opt-in: aktiviert nur den existierenden V1079-Modus für
     sichere Interaktionen während belegter Lyrics-Pausen. Der neue siebenphasige
     Regieplan ist zunächst nur eine Vorschau und wird ausschließlich mit
     „In meinen Showplan übernehmen“ gespeichert.</small>
   </section>}
   {vocalPreview&&<section aria-label="V1115 Vocal Acting Partitur">
    <h3>V1115 · Künstlerrollen und Vocal-Acting</h3>
    <p role="note" aria-label="V1115 Vocal-Qualität">
     {vocalPreview.quality.scenes} Szenen · {vocalPreview.quality.distinctActs} Vocal-Akzenttypen ·
     {vocalPreview.quality.roleChanges?'wechselnde Bühnenrollen':'Rollen unverändert'} ·
     {vocalPreview.quality.verifiedSingerAssignments} automatisch verifizierte Sänger.
    </p>
    {activeVocalCue&&<p role="status" aria-label="V1115 Aktuelle Vocal-Szene">
     Szene {activeVocalCue.index+1}: {activeVocalCue.intent} · {activeVocalCue.caption}
    </p>}
    <ol aria-label="V1115 sieben Vocal-Szenen">
     {vocalPreview.cues.map(c=><li key={c.index}>
      <strong>Szene {c.index+1} · {c.intent}</strong> · {Math.round(c.start*100)}–{Math.round(c.end*100)}% ·
      <ul>{c.members.map(m=><li key={m.id}>{m.label} · {m.role} · {m.act} · Ausdruck {m.energy}%</li>)}</ul>
     </li>)}
    </ol>
    <button type="button" disabled={busy||preferences.reducedMotion} onClick={applyVocalPreset}>
     V1115 Vocal-Preset für vorhandene Lip-Sync-Engine aktivieren
    </button>
    <small>Separater Opt-in-Schritt: setzt nur vorhandene Vocal-Einstellungen. Es werden
     keine neuen Sängerzuordnungen, Texte, Mundformen oder Clips erfunden;
     manuelle Zuordnungen bleiben vorrangig. Die Show-Timeline benötigt weiterhin
     den separaten Übernehmen-Button.</small>
   </section>}
   {dancePreview&&<section aria-label="V1114 Dance Choreographer Partitur">
    <h3>V1114 · Drei Tänzer, eine Konzertchoreografie</h3>
    <p role="note" aria-label="V1114 Tanzqualität">
     {dancePreview.quality.scenes} Szenen · {dancePreview.quality.differentForms} Formationen ·
     {dancePreview.quality.individualClips} verschiedene GLB-Clip-Vorschläge ·
     {dancePreview.quality.safeTransitions?'kontrollierte Übergänge':'Übergänge prüfen'}.
    </p>
    {activeDanceCue&&<p role="status" aria-label="V1114 Aktuelle Tanzszene">
     Szene {activeDanceCue.index+1}: {activeDanceCue.form} · {activeDanceCue.section} ·
     Crew-Modus {activeDanceCue.crewMode}. Vorschau, noch keine Live-Aktion.
    </p>}
    <ol aria-label="V1114 sieben Tanzszenen">
     {dancePreview.cues.map(c=><li key={c.index}>
      <strong>Szene {c.index+1}: {c.form}</strong> · {Math.round(c.start*100)}–{Math.round(c.end*100)}% · {c.description}
      <ul>{c.members.map(member=><li key={member.id}>
       {member.label} · {member.role} · {member.clipSuggestion} · {member.energy}% ·
       {member.beatOffset} Beats Versatz
      </li>)}</ul>
     </li>)}
    </ol>
    <button type="button" onClick={activateCrewStory} disabled={busy}>
     V1114 Stage-Crew-Automatik für echte GLB-Clips aktivieren
    </button>
    <small>Diese separate Zustimmung aktiviert den optionalen lokalen Abschnittswechsel
     (ruhig → Solo → Kanon → gemeinsamer Drop) in der bestehenden Stage Crew.
     Zunächst im Stage-Crew-Bereich „Trio auf der Bühne einrichten“ wählen.
     Die gezeigte Partitur ist nicht identisch mit einer Clip-für-Clip gespeicherten Timeline:
     der Live-Player wählt ausschließlich tatsächlich vorhandene Clips.</small>
   </section>}
   {performancePreview&&<section aria-label="V1113 Performance Director Partitur">
    <h3>V1113 · Dynamische Künstler-Performance</h3>
    <p role="note" aria-label="V1113 Performance-Qualität">
     {performancePreview.quality.chapters} Szenen · {performancePreview.quality.distinctGestures} Gestikvarianten ·
     {performancePreview.quality.soloChapters} Solo- und {performancePreview.quality.ensembleChapters} Ensemble-Momente ·
     {performancePreview.quality.safeTransitions?'kontrollierte Intensitätsübergänge':'Übergänge prüfen'}.
    </p>
    {activePerformanceCue&&<p role="status" aria-label="V1113 Aktuelle Performance">
     Szene {activePerformanceCue.index+1}: {activePerformanceCue.moment} ·
     {activePerformanceCue.focusId?activePerformanceCue.performers.find(p=>p.id===activePerformanceCue.focusId)?.label:'Alle drei'} im Fokus.
     Kamera {activePerformanceCue.camera}, Tanz {activePerformanceCue.dance}.
     Es handelt sich um eine Vorschau ohne Live-Gestensteuerung.
    </p>}
    <ol aria-label="V1113 sieben Performance-Szenen">
     {performancePreview.cues.map(c=><li key={c.index}>
      <strong>Szene {c.index+1}: {c.moment}</strong> · {Math.round(c.start*100)}–{Math.round(c.end*100)}% ·
      {c.performers.map(member=><div key={member.id} style={{margin:'4px 0 8px 8px'}}>
       {member.spotlight?'★ ':''}{member.label} ({member.role}): {member.cue} · Energie {member.energy}%
       <div style={{height:6,width:'100%',maxWidth:220,background:'rgba(120,130,150,.2)',borderRadius:3}}>
        <div style={{height:'100%',width:`${member.energy}%`,background:'#8ae8ff',borderRadius:3}}/>
       </div>
      </div>)}
     </li>)}
    </ol>
    <small>Die Rollen und Gesten sind Inszenierungsvorschläge. Nur die bestehenden gemeinsamen
     Kamera- und Tanzmodi werden nach „Übernehmen“ in die Timeline geschrieben.</small>
   </section>}
   {personalityPreview&&<section aria-label="V1112 Avatar Personality Partitur">
    <h3>V1112 · Drei Bühnenpersönlichkeiten</h3>
    <p role="note" aria-label="V1112 Charakter-Qualität">
     {personalityPreview.quality.distinctPersonalities} unterschiedliche Charaktere ·
     {personalityPreview.quality.featuredPerformers} Performer im Fokus ·
     {personalityPreview.quality.ensembleMoments} gemeinsame Ensemble-Momente ·
     {personalityPreview.quality.safeTransitions?'kontrollierte Übergänge':'Übergänge prüfen'}.
    </p>
    {activePersonalityCue&&<p role="status" aria-label="V1112 Aktueller Avatar-Fokus">
     Szene {activePersonalityCue.index+1}: {activePersonalityCue.focusId?
      activePersonalityCue.performers.find(x=>x.id===activePersonalityCue.focusId)?.label:'Alle drei zusammen'} ·
     Kamera {activePersonalityCue.camera} · Tanz {activePersonalityCue.dance}.
     Dies ist eine Regieprobe, keine individuelle Live-Animation.
    </p>}
    <ol aria-label="V1112 sieben Charakter-Szenen">
     {personalityPreview.cues.map(cue=><li key={cue.index}>
      <strong>Szene {cue.index+1}</strong> · {Math.round(cue.start*100)}–{Math.round(cue.end*100)}% ·
      {cue.performers.map(member=><span key={member.id}>
       {' '}{member.label}: {member.direction} ({member.role});
      </span>)}
     </li>)}
    </ol>
   </section>}
   {conductorPreview&&<section aria-label="V1111 Konzertregie Partitur">
    <h3>V1111 · Koordinierte Live-Show-Regie</h3>
    <p role="note" aria-label="V1111 Regie-Qualität">
     {conductorPreview.quality.synchronizedActs} abgestimmte Szenen ·
     {conductorPreview.quality.cameraVariety} Kameraperspektiven ·
     {conductorPreview.quality.safeTransitions?'kontrollierte Übergänge':'Übergang prüfen'} ·
     {conductorPreview.quality.quietContrast?'bewusste Atempause':'Kontrast prüfen'}.
    </p>
    <label>Virtuelle Probenposition: {Math.round(previewPercent*100)}% des Songs
     <input aria-label="V1111 Probeposition" type="range" min="0" max="100" step="1"
      disabled={followSong&&followAvailable} value={Math.round(previewPercent*100)}
      onChange={e=>setConductorScrub(Number(e.target.value))}/>
    </label>
    <label><input type="checkbox" checked={followSong&&followAvailable}
     disabled={!followAvailable} onChange={e=>setFollowSong(e.target.checked)}/>
     Laufender Spotify-Songposition folgen (nur Anzeige)
    </label>
    {activeConductorCue&&<p role="status" aria-label="V1111 Aktueller Regieimpuls">
     Probe: Szene {activeConductorCue.index+1} · {activeConductorCue.moment} ·
     {activeConductorCue.intensity}% · Kamera {activeConductorCue.camera} ·
     Tanz {activeConductorCue.dance} · Laser {activeConductorCue.lasers}.
     Keine virtuelle oder reale Bühne wird durch den Probenregler verändert.
    </p>}
    <ol aria-label="V1111 sieben koordinierte Regie-Cues">
     {conductorPreview.cues.map(c=><li key={c.index}>
      <strong>{c.moment}</strong> · {Math.round(c.start*100)}–{Math.round(c.end*100)}% ·
      {c.intensity}% · Kamera {c.camera} · Tanz {c.dance} ·
      Bühne {c.deck}/{c.floating} · Laser {c.lasers}. {c.description}
     </li>)}
    </ol>
   </section>}
   {auditCreativeRemixV1107(preview)&&<p role="note" aria-label="V1107 Regie-Qualitätsvorschau">
     Regie-Check: {auditCreativeRemixV1107(preview)?.uniqueCameras} Kameraperspektiven,
     {auditCreativeRemixV1107(preview)?.uniqueStages} Bühnenvarianten,
     Dynamikspanne {auditCreativeRemixV1107(preview)?.contrastRange} Punkte.
     Die Szenenwechsel bleiben auf maximal 45 Intensitätspunkte begrenzt.
   </p>}
   {storyPreview&&<section aria-label="V1109 Storybogen Vorschau">
    <h3>Storybogen: {STORY_ARC_LABELS_V1109[storyPreview.arc]}</h3>
    <p role="note" aria-label="V1109 Story-Qualitätscheck">
     {storyPreview.quality.quietMoments} bewusste Ruhephasen · {storyPreview.quality.cameraVariety} Kameraperspektiven ·
     {storyPreview.quality.stageVariety} Bühnenvarianten · Spannungsumfang {storyPreview.quality.dramaticRange} Punkte ·
     {storyPreview.quality.safeTransitions?'sanfte Übergänge':'Übergänge prüfen'}.
    </p>
    <ol aria-label="V1109 sieben Storyphasen">
     {storyPreview.beats.map(beat=><li key={beat.index}>
      <strong>{beat.title}</strong> · {Math.round(beat.start*100)}–{Math.round(beat.end*100)}% des Songs ·
      {beat.intensity}% Showintensität. {beat.description}
     </li>)}
    </ol>
   </section>}
   <h3>{preview.title} <small>({source==='ai'?'OpenAI':'Lokaler Entwurf'})</small></h3>
   <p>{preview.explanation}</p>
   <ol style={{paddingLeft:22}}>
    {preview.acts.map((act,index)=><li key={index} style={{marginBottom:10}}>
     <strong>{index+1}. {NAMES[act.scene]} · {Math.min(cap,act.intensity)}%</strong>
     <div style={{height:7,width:'100%',maxWidth:350,background:'rgba(120,130,150,.22)',borderRadius:5}}>
      <div style={{height:'100%',width:`${Math.min(cap,act.intensity)}%`,background:'#7fe9f3',borderRadius:5}}/>
     </div>
     <small>Kamera: {act.camera} · Bühne: {act.deck}/{act.floating} · Laserlook: {act.lasers} · Tanz: {act.dance}</small>
     <p style={{margin:'3px 0 0'}}>{act.note}</p>
    </li>)}
   </ol>
   {preferences.reducedMotion&&<p>Bewegungsreduktion ist aktiv: Die Live-Bühne ignoriert bewegte Showplan-Cues weiterhin.</p>}
   <button type="button" onClick={apply}>Diese sieben Szenen in meinen Showplan übernehmen</button>
   <button type="button" onClick={invalidate}>Vorschlag verwerfen</button>
   <small>Dies ist eine entworfene Timeline, keine Erkennung echter Hooks oder Drops.
    Keine automatische Aktivierung von Pyrotechnik, Strobo, Govee oder anderen Geräten.</small>
  </section>}
 </fieldset>;
}
