"use client";
import {resolveVisualFxPhotoV353,type VisualFxCueV353} from "@/services/stageContent/visualEffectsStudioV353";
import {coordinateGenrePhotosV352,type GenreVisualCueV352} from "@/services/stageContent/genreVisualDirectorV352";
import {coordinatePhotosV351,composeLegacyPlacementV351,type SmartStageCueV351} from '@/services/stageContent/smartStageCompositionV351';
import {LYRICS_PHOTO_EVENT_V350,decideLyricsPhotoV350,readLyricsPhotoV350} from "@/services/stageContent/lyricsPhotoChoreographyV350";
import {StageImageGalleryV338} from "./StageImageGalleryV338";
import {ARTIST_VISUAL_EVENT_V653,readSmartArtistVisualV653,planSmartArtistVisualV653,coordinateArtistVisualV653} from "@/services/stageContent/smartArtistVisualDirectorV653";
import {coordinateConcertPhotosV654,type ConcertFlowCueV654} from "./intelligentConcertFlowV654";
import {StagePhotoGallery3DV348} from "./StagePhotoGallery3DV348";
import {PHOTO_GALLERY_3D_EVENT_V348,readPhotoGallery3DV348,canShowPhotoGallery3DV348} from "@/services/stageContent/photoGallery3DV348";
import {MULTI_PHOTO_EVENT_V345,readPhotoCompositionsV345} from "@/services/stageContent/multiPhotoLayoutV345";
import {layoutRatioV344} from "@/services/stageContent/galleryLayoutV344";
import {safeStageMediaV330} from "@/services/stageContent/stageContentV330";
import {ConcertDisplayV337} from "./ConcertDisplayV337";
import {Html} from "@react-three/drei";
import {useEffect,useRef,useState} from "react";
import type {ContentScreenV333} from "@/services/stageContent/layoutV333";
import type {StageContentV330,StageContentSettingsV330} from "@/services/stageContent/stageContentV330";

/** A real stage-positioned content screen; HTML video intentionally avoids cross-origin WebGL VideoTexture restrictions. */
export function StageContentScreenV330({content,settings,playing,reducedMotion,albumCoverUrl,screen,section,beatAccent,genre,lyricsActive=false,lyricsSide=null,composition,genreCue,fxCue,lipSyncActive=false,concertFlowV654}:{
  content:StageContentV330|null;settings:StageContentSettingsV330;playing:boolean;reducedMotion:boolean;albumCoverUrl:string|null;screen?:ContentScreenV333;section?:string;beatAccent?:number;genre?:string;lyricsActive?:boolean;lyricsSide?:'left'|'right'|null;composition?:SmartStageCueV351;genreCue?:GenreVisualCueV352;fxCue?:VisualFxCueV353;lipSyncActive?:boolean;concertFlowV654?:ConcertFlowCueV654;
}){
  const video=useRef<HTMLVideoElement>(null);
  const [failedUrl,setFailedUrl]=useState<string|null>(null);
  const [photo3D,setPhoto3D]=useState(readPhotoGallery3DV348);
  const [lyricsPhoto,setLyricsPhoto]=useState(readLyricsPhotoV350);
  const [compositions,setCompositions]=useState(readPhotoCompositionsV345);
  const [artistVisualSettings,setArtistVisualSettings]=useState(readSmartArtistVisualV653);
  useEffect(()=>{
    const refresh3D=()=>setPhoto3D(readPhotoGallery3DV348());
    const refreshLyricsPhoto=()=>setLyricsPhoto(readLyricsPhotoV350());
    const refreshCompositions=()=>setCompositions(readPhotoCompositionsV345());
    window.addEventListener(PHOTO_GALLERY_3D_EVENT_V348,refresh3D);
    window.addEventListener(LYRICS_PHOTO_EVENT_V350,refreshLyricsPhoto);
    window.addEventListener(MULTI_PHOTO_EVENT_V345,refreshCompositions);
    const refreshArtistVisual=()=>setArtistVisualSettings(readSmartArtistVisualV653());
    window.addEventListener(ARTIST_VISUAL_EVENT_V653,refreshArtistVisual);
    return()=>{window.removeEventListener(PHOTO_GALLERY_3D_EVENT_V348,refresh3D);window.removeEventListener(LYRICS_PHOTO_EVENT_V350,refreshLyricsPhoto);window.removeEventListener(MULTI_PHOTO_EVENT_V345,refreshCompositions);window.removeEventListener(ARTIST_VISUAL_EVENT_V653,refreshArtistVisual);};
  },[]);
  const selectedUrl=content?.url??null;
  useEffect(()=>setFailedUrl(null),[selectedUrl]);
  useEffect(()=>{
    const player=video.current;
    if(!player)return;
    if(playing&&!reducedMotion){void player.play().catch(()=>{setFailedUrl(selectedUrl);});}
    else player.pause();
  },[selectedUrl,playing,reducedMotion,failedUrl]);
  if(!settings.enabled||!content)return null;
  const fallback=content.kind==="video"&&(reducedMotion||selectedUrl===failedUrl);
  const legacyX=settings.position==="left"?-3.85:settings.position==="right"?3.85:0;
  const legacyZ=settings.position==="behind"?-3.9:-1.8;
  const scale=(screen?.scale??settings.screenScale)*(screen?1:(settings.position==="behind"?1:.72));
  const width=4.8*scale,height=2.7*scale;
  const photoImages=fallback?[albumCoverUrl??""]:(content.images?.length?content.images:[content.url??""]);
  const aspect=width/height;
  const photoComposition=compositions[layoutRatioV344(aspect)];
  const validPhotoImages=[...new Set(photoImages.map(safeStageMediaV330).filter((x):x is string=>!!x))];
  const originalPhotoCue=decideLyricsPhotoV350({lyricsActive,lyricsSide,section,beatAccent,playing,imageCount:validPhotoImages.length,reducedMotion},lyricsPhoto);
  const composedPhotoCue=coordinateGenrePhotosV352(coordinatePhotosV351(originalPhotoCue,composition),genreCue);
  const artistVisualCue=planSmartArtistVisualV653({section,lyricsActive,lipSyncActive,lyricsSide,beatAccent,playing,reducedMotion,imageCount:validPhotoImages.length},artistVisualSettings);
  const manualPhotoOverride=lyricsPhoto.enabled&&lyricsPhoto.mode==='manual';
  const photoChoreography=coordinateConcertPhotosV654(
    coordinateArtistVisualV653(artistVisualCue,composedPhotoCue,manualPhotoOverride),
    concertFlowV654,{manual:manualPhotoOverride||!artistVisualCue.active,lyricsActive:lyricsActive||lipSyncActive});
  // V350 manual choices win; automatic V653 only reorders the existing V652 photo pool.
  const focusedScene=manualPhotoOverride&&originalPhotoCue.active?originalPhotoCue.cue:
   originalPhotoCue.active?originalPhotoCue.cue:artistVisualCue.active?artistVisualCue.scene:
   photoChoreography.active?photoChoreography.cue:lyricsActive?'lyrics':/hook|chorus|drop|peak/i.test(section??'')?'photos':'balanced';
  const sceneUrls=content.imageSelections?.[focusedScene];
  const stageImages=sceneUrls?.length?[...new Set(sceneUrls.map(safeStageMediaV330).filter((x):x is string=>!!x))]:validPhotoImages;
  const legacyPlacement={x:legacyX,y:settings.screenHeight,z:legacyZ,scale,yaw:settings.position==="left"?.22:settings.position==="right"?-.22:0};
  const placement=screen??(composition?composeLegacyPlacementV351(legacyPlacement,composition):legacyPlacement);
  const show3D=(content.kind==="image"||fallback)&&canShowPhotoGallery3DV348(photo3D.enabled,photoComposition.enabled,validPhotoImages.length,reducedMotion)&&photoComposition.layers.length>=2;
  return <group position={[placement.x,placement.y,placement.z]} rotation={[0,placement.yaw,0]} scale={screen?1:placement.scale/scale}>
    <mesh position={[0,0,-.03]}><planeGeometry args={[width+.14,height+.14]}/><meshBasicMaterial color="#152234"/></mesh>
    <mesh position={[0,0,-.015]}><planeGeometry args={[width,height]}/><meshBasicMaterial color="#050911"/></mesh>
    {show3D&&<StagePhotoGallery3DV348 images={stageImages} curatedOrder={artistVisualCue.active&&content.source==="photos"&&!!content.imageSelections} alt={content.title} credits={content.imageCredits} composition={photoComposition} settings={photo3D} width={width} height={height} scale={scale} section={section} genre={genre} beatAccent={beatAccent} playing={playing} choreography={photoChoreography} fxCue={fxCue}/>}
    <Html transform center occlude="blending" distanceFactor={3.1*scale} zIndexRange={[8,2]}
      style={{width:640,height:360,pointerEvents:"none",userSelect:"none"}}>
      <div className="sonic-content-screen-v330" aria-label={`${content.title} auf der Bühnenleinwand`}>
        {content.kind==="video"&&!fallback&&content.url&&<video key={content.url} ref={video}
          src={content.url} autoPlay={playing&&!reducedMotion} loop muted playsInline preload="metadata"
          onError={()=>setFailedUrl(content.url??null)}
          poster={albumCoverUrl??undefined}/>} 
        {(content.kind==="image"||fallback)&&!show3D&&((fallback&& !albumCoverUrl) ? <div className="sonic-content-screen-v330-text"><h3>{content.title}</h3><p>Video derzeit nicht verfügbar</p></div> : <StageImageGalleryV338 images={fallback?[albumCoverUrl??""]:stageImages} curatedOrder={artistVisualCue.active&&content.source==="photos"&&!!content.imageSelections} alt={content.title} reducedMotion={reducedMotion} credits={content.imageCredits} targetAspectRatio={width/height} section={section} beatAccent={beatAccent} genre={genre} playing={playing} choreography={photoChoreography} fxCue={fxCue}/>)}
        {content.kind==="text"&&<div className="sonic-content-screen-v330-text" style={{opacity:artistVisualCue.bioOpacity,transition:`opacity ${artistVisualCue.transitionMs}ms ease`}}><h3>{content.title}</h3><p>{content.source==="text"&&artistVisualCue.active&&artistVisualCue.bioMode==='teaser'?`${(content.text??'').slice(0,110).trim()}${(content.text??'').length>110?'…':''}`:content.text}</p></div>}
        {content.kind==="events"&&<ConcertDisplayV337 events={content.events??[]} title={content.title} reducedMotion={reducedMotion}/>}
        <span className="sonic-content-screen-v330-source">{content.source==="canvas"?"Spotify Canvas":content.source==="cover"?"Albumcover":content.source==="photos"?"Künstlerfoto":content.source==="concerts"?"Live-Termine":"Artist Info"}</span>
      </div>
    </Html>
  </group>;
}
