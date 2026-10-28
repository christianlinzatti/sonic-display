/** V642 – read-only, evidence-backed actions from the opt-in V641 QA report.
 * No automatic show changes, imported assumptions, generated artist identities or
 * claims that geometry is proof of visual quality.
 */
import type {V641Audit} from './fullConcertQualityAuditV641';
export type ConcertReviewV642={id:string;priority:'check-data'|'review-scene'|'measure-performance';heading:string;advice:string};
const map:Record<string,Omit<ConcertReviewV642,'id'>>={
 'coverage':{priority:'check-data',heading:'Songabdeckung nachmessen',advice:'Wiedergabe möglichst ohne Sprünge vom Anfang bis Ende aufzeichnen.'},
 'song-start-missing':{priority:'check-data',heading:'Songanfang erfassen',advice:'QA-Aufzeichnung vor der ersten Szene starten.'},
 'song-end-missing':{priority:'check-data',heading:'Songende erfassen',advice:'Bis zum tatsächlichen Ende laufen lassen; keine ungeprüfte Finalszene ergänzen.'},
 'fps-missing':{priority:'measure-performance',heading:'FPS-Messung prüfen',advice:'Browser-Performance-Diagnose aktivieren und neue Live-Messung starten.'},
 'p95-missing':{priority:'measure-performance',heading:'Framezeiten erfassen',advice:'P95-Werte mit dem vorhandenen Performance-Panel nachmessen.'},
 'low-fps':{priority:'measure-performance',heading:'Langsame Szenen lokalisieren',advice:'Betroffene Zeitmarke prüfen; zunächst LED/Gobo/Dekoration reduzieren und GLB-Zahl vergleichen.'},
 'avatar-framing':{priority:'review-scene',heading:'Avatar-Framing überprüfen',advice:'Kamerabild an der gemeldeten Stelle visuell prüfen; manuelle Kameravorgaben nicht übergehen.'},
 'lyrics-overlap':{priority:'review-scene',heading:'Lyrics im echten Bild überprüfen',advice:'Geometrische Warnung mit sichtbarer Textdarstellung vergleichen und bei Bedarf Kontrast/Position manuell anpassen.'},
 'long-shot':{priority:'review-scene',heading:'Kameraschnittfolge ansehen',advice:'Lange Motivdauer ist allein kein Fehler. Szene ansehen und gegebenenfalls authored Kamera-Timeline korrigieren.'},
 'long-motif':{priority:'review-scene',heading:'Inszenierungsvielfalt ansehen',advice:'Wiederholung im Vollsong ansehen und bei Bedarf bestätigte Songabschnitte nachbearbeiten.'},
 'no-glb-proof':{priority:'check-data',heading:'GLB-Nachweis ergänzen',advice:'Auf localhost ?benchmarkV592=1 aktivieren und geladene GLB-Meshes nachweisen.'},
 'no-avatars':{priority:'check-data',heading:'Avatar-Aufnahme prüfen',advice:'Kontrollieren, ob die 3D-Szene sichtbar und geladen ist.'},
};
export function reviewConcertAuditV642(report:V641Audit):ConcertReviewV642[]{
 if(report.format!=='sonic-v641-live-song-audit'||report.samples===0||report.status==='no-evidence')return [];
 const used=new Set<string>();const result:ConcertReviewV642[]=[];
 for(const finding of report.findings){const rec=map[finding.id];if(!rec||used.has(finding.id))continue;
   used.add(finding.id);result.push({id:finding.id,...rec});if(result.length>=8)break;
 }
 return result;
}
