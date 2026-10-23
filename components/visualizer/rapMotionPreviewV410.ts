import type {InstalledCharacterMotion} from "./characterMotionLibrary";
import {isPreviewModelUrlV409} from "./rapAvatarPreviewV409";

export type RapPreviewMotionV410={id:string;name:string;kind:"embedded"|"installed";index?:number;url?:string};

/** Preview options never select a live-show motion or cross another avatar's installed library. */
export function availableRapPreviewMotionsV410(
  avatarId:string,
  installed:ReadonlyArray<InstalledCharacterMotion>,
  embeddedNames:ReadonlyArray<string>,
  activeAnimationUrl?:string|null,
):RapPreviewMotionV410[]{
  if(!avatarId||avatarId==="procedural")return [];
  const embedded=embeddedNames.slice(0,100).map((name,index)=>({id:`embedded:${index}`,name:`Im Avatar: ${name.trim()||`Clip ${index+1}`}`,kind:"embedded" as const,index}));
  const seen=new Set<string>();
  const external=installed.filter(m=>m.avatarId===avatarId&&isPreviewModelUrlV409(m.url)&&!seen.has(m.id)&&!!seen.add(m.id))
    .slice(0,250).map(m=>({id:`installed:${m.id}`,name:`Installiert: ${m.name}`,kind:"installed" as const,url:m.url}));
  const active=activeAnimationUrl&&isPreviewModelUrlV409(activeAnimationUrl)&&!external.some(m=>m.url===activeAnimationUrl)
    ?[{id:"configured:active",name:"Am Avatar konfiguriert: aktive Motion",kind:"installed" as const,url:activeAnimationUrl}]:[];
  return [...embedded,...active,...external];
}
export function selectedRapPreviewMotionV410(motions:ReadonlyArray<RapPreviewMotionV410>,id:string):RapPreviewMotionV410|null{
  return motions.find(m=>m.id===id)??null;
}
export function previewMotionSpeedV410(value:number):number{
  return Number.isFinite(value)?Math.max(.25,Math.min(1.75,value)):1;
}
