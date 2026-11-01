"use client";
import {useFrame} from '@react-three/fiber';
import {useRef} from 'react';
import {Vector3,type Object3D} from 'three';
import {classifyAnatomicalBoneV754,type ProjectedBodyV754,type VisualAnchorV754} from './visualQualityInspectorV754';
import {getRenderMetricsSnapshot} from './renderDiagnostics';
import {TRACKING_ROOT_NAME} from './smartCameraTrackingV297';
import {getActivePerformanceTier} from './adaptivePerformance';
import {publishConcertQualityV466} from './concertQualityStoreV466';
import {assessConcertQualityV466,type ProjectedAvatarV466,type ScreenRectV466} from '@/services/show/concertQualityInspectorV466';

// Samples only when the inspector is explicitly open, at most ~1 Hz.
// Traversing 1–4 avatar subtrees for their named head bones is NOT run per frame.
const asRect=(r:DOMRect):ScreenRectV466=>({x:r.x,y:r.y,width:r.width,height:r.height});
function avatarSlots(root:Object3D):Object3D[]{
 const found:Object3D[]=[];
 root.traverse(node=>{if(/^v377-vocal-stage-slot-[0-3]$/.test(node.name))found.push(node);});
 return found.length?found.sort((a,b)=>Number(a.name.slice(-1))-Number(b.name.slice(-1))).slice(0,4):[root];
}
function headAnchor(slot:Object3D):{point:Object3D|null;hips:Object3D|null;leftFoot:Object3D|null;rightFoot:Object3D|null;kind:'head-bone'|'estimated';loaded:boolean}{
 let point:Object3D|null=null;
 let hips:Object3D|null=null,leftFoot:Object3D|null=null,rightFoot:Object3D|null=null;
 let loaded=false;
 slot.traverse(node=>{
   if((node as Object3D & {isMesh?:boolean}).isMesh)loaded=true;
   if(!(node as Object3D & {isBone?:boolean}).isBone)return;
   // Strict anatomical bone names; avoid HeadEnd/HeadTop_End and toe tips.
   const name=node.name.toLowerCase().replace(/[^a-z0-9]/g,'');
   if(!point&&['head','mixamorighead','vrmhead','jbipchead'].includes(name))point=node;
   if(!hips&&['hips','mixamorighips','vrmhips','jbipchips'].includes(name))hips=node;
   if(!leftFoot&&['leftfoot','mixamorigleftfoot','vrmleftfoot','jbiplfoot','footl'].includes(name))leftFoot=node;
   if(!rightFoot&&['rightfoot','mixamorigrightfoot','vrmrightfoot','jbiprfoot','footr'].includes(name))rightFoot=node;
 });
 return {point,hips,leftFoot,rightFoot,kind:point?'head-bone':'estimated',loaded};
}
export function ConcertQualityProbeV466({enabled}:{enabled:boolean}){
 const elapsed=useRef(0);
 const point=useRef(new Vector3());
 const local=useRef(new Vector3());
 const bodyAnchors=useRef<ProjectedBodyV754[]>([]);
 useFrame(({scene,camera,gl},delta)=>{
   if(!enabled||typeof document==='undefined'||document.hidden){elapsed.current=0;return;}
   elapsed.current+=Math.max(0,Math.min(.2,delta));
   if(elapsed.current<1)return;
   elapsed.current=0;
   const canvas=gl.domElement;
   const rect=asRect(canvas.getBoundingClientRect());
   if(rect.width<=0||rect.height<=0)return;
   const stage=canvas.closest('.immersive-stage');
   // Active text only; invisible/unsynchronised karaoke lines do not trigger warnings.
   const lyricNode=stage?.querySelector('.immersive-lyrics-overlay .lyric.active, .immersive-lyrics-overlay .v461-lyric-line.active');
   const style=lyricNode?window.getComputedStyle(lyricNode):null;
   const lyrics=lyricNode&&style?.visibility!=='hidden'&&style?.display!=='none'&&Number(style?.opacity??1)>0?
     asRect(lyricNode.getBoundingClientRect()):null;
   const danceRoot=scene.getObjectByName(TRACKING_ROOT_NAME);
   const slots=danceRoot?avatarSlots(danceRoot):[];
   bodyAnchors.current=[];
   const avatars:ProjectedAvatarV466[]=slots.map((slot,index)=>{
     const slotNumber=slots.length===1?0:Number(slot.name.slice(-1))||index;
     const projectBone=(bone:Object3D|null):VisualAnchorV754|null=>{
       if(!bone)return null;
       bone.getWorldPosition(point.current);
       const inFront=point.current.clone().applyMatrix4(camera.matrixWorldInverse).z<0;
       const projected=point.current.project(camera);
       return {x:rect.x+(projected.x+1)*rect.width*.5,
         y:rect.y+(1-projected.y)*rect.height*.5,
         inFront:inFront&&Number.isFinite(projected.x)&&Number.isFinite(projected.y)&&projected.z>=-1&&projected.z<=1};
     };
     const head=headAnchor(slot);
     if(!head.loaded)return {slot:slotNumber,
       x:0,y:0,inFront:false,anchor:'estimated' as const,loaded:false};
     const body:ProjectedBodyV754={slot:slotNumber,headSource:head.kind,
       hips:projectBone(head.hips),leftFoot:projectBone(head.leftFoot),rightFoot:projectBone(head.rightFoot)};
     bodyAnchors.current.push(body);
     if(head.point){head.point.getWorldPosition(point.current);}
     else {slot.getWorldPosition(point.current);local.current.set(0,1.5,0);
       slot.localToWorld(local.current);point.current.copy(local.current);}
     const forward=point.current.clone().applyMatrix4(camera.matrixWorldInverse).z<0;
     const projected=point.current.project(camera);
     const inFront=forward&&Number.isFinite(projected.x)&&Number.isFinite(projected.y)&&
       projected.z>=-1&&projected.z<=1;
     return {slot:slotNumber,
       x:rect.x+(projected.x+1)*rect.width*.5,
       y:rect.y+(1-projected.y)*rect.height*.5,
       inFront,anchor:head.kind,loaded:true};
   });
   const m=getRenderMetricsSnapshot();
   const fpsFresh=m.updatedAt!==0&&Date.now()-m.updatedAt<5000;
   const assessment=assessConcertQualityV466({canvas:rect,lyrics,avatars,fps:fpsFresh?m.fps:null,fpsFresh});
   publishConcertQualityV466({at:Date.now(),canvas:rect,lyrics,avatars,bodyV754:bodyAnchors.current,assessment,
     fps:fpsFresh?m.fps:null,frameMs:fpsFresh?m.frameMs:null,
     p95FrameMs:fpsFresh?m.p95FrameMs??null:null,
     drawCalls:fpsFresh?m.drawCalls:null,triangles:fpsFresh?m.triangles:null,
     qualityTier:getActivePerformanceTier(),samples:fpsFresh?m.samples:0,
     geometries:fpsFresh?m.geometries:null,textures:fpsFresh?m.textures:null,
     renderWidthPx:gl.domElement.width,renderHeightPx:gl.domElement.height,metricsAt:fpsFresh?m.updatedAt:null,
     jsHeapMb:(()=>{const heap=(performance as Performance & {memory?:{usedJSHeapSize?:number}}).memory?.usedJSHeapSize;
       return typeof heap==='number'&&Number.isFinite(heap)&&heap>=0?Math.round(heap/1048576*10)/10:null;})()});
 });
 return null;
}
