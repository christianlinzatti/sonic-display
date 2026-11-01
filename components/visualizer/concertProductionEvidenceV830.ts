/** V830 – conservative proof that actual, VISIBLE skinned GLB avatar meshes
 * occupy every configured performer slot. This is NOT a GPU timer or a model
 * provenance attestation. No renderer allocations or DOM work.
 * Called only after a completed ~500ms V826 measurement window.
 */
import type {AcceptanceKeyV829,AcceptanceStoreV829} from './concertAcceptanceV829';
import {acceptanceReportV829,acceptanceKeyV829} from './concertAcceptanceV829';
export interface CastNodeV830 {
 name:string;visible:boolean;children:CastNodeV830[];parent?:CastNodeV830|null;
 isSkinnedMesh?:boolean;
 geometry?:{attributes?:{position?:{count:number}}};
}
export interface CastSceneV830 {getObjectByName(name:string):CastNodeV830|undefined;}
export interface CastProofV830 {
 expected:number;riggedSlots:number;skinnedMeshes:number;vertices:number;
 missingSlots:number[];verified:boolean;
}
const validCount=(n:number)=>Number.isInteger(n)&&n>=1&&n<=4;
/** Traverses only four named performer roots; scenery/preview meshes never count. */
export function inspectVisibleCastV830(scene:CastSceneV830,expected:number):CastProofV830 {
 const missingSlots:number[]=[];
 if(!validCount(expected))return {expected:0,riggedSlots:0,skinnedMeshes:0,vertices:0,missingSlots,verified:false};
 let riggedSlots=0,skinnedMeshes=0,vertices=0;
 for(let i=0;i<expected;i++){
  const root=scene.getObjectByName(`v377-vocal-stage-slot-${i}`);
  let slotMeshes=0;
  const scan=(node:CastNodeV830,ancestorsVisible:boolean):void=>{
   if(!ancestorsVisible||!node.visible)return;
   const count=node.geometry?.attributes?.position?.count??0;
   if(node.isSkinnedMesh===true&&Number.isFinite(count)&&count>0){
    slotMeshes++;skinnedMeshes++;vertices+=Math.floor(count);
   }
   for(const child of node.children)scan(child,true);
  };
  let parentsVisible=true;
  for(let p=root?.parent;p;p=p.parent){if(!p.visible){parentsVisible=false;break;}}
  if(root)scan(root,parentsVisible);
  if(slotMeshes>0)riggedSlots++;else missingSlots.push(i);
 }
 return {expected,riggedSlots,skinnedMeshes,vertices,missingSlots,verified:riggedSlots===expected};
}
export interface CastCaptureV830 {
 trackId:string;expected:number;windows:number;validWindows:number;
 firstProgressMs:number;lastProgressMs:number;maxSkinnedMeshes:number;
 maxVertices:number;lastProof:CastProofV830;
}
export type CastEvidenceStoreV830=Partial<Record<AcceptanceKeyV829,CastCaptureV830>>;
let captures:CastEvidenceStoreV830={};
const SERVER_EMPTY_CAST_V830:Readonly<CastEvidenceStoreV830>={};
const listeners=new Set<()=>void>();
const emit=()=>{for(const f of listeners)f();};
export const subscribeCastV830=(f:()=>void)=>{listeners.add(f);return ()=>{listeners.delete(f);};};
export const getCastV830=():Readonly<CastEvidenceStoreV830>=>captures;
export const getCastServerV830=():Readonly<CastEvidenceStoreV830>=>SERVER_EMPTY_CAST_V830;
export function resetCastV830(key?:AcceptanceKeyV829):void{
 if(key){const next={...captures};delete next[key];captures=next;}else captures={};
 emit();
}
export interface CastWindowInputV830 {
 key:AcceptanceKeyV829|null;scene:CastSceneV830;expected:number;trackId:string;
 progressMs:number;playing:boolean;verified:boolean;liveShow:boolean;
}
/** Called BEFORE V829 ends the recording on its final measurement window. */
export function recordCastWindowV830(i:CastWindowInputV830):void {
 if(!i.key||!validCount(i.expected)||!i.playing||!i.verified||!i.liveShow||
  !i.trackId.trim()||!Number.isFinite(i.progressMs)||i.progressMs<0)return;
 const proof=inspectVisibleCastV830(i.scene,i.expected);
 const previous=captures[i.key];
 // A second song / position reset never inherits evidence from an earlier run.
 const old=previous&&previous.trackId===i.trackId&&previous.expected===i.expected&&
   i.progressMs>=previous.lastProgressMs-1000?previous:undefined;
 captures={...captures,[i.key]:{trackId:i.trackId,expected:i.expected,windows:(old?.windows??0)+1,
  validWindows:(old?.validWindows??0)+(proof.verified?1:0),
  firstProgressMs:old?.firstProgressMs??i.progressMs,lastProgressMs:i.progressMs,
  maxSkinnedMeshes:Math.max(old?.maxSkinnedMeshes??0,proof.skinnedMeshes),
  maxVertices:Math.max(old?.maxVertices??0,proof.vertices),lastProof:proof}};
 emit();
}
/** Fails closed: missing visible rigs, mismatching tracks, or insufficient coverage
 * block a production verdict even if the V829 manual review said 'passed'.
 */
export function productionReadinessV830(acceptance:AcceptanceStoreV829,proofs:CastEvidenceStoreV830){
 const base=acceptanceReportV829(acceptance);
 const rows=base.rows.map(row=>{
  const capture=proofs[acceptanceKeyV829(row.genre,row.count)];
  const match=!!capture&&capture.trackId===row.trackId&&capture.expected===row.count;
  const sufficient=match&&capture.windows>=20&&capture.validWindows>=capture.windows*.95&&
   capture.lastProof.verified&&capture.firstProgressMs<=12000&&
   !!acceptance.cases[acceptanceKeyV829(row.genre,row.count)]?.fullSong&&
   capture.lastProgressMs>=((acceptance.cases[acceptanceKeyV829(row.genre,row.count)]?.lastMs??Infinity)-1500);
  return {...row,castVerified:!!sufficient,castWindows:match?capture.windows:0,
   riggedSlots:match?capture.lastProof.riggedSlots:0,skinnedMeshes:match?capture.maxSkinnedMeshes:0,
   meshVertices:match?capture.maxVertices:0,
   productionStatus:row.status==='passed'&&sufficient?'reviewed-with-visible-rigs':'blocked'};
 });
 return {version:'V830',mode:'live-render-evidence-and-explicit-human-review',
   disclaimer:'Rig-Nachweis prüft sichtbare SkinnedMeshes in den benannten Performer-Slots, nicht GLB-Herkunft, physische GPU-Zeit, Bildqualität oder Audio-Synchronität.',
   rows,comparable:base.comparable,
   sourceAcceptancePassed:base.allPassed,
   liveEvidenceReady:base.allPassed&&rows.every(r=>r.castVerified),
   productionReleased:false, // Build, GPU and audiovisual acceptance are external gates.
   requiresBuildGate:true};
}
