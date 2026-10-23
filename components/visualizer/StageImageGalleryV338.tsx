"use client";
import {resolveVisualFxPhotoV353,type VisualFxCueV353} from '@/services/stageContent/visualEffectsStudioV353';
import {useEffect,useMemo,useState,type CSSProperties} from 'react';
import {GALLERY_EVENT_V338,readGalleryV338} from '@/services/stageContent/galleryV338';
import {readImageSelectionV340,IMAGE_SELECTION_EVENT_V340,rankImagesV340} from '@/services/stageContent/imageSelectionV340';
import {readMusicGalleryV341,MUSIC_GALLERY_EVENT_V341,musicGalleryIntervalV341,shouldBeatAdvanceV341} from '@/services/stageContent/musicGalleryV341';
import {useRef} from 'react';
import {CINEMATIC_EVENT_V342,readCinematicV342,cinematicMotionV342} from '@/services/stageContent/cinematicGalleryV342';
import {GALLERY_LAYOUT_EVENT_V344,readGalleryLayoutsV344,layoutRatioV344} from '@/services/stageContent/galleryLayoutV344';
import {MULTI_PHOTO_EVENT_V345,readPhotoCompositionsV345} from '@/services/stageContent/multiPhotoLayoutV345';
import {readPhotoDirectorV346,PHOTO_DIRECTOR_EVENT_V346,decidePhotoMoodV346} from '@/services/stageContent/photoDirectorV346';
import {PhotoCrossfadeV347} from './PhotoCrossfadeV347';
import {PHOTO_TRANSITIONS_EVENT_V347,readPhotoTransitionsV347,transitionEasingV347,isTransitionBeatV347,shouldWaitForBeatV347} from '@/services/stageContent/photoTransitionsV347';
import {safeStageMediaV330} from '@/services/stageContent/stageContentV330';
import {PHOTO_SELECTION_EVENT_V349,readPhotoSelectionV349,rankPhotosForFrameV349,selectPhotosForSlotsV349} from '@/services/stageContent/photoSelectionV349';
import {usePhotoDimensionsV349} from '@/services/stageContent/usePhotoDimensionsV349';
import type {LyricsPhotoDecisionV350} from '@/services/stageContent/lyricsPhotoChoreographyV350';
/** In-screen gallery: no extra Three meshes or additional animation loops. */
export function StageImageGalleryV338({images,alt,reducedMotion=false,className='',credits={},targetAspectRatio=16/9,section='unknown',beatAccent=0,playing=true,paused=false,genre='',choreography,fxCue}:{images:string[];alt:string;reducedMotion?:boolean;className?:string;credits?:Record<string,string>;targetAspectRatio?:number;section?:string;beatAccent?:number;playing?:boolean;paused?:boolean;genre?:string;choreography?:LyricsPhotoDecisionV350;fxCue?:VisualFxCueV353}){
 const [settings,setSettings]=useState(readGalleryV338);
 const [layouts,setLayouts]=useState(readGalleryLayoutsV344);
 const [multiPhoto,setMultiPhoto]=useState(readPhotoCompositionsV345);
 const [director,setDirector]=useState(readPhotoDirectorV346);
 const [photoTransitions,setPhotoTransitions]=useState(readPhotoTransitionsV347);
 const [presentedMood,setPresentedMood]=useState<'focus'|'balanced'|'impact'>('focus');
 const pendingMood=useRef<'focus'|'balanced'|'impact'|null>(null);
 const previousTransitionBeat=useRef(0);
 const [directedMood,setDirectedMood]=useState<'focus'|'balanced'|'impact'>('focus');
 const [directedReason,setDirectedReason]=useState('');
 const directedAt=useRef(0);
 const [index,setIndex]=useState(0);
 const [failed,setFailed]=useState<string[]>([]);
 const [selection,setSelection]=useState(readImageSelectionV340);
 const [musicSettings,setMusicSettings]=useState(readMusicGalleryV341);
 const [cinematic,setCinematic]=useState(readCinematicV342);
 const lastAdvance=useRef(Date.now());
 const [pointer,setPointer]=useState({x:0,y:0});
 const previousBeat=useRef(0);
 const [smartSelection,setSmartSelection]=useState(readPhotoSelectionV349);
 useEffect(()=>{const onChange=()=>setSelection(readImageSelectionV340());window.addEventListener(IMAGE_SELECTION_EVENT_V340,onChange);return()=>window.removeEventListener(IMAGE_SELECTION_EVENT_V340,onChange);},[]);
 useEffect(()=>{const onChange=()=>setSmartSelection(readPhotoSelectionV349());window.addEventListener(PHOTO_SELECTION_EVENT_V349,onChange);return()=>window.removeEventListener(PHOTO_SELECTION_EVENT_V349,onChange);},[]);
 useEffect(()=>{const onSettings=()=>setSettings(readGalleryV338());window.addEventListener(GALLERY_EVENT_V338,onSettings);return()=>window.removeEventListener(GALLERY_EVENT_V338,onSettings);},[]);
 useEffect(()=>{const update=()=>setMusicSettings(readMusicGalleryV341());window.addEventListener(MUSIC_GALLERY_EVENT_V341,update);return()=>window.removeEventListener(MUSIC_GALLERY_EVENT_V341,update);},[]);
 useEffect(()=>{const update=()=>setCinematic(readCinematicV342());window.addEventListener(CINEMATIC_EVENT_V342,update);return()=>window.removeEventListener(CINEMATIC_EVENT_V342,update);},[]);
 useEffect(()=>{const update=()=>setLayouts(readGalleryLayoutsV344());window.addEventListener(GALLERY_LAYOUT_EVENT_V344,update);return()=>window.removeEventListener(GALLERY_LAYOUT_EVENT_V344,update);},[]);
 useEffect(()=>{const update=()=>setMultiPhoto(readPhotoCompositionsV345());window.addEventListener(MULTI_PHOTO_EVENT_V345,update);return()=>window.removeEventListener(MULTI_PHOTO_EVENT_V345,update);},[]);
 useEffect(()=>{const update=()=>setDirector(readPhotoDirectorV346());window.addEventListener(PHOTO_DIRECTOR_EVENT_V346,update);return()=>window.removeEventListener(PHOTO_DIRECTOR_EVENT_V346,update);},[]);
 useEffect(()=>{const update=()=>setPhotoTransitions(readPhotoTransitionsV347());window.addEventListener(PHOTO_TRANSITIONS_EVENT_V347,update);return()=>window.removeEventListener(PHOTO_TRANSITIONS_EVENT_V347,update);},[]);
 const ratio=layoutRatioV344(targetAspectRatio);
 const frame=layouts[ratio];
 const frameStyle:CSSProperties={position:'absolute',left:`${frame.x}%`,top:`${frame.y}%`,width:`${frame.width}%`,height:`${frame.height}%`, '--sonic-gallery-zoom-v344':String(frame.zoom),'--sonic-gallery-crop-x-v344':`${frame.cropX}%`,'--sonic-gallery-crop-y-v344':`${frame.cropY}%`} as CSSProperties;
 const signature=images.join('|');
 useEffect(()=>{setIndex(0);setFailed([]);lastAdvance.current=Date.now();previousBeat.current=0;},[signature]);
 const safeImages=useMemo(()=>[...new Set(images.map(safeStageMediaV330).filter((x):x is string=>!!x))].filter(u=>!failed.includes(u)),[signature,failed]);
 // V349: bounded shared metadata probing; 2D + 3D consume the same selector.
 const dimensions=usePhotoDimensionsV349(safeImages,smartSelection.enabled||selection.enabled);
 const candidates=useMemo(()=>safeImages.map(url=>({url,...dimensions[url]})),[safeImages,dimensions]);
 const orderedImages=useMemo(()=>smartSelection.enabled
  ?rankPhotosForFrameV349(candidates,{width:targetAspectRatio*900,height:900,displayWidth:960,displayHeight:540},smartSelection).slice(0,settings.maxImages).map(x=>x.url)
  :rankImagesV340(candidates,targetAspectRatio,selection).slice(0,settings.maxImages).map(x=>x.url),[candidates,targetAspectRatio,selection,smartSelection,settings.maxImages]);
 const intervalSeconds=musicGalleryIntervalV341(settings.intervalSeconds,section,musicSettings);
 useEffect(()=>{if(!settings.enabled||settings.mode!=='slideshow'||reducedMotion||paused||(musicSettings.enabled&&!playing)||orderedImages.length<2)return;
   const timer=window.setInterval(()=>{lastAdvance.current=Date.now();setIndex(i=>i+1);},intervalSeconds*1000);return()=>window.clearInterval(timer);
 },[settings.enabled,settings.mode,intervalSeconds,reducedMotion,playing,paused,musicSettings.enabled,orderedImages.length]);
 useEffect(()=>{
  const beat=Math.max(0,Math.min(1,Number.isFinite(beatAccent)?beatAccent:0));
  if(settings.enabled&&settings.mode==='slideshow'&&!reducedMotion&&playing&&!paused&&orderedImages.length>1 && shouldBeatAdvanceV341(beat,previousBeat.current,(Date.now()-lastAdvance.current)/1000,section,musicSettings)){
   lastAdvance.current=Date.now();setIndex(i=>i+1);
  }
  previousBeat.current=beat;
 },[beatAccent,section,playing,paused,reducedMotion,settings.enabled,settings.mode,orderedImages.length,musicSettings]);
 const proposal=decidePhotoMoodV346({section,genre,beatAccent,playing,imageCount:orderedImages.length,reducedMotion},director);
 useEffect(()=>{if(!director.enabled)return;const now=Date.now();if(directedMood!==proposal.mood&&(now-directedAt.current>=director.minimumHoldSeconds*1000||directedAt.current===0)){directedAt.current=now;setDirectedMood(proposal.mood);}setDirectedReason(proposal.reason);},[director.enabled,director.minimumHoldSeconds,proposal.mood,proposal.reason,directedMood]);
 // V347: wait for a rising beat accent, with a bounded fallback. Avoid per-frame timers.
 const desiredMood=director.mode==='manual'?director.manualMood:directedMood;
 const waitForBeat=shouldWaitForBeatV347(photoTransitions,playing,paused,reducedMotion);
 useEffect(()=>{
  if(!director.enabled||!photoTransitions.enabled||!waitForBeat){pendingMood.current=null;setPresentedMood(desiredMood);return;}
  if(desiredMood===presentedMood){pendingMood.current=null;return;}
  pendingMood.current=desiredMood;
  const timeout=window.setTimeout(()=>{
   if(pendingMood.current===desiredMood){pendingMood.current=null;setPresentedMood(desiredMood);}
  },photoTransitions.maxBeatWaitMs);
  return()=>window.clearTimeout(timeout);
 },[desiredMood,director.enabled,photoTransitions.enabled,photoTransitions.maxBeatWaitMs,waitForBeat,presentedMood]);
 useEffect(()=>{
  const beat=Number.isFinite(beatAccent)?beatAccent:0;
  if(waitForBeat&&pendingMood.current&&isTransitionBeatV347(previousTransitionBeat.current,beat,photoTransitions.beatThreshold)){
   setPresentedMood(pendingMood.current);pendingMood.current=null;
  }
  previousTransitionBeat.current=beat;
 },[beatAccent,photoTransitions.beatThreshold,waitForBeat]);
 if(!orderedImages.length)return null;
 const mode=!settings.enabled||reducedMotion?'single':settings.mode;
 const composition=multiPhoto[ratio];
 const directed=director.enabled&&composition.enabled;
 const activeMood=director.enabled&&photoTransitions.enabled?presentedMood:desiredMood;
 const directorCount=directed?Math.min(orderedImages.length,activeMood==='focus'?1:activeMood==='balanced'?3:8):composition.layers.length;
 const choreographyActive=!!choreography?.active&&!(director.enabled&&director.mode==='manual');
 const activeCount=choreographyActive?(choreography!.cue==='photos'?Math.min(composition.layers.length,choreography!.visiblePhotos):Math.min(directorCount,choreography!.visiblePhotos)):directorCount;
 const choreographyStyle:CSSProperties=choreographyActive?{opacity:choreography!.photoOpacity,transition:`opacity ${choreography!.transitionMs}ms ease`,'--sonic-photo-motion-factor-v350':String(Math.max(.1,choreography!.photoMotion))} as CSSProperties:{};
 const layoutFocus=directed&&activeMood==='focus'&&!choreographyActive;
 const displayLayers=choreographyActive?composition.layers:photoTransitions.enabled&&directed?composition.layers:directed?composition.layers.slice(0,Math.max(1,Math.min(activeCount,composition.layers.length))):composition.layers;
 // Score the visible frame of each photo independently; only V349 opt-in changes V345 order.
 const panelUrls=smartSelection.enabled?selectPhotosForSlotsV349(
  candidates.filter(c=>orderedImages.includes(c.url)),
  displayLayers.map(l=>({width:layoutFocus?targetAspectRatio:targetAspectRatio*l.width,height:layoutFocus?1:l.height,displayWidth:layoutFocus?960:Math.max(100,Math.round(960*l.width/100)),displayHeight:layoutFocus?540:Math.max(100,Math.round((960/targetAspectRatio)*l.height/100))})),
  smartSelection,0).map(m=>m.url):[];
 const fxTransition=resolveVisualFxPhotoV353(fxCue,photoTransitions.enabled,photoTransitions.durationMs,photoTransitions.crossfadeMs);
 const transitionsActive=fxTransition.enabled&&!reducedMotion;
 const transitionStyle:CSSProperties=transitionsActive?({'--sonic-photo-move-ms':`${fxTransition.durationMs}ms`,'--sonic-photo-move-ease':transitionEasingV347(photoTransitions.style)} as CSSProperties):{};
 if(composition.enabled&&composition.layers.length>0){
  return <div className={`sonic-image-gallery-v338 sonic-multi-photo-canvas-v345 ${transitionsActive?'sonic-smart-photo-transitions-v347':''} ${directed?'sonic-photo-directed-v346 sonic-photo-mood-'+activeMood+'-v346':''} ${className}`} style={{...frameStyle,...transitionStyle,...choreographyStyle}}>
   {displayLayers.map((layer,i)=>{const url=smartSelection.enabled?(panelUrls[i]||orderedImages[i%orderedImages.length]):orderedImages[(i+(mode==='slideshow'?index:0))%orderedImages.length];const hidden=i>=activeCount;return <div className="sonic-multi-photo-layer-v345" key={layer.id} aria-hidden={hidden} data-visible={hidden?'false':'true'}
    style={{left:layoutFocus?'0%':`${layer.x}%`,top:layoutFocus?'0%':`${layer.y}%`,width:layoutFocus?'100%':`${layer.width}%`,height:layoutFocus?'100%':`${layer.height}%`,zIndex:i+1,opacity:hidden?0:1,pointerEvents:hidden?'none':'auto',
      '--sonic-multi-crop-x':`${layer.cropX}%`,'--sonic-multi-crop-y':`${layer.cropY}%`,
      '--sonic-multi-zoom':String(layer.zoom)} as CSSProperties}>
    {transitionsActive?<PhotoCrossfadeV347 src={url} alt={`${alt} – Bild ${i+1}`} enabled={true} durationMs={fxTransition.crossfadeMs} className={`sonic-v353-transition-${fxTransition.style} ${!reducedMotion&&(!directed||activeMood==='impact')?`sonic-multi-photo-motion-${layer.motion}-v345`:''}`} onError={()=>setFailed(old=>old.includes(url)?old:[...old,url])}/>:<img className={!reducedMotion&&(!directed||activeMood==='impact')?`sonic-multi-photo-motion-${layer.motion}-v345`:''} src={url} alt={`${alt} – Bild ${i+1}`} onError={()=>setFailed(old=>old.includes(url)?old:[...old,url])}/> }
    {credits[url]&&<span className="sonic-gallery-credit-tile-v339" title={credits[url]}>{credits[url]}</span>}
   </div>;})}
  </div>;
 }

 const collageCount=choreographyActive?Math.min(4,orderedImages.length,Math.max(1,activeCount)):Math.min(4,orderedImages.length);
 if(mode==='collage'&&orderedImages.length>1)return <div className={`sonic-image-gallery-v338 sonic-gallery-collage-v338 ${className}`} style={{...frameStyle,...choreographyStyle}}>{(smartSelection.enabled?selectPhotosForSlotsV349(candidates.filter(c=>orderedImages.includes(c.url)),Array.from({length:collageCount},()=>({width:targetAspectRatio,height:1,displayWidth:480,displayHeight:270})),smartSelection,0).map(m=>m.url):orderedImages.slice(0,collageCount)).map((u,i)=><div className="sonic-gallery-tile-v339" key={u}><img src={u} alt={`${alt} ${i+1}`} onError={()=>setFailed(old=>[...old,u])}/>{credits[u]&&<span className="sonic-gallery-credit-tile-v339" title={credits[u]}>{credits[u]}</span>}</div>)}</div>;
 const current=orderedImages[index%orderedImages.length];
 const cinematicActive=cinematic.enabled&&!reducedMotion&&settings.enabled&&!(choreographyActive&&choreography!.cue==='lyrics');
 const motion=cinematicMotionV342(index,intervalSeconds,cinematic,reducedMotion);
 const cinematicVars=cinematicActive?({
  '--sonic-cine-from-x':`${motion.fromX+pointer.x*motion.parallax}%`,
  '--sonic-cine-from-y':`${motion.fromY+pointer.y*motion.parallax}%`,
  '--sonic-cine-to-x':`${motion.toX+pointer.x*motion.parallax}%`,
  '--sonic-cine-to-y':`${motion.toY+pointer.y*motion.parallax}%`,
  '--sonic-cine-from-scale':String(motion.fromScale),
  '--sonic-cine-to-scale':String(motion.toScale),
  '--sonic-cine-duration':`${motion.durationMs}ms`,
  '--sonic-cine-transition':`${cinematic.transitionMs}ms`,
 } as CSSProperties):undefined;
 return <div className={`sonic-image-gallery-v338 sonic-gallery-single-v338 ${!cinematicActive&&musicSettings.enabled&&!reducedMotion&&!(choreographyActive&&choreography!.cue==='lyrics')?'sonic-gallery-motion-v341 sonic-gallery-'+musicSettings.transition+'-v341':''} ${cinematicActive?'sonic-gallery-cinematic-v342':''} ${className}`} style={{...frameStyle,...cinematicVars,...choreographyStyle}} onPointerMove={cinematicActive&&motion.parallax>0&&!cinematic.lowPower?(event)=>{const rect=event.currentTarget.getBoundingClientRect();setPointer({x:(event.clientX-rect.left)/Math.max(1,rect.width)-.5,y:(event.clientY-rect.top)/Math.max(1,rect.height)-.5});}:undefined} onPointerLeave={cinematicActive?()=>setPointer({x:0,y:0}):undefined}><img key={current} src={current} alt={`${alt} ${index%orderedImages.length+1}`} onError={()=>setFailed(old=>[...old,current])}/>{credits[current]&&<span className="sonic-gallery-credit-v339" title={credits[current]}>{credits[current]}</span>}{mode==='slideshow'&&orderedImages.length>1&&<span className="sonic-gallery-counter-v338">{index%orderedImages.length+1}/{orderedImages.length}</span>}</div>;
}
