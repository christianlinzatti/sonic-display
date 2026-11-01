import type {AvatarModel} from '@/components/visualizer/avatarModels';
let cached:AvatarModel[]|null=null,pending:Promise<AvatarModel[]>|null=null,epoch=0;
const listeners=new Set<()=>void>();
export function subscribeAvatarCatalogV733(fn:()=>void){listeners.add(fn);return()=>{listeners.delete(fn);};}
export function invalidateAvatarCatalogV733(){epoch++;cached=null;pending=null;for(const fn of listeners)fn();}
export function loadAvatarCatalogV733():Promise<AvatarModel[]>{
 if(cached)return Promise.resolve(cached);if(pending)return pending;
 const version=epoch;
 const request=fetch('/api/avatars',{cache:'no-store',signal:AbortSignal.timeout(10000)}).then(async r=>{if(!r.ok)throw Error('Avatar-Katalog nicht erreichbar');const data=await r.json();return [...(Array.isArray(data.defaults)?data.defaults:[]),...(Array.isArray(data.models)?data.models:[])] as AvatarModel[];}).then(models=>{if(version===epoch)cached=models;return models;}).finally(()=>{if(version===epoch)pending=null;});
 pending=request;return request;
}
