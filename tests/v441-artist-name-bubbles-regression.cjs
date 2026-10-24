require('./helpers/threeAvatarSourcesV492.cjs').install();
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {load}=require('./helpers/ts-loader-v404.cjs');
const {planArtistBubblesV441:plan,normalizeArtistBubbleModeV441:mode,normalizeArtistBubbleStyleV441:style}=load('components/visualizer/artistNameBubblesV441');
const base={enabled:true,artists:['RAF Camora','Bonez MC'],visibleCount:2,
 progressMs:9000,playing:true,scene:'verse',focusSlot:1,phrase:1,mode:'focus',style:'comic'};
let a=plan(base);
assert.equal(a.enabled,true);assert.equal(a.bubbles.length,2);assert.equal(a.activeSlot,1);
assert.equal(a.bubbles[0].name,'RAF Camora');assert.equal(a.bubbles[0].emphasized,false);
assert.equal(a.bubbles[1].emphasized,true);
const hook=plan({...base,scene:'hook'});
assert.equal(hook.activeSlot,null);assert(hook.bubbles.every(b=>b.emphasized));
const always=plan({...base,mode:'always',style:'neon'});
assert(always.bubbles.every(b=>b.emphasized));assert.equal(always.style,'neon');
const intro=plan({...base,mode:'intro',progressMs:7800,playing:true,phrase:1});
assert(intro.bubbles.every(b=>!b.visible),'intro must disappear between sections');
const lyricLines=Array.from({length:12},(_,i)=>({startMs:i*2000}));
const lyric={synced:true,lines:lyricLines};
assert(plan({...base,lyrics:lyric,mode:'intro',progressMs:8400,phrase:1}).bubbles.every(b=>b.visible),'intro at new 4-line phrase');
assert(plan({...base,lyrics:lyric,mode:'intro',progressMs:10400,phrase:1}).bubbles.every(b=>!b.visible),'intro ends after section entry');
assert(plan({...base,mode:'intro',progressMs:100,playing:false,phrase:0}).bubbles.every(b=>b.visible),'title intro works paused');
assert(plan({...base,progressMs:500}).bubbles.every(b=>b.emphasized),'both credits promoted at song start');
assert(plan({...base,lyrics:lyric,mode:'intro',progressMs:8400,phrase:0}).bubbles.every(b=>b.visible),'section entry follows lyrics even if structure slot stays zero');
const authored=[{fromLine:0,toLine:5,leadSlot:0,partnerSlot:1,style:'solo'}];
const m=plan({...base,lyrics:lyric,authored,authoredEnabled:true,progressMs:2200,focusSlot:1});
assert.equal(m.activeSlot,0);assert.equal(m.source,'manual-stage');
assert.equal(m.bubbles[0].emphasized,true);assert.equal(m.bubbles[1].emphasized,false);
assert.equal(plan({...base,lyrics:lyric,authored:[{...authored[0],style:'duet'}],authoredEnabled:true,progressMs:2200}).activeSlot,null);
assert.equal(plan({...base,manualVocalPriority:true}).activeSlot,null,'manual vocal priority must avoid inferred singer focus');
assert.equal(plan({...base,enabled:false}).bubbles.length,0);
assert.equal(plan({...base,artists:[]}).enabled,false);
assert.equal(plan({...base,visibleCount:1,showSolo:false}).enabled,false);
assert.equal(plan({...base,artists:['Solo'],visibleCount:1}).bubbles[0].name,'Solo');
assert.deepEqual(plan({...base,artists:[' Alpha  ','alpha','Beta','  ', 'Gamma'],visibleCount:2}).bubbles.map(b=>b.name),['Alpha','Beta']);
const long='Ö'.repeat(100);
assert(plan({...base,artists:[long],visibleCount:1}).bubbles[0].displayName.length<=31);
assert.equal(mode('unknown'),'focus');assert.equal(style('unknown'),'comic');
assert.equal(plan({...base,progressMs:Infinity}).bubbles[1].emphasized,true);
const stage=fs.readFileSync('components/visualizer/VisualizerStage.tsx','utf8');
const renderer=fs.readFileSync('components/visualizer/ThreeAvatar.tsx','utf8');
const panel=fs.readFileSync('components/visualizer/AutoMotionIntelligencePanelV438.tsx','utf8');
const bubble=fs.readFileSync('components/visualizer/ArtistNameBubbleV441.tsx','utf8');
for(const [txt,fragment] of [[stage,'planArtistBubblesV441'],[stage,'artistBubblePlanV441={visualQualityV465.bubbles}'],
  [renderer,'<ArtistNameBubbleV441'],[renderer,'<FormationDancers'],[renderer,'<GroupDancersV326'],
  [renderer,'slot={0} reducedMotion'],[renderer,'slot={1} reducedMotion'],
  [bubble,'<Html center position={[0,2.55,0]}'],[bubble,'pointerEvents:"none"'],
  [panel,'V441 · Künstler-Sprechblasen'],[panel,'artistBubbleModeV441'],
  [fs.readFileSync('types/music.ts','utf8'),'artistNameBubblesV441?:boolean'],
  [fs.readFileSync('context/UiPreferencesContext.tsx','utf8'),'artistNameBubblesV441:true']])
  assert(txt.includes(fragment),`V441 wiring missing: ${fragment}`);
assert(!bubble.includes('dangerouslySetInnerHTML'),'names must be React-escaped');
assert(!bubble.includes('window.'),'bubble render must not change playback');
assert(/^0\.1\.0-v(?:44[1-9]|4[5-9][0-9]|[5-9][0-9]{2})$/.test(require('../package.json').version));
console.log('PASS V441: Spotify credits, focus and hook, intro/always, authored V416 priority, solo, no fake singer identity, world-space HTML anchors, user controls');
