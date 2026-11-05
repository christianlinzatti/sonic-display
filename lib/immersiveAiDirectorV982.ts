/** V982 — narrowly scoped, inert concert-look suggestions.
 * The API and UI both normalize model output. It is never executable code or a
 * physical device instruction, and only explicit preview acceptance changes looks.
 */
export type ImmersiveLookV982 = 'noir'|'reactor'|'rock-arena'|'prism';
export type ImmersivePaletteV982 = 'noir'|'electric'|'arena'|'dream';
export type ImmersivePaceV982 = 'gentle'|'cinematic'|'festival';
export type ImmersiveSectionV982 = 'intro'|'verse'|'hook'|'drop'|'finale';
export interface ImmersiveSceneV982 {section:ImmersiveSectionV982; description:string}
export interface ImmersivePlanV982 {
 title:string; explanation:string; look:ImmersiveLookV982;
 palette:ImmersivePaletteV982; pace:ImmersivePaceV982;
 atmosphereIntensity:number; stageIntensity:number; fxIntensity:number;
 scenes:ImmersiveSceneV982[];
}
const LOOKS:readonly string[]=['noir','reactor','rock-arena','prism'];
const PALETTES:readonly string[]=['noir','electric','arena','dream'];
const PACES:readonly string[]=['gentle','cinematic','festival'];
const SECTIONS:readonly string[]=['intro','verse','hook','drop','finale'];
const plain=(value:unknown,max:number)=>typeof value==='string'
 ? value.replace(/[\u0000-\u001f\u007f]/g,' ').trim().slice(0,max) : '';
const intensity=(n:unknown)=>typeof n==='number'&&Number.isFinite(n)&&n>=0&&n<=100
 ? Math.max(0,Math.min(75,Math.round(n))):null;
const oneOf=<T extends string>(value:unknown,allowed:readonly string[]):value is T=>
 typeof value==='string'&&allowed.includes(value);
export function normalizeImmersivePlanV982(raw:unknown):ImmersivePlanV982|null {
 if(!raw||typeof raw!=='object'||Array.isArray(raw))return null;
 const r=raw as Record<string,unknown>;
 const title=plain(r.title,72),explanation=plain(r.explanation,260);
 const atmosphereIntensity=intensity(r.atmosphereIntensity);
 const stageIntensity=intensity(r.stageIntensity);
 const fxIntensity=intensity(r.fxIntensity);
 if(!title||!explanation||!oneOf<ImmersiveLookV982>(r.look,LOOKS)||
  !oneOf<ImmersivePaletteV982>(r.palette,PALETTES)||
  !oneOf<ImmersivePaceV982>(r.pace,PACES)||atmosphereIntensity===null||
  stageIntensity===null||fxIntensity===null||!Array.isArray(r.scenes)||
  r.scenes.length!==5)return null;
 const scenes:ImmersiveSceneV982[]=[];
 for(let i=0;i<SECTIONS.length;i++){
  const scene=r.scenes[i];
  if(!scene||typeof scene!=='object'||Array.isArray(scene))return null;
  const s=scene as Record<string,unknown>;
  if(!oneOf<ImmersiveSectionV982>(s.section,SECTIONS)||s.section!==SECTIONS[i])return null;
  const description=plain(s.description,155);
  if(!description)return null;
  scenes.push({section:s.section,description});
 }
 return {title,explanation,look:r.look,palette:r.palette,pace:r.pace,
  atmosphereIntensity,stageIntensity,fxIntensity,scenes};
}
/** An explicitly labelled OFFLINE suggestion, not a language model. */
export function localImmersivePlanV982(prompt:string,genre:string):ImmersivePlanV982 {
 const q=`${prompt} ${genre}`.toLocaleLowerCase();
 const hard=/hardtekk|hardstyle|techno|rave|drop|festival|neon|reaktor/.test(q);
 const rock=!hard&&/rock|metal|arena|stadion|industrial|gitarre/.test(q);
 const rap=!hard&&!rock&&/rap|hip.?hop|trap|düster|noir|drill/.test(q);
 const calm=/ruhig|sanft|ballade|emotional|weniger|reduziert|slow|entspannt/.test(q);
 const look:ImmersiveLookV982=hard?'reactor':rock?'rock-arena':rap?'noir':'prism';
 const palette:ImmersivePaletteV982=hard?'electric':rock?'arena':rap?'noir':'dream';
 const pace:ImmersivePaceV982=calm?'gentle':hard?'festival':'cinematic';
 const a=calm?38:hard?70:rock?64:58;
 const s=calm?34:hard?72:rock?66:60;
 const f=calm?20:hard?55:rock?45:40;
 const direction=look==='reactor'?'Neon-Reaktor':look==='rock-arena'?'Arena-Backlight':look==='noir'?'Noir-Silhouetten':'Prisma-Glanz';
 return {title:`${direction} · Immersive Show`,look,palette,pace,
  explanation:'Lokaler Regieentwurf ohne KI-Abfrage. Nutzt nur vorhandene virtuelle Looks und respektiert deaktivierte Effekte.',
  atmosphereIntensity:a,stageIntensity:s,fxIntensity:f,
  scenes:[
   {section:'intro',description:`Ruhiger Auftakt mit ${direction} und räumlicher Tiefe.`},
   {section:'verse',description:'Gesang, Lyrics und Avatare sichtbar halten; Seitenlicht statt Überblendung.'},
   {section:'hook',description:'Bühnenarchitektur und Farbfläche zur Hook kontrolliert öffnen.'},
   {section:'drop',description:calm?'Sanften musikalischen Akzent ohne aggressive Blitze setzen.':'Vorhandene Effekte zu bestätigten Drops gezielt betonen.'},
   {section:'finale',description:'Breites Schlussbild und weicher Ausklang, keine zusätzlichen Hardware-Kommandos.'},
  ]};
}
