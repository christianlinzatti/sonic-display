const assert=require('node:assert/strict');
const fs=require('node:fs');
const model=fs.readFileSync('components/visualizer/automaticLightingCues.ts','utf8');
const panel=fs.readFileSync('components/visualizer/LightingChoreographyStudio.tsx','utf8');
const tests=[
 model.includes('generateAutomaticLightCues'),model.includes('mergeAcceptedLightCues'),
 model.includes('sanitizeLightCues'),model.includes('duration < 12_000'),
 model.includes('suggestions.slice(0,120)'),model.includes('includeBlackouts'),
 model.includes('includeStrobes'),model.includes('existing.has(signature)'),
 panel.includes('Lichtshow generieren'),panel.includes('Ausgewählte Cues übernehmen'),
 panel.includes('Vorschläge verwerfen'),panel.includes('setGenerated([])'),
 panel.includes('selectedSuggestions.includes(c.id)'),panel.includes('mergeAcceptedLightCues(cues'),
 panel.includes('Timeline speichern'),panel.includes('trackId'),
 Number(require('../package.json').version.match(/v(\d+)$/)?.[1])>=248
];
tests.forEach((ok,i)=>assert.ok(ok,`V173 regression ${i+1}`));
console.log(`V173 automatic lighting: ${tests.length} checks passed`);
