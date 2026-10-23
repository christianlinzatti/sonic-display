/** V466: bounded, opt-in show-quality assessment, based on measured browser geometry.
 * Projection identifies probable head positions, not pixel-visible faces or occlusion.
 * No camera/animation/lyrics changes are made from these observations.
 */
export interface ScreenRectV466 { x:number;y:number;width:number;height:number }
export interface ProjectedAvatarV466 {
  slot:number; x:number; y:number; inFront:boolean; loaded?:boolean;
  anchor:'head-bone'|'estimated';
}
export type QualityLevelV466='ok'|'watch'|'issue'|'unavailable';
export interface ConcertQualityAssessmentV466 {
  fps:QualityLevelV466;
  headVisibility:QualityLevelV466;
  lyrics:QualityLevelV466;
  headsInFrame:number;
  headsNearLyrics:number;
  activeAvatarCount:number;
  warnings:readonly string[];
  /** Projection and DOM overlap, NOT a pixel-level occlusion/face detection metric. */
  method:'head-projection-and-dom-rectangles';
}
const finite=(v:number)=>Number.isFinite(v);
const inside=(x:number,y:number,r:ScreenRectV466,pad=0)=>
  finite(x)&&finite(y)&&finite(r.x)&&finite(r.y)&&finite(r.width)&&finite(r.height)&&
  r.width>0&&r.height>0&&x>=r.x+pad&&x<=r.x+r.width-pad&&y>=r.y+pad&&y<=r.y+r.height-pad;
export function assessConcertQualityV466(input:{
  canvas:ScreenRectV466;lyrics:ScreenRectV466|null;avatars:readonly ProjectedAvatarV466[];
  fps:number|null;fpsFresh:boolean;
}):ConcertQualityAssessmentV466 {
  const c=input.canvas;
  const avatars=input.avatars.slice(0,4);
  const count=avatars.length;
  const fpsLevel:QualityLevelV466=!input.fpsFresh||input.fps===null||!finite(input.fps)||input.fps<=0?'unavailable':
    input.fps<25?'issue':input.fps<45?'watch':'ok';
  const visible=avatars.filter(a=>a.loaded!==false&&a.inFront&&inside(a.x,a.y,c,0));
  const unloaded=avatars.filter(a=>a.loaded===false).length;
  const headsNearLyrics=input.lyrics?visible.filter(a=>inside(a.x,a.y,input.lyrics!,0)).length:0;
  // DOM rectangles can be outside the WebGL region in split-screen mode; a warning
  // applies only if the active overlay overlaps the WebGL canvas at all.
  const l=input.lyrics;
  const lyricApplicable=!!l&&l.width>0&&l.height>0&&
    Math.min(c.x+c.width,l.x+l.width)>Math.max(c.x,l.x)&&
    Math.min(c.y+c.height,l.y+l.height)>Math.max(c.y,l.y);
  const clipped=lyricApplicable && !!l && (l.x<c.x-1||l.y<c.y-1||l.x+l.width>c.x+c.width+1||l.y+l.height>c.y+c.height+1);
  const lyricsLevel:QualityLevelV466=!lyricApplicable?'unavailable':clipped?'watch':headsNearLyrics>0?'watch':'ok';
  const headLevel:QualityLevelV466=count===0?'unavailable':visible.length===0?'issue':visible.length<count?'watch':'ok';
  const warnings:string[]=[];
  if(fpsLevel==='issue')warnings.push('FPS unter 25 (Messfenster)');
  else if(fpsLevel==='watch')warnings.push('FPS unter 45 (Messfenster)');
  if(unloaded>0)warnings.push(`${unloaded} Avatar-Modell(e) noch nicht als Mesh geladen`);
  if(count>0&&visible.length<count-unloaded)warnings.push(`${count-unloaded-visible.length} Avatar-Kopfposition(en) außerhalb des Bilds oder hinter der Kamera`);
  if(headsNearLyrics>0)warnings.push(`${headsNearLyrics} projizierte Kopfposition(en) im Lyrics-Bereich`);
  if(clipped)warnings.push('Lyrics-Rechteck reicht über den WebGL-Bereich hinaus');
  return {fps:fpsLevel,headVisibility:headLevel,lyrics:lyricsLevel,
    headsInFrame:visible.length,headsNearLyrics,activeAvatarCount:count,warnings,
    method:'head-projection-and-dom-rectangles'};
}
