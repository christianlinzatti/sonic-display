'use strict';
/** V874 installer: merge additive code into the user's installed Sonic Display.
 * No full-file replacement of V869–V873 modules; all anchors are validated
 * before writing anything. Run from the project root: node apply-v874.cjs
 */
const fs=require('node:fs'),path=require('node:path');
const root=process.cwd(),here=__dirname;
const files=new Map();
function read(rel){const f=path.join(root,rel);if(!fs.existsSync(f))throw Error('Missing project file: '+rel);return files.get(rel)??fs.readFileSync(f,'utf8');}
function patch(rel,anchor,replacement,already){let content=read(rel);if(content.includes(already)){files.set(rel,content);return;}
 const at=content.indexOf(anchor);if(at<0||content.indexOf(anchor,at+anchor.length)>=0)throw Error('V874 integration anchor absent/ambiguous in '+rel+': '+anchor.slice(0,90));
 content=content.slice(0,at)+replacement+content.slice(at+anchor.length);files.set(rel,content);
}
try{
 const fx='components/visualizer/concertFxStudioV810.ts';
 patch(fx,"virtualCrowd:boolean;crowdPhones:boolean;crowdIntensity:number;crowdDensity:'sparse'|'balanced'|'arena';",
  "virtualCrowd:boolean;crowdPhones:boolean;crowdIntensity:number;crowdDensity:'sparse'|'balanced'|'arena';\n  crowdExperienceV874:boolean;crowdArmWaveV874:boolean;crowdPhoneWaveV874:boolean;",'crowdExperienceV874:boolean');
 patch(fx,"virtualCrowd:true,crowdPhones:true,crowdIntensity:65,crowdDensity:'balanced',",
  "virtualCrowd:true,crowdPhones:true,crowdIntensity:65,crowdDensity:'balanced',\n  crowdExperienceV874:true,crowdArmWaveV874:true,crowdPhoneWaveV874:true,",'crowdExperienceV874:true');
 const density="crowdDensity:raw?.crowdDensity==='sparse'||raw?.crowdDensity==='arena'?raw.crowdDensity:'balanced',";
 patch(fx,density,density+"\n crowdExperienceV874:typeof raw?.crowdExperienceV874==='boolean'?raw.crowdExperienceV874:d.crowdExperienceV874,\n crowdArmWaveV874:typeof raw?.crowdArmWaveV874==='boolean'?raw.crowdArmWaveV874:d.crowdArmWaveV874,\n crowdPhoneWaveV874:typeof raw?.crowdPhoneWaveV874==='boolean'?raw.crowdPhoneWaveV874:d.crowdPhoneWaveV874,",'crowdExperienceV874:typeof raw?.crowdExperienceV874');
 const stage='components/visualizer/DynamicStage.tsx';
 const importAnchor='import {VirtualConcertCrowdV815} from "./VirtualConcertCrowdV815";';
 patch(stage,importAnchor,importAnchor+'\nimport {planIntelligentAudienceV874} from "./intelligentAudienceExperienceV874";\nimport {IntelligentAudienceArmsV874} from "./IntelligentAudienceArmsV874";', 'import {planIntelligentAudienceV874}');
 const perfAnchor='active:g>.001&&Math.floor(c.count*g)>=2};\n    }';
 patch(stage,perfAnchor,perfAnchor+"\n    // V874 only reshapes the already-authorized V815 cue after the V825 governor.\n    crowdCueV815.current=planIntelligentAudienceV874({base:crowdCueV815.current,\n      fx:fxCueV810,settings:normalizeConcertFxV810(concertFxV810),\n      tier,energy:audio.energyEnvelope??0,kick:audio.kickAccentIntensity??0,\n      lyricsProtected:lyricsProtectedV542,vocalFocus:vocalFocusV542,reducedMotion});",'crowdCueV815.current=planIntelligentAudienceV874(');
 const crowdAnchor='<VirtualConcertCrowdV815 cueRef={crowdCueV815}/>';
 patch(stage,crowdAnchor,crowdAnchor+'\n    <IntelligentAudienceArmsV874 cueRef={crowdCueV815}/>', '<IntelligentAudienceArmsV874 cueRef={crowdCueV815}/>');
 const panel='components/visualizer/ConcertFxStudioPanelV810.tsx';
 const panelImport="import {planVirtualConcertCrowdV815} from './virtualConcertCrowdPlannerV815';";
 patch(panel,panelImport,panelImport+"\nimport {planIntelligentAudienceV874} from './intelligentAudienceExperienceV874';",'import {planIntelligentAudienceV874}');
 const previewAnchor="const crowdPreview=planVirtualConcertCrowdV815({fx:preview,settings:s,tier:'high',lyricsProtected:false,vocalFocus:false,groupCount:1,energy:.86,kick:.92,crowdBudget:1});";
 patch(panel,previewAnchor,previewAnchor+"\n const audienceV874=planIntelligentAudienceV874({base:crowdPreview,fx:preview,settings:s,\n   tier:'high',lyricsProtected:false,vocalFocus:false,reducedMotion:false,energy:.86,kick:.92});",'const audienceV874=planIntelligentAudienceV874(');
 const panelAfter="<option value=\"sparse\">Klein – 40 %</option><option value=\"balanced\">Mittel – 70 %</option><option value=\"arena\">Arena – 100 %</option></select></label>";
 patch(panel,panelAfter,panelAfter+`\n  <fieldset style={{border:'1px solid #56566a',borderRadius:8,padding:12}}><legend>V874 · Intelligent Audience Experience 2.0</legend>\n    <label className="setting-check"><input type="checkbox" checked={s.crowdExperienceV874} disabled={!s.virtualCrowd} onChange={e=>patch({crowdExperienceV874:e.target.checked})}/> Automatische Reaktionen auf Hooks, Drops und Genre</label>\n    <label className="setting-check"><input type="checkbox" checked={s.crowdArmWaveV874} disabled={!s.virtualCrowd||!s.crowdExperienceV874} onChange={e=>patch({crowdArmWaveV874:e.target.checked})}/> Synchrone Armbewegungen und Publikumswellen</label>\n    <label className="setting-check"><input type="checkbox" checked={s.crowdPhoneWaveV874} disabled={!s.virtualCrowd||!s.crowdPhones||!s.crowdExperienceV874} onChange={e=>patch({crowdPhoneWaveV874:e.target.checked})}/> Rhythmische Handylicht-Wellen</label>\n    <span style={{fontSize:12,opacity:.75}}>Simulierte Vorschau · Stil {audienceV874.style} · Armbewegung {Math.round(audienceV874.armLift*100)} % · Handylicht {Math.round(audienceV874.phoneWave*100)} %</span>\n  </fieldset>`, 'V874 · Intelligent Audience Experience 2.0');
 const renderer='components/visualizer/VirtualConcertCrowdV815.tsx';
 const phoneAnchor='dummy.position.set(p.x+.14*p.scale,p.y+1.03*p.scale+lift,p.z+.03);';
 patch(renderer,phoneAnchor,`const phoneWave=(cue as {phoneWave?:number}).phoneWave??0;\n    const phoneSway=phoneWave*Math.sin(cue.phase*5+p.phase)*.13*p.scale;\n    dummy.position.set(p.x+.14*p.scale,p.y+1.03*p.scale+lift+phoneSway,p.z+.03);`, 'const phoneWave=(cue as {phoneWave?:number}).phoneWave??0;');
 // Validate the complete payload and manifest BEFORE mutating source files.
 const additions=['components/visualizer/intelligentAudienceExperienceV874.ts',
   'components/visualizer/IntelligentAudienceArmsV874.tsx','tests/v874-intelligent-audience-regression.cjs',
   'tests/tsconfig.v874-core.json'];
 for(const rel of additions)if(!fs.existsSync(path.join(here,'v874',rel)))throw Error('Patch payload missing: '+rel);
 const p=path.join(root,'package.json');const json=JSON.parse(fs.readFileSync(p,'utf8'));
 if(!json.scripts||!json.version)throw Error('Invalid project package.json');
 // Commit only after all expected source anchors are found.
 for(const [rel,content] of files){fs.writeFileSync(path.join(root,rel),content);}
 for(const rel of additions){
  const src=path.join(here,'v874',rel),dest=path.join(root,rel);
  fs.mkdirSync(path.dirname(dest),{recursive:true});fs.copyFileSync(src,dest);
 }
 json.scripts['test:v874']='node tests/v874-intelligent-audience-regression.cjs';
 json.scripts['test:v874:types']='tsc -p tests/tsconfig.v874-core.json --noEmit';
 if(typeof json.scripts.prebuild==='string'&&!json.scripts.prebuild.includes('test:v874'))
  json.scripts.prebuild='npm run test:v874 && npm run test:v874:types && '+json.scripts.prebuild;
 if(typeof json.scripts['build:preflight']==='string'&&!json.scripts['build:preflight'].includes('test:v874'))
  json.scripts['build:preflight']+=' && npm run test:v874 && npm run test:v874:types';
 fs.writeFileSync(p,JSON.stringify(json,null,2)+'\n');
 console.log('V874 applied. Run npm run test:v874 && npm run typecheck && npm run build.');
}catch(e){console.error('V874 not applied:',e.message);process.exitCode=1;}
