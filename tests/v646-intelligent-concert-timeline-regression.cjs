"use strict";
const assert=require('node:assert/strict'),fs=require('node:fs');
const {load}=require('./helpers/ts-loader-v404.cjs');
const v=load('components/visualizer/intelligentConcertTimelineV646');
let checks=0,simulations=0;
const check=(name,fn)=>{try{fn();checks++;}catch(e){e.message='V646 '+name+': '+e.message;throw e;}};
const durationMs=180000,trackId='spotify-v646-track';
const starts=[10000,40000,75000,105000,140000],ends=[38000,68000,98000,135000,175000];
const sections=['verse','hook','build','drop','break'];
const shots=['lead','ensemble','side','establish','side'];
const formations=['stagger','wide','arc','wide','line'];
const motifs=['portrait','wide','ensemble','crescendo','breath'];
const arc={trackId,durationMs,genre:'deutschrap',source:'authored',acts:starts.map((startMs,index)=>({
 startMs,endMs:ends[index],index,section:sections[index],shot:shots[index],formation:formations[index]}))};
const narrative={trackId,durationMs,genre:'deutschrap',source:'verified-v600',endingSupported:false,
 acts:starts.map((startMs,index)=>({startMs,endMs:ends[index],index,section:sections[index],motif:motifs[index],
 chapter:'develop',repetition:0,danceGain:0,cameraGain:0,lightGain:0}))};
const basic={trackId,durationMs,arc,narrative};
const build=(changes={})=>v.buildConcertTimelineV646({...basic,...changes});
const manual={version:1,enabled:true,name:'Handschriftliche Show',trackId, durationMs,
 clips:[{id:'one',lane:'camera',startMs:48000,durationMs:6000,value:'close',label:'Close-up'},
 {id:'two',lane:'lighting',startMs:148000,durationMs:13000,value:.5,label:'Sicheres Licht'}]};
const vocal=[{startMs:10000,endMs:30000,leadSlot:0,partnerSlot:1,style:'solo',strength:70,roleV547:'verse'},
 {startMs:43000,endMs:64000,leadSlot:1,partnerSlot:0,style:'duet',strength:80,roleV547:'feature'}];
check('format',()=>assert.equal(build().format,'sonic-concert-timeline-v646'));
check('valid plan but gaps means partial',()=>assert.equal(build().status,'partial'));
check('20 plan items five acts four lanes',()=>assert.equal(build().items.length,20));
check('gaps preserve intro, between acts and ending',()=>assert.deepEqual(build().gaps,
 [{startMs:0,endMs:10000},{startMs:38000,endMs:40000},{startMs:68000,endMs:75000},
 {startMs:98000,endMs:105000},{startMs:135000,endMs:140000},{startMs:175000,endMs:180000}]));
check('all positions finite',()=>assert(build().items.every(x=>Number.isFinite(x.startMs)&&Number.isFinite(x.endMs))));
check('never a lyric or audio payload',()=>assert(!JSON.stringify(build()).includes('lyricsText')));
check('plan sections derived from authored source',()=>assert.equal(build().items.find(x=>x.id==='section-1').label,'Hook'));
check('planned shots are explicitly proposals',()=>assert(build().items.filter(x=>x.lane==='camera').every(x=>x.label.startsWith('Vorschlag: '))));
check('planned formations are explicitly proposals',()=>assert(build().items.filter(x=>x.lane==='formation').every(x=>x.label.startsWith('Vorschlag: '))));
check('lighting has no exact intensity invented',()=>assert(!build().items.filter(x=>x.lane==='lighting').some(x=>x.label.includes('%'))));
check('no invented singer from official song artist',()=>assert.equal(build().items.filter(x=>x.lane==='vocals').length,0));
check('first act active',()=>assert.equal(v.activeConcertItemsV646(build(),trackId,10000).length,4));
check('act end exclusive',()=>assert.equal(v.activeConcertItemsV646(build(),trackId,38000).length,0));
check('unanalysed area no invented spotlight',()=>assert.equal(v.activeConcertItemsV646(build(),trackId,70000).length,0));
check('negative playback invalid',()=>assert.deepEqual(v.activeConcertItemsV646(build(),trackId,-1),[]));
check('NaN playback invalid',()=>assert.deepEqual(v.activeConcertItemsV646(build(),trackId,NaN),[]));
check('Infinity playback invalid',()=>assert.deepEqual(v.activeConcertItemsV646(build(),trackId,Infinity),[]));
check('end of song exclusive',()=>assert.deepEqual(v.activeConcertItemsV646(build(),trackId,180000),[]));
check('track mismatch active empty',()=>assert.deepEqual(v.activeConcertItemsV646(build(),'other-track',12000),[]));
check('source mismatch fails closed',()=>assert.equal(build({arc:{...arc,source:'playback-only'}}).status,'unavailable'));
check('V604 availability required',()=>assert.equal(build({narrative:{...narrative,source:'unavailable'}}).items.length,0));
check('track id mismatch fails closed',()=>assert.equal(build({narrative:{...narrative,trackId:'different'}}).status,'unavailable'));
check('V600 track mismatch fails closed',()=>assert.equal(build({arc:{...arc,trackId:'different'}}).status,'unavailable'));
check('V600 duration mismatch fails closed',()=>assert.equal(build({arc:{...arc,durationMs:170000}}).status,'unavailable'));
check('V604 duration mismatch fails closed',()=>assert.equal(build({narrative:{...narrative,durationMs:170000}}).status,'unavailable'));
check('V600 and V604 must contain same acts',()=>assert.equal(build({narrative:{...narrative,acts:narrative.acts.slice(1)}}).status,'unavailable'));
check('mismatching act section fails closed',()=>assert.equal(build({narrative:{...narrative,acts:narrative.acts.map((a,i)=>i===1?{...a,section:'verse'}:a)}}).status,'unavailable'));
check('mismatching timestamps fails closed',()=>assert.equal(build({arc:{...arc,acts:arc.acts.map((a,i)=>i===1?{...a,endMs:a.endMs-1}:a)}}).status,'unavailable'));
check('overlapping plan fails closed',()=>assert.equal(build({arc:{...arc,acts:arc.acts.map((a,i)=>i===1?{...a,startMs:36000}:a)}}).status,'unavailable'));
check('out of bounds act fails closed',()=>assert.equal(build({arc:{...arc,acts:arc.acts.map((a,i)=>i===4?{...a,endMs:190000}:a)}}).status,'unavailable'));
check('no fabricated act on empty base',()=>assert.equal(build({arc:null,narrative:null}).items.length,0));
check('invalid duration rejected',()=>assert.equal(build({durationMs:NaN}).durationMs,0));
check('negative duration rejected',()=>assert.equal(build({durationMs:-1}).items.length,0));
check('excess duration rejected',()=>assert.equal(build({durationMs:9000000}).status,'unavailable'));
check('missing track rejected',()=>assert.equal(build({trackId:''}).status,'unavailable'));
check('manual cannot play without song',()=>assert.equal(build({trackId:'',manual}).items.length,0));
check('explicit singer cannot play without song',()=>assert.equal(build({trackId:'',vocal,vocalEnabled:true}).items.length,0));
check('manual score unconditionally not applied',()=>assert.equal(build({manual:{...manual,enabled:false}}).items.length,20));
check('manual authored clips shown on separate lane',()=>assert.equal(build({manual}).items.filter(x=>x.lane==='manual').length,2));
check('manual track scope enforced',()=>assert.equal(build({manual:{...manual,trackId:'another'}}).items.length,20));
check('manual global unscoped score allowed',()=>assert.equal(build({manual:{...manual,trackId:''}}).items.length,22));
check('manual score version validated',()=>assert.equal(build({manual:{...manual,version:2}}).items.length,20));
check('manual clip duration bounded by playback duration',()=>{const x=build({manual:{...manual,clips:[{...manual.clips[0],startMs:179000,durationMs:3000}]}});
 assert.equal(x.items.find(i=>i.lane==='manual').endMs,180000);});
check('manual clip duration bounded by score duration',()=>{const x=build({manual:{...manual,durationMs:50000,clips:[{...manual.clips[0],startMs:48000,durationMs:3000}]}});
 assert.equal(x.items.find(i=>i.lane==='manual').endMs,50000);});
check('corrupted manual label gracefully handled',()=>assert.equal(build({manual:{...manual,clips:[{...manual.clips[0],label:null}]}}).items.find(x=>x.lane==='manual').label,'camera: Unbenannter Clip'));
check('no manual clip crossing zero',()=>assert.equal(build({manual:{...manual,clips:[{...manual.clips[0],startMs:-2}]}}).items.length,20));
check('manual confidence is not masquerading as live',()=>assert(build({manual}).items.filter(x=>x.lane==='manual').every(x=>x.evidence==='authored-manual')));
check('vocal time only when enabled',()=>assert.equal(build({vocal}).items.length,20));
check('vocal time when enabled and scoped',()=>assert.equal(build({vocal,vocalEnabled:true}).items.length,22));
check('only explicit manually assigned voices',()=>assert.equal(build({vocal,vocalEnabled:true}).items.find(x=>x.lane==='vocals').evidence,'authored-vocal'));
check('singer labels reflect explicit slot and duo',()=>assert(build({vocal,vocalEnabled:true}).items.some(x=>x.label.includes('Avatar 2 + Avatar 1'))));
check('only deployed slots',()=>assert.equal(build({vocal,vocalEnabled:true,maxAvatars:1}).items.filter(x=>x.lane==='vocals').length,0));
check('invalid singers rejected',()=>assert.equal(build({vocal:[{...vocal[0],leadSlot:20}],vocalEnabled:true}).items.length,20));
check('no voice ownership for wrong source',()=>assert.equal(build({vocal:[{...vocal[0],startMs:Infinity}],vocalEnabled:true}).items.length,20));
check('empty structure still allows manual evidence',()=>assert.equal(build({arc:null,narrative:null,manual}).items.length,2));
check('manual score cannot invent structure',()=>assert.equal(build({arc:null,narrative:null,manual}).status,'unavailable'));
check('export is parseable JSON',()=>assert.equal(JSON.parse(v.exportConcertTimelineV646(build())).format,'sonic-concert-timeline-v646'));
check('export explicitly says only planning',()=>assert(v.exportConcertTimelineV646(build()).includes('NOT measured rendered camera')));
check('export no raw audio, lyrics or artist',()=>{const s=v.exportConcertTimelineV646(build({manual,vocal,vocalEnabled:true}));assert(!s.includes('audioData')&&!s.includes('lyricsText')&&!s.includes('artistName'));});
check('non-mutating of source inputs',()=>{const before=JSON.stringify({arc,narrative,manual,vocal});build({manual,vocal,vocalEnabled:true});assert.equal(JSON.stringify({arc,narrative,manual,vocal}),before);});
check('same input deterministic',()=>assert.deepEqual(build({manual,vocal,vocalEnabled:true}),build({manual,vocal,vocalEnabled:true})));
check('existing V354 source score remains untouched',()=>{const s=fs.readFileSync('components/visualizer/ConcertTimelineOverlayV646.tsx','utf8');assert(s.includes('readTimelineV354'));assert(!s.includes('saveTimelineV354'));assert(!s.includes('updateTimelineClipV354'));});
check('V646 is genuinely in existing live stage',()=>{const s=fs.readFileSync('components/visualizer/VisualizerStage.tsx','utf8');assert(s.includes('<IntelligentConcertTimelineV646'));assert(s.includes('arc={concertArcPlanV600}'));assert(s.includes('narrative={fullSongPlanV604}'));assert(s.includes('confirmed={concertArcV600}'));});
check('manual vocal origin is explicit stored segments',()=>assert(fs.readFileSync('components/visualizer/VisualizerStage.tsx','utf8').includes('vocal={track?.id?(preferences.vocalTimeSegmentsV496??{})[track.id]:[]}')));
check('no extra Three.js or render callback',()=>{const s=fs.readFileSync('components/visualizer/ConcertTimelineOverlayV646.tsx','utf8')+fs.readFileSync('components/visualizer/intelligentConcertTimelineV646.ts','utf8');for(const banned of ['useFrame(', 'requestAnimationFrame(', 'new WebGLRenderer(', 'getUserMedia(', 'fetch(', 'playTrack(', 'seekTo('])assert(!s.includes(banned),banned);});
check('overlay initially collapsed',()=>assert(fs.readFileSync('components/visualizer/ConcertTimelineOverlayV646.tsx','utf8').includes('const [open,setOpen]=useState(false)')));
check('panel read only',()=>assert(fs.readFileSync('components/visualizer/ConcertTimelineOverlayV646.tsx','utf8').includes('Nur Anzeige.')));
check('UI shows unverified intervals',()=>assert(fs.readFileSync('components/visualizer/ConcertTimelineOverlayV646.tsx','utf8').includes('plan.gaps')));
check('UI has export and keyboard button',()=>assert(fs.readFileSync('components/visualizer/ConcertTimelineOverlayV646.tsx','utf8').includes('type="button"')));
check('not a real live camera tracker',()=>assert(fs.readFileSync('components/visualizer/ConcertTimelineOverlayV646.tsx','utf8').includes('currentConfirmed')));
const simulation=build({manual,vocal,vocalEnabled:true});
for(let i=0;i<12000;i++){
 const tm=i%180000;
 const result=v.activeConcertItemsV646(simulation,trackId,tm);
 assert(result.length<=7);assert(result.every(x=>x.startMs<=tm&&tm<x.endMs));
 assert(result.every(x=>['authored-structure','authored-manual','authored-vocal'].includes(x.evidence)));
 simulations++;
}
check('12000 simulated playback samples',()=>assert.equal(simulations,12000));
console.log(`PASS V646: ${checks} regression groups, ${simulations} simulated real-clock positions`);
