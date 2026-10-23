'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {load}=require('./helpers/ts-loader-v404.cjs');
const registry=load('config/musicGenres');
const {inferMusicGenre}=load('services/genre/genreIntelligence');
const visual=load('services/stageContent/genreVisualDirectorV352');
const adaptive=load('components/visualizer/adaptiveGenreDance');
const lighting=load('components/visualizer/lightingGenreProfiles');
const motion=load('components/visualizer/genreSpecificDanceIntelligence');
const next=['poprock','indierock','alternativerock','punkrock','indiepop','electropop','dancepop'];
assert.equal(registry.GENRES.length,34,'27+7 selectable genres');
assert.equal(registry.MUSIC_GENRES.rock.label,'Rock');
assert.equal(registry.MUSIC_GENRES.pop.label,'Pop');
for(const id of next){
 assert(registry.MUSIC_GENRES[id],'new genre exists: '+id);
 assert(registry.GENRE_ALIASES[id]?.length,'aliases exist');
 assert(adaptive.PROFILES[id],'adaptive profile');
 assert(visual.GENRE_VISUAL_PROFILES_V352[id],'visual profile');
 assert(lighting.LIGHTING_GENRES.includes(id),'lighting choice');
 assert(motion.DANCE_GENRES.includes(id),'GLB motion choice');
 assert.equal(adaptive.normalizeDanceGenre(id),id);
 assert.equal(motion.normalizeGenre(id),id);
 assert.equal(inferMusicGenre([{name:registry.GENRE_ALIASES[id][0],count:30}],'Ordinary','Some Artist','track').genre,id);
}
for(const [tag,id] of [
 ['pop-rock','poprock'],['indie rock','indierock'],['alternative rock','alternativerock'],
 ['pop punk','punkrock'],['dream pop','indiepop'],['synthpop','electropop'],
 ['dance pop','dancepop'],['classic rock','rock'],['mainstream pop','pop']
])assert.equal(registry.resolveMusicGenre(tag),id,tag);
const popRock=inferMusicGenre([{name:'pop',count:50},{name:'rock',count:45}], 'Ordinary','Artist','track');
assert.equal(popRock.genre,'pop');assert.equal(popRock.fusion?.secondary,'rock');
assert(popRock.fusion.secondaryWeight>=.20&&popRock.fusion.secondaryWeight<=.42);
const rapTrap=inferMusicGenre([{name:'Deutschrap',count:48},{name:'trap',count:45}], 'Song','Artist','track');
assert.deepEqual([rapTrap.fusion?.primary,rapTrap.fusion?.secondary],['deutschrap','trap']);
assert.equal(inferMusicGenre([{name:'pop rock',count:44}], 'Song','Artist','track').fusion,null,'one tag cannot cause fusion');
assert.equal(inferMusicGenre([{name:'hard techno',count:44},{name:'techno',count:35}], 'Song','Artist','track').fusion,null,'parent is not distinct blend');
assert.equal(inferMusicGenre([{name:'pop',count:49},{name:'rock',count:0}], 'Song','Artist','track').fusion,null,'zero-count tag does not force a blend');
assert.equal(inferMusicGenre([], 'Song','Artist','track',120).fusion,null,'BPM alone cannot create fusion');
assert.equal(inferMusicGenre([{name:'pop',count:100},{name:'rock',count:1}], 'Song','Artist','track').fusion,null,'tiny secondary tag not enough for fusion');
assert.equal(inferMusicGenre([{name:'pop',count:90},{name:'jazz',count:0}], 'Song','Artist','track').fusion,null,'weak evidence does not create fusion');
const base={genre:'pop',fusion:null,section:'chorus',playing:true,reducedMotion:false,beatAccent:.75,lyricsActive:false,currentTheme:'classic'};
const single=visual.decideGenreVisualV352(base,visual.DEFAULT_GENRE_VISUAL_V352);
const withFusion=visual.decideGenreVisualV352({...base,fusion:popRock.fusion},visual.DEFAULT_GENRE_VISUAL_V352);
assert.equal(withFusion.genre,'pop');assert.notDeepEqual(withFusion.palette,single.palette);
assert.match(withFusion.label,/Pop.*Rock/);
assert.notEqual(withFusion.lightGain,single.lightGain);
assert.equal(visual.decideGenreVisualV352({...base,fusion:popRock.fusion},{...visual.DEFAULT_GENRE_VISUAL_V352,fusionEnabled:false}).palette?.primary,single.palette?.primary,'off preserves old style');
assert.equal(visual.decideGenreVisualV352({...base,fusion:popRock.fusion},{...visual.DEFAULT_GENRE_VISUAL_V352,mode:'manual',manualGenre:'indiepop'}).genre,'indiepop','manual genre is authoritative');
assert.equal(visual.decideGenreVisualV352({...base,fusion:popRock.fusion,reducedMotion:true},visual.DEFAULT_GENRE_VISUAL_V352).cameraMotion,0,'reduced motion blocks camera');
assert.equal(visual.decideGenreVisualV352({...base,fusion:popRock.fusion,lyricsActive:true,section:'verse'},visual.DEFAULT_GENRE_VISUAL_V352).focus,'lyrics','lyrics protected');
assert.equal(visual.decideGenreVisualV352({...base,fusion:popRock.fusion,playing:false},visual.DEFAULT_GENRE_VISUAL_V352).cameraMotion,0,'paused camera');
const blended=adaptive.resolveAdaptiveProfile('pop','auto',undefined,undefined,popRock.fusion);
assert.match(blended.label,/Pop.*Rock/);
assert.notEqual(blended.aggression,adaptive.resolveAdaptiveProfile('pop').aggression);
assert.equal(adaptive.resolveAdaptiveProfile('pop','pop',undefined,undefined,popRock.fusion).aggression,adaptive.resolveAdaptiveProfile('pop').aggression,'explicit dance genre remains authoritative');
assert.equal(adaptive.resolveAdaptiveProfile('pop','auto',undefined,128,popRock.fusion).bpm,128,'measured BPM wins');
const files={
 'context/MusicContext.tsx':['genreOverride?null:detected.detectedFusion'],
 'components/visualizer/VisualizerStage.tsx':['genreFusion={genreFusion}'],
 'components/visualizer/ThreeAvatar.tsx':['fusion:props.genreFusion'],
 'components/visualizer/AdaptiveGenreDanceStudio.tsx':['fusionOn?genreFusion:null'],
 'components/animation/MusicAnimationController.tsx':['Genre-Fusion:'],
 'components/visualizer/GenreVisualDirectorSettingsV352.tsx':['fusionEnabled'],
};
for(const [f,needles] of Object.entries(files))for(const needle of needles)assert(fs.readFileSync(f,'utf8').includes(needle),`${f} must contain ${needle}`);
console.log('PASS V470: 34 genres, 7 Rock/Pop variants, Last.fm fusion evidence, visual/dance blend, manual overrides, reduced motion, lyrics, integration');
