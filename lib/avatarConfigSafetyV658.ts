/** V658: revisioned avatar configuration journal projection.
 * No external state. The same journal produces the same state on every server.
 */
import {createHash} from 'node:crypto';
export type AvatarRecordV658=Record<string,unknown>;
export type AvatarJournalEventV658={filename:string;patch:AvatarRecordV658;expectedRevision?:string;opId?:string};
export type AvatarJournalConflictV658={filename:string;opId:string;expectedRevision:string;actualRevision:string};
export const validConfigKeyV658=(key:string):boolean=>key.length>0&&key.length<=200&&!['__proto__','prototype','constructor'].includes(key);
export const isAvatarRecordV658=(value:unknown):value is AvatarRecordV658=>
  value!==null&&typeof value==='object'&&!Array.isArray(value);
export function canonicalValueV658(value:unknown):unknown{
  if(Array.isArray(value))return value.map(canonicalValueV658);
  if(isAvatarRecordV658(value))return Object.fromEntries(Object.entries(value).filter(([k])=>validConfigKeyV658(k)).sort(([a],[b])=>a<b?-1:a>b?1:0).map(([k,v])=>[k,canonicalValueV658(v)]));
  return value;
}
export const revisionV658=(metadata:AvatarRecordV658):string=>createHash('sha256').update(JSON.stringify(canonicalValueV658(metadata))).digest('hex');
export function normalizeAvatarConfigV658(raw:unknown):Record<string,AvatarRecordV658>{
  if(!isAvatarRecordV658(raw))throw new Error('Invalid avatar config root');
  const safe:Record<string,AvatarRecordV658>=Object.create(null);
  for(const [key,metadata] of Object.entries(raw)){
    if(!validConfigKeyV658(key)||!isAvatarRecordV658(metadata))throw new Error('Invalid avatar config entry');
    safe[key]=metadata;
  }
  return safe;
}
export function projectAvatarJournalV658(baseline:Record<string,AvatarRecordV658>,events:readonly AvatarJournalEventV658[]){
  const config:Record<string,AvatarRecordV658>=Object.assign(Object.create(null),baseline);
  const revisions:Record<string,string>=Object.create(null);
  for(const key of Object.keys(config))revisions[key]=revisionV658(config[key]);
  const conflicts:AvatarJournalConflictV658[]=[];
  const applied=new Set<string>();
  for(const change of events){
    if(!validConfigKeyV658(change.filename)||!isAvatarRecordV658(change.patch))continue;
    const previous=config[change.filename]??{};
    const current=revisions[change.filename]??revisionV658({});
    if(change.expectedRevision!==undefined&&change.expectedRevision!==current){
      conflicts.push({filename:change.filename,opId:change.opId??'',expectedRevision:change.expectedRevision,actualRevision:current});
      continue;
    }
    const merged={...previous,...change.patch};
    config[change.filename]=merged;
    revisions[change.filename]=revisionV658(merged);
    if(change.opId)applied.add(change.opId);
  }
  return {config,revisions,conflicts,applied};
}
export class AvatarRevisionConflictV658 extends Error{
  readonly status=409;
  constructor(readonly actualRevision:string){super('Diese Avatar-Einstellungen wurden zwischenzeitlich geändert. Bitte neu laden und deine Änderungen erneut prüfen.');this.name='AvatarRevisionConflictV658';}
}
export class AvatarConfigUnsafeV658 extends Error{
  readonly status=503;
  constructor(){super('Konfigurations-Journal unvollständig. Schreibzugriff zum Schutz der Daten angehalten.');this.name='AvatarConfigUnsafeV658';}
}
