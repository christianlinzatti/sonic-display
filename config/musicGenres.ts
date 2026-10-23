/** Central genre registry: add a new genre and its avatar colors in one place. */
export type GenreAppearance = Readonly<{ label: string; a: string; b: string; accent: string; avatarLabel: string; family: GenreFamily }>;
export type GenreFamily = "hardstyle" | "hardtekk" | "techno" | "hiphop" | "rock" | "ambient" | "pop";

export const MUSIC_GENRES = {
  hardstyle: { label: "Hardstyle", a: "#ff315e", b: "#6415a8", accent: "#faff00", avatarLabel: "RAVER", family: "hardstyle" },
  hardtekk: { label: "Hardtekk", a: "#f24dff", b: "#31116f", accent: "#73ffed", avatarLabel: "TEKK", family: "hardtekk" },
  techno: { label: "Techno / Electronic", a: "#00d5c0", b: "#153c91", accent: "#d4ff00", avatarLabel: "PULSE", family: "techno" },
  hiphop: { label: "Hip-hop", a: "#ff9a28", b: "#a52b35", accent: "#ffe0a3", avatarLabel: "FLOW", family: "hiphop" },
  rock: { label: "Rock", a: "#ed4a28", b: "#361b25", accent: "#f4d4a2", avatarLabel: "RIFF", family: "rock" },
  ambient: { label: "Ambient", a: "#5f9fca", b: "#7964bc", accent: "#e0f5ff", avatarLabel: "DREAM", family: "ambient" },
  pop: { label: "Pop", a: "#ff6db4", b: "#7047d9", accent: "#fff39b", avatarLabel: "STAR", family: "pop" },
  // V469: eigenständige Subgenres, die für ältere Tanz-/Lichtpresets eine Familien-Zuordnung behalten.
  deutschrap: { label:"Deutschrap", a:"#e8a34d", b:"#593a96", accent:"#ffe0a0", avatarLabel:"RAP", family:"hiphop" },
  trap: { label:"Trap", a:"#ae74ff", b:"#251a50", accent:"#ffa957", avatarLabel:"TRAP", family:"hiphop" },
  drill: { label:"Drill", a:"#7e8bff", b:"#171930", accent:"#e5fbff", avatarLabel:"DRILL", family:"hiphop" },
  boombap: { label:"Boom Bap", a:"#eda95f", b:"#5d3828", accent:"#ffe9b8", avatarLabel:"BOOM", family:"hiphop" },
  hardtechno: { label:"Hard Techno", a:"#ff4e87", b:"#251b43", accent:"#f5ff50", avatarLabel:"RAVE", family:"techno" },
  schranz: { label:"Schranz", a:"#ff633c", b:"#2b1722", accent:"#ffe87c", avatarLabel:"SCHRANZ", family:"techno" },
  rawstyle: { label:"Rawstyle", a:"#ff284e", b:"#491052", accent:"#f3ff35", avatarLabel:"RAW", family:"hardstyle" },
  hardcore: { label:"Hardcore / Gabber", a:"#ff423f", b:"#300b1e", accent:"#f6f763", avatarLabel:"GABBER", family:"hardstyle" },
  uptempo: { label:"Uptempo Hardcore", a:"#fc39e9", b:"#260c48", accent:"#fff02a", avatarLabel:"UPTEMPO", family:"hardtekk" },
  house: { label:"House", a:"#43e3ae", b:"#273c80", accent:"#e9ffc5", avatarLabel:"HOUSE", family:"techno" },
  trance: { label:"Trance", a:"#66c9ff", b:"#423bd0", accent:"#d1efff", avatarLabel:"TRANCE", family:"techno" },
  psytrance: { label:"Psytrance", a:"#b9ff50", b:"#6633a8", accent:"#ff8ee8", avatarLabel:"PSY", family:"techno" },
  dnb: { label:"Drum & Bass", a:"#f5c242", b:"#2c2868", accent:"#58f8ff", avatarLabel:"DNB", family:"techno" },
  dubstep: { label:"Dubstep", a:"#b78aff", b:"#27164a", accent:"#95ff7a", avatarLabel:"BASS", family:"techno" },
  synthwave: { label:"Synthwave", a:"#ff77ae", b:"#462e9e", accent:"#62e7ff", avatarLabel:"RETRO", family:"techno" },
  reggaeton: { label:"Reggaeton", a:"#ff9e54", b:"#873d8c", accent:"#ffeb92", avatarLabel:"LATIN", family:"pop" },
  metal: { label:"Metal", a:"#db5555", b:"#1c1b31", accent:"#e8edf5", avatarLabel:"METAL", family:"rock" },
  rnb: { label:"R&B / Soul", a:"#c492e8", b:"#492863", accent:"#ffc4a8", avatarLabel:"SOUL", family:"hiphop" },
  jazz: { label:"Jazz", a:"#dab17b", b:"#3a395b", accent:"#ffe9c4", avatarLabel:"JAZZ", family:"ambient" },
  classical: { label:"Klassik", a:"#aac9ef", b:"#46517d", accent:"#f5f4ef", avatarLabel:"CLASSIC", family:"ambient" },
  // V470: Rock und Pop nicht mehr nur als Sammelgenres, sondern mit eigenen Substilen.
  poprock: { label:"Pop-Rock", a:"#ffae79", b:"#6b3f7e", accent:"#ffe59f", avatarLabel:"POP-ROCK", family:"rock" },
  indierock: { label:"Indie-Rock", a:"#dbaa72", b:"#364763", accent:"#fce1ae", avatarLabel:"INDIE", family:"rock" },
  alternativerock: { label:"Alternative Rock", a:"#db6363", b:"#2b3458", accent:"#ffd3a3", avatarLabel:"ALT", family:"rock" },
  punkrock: { label:"Punk-Rock", a:"#ff6073", b:"#2b2735", accent:"#f9f65e", avatarLabel:"PUNK", family:"rock" },
  indiepop: { label:"Indie-Pop", a:"#e3a6d9", b:"#586ac4", accent:"#ffe1b3", avatarLabel:"INDIE", family:"pop" },
  electropop: { label:"Electro-Pop", a:"#62f3e7", b:"#7545bd", accent:"#ffc5ef", avatarLabel:"ELECTRO", family:"pop" },
  dancepop: { label:"Dance-Pop", a:"#ff86c5", b:"#623eda", accent:"#fefa80", avatarLabel:"DANCE", family:"pop" },
} as const satisfies Record<string, GenreAppearance>;

export type MusicGenre = keyof typeof MUSIC_GENRES;
export const GENRES: ReadonlyArray<{ id: MusicGenre; label: string }> =
  (Object.keys(MUSIC_GENRES) as MusicGenre[]).map(id => ({ id, label: MUSIC_GENRES[id].label }));

export function isMusicGenre(value: string): value is MusicGenre {
  return Object.prototype.hasOwnProperty.call(MUSIC_GENRES, value);
}

/** Bestehende Presets bleiben für die 7 ursprünglichen Genrefamilien gültig. */
export function musicGenreFamily(genre: MusicGenre): GenreFamily { return MUSIC_GENRES[genre].family; }

/** V469: nur Genre-/Metadaten normalisieren, nicht beliebige Titel oder Künstlernamen raten. */
export const GENRE_ALIASES: Readonly<Record<MusicGenre, readonly string[]>> = {
  hardstyle:["hardstyle","euphoric hardstyle","jumpstyle"], hardtekk:["hardtekk","hardtek","hard tek","hardtekno","freetekno","free tekno","tekno"],
  techno:["techno","dark techno","electronic","electronica","electro","edm"],
  hiphop:["hiphop","hip hop","hip-hop","rap","urban"], rock:["rock","classic rock","hard rock","grunge"],
  ambient:["ambient","chillout","chill","drone","downtempo"], pop:["pop","mainstream pop","k pop","k-pop"],
  deutschrap:["deutschrap","german rap","deutsch hiphop","deutsch hip hop","german hip hop"],
  trap:["trap","trap music","trap rap"], drill:["drill","uk drill","german drill","brooklyn drill"],
  boombap:["boom bap","boom-bap","boombap","old school hip hop"],
  hardtechno:["hard techno","hardtechno","industrial techno","industrial hard techno"],
  schranz:["schranz"], rawstyle:["rawstyle","raw hardstyle","rawphoric"],
  hardcore:["hardcore","gabber","hardcore techno","hardcore dance"],
  uptempo:["uptempo","uptempo hardcore","frenchcore"],
  house:["house","deep house","tech house","progressive house","afro house"],
  trance:["trance","uplifting trance","progressive trance"], psytrance:["psytrance","psy trance","goa trance","goa"],
  dnb:["drum and bass","drum & bass","drum n bass","dnb","jungle","liquid drum and bass"],
  dubstep:["dubstep","brostep","riddim","melodic dubstep"], synthwave:["synthwave","retrowave","dark synth","outrun"],
  reggaeton:["reggaeton","reggaetón","latin urban","dembow"], metal:["metal","heavy metal","metalcore","death metal","black metal"],
  rnb:["rnb","r&b","rhythm and blues","soul","neo soul"], jazz:["jazz","swing","bebop","smooth jazz"],
  classical:["classical","klassik","classical music","orchestral","baroque"],
  poprock:["pop rock","pop-rock","poprock","pop/rock","power pop rock"],
  indierock:["indie rock","indie-rock","indie alternative rock","indie guitar rock"],
  alternativerock:["alternative rock","alt rock","alt-rock","alternative guitar rock"],
  punkrock:["punk rock","punk-rock","pop punk","pop-punk","punk"],
  indiepop:["indie pop","indie-pop","indiepop","dream pop"],
  electropop:["electropop","electro pop","electro-pop","electronic pop","synth pop","synthpop"],
  dancepop:["dance pop","dance-pop","dancepop","club pop"],
};
export function normalizeGenreText(text:string):string {
  return text.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g,"").trim().replace(/[_-]+/g," ").replace(/\s+/g," ");
}
export function resolveMusicGenre(text:string|null|undefined):MusicGenre|null {
  if(!text)return null;
  const token=normalizeGenreText(text);
  for(const id of Object.keys(MUSIC_GENRES) as MusicGenre[]) {
    if(id===token || GENRE_ALIASES[id].some(alias=>normalizeGenreText(alias)===token))return id;
  }
  // Explicit additional qualifiers (e.g. 'german underground drill'), with a word boundary.
  const matches=(Object.keys(GENRE_ALIASES) as MusicGenre[]).flatMap(id=>GENRE_ALIASES[id].filter(alias=>{
    const a=normalizeGenreText(alias);return a.length>=4 && (` ${token} `).includes(` ${a} `);
  }).map(alias=>({id,len:alias.length})));
  matches.sort((a,b)=>b.len-a.len);
  return matches[0]?.id??null;
}
