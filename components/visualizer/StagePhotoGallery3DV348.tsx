'use client';
import {useEffect,useMemo,useRef,useState,type CSSProperties} from 'react';
import {useFrame} from '@react-three/fiber';
import {Html} from '@react-three/drei';
import type {Group} from 'three';
import {PhotoCrossfadeV347} from './PhotoCrossfadeV347';
import {rankImagesV340,readImageSelectionV340,IMAGE_SELECTION_EVENT_V340} from '@/services/stageContent/imageSelectionV340';
import {readGalleryV338,GALLERY_EVENT_V338} from '@/services/stageContent/galleryV338';
import {readMusicGalleryV341,MUSIC_GALLERY_EVENT_V341,musicGalleryIntervalV341,shouldBeatAdvanceV341} from '@/services/stageContent/musicGalleryV341';
import {readPhotoDirectorV346,PHOTO_DIRECTOR_EVENT_V346,decidePhotoMoodV346,type PhotoDirectorMoodV346} from '@/services/stageContent/photoDirectorV346';
import {readPhotoTransitionsV347,PHOTO_TRANSITIONS_EVENT_V347} from '@/services/stageContent/photoTransitionsV347';
import {resolveVisualFxPhotoV353,type VisualFxCueV353} from '@/services/stageContent/visualEffectsStudioV353';
import {safeStageMediaV330} from '@/services/stageContent/stageContentV330';
import {PHOTO_SELECTION_EVENT_V349,readPhotoSelectionV349,rankPhotosForFrameV349,selectPhotosForSlotsV349} from '@/services/stageContent/photoSelectionV349';
import {usePhotoDimensionsV349} from '@/services/stageContent/usePhotoDimensionsV349';
import {interpolatePhotoPanelV348,projectPhotoLayerV348,type PhotoGallery3DSettingsV348} from '@/services/stageContent/photoGallery3DV348';
import type {LyricsPhotoDecisionV350} from '@/services/stageContent/lyricsPhotoChoreographyV350';
import type {PhotoCompositionV345} from '@/services/stageContent/multiPhotoLayoutV345';

/** Optional physically-separated Drei Html photo panels. Only mounted for enabled image content. */
export function StagePhotoGallery3DV348({images,alt,credits={},composition,settings,width,height,scale,section='',genre='',beatAccent=0,playing=true,choreography,fxCue}:{
 images:string[];alt:string;credits?:Record<string,string>;composition:PhotoCompositionV345;settings:PhotoGallery3DSettingsV348;
 width:number;height:number;scale:number;section?:string;genre?:string;beatAccent?:number;playing?:boolean;choreography?:LyricsPhotoDecisionV350;fxCue?:VisualFxCueV353;
}){
 const groups=useRef<Record<number,Group|null>>({});
 const [failed,setFailed]=useState<string[]>([]);
 const [index,setIndex]=useState(0);
 const [gallery,setGallery]=useState(readGalleryV338);
 const [selection,setSelection]=useState(readImageSelectionV340);
 const [smartSelection,setSmartSelection]=useState(readPhotoSelectionV349);
 const [music,setMusic]=useState(readMusicGalleryV341);
 const [director,setDirector]=useState(readPhotoDirectorV346);
 const [transitions,setTransitions]=useState(readPhotoTransitionsV347);
 const [mood,setMood]=useState<PhotoDirectorMoodV346>('focus');
 const moodAt=useRef(0);
 const lastAdvance=useRef(Date.now());
 const previousBeat=useRef(0);
 const tick=useRef(0);
 useEffect(()=>{const change=()=>setGallery(readGalleryV338());window.addEventListener(GALLERY_EVENT_V338,change);return()=>window.removeEventListener(GALLERY_EVENT_V338,change);},[]);
 useEffect(()=>{const change=()=>setSelection(readImageSelectionV340());window.addEventListener(IMAGE_SELECTION_EVENT_V340,change);return()=>window.removeEventListener(IMAGE_SELECTION_EVENT_V340,change);},[]);
 useEffect(()=>{const change=()=>setSmartSelection(readPhotoSelectionV349());window.addEventListener(PHOTO_SELECTION_EVENT_V349,change);return()=>window.removeEventListener(PHOTO_SELECTION_EVENT_V349,change);},[]);
 useEffect(()=>{const change=()=>setMusic(readMusicGalleryV341());window.addEventListener(MUSIC_GALLERY_EVENT_V341,change);return()=>window.removeEventListener(MUSIC_GALLERY_EVENT_V341,change);},[]);
 useEffect(()=>{const change=()=>setDirector(readPhotoDirectorV346());window.addEventListener(PHOTO_DIRECTOR_EVENT_V346,change);return()=>window.removeEventListener(PHOTO_DIRECTOR_EVENT_V346,change);},[]);
 useEffect(()=>{const change=()=>setTransitions(readPhotoTransitionsV347());window.addEventListener(PHOTO_TRANSITIONS_EVENT_V347,change);return()=>window.removeEventListener(PHOTO_TRANSITIONS_EVENT_V347,change);},[]);
 const fxTransition=resolveVisualFxPhotoV353(fxCue,transitions.enabled,transitions.durationMs,transitions.crossfadeMs);
 const signature=images.join('|');
 useEffect(()=>{setIndex(0);setFailed([]);lastAdvance.current=Date.now();previousBeat.current=0;},[signature]);
 const safeImages=useMemo(()=>[...new Set(images.map(safeStageMediaV330).filter((url):url is string=>!!url))].filter(u=>!failed.includes(u)),[signature,failed]);
 const dimensions=usePhotoDimensionsV349(safeImages,smartSelection.enabled);
 const candidates=useMemo(()=>safeImages.map(url=>({url,...dimensions[url]})),[safeImages,dimensions]);
 const orderedImages=useMemo(()=>smartSelection.enabled
  ?rankPhotosForFrameV349(candidates,{width,height,displayWidth:960,displayHeight:540},smartSelection).slice(0,gallery.maxImages).map(v=>v.url)
  :rankImagesV340(candidates,width/height,selection).slice(0,gallery.maxImages).map(v=>v.url),[candidates,width,height,selection,smartSelection,gallery.maxImages]);
 const interval=musicGalleryIntervalV341(gallery.intervalSeconds,section,music);
 useEffect(()=>{
  if(!playing||!gallery.enabled||gallery.mode!=='slideshow'||orderedImages.length<2)return;
  const timer=window.setInterval(()=>{lastAdvance.current=Date.now();setIndex(i=>i+1);},interval*1000);
  return()=>window.clearInterval(timer);
 },[playing,gallery.enabled,gallery.mode,orderedImages.length,interval]);
 useEffect(()=>{
  const beat=Number.isFinite(beatAccent)?Math.max(0,Math.min(1,beatAccent)):0;
  if(gallery.enabled&&gallery.mode==='slideshow'&&playing&&orderedImages.length>1&&shouldBeatAdvanceV341(beat,previousBeat.current,(Date.now()-lastAdvance.current)/1000,section,music)){
   lastAdvance.current=Date.now();setIndex(v=>v+1);
  }
  previousBeat.current=beat;
 },[beatAccent,section,playing,gallery.enabled,gallery.mode,orderedImages.length,music]);
 const suggestion=decidePhotoMoodV346({section,genre,beatAccent,playing,imageCount:Math.min(orderedImages.length,composition.layers.length)},director);
 useEffect(()=>{
  if(!director.enabled)return;
  const now=Date.now();
  if(mood!==suggestion.mood&&(moodAt.current===0||now-moodAt.current>=director.minimumHoldSeconds*1000)){
   moodAt.current=now;setMood(suggestion.mood);
  }
 },[director.enabled,director.minimumHoldSeconds,suggestion.mood,mood]);
 const effectiveMood=director.mode==='manual'?director.manualMood:mood;
 const directorCount=director.enabled?(effectiveMood==='focus'?1:effectiveMood==='balanced'?3:8):composition.layers.length;
 const choreographyActive=!!choreography?.active&&!(director.enabled&&director.mode==='manual');
 const activeCount=choreographyActive?(choreography!.cue==='photos'?Math.min(composition.layers.length,choreography!.visiblePhotos):Math.min(directorCount,choreography!.visiblePhotos)):directorCount;
 const photoMotion=choreographyActive?choreography!.photoMotion:1;
 const panels=composition.layers.slice(0,8).map((layer,i)=>({layer,i,projection:projectPhotoLayerV348(layer,i,composition.layers.length,settings,width,height)}));
 const panelUrls=smartSelection.enabled?selectPhotosForSlotsV349(
  candidates.filter(c=>orderedImages.includes(c.url)),
  panels.map(({layer,projection:p})=>({width:width*layer.width,height:height*layer.height,displayWidth:p.widthPx,displayHeight:p.heightPx})),
  smartSelection,gallery.mode==='slideshow'?index:0).map(m=>m.url):[];
 // One frame subscriber for at most eight existing Drei Html nodes. Disabled modes mount no listener.
 useFrame(({clock},delta)=>{
  tick.current++;
  if(settings.quality==='eco'&&tick.current%3!==0)return;
  const activeBeat=playing?Math.min(1,Math.max(0,Number.isFinite(beatAccent)?beatAccent:0)):0;
  const phase=clock.elapsedTime*settings.motionSpeed;
  for(const {layer,i,projection:p} of panels){
   const node=groups.current[layer.id];if(!node)continue;
   const visible=i<activeCount;
   const float=playing&&settings.quality!=='eco'&&visible?Math.sin(phase*(.65+i*.045)+i*1.4)*settings.floatAmount*.07*photoMotion:0;
   const beat=playing&&visible?activeBeat*settings.beatResponse*.09*photoMotion:0;
   // Parallax simulates a subtle camera dolly relative to each panel's depth;
   // the actual stage camera stays under the existing camera director's control.
   const parallax=playing&&visible&&settings.quality!=='eco'?Math.sin(phase*.32)*settings.parallax*.06*(1+p.z)*photoMotion:0;
   const speed=settings.quality==='eco'?2:settings.motionSpeed;
   node.position.x=interpolatePhotoPanelV348(node.position.x,p.x+parallax+(choreographyActive?choreography!.avoidLyricsX*width:0),delta*(settings.quality==='eco'?3:1),speed);
   node.position.y=interpolatePhotoPanelV348(node.position.y,p.y+float,delta*(settings.quality==='eco'?3:1),speed);
   node.position.z=interpolatePhotoPanelV348(node.position.z,p.z+beat,delta*(settings.quality==='eco'?3:1),speed);
   node.rotation.y=interpolatePhotoPanelV348(node.rotation.y,p.yaw+beat*.17+parallax*.11,delta*(settings.quality==='eco'?3:1),speed);
   node.rotation.x=interpolatePhotoPanelV348(node.rotation.x,p.pitch,delta*(settings.quality==='eco'?3:1),speed);
   const target=visible?1+beat*.10*photoMotion:.92;
   const s=interpolatePhotoPanelV348(node.scale.x,target,delta*(settings.quality==='eco'?3:1),speed);
   node.scale.setScalar(s);
  }
 });
 if(!orderedImages.length)return null;
 return <group name="SonicPhotoGallery3DV348">
  {panels.map(({layer,i,projection:p})=>{
   const url=smartSelection.enabled?(panelUrls[i]||orderedImages[i%orderedImages.length]):orderedImages[(i+(gallery.mode==='slideshow'?index:0))%orderedImages.length];
   const visible=i<activeCount;
   const style:CSSProperties={width:p.widthPx,height:p.heightPx,pointerEvents:'none',userSelect:'none',
    opacity:visible?(choreographyActive?choreography!.photoOpacity:1):0,transition:choreographyActive?`opacity ${choreography!.transitionMs}ms ease`:transitions.enabled?`opacity ${fxTransition.durationMs}ms ease`:'opacity 400ms ease'};
   return <group key={layer.id} ref={node=>{groups.current[layer.id]=node;}} position={[p.x,p.y,p.z]} rotation={[p.pitch,p.yaw,0]} visible={true}>
    <Html transform center distanceFactor={3.1*scale} zIndexRange={[12,3]} style={style}>
     <div aria-hidden={!visible} className={`sonic-photo-3d-stage-card-v348 sonic-photo-3d-frame-${settings.frameStyle}-v348 sonic-photo-3d-quality-${settings.quality}-v348`}
      style={{'--sonic-multi-crop-x':`${layer.cropX}%`,'--sonic-multi-crop-y':`${layer.cropY}%`,'--sonic-multi-zoom':String(layer.zoom)} as CSSProperties}>
      {transitions.enabled?<PhotoCrossfadeV347 src={url} alt={`${alt} – Foto ${i+1}`} enabled durationMs={fxTransition.crossfadeMs} className={fxTransition.style==='fade'?'':`sonic-v353-transition-${fxTransition.style}`} onError={()=>setFailed(old=>old.includes(url)?old:[...old,url])}/>:<img src={url} alt={`${alt} – Foto ${i+1}`} onError={()=>setFailed(old=>old.includes(url)?old:[...old,url])}/>}
      {credits[url]&&<span className="sonic-gallery-credit-tile-v339" title={credits[url]}>{credits[url]}</span>}
     </div>
    </Html>
   </group>;
  })}
 </group>;
}
