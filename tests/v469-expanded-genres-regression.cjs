'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {load}=require('./helpers/ts-loader-v404.cjs');
const registry=load('config/musicGenres');
const infer=load('services/genre/genreIntelligence').inferMusicGenre;
const adaptive=load('components/visualizer/adaptiveGenreDance');
const visual=load('services/stageContent/genreVisualDirectorV352');
const lighting=load('components/visualizer/lightingGenreProfiles');
const motion=load('components/visualizer/genreSpecificDanceIntelligence');
const genres=Object.keys(registry.MUSIC_GENRES);
assert(genres.length>=27,'at least 27 distinct musical genres (7 original + 20 new)');
assert.equal(registry.GENRES.length,genres.length,'manual genre choices are registry-driven');
for(const id of genres){
 assert.match(registry.MUSIC_GENRES[id].a,/^#[0-9a-f]{6}$/i);
 assert.equal(registry.isMusicGenre(id),true);
 assert(registry.MUSIC_GENRES[registry.musicGenreFamily(id)]);
 assert(registry.GENRE_ALIASES[id].length,'aliases for '+id);
 assert(visual.GENRE_VISUAL_PROFILES_V352[id],'visual style for '+id);
 assert(adaptive.PROFILES[id],'adaptive dance for '+id);
 assert(lighting.LIGHTING_GENRES.includes(id),'lighting for '+id);
 assert(motion.DANCE_GENRES.includes(id),'motion style for '+id);
}
for(const [tag,genre] of [
 ['Deutschrap','deutschrap'],['German rap','deutschrap'],['Trap','trap'],['UK Drill','drill'],
 ['Boom Bap','boombap'],['hard techno','hardtechno'],['industrial techno','hardtechno'],
 ['Schranz','schranz'],['rawstyle','rawstyle'],['Gabber','hardcore'],['uptempo hardcore','uptempo'],
 ['house','house'],['trance','trance'],['psytrance','psytrance'],['drum & bass','dnb'],
 ['Dubstep','dubstep'],['Synthwave','synthwave'],['reggaeton','reggaeton'],
 ['Metalcore','metal'],['R&B','rnb'],['jazz','jazz'],['klassik','classical']
]){
 assert.equal(registry.resolveMusicGenre(tag),genre,`normalized ${tag}`);
 assert.equal(infer([{name:tag,count:66}], 'normal title', 'normal artist','track').genre,genre,`last.fm ${tag}`);
}
assert.equal(infer([], 'ordinary title', 'ordinary artist','track',170).genre,null,'BPM alone must never infer genre');
assert.equal(infer([{name:'techno',count:20}], 'Song','Artist','track').genre,'techno');
assert.equal(infer([{name:'hard techno',count:20}], 'Song','Artist','track').genre,'hardtechno','subgenre beats parent');
assert.equal(infer([{name:'techno',count:15},{name:'hard techno',count:15}], 'Song','Artist','track').genre,'hardtechno','specific tag wins over generic parent tag');
assert.equal(infer([{name:'raw hardstyle',count:15}], 'Song','Artist','artist').genre,'rawstyle');
const defaults=visual.DEFAULT_GENRE_VISUAL_V352;
const base={section:'drop',playing:true,reducedMotion:false,beatAccent:.9,lyricsActive:false,currentTheme:'classic'};
for(const id of genres){
 const scene=visual.decideGenreVisualV352({...base,genre:id},defaults);
 assert.equal(scene.genre,id,`scene for ${id}`);
 assert(scene.active&&scene.palette&&scene.palette.primary);
 assert(scene.fxGain>=.4&&scene.fxGain<=1.28);
 assert(scene.cameraMotion>=0&&scene.cameraMotion<=1.24);
 assert.equal(visual.decideGenreVisualV352({...base,genre:id,reducedMotion:true},defaults).cameraMotion,0);
 assert.equal(adaptive.normalizeDanceGenre(id),id,`adaptive normalization ${id}`);
 const dance=adaptive.resolveAdaptiveProfile(id);
 assert(dance.bpm>=50&&dance.bpm<=240&&dance.energy>=0&&dance.energy<=1);
}
assert.equal(visual.resolveGenreVisualV352('German rap'),'hiphop','old generic resolver remains compatible');
assert.equal(visual.resolveGenreVisualV469('deutschrap'),'deutschrap','new resolver keeps subgenre');
assert.equal(visual.resolveGenreVisualV469('drill'),'drill');
assert.equal(visual.decideGenreVisualV352({...base,genre:'trap'}, {...defaults,mode:'manual',manualGenre:'jazz'}).genre,'jazz','manual override');
assert.equal(visual.decideGenreVisualV352({...base,genre:'dnb',lyricsActive:true,section:'verse'},defaults).focus,'lyrics');
const library={version:1,entries:[{id:'old-techno',name:'Techno',revisions:[{preset:{pattern:'pulse'},at:1}]}]};
const normalized=lighting.sanitizeGenreProfiles({version:1,enabled:true,assignments:{techno:'old-techno',drill:'explicit'}});
assert.equal(normalized.assignments.drill,'explicit');
assert.equal(lighting.normalizeLightingGenre('industrial techno'),'hardtechno');
// Fallback to older techno assignment if hardtechno has none.
assert.equal(lighting.selectGenrePreset('hardtechno',normalized,library)?.pattern,
 lighting.selectGenrePreset('techno',normalized,library)?.pattern);
assert.equal(lighting.selectGenrePreset('unknown',normalized,library),null);
assert.equal(motion.normalizeGenre('Deutschrap'),'deutschrap');
assert.equal(motion.normalizeGenre('Hard-Tekk'),'hardtekk');
assert.equal(motion.normalizeGenre('Uptempo Hardcore'),'uptempo');
assert.equal(motion.normalizeGenre('UK Drill'),'drill');
assert(motion.scoreGenreMotion({name:'Shuffle',genre:'techno',bpmMin:80,bpmMax:200},'hardtechno','verse',.8,150)>0,'parent-tagged motion remains available for subgenre');
for(const file of ['components/visualizer/AdaptiveGenreDanceStudio.tsx','components/visualizer/SmartChoreographyEvolutionPanel.tsx','components/visualizer/LightingChoreographyStudio.tsx']){
 const body=fs.readFileSync(file,'utf8');assert(body.includes('GENRES')||body.includes('LIGHTING_GENRES'));
}
console.log('V469 expanded genres passed:',genres.length,'genres,',22,'Last.fm aliases, scene/dance/lighting/override/accessibility checks');
