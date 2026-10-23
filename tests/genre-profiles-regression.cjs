const assert=require('node:assert/strict');
const fs=require('node:fs');
const src=fs.readFileSync('components/visualizer/lightingGenreProfiles.ts','utf8');
const stage=fs.readFileSync('components/visualizer/DynamicStage.tsx','utf8');
const studio=fs.readFileSync('components/visualizer/LightingChoreographyStudio.tsx','utf8');
const pkg=require('../package.json');
const cases=[
 ['version',()=>assert.match(pkg.version,/v\d+$/)],
 ['storage versioned',()=>assert.match(src,/lighting-genre-profiles-v179/)],
 ['disabled default',()=>assert.match(src,/enabled:false/)],
 ['genre normalization',()=>assert.match(src,/normalizeLightingGenre/)],
 ['explicit assignments',()=>assert.match(src,/config.assignments\[normalized\]/)],
 ['revision latest',()=>assert.match(src,/revisions.at\(-1\)/)],
 ['missing assignment returns null',()=>assert.match(src,/if\(!id\)return null/)],
 ['manual fallback',()=>assert.match(src,/\?\?loadLightingPreset\(\)/)],
 ['storage failure fallback',()=>assert.match(src,/catch\{return false;\}/)],
 ['change event',()=>assert.match(src,/GENRE_PROFILE_CHANGED/)],
 ['stage watches profiles',()=>assert.match(stage,/window.addEventListener\(GENRE_PROFILE_CHANGED,reload\)/)],
 ['stage watches library revisions',()=>assert.match(stage,/window.addEventListener\(PRESET_LIBRARY_CHANGED,reload\)/)],
 ['stage switches on genre',()=>assert.match(stage,/\},\[genre\]\)/)],
 ['smoothed parameters',()=>assert.match(stage,/activePreset.current.anticipation \+=/)],
 ['reduced motion immediate',()=>assert.match(stage,/reducedMotion \? 1/)],
 ['studio autoswitch',()=>assert.match(studio,/Automatisch nach Genre auswählen/)],
 ['studio explicit manual override',()=>assert.match(studio,/Manuell übersteuern \(Auto aus\)/)],
 ['studio includes unmapped',()=>assert.match(studio,/Keine Zuordnung/)],
 ['studio persists settings',()=>assert.match(studio,/saveGenreProfiles\(next\)/)],
 ['genre limitations visible',()=>assert.match(studio,/Hardtekk wird nur separat/)],
];
for(const [name,test] of cases){test();console.log('PASS',name)}
console.log(`${cases.length} V179 checks passed`);
