/** V833: dispose *only resources explicitly owned by the caller*.
 * This is not a GPU/VRAM meter and MUST NOT receive shared useGLTF geometry,
 * textures or materials. No objects are retained in global telemetry.
 */
export type DisposableResourceV833 = { dispose(): void };
export type CleanupResultV833 = {attempted:number;disposed:number;failed:number};
export type CleanupSnapshotV833 = Readonly<{scopes:number;attempted:number;disposed:number;failed:number}>;
let scopes=0, attempted=0, disposed=0, failed=0;
export function getCleanupSnapshotV833():CleanupSnapshotV833 {
  return {scopes,attempted,disposed,failed};
}
/** Dispose all distinct resources even if one throws; record failures without
 * retaining disposed objects or sensitive exception messages. */
export function settleOwnedResourcesV833(resources:Iterable<DisposableResourceV833|null|undefined>):CleanupResultV833 {
  const seen=new Set<DisposableResourceV833>();
  let ok=0,bad=0;
  for(const resource of resources){
    if(!resource||seen.has(resource))continue;
    seen.add(resource);
    try{resource.dispose();ok++;}catch{bad++;}
  }
  const result={attempted:ok+bad,disposed:ok,failed:bad};
  scopes++;attempted+=result.attempted;disposed+=ok;failed+=bad;
  return result;
}
/** React effect cleanup helper: repeated unmounts or route switches cannot
 * dispose the same owned resource twice within this scope. */
export function createOwnedCleanupScopeV833() {
  const resources=new Set<DisposableResourceV833>();
  let closed=false;
  return {
    add<T extends DisposableResourceV833>(value:T):T{
      if(closed)throw Error('V833: cleanup scope already closed');
      resources.add(value);return value;
    },
    dispose():CleanupResultV833{
      if(closed)return {attempted:0,disposed:0,failed:0};
      closed=true;
      const result=settleOwnedResourcesV833(resources);
      resources.clear();
      return result;
    },
    get closed(){return closed;},
  };
}
