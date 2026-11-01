'use strict';
/** V858: explain missing installation dependencies without modifying the project. */
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const list=['next','react','react-dom','typescript','@types/react','@types/node','three','zustand'];
const missing=[];
for(const name of list){
 try{require.resolve(`${name}/package.json`,{paths:[root]});}
 catch{missing.push(name);}
}
if(missing.length){
 console.error(`FEHLENDE PROJEKTABHÄNGIGKEITEN: ${missing.join(', ')}`);
 console.error('Bitte im Projektverzeichnis zunächst `npm ci` mit funktionierender Registry-Verbindung ausführen.');
 console.error('Danach `npm run typecheck` und `npm run build` ausführen.');
 process.exitCode=1;
}else{
 console.log('OK: grundlegende Next.js-, React-, TypeScript- und Three.js-Abhängigkeiten sind vorhanden.');
 console.log('Dies ist nur eine Installationsprüfung. Typecheck/Next.js-Build müssen gesondert erfolgreich laufen.');
}
