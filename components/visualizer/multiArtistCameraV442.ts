import type {RapCameraPoseV429} from './cinematicRapCameraV429';
/** Conservative camera-space correction for AUTOMATIC three/four-artist closeups.
 * Applied before V432 keyframes and V351 lyrics guard, never to authored shots. */
export function frameMultiArtistCameraV442(pose:RapCameraPoseV429,input:{count:number;slot:number;group:boolean;lyricsProtected:boolean}):RapCameraPoseV429{
  const count=Math.max(1,Math.min(4,Math.floor(input.count)));
  if(count<3)return {...pose};
  const group=input.group;
  const slot=Math.max(0,Math.min(count-1,Math.floor(input.slot)));
  const shift=group?0:(slot-(count-1)/2)*1.1;
  const factor=input.lyricsProtected?.72:.95;
  const desiredX=shift*factor;
  const baseX=pose.targetX??0;
  const targetX=Math.max(-2.1,Math.min(2.1,baseX*.45+desiredX));
  const dx=targetX-baseX;
  return {...pose,x:pose.x+dx,targetX,z:Math.max(group?8:6.5,pose.z),fov:group?Math.max(38,pose.fov):pose.fov};
}
