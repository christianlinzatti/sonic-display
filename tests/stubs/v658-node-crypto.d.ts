/** Only for the isolated V658 typecheck; excluded from production tsconfig. */
declare module 'node:crypto' { export function createHash(algo:string):{update(data:string):{digest(format:'hex'):string}}; }
