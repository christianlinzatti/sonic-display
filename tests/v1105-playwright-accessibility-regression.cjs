#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path'),zlib=require('node:zlib');
const {comparePngV1105,decodePngV1105}=require('../lib/visualPngDiffV1105.cjs');
const {auditQualityV1105,writeQualityReportV1105,EXPECTED,PROJECTS}=require('../scripts/v1105-playwright-quality-report.cjs');
let count=0;const check=(name,fn)=>{fn();count++;console.log('PASS V1105 '+name)};
const chunk=(tag,body)=>{const h=Buffer.alloc(8),tail=Buffer.alloc(4);h.writeUInt32BE(body.length,0);h.write(tag,4,'ascii');return Buffer.concat([h,body,tail])};
function png(rows,filter=0){const h=rows.length,w=rows[0].length/4,head=Buffer.alloc(13);head.writeUInt32BE(w,0);head.writeUInt32BE(h,4);head[8]=8;head[9]=6;
 const scan=Buffer.alloc(h*(1+w*4));for(let y=0;y<h;y++){scan[y*(1+w*4)]=filter;for(let x=0;x<w*4;x++){
 const cur=rows[y][x],left=x>=4?rows[y][x-4]:0,up=y?rows[y-1][x]:0,ul=y&&x>=4?rows[y-1][x-4]:0;
 let p=0;if(filter===1)p=left;if(filter===2)p=up;if(filter===3)p=Math.floor((left+up)/2);
 if(filter===4){const v=left+up-ul,a=Math.abs(v-left),b=Math.abs(v-up),c=Math.abs(v-ul);p=a<=b&&a<=c?left:b<=c?up:ul;}
 scan[1+y*(1+w*4)+x]=(cur-p+256)&255;
 }}return Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),chunk('IHDR',head),chunk('IDAT',zlib.deflateSync(scan)),chunk('IEND',Buffer.alloc(0))]);}
const rows=Array.from({length:17},(_,y)=>Buffer.from(Array.from({length:160},(_,x)=>(x*7+y*5)%256)));
const baseline=png(rows,0);
check('lossless PNG scanline decoding for each filter type',()=>{for(let filter=0;filter<5;filter++)assert(decodePngV1105(png(rows,filter)).pixels.equals(Buffer.concat(rows)))});
check('identical pixels across valid PNG encodings pass',()=>assert.equal(comparePngV1105(png(rows,0),png(rows,4)).passed,true));
check('pixel changes above threshold fail visual comparison',()=>{const changed=rows.map(r=>Buffer.from(r));changed[1].fill(255);changed[2].fill(255);assert.equal(comparePngV1105(baseline,png(changed)).passed,false)});
check('minor anti-alias changes can be tolerated',()=>{const changed=rows.map(r=>Buffer.from(r));changed[1][0]+=2;assert.equal(comparePngV1105(baseline,png(changed)).passed,true)});
check('changed PNG dimensions reject comparison',()=>{const diff=png(rows.slice(0,9));assert.equal(comparePngV1105(baseline,diff).passed,false)});
check('empty, corrupted or unsupported PNG inputs fail closed',()=>{for(const data of [Buffer.from('invalid'),Buffer.alloc(50),Buffer.from([137,80,78,71,13,10,26,10])])assert.throws(()=>decodePngV1105(data))});
check('compressed raster larger than advertised dimensions rejected',()=>{const altered=Buffer.from(baseline);altered.writeUInt32BE(1,16);assert.throws(()=>decodePngV1105(altered))});
const getResults=({missing,missingImage,missingMetrics,skipped=0,failed=false,duplicate=false}={})=>{
 const suites=[{specs:[]}],screenshots=[];
 for(const project of PROJECTS)for(const name of EXPECTED){const title='V1105 visual: '+name;if(missing===`${project}:${name}`)continue;
 const status=failed&&project==='chromium-desktop'&&name===EXPECTED[0]?'failed':'passed';
 const attachments=[];
 if(missingMetrics!==`${project}:${name}`&&name===EXPECTED[0])attachments.push({name:'v1105-visual-diff',contentType:'application/json',body:Buffer.from(JSON.stringify({passed:true,width:160,height:17,differentRatio:0.005})).toString('base64')});
 if(missingMetrics!==`${project}:${name}`&&name===EXPECTED[1])attachments.push({name:'v1105-viewport-metrics',contentType:'application/json',body:Buffer.from(JSON.stringify({viewportWidth:800,scrollWidth:800,dialogLeft:10,dialogRight:790,dialogWidth:780,searchVisible:true,headingVisible:true})).toString('base64')});
 const test={projectName:project,results:[{status,attachments}],status};
 suites[0].specs.push({title,tests:duplicate&&name===EXPECTED[0]&&project==='chromium-desktop'?[test,test]:[test]});
 if(missingImage!==`${project}:${name}`){screenshots.push({test:title,project,status,image:'screenshots/test.jpg'});
 if(name===EXPECTED[0])screenshots.push({test:title,project,status,image:'screenshots/test.png'},{test:title,project,status,image:'screenshots/after.png'});}
 }
 return [{stats:{expected:suites[0].specs.length,unexpected:failed?1:0,skipped,flaky:0},suites},{screenshots}];
};
check('12 real browser checks and two before-after pairs are required',()=>{const [r,m]=getResults();const q=auditQualityV1105(r,m);assert(q.passed);assert.equal(q.verifiedBrowserCases,12);assert.equal(q.expectedChecks,19)});
check('missing project or browser test blocks release',()=>{const [r,m]=getResults({missing:'chromium-touch:'+EXPECTED[3]});assert(!auditQualityV1105(r,m).passed)});
check('missing screenshots block release',()=>{const [r,m]=getResults({missingImage:'chromium-desktop:'+EXPECTED[4]});assert(!auditQualityV1105(r,m).passed)});
check('missing quantitative pixel or viewport metrics block release',()=>{for(const name of [EXPECTED[0],EXPECTED[1]]){const [r,m]=getResults({missingMetrics:'chromium-desktop:'+name});assert(!auditQualityV1105(r,m).passed)}});
check('duplicate matching browser test blocks release',()=>{const [r,m]=getResults({duplicate:true});assert(!auditQualityV1105(r,m).passed)});
check('any failed or skipped Playwright case blocks release',()=>{for(const args of [{skipped:1},{failed:true}]){const [r,m]=getResults(args);assert(!auditQualityV1105(r,m).passed)}});
check('no suites or missing result report block release',()=>assert(!auditQualityV1105({},{}).passed));
check('HTML audit can be opened offline and reports missing evidence',()=>{const root=fs.mkdtempSync(path.join(os.tmpdir(),'sonic-v1105-quality-'));try{const [r,m]=getResults();let q=writeQualityReportV1105(root,r,m);
 assert(q.passed);const html=fs.readFileSync(path.join(root,'reports/playwright-production/visual-gallery/quality.html'),'utf8');
 assert(html.includes('19')&&html.includes('chromium-touch')&&!/https?:\/\//.test(html));
 assert(JSON.parse(fs.readFileSync(path.join(root,'reports/playwright-production/visual-gallery/quality.json'))).passed);
 const [r2,m2]=getResults({missing:'chromium-desktop:'+EXPECTED[1]});q=writeQualityReportV1105(root,r2,m2);
 assert(!q.passed);assert(fs.readFileSync(path.join(root,'reports/playwright-production/visual-gallery/quality.html'),'utf8').includes('Nicht freigegeben'));
}finally{fs.rmSync(root,{recursive:true,force:true})}});
const root=path.resolve(__dirname,'..'),source=p=>fs.readFileSync(path.join(root,p),'utf8');
check('six extra real browser scenarios and screenshot comparison wired',()=>{const src=source('tests/e2e/visual-quality-v1105.spec.cjs');assert.equal((src.match(/test\('V1105 visual:/g)||[]).length,6);
 assert(src.includes('comparePngV1105(before,after')&&src.includes('v1105-heading-before-screenshot')&&src.includes('v1105-heading-after-screenshot'));
 assert(src.includes('reducedMotion')&&src.includes("keyboard.press('Escape')"));});
check('production runner requires V1105 visual proof and preserves reports on failures',()=>{const r=source('scripts/playwright-production.cjs');assert(r.includes('writeQualityReportV1105(root, results, visual)')&&r.includes('V1105 visual quality evidence missing or incomplete')&&r.includes('visualQuality'));const wf=source('.github/workflows/v965-room-wave-production.yml');assert(wf.includes('reports/playwright-production/'))});
console.log(`V1105: ${count} visual baseline, accessibility and release-evidence checks passed`);
