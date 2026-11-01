#!/usr/bin/env node
'use strict';
/** Offline fail-closed manifest/rig audit. No GLB rewriting or automatic live activation. */
const fs=require('node:fs'),path=require('node:path');
const {evaluateLodSetV787}=require('../services/monitoring/smartAvatarLodRigV787.cjs');
const args=process.argv.slice(2);const opt=k=>args.find(a=>a.startsWith(`--${k}=`))?.slice(k.length+3);
function previewUrl(file){const inPublic=path.relative(path.resolve('public'),path.resolve(file));
 if(inPublic.startsWith('..')||path.isAbsolute(inPublic)||!inPublic||inPublic.split(path.sep).some(s=>s==='..'))return null;
 return '/'+inPublic.split(path.sep).map(encodeURIComponent).join('/');}
function run(){
 if(args.includes('--help')||!opt('lod0')){
  console.log('Usage: npm run avatar:lod:v787 -- --lod0=public/avatars/model_LOD0.glb [--lod1=...] [--lod2=...] [--out=artifacts/v787/lod-review.json]');return opt('lod0')?0:2;
 }
 const set={},paths={};let unreadable=[];
 for(const n of ['LOD0','LOD1','LOD2']){const p=opt(n.toLowerCase());if(!p)continue;
  try{const file=path.resolve(p);const stat=fs.statSync(file);if(!stat.isFile()||stat.size>256*1024*1024)throw Error('keine erlaubte GLB-Datei');
   set[n]=fs.readFileSync(file);paths[n]={file:path.basename(file),url:previewUrl(file)};
  }catch(e){unreadable.push(`${n}: ${e.message}`)}}
 let result=evaluateLodSetV787(set);
 const issues=[...unreadable,...result.issues];
 const variants=result.variants.map(v=>({...v,...(paths[v.name]??{file:null,url:null})}));
 if(variants.some(v=>v.status==='compatible'&&!v.url))issues.push('3D-Vorschau nur mit GLBs unter public/ moeglich');
 const report={format:'sonic-smart-avatar-lod-v787',version:1,status:result.status==='ready'&&unreadable.length===0&&variants.every(v=>v.status==='compatible'&&!!v.url)?'ready':'blocked',
  variants,issues,notes:[result.note,'Dreieckseinsparung ist KEIN FPS-Nachweis.','Kein Live-LOD-Wechsel: erst Rig/Bewegung und Sichtbarkeit visuell freigeben.','Alle drei GLBs werden in der Preview geladen; GPU-Speicher daher nicht mit der Produktivshow vergleichbar.']};
 const out=path.resolve(opt('out')||'artifacts/v787/lod-review.json');fs.mkdirSync(path.dirname(out),{recursive:true});
 fs.writeFileSync(out,JSON.stringify(report,null,2)+'\n');
 const rows=variants.map(v=>`| ${v.name} | ${v.status} | ${v.triangles??'–'} | ${v.skinJoints??'–'} | ${v.clips??'–'} | ${v.url??'kein public-Pfad'} |`);
 const md=['# V787 – Smart Avatar LOD Director','','Status: **'+report.status+'**','','| LOD | Rig-Status | Dreiecke | Skin-Joints | Clips | URL |','|---|---|---:|---:|---:|---|',...rows,'','## Hinweise',...issues.map(v=>'- '+v),'',...report.notes.map(n=>'- '+n),'','3D-Vorschau: `/diagnostics/avatar-lod`, JSON-Datei dort importieren.',''].join('\n');
 fs.writeFileSync(out.replace(/\.json$/i,'')+'.md',md);
 console.log('V787:',report.status,'|',out);for(const issue of issues)console.log('Hinweis:',issue);
 return report.status==='ready'?0:2;
}
if(require.main===module){try{process.exitCode=run();}catch(e){console.error('V787 FEHLER:',e.message);process.exitCode=1;}}
module.exports={run,previewUrl};
