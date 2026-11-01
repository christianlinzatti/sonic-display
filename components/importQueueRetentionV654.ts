/** Keep only live import entries. Caller must revoke URLs and release derived caches for removed IDs. */
export function retainImportQueueV654<T extends {id:string;url:string}>(
 existing:readonly T[], incoming:readonly T[], limit=60,
):{kept:T[];evicted:T[]}{
 const combined=[...existing,...incoming];
 const cutoff=Math.max(0,combined.length-Math.max(0,Math.floor(limit)));
 return {kept:combined.slice(cutoff),evicted:combined.slice(0,cutoff)};
}
