# V94 – Saved Dance Loop Presets

Unter Settings → Avatar & Tanz → Dance Studio → Animation Timeline kannst du einen Namen vergeben, Start/Ende setzen und den Loop speichern. Gespeicherte Loops können in die Timeline geladen, auf den Live-Avatar angewendet und gelöscht werden.

- Speicherung im lokalen Browser (`localStorage`), nicht in Vercel Blob; andere Geräte erhalten diese Loops nicht automatisch.
- Die Zuordnung verwendet Avatar-URL, optionale Animations-GLB-URL sowie die Clip-Position innerhalb der Datei. Ändert sich die Clip-Reihenfolge, muss der Loop neu gespeichert werden.
- Die Original-GLB wird nicht verändert.
- Nur die GLB-Avatar-Bühne spielt aktivierte Loops ab; reine Procedural-Avatare sind nicht betroffen.
- Zuerst die gewünschte Animation in der Vorschau auswählen und Loop-Grenzen festlegen. Anschließend „Aktuellen Loop speichern“ und „Auf Live-Avatar anwenden“ wählen.
