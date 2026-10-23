/** V348 – physically separated photo panels on the existing Three.js stage. */
import type {PhotoLayerV345} from './multiPhotoLayoutV345';
export type PhotoFrameStyleV348='glass'|'clean'|'neon';
export type PhotoQualityV348='eco'|'balanced'|'full';
export interface PhotoGallery3DSettingsV348 {
 enabled:boolean;depth:number;tilt:number;floatAmount:number;parallax:number;beatResponse:number;motionSpeed:number;
 frameStyle:PhotoFrameStyleV348;quality:PhotoQualityV348;
}
export const PHOTO_GALLERY_3D_KEY_V348='sonic-photo-gallery-3d-v348';
export const PHOTO_GALLERY_3D_EVENT_V348='sonic:photo-gallery-3d-v348';
export const DEFAULT_PHOTO_GALLERY_3D_V348:PhotoGallery3DSettingsV348={
 enabled:false,depth:.40,tilt:12,floatAmount:.3,parallax:.22,beatResponse:.35,motionSpeed:1,frameStyle:'glass',quality:'balanced'
};
const finite=(value:unknown,min:number,max:number,fallback:number)=>typeof value==='number'&&Number.isFinite(value)?Math.max(min,Math.min(max,value)):fallback;
export function sanitizePhotoGallery3DV348(value:unknown):PhotoGallery3DSettingsV348 {
 const v=value&&typeof value==='object'?value as Partial<PhotoGallery3DSettingsV348>:{};
 return {enabled:v.enabled===true,depth:finite(v.depth,0,1,.40),tilt:finite(v.tilt,0,30,12),
  floatAmount:finite(v.floatAmount,0,1,.3),parallax:finite(v.parallax,0,1,.22),beatResponse:finite(v.beatResponse,0,1,.35),motionSpeed:finite(v.motionSpeed,.2,2,1),
  frameStyle:v.frameStyle==='clean'||v.frameStyle==='neon'?v.frameStyle:'glass',quality:v.quality==='eco'||v.quality==='full'?v.quality:'balanced'};
}
export function readPhotoGallery3DV348():PhotoGallery3DSettingsV348{
 if(typeof window==='undefined')return {...DEFAULT_PHOTO_GALLERY_3D_V348};
 try{return sanitizePhotoGallery3DV348(JSON.parse(window.localStorage.getItem(PHOTO_GALLERY_3D_KEY_V348)||'null'));}
 catch{return {...DEFAULT_PHOTO_GALLERY_3D_V348};}
}
export function savePhotoGallery3DV348(value:PhotoGallery3DSettingsV348):PhotoGallery3DSettingsV348{
 const safe=sanitizePhotoGallery3DV348(value);
 if(typeof window!=='undefined'){
  try{window.localStorage.setItem(PHOTO_GALLERY_3D_KEY_V348,JSON.stringify(safe));}catch{}
  window.dispatchEvent(new Event(PHOTO_GALLERY_3D_EVENT_V348));
 }
 return safe;
}
export interface PhotoPanelProjectionV348 {x:number;y:number;z:number;yaw:number;pitch:number;widthPx:number;heightPx:number;}
/** Computes world-space offsets relative to the existing content-screen group. No image metadata or URLs persisted. */
export function projectPhotoLayerV348(layer:Pick<PhotoLayerV345,'x'|'y'|'width'|'height'>,index:number,total:number,settings:PhotoGallery3DSettingsV348,screenWidth:number,screenHeight:number):PhotoPanelProjectionV348 {
 const n=Math.max(1,Math.min(8,Math.floor(Number.isFinite(total)?total:1)));
 const w=finite(layer.width,12,100,40),h=finite(layer.height,12,100,40);
 const x=finite(layer.x,0,100-w,0),y=finite(layer.y,0,100-h,0);
 const width=finite(screenWidth,.1,100,4.8),height=finite(screenHeight,.1,100,2.7);
 const centerX=(x+w/2)/100,centerY=(y+h/2)/100;
 const depth=finite(settings.depth,0,1,.4);
 const front=.055+depth*(.14+.75*(n<=1?.5:index/(n-1)));
 const angle=finite(settings.tilt,0,30,12)*Math.PI/180;
 return {x:(centerX-.5)*width,y:(.5-centerY)*height,z:front,
  yaw:(.5-centerX)*2*angle,pitch:(centerY-.5)*angle*.36,
  widthPx:Math.max(1,Math.round(640*w/100)),heightPx:Math.max(1,Math.round(360*h/100))};
}
export function interpolatePhotoPanelV348(from:number,to:number,deltaSeconds:number,speed:number):number {
 const alpha=1-Math.exp(-Math.max(0,Math.min(.2,Number.isFinite(deltaSeconds)?deltaSeconds:0))*Math.max(.2,Math.min(2,speed))*8);
 return from+(to-from)*alpha;
}
/** Preserve pre-V348 rendering if off, fewer than two photos or no authored V345 composition. */
export function canShowPhotoGallery3DV348(enabled:boolean,compositionEnabled:boolean,imageCount:number,reducedMotion:boolean):boolean{
 return enabled&&compositionEnabled&&imageCount>=2&&!reducedMotion;
}
