'use strict';
/** Offline visual evidence validator + self-contained gallery builder (without third-party image packages).
 * Luma / difference metrics describe pixels, NOT perceived artistic quality. */
const fs=require('node:fs'),path=require('node:path'),zlib=require('node:zlib'),crypto=require('node:crypto');
const PROFILES=['cinematic','balanced','economy'];
const STAGES=['cyberpunk','rock','galaxy'];
const escapeHtml=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const validSlug=s=>typeof s==='string'&&/^[a-z0-9-]+\.png$/.test(s)&&s.length<=100;
function decodePng(buf){
 if(!Buffer.isBuffer(buf)||buf.length<60||!buf.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])))throw Error('Kein PNG');
 let width=0,height=0,color=0,depth=0,interlace=0;const idats=[];let pos=8,foundEnd=false;
 while(pos+12<=buf.length){const n=buf.readUInt32BE(pos),tag=buf.toString('ascii',pos+4,pos+8);pos+=8;
  if(n>buf.length-pos-4)throw Error('Defekter PNG-Chunk');
  const data=buf.subarray(pos,pos+n);pos+=n+4;
  if(tag==='IHDR'){width=data.readUInt32BE(0);height=data.readUInt32BE(4);depth=data[8];color=data[9];interlace=data[12]}
  if(tag==='IDAT')idats.push(data);
  if(tag==='IEND'){foundEnd=true;break;}
 }
 if(!foundEnd||width!==960||height!==540||depth!==8||![2,6].includes(color)||interlace!==0||!idats.length)throw Error('PNG-Größe/Format entspricht nicht dem Fixture-Canvas');
 const channels=color===6?4:3,stride=width*channels,bpp=channels;
 const raw=zlib.inflateSync(Buffer.concat(idats),{maxOutputLength:(stride+1)*height+1024});
 if(raw.length!==(stride+1)*height)throw Error('PNG-Pixeldaten unvollständig');
 const rgba=Buffer.allocUnsafe(width*height*3),prev=Buffer.alloc(stride),line=Buffer.alloc(stride);
 let input=0,output=0;for(let y=0;y<height;y++){
  const filter=raw[input++];if(filter>4)throw Error('Unbekannter PNG-Filter');
  for(let x=0;x<stride;x++){
   const a=x>=bpp?line[x-bpp]:0,b=prev[x],c=x>=bpp?prev[x-bpp]:0;
   let prediction=0;
   if(filter===1)prediction=a;else if(filter===2)prediction=b;else if(filter===3)prediction=Math.floor((a+b)/2);
   else if(filter===4){const p=a+b-c,da=Math.abs(p-a),db=Math.abs(p-b),dc=Math.abs(p-c);prediction=da<=db&&da<=dc?a:db<=dc?b:c;}
   line[x]=(raw[input++]+prediction)&255;
  }
  for(let x=0;x<stride;x+=channels){rgba[output++]=line[x];rgba[output++]=line[x+1];rgba[output++]=line[x+2]}
  line.copy(prev);
 }
 return {width,height,pixels:rgba};
}
function metrics(img){const pix=img.pixels;let sum=0,sumSq=0,dark=0;const step=30;let count=0;
 for(let i=0;i<pix.length;i+=step){const l=.2126*pix[i]+.7152*pix[i+1]+.0722*pix[i+2];sum+=l;sumSq+=l*l;if(l<15)dark++;count++}
 return {meanLuma:+(sum/count).toFixed(2),contrastStd:+Math.sqrt(Math.max(0,sumSq/count-(sum/count)**2)).toFixed(2),darkFraction:+(dark/count).toFixed(4)};
}
function difference(a,b){if(a.pixels.length!==b.pixels.length)throw Error('Unterschiedliche Pixelgrößen');let diff=0,n=0;
 for(let i=0;i<a.pixels.length;i+=30){diff+=Math.abs(a.pixels[i]-b.pixels[i])+Math.abs(a.pixels[i+1]-b.pixels[i+1])+Math.abs(a.pixels[i+2]-b.pixels[i+2]);n+=3}
 return +(diff/n/255*100).toFixed(2);
}
function report(dir,manifest){
 const issues=[];if(manifest.status!=='ok')issues.push('Browsermessung blockiert: '+String(manifest.message||'').slice(0,200));if(manifest.format!=='sonic-visual-quality-v780'||!Array.isArray(manifest.images))issues.push('Manifestformat ungültig');
 const frameList=manifest.frames;
 if(!Array.isArray(frameList)||frameList.length<1||frameList.length>3||frameList.some(x=>!Number.isInteger(x)||x<30||x>1800)||new Set(frameList).size!==frameList.length)issues.push('Frame-Liste ungültig');
 const expected=PROFILES.length*STAGES.length*2*(Array.isArray(frameList)?frameList.length:0);
 if(manifest.images?.length!==expected)issues.push('Screenshots unvollständig: '+(manifest.images?.length??0)+'/'+expected);
 const map=new Map(),decoded=new Map();let rigFingerprint=null;
 for(const item of manifest.images||[]){
  const key=[item.profile,item.stage,item.avatars,item.frame].join(':');if(map.has(key))issues.push('Doppelter Screenshot: '+key);map.set(key,item);
  if(!PROFILES.includes(item.profile)||!STAGES.includes(item.stage)||![2,4].includes(item.avatars)||!frameList?.includes(item.frame))issues.push('Unerwartete Aufnahme: '+key);
  if(!validSlug(item.file)) {issues.push('Unsicherer Dateiname');continue}
  const file=path.join(dir,item.file);
  try{const bytes=fs.readFileSync(file);
   if(crypto.createHash('sha256').update(bytes).digest('hex')!==item.sha256)throw Error('SHA-256 stimmt nicht');
   const img=decodePng(bytes);decoded.set(key,img);item.metrics=metrics(img);
   if(item.metrics.meanLuma<2||item.metrics.contrastStd<1)issues.push('Leere oder fast schwarze Aufnahme: '+key);
  }catch(e){issues.push('PNG nicht gültig: '+item.file+' '+e.message)}
  const fingerprint=JSON.stringify([item.assetMode,item.hashes,item.viewport,item.renderer]);
  if(!rigFingerprint)rigFingerprint=fingerprint;else if(rigFingerprint!==fingerprint)issues.push('Nicht vergleichbare GLBs, Viewports oder Renderer: '+key);
 }
 const comparisons=[];
 for(const stage of STAGES)for(const avatars of [2,4])for(const frame of frameList||[]){
  const base=decoded.get(`cinematic:${stage}:${avatars}:${frame}`);
  for(const profile of ['balanced','economy']){const curr=decoded.get(`${profile}:${stage}:${avatars}:${frame}`);
   if(base&&curr)comparisons.push({stage,avatars,frame,profile,pixelDifferencePercent:difference(base,curr)})}
 }
 const status=issues.length?'blocked':'ready';
 return {format:'sonic-visual-assessment-v780',status,issues,expectedImages:expected,verifiedImages:decoded.size,
  renderer:manifest.images?.[0]?.renderer||null,assetMode:manifest.images?.[0]?.assetMode||null,
  imageMetrics:(manifest.images||[]).filter(i=>i.metrics).map(i=>({file:i.file,...i.metrics})),comparisons,
  note:'Pixelunterschied und Helligkeit sind nur technische Hinweise, keine automatische Bewertung der Bildästhetik. Die visuelle Prüfung erfolgt durch Menschen.'};
}
function html(manifest,assessment){
 const imgs=new Map((manifest.images||[]).map(i=>[[i.profile,i.stage,i.avatars,i.frame].join(':'),i]));
 const cards=[];
 for(const stage of STAGES)for(const avatars of [2,4])for(const frame of manifest.frames||[]){
  cards.push(`<section><h2>${escapeHtml(stage)} · ${avatars} GLBs · Frame ${frame}</h2><div class="grid">`+
   PROFILES.map(profile=>{const item=imgs.get([profile,stage,avatars,frame].join(':'));
    const diff=assessment.comparisons.find(c=>c.stage===stage&&c.avatars===avatars&&c.frame===frame&&c.profile===profile);
    return `<figure><figcaption>${escapeHtml(profile)}${diff?` · ${diff.pixelDifferencePercent}% Pixelabweichung`:''}</figcaption>${item?`<img loading="lazy" src="${escapeHtml(item.file)}" width="960" height="540" alt="${escapeHtml(stage)} ${avatars} GLB ${profile}"/>`:'<p>Fehlend</p>'}</figure>`}).join('')+'</div></section>');
 }
 return `<!doctype html><html lang="de"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Sonic V780 Visual Quality Review</title><style>body{font:16px system-ui;background:#111623;color:#f0f6ff;padding:24px}h1,h2{font-weight:650}.grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}figure{margin:0;background:#20283a;padding:10px;border-radius:10px}img{width:100%;height:auto;border-radius:5px}figcaption{margin-bottom:8px}section{margin-top:36px}small{color:#c6cede}@media(max-width:800px){.grid{grid-template-columns:1fr}}</style><h1>Sonic Display V780 – Visuelle Qualitätskontrolle</h1><p>Status: ${escapeHtml(assessment.status)} · ${assessment.verifiedImages}/${assessment.expectedImages} PNG-Dateien · ${escapeHtml(assessment.assetMode||'?')} · ${escapeHtml(assessment.renderer||'?')}</p><p><small>Dieselben Testframes und dieselben GLBs. Die Referenzfigur ist keine realistische Hardwarelast. Unterschiede in Licht, Nebel, Tanz, Lyrics und Rändern bitte selbst beurteilen. Pixelabweichung bedeutet nicht automatisch Qualitätsverlust oder Qualitätsgewinn.</small></p>${cards.join('')}<footer><p>${escapeHtml(assessment.note)}</p></footer></html>`;
}
function write(dir,manifest){const assessment=report(dir,manifest);fs.writeFileSync(path.join(dir,'assessment.json'),JSON.stringify(assessment,null,2)+'\n');
 fs.writeFileSync(path.join(dir,'index.html'),html(manifest,assessment));
 fs.writeFileSync(path.join(dir,'README.md'),['# V780 Visual Review','',`Status: ${assessment.status}`,`Bilder: ${assessment.verifiedImages}/${assessment.expectedImages}`,'','Öffne `index.html` lokal im Browser und vergleiche die drei Spalten je Bühne, Avatarzahl und Frame.','',...assessment.issues.map(x=>'- '+x),'',assessment.note,''].join('\n'));
 return assessment;}
if(require.main===module){try{const dir=path.resolve(process.argv.find(x=>x.startsWith('--dir='))?.slice(6)||'artifacts/v780');const assessment=write(dir,JSON.parse(fs.readFileSync(path.join(dir,'manifest.json'),'utf8')));
 console.log('V780:',assessment.status,assessment.verifiedImages+'/'+assessment.expectedImages,'\nHTML:',path.join(dir,'index.html'));
 if(assessment.status!=='ready')process.exitCode=2;}catch(e){console.error('V780 BLOCKED:',e.message);process.exitCode=2}}
module.exports={decodePng,metrics,difference,report,html,write,validSlug};
