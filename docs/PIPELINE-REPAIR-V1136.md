# Pipeline-Reparatur V1136

Die Linux- und Windows-Jobs brachen vor `npm ci` ab: Die Release-Prüfungen
verlangten die aktuelle Regression und ihren TypeScript-Test am Anfang von
`prebuild`, während dort noch V1128 eingetragen war.

`prebuild` startet nun mit `test:v1136` und `test:v1136:types`. Der neue
TypeScript-Befehl prüft das gesamte Projekt ohne inkrementelle Cache-Datei.
Die bisherigen Regressionen und Produktionsprüfungen bleiben erhalten.

`tests/production-workflow-regression.cjs` prüft zusätzlich, dass die jeweils
aktuelle Release-Version beide aufgerufenen Skripte definiert und `prebuild`
mit diesen beiden Befehlen beginnt. Die Versionsnummer wird aus
`package.json` gelesen, damit auch spätere Releases geprüft werden.

Die Vorprüfung synchronisiert Workflow-Anzeigenamen ausschließlich im
CI-Checkout. Diese Normalisierung muss vor den historischen Regressionen
laufen; sie ersetzt keine Tests und verändert keine freigegebenen Workflows.
