'use client';
/** V786 local-only view of standalone GLB inspection JSON; no asset upload and no live show mutations. */
import {useMemo,useState,type CSSProperties} from 'react';
import {summarizeAvatarGeometryV786} from '@/services/monitoring/avatarComplexitySummaryV786';
type MeshRow={name:string;meshIndex:number;instances:number;sceneTriangles:number;estimatedDrawCalls:number;morphTargets:number};
type Profile={format:string;sha256:string;fileName:string;sourceBytes:number;
 scene:{triangles:number;vertexReferences:number;estimatedMeshDrawCalls:number;usedSkinJoints:number;skinnedMeshOccurrences:number;meshDefinitions:number};
 resources:{usedMaterialCount:number;usedImageCount:number;estimatedRgba8MipBytes:number;unknownTextureEstimates:number};
 animations:{clips:number;channels:number};morph:{mouthCandidates:string[];maxTargetsPerMesh:number};
 hotspots:MeshRow[];risks:{severity:string;type:string;message:string}[];scope:string[]};
type Batch={format:string;version:number;status:string;avatars:Profile[];
 benchmark:null|{status:string;warnings?:string[];environment?:{renderer:string};scenes?:{id:string;fps:number;p95Ms:number;avgCalls:number}[]}};
const fmt=(n:number)=>new Intl.NumberFormat('de-AT').format(n);
const good=(v:unknown):v is Batch=>{if(!v||typeof v!=='object')return false;const x=v as Batch;
 return x.format==='sonic-avatar-complexity-batch-v786'&&x.version===1&&x.status==='ready'&&Array.isArray(x.avatars)&&x.avatars.length>0&&x.avatars.length<=12&&
 (x.benchmark===null||(x.benchmark&&typeof x.benchmark==='object'&&((x.benchmark.status==='blocked'&&Array.isArray(x.benchmark.warnings))||(x.benchmark.status==='measured'&&typeof x.benchmark.environment?.renderer==='string'&&Array.isArray(x.benchmark.scenes)&&x.benchmark.scenes.length===6&&x.benchmark.scenes.every(s=>typeof s?.id==='string'&&[s.fps,s.p95Ms,s.avgCalls].every(n=>Number.isFinite(n)&&n>0))))))&&
 x.avatars.every(p=>p?.format==='sonic-avatar-complexity-v786'&&/^[a-f0-9]{64}$/.test(p.sha256)&&
  typeof p.fileName==='string'&&p.fileName.length<400&&[p.scene?.triangles,p.scene?.estimatedMeshDrawCalls,p.scene?.usedSkinJoints,p.resources?.estimatedRgba8MipBytes,p.animations?.clips].every(n=>Number.isSafeInteger(n)&&n>=0)&&
  Array.isArray(p.hotspots)&&p.hotspots.length<10000&&Array.isArray(p.risks)&&Array.isArray(p.scope)&&Array.isArray(p.morph?.mouthCandidates));};
const keyBox:CSSProperties={background:'#152139',padding:16,border:'1px solid #34435c',borderRadius:12};
export function AvatarComplexityReviewV786(){
 const [report,setReport]=useState<Batch|null>(null),[error,setError]=useState(''),[selected,setSelected]=useState(0),[count,setCount]=useState<2|4>(4);
 const avatar=report?.avatars[selected]??null;
 const meshes=useMemo(()=>avatar?.hotspots.slice().sort((a,b)=>b.sceneTriangles-a.sceneTriangles).slice(0,12)??[],[avatar]);
 const projected=useMemo(()=>avatar?summarizeAvatarGeometryV786(avatar,count):null,[avatar,count]);
 const max=Math.max(1,...meshes.map(m=>m.sceneTriangles));
 async function load(file:File|undefined){setError('');setReport(null);setSelected(0);if(!file)return;
  if(file.size>10*1024*1024){setError('Der JSON-Bericht darf maximal 10 MB gross sein.');return;}
  try{const value:unknown=JSON.parse(await file.text());if(!good(value))throw Error('Falsches Format oder fehlende Messdaten');setReport(value)}
  catch(e){setError(String(e))}}
 return <main style={{padding:24,minHeight:'100vh',background:'#0c1425',color:'#eef5ff',fontFamily:'system-ui',lineHeight:1.5}}>
  <h1>V786 · Real Avatar Complexity Profiler</h1>
  <p><a href="/diagnostics/avatar-lod" style={{color:"#8dc6ff"}}>V787: Smart Avatar LOD Director und 3D-Variantenvergleich öffnen</a></p>
  <p>GLB-Geometrie, Skin-Joints, Morph-Targets, Materialien und Texturen analysieren – ohne Modelle zu verändern. Die Auswertung wird ausschliesslich lokal aus der JSON-Datei gelesen.</p>
  <p>Analyse starten: <code>npm run benchmark:v786:avatar -- --glb=public/benchmark/v777-reference-performer.glb</code></p>
  <label>Lokalen <code>artifacts/v786/avatar-complexity.json</code>-Bericht öffnen:{' '}<input type="file" accept=".json,application/json" onChange={e=>void load(e.currentTarget.files?.[0])}/></label>
  {error&&<p role="alert" style={{color:'#ffb4ab'}}>{error}</p>}
  {report&&avatar&&<section style={{marginTop:20}}>
   <div style={{display:'flex',flexWrap:'wrap',alignItems:'center',gap:16,marginBottom:16}}>
    <label>GLB{' '}<select value={selected} onChange={e=>setSelected(Number(e.currentTarget.value))} style={{padding:8}}>
     {report.avatars.map((p,i)=><option value={i} key={p.sha256+i}>{p.fileName}</option>)}
    </select></label>
    <label>Darsteller{' '}<select value={count} onChange={e=>setCount(Number(e.currentTarget.value) as 2|4)} style={{padding:8}}><option value={2}>2</option><option value={4}>4</option></select></label>
   </div>
   <p><strong>SHA-256:</strong> <code style={{wordBreak:'break-all'}}>{avatar.sha256}</code></p>
   <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))',gap:12}}>
    {[
     ['Dreiecke je GLB',fmt(avatar.scene.triangles)],
     ['Dreiecke × Darsteller',fmt(projected?.theoreticalTriangles??0)+' (theoretisch)'],
     ['Mesh-Draw-Calls',fmt(avatar.scene.estimatedMeshDrawCalls)+' / Avatar'],
     ['Skin-Joints',fmt(avatar.scene.usedSkinJoints)],
     ['Materialien (verwendet)',fmt(avatar.resources.usedMaterialCount)],
     ['Animationsclips',fmt(avatar.animations.clips)],
     ['Max. Morph-Targets/Mesh',fmt(avatar.morph.maxTargetsPerMesh)],
     ['RGBA8-Mip-Szenario',`${(avatar.resources.estimatedRgba8MipBytes/1048576).toFixed(1)} MiB (unsicher)`]
    ].map(([title,value])=><div key={title} style={keyBox}><div style={{opacity:.72,fontSize:13}}>{title}</div><div style={{fontSize:22,fontWeight:700}}>{value}</div></div>)}
   </div>
   <p style={{color:'#bbd2f4'}}>Die Anzahl der Darsteller multipliziert hier nur Dreiecke als grobe geometrische Obergrenze für identische GLBs; keine behaupteten FPS, echten Draw Calls oder vierfachen VRAM-Werte.</p>
   <h2>Mesh-Hotspots</h2>
   {meshes.length===0?<p>Keine sichtbaren Meshes erfasst.</p>:<div style={{maxWidth:900}}>{meshes.map(m=><div key={m.meshIndex} style={{marginBottom:12}}>
    <div style={{display:'flex',justifyContent:'space-between',gap:12,fontSize:14}}><span>{m.name} · {m.instances}×</span><span>{fmt(m.sceneTriangles)} Dreiecke · {m.estimatedDrawCalls} Draw Calls (Schätzung)</span></div>
    <div style={{height:9,marginTop:4,background:'#27364c',borderRadius:5}}><div style={{height:'100%',width:`${m.sceneTriangles/max*100}%`,background:'#67b3ff',borderRadius:5}}/></div>
   </div>)}</div>}
   <h2>Rig und Optimierungshinweise</h2>
   <p>Mund-Morph-Kandidaten: {avatar.morph.mouthCandidates.join(', ')||'keine erkannt'}. Nicht schlüssig über Lip-Sync-Tauglichkeit, da Bone-Jaws und externe Animationen möglich sind.</p>
   {avatar.risks.length?avatar.risks.map((risk,i)=><p key={i} style={{...keyBox,margin:'8px 0'}}><strong>{risk.severity} · {risk.type}</strong>: {risk.message}</p>):<p>Keine auffälligen Schwellenwerte. Das ist keine GPU- oder Show-Qualitätsfreigabe.</p>}
   <h2>Verknüpfung mit tatsächlichen FPS</h2>
   {report.benchmark?.status==='measured'?<><p>Bestätigter V777-Bericht mit passenden GLB-Hashes: {report.benchmark.environment?.renderer}</p>
    <div style={{overflowX:'auto'}}><table style={{borderCollapse:'collapse',width:'100%'}}><thead><tr>{['Bühne / Darsteller','FPS','P95 ms','Draw Calls gemessen'].map(s=><th key={s} style={{textAlign:'left',padding:8}}>{s}</th>)}</tr></thead><tbody>
    {report.benchmark.scenes?.map(s=><tr key={s.id}>{[s.id,s.fps,s.p95Ms,s.avgCalls].map((v,i)=><td key={i} style={{padding:8,borderTop:'1px solid #334761'}}>{v}</td>)}</tr>)}</tbody></table></div></>
    :<p>Keine verifizierten GPU-Messwerte verknüpft. {report.benchmark?.warnings?.join('; ')||'Für einen Hash-geprüften Vergleich optional --benchmark=... angeben.'}</p>}
   <h2>Messgrenzen</h2>{avatar.scope.map(s=><p key={s}>{s}</p>)}
  </section>}
 </main>
}
