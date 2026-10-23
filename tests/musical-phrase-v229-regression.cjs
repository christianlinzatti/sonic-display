const assert=require('node:assert/strict');const fs=require('node:fs');const path=require('node:path');
const root=path.resolve(__dirname,'..');const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const engine=read('components/visualizer/musicalPhraseIntelligence.ts');const avatar=read('components/visualizer/ThreeAvatar.tsx');const pkg=require('../package.json');
const checks=[
 ['sections',()=>['intro','verse','chorus','drop','break','outro'].every(x=>engine.includes(x+':'))],
 ['genre-aware rap',()=>engine.includes('rap|hip')],
 ['genre-aware hard',()=>engine.includes('hardstyle|hardtekk')],
 ['smooth transitions',()=>engine.includes('Math.exp(-step')],
 ['paused/reduced-motion decay',()=>engine.includes('playing && !reducedMotion ? phraseMotionTarget')],
 ['bounded frame delta',()=>engine.includes('clamp(dt, 0, .1)')],
 ['per-avatar state',()=>avatar.includes('useRef(createPhraseMotionState())')],
 ['live integration',()=>avatar.includes('updatePhraseMotion(phraseMotionState.current')],
 ['beat poses not replaced',()=>avatar.includes('const preKick =')&&avatar.includes('const kickAccent =')],
 ['phrase volume',()=>avatar.includes('motion.intensity * phrase.groove')],
 ['version',()=>pkg.version.endsWith('v248')],
];for(const [name,check] of checks){assert.ok(check(),name);console.log('PASS',name)}
