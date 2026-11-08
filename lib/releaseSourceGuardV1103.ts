/** V1103 - portable release path and manifest checks. Pure code; no I/O, no writes.
 * Windows/Ubuntu must address the same files after a ZIP import. */
export type SourcePathAuditV1103={passed:boolean;files:number;errors:string[]};
const reserved=/^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])(?:\.|$)/i;
const segmentOk=(part:string):boolean=>Boolean(part)&&part!=='.'&&part!=='..'&&
 !/[\\/:*?"<>|\x00-\x1f]/.test(part)&&!/[. ]$/.test(part)&&!reserved.test(part);
/** Rejects paths that Windows or POSIX could reinterpret, collide or truncate. */
export function auditSourcePathsV1103(paths:readonly string[]):SourcePathAuditV1103{
 const errors:string[]=[],seen=new Set<string>();
 for(const file of paths){
  if(typeof file!=='string'||!file||file.startsWith('/')||file.length>240||file.includes('\\')){
   errors.push(`unsafe-path:${String(file).slice(0,90)}`);continue;
  }
  const segments=file.split('/');
  if(segments.some(part=>!segmentOk(part))){errors.push(`unsafe-segment:${file.slice(0,90)}`);continue;}
  const canonical=file.normalize('NFC').toLowerCase();
  if(seen.has(canonical)){errors.push(`case-or-unicode-collision:${file.slice(0,90)}`);continue;}
  seen.add(canonical);
 }
 return {passed:errors.length===0,files:paths.length,errors:errors.slice(0,50)};
}

export type ReleaseMetadataV1103={version?:unknown;sonicFeatureRelease?:unknown;sonicRoadmapRelease?:unknown;engines?:{node?:unknown}};
export function auditReleaseMetadataV1103(pkg:ReleaseMetadataV1103,lock:{version?:unknown;packages?:Record<string,{version?:unknown}>}|null):string[]{
 const failures:string[]=[];
 const m=/^0\.1\.0-v(\d+)$/.exec(typeof pkg?.version==='string'?pkg.version:'');
 if(!m||Number(m[1])<1103||!Number.isSafeInteger(Number(m[1])))failures.push('release-version');
 if(!m||pkg.sonicRoadmapRelease!==`v${m[1]}`||pkg.sonicFeatureRelease!==`v${m[1]}`)failures.push('release-markers');
 if(pkg.engines?.node!=='24.x')failures.push('node24-engine');
 if(!m||lock?.version!==pkg.version||lock?.packages?.['']?.version!==pkg.version)failures.push('lockfile-version');
 return failures;
}
