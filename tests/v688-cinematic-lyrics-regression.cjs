'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {load}=require('./helpers/ts-loader-v404.cjs');
const {planCinematicLyricsV688:plan,cinematicLyricWordAccentV688:accent}=load('components/visualizer/cinematicLyricsV688');
let total=0;
const test=(name,fn)=>{try{fn();total++;}catch(error){error.message=`V688 ${name}: ${error.message}`;throw error;}};
const words=['Ich','rap','jetzt','auf','den','Beat'].map((text,i)=>({text,startMs:1000+i*240,endMs:1240+i*240}));
const line={text:words.map(w=>w.text).join(' '),startMs:1000,endMs:2440,words};
const cfg={line,nextLineStart:2800,progressMs:1500,playing:true,synchronized:true,
  reducedMotion:false,wordHighlight:true,immersive:true,avatarCount:2,
  hookConfirmed:false,existingWidthCh:46,existing3DWidth:2.45,existingPlateOpacity:.82,intensity:.8};
const P=(extra={})=>plan({...cfg,...extra});
const A=(ms,index,extra={})=>{const input={...cfg,...extra};return accent({line:input.line??line,
  nextLineStart:input.nextLineStart,wordIndex:index,progressMs:ms,playing:input.playing,
  reducedMotion:input.reducedMotion,plan:P(extra)});};
test('confirmed words produce restrained active plan',()=>{const a=P();assert(a.active&&a.verifiedWords&&a.mode==='precise');});
test('confirmed hook changes only visual mode',()=>{const a=P({hookConfirmed:true});assert.equal(a.mode,'hook');assert(a.halo>P().halo);});
test('no claim of hook when unconfirmed',()=>assert.notEqual(P({hookConfirmed:false}).mode,'hook'));
test('crowded 4 avatars reserve narrower lyric region',()=>{const a=P({avatarCount:4}),b=P({avatarCount:1});assert(a.widthCh<b.widthCh&&a.max3DWidth<b.max3DWidth&&a.plateOpacity>=b.plateOpacity);});
test('standard captions not narrowed by cast alone',()=>{assert.deepEqual(P({immersive:false,avatarCount:1}),P({immersive:false,avatarCount:4}));});
test('no extra layout offset or direct position property',()=>{const p=P();for(const k of ['x','y','z','left','right','top','bottom','transform','fontSize'])assert(!(k in p));});
test('dense lines wrap and shrink rather than move stage actors',()=>{const a=P({line:{...line,text:'Deutschrap '.repeat(14)}});assert(a.widthCh<=38&&a.max3DWidth<=2.13&&a.lineHeight>=1.45);});
test('a very long single word is treated as dense',()=>assert.equal(P({line:{...line,text:'Regenbogenvokabel'.repeat(4)}}).mode,'dense'));
test('plate never weakens existing protective darkness',()=>{for(const p of [0,.4,.82,.94,.98,1]){const a=P({existingPlateOpacity:p});assert(a.plateOpacity>=Math.min(p,.98));}});
test('3d width never exceeds previous stage plan',()=>{for(const w of [1.5,1.9,2.1,2.7])assert(P({existing3DWidth:w}).max3DWidth<=w);});
test('2d width never exceeds previous typography plan',()=>{for(const w of [18,29,36,45,68])assert(P({existingWidthCh:w}).widthCh<=w);});
test('word highlight absent means no timed accents',()=>{const a=P({wordHighlight:false});assert(!a.verifiedWords&&a.halo===0);});
test('unsynchronized lyrics do not imply word precision',()=>{const a=P({synchronized:false});assert(!a.active&&a.halo===0);});
test('plain text remains visible with protection',()=>{const a=P({line:{text:'Normaler Songtext',startMs:1000,endMs:2400},synchronized:false});assert(a.widthCh>0&&a.plateOpacity>=.82);});
test('missing line remains safely neutral',()=>{for(const v of [null,undefined])assert(!P({line:v}).active);});
test('blank line remains neutral',()=>assert(!P({line:{...line,text:'   '}}).active));
test('invalid line start neutral',()=>{for(const v of [NaN,Infinity,-Infinity,-1])assert(!P({line:{...line,startMs:v}}).active);});
test('invalid playback times neutral',()=>{for(const v of [NaN,Infinity,-Infinity,-1])assert(!P({progressMs:v}).active);});
test('before or after line neutral',()=>{for(const v of [0,999,2440,3000])assert(!P({progressMs:v}).active);});
test('next line start wins when sooner',()=>assert(!P({nextLineStart:1200,progressMs:1500}).active));
test('paused keeps type but no motion',()=>{const p=P({playing:false});assert(!p.active&&p.halo===0&&p.plateOpacity>=.82);});
test('reduced motion disables glow but not legibility',()=>{const p=P({reducedMotion:true});assert(p.active&&p.halo===0&&p.transitionMs===0);});
test('zero intensity disables glow',()=>assert.equal(P({intensity:0}).halo,0));
test('invalid intensity disables glow safely',()=>{for(const v of [NaN,Infinity,-Infinity,-50])assert.equal(P({intensity:v}).halo,0);});
test('strength changes only bounded visual accent',()=>{const lo=P({intensity:.15}),hi=P({intensity:1});assert(lo.halo>0&&hi.halo>lo.halo&&hi.halo<=.09);});
test('invalid word sequence refuses fake karaoke',()=>assert(!P({line:{...line,words:[words[1],words[0],...words.slice(2)]}}).verifiedWords));
test('overlapping word durations fail closed',()=>assert(!P({line:{...line,words:[{...words[0],endMs:1500},...words.slice(1)]}}).verifiedWords));
test('word accents occur within actual word',()=>assert(A(1510,2)>0));
test('word accents never look ahead',()=>{assert.equal(A(1320,2),0);assert.equal(A(1800,5),0);});
test('word accents never echo beyond word end',()=>{assert.equal(A(1720,2),0);assert.equal(A(1900,2),0);});
test('end-of-word fades rather than spikes',()=>{assert(A(1700,2)<A(1630,2));});
test('start-of-word fades rather than spikes',()=>{assert(A(1481,2)<A(1550,2));});
test('invalid word indices produce no glow',()=>{for(const i of [-1,99,NaN,Infinity,.2])assert.equal(A(1500,i),0);});
test('invalid word sampling timestamps produce no glow',()=>{for(const ms of [NaN,Infinity,-Infinity,-1])assert.equal(A(ms,2),0);});
test('paused or reduced-motion words never glow',()=>{assert.equal(A(1500,2,{playing:false}),0);assert.equal(A(1500,2,{reducedMotion:true}),0);});
test('no valid word ending is invented',()=>{const l={text:'Solo',startMs:1000,endMs:null,words:[{text:'Solo',startMs:1000,endMs:null}]};assert.equal(A(1300,0,{line:l,nextLineStart:undefined,progressMs:1300}),0);});
test('pure and seek-safe',()=>{const original=JSON.stringify(line),p=P();for(const ms of [2100,999,1500,1450,1600,1500])P({progressMs:ms});assert.deepEqual(P(),p);assert.equal(JSON.stringify(line),original);});
test('3D text uses shared V688 plan',()=>{const s=fs.readFileSync('components/visualizer/Lyrics3DScene.tsx','utf8');assert(s.includes('stageLyricCinemaV688=planCinematicLyricsV688(')&&s.includes('cinematicLyricWordAccentV688(')&&s.includes('stageLyricCinemaV688.max3DWidth')&&s.includes('stageLyricCinemaV688.plateOpacity'));});
test('DOM caption uses shared V688 plan and preserves raw karaoke fill',()=>{const s=fs.readFileSync('components/KineticLyrics.tsx','utf8');assert(s.includes('lyricCinemaV688=planCinematicLyricsV688(')&&s.includes('cinematicLyricWordAccentV688(')&&s.includes('"--v688-word-accent"')&&s.includes('"--word-fill": `${(shownAmountV382 * 100).toFixed(1)}%`'));});
test('existing position preserved',()=>{const s=fs.readFileSync('components/KineticLyrics.tsx','utf8');assert(s.includes('lyrics-studio-position-${preferences.lyricsPosition ?? "center"}'));});
test('no new layers or timers or fetching',()=>{const s=fs.readFileSync('components/visualizer/cinematicLyricsV688.ts','utf8');for(const t of ['setTimeout(', 'setInterval(', 'requestAnimationFrame(', 'useFrame(', 'fetch(', 'window.', 'document.', 'localStorage', 'Math.random(', 'Date.now('])assert(!s.includes(t));});
test('CSS respects reduced motion and existing plates',()=>{const s=fs.readFileSync('app/globals.css','utf8');const part=s.slice(s.indexOf('/* V688 –'));for(const t of ['--v688-width-ch','--v688-plate','--v688-word-accent','max-width:min(100%','@media(max-width:1024px)','@media(prefers-reduced-motion:reduce)','text-shadow:none!important'])assert(part.includes(t));assert(!part.includes('--word-fill:'));});
test('no fabricated singer or token edits',()=>{const s=fs.readFileSync('components/visualizer/cinematicLyricsV688.ts','utf8');assert(!s.includes('singingSlots')&&!s.includes('trackId')&&!s.includes('.push('));});
let samples=0;
for(let i=0;i<12000;i++){
  const ms=(i*137)%3900;const c={avatarCount:1+i%4,progressMs:ms,intensity:i%13/12,
    existingPlateOpacity:(i%9)/10,existingWidthCh:20+(i%50),existing3DWidth:1.2+(i%16)*.1,
    hookConfirmed:i%3===0,immersive:i%4!==0};
  const p=P(c);
  assert([p.widthCh,p.max3DWidth,p.plateOpacity,p.lineHeight,p.halo,p.transitionMs].every(Number.isFinite));
  assert(p.widthCh>=18&&p.widthCh<=Math.max(c.existingWidthCh,18));
  assert(p.max3DWidth<=c.existing3DWidth&&p.plateOpacity<=.98&&p.halo>=0&&p.halo<=.09);
  const x=A(ms,i%6,c);assert(Number.isFinite(x)&&x>=0&&x<=p.halo+1e-12);
  samples++;
}
test('12000 bounded samples',()=>assert.equal(samples,12000));
test('release version and docs',()=>{const p=require('../package.json');assert(Number(p.version.split('-v')[1])>=688);assert(p.scripts['test:quick'].includes('npm run test:v688 &&')); assert(p.scripts['check:release'].includes('npm run test:v688:types'));assert(fs.existsSync('V688-CINEMATIC-LYRICS-2.md'));assert(fs.readFileSync('ARCHITECTURE.md','utf8').includes(`**Dokumentationsstand:** V${p.version.split('-v')[1]}`));});
console.log(`PASS V688 Cinematic Lyrics 2.0: ${total} regression groups, ${samples} sampled timeline positions`);
