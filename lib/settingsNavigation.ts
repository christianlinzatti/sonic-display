export type SettingsTab='overview'|'dashboard'|'display'|'avatar'|'audio'|'govee'|'alexa'|'diagnostics';
export const SETTINGS_SECTIONS:readonly {id:SettingsTab;label:string;group:string;hint:string;description:string}[]=[
 {id:'overview',label:'Schnellzugriff',group:'Start',hint:'Übersicht Grundlagen häufig Show Konzert',description:'Die wichtigsten Regler für deine Konzertshow an einem Ort.'},
 {id:'display',label:'Anzeige',group:'Show gestalten',hint:'Visualizer Lyrics Motion Bildschirm Schrift Text Animation',description:'Bildschirm und Lyrics: Darstellung, Lesbarkeit und Animationen.'},
 {id:'avatar',label:'Avatar & Tanz',group:'Show gestalten',hint:'Avatar GLTF Vorschau Scale Rig Dance Preset Intensität Aggression Variation Motion Studio Garderobe Kleidung Outfit Kamera Licht Bühne Crew',description:'Modelle, Bewegung und Bühnenregie. Die Direktlinks führen zum passenden Studio.'},
 {id:'audio',label:'Mikrofon & Beat',group:'Show gestalten',hint:'Audio BPM Mikrofon Sensitivity Calibration Kalibrierung Cooldown Sync Offset Timing',description:'Lokale Musikanalyse und zeitliche Abstimmung mit der Wiedergabe.'},
 {id:'dashboard',label:'Dienste & Status',group:'Verbindungen',hint:'Dashboard Status Dienste Spotify Last.fm Lyrics Konfiguration Verbindung Automatik Übersicht',description:'Verbindungen zu Spotify, Lyrics und weiteren Diensten prüfen.'},
 {id:'govee',label:'Govee LAN',group:'Verbindungen',hint:'Govee Lichter WLAN LAN Geräte Licht Bühne Farben Beleuchtung Bridge',description:'Bridge, ausgewählte Lampen und Raumlicht einrichten.'},
 {id:'alexa',label:'Alexa',group:'Verbindungen',hint:'Alexa Sprachsteuerung Hilfe Befehle Voice Künstler Spotify Govee Skill Echo',description:'Sprachsteuerung einrichten und einzelne Funktionen freigeben.'},
 {id:'diagnostics',label:'Diagnose',group:'Technik',hint:'Debug FPS Performance Beat Rhythm Qualität Speicher',description:'Technische Diagnose und Leistungsmessung für die Fehlersuche.'},
];
export type SettingsShortcut={id:string;label:string;tab:SettingsTab;target?:string;hint:string};
export const SETTINGS_SHORTCUTS:readonly SettingsShortcut[]=[
 {id:'lyrics',label:'Lyrics gestalten',tab:'display',target:'Lyrics · Animation',hint:'Songtext Wörter Schrift Lesbarkeit Animation Text'},
 {id:'models',label:'Avatar-Bibliothek',tab:'avatar',target:'Avatar-Bibliothek',hint:'Modelle Figuren Charakter importieren FBX GLB'},
 {id:'crew',label:'Crew & Konzertshow',tab:'avatar',target:'Konzert-Bühnenbild',hint:'Ensemble Regie Show Effekte Bühnenbilder'},
 {id:'wardrobe',label:'Kleidung & Outfits',tab:'avatar',target:'Avatar-Kleidung',hint:'Garderobe Farbe Stoff Material Textur Wardrobe'},
 {id:'dance',label:'Tanzbewegungen',tab:'avatar',target:'Dance Studio · Motion Engine V86',hint:'Bewegung Tanz Clip Übergänge Choreografie'},
 {id:'camera',label:'Kameraregie',tab:'avatar',target:'Cinematic Camera Director',hint:'Kamera Perspektive Bildausschnitt Zoom'},
 {id:'feet',label:'Fußkontakte',tab:'avatar',target:'Foot IK',hint:'Füße Fuss Boden Stabilisierung Rutschen'},
 {id:'beat',label:'Timing & Kalibrierung',tab:'audio',target:'Beat calibration',hint:'Mikrofon Beat Audio Verzögerung Offset BPM'},
 {id:'lights',label:'Govee einrichten',tab:'govee',hint:'Lampen LAN Bridge Raumlicht Synchronisation'},
 {id:'voice',label:'Alexa einrichten',tab:'alexa',hint:'Sprache Echo Befehle Freigaben'},
 {id:'services',label:'Spotify & Dienste',tab:'dashboard',hint:'Verbindungen Status Login Anmeldung Lyrics API'},
 {id:'performance',label:'Leistung prüfen',tab:'diagnostics',hint:'Diagnose FPS Ruckeln Speicher Qualität'},
];
function normalize(text:string){return text.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('de');}
export function settingsMatches(text:string,query:string){const haystack=normalize(text);return normalize(query.trim()).split(/\s+/).every(word=>haystack.includes(word));}
